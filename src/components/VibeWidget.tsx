import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { VibeRecommendation } from '../utils/vibeEngine';

interface VibeWidgetProps {
  vibeData: VibeRecommendation | null;
  loading: boolean;
}

export const VibeWidget: React.FC<VibeWidgetProps> = ({ vibeData, loading }) => {
  const [activeTab, setActiveTab] = useState<'music' | 'movie' | 'book'>('music');

  if (loading) {
    return (
      <div className="w-full max-w-sm rounded-[32px] border border-white/20 bg-black/30 backdrop-blur-2xl p-5 shadow-2xl flex items-center justify-center min-h-[150px]">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full" />
        <span className="ml-3 text-white/50 text-xs font-bold tracking-widest uppercase">Fetching Vibe...</span>
      </div>
    );
  }

  if (!vibeData) return null;

  const currentItem = vibeData[activeTab];

  return (
    <div className="w-full max-w-sm rounded-[32px] border border-white/20 bg-white/10 backdrop-blur-2xl px-5 pt-4 pb-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] flex flex-col gap-4">
      {/* Header Tabs */}
      <div className="flex justify-between items-center px-1">
        <h3 className="text-[11px] font-bold tracking-[0.2em] text-white/50 uppercase">Vibe Matches</h3>
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
              initial={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.05, filter: 'blur(4px)' }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-4"
            >
              {/* Cover Art */}
              <div className="shrink-0 w-24 h-24 rounded-xl overflow-hidden shadow-xl bg-black relative">
                {currentItem.coverUrl ? (
                  <img src={currentItem.coverUrl} alt={currentItem.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 text-white/20 text-xs">No Cover</div>
                )}
                {/* Play/View Overlay */}
                {currentItem.link && (
                  <a href={currentItem.link} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
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
            <motion.div key="empty" className="absolute inset-0 flex items-center justify-center text-white/30 text-xs">
               Not Found
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
