'use client';

import { useVehicles } from '@/lib/hooks/useVehicles';
import { useDrivers } from '@/lib/hooks/useDrivers';
import { useMissions } from '@/lib/hooks/useMissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, Users, MapPin, AlertCircle } from 'lucide-react';
import { VehicleStatus, MissionStatus } from '@/types';
import { VehicleStatusChart } from '@/components/dashboard/VehicleStatusChart';
import { MissionStatusChart } from '@/components/dashboard/MissionStatusChart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';

export default function DashboardPage() {
  const { vehicles } = useVehicles(1, 100);
  const { drivers } = useDrivers(1, 100);
  const { missions } = useMissions(1, 100);

  const stats = {
    totalVehicles: vehicles?.totalCount || 0,
    availableVehicles: vehicles?.data.filter((v) => v.status === VehicleStatus.Available).length || 0,
    totalDrivers: drivers?.totalCount || 0,
    availableDrivers: drivers?.data.filter((d) => d.isAvailable).length || 0,
    activeMissions: missions?.data.filter((m) => m.status === MissionStatus.InProgress).length || 0,
    pendingMissions: missions?.data.filter((m) => m.status === MissionStatus.Pending).length || 0,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVehicles}</div>
            <p className="text-xs text-muted-foreground">
              {stats.availableVehicles} available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDrivers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.availableDrivers} available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Missions</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeMissions}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingMissions} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">No active alerts</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {vehicles?.data && vehicles.data.length > 0 && (
          <VehicleStatusChart vehicles={vehicles.data} />
        )}

        {missions?.data && missions.data.length > 0 && (
          <MissionStatusChart missions={missions.data} />
        )}
      </div>

      {missions?.data && missions.data.length > 0 && (
        <RecentActivity missions={missions.data} />
      )}

      {(!vehicles?.data || vehicles.data.length === 0) &&
       (!missions?.data || missions.data.length === 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Bienvenue sur FleetTrack</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Votre système complet de gestion de flotte avec suivi GPS en temps réel.
              Utilisez la barre latérale pour naviguer entre les différentes sections.
            </p>
            <p className="text-muted-foreground mt-2">
              Commencez par ajouter des véhicules et des conducteurs pour voir les statistiques.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
