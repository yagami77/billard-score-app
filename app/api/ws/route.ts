// Définir le type d'état de jeu
interface GameState {
    scores: { [player: string]: number }; // Scores des joueurs
    setsGagnes: { [player: string]: number }; // Sets gagnés par joueur
    config: { nbSetsGagnants: number; scoreParSet: number }; // Configuration de la partie
}

// Map pour stocker les états des tables
const tableStates = new Map<string, GameState>();

// Set pour stocker les connexions des dashboards
const dashboardSockets = new Set<Socket>();// Assurez-vous que les importations et types sont correctement définis
import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextApiResponseServerIO } from '@/types/types';

// Vérifiez que le type NextApiResponseServerIO est correctement défini dans '@/types/types'
interface NextApiResponseServerIO extends NextApiResponse {
    socket: {
        server: {
            io: Server;
        };
    };
}

// Assurez-vous que le type Socket est importé et utilisé correctement
const dashboardSockets = new Set<Socket>();

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: process.env.NEXT_PUBLIC_ORIGIN_URL || "*",
        methods: ["GET", "POST"],
    },
});

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
    if (!res.socket.server.io) {
        const io = new Server(res.socket.server as any, {
            path: "/api/ws",
            addTrailingSlash: false,
            cors: {
                origin: process.env.NEXT_PUBLIC_ORIGIN_URL || "*",
            },
        });

        io.on('connection', (socket: Socket) => {
            let currentRoom: string | null = null;
            let isDashboard = false;

            socket.on('joinDashboard', () => {
                isDashboard = true;
                dashboardSockets.add(socket);

                const currentGames = Array.from(tableStates.entries()).map(([roomCode, gameState]) => ({
                    roomCode,
                    gameState,
                    lastUpdate: new Date(),
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
                    lastUpdate: new Date(),
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
                console.log(`Client disconnected. Room: ${currentRoom}, Dashboard: ${isDashboard}`);
            });
        });

        res.socket.server.io = io;
        console.log('WebSocket server initialized');
    }
    res.end();
};

export async function GET(request: NextRequest) {
    if (request.headers.get('upgrade') !== 'websocket') {
        return new Response('Requires WebSocket connection', { status: 426 });
    }

    const PORT = process.env.PORT || 3001;
    if (!httpServer.listening) {
        httpServer.listen(PORT, () => {
            console.log(`WebSocket server running on port ${PORT}`);
        });
    }

    return new Response('WebSocket server is running');
}

export default ioHandler;// Assurez-vous que les importations et types sont correctement définis
import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextApiResponseServerIO } from '@/types/types';

// Vérifiez que le type NextApiResponseServerIO est correctement défini dans '@/types/types'
interface NextApiResponseServerIO extends NextApiResponse {
    socket: {
        server: {
            io: Server;
        };
    };
}

// Assurez-vous que le type Socket est importé et utilisé correctement
const dashboardSockets = new Set<Socket>();

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: process.env.NEXT_PUBLIC_ORIGIN_URL || "*",
        methods: ["GET", "POST"],
    },
});

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
    if (!res.socket.server.io) {
        const io = new Server(res.socket.server as any, {
            path: "/api/ws",
            addTrailingSlash: false,
            cors: {
                origin: process.env.NEXT_PUBLIC_ORIGIN_URL || "*",
            },
        });

        io.on('connection', (socket: Socket) => {
            let currentRoom: string | null = null;
            let isDashboard = false;

            socket.on('joinDashboard', () => {
                isDashboard = true;
                dashboardSockets.add(socket);

                const currentGames = Array.from(tableStates.entries()).map(([roomCode, gameState]) => ({
                    roomCode,
                    gameState,
                    lastUpdate: new Date(),
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
                    lastUpdate: new Date(),
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
                console.log(`Client disconnected. Room: ${currentRoom}, Dashboard: ${isDashboard}`);
            });
        });

        res.socket.server.io = io;
        console.log('WebSocket server initialized');
    }
    res.end();
};

export async function GET(request: NextRequest) {
    if (request.headers.get('upgrade') !== 'websocket') {
        return new Response('Requires WebSocket connection', { status: 426 });
    }

    const PORT = process.env.PORT || 3001;
    if (!httpServer.listening) {
        httpServer.listen(PORT, () => {
            console.log(`WebSocket server running on port ${PORT}`);
        });
    }

    return new Response('WebSocket server is running');
}

export default ioHandler;// Assurez-vous que les importations et types sont correctement définis
import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextApiResponseServerIO } from '@/types/types';

// Vérifiez que le type NextApiResponseServerIO est correctement défini dans '@/types/types'
interface NextApiResponseServerIO extends NextApiResponse {
    socket: {
        server: {
            io: Server;
        };
    };
}

// Assurez-vous que le type Socket est importé et utilisé correctement
const dashboardSockets = new Set<Socket>();

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: process.env.NEXT_PUBLIC_ORIGIN_URL || "*",
        methods: ["GET", "POST"],
    },
});

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
    if (!res.socket.server.io) {
        const io = new Server(res.socket.server as any, {
            path: "/api/ws",
            addTrailingSlash: false,
            cors: {
                origin: process.env.NEXT_PUBLIC_ORIGIN_URL || "*",
            },
        });

        io.on('connection', (socket: Socket) => {
            let currentRoom: string | null = null;
            let isDashboard = false;

            socket.on('joinDashboard', () => {
                isDashboard = true;
                dashboardSockets.add(socket);

                const currentGames = Array.from(tableStates.entries()).map(([roomCode, gameState]) => ({
                    roomCode,
                    gameState,
                    lastUpdate: new Date(),
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
                    lastUpdate: new Date(),
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
                console.log(`Client disconnected. Room: ${currentRoom}, Dashboard: ${isDashboard}`);
            });
        });

        res.socket.server.io = io;
        console.log('WebSocket server initialized');
    }
    res.end();
};

export async function GET(request: NextRequest) {
    if (request.headers.get('upgrade') !== 'websocket') {
        return new Response('Requires WebSocket connection', { status: 426 });
    }

    const PORT = process.env.PORT || 3001;
    if (!httpServer.listening) {
        httpServer.listen(PORT, () => {
            console.log(`WebSocket server running on port ${PORT}`);
        });
    }

    return new Response('WebSocket server is running');
}

export default ioHandler;// Assurez-vous que les importations et types sont correctement définis
import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextApiResponseServerIO } from '@/types/types';

// Vérifiez que le type NextApiResponseServerIO est correctement défini dans '@/types/types'
interface NextApiResponseServerIO extends NextApiResponse {
    socket: {
        server: {
            io: Server;
        };
    };
}

// Assurez-vous que le type Socket est importé et utilisé correctement
const dashboardSockets = new Set<Socket>();

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: process.env.NEXT_PUBLIC_ORIGIN_URL || "*",
        methods: ["GET", "POST"],
    },
});

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
    if (!res.socket.server.io) {
        const io = new Server(res.socket.server as any, {
            path: "/api/ws",
            addTrailingSlash: false,
            cors: {
                origin: process.env.NEXT_PUBLIC_ORIGIN_URL || "*",
            },
        });

        io.on('connection', (socket: Socket) => {
            let currentRoom: string | null = null;
            let isDashboard = false;

            socket.on('joinDashboard', () => {
                isDashboard = true;
                dashboardSockets.add(socket);

                const currentGames = Array.from(tableStates.entries()).map(([roomCode, gameState]) => ({
                    roomCode,
                    gameState,
                    lastUpdate: new Date(),
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
                    lastUpdate: new Date(),
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
                console.log(`Client disconnected. Room: ${currentRoom}, Dashboard: ${isDashboard}`);
            });
        });

        res.socket.server.io = io;
        console.log('WebSocket server initialized');
    }
    res.end();
};

export async function GET(request: NextRequest) {
    if (request.headers.get('upgrade') !== 'websocket') {
        return new Response('Requires WebSocket connection', { status: 426 });
    }

    const PORT = process.env.PORT || 3001;
    if (!httpServer.listening) {
        httpServer.listen(PORT, () => {
            console.log(`WebSocket server running on port ${PORT}`);
        });
    }

    return new Response('WebSocket server is running');
}

export default ioHandler;// Assurez-vous que les importations et types sont correctement définis
import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextApiResponseServerIO } from '@/types/types';

// Vérifiez que le type NextApiResponseServerIO est correctement défini dans '@/types/types'
interface NextApiResponseServerIO extends NextApiResponse {
    socket: {
        server: {
            io: Server;
        };
    };
}

// Assurez-vous que le type Socket est importé et utilisé correctement
const dashboardSockets = new Set<Socket>();

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: process.env.NEXT_PUBLIC_ORIGIN_URL || "*",
        methods: ["GET", "POST"],
    },
});

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
    if (!res.socket.server.io) {
        const io = new Server(res.socket.server as any, {
            path: "/api/ws",
            addTrailingSlash: false,
            cors: {
                origin: process.env.NEXT_PUBLIC_ORIGIN_URL || "*",
            },
        });

        io.on('connection', (socket: Socket) => {
            let currentRoom: string | null = null;
            let isDashboard = false;

            socket.on('joinDashboard', () => {
                isDashboard = true;
                dashboardSockets.add(socket);

                const currentGames = Array.from(tableStates.entries()).map(([roomCode, gameState]) => ({
                    roomCode,
                    gameState,
                    lastUpdate: new Date(),
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
                    lastUpdate: new Date(),
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
                console.log(`Client disconnected. Room: ${currentRoom}, Dashboard: ${isDashboard}`);
            });
        });

        res.socket.server.io = io;
        console.log('WebSocket server initialized');
    }
    res.end();
};

export async function GET(request: NextRequest) {
    if (request.headers.get('upgrade') !== 'websocket') {
        return new Response('Requires WebSocket connection', { status: 426 });
    }

    const PORT = process.env.PORT || 3001;
    if (!httpServer.listening) {
        httpServer.listen(PORT, () => {
            console.log(`WebSocket server running on port ${PORT}`);
        });
    }

    return new Response('WebSocket server is running');
}

export default ioHandler;// Assurez-vous que les importations et types sont correctement définis
import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextApiResponseServerIO } from '@/types/types';

// Vérifiez que le type NextApiResponseServerIO est correctement défini dans '@/types/types'
interface NextApiResponseServerIO extends NextApiResponse {
    socket: {
        server: {
            io: Server;
        };
    };
}

// Assurez-vous que le type Socket est importé et utilisé correctement
const dashboardSockets = new Set<Socket>();

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: process.env.NEXT_PUBLIC_ORIGIN_URL || "*",
        methods: ["GET", "POST"],
    },
});

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
    if (!res.socket.server.io) {
        const io = new Server(res.socket.server as any, {
            path: "/api/ws",
            addTrailingSlash: false,
            cors: {
                origin: process.env.NEXT_PUBLIC_ORIGIN_URL || "*",
            },
        });

        io.on('connection', (socket: Socket) => {
            let currentRoom: string | null = null;
            let isDashboard = false;

            socket.on('joinDashboard', () => {
                isDashboard = true;
                dashboardSockets.add(socket);

                const currentGames = Array.from(tableStates.entries()).map(([roomCode, gameState]) => ({
                    roomCode,
                    gameState,
                    lastUpdate: new Date(),
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
                    lastUpdate: new Date(),
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
                console.log(`Client disconnected. Room: ${currentRoom}, Dashboard: ${isDashboard}`);
            });
        });

        res.socket.server.io = io;
        console.log('WebSocket server initialized');
    }
    res.end();
};

export async function GET(request: NextRequest) {
    if (request.headers.get('upgrade') !== 'websocket') {
        return new Response('Requires WebSocket connection', { status: 426 });
    }

    const PORT = process.env.PORT || 3001;
    if (!httpServer.listening) {
        httpServer.listen(PORT, () => {
            console.log(`WebSocket server running on port ${PORT}`);
        });
    }

    return new Response('WebSocket server is running');
}

export default ioHandler;// Assurez-vous que les importations et types sont correctement définis
import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest } from 'next/server'; // Import correct pour NextRequest
import { NextApiResponseServerIO } from '@/types/types'; // Assurez-vous que ce type est défini

// Définir le type d'état de jeu
interface GameState {
    scores: { [player: string]: number };
    setsGagnes: { [player: string]: number };
    config: { nbSetsGagnants: number; scoreParSet: number };
}

// Map pour stocker les états des tables
const tableStates = new Map<string, GameState>();

// Set pour stocker les connexions des dashboards
const dashboardSockets = new Set<Socket>();

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: process.env.NEXT_PUBLIC_ORIGIN_URL || "*",
        methods: ["GET", "POST"],
    },
});

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
    if (!res.socket.server.io) {
        const io = new Server(res.socket.server as unknown, { // Utilisation de unknown au lieu de any
            path: "/api/ws",
            addTrailingSlash: false,
            cors: {
                origin: process.env.NEXT_PUBLIC_ORIGIN_URL || "*",
            },
        });

        io.on('connection', (socket: Socket) => {
            let currentRoom: string | null = null;
            let isDashboard = false;

            socket.on('joinDashboard', () => {
                isDashboard = true;
                dashboardSockets.add(socket);

                const currentGames = Array.from(tableStates.entries()).map(([roomCode, gameState]) => ({
                    roomCode,
                    gameState,
                    lastUpdate: new Date(),
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
                    lastUpdate: new Date(),
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
                console.log(`Client disconnected. Room: ${currentRoom}, Dashboard: ${isDashboard}`);
            });
        });

        res.socket.server.io = io;
        console.log('WebSocket server initialized');
    }
    res.end();
};

export async function GET(request: NextRequest) {
    if (request.headers.get('upgrade') !== 'websocket') {
        return new Response('Requires WebSocket connection', { status: 426 });
    }

    const PORT = process.env.PORT || 3001;
    if (!httpServer.listening) {
        httpServer.listen(PORT, () => {
            console.log(`WebSocket server running on port ${PORT}`);
        });
    }

    return new Response('WebSocket server is running');
}

export default ioHandler;// Assurez-vous que les importations et types sont correctement définis
import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest } from 'next/server'; // Import correct pour NextRequest
import { NextApiResponseServerIO } from '@/types/types'; // Assurez-vous que ce type est défini

// Définir le type d'état de jeu
interface GameState {
    scores: { [player: string]: number };
    setsGagnes: { [player: string]: number };
    config: { nbSetsGagnants: number; scoreParSet: number };
}

// Map pour stocker les états des tables
const tableStates = new Map<string, GameState>();

// Set pour stocker les connexions des dashboards
const dashboardSockets = new Set<Socket>();

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: process.env.NEXT_PUBLIC_ORIGIN_URL || "*",
        methods: ["GET", "POST"],
    },
});

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
    if (!res.socket.server.io) {
        const io = new Server(res.socket.server as unknown, { // Utilisation de unknown au lieu de any
            path: "/api/ws",
            addTrailingSlash: false,
            cors: {
                origin: process.env.NEXT_PUBLIC_ORIGIN_URL || "*",
            },
        });

        io.on('connection', (socket: Socket) => {
            let currentRoom: string | null = null;
            let isDashboard = false;

            socket.on('joinDashboard', () => {
                isDashboard = true;
                dashboardSockets.add(socket);

                const currentGames = Array.from(tableStates.entries()).map(([roomCode, gameState]) => ({
                    roomCode,
                    gameState,
                    lastUpdate: new Date(),
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
                    lastUpdate: new Date(),
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
                console.log(`Client disconnected. Room: ${currentRoom}, Dashboard: ${isDashboard}`);
            });
        });

        res.socket.server.io = io;
        console.log('WebSocket server initialized');
    }
    res.end();
};

export async function GET(request: NextRequest) {
    if (request.headers.get('upgrade') !== 'websocket') {
        return new Response('Requires WebSocket connection', { status: 426 });
    }

    const PORT = process.env.PORT || 3001;
    if (!httpServer.listening) {
        httpServer.listen(PORT, () => {
            console.log(`WebSocket server running on port ${PORT}`);
        });
    }

    return new Response('WebSocket server is running');
}

export default ioHandler;import { NextApiResponse } from 'next';
import { Server } from 'socket.io';

export interface NextApiResponseServerIO extends NextApiResponse {
    socket: {
        server: {
            io: Server;
        };
    };
}// @/types/types.ts
import { NextApiResponse } from 'next';
import { Server } from 'socket.io';

export interface NextApiResponseServerIO extends NextApiResponse {
    socket: {
        server: {
            io: Server;
        };
    };
}

// Importations nécessaires
import { Server } from 'socket.io';
import { createServer } from 'http';
import { NextApiRequest } from 'next';
import { NextApiResponseServerIO } from '@/types/types';

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: process.env.NEXT_PUBLIC_ORIGIN_URL || "*", // Utiliser l'URL d'origine ou toutes les origines
        methods: ["GET", "POST"],
    },
});

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
    if (!res.socket.server.io) {
        const io = new Server(res.socket.server as any, {
            path: "/api/ws",
            addTrailingSlash: false,
            cors: {
                origin: process.env.NEXT_PUBLIC_ORIGIN_URL || "*", // Même configuration CORS
            },
        });

        // Gestion des événements socket.io
        io.on('connection', (socket: Socket) => {
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

        res.socket.server.io = io;
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