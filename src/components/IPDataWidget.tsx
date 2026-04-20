import React from 'react';
import { useStore } from '../store/useStore';

export const IPDataWidget: React.FC = () => {
  const { locations } = useStore();
  
  const ipLocations = locations.filter(loc => loc.ip);

  if (ipLocations.length === 0) return null;

  return (
    <div className="w-full md:max-w-none md:rounded-[32px] md:border md:border-white/20 md:bg-white/5 md:backdrop-blur-2xl md:px-6 md:pt-5 md:pb-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] flex flex-col gap-4 mt-2 md:mt-0">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00ffcc] animate-pulse shadow-[0_0_8px_rgba(0,255,204,0.8)]" />
          <span className="text-[11px] uppercase font-black tracking-[0.25em] text-white/60">Network Telemetry</span>
        </div>
        <span className="text-[10px] font-bold text-[#00ffcc]/80 tracking-widest uppercase">
          {ipLocations.length} Node{ipLocations.length > 1 ? 's' : ''}
        </span>
      </div>
      
      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {ipLocations.map((loc, i) => (
          <div
            key={i}
            className="flex flex-col gap-2 p-4 rounded-2xl bg-white/5 border border-white/5 transition-all duration-300 hover:bg-white/10 hover:border-white/10"
          >
            <div className="flex justify-between items-start gap-2">
              <span className="text-[#00ffcc]/90 text-sm font-mono tracking-tight break-all">
                {loc.ip}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-white/40 bg-black/30 px-2 py-1 rounded shrink-0">
                {loc.source.split('+')[0].split(' ')[0]}
              </span>
            </div>
            
            <div className="flex flex-col gap-1.5 mt-2">
              <div className="flex items-center gap-2 text-[11px] text-white/50 font-medium">
                <span className="text-white/30 uppercase tracking-widest text-[9px] w-8">ISP</span>
                <span className="truncate text-white/80">{loc.isp || 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-white/50 font-medium">
                <span className="text-white/30 uppercase tracking-widest text-[9px] w-8">LOC</span>
                <span className="truncate text-white/80">
                  {[loc.city, loc.country].filter(Boolean).join(', ') || 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
