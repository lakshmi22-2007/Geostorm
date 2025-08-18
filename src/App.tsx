import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import MapContainer from './components/MapContainer';
import Sidebar from './components/Sidebar';
import StatsOverlay from './components/StatsOverlay';
import AlertSystem from './components/AlertSystem';
import { ClimateData, DisasterEvent, EnvironmentalData } from './types';
import { climateAPI } from './services/api';

function App() {
  const [selectedDataType, setSelectedDataType] = useState<'temperature' | 'disasters' | 'environmental'>('temperature');
  const [climateData, setClimateData] = useState<ClimateData[]>([]);
  const [disasters, setDisasters] = useState<DisasterEvent[]>([]);
  const [environmentalData, setEnvironmentalData] = useState<EnvironmentalData[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<any>(null);

  useEffect(() => {
    // Load initial data and check API status
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [climateResult, disasterResult, environmentalResult, statusResult] = await Promise.all([
          climateAPI.getClimateData({ limit: 50 }),
          climateAPI.getDisasters({ limit: 50 }),
          climateAPI.getEnvironmentalData({ limit: 50 }),
          climateAPI.getApiStatus()
        ]);

        setClimateData(climateResult);
        setDisasters(disasterResult);
        setEnvironmentalData(environmentalResult);
        setApiStatus(statusResult);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Seed database if no data exists
  useEffect(() => {
    if (!isLoading && climateData.length === 0 && disasters.length === 0 && environmentalData.length === 0) {
      const seedData = async () => {
        console.log('No data found, seeding database...');
        const success = await climateAPI.seedDatabase();
        if (success) {
          // Reload data after seeding
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      };
      seedData();
    }
  }, [isLoading, climateData.length, disasters.length, environmentalData.length]);
  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading climate data...</p>
            <p className="text-gray-400 text-sm mt-2">Connecting to real-time API</p>
          </div>
        </div>
      )}

      <Header 
        selectedDataType={selectedDataType} 
        onDataTypeChange={setSelectedDataType}
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className="flex h-screen pt-16">
        <AnimatePresence>
          {sidebarOpen && (
            <Sidebar 
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              selectedLocation={selectedLocation}
              climateData={climateData}
              disasters={disasters}
              environmentalData={environmentalData}
            />
          )}
        </AnimatePresence>

        <div className="flex-1 relative">
          <MapContainer 
            dataType={selectedDataType}
            climateData={climateData}
            disasters={disasters}
            environmentalData={environmentalData}
            onLocationSelect={setSelectedLocation}
          />
          
          <StatsOverlay 
            climateData={climateData}
            disasters={disasters}
            environmentalData={environmentalData}
          />
          
          <AlertSystem disasters={disasters} />
        </div>
      </div>

      {/* API Status indicator */}
      {apiStatus && (
        <div className="fixed bottom-4 left-4 bg-gray-800/90 backdrop-blur-md rounded-lg p-3 border border-gray-600 z-30">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              apiStatus.usingMockData ? 'bg-yellow-400' : 'bg-green-400'
            } animate-pulse`}></div>
            <span className="text-xs text-gray-300">
              {apiStatus.usingMockData ? 'Mock Data' : 'Live API'}
            </span>
          </div>
          {apiStatus.summary && (
            <div className="text-xs text-gray-400 mt-1">
              {apiStatus.summary.climate_records + apiStatus.summary.disaster_records + apiStatus.summary.environmental_records} records
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;