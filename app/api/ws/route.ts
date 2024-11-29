import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { NextRequest } from 'next/server';

// Définir le type d'état de jeu
interface GameState {
    scores: { [player: string]: number }; // Scores des joueurs
    setsGagnes: { [player: string]: number }; // Sets gagnés par joueur
    config: { nbSetsGagnants: number; scoreParSet: number }; // Configuration de la partie
    // Ajoutez d'autres propriétés ici si nécessaire
}

// Map pour stocker les états des tables
const tableStates = new Map<string, GameState>();

// Set pour stocker les connexions des dashboards
const dashboardSockets = new Set<Socket>();

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000", // Remplacez par l'URL de production si nécessaire
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket: Socket) => {
    let currentRoom: string | null = null;
    let isDashboard = false;

    socket.on('joinDashboard', () => {
        isDashboard = true;
        dashboardSockets.add(socket);

        // Envoyer l'état actuel de toutes les tables au dashboard
        const currentGames = Array.from(tableStates.entries()).map(([roomCode, gameState]) => ({
            roomCode,
            gameState,
            lastUpdate: new Date()
        }));
        socket.emit('dashboardUpdate', currentGames);
    });

    socket.on('joinRoom', (roomCode: string) => {
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

    socket.on('updateState', (roomCode: string, newState: GameState) => {
        tableStates.set(roomCode, newState);

        socket.to(roomCode).emit('stateUpdate', newState);

        const update = {
            roomCode,
            gameState: newState,
            lastUpdate: new Date()
        };
        dashboardSockets.forEach((dashSocket) => {
            dashSocket.emit('gameUpdate', update);
        });
    });

    socket.on('disconnect', () => {
        if (isDashboard) {
            dashboardSockets.delete(socket);
        } else if (currentRoom) {
            const room = io.sockets.adapter.rooms.get(currentRoom);
            if (!room || room.size === 0) {
                tableStates.delete(currentRoom);
                dashboardSockets.forEach((dashSocket) => {
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
        console.log(`WebSocket server running on port ${PORT}`);
    });

    return new Response('WebSocket server is running');
}