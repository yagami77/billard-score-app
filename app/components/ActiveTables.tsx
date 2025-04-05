'use client';

import React, { useState } from 'react';
import { Trash2, ExternalLink } from 'lucide-react';
import { useDashboardTables } from '@/hooks/useDashboardTables';
import Link from 'next/link';

export default function ActiveTables() {
    const { tables, isLoading, deleteTable } = useDashboardTables();
    const [deletingTable, setDeletingTable] = useState(null);
    const [showAlert, setShowAlert] = useState(null);

    // Gestionnaire de suppression
    const handleDeleteClick = (roomCode) => {
        setDeletingTable(roomCode);
    };

    // Confirmation de suppression
    const confirmDelete = async (roomCode) => {
        try {
            await deleteTable(roomCode);
            setShowAlert({
                type: 'success',
                message: `Table ${roomCode} supprimée avec succès`
            });
        } catch (error) {
            setShowAlert({
                type: 'error',
                message: error.message || 'Erreur lors de la suppression'
            });
        } finally {
            setDeletingTable(null);
            setTimeout(() => setShowAlert(null), 3000);
        }
    };

    // Annulation de suppression
    const cancelDelete = () => {
        setDeletingTable(null);
    };

    if (isLoading) {
        return (
            <div className="text-center p-8 bg-gray-100 rounded-lg">
                <p>Chargement des tables actives...</p>
            </div>
        );
    }

    if (tables.length === 0) {
        return (
            <div className="text-center p-8 bg-gray-100 rounded-lg">
                <p className="mb-4">Aucune table active pour le moment</p>
                <Link href="/tables/new" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Créer une nouvelle table
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h2 className="text-xl font-bold text-blue-900">Tables actives</h2>
            </div>

            {/* Alerte de notification */}
            {showAlert && (
                <div className={`p-3 rounded-lg ${showAlert.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {showAlert.message}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tables.map((table) => (
                    <div key={table.roomCode} className="relative border rounded-lg overflow-hidden bg-white shadow-md">
                        {/* En-tête */}
                        <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
                            <h3 className="font-medium">Table: {table.roomCode}</h3>
                            {table.gameState?.gagnant && (
                                <span className="bg-yellow-400 text-gray-900 px-2 py-0.5 rounded-full text-xs font-bold">
                                    Terminé
                                </span>
                            )}
                        </div>

                        {/* Corps */}
                        <div className="p-4">
                            {/* Scores */}
                            <div className="flex justify-between items-center mb-4">
                                {/* Joueur 1 */}
                                <div className="text-center flex-1">
                                    <div className="font-semibold truncate">
                                        {table.gameState?.nomJoueurs?.joueur1 || 'Joueur 1'}
                                    </div>
                                    <div className="text-3xl font-bold">
                                        {table.gameState?.scores?.joueur1 || 0}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Sets: {table.gameState?.setsGagnes?.joueur1 || 0}
                                    </div>
                                </div>

                                {/* Séparateur */}
                                <div className="flex-shrink-0 px-2">
                                    <div className="text-gray-400 font-medium">VS</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        Sets: {table.gameState?.configPartie?.nbSetsGagnants || 1}
                                    </div>
                                </div>

                                {/* Joueur 2 */}
                                <div className="text-center flex-1">
                                    <div className="font-semibold truncate">
                                        {table.gameState?.nomJoueurs?.joueur2 || 'Joueur 2'}
                                    </div>
                                    <div className="text-3xl font-bold">
                                        {table.gameState?.scores?.joueur2 || 0}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Sets: {table.gameState?.setsGagnes?.joueur2 || 0}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="grid grid-cols-2 gap-2 mt-4">
                                <a
                                    href={`/overlay?table=${table.roomCode}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center text-center p-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Overlay
                                </a>
                                <Link
                                    href={`/streams?table=${table.roomCode}`}
                                    className="flex items-center justify-center text-center p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                >
                                    Accéder
                                </Link>
                                <button
                                    onClick={() => handleDeleteClick(table.roomCode)}
                                    className="col-span-2 flex items-center justify-center gap-1 text-center p-2 border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors mt-2"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Supprimer
                                </button>
                            </div>
                        </div>

                        {/* Modal de confirmation */}
                        {deletingTable === table.roomCode && (
                            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-lg">
                                <div className="bg-white p-5 rounded-lg shadow-lg max-w-xs w-full mx-4">
                                    <h4 className="font-bold text-lg mb-3">Supprimer la table ?</h4>
                                    <p className="text-gray-600 mb-4">
                                        Êtes-vous sûr de vouloir supprimer cette table ? Cette action est irréversible.
                                    </p>
                                    <div className="flex justify-end gap-3">
                                        <button
                                            onClick={cancelDelete}
                                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded font-medium"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            onClick={() => confirmDelete(table.roomCode)}
                                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium"
                                        >
                                            Supprimer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}