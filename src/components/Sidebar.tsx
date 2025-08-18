import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, AlertCircle, Leaf, MapPin, ChevronDown, ChevronRight } from 'lucide-react';
import { ClimateData, DisasterEvent, EnvironmentalData } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLocation: any;
  climateData: ClimateData[];
  disasters: DisasterEvent[];
  environmentalData: EnvironmentalData[];
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  selectedLocation,
  climateData,
  disasters,
  environmentalData
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['climate', 'disasters', 'environmental']));
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
  };

  return (
    <motion.div
      className="fixed left-0 top-16 h-full w-80 bg-gray-800/95 backdrop-blur-md border-r border-gray-700 z-40 overflow-y-auto"
      initial={{ x: -320 }}
      animate={{ x: 0 }}
      exit={{ x: -320 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Data Overview</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {selectedLocation && (
          <motion.div 
            className="mb-6 p-4 bg-gray-900/50 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-900/70 transition-colors"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => handleItemClick(selectedLocation)}
          >
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              <h3 className="font-semibold">Selected Location</h3>
            </div>
            <p className="text-sm text-gray-300">{selectedLocation.name || selectedLocation.location}</p>
            <p className="text-xs text-gray-400 mt-1">Click for details</p>
          </motion.div>
        )}

        <div className="space-y-6">
          <SidebarSection 
            title="Climate Data" 
            icon={TrendingUp}
            sectionKey="climate"
            data={climateData}
            isExpanded={expandedSections.has('climate')}
            onToggle={() => toggleSection('climate')}
            onItemClick={handleItemClick}
            renderItem={(item) => (
              <div className="flex justify-between items-center">
                <span className="text-sm">{item.location}</span>
                <div className="text-right">
                  <span className="text-sm text-blue-400">{item.temperature}°C</span>
                  <p className="text-xs text-gray-400">{item.humidity}% humidity</p>
                </div>
              </div>
            )}
          />

          <SidebarSection 
            title="Active Disasters" 
            icon={AlertCircle}
            sectionKey="disasters"
            data={disasters}
            isExpanded={expandedSections.has('disasters')}
            onToggle={() => toggleSection('disasters')}
            onItemClick={handleItemClick}
            renderItem={(item) => (
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm">{item.location}</span>
                  <p className="text-xs text-gray-400">{item.type}</p>
                </div>
                <span className={`text-sm ${getSeverityColor(item.severity)}`}>
                  {item.severity}
                </span>
              </div>
            )}
          />

          <SidebarSection 
            title="Environmental Data" 
            icon={Leaf}
            sectionKey="environmental"
            data={environmentalData}
            isExpanded={expandedSections.has('environmental')}
            onToggle={() => toggleSection('environmental')}
            onItemClick={handleItemClick}
            renderItem={(item) => (
              <div className="flex justify-between items-center">
                <span className="text-sm">{item.location}</span>
                <div className="text-right">
                  <span className="text-sm text-green-400">AQI: {item.airQuality}</span>
                  <p className="text-xs text-gray-400">{item.co2Level} ppm CO2</p>
                </div>
              </div>
            )}
          />
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-600 max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <DetailedItemView item={selectedItem} onClose={() => setSelectedItem(null)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const SidebarSection: React.FC<{
  title: string;
  icon: React.ElementType;
  sectionKey: string;
  data: any[];
  isExpanded: boolean;
  onToggle: () => void;
  onItemClick: (item: any) => void;
  renderItem: (item: any) => React.ReactNode;
}> = ({ title, icon: Icon, data, isExpanded, onToggle, onItemClick, renderItem }) => {
  return (
    <div className="bg-gray-900/30 rounded-lg border border-gray-700 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Icon className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold">{title}</h3>
          <span className="text-xs bg-gray-700 px-2 py-1 rounded-full">{data.length}</span>
        </div>
        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 space-y-2">
              {data.slice(0, 8).map((item, index) => (
                <motion.div
                  key={item.id}
                  className="p-3 bg-gray-800/50 rounded border border-gray-600 cursor-pointer hover:bg-gray-700/50 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onItemClick(item)}
                >
                  {renderItem(item)}
                  <p className="text-xs text-gray-500 mt-1">Click for details</p>
                </motion.div>
              ))}
              {data.length > 8 && (
                <p className="text-xs text-gray-400 text-center py-2">
                  +{data.length - 8} more items
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DetailedItemView: React.FC<{ item: any; onClose: () => void }> = ({ item, onClose }) => {
  const getItemType = (item: any) => {
    if (item.temperature !== undefined) return 'climate';
    if (item.type !== undefined) return 'disaster';
    if (item.airQuality !== undefined) return 'environmental';
    return 'unknown';
  };

  const itemType = getItemType(item);

  const renderDetails = () => {
    switch (itemType) {
      case 'climate':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">{item.location}</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-red-500/20 p-3 rounded-lg">
                <p className="text-sm text-gray-300">Temperature</p>
                <p className="text-xl font-bold text-red-400">{item.temperature}°C</p>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <p className="text-sm text-gray-300">Humidity</p>
                <p className="text-xl font-bold text-blue-400">{item.humidity}%</p>
              </div>
              <div className="bg-green-500/20 p-3 rounded-lg col-span-2">
                <p className="text-sm text-gray-300">Wind Speed</p>
                <p className="text-xl font-bold text-green-400">{item.windSpeed} km/h</p>
              </div>
            </div>
            <div className="bg-gray-700/50 p-3 rounded-lg">
              <p className="text-sm text-gray-300">Coordinates</p>
              <p className="text-sm font-mono text-purple-400">{item.lat.toFixed(4)}, {item.lng.toFixed(4)}</p>
            </div>
            <div className="bg-gray-700/50 p-3 rounded-lg">
              <p className="text-sm text-gray-300">Last Updated</p>
              <p className="text-sm text-white">{new Date(item.timestamp).toLocaleString()}</p>
            </div>
          </div>
        );
      
      case 'disaster':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">{item.type}</h3>
            <div className="bg-gray-700/50 p-3 rounded-lg">
              <p className="text-sm text-gray-300">Location</p>
              <p className="text-white">{item.location}</p>
            </div>
            <div className={`p-3 rounded-lg ${
              item.severity === 'High' ? 'bg-red-500/20' :
              item.severity === 'Medium' ? 'bg-yellow-500/20' : 'bg-green-500/20'
            }`}>
              <p className="text-sm text-gray-300">Severity</p>
              <p className={`text-xl font-bold ${getSeverityColor(item.severity)}`}>{item.severity}</p>
            </div>
            <div className="bg-gray-700/50 p-3 rounded-lg">
              <p className="text-sm text-gray-300">Description</p>
              <p className="text-white">{item.description}</p>
            </div>
            <div className="bg-gray-700/50 p-3 rounded-lg">
              <p className="text-sm text-gray-300">Coordinates</p>
              <p className="text-sm font-mono text-purple-400">{item.lat.toFixed(4)}, {item.lng.toFixed(4)}</p>
            </div>
            <div className="bg-gray-700/50 p-3 rounded-lg">
              <p className="text-sm text-gray-300">Reported</p>
              <p className="text-sm text-white">{new Date(item.timestamp).toLocaleString()}</p>
            </div>
          </div>
        );
      
      case 'environmental':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">{item.location}</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-500/20 p-3 rounded-lg">
                <p className="text-sm text-gray-300">Air Quality</p>
                <p className="text-xl font-bold text-green-400">{item.airQuality}</p>
                <p className="text-xs text-gray-400">
                  {item.airQuality <= 50 ? 'Good' : 
                   item.airQuality <= 100 ? 'Moderate' :
                   item.airQuality <= 150 ? 'Unhealthy for Sensitive' : 'Unhealthy'}
                </p>
              </div>
              <div className="bg-orange-500/20 p-3 rounded-lg">
                <p className="text-sm text-gray-300">CO2 Level</p>
                <p className="text-xl font-bold text-orange-400">{item.co2Level}</p>
                <p className="text-xs text-gray-400">ppm</p>
              </div>
              <div className="bg-red-500/20 p-3 rounded-lg col-span-2">
                <p className="text-sm text-gray-300">Pollution Index</p>
                <p className="text-xl font-bold text-red-400">{item.pollutionIndex}/10</p>
              </div>
            </div>
            <div className="bg-gray-700/50 p-3 rounded-lg">
              <p className="text-sm text-gray-300">Coordinates</p>
              <p className="text-sm font-mono text-purple-400">{item.lat.toFixed(4)}, {item.lng.toFixed(4)}</p>
            </div>
            <div className="bg-gray-700/50 p-3 rounded-lg">
              <p className="text-sm text-gray-300">Last Measured</p>
              <p className="text-sm text-white">{new Date(item.timestamp).toLocaleString()}</p>
            </div>
          </div>
        );
      
      default:
        return <p className="text-gray-400">No detailed information available</p>;
    }
  };

  return (
    <div>
      {renderDetails()}
      <button
        onClick={onClose}
        className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
      >
        Close Details
      </button>
    </div>
  );
};

const getSeverityColor = (severity: string) => {
  switch (severity.toLowerCase()) {
    case 'high':
      return 'text-red-400';
    case 'medium':
      return 'text-yellow-400';
    case 'low':
      return 'text-green-400';
    default:
      return 'text-gray-400';
  }
};

export default Sidebar;