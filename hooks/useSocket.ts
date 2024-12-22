import { useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState } from '../types/types';

const getSocketUrl = () => {
    if (typeof window !== 'undefined') {
        // En développement
        if (window.location.hostname === 'localhost') {
            return 'http://localhost:3001';
        }

        // En production (incluant Vercel et 5quilles.com)
        return window.location.origin;
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
            path: '/api/ws',  // Simplifié
            transports: ['polling', 'websocket'],  // Polling d'abord
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            timeout: 5000,
            forceNew: true,
            rejectUnauthorized: false, // Important pour Vercel
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
            if (socket.io.opts.transports[0] === 'websocket') {
                console.log('🔄 Tentative de reconnexion en polling...');
                socket.io.opts.transports = ['polling', 'websocket'];
            }
        });

        socket.on('disconnect', (reason) => {
            console.log('🔌 Déconnecté:', reason);
            handleReconnect();
        });

        socket.connect();
    }, [roomCode, onStateUpdate]);

    const handleReconnect = useCallback(() => {
        if (reconnectAttemptsRef.current >= 10) {
            console.error('🚫 Nombre maximum de tentatives de reconnexion atteint');
            return;
        }

        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }

        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);

        reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            console.log(`🔄 Tentative de reconnexion ${reconnectAttemptsRef.current}/10`);
            connect();
        }, delay);
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
            console.warn('⚠️ Socket non connecté, tentative de reconnexion...');
            connect();
            return;
        }

        try {
            console.log('📤 Émission mise à jour:', newState);
            socketRef.current.emit('updateState', roomCode, newState);
        } catch (error) {
            console.error('❌ Erreur lors de l\'émission:', error);
            handleReconnect();
        }
    }, [roomCode, connect, handleReconnect]);

    return { emitStateUpdate };
};