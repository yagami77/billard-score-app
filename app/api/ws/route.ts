// Importations nécessaires
import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest } from 'next/server';

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: process.env.NEXT_PUBLIC_ORIGIN_URL || "*", // Utiliser l'URL d'origine ou toutes les origines
        methods: ["GET", "POST"],
    },
});

const dashboardSockets = new Set<Socket>();
const tableStates = new Map<string, GameState>();

type GameState = {
    // Définir les propriétés de GameState ici
};

const ioHandler = (req: NextApiRequest, res: NextApiResponse) => {
    if (!(res.socket as any).server.io) {
        const io = new Server((res.socket as any).server, {
            path: "/api/ws",
            addTrailingSlash: false,
            cors: {
                origin: process.env.NEXT_PUBLIC_ORIGIN_URL || "*", // Même configuration CORS
            },
        });

        // Gestion des événements socket.io
        io.on('connection', (socket) => {
            let currentRoom: string | null = null;
            let isDashboard = false;

            // Lorsqu'un tableau de bord rejoint
            socket.on('joinDashboard', () => {
                isDashboard = true;
                dashboardSockets.add(socket);

                // Envoyer l'état actuel de toutes les tables au dashboard
                const currentGames = Array.from(tableStates.entries()).map(([roomCode, gameState]) => ({
                    roomCode,
                    gameState,
                    lastUpdate: new Date(),
                }));
                socket.emit('dashboardUpdate', currentGames);
            });

            // Lorsqu'un client rejoint une salle
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

            // Mise à jour de l'état d'une salle
            socket.on('updateState', (roomCode: string, newState: GameState) => {
                tableStates.set(roomCode, newState);

                // Informer tous les autres clients de l'état mis à jour
                socket.to(roomCode).emit('stateUpdate', newState);

                const update = {
                    roomCode,
                    gameState: newState,
                    lastUpdate: new Date(),
                };
                dashboardSockets.forEach((dashSocket) => {
                    dashSocket.emit('gameUpdate', update);
                });
            });

            // Lorsqu'un client se déconnecte
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
                console.log(`Client disconnected. Room: ${currentRoom}, Dashboard: ${isDashboard}`);
            });
        });

        (res.socket as any).server.io = io;
        console.log('WebSocket server initialized');
    }
    res.end();
};

export async function GET(request: NextRequest) {
    if (request.headers.get('upgrade') !== 'websocket') {
        return new Response('Requires WebSocket connection', { status: 426 });
    }

    const PORT = process.env.PORT || 3001;
    if (!httpServer.listening) { // Vérifier si le serveur écoute déjà
        httpServer.listen(PORT, () => {
            console.log(`WebSocket server running on port ${PORT}`);
        });
    }

    return new Response('WebSocket server is running');
}

export default ioHandler;