import React from 'react';

export const MetricCard: React.FC<{ label: string; value: string | number; unit?: string }> = ({ label, value, unit }) => (
  <div className="bg-black/30 md:bg-white/10 backdrop-blur-xl border border-white/10 md:border-white/20 rounded-2xl px-4 py-3 flex flex-col items-center justify-center min-w-[100px] shadow-lg">
    <span className="text-micro uppercase font-bold tracking-super-wide text-white/60 mb-1">{label}</span>
    <span className="text-xl font-medium text-white">{value}{unit}</span>
  </div>
);

export const ForecastCard: React.FC<{ 
  time: string; 
  emoji: string; 
  maxTemp: number; 
  minTemp: number;
  isActive?: boolean;
}> = ({ time, emoji, maxTemp, minTemp, isActive }) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', { weekday: 'short', day: 'numeric' }).format(date);
  };

  return (
    <div 
      className={`flex flex-col items-center justify-center shrink-0 w-20 md:w-24 snap-center space-y-2 md:space-y-3 p-2 md:p-0 rounded-2xl transition-all ${isActive ? 'bg-white/10 border border-white/20' : 'border border-transparent'}`}
      role="option"
      aria-selected={isActive}
    >
      <span className="text-white/60 text-tiny font-medium whitespace-nowrap">{formatDate(time)}</span>
      <span className="text-3xl md:text-4xl filter drop-shadow-md">{emoji}</span>
      <div className="flex gap-2 text-white">
        <span className="font-semibold text-sm md:text-base">{maxTemp.toFixed(0)}°</span>
        <span className="opacity-50 text-sm md:text-base">{minTemp.toFixed(0)}°</span>
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
      <button
        onClick={onClick}
        className={`shrink-0 flex flex-col items-start gap-1 px-4 py-3 rounded-[20px] border transition-all duration-300 ${
          isActive
            ? 'bg-white/25 border-white/40 text-white shadow-[0_0_16px_rgba(255,255,255,0.1)]'
            : 'bg-black/40 border-white/10 text-white/60 backdrop-blur-xl hover:bg-black/60'
        }`}
        aria-pressed={isActive}
        aria-label={`Select location ${city}`}
      >
        <span className="font-semibold text-sm whitespace-nowrap max-w-[120px] truncate">{city || '...'}</span>
        <span className="text-[9px] font-bold uppercase tracking-super-wide opacity-60">{source}</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between rounded-2xl px-5 py-4 transition-all active:scale-95 duration-300 ${
        isActive
          ? 'bg-white/20 shadow-lg border border-white/40 text-white'
          : 'bg-white/5 hover:bg-white/10 border border-transparent text-white/60 hover:text-white/90'
      }`}
      aria-pressed={isActive}
      aria-label={`Select location ${city}`}
    >
      <span className="font-medium text-sm truncate pr-3">{city || 'Resolving...'}</span>
      <span className="text-[9px] font-bold uppercase tracking-super-wide text-white/60 bg-black/40 px-2 py-1 flex-shrink-0 rounded-md">
        {source}
      </span>
    </button>
  );
};
