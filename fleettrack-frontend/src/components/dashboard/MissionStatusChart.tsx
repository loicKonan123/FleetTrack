'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MissionDto, MissionStatus } from '@/types/mission';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MissionStatusChartProps {
  missions: MissionDto[];
}

const STATUS_LABELS = {
  [MissionStatus.Planned]: 'Planifiee',
  [MissionStatus.Assigned]: 'Assignee',
  [MissionStatus.InProgress]: 'En cours',
  [MissionStatus.Completed]: 'Terminee',
  [MissionStatus.Cancelled]: 'Annulee',
};

const STATUS_COLORS = {
  [MissionStatus.Planned]: '#6b7280', // gray
  [MissionStatus.Assigned]: '#eab308', // yellow
  [MissionStatus.InProgress]: '#3b82f6', // blue
  [MissionStatus.Completed]: '#22c55e', // green
  [MissionStatus.Cancelled]: '#ef4444', // red
};

export function MissionStatusChart({ missions }: MissionStatusChartProps) {
  const statusCounts = missions.reduce((acc, mission) => {
    acc[mission.status] = (acc[mission.status] || 0) + 1;
    return acc;
  }, {} as Record<MissionStatus, number>);

  const data = Object.entries(statusCounts).map(([status, count]) => ({
    name: STATUS_LABELS[Number(status) as MissionStatus],
    count,
    fill: STATUS_COLORS[Number(status) as MissionStatus],
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statut des Missions</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" name="Nombre de missions" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
