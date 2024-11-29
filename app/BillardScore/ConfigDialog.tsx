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
    onConfig: (config: { nbSetsGagnants: number; scoreParSet: number }) => void;
    tempConfig: {
        nbSetsGagnants: string; // Utilisation cohérente avec les valeurs textuelles
        scoreParSet: string;
    };
    onTempConfigChange: (key: 'nbSetsGagnants' | 'scoreParSet', value: string) => void; // Types stricts
}

const ConfigDialog: React.FC<ConfigDialogProps> = ({ isOpen, onConfig, tempConfig, onTempConfigChange }) => {
    return (
        <AlertDialog open={isOpen}>
            <AlertDialogContent className="bg-white">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-blue-900">Configuration de la partie</AlertDialogTitle>
                    <div className="space-y-4">
                        {/* Nombre de Sets Gagnants */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nombre de sets gagnants</label>
                            <Input
                                type="number"
                                placeholder="Ex: 2 (pour une partie en 2 sets gagnants)"
                                value={tempConfig.nbSetsGagnants}
                                onChange={(e) => {
                                    const value = e.target.value; // Reste une chaîne
                                    if (value === '' || /^[0-9]+$/.test(value)) {
                                        onTempConfigChange('nbSetsGagnants', value);
                                    }
                                }}
                                min="1"
                                className="mt-1"
                            />
                        </div>

                        {/* Points par Set */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Points par set</label>
                            <Input
                                type="number"
                                placeholder="Ex: 60 ou 100"
                                value={tempConfig.scoreParSet}
                                onChange={(e) => {
                                    const value = e.target.value; // Reste une chaîne
                                    if (value === '' || /^[0-9]+$/.test(value)) {
                                        onTempConfigChange('scoreParSet', value);
                                    }
                                }}
                                min="1"
                                className="mt-1"
                            />
                        </div>
                    </div>
                </AlertDialogHeader>

                {/* Footer avec bouton d'action */}
                <AlertDialogFooter>
                    <AlertDialogAction
                        onClick={() =>
                            onConfig({
                                nbSetsGagnants: parseInt(tempConfig.nbSetsGagnants, 10),
                                scoreParSet: parseInt(tempConfig.scoreParSet, 10),
                            })
                        }
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