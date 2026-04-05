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

function OrderTicket({ startX, speed, color, delay }: { startX: number; speed: number; color: string; delay: number }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current) {
      const t = (state.clock.elapsedTime * speed + delay) % 8;
      ref.current.position.x = startX + t * 0.8 - 3;
      ref.current.position.y = Math.sin(t * 0.8) * 0.3 + 0.5;
      ref.current.rotation.z = Math.sin(t) * 0.1;
    }
  });

  return (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[0.3, 0.4, 0.02]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          transparent
          opacity={0.85}
        />
      </mesh>
      <Html position={[0, -0.35, 0]} center>
        <div style={labelStyle}>Task</div>
      </Html>
    </group>
  );
}

function Waiter({ position, color, index }: { position: [number, number, number]; color: string; index: number }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
    }
  });

  return (
    <group ref={ref} position={position}>
      {/* Body */}
      <mesh>
        <capsuleGeometry args={[0.12, 0.3, 4, 8]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.7} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.7} />
      </mesh>
      {/* Tray */}
      <mesh position={[0.2, 0.1, 0]} rotation={[0, 0, 0.2]}>
        <cylinderGeometry args={[0.15, 0.15, 0.02, 8]} />
        <meshStandardMaterial color="#333355" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Label */}
      <Html position={[0, -0.5, 0]} center>
        <div style={labelStyle}>Thread</div>
      </Html>
    </group>
  );
}

function KitchenWindow() {
  return (
    <group position={[-3, 0.5, 0]}>
      <mesh>
        <boxGeometry args={[0.1, 1.5, 1.5]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Window opening glow */}
      <mesh position={[0.06, 0, 0]}>
        <boxGeometry args={[0.02, 1, 1]} />
        <meshStandardMaterial
          color="#FF5A1F"
          emissive="#FF5A1F"
          emissiveIntensity={1}
          transparent
          opacity={0.2}
        />
      </mesh>
      {/* Label */}
      <Html position={[0, -1.1, 0]} center>
        <div style={labelStyle}>async func</div>
      </Html>
    </group>
  );
}

function AwaitSign() {
  return (
    <Float speed={1} floatIntensity={0.3}>
      <group position={[0, 1.8, 0]}>
        <mesh>
          <boxGeometry args={[2, 0.5, 0.05]} />
          <meshStandardMaterial color="#0a0a0f" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0, 0.03]}>
          <boxGeometry args={[1.8, 0.35, 0.01]} />
          <meshStandardMaterial
            color="#D97706"
            emissive="#D97706"
            emissiveIntensity={1}
            transparent
            opacity={0.3}
          />
        </mesh>
        {/* Label */}
        <Html position={[0, -0.5, 0]} center>
          <div style={labelStyle}>await</div>
        </Html>
      </group>
    </Float>
  );
}

export default function OrderFlowScene() {
  return (
    <Canvas camera={{ position: [0, 1.5, 4.5], fov: 45 }} style={{ width: '100%', height: '400px' }} fallback={<div style={{ width: '100%', height: '400px', background: '#0a0a0f' }} />}>
      <color attach="background" args={['#0a0a0f']} />
      <fog attach="fog" args={['#0a0a0f', 6, 15]} />

      <ambientLight intensity={0.35} />
      <pointLight position={[-3, 2, 2]} intensity={1} color="#FF5A1F" />
      <pointLight position={[3, 2, 1]} intensity={0.7} color="#6366F1" />
      <pointLight position={[0, 3, 0]} intensity={0.5} color="#D97706" />

      <KitchenWindow />
      <AwaitSign />

      {/* Order tickets flowing */}
      <OrderTicket startX={-3} speed={0.4} color="#FF5A1F" delay={0} />
      <OrderTicket startX={-3} speed={0.35} color="#6366F1" delay={2} />
      <OrderTicket startX={-3} speed={0.45} color="#D97706" delay={4} />

      {/* Waiters */}
      <Waiter position={[1, -0.3, 0.5]} color="#6366F1" index={0} />
      <Waiter position={[2, -0.3, -0.5]} color="#FF5A1F" index={1} />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
        <planeGeometry args={[12, 8, 12, 8]} />
        <meshStandardMaterial color="#0a0a0f" wireframe transparent opacity={0.08} />
      </mesh>

      <Sparkles count={30} scale={6} size={1.5} speed={0.3} color="#FF5A1F" opacity={0.2} />
    </Canvas>
  );
}
