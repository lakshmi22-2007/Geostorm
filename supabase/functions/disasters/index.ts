import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

interface DisasterRequest {
  type: string;
  location: string;
  lat: number;
  lng: number;
  severity: 'Low' | 'Medium' | 'High';
  description: string;
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
      // Get disaster events with optional filters
      const severity = url.searchParams.get('severity');
      const type = url.searchParams.get('type');
      const limit = parseInt(url.searchParams.get('limit') || '100');
      const hours = parseInt(url.searchParams.get('hours') || '72');

      let query = supabaseClient
        .from('disaster_events')
        .select('*')
        .gte('timestamp', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (severity) {
        query = query.eq('severity', severity);
      }

      if (type) {
        query = query.eq('type', type);
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
      // Report new disaster event
      const body: DisasterRequest = await req.json();

      const { data, error } = await supabaseClient
        .from('disaster_events')
        .insert([{
          type: body.type,
          location: body.location,
          lat: body.lat,
          lng: body.lng,
          severity: body.severity,
          description: body.description,
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
    console.error('Error in disasters function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});