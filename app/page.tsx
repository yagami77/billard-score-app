'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Users, BarChart2, Settings, Layers, PlayCircle, Trash2, AlertTriangle } from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';
import { useDashboardTables } from '@/hooks/useDashboardTables';

export default function HomePage() {
  const router = useRouter();
  const { tables: activeTables, isLoading, deleteTable } = useDashboardTables();
  const [deletingTable, setDeletingTable] = useState(null);
  const [notification, setNotification] = useState(null);

  // Créer une nouvelle partie
  const handleNewGame = () => {
    router.push('/tables/new');
  };

  // Gestion de la suppression
  const handleDeleteClick = (e, tableId) => {
    e.stopPropagation(); // Empêcher la navigation
    setDeletingTable(tableId);
  };

  // Confirmation de suppression
  const confirmDelete = async (e, tableId) => {
    e.stopPropagation(); // Empêcher la navigation
    try {
      await deleteTable(tableId);
      showNotification('success', `Table ${tableId.replace('TABLE_', '')} supprimée avec succès`);
    } catch (error) {
      showNotification('error', `Erreur: ${error.message || 'Échec de la suppression'}`);
    } finally {
      setDeletingTable(null);
    }
  };

  // Annulation de suppression
  const cancelDelete = (e) => {
    e.stopPropagation(); // Empêcher la navigation
    setDeletingTable(null);
  };

  // Afficher une notification
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-900 mb-2 leading-tight">
            Billard 5 Quilles - <span className="inline-block">Live Score</span>
          </h1>
          <p className="text-xl text-gray-600">Système de comptage et d'affichage des scores</p>
        </div>

        {/* Notification */}
        {notification && (
            <div className={`mb-6 p-3 rounded-lg flex items-center ${
                notification.type === 'success'
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {notification.type === 'success' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
              ) : (
                  <AlertTriangle className="h-5 w-5 mr-2" />
              )}
              <span>{notification.message}</span>
            </div>
        )}

        {/* Options principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-blue-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <PlusCircle size={24} />
                Nouvelle partie
              </CardTitle>
              <CardDescription className="text-blue-100">Configurer une nouvelle table</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p>Créez une nouvelle partie en configurant le nombre de sets gagnants et le score par set.</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleNewGame}>
                Démarrer
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-indigo-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <PlayCircle size={24} />
                Contrôle des streams
              </CardTitle>
              <CardDescription className="text-indigo-100">Gérer les overlays OBS</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p>Accédez aux liens d'overlay pour toutes les tables actives pour les intégrer dans OBS.</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={() => router.push('/streams')}>
                Accéder
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-emerald-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <BarChart2 size={24} />
                Tableau de bord
              </CardTitle>
              <CardDescription className="text-emerald-100">Suivi des parties en cours</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p>Visualisez toutes les tables actives et suivez l'évolution des scores en temps réel.</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => router.push('/dashboard')}>
                Ouvrir
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Tables actives */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center">
            <Layers className="mr-2" /> Tables actives
          </h2>

          {isLoading ? (
              <div className="text-center p-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Chargement des tables actives...</p>
              </div>
          ) : activeTables.length === 0 ? (
              <div className="text-center p-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Aucune table active pour le moment</p>
                <Button variant="outline" className="mt-4" onClick={handleNewGame}>
                  Créer une nouvelle partie
                </Button>
              </div>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeTables.map((table) => (
                    <Card
                        key={table.roomCode}
                        className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 relative"
                    >
                      {/* Modal de confirmation pour la suppression */}
                      {deletingTable === table.roomCode && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg z-10 flex items-center justify-center p-4">
                            <div className="bg-white p-4 rounded-lg shadow-lg max-w-xs w-full">
                              <h4 className="font-bold mb-2">Supprimer la table ?</h4>
                              <p className="text-sm text-gray-600 mb-4">
                                Êtes-vous sûr de vouloir supprimer cette table ? Cette action est irréversible.
                              </p>
                              <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => cancelDelete(e)}
                                >
                                  Annuler
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={(e) => confirmDelete(e, table.roomCode)}
                                >
                                  Supprimer
                                </Button>
                              </div>
                            </div>
                          </div>
                      )}

                      <CardHeader className="bg-blue-50 pb-2">
                        <CardTitle className="flex justify-between items-center">
                          <span>Table {table.roomCode.replace('TABLE_', '')}</span>
                          {table.gameState?.gagnant && (
                              <span className="px-2 py-1 bg-yellow-400 text-xs rounded-full text-yellow-800">
                        Terminée
                      </span>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="flex justify-between mb-2">
                          <div className="text-sm font-medium">{table.gameState?.nomJoueurs?.joueur1 || 'Joueur 1'}</div>
                          <div className="text-sm font-medium">{table.gameState?.nomJoueurs?.joueur2 || 'Joueur 2'}</div>
                        </div>

                        <div className="flex justify-between mb-4">
                          <div className="text-2xl font-bold">{table.gameState?.scores?.joueur1 || 0}</div>
                          <div className="text-xs text-gray-500 self-center">
                            Sets: {table.gameState?.setsGagnes?.joueur1 || 0} - {table.gameState?.setsGagnes?.joueur2 || 0}
                          </div>
                          <div className="text-2xl font-bold">{table.gameState?.scores?.joueur2 || 0}</div>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t pt-4">
                        <div className="grid grid-cols-3 gap-2 w-full">
                          <Button
                              variant="outline"
                              className="col-span-1"
                              onClick={() => window.open(`/overlay?table=${table.roomCode}`, '_blank')}
                          >
                            Overlay
                          </Button>
                          <Button
                              className="col-span-1 bg-blue-600 hover:bg-blue-700"
                              onClick={() => router.push(`/table-${table.roomCode.replace('TABLE_', '')}/`)}
                          >
                            Accéder
                          </Button>
                          <Button
                              variant="outline"
                              className="col-span-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={(e) => handleDeleteClick(e, table.roomCode)}
                          >
                            <Trash2 className="h-4 w-4 mr-1 sm:mr-0 lg:mr-1" />
                            <span className="hidden sm:hidden lg:inline">Supprimer</span>
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                ))}
              </div>
          )}
        </div>

        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>BillardScore v1.0 - Live 5 Quilles</p>
        </footer>
      </div>
  );
}