import { useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState } from '../types/types';

const getSocketUrl = () => {
    if (typeof window !== 'undefined') {
        // En développement local
        if (window.location.hostname === 'localhost') {
            return 'http://localhost:3001';
        }

        // En production (incluant Vercel et 5quilles.com)
        return '';  // URL vide pour utiliser l'URL relative
    }
    return 'http://localhost:3001';
};

type SocketCallback = (state: GameState) => void;

export const useSocket = (roomCode: string, onStateUpdate: SocketCallback) => {
    const socketRef = useRef<Socket | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

    const connect = useCallback(() => {
        if (socketRef.current?.connected) return;

        const socketUrl = getSocketUrl();
        console.log('🔌 Tentative de connexion à:', socketUrl);

        socketRef.current = io(socketUrl, {
            path: '/api/ws',
            transports: ['polling', 'websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            timeout: 5000,
            forceNew: true,
            autoConnect: true,
            withCredentials: true
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
            console.log('✅ Connecté au serveur');
            reconnectAttemptsRef.current = 0;
            socket.emit('joinRoom', roomCode);
        });

        socket.on('stateUpdate', (newState: GameState) => {
            console.log('📥 Mise à jour reçue:', newState);
            onStateUpdate(newState);
        });

        socket.on('connect_error', (error) => {
            console.error('❌ Erreur de connexion:', error);
            handleReconnect();
        });

        socket.on('disconnect', (reason) => {
            console.log('🔌 Déconnecté:', reason);
            handleReconnect();
        });

    }, [roomCode, onStateUpdate]);

    const handleReconnect = useCallback(() => {
        if (reconnectAttemptsRef.current >= 5) {
            console.error('🚫 Nombre maximum de tentatives atteint');
            return;
        }

        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }

        reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            console.log(`🔄 Tentative de reconnexion ${reconnectAttemptsRef.current}/5`);
            connect();
        }, 1000);
    }, [connect]);

    useEffect(() => {
        connect();
        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [connect]);

    const emitStateUpdate = useCallback((newState: GameState) => {
        if (!socketRef.current?.connected) {
            console.warn('⚠️ Socket non connecté');
            return;
        }
        console.log('📤 Émission mise à jour:', newState);
        socketRef.current.emit('updateState', roomCode, newState);
    }, [roomCode]);

    return { emitStateUpdate };
};