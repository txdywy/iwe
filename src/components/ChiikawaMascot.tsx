import { useState, memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import chiiImage from '../assets/chii.png';
import haImage from '../assets/ha.png';
import kuliImage from '../assets/kuli.png';
import usagiImage from '../assets/usagi.png';

const mascotImages = [
  { src: kuliImage, alt: 'Kuli Character' },
  { src: chiiImage, alt: 'Chiikawa Character' },
  { src: haImage, alt: 'Hachiware Character' },
  { src: usagiImage, alt: 'Usagi Character' },
];

type ChiikawaMascotProps = {
  variant?: 'inline' | 'desktopDrift';
  className?: string;
};

export const ChiikawaMascot = memo(({ variant = 'inline', className = '' }: ChiikawaMascotProps) => {
  const [randomDuration] = useState(() => 3 + Math.random());
  const [imageIndex, setImageIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const isDesktopDrift = variant === 'desktopDrift';
  const currentImage = mascotImages[imageIndex];

  const switchMascot = () => {
    setImageIndex((current) => {
      if (mascotImages.length < 2) {
        return current;
      }

      const nextOffset = 1 + Math.floor(Math.random() * (mascotImages.length - 1));
      return (current + nextOffset) % mascotImages.length;
    });
  };

  const animate = shouldReduceMotion
    ? {}
    : isDesktopDrift
      ? {
          x: [0, 72, 148, 118, 36, 0],
          y: [0, -26, 14, 74, 56, 0],
          rotate: [-8, 5, 10, -3, -10, -8],
          scale: [1, 1.04, 0.98, 1.05, 1, 1],
        }
      : {
          y: [0, -10, 0],
          rotate: [-5, 5, -5],
          scale: [1, 1.05, 1],
        };

  return (
    <motion.button
      type="button"
      aria-label="Switch mascot"
      onClick={switchMascot}
      animate={animate}
      transition={{
        duration: isDesktopDrift ? randomDuration + 8 : randomDuration,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={[
        isDesktopDrift ? 'w-[86px] h-[86px] md:w-[92px] md:h-[92px]' : 'relative w-[80px] h-[80px]',
        'z-30 flex items-center justify-center border-0 bg-transparent p-0 cursor-pointer will-change-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
        className,
      ].filter(Boolean).join(' ')}
    >
      <img 
        src={currentImage.src}
        alt={currentImage.alt}
        className="w-full h-full object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
      />
    </motion.button>
  );
});
