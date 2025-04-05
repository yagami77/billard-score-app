import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export const useDashboard = () => {
    const [games, setGames] = useState([]);
    const socketRef = useRef(null);

    // Vérifier si on est côté client
    const isClient = typeof window !== 'undefined';

    useEffect(() => {
        // Ne s'exécute que côté client
        if (!isClient) return;

        const socketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:3001';

        // Créer une nouvelle connexion
        const socket = io(socketUrl, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            timeout: 10000
        });

        socketRef.current = socket;

        // Gestion des événements
        socket.on('connect', () => {
            console.log('Dashboard connected to WebSocket');
            socket.emit('joinDashboard');
        });

        socket.on('dashboardUpdate', (data) => {
            console.log('Dashboard received update:', data);
            if (Array.isArray(data)) {
                setGames(data);
            }
        });

        // Gestion des mises à jour individuelles
        socket.on('gameUpdate', (update) => {
            console.log('Game update received:', update);
            if (update && update.roomCode) {
                setGames(prev => {
                    const index = prev.findIndex(game => game.roomCode === update.roomCode);
                    if (index >= 0) {
                        const newGames = [...prev];
                        newGames[index] = update;
                        return newGames;
                    }
                    return [...prev, update];
                });
            }
        });

        // Gestion des suppressions de tables
        socket.on('tableDeleted', ({ roomCode }) => {
            console.log('Table deleted:', roomCode);
            setGames(prev => prev.filter(game => game.roomCode !== roomCode));
        });

        socket.on('connect_error', (error) => {
            console.error('Dashboard connection error:', error);
        });

        // Nettoyage
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [isClient]); // Ajout de isClient comme dépendance

    return games;
};