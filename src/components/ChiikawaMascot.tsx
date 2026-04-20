import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ChiikawaSVG = () => (
  <svg viewBox="0 0 100 100" className="w-[70px] h-[70px] drop-shadow-lg" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Body */}
    <circle cx="50" cy="55" r="35" fill="white" />
    {/* Ears */}
    <path d="M 25 35 Q 15 15 35 20 Q 40 30 35 35 Z" fill="white" />
    <path d="M 75 35 Q 85 15 65 20 Q 60 30 65 35 Z" fill="white" />
    {/* Blush */}
    <ellipse cx="30" cy="55" rx="6" ry="3" fill="#ffb6c1" />
    <ellipse cx="70" cy="55" rx="6" ry="3" fill="#ffb6c1" />
    {/* Eyes */}
    <circle cx="38" cy="48" r="3" fill="black" />
    <circle cx="62" cy="48" r="3" fill="black" />
    {/* Mouth */}
    <path d="M 45 53 Q 50 58 55 53" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
    {/* Highlight in eyes */}
    <circle cx="37" cy="47" r="1" fill="white" />
    <circle cx="61" cy="47" r="1" fill="white" />
  </svg>
);

const HachiwareSVG = () => (
  <svg viewBox="0 0 100 100" className="w-[70px] h-[70px] drop-shadow-lg" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Body */}
    <circle cx="50" cy="55" r="35" fill="white" />
    {/* Blue Hair pattern */}
    <path d="M 15 55 Q 50 15 85 55 Q 50 35 15 55 Z" fill="#4B89C8" />
    {/* Ears */}
    <path d="M 20 30 L 15 10 L 35 20 Z" fill="#4B89C8" />
    <path d="M 80 30 L 85 10 L 65 20 Z" fill="#4B89C8" />
    {/* Blush */}
    <ellipse cx="30" cy="55" rx="6" ry="3" fill="#ffb6c1" />
    <ellipse cx="70" cy="55" rx="6" ry="3" fill="#ffb6c1" />
    {/* Eyes */}
    <circle cx="38" cy="48" r="3" fill="black" />
    <circle cx="62" cy="48" r="3" fill="black" />
    {/* Mouth (kitty smile) */}
    <path d="M 46 54 Q 50 58 50 53 Q 50 58 54 54" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const UsagiSVG = () => (
  <svg viewBox="0 0 100 100" className="w-[70px] h-[70px] drop-shadow-lg" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Ears - longer */}
    <path d="M 35 30 Q 15 -10 45 10 Q 50 20 45 30 Z" fill="#FAD15A" />
    <path d="M 65 30 Q 85 -10 55 10 Q 50 20 55 30 Z" fill="#FAD15A" />
    {/* Body */}
    <circle cx="50" cy="55" r="35" fill="#FAD15A" />
    {/* Blush */}
    <ellipse cx="30" cy="55" rx="6" ry="3" fill="#ff7f50" />
    <ellipse cx="70" cy="55" rx="6" ry="3" fill="#ff7f50" />
    {/* Eyes */}
    <circle cx="38" cy="48" r="3" fill="black" />
    <circle cx="62" cy="48" r="3" fill="black" />
    {/* Mouth */}
    <path d="M 46 52 L 54 52" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>
);

const mascots = [ChiikawaSVG, HachiwareSVG, UsagiSVG];

export const ChiikawaMascot: React.FC = () => {
  const [MascotComponent, setMascotComponent] = useState<React.FC>(() => {
    const randomIdx = Math.floor(Math.random() * mascots.length);
    return mascots[randomIdx];
  });

  const [randomDuration] = useState(() => 3 + Math.random());

  return (
    <motion.div
      animate={{ y: [0, -8, 0], rotate: [-2, 2, -2] }}
      transition={{
        duration: randomDuration,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="absolute -top-12 right-2 pointer-events-auto cursor-pointer hover:scale-110 active:scale-95 transition-transform z-30"
      onClick={(e) => {
         e.stopPropagation();
         const randomIdx = Math.floor(Math.random() * mascots.length);
         setMascotComponent(() => mascots[randomIdx]);
      }}
    >
      <MascotComponent />
    </motion.div>
  );
};
