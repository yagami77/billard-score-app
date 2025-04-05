import React from 'react';
import { Input } from '@/app/components/ui/input';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/app/components/ui/alert-dialog";

interface ConfigDialogProps {
    isOpen: boolean;
    onConfig: (config: { nbSetsGagnants: number; scoreParSet: number; numeroBillard: number }) => void;
    tempConfig: {
        nbSetsGagnants: number | string;
        scoreParSet: number | string;
        numeroBillard: number | string;
    };
    onTempConfigChange: (key: string, value: number | string) => void;
}

const ConfigDialog: React.FC<ConfigDialogProps> = ({ isOpen, onConfig, tempConfig, onTempConfigChange }) => {
    // Gestion de la modification des champs numériques
    const handleInputChange = (key: string, value: string) => {
        // Permet de supprimer des caractères en autorisant les champs vides temporairement
        if (value === '') {
            onTempConfigChange(key, '');
            return;
        }

        const numValue = parseInt(value);
        if (!isNaN(numValue) && numValue > 0) {
            onTempConfigChange(key, numValue);
        }
    };

    return (
        <AlertDialog open={isOpen}>
            <AlertDialogContent className="bg-white">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-blue-900">Configuration de la partie</AlertDialogTitle>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Numéro de billard</label>
                            <Input
                                type="number"
                                placeholder="Ex: 1, 2, 3..."
                                value={tempConfig.numeroBillard}
                                onChange={(e) => handleInputChange('numeroBillard', e.target.value)}
                                min="1"
                                className="mt-1"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nombre de sets gagnants</label>
                            <Input
                                type="number"
                                placeholder="Ex: 2 (pour une partie en 2 sets gagnants)"
                                value={tempConfig.nbSetsGagnants}
                                onChange={(e) => handleInputChange('nbSetsGagnants', e.target.value)}
                                min="1"
                                className="mt-1"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Points par set</label>
                            <Input
                                type="number"
                                placeholder="Ex: 60 ou 100"
                                value={tempConfig.scoreParSet}
                                onChange={(e) => handleInputChange('scoreParSet', e.target.value)}
                                min="1"
                                className="mt-1"
                            />
                        </div>
                    </div>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction
                        onClick={() => {
                            // S'assurer que les valeurs sont des nombres avant de continuer
                            const nbSets = typeof tempConfig.nbSetsGagnants === 'string'
                                ? parseInt(tempConfig.nbSetsGagnants)
                                : tempConfig.nbSetsGagnants;

                            const scoreSet = typeof tempConfig.scoreParSet === 'string'
                                ? parseInt(tempConfig.scoreParSet)
                                : tempConfig.scoreParSet;

                            const numeroBillard = typeof tempConfig.numeroBillard === 'string'
                                ? parseInt(tempConfig.numeroBillard)
                                : tempConfig.numeroBillard || 1; // Valeur par défaut: 1

                            onConfig({
                                nbSetsGagnants: nbSets,
                                scoreParSet: scoreSet,
                                numeroBillard: numeroBillard
                            });
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={!tempConfig.nbSetsGagnants || !tempConfig.scoreParSet}
                    >
                        Commencer la partie
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default ConfigDialog;