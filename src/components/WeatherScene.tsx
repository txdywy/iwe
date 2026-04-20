import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Cloud, Sky } from '@react-three/drei';
import * as THREE from 'three';

interface WeatherSceneProps {
  condition: 'Clear' | 'Clouds' | 'Rain' | 'Snow' | 'Thunderstorm';
}

const Rain = () => {
  const rainGeo = useRef<THREE.BufferGeometry>(null);
  const rainCount = 15000;
  
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
    if (!rainGeo.current) return;
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

export const WeatherScene: React.FC<WeatherSceneProps> = ({ condition }) => {
  // Map weather to background colors and effects
  const isRain = condition === 'Rain' || condition === 'Thunderstorm';
  const isSnow = condition === 'Snow';
  const isCloudy = condition === 'Clouds' || isRain || isSnow;
  
  const bgColor = condition === 'Clear' ? '#87CEEB' : 
                  condition === 'Clouds' ? '#708090' : 
                  condition === 'Thunderstorm' ? '#1a1a2e' : 
                  '#4a5568';

  return (
    <div className="absolute inset-0 -z-10 bg-gradient-to-b from-gray-900 to-black transition-colors duration-1000">
      <Canvas camera={{ position: [0, 0, 100], fov: 60 }}>
        <fog attach="fog" args={[bgColor, 50, 300]} />
        <ambientLight intensity={condition === 'Clear' ? 1 : 0.4} />
        <directionalLight position={[10, 100, 10]} intensity={1} />
        
        {condition === 'Clear' && <Sky sunPosition={[100, 20, 100]} />}
        {(condition === 'Clear' || condition === 'Thunderstorm') && <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />}
        
        {isCloudy && (
          <group position={[0, 40, -50]}>
            <Cloud opacity={0.5} speed={0.4} scale={5} segments={20} />
            <Cloud position={[50, -20, -50]} opacity={0.5} speed={0.2} scale={7} segments={20} />
            <Cloud position={[-50, 10, -30]} opacity={0.5} speed={0.3} scale={6} segments={20} />
          </group>
        )}
        
        {isRain && <Rain />}
        
        <color attach="background" args={[bgColor]} />
      </Canvas>
    </div>
  );
};
