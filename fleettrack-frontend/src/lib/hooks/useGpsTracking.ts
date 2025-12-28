'use client';

import { useSignalR } from './useSignalR';
import { useEffect, useState, useCallback, useRef } from 'react';
import { GpsPositionUpdateDto, ActiveTrackingSessionDto } from '@/types/gps';
import { trackingApi } from '@/lib/api/tracking';

export interface VehicleTrackingData {
  currentPosition: GpsPositionUpdateDto;
  trajectory: Array<{ lat: number; lng: number; timestamp: string }>;
}

const POSITIONS_STORAGE_KEY = 'fleettrack_vehicle_positions';
const TRAJECTORIES_STORAGE_KEY = 'fleettrack_vehicle_trajectories';

export const useGpsTracking = (vehicleIds?: string[]) => {
  const {
    isConnected,
    connectionError,
    positions,
    activeSessions,
    subscribeToVehicle,
    subscribeToAllVehicles,
    unsubscribeFromVehicle,
    forceStopVehicleTracking,
    getActiveSessionsFromServer,
  } = useSignalR();

  const [vehiclePositions, setVehiclePositions] = useState<Map<string, GpsPositionUpdateDto>>(new Map());
  const [vehicleTrajectories, setVehicleTrajectories] = useState<Map<string, Array<{ lat: number; lng: number; timestamp: string }>>>(new Map());
  const hasLoadedSessions = useRef(false);

  // Load persisted data from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      // Load positions
      const storedPositions = localStorage.getItem(POSITIONS_STORAGE_KEY);
      if (storedPositions) {
        const parsed = JSON.parse(storedPositions) as Array<[string, GpsPositionUpdateDto]>;
        setVehiclePositions(new Map(parsed));
      }

      // Load trajectories
      const storedTrajectories = localStorage.getItem(TRAJECTORIES_STORAGE_KEY);
      if (storedTrajectories) {
        const parsed = JSON.parse(storedTrajectories) as Array<[string, Array<{ lat: number; lng: number; timestamp: string }>]>;
        setVehicleTrajectories(new Map(parsed));
      }
    } catch (e) {
      console.error('Failed to load tracking data:', e);
    }
  }, []);

  // State for sessions loaded from REST API
  const [restApiSessions, setRestApiSessions] = useState<ActiveTrackingSessionDto[]>([]);

  // Function to initialize positions from sessions
  const initializePositionsFromSessions = useCallback((sessions: ActiveTrackingSessionDto[]) => {
    if (!sessions || sessions.length === 0) return;

    setVehiclePositions((prev) => {
      const newMap = new Map(prev);
      let hasChanges = false;

      for (const session of sessions) {
        // Only add if session has position data and we don't already have this vehicle
        if (session.latitude != null && session.longitude != null && !newMap.has(session.vehicleId)) {
          const position: GpsPositionUpdateDto = {
            vehicleId: session.vehicleId,
            latitude: session.latitude,
            longitude: session.longitude,
            speed: session.speed,
            heading: session.heading,
            timestamp: session.lastPositionAt || session.startedAt,
            vehiclePlateNumber: session.vehiclePlateNumber,
            vehicleBrand: session.vehicleBrand,
            vehicleModel: session.vehicleModel,
            vehicleType: session.vehicleType,
            driverName: session.driverName,
            driverPhone: session.driverPhone,
          };
          newMap.set(session.vehicleId, position);
          hasChanges = true;
        }
      }

      if (hasChanges) {
        // Save to localStorage
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(POSITIONS_STORAGE_KEY, JSON.stringify(Array.from(newMap.entries())));
          } catch (e) {
            console.error('Failed to save positions:', e);
          }
        }
      }

      return hasChanges ? newMap : prev;
    });
  }, []);

  // Load active sessions from server when connected
  useEffect(() => {
    if (isConnected && !hasLoadedSessions.current) {
      hasLoadedSessions.current = true;

      // Try SignalR first
      getActiveSessionsFromServer()
        .then((sessions) => {
          console.log('SignalR sessions loaded:', sessions.length);
          initializePositionsFromSessions(sessions);
        })
        .catch((e) => {
          console.error('Failed to load active sessions via SignalR:', e);
        });

      // Also fetch from REST API as backup/verification
      trackingApi.getActiveSessions()
        .then((sessions) => {
          console.log('REST API sessions loaded:', sessions.length);
          setRestApiSessions(sessions);
          initializePositionsFromSessions(sessions);
        })
        .catch((e) => {
          console.error('Failed to load active sessions via REST API:', e);
        });
    }
  }, [isConnected, getActiveSessionsFromServer, initializePositionsFromSessions]);

  // Refresh sessions function that uses both SignalR and REST API
  const refreshSessions = useCallback(async () => {
    try {
      // Try SignalR
      await getActiveSessionsFromServer();
    } catch (e) {
      console.error('SignalR refresh failed:', e);
    }

    try {
      // Also fetch from REST API
      const sessions = await trackingApi.getActiveSessions();
      setRestApiSessions(sessions);
      initializePositionsFromSessions(sessions);
      return sessions;
    } catch (e) {
      console.error('REST API refresh failed:', e);
      return [];
    }
  }, [getActiveSessionsFromServer, initializePositionsFromSessions]);

  // Save positions to localStorage
  const savePositions = useCallback((positionsMap: Map<string, GpsPositionUpdateDto>) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(POSITIONS_STORAGE_KEY, JSON.stringify(Array.from(positionsMap.entries())));
    } catch (e) {
      console.error('Failed to save positions:', e);
    }
  }, []);

  // Save trajectories to localStorage
  const saveTrajectories = useCallback((trajectoriesMap: Map<string, Array<{ lat: number; lng: number; timestamp: string }>>) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(TRAJECTORIES_STORAGE_KEY, JSON.stringify(Array.from(trajectoriesMap.entries())));
    } catch (e) {
      console.error('Failed to save trajectories:', e);
    }
  }, []);

  // Subscribe to vehicles
  useEffect(() => {
    console.log('📡 useGpsTracking: subscription effect, isConnected =', isConnected, 'vehicleIds =', vehicleIds);
    if (!isConnected) return;

    if (vehicleIds && vehicleIds.length > 0) {
      console.log('📡 Subscribing to specific vehicles:', vehicleIds);
      vehicleIds.forEach((id) => subscribeToVehicle(id));
      return () => {
        vehicleIds.forEach((id) => unsubscribeFromVehicle(id));
      };
    } else {
      console.log('📡 Subscribing to ALL vehicles');
      subscribeToAllVehicles();
    }
  }, [isConnected, vehicleIds, subscribeToVehicle, subscribeToAllVehicles, unsubscribeFromVehicle]);

  // Process incoming positions
  useEffect(() => {
    console.log('🔄 useGpsTracking: positions changed, length =', positions.length);
    if (positions.length === 0) return;

    // Create a map of newest positions per vehicle (positions array is sorted newest first)
    const newestPositions = new Map<string, GpsPositionUpdateDto>();
    for (const pos of positions) {
      // Only keep the first (newest) position for each vehicle
      if (!newestPositions.has(pos.vehicleId)) {
        newestPositions.set(pos.vehicleId, pos);
      }
    }

    console.log('🔄 Processing', newestPositions.size, 'unique vehicles');

    // Process only the newest position for each vehicle
    newestPositions.forEach((pos, vehicleId) => {
      console.log('🔄 Updating vehiclePositions for', vehicleId);
      // Update current position
      setVehiclePositions((prev) => {
        const newMap = new Map(prev).set(vehicleId, pos);
        console.log('🔄 vehiclePositions now has', newMap.size, 'vehicles');
        savePositions(newMap);
        return newMap;
      });

      // Update trajectory (keep last 100 points per vehicle)
      setVehicleTrajectories((prev) => {
        const newMap = new Map(prev);
        const currentTrajectory = newMap.get(vehicleId) || [];
        const newPoint = { lat: pos.latitude, lng: pos.longitude, timestamp: pos.timestamp };

        // Avoid duplicate consecutive points
        const lastPoint = currentTrajectory[currentTrajectory.length - 1];
        if (!lastPoint || lastPoint.lat !== newPoint.lat || lastPoint.lng !== newPoint.lng) {
          const updatedTrajectory = [...currentTrajectory, newPoint].slice(-100);
          newMap.set(vehicleId, updatedTrajectory);
          saveTrajectories(newMap);
        }

        return newMap;
      });
    });
  }, [positions, savePositions, saveTrajectories]);

  // Clear trajectory for a specific vehicle
  const clearTrajectory = useCallback((vehicleId: string) => {
    setVehicleTrajectories((prev) => {
      const newMap = new Map(prev);
      newMap.delete(vehicleId);
      saveTrajectories(newMap);
      return newMap;
    });
  }, [saveTrajectories]);

  // Clear all trajectories
  const clearAllTrajectories = useCallback(() => {
    setVehicleTrajectories(new Map());
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TRAJECTORIES_STORAGE_KEY);
    }
  }, []);

  // Stop tracking a vehicle (calls backend to stop session)
  const stopTrackingVehicle = useCallback(async (vehicleId: string, reason?: string) => {
    try {
      await forceStopVehicleTracking(vehicleId, reason);

      // Remove from positions
      setVehiclePositions((prev) => {
        const newMap = new Map(prev);
        newMap.delete(vehicleId);
        savePositions(newMap);
        return newMap;
      });

      // Remove from trajectories
      setVehicleTrajectories((prev) => {
        const newMap = new Map(prev);
        newMap.delete(vehicleId);
        saveTrajectories(newMap);
        return newMap;
      });
    } catch (e) {
      console.error('Failed to stop tracking vehicle:', e);
    }
  }, [forceStopVehicleTracking, savePositions, saveTrajectories]);

  // Stop all tracking (clear local state)
  const stopAllTracking = useCallback(() => {
    setVehiclePositions(new Map());
    setVehicleTrajectories(new Map());

    if (typeof window !== 'undefined') {
      localStorage.removeItem(POSITIONS_STORAGE_KEY);
      localStorage.removeItem(TRAJECTORIES_STORAGE_KEY);
    }
  }, []);

  // Combine sessions from SignalR and REST API
  // Merge both sources and deduplicate by sessionId, preferring SignalR data (more up-to-date)
  const allSessions = (() => {
    const sessionMap = new Map<string, ActiveTrackingSessionDto>();

    // Add REST API sessions first
    for (const session of restApiSessions) {
      if (session.isActive) {
        sessionMap.set(session.sessionId, session);
      }
    }

    // Override with SignalR sessions (more up-to-date)
    for (const session of activeSessions) {
      if (session.isActive) {
        sessionMap.set(session.sessionId, session);
      } else {
        // If SignalR says session is inactive, remove it
        sessionMap.delete(session.sessionId);
      }
    }

    return Array.from(sessionMap.values());
  })();

  // Convert sessions to the format expected by the UI
  const sessions = allSessions.map((session) => ({
    sessionId: session.sessionId,
    vehicleId: session.vehicleId,
    vehicleName: session.vehiclePlateNumber || `${session.vehicleBrand || ''} ${session.vehicleModel || ''}`.trim() || undefined,
    vehiclePlateNumber: session.vehiclePlateNumber,
    vehicleBrand: session.vehicleBrand,
    vehicleModel: session.vehicleModel,
    vehicleType: session.vehicleType,
    driverName: session.driverName,
    driverPhone: session.driverPhone,
    startedAt: session.startedAt,
    lastUpdate: session.lastPositionAt || session.startedAt,
    positionsCount: session.positionsCount,
    isActive: session.isActive,
    latitude: session.latitude,
    longitude: session.longitude,
    speed: session.speed,
    heading: session.heading,
    missionId: session.missionId,
    missionName: session.missionName,
  }));

  return {
    isConnected,
    connectionError,
    vehiclePositions,
    vehicleTrajectories,
    sessions,
    activeSessions: allSessions,
    latestPositions: positions,
    clearTrajectory,
    clearAllTrajectories,
    stopTrackingVehicle,
    stopAllTracking,
    forceStopVehicleTracking,
    refreshSessions,
  };
};

// Export a compatible TrackingSession type for backward compatibility
export interface TrackingSession {
  sessionId: string;
  vehicleId: string;
  vehicleName?: string;
  vehiclePlateNumber?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleType?: string;
  driverName?: string;
  driverPhone?: string;
  startedAt: string;
  lastUpdate: string;
  positionsCount: number;
  isActive: boolean;
  latitude?: number;
  longitude?: number;
  speed?: number;
  heading?: number;
  missionId?: string;
  missionName?: string;
}
