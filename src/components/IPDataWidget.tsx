import { memo } from 'react';
import { useStore } from '../store/useStore';
import { useShallow } from 'zustand/shallow';

export const IPDataWidget = memo(() => {
  const { locations } = useStore(useShallow(s => ({ locations: s.locations })));
  
  const ipLocations = locations.filter(loc => loc.ip);

  if (ipLocations.length === 0) return null;

  return (
    <div className="w-full md:max-w-none rounded-[24px] md:rounded-[32px] border border-white/10 md:border-white/20 bg-black/40 md:bg-white/5 backdrop-blur-xl md:backdrop-blur-2xl p-4 md:px-6 md:pt-5 md:pb-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] flex flex-col gap-4 mt-2 md:mt-0">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00ffcc] animate-pulse shadow-[0_0_8px_rgba(0,255,204,0.8)]" />
          <span className="text-micro uppercase font-black tracking-[0.25em] text-white/60">Network Telemetry</span>
        </div>
        <span className="text-[10px] font-bold text-[#00ffcc]/80 tracking-widest uppercase">
          {ipLocations.length} Node{ipLocations.length > 1 ? 's' : ''}
        </span>
      </div>
      
      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {ipLocations.map((loc) => (
          <div
            key={loc.lat + '-' + loc.lon + '-' + loc.source}
            className="flex flex-col gap-2 p-4 rounded-2xl bg-white/5 border border-white/5 transition-all duration-300 hover:bg-white/10 hover:border-white/10"
          >
            <div className="flex justify-between items-start gap-2">
              <div className="flex flex-col">
                <span className="text-[#00ffcc]/90 text-sm font-mono tracking-tight break-all">
                  {loc.ipv4?.join(', ') || loc.ip?.join(', ')}
                </span>
                {loc.ipv6 && loc.ipv6.length > 0 && loc.ipv6[0] !== (loc.ipv4?.[0] || loc.ip?.[0]) && (
                  <span className="text-[#00ffcc]/60 text-[10px] font-mono tracking-tight break-all mt-0.5">
                    {loc.ipv6.join(', ')}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-white/40 bg-black/30 px-2 py-1 rounded shrink-0">
                {loc.source.split('+')[0].split(' ')[0]}
              </span>
            </div>
            
            <div className="flex flex-col gap-1.5 mt-2">
              <div className="flex items-center gap-2 text-micro text-white/50 font-medium">
                <span className="text-white/30 uppercase tracking-widest text-[9px] w-8">ISP</span>
                <span className="truncate text-white/80">{loc.isp?.join(', ') || 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-2 text-micro text-white/50 font-medium">
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
});
