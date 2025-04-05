'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useSocket } from '@/hooks/useSocket';
import { RotateCcw, Repeat2 } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
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

// Fonction pour sauvegarder l'état d'une table dans le localStorage
const saveTableState = (tableNumber, state) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(`table_${tableNumber}`, JSON.stringify({
            ...state,
            lastUpdated: new Date().toISOString()
        }));
    }
};

// Fonction pour récupérer l'état d'une table depuis le localStorage
const getTableState = (tableNumber) => {
    if (typeof window !== 'undefined') {
        const savedState = localStorage.getItem(`table_${tableNumber}`);
        if (savedState) {
            return JSON.parse(savedState);
        }
    }
    return null;
};

// Fonction pour vérifier si une table est déjà en cours d'utilisation
const isTableInUse = (tableNumber) => {
    const state = getTableState(tableNumber);
    if (!state) return false;

    // Vérifier si la partie est en cours (scores non nuls ou sets gagnés)
    const hasScores = state.scores?.joueur1 > 0 || state.scores?.joueur2 > 0;
    const hasSets = state.setsGagnes?.joueur1 > 0 || state.setsGagnes?.joueur2 > 0;

    // Considérer une table comme "en cours" pendant 24h max
    const lastUpdate = new Date(state.lastUpdated);
    const now = new Date();
    const hoursDiff = (now - lastUpdate) / (1000 * 60 * 60);
    const isRecent = hoursDiff < 24;

    return (hasScores || hasSets) && isRecent;
};

