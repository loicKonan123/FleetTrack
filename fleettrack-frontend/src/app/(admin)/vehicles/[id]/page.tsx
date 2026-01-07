'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useVehicle, useVehicles } from '@/lib/hooks/useVehicles';
import { VehicleStatus, VehicleType } from '@/types/vehicle';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';

const statusLabels: Record<VehicleStatus, string> = {
  [VehicleStatus.Available]: 'Disponible',
  [VehicleStatus.InUse]: 'En utilisation',
  [VehicleStatus.Maintenance]: 'En maintenance',
  [VehicleStatus.OutOfService]: 'Hors service',
};

const statusColors: Record<VehicleStatus, string> = {
  [VehicleStatus.Available]: 'bg-green-500',
  [VehicleStatus.InUse]: 'bg-blue-500',
  [VehicleStatus.Maintenance]: 'bg-yellow-500',
  [VehicleStatus.OutOfService]: 'bg-red-500',
};

const typeLabels: Record<VehicleType, string> = {
  [VehicleType.Car]: 'Voiture',
  [VehicleType.Truck]: 'Camion',
  [VehicleType.Van]: 'Camionnette',
  [VehicleType.Motorcycle]: 'Moto',
  [VehicleType.Bus]: 'Bus',
  [VehicleType.Trailer]: 'Remorque',
  [VehicleType.Other]: 'Autre',
};

export default function VehicleDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: vehicle, isLoading } = useVehicle(id);
  const { updateVehicle } = useVehicles();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    status: VehicleStatus.Available,
    currentFuelLevel: 0,
    mileage: 0,
    nextMaintenanceDate: '',
  });

  useEffect(() => {
    if (vehicle) {
      setFormData({
        brand: vehicle.brand,
        model: vehicle.model,
        status: vehicle.status,
        currentFuelLevel: vehicle.currentFuelLevel || 0,
        mileage: vehicle.mileage || 0,
        nextMaintenanceDate: vehicle.nextMaintenanceDate?.split('T')[0] || '',
      });
    }
  }, [vehicle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await updateVehicle({
        id,
        data: {
          ...formData,
          nextMaintenanceDate: formData.nextMaintenanceDate || undefined,
        },
      });

      setIsEditing(false);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setError(error.response?.data?.message || error.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  if (!vehicle) {
    return <div className="text-center py-8">Vehicule non trouve</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/vehicles">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">
              {vehicle.brand} {vehicle.model}
            </h1>
            <p className="text-muted-foreground">{vehicle.registrationNumber}</p>
          </div>
        </div>

        <Badge className={statusColors[vehicle.status]}>
          {statusLabels[vehicle.status]}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Modifier le Vehicule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Marque</Label>
                {isEditing ? (
                  <Input
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    required
                  />
                ) : (
                  <p className="text-sm">{vehicle.brand}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Modele</Label>
                {isEditing ? (
                  <Input
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    required
                  />
                ) : (
                  <p className="text-sm">{vehicle.model}</p>
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
                    <Badge className={statusColors[vehicle.status]}>
                      {statusLabels[vehicle.status]}
                    </Badge>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Kilometrage</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={formData.mileage}
                    onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) || 0 })}
                    required
                  />
                ) : (
                  <p className="text-sm">{vehicle.mileage?.toLocaleString() ?? 0} km</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Niveau de carburant (%)</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.currentFuelLevel}
                    onChange={(e) => setFormData({ ...formData, currentFuelLevel: parseFloat(e.target.value) || 0 })}
                  />
                ) : (
                  <p className="text-sm">{vehicle.currentFuelLevel}%</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Prochaine maintenance</Label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={formData.nextMaintenanceDate}
                    onChange={(e) => setFormData({ ...formData, nextMaintenanceDate: e.target.value })}
                  />
                ) : (
                  <p className="text-sm">
                    {vehicle.nextMaintenanceDate
                      ? new Date(vehicle.nextMaintenanceDate).toLocaleDateString('fr-FR')
                      : 'Non planifiee'}
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

        <Card>
          <CardHeader>
            <CardTitle>Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Immatriculation</div>
              <div className="font-medium">{vehicle.registrationNumber}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Type de vehicule</div>
              <div className="font-medium">{typeLabels[vehicle.type]}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Annee de fabrication</div>
              <div className="font-medium">{vehicle.year}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Kilometrage total</div>
              <div className="font-medium">{vehicle.mileage?.toLocaleString() ?? 0} km</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Etat actuel</div>
              <div className="font-medium">
                <Badge className={statusColors[vehicle.status]}>
                  {statusLabels[vehicle.status]}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
