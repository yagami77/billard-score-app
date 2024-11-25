import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState } from '../types/types';

type SocketCallback = (state: GameState) => void;

const SOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:3001';

export const useSocket = (roomCode: string, onStateUpdate: SocketCallback) => {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        // Création de la connexion
        socketRef.current = io(SOCKET_URL);

        console.log('Connecting to WebSocket server...');

        // Gestion de la connexion
        socketRef.current.on('connect', () => {
            console.log('Connected to WebSocket server');
            // Rejoindre la salle après la connexion
            if (socketRef.current) {
                socketRef.current.emit('joinRoom', roomCode);
                console.log(`Joining room: ${roomCode}`);
            }
        });

        // Écoute des mises à jour d'état
        socketRef.current.on('stateUpdate', (newState: GameState) => {
            console.log('Received state update:', newState);
            onStateUpdate(newState);
        });

        // Gestion des erreurs
        socketRef.current.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
        });

        // Nettoyage
        return () => {
            if (socketRef.current) {
                console.log('Disconnecting from WebSocket server...');
                socketRef.current.disconnect();
            }
        };
    }, [roomCode]);

    // Fonction pour émettre des mises à jour d'état
    const emitStateUpdate = (newState: GameState) => {
        if (socketRef.current?.connected) {
            console.log('Emitting state update:', newState);
            socketRef.current.emit('updateState', roomCode, newState);
        } else {
            console.warn('Cannot emit state update: socket not connected');
        }
    };

    return { emitStateUpdate };
};