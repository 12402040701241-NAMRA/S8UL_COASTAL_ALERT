/*
  # Coastal Alert System Database Schema

  1. New Tables
    - `monitoring_stations` - Coastal monitoring stations with location and metadata
    - `sensor_readings` - Real-time sensor data from monitoring stations
    - `alerts` - Alert notifications with severity levels and targeting
    - `alert_subscriptions` - User subscriptions for different alert types
    - `incidents` - Emergency incidents and response tracking
    - `incident_tasks` - Tasks assigned to response teams
    - `notification_logs` - Delivery status tracking for notifications

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users based on roles
    - Public read access for monitoring data
    - Restricted write access for alerts and incidents

  3. Real-time Features
    - Real-time subscriptions for sensor readings and alerts
    - Automatic data updates every 30 seconds
*/

-- Create custom types
CREATE TYPE alert_severity AS ENUM ('info', 'warning', 'critical', 'emergency');
CREATE TYPE station_status AS ENUM ('normal', 'warning', 'critical', 'offline');
CREATE TYPE incident_status AS ENUM ('active', 'resolved', 'investigating');
CREATE TYPE notification_channel AS ENUM ('sms', 'email', 'push', 'web');
CREATE TYPE user_role AS ENUM ('admin', 'operator', 'responder', 'subscriber');

-- Monitoring stations table
CREATE TABLE IF NOT EXISTS monitoring_stations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location point NOT NULL,
  latitude real NOT NULL,
  longitude real NOT NULL,
  station_type text NOT NULL DEFAULT 'coastal',
  status station_status DEFAULT 'normal',
  last_reading timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Sensor readings table
CREATE TABLE IF NOT EXISTS sensor_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id uuid REFERENCES monitoring_stations(id) ON DELETE CASCADE,
  tide_level real NOT NULL DEFAULT 0,
  wave_height real NOT NULL DEFAULT 0,
  wind_speed real NOT NULL DEFAULT 0,
  wind_direction integer NOT NULL DEFAULT 0,
  water_temperature real NOT NULL DEFAULT 20,
  water_quality_index integer NOT NULL DEFAULT 50,
  atmospheric_pressure real NOT NULL DEFAULT 1013.25,
  timestamp timestamptz DEFAULT now()
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  severity alert_severity NOT NULL,
  affected_area geometry,
  stations uuid[] DEFAULT '{}',
  created_by uuid REFERENCES auth.users(id),
  approved_by uuid REFERENCES auth.users(id),
  is_active boolean DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Alert subscriptions table
CREATE TABLE IF NOT EXISTS alert_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_types alert_severity[] DEFAULT '{}',
  phone_number text,
  email text,
  push_enabled boolean DEFAULT false,
  location_radius real DEFAULT 50000,
  user_location point,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Incidents table
CREATE TABLE IF NOT EXISTS incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  severity alert_severity NOT NULL,
  status incident_status DEFAULT 'active',
  affected_area geometry,
  related_stations uuid[] DEFAULT '{}',
  assigned_teams text[] DEFAULT '{}',
  created_by uuid REFERENCES auth.users(id),
  resolved_by uuid REFERENCES auth.users(id),
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Incident tasks table
CREATE TABLE IF NOT EXISTS incident_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id uuid REFERENCES incidents(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  assigned_to text,
  status text DEFAULT 'pending',
  priority integer DEFAULT 1,
  due_date timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Notification logs table
CREATE TABLE IF NOT EXISTS notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id uuid REFERENCES alerts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  channel notification_channel NOT NULL,
  recipient text NOT NULL,
  status text DEFAULT 'pending',
  delivered_at timestamptz,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  role user_role DEFAULT 'subscriber',
  organization text,
  phone_number text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE monitoring_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for monitoring stations (public read)
CREATE POLICY "Anyone can view monitoring stations"
  ON monitoring_stations
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Operators can update stations"
  ON monitoring_stations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'operator')
    )
  );

-- RLS Policies for sensor readings (public read)
CREATE POLICY "Anyone can view sensor readings"
  ON sensor_readings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "System can insert sensor readings"
  ON sensor_readings
  FOR INSERT
  TO authenticated
  USING (true);

-- RLS Policies for alerts
CREATE POLICY "Anyone can view active alerts"
  ON alerts
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Operators can manage alerts"
  ON alerts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'operator')
    )
  );

-- RLS Policies for user profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Anyone can create profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  USING (id = auth.uid());

-- RLS Policies for subscriptions
CREATE POLICY "Users can manage own subscriptions"
  ON alert_subscriptions
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for incidents
CREATE POLICY "Responders can view incidents"
  ON incidents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'operator', 'responder')
    )
  );

CREATE POLICY "Operators can manage incidents"
  ON incidents
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'operator')
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sensor_readings_station_timestamp ON sensor_readings(station_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_active ON alerts(is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_monitoring_stations_location ON monitoring_stations USING GIST(location);

-- Functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_monitoring_stations_updated_at BEFORE UPDATE ON monitoring_stations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON alerts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();