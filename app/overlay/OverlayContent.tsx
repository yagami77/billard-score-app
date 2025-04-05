'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSocket } from '../../hooks/useSocket';
import { GameState } from '../../types/types';
import { Crown } from 'lucide-react';

// Fonction pour récupérer l'état d'une table depuis le localStorage
const getTableState = (tableNumber) => {
    if (typeof window !== 'undefined') {
        try {
            const savedState = localStorage.getItem(`table_${tableNumber}`);
            if (savedState) {
                return JSON.parse(savedState);
            }
        } catch (error) {
            console.error('Error loading saved state:', error);
        }
    }
    return null;
};

export default function OverlayClient() {
    const searchParams = useSearchParams();
    const roomCode = searchParams.get('table') || 'default';
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [usingSavedData, setUsingSavedData] = useState(false);
    // Ajout pour les animations
    const [previousScores, setPreviousScores] = useState({ joueur1: 0, joueur2: 0 });
    const [previousSets, setPreviousSets] = useState({ joueur1: 0, joueur2: 0 });
    const [scoreChanged, setScoreChanged] = useState({ joueur1: false, joueur2: false });
    const [setWon, setSetWon] = useState({ joueur1: false, joueur2: false });

    // Tentative de récupération des données depuis le localStorage
    useEffect(() => {
        console.log('Overlay mounted with roomCode:', roomCode);

        // Extraire le numéro de table du roomCode (ex: TABLE_1 -> 1)
        const tableNumber = roomCode.replace('TABLE_', '');

        if (!gameState) {
            // Essayer de charger les données depuis le localStorage
            const savedState = getTableState(tableNumber);
            if (savedState) {
                console.log('Loaded state from localStorage for emergency backup');
                setGameState(savedState);
                setUsingSavedData(true);
            }
        }
    }, [roomCode, gameState]);

    // Utilisation du hook WebSocket
    const {} = useSocket(roomCode, (newState) => {
        console.log('Overlay received state:', newState);

        // Vérifier les changements de score pour les animations
        if (gameState) {
            const scoreJ1Changed = newState.scores.joueur1 !== gameState.scores.joueur1;
            const scoreJ2Changed = newState.scores.joueur2 !== gameState.scores.joueur2;
            const setJ1Won = newState.setsGagnes.joueur1 > gameState.setsGagnes.joueur1;
            const setJ2Won = newState.setsGagnes.joueur2 > gameState.setsGagnes.joueur2;

            if (scoreJ1Changed || scoreJ2Changed) {
                setScoreChanged({
                    joueur1: scoreJ1Changed,
                    joueur2: scoreJ2Changed
                });

                // Réinitialiser après animation
                setTimeout(() => {
                    setScoreChanged({ joueur1: false, joueur2: false });
                }, 1500);
            }

            if (setJ1Won || setJ2Won) {
                setSetWon({
                    joueur1: setJ1Won,
                    joueur2: setJ2Won
                });

                // Réinitialiser après animation
                setTimeout(() => {
                    setSetWon({ joueur1: false, joueur2: false });
                }, 3000);
            }
        }

        setGameState(newState);
        setUsingSavedData(false);
    });

    // Message d'attente si aucune donnée n'est disponible
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
                        <td className={`bg-red-600 w-[45px] border border-black ${setWon.joueur1 ? 'set-won' : ''}`}>
                            <div className="flex items-center justify-start pl-2">
                                <div className="w-3 h-3 rounded-full bg-white mr-1"></div>
                                <span className="text-white font-bold text-base tabular-nums">
                                    {gameState.setsGagnes.joueur1}
                                </span>
                            </div>
                        </td>
                        <td className={`bg-red-600 w-[45px] border border-black relative ${scoreChanged.joueur1 ? 'score-changed' : ''}`}>
                            <div className="flex items-center justify-center">
                                <span className="text-white font-bold text-base tabular-nums">
                                    {gameState.scores.joueur1}
                                </span>
                            </div>
                            {gameState.gagnant === 'joueur1' && (
                                <div className="absolute -right-8 top-1/2 -translate-y-1/2">
                                    <Crown className="w-5 h-5 text-yellow-400 fill-yellow-400"/>
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
                        <td className={`bg-red-600 w-[45px] border border-black ${setWon.joueur2 ? 'set-won' : ''}`}>
                            <div className="flex items-center justify-start pl-2">
                                <div className="w-3 h-3 rounded-full bg-yellow-300 mr-1"></div>
                                <span className="text-white font-bold text-base tabular-nums">
                                    {gameState.setsGagnes.joueur2}
                                </span>
                            </div>
                        </td>
                        <td className={`bg-red-600 w-[45px] border border-black relative ${scoreChanged.joueur2 ? 'score-changed' : ''}`}>
                            <div className="flex items-center justify-center">
                                <span className="text-white font-bold text-base tabular-nums">
                                    {gameState.scores.joueur2}
                                </span>
                            </div>
                            {gameState.gagnant === 'joueur2' && (
                                <div className="absolute -right-8 top-1/2 -translate-y-1/2">
                                    <Crown className="w-5 h-5 text-yellow-400 fill-yellow-400"/>
                                </div>
                            )}
                        </td>
                    </tr>
                    </tbody>
                </table>

                {/* Information sur la configuration de la partie */}
                <div className="mt-2 text-sm text-white bg-gray-800/70 p-1 rounded text-center">
                    {gameState.configPartie?.nbSetsGagnants}
                    {gameState.configPartie?.nbSetsGagnants === 1 ? ' set gagnant en ' : ' sets gagnants en '}
                    {gameState.configPartie?.scoreParSet} points
                </div>
            </div>
        </main>
    );
}