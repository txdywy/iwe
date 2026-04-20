import { useRef, memo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Cloud, Sky } from '@react-three/drei';
import { PointLight, MathUtils, ShaderMaterial } from 'three';

interface WeatherSceneProps {
  condition: 'Clear' | 'Clouds' | 'Rain' | 'Snow' | 'Thunderstorm';
}

const Rain = () => {
  const rainCount = 5000;
  const matRef = useRef<ShaderMaterial>(null);

  // useState lazy initializer is the idiomatic way to generate stable random data once.
  const [data] = useState(() => {
    const pos = new Float32Array(rainCount * 3);
    const vel = new Float32Array(rainCount);
    for (let i = 0; i < rainCount; i++) {
      pos[i * 3] = Math.random() * 400 - 200;
      pos[i * 3 + 1] = Math.random() * 400 - 200;
      pos[i * 3 + 2] = Math.random() * 400 - 200;
      vel[i] = 0.5 + Math.random() * 0.5;
    }
    return { positions: pos, velocities: vel };
  });

  const { positions, velocities } = data;

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-velocity" args={[velocities, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        transparent
        uniforms={{
          uTime: { value: 0 },
          uColor: { value: [0.6, 0.6, 0.6] },
          uSize: { value: 0.5 }
        }}
        vertexShader={`
          uniform float uTime;
          uniform float uSize;
          attribute float velocity;
          void main() {
            vec3 pos = position;
            pos.y = mod(pos.y - uTime * velocity * 150.0 + 200.0, 400.0) - 200.0;
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = uSize * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          uniform vec3 uColor;
          void main() {
            if (length(gl_PointCoord - vec2(0.5)) > 0.5) discard;
            gl_FragColor = vec4(uColor, 0.6);
          }
        `}
      />
    </points>
  );
};

const Snow = () => {
  const snowCount = 2000;
  const matRef = useRef<ShaderMaterial>(null);

  const [data] = useState(() => {
    const pos = new Float32Array(snowCount * 3);
    const spd = new Float32Array(snowCount);
    const phs = new Float32Array(snowCount);
    for (let i = 0; i < snowCount; i++) {
      pos[i * 3] = Math.random() * 400 - 200;
      pos[i * 3 + 1] = Math.random() * 400 - 200;
      pos[i * 3 + 2] = Math.random() * 400 - 200;
      spd[i] = 0.1 + Math.random() * 0.2;
      phs[i] = Math.random() * Math.PI * 2;
    }
    return { positions: pos, speeds: spd, phases: phs };
  });

  const { positions, speeds, phases } = data;

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-speed" args={[speeds, 1]} />
        <bufferAttribute attach="attributes-phase" args={[phases, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        transparent
        uniforms={{
          uTime: { value: 0 },
          uColor: { value: [1.0, 1.0, 1.0] },
          uSize: { value: 1.2 }
        }}
        vertexShader={`
          uniform float uTime;
          uniform float uSize;
          attribute float speed;
          attribute float phase;
          void main() {
            vec3 pos = position;
            pos.y = mod(pos.y - uTime * speed * 50.0 + 200.0, 400.0) - 200.0;
            pos.x += sin(uTime + phase) * 5.0;
            pos.z += cos(uTime + phase) * 5.0;
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = uSize * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          uniform vec3 uColor;
          void main() {
            float d = length(gl_PointCoord - vec2(0.5));
            float strength = 1.0 - smoothstep(0.3, 0.5, d);
            gl_FragColor = vec4(uColor, 0.8 * strength);
          }
        `}
      />
    </points>
  );
};

const Lightning = () => {
  const lightRef = useRef<PointLight>(null);
  
  useFrame(({ clock }) => {
    if (!lightRef.current) return;
    const time = clock.getElapsedTime() * 10;
    // Simulate sporadic lightning flashes using noise-like math
    if (Math.random() > 0.98) {
      const flash = Math.sin(time) * Math.cos(time * 2.3) * Math.sin(time * 3.1);
      lightRef.current.intensity = flash > 0.5 ? flash * 500 : 0;
    } else {
      lightRef.current.intensity = MathUtils.lerp(lightRef.current.intensity, 0, 0.1);
    }
  });

  return <pointLight ref={lightRef} color="#e0e7ff" position={[0, 100, 0]} distance={500} decay={2} />;
};

export const WeatherScene = memo(({ condition }: WeatherSceneProps) => {
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
      <Canvas camera={{ position: [0, 0, 100], fov: 60 }} dpr={[1, 1]}>
        {/* Fog logic - Mist makes it much denser */}
        <fog attach="fog" args={[bgColor, 50, condition === 'Snow' ? 150 : 300]} />
        <ambientLight intensity={condition === 'Clear' ? 0.8 : isStorm ? 0.1 : 0.4} />
        <directionalLight position={[10, 100, 10]} intensity={isStorm ? 0.2 : 0.8} />
        
        {condition === 'Clear' && !isNight && <Sky sunPosition={[100, 20, 100]} />}
        {condition === 'Clear' && isNight && <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />}
        
        {isCloudy && (
          <group position={[0, 40, -50]}>
            <Cloud opacity={isStorm ? 0.8 : 0.4} speed={isStorm ? 0.8 : 0.4} color={isStorm ? '#333333' : '#ffffff'} scale={5} segments={5} />
            <Cloud position={[50, -20, -50]} opacity={isStorm ? 0.9 : 0.4} speed={0.2} color={isStorm ? '#222222' : '#ffffff'} scale={7} segments={5} />
            <Cloud position={[-50, 10, -30]} opacity={isStorm ? 0.7 : 0.4} speed={0.3} color={isStorm ? '#444444' : '#ffffff'} scale={6} segments={5} />
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
});
