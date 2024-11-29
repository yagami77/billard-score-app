import React from 'react';
import { Button } from '@/app/components/ui/button';
import { Trophy } from 'lucide-react';

// Définition des types des props
interface WinnerDisplayProps {
    gagnant: number; // Indice du joueur gagnant (ou changez à string si c'est une clé)
    nomJoueurs: string[]; // Tableau contenant les noms des joueurs
    setsGagnes: {
        joueur1: number;
        joueur2: number;
    }; // Score final des joueurs
    onNewGame: () => void; // Fonction appelée pour une nouvelle partie
}

const WinnerDisplay: React.FC<WinnerDisplayProps> = ({
                                                         gagnant,
                                                         nomJoueurs,
                                                         setsGagnes,
                                                         onNewGame,
                                                     }) => {
    if (gagnant === undefined || gagnant === null) return null; // Vérification supplémentaire

    return (
        <div className="absolute inset-0 bg-blue-900/50 flex items-center justify-center z-10 rounded-lg">
            <div className="bg-white p-6 rounded-lg shadow-xl text-center">
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-blue-900 mb-2">
                    {nomJoueurs[gagnant]} remporte la partie !
                </h3>
                <p className="text-gray-600 mb-4">
                    Score final : {setsGagnes.joueur1} - {setsGagnes.joueur2}
                </p>
                <Button
                    onClick={onNewGame}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    Nouvelle partie
                </Button>
            </div>
        </div>
    );
};

export default WinnerDisplay;
