import React from 'react';
import { Thermometer, Waves, Wind, Droplets, Gauge, Clock } from 'lucide-react';
import { format } from 'date-fns';
import type { Database } from '../../lib/database.types';

type MonitoringStation = Database['public']['Tables']['monitoring_stations']['Row'];
type SensorReading = Database['public']['Tables']['sensor_readings']['Row'];

interface SensorPopupProps {
  station: MonitoringStation;
  reading?: SensorReading;
}

export const SensorPopup: React.FC<SensorPopupProps> = ({ station, reading }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-600';
      case 'warning': return 'text-amber-600';
      case 'critical': return 'text-red-600';
      case 'offline': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getWindDirection = (degrees: number) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return directions[Math.round(degrees / 22.5) % 16];
  };

  return (
    <div className="p-4 min-w-[300px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg text-gray-900">{station.name}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(station.status)}`}>
          {station.status}
        </span>
      </div>

      {reading ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Waves className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xs text-gray-500">Tide Level</p>
                <p className="font-semibold">{reading.tide_level}m</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Waves className="h-4 w-4 text-cyan-500" />
              <div>
                <p className="text-xs text-gray-500">Wave Height</p>
                <p className="font-semibold">{reading.wave_height}m</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Wind className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-xs text-gray-500">Wind</p>
                <p className="font-semibold">
                  {reading.wind_speed} m/s {getWindDirection(reading.wind_direction)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Thermometer className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-xs text-gray-500">Water Temp</p>
                <p className="font-semibold">{reading.water_temperature}°C</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Droplets className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-xs text-gray-500">Water Quality</p>
                <p className="font-semibold">{reading.water_quality_index}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Gauge className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Pressure</p>
                <p className="font-semibold">{reading.atmospheric_pressure} hPa</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs text-gray-500 pt-2 border-t">
            <Clock className="h-3 w-3" />
            <span>Last updated: {format(new Date(reading.timestamp), 'MMM dd, HH:mm')}</span>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-500">No recent sensor data available</p>
        </div>
      )}
    </div>
  );
};