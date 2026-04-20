import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useEffect, useRef } from 'react';

export const LoadingScreen = () => {
  const { loadingLogs } = useStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest log
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [loadingLogs]);

  // Take the last 5 logs to prevent overcrowding the screen
  const visibleLogs = loadingLogs.slice(-5);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex h-screen w-screen flex-col items-center justify-center bg-black overflow-hidden relative"
    >
      {/* Background Pulse Glow */}
      <motion.div 
        animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-[500px] h-[500px] bg-white blur-[120px] rounded-full pointer-events-none"
      />

      {/* Abstract Atmospheric Data Visualizations */}
      <div className="absolute inset-0 opacity-20 pointer-events-none flex flex-col justify-end pb-20 items-center overflow-hidden mix-blend-screen">
        <svg viewBox="0 0 1000 200" className="w-[150vw] h-48 opacity-40">
          <motion.path
            d="M 0 100 Q 250 100, 500 100 T 1000 100"
            fill="transparent"
            stroke="white"
            strokeWidth="1"
            animate={{
              d: [
                "M 0 100 Q 250 50, 500 100 T 1000 100",
                "M 0 100 Q 250 150, 500 100 T 1000 100",
                "M 0 100 Q 250 50, 500 100 T 1000 100"
              ]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.path
            d="M 0 100 Q 250 100, 500 100 T 1000 100"
            fill="transparent"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="2"
            animate={{
              d: [
                "M 0 100 Q 250 180, 500 100 T 1000 100",
                "M 0 100 Q 250 20, 500 100 T 1000 100",
                "M 0 100 Q 250 180, 500 100 T 1000 100"
              ]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          />
        </svg>
      </div>

      {/* Vertical Global Scan Line */}
      <motion.div
        animate={{ y: ['-100vh', '100vh'] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
        className="absolute top-0 w-full h-1 bg-white/30 shadow-[0_0_20px_white] z-0 blur-[2px]"
      />
      
      <div className="z-10 flex flex-col items-center gap-10">
        <div className="relative flex items-center justify-center">
           {/* Outer orbital ring */}
           <motion.div
             animate={{ rotate: 360 }}
             transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
             className="w-28 h-28 border-[1px] border-white/20 border-t-white/80 rounded-full"
           />
           {/* Inner orbital ring */}
           <motion.div
             animate={{ rotate: -360 }}
             transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
             className="absolute w-20 h-20 border-[1px] border-white/10 border-b-white/60 rounded-full"
           />
           {/* Center core pulse */}
           <motion.div 
             animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.8, 1, 0.8] }}
             transition={{ duration: 2, repeat: Infinity }}
             className="absolute w-3 h-3 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)]" 
           />
        </div>

        {/* Real-time Telemetry Dashboard */}
        <div className="h-40 w-80 sm:w-96 flex flex-col items-start gap-3 overflow-hidden relative p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md shadow-2xl">
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
                    className={`text-[10px] sm:text-xs font-mono tracking-wider break-words ${isLast ? 'text-white font-bold drop-shadow-md' : 'text-white/60'}`}
                  >
                    <span className={`mr-2 ${isLast ? 'text-blue-400 animate-pulse' : 'text-white/40'}`}>{'>'}</span> {log}
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
