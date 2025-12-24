'use client';

import { useEffect, useRef, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import { GpsPositionUpdateDto, TrackingEventDto } from '@/types/gps';
import { getAccessToken } from '@/lib/api/client';

const SIGNALR_HUB_URL = process.env.NEXT_PUBLIC_SIGNALR_HUB_URL || 'http://localhost:5115/hubs/gps';

export const useSignalR = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [positions, setPositions] = useState<GpsPositionUpdateDto[]>([]);
  const [events, setEvents] = useState<TrackingEventDto[]>([]);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(SIGNALR_HUB_URL, {
        accessTokenFactory: () => getAccessToken() || '',
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connectionRef.current = connection;

    connection.on('ReceiveGpsPosition', (position: GpsPositionUpdateDto) => {
      setPositions((prev) => [position, ...prev].slice(0, 100)); // Keep last 100
    });

    connection.on('ReceiveTrackingEvent', (event: TrackingEventDto) => {
      setEvents((prev) => [event, ...prev].slice(0, 50)); // Keep last 50
    });

    connection.on('SubscriptionConfirmed', (vehicleId: string) => {
      console.log('Subscribed to vehicle:', vehicleId);
    });

    connection.on('SubscribedToAllVehicles', () => {
      console.log('Subscribed to all vehicles');
    });

    connection
      .start()
      .then(() => {
        setIsConnected(true);
        console.log('SignalR connected');
      })
      .catch((err) => console.error('SignalR connection error:', err));

    return () => {
      connection.stop();
    };
  }, []);

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
      await connectionRef.current.invoke('SubscribeToAllVehicles');
    }
  };

  const unsubscribeFromAllVehicles = async () => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      await connectionRef.current.invoke('UnsubscribeFromAllVehicles');
    }
  };

  const sendGpsPosition = async (position: GpsPositionUpdateDto) => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      await connectionRef.current.invoke('SendGpsPosition', position);
    }
  };

  return {
    isConnected,
    positions,
    events,
    subscribeToVehicle,
    unsubscribeFromVehicle,
    subscribeToAllVehicles,
    unsubscribeFromAllVehicles,
    sendGpsPosition,
  };
};
