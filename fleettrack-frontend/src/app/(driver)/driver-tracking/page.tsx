'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSignalR } from '@/lib/hooks/useSignalR';
import { vehiclesApi } from '@/lib/api/vehicles';
import { missionsApi } from '@/lib/api/missions';
import { VehicleDto, VehicleType } from '@/types/vehicle';
import { MissionDto, MissionStatus } from '@/types/mission';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Navigation,
  Play,
  Square,
  MapPin,
  Gauge,
  Compass,
  Signal,
  WifiOff,
  Smartphone,
  Car,
  AlertCircle,
  User,
  Phone,
  AlertTriangle,
  ClipboardList,
} from 'lucide-react';

interface GpsPosition {
  latitude: number;
  longitude: number;
  speed: number | null;
  heading: number | null;
  altitude: number | null;
  accuracy: number;
  timestamp: Date;
}

const DRIVER_STORAGE_KEY = 'fleettrack_driver_info';

// Helper to get vehicle type name
const getVehicleTypeName = (type: VehicleType): string => {
  const types: Record<VehicleType, string> = {
    [VehicleType.Car]: 'Voiture',
    [VehicleType.Truck]: 'Camion',
    [VehicleType.Van]: 'Fourgon',
    [VehicleType.Motorcycle]: 'Moto',
    [VehicleType.Bus]: 'Bus',
    [VehicleType.Trailer]: 'Remorque',
    [VehicleType.Other]: 'Autre',
  };
  return types[type] || 'Autre';
};

