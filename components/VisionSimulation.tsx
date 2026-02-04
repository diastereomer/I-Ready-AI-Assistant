
import React, { useState, useEffect } from 'react';

interface VisionSimulationProps {
  isActive: boolean;
}

const VisionSimulation: React.FC<VisionSimulationProps> = ({ isActive }) => {
  const [scanPos, setScanPos] = useState(0);
  const [showDetections, setShowDetections] = useState(false);

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setScanPos(prev => (prev + 1) % 100);
      }, 30);
      
      // Periodically flicker "Detections" to simulate AI processing
      const detectionInterval = setInterval(() => {
        setShowDetections(true);
        setTimeout(() => setShowDetections(false), 2000);
      }, 5000);

      return () => {
        clearInterval(interval);
        clearInterval(detectionInterval);
      };
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl z-20">
      {/* Scanning Line */}
      <div 
        className="absolute w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_20px_rgba(59,130,246,1)] z-30"
        style={{ top: `${scanPos}%` }}
      />

      {/* Detected Objects Overlay */}
      {showDetections && (
        <div className="absolute inset-0 flex items-center justify-center animate-in fade-in duration-500">
          {/* Triangle Detection Box */}
          <div className="absolute top-[30%] left-[35%] w-64 h-64 border-2 border-dashed border-orange-400 rounded-lg">
            <span className="absolute -top-6 left-0 bg-orange-400 text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase">
              Object: Right Triangle (98%)
            </span>
          </div>
          
          {/* Label Detection */}
          <div className="absolute top-[65%] left-[45%] w-20 h-10 border border-blue-400 rounded">
            <span className="absolute -bottom-5 right-0 text-blue-400 text-[8px] font-bold">Label: "b=4"</span>
          </div>
        </div>
      )}

      {/* Top Banner */}
      <div className="absolute top-6 left-6 flex items-center space-x-3 bg-slate-900/80 text-white px-4 py-2 rounded-2xl text-xs font-bold backdrop-blur-md border border-white/20 shadow-2xl">
        <div className="relative">
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div>
          <div className="absolute inset-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping opacity-75"></div>
        </div>
        <span className="tracking-widest uppercase">Chromebook Vision Add-on</span>
      </div>
      
      {/* Edge Vignette */}
      <div className="absolute inset-0 border-[16px] border-blue-500/10 pointer-events-none"></div>
    </div>
  );
};

export default VisionSimulation;
