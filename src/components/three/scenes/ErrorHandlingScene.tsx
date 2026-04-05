'use client';

import { useRef, useState } from 'react';
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

function ConveyorBelt() {
  return (
    <group position={[0, -0.5, 0]}>
      <mesh>
        <boxGeometry args={[6, 0.1, 1]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Belt lines */}
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={i} position={[-2.7 + i * 0.6, 0.06, 0]}>
          <boxGeometry args={[0.02, 0.02, 1]} />
          <meshStandardMaterial color="#333355" />
        </mesh>
      ))}
    </group>
  );
}

function Dish({ position, isGood, index }: { position: [number, number, number]; isGood: boolean; index: number }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current) {
      // Gentle bobbing
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + index) * 0.05;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={ref} position={position}>
        {/* Plate - flatter cylinder to look like a plate */}
        <mesh>
          <cylinderGeometry args={[0.35, 0.3, 0.04, 24]} />
          <meshStandardMaterial
            color={isGood ? '#1a3a2e' : '#3a1a1a'}
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>
        {/* Plate rim */}
        <mesh position={[0, 0.02, 0]}>
          <torusGeometry args={[0.33, 0.02, 8, 24]} />
          <meshStandardMaterial
            color={isGood ? '#2a5a3e' : '#5a2a2a'}
            metalness={0.5}
            roughness={0.4}
          />
        </mesh>
        {/* Status glow */}
        <mesh position={[0, 0.12, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial
            color={isGood ? '#16A34A' : '#ff453a'}
            emissive={isGood ? '#16A34A' : '#ff453a'}
            emissiveIntensity={2}
          />
        </mesh>
        {/* Label */}
        <Html position={[0, -0.4, 0]} center>
          <div style={labelStyle}>
            {isGood ? '\u2713 success' : '\u2717 error'}
          </div>
        </Html>
      </group>
    </Float>
  );
}

function Inspector() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 3) * 0.1;
    }
  });

  return (
    <group position={[0, 0.3, 0.8]}>
      {/* Inspector body */}
      <mesh>
        <capsuleGeometry args={[0.15, 0.3, 4, 8]} />
        <meshStandardMaterial color="#6366F1" metalness={0.3} roughness={0.7} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#6366F1" metalness={0.3} roughness={0.7} />
      </mesh>
      {/* Magnifying glass */}
      <mesh ref={ref} position={[0.2, 0.3, 0]}>
        <torusGeometry args={[0.1, 0.02, 8, 16]} />
        <meshStandardMaterial color="#D97706" emissive="#D97706" emissiveIntensity={1} />
      </mesh>
      {/* Label */}
      <Html position={[0, -0.6, 0]} center>
        <div style={labelStyle}>try</div>
      </Html>
    </group>
  );
}

function CatchBin({ position, label }: { position: [number, number, number]; label: string }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.6, 0.4, 0.4]} />
        <meshStandardMaterial color="#ff453a" transparent opacity={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.21]}>
        <boxGeometry args={[0.55, 0.35, 0.01]} />
        <meshStandardMaterial color="#ff453a" emissive="#ff453a" emissiveIntensity={0.5} transparent opacity={0.2} />
      </mesh>
      {/* Label */}
      <Html position={[0, -0.5, 0]} center>
        <div style={labelStyle}>{'catch { }'}</div>
      </Html>
    </group>
  );
}

export default function ErrorHandlingScene() {
  return (
    <Canvas camera={{ position: [0, 2, 4], fov: 45 }} style={{ width: '100%', height: '400px' }} fallback={<div style={{ width: '100%', height: '400px', background: '#0a0a0f' }} />}>
      <color attach="background" args={['#0a0a0f']} />
      <fog attach="fog" args={['#0a0a0f', 5, 15]} />

      <ambientLight intensity={0.35} />
      <pointLight position={[2, 3, 2]} intensity={1} color="#16A34A" />
      <pointLight position={[-2, 2, 1]} intensity={0.6} color="#ff453a" />
      <pointLight position={[0, 3, -1]} intensity={0.5} color="#6366F1" />

      <ConveyorBelt />
      <Inspector />

      {/* Good dishes */}
      <Dish position={[-2, 0, 0]} isGood={true} index={0} />
      <Dish position={[-0.5, 0, 0]} isGood={true} index={1} />
      <Dish position={[1, 0, 0]} isGood={false} index={2} />
      <Dish position={[2.2, 0, 0]} isGood={true} index={3} />

      {/* Catch bin */}
      <CatchBin position={[0, -0.5, 1.5]} label="catch" />

      <Sparkles count={30} scale={5} size={1.5} speed={0.3} color="#16A34A" opacity={0.2} />
    </Canvas>
  );
}
