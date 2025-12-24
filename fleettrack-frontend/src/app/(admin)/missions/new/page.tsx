'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useDrivers } from '@/lib/hooks/useDrivers';
import { useMissions } from '@/lib/hooks/useMissions';
import { useVehicles } from '@/lib/hooks/useVehicles';
import { MissionPriority } from '@/types/mission';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function NewMissionPage() {
  const router = useRouter();
  const { createMission } = useMissions();
  const { vehicles } = useVehicles(1, 100);
  const { drivers } = useDrivers(1, 100);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    vehicleId: '',
    driverId: '',
    priority: MissionPriority.Medium,
    startLocation: '',
    endLocation: '',
    scheduledStartTime: '',
    scheduledEndTime: '',
    estimatedDistance: 0,
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await createMission({
        vehicleId: formData.vehicleId,
        driverId: formData.driverId,
        priority: formData.priority,
        startLocation: formData.startLocation,
        endLocation: formData.endLocation,
        scheduledStartTime: formData.scheduledStartTime,
        scheduledEndTime: formData.scheduledEndTime,
        estimatedDistance: formData.estimatedDistance,
        notes: formData.notes || undefined,
      });

      toast.success('Mission créée avec succès');
      router.push('/missions');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la création';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter available vehicles and drivers
  const availableVehicles = vehicles?.data.filter((v) => v.status === 0) || [];
  const availableDrivers = drivers?.data.filter((d) => d.isAvailable) || [];

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/missions">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Nouvelle Mission</h1>
          <p className="text-muted-foreground">Créer une nouvelle mission de transport</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de la Mission</CardTitle>
          <CardDescription>
            Remplissez les informations nécessaires pour créer une nouvelle mission
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Véhicule */}
              <div className="space-y-2">
                <Label htmlFor="vehicleId">
                  Véhicule <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.vehicleId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, vehicleId: value })
                  }
                  required
                >
                  <SelectTrigger id="vehicleId">
                    <SelectValue placeholder="Sélectionner un véhicule" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.registrationNumber} - {vehicle.brand} {vehicle.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {availableVehicles.length === 0 && (
                  <p className="text-xs text-red-500">Aucun véhicule disponible</p>
                )}
              </div>

              {/* Conducteur */}
              <div className="space-y-2">
                <Label htmlFor="driverId">
                  Conducteur <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.driverId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, driverId: value })
                  }
                  required
                >
                  <SelectTrigger id="driverId">
                    <SelectValue placeholder="Sélectionner un conducteur" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDrivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.user.firstName} {driver.user.lastName} - {driver.licenseNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {availableDrivers.length === 0 && (
                  <p className="text-xs text-red-500">Aucun conducteur disponible</p>
                )}
              </div>

              {/* Priorité */}
              <div className="space-y-2">
                <Label htmlFor="priority">
                  Priorité <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.priority.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, priority: parseInt(value) as MissionPriority })
                  }
                  required
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Faible</SelectItem>
                    <SelectItem value="1">Moyenne</SelectItem>
                    <SelectItem value="2">Haute</SelectItem>
                    <SelectItem value="3">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Distance Estimée */}
              <div className="space-y-2">
                <Label htmlFor="estimatedDistance">
                  Distance Estimée (km) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="estimatedDistance"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.estimatedDistance}
                  onChange={(e) =>
                    setFormData({ ...formData, estimatedDistance: parseFloat(e.target.value) })
                  }
                  required
                />
              </div>

              {/* Lieu de Départ */}
              <div className="space-y-2">
                <Label htmlFor="startLocation">
                  Lieu de Départ <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="startLocation"
                  type="text"
                  value={formData.startLocation}
                  onChange={(e) =>
                    setFormData({ ...formData, startLocation: e.target.value })
                  }
                  placeholder="Adresse de départ"
                  required
                />
              </div>

              {/* Lieu d'Arrivée */}
              <div className="space-y-2">
                <Label htmlFor="endLocation">
                  Lieu d'Arrivée <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="endLocation"
                  type="text"
                  value={formData.endLocation}
                  onChange={(e) =>
                    setFormData({ ...formData, endLocation: e.target.value })
                  }
                  placeholder="Adresse d'arrivée"
                  required
                />
              </div>

              {/* Heure de Début Prévue */}
              <div className="space-y-2">
                <Label htmlFor="scheduledStartTime">
                  Début Prévu <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="scheduledStartTime"
                  type="datetime-local"
                  value={formData.scheduledStartTime}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduledStartTime: e.target.value })
                  }
                  required
                />
              </div>

              {/* Heure de Fin Prévue */}
              <div className="space-y-2">
                <Label htmlFor="scheduledEndTime">
                  Fin Prévue <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="scheduledEndTime"
                  type="datetime-local"
                  value={formData.scheduledEndTime}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduledEndTime: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Instructions spéciales, détails de livraison, etc."
                rows={4}
              />
            </div>

            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Création en cours...' : 'Créer la Mission'}
              </Button>
              <Link href="/missions" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Annuler
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
