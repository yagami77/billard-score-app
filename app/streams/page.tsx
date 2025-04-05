'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useDashboardTables } from '@/hooks/useDashboardTables';
import Link from 'next/link';

export default function StreamsControlPage() {
    const router = useRouter();
    const { tables: activeTables, isLoading, deleteTable } = useDashboardTables();
    const [deletingTable, setDeletingTable] = useState(null);
    const [notification, setNotification] = useState(null);

    // Gestionnaire de suppression
    const handleDeleteClick = (roomCode) => {
        setDeletingTable(roomCode);
    };

    // Confirmation de suppression
    const confirmDelete = async (roomCode) => {
        try {
            await deleteTable(roomCode);
            showNotification('success', `Table ${roomCode} supprimée avec succès`);
        } catch (error) {
            showNotification('error', error.message || 'Erreur lors de la suppression');
        } finally {
            setDeletingTable(null);
        }
    };

    // Annulation de suppression
    const cancelDelete = () => {
        setDeletingTable(null);
    };

    // Afficher une notification temporaire
    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    // Copier le lien d'overlay
    const copyOverlayLink = (roomCode) => {
        const url = `${process.env.NEXT_PUBLIC_ORIGIN_URL}/overlay?table=${roomCode}`;
        navigator.clipboard.writeText(url);
        showNotification('success', 'Lien copié dans le presse-papier');
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Bouton Retour */}
            <Button
                variant="outline"
                className="mb-6"
                onClick={() => router.push('/')}
            >
                <ArrowLeft className="mr-2 h-4 w-4" /> Retour à l'accueil
            </Button>

            <h1 className="text-3xl font-bold mb-6">Contrôle des streams</h1>

            {/* Notification */}
            {notification && (
                <div
                    className={`mb-4 p-3 rounded ${
                        notification.type === 'success'
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-red-100 text-red-800 border border-red-200'
                    }`}
                >
                    {notification.message}
                </div>
            )}

            {isLoading ? (
                <div className="text-center p-8 bg-gray-100 rounded-lg">
                    <p>Chargement des tables actives...</p>
                </div>
            ) : activeTables.length === 0 ? (
                <div className="text-center p-8 bg-gray-100 rounded-lg">
                    <p className="mb-4">Aucune table active pour le moment</p>
                    <Button
                        onClick={() => router.push('/tables/new')}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Créer une nouvelle table
                    </Button>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {activeTables.map(table => (
                        <div key={table.roomCode} className="relative border rounded-lg overflow-hidden bg-white shadow-md">
                            <div className="bg-blue-900 text-white p-3">
                                <h2 className="font-bold">{table.roomCode}</h2>
                                <p className="text-sm">{table.gameState?.nomJoueurs?.joueur1 || 'Joueur 1'} vs {table.gameState?.nomJoueurs?.joueur2 || 'Joueur 2'}</p>
                            </div>

                            <div className="p-4">
                                <div className="flex justify-between mb-2">
                                    <span>Sets:</span>
                                    <span>{table.gameState?.setsGagnes?.joueur1 || 0} - {table.gameState?.setsGagnes?.joueur2 || 0}</span>
                                </div>
                                <div className="flex justify-between mb-4">
                                    <span>Points:</span>
                                    <span>{table.gameState?.scores?.joueur1 || 0} - {table.gameState?.scores?.joueur2 || 0}</span>
                                </div>

                                <div className="space-y-3 mt-4">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            readOnly
                                            value={`${process.env.NEXT_PUBLIC_ORIGIN_URL}/overlay?table=${table.roomCode}`}
                                            className="w-full p-2 border rounded pr-10 bg-gray-50 font-mono text-sm"
                                        />
                                        <button
                                            className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-blue-600"
                                            onClick={() => copyOverlayLink(table.roomCode)}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <a
                                            href={`${process.env.NEXT_PUBLIC_ORIGIN_URL}/overlay?table=${table.roomCode}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                                            </svg>
                                            Ouvrir
                                        </a>
                                        <button
                                            onClick={() => handleDeleteClick(table.roomCode)}
                                            className="flex items-center justify-center gap-1 border border-red-300 text-red-600 px-3 py-2 rounded hover:bg-red-50"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Supprimer
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Modal de confirmation de suppression */}
                            {deletingTable === table.roomCode && (
                                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-lg z-10">
                                    <div className="bg-white p-5 rounded-lg shadow-lg max-w-xs w-full">
                                        <h4 className="font-bold text-lg mb-3">Confirmer la suppression</h4>
                                        <p className="mb-4 text-gray-600">
                                            Êtes-vous sûr de vouloir supprimer la table {table.roomCode} ? Cette action est irréversible.
                                        </p>
                                        <div className="flex justify-end space-x-3">
                                            <button
                                                onClick={cancelDelete}
                                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                                            >
                                                Annuler
                                            </button>
                                            <button
                                                onClick={() => confirmDelete(table.roomCode)}
                                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
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
            )}
        </div>
    );
}