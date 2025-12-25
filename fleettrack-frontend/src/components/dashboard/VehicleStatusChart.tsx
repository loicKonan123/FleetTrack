'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VehicleDto, VehicleStatus } from '@/types/vehicle';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface VehicleStatusChartProps {
  vehicles: VehicleDto[];
}

const COLORS = {
  [VehicleStatus.Available]: '#22c55e', // green
  [VehicleStatus.InUse]: '#3b82f6', // blue
  [VehicleStatus.Maintenance]: '#eab308', // yellow
  [VehicleStatus.OutOfService]: '#ef4444', // red
};

const STATUS_LABELS = {
  [VehicleStatus.Available]: 'Disponible',
  [VehicleStatus.InUse]: 'En service',
  [VehicleStatus.Maintenance]: 'Maintenance',
  [VehicleStatus.OutOfService]: 'Hors service',
};

export function VehicleStatusChart({ vehicles }: VehicleStatusChartProps) {
  const statusCounts = vehicles.reduce((acc, vehicle) => {
    acc[vehicle.status] = (acc[vehicle.status] || 0) + 1;
    return acc;
  }, {} as Record<VehicleStatus, number>);

  const data = Object.entries(statusCounts).map(([status, count]) => ({
    name: STATUS_LABELS[Number(status) as VehicleStatus],
    value: count,
    status: Number(status) as VehicleStatus,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statut des Véhicules</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.status]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
