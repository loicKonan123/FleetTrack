'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useDrivers } from '@/lib/hooks/useDrivers';
import { useMission, useMissions } from '@/lib/hooks/useMissions';
import { useVehicles } from '@/lib/hooks/useVehicles';
import { MissionPriority, MissionStatus } from '@/types/mission';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, Clock, MapPin, Save, Truck, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const statusColors: Record<MissionStatus, string> = {
  [MissionStatus.Pending]: 'bg-yellow-500',
  [MissionStatus.InProgress]: 'bg-blue-500',
  [MissionStatus.Completed]: 'bg-green-500',
  [MissionStatus.Cancelled]: 'bg-red-500',
};

const priorityColors: Record<MissionPriority, string> = {
  [MissionPriority.Low]: 'bg-gray-500',
  [MissionPriority.Medium]: 'bg-blue-500',
  [MissionPriority.High]: 'bg-orange-500',
  [MissionPriority.Urgent]: 'bg-red-500',
};

export default function MissionDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: mission, isLoading } = useMission(params.id);
  const { updateMission, updateMissionStatus } = useMissions();
  const { vehicles } = useVehicles(1, 100);
  const { drivers } = useDrivers(1, 100);

  const [isEditing, setIsEditing] = useState(false);
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

  useEffect(() => {
    if (mission) {
      setFormData({
        vehicleId: mission.vehicleId,
        driverId: mission.driverId,
        priority: mission.priority,
        startLocation: mission.startLocation,
        endLocation: mission.endLocation,
        scheduledStartTime: mission.scheduledStartTime.slice(0, 16),
        scheduledEndTime: mission.scheduledEndTime.slice(0, 16),
        estimatedDistance: mission.estimatedDistance,
        notes: mission.notes || '',
      });
    }
  }, [mission]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await updateMission({
        id: params.id,
        data: {
          vehicleId: formData.vehicleId,
          driverId: formData.driverId,
          priority: formData.priority,
          startLocation: formData.startLocation,
          endLocation: formData.endLocation,
          scheduledStartTime: formData.scheduledStartTime,
          scheduledEndTime: formData.scheduledEndTime,
          estimatedDistance: formData.estimatedDistance,
          notes: formData.notes || undefined,
        },
      });

      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus: MissionStatus) => {
    if (confirm(`Êtes-vous sûr de vouloir changer le statut en "${MissionStatus[newStatus]}" ?`)) {
      try {
        await updateMissionStatus({ id: params.id, status: newStatus });
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Erreur lors du changement de statut');
      }
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  if (!mission) {
    return <div className="text-center py-8">Mission non trouvée</div>;
  }

  const availableVehicles = vehicles?.data.filter((v) => v.status === 0 || v.id === mission.vehicleId) || [];
  const availableDrivers = drivers?.data.filter((d) => d.isAvailable || d.id === mission.driverId) || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/missions">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Détails de la Mission</h1>
            <p className="text-muted-foreground">
              {mission.startLocation} → {mission.endLocation}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Badge className={statusColors[mission.status]}>
            {MissionStatus[mission.status]}
          </Badge>
          <Badge className={priorityColors[mission.priority]}>
            {MissionPriority[mission.priority]}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Informations de la Mission */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Informations de la Mission</CardTitle>
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
              <div className="grid gap-4 md:grid-cols-2">
                {/* Véhicule */}
                <div className="space-y-2">
                  <Label>Véhicule</Label>
                  {isEditing ? (
                    <Select
                      value={formData.vehicleId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, vehicleId: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableVehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.registrationNumber} - {vehicle.brand} {vehicle.model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm">
                      {mission.vehicle?.registrationNumber} - {mission.vehicle?.brand}{' '}
                      {mission.vehicle?.model}
                    </p>
                  )}
                </div>

                {/* Conducteur */}
                <div className="space-y-2">
                  <Label>Conducteur</Label>
                  {isEditing ? (
                    <Select
                      value={formData.driverId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, driverId: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableDrivers.map((driver) => (
                          <SelectItem key={driver.id} value={driver.id}>
                            {driver.user.firstName} {driver.user.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm">
                      {mission.driver?.user.firstName} {mission.driver?.user.lastName}
                    </p>
                  )}
                </div>

                {/* Priorité */}
                <div className="space-y-2">
                  <Label>Priorité</Label>
                  {isEditing ? (
                    <Select
                      value={formData.priority.toString()}
                      onValueChange={(value) =>
                        setFormData({ ...formData, priority: parseInt(value) as MissionPriority })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Faible</SelectItem>
                        <SelectItem value="1">Moyenne</SelectItem>
                        <SelectItem value="2">Haute</SelectItem>
                        <SelectItem value="3">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm">{MissionPriority[mission.priority]}</p>
                  )}
                </div>

                {/* Distance */}
                <div className="space-y-2">
                  <Label>Distance Estimée (km)</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.estimatedDistance}
                      onChange={(e) =>
                        setFormData({ ...formData, estimatedDistance: parseFloat(e.target.value) })
                      }
                      required
                    />
                  ) : (
                    <p className="text-sm">
                      {mission.estimatedDistance} km
                      {mission.actualDistance && (
                        <span className="text-muted-foreground ml-2">
                          (Réel: {mission.actualDistance} km)
                        </span>
                      )}
                    </p>
                  )}
                </div>

                {/* Lieu de Départ */}
                <div className="space-y-2">
                  <Label>Lieu de Départ</Label>
                  {isEditing ? (
                    <Input
                      type="text"
                      value={formData.startLocation}
                      onChange={(e) =>
                        setFormData({ ...formData, startLocation: e.target.value })
                      }
                      required
                    />
                  ) : (
                    <p className="text-sm">{mission.startLocation}</p>
                  )}
                </div>

                {/* Lieu d'Arrivée */}
                <div className="space-y-2">
                  <Label>Lieu d'Arrivée</Label>
                  {isEditing ? (
                    <Input
                      type="text"
                      value={formData.endLocation}
                      onChange={(e) =>
                        setFormData({ ...formData, endLocation: e.target.value })
                      }
                      required
                    />
                  ) : (
                    <p className="text-sm">{mission.endLocation}</p>
                  )}
                </div>

                {/* Début Prévu */}
                <div className="space-y-2">
                  <Label>Début Prévu</Label>
                  {isEditing ? (
                    <Input
                      type="datetime-local"
                      value={formData.scheduledStartTime}
                      onChange={(e) =>
                        setFormData({ ...formData, scheduledStartTime: e.target.value })
                      }
                      required
                    />
                  ) : (
                    <p className="text-sm">
                      {format(new Date(mission.scheduledStartTime), 'dd/MM/yyyy HH:mm')}
                      {mission.actualStartTime && (
                        <span className="text-muted-foreground ml-2">
                          (Réel: {format(new Date(mission.actualStartTime), 'dd/MM/yyyy HH:mm')})
                        </span>
                      )}
                    </p>
                  )}
                </div>

                {/* Fin Prévue */}
                <div className="space-y-2">
                  <Label>Fin Prévue</Label>
                  {isEditing ? (
                    <Input
                      type="datetime-local"
                      value={formData.scheduledEndTime}
                      onChange={(e) =>
                        setFormData({ ...formData, scheduledEndTime: e.target.value })
                      }
                      required
                    />
                  ) : (
                    <p className="text-sm">
                      {format(new Date(mission.scheduledEndTime), 'dd/MM/yyyy HH:mm')}
                      {mission.actualEndTime && (
                        <span className="text-muted-foreground ml-2">
                          (Réel: {format(new Date(mission.actualEndTime), 'dd/MM/yyyy HH:mm')})
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>Notes</Label>
                {isEditing ? (
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                ) : (
                  <p className="text-sm">{mission.notes || 'Aucune note'}</p>
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

        {/* Gestion du Statut */}
        <Card>
          <CardHeader>
            <CardTitle>Gestion du Statut</CardTitle>
            <CardDescription>Changer le statut de la mission</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleStatusChange(MissionStatus.Pending)}
              disabled={mission.status === MissionStatus.Pending}
            >
              <Clock className="mr-2 h-4 w-4" />
              En attente
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleStatusChange(MissionStatus.InProgress)}
              disabled={mission.status === MissionStatus.InProgress}
            >
              <MapPin className="mr-2 h-4 w-4" />
              En cours
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleStatusChange(MissionStatus.Completed)}
              disabled={mission.status === MissionStatus.Completed}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Terminée
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-red-500"
              onClick={() => handleStatusChange(MissionStatus.Cancelled)}
              disabled={mission.status === MissionStatus.Cancelled}
            >
              Annulée
            </Button>
          </CardContent>
        </Card>

        {/* Informations Véhicule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Véhicule Assigné
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Immatriculation</span>
              <span className="font-medium">{mission.vehicle?.registrationNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Modèle</span>
              <span className="font-medium">
                {mission.vehicle?.brand} {mission.vehicle?.model}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Année</span>
              <span className="font-medium">{mission.vehicle?.year}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kilométrage</span>
              <span className="font-medium">{mission.vehicle?.currentMileage} km</span>
            </div>
          </CardContent>
        </Card>

        {/* Informations Conducteur */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Conducteur Assigné
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div>
              <div className="text-sm text-muted-foreground">Nom complet</div>
              <div className="font-medium">
                {mission.driver?.user.firstName} {mission.driver?.user.lastName}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Email</div>
              <div className="font-medium">{mission.driver?.user.email}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Téléphone</div>
              <div className="font-medium">{mission.driver?.phoneNumber}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Permis</div>
              <div className="font-medium">{mission.driver?.licenseNumber}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Expiration permis</div>
              <div className="font-medium">
                {mission.driver?.licenseExpiryDate &&
                  format(new Date(mission.driver.licenseExpiryDate), 'dd/MM/yyyy')}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Statut</div>
              <Badge className={mission.driver?.isAvailable ? 'bg-green-500' : 'bg-red-500'}>
                {mission.driver?.isAvailable ? 'Disponible' : 'Indisponible'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Historique */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Historique</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Créée le</span>
              <span className="font-medium">
                {format(new Date(mission.createdAt), 'dd/MM/yyyy HH:mm')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dernière mise à jour</span>
              <span className="font-medium">
                {format(new Date(mission.updatedAt), 'dd/MM/yyyy HH:mm')}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
