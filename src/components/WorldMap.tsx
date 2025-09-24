import React from 'react';
import { ClimateData, DisasterEvent, EnvironmentalData } from '../types';

interface WorldMapProps {
  dataType: 'temperature' | 'disasters' | 'environmental';
  climateData: ClimateData[];
  disasters: DisasterEvent[];  
  environmentalData: EnvironmentalData[];
}

const WorldMap: React.FC<WorldMapProps> = ({ dataType, climateData, disasters, environmentalData }) => {
  const getThemeColors = () => {
    switch (dataType) {
      case 'temperature':
        return {
          primary: '#2563eb',
          secondary: '#1d4ed8', 
          accent: '#3b82f6',
          mapFill: '#1e3a8a',
          mapStroke: '#3b82f6',
          gridColor: '#1e40af',
          bgGradient: 'from-slate-900 via-blue-950 to-slate-900'
        };
      case 'disasters':
        return {
          primary: '#dc2626',
          secondary: '#b91c1c',
          accent: '#ef4444', 
          mapFill: '#7f1d1d',
          mapStroke: '#ef4444',
          gridColor: '#991b1b',
          bgGradient: 'from-slate-900 via-red-950 to-slate-900'
        };
      case 'environmental':
        return {
          primary: '#059669',
          secondary: '#047857',
          accent: '#10b981',
          mapFill: '#064e3b', 
          mapStroke: '#10b981',
          gridColor: '#065f46',
          bgGradient: 'from-slate-900 via-green-950 to-slate-900'
        };
      default:
        return {
          primary: '#2563eb',
          secondary: '#1d4ed8',
          accent: '#3b82f6',
          mapFill: '#1e3a8a',
          mapStroke: '#3b82f6', 
          gridColor: '#1e40af',
          bgGradient: 'from-slate-900 via-blue-950 to-slate-900'
        };
    }
  };

  const colors = getThemeColors();



  // Calculate data intensity for regions
  const getRegionIntensity = (regionLat: number, regionLng: number, radius: number = 15) => {
    let intensity = 0;
    let dataCount = 0;

    const getCurrentData = () => {
      switch (dataType) {
        case 'temperature': return climateData;
        case 'disasters': return disasters;
        case 'environmental': return environmentalData;
        default: return [];
      }
    };

    const data = getCurrentData();

    data.forEach(item => {
      const distance = Math.sqrt(
        Math.pow(item.lat - regionLat, 2) + Math.pow(item.lng - regionLng, 2)
      );

      if (distance <= radius) {
        dataCount++;
        switch (dataType) {
          case 'temperature': {
            const climateItem = item as ClimateData;
            intensity += Math.max(0, (climateItem.temperature + 10) / 50);
            break;
          }
          case 'disasters': {
            const disasterItem = item as DisasterEvent;
            const severityValue = disasterItem.severity === 'High' ? 1 : disasterItem.severity === 'Medium' ? 0.6 : 0.3;
            intensity += severityValue;
            break;
          }
          case 'environmental': {
            const envItem = item as EnvironmentalData;
            intensity += Math.min(1, envItem.airQuality / 200);
            break;
          }
        }
      }
    });

    return dataCount > 0 ? Math.min(1, intensity / dataCount) : 0;
  };

  // Generate dynamic colors for regions based on data
  const getRegionColor = (regionLat: number, regionLng: number) => {
    const intensity = getRegionIntensity(regionLat, regionLng);
    const baseOpacity = 0.6 + intensity * 0.4;
    
    // Use theme colors with intensity variations
    const r = parseInt(colors.mapFill.slice(1, 3), 16);
    const g = parseInt(colors.mapFill.slice(3, 5), 16);
    const b = parseInt(colors.mapFill.slice(5, 7), 16);
    
    // Adjust color intensity based on data
    const adjustedR = Math.min(255, r + intensity * 80);
    const adjustedG = Math.min(255, g + intensity * 60);
    const adjustedB = Math.min(255, b + intensity * 40);
    
    return `rgba(${adjustedR}, ${adjustedG}, ${adjustedB}, ${baseOpacity})`;
  };

  return (
    <div className={`w-full h-full absolute inset-0 bg-gradient-to-br ${colors.bgGradient}`}>
      <svg
        viewBox="0 0 1000 500"
        className="w-full h-full absolute inset-0"
        style={{ filter: 'drop-shadow(0 0 15px rgba(0,0,0,0.5))' }}
      >
        <defs>
          {/* Grid Pattern */}
          <pattern id="gridPattern" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
            <rect width="50" height="50" fill="transparent" />
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke={colors.gridColor} strokeWidth="1" opacity="0.3" />
          </pattern>

          {/* Enhanced Grid Pattern with dots */}
          <pattern id="dotGridPattern" x="0" y="0" width="25" height="25" patternUnits="userSpaceOnUse">
            <rect width="25" height="25" fill="transparent" />
            <circle cx="12.5" cy="12.5" r="1" fill={colors.gridColor} opacity="0.4" />
            <path d="M 25 0 L 0 0 0 25" fill="none" stroke={colors.gridColor} strokeWidth="0.5" opacity="0.2" />
          </pattern>

          {/* Glowing effects */}
          <filter id="landGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <filter id="pulseGlow">
            <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Animated gradient for background */}
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.primary} stopOpacity="0.1">
              <animate attributeName="stop-opacity" values="0.1;0.3;0.1" dur="8s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor={colors.secondary} stopOpacity="0.2">
              <animate attributeName="stop-opacity" values="0.2;0.4;0.2" dur="6s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor={colors.accent} stopOpacity="0.1">
              <animate attributeName="stop-opacity" values="0.1;0.3;0.1" dur="10s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        </defs>

        {/* Background with animated gradient */}
        <rect width="1000" height="500" fill="url(#bgGradient)" />
        
        {/* Grid overlay */}
        <rect width="1000" height="500" fill="url(#gridPattern)" />
        <rect width="1000" height="500" fill="url(#dotGridPattern)" />

        {/* World Map Continents with Blue Theme */}
        
        {/* North America */}
        <g filter="url(#landGlow)">
          {/* Canada */}
          <path 
            d="M50 80 Q100 60 150 70 Q200 65 250 75 Q300 70 350 80 Q400 75 450 85 L450 120 Q400 110 350 115 Q300 120 250 115 Q200 110 150 120 Q100 115 50 125 Z"
            fill={getRegionColor(60, -95)}
            stroke={colors.mapStroke}
            strokeWidth="1"
            opacity="0.8"
          >
            <animate attributeName="opacity" values="0.7;0.9;0.7" dur="6s" repeatCount="indefinite" />
          </path>
          
          {/* United States */}
          <path 
            d="M80 120 Q130 115 180 125 Q230 120 280 130 Q330 125 380 135 L380 180 Q330 170 280 175 Q230 180 180 175 Q130 170 80 180 Z"
            fill={getRegionColor(40, -100)}
            stroke={colors.mapStroke}
            strokeWidth="1"
            opacity="0.8"
          >
            <animate attributeName="opacity" values="0.7;0.9;0.7" dur="4s" repeatCount="indefinite" />
          </path>
          
          {/* Mexico */}
          <path 
            d="M120 180 Q150 175 180 185 Q210 180 240 190 L240 220 Q210 210 180 215 Q150 220 120 210 Z"
            fill={getRegionColor(23, -102)}
            stroke={colors.mapStroke}
            strokeWidth="1"
            opacity="0.8"
          />
        </g>

        {/* South America */}
        <g filter="url(#landGlow)">
          <path 
            d="M200 220 Q230 215 260 225 Q290 220 320 230 Q340 240 350 260 Q360 280 350 300 Q340 320 330 340 Q320 360 310 380 Q300 400 290 420 L280 440 Q270 430 260 420 Q250 410 240 400 Q230 390 220 380 Q210 370 200 360 Q190 350 185 340 Q180 330 185 320 Q190 310 195 300 Q200 290 195 280 Q190 270 195 260 Q200 250 195 240 Q190 230 200 220 Z"
            fill={getRegionColor(-15, -60)}
            stroke={colors.mapStroke}
            strokeWidth="1"
            opacity="0.8"
          >
            <animate attributeName="opacity" values="0.7;0.9;0.7" dur="7s" repeatCount="indefinite" />
          </path>
        </g>

        {/* Europe */}
        <g filter="url(#landGlow)">
          <path 
            d="M480 100 Q510 95 540 105 Q570 100 600 110 L600 150 Q570 140 540 145 Q510 150 480 140 Z"
            fill={getRegionColor(50, 10)}
            stroke={colors.mapStroke}
            strokeWidth="1"
            opacity="0.8"
          >
            <animate attributeName="opacity" values="0.7;0.9;0.7" dur="5s" repeatCount="indefinite" />
          </path>
          
          {/* Scandinavia */}
          <path 
            d="M520 60 Q540 55 560 65 Q580 60 600 70 L600 100 Q580 90 560 95 Q540 100 520 90 Z"
            fill={getRegionColor(60, 15)}
            stroke={colors.mapStroke}
            strokeWidth="1"
            opacity="0.8"
          />
        </g>

        {/* Africa */}
        <g filter="url(#landGlow)">
          <path 
            d="M500 150 Q530 145 560 155 Q590 150 620 160 Q640 170 650 190 Q660 210 650 230 Q640 250 630 270 Q620 290 610 310 Q600 330 590 350 Q580 370 570 390 Q560 410 550 430 L540 450 Q530 440 520 430 Q510 420 500 410 Q490 400 485 390 Q480 380 485 370 Q490 360 485 350 Q480 340 485 330 Q490 320 485 310 Q480 300 485 290 Q490 280 485 270 Q480 260 485 250 Q490 240 485 230 Q480 220 485 210 Q490 200 485 190 Q480 180 485 170 Q490 160 500 150 Z"
            fill={getRegionColor(0, 20)}
            stroke={colors.mapStroke}
            strokeWidth="1"
            opacity="0.8"
          >
            <animate attributeName="opacity" values="0.7;0.9;0.7" dur="8s" repeatCount="indefinite" />
          </path>
        </g>
        {/* Asia */}
        <g filter="url(#landGlow)">
          {/* Russia */}
          <path 
            d="M600 70 Q650 65 700 75 Q750 70 800 80 Q850 75 900 85 Q950 80 980 90 L980 130 Q950 120 900 125 Q850 130 800 125 Q750 120 700 130 Q650 125 600 135 Z"
            fill={getRegionColor(60, 100)}
            stroke={colors.mapStroke}
            strokeWidth="1"
            opacity="0.8"
          >
            <animate attributeName="opacity" values="0.7;0.9;0.7" dur="9s" repeatCount="indefinite" />
          </path>
          
          {/* China */}
          <path 
            d="M700 130 Q730 125 760 135 Q790 130 820 140 L820 180 Q790 170 760 175 Q730 180 700 170 Z"
            fill={getRegionColor(35, 104)}
            stroke={colors.mapStroke}
            strokeWidth="1"
            opacity="0.8"
          >
            <animate attributeName="opacity" values="0.7;0.9;0.7" dur="4s" repeatCount="indefinite" />
          </path>
          
          {/* India */}
          <path 
            d="M680 180 Q700 175 720 185 Q740 180 760 190 L760 230 Q740 220 720 225 Q700 230 680 220 Z"
            fill={getRegionColor(20, 77)}
            stroke={colors.mapStroke}
            strokeWidth="1"
            opacity="0.8"
          />
        </g>

        {/* Australia */}
        <g filter="url(#landGlow)">
          <path 
            d="M780 350 Q810 345 840 355 Q870 350 900 360 L900 390 Q870 380 840 385 Q810 390 780 380 Z"
            fill={getRegionColor(-25, 135)}
            stroke={colors.mapStroke}
            strokeWidth="1"
            opacity="0.8"
          >
            <animate attributeName="opacity" values="0.7;0.9;0.7" dur="6s" repeatCount="indefinite" />
          </path>
        </g>

        {/* Antarctica */}
        <g filter="url(#landGlow)">
          <path 
            d="M100 450 Q200 445 300 455 Q400 450 500 460 Q600 455 700 465 Q800 460 900 470 L900 500 L100 500 Z"
            fill={getRegionColor(-80, 0)}
            stroke={colors.mapStroke}
            strokeWidth="1"
            opacity="0.7"
          >
            <animate attributeName="opacity" values="0.6;0.8;0.6" dur="10s" repeatCount="indefinite" />
          </path>
        </g>

        {/* Data visualization overlays based on type */}
        {dataType === 'temperature' && (
          <g>
            {climateData.filter(item => Math.abs(item.temperature) > 25).map((item, index) => {
              const x = ((item.lng + 180) / 360) * 1000;
              const y = (1 - ((item.lat + 90) / 180)) * 500;
              const intensity = Math.abs(item.temperature) / 50;
              return (
                <circle
                  key={`temp-${index}`}
                  cx={x}
                  cy={y}
                  r={15 + intensity * 10}
                  fill="none"
                  stroke={item.temperature > 0 ? colors.accent : colors.primary}
                  strokeWidth="2"
                  opacity="0.6"
                >
                  <animate attributeName="r" values={`${15 + intensity * 10};${25 + intensity * 10};${15 + intensity * 10}`} dur="3s" repeatCount="indefinite" />
                  <animate attributeName="stroke-opacity" values="0.6;0.2;0.6" dur="3s" repeatCount="indefinite" />
                </circle>
              );
            })}
          </g>
        )}

        {dataType === 'disasters' && (
          <g>
            {disasters.filter(item => item.severity === 'High').map((item, index) => {
              const x = ((item.lng + 180) / 360) * 1000;
              const y = (1 - ((item.lat + 90) / 180)) * 500;
              return (
                <circle
                  key={`disaster-${index}`}
                  cx={x}
                  cy={y}
                  r="20"
                  fill="none"
                  stroke={colors.accent}
                  strokeWidth="3"
                  opacity="0.8"
                >
                  <animate attributeName="r" values="20;35;20" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="stroke-opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
                </circle>
              );
            })}
          </g>
        )}

        {dataType === 'environmental' && (
          <g>
            {environmentalData.filter(item => item.airQuality > 100).map((item, index) => {
              const x = ((item.lng + 180) / 360) * 1000;
              const y = (1 - ((item.lat + 90) / 180)) * 500;
              const intensity = item.airQuality / 200;
              return (
                <circle
                  key={`env-${index}`}
                  cx={x}
                  cy={y}
                  r={20 + intensity * 15}
                  fill={colors.primary}
                  fillOpacity="0.2"
                  stroke={colors.accent}
                  strokeWidth="2"
                  opacity="0.7"
                >
                  <animate attributeName="r" values={`${20 + intensity * 15};${35 + intensity * 15};${20 + intensity * 15}`} dur="4s" repeatCount="indefinite" />
                  <animate attributeName="fill-opacity" values="0.2;0.05;0.2" dur="4s" repeatCount="indefinite" />
                </circle>
              );
            })}
          </g>
        )}

        {/* Enhanced coordinate grid labels */}
        <g fill="rgba(255,255,255,0.6)" fontSize="10" textAnchor="middle" filter="url(#pulseGlow)">
          <text x="50" y="20">180°W</text>
          <text x="167" y="20">120°W</text>
          <text x="278" y="20">60°W</text>
          <text x="389" y="20">0°</text>
          <text x="500" y="20">60°E</text>
          <text x="611" y="20">120°E</text>
          <text x="722" y="20">180°E</text>
          
          <text x="20" y="65">60°N</text>
          <text x="20" y="127">30°N</text>
          <text x="20" y="189">0°</text>
          <text x="20" y="251">30°S</text>
          <text x="20" y="313">60°S</text>
        </g>

        {/* Live data indicator */}
        <g>
          <circle cx="950" cy="30" r="6" fill={colors.accent}>
            <animate attributeName="fill-opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <text x="935" y="50" fill="rgba(255,255,255,0.8)" fontSize="8">LIVE</text>
        </g>
      </svg>
    </div>
  );
};

export default WorldMap;