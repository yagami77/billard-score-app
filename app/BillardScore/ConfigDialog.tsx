import React from 'react';
import { Input } from '@/app/components/ui/input';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/app/components/ui/alert-dialog";

interface ConfigDialogProps {
    isOpen: boolean;
    onConfig: (config: { nbSetsGagnants: number; scoreParSet: number }) => void;
    tempConfig: {
        nbSetsGagnants: number | string;
        scoreParSet: number | string;
    };
    onTempConfigChange: (key: string, value: number) => void;
}

const ConfigDialog: React.FC<ConfigDialogProps> = ({ isOpen, onConfig, tempConfig, onTempConfigChange }) => {
    return (
        <AlertDialog open={isOpen}>
            <AlertDialogContent className="bg-white">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-blue-900">Configuration de la partie</AlertDialogTitle>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nombre de sets gagnants</label>
                            <Input
                                type="number"
                                placeholder="Ex: 2 (pour une partie en 2 sets gagnants)"
                                value={tempConfig.nbSetsGagnants}
                                onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    if (!isNaN(value) && value > 0) {
                                        onTempConfigChange('nbSetsGagnants', value);
                                    }
                                }}
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
                                onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    if (!isNaN(value) && value > 0) {
                                        onTempConfigChange('scoreParSet', value);
                                    }
                                }}
                                min="1"
                                className="mt-1"
                            />
                        </div>
                    </div>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction
                        onClick={() => onConfig(tempConfig as { nbSetsGagnants: number; scoreParSet: number })}
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