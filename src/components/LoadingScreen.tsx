import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const loadingTexts = [
  "Acquiring global telemetry...",
  "Calibrating geolocation...",
  "Bypassing atmospheric nodes...",
  "Parsing waterfall metrics...",
  "Rendering 3D environment...",
];

export const LoadingScreen = () => {
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

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

        <div className="h-6 w-80 flex flex-col items-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={textIndex}
              initial={{ y: 10, opacity: 0, filter: 'blur(4px)' }}
              animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
              exit={{ y: -10, opacity: 0, filter: 'blur(4px)' }}
              transition={{ duration: 0.3 }}
              className="text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] text-white/50 font-bold text-center m-0"
            >
              {loadingTexts[textIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
