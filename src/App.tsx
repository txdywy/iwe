import { useEffect } from 'react';
import { useStore } from './store/useStore';
import { WeatherScene } from './components/WeatherScene';
import { LoadingScreen } from './components/LoadingScreen';
import { VibeWidget } from './components/VibeWidget';
import { ChiikawaMascot } from './components/ChiikawaMascot';
import { motion, AnimatePresence } from 'framer-motion';

const getWeatherEmoji = (code: number) => {
  if (code >= 1 && code <= 3) return '⛅';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return '🌧️';
  if (code >= 71 && code <= 77 || code === 85 || code === 86) return '❄️';
  if (code >= 95) return '🌩️';
  return '☀️';
};

function App() {
  const { locations, activeLocationIndex, weatherData, vibeData, loading, vibeLoading, error, initApp, setActiveLocation } = useStore();

  useEffect(() => {
    initApp();
  }, [initApp]);

  if (loading && !weatherData) {
    return <LoadingScreen />;
  }

  if (error && !weatherData) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-black text-white">
        <h1 className="mb-4 text-3xl font-bold font-sans">Error</h1>
        <p className="text-red-400">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 rounded px-6 py-2 bg-white/10 hover:bg-white/20 transition backdrop-blur"
        >
          Retry
        </button>
      </div>
    );
  }

  const activeLoc = locations[activeLocationIndex];
  const condition = weatherData?.condition || 'Clear';

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', { weekday: 'short', day: 'numeric' }).format(date);
  };

  return (
    <main className="relative h-[100dvh] w-screen overflow-hidden font-sans">
      <WeatherScene condition={condition} />

      {/* Main Container */}
      <div className="absolute inset-0 flex flex-col p-6 pt-12 sm:p-12 z-10 pointer-events-none pb-8 h-[100dvh] justify-between">
        
        {/* Top Header Row (Temp & Panels) */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between w-full md:h-auto gap-4 md:gap-8 shrink-0 mt-4 md:mt-0">
          
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeLocationIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative flex flex-col gap-1 sm:gap-2 pointer-events-auto items-center text-center md:items-start md:text-left mt-0 shrink-0"
            >
              <ChiikawaMascot />
              <h1 className="text-8xl md:text-9xl font-extralight tracking-tighter text-white drop-shadow-2xl m-0 leading-none mt-4 md:mt-0">
                {weatherData?.temperature.toFixed(0)}°
              </h1>
              <h2 className="text-4xl md:text-5xl font-medium text-white/95 drop-shadow-md m-0 mt-2 tracking-tight">
                {activeLoc?.city || 'Resolving...'}
              </h2>
              <p className="text-xl md:text-2xl text-white/90 tracking-wide font-light mt-1">
                {condition} 
              </p>
              
              {/* Extra Metrics panel */}
              <div className="flex w-full overflow-x-auto no-scrollbar gap-3 mt-4 md:mt-6 pb-2 snap-x justify-center md:justify-start max-w-[100vw] px-1 mask-linear-fade">
                {weatherData?.aqi !== undefined && (
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-3 flex flex-col items-center justify-center min-w-[100px] shadow-lg">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-white/50 mb-1">AQI EU</span>
                    <span className="text-xl font-medium text-white">{weatherData.aqi}</span>
                  </div>
                )}
                {weatherData?.uvIndex !== undefined && (
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-3 flex flex-col items-center justify-center min-w-[100px] shadow-lg">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-white/50 mb-1">UV Index</span>
                    <span className="text-xl font-medium text-white">{weatherData.uvIndex}</span>
                  </div>
                )}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-3 flex flex-col items-center justify-center min-w-[100px] shadow-lg">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-white/50 mb-1">Rain Prob</span>
                  <span className="text-xl font-medium text-white">{weatherData?.precipitationProb}%</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Location Drawer */}
          <div className="pointer-events-auto md:w-80 shrink-0 mx-auto md:mx-0 w-full max-w-sm hidden md:block">
            <div className="rounded-[32px] border border-white/20 bg-white/10 p-5 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]">
              <h3 className="mb-4 text-[11px] font-bold tracking-[0.2em] text-white/50 text-left uppercase pl-2">
                Locations
              </h3>
              <div className="flex flex-col gap-2 max-h-[40vh] overflow-y-auto no-scrollbar scroll-smooth">
                {locations.map((loc, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveLocation(idx)}
                    className={`flex items-center justify-between rounded-2xl px-5 py-4 transition-all active:scale-95 duration-300 ${
                      idx === activeLocationIndex
                        ? 'bg-white/20 shadow-lg border border-white/40 text-white'
                        : 'bg-white/5 hover:bg-white/10 border border-transparent text-white/70 hover:text-white'
                    }`}
                  >
                    <span className="font-medium text-base truncate pr-3">{loc.city || 'Resolving...'}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 bg-black/40 px-2 py-1 flex-shrink-0 rounded-md">
                      {loc.source}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mt-6">
              <VibeWidget vibeData={vibeData} loading={vibeLoading} />
            </div>
          </div>
        </div>

        {/* Bottom Drawer For Forecast & Mobile Location (Scrollable Row) */}
        <div className="w-full flex-col gap-4 mt-auto pointer-events-auto z-20 shrink-0 hidden md:flex">
           {weatherData?.forecast && weatherData.forecast.length > 0 && (
             <div className="w-full overflow-x-auto no-scrollbar rounded-[32px] border border-white/20 bg-white/5 backdrop-blur-xl p-6 shadow-2xl flex gap-6 snap-x snap-mandatory">
                {weatherData.forecast.map((fc, i) => (
                  <div key={i} className="flex flex-col items-center justify-center shrink-0 w-24 snap-center space-y-3">
                    <span className="text-white/70 text-sm font-medium">{formatDate(fc.time)}</span>
                    <span className="text-3xl filter drop-shadow-md">{getWeatherEmoji(fc.weatherCode)}</span>
                    <div className="flex gap-2 text-white">
                      <span className="font-semibold">{fc.maxTemp.toFixed(0)}°</span>
                      <span className="opacity-50">{fc.minTemp.toFixed(0)}°</span>
                    </div>
                  </div>
                ))}
             </div>
           )}
        </div>

        {/* ── Mobile Bottom Sheet ── (md:hidden) */}
        <div className="md:hidden flex flex-col w-full mt-auto pointer-events-auto z-20 shrink-0 gap-3 pb-6">

          {/* Pull indicator bar */}
          <div className="flex justify-center pt-1 pb-0">
            <motion.div
              animate={{ scaleX: [1, 0.7, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-10 h-1 rounded-full bg-white/40"
            />
          </div>

          {/* Scrollable stack */}
          <div className="flex flex-col gap-3 overflow-y-auto mobile-sheet max-h-[52vh] px-1">

            {/* 1. Vibe Widget — full width on mobile */}
            <div className="shrink-0 w-full">
              <VibeWidget vibeData={vibeData} loading={vibeLoading} />
            </div>

            {/* 2. Forecast horizontal scroll */}
            {weatherData?.forecast && weatherData.forecast.length > 0 && (
              <div className="shrink-0 w-full">
                {/* Card header */}
                <div className="flex items-center gap-2 mb-2 px-1">
                  <span className="text-[10px] uppercase font-bold tracking-[0.18em] text-white/40">Forecast</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>
                <div className="overflow-x-auto no-scrollbar scroll-fade-x rounded-3xl border border-white/15 bg-black/40 backdrop-blur-2xl shadow-[0_4px_24px_rgba(0,0,0,0.4)] flex gap-2 p-4">
                  {weatherData.forecast.map((fc, i) => (
                    <div key={i} className={`flex flex-col items-center shrink-0 w-[62px] gap-1.5 py-2 px-1 rounded-2xl transition-all ${i === 0 ? 'bg-white/15 border border-white/25' : ''}`}>
                      <span className="text-white/60 text-[10px] font-semibold whitespace-nowrap">{formatDate(fc.time)}</span>
                      <span className="text-2xl">{getWeatherEmoji(fc.weatherCode)}</span>
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-white font-bold text-sm leading-none">{fc.maxTemp.toFixed(0)}°</span>
                        <span className="text-white/35 text-[11px] leading-none">{fc.minTemp.toFixed(0)}°</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Location Selector — horizontal pill carousel */}
            <div className="shrink-0 w-full">
              <div className="flex items-center gap-2 mb-2 px-1">
                <span className="text-[10px] uppercase font-bold tracking-[0.18em] text-white/40">Locations</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
              <div className="overflow-x-auto no-scrollbar scroll-fade-x flex gap-2 py-1">
                {locations.map((loc, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => setActiveLocation(idx)}
                    whileTap={{ scale: 0.93 }}
                    className={`shrink-0 flex flex-col items-start gap-0.5 px-4 py-3 rounded-2xl border transition-all duration-300 ${
                      idx === activeLocationIndex
                        ? 'bg-white/25 border-white/40 text-white shadow-[0_0_16px_rgba(255,255,255,0.1)]'
                        : 'bg-black/30 border-white/10 text-white/60 backdrop-blur-xl'
                    }`}
                  >
                    <span className="font-semibold text-sm whitespace-nowrap max-w-[120px] truncate">{loc.city || '...'}</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">{loc.source}</span>
                  </motion.button>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}

export default App;
