'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSocket } from '../../hooks/useSocket';
import { GameState } from '../../types/types';

function OverlayContent({ roomCode }: { roomCode: string }) {
    const [gameState, setGameState] = useState<GameState | null>(null);

    useSocket(roomCode, (newState) => {
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
            <div className="inline-block">
                <table className="border-collapse border border-black">
                    {/* Insérez ici votre logique d'affichage */}
                </table>
            </div>
        </main>
    );
}

function RoomCodeProvider({ children }: { children: (roomCode: string) => React.ReactNode }) {
    const searchParams = useSearchParams();
    const roomCode = searchParams.get('table') || 'default';

    return <>{children(roomCode)}</>;
}

export default function OverlayClient() {
    return (
        <Suspense fallback={<div>Chargement en cours...</div>}>
            <RoomCodeProvider>
                {(roomCode: string) => <OverlayContent roomCode={roomCode} />}
            </RoomCodeProvider>
        </Suspense>
    );
}