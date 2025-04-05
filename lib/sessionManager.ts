// lib/sessionManager.ts

import { GameState } from '../types/types';

interface SessionStore {
    [roomCode: string]: {
        gameState: GameState;
        tableName: string;      // Nom de la table (ex: "Table 1")
        lastUpdated: number;    // Timestamp de la dernière mise à jour
        connectedClients: number; // Nombre de clients connectés (overlay + contrôleur)
    }
}

class SessionManager {
    private static instance: SessionManager;
    private sessions: SessionStore = {};
    private readonly MAX_TABLES = 10; // Maximum de tables simultanées

    // Constructeur privé pour le pattern Singleton
    private constructor() {
        // Nettoie les sessions inactives toutes les heures
        setInterval(() => this.cleanup(), 3600000);
    }

    // Obtenir l'instance unique du SessionManager
    static getInstance(): SessionManager {
        if (!SessionManager.instance) {
            SessionManager.instance = new SessionManager();
        }
        return SessionManager.instance;
    }

    // Créer une nouvelle session pour une table
    createSession(roomCode: string, tableName: string, initialState: GameState): boolean {
        // Vérifie si on n'a pas atteint le maximum de tables
        if (Object.keys(this.sessions).length >= this.MAX_TABLES) {
            console.warn('Maximum number of tables reached');
            return false;
        }

        // Créer la nouvelle session
        this.sessions[roomCode] = {
            gameState: initialState,
            tableName,
            lastUpdated: Date.now(),
            connectedClients: 0
        };

        console.log(`Session created for table: ${tableName}, roomCode: ${roomCode}`);
        return true;
    }

    // Mettre à jour l'état d'une session
    updateSession(roomCode: string, newState: GameState): boolean {
        if (!this.sessions[roomCode]) {
            console.warn(`No session found for roomCode: ${roomCode}`);
            return false;
        }

        this.sessions[roomCode] = {
            ...this.sessions[roomCode],
            gameState: newState,
            lastUpdated: Date.now()
        };

        return true;
    }

    // Récupérer l'état d'une session
    getSession(roomCode: string): GameState | null {
        const session = this.sessions[roomCode];
        if (!session) {
            console.warn(`No session found for roomCode: ${roomCode}`);
            return null;
        }
        return session.gameState;
    }

    // Obtenir la liste des tables actives
    getActiveTables(): Array<{ roomCode: string; tableName: string; clientCount: number }> {
        return Object.entries(this.sessions).map(([roomCode, session]) => ({
            roomCode,
            tableName: session.tableName,
            clientCount: session.connectedClients
        }));
    }

    // Gérer la connexion d'un nouveau client
    clientConnected(roomCode: string): void {
        if (this.sessions[roomCode]) {
            this.sessions[roomCode].connectedClients++;
            console.log(`Client connected to ${roomCode}, total clients: ${this.sessions[roomCode].connectedClients}`);
        }
    }

    // Gérer la déconnexion d'un client
    clientDisconnected(roomCode: string): void {
        if (this.sessions[roomCode]) {
            this.sessions[roomCode].connectedClients--;
            console.log(`Client disconnected from ${roomCode}, remaining clients: ${this.sessions[roomCode].connectedClients}`);

            // Si plus aucun client connecté depuis plus de 2 heures, on peut nettoyer
            if (this.sessions[roomCode].connectedClients <= 0) {
                const twoHoursInMs = 2 * 60 * 60 * 1000;
                if (Date.now() - this.sessions[roomCode].lastUpdated > twoHoursInMs) {
                    delete this.sessions[roomCode];
                    console.log(`Session ${roomCode} cleaned up due to inactivity`);
                }
            }
        }
    }

    // Nettoyage des sessions inactives
    private cleanup(): void {
        const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);
        Object.keys(this.sessions).forEach(roomCode => {
            const session = this.sessions[roomCode];
            if (session.lastUpdated < twoHoursAgo && session.connectedClients <= 0) {
                delete this.sessions[roomCode];
                console.log(`Session ${roomCode} cleaned up during routine cleanup`);
            }
        });
    }
}

// Exporter l'instance unique
export const sessionManager = SessionManager.getInstance();