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
        nbSetsGagnants: string | number;
        scoreParSet: string | number;
    };
    onTempConfigChange: (key: "nbSetsGagnants" | "scoreParSet", value: number) => void;
}

const ConfigDialog: React.FC<ConfigDialogProps> = ({ isOpen, onConfig, tempConfig, onTempConfigChange }) => {
    const isConfigValid =
        Number(tempConfig.nbSetsGagnants) > 0 && Number(tempConfig.scoreParSet) > 0;

    return (
        <AlertDialog open={isOpen}>
            <AlertDialogContent className="bg-white">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-blue-900">
                        Configuration de la partie
                    </AlertDialogTitle>
                    <div className="space-y-4">
                        {/* Input for number of sets */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Nombre de sets gagnants
                            </label>
                            <Input
                                type="number"
                                placeholder="Ex: 2 (pour une partie en 2 sets gagnants)"
                                value={tempConfig.nbSetsGagnants}
                                onChange={(e) => {
                                    const value = parseInt(e.target.value, 10);
                                    if (!isNaN(value) && value > 0) {
                                        onTempConfigChange("nbSetsGagnants", value);
                                    }
                                }}
                                min="1"
                                className="mt-1"
                            />
                        </div>

                        {/* Input for points per set */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Points par set
                            </label>
                            <Input
                                type="number"
                                placeholder="Ex: 60 ou 100"
                                value={tempConfig.scoreParSet}
                                onChange={(e) => {
                                    const value = parseInt(e.target.value, 10);
                                    if (!isNaN(value) && value > 0) {
                                        onTempConfigChange("scoreParSet", value);
                                    }
                                }}
                                min="1"
                                className="mt-1"
                            />
                        </div>
                    </div>
                </AlertDialogHeader>

                {/* Footer with validation */}
                <AlertDialogFooter>
                    <AlertDialogAction
                        onClick={() =>
                            onConfig({
                                nbSetsGagnants: Number(tempConfig.nbSetsGagnants),
                                scoreParSet: Number(tempConfig.scoreParSet),
                            })
                        }
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={!isConfigValid}
                    >
                        Commencer la partie
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default ConfigDialog;