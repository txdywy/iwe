import { useEffect, lazy, Suspense, useState } from 'react';
import { useStore } from './store/useStore';
import { useShallow } from 'zustand/shallow';
import { LoadingScreen } from './components/LoadingScreen';
import { ChiikawaMascot } from './components/ChiikawaMascot';
import { motion, AnimatePresence } from 'framer-motion';
import { MetricCard, ForecastCard, LocationButton } from './components/WeatherUIComponents';
import { getWeatherEmoji } from './utils/weatherIcons';
import type { WeatherCondition } from './types/weather';

// Lazy load non-critical components
const WeatherScene = lazy(() => import('./components/WeatherScene').then(m => ({ default: m.WeatherScene })));
const VibeWidget = lazy(() => import('./components/VibeWidget').then(m => ({ default: m.VibeWidget })));
const HackerNewsWidget = lazy(() => import('./components/HackerNewsWidget').then(m => ({ default: m.HackerNewsWidget })));
const IPDataWidget = lazy(() => import('./components/IPDataWidget').then(m => ({ default: m.IPDataWidget })));

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
  } = useStore(useShallow((s) => ({
    locations: s.locations,
    activeLocationIndex: s.activeLocationIndex,
    weatherData: s.weatherData,
    vibeData: s.vibeData,
    loading: s.loading,
    vibeLoading: s.vibeLoading,
    error: s.error,
    initApp: s.initApp,
    setActiveLocation: s.setActiveLocation
  })));

  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    initApp();
  }, [initApp]);

  useEffect(() => {
    // If it takes longer than 1.5s, we drop the full-screen loader and prioritize the main UI with skeletons.
    const timer = setTimeout(() => setShowLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading && !weatherData && showLoading) {
    return <LoadingScreen />;
  }

  const activeLoc = locations[activeLocationIndex];
  const condition: WeatherCondition = weatherData?.condition ?? 'Clear';

  return (
    <main className="relative min-h-screen w-full font-sans">
      {/* Weather Scene Fixed Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none" style={{ contain: 'strict' }}>
        <Suspense fallback={<div className="absolute inset-0 bg-gray-900" />}>
          <WeatherScene condition={condition} timezone={weatherData?.timezone} />
        </Suspense>
      </div>

      {/* Main content flow container */}
      <div className="relative z-10 flex flex-col items-center w-full px-4 py-8 md:py-16 gap-8 md:gap-12 pb-16">
        
        {/* Mobile-Only Location Pill Scroller (Top) */}
        {locations.length > 0 && (
          <div className="md:hidden w-full flex flex-col gap-2 mt-2">
             <div className="flex items-center justify-between">
               <div className="overflow-x-auto no-scrollbar scroll-fade-x flex gap-2 py-1 px-1 flex-1 pr-2" role="listbox" aria-label="Locations">
                  {locations.map((loc, idx) => (
                    <LocationButton
                      key={loc.lat + '-' + loc.lon}
                      city={loc.city || '...'}
                      source={loc.source}
                      isActive={idx === activeLocationIndex}
                      onClick={() => setActiveLocation(idx)}
                    />
                  ))}
               </div>
               <div className="shrink-0 ml-2">
                 <ChiikawaMascot />
               </div>
             </div>
          </div>
        )}

        {/* Row 1: Weather Info & Secondary Controls */}
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_450px] w-full max-w-[1400px] gap-8 lg:gap-12">
          
          {/* Left Panel: Hero Temperature */}
          <AnimatePresence mode="popLayout">
            <motion.div 
              key={activeLocationIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center text-center lg:items-start lg:text-left shrink-0 md:pt-4 w-full"
            >
              <div className="relative">
                 {/* Desktop Mascot */}
                 <div className="hidden md:block">
                   <ChiikawaMascot />
                 </div>
                 <h1 
                    className="text-8xl md:text-[10rem] font-extralight tracking-normal text-white drop-shadow-2xl m-0 leading-none"
                    aria-label={`${weatherData?.temperature?.toFixed(0) ?? '--'} degrees`}
                 >
                   {weatherData?.temperature?.toFixed(0) ?? '--'}°
                 </h1>
              </div>
              <h2 className="text-4xl md:text-5xl font-medium text-white/95 drop-shadow-md m-0 mt-4 tracking-tight flex items-center gap-3">
                {activeLoc?.city || (error ? 'Location Error' : 'Resolving...')}
                {loading && <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin shrink-0" />}
              </h2>
              
              {error && !weatherData && (
                <div className="mt-4 text-red-300 bg-red-900/40 px-4 py-2 rounded-xl text-sm border border-red-500/30 flex items-center gap-3 backdrop-blur-sm">
                  <span>{error}</span>
                  <button onClick={() => initApp()} className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-md transition-colors whitespace-nowrap">Retry</button>
                </div>
              )}

              <p className="text-xl md:text-2xl text-white/90 tracking-wide font-light mt-2 uppercase">
                {condition} 
              </p>
              
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 mt-6 md:mt-8 w-full">
                <MetricCard label="AQI" value={weatherData?.aqi ?? '--'} />
                <MetricCard label="UV" value={weatherData?.uvIndex ?? '--'} />
                <MetricCard label="Rain" value={weatherData?.precipitationProb ?? '--'} unit="%" />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Right Panel: Vibe & Locations */}
          <div className="flex flex-col gap-6 w-full max-w-lg lg:max-w-none mx-auto lg:mx-0 shrink-0">
            {/* Desktop Location List */}
            <div className="hidden md:block rounded-[24px] border border-white/20 bg-white/10 p-6 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
              <h3 className="mb-4 text-micro font-bold tracking-super-wide text-white/70 text-left uppercase pl-2 flex items-center gap-2">
                Discovery Nodes
                {loading && <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
              </h3>
              <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto no-scrollbar scroll-fade-y pr-1" role="listbox" aria-label="Locations">
                {locations.length === 0 && !error && (
                  <div className="text-white/40 text-sm p-2 italic animate-pulse">Scanning frequencies...</div>
                )}
                {locations.map((loc, idx) => (
                  <LocationButton
                    key={loc.lat + '-' + loc.lon}
                    city={loc.city || 'Resolving...'}
                    source={loc.source}
                    isActive={idx === activeLocationIndex}
                    onClick={() => setActiveLocation(idx)}
                  />
                ))}
              </div>
            </div>
            
            <Suspense fallback={<div className="h-64 rounded-[24px] bg-white/5 animate-pulse" />}>
              <VibeWidget vibeData={vibeData} loading={vibeLoading || (loading && !vibeData)} />
            </Suspense>
          </div>
        </div>

        {/* Row 2: Forecast Grid (Spans width) */}
        {weatherData?.forecast && weatherData.forecast.length > 0 && (
          <div className="w-full max-w-[1400px]">
             <div className="flex items-center gap-4 mb-4 px-2">
                <span className="text-micro uppercase font-bold tracking-super-wide text-white/70">Temporal Trajectory</span>
                <div className="flex-1 h-px bg-white/10" />
             </div>
             <div className="w-full overflow-x-auto scroll-fade-x no-scrollbar rounded-[24px] md:rounded-[32px] border border-white/10 md:border-white/20 bg-black/40 md:bg-white/5 backdrop-blur-xl md:backdrop-blur-2xl p-4 md:p-8 flex gap-4 md:gap-8 snap-x" role="listbox">
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
          </div>
        )}

        {/* Row 3: Hacker News Wide Module */}
        <div className="w-full max-w-[1400px]">
          <Suspense fallback={<div className="h-48 rounded-[24px] bg-white/5 animate-pulse" />}>
            <HackerNewsWidget />
          </Suspense>
        </div>

        {/* Row 4: IP Data Module */}
        <div className="w-full max-w-[1400px]">
          <Suspense fallback={<div className="h-32 rounded-[24px] bg-white/5 animate-pulse" />}>
            <IPDataWidget />
          </Suspense>
        </div>

      </div>
    </main>
  );
}

export default App;
