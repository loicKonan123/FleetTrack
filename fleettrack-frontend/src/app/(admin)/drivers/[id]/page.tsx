'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDriver, useDrivers } from '@/lib/hooks/useDrivers';
import { DriverStatus } from '@/types/driver';
import { format } from 'date-fns';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';

const statusLabels: Record<DriverStatus, string> = {
  [DriverStatus.Available]: 'Disponible',
  [DriverStatus.OnDuty]: 'En service',
  [DriverStatus.OnBreak]: 'En pause',
  [DriverStatus.OffDuty]: 'Hors service',
  [DriverStatus.OnLeave]: 'En congé',
  [DriverStatus.Inactive]: 'Inactif',
};

const statusColors: Record<DriverStatus, string> = {
  [DriverStatus.Available]: 'bg-green-500',
  [DriverStatus.OnDuty]: 'bg-blue-500',
  [DriverStatus.OnBreak]: 'bg-yellow-500',
  [DriverStatus.OffDuty]: 'bg-gray-500',
  [DriverStatus.OnLeave]: 'bg-orange-500',
  [DriverStatus.Inactive]: 'bg-red-500',
};

export default function DriverDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: driver, isLoading } = useDriver(id);
  const { updateDriver } = useDrivers();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    licenseExpiryDate: '',
    status: DriverStatus.Available,
  });

  useEffect(() => {
    if (driver) {
      setFormData({
        firstName: driver.firstName,
        lastName: driver.lastName,
        email: driver.email,
        phoneNumber: driver.phoneNumber,
        licenseExpiryDate: driver.licenseExpiryDate.split('T')[0],
        status: driver.status,
      });
    }
  }, [driver]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await updateDriver({
        id,
        data: formData,
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
              {driver.firstName} {driver.lastName}
            </h1>
            <p className="text-muted-foreground">{driver.email}</p>
          </div>
        </div>

        <Badge className={statusColors[driver.status]}>
          {statusLabels[driver.status]}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Informations du conducteur */}
        <Card>
          <CardHeader>
            <CardTitle>Informations du Conducteur</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Prénom</Label>
                {isEditing ? (
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                ) : (
                  <p className="text-sm">{driver.firstName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Nom</Label>
                {isEditing ? (
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                ) : (
                  <p className="text-sm">{driver.lastName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                ) : (
                  <p className="text-sm">{driver.email}</p>
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
                <Label>Expiration du permis</Label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={formData.licenseExpiryDate}
                    onChange={(e) => setFormData({ ...formData, licenseExpiryDate: e.target.value })}
                    required
                  />
                ) : (
                  <p className="text-sm">
                    {driver.licenseExpiryDate
                      ? format(new Date(driver.licenseExpiryDate), 'dd/MM/yyyy')
                      : 'N/A'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Statut</Label>
                {isEditing ? (
                  <Select
                    value={formData.status.toString()}
                    onValueChange={(value) => setFormData({ ...formData, status: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm">
                    <Badge className={statusColors[driver.status]}>
                      {statusLabels[driver.status]}
                    </Badge>
                  </p>
                )}
              </div>

              {isEditing ? (
                <div className="flex gap-2">
                  <Button type="submit" disabled={isSubmitting}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    disabled={isSubmitting}
                  >
                    Annuler
                  </Button>
                </div>
              ) : (
                <Button type="button" onClick={() => setIsEditing(true)}>
                  Modifier
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Informations de licence */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de Licence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">N° de permis</div>
              <div className="font-medium">{driver.licenseNumber}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Expiration permis</div>
              <div className="font-medium">
                {driver.licenseExpiryDate
                  ? format(new Date(driver.licenseExpiryDate), 'dd/MM/yyyy')
                  : 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Statut</div>
              <Badge className={statusColors[driver.status]}>
                {statusLabels[driver.status]}
              </Badge>
            </div>
            {driver.currentVehicleRegistration && (
              <div>
                <div className="text-sm text-muted-foreground">Véhicule actuel</div>
                <div className="font-medium">{driver.currentVehicleRegistration}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
