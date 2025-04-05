// types/types.ts

export interface GameState {
    scores: {
        joueur1: number;
        joueur2: number;
    };
    setsGagnes: {
        joueur1: number;
        joueur2: number;
    };
    nomJoueurs: {
        joueur1: string;
        joueur2: string;
    };
    activePlayer: string;
    configPartie: {
        nbSetsGagnants: number;
        scoreParSet: number;
    };
    gagnant: string | null;
}

export interface Session {
    id: string;
    roomCode: string;
    gameState: GameState;
    createdAt: Date;
    updatedAt: Date;
}