'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useSocket } from '@/hooks/useSocket';
import { RotateCcw } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../components/ui/alert-dialog";

import NumPad from './NumPad';
import InfosPartie from './InfosPartie';
import WinnerDisplay from './WinnerDisplay';
import ConfigDialog from './ConfigDialog';

const BillardScore = () => {
    const [scores, setScores] = useState({ joueur1: 0, joueur2: 0 });
    const [setsGagnes, setSetsGagnes] = useState({ joueur1: 0, joueur2: 0 });
    const [nomJoueurs, setNomJoueurs] = useState({ joueur1: "Joueur 1", joueur2: "Joueur 2" });
    const [tempPoints, setTempPoints] = useState({ joueur1: "", joueur2: "" });
    const [isDeducting, setIsDeducting] = useState({ joueur1: false, joueur2: false });
    const [activePlayer, setActivePlayer] = useState('joueur1');
    const [configPartie, setConfigPartie] = useState({ nbSetsGagnants: 0, scoreParSet: 0 });
    const [tempConfig, setTempConfig] = useState({ nbSetsGagnants: "", scoreParSet: "" });
    const [showConfigDialog, setShowConfigDialog] = useState(true);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [gagnant, setGagnant] = useState(null);
    const [editingNames, setEditingNames] = useState({
        joueur1: false,
        joueur2: false
    });

    const [roomCode] = useState(() => `TABLE_${Math.random().toString(36).substr(2, 6)}`);

    // Ajout d'un état pour suivre si la mise à jour vient du serveur

    const [isServerUpdate, setIsServerUpdate] = useState<boolean>(false);

    // Configuration Socket avec synchronisation bidirectionnelle
    const { emitStateUpdate } = useSocket(roomCode, (newState) => {

        console.log('💫 Réception mise à jour:', newState);
        // Mise à jour synchronisée des états
        setIsServerUpdate(true); // Marquer que c'est une mise à jour serveur
        if (newState.scores) setScores(newState.scores);
        if (newState.setsGagnes) setSetsGagnes(newState.setsGagnes);
        if (newState.nomJoueurs) setNomJoueurs(newState.nomJoueurs);
        if (newState.activePlayer) setActivePlayer(newState.activePlayer);
        if (newState.configPartie) setConfigPartie(newState.configPartie);

        if ('gagnant' in newState) {
            setGagnant(newState.gagnant);
        }
        setIsServerUpdate(false); // Réinitialiser le marqueur
    });

    // Ajout d'un useEffect dédié pour gérer les changements d'état locaux
    const [localStateChanged, setLocalStateChanged] = useState(false);

// Effet pour marquer les changements d'état locaux
    useEffect(() => {
        if (!isServerUpdate && !showConfigDialog) {
            setLocalStateChanged(true);
        }
    }, [scores, setsGagnes, nomJoueurs, activePlayer, configPartie, gagnant]);

// Effet pour émettre les mises à jour vers le serveur
    useEffect(() => {
        if (localStateChanged && !isServerUpdate && !showConfigDialog) {
            const gameState = {
                scores,
                setsGagnes,
                nomJoueurs,
                activePlayer,
                configPartie,
                gagnant
            };
            console.log('🔄 Émission mise à jour:', gameState);
            emitStateUpdate(gameState);
            setLocalStateChanged(false);
        }
    }, [localStateChanged, isServerUpdate, showConfigDialog]);



    // Émission des mises à jour
    useEffect(() => {
        if (!showConfigDialog && !isServerUpdate) {
            const gameState = {
                scores,
                setsGagnes,
                nomJoueurs,
                activePlayer,
                configPartie,
                gagnant
            };
            console.log('🔄 Émission mise à jour:', gameState);
            emitStateUpdate(gameState);
        }
    }, [scores, setsGagnes, nomJoueurs, activePlayer, configPartie, gagnant, showConfigDialog, emitStateUpdate]);

    const handleConfigChange = (key, value) => {
        setTempConfig(prev => ({ ...prev, [key]: value }));
    };

    const handleConfigPartie = (config) => {
        console.log('📝 Configuration partie:', config);
        setConfigPartie(config);
        setShowConfigDialog(false);
    };

    const addDigit = (joueur, digit) => {
        setActivePlayer(joueur);
        const newValue = tempPoints[joueur] + digit;
        if (newValue.length <= 2) {
            setTempPoints(prev => ({ ...prev, [joueur]: newValue }));
        }
    };

    const applyPoints = (joueur) => {
        const points = parseInt(tempPoints[joueur]) || 0;
        if (points > 0) {
            console.log(`➕ Points ${joueur}:`, points, isDeducting[joueur] ? '(retrait)' : '(ajout)');
            const newScore = Math.max(0, scores[joueur] + (isDeducting[joueur] ? -points : points));

            if (newScore >= configPartie.scoreParSet) {
                setScores(prev => ({ ...prev, [joueur]: configPartie.scoreParSet }));
                const newSetsGagnes = {
                    ...setsGagnes,
                    [joueur]: setsGagnes[joueur] + 1
                };
                setSetsGagnes(newSetsGagnes);

                if (newSetsGagnes[joueur] >= configPartie.nbSetsGagnants) {
                    setGagnant(joueur);
                } else {
                    setTimeout(() => {
                        setScores({ joueur1: 0, joueur2: 0 });
                    }, 1500);
                }
            } else {
                setScores(prev => ({ ...prev, [joueur]: newScore }));
            }

            setTempPoints(prev => ({ ...prev, [joueur]: "" }));
            setIsDeducting(prev => ({ ...prev, [joueur]: false }));
            setActivePlayer(joueur === 'joueur1' ? 'joueur2' : 'joueur1');
        }
    };

    const toggleDeducting = (joueur) => {
        setActivePlayer(joueur);
        setIsDeducting(prev => ({ ...prev, [joueur]: true }));
        setTempPoints(prev => ({ ...prev, [joueur]: "" }));
    };

    const clearTempPoints = (joueur) => {
        setTempPoints(prev => ({ ...prev, [joueur]: "" }));
        setIsDeducting(prev => ({ ...prev, [joueur]: false }));
    };

    const resetScores = () => {
        setScores({ joueur1: 0, joueur2: 0 });
        setSetsGagnes({ joueur1: 0, joueur2: 0 });
        setTempPoints({ joueur1: "", joueur2: "" });
        setIsDeducting({ joueur1: false, joueur2: false });
        setActivePlayer('joueur1');
        setGagnant(null);
        setShowConfigDialog(true);
        setConfigPartie({ nbSetsGagnants: 0, scoreParSet: 0 });
        setTempConfig({ nbSetsGagnants: "", scoreParSet: "" });
    };

    const startEditingName = (joueur) => {
        setEditingNames(prev => ({
            ...prev,
            [joueur]: true
        }));
    };

    const handleNameChange = (joueur, value) => {
        setNomJoueurs(prev => ({
            ...prev,
            [joueur]: value
        }));
    };

    const finishEditingName = (joueur) => {
        setEditingNames(prev => ({
            ...prev,
            [joueur]: false
        }));
        if (!nomJoueurs[joueur].trim()) {
            setNomJoueurs(prev => ({
                ...prev,
                [joueur]: `Joueur ${joueur === 'joueur1' ? '1' : '2'}`
            }));
        }
    };

    const getOverlayUrl = (roomCode: string) => {
        if (typeof window !== 'undefined') {
            const baseUrl = window.location.host.includes('localhost') ?
                'http://localhost:3000' :
                'https://www.5quilles.com';
            return `${baseUrl}/overlay?table=${roomCode}`;
        }
        return `https://www.5quilles.com/overlay?table=${roomCode}`;
    };

    // Rendu du composant
    return (
        <div className="w-full min-h-screen bg-white p-4">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-blue-900 mb-2">Score Live - Billard 5 Quilles</h1>
                <h2 className="text-xl text-gray-600">Compteur de points</h2>
                {!showConfigDialog && (
                    <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                            Code de table : <span className="font-mono font-bold">{roomCode}</span>
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                            Utilisez ce code dans OBS : {getOverlayUrl(roomCode)}
                        </p>
                    </div>
                )}
                <InfosPartie
                    configPartie={configPartie}
                    setsGagnes={setsGagnes}
                    nomJoueurs={nomJoueurs}
                    roomCode={roomCode}
                />
            </div>

            <Card className="mb-4 bg-white rounded-lg shadow-lg border-2 border-blue-200">
                <CardContent className="p-6">
                    <div className="grid grid-cols-2 gap-8 relative">
                        <div className="absolute left-1/2 top-0 h-[calc(100%-4rem)] w-0.5 bg-blue-100 transform -translate-x-1/2"></div>

                        {/* Joueur 1 */}
                        <div className="text-center">
                            {editingNames.joueur1 ? (
                                <Input
                                    value={nomJoueurs.joueur1}
                                    onChange={(e) => handleNameChange('joueur1', e.target.value)}
                                    onBlur={() => finishEditingName('joueur1')}
                                    onKeyPress={(e) => e.key === 'Enter' && finishEditingName('joueur1')}
                                    className="text-center text-xl font-bold mb-4"
                                    autoFocus
                                />
                            ) : (
                                <div
                                    className="relative flex flex-col items-center justify-center group"
                                    role="button"
                                    tabIndex={0}
                                    onTouchStart={() => startEditingName('joueur1')}
                                    onClick={() => startEditingName('joueur1')}
                                >
                                   <span className="text-xl font-bold mb-1 cursor-pointer hover:text-blue-600">
                                       {nomJoueurs.joueur1}
                                   </span>
                                    <span className="text-xs text-gray-500 mb-3 opacity-50 group-hover:opacity-100">
                                       Touchez pour modifier
                                   </span>
                                </div>
                            )}
                            <div className="text-6xl font-bold my-4 text-blue-900">{scores.joueur1}</div>
                            <NumPad
                                joueur="joueur1"
                                isActive={activePlayer === 'joueur1'}
                                tempPoints={tempPoints.joueur1}
                                isDeducting={isDeducting.joueur1}
                                onToggleDeducting={toggleDeducting}
                                onAddDigit={addDigit}
                                onClear={clearTempPoints}
                                onApplyPoints={applyPoints}
                            />
                        </div>

                        {/* Joueur 2 */}
                        <div className="text-center">
                            {editingNames.joueur2 ? (
                                <Input
                                    value={nomJoueurs.joueur2}
                                    onChange={(e) => handleNameChange('joueur2', e.target.value)}
                                    onBlur={() => finishEditingName('joueur2')}
                                    onKeyPress={(e) => e.key === 'Enter' && finishEditingName('joueur2')}
                                    className="text-center text-xl font-bold mb-4"
                                    autoFocus
                                />
                            ) : (
                                <div
                                    className="relative flex flex-col items-center justify-center group"
                                    role="button"
                                    tabIndex={0}
                                    onTouchStart={() => startEditingName('joueur2')}
                                    onClick={() => startEditingName('joueur2')}
                                >
                                   <span className="text-xl font-bold mb-1 cursor-pointer hover:text-blue-600">
                                       {nomJoueurs.joueur2}
                                   </span>
                                    <span className="text-xs text-gray-500 mb-3 opacity-50 group-hover:opacity-100">
                                       Touchez pour modifier
                                   </span>
                                </div>
                            )}
                            <div className="text-6xl font-bold my-4 text-blue-900">{scores.joueur2}</div>
                            <NumPad
                                joueur="joueur2"
                                isActive={activePlayer === 'joueur2'}
                                tempPoints={tempPoints.joueur2}
                                isDeducting={isDeducting.joueur2}
                                onToggleDeducting={toggleDeducting}
                                onAddDigit={addDigit}
                                onClear={clearTempPoints}
                                onApplyPoints={applyPoints}
                            />
                        </div>

                        {gagnant && (
                            <WinnerDisplay
                                gagnant={gagnant}
                                nomJoueurs={nomJoueurs}
                                setsGagnes={setsGagnes}
                                onNewGame={() => setShowResetConfirm(true)}
                            />
                        )}
                    </div>

                    <div className="mt-8 text-center">
                        <Button
                            onClick={() => setShowResetConfirm(true)}
                            className="w-40 bg-red-600 hover:bg-red-700 text-white"
                        >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Réinitialiser
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="text-center text-blue-900 text-sm mt-4">
                BillardScore v1.0 - Live 5 Quilles
            </div>

            <ConfigDialog
                isOpen={showConfigDialog}
                onConfig={handleConfigPartie}
                tempConfig={tempConfig}
                onTempConfigChange={handleConfigChange}
            />

            <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
                <AlertDialogContent className="bg-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-blue-900">Réinitialiser la partie ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action va remettre à zéro tous les scores et les sets. Cette action est irréversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-blue-600 text-blue-600">Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                resetScores();
                                setShowResetConfirm(false);
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Réinitialiser
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default BillardScore;