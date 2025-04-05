const { createServer } = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');
const DEBUG = true;

// Création du dossier pour la persistance des données
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log(`📁 Created data directory at ${DATA_DIR}`);
}

// Fonctions pour la persistance des données
const saveTableState = (roomCode, state) => {
    try {
        fs.writeFileSync(
            path.join(DATA_DIR, `${roomCode}.json`),
            JSON.stringify(state, null, 2),
            'utf8'
        );
        console.log(`💾 State saved for room ${roomCode}`);
    } catch (error) {
        console.error(`❌ Error saving state for room ${roomCode}:`, error);
    }
};

const loadTableState = (roomCode) => {
    try {
        const filePath = path.join(DATA_DIR, `${roomCode}.json`);
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error(`❌ Error loading state for room ${roomCode}:`, error);
    }
    return null;
};

// Création du serveur HTTP
const httpServer = createServer();

// Configuration des origines autorisées
const allowedOrigins = [
    'https://www.5quilles.com',  // Domaine principal
    'http://localhost:3000',
    process.env.NEXT_PUBLIC_ORIGIN_URL, // Variable d'environnement (production)
    '*'
].filter(Boolean);

// Configurer Socket.IO avec CORS
const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST", "OPTIONS"],
        credentials: true,
        allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept"]
    },
    allowEIO3: true,
    transports: ['websocket', 'polling']
});

// Stockage des états des tables et des connexions dashboard
const tableStates = new Map();
const dashboardSockets = new Set();

// Variable pour l'intervalle de diffusion
let broadcastInterval;

// Déboggage périodique si activé
if (DEBUG) {
    setInterval(() => {
        console.log("---DEBUG STATE---");
        console.log(`Active tables: ${tableStates.size}`);
        console.log(`Active dashboard clients: ${dashboardSockets.size}`);
        console.log(`Table keys: ${Array.from(tableStates.keys()).join(', ')}`);
        console.log("---------------");
    }, 10000); // Exécuter toutes les 10 secondes
}

// Chargement initial des états sauvegardés
try {
    const files = fs.readdirSync(DATA_DIR);
    files.forEach(file => {
        if (file.endsWith('.json')) {
            const roomCode = file.replace('.json', '');
            const data = fs.readFileSync(path.join(DATA_DIR, file), 'utf8');
            tableStates.set(roomCode, JSON.parse(data));
            console.log(`📖 Loaded state for room: ${roomCode}`);
        }
    });
    console.log(`🔄 Loaded ${tableStates.size} table states from disk`);
} catch (error) {
    console.error('❌ Error loading room states:', error);
}

