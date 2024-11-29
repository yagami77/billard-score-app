import React from 'react';
import { Button } from '@/app/components/ui/button';
import { Trophy } from 'lucide-react';

// Définition des types des props
interface WinnerDisplayProps {
    gagnant: "joueur1" | "joueur2"; // Clé identifiant le joueur gagnant
    nomJoueurs: {
        joueur1: string;
        joueur2: string;
    }; // Objet contenant les noms des joueurs
    setsGagnes: {
        joueur1: number;
        joueur2: number;
    }; // Score final des joueurs
    onNewGame: () => void; // Fonction appelée pour lancer une nouvelle partie
}

const WinnerDisplay: React.FC<WinnerDisplayProps> = ({
                                                         gagnant,
                                                         nomJoueurs,
                                                         setsGagnes,
                                                         onNewGame,
                                                     }) => {
    if (!gagnant) return null; // Vérification si gagnant est défini

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
