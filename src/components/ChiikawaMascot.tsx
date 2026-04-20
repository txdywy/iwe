import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import chiikawaLocal from '../assets/chiikawa.png';

export const ChiikawaMascot = memo(() => {
  const [randomDuration] = useState(() => 3 + Math.random());

  return (
    <motion.div
      animate={{ 
        y: [0, -10, 0], 
        rotate: [-5, 5, -5],
        scale: [1, 1.05, 1]
      }}
      transition={{
        duration: randomDuration,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="relative pointer-events-auto cursor-pointer hover:scale-110 active:scale-95 transition-transform z-30 flex items-center justify-center w-[80px] h-[80px]"
      onClick={(e) => {
         e.stopPropagation();
      }}
    >
      <img 
        src={chiikawaLocal} 
        alt="Chiikawa Character" 
        className="w-full h-full object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
      />
    </motion.div>
  );
});
