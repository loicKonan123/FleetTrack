'use client';

import { useEffect, useRef, useState } from 'react';
import { GpsPositionUpdateDto } from '@/types/gps';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  positions: Map<string, GpsPositionUpdateDto>;
  trajectories?: Map<string, Array<{ lat: number; lng: number; timestamp: string }>>;
  selectedVehicleId?: string | null;
  onVehicleClick?: (vehicleId: string) => void;
}

// Colors for different vehicles
const VEHICLE_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
];

const getVehicleColor = (index: number) => VEHICLE_COLORS[index % VEHICLE_COLORS.length];

// Custom vehicle icon with color
const createVehicleIcon = (color: string, isSelected: boolean) => {
  const size = isSelected ? 40 : 32;
  const border = isSelected ? '3px solid white' : '2px solid white';
  return L.divIcon({
    html: `
      <div style="
        font-size: ${size - 8}px;
        width: ${size}px;
        height: ${size}px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: ${color};
        border-radius: 50%;
        border: ${border};
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ${isSelected ? 'animation: pulse 1s infinite;' : ''}
      ">🚗</div>
    `,
    className: 'vehicle-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

export function MapView({ positions, trajectories, selectedVehicleId, onVehicleClick }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef<Map<string, L.Marker>>(new Map());
  const polylines = useRef<Map<string, L.Polyline>>(new Map());
  const vehicleColorMap = useRef<Map<string, string>>(new Map());
  const [mapLoaded, setMapLoaded] = useState(false);

  // Assign colors to vehicles
  const getColorForVehicle = (vehicleId: string) => {
    if (!vehicleColorMap.current.has(vehicleId)) {
      vehicleColorMap.current.set(vehicleId, getVehicleColor(vehicleColorMap.current.size));
    }
    return vehicleColorMap.current.get(vehicleId)!;
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Create map centered on Paris
    map.current = L.map(mapContainer.current).setView([48.8566, 2.3522], 12);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map.current);

    // Add CSS for pulse animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
      .vehicle-marker { background: transparent !important; border: none !important; }
    `;
    document.head.appendChild(style);

    setMapLoaded(true);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update trajectories (polylines)
  useEffect(() => {
    if (!mapLoaded || !map.current || !trajectories) return;

    trajectories.forEach((trajectory, vehicleId) => {
      const color = getColorForVehicle(vehicleId);
      let polyline = polylines.current.get(vehicleId);

      const latLngs = trajectory.map((p) => [p.lat, p.lng] as [number, number]);

      if (!polyline) {
        // Create new polyline
        polyline = L.polyline(latLngs, {
          color: color,
          weight: 4,
          opacity: 0.7,
          lineJoin: 'round',
        }).addTo(map.current!);
        polylines.current.set(vehicleId, polyline);
      } else {
        // Update existing polyline
        polyline.setLatLngs(latLngs);
      }
    });

    // Remove polylines for vehicles that no longer exist
    polylines.current.forEach((polyline, vehicleId) => {
      if (!trajectories.has(vehicleId)) {
        polyline.remove();
        polylines.current.delete(vehicleId);
      }
    });
  }, [trajectories, mapLoaded]);

  // Update markers when positions change
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    positions.forEach((position, vehicleId) => {
      const color = getColorForVehicle(vehicleId);
      const isSelected = vehicleId === selectedVehicleId;
      let marker = markers.current.get(vehicleId);

      if (!marker) {
        // Create new marker
        marker = L.marker([position.latitude, position.longitude], {
          icon: createVehicleIcon(color, isSelected),
          zIndexOffset: isSelected ? 1000 : 0,
        }).addTo(map.current!);

        // Add click handler
        marker.on('click', () => {
          onVehicleClick?.(vehicleId);
        });

        markers.current.set(vehicleId, marker);
      } else {
        // Update existing marker
        marker.setLatLng([position.latitude, position.longitude]);
        marker.setIcon(createVehicleIcon(color, isSelected));
        marker.setZIndexOffset(isSelected ? 1000 : 0);
      }

      // Update popup
      marker.bindPopup(`
        <div style="min-width: 150px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <div style="width: 12px; height: 12px; background: ${color}; border-radius: 50%;"></div>
            <strong>Véhicule</strong>
          </div>
          <div style="font-size: 11px; color: #666; margin-bottom: 4px;">
            ID: ${vehicleId.slice(0, 8)}...
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 12px;">
            <div><strong>Vitesse:</strong></div>
            <div>${position.speed?.toFixed(0) || '0'} km/h</div>
            <div><strong>Direction:</strong></div>
            <div>${position.heading?.toFixed(0) || '-'}°</div>
          </div>
          <div style="font-size: 10px; color: #999; margin-top: 8px;">
            ${new Date(position.timestamp).toLocaleTimeString()}
          </div>
        </div>
      `);
    });

    // Remove markers for vehicles that no longer exist
    markers.current.forEach((marker, vehicleId) => {
      if (!positions.has(vehicleId)) {
        marker.remove();
        markers.current.delete(vehicleId);
      }
    });

    // Auto-fit bounds if we have positions (but don't do it too often)
    if (positions.size > 0 && map.current) {
      const bounds = L.latLngBounds([]);
      positions.forEach((pos) => {
        bounds.extend([pos.latitude, pos.longitude]);
      });

      // Only fit bounds if map view is very different
      if (!map.current.getBounds().intersects(bounds)) {
        map.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }
  }, [positions, selectedVehicleId, mapLoaded, onVehicleClick]);

  // Center on selected vehicle
  useEffect(() => {
    if (!mapLoaded || !map.current || !selectedVehicleId) return;

    const position = positions.get(selectedVehicleId);
    if (position) {
      map.current.setView([position.latitude, position.longitude], 15, { animate: true });
    }
  }, [selectedVehicleId, mapLoaded]);

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainer} className="h-full w-full rounded-lg" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <p className="text-muted-foreground">Chargement de la carte...</p>
        </div>
      )}
    </div>
  );
}
