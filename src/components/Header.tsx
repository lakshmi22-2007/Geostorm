import React from 'react';
import { motion } from 'framer-motion';
import { Menu, Globe, Thermometer, AlertTriangle, Leaf } from 'lucide-react';

interface HeaderProps {
  selectedDataType: 'temperature' | 'disasters' | 'environmental';
  onDataTypeChange: (type: 'temperature' | 'disasters' | 'environmental') => void;
  onMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ selectedDataType, onDataTypeChange, onMenuToggle }) => {
  const dataTypes = [
    { key: 'temperature', label: 'Climate Data', icon: Thermometer },
    { key: 'disasters', label: 'Disasters', icon: AlertTriangle },
    { key: 'environmental', label: 'Environmental', icon: Leaf }
  ];

  return (
    <motion.header 
      className="fixed top-[32px] left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-700"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onMenuToggle}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center space-x-3">
            <Globe className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-xl font-bold">GEOSTORM</h1>
              <p className="text-sm text-gray-400">Real-time environmental monitoring</p>
            </div>
          </div>
        </div>

        <nav className="flex items-center space-x-2">
          {dataTypes.map((type) => {
            const Icon = type.icon;
            return (
              <motion.button
                key={type.key}
                onClick={() => onDataTypeChange(type.key as 'temperature' | 'disasters' | 'environmental')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  selectedDataType === type.key 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{type.label}</span>
              </motion.button>
            );
          })}
        </nav>
      </div>
    </motion.header>
  );
};

export default Header;