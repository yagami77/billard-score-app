import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState } from '../types/types';
import { useCallback } from 'react';

type SocketCallback = (state: any) => void;

const SOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:3001';

export const useSocket = (roomCode: string, onStateUpdate: SocketCallback) => {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const pendingUpdatesRef = useRef<{state: GameState, roomCode: string}[]>([]);

    useEffect(() => {
        // Détecter les appareils mobiles
        const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        console.log('Device is mobile:', isMobile);

        // Options de connexion améliorées
        const connectionOptions = {
            transports: ['websocket', 'polling'], // Essayer d'abord websocket puis polling
            forceNew: false, // Éviter de créer trop de connexions
            reconnection: true,
            reconnectionAttempts: Infinity, // Réessayer indéfiniment
            reconnectionDelay: 1000,
            timeout: 60000, // Timeout plus long
            autoConnect: true,
            secure: window.location.protocol === 'https:' // Sécurisé si HTTPS
        };

        // Création de la connexion
        if (!socketRef.current) {
            console.log('Initializing WebSocket connection to:', SOCKET_URL);
            socketRef.current = io(SOCKET_URL, connectionOptions);
        }

        // Gestion de la connexion
        const handleConnect = () => {
            console.log('Connected to WebSocket server with ID:', socketRef.current?.id);
            setIsConnected(true);

            // Envoi des mises à jour en attente
            if (pendingUpdatesRef.current.length > 0) {
                console.log(`Sending ${pendingUpdatesRef.current.length} pending updates`);
                pendingUpdatesRef.current.forEach(({ state, roomCode }) => {
                    socketRef.current?.emit('updateState', roomCode, state);
                });
                pendingUpdatesRef.current = [];
            }

            // Traitement différent selon le type de salle
            if (socketRef.current) {
                if (roomCode === 'dashboard') {
                    console.log('Joining dashboard view');
                    socketRef.current.emit('joinDashboard');

                    // Écouter les mises à jour du dashboard
                    socketRef.current.on('dashboardUpdate', (data) => {
                        console.log('Received dashboard update:', data);
                        onStateUpdate(data);
                    });

                    // Écouter les mises à jour individuelles des tables
                    socketRef.current.on('gameUpdate', (data) => {
                        console.log('Received game update:', data);
                        onStateUpdate(data);
                    });

                    // Écouter les suppressions de tables
                    socketRef.current.on('tableDeleted', (data) => {
                        console.log('Table deleted:', data);
                        onStateUpdate({ type: 'tableDeleted', data });
                    });
                } else {
                    // Pour les connexions à une table spécifique
                    console.log(`Joining specific room: ${roomCode}`);
                    socketRef.current.emit('joinRoom', roomCode);

                    // Écouter les mises à jour d'état pour cette table
                    socketRef.current.on('stateUpdate', (newState: GameState) => {
                        console.log('Received state update for room:', roomCode, newState);
                        onStateUpdate(newState);
                    });
                }
            }
        };

        // Gestion améliorée des erreurs
        const handleConnectError = (error: Error) => {
            console.error(`WebSocket connection error: ${error.message}`, error);
            setIsConnected(false);

            // Réessayer après un délai
            setTimeout(() => {
                if (socketRef.current) {
                    console.log('Attempting to reconnect...');
                    socketRef.current.connect();
                }
            }, 2000);
        };

        const handleDisconnect = (reason: string) => {
            console.log(`Disconnected from WebSocket server, reason: ${reason}`);
            setIsConnected(false);
        };

        const handleReconnectAttempt = (attempt: number) => {
            console.log(`Reconnection attempt ${attempt}`);
        };

        // Ajout des écouteurs d'événements
        socketRef.current.on('connect', handleConnect);
        socketRef.current.on('connect_error', handleConnectError);
        socketRef.current.on('disconnect', handleDisconnect);
        socketRef.current.on('reconnect_attempt', handleReconnectAttempt);

        // Vérifier si déjà connecté
        if (socketRef.current.connected) {
            handleConnect();
        }

        // Nettoyage
        return () => {
            if (socketRef.current) {
                console.log('Cleaning up socket event listeners');
                socketRef.current.off('connect', handleConnect);
                socketRef.current.off('connect_error', handleConnectError);
                socketRef.current.off('disconnect', handleDisconnect);
                socketRef.current.off('reconnect_attempt', handleReconnectAttempt);

                // Désabonnement des événements spécifiques
                if (roomCode === 'dashboard') {
                    socketRef.current.off('dashboardUpdate');
                    socketRef.current.off('gameUpdate');
                    socketRef.current.off('tableDeleted');
                } else {
                    socketRef.current.off('stateUpdate');
                }

                // Note : Ne pas déconnecter ici pour réutiliser la connexion
                // socketRef.current.disconnect();
            }
        };
    }, [roomCode, onStateUpdate]);

    // Fonction pour émettre des mises à jour d'état avec gestion des erreurs
    const emitStateUpdate = useCallback((newState: GameState) => {
        if (socketRef.current?.connected) {
            console.log(`Emitting state update for room ${roomCode}:`, newState);
            socketRef.current.emit('updateState', roomCode, newState);
        } else {
            console.warn('Socket not connected, queuing update for later');
            // Sauvegarder la mise à jour pour l'envoyer plus tard
            pendingUpdatesRef.current.push({ state: newState, roomCode });

            // Tenter de se reconnecter si déconnecté
            if (socketRef.current && !socketRef.current.connected) {
                console.log('Attempting to reconnect socket...');
                socketRef.current.connect();
            }
        }
    }, [roomCode]);

    // Fonction générique pour émettre n'importe quel événement
    const emitEvent = useCallback((eventName: string, ...args: any[]) => {
        if (socketRef.current?.connected) {
            console.log(`Emitting event ${eventName}:`, args);
            socketRef.current.emit(eventName, ...args);
            return true;
        } else {
            console.warn(`Cannot emit event ${eventName}: socket not connected`);
            // Tenter de se reconnecter
            if (socketRef.current) {
                socketRef.current.connect();
            }
            return false;
        }
    }, []);

    return { emitStateUpdate, emitEvent, isConnected };
};