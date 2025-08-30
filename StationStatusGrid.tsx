import React from 'react';
import { MapPin, Wifi, WifiOff, TrendingUp, TrendingDown } from 'lucide-react';
import { useDashboardStore } from '../../stores/dashboardStore';
import { format } from 'date-fns';

export const StationStatusGrid: React.FC = () => {
  const { stations, latestReadings } = useDashboardStore();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'normal':
        return { color: 'bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100', icon: Wifi };
      case 'warning':
        return { color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100', icon: TrendingUp };
      case 'critical':
        return { color: 'bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-100', icon: TrendingDown };
      case 'offline':
        return { color: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100', icon: WifiOff };
      default:
        return { color: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100', icon: WifiOff };
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Station Status Overview
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {stations.map((station) => {
          const reading = latestReadings[station.id];
          const config = getStatusConfig(station.status);
          const StatusIcon = config.icon;

          return (
            <div
              key={station.id}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 transition-all hover:shadow-md cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                    {station.name}
                  </h3>
                </div>
                <div className={`p-1 rounded-full ${config.color}`}>
                  <StatusIcon className="h-3 w-3" />
                </div>
              </div>

              {reading && (
                <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>Tide Level:</span>
                    <span className="font-medium">{reading.tide_level}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wave Height:</span>
                    <span className="font-medium">{reading.wave_height}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wind Speed:</span>
                    <span className="font-medium">{reading.wind_speed} m/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Water Temp:</span>
                    <span className="font-medium">{reading.water_temperature}°C</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                    Updated: {format(new Date(reading.timestamp), 'HH:mm')}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};