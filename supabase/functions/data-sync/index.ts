import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Mock data generators for demonstration
const locations = [
  { name: 'New York', lat: 40.7128, lng: -74.0060 },
  { name: 'London', lat: 51.5074, lng: -0.1278 },
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
  { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
  { name: 'Cairo', lat: 30.0444, lng: 31.2357 },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { name: 'São Paulo', lat: -23.5505, lng: -46.6333 },
  { name: 'Lagos', lat: 6.5244, lng: 3.3792 },
  { name: 'Beijing', lat: 39.9042, lng: 116.4074 },
  { name: 'Mexico City', lat: 19.4326, lng: -99.1332 },
];

const disasterTypes = [
  'Earthquake', 'Hurricane', 'Wildfire', 'Flood', 'Tornado', 
  'Tsunami', 'Volcanic Activity', 'Drought', 'Blizzard', 'Heatwave'
];

const severityLevels = ['Low', 'Medium', 'High'] as const;

Deno.serve(async (req: Request) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method === 'POST') {
      const url = new URL(req.url);
      const action = url.searchParams.get('action');

      if (action === 'seed') {
        // Seed database with initial data
        const results = {
          climate: [],
          disasters: [],
          environmental: []
        };

        // Generate climate data
        for (const location of locations) {
          const climateData = {
            location: location.name,
            lat: location.lat,
            lng: location.lng,
            temperature: Math.round((Math.random() * 40 - 10) * 10) / 10,
            humidity: Math.round(Math.random() * 100),
            wind_speed: Math.round(Math.random() * 50 * 10) / 10,
            timestamp: new Date().toISOString(),
          };

          const { data, error } = await supabaseClient
            .from('climate_data')
            .insert([climateData])
            .select();

          if (!error && data) {
            results.climate.push(data[0]);
          }
        }

        // Generate disaster events
        const numDisasters = Math.floor(Math.random() * 5) + 3;
        for (let i = 0; i < numDisasters; i++) {
          const location = locations[Math.floor(Math.random() * locations.length)];
          const type = disasterTypes[Math.floor(Math.random() * disasterTypes.length)];
          const severity = severityLevels[Math.floor(Math.random() * severityLevels.length)];

          const disasterData = {
            type,
            location: location.name,
            lat: location.lat + (Math.random() - 0.5) * 0.1,
            lng: location.lng + (Math.random() - 0.5) * 0.1,
            severity,
            description: `${severity} severity ${type.toLowerCase()} event in ${location.name}`,
            timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
          };

          const { data, error } = await supabaseClient
            .from('disaster_events')
            .insert([disasterData])
            .select();

          if (!error && data) {
            results.disasters.push(data[0]);
          }
        }

        // Generate environmental data
        for (const location of locations) {
          const environmentalData = {
            location: location.name,
            lat: location.lat,
            lng: location.lng,
            air_quality: Math.round(Math.random() * 300),
            co2_level: Math.round(400 + Math.random() * 100),
            pollution_index: Math.round(Math.random() * 10 * 10) / 10,
            timestamp: new Date().toISOString(),
          };

          const { data, error } = await supabaseClient
            .from('environmental_data')
            .insert([environmentalData])
            .select();

          if (!error && data) {
            results.environmental.push(data[0]);
          }
        }

        return new Response(JSON.stringify({
          message: 'Database seeded successfully',
          results
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201,
        });
      }

      if (action === 'update') {
        // Update existing data with new values
        const results = {
          updated: 0,
          errors: []
        };

        // Update some climate data
        const { data: climateData } = await supabaseClient
          .from('climate_data')
          .select('id, location, lat, lng')
          .limit(5);

        if (climateData) {
          for (const record of climateData) {
            const { error } = await supabaseClient
              .from('climate_data')
              .update({
                temperature: Math.round((Math.random() * 40 - 10) * 10) / 10,
                humidity: Math.round(Math.random() * 100),
                wind_speed: Math.round(Math.random() * 50 * 10) / 10,
                timestamp: new Date().toISOString(),
              })
              .eq('id', record.id);

            if (error) {
              results.errors.push(error.message);
            } else {
              results.updated++;
            }
          }
        }

        return new Response(JSON.stringify({
          message: 'Data updated successfully',
          results
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    if (req.method === 'GET') {
      // Get all data summary
      const [climateResult, disasterResult, environmentalResult] = await Promise.all([
        supabaseClient.from('climate_data').select('*', { count: 'exact' }).limit(1),
        supabaseClient.from('disaster_events').select('*', { count: 'exact' }).limit(1),
        supabaseClient.from('environmental_data').select('*', { count: 'exact' }).limit(1),
      ]);

      return new Response(JSON.stringify({
        summary: {
          climate_records: climateResult.count || 0,
          disaster_records: disasterResult.count || 0,
          environmental_records: environmentalResult.count || 0,
        },
        status: 'API is running'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response('Method not allowed', {
      headers: corsHeaders,
      status: 405,
    });

  } catch (error) {
    console.error('Error in data-sync function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});