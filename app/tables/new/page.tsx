'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { ArrowLeft } from 'lucide-react';
export default function NewTablePage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        tableNumber: "",
        setsToWin: "",
        pointsPerSet: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation de base
        if (!formData.tableNumber || !formData.setsToWin || !formData.pointsPerSet) {
            alert("Veuillez remplir tous les champs");
            return;
        }

        // Rediriger vers la table avec les paramètres dans l'URL
        router.push(`/table-${formData.tableNumber}/?sets=${formData.setsToWin}&points=${formData.pointsPerSet}`);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <Button
                variant="outline"
                className="mb-6"
                onClick={() => router.push('/')}
            >
                <ArrowLeft className="mr-2 h-4 w-4" /> Retour à l'accueil
            </Button>

            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center text-blue-900">
                        Configurer une nouvelle partie
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="tableNumber">Numéro de table</Label>
                            <Input
                                id="tableNumber"
                                name="tableNumber"
                                type="number"
                                required
                                placeholder="Ex: 1, 2, 3..."
                                value={formData.tableNumber}
                                onChange={handleChange}
                                min="1"
                                max="99"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="setsToWin">Nombre de sets gagnants</Label>
                            <Input
                                id="setsToWin"
                                name="setsToWin"
                                type="number"
                                required
                                placeholder="Ex: 2, 3, 5..."
                                value={formData.setsToWin}
                                onChange={handleChange}
                                min="1"
                                max="10"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="pointsPerSet">Points par set</Label>
                            <Input
                                id="pointsPerSet"
                                name="pointsPerSet"
                                type="number"
                                required
                                placeholder="Ex: 60, 100..."
                                value={formData.pointsPerSet}
                                onChange={handleChange}
                                min="1"
                                max="200"
                            />
                        </div>

                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                            Créer la partie
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="text-center text-gray-500 text-sm">
                    Cette configuration sera utilisée pour initialiser la partie
                </CardFooter>
            </Card>
        </div>
    );
}