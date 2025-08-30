export interface Database {
  public: {
    Tables: {
      monitoring_stations: {
        Row: {
          id: string;
          name: string;
          latitude: number;
          longitude: number;
          station_type: string;
          status: 'normal' | 'warning' | 'critical' | 'offline';
          last_reading: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          latitude: number;
          longitude: number;
          station_type?: string;
          status?: 'normal' | 'warning' | 'critical' | 'offline';
          last_reading?: string;
        };
        Update: {
          name?: string;
          latitude?: number;
          longitude?: number;
          station_type?: string;
          status?: 'normal' | 'warning' | 'critical' | 'offline';
          last_reading?: string;
        };
      };
      sensor_readings: {
        Row: {
          id: string;
          station_id: string;
          tide_level: number;
          wave_height: number;
          wind_speed: number;
          wind_direction: number;
          water_temperature: number;
          water_quality_index: number;
          atmospheric_pressure: number;
          timestamp: string;
        };
        Insert: {
          id?: string;
          station_id: string;
          tide_level: number;
          wave_height: number;
          wind_speed: number;
          wind_direction: number;
          water_temperature: number;
          water_quality_index: number;
          atmospheric_pressure: number;
          timestamp?: string;
        };
        Update: {
          tide_level?: number;
          wave_height?: number;
          wind_speed?: number;
          wind_direction?: number;
          water_temperature?: number;
          water_quality_index?: number;
          atmospheric_pressure?: number;
        };
      };
      alerts: {
        Row: {
          id: string;
          title: string;
          message: string;
          severity: 'info' | 'warning' | 'critical' | 'emergency';
          affected_area: any;
          stations: string[];
          created_by: string | null;
          approved_by: string | null;
          is_active: boolean;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          message: string;
          severity: 'info' | 'warning' | 'critical' | 'emergency';
          affected_area?: any;
          stations?: string[];
          created_by?: string | null;
          approved_by?: string | null;
          is_active?: boolean;
          expires_at?: string | null;
        };
        Update: {
          title?: string;
          message?: string;
          severity?: 'info' | 'warning' | 'critical' | 'emergency';
          affected_area?: any;
          stations?: string[];
          approved_by?: string | null;
          is_active?: boolean;
          expires_at?: string | null;
        };
      };
      incidents: {
        Row: {
          id: string;
          title: string;
          description: string;
          severity: 'info' | 'warning' | 'critical' | 'emergency';
          status: 'active' | 'resolved' | 'investigating';
          affected_area: any;
          related_stations: string[];
          assigned_teams: string[];
          created_by: string | null;
          resolved_by: string | null;
          resolved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          severity: 'info' | 'warning' | 'critical' | 'emergency';
          status?: 'active' | 'resolved' | 'investigating';
          affected_area?: any;
          related_stations?: string[];
          assigned_teams?: string[];
          created_by?: string | null;
          resolved_by?: string | null;
          resolved_at?: string | null;
        };
        Update: {
          title?: string;
          description?: string;
          severity?: 'info' | 'warning' | 'critical' | 'emergency';
          status?: 'active' | 'resolved' | 'investigating';
          affected_area?: any;
          related_stations?: string[];
          assigned_teams?: string[];
          resolved_by?: string | null;
          resolved_at?: string | null;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          full_name: string | null;
          role: 'admin' | 'operator' | 'responder' | 'subscriber';
          organization: string | null;
          phone_number: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          role?: 'admin' | 'operator' | 'responder' | 'subscriber';
          organization?: string | null;
          phone_number?: string | null;
        };
        Update: {
          full_name?: string | null;
          role?: 'admin' | 'operator' | 'responder' | 'subscriber';
          organization?: string | null;
          phone_number?: string | null;
        };
      };
    };
  };
}