import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:3001';

export function useDashboardTables() {
    const [tables, setTables] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [socket, setSocket] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');

    useEffect(() => {
        let socketInstance = null;

        try {
            console.log('Tentative de connexion au WebSocket:', SOCKET_URL);

            // Options de connexion
            const connectionOptions = {
                transports: ['websocket', 'polling'],
                forceNew: true,
                reconnection: true,
                reconnectionAttempts: 10,
                reconnectionDelay: 1000
            };

            socketInstance = io(SOCKET_URL, connectionOptions);
            setSocket(socketInstance);

            socketInstance.on('connect', () => {
                console.log('Connexion WebSocket établie avec ID:', socketInstance.id);
                setConnectionStatus('connected');

                // ⚠️ Important: utiliser 'joinDashboard' au lieu de 'getDashboard'
                socketInstance.emit('joinDashboard');
            });

            socketInstance.on('connect_error', (error) => {
                console.error('Erreur de connexion WebSocket:', error.message);
                setConnectionStatus('error');
                setIsLoading(false);
            });

            socketInstance.on('disconnect', (reason) => {
                console.log('Déconnexion WebSocket:', reason);
                setConnectionStatus('disconnected');
            });

            socketInstance.on('dashboardUpdate', (data) => {
                console.log('Mise à jour du dashboard reçue:', data);
                if (Array.isArray(data)) {
                    setTables(data);
                    setIsLoading(false);
                } else {
                    console.warn('Format de données invalide pour dashboardUpdate:', data);
                    setIsLoading(false);
                }
            });

            socketInstance.on('gameUpdate', (update) => {
                console.log('Mise à jour de partie reçue:', update);
                if (update && update.roomCode) {
                    setTables(prev => {
                        const index = prev.findIndex(t => t.roomCode === update.roomCode);
                        if (index >= 0) {
                            const newTables = [...prev];
                            newTables[index] = {
                                ...newTables[index],
                                gameState: update.gameState,
                                lastUpdate: new Date()
                            };
                            return newTables;
                        }
                        return [
                            ...prev,
                            {
                                roomCode: update.roomCode,
                                gameState: update.gameState,
                                lastUpdate: new Date()
                            }
                        ];
                    });
                }
            });

            // Gestion de la suppression d'une table
            socketInstance.on('tableDeleted', ({ roomCode }) => {
                console.log('Table supprimée:', roomCode);
                setTables(prev => prev.filter(table => table.roomCode !== roomCode));
            });

            // Si toujours en chargement après 10 secondes, on considère qu'il y a un problème
            const timeout = setTimeout(() => {
                if (isLoading) {
                    console.warn('Timeout de chargement des tables');
                    setIsLoading(false);
                }
            }, 10000);

            return () => {
                clearTimeout(timeout);
                if (socketInstance) {
                    console.log('Déconnexion du WebSocket');
                    socketInstance.disconnect();
                }
            };
        } catch (error) {
            console.error('Erreur lors de l\'initialisation du WebSocket:', error);
            setIsLoading(false);
            return () => {
                if (socketInstance) socketInstance.disconnect();
            };
        }
    }, []);

    // Fonction pour supprimer une table
    const deleteTable = useCallback((roomCode) => {
        return new Promise((resolve, reject) => {
            if (!socket) {
                console.error('Socket non initialisé');
                reject(new Error('Non connecté au serveur'));
                return;
            }

            console.log('Demande de suppression de la table:', roomCode);

            // Envoyer la demande de suppression
            socket.emit('deleteTable', roomCode, (response) => {
                if (response && response.success) {
                    console.log('Table supprimée avec succès:', response.message);
                    resolve(response);
                } else {
                    console.error('Échec de la suppression:', response?.message || 'Erreur inconnue');
                    reject(new Error(response?.message || 'Échec de la suppression'));
                }
            });

            // Timeout pour éviter de bloquer indéfiniment si le serveur ne répond pas
            setTimeout(() => {
                reject(new Error('Délai d\'attente dépassé'));
            }, 5000);
        });
    }, [socket]);

    return {
        tables,
        isLoading,
        deleteTable,
        connectionStatus
    };
}