import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useDashboardStore } from '../stores/dashboardStore';

export const useRealTimeData = () => {
  const intervalRef = useRef<NodeJS.Timeout>();
  const { fetchLatestReadings, stations } = useDashboardStore();

  useEffect(() => {
    // Simulate real-time data updates every 30 seconds
    const simulateRealTimeData = async () => {
      if (stations.length === 0) return;

      // Generate new sensor readings for random stations
      const randomStations = stations
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.ceil(stations.length / 3));

      for (const station of randomStations) {
        const newReading = {
          station_id: station.id,
          tide_level: Math.round((Math.random() * 4 - 2 + Math.sin(Date.now() / 43200000) * 1.5) * 100) / 100,
          wave_height: Math.round((Math.random() * 3 + 0.5) * 100) / 100,
          wind_speed: Math.round((Math.random() * 25 + 5) * 10) / 10,
          wind_direction: Math.floor(Math.random() * 360),
          water_temperature: Math.round((Math.random() * 8 + 16) * 10) / 10,
          water_quality_index: Math.floor(Math.random() * 40 + 60),
          atmospheric_pressure: Math.round((Math.random() * 30 + 1000) * 100) / 100,
        };

        await supabase.from('sensor_readings').insert(newReading);
      }

      fetchLatestReadings();
    };

    // Start simulation
    intervalRef.current = setInterval(simulateRealTimeData, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [stations, fetchLatestReadings]);

  return { simulateRealTimeData: () => {} };
};