export default function DriverTrackingPage() {
  // Session callbacks to handle admin-initiated stop
  const handleStopTrackingRequested = useCallback((vehicleId: string, reason?: string) => {
    console.log('Stop tracking requested by admin for vehicle:', vehicleId, 'Reason:', reason);
    setAdminStopReason(reason || 'Arrêt demandé par l\'administrateur');
    stopTrackingInternal();
  }, []);

  const {
    isConnected,
    sendGpsPosition,
    startTrackingSession,
    stopTrackingSession,
  } = useSignalR({
    onStopTrackingRequested: handleStopTrackingRequested,
  });

  const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [missions, setMissions] = useState<MissionDto[]>([]);
  const [selectedMissionId, setSelectedMissionId] = useState<string>('');
  const [driverName, setDriverName] = useState<string>('');
  const [driverPhone, setDriverPhone] = useState<string>('');
  const [isTracking, setIsTracking] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<GpsPosition | null>(null);
  const [positionCount, setPositionCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [adminStopReason, setAdminStopReason] = useState<string | null>(null);
  const [gpsPermission, setGpsPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved driver info
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(DRIVER_STORAGE_KEY);
      if (saved) {
        const { name, phone } = JSON.parse(saved);
        if (name) setDriverName(name);
        if (phone) setDriverPhone(phone);
      }
    } catch (e) {
      console.error('Failed to load driver info:', e);
    }
  }, []);

  // Save driver info when it changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (driverName || driverPhone) {
      localStorage.setItem(DRIVER_STORAGE_KEY, JSON.stringify({ name: driverName, phone: driverPhone }));
    }
  }, [driverName, driverPhone]);

  // Fetch available vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const result = await vehiclesApi.getAll(1, 100);
        setVehicles(result.items);
      } catch (err) {
        console.error('Failed to fetch vehicles:', err);
        setError('Impossible de charger les véhicules');
      }
    };
    fetchVehicles();
  }, []);

  // Fetch missions for selected vehicle
  useEffect(() => {
    if (!selectedVehicleId) {
      setMissions([]);
      setSelectedMissionId('');
      return;
    }

    const fetchMissions = async () => {
      try {
        // Fetch missions assigned to this vehicle that are not completed/cancelled
        const result = await missionsApi.getAll(1, 50, { vehicleId: selectedVehicleId });
        // Filter to show only assigned or in-progress missions
        const activeMissions = result.items.filter(
          (m) => m.status === MissionStatus.Assigned || m.status === MissionStatus.InProgress
        );
        setMissions(activeMissions);
      } catch (err) {
        console.error('Failed to fetch missions:', err);
        // Don't show error for missions - they're optional
      }
    };
    fetchMissions();
  }, [selectedVehicleId]);

  // Check GPS permission
  useEffect(() => {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setGpsPermission(result.state);
        result.onchange = () => setGpsPermission(result.state);
      });
    }
  }, []);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  // Send position to server
  const sendPosition = useCallback((position: GeolocationPosition) => {
    if (!selectedVehicleId || !isConnected || !selectedVehicle) return;

    const gpsData: GpsPosition = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      speed: position.coords.speed ? position.coords.speed * 3.6 : null, // m/s to km/h
      heading: position.coords.heading,
      altitude: position.coords.altitude,
      accuracy: position.coords.accuracy,
      timestamp: new Date(position.timestamp),
    };

    setCurrentPosition(gpsData);

    // Send via SignalR with driver and vehicle info
    sendGpsPosition({
      vehicleId: selectedVehicleId,
      latitude: gpsData.latitude,
      longitude: gpsData.longitude,
      speed: gpsData.speed || undefined,
      heading: gpsData.heading || undefined,
      altitude: gpsData.altitude || undefined,
      accuracy: gpsData.accuracy,
      timestamp: gpsData.timestamp.toISOString(),
      // Vehicle info
      vehiclePlateNumber: selectedVehicle.registrationNumber,
      vehicleType: getVehicleTypeName(selectedVehicle.type),
      vehicleBrand: selectedVehicle.brand,
      vehicleModel: selectedVehicle.model,
      // Driver info
      driverName: driverName || undefined,
      driverPhone: driverPhone || undefined,
    });

    setPositionCount((prev) => prev + 1);
  }, [selectedVehicleId, selectedVehicle, isConnected, sendGpsPosition, driverName, driverPhone]);

  // Internal stop function (used by both user and admin-initiated stops)
  const stopTrackingInternal = useCallback(() => {
    setIsTracking(false);

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Start tracking
  const startTracking = async () => {
    if (!selectedVehicleId) {
      setError('Veuillez sélectionner un véhicule');
      return;
    }

    if (!driverName.trim()) {
      setError('Veuillez entrer votre nom');
      return;
    }

    setError(null);
    setAdminStopReason(null);

    try {
      // Start session on server
      await startTrackingSession({
        vehicleId: selectedVehicleId,
        driverName: driverName.trim(),
        driverPhone: driverPhone.trim() || undefined,
        missionId: selectedMissionId || undefined,
      });

      setIsTracking(true);
      setPositionCount(0);

      // Watch position with high accuracy
      if ('geolocation' in navigator) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          sendPosition,
          (err) => {
            console.error('GPS Error:', err);
            setError(`Erreur GPS: ${err.message}`);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );

        // Also send position every 5 seconds (backup)
        intervalRef.current = setInterval(() => {
          navigator.geolocation.getCurrentPosition(
            sendPosition,
            (err) => {
              // Only log if it's a real error, not just a timeout
              if (err.code !== err.TIMEOUT) {
                console.warn('GPS backup poll failed:', err.message || 'Position unavailable');
              }
            },
            { enableHighAccuracy: true, timeout: 5000 }
          );
        }, 5000);
      } else {
        setError('Géolocalisation non supportée par ce navigateur');
        setIsTracking(false);
      }
    } catch (err) {
      console.error('Failed to start tracking session:', err);
      setError('Impossible de démarrer la session de tracking');
    }
  };

  // Stop tracking (user-initiated)
  const stopTracking = async () => {
    try {
      await stopTrackingSession();
    } catch (err) {
      console.error('Failed to stop tracking session:', err);
    }
    stopTrackingInternal();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="p-4 pb-20">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Smartphone className="h-6 w-6" />
              Tracking Conducteur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={isConnected ? 'default' : 'destructive'} className="gap-1">
                {isConnected ? <Signal className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                {isConnected ? 'Connecté' : 'Déconnecté'}
              </Badge>
              <Badge variant={gpsPermission === 'granted' ? 'default' : 'secondary'} className="gap-1">
                <MapPin className="h-3 w-3" />
                GPS {gpsPermission === 'granted' ? 'Actif' : gpsPermission === 'denied' ? 'Refusé' : 'En attente'}
              </Badge>
              {isTracking && (
                <Badge variant="default" className="gap-1 bg-green-600">
                  <Navigation className="h-3 w-3 animate-pulse" />
                  En cours
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Admin Stop Notification */}
        {adminStopReason && (
          <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                <AlertTriangle className="h-5 w-5" />
                <div>
                  <div className="font-medium">Tracking arrêté par l'administrateur</div>
                  <div className="text-sm">{adminStopReason}</div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => setAdminStopReason(null)}
              >
                Compris
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Driver Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              Informations Conducteur
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="driverName" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nom du conducteur *
              </Label>
              <Input
                id="driverName"
                placeholder="Entrez votre nom..."
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                disabled={isTracking}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="driverPhone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Téléphone
              </Label>
              <Input
                id="driverPhone"
                type="tel"
                placeholder="Ex: 06 12 34 56 78"
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
                disabled={isTracking}
              />
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Car className="h-5 w-5" />
              Sélection du Véhicule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedVehicleId}
              onValueChange={setSelectedVehicleId}
              disabled={isTracking}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choisir un véhicule..." />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.registrationNumber} - {vehicle.brand} {vehicle.model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedVehicle && (
              <div className="mt-3 p-3 bg-accent rounded-lg text-sm">
                <div className="font-medium">{selectedVehicle.registrationNumber}</div>
                <div className="text-muted-foreground">
                  {selectedVehicle.brand} {selectedVehicle.model} ({getVehicleTypeName(selectedVehicle.type)})
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mission Selection (optional) */}
        {selectedVehicleId && missions.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ClipboardList className="h-5 w-5" />
                Mission (optionnel)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedMissionId || 'none'}
                onValueChange={(value) => setSelectedMissionId(value === 'none' ? '' : value)}
                disabled={isTracking}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner une mission..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune mission</SelectItem>
                  {missions.map((mission) => (
                    <SelectItem key={mission.id} value={mission.id}>
                      {mission.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedMissionId && (
                <div className="mt-3 p-3 bg-accent rounded-lg text-sm">
                  {(() => {
                    const mission = missions.find((m) => m.id === selectedMissionId);
                    if (!mission) return null;
                    return (
                      <>
                        <div className="font-medium">{mission.name}</div>
                        <div className="text-muted-foreground">{mission.description}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Distance estimée: {mission.estimatedDistance} km
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tracking Control */}
        <Card>
          <CardContent className="pt-6">
            {!isTracking ? (
              <Button
                onClick={startTracking}
                disabled={!selectedVehicleId || !isConnected || !driverName.trim()}
                className="w-full h-16 text-lg gap-2 bg-green-600 hover:bg-green-700"
              >
                <Play className="h-6 w-6" />
                Démarrer le Tracking
              </Button>
            ) : (
              <Button
                onClick={stopTracking}
                variant="destructive"
                className="w-full h-16 text-lg gap-2"
              >
                <Square className="h-6 w-6" />
                Arrêter le Tracking
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Current Position */}
        {currentPosition && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5" />
                Position Actuelle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-accent rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Latitude</div>
                  <div className="font-mono text-sm">{currentPosition.latitude.toFixed(6)}</div>
                </div>
                <div className="p-3 bg-accent rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Longitude</div>
                  <div className="font-mono text-sm">{currentPosition.longitude.toFixed(6)}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-accent rounded-lg text-center">
                  <Gauge className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <div className="text-lg font-bold">
                    {currentPosition.speed?.toFixed(0) || '0'}
                  </div>
                  <div className="text-xs text-muted-foreground">km/h</div>
                </div>
                <div className="p-3 bg-accent rounded-lg text-center">
                  <Compass className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <div className="text-lg font-bold">
                    {currentPosition.heading?.toFixed(0) || '-'}
                  </div>
                  <div className="text-xs text-muted-foreground">Direction</div>
                </div>
                <div className="p-3 bg-accent rounded-lg text-center">
                  <MapPin className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <div className="text-lg font-bold">
                    {currentPosition.accuracy.toFixed(0)}
                  </div>
                  <div className="text-xs text-muted-foreground">m précision</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
                <span>Positions envoyées:</span>
                <span className="font-mono font-bold">{positionCount}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        {!isTracking && !currentPosition && (
          <Card>
            <CardContent className="pt-4">
              <div className="text-sm text-muted-foreground space-y-2">
                <p className="font-medium">Instructions:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Entrez votre nom</li>
                  <li>Sélectionnez votre véhicule</li>
                  <li>Cliquez sur "Démarrer le Tracking"</li>
                  <li>Autorisez l'accès à votre position GPS</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
