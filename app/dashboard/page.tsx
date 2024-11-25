'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useDashboard } from '@/hooks/useDashboard';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Dashboard() {
    const games = useDashboard();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredGames = games.filter(game =>
        game.gameState.nomJoueurs.joueur1.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.gameState.nomJoueurs.joueur2.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            {/* En-tête et Recherche */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                    <h1 className="text-3xl font-bold text-blue-900 mb-4 md:mb-0">
                        Matches en direct ({games.length})
                    </h1>

                    <div className="relative w-full md:w-96">
                        <input
                            type="text"
                            placeholder="Rechercher un joueur..."
                            className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    </div>
                </div>
            </div>

            {/* Grille des matches */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGames.map((game) => (
                    <div key={game.roomCode}
                         className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                        {/* En-tête de la carte */}
                        <div className="bg-blue-600 text-white px-4 py-2 rounded-t-lg">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Table: {game.roomCode}</span>
                                <span className="text-sm">
                                   {formatDistanceToNow(new Date(game.lastUpdate), {
                                       addSuffix: true,
                                       locale: fr
                                   })}
                               </span>
                            </div>
                        </div>

                        <div className="p-4">
                            {/* Score et informations */}
                            <div className="flex justify-between items-center mb-4">
                                {/* Joueur 1 */}
                                <div className="text-center flex-1">
                                    <div className="font-semibold text-lg truncate px-2">
                                        {game.gameState.nomJoueurs.joueur1}
                                    </div>
                                    <div className={`text-3xl font-bold ${game.gameState.activePlayer === 'joueur1' ? 'text-blue-600' : 'text-gray-700'}`}>
                                        {game.gameState.scores.joueur1}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Sets: {game.gameState.setsGagnes.joueur1}
                                    </div>
                                </div>

                                {/* Séparateur */}
                                <div className="flex flex-col items-center px-2">
                                    <span className="text-gray-400 font-bold text-lg">VS</span>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {game.gameState.configPartie.scoreParSet} pts
                                    </div>
                                </div>

                                {/* Joueur 2 */}
                                <div className="text-center flex-1">
                                    <div className="font-semibold text-lg truncate px-2">
                                        {game.gameState.nomJoueurs.joueur2}
                                    </div>
                                    <div className={`text-3xl font-bold ${game.gameState.activePlayer === 'joueur2' ? 'text-blue-600' : 'text-gray-700'}`}>
                                        {game.gameState.scores.joueur2}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Sets: {game.gameState.setsGagnes.joueur2}
                                    </div>
                                </div>
                            </div>

                            {/* Pied de la carte */}
                            <div className="text-sm text-gray-500 text-center border-t pt-2">
                                Match en {game.gameState.configPartie.nbSetsGagnants} set{game.gameState.configPartie.nbSetsGagnants > 1 ? 's' : ''} gagnant{game.gameState.configPartie.nbSetsGagnants > 1 ? 's' : ''}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* État vide */}
            {filteredGames.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-400 text-xl">
                        {searchQuery ? 'Aucun match trouvé' : 'Aucun match en cours'}
                    </div>
                </div>
            )}
        </div>
    );
}