'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MissionDto, MissionStatus, MissionPriority } from '@/types/mission';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Clock, FileText } from 'lucide-react';

interface RecentActivityProps {
  missions: MissionDto[];
}

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

const priorityLabels: Record<MissionPriority, string> = {
  [MissionPriority.Low]: 'Faible',
  [MissionPriority.Medium]: 'Moyenne',
  [MissionPriority.High]: 'Haute',
  [MissionPriority.Urgent]: 'Urgente',
};

const priorityColors: Record<MissionPriority, string> = {
  [MissionPriority.Low]: 'bg-gray-500',
  [MissionPriority.Medium]: 'bg-blue-500',
  [MissionPriority.High]: 'bg-orange-500',
  [MissionPriority.Urgent]: 'bg-red-500',
};

const formatSafeDate = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return 'Date non disponible';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Date invalide';
    return format(date, 'dd MMM yyyy HH:mm', { locale: fr });
  } catch {
    return 'Date invalide';
  }
};

export function RecentActivity({ missions }: RecentActivityProps) {
  // Sort missions by start date and take the 5 most recent
  const recentMissions = [...missions]
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activite Recente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentMissions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucune activite recente
          </p>
        ) : (
          recentMissions.map((mission) => (
            <div key={mission.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
              <div className="mt-1">
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">
                    {mission.name}
                  </p>
                  <Badge className={statusColors[mission.status]} variant="secondary">
                    {statusLabels[mission.status]}
                  </Badge>
                  <Badge className={priorityColors[mission.priority]} variant="secondary">
                    {priorityLabels[mission.priority]}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {mission.driverName} - {mission.vehicleRegistration}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>
                    {formatSafeDate(mission.startDate)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
