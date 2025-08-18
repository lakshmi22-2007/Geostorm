import React from 'react';
import { ClimateData, DisasterEvent, EnvironmentalData } from '../types';

interface WorldMapProps {
  dataType: 'temperature' | 'disasters' | 'environmental';
  climateData: ClimateData[];
  disasters: DisasterEvent[];
  environmentalData: EnvironmentalData[];
}

const WorldMap: React.FC<WorldMapProps> = ({ dataType, climateData, disasters, environmentalData }) => {
  // Calculate regional color intensities based on data
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
          case 'temperature':
            // Higher temperatures = more red intensity
            intensity += Math.max(0, (item.temperature + 10) / 50); // Normalize -10°C to 40°C
            break;
          case 'disasters':
            // More severe disasters = more red intensity
            const severityValue = item.severity === 'High' ? 1 : item.severity === 'Medium' ? 0.6 : 0.3;
            intensity += severityValue;
            break;
          case 'environmental':
            // Worse air quality = more red intensity
            intensity += Math.min(1, item.airQuality / 200); // Normalize 0-200+ AQI
            break;
        }
      }
    });

    return dataCount > 0 ? Math.min(1, intensity / dataCount) : 0;
  };

  // Generate dynamic colors for regions
  const getRegionColor = (regionLat: number, regionLng: number) => {
    const intensity = getRegionIntensity(regionLat, regionLng);
    
    switch (dataType) {
      case 'temperature':
        // Lighter blue (cold) to Red (hot)
        const red = Math.round(intensity * 255);
        const blue = Math.round((1 - intensity) * 255);
        const green = Math.round(intensity * 120 + (1 - intensity) * 180); // Add more green for lighter blues
        return `rgb(${red}, ${green}, ${blue})`;
      
      case 'disasters':
        // Green (safe) to Red (dangerous)
        const redDisaster = Math.round(intensity * 255);
        const greenDisaster = Math.round((1 - intensity) * 255);
        return `rgb(${redDisaster}, ${greenDisaster}, 0)`;
      
      case 'environmental':
        // Green (clean) to Brown/Red (polluted)
        const redEnv = Math.round(intensity * 255);
        const greenEnv = Math.round((1 - intensity) * 200);
        return `rgb(${redEnv}, ${greenEnv}, ${Math.round((1 - intensity) * 100)})`;
      
      default:
        return '#10b981'; // Lighter default green
    }
  };

  // Create gradient definitions for each region
  const createRegionGradients = () => {
    const regions = [
      { id: 'northAmerica', lat: 45, lng: -100 },
      { id: 'southAmerica', lat: -15, lng: -60 },
      { id: 'europe', lat: 50, lng: 10 },
      { id: 'africa', lat: 0, lng: 20 },
      { id: 'asia', lat: 30, lng: 100 },
      { id: 'australia', lat: -25, lng: 135 },
      { id: 'antarctica', lat: -80, lng: 0 }
    ];

    return regions.map(region => {
      const color = getRegionColor(region.lat, region.lng);
      return (
        <linearGradient key={region.id} id={`${region.id}Gradient`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.8" />
          <stop offset="50%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.7" />
        </linearGradient>
      );
    });
  };

  // Get ocean color based on overall data trends - much lighter blues
  const getOceanColor = () => {
    const allData = [...climateData, ...disasters, ...environmentalData];
    if (allData.length === 0) return '#3b82f6'; // Much lighter default blue

    const avgIntensity = getRegionIntensity(0, 0, 180); // Global average
    
    switch (dataType) {
      case 'temperature':
        // Much lighter blue range
        return `rgb(${Math.round(60 + avgIntensity * 80)}, ${Math.round(120 + avgIntensity * 80)}, ${Math.round(220 - avgIntensity * 60)})`;
      case 'disasters':
        // Lighter blue with warmer tones
        return `rgb(${Math.round(70 + avgIntensity * 100)}, ${Math.round(110 - avgIntensity * 40)}, ${Math.round(210 - avgIntensity * 80)})`;
      case 'environmental':
        // Lighter blue-green ocean
        return `rgb(${Math.round(60 + avgIntensity * 80)}, ${Math.round(130 + avgIntensity * 60)}, ${Math.round(200 - avgIntensity * 60)})`;
      default:
        return '#3b82f6'; // Much lighter default
    }
  };

  return (
    <svg
      viewBox="0 0 1000 500"
      className="w-full h-full absolute inset-0"
      style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.3))' }}
    >
      <defs>
        {/* Dynamic Ocean Gradient - Much Lighter */}
        <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={getOceanColor()} />
          <stop offset="50%" stopColor={getOceanColor()} />
          <stop offset="100%" stopColor={getOceanColor()} />
        </linearGradient>

        {/* Dynamic Region Gradients */}
        {createRegionGradients()}

        <filter id="landGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        {/* Pulsing animation for high-intensity areas */}
        <filter id="pulseGlow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Ocean Background with Dynamic Color - Much Lighter */}
      <rect width="1000" height="500" fill="url(#oceanGradient)" />

      {/* Animated Grid Lines - More visible */}
      <g stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" fill="none">
        {/* Longitude lines */}
        {Array.from({ length: 19 }, (_, i) => (
          <line 
            key={`lon-${i}`} 
            x1={i * 55.56} 
            y1="0" 
            x2={i * 55.56} 
            y2="500"
            opacity={0.4 + Math.sin(Date.now() / 2000 + i) * 0.2}
          />
        ))}
        {/* Latitude lines */}
        {Array.from({ length: 9 }, (_, i) => (
          <line 
            key={`lat-${i}`} 
            x1="0" 
            y1={i * 62.5} 
            x2="1000" 
            y2={i * 62.5}
            opacity={0.4 + Math.sin(Date.now() / 2000 + i) * 0.2}
          />
        ))}
      </g>

      {/* North America with Dynamic Coloring */}
      <g fill="url(#northAmericaGradient)" filter="url(#landGlow)">
        {/* Canada */}
        <path d="M50 80 Q100 60 150 70 Q200 65 250 75 Q300 70 350 80 Q400 75 450 85 L450 120 Q400 110 350 115 Q300 120 250 115 Q200 110 150 120 Q100 115 50 125 Z">
          <animate attributeName="opacity" values="0.8;1;0.8" dur="4s" repeatCount="indefinite" />
        </path>
        
        {/* United States */}
        <path d="M80 120 Q130 115 180 125 Q230 120 280 130 Q330 125 380 135 L380 180 Q330 170 280 175 Q230 180 180 175 Q130 170 80 180 Z">
          <animate attributeName="opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite" />
        </path>
        
        {/* Mexico */}
        <path d="M120 180 Q150 175 180 185 Q210 180 240 190 L240 220 Q210 210 180 215 Q150 220 120 210 Z" />
        
        {/* Greenland */}
        <path d="M400 40 Q420 35 440 45 Q460 40 480 50 L480 90 Q460 80 440 85 Q420 90 400 80 Z" />
      </g>

      {/* South America with Dynamic Coloring */}
      <g fill="url(#southAmericaGradient)" filter="url(#landGlow)">
        <path d="M200 220 Q230 215 260 225 Q290 220 320 230 Q340 240 350 260 Q360 280 350 300 Q340 320 330 340 Q320 360 310 380 Q300 400 290 420 L280 440 Q270 430 260 420 Q250 410 240 400 Q230 390 220 380 Q210 370 200 360 Q190 350 185 340 Q180 330 185 320 Q190 310 195 300 Q200 290 195 280 Q190 270 195 260 Q200 250 195 240 Q190 230 200 220 Z">
          <animate attributeName="opacity" values="0.8;1;0.8" dur="5s" repeatCount="indefinite" />
        </path>
      </g>

      {/* Europe with Dynamic Coloring */}
      <g fill="url(#europeGradient)" filter="url(#landGlow)">
        <path d="M480 100 Q510 95 540 105 Q570 100 600 110 L600 150 Q570 140 540 145 Q510 150 480 140 Z">
          <animate attributeName="opacity" values="0.8;1;0.8" dur="3.5s" repeatCount="indefinite" />
        </path>
        
        {/* Scandinavia */}
        <path d="M520 60 Q540 55 560 65 Q580 60 600 70 L600 100 Q580 90 560 95 Q540 100 520 90 Z" />
        
        {/* British Isles */}
        <path d="M460 90 Q470 85 480 95 L480 110 Q470 105 460 110 Z" />
      </g>

      {/* Africa with Dynamic Coloring */}
      <g fill="url(#africaGradient)" filter="url(#landGlow)">
        <path d="M500 150 Q530 145 560 155 Q590 150 620 160 Q640 170 650 190 Q660 210 650 230 Q640 250 630 270 Q620 290 610 310 Q600 330 590 350 Q580 370 570 390 Q560 410 550 430 L540 450 Q530 440 520 430 Q510 420 500 410 Q490 400 485 390 Q480 380 485 370 Q490 360 485 350 Q480 340 485 330 Q490 320 485 310 Q480 300 485 290 Q490 280 485 270 Q480 260 485 250 Q490 240 485 230 Q480 220 485 210 Q490 200 485 190 Q480 180 485 170 Q490 160 500 150 Z">
          <animate attributeName="opacity" values="0.8;1;0.8" dur="4.5s" repeatCount="indefinite" />
        </path>
      </g>

      {/* Asia with Dynamic Coloring */}
      <g fill="url(#asiaGradient)" filter="url(#landGlow)">
        {/* Russia */}
        <path d="M600 70 Q650 65 700 75 Q750 70 800 80 Q850 75 900 85 Q950 80 980 90 L980 130 Q950 120 900 125 Q850 130 800 125 Q750 120 700 130 Q650 125 600 135 Z">
          <animate attributeName="opacity" values="0.8;1;0.8" dur="6s" repeatCount="indefinite" />
        </path>
        
        {/* China */}
        <path d="M700 130 Q730 125 760 135 Q790 130 820 140 L820 180 Q790 170 760 175 Q730 180 700 170 Z">
          <animate attributeName="opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite" />
        </path>
        
        {/* India */}
        <path d="M680 180 Q700 175 720 185 Q740 180 760 190 L760 230 Q740 220 720 225 Q700 230 680 220 Z" />
        
        {/* Middle East */}
        <path d="M620 160 Q640 155 660 165 Q680 160 700 170 L700 200 Q680 190 660 195 Q640 200 620 190 Z" />
      </g>

      {/* Australia with Dynamic Coloring */}
      <g fill="url(#australiaGradient)" filter="url(#landGlow)">
        <path d="M780 350 Q810 345 840 355 Q870 350 900 360 L900 390 Q870 380 840 385 Q810 390 780 380 Z">
          <animate attributeName="opacity" values="0.8;1;0.8" dur="4s" repeatCount="indefinite" />
        </path>
      </g>

      {/* Antarctica with Dynamic Coloring */}
      <g fill="url(#antarcticaGradient)" filter="url(#landGlow)">
        <path d="M100 450 Q200 445 300 455 Q400 450 500 460 Q600 455 700 465 Q800 460 900 470 L900 500 L100 500 Z">
          <animate attributeName="opacity" values="0.8;1;0.8" dur="7s" repeatCount="indefinite" />
        </path>
      </g>

      {/* Islands and Archipelagos with Dynamic Colors */}
      <g filter="url(#landGlow)">
        {/* Japan */}
        <circle cx="850" cy="180" r="8" fill={getRegionColor(35, 139)}>
          <animate attributeName="r" values="8;10;8" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="860" cy="190" r="6" fill={getRegionColor(35, 139)} />
        <circle cx="870" cy="200" r="4" fill={getRegionColor(35, 139)} />
        
        {/* Philippines */}
        <circle cx="820" cy="240" r="4" fill={getRegionColor(14, 121)} />
        <circle cx="830" cy="250" r="3" fill={getRegionColor(14, 121)} />
        <circle cx="825" cy="260" r="3" fill={getRegionColor(14, 121)} />
        
        {/* Indonesia */}
        <circle cx="800" cy="280" r="5" fill={getRegionColor(-6, 107)}>
          <animate attributeName="r" values="5;7;5" dur="4s" repeatCount="indefinite" />
        </circle>
        <circle cx="810" cy="290" r="4" fill={getRegionColor(-6, 107)} />
        <circle cx="820" cy="300" r="3" fill={getRegionColor(-6, 107)} />
        <circle cx="830" cy="310" r="3" fill={getRegionColor(-6, 107)} />
        
        {/* Madagascar */}
        <ellipse cx="620" cy="380" rx="8" ry="20" fill={getRegionColor(-20, 47)} />
        
        {/* New Zealand */}
        <ellipse cx="920" cy="420" rx="4" ry="12" fill={getRegionColor(-41, 174)} />
        <ellipse cx="930" cy="440" rx="3" ry="8" fill={getRegionColor(-41, 174)} />
        
        {/* Caribbean */}
        <circle cx="220" cy="200" r="2" fill={getRegionColor(18, -66)} />
        <circle cx="230" cy="205" r="2" fill={getRegionColor(18, -66)} />
        <circle cx="240" cy="210" r="2" fill={getRegionColor(18, -66)} />
      </g>

      {/* Heat Wave Indicators for High-Intensity Areas */}
      {dataType === 'temperature' && (
        <g>
          {climateData.filter(item => item.temperature > 30).map((item, index) => {
            const x = ((item.lng + 180) / 360) * 1000;
            const y = (1 - ((item.lat + 90) / 180)) * 500;
            return (
              <circle
                key={`heatwave-${index}`}
                cx={x}
                cy={y}
                r="20"
                fill="none"
                stroke="rgba(255, 0, 0, 0.6)"
                strokeWidth="2"
              >
                <animate attributeName="r" values="20;40;20" dur="2s" repeatCount="indefinite" />
                <animate attributeName="stroke-opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite" />
              </circle>
            );
          })}
        </g>
      )}

      {/* Disaster Alert Zones */}
      {dataType === 'disasters' && (
        <g>
          {disasters.filter(item => item.severity === 'High').map((item, index) => {
            const x = ((item.lng + 180) / 360) * 1000;
            const y = (1 - ((item.lat + 90) / 180)) * 500;
            return (
              <circle
                key={`alert-${index}`}
                cx={x}
                cy={y}
                r="25"
                fill="none"
                stroke="rgba(255, 165, 0, 0.8)"
                strokeWidth="3"
              >
                <animate attributeName="r" values="25;50;25" dur="1.5s" repeatCount="indefinite" />
                <animate attributeName="stroke-opacity" values="0.8;0.3;0.8" dur="1.5s" repeatCount="indefinite" />
              </circle>
            );
          })}
        </g>
      )}

      {/* Pollution Clouds */}
      {dataType === 'environmental' && (
        <g>
          {environmentalData.filter(item => item.airQuality > 150).map((item, index) => {
            const x = ((item.lng + 180) / 360) * 1000;
            const y = (1 - ((item.lat + 90) / 180)) * 500;
            return (
              <circle
                key={`pollution-${index}`}
                cx={x}
                cy={y}
                r="30"
                fill="rgba(139, 69, 19, 0.3)"
                stroke="rgba(139, 69, 19, 0.6)"
                strokeWidth="2"
              >
                <animate attributeName="r" values="30;45;30" dur="3s" repeatCount="indefinite" />
                <animate attributeName="fill-opacity" values="0.3;0.1;0.3" dur="3s" repeatCount="indefinite" />
              </circle>
            );
          })}
        </g>
      )}

      {/* Coordinate Labels with Dynamic Opacity - More visible */}
      <g fill="rgba(255,255,255,0.8)" fontSize="10" textAnchor="middle">
        <text x="50" y="15" opacity={0.7 + Math.sin(Date.now() / 3000) * 0.2}>180°W</text>
        <text x="167" y="15" opacity={0.7 + Math.sin(Date.now() / 3000 + 1) * 0.2}>120°W</text>
        <text x="278" y="15" opacity={0.7 + Math.sin(Date.now() / 3000 + 2) * 0.2}>60°W</text>
        <text x="389" y="15" opacity={0.7 + Math.sin(Date.now() / 3000 + 3) * 0.2}>0°</text>
        <text x="500" y="15" opacity={0.7 + Math.sin(Date.now() / 3000 + 4) * 0.2}>60°E</text>
        <text x="611" y="15" opacity={0.7 + Math.sin(Date.now() / 3000 + 5) * 0.2}>120°E</text>
        <text x="722" y="15" opacity={0.7 + Math.sin(Date.now() / 3000 + 6) * 0.2}>180°E</text>
        
        <text x="15" y="65">60°N</text>
        <text x="15" y="127">30°N</text>
        <text x="15" y="189">0°</text>
        <text x="15" y="251">30°S</text>
        <text x="15" y="313">60°S</text>
      </g>

      {/* Real-time Data Indicator */}
      <g>
        <circle cx="950" cy="30" r="8" fill="rgba(0, 255, 0, 0.8)">
          <animate attributeName="fill-opacity" values="0.8;0.3;0.8" dur="1s" repeatCount="indefinite" />
        </circle>
        <text x="935" y="50" fill="rgba(255,255,255,0.8)" fontSize="8">LIVE</text>
      </g>
    </svg>
  );
};

export default WorldMap;