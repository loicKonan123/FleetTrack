'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useMissions } from '@/lib/hooks/useMissions';
import { MissionPriority, MissionStatus } from '@/types/mission';
import { format } from 'date-fns';
import { Edit, MapPin, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

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

export default function MissionsPage() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filters: Record<string, string> = {};
  if (statusFilter !== 'all') {
    filters.status = statusFilter;
  }
  if (priorityFilter !== 'all') {
    filters.priority = priorityFilter;
  }

  const { missions, isLoading, deleteMission } = useMissions(page, 10, filters);

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette mission ?')) {
      try {
        await deleteMission(id);
        toast.success('Mission supprimée avec succès');
      } catch (error: any) {
        toast.error(`Erreur: ${error.message || 'Erreur lors de la suppression'}`);
      }
    }
  };

  const filteredMissions = missions?.data.filter((mission) => {
    const matchesSearch =
      mission.startLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mission.endLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mission.vehicle?.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mission.driver?.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mission.driver?.user.lastName.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  if (isLoading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Missions</h1>
        <Link href="/missions/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Mission
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Toutes les Missions</CardTitle>
          <div className="flex gap-4 mt-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher par lieu, véhicule ou conducteur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="0">En attente</SelectItem>
                <SelectItem value="1">En cours</SelectItem>
                <SelectItem value="2">Terminée</SelectItem>
                <SelectItem value="3">Annulée</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes priorités</SelectItem>
                <SelectItem value="0">Faible</SelectItem>
                <SelectItem value="1">Moyenne</SelectItem>
                <SelectItem value="2">Haute</SelectItem>
                <SelectItem value="3">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Véhicule</TableHead>
                <TableHead>Conducteur</TableHead>
                <TableHead>Départ → Arrivée</TableHead>
                <TableHead>Date Prévue</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Priorité</TableHead>
                <TableHead>Distance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMissions && filteredMissions.length > 0 ? (
                filteredMissions.map((mission) => (
                  <TableRow key={mission.id}>
                    <TableCell className="font-medium">
                      {mission.vehicle?.registrationNumber || 'N/A'}
                      <div className="text-xs text-muted-foreground">
                        {mission.vehicle?.brand} {mission.vehicle?.model}
                      </div>
                    </TableCell>
                    <TableCell>
                      {mission.driver?.user.firstName} {mission.driver?.user.lastName}
                      <div className="text-xs text-muted-foreground">
                        {mission.driver?.licenseNumber}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="text-sm">{mission.startLocation}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">→ {mission.endLocation}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(mission.scheduledStartTime), 'dd/MM/yyyy HH:mm')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(mission.scheduledEndTime), 'dd/MM/yyyy HH:mm')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[mission.status]}>
                        {MissionStatus[mission.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={priorityColors[mission.priority]}>
                        {MissionPriority[mission.priority]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{mission.estimatedDistance} km</div>
                      {mission.actualDistance && (
                        <div className="text-xs text-muted-foreground">
                          Réel: {mission.actualDistance} km
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link href={`/missions/${mission.id}`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(mission.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Aucune mission trouvée
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {missions && missions.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {missions.pageNumber} sur {missions.totalPages} ({missions.totalCount} missions au total)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(missions.totalPages, p + 1))}
                  disabled={page === missions.totalPages}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
