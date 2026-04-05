'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, Html } from '@react-three/drei';
import * as THREE from 'three';

const labelStyle = {
  color: '#9CA3AF',
  fontSize: '11px',
  fontFamily: 'monospace',
  background: 'rgba(0,0,0,0.6)',
  padding: '2px 8px',
  borderRadius: '4px',
  whiteSpace: 'nowrap' as const,
};

function Worker({ position, color, speed, path }: {
  position: [number, number, number];
  color: string;
  speed: number;
  path: 'circle' | 'line' | 'zigzag';
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * speed;

    switch (path) {
      case 'circle':
        ref.current.position.x = position[0] + Math.cos(t) * 1;
        ref.current.position.z = position[2] + Math.sin(t) * 1;
        break;
      case 'line':
        ref.current.position.x = position[0] + Math.sin(t) * 1.5;
        break;
      case 'zigzag':
        ref.current.position.x = position[0] + Math.sin(t * 2) * 0.8;
        ref.current.position.z = position[2] + Math.cos(t) * 0.5;
        break;
    }
    ref.current.position.y = position[1] + Math.abs(Math.sin(t * 2)) * 0.15;
  });

  return (
    <group ref={ref} position={position}>
      {/* Body */}
      <mesh>
        <capsuleGeometry args={[0.1, 0.25, 4, 8]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.7} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.28, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.7} />
      </mesh>
      {/* Hard hat */}
      <mesh position={[0, 0.38, 0]}>
        <cylinderGeometry args={[0.09, 0.07, 0.04, 8]} />
        <meshStandardMaterial color="#D97706" emissive="#D97706" emissiveIntensity={0.5} />
      </mesh>
      {/* Label */}
      <Html position={[0, -0.4, 0]} center>
        <div style={labelStyle}>Task</div>
      </Html>
      {/* Task glow trail */}
      <Sparkles count={5} scale={0.5} size={2} speed={0.5} color={color} opacity={0.6} />
    </group>
  );
}

function HiringBoard() {
  return (
    <group position={[0, 1.2, -2]}>
      <mesh>
        <boxGeometry args={[3, 1.8, 0.1]} />
        <meshStandardMaterial color="#12121a" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Board glow frame */}
      <mesh position={[0, 0, 0.06]}>
        <boxGeometry args={[3.1, 1.9, 0.01]} />
        <meshStandardMaterial color="#FF5A1F" emissive="#FF5A1F" emissiveIntensity={0.3} transparent opacity={0.1} wireframe />
      </mesh>
      {/* Priority indicators */}
      {[
        { y: 0.5, color: '#FF5A1F', label: 'HIGH' },
        { y: 0.1, color: '#D97706', label: 'MEDIUM' },
        { y: -0.3, color: '#6366F1', label: 'LOW' },
        { y: -0.7, color: '#333355', label: 'BACKGROUND' },
      ].map(({ y, color }, i) => (
        <mesh key={i} position={[-1.2, y, 0.06]}>
          <boxGeometry args={[0.15, 0.15, 0.01]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} />
        </mesh>
      ))}
      {/* Label */}
      <Html position={[0, -1.2, 0]} center>
        <div style={labelStyle}>Task Queue</div>
      </Html>
    </group>
  );
}

function WorkStation({ position, color, priority }: { position: [number, number, number]; color: string; priority: string }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.8, 0.5, 0.8]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.26, 0]}>
        <boxGeometry args={[0.6, 0.02, 0.6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.3} />
      </mesh>
      {/* Label */}
      <Html position={[0, -0.55, 0]} center>
        <div style={labelStyle}>{priority}</div>
      </Html>
    </group>
  );
}

export default function WorkerScene() {
  return (
    <Canvas camera={{ position: [0, 2.5, 5], fov: 45 }} style={{ width: '100%', height: '400px' }} fallback={<div style={{ width: '100%', height: '400px', background: '#0a0a0f' }} />}>
      <color attach="background" args={['#0a0a0f']} />
      <fog attach="fog" args={['#0a0a0f', 6, 18]} />

      <ambientLight intensity={0.35} />
      <pointLight position={[2, 4, 3]} intensity={1} color="#FF5A1F" />
      <pointLight position={[-2, 3, 2]} intensity={0.7} color="#6366F1" />
      <pointLight position={[0, 3, -2]} intensity={0.5} color="#D97706" />

      <HiringBoard />

      {/* Work stations */}
      <WorkStation position={[-2, -0.5, 0]} color="#FF5A1F" priority="HIGH" />
      <WorkStation position={[0, -0.5, 1]} color="#D97706" priority="MEDIUM" />
      <WorkStation position={[2, -0.5, 0]} color="#6366F1" priority="LOW" />

      {/* Workers with different priorities/paths */}
      <Worker position={[-2, 0, 0]} color="#FF5A1F" speed={0.8} path="circle" />
      <Worker position={[0, 0, 1]} color="#D97706" speed={0.5} path="line" />
      <Worker position={[2, 0, 0]} color="#6366F1" speed={0.3} path="zigzag" />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.75, 0]}>
        <planeGeometry args={[12, 10, 12, 10]} />
        <meshStandardMaterial color="#0a0a0f" wireframe transparent opacity={0.08} />
      </mesh>

      <Sparkles count={25} scale={8} size={1} speed={0.2} opacity={0.15} />
    </Canvas>
  );
}
