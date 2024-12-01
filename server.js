// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createServer } = require('http');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Server } = require('socket.io');

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: process.env.NEXT_PUBLIC_ORIGIN_URL,
        methods: ["GET", "POST"]
    }
});

// Stockage des états des tables et des connexions dashboard
const tableStates = new Map();
const dashboardSockets = new Set();

io.on('connection', (socket) => {
    let currentRoom = null;
    let isDashboard = false;

    // Gestion connexion dashboard
    socket.on('joinDashboard', () => {
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

    // Déconnexion
    socket.on('disconnect', () => {
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

const PORT = 3001;
httpServer.listen(PORT, () => {
    console.log(`WebSocket server running on port ${PORT}`);
});