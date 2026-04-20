import { useState, memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import kuliImage from '../assets/kuli.png';

export const ChiikawaMascot = memo(() => {
  const [randomDuration] = useState(() => 3 + Math.random());
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={shouldReduceMotion ? {} : { 
        y: [0, -10, 0], 
        rotate: [-5, 5, -5],
        scale: [1, 1.05, 1]
      }}
      transition={{
        duration: randomDuration,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="relative pointer-events-auto z-30 flex items-center justify-center w-[80px] h-[80px] will-change-transform"
    >
      <img 
        src={kuliImage} 
        alt="Kuli Character" 
        className="w-full h-full object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
      />
    </motion.div>
  );
});
