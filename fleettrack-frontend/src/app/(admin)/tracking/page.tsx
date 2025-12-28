'use client';

import { useState } from 'react';
import { MapViewWrapper } from '@/components/tracking/MapViewWrapper';
import { useGpsTracking, TrackingSession } from '@/lib/hooks/useGpsTracking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Navigation,
  Signal,
  SignalHigh,
  SignalLow,
  Gauge,
  Compass,
  Route,
  Trash2,
  MapPin,
  StopCircle,
  Clock,
  Activity,
  XCircle,
  List,
  Map as MapIcon,
  User,
  Phone,
  Car,
  ClipboardList,
} from 'lucide-react';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function TrackingPage() {
  const {
    isConnected,
    connectionError,
    vehiclePositions,
    vehicleTrajectories,
    sessions,
    clearTrajectory,
    clearAllTrajectories,
    stopTrackingVehicle,
    stopAllTracking,
    refreshSessions,
  } = useGpsTracking();

  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('live');

  const selectedPosition = selectedVehicleId ? vehiclePositions.get(selectedVehicleId) : null;
  const selectedTrajectory = selectedVehicleId ? vehicleTrajectories.get(selectedVehicleId) : null;

  const getSignalIcon = () => {
    if (!isConnected) return <Signal className="h-4 w-4" />;
    if (vehiclePositions.size > 5) return <SignalHigh className="h-4 w-4" />;
    if (vehiclePositions.size > 0) return <Signal className="h-4 w-4" />;
    return <SignalLow className="h-4 w-4" />;
  };

  // Get vehicles with their session info
  const vehicles = Array.from(vehiclePositions.entries()).map(([id, pos]) => {
    const session = sessions.find((s) => s.vehicleId === id);
    return {
      id,
      position: pos,
      trajectoryLength: vehicleTrajectories.get(id)?.length || 0,
      session,
    };
  });

  // Get active sessions (receiving data)
  const activeSessions = sessions.filter((s) => s.isActive);
  const inactiveSessions = sessions.filter((s) => !s.isActive);

  const handleStopTracking = (vehicleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    stopTrackingVehicle(vehicleId);
    if (selectedVehicleId === vehicleId) {
      setSelectedVehicleId(null);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Sidebar with vehicle list and sessions */}
      <Card className="w-96 overflow-hidden flex flex-col">
        <CardHeader className="pb-3 flex-shrink-0">
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Suivi en Temps Réel
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            {getSignalIcon()}
            <Badge variant={isConnected ? 'default' : 'destructive'}>
              {isConnected ? 'Connecté' : 'Déconnecté'}
            </Badge>
            {connectionError && (
              <Badge variant="outline" className="text-xs text-orange-600">
                {connectionError}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <Activity className="h-3 w-3" />
            <span>{activeSessions.length} actif(s)</span>
            <span className="text-muted-foreground/50">|</span>
            <span>{sessions.length} total</span>
          </div>
          <div className="pt-2">
            <Link href="/driver-tracking">
              <Button variant="outline" size="sm" className="w-full gap-1">
                <MapPin className="h-4 w-4" />
                Mode Conducteur
              </Button>
            </Link>
          </div>
          {sessions.length > 0 && (
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllTrajectories}
                className="flex-1 gap-1"
              >
                <Trash2 className="h-4 w-4" />
                Trajets
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={stopAllTracking}
                className="flex-1 gap-1"
              >
                <StopCircle className="h-4 w-4" />
                Tout arrêter
              </Button>
            </div>
          )}
        </CardHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-4 mb-2">
            <TabsTrigger value="live" className="flex-1 gap-1">
              <MapIcon className="h-4 w-4" />
              En direct ({vehicles.length})
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex-1 gap-1">
              <List className="h-4 w-4" />
              Sessions ({sessions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="flex-1 overflow-y-auto px-4 pb-4 mt-0">
            {vehicles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">Aucun conducteur en ligne</p>
                <p className="text-xs mt-2">
                  Les conducteurs doivent activer le tracking depuis leur téléphone
                </p>
                <div className="flex flex-col gap-2 mt-4">
                  <Link href="/driver-tracking">
                    <Button variant="outline" size="sm" className="gap-1 w-full">
                      <MapPin className="h-4 w-4" />
                      Ouvrir Mode Conducteur
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground"
                    onClick={() => refreshSessions()}
                  >
                    🔄 Rafraîchir les sessions
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {vehicles.map(({ id, position, trajectoryLength, session }) => (
                  <div
                    key={id}
                    className={`cursor-pointer rounded-lg border p-3 transition-colors ${selectedVehicleId === id ? 'bg-primary/10 border-primary' : 'hover:bg-accent'
                      }`}
                    onClick={() => setSelectedVehicleId(id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${session?.isActive ? 'bg-green-500 animate-pulse' : 'bg-orange-500'
                            }`}
                        />
                        <div className="font-medium text-sm font-mono">{id.slice(0, 8)}...</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs">
                          {position.speed ? `${position.speed.toFixed(0)} km/h` : '0 km/h'}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:text-destructive"
                          onClick={(e) => handleStopTracking(id, e)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Gauge className="h-3 w-3" />
                        <span>{position.speed?.toFixed(0) || '0'} km/h</span>
                      </div>
                      {position.heading != null && (
                        <div className="flex items-center gap-1">
                          <Compass className="h-3 w-3" />
                          <span>{position.heading.toFixed(0)}°</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Route className="h-3 w-3" />
                        <span>{trajectoryLength} pts</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                      <span>{format(new Date(position.timestamp), 'HH:mm:ss')}</span>
                      {session && (
                        <span className="text-xs">
                          {session.positionsCount} positions
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sessions" className="flex-1 overflow-y-auto px-4 pb-4 mt-0">
            {sessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">Aucune session</p>
                <p className="text-xs mt-2">Les sessions de tracking apparaîtront ici</p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Active Sessions */}
                {activeSessions.length > 0 && (
                  <>
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide py-1">
                      Actifs ({activeSessions.length})
                    </div>
                    {activeSessions.map((session) => (
                      <SessionCard
                        key={session.vehicleId}
                        session={session}
                        isSelected={selectedVehicleId === session.vehicleId}
                        onSelect={() => setSelectedVehicleId(session.vehicleId)}
                        onStop={(e) => handleStopTracking(session.vehicleId, e)}
                      />
                    ))}
                  </>
                )}

                {/* Inactive Sessions */}
                {inactiveSessions.length > 0 && (
                  <>
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide py-1 mt-4">
                      Inactifs ({inactiveSessions.length})
                    </div>
                    {inactiveSessions.map((session) => (
                      <SessionCard
                        key={session.vehicleId}
                        session={session}
                        isSelected={selectedVehicleId === session.vehicleId}
                        onSelect={() => setSelectedVehicleId(session.vehicleId)}
                        onStop={(e) => handleStopTracking(session.vehicleId, e)}
                      />
                    ))}
                  </>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>

      {/* Map */}
      <div className="flex-1 relative">
        <MapViewWrapper
          positions={vehiclePositions}
          trajectories={vehicleTrajectories}
          selectedVehicleId={selectedVehicleId}
          onVehicleClick={setSelectedVehicleId}
        />

        {/* Legend */}
        {vehiclePositions.size > 0 && (
          <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur p-3 rounded-lg shadow-lg">
            <div className="text-xs font-medium mb-2">Légende</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>Actif (données reçues)</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span>Inactif (pas de données)</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-8 h-1 bg-blue-500 rounded" />
                <span>Trajet parcouru</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Vehicle details panel */}
      {selectedPosition && (
        <Card className="w-80 overflow-y-auto max-h-[calc(100vh-10rem)]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${sessions.find((s) => s.vehicleId === selectedVehicleId)?.isActive
                    ? 'bg-green-500'
                    : 'bg-orange-500'
                  }`}
              />
              Détails du Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Driver Info */}
            {(selectedPosition.driverName || selectedPosition.driverPhone) && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-sm font-medium flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-blue-600" />
                  Conducteur
                </div>
                {selectedPosition.driverName && (
                  <div className="text-base font-semibold">{selectedPosition.driverName}</div>
                )}
                {selectedPosition.driverPhone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Phone className="h-3 w-3" />
                    <a href={`tel:${selectedPosition.driverPhone}`} className="hover:underline">
                      {selectedPosition.driverPhone}
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Vehicle Info */}
            {(selectedPosition.vehiclePlateNumber || selectedPosition.vehicleBrand) && (
              <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <div className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Car className="h-4 w-4 text-green-600" />
                  Véhicule
                </div>
                {selectedPosition.vehiclePlateNumber && (
                  <div className="text-base font-semibold font-mono">
                    {selectedPosition.vehiclePlateNumber}
                  </div>
                )}
                {(selectedPosition.vehicleBrand || selectedPosition.vehicleModel) && (
                  <div className="text-sm text-muted-foreground">
                    {selectedPosition.vehicleBrand} {selectedPosition.vehicleModel}
                  </div>
                )}
                {selectedPosition.vehicleType && (
                  <Badge variant="outline" className="mt-1 text-xs">
                    {selectedPosition.vehicleType}
                  </Badge>
                )}
              </div>
            )}

            {/* Mission Info */}
            {(() => {
              const session = sessions.find((s) => s.vehicleId === selectedVehicleId);
              if (!session?.missionName) return null;
              return (
                <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="text-sm font-medium flex items-center gap-2 mb-2">
                    <ClipboardList className="h-4 w-4 text-purple-600" />
                    Mission
                  </div>
                  <div className="text-base font-semibold">{session.missionName}</div>
                </div>
              );
            })()}

            <div className="space-y-3">
              {/* Speed */}
              <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Gauge className="h-4 w-4" />
                  <span>Vitesse</span>
                </div>
                <div className="text-xl font-bold">
                  {selectedPosition.speed?.toFixed(0) || '0'}{' '}
                  <span className="text-sm font-normal">km/h</span>
                </div>
              </div>

              {/* Direction */}
              {selectedPosition.heading != null && (
                <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Compass className="h-4 w-4" />
                    <span>Direction</span>
                  </div>
                  <div className="text-xl font-bold">{selectedPosition.heading.toFixed(0)}°</div>
                </div>
              )}

              {/* Trajectory */}
              {selectedTrajectory && (
                <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Route className="h-4 w-4" />
                    <span>Trajet</span>
                  </div>
                  <div className="text-xl font-bold">
                    {selectedTrajectory.length} <span className="text-sm font-normal">points</span>
                  </div>
                </div>
              )}

              {/* GPS Position */}
              <div className="space-y-2">
                <div className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Position GPS
                </div>
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

              {/* Last update */}
              <div className="pt-3 border-t">
                <div className="text-sm text-muted-foreground">Dernière mise à jour</div>
                <div className="text-sm font-medium">
                  {format(new Date(selectedPosition.timestamp), 'dd/MM/yyyy HH:mm:ss')}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {selectedTrajectory && selectedTrajectory.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1"
                  onClick={() => clearTrajectory(selectedVehicleId!)}
                >
                  <Trash2 className="h-4 w-4" />
                  Effacer trajet
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                className="flex-1 gap-1"
                onClick={() => {
                  stopTrackingVehicle(selectedVehicleId!);
                  setSelectedVehicleId(null);
                }}
              >
                <StopCircle className="h-4 w-4" />
                Arrêter
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
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

// Session Card Component
function SessionCard({
  session,
  isSelected,
  onSelect,
  onStop,
}: {
  session: TrackingSession;
  isSelected: boolean;
  onSelect: () => void;
  onStop: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      className={`cursor-pointer rounded-lg border p-3 transition-colors ${isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-accent'
        }`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${session.isActive ? 'bg-green-500 animate-pulse' : 'bg-orange-500'
              }`}
          />
          <div className="font-medium text-sm font-mono">{session.vehicleId.slice(0, 8)}...</div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-destructive hover:text-destructive"
          onClick={onStop}
        >
          <XCircle className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div>
          <span className="text-muted-foreground/70">Démarré:</span>
          <div>{formatDistanceToNow(new Date(session.startedAt), { addSuffix: true, locale: fr })}</div>
        </div>
        <div>
          <span className="text-muted-foreground/70">Dernière MàJ:</span>
          <div>{formatDistanceToNow(new Date(session.lastUpdate), { addSuffix: true, locale: fr })}</div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2 text-xs">
        <Badge variant={session.isActive ? 'default' : 'secondary'} className="text-xs">
          {session.isActive ? 'Actif' : 'Inactif'}
        </Badge>
        <span className="text-muted-foreground">{session.positionsCount} positions</span>
      </div>

      {/* Mission */}
      {session.missionName && (
        <div className="flex items-center gap-1 mt-2 text-xs text-purple-600 dark:text-purple-400">
          <ClipboardList className="h-3 w-3" />
          <span className="truncate">{session.missionName}</span>
        </div>
      )}
    </div>
  );
}
