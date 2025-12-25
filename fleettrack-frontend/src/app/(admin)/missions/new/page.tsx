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
    name: '',
    description: '',
    vehicleId: '',
    driverId: '',
    priority: MissionPriority.Medium,
    startDate: '',
    endDate: '',
    estimatedDistance: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await createMission({
        name: formData.name,
        description: formData.description,
        vehicleId: formData.vehicleId,
        driverId: formData.driverId,
        priority: formData.priority,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        estimatedDistance: formData.estimatedDistance,
      });

      toast.success('Mission creee avec succes');
      router.push('/missions');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la creation';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter available vehicles and drivers
  const availableVehicles = vehicles?.items?.filter((v) => v.status === 0) || [];
  const availableDrivers = drivers?.items?.filter((d) => d.status === 0) || [];

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
          <p className="text-muted-foreground">Creer une nouvelle mission de transport</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de la Mission</CardTitle>
          <CardDescription>
            Remplissez les informations necessaires pour creer une nouvelle mission
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Nom de la mission */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name">
                  Nom de la Mission <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Livraison Paris-Lyon"
                  required
                />
              </div>

              {/* Véhicule */}
              <div className="space-y-2">
                <Label htmlFor="vehicleId">
                  Vehicule <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.vehicleId}
                  onValueChange={(value) => setFormData({ ...formData, vehicleId: value })}
                  required
                >
                  <SelectTrigger id="vehicleId">
                    <SelectValue placeholder="Selectionner un vehicule" />
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
                  <p className="text-xs text-red-500">Aucun vehicule disponible</p>
                )}
              </div>

              {/* Conducteur */}
              <div className="space-y-2">
                <Label htmlFor="driverId">
                  Conducteur <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.driverId}
                  onValueChange={(value) => setFormData({ ...formData, driverId: value })}
                  required
                >
                  <SelectTrigger id="driverId">
                    <SelectValue placeholder="Selectionner un conducteur" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDrivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.firstName} {driver.lastName} - {driver.licenseNumber}
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
                  Priorite <span className="text-red-500">*</span>
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
                  Distance Estimee (km) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="estimatedDistance"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.estimatedDistance}
                  onChange={(e) =>
                    setFormData({ ...formData, estimatedDistance: parseFloat(e.target.value) || 0 })
                  }
                  required
                />
              </div>

              {/* Date de Début */}
              <div className="space-y-2">
                <Label htmlFor="startDate">
                  Date de Debut <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              {/* Date de Fin */}
              <div className="space-y-2">
                <Label htmlFor="endDate">Date de Fin</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Details de la mission, instructions speciales..."
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
                {isSubmitting ? 'Creation en cours...' : 'Creer la Mission'}
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
