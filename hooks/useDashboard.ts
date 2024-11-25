import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { GameState } from '@/types/types';

interface ActiveGame {
    roomCode: string;
    gameState: GameState;
    lastUpdate: Date;
}

export const useDashboard = () => {
    const [games, setGames] = useState<ActiveGame[]>([]);

    useEffect(() => {
        const socket = io('http://localhost:3001');

        socket.emit('joinDashboard');

        socket.on('dashboardUpdate', (currentGames: ActiveGame[]) => {
            setGames(currentGames);
        });

        socket.on('gameUpdate', (update: ActiveGame) => {
            setGames(prev => {
                const index = prev.findIndex(game => game.roomCode === update.roomCode);
                if (index === -1) {
                    return [...prev, update];
                }
                const newGames = [...prev];
                newGames[index] = update;
                return newGames;
            });
        });

        socket.on('gameEnded', (roomCode: string) => {
            setGames(prev => prev.filter(game => game.roomCode !== roomCode));
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return games;
};