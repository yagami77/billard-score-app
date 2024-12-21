import { useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState } from '../types/types';

// Fonction pour déterminer l'URL du WebSocket
const getWebSocketUrl = () => {
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname === '5quilles.com' || hostname === 'www.5quilles.com') {
            return 'wss://www.5quilles.com'; // URL WebSocket en production
        }
    }
    return 'ws://localhost:3001'; // URL WebSocket en développement
};

type SocketCallback = (state: GameState) => void;

export const useSocket = (roomCode: string, onStateUpdate: SocketCallback) => {
    const socketRef = useRef<Socket | null>(null);
    const reconnectAttemptsRef = useRef(0);

    useEffect(() => {
        // Configuration du socket avec gestion de la reconnexion
        socketRef.current = io(getWebSocketUrl(), {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            timeout: 5000
        });

        console.log('🔄 Connexion au serveur WebSocket...');

        socketRef.current.on('connect', () => {
            console.log('✅ Connecté au serveur WebSocket');
            reconnectAttemptsRef.current = 0;
            socketRef.current?.emit('joinRoom', roomCode);
        });

        socketRef.current.on('stateUpdate', (newState: GameState) => {
            console.log('📥 Mise à jour reçue:', newState);
            onStateUpdate(newState);
        });

        socketRef.current.on('connect_error', (error) => {
            console.error('❌ Erreur de connexion:', error);
            reconnectAttemptsRef.current++;
        });

        return () => {
            if (socketRef.current) {
                console.log('🔌 Déconnexion du serveur WebSocket');
                socketRef.current.disconnect();
            }
        };
    }, [roomCode]);

    const emitStateUpdate = (newState: GameState) => {
        if (socketRef.current?.connected) {
            console.log('📤 Émission mise à jour:', newState);
            socketRef.current.emit('updateState', roomCode, newState);
        } else {
            console.warn('⚠️ Impossible d\'émettre la mise à jour: socket non connecté');
        }
    };

    return { emitStateUpdate };
};
