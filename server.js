const { createServer } = require('http');
const { Server } = require('socket.io');

const httpServer = createServer();

// Configuration CORS dynamique basée sur l'environnement
const allowedOrigins = [
    'http://localhost:3000',          // Développement local
    'https://www.5quilles.com',       // Production
    'https://5quilles.com',           // Production sans www
    process.env.NEXT_PUBLIC_ORIGIN_URL // URL depuis les variables d'environnement
].filter(Boolean); // Enlève les valeurs null/undefined

const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    },
    allowEIO3: true, // Support pour la version Engine.IO 3
    transports: ['websocket', 'polling'] // Permet le fallback en polling si WebSocket échoue
});

// Stockage des états des tables et des connexions dashboard
const tableStates = new Map();
const dashboardSockets = new Set();

io.on('connection', (socket) => {
    console.log('New client connected from:', socket.handshake.headers.origin);
    let currentRoom = null;
    let isDashboard = false;

    // Gestion connexion dashboard
    socket.on('joinDashboard', () => {
        console.log('Client joining dashboard');
        isDashboard = true;
        dashboardSockets.add(socket);
        // Envoyer l'état actuel de toutes les tables
        const currentGames = Array.from(tableStates.entries()).map(([roomCode, gameState]) => ({
            roomCode,
            gameState,
            lastUpdate: new Date()
        }));
        socket.emit('dashboardUpdate', currentGames);
    });

    // Gestion connexion table
    socket.on('joinRoom', (roomCode) => {
        console.log(`Client joining room: ${roomCode}`);

        if (currentRoom) {
            socket.leave(currentRoom);
        }
        socket.join(roomCode);
        currentRoom = roomCode;

        if (tableStates.has(roomCode)) {
            socket.emit('stateUpdate', tableStates.get(roomCode));
        }
    });

    // Mise à jour état
    socket.on('updateState', (roomCode, newState) => {
        console.log(`State update for room ${roomCode}:`, newState);
        tableStates.set(roomCode, newState);

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
    });

    // Gestion des erreurs socket
    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });

    // Déconnexion
    socket.on('disconnect', () => {
        console.log('Client disconnected');
        if (isDashboard) {
            dashboardSockets.delete(socket);
        } else if (currentRoom) {
            // Si toutes les connexions d'une table sont fermées, retirer la table
            const room = io.sockets.adapter.rooms.get(currentRoom);
            if (!room || room.size === 0) {
                tableStates.delete(currentRoom);
                // Informer les dashboards
                dashboardSockets.forEach(dashSocket => {
                    dashSocket.emit('gameEnded', currentRoom);
                });
            }
        }
    });
});

// Gestion des erreurs serveur
httpServer.on('error', (error) => {
    console.error('Server error:', error);
});

// Configuration du port dynamique
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`WebSocket server running on port ${PORT}`);
    console.log('Allowed origins:', allowedOrigins);
});