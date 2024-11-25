import React from 'react';
import { Button } from '@/app/components/ui/button';  // Chemin corrigé
import { Minus, Delete } from 'lucide-react';

interface NumPadProps {
    joueur: string;
    isActive: boolean;
    tempPoints: string;
    isDeducting: boolean;
    onToggleDeducting: (joueur: string) => void;
    onAddDigit: (joueur: string, digit: string) => void;
    onClear: (joueur: string) => void;
    onApplyPoints: (joueur: string) => void;
}

const NumPad = ({
                    joueur,
                    isActive,
                    tempPoints,
                    isDeducting,
                    onToggleDeducting,
                    onAddDigit,
                    onClear,
                    onApplyPoints
                }: NumPadProps) => {
    return (
        <div className={`mt-4 transition-all duration-200 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
            {/* Points Display */}
            <div className="text-xl font-bold mb-4 min-h-[3rem] bg-gray-50 rounded-lg">
                {tempPoints && (
                    <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200">
                        <span className="text-gray-900 font-bold text-lg">
                            Points à {isDeducting ? 'retirer' : 'ajouter'} : {tempPoints}
                        </span>
                    </div>
                )}
            </div>

            {/* Retirer Button */}
            <div className="flex justify-center gap-4 mb-4">
                <Button
                    onClick={() => onToggleDeducting(joueur)}
                    className={`w-32 ${isDeducting ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold shadow-md`}
                >
                    <Minus className="mr-2 h-4 w-4" />
                    Retirer
                </Button>
            </div>

            {/* NumPad Grid */}
            <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                {/* Numbers 1-9 */}
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <Button
                        key={num}
                        onClick={() => onAddDigit(joueur, num.toString())}
                        className="h-12 text-lg font-bold bg-blue-50 border-2 border-blue-600 text-blue-600 hover:bg-blue-100 shadow-md"
                    >
                        {num}
                    </Button>
                ))}

                {/* Clear, 0, OK */}
                <Button
                    variant="outline"
                    onClick={() => onClear(joueur)}
                    className="h-12 bg-blue-50 border-2 border-blue-600 text-blue-600 hover:bg-blue-100 shadow-md"
                >
                    <Delete className="h-4 w-4" />
                </Button>
                <Button
                    onClick={() => onAddDigit(joueur, "0")}
                    className="h-12 text-lg font-bold bg-blue-50 border-2 border-blue-600 text-blue-600 hover:bg-blue-100 shadow-md"
                >
                    0
                </Button>
                <Button
                    onClick={() => onApplyPoints(joueur)}
                    className={`h-12 text-white font-bold shadow-md ${
                        isDeducting ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                    disabled={!tempPoints}
                >
                    OK
                </Button>
            </div>
        </div>
    );
};

export default NumPad;