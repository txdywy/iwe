import { memo } from 'react';

export const MetricCard = memo(({ label, value, unit }: { label: string; value: string | number; unit?: string }) => (
  <div className="bg-black/30 md:bg-white/10 backdrop-blur-xl border border-white/10 md:border-white/20 rounded-2xl px-4 py-3 flex flex-col items-center justify-center min-w-[100px] shadow-lg">
    <span className="text-micro uppercase font-bold tracking-super-wide text-white/70 mb-1">{label}</span>
    <span className="text-xl font-medium text-white">{value}{unit}</span>
  </div>
));

const dateFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'short', day: 'numeric' });

const formatDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  if (year && month && day) {
    return dateFormatter.format(new Date(year, month - 1, day));
  }
  return dateFormatter.format(new Date(dateStr));
};

export const ForecastCard = memo(({ 
  time, 
  emoji, 
  maxTemp, 
  minTemp,
}: { 
  time: string; 
  emoji: string; 
  maxTemp: number; 
  minTemp: number;
}) => {
  return (
    <div 
      className="flex flex-col items-center justify-center shrink-0 w-20 md:w-24 snap-center space-y-2 md:space-y-3 p-2 md:p-0 rounded-2xl border border-transparent"
      role="option"
      aria-selected={false}
    >
      <span className="text-white/70 text-tiny font-medium whitespace-nowrap">{formatDate(time)}</span>
      <span className="text-3xl md:text-4xl filter drop-shadow-md">{emoji}</span>
      <div className="flex gap-2 text-white">
        <span className="font-semibold text-sm md:text-base">{maxTemp.toFixed(0)}°</span>
        <span className="opacity-50 text-sm md:text-base">{minTemp.toFixed(0)}°</span>
      </div>
    </div>
  );
});

export const LocationButton = memo(({
  city,
  source,
  isActive,
  onClick
}: {
  city: string;
  source: string;
  isActive: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex shrink-0 transition-all active:scale-95 duration-300
        ${/* Mobile styles (default) */ ""}
        flex-col items-start gap-1 px-4 py-3 rounded-[20px] border
        ${/* Desktop styles (md:) */ ""}
        md:flex-row md:items-center md:justify-between md:rounded-2xl md:px-5 md:py-4 md:gap-0
        ${isActive
          ? 'bg-white/20 shadow-lg border-white/40 text-white'
          : 'bg-black/40 md:bg-white/5 border-white/10 md:border-transparent text-white/60 hover:text-white/90 hover:bg-black/60 md:hover:bg-white/10'
        }`}
      aria-pressed={isActive}
      aria-label={`Select location ${city}`}
    >
      <span className="font-semibold md:font-medium text-sm whitespace-nowrap md:truncate md:max-w-none max-w-[120px] truncate md:pr-3">
        {city || (isActive ? 'Resolving...' : '...')}
      </span>
      <span className="text-[9px] font-bold uppercase tracking-super-wide text-white/60 bg-black/40 px-2 py-1 flex-shrink-0 rounded-md">
        {source}
      </span>
    </button>
  );
});
