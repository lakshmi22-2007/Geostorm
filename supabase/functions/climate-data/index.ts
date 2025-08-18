import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

interface ClimateDataRequest {
  location: string;
  lat: number;
  lng: number;
  temperature: number;
  humidity: number;
  wind_speed: number;
}

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

    const url = new URL(req.url);
    const method = req.method;

    if (method === 'GET') {
      // Get climate data with optional filters
      const location = url.searchParams.get('location');
      const limit = parseInt(url.searchParams.get('limit') || '100');
      const hours = parseInt(url.searchParams.get('hours') || '24');

      let query = supabaseClient
        .from('climate_data')
        .select('*')
        .gte('timestamp', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (location) {
        query = query.eq('location', location);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (method === 'POST') {
      // Add new climate data
      const body: ClimateDataRequest = await req.json();

      const { data, error } = await supabaseClient
        .from('climate_data')
        .insert([{
          location: body.location,
          lat: body.lat,
          lng: body.lng,
          temperature: body.temperature,
          humidity: body.humidity,
          wind_speed: body.wind_speed,
          timestamp: new Date().toISOString(),
        }])
        .select();

      if (error) {
        throw error;
      }

      return new Response(JSON.stringify(data[0]), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      });
    }

    return new Response('Method not allowed', {
      headers: corsHeaders,
      status: 405,
    });

  } catch (error) {
    console.error('Error in climate-data function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});