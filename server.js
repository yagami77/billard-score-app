const { createServer } = require('http');
const { Server } = require('socket.io');

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:3000", "https://www.5quilles.com"],
        methods: ["GET", "POST"]
    }
});

// Création de l'état initial d'une table
const createInitialState = () => ({
    scores: {
        joueur1: 0,
        joueur2: 0
    },
    setsGagnes: {
        joueur1: 0,
        joueur2: 0
    },
    nomJoueurs: {
        joueur1: "Joueur 1",
        joueur2: "Joueur 2"
    },
    gagnant: null
});

// Stockage des états des tables et des connexions dashboard
const tableStates = new Map();
const dashboardSockets = new Set();

io.on('connection', (socket) => {
    console.log('➡️ Nouvelle connexion socket:', socket.id);
    let currentRoom = null;
    let isDashboard = false;

    // Gestion connexion dashboard
    socket.on('joinDashboard', () => {
        console.log('📊 Client rejoint le dashboard:', socket.id);
        isDashboard = true;
        dashboardSockets.add(socket);
        // Envoyer l'état actuel de toutes les tables
        const currentGames = Array.from(tableStates.entries()).map(([roomCode, gameState]) => ({
            roomCode,
            gameState,
            lastUpdate: new Date()
        }));
        console.log('État actuel envoyé au dashboard:', currentGames);
        socket.emit('dashboardUpdate', currentGames);
    });

    // Gestion connexion table
    socket.on('joinRoom', (roomCode) => {
        console.log(`🎱 Client ${socket.id} rejoint la table: ${roomCode}`);

        if (currentRoom) {
            socket.leave(currentRoom);
        }
        socket.join(roomCode);
        currentRoom = roomCode;

        // Si la table n'existe pas, créer un état initial
        if (!tableStates.has(roomCode)) {
            console.log(`🆕 Création d'un nouvel état pour la table ${roomCode}`);
            tableStates.set(roomCode, createInitialState());
        }

        // Envoyer l'état actuel
        const state = tableStates.get(roomCode);
        console.log(`📤 Envoi de l'état pour ${roomCode}:`, state);
        socket.emit('stateUpdate', state);
    });

    // Mise à jour état
    socket.on('updateState', (roomCode, newState) => {
        console.log(`🔄 Mise à jour de l'état pour ${roomCode}:`, newState);
        tableStates.set(roomCode, newState);

        // Diffuser aux clients de la table
        socket.to(roomCode).emit('stateUpdate', newState);
        console.log(`État diffusé aux clients de la table ${roomCode}`);

        // Diffuser aux dashboards
        const update = {
            roomCode,
            gameState: newState,
            lastUpdate: new Date()
        };
        dashboardSockets.forEach(dashSocket => {
            dashSocket.emit('gameUpdate', update);
        });
        console.log('État diffusé aux dashboards');
    });

    // Déconnexion
    socket.on('disconnect', () => {
        console.log(`👋 Client déconnecté: ${socket.id}`);
        if (isDashboard) {
            dashboardSockets.delete(socket);
            console.log('Dashboard déconnecté');
        } else if (currentRoom) {
            // Si toutes les connexions d'une table sont fermées, retirer la table
            const room = io.sockets.adapter.rooms.get(currentRoom);
            if (!room || room.size === 0) {
                tableStates.delete(currentRoom);
                console.log(`Table ${currentRoom} supprimée car plus aucun client`);
                // Informer les dashboards
                dashboardSockets.forEach(dashSocket => {
                    dashSocket.emit('gameEnded', currentRoom);
                });
            }
        }
    });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`🚀 Serveur WebSocket démarré sur le port ${PORT}`);
    console.log('👌 CORS configuré pour:', ["http://localhost:3000", "https://www.5quilles.com"]);
});