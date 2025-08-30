import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type MonitoringStation = Database['public']['Tables']['monitoring_stations']['Row'];
type SensorReading = Database['public']['Tables']['sensor_readings']['Row'];
type Alert = Database['public']['Tables']['alerts']['Row'];

interface DashboardState {
  stations: MonitoringStation[];
  latestReadings: Record<string, SensorReading>;
  alerts: Alert[];
  loading: boolean;
  error: string | null;
  fetchStations: () => Promise<void>;
  fetchLatestReadings: () => Promise<void>;
  fetchActiveAlerts: () => Promise<void>;
  subscribeToRealTimeUpdates: () => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  stations: [],
  latestReadings: {},
  alerts: [],
  loading: false,
  error: null,

  fetchStations: async () => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase
        .from('monitoring_stations')
        .select('*')
        .order('name');

      if (error) throw error;
      set({ stations: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  fetchLatestReadings: async () => {
    try {
      const { data, error } = await supabase
        .from('sensor_readings')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;

      // Group by station_id and get the latest reading for each
      const latestByStation: Record<string, SensorReading> = {};
      data?.forEach((reading) => {
        if (!latestByStation[reading.station_id]) {
          latestByStation[reading.station_id] = reading;
        }
      });

      set({ latestReadings: latestByStation });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  fetchActiveAlerts: async () => {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ alerts: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  subscribeToRealTimeUpdates: () => {
    // Subscribe to sensor readings
    supabase
      .channel('sensor_readings')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sensor_readings' }, 
        () => {
          get().fetchLatestReadings();
        }
      )
      .subscribe();

    // Subscribe to alerts
    supabase
      .channel('alerts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, 
        () => {
          get().fetchActiveAlerts();
        }
      )
      .subscribe();

    // Subscribe to station status changes
    supabase
      .channel('stations')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'monitoring_stations' }, 
        () => {
          get().fetchStations();
        }
      )
      .subscribe();
  },
}));