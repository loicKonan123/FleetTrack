'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { GpsPositionUpdateDto } from '@/types/gps';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface MapViewProps {
  positions: Map<string, GpsPositionUpdateDto>;
  onVehicleClick?: (vehicleId: string) => void;
}

export function MapView({ positions, onVehicleClick }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [2.3522, 48.8566], // Paris
      zoom: 12,
    });

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update markers when positions change
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    positions.forEach((position, vehicleId) => {
      let marker = markers.current.get(vehicleId);

      if (!marker) {
        // Create new marker
        const el = document.createElement('div');
        el.className = 'vehicle-marker';
        el.style.width = '32px';
        el.style.height = '32px';
        el.style.cursor = 'pointer';
        el.style.fontSize = '24px';
        el.innerHTML = '🚗';

        marker = new mapboxgl.Marker(el)
          .setLngLat([position.longitude, position.latitude])
          .addTo(map.current!);

        el.addEventListener('click', () => {
          onVehicleClick?.(vehicleId);
        });

        markers.current.set(vehicleId, marker);
      } else {
        // Update existing marker position
        marker.setLngLat([position.longitude, position.latitude]);
      }
    });

    // Remove markers for vehicles that no longer exist
    markers.current.forEach((marker, vehicleId) => {
      if (!positions.has(vehicleId)) {
        marker.remove();
        markers.current.delete(vehicleId);
      }
    });

    // Auto-fit bounds if we have positions
    if (positions.size > 0 && map.current) {
      const bounds = new mapboxgl.LngLatBounds();
      positions.forEach((pos) => {
        bounds.extend([pos.longitude, pos.latitude]);
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [positions, mapLoaded, onVehicleClick]);

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
