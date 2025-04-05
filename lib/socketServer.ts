// lib/socketServer.ts

import { Server } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import { sessionManager } from './sessionManager';

export function initSocketServer(httpServer: HTTPServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        let currentRoom: string | null = null;

        // Rejoindre une salle (table)
        socket.on('joinRoom', (roomCode: string) => {
            if (currentRoom) {
                socket.leave(currentRoom);
                sessionManager.clientDisconnected(currentRoom);
            }

            socket.join(roomCode);
            currentRoom = roomCode;
            sessionManager.clientConnected(roomCode);

            // Envoyer l'état actuel au client qui vient de se connecter
            const currentState = sessionManager.getSession(roomCode);
            if (currentState) {
                socket.emit('stateUpdate', currentState);
            }
        });

        // Mise à jour du score
        socket.on('updateState', (roomCode: string, newState) => {
            if (sessionManager.updateSession(roomCode, newState)) {
                // Diffuser la mise à jour à tous les clients dans la même salle
                io.to(roomCode).emit('stateUpdate', newState);
            }
        });

        // Déconnexion
        socket.on('disconnect', () => {
            if (currentRoom) {
                sessionManager.clientDisconnected(currentRoom);
            }
        });
    });

    return io;
}