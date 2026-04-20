import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Cloud, Sky } from '@react-three/drei';
import * as THREE from 'three';

interface WeatherSceneProps {
  condition: 'Clear' | 'Clouds' | 'Rain' | 'Snow' | 'Thunderstorm';
}

const Rain = () => {
  const rainGeo = useRef<THREE.BufferGeometry>(null);
  const rainCount = 5000;
  
  React.useEffect(() => {
    if (!rainGeo.current) return;
    const positions = new Float32Array(rainCount * 3);
    const velocities = [];
    for (let i = 0; i < rainCount; i++) {
        velocities.push(0);
        positions[i * 3] = Math.random() * 400 - 200;
        positions[i * 3 + 1] = Math.random() * 500 - 250;
        positions[i * 3 + 2] = Math.random() * 400 - 200;
    }
    rainGeo.current.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    rainGeo.current.userData = { velocities };
  }, []);

  useFrame(() => {
    if (!rainGeo.current || !rainGeo.current.attributes.position) return;
    const positions = rainGeo.current.attributes.position.array as Float32Array;
    const velocities = rainGeo.current.userData.velocities as number[];
    for (let i = 0; i < rainCount; i++) {
      velocities[i] -= 0.1 + Math.random() * 0.1;
      positions[i * 3 + 1] += velocities[i];
      if (positions[i * 3 + 1] < -200) {
        positions[i * 3 + 1] = 200;
        velocities[i] = 0;
      }
    }
    rainGeo.current.attributes.position.needsUpdate = true;
  });

  return (
    <points>
      <bufferGeometry ref={rainGeo} />
      <pointsMaterial color="#aaaaaa" size={0.5} transparent opacity={0.6} />
    </points>
  );
};

const Snow = () => {
  const snowGeo = useRef<THREE.BufferGeometry>(null);
  const snowCount = 2000;
  
  React.useEffect(() => {
    if (!snowGeo.current) return;
    const positions = new Float32Array(snowCount * 3);
    const speeds = [];
    const phases = [];
    for (let i = 0; i < snowCount; i++) {
        positions[i * 3] = Math.random() * 400 - 200;
        positions[i * 3 + 1] = Math.random() * 500 - 250;
        positions[i * 3 + 2] = Math.random() * 400 - 200;
        speeds.push(0.05 + Math.random() * 0.1);
        phases.push(Math.random() * Math.PI * 2);
    }
    snowGeo.current.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    snowGeo.current.userData = { speeds, phases };
  }, []);

  useFrame(({ clock }) => {
    if (!snowGeo.current || !snowGeo.current.attributes.position) return;
    const time = clock.getElapsedTime();
    const positions = snowGeo.current.attributes.position.array as Float32Array;
    const { speeds, phases } = snowGeo.current.userData;
    
    for (let i = 0; i < snowCount; i++) {
      positions[i * 3 + 1] -= speeds[i]; // fall down
      positions[i * 3] += Math.sin(time + phases[i]) * 0.05; // drift x
      positions[i * 3 + 2] += Math.cos(time + phases[i]) * 0.05; // drift z
      
      if (positions[i * 3 + 1] < -200) {
        positions[i * 3 + 1] = 200;
      }
    }
    snowGeo.current.attributes.position.needsUpdate = true;
  });

  return (
    <points>
      <bufferGeometry ref={snowGeo} />
      <pointsMaterial color="#ffffff" size={1.2} transparent opacity={0.8} />
    </points>
  );
};

const Lightning = () => {
  const lightRef = useRef<THREE.PointLight>(null);
  
  useFrame(({ clock }) => {
    if (!lightRef.current) return;
    const time = clock.getElapsedTime() * 10;
    // Simulate sporadic lightning flashes using noise-like math
    if (Math.random() > 0.98) {
      const flash = Math.sin(time) * Math.cos(time * 2.3) * Math.sin(time * 3.1);
      lightRef.current.intensity = flash > 0.5 ? flash * 500 : 0;
    } else {
      lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, 0, 0.1);
    }
  });

  return <pointLight ref={lightRef} color="#e0e7ff" position={[0, 100, 0]} distance={500} decay={2} />;
};

export const WeatherScene: React.FC<WeatherSceneProps> = ({ condition }) => {
  // Map weather to background colors and effects
  const isRain = condition === 'Rain' || condition === 'Thunderstorm';
  const isSnow = condition === 'Snow';
  const isCloudy = condition === 'Clouds' || isRain || isSnow;
  const isStorm = condition === 'Thunderstorm';
  
  // Use slightly darker, more saturated base colors so white text remains legible
  const bgColor = condition === 'Clear' ? '#4A90E2' : // Darker sky blue
                  condition === 'Clouds' ? '#5A6B7C' : 
                  condition === 'Thunderstorm' ? '#0F172A' : 
                  condition === 'Snow' ? '#78909C' : // Slate gray-blue
                  '#4a5568';

  const hour = new Date().getHours();
  const isNight = hour < 6 || hour > 18;

  return (
    <div className="absolute inset-0 -z-10 bg-gradient-to-b from-gray-900 to-black transition-colors duration-1000">
      <Canvas camera={{ position: [0, 0, 100], fov: 60 }} dpr={[1, 1.5]}>
        {/* Fog logic - Mist makes it much denser */}
        <fog attach="fog" args={[bgColor, 50, condition === 'Snow' ? 150 : 300]} />
        <ambientLight intensity={condition === 'Clear' ? 0.8 : isStorm ? 0.1 : 0.4} />
        <directionalLight position={[10, 100, 10]} intensity={isStorm ? 0.2 : 0.8} />
        
        {condition === 'Clear' && !isNight && <Sky sunPosition={[100, 20, 100]} />}
        {condition === 'Clear' && isNight && <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />}
        
        {isCloudy && (
          <group position={[0, 40, -50]}>
            <Cloud opacity={isStorm ? 0.8 : 0.4} speed={isStorm ? 0.8 : 0.4} color={isStorm ? '#333333' : '#ffffff'} scale={5} segments={10} />
            <Cloud position={[50, -20, -50]} opacity={isStorm ? 0.9 : 0.4} speed={0.2} color={isStorm ? '#222222' : '#ffffff'} scale={7} segments={10} />
            <Cloud position={[-50, 10, -30]} opacity={isStorm ? 0.7 : 0.4} speed={0.3} color={isStorm ? '#444444' : '#ffffff'} scale={6} segments={10} />
          </group>
        )}
        
        {isRain && <Rain />}
        {isSnow && <Snow />}
        {isStorm && <Lightning />}
        
        <color attach="background" args={[bgColor]} />
      </Canvas>
      {/* Fallback scrim to guarantee minimum text contrast on bright days */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />
    </div>
  );
};
