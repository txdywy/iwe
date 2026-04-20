import { useEffect, lazy, Suspense } from 'react';
import { useStore } from './store/useStore';
import { useShallow } from 'zustand/shallow';
import { LoadingScreen } from './components/LoadingScreen';
import { ChiikawaMascot } from './components/ChiikawaMascot';
import { motion, AnimatePresence } from 'framer-motion';
import { MetricCard, ForecastCard, LocationButton } from './components/WeatherUIComponents';
import { getWeatherEmoji } from './utils/weatherIcons';

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

  useEffect(() => {
    initApp();
  }, [initApp]);

  if (loading && !weatherData) {
    return <LoadingScreen />;
  }

  if (error && !weatherData) {
    return (
      <div className="relative flex h-screen w-screen flex-col items-center justify-center bg-black text-white p-6">
        <div className="absolute inset-0 -z-10 pointer-events-none opacity-50">
          <Suspense fallback={null}>
            <WeatherScene condition="Clear" />
          </Suspense>
        </div>
        <h1 className="mb-4 text-3xl font-bold font-sans">Error</h1>
        <p className="text-red-400 text-center max-w-md">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 rounded-full px-6 py-2 bg-white/10 hover:bg-white/20 transition backdrop-blur border border-white/10"
        >
          Retry
        </button>
      </div>
    );
  }

  const activeLoc = locations[activeLocationIndex];
  const condition = weatherData?.condition || 'Clear';

  return (
    <main className="relative min-h-screen w-full font-sans">
      {/* Weather Scene Fixed Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <Suspense fallback={<div className="absolute inset-0 bg-gray-900" />}>
          <WeatherScene condition={condition} />
        </Suspense>
      </div>

      {/* Main content flow container */}
      <div className="relative z-10 flex flex-col items-center w-full px-4 py-8 md:py-16 gap-8 md:gap-12 pb-16">
        
        {/* Mobile-Only Location Pill Scroller (Top) */}
        <div className="md:hidden w-full flex flex-col gap-2 mt-2">
           <div className="overflow-x-auto no-scrollbar scroll-fade-x flex gap-2 py-1 px-1">
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
        </div>

        {/* Row 1: Weather Info & Secondary Controls */}
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_450px] w-full max-w-[1400px] gap-8 lg:gap-12">
          
          {/* Mobile Mascot (Top Right Absolute) */}
          <div className="md:hidden absolute top-4 right-4 z-50">
             <ChiikawaMascot />
          </div>

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
                    aria-label={`${weatherData?.temperature.toFixed(0)} degrees`}
                 >
                   {weatherData?.temperature.toFixed(0)}°
                 </h1>
              </div>
              <h2 className="text-4xl md:text-5xl font-medium text-white/95 drop-shadow-md m-0 mt-4 tracking-tight">
                {activeLoc?.city || 'Resolving...'}
              </h2>
              <p className="text-xl md:text-2xl text-white/90 tracking-wide font-light mt-2 uppercase">
                {condition} 
              </p>
              
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 mt-6 md:mt-8 w-full">
                {weatherData?.aqi !== undefined && (
                  <MetricCard label="AQI" value={weatherData.aqi} />
                )}
                {weatherData?.uvIndex !== undefined && (
                  <MetricCard label="UV" value={weatherData.uvIndex} />
                )}
                <MetricCard label="Rain" value={weatherData?.precipitationProb || 0} unit="%" />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Right Panel: Vibe & Locations */}
          <div className="flex flex-col gap-6 w-full max-w-lg lg:max-w-none mx-auto lg:mx-0 shrink-0">
            {/* Desktop Location List */}
            <div className="hidden md:block rounded-[24px] border border-white/20 bg-white/10 p-6 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
              <h3 className="mb-4 text-micro font-bold tracking-super-wide text-white/60 text-left uppercase pl-2">
                Discovery Nodes
              </h3>
              <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto no-scrollbar scroll-fade-y pr-1">
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
              <VibeWidget vibeData={vibeData} loading={vibeLoading} />
            </Suspense>
          </div>
        </div>

        {/* Row 2: Forecast Grid (Spans width) */}
        {weatherData?.forecast && weatherData.forecast.length > 0 && (
          <div className="w-full max-w-[1400px]">
             <div className="flex items-center gap-4 mb-4 px-2">
                <span className="text-micro uppercase font-bold tracking-super-wide text-white/60">Temporal Trajectory</span>
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
