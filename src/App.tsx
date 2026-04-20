import { useEffect } from 'react';
import { useStore } from './store/useStore';
import { WeatherScene } from './components/WeatherScene';
import { LoadingScreen } from './components/LoadingScreen';
import { VibeWidget } from './components/VibeWidget';
import { ChiikawaMascot } from './components/ChiikawaMascot';
import { motion, AnimatePresence } from 'framer-motion';
import { MetricCard, ForecastCard, LocationButton } from './components/WeatherUIComponents';
import { getWeatherEmoji } from './utils/weatherIcons';

function App() {
  const { 
    locations, 
    activeLocationIndex, 
    weatherData, 
    vibeData, 
    loading, 
    vibeLoading, 
    error, 
    initApp, 
    setActiveLocation 
  } = useStore();

  useEffect(() => {
    initApp();
  }, [initApp]);

  if (loading && !weatherData) {
    return <LoadingScreen />;
  }

  if (error && !weatherData) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-black text-white p-6">
        <h1 className="mb-4 text-3xl font-bold font-sans">Error</h1>
        <p className="text-red-400 text-center max-w-md">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 rounded px-6 py-2 bg-white/10 hover:bg-white/20 transition backdrop-blur border border-white/10"
        >
          Retry
        </button>
      </div>
    );
  }

  const activeLoc = locations[activeLocationIndex];
  const condition = weatherData?.condition || 'Clear';

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
              <div className="relative">
                 <ChiikawaMascot />
                 <h1 className="text-8xl md:text-9xl font-extralight tracking-tighter text-white drop-shadow-2xl m-0 leading-none mt-4 md:mt-0">
                   {weatherData?.temperature.toFixed(0)}°
                 </h1>
              </div>
              <h2 className="text-4xl md:text-5xl font-medium text-white/95 drop-shadow-md m-0 mt-2 tracking-tight">
                {activeLoc?.city || 'Resolving...'}
              </h2>
              <p className="text-xl md:text-2xl text-white/90 tracking-wide font-light mt-1">
                {condition} 
              </p>
              
              {/* Extra Metrics panel */}
              <div className="flex w-full overflow-x-auto no-scrollbar gap-3 mt-4 md:mt-6 pb-2 snap-x justify-center md:justify-start max-w-[100vw] px-1 mask-linear-fade">
                {weatherData?.aqi !== undefined && (
                  <MetricCard label="AQI EU" value={weatherData.aqi} />
                )}
                {weatherData?.uvIndex !== undefined && (
                  <MetricCard label="UV Index" value={weatherData.uvIndex} />
                )}
                <MetricCard label="Rain Prob" value={weatherData?.precipitationProb || 0} unit="%" />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Desktop Sidebar: Location Drawer & Vibe Widget */}
          <div className="pointer-events-auto md:w-80 shrink-0 mx-auto md:mx-0 w-full max-w-sm hidden md:block">
            <div className="rounded-[32px] border border-white/20 bg-white/10 p-5 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]">
              <h3 className="mb-4 text-[11px] font-bold tracking-[0.2em] text-white/50 text-left uppercase pl-2">
                Locations
              </h3>
              <div className="flex flex-col gap-2 max-h-[40vh] overflow-y-auto no-scrollbar scroll-smooth">
                {locations.map((loc, idx) => (
                  <LocationButton
                    key={idx}
                    city={loc.city || 'Resolving...'}
                    source={loc.source}
                    isActive={idx === activeLocationIndex}
                    onClick={() => setActiveLocation(idx)}
                  />
                ))}
              </div>
            </div>
            
            <div className="mt-6">
              <VibeWidget vibeData={vibeData} loading={vibeLoading} />
            </div>
          </div>
        </div>

        {/* Desktop Bottom Drawer For Forecast */}
        <div className="w-full flex-col gap-4 mt-auto pointer-events-auto z-20 shrink-0 hidden md:flex">
           {weatherData?.forecast && weatherData.forecast.length > 0 && (
             <div className="w-full overflow-x-auto no-scrollbar rounded-[32px] border border-white/20 bg-white/5 backdrop-blur-xl p-6 shadow-2xl flex gap-6 snap-x snap-mandatory">
                {weatherData.forecast.map((fc, i) => (
                  <ForecastCard
                    key={i}
                    time={fc.time}
                    emoji={getWeatherEmoji(fc.weatherCode)}
                    maxTemp={fc.maxTemp}
                    minTemp={fc.minTemp}
                  />
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
                <div className="flex items-center gap-2 mb-2 px-1">
                  <span className="text-[10px] uppercase font-bold tracking-[0.18em] text-white/40">Forecast</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>
                <div className="overflow-x-auto no-scrollbar scroll-fade-x rounded-3xl border border-white/15 bg-black/40 backdrop-blur-2xl shadow-[0_4px_24px_rgba(0,0,0,0.4)] flex gap-2 p-4">
                  {weatherData.forecast.map((fc, i) => (
                    <ForecastCard
                      key={i}
                      time={fc.time}
                      emoji={getWeatherEmoji(fc.weatherCode)}
                      maxTemp={fc.maxTemp}
                      minTemp={fc.minTemp}
                      isMobile
                      isActive={i === 0}
                    />
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
                  <LocationButton
                    key={idx}
                    city={loc.city || '...'}
                    source={loc.source}
                    isActive={idx === activeLocationIndex}
                    onClick={() => setActiveLocation(idx)}
                    isMobile
                  />
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
