import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ClimateData, DisasterEvent, EnvironmentalData } from '../types';
import WorldMap from './WorldMap';

interface MapContainerProps {
  dataType: 'temperature' | 'disasters' | 'environmental';
  climateData: ClimateData[];
  disasters: DisasterEvent[];
  environmentalData: EnvironmentalData[];
  onLocationSelect: (location: any) => void;
}

const MapContainer: React.FC<MapContainerProps> = ({
  dataType,
  climateData,
  disasters,
  environmentalData,
  onLocationSelect
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const [showConnections, setShowConnections] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);

  const getCurrentData = () => {
    switch (dataType) {
      case 'temperature':
        return climateData;
      case 'disasters':
        return disasters;
      case 'environmental':
        return environmentalData;
      default:
        return [];
    }
  };

  const getMarkerColor = (item?: any) => {
    switch (dataType) {
      case 'temperature':
        if (item && item.temperature) {
          // Gradient from blue (cold) to red (hot)
          if (item.temperature < 0) return '#3b82f6'; // Blue for very cold
          if (item.temperature < 10) return '#06b6d4'; // Cyan for cold
          if (item.temperature < 20) return '#10b981'; // Green for mild
          if (item.temperature < 30) return '#f59e0b'; // Orange for warm
          return '#ef4444'; // Red for hot
        }
        return '#ef4444';
      case 'disasters':
        if (item && item.severity) {
          if (item.severity === 'High') return '#dc2626'; // Dark red for high
          if (item.severity === 'Medium') return '#f59e0b'; // Orange for medium
          return '#fbbf24'; // Yellow for low
        }
        return '#f59e0b';
      case 'environmental':
        if (item && item.airQuality) {
          // AQI color coding
          if (item.airQuality <= 50) return '#10b981'; // Green - Good
          if (item.airQuality <= 100) return '#f59e0b'; // Yellow - Moderate
          if (item.airQuality <= 150) return '#f97316'; // Orange - Unhealthy for sensitive
          if (item.airQuality <= 200) return '#ef4444'; // Red - Unhealthy
          return '#7c2d12'; // Dark red - Hazardous
        }
        return '#10b981';
      default:
        return '#3b82f6';
    }
  };

  const getConnectionColor = () => {
    switch (dataType) {
      case 'temperature':
        return 'rgba(99, 102, 241, 0.6)'; // Purple-blue for temperature connections
      case 'disasters':
        return 'rgba(239, 68, 68, 0.7)'; // Stronger red for disaster connections
      case 'environmental':
        return 'rgba(34, 197, 94, 0.6)'; // Brighter green for environmental connections
      default:
        return 'rgba(59, 130, 246, 0.4)';
    }
  };

  const handleMarkerClick = (item: any) => {
    setSelectedMarker(item);
    onLocationSelect(item);
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getMarkerPosition = (lat: number, lng: number) => {
    // Convert lat/lng to screen coordinates using Mercator projection
    const x = ((lng + 180) / 360) * 100;
    const latRad = lat * Math.PI / 180;
    const mercN = Math.log(Math.tan((Math.PI / 4) + (latRad / 2)));
    const y = (1 - (mercN / Math.PI)) * 50;
    
    return { x: Math.max(2, Math.min(98, x)), y: Math.max(2, Math.min(98, y)) };
  };

  const shouldConnect = (item1: any, item2: any) => {
    const distance = calculateDistance(item1.lat, item1.lng, item2.lat, item2.lng);
    
    switch (dataType) {
      case 'temperature':
        // Connect if temperature difference is significant or locations are nearby
        return distance < 3000 || Math.abs(item1.temperature - item2.temperature) > 15;
      case 'disasters':
        // Connect disasters of same type or high severity ones
        return item1.type === item2.type || (item1.severity === 'High' && item2.severity === 'High');
      case 'environmental':
        // Connect if air quality levels are similar or locations are nearby
        return distance < 2500 || Math.abs(item1.airQuality - item2.airQuality) < 30;
      default:
        return distance < 2000;
    }
  };

  const getMarkerIntensity = (item: any) => {
    switch (dataType) {
      case 'temperature':
        return Math.max(0, Math.min(1, (item.temperature + 10) / 50));
      case 'disasters':
        return item.severity === 'High' ? 1 : item.severity === 'Medium' ? 0.6 : 0.3;
      case 'environmental':
        return Math.min(1, item.airQuality / 200);
      default:
        return 0.5;
    }
  };

  const renderConnections = () => {
    if (!showConnections) return null;
    
    const data = getCurrentData();
    const connections: JSX.Element[] = [];
    const connectionColor = getConnectionColor();

    for (let i = 0; i < data.length; i++) {
      for (let j = i + 1; j < data.length; j++) {
        if (shouldConnect(data[i], data[j])) {
          const pos1 = getMarkerPosition(data[i].lat, data[i].lng);
          const pos2 = getMarkerPosition(data[j].lat, data[j].lng);
          
          connections.push(
            <motion.line
              key={`connection-${i}-${j}`}
              x1={`${pos1.x}%`}
              y1={`${pos1.y}%`}
              x2={`${pos2.x}%`}
              y2={`${pos2.y}%`}
              stroke={connectionColor}
              strokeWidth="2"
              strokeDasharray="6,6"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ 
                duration: 2, 
                delay: (i + j) * 0.1,
                ease: "easeInOut"
              }}
              style={{
                filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.2))'
              }}
            />
          );
        }
      }
    }

    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
        <defs>
          <filter id="connectionGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        {connections}
      </svg>
    );
  };

  const renderMarkers = () => {
    const data = getCurrentData();

    return data.map((item, index) => {
      const position = getMarkerPosition(item.lat, item.lng);
      const intensity = getMarkerIntensity(item);
      const size = 4 + intensity * 6; // Size based on data intensity
      const markerColor = getMarkerColor(item); // Get color based on item data
      
      return (
        <motion.div
          key={item.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20"
          style={{
            left: `${position.x}%`,
            top: `${position.y}%`,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.6, zIndex: 30 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleMarkerClick(item)}
        >
          {/* Intensity-based pulse rings */}
          <motion.div
            className="absolute inset-0 rounded-full border-2"
            style={{ 
              borderColor: markerColor,
              width: `${size * 2}px`,
              height: `${size * 2}px`,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
            animate={{
              scale: [1, 2 + intensity, 1],
              opacity: [0.8, 0, 0.8]
            }}
            transition={{
              duration: 2 + intensity,
              repeat: Infinity,
              delay: index * 0.3
            }}
          />
          
          <motion.div
            className="absolute inset-0 rounded-full border-2"
            style={{ 
              borderColor: markerColor,
              width: `${size * 1.5}px`,
              height: `${size * 1.5}px`,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
            animate={{
              scale: [1, 1.5 + intensity * 0.5, 1],
              opacity: [0.6, 0, 0.6]
            }}
            transition={{
              duration: 1.5 + intensity * 0.5,
              repeat: Infinity,
              delay: index * 0.2
            }}
          />
          
          {/* Main marker with intensity-based size */}
          <div
            className="rounded-full border-3 border-white shadow-xl relative z-10"
            style={{ 
              backgroundColor: markerColor,
              width: `${size}px`,
              height: `${size}px`,
              boxShadow: `0 0 ${10 + intensity * 10}px ${markerColor}80, 0 0 ${20 + intensity * 20}px ${markerColor}40`,
              opacity: 0.8 + intensity * 0.2
            }}
          />
          
          {/* Enhanced tooltip with real-time data */}
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900/95 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none border border-gray-600 backdrop-blur-sm">
            <div className="font-semibold text-center">{item.location}</div>
            <div className="text-gray-300 text-center">
              {dataType === 'temperature' && (
                <>
                  <div className="text-red-400 font-bold">{item.temperature}°C</div>
                  <div>{item.humidity}% humidity • {item.windSpeed} km/h wind</div>
                </>
              )}
              {dataType === 'disasters' && (
                <>
                  <div className={`font-bold ${
                    item.severity === 'High' ? 'text-red-400' :
                    item.severity === 'Medium' ? 'text-yellow-400' : 'text-green-400'
                  }`}>{item.type}</div>
                  <div>{item.severity} severity</div>
                </>
              )}
              {dataType === 'environmental' && (
                <>
                  <div className="text-green-400 font-bold">AQI {item.airQuality}</div>
                  <div>CO2 {item.co2Level}ppm • Pollution {item.pollutionIndex}/10</div>
                </>
              )}
            </div>
            <div className="text-xs text-gray-400 text-center mt-1">
              {new Date(item.timestamp).toLocaleTimeString()}
            </div>
            {/* Tooltip arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </motion.div>
      );
    });
  };

  const getMapBackground = () => {
    switch (dataType) {
      case 'temperature':
        return 'bg-gradient-to-br from-blue-950 via-indigo-900 to-purple-900';
      case 'disasters':
        return 'bg-gradient-to-br from-red-950 via-orange-900 to-yellow-900';
      case 'environmental':
        return 'bg-gradient-to-br from-green-950 via-emerald-900 to-teal-900';
      default:
        return 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900';
    }
  };

  return (
    <div className={`relative w-full h-full ${getMapBackground()}`}>
      {/* Enhanced Controls */}
      <div className="absolute top-4 right-4 z-40 flex gap-3">
        <div className="px-3 py-2 bg-gray-900/90 backdrop-blur-md rounded-lg border border-gray-600 text-sm text-gray-300 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Real-time</span>
        </div>
        
        <motion.button
          onClick={() => setShowConnections(!showConnections)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all backdrop-blur-md border ${
            showConnections 
              ? 'bg-blue-600/90 text-white border-blue-500' 
              : 'bg-gray-800/90 text-gray-300 hover:bg-gray-700/90 border-gray-600'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {showConnections ? 'Hide Connections' : 'Show Connections'}
        </motion.button>
        
        <motion.button
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all backdrop-blur-md border ${
            showHeatmap 
              ? 'bg-red-600/90 text-white border-red-500' 
              : 'bg-gray-800/90 text-gray-300 hover:bg-gray-700/90 border-gray-600'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {showHeatmap ? 'Hide Heatmap' : 'Show Heatmap'}
        </motion.button>
      </div>

      {/* World Map with Real-time Coloring */}
      <div className="w-full h-full relative overflow-hidden">
        <WorldMap 
          dataType={dataType}
          climateData={climateData}
          disasters={disasters}
          environmentalData={environmentalData}
        />
        
        {/* Connection lines overlay */}
        {renderConnections()}

        {/* Data markers */}
        {renderMarkers()}
      </div>

      {/* Enhanced Legend with Color Coding */}
      <div className="absolute bottom-4 right-4 bg-gray-900/95 backdrop-blur-md rounded-lg p-2 border border-gray-700 z-40 max-w-xs">
        <h3 className="text-xs font-bold text-white mb-2 flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: getMarkerColor() }}></div>
          {dataType.charAt(0).toUpperCase() + dataType.slice(1)}
        </h3>
        
        <div className="text-xs text-gray-300 space-y-1">
          {dataType === 'temperature' && (
            <>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded"></div>
                  <span className="text-xs">Very Cold</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-cyan-400 rounded"></div>
                  <span className="text-xs">Cold</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded"></div>
                  <span className="text-xs">Mild</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-orange-500 rounded"></div>
                  <span className="text-xs">Warm</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded"></div>
                  <span className="text-xs">Hot</span>
                </div>
              </div>
            </>
          )}
          
          {dataType === 'disasters' && (
            <>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-yellow-400 rounded"></div>
                  <span className="text-xs">Low</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-orange-500 rounded"></div>
                  <span className="text-xs">Medium</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-600 rounded"></div>
                  <span className="text-xs">High</span>
                </div>
              </div>
            </>
          )}
          
          {dataType === 'environmental' && (
            <>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded"></div>
                  <span className="text-xs">Good</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded"></div>
                  <span className="text-xs">Moderate</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-orange-500 rounded"></div>
                  <span className="text-xs">Unhealthy</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded"></div>
                  <span className="text-xs">Very Bad</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-800 rounded"></div>
                  <span className="text-xs">Hazardous</span>
                </div>
              </div>
            </>
          )}

        </div>
      </div>

      {/* Detail Modal */}
      {selectedMarker && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSelectedMarker(null)}
        >
          <motion.div
            className="bg-gray-800/95 backdrop-blur-md rounded-xl p-6 max-w-md w-full border border-gray-600 shadow-2xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <DetailModal item={selectedMarker} dataType={dataType} onClose={() => setSelectedMarker(null)} />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

const DetailModal: React.FC<{ item: any; dataType: string; onClose: () => void }> = ({ item, dataType, onClose }) => {
  const renderContent = () => {
    switch (dataType) {
      case 'temperature':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">{item.location}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-red-500/20 p-3 rounded-lg border border-red-500/30">
                <p className="text-sm text-gray-300">Temperature</p>
                <p className="text-2xl font-bold text-red-400">{item.temperature}°C</p>
                <p className="text-xs text-gray-400">
                  {item.temperature > 30 ? 'Very Hot' : 
                   item.temperature > 20 ? 'Warm' :
                   item.temperature > 10 ? 'Mild' :
                   item.temperature > 0 ? 'Cool' : 'Cold'}
                </p>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-500/30">
                <p className="text-sm text-gray-300">Humidity</p>
                <p className="text-2xl font-bold text-blue-400">{item.humidity}%</p>
                <p className="text-xs text-gray-400">
                  {item.humidity > 70 ? 'Very Humid' : 
                   item.humidity > 50 ? 'Moderate' : 'Dry'}
                </p>
              </div>
              <div className="bg-green-500/20 p-3 rounded-lg border border-green-500/30">
                <p className="text-sm text-gray-300">Wind Speed</p>
                <p className="text-2xl font-bold text-green-400">{item.windSpeed} km/h</p>
                <p className="text-xs text-gray-400">
                  {item.windSpeed > 30 ? 'Strong' : 
                   item.windSpeed > 15 ? 'Moderate' : 'Light'}
                </p>
              </div>
              <div className="bg-purple-500/20 p-3 rounded-lg border border-purple-500/30">
                <p className="text-sm text-gray-300">Coordinates</p>
                <p className="text-sm font-mono text-purple-400">{item.lat.toFixed(2)}, {item.lng.toFixed(2)}</p>
              </div>
            </div>
            <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600">
              <p className="text-sm text-gray-300">Last Updated</p>
              <p className="text-sm text-white">{new Date(item.timestamp).toLocaleString()}</p>
            </div>
          </div>
        );
      
      case 'disasters':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">{item.type} in {item.location}</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className={`p-3 rounded-lg border ${
                item.severity === 'High' ? 'bg-red-500/20 border-red-500/30' :
                item.severity === 'Medium' ? 'bg-yellow-500/20 border-yellow-500/30' : 'bg-green-500/20 border-green-500/30'
              }`}>
                <p className="text-sm text-gray-300">Severity Level</p>
                <p className={`text-2xl font-bold ${
                  item.severity === 'High' ? 'text-red-400' :
                  item.severity === 'Medium' ? 'text-yellow-400' : 'text-green-400'
                }`}>{item.severity}</p>
                <p className="text-xs text-gray-400">
                  {item.severity === 'High' ? 'Immediate action required' :
                   item.severity === 'Medium' ? 'Monitor closely' : 'Low risk'}
                </p>
              </div>
              <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600">
                <p className="text-sm text-gray-300">Description</p>
                <p className="text-white">{item.description}</p>
              </div>
              <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600">
                <p className="text-sm text-gray-300">Location</p>
                <p className="text-sm font-mono text-blue-400">{item.lat.toFixed(2)}, {item.lng.toFixed(2)}</p>
              </div>
              <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600">
                <p className="text-sm text-gray-300">Reported</p>
                <p className="text-sm text-white">{new Date(item.timestamp).toLocaleString()}</p>
              </div>
            </div>
          </div>
        );
      
      case 'environmental':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">{item.location}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-500/20 p-3 rounded-lg border border-green-500/30">
                <p className="text-sm text-gray-300">Air Quality Index</p>
                <p className="text-2xl font-bold text-green-400">{item.airQuality}</p>
                <p className="text-xs text-gray-400">
                  {item.airQuality <= 50 ? 'Good' : 
                   item.airQuality <= 100 ? 'Moderate' :
                   item.airQuality <= 150 ? 'Unhealthy for Sensitive' :
                   item.airQuality <= 200 ? 'Unhealthy' : 'Very Unhealthy'}
                </p>
              </div>
              <div className="bg-orange-500/20 p-3 rounded-lg border border-orange-500/30">
                <p className="text-sm text-gray-300">CO2 Level</p>
                <p className="text-2xl font-bold text-orange-400">{item.co2Level}</p>
                <p className="text-xs text-gray-400">
                  {item.co2Level > 450 ? 'High' : 
                   item.co2Level > 400 ? 'Elevated' : 'Normal'} ppm
                </p>
              </div>
              <div className="bg-red-500/20 p-3 rounded-lg border border-red-500/30">
                <p className="text-sm text-gray-300">Pollution Index</p>
                <p className="text-2xl font-bold text-red-400">{item.pollutionIndex}</p>
                <p className="text-xs text-gray-400">
                  {item.pollutionIndex > 7 ? 'Severe' :
                   item.pollutionIndex > 5 ? 'High' :
                   item.pollutionIndex > 3 ? 'Moderate' : 'Low'} (0-10 scale)
                </p>
              </div>
              <div className="bg-purple-500/20 p-3 rounded-lg border border-purple-500/30">
                <p className="text-sm text-gray-300">Coordinates</p>
                <p className="text-sm font-mono text-purple-400">{item.lat.toFixed(2)}, {item.lng.toFixed(2)}</p>
              </div>
            </div>
            <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600">
              <p className="text-sm text-gray-300">Last Measured</p>
              <p className="text-sm text-white">{new Date(item.timestamp).toLocaleString()}</p>
            </div>
          </div>
        );
      
      default:
        return <p>No data available</p>;
    }
  };

  return (
    <div>
      {renderContent()}
      <button
        onClick={onClose}
        className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors font-medium"
      >
        Close
      </button>
    </div>
  );
};

export default MapContainer;