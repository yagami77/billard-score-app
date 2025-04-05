// src/hooks/useSyncedState.ts

import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';
import { GameState } from '../types/types';

export function useSyncedState(roomCode: string, initialState: GameState) {
    const [state, setState] = useState<GameState>(initialState);
    const [pendingUpdate, setPendingUpdate] = useState(false);

    const { emitStateUpdate } = useSocket(roomCode, (newState: GameState) => {
        console.log('💫 Mise à jour du state depuis le serveur:', newState);
        setState(newState);
    });

    const updateState = useCallback((updates: Partial<GameState>) => {
        setState(prev => {
            const newState = { ...prev, ...updates };
            console.log('🔄 Mise à jour locale du state:', newState);
            setPendingUpdate(true);
            return newState;
        });
    }, []);

    useEffect(() => {
        if (pendingUpdate) {
            const sendUpdate = () => {
                try {
                    console.log('📤 Émission de la mise à jour vers le serveur:', state);
                    emitStateUpdate(state);
                    setPendingUpdate(false);
                } catch (error) {
                    console.error('❌ Erreur lors de l\'émission de la mise à jour:', error);
                    // Réessayer après un délai si l'émission échoue
                    setTimeout(sendUpdate, 1000);
                }
            };

            sendUpdate();
        }
    }, [pendingUpdate, state, emitStateUpdate]);

    return [state, updateState] as const;
}
