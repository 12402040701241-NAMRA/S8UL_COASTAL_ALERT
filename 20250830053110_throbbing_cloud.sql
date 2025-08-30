/*
  # Seed Sample Data for Coastal Alert System

  1. Sample Data
    - 12 coastal monitoring stations along various coastlines
    - Historical sensor readings for the past 30 days
    - Sample alerts and incidents
    - User profiles for testing

  2. Data Patterns
    - Realistic geographical coordinates for coastal locations
    - Varying sensor readings with natural patterns
    - Occasional anomalies for testing alert systems
*/

-- Insert sample monitoring stations
INSERT INTO monitoring_stations (name, latitude, longitude, location, station_type, status) VALUES
  ('Santa Monica Pier', 34.0059, -118.4973, POINT(-118.4973, 34.0059), 'coastal', 'normal'),
  ('Monterey Bay', 36.6177, -121.9166, POINT(-121.9166, 36.6177), 'coastal', 'normal'),
  ('Golden Gate', 37.8199, -122.4783, POINT(-122.4783, 37.8199), 'coastal', 'warning'),
  ('Half Moon Bay', 37.4636, -122.4286, POINT(-122.4286, 37.4636), 'coastal', 'normal'),
  ('Bodega Bay', 38.3319, -123.0453, POINT(-123.0453, 38.3319), 'coastal', 'normal'),
  ('Mendocino Coast', 39.3074, -123.8053, POINT(-123.8053, 39.3074), 'coastal', 'normal'),
  ('Humboldt Bay', 40.8021, -124.1637, POINT(-124.1637, 40.8021), 'coastal', 'critical'),
  ('Crescent City', 41.7558, -124.2026, POINT(-124.2026, 41.7558), 'coastal', 'normal'),
  ('Morro Bay', 35.3658, -120.8498, POINT(-120.8498, 35.3658), 'coastal', 'normal'),
  ('Point Reyes', 38.0696, -122.9442, POINT(-122.9442, 38.0696), 'coastal', 'warning'),
  ('Carmel Bay', 36.5552, -121.9233, POINT(-121.9233, 36.5552), 'coastal', 'normal'),
  ('Big Sur Coast', 36.2704, -121.8081, POINT(-121.8081, 36.2704), 'coastal', 'normal');

-- Insert recent sensor readings for all stations
DO $$
DECLARE
  station_record RECORD;
  reading_time timestamptz;
  day_offset integer;
  hour_offset integer;
BEGIN
  -- Generate readings for the past 30 days
  FOR station_record IN SELECT id FROM monitoring_stations LOOP
    FOR day_offset IN 0..29 LOOP
      FOR hour_offset IN 0..23 LOOP
        reading_time := now() - INTERVAL '1 day' * day_offset - INTERVAL '1 hour' * hour_offset;
        
        INSERT INTO sensor_readings (
          station_id, 
          tide_level, 
          wave_height, 
          wind_speed, 
          wind_direction, 
          water_temperature, 
          water_quality_index, 
          atmospheric_pressure, 
          timestamp
        ) VALUES (
          station_record.id,
          ROUND((RANDOM() * 4 - 2 + SIN(EXTRACT(HOUR FROM reading_time) * PI() / 12))::numeric, 2), -- Tide with daily pattern
          ROUND((RANDOM() * 3 + 0.5)::numeric, 2), -- Wave height
          ROUND((RANDOM() * 25 + 5)::numeric, 1), -- Wind speed
          FLOOR(RANDOM() * 360), -- Wind direction
          ROUND((RANDOM() * 8 + 16)::numeric, 1), -- Water temperature
          FLOOR(RANDOM() * 40 + 60), -- Water quality index
          ROUND((RANDOM() * 30 + 1000)::numeric, 2), -- Atmospheric pressure
          reading_time
        );
      END LOOP;
    END LOOP;
  END LOOP;
END $$;

-- Insert sample alerts
INSERT INTO alerts (title, message, severity, created_by, is_active, expires_at) VALUES
  ('High Tide Warning', 'Unusually high tide levels expected along the coast. Exercise caution near shoreline areas.', 'warning', NULL, true, now() + INTERVAL '6 hours'),
  ('Storm Surge Alert', 'Potential storm surge conditions developing. Coastal flooding possible in low-lying areas.', 'critical', NULL, true, now() + INTERVAL '12 hours'),
  ('Water Quality Advisory', 'Elevated bacteria levels detected at several monitoring stations. Avoid contact with water.', 'info', NULL, true, now() + INTERVAL '24 hours');

-- Insert sample incidents
INSERT INTO incidents (title, description, severity, status, assigned_teams) VALUES
  ('Coastal Flooding Event', 'Multiple reports of flooding in low-lying coastal areas due to king tide and storm surge combination.', 'critical', 'active', ARRAY['Emergency Response Team A', 'Coast Guard Unit 1']),
  ('Equipment Malfunction', 'Monitoring station at Humboldt Bay reporting inconsistent readings. Technical team dispatched.', 'warning', 'investigating', ARRAY['Technical Support Team']);

-- Insert sample incident tasks
INSERT INTO incident_tasks (incident_id, title, description, assigned_to, status, priority, due_date) 
SELECT 
  i.id,
  'Deploy emergency barriers',
  'Set up emergency flood barriers along vulnerable coastal roads',
  'Response Team Alpha',
  'in-progress',
  1,
  now() + INTERVAL '2 hours'
FROM incidents i WHERE title = 'Coastal Flooding Event'
LIMIT 1;

INSERT INTO incident_tasks (incident_id, title, description, assigned_to, status, priority, due_date)
SELECT 
  i.id,
  'Evacuate low-lying areas',
  'Coordinate evacuation of residents in flood-prone zones',
  'Response Team Beta',
  'pending',
  1,
  now() + INTERVAL '1 hour'
FROM incidents i WHERE title = 'Coastal Flooding Event'
LIMIT 1;