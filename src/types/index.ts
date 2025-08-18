export interface ClimateData {
  id: string;
  location: string;
  lat: number;
  lng: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  timestamp: string;
}

export interface DisasterEvent {
  id: string;
  type: string;
  location: string;
  lat: number;
  lng: number;
  severity: 'Low' | 'Medium' | 'High';
  timestamp: string;
  description: string;
}

export interface EnvironmentalData {
  id: string;
  location: string;
  lat: number;
  lng: number;
  airQuality: number;
  co2Level: number;
  pollutionIndex: number;
  timestamp: string;
}