import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { DisasterEvent } from '../types';

interface AlertSystemProps {
  disasters: DisasterEvent[];
}

const AlertSystem: React.FC<AlertSystemProps> = ({ disasters }) => {
  const [alerts, setAlerts] = useState<DisasterEvent[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  useEffect(() => {
    const highSeverityDisasters = disasters.filter(
      d => d.severity === 'High' && !dismissedAlerts.has(d.id)
    );
    setAlerts(highSeverityDisasters.slice(0, 3)); // Show max 3 alerts
  }, [disasters, dismissedAlerts]);

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => new Set(prev).add(alertId));
  };

  return (
    <div className="fixed bottom-6 right-6 space-y-3 z-40">
      <AnimatePresence>
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            className="bg-red-600/90 backdrop-blur-md rounded-lg p-4 border border-red-500 min-w-[300px] max-w-[400px]"
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-red-300 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1">
                  {alert.type} Alert
                </h3>
                <p className="text-sm text-red-100 mb-2">{alert.location}</p>
                <p className="text-xs text-red-200">
                  Severity: {alert.severity} | {alert.timestamp}
                </p>
              </div>
              <button
                onClick={() => dismissAlert(alert.id)}
                className="text-red-300 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default AlertSystem;