'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MissionDto, MissionStatus, MissionPriority } from '@/types/mission';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MapPin, Clock } from 'lucide-react';

interface RecentActivityProps {
  missions: MissionDto[];
}

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

export function RecentActivity({ missions }: RecentActivityProps) {
  // Sort missions by creation date and take the 5 most recent
  const recentMissions = [...missions]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activité Récente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentMissions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucune activité récente
          </p>
        ) : (
          recentMissions.map((mission) => (
            <div key={mission.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
              <div className="mt-1">
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">
                    {mission.driver?.user.firstName} {mission.driver?.user.lastName}
                  </p>
                  <Badge className={statusColors[mission.status]} variant="secondary">
                    {MissionStatus[mission.status]}
                  </Badge>
                  <Badge className={priorityColors[mission.priority]} variant="secondary">
                    {MissionPriority[mission.priority]}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {mission.startLocation} → {mission.endLocation}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>
                    {format(new Date(mission.scheduledStartTime), 'dd MMM yyyy HH:mm', { locale: fr })}
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
