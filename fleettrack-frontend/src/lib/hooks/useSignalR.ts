'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import {
  GpsPositionUpdateDto,
  TrackingEventDto,
  StartTrackingSessionDto,
  TrackingSessionStartedDto,
  ActiveTrackingSessionDto
} from '@/types/gps';
import { getAccessToken } from '@/lib/api/client';

const SIGNALR_HUB_URL = process.env.NEXT_PUBLIC_SIGNALR_HUB_URL || 'http://localhost:5115/hubs/gps';

// Session event callbacks type
export interface SessionEventCallbacks {
  onSessionStarted?: (session: TrackingSessionStartedDto) => void;
  onSessionStopped?: (sessionId: string, vehicleId: string) => void;
  onSessionUpdated?: (session: ActiveTrackingSessionDto) => void;
  onStopTrackingRequested?: (vehicleId: string, reason?: string) => void;
}

export const useSignalR = (sessionCallbacks?: SessionEventCallbacks) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [positions, setPositions] = useState<GpsPositionUpdateDto[]>([]);
  const [events, setEvents] = useState<TrackingEventDto[]>([]);
  const [activeSessions, setActiveSessions] = useState<ActiveTrackingSessionDto[]>([]);
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sessionCallbacksRef = useRef(sessionCallbacks);

  // Keep callbacks ref updated
  useEffect(() => {
    sessionCallbacksRef.current = sessionCallbacks;
  }, [sessionCallbacks]);

  const connect = useCallback(async () => {
    // Check if we have a token before trying to connect
    const token = getAccessToken();
    if (!token) {
      console.log('SignalR: No token available, waiting...');
      setConnectionError('Waiting for authentication...');
      // Retry in 2 seconds
      retryTimeoutRef.current = setTimeout(() => connect(), 2000);
      return;
    }

    // If already connected, skip
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    // If connection exists but not connected, stop it first
    if (connectionRef.current) {
      try {
        await connectionRef.current.stop();
      } catch (e) {
        // Ignore stop errors
      }
    }

    console.log('SignalR: Creating connection to', SIGNALR_HUB_URL);

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(SIGNALR_HUB_URL, {
        accessTokenFactory: () => getAccessToken() || '',
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connectionRef.current = connection;

    // Connection state change handlers
    connection.onreconnecting((error) => {
      console.log('SignalR: Reconnecting...', error?.message);
      setIsConnected(false);
      setConnectionError('Reconnecting...');
    });

    connection.onreconnected((connectionId) => {
      console.log('SignalR: Reconnected with id:', connectionId);
      setIsConnected(true);
      setConnectionError(null);
    });

    connection.onclose((error) => {
      console.log('SignalR: Connection closed', error?.message);
      setIsConnected(false);
      if (error) {
        setConnectionError(error.message);
        // Try to reconnect after delay
        retryTimeoutRef.current = setTimeout(() => connect(), 5000);
      }
    });

    // Message handlers
    connection.on('ReceiveGpsPosition', (position: GpsPositionUpdateDto) => {
      console.log('🚗 SignalR: Received GPS position', position.vehicleId, position.latitude, position.longitude);
      setPositions((prev) => {
        const newPositions = [position, ...prev].slice(0, 100);
        console.log('🚗 Positions array now has', newPositions.length, 'items');
        return newPositions;
      });
    });

    connection.on('ReceiveTrackingEvent', (event: TrackingEventDto) => {
      setEvents((prev) => [event, ...prev].slice(0, 50));
    });

    connection.on('SubscriptionConfirmed', (vehicleId: string) => {
      console.log('SignalR: Subscribed to vehicle:', vehicleId);
    });

    connection.on('SubscribedToAllVehicles', () => {
      console.log('SignalR: Subscribed to all vehicles');
    });

    // Session event handlers
    connection.on('SessionStarted', (session: TrackingSessionStartedDto) => {
      console.log('SignalR: Session started', session);
      sessionCallbacksRef.current?.onSessionStarted?.(session);
    });

    connection.on('SessionStopped', (sessionId: string, vehicleId: string) => {
      console.log('SignalR: Session stopped', sessionId, vehicleId);
      setActiveSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
      sessionCallbacksRef.current?.onSessionStopped?.(sessionId, vehicleId);
    });

    connection.on('SessionUpdated', (session: ActiveTrackingSessionDto) => {
      console.log('SignalR: Session updated', session);
      setActiveSessions((prev) => {
        const index = prev.findIndex((s) => s.sessionId === session.sessionId);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = session;
          return updated;
        }
        return [...prev, session];
      });
      sessionCallbacksRef.current?.onSessionUpdated?.(session);
    });

    connection.on('StopTrackingRequested', (vehicleId: string, reason?: string) => {
      console.log('SignalR: Stop tracking requested', vehicleId, reason);
      sessionCallbacksRef.current?.onStopTrackingRequested?.(vehicleId, reason);
    });

    try {
      await connection.start();
      setIsConnected(true);
      setConnectionError(null);
      console.log('SignalR: Connected successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Connection failed';
      // Simplify error message for display
      let displayError = 'Connexion impossible';
      if (errorMessage.includes('negotiation')) {
        displayError = 'Backend non disponible';
      } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        displayError = 'Non authentifié';
      } else if (errorMessage.includes('CORS')) {
        displayError = 'Erreur CORS';
      }
      console.warn('SignalR: Connection error -', errorMessage);
      setConnectionError(displayError);
      setIsConnected(false);
      // Retry connection after delay
      retryTimeoutRef.current = setTimeout(() => connect(), 5000);
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (connectionRef.current) {
        connectionRef.current.stop();
      }
    };
  }, [connect]);

  const subscribeToVehicle = async (vehicleId: string) => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      await connectionRef.current.invoke('SubscribeToVehicle', vehicleId);
    }
  };

  const unsubscribeFromVehicle = async (vehicleId: string) => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      await connectionRef.current.invoke('UnsubscribeFromVehicle', vehicleId);
    }
  };

  const subscribeToAllVehicles = async () => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      console.log('📡 Subscribing to ALL vehicles...');
      await connectionRef.current.invoke('SubscribeToAllVehicles');
      console.log('📡 Subscribed to all vehicles successfully');
    } else {
      console.log('📡 Cannot subscribe - not connected');
    }
  };

  const unsubscribeFromAllVehicles = async () => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      await connectionRef.current.invoke('UnsubscribeFromAllVehicles');
    }
  };

  const sendGpsPosition = async (position: GpsPositionUpdateDto) => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      console.log('📤 Sending GPS position:', position.vehicleId, position.latitude, position.longitude);
      await connectionRef.current.invoke('SendGpsPosition', position);
      console.log('📤 GPS position sent successfully');
    } else {
      console.log('📤 Cannot send position - not connected');
    }
  };

  // Session management methods
  const startTrackingSession = async (dto: StartTrackingSessionDto): Promise<TrackingSessionStartedDto | null> => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      try {
        await connectionRef.current.invoke('StartTrackingSession', dto);
        // The result will come via SessionStarted event
        return null;
      } catch (error) {
        console.error('Failed to start tracking session:', error);
        throw error;
      }
    }
    return null;
  };

  const stopTrackingSession = async (): Promise<void> => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      await connectionRef.current.invoke('StopTrackingSession');
    }
  };

  const forceStopVehicleTracking = async (vehicleId: string, reason?: string): Promise<void> => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      await connectionRef.current.invoke('ForceStopVehicleTracking', vehicleId, reason);
    }
  };

  const getActiveSessionsFromServer = async (): Promise<ActiveTrackingSessionDto[]> => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      const sessions = await connectionRef.current.invoke<ActiveTrackingSessionDto[]>('GetActiveSessions');
      setActiveSessions(sessions);
      return sessions;
    }
    return [];
  };

  return {
    isConnected,
    connectionError,
    positions,
    events,
    activeSessions,
    subscribeToVehicle,
    unsubscribeFromVehicle,
    subscribeToAllVehicles,
    unsubscribeFromAllVehicles,
    sendGpsPosition,
    startTrackingSession,
    stopTrackingSession,
    forceStopVehicleTracking,
    getActiveSessionsFromServer,
  };
};
