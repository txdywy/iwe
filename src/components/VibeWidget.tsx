import { useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { VibeRecommendation } from '../utils/vibeEngine';
import { useStore } from '../store/useStore';

const ShimmerImage = ({ src, alt }: { src: string; alt: string }) => {
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => setLoaded(true), []);
  const handleError = useCallback(() => setHasError(true), []);

  if (hasError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 border border-white/10 text-white/50 text-[10px] uppercase font-bold tracking-widest text-center shadow-inner gap-2 pt-2">
        <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}>
          🐇
        </motion.div>
        Oops
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
      {/* Shimmer Effect */}
      {!loaded && (
        <motion.div
          animate={{ x: ['-200%', '200%'] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
        />
      )}
      {src && (
        <img 
          src={src} 
          alt={alt} 
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`} 
        />
      )}
      {!src && !loaded && (
        <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity, duration: 2 }} className="w-6 h-6 border-[2px] border-white/20 border-t-white/60 rounded-full animate-spin" />
      )}
    </div>
  );
};

interface VibeWidgetProps {
  vibeData: VibeRecommendation | null;
  loading: boolean;
}

export const VibeWidget = memo(({ vibeData, loading }: VibeWidgetProps) => {
  const [activeTab, setActiveTab] = useState<'music' | 'movie' | 'book'>('music');
  const setActiveLocation = useStore(s => s.setActiveLocation);
  const activeLocationIndex = useStore(s => s.activeLocationIndex);

  const handleRetry = useCallback(() => {
    setActiveLocation(activeLocationIndex);
  }, [setActiveLocation, activeLocationIndex]);

  if (loading) {
    return (
      <div className="w-full max-w-sm md:max-w-none rounded-[24px] border border-white/10 bg-black/40 backdrop-blur-xl p-4 md:rounded-[32px] md:border-white/20 md:bg-black/30 md:backdrop-blur-2xl md:p-5 md:shadow-2xl flex items-center justify-center min-h-[150px]">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full" />
        <span className="ml-3 text-white/50 text-xs font-bold tracking-widest uppercase">Fetching Vibe...</span>
      </div>
    );
  }

  if (!vibeData) return null;

  const currentItem = vibeData[activeTab];

  return (
    <div className="w-full max-w-sm md:max-w-none rounded-[24px] border border-white/10 bg-black/40 backdrop-blur-xl p-4 md:rounded-[32px] md:border-white/20 md:bg-white/10 md:backdrop-blur-2xl md:px-5 md:pt-4 md:pb-5 md:shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] flex flex-col gap-4">
      {/* Header Tabs */}
      <div className="flex justify-between items-center px-1">
        <h3 className="text-micro font-bold tracking-[0.2em] text-white/50 uppercase">Vibe Matches</h3>
        <div className="flex bg-black/20 rounded-full p-1 border border-white/10">
          {(['music', 'movie', 'book'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === tab ? 'bg-white/20 text-white shadow' : 'text-white/40 hover:text-white/80'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="relative min-h-[120px] bg-black/20 rounded-2xl p-3 border border-white/5 overflow-hidden group">
        <AnimatePresence mode="wait">
          {currentItem ? (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-4"
            >
              {/* Cover Art */}
              <div className="shrink-0 w-24 h-24 rounded-xl overflow-hidden shadow-xl bg-black relative">
                {currentItem.coverUrl ? (
                  <ShimmerImage src={currentItem.coverUrl} alt={currentItem.title} />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 border border-white/10 text-white/50 text-[10px] uppercase font-bold tracking-widest text-center shadow-inner gap-2 pt-2">
                    <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}>
                      🐇
                    </motion.div>
                    Oops
                  </div>
                )}
                {/* Play/View Overlay */}
                {currentItem.link && (
                  <a href={currentItem.link} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] uppercase font-bold text-white tracking-widest bg-white/20 px-3 py-1 rounded-full">{activeTab === 'book' ? 'Read' : 'Play'}</span>
                  </a>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col flex-1 truncate pr-2">
                <span className="text-[9px] uppercase tracking-[0.2em] text-white/40 mb-1 border border-white/10 w-fit px-2 py-[2px] rounded">
                  {currentItem.type}
                </span>
                <span className="text-sm font-semibold text-white/90 truncate leading-tight drop-shadow-md">
                  {currentItem.title}
                </span>
                <span className="text-xs text-white/50 truncate mt-1">
                  {currentItem.subtitle}
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div key="empty" className="absolute inset-0 flex flex-col items-center justify-center text-white/40 text-[10px] uppercase font-bold tracking-widest gap-2">
               <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }} className="text-xl">
                 📡
               </motion.div>
               <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}>
                 Scanning database...
               </motion.span>
               <button 
                onClick={handleRetry}
                className="mt-1 text-[8px] bg-white/10 hover:bg-white/20 px-2 py-1 rounded-full transition-colors border border-white/5"
               >
                 Trigger Manual Scan
               </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});
