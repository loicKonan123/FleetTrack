'use client';

import dynamic from 'next/dynamic';
import { GpsPositionUpdateDto } from '@/types/gps';

interface MapViewProps {
  positions: Map<string, GpsPositionUpdateDto>;
  trajectories?: Map<string, Array<{ lat: number; lng: number; timestamp: string }>>;
  selectedVehicleId?: string | null;
  onVehicleClick?: (vehicleId: string) => void;
}

// Dynamic import with SSR disabled (Leaflet requires window)
const MapView = dynamic(
  () => import('./MapView').then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-muted rounded-lg">
        <p className="text-muted-foreground">Chargement de la carte...</p>
      </div>
    ),
  }
);

export function MapViewWrapper({ positions, trajectories, selectedVehicleId, onVehicleClick }: MapViewProps) {
  return (
    <MapView
      positions={positions}
      trajectories={trajectories}
      selectedVehicleId={selectedVehicleId}
      onVehicleClick={onVehicleClick}
    />
  );
}
