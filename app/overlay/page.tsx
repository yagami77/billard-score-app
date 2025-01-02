'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSocket } from '../../hooks/useSocket';
import { GameState } from '../../types/types';
import { Crown } from 'lucide-react';

function OverlayContent({ roomCode }: { roomCode: string }) {
    const [gameState, setGameState] = useState<GameState | null>(null);

    useSocket(roomCode, (newState) => {
        console.log('[OverlayContent] WebSocket State Update:', newState);
        setGameState(newState);
    });

    useEffect(() => {
        console.log('[OverlayContent] Mounted with roomCode:', roomCode);
    }, [roomCode]);

    if (!gameState) {
        console.log('[OverlayContent] No gameState available.');
        return (
            <div className="p-4 text-white bg-black/50 rounded">
                <div>En attente de connexion à la table {roomCode}...</div>
                <div className="text-sm opacity-75 mt-2">
                    État de la connexion en cours...
                </div>
            </div>
        );
    }

    console.log('[OverlayContent] Current gameState:', gameState);

    return (
        <main className="h-screen w-screen bg-transparent p-4">
            <div className="inline-block">
                <table className="border-collapse border border-black">
                    <tbody>
                    <PlayerRow
                        joueur={gameState.nomJoueurs.joueur1}
                        score={gameState.scores.joueur1}
                        sets={gameState.setsGagnes.joueur1}
                        isWinner={gameState.gagnant === 'joueur1'}
                    />
                    <PlayerRow
                        joueur={gameState.nomJoueurs.joueur2}
                        score={gameState.scores.joueur2}
                        sets={gameState.setsGagnes.joueur2}
                        isWinner={gameState.gagnant === 'joueur2'}
                    />
                    </tbody>
                </table>
            </div>
        </main>
    );
}

export default function OverlayPage() {
    const searchParams = useSearchParams();
    const roomCode = searchParams.get('table') || 'default';

    console.log('[OverlayPage] Current roomCode:', roomCode);

    return (
        <Suspense fallback={<div>Chargement en cours...</div>}>
            <OverlayContent roomCode={roomCode} />
        </Suspense>
    );
}

function PlayerRow({
                       joueur,
                       score,
                       sets,
                       isWinner,
                   }: {
    joueur: string;
    score: number;
    sets: number;
    isWinner: boolean;
}) {
    console.log('[PlayerRow] Rendering PlayerRow:', { joueur, score, sets, isWinner });

    return (
        <tr className="h-[35px]">
            <td className="bg-gray-50 min-w-[150px] border border-black px-3 whitespace-nowrap overflow-hidden">
                <span className="text-gray-900 font-semibold text-base truncate block">
                    {joueur}
                </span>
            </td>
            <td className="bg-red-600 w-[45px] border border-black">
                <div className="flex items-center justify-start pl-2">
                    <div className="w-3 h-3 rounded-full bg-white mr-1"></div>
                    <span className="text-white font-bold text-base tabular-nums">{sets}</span>
                </div>
            </td>
            <td className="bg-red-600 w-[45px] border border-black relative">
                <div className="flex items-center justify-center">
                    <span className="text-white font-bold text-base tabular-nums">{score}</span>
                </div>
                {isWinner && (
                    <div className="absolute -right-8 top-1/2 -translate-y-1/2">
                        <Crown className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    </div>
                )}
            </td>
        </tr>
    );
}

