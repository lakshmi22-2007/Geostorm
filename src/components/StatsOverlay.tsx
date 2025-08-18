import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, AlertTriangle, Leaf, Thermometer, Info, X } from 'lucide-react';
import { ClimateData, DisasterEvent, EnvironmentalData } from '../types';

interface StatsOverlayProps {
  climateData: ClimateData[];
  disasters: DisasterEvent[];
  environmentalData: EnvironmentalData[];
}

const StatsOverlay: React.FC<StatsOverlayProps> = ({
  climateData,
  disasters,
  environmentalData
}) => {
  const [selectedStat, setSelectedStat] = useState<any>(null);

  const averageTemp = climateData.length > 0 
    ? climateData.reduce((sum, item) => sum + item.temperature, 0) / climateData.length
    : 0;

  const activeDisasters = disasters.filter(d => d.severity === 'High').length;
  const averageAQI = environmentalData.length > 0
    ? environmentalData.reduce((sum, item) => sum + item.airQuality, 0) / environmentalData.length
    : 0;

  const stats = [
    {
      icon: Thermometer,
      label: 'Global Avg Temp',
      value: `${averageTemp.toFixed(1)}°C`,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      details: {
        title: 'Global Average Temperature',
        description: 'Current average temperature across all monitored locations',
        data: climateData,
        breakdown: [
          { label: 'Highest', value: `${Math.max(...climateData.map(d => d.temperature))}°C` },
          { label: 'Lowest', value: `${Math.min(...climateData.map(d => d.temperature))}°C` },
          { label: 'Locations', value: climateData.length.toString() },
          { label: 'Avg Humidity', value: `${(climateData.reduce((sum, item) => sum + item.humidity, 0) / climateData.length).toFixed(1)}%` }
        ]
      }
    },
    {
      icon: AlertTriangle,
      label: 'Active Disasters',
      value: activeDisasters.toString(),
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      details: {
        title: 'Active High-Severity Disasters',
        description: 'Current disasters classified as high severity requiring immediate attention',
        data: disasters.filter(d => d.severity === 'High'),
        breakdown: [
          { label: 'High Severity', value: disasters.filter(d => d.severity === 'High').length.toString() },
          { label: 'Medium Severity', value: disasters.filter(d => d.severity === 'Medium').length.toString() },
          { label: 'Low Severity', value: disasters.filter(d => d.severity === 'Low').length.toString() },
          { label: 'Total Events', value: disasters.length.toString() }
        ]
      }
    },
    {
      icon: Leaf,
      label: 'Avg Air Quality',
      value: averageAQI.toFixed(0),
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      details: {
        title: 'Average Air Quality Index',
        description: 'Air quality measurement across all monitored environmental stations',
        data: environmentalData,
        breakdown: [
          { label: 'Best AQI', value: Math.min(...environmentalData.map(d => d.airQuality)).toString() },
          { label: 'Worst AQI', value: Math.max(...environmentalData.map(d => d.airQuality)).toString() },
          { label: 'Avg CO2', value: `${(environmentalData.reduce((sum, item) => sum + item.co2Level, 0) / environmentalData.length).toFixed(0)} ppm` },
          { label: 'Stations', value: environmentalData.length.toString() }
        ]
      }
    }
  ];

  const handleStatClick = (stat: any) => {
    setSelectedStat(stat);
  };

  return (
    <>
      <div className="fixed top-20 right-6 space-y-4 z-30">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            className={`${stat.bgColor} backdrop-blur-md rounded-lg p-4 border border-gray-600 min-w-[200px] cursor-pointer hover:scale-105 transition-transform`}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
            onClick={() => handleStatClick(stat)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                <div>
                  <p className="text-sm text-gray-300">{stat.label}</p>
                  <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              </div>
              <Info className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-xs text-gray-400 mt-2">Click for details</p>
          </motion.div>
        ))}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedStat && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedStat(null)}
          >
            <motion.div
              className="bg-gray-800 rounded-xl p-6 max-w-lg w-full border border-gray-600 max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">{selectedStat.details.title}</h3>
                <button
                  onClick={() => setSelectedStat(null)}
                  className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-gray-300 mb-6">{selectedStat.details.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {selectedStat.details.breakdown.map((item: any, index: number) => (
                  <div key={index} className="bg-gray-700/50 p-3 rounded-lg">
                    <p className="text-sm text-gray-400">{item.label}</p>
                    <p className={`text-lg font-bold ${selectedStat.color}`}>{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-white">Recent Data Points</h4>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {selectedStat.details.data.slice(0, 5).map((item: any, index: number) => (
                    <div key={index} className="bg-gray-700/30 p-2 rounded text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">{item.location || item.type}</span>
                        <span className={selectedStat.color}>
                          {item.temperature ? `${item.temperature}°C` :
                           item.severity ? item.severity :
                           item.airQuality ? `AQI ${item.airQuality}` : 'N/A'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setSelectedStat(null)}
                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Close Details
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default StatsOverlay;