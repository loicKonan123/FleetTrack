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
import { ArrowLeft, Calendar, Clock, Save, Truck, User } from 'lucide-react';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';

const statusColors: Record<MissionStatus, string> = {
  [MissionStatus.Planned]: 'bg-gray-500',
  [MissionStatus.Assigned]: 'bg-yellow-500',
  [MissionStatus.InProgress]: 'bg-blue-500',
  [MissionStatus.Completed]: 'bg-green-500',
  [MissionStatus.Cancelled]: 'bg-red-500',
};

const statusLabels: Record<MissionStatus, string> = {
  [MissionStatus.Planned]: 'Planifiee',
  [MissionStatus.Assigned]: 'Assignee',
  [MissionStatus.InProgress]: 'En cours',
  [MissionStatus.Completed]: 'Terminee',
  [MissionStatus.Cancelled]: 'Annulee',
};

const priorityColors: Record<MissionPriority, string> = {
  [MissionPriority.Low]: 'bg-gray-500',
  [MissionPriority.Medium]: 'bg-blue-500',
  [MissionPriority.High]: 'bg-orange-500',
  [MissionPriority.Urgent]: 'bg-red-500',
};

const priorityLabels: Record<MissionPriority, string> = {
  [MissionPriority.Low]: 'Faible',
  [MissionPriority.Medium]: 'Moyenne',
  [MissionPriority.High]: 'Haute',
  [MissionPriority.Urgent]: 'Urgente',
};

export default function MissionDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: mission, isLoading } = useMission(id);
  const { updateMission, updateMissionStatus } = useMissions();
  const { vehicles } = useVehicles(1, 100);
  const { drivers } = useDrivers(1, 100);

  const [isEditing, setIsEditing] = useState(false);
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

  useEffect(() => {
    if (mission) {
      setFormData({
        name: mission.name,
        description: mission.description,
        vehicleId: mission.vehicleId,
        driverId: mission.driverId,
        priority: mission.priority,
        startDate: mission.startDate?.slice(0, 16) || '',
        endDate: mission.endDate?.slice(0, 16) || '',
        estimatedDistance: mission.estimatedDistance,
      });
    }
  }, [mission]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await updateMission({
        id,
        data: {
          name: formData.name,
          description: formData.description,
          vehicleId: formData.vehicleId,
          driverId: formData.driverId,
          priority: formData.priority,
          startDate: formData.startDate,
          endDate: formData.endDate || undefined,
          estimatedDistance: formData.estimatedDistance,
        },
      });

      setIsEditing(false);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setError(error.response?.data?.message || error.message || 'Erreur lors de la mise a jour');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus: MissionStatus) => {
    if (confirm(`Etes-vous sur de vouloir changer le statut en "${statusLabels[newStatus]}" ?`)) {
      try {
        await updateMissionStatus({ id, status: newStatus });
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } }; message?: string };
        setError(error.response?.data?.message || error.message || 'Erreur lors du changement de statut');
      }
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  if (!mission) {
    return <div className="text-center py-8">Mission non trouvee</div>;
  }

  const availableVehicles = vehicles?.items?.filter((v) => v.status === 0 || v.id === mission.vehicleId) || [];
  const availableDrivers = drivers?.items?.filter((d) => d.status === 0 || d.id === mission.driverId) || [];

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
            <h1 className="text-3xl font-bold">{mission.name}</h1>
            <p className="text-muted-foreground">{mission.description}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Badge className={statusColors[mission.status]}>
            {statusLabels[mission.status]}
          </Badge>
          <Badge className={priorityColors[mission.priority]}>
            {priorityLabels[mission.priority]}
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
                {/* Nom */}
                <div className="space-y-2 md:col-span-2">
                  <Label>Nom de la Mission</Label>
                  {isEditing ? (
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  ) : (
                    <p className="text-sm">{mission.name}</p>
                  )}
                </div>

                {/* Vehicule */}
                <div className="space-y-2">
                  <Label>Vehicule</Label>
                  {isEditing ? (
                    <Select
                      value={formData.vehicleId}
                      onValueChange={(value) => setFormData({ ...formData, vehicleId: value })}
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
                    <p className="text-sm">{mission.vehicleRegistration}</p>
                  )}
                </div>

                {/* Conducteur */}
                <div className="space-y-2">
                  <Label>Conducteur</Label>
                  {isEditing ? (
                    <Select
                      value={formData.driverId}
                      onValueChange={(value) => setFormData({ ...formData, driverId: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableDrivers.map((driver) => (
                          <SelectItem key={driver.id} value={driver.id}>
                            {driver.firstName} {driver.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm">{mission.driverName}</p>
                  )}
                </div>

                {/* Priorite */}
                <div className="space-y-2">
                  <Label>Priorite</Label>
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
                    <p className="text-sm">{priorityLabels[mission.priority]}</p>
                  )}
                </div>

                {/* Distance */}
                <div className="space-y-2">
                  <Label>Distance Estimee (km)</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.estimatedDistance}
                      onChange={(e) =>
                        setFormData({ ...formData, estimatedDistance: parseFloat(e.target.value) || 0 })
                      }
                      required
                    />
                  ) : (
                    <p className="text-sm">
                      {mission.estimatedDistance} km
                      {mission.actualDistance && (
                        <span className="text-muted-foreground ml-2">
                          (Reel: {mission.actualDistance} km)
                        </span>
                      )}
                    </p>
                  )}
                </div>

                {/* Date de Debut */}
                <div className="space-y-2">
                  <Label>Date de Debut</Label>
                  {isEditing ? (
                    <Input
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  ) : (
                    <p className="text-sm">
                      {mission.startDate ? format(new Date(mission.startDate), 'dd/MM/yyyy HH:mm') : 'N/A'}
                    </p>
                  )}
                </div>

                {/* Date de Fin */}
                <div className="space-y-2">
                  <Label>Date de Fin</Label>
                  {isEditing ? (
                    <Input
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm">
                      {mission.endDate ? format(new Date(mission.endDate), 'dd/MM/yyyy HH:mm') : 'Non definie'}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Description</Label>
                {isEditing ? (
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                ) : (
                  <p className="text-sm">{mission.description || 'Aucune description'}</p>
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
              onClick={() => handleStatusChange(MissionStatus.Planned)}
              disabled={mission.status === MissionStatus.Planned}
            >
              <Clock className="mr-2 h-4 w-4" />
              Planifiee
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleStatusChange(MissionStatus.Assigned)}
              disabled={mission.status === MissionStatus.Assigned}
            >
              <User className="mr-2 h-4 w-4" />
              Assignee
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleStatusChange(MissionStatus.InProgress)}
              disabled={mission.status === MissionStatus.InProgress}
            >
              <Truck className="mr-2 h-4 w-4" />
              En cours
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleStatusChange(MissionStatus.Completed)}
              disabled={mission.status === MissionStatus.Completed}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Terminee
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-red-500"
              onClick={() => handleStatusChange(MissionStatus.Cancelled)}
              disabled={mission.status === MissionStatus.Cancelled}
            >
              Annulee
            </Button>
          </CardContent>
        </Card>

        {/* Informations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Assignation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vehicule</span>
              <span className="font-medium">{mission.vehicleRegistration}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Conducteur</span>
              <span className="font-medium">{mission.driverName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Distance</span>
              <span className="font-medium">{mission.estimatedDistance} km</span>
            </div>
            {mission.actualDistance && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Distance reelle</span>
                <span className="font-medium">{mission.actualDistance} km</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
