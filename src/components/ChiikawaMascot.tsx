import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Reliable transparent PNGs of Chiikawa characters
const mascots = [
  "https://raw.githubusercontent.com/HaoZhang16/ChiikawaBigEvent/main/images/chiikawa.png",
  "https://raw.githubusercontent.com/HaoZhang16/ChiikawaBigEvent/main/images/hachiware.png",
  "https://raw.githubusercontent.com/HaoZhang16/ChiikawaBigEvent/main/images/usagi.png"
];

// Fallback to SVGs or other reliable sources if the above 404
const fallbackMascots = [
  "https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Chiikawa_logo.png/220px-Chiikawa_logo.png",
  "https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Chiikawa_logo.png/220px-Chiikawa_logo.png",
  "https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Chiikawa_logo.png/220px-Chiikawa_logo.png"
];

export const ChiikawaMascot: React.FC = () => {
  const [mascotUrl, setMascotUrl] = useState(() => {
    const randomIdx = Math.floor(Math.random() * mascots.length);
    return mascots[randomIdx];
  });

  const [randomDuration] = useState(() => 3 + Math.random());
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      const randomIdx = Math.floor(Math.random() * fallbackMascots.length);
      setMascotUrl(fallbackMascots[randomIdx]);
    }
  };

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
         const list = hasError ? fallbackMascots : mascots;
         const randomIdx = Math.floor(Math.random() * list.length);
         setMascotUrl(list[randomIdx]);
      }}
    >
      <img 
        src={mascotUrl} 
        alt="Chiikawa Character" 
        className="w-full h-full object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
        onError={handleError}
      />
    </motion.div>
  );
};
