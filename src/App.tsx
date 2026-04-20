import { useEffect } from 'react';
import { useStore } from './store/useStore';
import { WeatherScene } from './components/WeatherScene';
import { LoadingScreen } from './components/LoadingScreen';
import { VibeWidget } from './components/VibeWidget';
import { ChiikawaMascot } from './components/ChiikawaMascot';
import { HackerNewsWidget } from './components/HackerNewsWidget';
import { IPDataWidget } from './components/IPDataWidget';
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
    <main className="relative min-h-screen w-full font-sans">
      {/* Weather Scene Fixed Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <WeatherScene condition={condition} />
      </div>

      {/* Main content flow container */}
      <div className="relative z-10 flex flex-col items-center w-full px-4 py-12 md:py-20 gap-12 md:gap-16">
        
        {/* Row 1: Weather Info & Secondary Controls */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-center w-full max-w-7xl gap-8 md:gap-16">
          
          {/* Left Panel: Hero Temperature */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeLocationIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center text-center md:items-start md:text-left shrink-0 md:pt-4"
            >
              <div className="relative">
                 <ChiikawaMascot />
                 <h1 className="text-8xl md:text-[10rem] font-extralight tracking-tighter text-white drop-shadow-2xl m-0 leading-none">
                   {weatherData?.temperature.toFixed(0)}°
                 </h1>
              </div>
              <h2 className="text-4xl md:text-6xl font-medium text-white/95 drop-shadow-md m-0 mt-4 tracking-tight">
                {activeLoc?.city || 'Resolving...'}
              </h2>
              <p className="text-xl md:text-3xl text-white/90 tracking-wide font-light mt-2 uppercase">
                {condition} 
              </p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6 md:mt-10">
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
          <div className="flex flex-col gap-6 w-full max-w-md shrink-0">
            {/* Desktop Location List */}
            <div className="hidden md:block rounded-[32px] border border-white/20 bg-white/10 p-6 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
              <h3 className="mb-4 text-[11px] font-black tracking-[0.25em] text-white/40 text-left uppercase pl-2">
                Discovery Nodes
              </h3>
              <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto no-scrollbar pr-1">
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
            
            <VibeWidget vibeData={vibeData} loading={vibeLoading} />
          </div>
        </div>

        {/* Row 2: Forecast Grid (Spans width) */}
        {weatherData?.forecast && weatherData.forecast.length > 0 && (
          <div className="w-full max-w-7xl">
             <div className="flex items-center gap-4 mb-4 px-2">
                <span className="text-[11px] uppercase font-black tracking-[0.3em] text-white/40">Temporal Trajectory</span>
                <div className="flex-1 h-px bg-white/10" />
             </div>
             <div className="w-full overflow-x-auto no-scrollbar rounded-[32px] md:border md:border-white/15 md:bg-white/5 md:backdrop-blur-xl p-4 md:p-8 flex gap-6 md:gap-10 snap-x">
                {weatherData.forecast.map((fc, i) => (
                  <ForecastCard
                    key={i}
                    time={fc.time}
                    emoji={getWeatherEmoji(fc.weatherCode)}
                    maxTemp={fc.maxTemp}
                    minTemp={fc.minTemp}
                    isMobile={false}
                  />
                ))}
             </div>
          </div>
        )}

        {/* Row 3: Hacker News Wide Module */}
        <div className="w-full max-w-7xl pb-4">
          <HackerNewsWidget />
        </div>

        {/* Row 4: IP Data Module */}
        <div className="w-full max-w-7xl pb-10">
          <IPDataWidget />
        </div>

        {/* Mobile-Only Location Pill Scroller (Since sidebar is hidden) */}
        <div className="md:hidden w-full flex flex-col gap-3 pb-8">
           <div className="flex items-center gap-4 mb-1 px-2">
              <span className="text-[11px] uppercase font-black tracking-[0.3em] text-white/40">Locations</span>
              <div className="flex-1 h-px bg-white/10" />
           </div>
           <div className="overflow-x-auto no-scrollbar scroll-fade-x flex gap-2 py-2 px-1">
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
    </main>
  );
}

export default App;
