// app/BillardScore/InfosPartie.tsx
import React from 'react';

interface InfosPartieProps {
    configPartie: {
        nbSetsGagnants: number;
        scoreParSet: number;
    };
    setsGagnes: {
        joueur1: number;
        joueur2: number;
    };
    nomJoueurs: {
        joueur1: string;
        joueur2: string;
    };
    roomCode: string;
}

const InfosPartie = ({ configPartie, setsGagnes, nomJoueurs }: InfosPartieProps) => {
    if (!configPartie.scoreParSet) return null;

    return (
        <div className="mt-4 space-y-2">
            <div className="text-4xl text-blue-600 font-bold">
                {configPartie.nbSetsGagnants} set{configPartie.nbSetsGagnants > 1 ? 's' : ''} gagnant{configPartie.nbSetsGagnants > 1 ? 's' : ''} en {configPartie.scoreParSet} points
            </div>
            <div className="text-3xl font-bold text-blue-900">
                Sets: {nomJoueurs.joueur1} {setsGagnes.joueur1} - {setsGagnes.joueur2} {nomJoueurs.joueur2}
            </div>
        </div>
    );
};

export default InfosPartie;