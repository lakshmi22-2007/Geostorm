import { ClimateData, DisasterEvent, EnvironmentalData } from '../types';

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
  { name: 'Moscow', lat: 55.7558, lng: 37.6176 },
  { name: 'Jakarta', lat: -6.2088, lng: 106.8456 },
  { name: 'Delhi', lat: 28.7041, lng: 77.1025 },
  { name: 'Manila', lat: 14.5995, lng: 120.9842 },
  { name: 'Karachi', lat: 24.8607, lng: 67.0011 }
];

const disasterTypes = [
  'Earthquake', 'Hurricane', 'Wildfire', 'Flood', 'Tornado', 
  'Tsunami', 'Volcanic Activity', 'Drought', 'Blizzard', 'Heatwave'
];

const severityLevels: ('Low' | 'Medium' | 'High')[] = ['Low', 'Medium', 'High'];

export const generateMockClimateData = (): ClimateData[] => {
  return locations.map((location, index) => ({
    id: `climate-${index}`,
    location: location.name,
    lat: location.lat,
    lng: location.lng,
    temperature: Math.round((Math.random() * 40 - 10) * 10) / 10, // -10 to 30°C
    humidity: Math.round(Math.random() * 100), // 0-100%
    windSpeed: Math.round(Math.random() * 50 * 10) / 10, // 0-50 km/h
    timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString()
  }));
};

export const generateMockDisasters = (): DisasterEvent[] => {
  const numDisasters = Math.floor(Math.random() * 8) + 3; // 3-10 disasters
  return Array.from({ length: numDisasters }, (_, index) => {
    const location = locations[Math.floor(Math.random() * locations.length)];
    const type = disasterTypes[Math.floor(Math.random() * disasterTypes.length)];
    const severity = severityLevels[Math.floor(Math.random() * severityLevels.length)];
    
    return {
      id: `disaster-${index}`,
      type,
      location: location.name,
      lat: location.lat + (Math.random() - 0.5) * 0.1, // Small offset
      lng: location.lng + (Math.random() - 0.5) * 0.1,
      severity,
      timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(), // Last 24 hours
      description: `${severity} severity ${type.toLowerCase()} event in ${location.name}`
    };
  });
};

export const generateMockEnvironmentalData = (): EnvironmentalData[] => {
  return locations.map((location, index) => ({
    id: `env-${index}`,
    location: location.name,
    lat: location.lat,
    lng: location.lng,
    airQuality: Math.round(Math.random() * 300), // 0-300 AQI
    co2Level: Math.round(400 + Math.random() * 100), // 400-500 ppm
    pollutionIndex: Math.round(Math.random() * 10 * 10) / 10, // 0-10
    timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString()
  }));
};