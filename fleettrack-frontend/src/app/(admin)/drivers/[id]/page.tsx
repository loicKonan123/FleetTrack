'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useDriver, useDrivers } from '@/lib/hooks/useDrivers';
import { format } from 'date-fns';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DriverDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: driver, isLoading } = useDriver(params.id);
  const { updateDriver } = useDrivers();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    licenseNumber: '',
    licenseExpiryDate: '',
    phoneNumber: '',
    address: '',
    emergencyContact: '',
    emergencyContactPhone: '',
  });

  useEffect(() => {
    if (driver) {
      setFormData({
        licenseNumber: driver.licenseNumber,
        licenseExpiryDate: driver.licenseExpiryDate.split('T')[0],
        phoneNumber: driver.phoneNumber,
        address: driver.address || '',
        emergencyContact: driver.emergencyContact || '',
        emergencyContactPhone: driver.emergencyContactPhone || '',
      });
    }
  }, [driver]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await updateDriver({
        id: params.id,
        data: {
          userId: driver!.userId,
          ...formData,
        },
      });

      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  if (!driver) {
    return <div className="text-center py-8">Conducteur non trouvé</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/drivers">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">
              {driver.user.firstName} {driver.user.lastName}
            </h1>
            <p className="text-muted-foreground">{driver.user.email}</p>
          </div>
        </div>

        <Badge className={driver.isAvailable ? 'bg-green-500' : 'bg-red-500'}>
          {driver.isAvailable ? 'Disponible' : 'Indisponible'}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Informations du conducteur */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Informations du Conducteur</CardTitle>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                  Modifier
                </Button>
              ) : (
                <Button onClick={() => setIsEditing(false)} variant="ghost" size="sm">
                  Annuler
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Numéro de Permis</Label>
                {isEditing ? (
                  <Input
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    required
                  />
                ) : (
                  <p className="text-sm">{driver.licenseNumber}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Date d&apos;Expiration du Permis</Label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={formData.licenseExpiryDate}
                    onChange={(e) => setFormData({ ...formData, licenseExpiryDate: e.target.value })}
                    required
                  />
                ) : (
                  <p className="text-sm">
                    {format(new Date(driver.licenseExpiryDate), 'dd/MM/yyyy')}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Téléphone</Label>
                {isEditing ? (
                  <Input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    required
                  />
                ) : (
                  <p className="text-sm">{driver.phoneNumber}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Adresse</Label>
                {isEditing ? (
                  <Textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                  />
                ) : (
                  <p className="text-sm">{driver.address || 'Non renseignée'}</p>
                )}
              </div>

              {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {isEditing && (
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer les Modifications'}
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Contact d'urgence */}
        <Card>
          <CardHeader>
            <CardTitle>Contact d&apos;Urgence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nom du Contact</Label>
              {isEditing ? (
                <Input
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                />
              ) : (
                <p className="text-sm">{driver.emergencyContact || 'Non renseigné'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Téléphone d&apos;Urgence</Label>
              {isEditing ? (
                <Input
                  type="tel"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                />
              ) : (
                <p className="text-sm">{driver.emergencyContactPhone || 'Non renseigné'}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Statistiques */}
        <Card>
          <CardHeader>
            <CardTitle>Statistiques</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Créé le</span>
              <span className="font-medium">
                {format(new Date(driver.createdAt), 'dd/MM/yyyy')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dernière mise à jour</span>
              <span className="font-medium">
                {format(new Date(driver.updatedAt), 'dd/MM/yyyy')}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Utilisateur lié */}
        <Card>
          <CardHeader>
            <CardTitle>Utilisateur Lié</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nom d&apos;utilisateur</span>
              <span className="font-medium">{driver.user.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{driver.user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nom complet</span>
              <span className="font-medium">
                {driver.user.firstName} {driver.user.lastName}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
