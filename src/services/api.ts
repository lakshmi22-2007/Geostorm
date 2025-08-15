import { ClimateData, DisasterEvent, EnvironmentalData } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const apiHeaders = {
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  'apikey': SUPABASE_ANON_KEY,
};

class ClimateAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = SUPABASE_URL ? `${SUPABASE_URL}/functions/v1` : '';
  }

  async getClimateData(options: {
    location?: string;
    limit?: number;
    hours?: number;
  } = {}): Promise<ClimateData[]> {
    if (!this.baseUrl || !SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL === 'undefined' || SUPABASE_ANON_KEY === 'undefined') {
      // Return mock data if Supabase is not configured
      console.warn('Supabase not configured. Using mock climate data.');
      return this.getMockClimateData();
    }

    try {
      const params = new URLSearchParams();
      if (options.location) params.append('location', options.location);
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.hours) params.append('hours', options.hours.toString());

      const response = await fetch(`${this.baseUrl}/climate-data?${params}`, {
        headers: apiHeaders,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`Climate API error (${response.status}):`, errorText);
        return this.getMockClimateData();
      }

      const data = await response.json();
      return data.map(this.transformClimateData);
    } catch (error) {
      console.error('Error fetching climate data:', error);
      return this.getMockClimateData();
    }
  }

  async addClimateData(data: Omit<ClimateData, 'id' | 'timestamp'>): Promise<ClimateData | null> {
    if (!this.baseUrl || !SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL === 'undefined' || SUPABASE_ANON_KEY === 'undefined') {
      console.warn('Cannot add data: Supabase not configured');
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/climate-data`, {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify({
          location: data.location,
          lat: data.lat,
          lng: data.lng,
          temperature: data.temperature,
          humidity: data.humidity,
          wind_speed: data.windSpeed,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`Add climate data error (${response.status}):`, errorText);
        return null;
      }

      const result = await response.json();
      return this.transformClimateData(result);
    } catch (error) {
      console.error('Error adding climate data:', error);
      return null;
    }
  }

  async getDisasters(options: {
    severity?: string;
    type?: string;
    limit?: number;
    hours?: number;
  } = {}): Promise<DisasterEvent[]> {
    if (!this.baseUrl || !SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL === 'undefined' || SUPABASE_ANON_KEY === 'undefined') {
      console.warn('Supabase not configured. Using mock disaster data.');
      return this.getMockDisasters();
    }

    try {
      const params = new URLSearchParams();
      if (options.severity) params.append('severity', options.severity);
      if (options.type) params.append('type', options.type);
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.hours) params.append('hours', options.hours.toString());

      const response = await fetch(`${this.baseUrl}/disasters?${params}`, {
        headers: apiHeaders,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`Disasters API error (${response.status}):`, errorText);
        return this.getMockDisasters();
      }

      const data = await response.json();
      return data.map(this.transformDisasterData);
    } catch (error) {
      console.error('Error fetching disaster data:', error);
      return this.getMockDisasters();
    }
  }

  async reportDisaster(data: Omit<DisasterEvent, 'id' | 'timestamp'>): Promise<DisasterEvent | null> {
    if (!this.baseUrl || !SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL === 'undefined' || SUPABASE_ANON_KEY === 'undefined') {
      console.warn('Cannot report disaster: Supabase not configured');
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/disasters`, {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`Report disaster error (${response.status}):`, errorText);
        return null;
      }

      const result = await response.json();
      return this.transformDisasterData(result);
    } catch (error) {
      console.error('Error reporting disaster:', error);
      return null;
    }
  }

  async getEnvironmentalData(options: {
    location?: string;
    limit?: number;
    hours?: number;
    minAqi?: number;
    maxAqi?: number;
  } = {}): Promise<EnvironmentalData[]> {
    if (!this.baseUrl || !SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL === 'undefined' || SUPABASE_ANON_KEY === 'undefined') {
      console.warn('Supabase not configured. Using mock environmental data.');
      return this.getMockEnvironmentalData();
    }

    try {
      const params = new URLSearchParams();
      if (options.location) params.append('location', options.location);
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.hours) params.append('hours', options.hours.toString());
      if (options.minAqi) params.append('min_aqi', options.minAqi.toString());
      if (options.maxAqi) params.append('max_aqi', options.maxAqi.toString());

      const response = await fetch(`${this.baseUrl}/environmental-data?${params}`, {
        headers: apiHeaders,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`Environmental API error (${response.status}):`, errorText);
        return this.getMockEnvironmentalData();
      }

      const data = await response.json();
      return data.map(this.transformEnvironmentalData);
    } catch (error) {
      console.error('Error fetching environmental data:', error);
      return this.getMockEnvironmentalData();
    }
  }

  async addEnvironmentalData(data: Omit<EnvironmentalData, 'id' | 'timestamp'>): Promise<EnvironmentalData | null> {
    if (!this.baseUrl || !SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL === 'undefined' || SUPABASE_ANON_KEY === 'undefined') {
      console.warn('Cannot add data: Supabase not configured');
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/environmental-data`, {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify({
          location: data.location,
          lat: data.lat,
          lng: data.lng,
          air_quality: data.airQuality,
          co2_level: data.co2Level,
          pollution_index: data.pollutionIndex,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`Add environmental data error (${response.status}):`, errorText);
        return null;
      }

      const result = await response.json();
      return this.transformEnvironmentalData(result);
    } catch (error) {
      console.error('Error adding environmental data:', error);
      return null;
    }
  }

  async seedDatabase(): Promise<boolean> {
    if (!this.baseUrl || !SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL === 'undefined' || SUPABASE_ANON_KEY === 'undefined') {
      console.warn('Cannot seed database: Supabase not configured');
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/data-sync?action=seed`, {
        method: 'POST',
        headers: apiHeaders,
      });

      return response.ok;
    } catch (error) {
      console.error('Error seeding database:', error);
      return false;
    }
  }

  async getApiStatus(): Promise<any> {
    if (!this.baseUrl || !SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL === 'undefined' || SUPABASE_ANON_KEY === 'undefined') {
      return { status: 'Supabase not configured', usingMockData: true };
    }

    try {
      const response = await fetch(`${this.baseUrl}/data-sync`, {
        headers: apiHeaders,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`API status error (${response.status}):`, errorText);
        return { status: 'API unavailable', error: errorText, usingMockData: true };
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting API status:', error);
      return { status: 'API unavailable', error: error.message, usingMockData: true };
    }
  }

  // Transform database records to match frontend types
  private transformClimateData(record: any): ClimateData {
    return {
      id: record.id,
      location: record.location,
      lat: parseFloat(record.lat),
      lng: parseFloat(record.lng),
      temperature: parseFloat(record.temperature),
      humidity: parseInt(record.humidity),
      windSpeed: parseFloat(record.wind_speed),
      timestamp: record.timestamp,
    };
  }

  private transformDisasterData(record: any): DisasterEvent {
    return {
      id: record.id,
      type: record.type,
      location: record.location,
      lat: parseFloat(record.lat),
      lng: parseFloat(record.lng),
      severity: record.severity as 'Low' | 'Medium' | 'High',
      description: record.description,
      timestamp: record.timestamp,
    };
  }

  private transformEnvironmentalData(record: any): EnvironmentalData {
    return {
      id: record.id,
      location: record.location,
      lat: parseFloat(record.lat),
      lng: parseFloat(record.lng),
      airQuality: parseInt(record.air_quality),
      co2Level: parseInt(record.co2_level),
      pollutionIndex: parseFloat(record.pollution_index),
      timestamp: record.timestamp,
    };
  }

  // Mock data fallbacks
  private getMockClimateData(): ClimateData[] {
    const locations = [
      { name: 'New York', lat: 40.7128, lng: -74.0060 },
      { name: 'London', lat: 51.5074, lng: -0.1278 },
      { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
      { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
      { name: 'Cairo', lat: 30.0444, lng: 31.2357 },
    ];

    return locations.map((location, index) => ({
      id: `climate-${index}`,
      location: location.name,
      lat: location.lat,
      lng: location.lng,
      temperature: Math.round((Math.random() * 40 - 10) * 10) / 10,
      humidity: Math.round(Math.random() * 100),
      windSpeed: Math.round(Math.random() * 50 * 10) / 10,
      timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
    }));
  }

  private getMockDisasters(): DisasterEvent[] {
    const disasters = [
      { type: 'Hurricane', location: 'Miami', lat: 25.7617, lng: -80.1918, severity: 'High' as const },
      { type: 'Earthquake', location: 'San Francisco', lat: 37.7749, lng: -122.4194, severity: 'Medium' as const },
      { type: 'Wildfire', location: 'Los Angeles', lat: 34.0522, lng: -118.2437, severity: 'High' as const },
    ];

    return disasters.map((disaster, index) => ({
      id: `disaster-${index}`,
      ...disaster,
      description: `${disaster.severity} severity ${disaster.type.toLowerCase()} event in ${disaster.location}`,
      timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    }));
  }

  private getMockEnvironmentalData(): EnvironmentalData[] {
    const locations = [
      { name: 'Beijing', lat: 39.9042, lng: 116.4074 },
      { name: 'Delhi', lat: 28.7041, lng: 77.1025 },
      { name: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
    ];

    return locations.map((location, index) => ({
      id: `env-${index}`,
      location: location.name,
      lat: location.lat,
      lng: location.lng,
      airQuality: Math.round(Math.random() * 300),
      co2Level: Math.round(400 + Math.random() * 100),
      pollutionIndex: Math.round(Math.random() * 10 * 10) / 10,
      timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
    }));
  }
}

export const climateAPI = new ClimateAPI();