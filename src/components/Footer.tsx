import React from 'react';
import { Globe, Github, Heart, MapPin, Calendar } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-sm border-t border-gray-800 z-40">
      <div className="max-w-7xl mx-auto px-6 py-2">
        <div className="flex items-center justify-between">
          {/* Left Section - Brand & Award */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-blue-400" />
              <span className="font-semibold text-white text-sm">GEOSTORM</span>
            </div>
            <div className="hidden lg:flex items-center space-x-1 text-xs text-yellow-400">
              <span className="text-xs">🏆</span>
              <span>Google Maps Platform Award Winner 2025</span>
            </div>
          </div>

          {/* Center Section - Links */}
          <div className="hidden sm:flex items-center space-x-6 text-xs text-gray-400">
            <div className="flex items-center space-x-1">
              <MapPin className="w-3 h-3" />
              <span>Real-time Environmental Monitoring</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>Updated Live</span>
            </div>
          </div>

          {/* Right Section - Copyright & Links */}
          <div className="flex items-center space-x-4 text-xs text-gray-400">
            <div className="hidden md:flex items-center space-x-4">
              <a 
                href="https://github.com/NEXBIT-X/GEOSTORM" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-1 hover:text-blue-400 transition-colors"
              >
                <Github className="w-3 h-3" />
                <span>GitHub</span>
              </a>
            </div>
            <div className="flex items-center space-x-1">
              <span>© {currentYear} Made with</span>
              <Heart className="w-3 h-3 text-red-400" />
              <span>by NEXBIT-X</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;