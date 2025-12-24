'use client';

import { useRouter } from 'next/navigation';
import { useDrivers } from '@/lib/hooks/useDrivers';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

export default function NewDriverPage() {
  const router = useRouter();
  const { createDriver } = useDrivers();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Récupérer la liste des utilisateurs sans conducteur assigné
  const { data: users } = useQuery({
    queryKey: ['users-without-driver'],
    queryFn: async () => {
      const response = await apiClient.get('/users');
      return response.data;
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(e.currentTarget);

    try {
      await createDriver({
        userId: formData.get('userId') as string,
        licenseNumber: formData.get('licenseNumber') as string,
        licenseExpiryDate: formData.get('licenseExpiryDate') as string,
        phoneNumber: formData.get('phoneNumber') as string,
        address: formData.get('address') as string || undefined,
        emergencyContact: formData.get('emergencyContact') as string || undefined,
        emergencyContactPhone: formData.get('emergencyContactPhone') as string || undefined,
      });

      toast.success('Conducteur créé avec succès');
      router.push('/drivers');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la création';
      setError(errorMessage);
      toast.error(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Link href="/drivers">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Nouveau Conducteur</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informations du Conducteur</CardTitle>
          <CardDescription>
            Remplissez les informations pour créer un nouveau conducteur
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Sélection de l'utilisateur */}
            <div className="space-y-2">
              <Label htmlFor="userId">Utilisateur *</Label>
              <Select name="userId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un utilisateur" />
                </SelectTrigger>
                <SelectContent>
                  {users?.map((user: any) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Numéro de permis */}
            <div className="space-y-2">
              <Label htmlFor="licenseNumber">Numéro de Permis *</Label>
              <Input
                id="licenseNumber"
                name="licenseNumber"
                placeholder="ex: ABC123456"
                required
              />
            </div>

            {/* Date d'expiration du permis */}
            <div className="space-y-2">
              <Label htmlFor="licenseExpiryDate">Date d&apos;Expiration du Permis *</Label>
              <Input
                id="licenseExpiryDate"
                name="licenseExpiryDate"
                type="date"
                required
              />
            </div>

            {/* Téléphone */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Téléphone *</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                placeholder="+33 6 12 34 56 78"
                required
              />
            </div>

            {/* Adresse */}
            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Textarea
                id="address"
                name="address"
                placeholder="Adresse complète du conducteur"
                rows={3}
              />
            </div>

            {/* Contact d'urgence */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Contact d&apos;Urgence</Label>
                <Input
                  id="emergencyContact"
                  name="emergencyContact"
                  placeholder="Nom du contact"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyContactPhone">Téléphone d&apos;Urgence</Label>
                <Input
                  id="emergencyContactPhone"
                  name="emergencyContactPhone"
                  type="tel"
                  placeholder="+33 6 12 34 56 78"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex gap-4 justify-end">
              <Link href="/drivers">
                <Button type="button" variant="outline">
                  Annuler
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Création...' : 'Créer le Conducteur'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