io.on('connection', (socket) => {
    console.log('✅ New WebSocket client connected from:', socket.handshake.headers.origin);

    let currentRoom = null;
    let isDashboard = false;

    // Gestion des connexions dashboard
    socket.on('joinDashboard', () => {
        console.log('📊 Client joined dashboard');
        isDashboard = true;
        dashboardSockets.add(socket);

        // Envoyer l'état actuel de toutes les tables au dashboard
        const currentGames = Array.from(tableStates.entries()).map(([roomCode, gameState]) => ({
            roomCode,
            gameState,
            lastUpdate: new Date()
        }));
        console.log(`Sending dashboard update with ${currentGames.length} games`);
        console.log('Current table states:', Array.from(tableStates.keys()));
        socket.emit('dashboardUpdate', currentGames);
    });

    // Ajouter cet événement pour la compatibilité
    socket.on('getDashboard', () => {
        console.log('Client requested dashboard data using getDashboard');

        // Rediriger vers joinDashboard pour assurer la compatibilité
        isDashboard = true;
        dashboardSockets.add(socket);

        // Envoyer l'état actuel de toutes les tables au dashboard
        const currentGames = Array.from(tableStates.entries()).map(([roomCode, gameState]) => ({
            roomCode,
            gameState,
            lastUpdate: new Date()
        }));
        console.log(`Sending dashboard update with ${currentGames.length} games`);
        socket.emit('dashboardUpdate', currentGames);
    });

    // Gestion des connexions à une table spécifique
    socket.on('joinRoom', (roomCode) => {
        console.log(`🎱 Client joined room: ${roomCode}`);

        if (currentRoom) {
            socket.leave(currentRoom);
        }
        socket.join(roomCode);
        currentRoom = roomCode;

        // Envoyer l'état actuel de la table si disponible en mémoire
        if (tableStates.has(roomCode)) {
            socket.emit('stateUpdate', tableStates.get(roomCode));
        } else {
            // Essayer de charger l'état depuis le fichier
            const savedState = loadTableState(roomCode);
            if (savedState) {
                tableStates.set(roomCode, savedState);
                socket.emit('stateUpdate', savedState);
                console.log(`🔄 Loaded and sent saved state for room ${roomCode}`);
            }
        }
    });

    // Mise à jour de l'état d'une table
    socket.on('updateState', (roomCode, newState) => {
        console.log(`🔄 State update for room ${roomCode}`);
        console.log(`Table state before update: ${tableStates.has(roomCode) ? 'exists' : 'does not exist'}`);
        tableStates.set(roomCode, newState);
        console.log(`Table state after update: ${tableStates.has(roomCode) ? 'exists' : 'does not exist'}`);

        // Sauvegarder l'état dans un fichier pour persistance
        saveTableState(roomCode, newState);

        // Diffuser aux clients de la table
        socket.to(roomCode).emit('stateUpdate', newState);

        // Diffuser aux dashboards
        const update = {
            roomCode,
            gameState: newState,
            lastUpdate: new Date()
        };
        dashboardSockets.forEach(dashSocket => {
            dashSocket.emit('gameUpdate', update);
        });
        // Après l'envoi aux dashboards
        console.log(`Sent gameUpdate to ${dashboardSockets.size} dashboard clients`);
    });

    // Suppression d'une table
    socket.on('deleteTable', (roomCode) => {
        console.log(`🗑️ Request to delete table: ${roomCode}`);

        // Vérifier si la table existe
        if (tableStates.has(roomCode)) {
            // Supprimer de la mémoire
            tableStates.delete(roomCode);
            console.log(`🗑️ Deleted table ${roomCode} from memory`);

            // Supprimer le fichier de persistance
            try {
                const filePath = path.join(DATA_DIR, `${roomCode}.json`);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log(`🗑️ Deleted state file for ${roomCode}`);
                }
            } catch (error) {
                console.error(`❌ Error deleting state file for ${roomCode}:`, error);
            }

            // Informer tous les clients connectés à cette table
            io.to(roomCode).emit('tableDeleted', { roomCode });

            // Informer tous les dashboards de la suppression
            dashboardSockets.forEach(dashSocket => {
                dashSocket.emit('tableDeleted', { roomCode });
            });

            return { success: true, message: `Table ${roomCode} supprimée avec succès` };
        } else {
            console.warn(`⚠️ Attempted to delete non-existent table: ${roomCode}`);
            return { success: false, message: `Table ${roomCode} introuvable` };
        }
    });

    // Gestion des déconnexions
    socket.on('disconnect', () => {
        console.log('❌ Client disconnected');
        if (isDashboard) {
            dashboardSockets.delete(socket);
        } else if (currentRoom) {
            // On ne supprime plus l'état lorsque tous les clients quittent
            // tableStates reste inchangé et l'état est conservé dans le fichier

            // Nous informons simplement les dashboards de la déconnexion
            const room = io.sockets.adapter.rooms.get(currentRoom);
            if (!room || room.size === 0) {
                dashboardSockets.forEach(dashSocket => {
                    dashSocket.emit('clientsDisconnected', currentRoom);
                });
            }
        }
    });

    // Gestion des erreurs
    socket.on('error', (error) => {
        console.error('⚠️ Socket error:', error);
    });
});

// Nettoyage automatique des états anciens (plus de 24h)
setInterval(() => {
    const now = new Date();
    const files = fs.readdirSync(DATA_DIR);

    files.forEach(file => {
        if (file.endsWith('.json')) {
            const filePath = path.join(DATA_DIR, file);
            const stats = fs.statSync(filePath);
            const fileAge = (now - stats.mtime) / (1000 * 60 * 60); // en heures

            if (fileAge > 24) {
                console.log(`🧹 Removing old state file: ${file} (${fileAge.toFixed(1)} hours old)`);
                fs.unlinkSync(filePath);

                // Supprimer aussi de la mémoire
                const roomCode = file.replace('.json', '');
                if (tableStates.has(roomCode)) {
                    tableStates.delete(roomCode);
                }
            }
        }
    });
}, 1000 * 60 * 60); // Vérifier toutes les heures

// Gestion des erreurs serveur
httpServer.on('error', (error) => {
    console.error('🚨 Server error:', error);
    if (broadcastInterval) {
        clearInterval(broadcastInterval);
    }
});

// Configuration du port et démarrage du serveur
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`🚀 WebSocket server running on port ${PORT}`);
    console.log('🌍 Allowed origins:', allowedOrigins);

    // Configurer l'intervalle de diffusion après le démarrage du serveur
    broadcastInterval = setInterval(() => {
        // Diffuser l'état actuel de toutes les tables à tous les clients dashboard
        if (dashboardSockets.size > 0) {
            const currentGames = Array.from(tableStates.entries()).map(([roomCode, gameState]) => ({
                roomCode,
                gameState,
                lastUpdate: new Date()
            }));

            console.log(`Broadcast: Sending update with ${currentGames.length} games to ${dashboardSockets.size} dashboard clients`);

            dashboardSockets.forEach(dashSocket => {
                dashSocket.emit('dashboardUpdate', currentGames);
            });
        }
    }, 3000); // Toutes les 3 secondes
});