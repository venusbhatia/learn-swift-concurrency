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

function ChefStation({ position, color, stationId }: {
  position: [number, number, number];
  color: string;
  stationId: number;
}) {
  const barrierRef = useRef<THREE.Mesh>(null);
  const chefRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (barrierRef.current) {
      const mat = barrierRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 2 + stationId) * 0.3;
    }
    if (chefRef.current) {
      chefRef.current.position.y = position[1] + 0.3 + Math.sin(state.clock.elapsedTime * 1.5 + stationId * 2) * 0.05;
    }
  });

  return (
    <group position={position}>
      {/* Counter */}
      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[1.5, 0.15, 1]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Counter glow edge */}
      <mesh position={[0, -0.12, 0.5]}>
        <boxGeometry args={[1.5, 0.02, 0.02]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </mesh>

      {/* Isolation barrier - right */}
      <mesh ref={barrierRef} position={[0.8, 0.3, 0]}>
        <boxGeometry args={[0.05, 1.2, 1]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.3}
        />
      </mesh>
      {/* Barrier label - right */}
      <Html position={[0.8, 1.1, 0]} center>
        <div style={labelStyle}>isolation</div>
      </Html>

      {/* Isolation barrier - left */}
      <mesh position={[-0.8, 0.3, 0]}>
        <boxGeometry args={[0.05, 1.2, 1]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Chef */}
      <group ref={chefRef}>
        <mesh position={[0, 0.3, 0]}>
          <capsuleGeometry args={[0.1, 0.25, 4, 8]} />
          <meshStandardMaterial color={color} metalness={0.2} roughness={0.8} />
        </mesh>
        {/* Chef hat */}
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 0.15, 8]} />
          <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.9} />
        </mesh>
      </group>

      {/* Station label */}
      <Html position={[0, -0.6, 0]} center>
        <div style={labelStyle}>actor Station{stationId + 1}</div>
      </Html>

      {/* Items on counter */}
      <Float speed={2} floatIntensity={0.1}>
        <mesh position={[-0.3, 0, 0]}>
          <boxGeometry args={[0.15, 0.15, 0.15]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} transparent opacity={0.7} />
        </mesh>
      </Float>
      <Float speed={1.5} floatIntensity={0.1}>
        <mesh position={[0.3, 0, 0.2]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} transparent opacity={0.7} />
        </mesh>
      </Float>
    </group>
  );
}

function AwaitQueue({ position }: { position: [number, number, number] }) {
  const dotsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (dotsRef.current) {
      dotsRef.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        mesh.position.y = Math.sin(state.clock.elapsedTime * 3 + i * 0.5) * 0.05;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.3;
      });
    }
  });

  return (
    <group position={position}>
      {/* Queue line */}
      <mesh>
        <boxGeometry args={[0.02, 0.02, 2]} />
        <meshStandardMaterial color="#D97706" emissive="#D97706" emissiveIntensity={1} transparent opacity={0.4} />
      </mesh>
      {/* Waiting dots */}
      <group ref={dotsRef}>
        {[-0.6, -0.2, 0.2, 0.6].map((z, i) => (
          <mesh key={i} position={[0, 0, z]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color="#D97706" emissive="#D97706" emissiveIntensity={2} transparent opacity={0.5} />
          </mesh>
        ))}
      </group>
      {/* Label */}
      <Html position={[0, -0.3, 0]} center>
        <div style={labelStyle}>await</div>
      </Html>
    </group>
  );
}

export default function ChefStationScene() {
  return (
    <Canvas camera={{ position: [0, 2.5, 5], fov: 45 }} style={{ width: '100%', height: '400px' }} fallback={<div style={{ width: '100%', height: '400px', background: '#0a0a0f' }} />}>
      <color attach="background" args={['#0a0a0f']} />
      <fog attach="fog" args={['#0a0a0f', 6, 18]} />

      <ambientLight intensity={0.35} />
      <pointLight position={[-2, 3, 3]} intensity={0.8} color="#FF5A1F" />
      <pointLight position={[2, 3, 3]} intensity={0.8} color="#6366F1" />
      <pointLight position={[0, 4, 0]} intensity={0.6} color="#16A34A" />

      {/* Three isolated chef stations */}
      <ChefStation position={[-2.2, 0, 0]} color="#FF5A1F" stationId={0} />
      <ChefStation position={[0, 0, 0]} color="#6366F1" stationId={1} />
      <ChefStation position={[2.2, 0, 0]} color="#16A34A" stationId={2} />

      {/* Await queues between stations */}
      <AwaitQueue position={[-1.1, 0.5, 0]} />
      <AwaitQueue position={[1.1, 0.5, 0]} />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.35, 0]}>
        <planeGeometry args={[12, 8, 12, 8]} />
        <meshStandardMaterial color="#0a0a0f" wireframe transparent opacity={0.08} />
      </mesh>

      <Sparkles count={30} scale={8} size={1} speed={0.2} opacity={0.15} />
    </Canvas>
  );
}
