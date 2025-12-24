'use client';

import { useSignalR } from './useSignalR';
import { useEffect, useState } from 'react';
import { GpsPositionUpdateDto } from '@/types/gps';

export const useGpsTracking = (vehicleIds?: string[]) => {
  const { isConnected, positions, subscribeToVehicle, subscribeToAllVehicles, unsubscribeFromVehicle } = useSignalR();
  const [vehiclePositions, setVehiclePositions] = useState<Map<string, GpsPositionUpdateDto>>(new Map());

  useEffect(() => {
    if (!isConnected) return;

    if (vehicleIds && vehicleIds.length > 0) {
      vehicleIds.forEach((id) => subscribeToVehicle(id));
      return () => {
        vehicleIds.forEach((id) => unsubscribeFromVehicle(id));
      };
    } else {
      subscribeToAllVehicles();
    }
  }, [isConnected, vehicleIds]);

  useEffect(() => {
    positions.forEach((pos) => {
      setVehiclePositions((prev) => new Map(prev).set(pos.vehicleId, pos));
    });
  }, [positions]);

  return {
    isConnected,
    vehiclePositions,
    latestPositions: positions,
  };
};
