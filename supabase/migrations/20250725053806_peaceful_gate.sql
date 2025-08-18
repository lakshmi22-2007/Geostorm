/*
  # Climate Tracker Database Schema

  1. New Tables
    - `climate_data`
      - `id` (uuid, primary key)
      - `location` (text)
      - `lat` (numeric)
      - `lng` (numeric)
      - `temperature` (numeric)
      - `humidity` (numeric)
      - `wind_speed` (numeric)
      - `timestamp` (timestamptz)
      - `created_at` (timestamptz)

    - `disaster_events`
      - `id` (uuid, primary key)
      - `type` (text)
      - `location` (text)
      - `lat` (numeric)
      - `lng` (numeric)
      - `severity` (text)
      - `description` (text)
      - `timestamp` (timestamptz)
      - `created_at` (timestamptz)

    - `environmental_data`
      - `id` (uuid, primary key)
      - `location` (text)
      - `lat` (numeric)
      - `lng` (numeric)
      - `air_quality` (integer)
      - `co2_level` (integer)
      - `pollution_index` (numeric)
      - `timestamp` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read data
    - Add policies for service role to insert/update data
*/

-- Climate Data Table
CREATE TABLE IF NOT EXISTS climate_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location text NOT NULL,
  lat numeric NOT NULL,
  lng numeric NOT NULL,
  temperature numeric NOT NULL,
  humidity integer NOT NULL,
  wind_speed numeric NOT NULL,
  timestamp timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE climate_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read climate data"
  ON climate_data
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Service role can insert climate data"
  ON climate_data
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Disaster Events Table
CREATE TABLE IF NOT EXISTS disaster_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  location text NOT NULL,
  lat numeric NOT NULL,
  lng numeric NOT NULL,
  severity text NOT NULL CHECK (severity IN ('Low', 'Medium', 'High')),
  description text NOT NULL,
  timestamp timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE disaster_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read disaster events"
  ON disaster_events
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Service role can insert disaster events"
  ON disaster_events
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Environmental Data Table
CREATE TABLE IF NOT EXISTS environmental_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location text NOT NULL,
  lat numeric NOT NULL,
  lng numeric NOT NULL,
  air_quality integer NOT NULL,
  co2_level integer NOT NULL,
  pollution_index numeric NOT NULL,
  timestamp timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE environmental_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read environmental data"
  ON environmental_data
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Service role can insert environmental data"
  ON environmental_data
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_climate_data_timestamp ON climate_data(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_climate_data_location ON climate_data(location);
CREATE INDEX IF NOT EXISTS idx_disaster_events_timestamp ON disaster_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_disaster_events_severity ON disaster_events(severity);
CREATE INDEX IF NOT EXISTS idx_environmental_data_timestamp ON environmental_data(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_environmental_data_air_quality ON environmental_data(air_quality);