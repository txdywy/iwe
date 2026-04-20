import { useRef, memo, useState, useEffect, Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PointLight, MathUtils, ShaderMaterial } from 'three';
import type { WeatherCondition } from '../types/weather';

// ── Error Boundary for WebGL crashes ──
interface ErrorBoundaryState { hasError: boolean }

class WeatherSceneErrorBoundary extends Component<{ children: ReactNode; bgColor: string }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };
  static getDerivedStateFromError(): ErrorBoundaryState { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('WeatherScene crashed:', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div
          className="absolute inset-0 -z-10 transition-colors duration-1000"
          style={{ background: `linear-gradient(to bottom, ${this.props.bgColor}, #000)` }}
        />
      );
    }
    return this.props.children;
  }
}

interface WeatherSceneProps {
  condition: WeatherCondition;
  timezone?: string;
}

const Stars = memo(() => {
  const [positions] = useState(() => {
    const count = 1200;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 80 + Math.random() * 180;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.cos(phi);
      pos[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    return pos;
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.7} sizeAttenuation transparent opacity={0.85} />
    </points>
  );
});

const CloudCluster = memo(({
  position = [0, 0, 0],
  scale = 1,
  color,
  opacity,
}: {
  position?: [number, number, number];
  scale?: number;
  color: string;
  opacity: number;
}) => (
  <group position={position} scale={scale}>
    {[
      [-3, 0, 0, 2.6],
      [0, 0.4, 0, 3.2],
      [3, -0.1, 0, 2.4],
      [-0.8, 1.6, -0.2, 2.5],
      [1.8, 1.2, 0.2, 2.1],
    ].map(([x, y, z, radius], index) => (
      <mesh key={index} position={[x, y, z]}>
        <sphereGeometry args={[radius, 18, 12]} />
        <meshStandardMaterial color={color} transparent opacity={opacity} depthWrite={false} />
      </mesh>
    ))}
  </group>
));

const Rain = () => {
  const rainCount = 5000;
  const matRef = useRef<ShaderMaterial>(null);

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
    if (matRef.current) matRef.current.uniforms.uTime.value = clock.getElapsedTime();
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
        uniforms={{ uTime: { value: 0 }, uColor: { value: [0.6, 0.6, 0.6] }, uSize: { value: 0.5 } }}
        vertexShader={`
          uniform float uTime; uniform float uSize; attribute float velocity;
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

const SnowEffect = () => {
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
    if (matRef.current) matRef.current.uniforms.uTime.value = clock.getElapsedTime();
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
        uniforms={{ uTime: { value: 0 }, uColor: { value: [1.0, 1.0, 1.0] }, uSize: { value: 1.2 } }}
        vertexShader={`
          uniform float uTime; uniform float uSize; attribute float speed; attribute float phase;
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
    if (Math.random() > 0.98) {
      const flash = Math.sin(time) * Math.cos(time * 2.3) * Math.sin(time * 3.1);
      lightRef.current.intensity = flash > 0.5 ? flash * 500 : 0;
    } else {
      lightRef.current.intensity = MathUtils.lerp(lightRef.current.intensity, 0, 0.1);
    }
  });

  return <pointLight ref={lightRef} color="#e0e7ff" position={[0, 100, 0]} distance={500} decay={2} />;
};

/** Compute whether it's night at the given timezone. */
const computeIsNight = (timezone?: string): boolean => {
  try {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone || undefined,
      hour: 'numeric',
      hour12: false,
    };
    const parts = new Intl.DateTimeFormat('en-US', options).formatToParts(new Date());
    const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '', 10);
    return isNaN(hour) ? false : hour < 6 || hour > 18;
  } catch {
    const hour = new Date().getHours();
    return hour < 6 || hour > 18;
  }
};

export const WeatherScene = memo(({ condition, timezone }: WeatherSceneProps) => {
  const isRain = condition === 'Rain' || condition === 'Thunderstorm';
  const isSnow = condition === 'Snow';
  const isCloudy = condition === 'Clouds' || isRain || isSnow;
  const isStorm = condition === 'Thunderstorm';

  const bgColor = condition === 'Clear' ? '#4A90E2'
    : condition === 'Clouds' ? '#5A6B7C'
    : condition === 'Thunderstorm' ? '#0F172A'
    : condition === 'Snow' ? '#78909C'
    : '#4a5568';

  // Derive day/night from timezone + condition. Refreshes every 10 min.
  const [nightTick, setNightTick] = useState(0);
  const isNight = (() => {
    void nightTick; // depend on tick to force recompute
    return computeIsNight(timezone);
  })();

  useEffect(() => {
    const interval = setInterval(() => setNightTick(t => t + 1), 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [timezone]);

  return (
    <WeatherSceneErrorBoundary bgColor={bgColor}>
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-gray-900 to-black transition-colors duration-1000">
        <Canvas
          camera={{ position: [0, 0, 100], fov: 60 }}
          dpr={[1, 1]}
          fallback={<div className="absolute inset-0" style={{ background: bgColor }} />}
        >
          <fog attach="fog" args={[bgColor, 50, condition === 'Snow' ? 150 : 300]} />
          <ambientLight intensity={condition === 'Clear' ? 0.8 : isStorm ? 0.1 : 0.4} />
          <directionalLight position={[10, 100, 10]} intensity={isStorm ? 0.2 : 0.8} />

          {condition === 'Clear' && !isNight && (
            <mesh position={[70, 35, -120]}>
              <sphereGeometry args={[12, 32, 16]} />
              <meshBasicMaterial color="#fff7c2" />
            </mesh>
          )}
          {condition === 'Clear' && isNight && <Stars />}

          {isCloudy && (
            <group position={[0, 40, -50]}>
              <CloudCluster opacity={isStorm ? 0.75 : 0.4} color={isStorm ? '#333333' : '#ffffff'} scale={5} />
              <CloudCluster position={[50, -20, -50]} opacity={isStorm ? 0.85 : 0.4} color={isStorm ? '#222222' : '#ffffff'} scale={7} />
              <CloudCluster position={[-50, 10, -30]} opacity={isStorm ? 0.65 : 0.4} color={isStorm ? '#444444' : '#ffffff'} scale={6} />
            </group>
          )}

          {isRain && <Rain />}
          {isSnow && <SnowEffect />}
          {isStorm && <Lightning />}

          <color attach="background" args={[bgColor]} />
        </Canvas>
        {/* Scrim for text contrast */}
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
      </div>
    </WeatherSceneErrorBoundary>
  );
});
