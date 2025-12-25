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
import { Edit, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

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
    if (confirm('Etes-vous sur de vouloir supprimer cette mission ?')) {
      try {
        await deleteMission(id);
        toast.success('Mission supprimee avec succes');
      } catch (error: unknown) {
        const err = error as { message?: string };
        toast.error(`Erreur: ${err.message || 'Erreur lors de la suppression'}`);
      }
    }
  };

  const filteredMissions = missions?.items?.filter((mission) => {
    const matchesSearch =
      mission.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mission.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mission.vehicleRegistration?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mission.driverName?.toLowerCase().includes(searchTerm.toLowerCase());

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
                placeholder="Rechercher par nom, vehicule ou conducteur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-45">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="0">Planifiee</SelectItem>
                <SelectItem value="1">Assignee</SelectItem>
                <SelectItem value="2">En cours</SelectItem>
                <SelectItem value="3">Terminee</SelectItem>
                <SelectItem value="4">Annulee</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-45">
                <SelectValue placeholder="Priorite" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes priorites</SelectItem>
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
                <TableHead>Nom</TableHead>
                <TableHead>Vehicule</TableHead>
                <TableHead>Conducteur</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Priorite</TableHead>
                <TableHead>Distance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMissions && filteredMissions.length > 0 ? (
                filteredMissions.map((mission) => (
                  <TableRow key={mission.id}>
                    <TableCell className="font-medium">
                      {mission.name}
                      <div className="text-xs text-muted-foreground">
                        {mission.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      {mission.vehicleRegistration || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {mission.driverName || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {mission.startDate ? format(new Date(mission.startDate), 'dd/MM/yyyy HH:mm') : 'N/A'}
                      </div>
                      {mission.endDate && (
                        <div className="text-xs text-muted-foreground">
                          Fin: {format(new Date(mission.endDate), 'dd/MM/yyyy HH:mm')}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[mission.status]}>
                        {statusLabels[mission.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={priorityColors[mission.priority]}>
                        {priorityLabels[mission.priority]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{mission.estimatedDistance} km</div>
                      {mission.actualDistance && (
                        <div className="text-xs text-muted-foreground">
                          Reel: {mission.actualDistance} km
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
                    Aucune mission trouvee
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
                  Precedent
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
