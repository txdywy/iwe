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
  const [pulseDuration] = useState(() => 4.5 + Math.random() * 2.5);
  const [pulseScale] = useState(() => 1.08 + Math.random() * 0.08);
  const [pulseOpacity] = useState(() => 0.82 + Math.random() * 0.1);
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
        }
      : {
          y: [0, -10, 0],
          rotate: [-5, 5, -5],
        };

  const pulseAnimate = shouldReduceMotion
    ? {}
    : {
        scale: [1, pulseScale, 0.96, 1.04, 1],
        opacity: [1, pulseOpacity, 1, 0.9, 1],
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
      <motion.span
        animate={pulseAnimate}
        transition={{
          duration: pulseDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative flex h-full w-full items-center justify-center"
      >
        {!isDesktopDrift && (
          <img
            aria-hidden="true"
            src={currentImage.src}
            alt=""
            className="mobile-mascot-edge-blur"
          />
        )}
        <img 
          src={currentImage.src}
          alt={currentImage.alt}
          className={[
            'relative z-10 w-full h-full object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]',
            !isDesktopDrift ? 'mobile-mascot-soft-edge' : '',
          ].filter(Boolean).join(' ')}
        />
      </motion.span>
    </motion.button>
  );
});
