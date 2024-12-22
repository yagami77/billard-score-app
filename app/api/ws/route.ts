import { createServer } from 'http';
import { Server } from 'socket.io';
import { NextRequest } from 'next/server';

const httpServer = createServer();
const io = new Server(httpServer, {
    path: '/api/ws',
    cors: {
        origin: ['http://localhost:3000', 'https://www.5quilles.com'],
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Stockage des états des tables et des connexions dashboard
const tableStates = new Map();
const dashboardSockets = new Set();

io.on('connection', (socket) => {
    console.log('Nouvelle connexion socket:', socket.id);
    let currentRoom: string | null = null;
    let isDashboard = false;

    // Gestion connexion dashboard
    socket.on('joinDashboard', () => {
        console.log('Client rejoint le dashboard:', socket.id);
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
        console.log(`Client ${socket.id} rejoint la table: ${roomCode}`);

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
        console.log(`Mise à jour de l'état pour ${roomCode}:`, newState);
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

    // Gestion des erreurs
    socket.on('error', (error) => {
        console.error('Erreur socket:', error);
    });

    // Déconnexion
    socket.on('disconnect', () => {
        console.log(`Client déconnecté: ${socket.id}`);
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

export async function GET(request: NextRequest) {
    if (request.headers.get('upgrade') !== 'websocket') {
        return new Response('Requires WebSocket connection', { status: 426 });
    }

    const PORT = process.env.PORT || 3001;
    httpServer.listen(PORT, () => {
        console.log(`🚀 Serveur WebSocket démarré sur le port ${PORT}`);
        console.log('👌 CORS configuré pour:', io.origins());
    });

    return new Response('WebSocket server is running');
}