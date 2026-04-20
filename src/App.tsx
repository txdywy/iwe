import { useEffect } from 'react';
import { useStore } from './store/useStore';
import { WeatherScene } from './components/WeatherScene';
import { LoadingScreen } from './components/LoadingScreen';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const { locations, activeLocationIndex, weatherData, loading, error, initApp, setActiveLocation } = useStore();

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

  return (
    <main className="relative h-screen w-screen overflow-hidden font-sans">
      <WeatherScene condition={condition} />

      {/* UI Overlay */}
      <div className="absolute inset-0 flex flex-col p-6 pt-16 sm:p-12 md:flex-row md:items-start md:justify-between z-10 pointer-events-none pb-8">
        
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeLocationIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col gap-1 sm:gap-2 pointer-events-auto items-center text-center md:items-start md:text-left mt-0 shrink-0"
          >
            <h1 className="text-8xl sm:text-9xl font-extralight tracking-tighter text-white drop-shadow-2xl m-0 leading-none">
              {weatherData?.temperature.toFixed(0)}°
            </h1>
            <h2 className="text-4xl sm:text-5xl font-medium text-white/95 drop-shadow-md m-0 mt-2 tracking-tight">
              {activeLoc?.city || 'Resolving...'}
            </h2>
            <p className="text-xl text-white/80 tracking-wide font-light mt-1">
              {condition} <span className="opacity-40 mx-2">|</span> {weatherData?.precipitationProb}% Rain
            </p>
            <p className="text-xs text-white/40 mt-1 uppercase tracking-widest font-semibold">
              Source: {weatherData?.sourceUsed}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Location Selector */}
        <div className="mt-auto md:mt-0 md:ml-auto w-full md:w-80 pointer-events-auto pb-4 md:pb-0 shrink-0">
          <div className="rounded-[32px] border border-white/20 bg-black/20 md:bg-white/10 p-5 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]">
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
        </div>

      </div>
    </main>
  );
}

export default App;
