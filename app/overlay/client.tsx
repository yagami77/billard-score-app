'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSocket } from '../../hooks/useSocket';
import { GameState } from '../../types/types';
import { Crown } from 'lucide-react';

export default function OverlayClient() {
    const searchParams = useSearchParams();
    const roomCode = searchParams.get('table') || 'default';
    const [gameState, setGameState] = useState<GameState | null>(null);

    const {} = useSocket(roomCode, (newState) => {
        console.log('Overlay received state:', newState);
        setGameState(newState);
    });

    useEffect(() => {
        console.log('Overlay mounted with roomCode:', roomCode);
    }, [roomCode]);

    if (!gameState) {
        return (
            <div className="p-4 text-white bg-black/50 rounded">
                <div>En attente de connexion à la table {roomCode}...</div>
                <div className="text-sm opacity-75 mt-2">
                    État de la connexion en cours...
                </div>
            </div>
        );
    }

    return (
        <main className="h-screen w-screen bg-transparent p-4">
            {/* Tout votre JSX existant */}
            <div className="inline-block">
                <table className="border-collapse border border-black">
                    {/* ... reste du code ... */}
                </table>
            </div>
        </main>
    );
}