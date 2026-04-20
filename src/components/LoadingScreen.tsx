import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useEffect, useRef } from 'react';

export const LoadingScreen = () => {
  const loadingLogs = useStore(s => s.loadingLogs);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [loadingLogs]);

  const visibleLogs = loadingLogs.slice(-5);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex h-screen w-screen flex-col items-center justify-center bg-black overflow-hidden relative"
    >
      {/* Subtle background glow */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.15, 0.08] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-[400px] h-[400px] bg-white blur-[80px] rounded-full pointer-events-none"
      />

      <div className="z-10 flex flex-col items-center gap-10">
        {/* Simple spinner */}
        <div className="relative flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="w-20 h-20 border border-white/20 border-t-white/80 rounded-full"
          />
          <motion.div
            animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,0.6)]"
          />
        </div>

        {/* Telemetry log */}
        <div className="h-36 w-80 sm:w-96 flex flex-col items-start gap-3 overflow-hidden relative p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
          <div className="absolute top-2 left-4 text-[8px] font-bold tracking-widest text-white/30 uppercase">SYSTEM TELEMETRY</div>
          <div className="flex flex-col w-full h-full mt-3 gap-2 justify-end">
            <AnimatePresence>
              {visibleLogs.map((log, i) => {
                const isLast = i === visibleLogs.length - 1;
                return (
                  <motion.div
                    key={log + i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: isLast ? 1 : 0.4, x: 0, scale: isLast ? 1 : 0.95 }}
                    exit={{ opacity: 0, scale: 0.8, y: -20 }}
                    className={`text-[10px] sm:text-xs font-mono tracking-wider break-words ${isLast ? 'text-white font-bold' : 'text-white/60'}`}
                  >
                    <span className={`mr-2 ${isLast ? 'text-blue-400' : 'text-white/40'}`}>{'>'}</span> {log}
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
