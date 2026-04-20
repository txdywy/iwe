import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Refined, more detailed Chiikawa
const ChiikawaSVG = () => (
  <svg viewBox="0 0 100 100" className="w-[80px] h-[80px] drop-shadow-[0_4px_12px_rgba(0,0,0,0.25)]" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Body */}
    <path d="M 50 90 Q 20 90 20 60 Q 20 30 50 30 Q 80 30 80 60 Q 80 90 50 90 Z" fill="#FFFFFF" />
    {/* Ears */}
    <path d="M 25 35 Q 15 20 30 25 Q 35 30 25 35 Z" fill="#FFFFFF" />
    <path d="M 75 35 Q 85 20 70 25 Q 65 30 75 35 Z" fill="#FFFFFF" />
    {/* Blush */}
    <ellipse cx="28" cy="62" rx="7" ry="4" fill="#FFB6C1" opacity="0.8" />
    <ellipse cx="72" cy="62" rx="7" ry="4" fill="#FFB6C1" opacity="0.8" />
    {/* Eyes */}
    <ellipse cx="38" cy="55" rx="3.5" ry="4" fill="#000000" />
    <ellipse cx="62" cy="55" rx="3.5" ry="4" fill="#000000" />
    {/* Eye Highlights */}
    <circle cx="37" cy="53.5" r="1.5" fill="#FFFFFF" />
    <circle cx="61" cy="53.5" r="1.5" fill="#FFFFFF" />
    {/* Mouth */}
    <path d="M 45 62 Q 50 66 55 62" stroke="#000000" strokeWidth="2" fill="none" strokeLinecap="round" />
    {/* Arms & Legs */}
    <path d="M 22 65 Q 15 70 25 75" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
    <path d="M 78 65 Q 85 70 75 75" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
    <path d="M 35 88 Q 35 95 42 92" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
    <path d="M 65 88 Q 65 95 58 92" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Refined, more detailed Hachiware
const HachiwareSVG = () => (
  <svg viewBox="0 0 100 100" className="w-[80px] h-[80px] drop-shadow-[0_4px_12px_rgba(0,0,0,0.25)]" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Body */}
    <path d="M 50 90 Q 20 90 20 60 Q 20 30 50 30 Q 80 30 80 60 Q 80 90 50 90 Z" fill="#FFFFFF" />
    {/* Blue Fur Pattern (Inverted V) */}
    <path d="M 50 45 Q 35 30 22 45 Q 20 30 50 30 Q 80 30 78 45 Q 65 30 50 45 Z" fill="#4B89C8" />
    {/* Ears */}
    <path d="M 22 32 L 15 15 L 35 25 Z" fill="#4B89C8" strokeLinejoin="round" />
    <path d="M 78 32 L 85 15 L 65 25 Z" fill="#4B89C8" strokeLinejoin="round" />
    {/* Blush */}
    <ellipse cx="28" cy="62" rx="7" ry="4" fill="#FFB6C1" opacity="0.8" />
    <ellipse cx="72" cy="62" rx="7" ry="4" fill="#FFB6C1" opacity="0.8" />
    {/* Eyes */}
    <ellipse cx="38" cy="55" rx="3.5" ry="4" fill="#000000" />
    <ellipse cx="62" cy="55" rx="3.5" ry="4" fill="#000000" />
    {/* Eye Highlights */}
    <circle cx="37" cy="53.5" r="1.5" fill="#FFFFFF" />
    <circle cx="61" cy="53.5" r="1.5" fill="#FFFFFF" />
    {/* Mouth (Kitty smile) */}
    <path d="M 45 62 Q 50 67 50 62 Q 50 67 55 62" stroke="#000000" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    {/* Arms & Legs */}
    <path d="M 22 65 Q 15 70 25 75" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
    <path d="M 78 65 Q 85 70 75 75" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
    <path d="M 35 88 Q 35 95 42 92" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
    <path d="M 65 88 Q 65 95 58 92" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Refined, more detailed Usagi
const UsagiSVG = () => (
  <svg viewBox="0 0 100 100" className="w-[80px] h-[80px] drop-shadow-[0_4px_12px_rgba(0,0,0,0.25)]" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Ears */}
    <path d="M 35 35 Q 10 -5 45 15 Q 55 25 45 35 Z" fill="#FAD15A" />
    <path d="M 65 35 Q 90 -5 55 15 Q 45 25 55 35 Z" fill="#FAD15A" />
    {/* Body */}
    <path d="M 50 90 Q 20 90 20 60 Q 20 30 50 30 Q 80 30 80 60 Q 80 90 50 90 Z" fill="#FAD15A" />
    {/* Blush */}
    <ellipse cx="28" cy="62" rx="7" ry="4" fill="#FF7F50" opacity="0.8" />
    <ellipse cx="72" cy="62" rx="7" ry="4" fill="#FF7F50" opacity="0.8" />
    {/* Eyes */}
    <ellipse cx="38" cy="55" rx="3.5" ry="4" fill="#000000" />
    <ellipse cx="62" cy="55" rx="3.5" ry="4" fill="#000000" />
    {/* Eye Highlights */}
    <circle cx="37" cy="53.5" r="1.5" fill="#FFFFFF" />
    <circle cx="61" cy="53.5" r="1.5" fill="#FFFFFF" />
    {/* Mouth */}
    <path d="M 47 62 L 53 62" stroke="#000000" strokeWidth="2" fill="none" strokeLinecap="round" />
    {/* Arms & Legs */}
    <path d="M 22 65 Q 15 70 25 75" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
    <path d="M 78 65 Q 85 70 75 75" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
    <path d="M 35 88 Q 35 95 42 92" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
    <path d="M 65 88 Q 65 95 58 92" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
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
      animate={{ y: [0, -8, 0], rotate: [-3, 3, -3] }}
      transition={{
        duration: randomDuration,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="relative pointer-events-auto cursor-pointer hover:scale-110 active:scale-95 transition-transform z-30"
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
