'use client';

import { useRef } from 'react';
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

function StackShelf({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Shelf frame */}
      <mesh>
        <boxGeometry args={[1.2, 2, 0.4]} />
        <meshStandardMaterial color="#1a2a1a" transparent opacity={0.3} wireframe />
      </mesh>
      {/* Items (copies - each glows independently) */}
      {[0.6, 0.2, -0.2, -0.6].map((y, i) => (
        <Float key={i} speed={1} floatIntensity={0.1}>
          <mesh position={[0, y, 0]}>
            <boxGeometry args={[0.8, 0.25, 0.25]} />
            <meshStandardMaterial
              color="#16A34A"
              emissive="#16A34A"
              emissiveIntensity={0.3}
              transparent
              opacity={0.7}
            />
          </mesh>
        </Float>
      ))}
      {/* Label */}
      <Html position={[0, -1.4, 0]} center>
        <div style={labelStyle}>struct (Stack)</div>
      </Html>
    </group>
  );
}

function HeapLocker({ position }: { position: [number, number, number] }) {
  const wireRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (wireRef.current) {
      wireRef.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        const material = mesh.material as THREE.MeshStandardMaterial;
        material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.15;
      });
    }
  });

  return (
    <group position={position}>
      {/* Locker */}
      <mesh>
        <boxGeometry args={[1.2, 2, 0.4]} />
        <meshStandardMaterial color="#2a1a2a" transparent opacity={0.3} wireframe />
      </mesh>
      {/* Single shared item */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.6, 0.4, 0.25]} />
        <meshStandardMaterial
          color="#FF5A1F"
          emissive="#FF5A1F"
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </mesh>
      {/* Reference lines (pointers) */}
      <group ref={wireRef}>
        {[-0.8, 0, 0.8].map((x, i) => (
          <mesh key={i} position={[x * 0.5, -0.5, 0.3]}>
            <cylinderGeometry args={[0.01, 0.01, 0.8, 4]} />
            <meshStandardMaterial
              color="#FF5A1F"
              emissive="#FF5A1F"
              emissiveIntensity={1}
              transparent
              opacity={0.4}
            />
          </mesh>
        ))}
      </group>
      {/* Label */}
      <Html position={[0, -1.4, 0]} center>
        <div style={labelStyle}>class (Heap)</div>
      </Html>
    </group>
  );
}

function ActorCage({ position }: { position: [number, number, number] }) {
  const lockRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (lockRef.current) {
      lockRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      const material = lockRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.5;
    }
  });

  return (
    <group position={position}>
      {/* Cage */}
      <mesh>
        <boxGeometry args={[1.2, 2, 0.4]} />
        <meshStandardMaterial color="#1a1a3a" transparent opacity={0.3} wireframe />
      </mesh>
      {/* Cage bars */}
      {[-0.4, -0.2, 0, 0.2, 0.4].map((x, i) => (
        <mesh key={i} position={[x, 0, 0.2]}>
          <cylinderGeometry args={[0.015, 0.015, 2, 4]} />
          <meshStandardMaterial color="#6366F1" transparent opacity={0.4} />
        </mesh>
      ))}
      {/* Item inside */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.5, 0.35, 0.2]} />
        <meshStandardMaterial
          color="#6366F1"
          emissive="#6366F1"
          emissiveIntensity={0.4}
          transparent
          opacity={0.8}
        />
      </mesh>
      {/* Lock */}
      <mesh ref={lockRef} position={[0, -0.8, 0.25]}>
        <torusGeometry args={[0.1, 0.03, 8, 16]} />
        <meshStandardMaterial color="#6366F1" emissive="#6366F1" emissiveIntensity={1} />
      </mesh>
      {/* Label */}
      <Html position={[0, -1.4, 0]} center>
        <div style={labelStyle}>actor (Isolated)</div>
      </Html>
    </group>
  );
}

export default function StorageRoomScene() {
  return (
    <Canvas camera={{ position: [0, 0.5, 4], fov: 45 }} style={{ width: '100%', height: '400px' }} fallback={<div style={{ width: '100%', height: '400px', background: '#0a0a0f' }} />}>
      <color attach="background" args={['#0a0a0f']} />
      <fog attach="fog" args={['#0a0a0f', 5, 15]} />

      <ambientLight intensity={0.35} />
      <pointLight position={[-2, 3, 2]} intensity={0.8} color="#16A34A" />
      <pointLight position={[0, 3, 2]} intensity={0.8} color="#FF5A1F" />
      <pointLight position={[2, 3, 2]} intensity={0.8} color="#6366F1" />

      <StackShelf position={[-2, 0, 0]} />
      <HeapLocker position={[0, 0, 0]} />
      <ActorCage position={[2, 0, 0]} />

      {/* Floor grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.1, 0]}>
        <planeGeometry args={[10, 10, 10, 10]} />
        <meshStandardMaterial color="#0a0a0f" wireframe transparent opacity={0.1} />
      </mesh>

      <Sparkles count={20} scale={6} size={1} speed={0.2} opacity={0.15} />
    </Canvas>
  );
}
