'use client';

import { useState } from 'react';
import { MapView } from '@/components/tracking/MapView';
import { useGpsTracking } from '@/lib/hooks/useGpsTracking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Navigation, Signal, SignalHigh, SignalLow, Gauge, Compass } from 'lucide-react';
import { format } from 'date-fns';

export default function TrackingPage() {
  const { isConnected, vehiclePositions, latestPositions } = useGpsTracking();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  const selectedPosition = selectedVehicleId
    ? vehiclePositions.get(selectedVehicleId)
    : null;

  const getSignalIcon = () => {
    if (!isConnected) return <Signal className="h-4 w-4" />;
    if (latestPositions.length > 5) return <SignalHigh className="h-4 w-4" />;
    if (latestPositions.length > 0) return <Signal className="h-4 w-4" />;
    return <SignalLow className="h-4 w-4" />;
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Sidebar with vehicle list */}
      <Card className="w-80 overflow-y-auto flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Suivi en Temps Réel
          </CardTitle>
          <div className="flex items-center gap-2">
            {getSignalIcon()}
            <Badge variant={isConnected ? 'default' : 'destructive'}>
              {isConnected ? 'Connecté' : 'Déconnecté'}
            </Badge>
            {isConnected && (
              <span className="text-xs text-muted-foreground">
                {latestPositions.length} véhicule(s)
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 space-y-2 overflow-y-auto">
          {latestPositions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Aucun véhicule en ligne</p>
              <p className="text-xs mt-2">
                Les véhicules apparaîtront ici lorsqu'ils enverront leur position GPS
              </p>
            </div>
          ) : (
            latestPositions.map((pos) => (
              <div
                key={pos.vehicleId}
                className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                  selectedVehicleId === pos.vehicleId
                    ? 'bg-primary/10 border-primary'
                    : 'hover:bg-accent'
                }`}
                onClick={() => setSelectedVehicleId(pos.vehicleId)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-sm">
                    Véhicule {pos.vehicleId.slice(0, 8)}...
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {pos.speed ? `${pos.speed.toFixed(0)} km/h` : '0 km/h'}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Gauge className="h-3 w-3" />
                    <span>{pos.speed?.toFixed(1) || '0'} km/h</span>
                  </div>
                  {pos.heading !== undefined && (
                    <div className="flex items-center gap-1">
                      <Compass className="h-3 w-3" />
                      <span>{pos.heading.toFixed(0)}°</span>
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {format(new Date(pos.timestamp), 'HH:mm:ss')}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Map */}
      <div className="flex-1">
        <MapView
          positions={vehiclePositions}
          onVehicleClick={setSelectedVehicleId}
        />
      </div>

      {/* Vehicle details panel */}
      {selectedPosition && (
        <Card className="w-80">
          <CardHeader>
            <CardTitle>Détails du Véhicule</CardTitle>
            <p className="text-xs text-muted-foreground">
              ID: {selectedPosition.vehicleId}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Gauge className="h-4 w-4" />
                  <span>Vitesse</span>
                </div>
                <div className="text-xl font-bold">
                  {selectedPosition.speed?.toFixed(1) || '0'} <span className="text-sm">km/h</span>
                </div>
              </div>

              {selectedPosition.heading !== undefined && (
                <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Compass className="h-4 w-4" />
                    <span>Direction</span>
                  </div>
                  <div className="text-xl font-bold">
                    {selectedPosition.heading.toFixed(0)}°
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="text-sm font-medium">Position GPS</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-accent rounded">
                    <div className="text-muted-foreground">Latitude</div>
                    <div className="font-mono">{selectedPosition.latitude.toFixed(6)}</div>
                  </div>
                  <div className="p-2 bg-accent rounded">
                    <div className="text-muted-foreground">Longitude</div>
                    <div className="font-mono">{selectedPosition.longitude.toFixed(6)}</div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t">
                <div className="text-sm text-muted-foreground">Dernière mise à jour</div>
                <div className="text-sm font-medium">
                  {format(new Date(selectedPosition.timestamp), 'dd/MM/yyyy HH:mm:ss')}
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setSelectedVehicleId(null)}
            >
              Fermer
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
