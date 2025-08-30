import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { useDashboardStore } from '../../stores/dashboardStore';
import { SensorPopup } from './SensorPopup';
import type { Database } from '../../lib/database.types';

type MonitoringStation = Database['public']['Tables']['monitoring_stations']['Row'];

// Custom marker icons based on station status
const createStatusIcon = (status: string) => {
  const colors = {
    normal: '#10b981', // green
    warning: '#f59e0b', // amber
    critical: '#ef4444', // red
    offline: '#6b7280', // gray
  };

  return divIcon({
    html: `
      <div style="
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background-color: ${colors[status as keyof typeof colors] || colors.offline};
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: white;
        "></div>
      </div>
    `,
    className: 'custom-station-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const MapUpdater: React.FC<{ stations: MonitoringStation[] }> = ({ stations }) => {
  const map = useMap();

  useEffect(() => {
    if (stations.length > 0) {
      const bounds = stations.map(station => [station.latitude, station.longitude] as [number, number]);
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [stations, map]);

  return null;
};

export const MonitoringMap: React.FC = () => {
  const { stations, latestReadings, fetchStations, fetchLatestReadings } = useDashboardStore();
  const [selectedStation, setSelectedStation] = useState<string | null>(null);

  useEffect(() => {
    fetchStations();
    fetchLatestReadings();
  }, [fetchStations, fetchLatestReadings]);

  const centerLat = stations.length > 0 ? 
    stations.reduce((sum, station) => sum + station.latitude, 0) / stations.length : 
    37.7749;
  const centerLng = stations.length > 0 ? 
    stations.reduce((sum, station) => sum + station.longitude, 0) / stations.length : 
    -122.4194;

  return (
    <div className="h-[600px] rounded-lg overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={8}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <MapUpdater stations={stations} />
        
        {stations.map((station) => {
          const reading = latestReadings[station.id];
          return (
            <Marker
              key={station.id}
              position={[station.latitude, station.longitude]}
              icon={createStatusIcon(station.status)}
              eventHandlers={{
                click: () => setSelectedStation(station.id),
              }}
            >
              <Popup className="custom-popup">
                <SensorPopup station={station} reading={reading} />
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};