'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSocket } from '../../hooks/useSocket';
import { GameState } from '../../types/types';
import { Crown } from 'lucide-react';

const OverlayContent: React.FC = () => {
    const searchParams = useSearchParams();
    const roomCode = searchParams.get('table') || 'default';
    const [gameState, setGameState] = useState<GameState | null>(null);

    // Utilisation du hook WebSocket
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
            <div className="inline-block">
                <table className="border-collapse border border-black">
                    <tbody>
                    {/* Joueur 1 */}
                    <tr className="h-[35px]">
                        <td className="bg-gray-50 min-w-[150px] border border-black px-3 whitespace-nowrap overflow-hidden">
                                <span className="text-gray-900 font-semibold text-base truncate block">
                                    {gameState.nomJoueurs.joueur1}
                                </span>
                        </td>
                        <td className="bg-red-600 w-[45px] border border-black">
                            <div className="flex items-center justify-start pl-2">
                                <div className="w-3 h-3 rounded-full bg-white mr-1"></div>
                                <span className="text-white font-bold text-base tabular-nums">
                                        {gameState.setsGagnes.joueur1}
                                    </span>
                            </div>
                        </td>
                        <td className="bg-red-600 w-[45px] border border-black relative">
                            <div className="flex items-center justify-center">
                                    <span className="text-white font-bold text-base tabular-nums">
                                        {gameState.scores.joueur1}
                                    </span>
                            </div>
                            {gameState.gagnant === 'joueur1' && (
                                <div className="absolute -right-8 top-1/2 -translate-y-1/2">
                                    <Crown className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                </div>
                            )}
                        </td>
                    </tr>

                    {/* Joueur 2 */}
                    <tr className="h-[35px]">
                        <td className="bg-gray-50 min-w-[150px] border border-black px-3 whitespace-nowrap overflow-hidden">
                                <span className="text-gray-900 font-semibold text-base truncate block">
                                    {gameState.nomJoueurs.joueur2}
                                </span>
                        </td>
                        <td className="bg-red-600 w-[45px] border border-black">
                            <div className="flex items-center justify-start pl-2">
                                <div className="w-3 h-3 rounded-full bg-yellow-300 mr-1"></div>
                                <span className="text-white font-bold text-base tabular-nums">
                                        {gameState.setsGagnes.joueur2}
                                    </span>
                            </div>
                        </td>
                        <td className="bg-red-600 w-[45px] border border-black relative">
                            <div className="flex items-center justify-center">
                                    <span className="text-white font-bold text-base tabular-nums">
                                        {gameState.scores.joueur2}
                                    </span>
                            </div>
                            {gameState.gagnant === 'joueur2' && (
                                <div className="absolute -right-8 top-1/2 -translate-y-1/2">
                                    <Crown className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                </div>
                            )}
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </main>
    );
};

export default function OverlayPage() {
    return (
        <Suspense fallback={<div>Chargement...</div>}>
            <OverlayContent />
        </Suspense>
    );
}