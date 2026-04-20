import React from 'react';
import { motion } from 'framer-motion';

export const MetricCard: React.FC<{ label: string; value: string | number; unit?: string }> = ({ label, value, unit }) => (
  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-3 flex flex-col items-center justify-center min-w-[100px] shadow-lg">
    <span className="text-[10px] uppercase font-bold tracking-widest text-white/50 mb-1">{label}</span>
    <span className="text-xl font-medium text-white">{value}{unit}</span>
  </div>
);

export const ForecastCard: React.FC<{ 
  time: string; 
  emoji: string; 
  maxTemp: number; 
  minTemp: number;
  isMobile?: boolean;
  isActive?: boolean;
}> = ({ time, emoji, maxTemp, minTemp, isMobile, isActive }) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', { weekday: 'short', day: 'numeric' }).format(date);
  };

  if (isMobile) {
    return (
      <div className={`flex flex-col items-center shrink-0 w-[62px] gap-1.5 py-2 px-1 rounded-2xl transition-all ${isActive ? 'bg-white/15 border border-white/25' : ''}`}>
        <span className="text-white/60 text-[10px] font-semibold whitespace-nowrap">{formatDate(time)}</span>
        <span className="text-2xl">{emoji}</span>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-white font-bold text-sm leading-none">{maxTemp.toFixed(0)}°</span>
          <span className="text-white/35 text-[11px] leading-none">{minTemp.toFixed(0)}°</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center shrink-0 w-24 snap-center space-y-3">
      <span className="text-white/70 text-sm font-medium">{formatDate(time)}</span>
      <span className="text-3xl filter drop-shadow-md">{emoji}</span>
      <div className="flex gap-2 text-white">
        <span className="font-semibold">{maxTemp.toFixed(0)}°</span>
        <span className="opacity-50">{minTemp.toFixed(0)}°</span>
      </div>
    </div>
  );
};

export const LocationButton: React.FC<{
  city: string;
  source: string;
  isActive: boolean;
  onClick: () => void;
  isMobile?: boolean;
}> = ({ city, source, isActive, onClick, isMobile }) => {
  if (isMobile) {
    return (
      <motion.button
        onClick={onClick}
        whileTap={{ scale: 0.93 }}
        className={`shrink-0 flex flex-col items-start gap-0.5 px-4 py-3 rounded-2xl border transition-all duration-300 ${
          isActive
            ? 'bg-white/25 border-white/40 text-white shadow-[0_0_16px_rgba(255,255,255,0.1)]'
            : 'bg-black/30 border-white/10 text-white/60 backdrop-blur-xl'
        }`}
        aria-pressed={isActive}
        aria-label={`Select location ${city}`}
      >
        <span className="font-semibold text-sm whitespace-nowrap max-w-[120px] truncate">{city || '...'}</span>
        <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">{source}</span>
      </motion.button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between rounded-2xl px-5 py-4 transition-all active:scale-95 duration-300 ${
        isActive
          ? 'bg-white/20 shadow-lg border border-white/40 text-white'
          : 'bg-white/5 hover:bg-white/10 border border-transparent text-white/70 hover:text-white'
      }`}
      aria-pressed={isActive}
      aria-label={`Select location ${city}`}
    >
      <span className="font-medium text-base truncate pr-3">{city || 'Resolving...'}</span>
      <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 bg-black/40 px-2 py-1 flex-shrink-0 rounded-md">
        {source}
      </span>
    </button>
  );
};