const BillardScore = ({ initialTableId }) => {
    const router = useRouter();
    const pathname = usePathname();

    const [scores, setScores] = useState({ joueur1: 0, joueur2: 0 });
    const [setsGagnes, setSetsGagnes] = useState({ joueur1: 0, joueur2: 0 });
    const [nomJoueurs, setNomJoueurs] = useState({ joueur1: "Joueur 1", joueur2: "Joueur 2" });
    const [tempPoints, setTempPoints] = useState({ joueur1: "", joueur2: "" });
    const [isDeducting, setIsDeducting] = useState({ joueur1: false, joueur2: false });
    const [activePlayer, setActivePlayer] = useState('joueur1');
    const [configPartie, setConfigPartie] = useState({ nbSetsGagnants: 0, scoreParSet: 0, numeroBillard: 1 });
    const [tempConfig, setTempConfig] = useState({ nbSetsGagnants: "", scoreParSet: "", numeroBillard: "1" });
    const [showConfigDialog, setShowConfigDialog] = useState(true);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [showTableInUseAlert, setShowTableInUseAlert] = useState(false);
    const [tableToReplace, setTableToReplace] = useState(null);
    const [gagnant, setGagnant] = useState(null);
    const [editingNames, setEditingNames] = useState({
        joueur1: false,
        joueur2: false
    });

    const [roomCode, setRoomCode] = useState("");

    // Vérifier si un set est actuellement en cours de jeu et si les scores sont à zéro
    const isNewSetStarting = scores.joueur1 === 0 && scores.joueur2 === 0;
    // Vérifier si des sets ont déjà été gagnés, ce qui indiquerait que la partie a déjà commencé
    const hasGameProgressed = setsGagnes.joueur1 > 0 || setsGagnes.joueur2 > 0;

    // Le bouton de permutation ne devrait être visible que pour un nouveau set et si aucun set n'a été gagné
    const showSwapButton = isNewSetStarting && !hasGameProgressed && !showConfigDialog;

    // Ajoutez cet effet pour initialiser la table à partir de l'ID d'URL
    useEffect(() => {
        // Récupérer les paramètres d'URL (pour les nouvelles tables)
        const searchParams = new URLSearchParams(window.location.search);
        const setsParam = searchParams.get('sets');
        const pointsParam = searchParams.get('points');

        // Si des paramètres sont présents, les utiliser pour la configuration
        if (setsParam && pointsParam && showConfigDialog) {
            setTempConfig(prev => ({
                ...prev,
                nbSetsGagnants: setsParam,
                scoreParSet: pointsParam
            }));
        }

        if (initialTableId) {
            const tableNum = parseInt(initialTableId);
            if (!isNaN(tableNum)) {
                // Vérifier s'il existe une configuration sauvegardée
                const savedState = getTableState(tableNum);

                if (savedState) {
                    // Si oui, charger la configuration et sauter l'écran de configuration
                    setScores(savedState.scores || { joueur1: 0, joueur2: 0 });
                    setSetsGagnes(savedState.setsGagnes || { joueur1: 0, joueur2: 0 });
                    setNomJoueurs(savedState.nomJoueurs || { joueur1: "Joueur 1", joueur2: "Joueur 2" });
                    setActivePlayer(savedState.activePlayer || 'joueur1');
                    setConfigPartie(savedState.configPartie || { nbSetsGagnants: 0, scoreParSet: 0, numeroBillard: tableNum });
                    setGagnant(savedState.gagnant || null);
                    setShowConfigDialog(false); // Sauter l'écran de configuration
                } else {
                    // Sinon, juste pré-remplir le numéro de table
                    setTempConfig(prev => ({
                        ...prev,
                        numeroBillard: tableNum.toString()
                    }));
                    // Mais laisser l'écran de configuration apparaître
                    setShowConfigDialog(true);
                }
            }
        }
    }, [initialTableId]);

    // Extraire le numéro de table de l'URL si présent
    useEffect(() => {
        if (pathname) {
            const match = pathname.match(/\/table-(\d+)/);
            if (match && match[1]) {
                const tableNum = parseInt(match[1]);

                // Mise à jour du numéro de table dans la configuration
                setTempConfig(prev => ({
                    ...prev,
                    numeroBillard: tableNum.toString()
                }));

                // Charger l'état sauvegardé de cette table
                const savedState = getTableState(tableNum);
                if (savedState && !showConfigDialog) {
                    setScores(savedState.scores || { joueur1: 0, joueur2: 0 });
                    setSetsGagnes(savedState.setsGagnes || { joueur1: 0, joueur2: 0 });
                    setNomJoueurs(savedState.nomJoueurs || { joueur1: "Joueur 1", joueur2: "Joueur 2" });
                    setActivePlayer(savedState.activePlayer || 'joueur1');
                    setConfigPartie(savedState.configPartie || { nbSetsGagnants: 0, scoreParSet: 0, numeroBillard: tableNum });
                    setGagnant(savedState.gagnant || null);
                    setShowConfigDialog(false);
                }
            }
        }
    }, [pathname, showConfigDialog]);

    // Mettre à jour l'URL quand le numéro de billard change
    useEffect(() => {
        if (!showConfigDialog && configPartie.numeroBillard) {
            // Mettre à jour l'URL sans rafraîchir la page
            router.push(`/table-${configPartie.numeroBillard}`, { shallow: true });
        }
    }, [configPartie.numeroBillard, showConfigDialog, router]);

    useEffect(() => {
        if (configPartie.numeroBillard) {
            setRoomCode(`TABLE_${configPartie.numeroBillard}`);
        }
    }, [configPartie.numeroBillard]);

    const { emitStateUpdate } = useSocket(roomCode, (newState) => {
        console.log('BillardScore received state:', newState);
    });

    // Sauvegarder l'état dans localStorage quand il change
    useEffect(() => {
        if (!showConfigDialog && configPartie.numeroBillard) {
            const gameState = {
                scores,
                setsGagnes,
                nomJoueurs,
                activePlayer,
                configPartie,
                gagnant
            };

            saveTableState(configPartie.numeroBillard, gameState);

            if (roomCode) {
                emitStateUpdate(gameState);
            }
        }
    }, [scores, setsGagnes, nomJoueurs, activePlayer, configPartie, gagnant, showConfigDialog, emitStateUpdate, roomCode]);

    const swapPlayerNames = () => {
        setNomJoueurs(prevNames => ({
            joueur1: prevNames.joueur2,
            joueur2: prevNames.joueur1
        }));
    };

    const handleConfigChange = (key, value) => {
        setTempConfig(prev => ({ ...prev, [key]: value }));

        // Si le numéro de billard change, vérifier s'il est déjà utilisé
        if (key === 'numeroBillard' && value) {
            const tableNum = parseInt(value);
            if (isTableInUse(tableNum)) {
                setTableToReplace(tableNum);
                setShowTableInUseAlert(true);
            }
        }
    };

    const handleConfigPartie = (config) => {
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
        const currentBillardNumber = configPartie.numeroBillard;
        setScores({ joueur1: 0, joueur2: 0 });
        setSetsGagnes({ joueur1: 0, joueur2: 0 });
        setTempPoints({ joueur1: "", joueur2: "" });
        setIsDeducting({ joueur1: false, joueur2: false });
        setActivePlayer('joueur1');
        setGagnant(null);
        setShowConfigDialog(true);
        setConfigPartie({ nbSetsGagnants: 0, scoreParSet: 0, numeroBillard: currentBillardNumber });
        setTempConfig({ nbSetsGagnants: "", scoreParSet: "", numeroBillard: currentBillardNumber.toString() });

        // Effacer les données sauvegardées pour cette table
        if (typeof window !== 'undefined' && currentBillardNumber) {
            localStorage.removeItem(`table_${currentBillardNumber}`);
        }
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

    return (
        <div className="w-full min-h-screen bg-white p-4 max-w-screen-lg mx-auto">
            <div className="text-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-blue-900">Score Live - Billard 5 Quilles</h1>
                <h2 className="text-lg sm:text-xl text-gray-600">Compteur de points</h2>
                {!showConfigDialog && roomCode && (
                    <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                            Code de table : <span className="font-mono font-bold">{roomCode}</span>
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                            Utilisez ce code dans OBS : <a href={`${process.env.NEXT_PUBLIC_ORIGIN_URL}/overlay?table=${roomCode}`} target="_blank" className="underline hover:text-blue-800 break-all">{`${process.env.NEXT_PUBLIC_ORIGIN_URL}/overlay?table=${roomCode}`}</a>
                        </p>
                        <p className="text-xs text-blue-700 mt-1">
                            Lien direct : <a href={`${process.env.NEXT_PUBLIC_ORIGIN_URL}/table-${configPartie.numeroBillard}/`} className="underline hover:text-blue-800 break-all">{`${process.env.NEXT_PUBLIC_ORIGIN_URL}/table-${configPartie.numeroBillard}/`}</a>
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
                <CardContent className="p-4 sm:p-6">
                    <div className="grid grid-cols-2 gap-4 sm:gap-8 relative">
                        <div className="absolute left-1/2 top-0 h-[calc(100%-4rem)] w-0.5 bg-blue-100 transform -translate-x-1/2"></div>

                        {/* Bouton de permutation affiché uniquement au début d'une nouvelle partie */}
                        {showSwapButton && (
                            <div className="absolute left-1/2 top-0 transform -translate-x-1/2 z-10 -mt-6">
                                <Button
                                    onClick={swapPlayerNames}
                                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4"
                                    size="sm"
                                >
                                    <Repeat2 className="mr-1 h-4 w-4" />
                                    <span className="hidden sm:inline">Permuter les joueurs</span>
                                    <span className="sm:hidden">Permuter</span>
                                </Button>
                            </div>
                        )}

                        {/* Joueur 1 */}
                        <div className="text-center">
                            {editingNames.joueur1 ? (
                                <Input
                                    value={nomJoueurs.joueur1}
                                    onChange={(e) => handleNameChange('joueur1', e.target.value)}
                                    onBlur={() => finishEditingName('joueur1')}
                                    onKeyPress={(e) => e.key === 'Enter' && finishEditingName('joueur1')}
                                    className="text-center text-xl font-bold mb-2 sm:mb-4"
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
                                    <span className="text-lg sm:text-xl font-bold mb-1 cursor-pointer hover:text-blue-600 truncate w-full">
                                        {nomJoueurs.joueur1}
                                    </span>
                                    <span className="text-xs text-gray-500 mb-2 sm:mb-3 opacity-50 group-hover:opacity-100">
                                        Touchez pour modifier
                                    </span>
                                </div>
                            )}
                            <div className="text-4xl sm:text-6xl font-bold my-2 sm:my-4 text-blue-900">{scores.joueur1}</div>
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
                                    className="text-center text-xl font-bold mb-2 sm:mb-4"
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
                                    <span className="text-lg sm:text-xl font-bold mb-1 cursor-pointer hover:text-blue-600 truncate w-full">
                                        {nomJoueurs.joueur2}
                                    </span>
                                    <span className="text-xs text-gray-500 mb-2 sm:mb-3 opacity-50 group-hover:opacity-100">
                                        Touchez pour modifier
                                    </span>
                                </div>
                            )}
                            <div className="text-4xl sm:text-6xl font-bold my-2 sm:my-4 text-blue-900">{scores.joueur2}</div>
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

                    <div className="mt-6 sm:mt-8 text-center">
                        <Button
                            onClick={() => setShowResetConfirm(true)}
                            className="w-32 sm:w-40 bg-red-600 hover:bg-red-700 text-white"
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

            {/* Alerte pour table déjà en cours d'utilisation */}
            <AlertDialog open={showTableInUseAlert} onOpenChange={setShowTableInUseAlert}>
                <AlertDialogContent className="bg-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-orange-600">Table déjà en cours d'utilisation</AlertDialogTitle>
                        <AlertDialogDescription>
                            La table {tableToReplace} a déjà un match en cours. Souhaitez-vous réinitialiser cette table et démarrer une nouvelle partie ?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            className="border-blue-600 text-blue-600"
                            onClick={() => {
                                // Restaurer l'ancien numéro de table si annulé
                                setTempConfig(prev => ({
                                    ...prev,
                                    numeroBillard: configPartie.numeroBillard.toString()
                                }));
                            }}
                        >
                            Annuler
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                // Confirmer l'utilisation de cette table
                                // La sauvegarde locale sera écrasée lors de la configuration
                                setShowTableInUseAlert(false);
                            }}
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                            Réinitialiser la table
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default BillardScore;