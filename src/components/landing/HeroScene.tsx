'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// Floating geometric shapes representing concurrency concepts
function ConceptOrb({ position, color, size, speed, offset }: {
  position: [number, number, number];
  color: string;
  size: number;
  speed: number;
  offset: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * speed + offset;
    ref.current.position.y = position[1] + Math.sin(t) * 0.4;
    ref.current.position.x = position[0] + Math.cos(t * 0.7) * 0.2;
    ref.current.rotation.y = t * 0.3;
    ref.current.rotation.z = Math.sin(t * 0.5) * 0.1;
  });

  return (
    <group ref={ref} position={position}>
      {/* Inner core */}
      <mesh>
        <icosahedronGeometry args={[size, 1]} />
        <meshStandardMaterial
          ref={materialRef}
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          transparent
          opacity={0.85}
          wireframe
        />
      </mesh>
      {/* Outer glow shell */}
      <mesh>
        <icosahedronGeometry args={[size * 1.3, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.15}
          transparent
          opacity={0.08}
        />
      </mesh>
    </group>
  );
}

// Connection lines between orbs
function ConnectionLine({ start, end, color }: {
  start: [number, number, number];
  end: [number, number, number];
  color: string;
}) {
  const lineRef = useRef<THREE.LineSegments>(null);
  const points = useMemo(() => {
    const s = new THREE.Vector3(...start);
    const mid = new THREE.Vector3(
      (start[0] + end[0]) / 2 + (Math.random() - 0.5) * 0.5,
      (start[1] + end[1]) / 2 + 0.3,
      (start[2] + end[2]) / 2,
    );
    const e = new THREE.Vector3(...end);
    const curve = new THREE.QuadraticBezierCurve3(s, mid, e);
    return curve.getPoints(20);
  }, [start, end]);

  const geometry = useMemo(() => {
    const verts: number[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      verts.push(points[i].x, points[i].y, points[i].z);
      verts.push(points[i + 1].x, points[i + 1].y, points[i + 1].z);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    return geo;
  }, [points]);

  return (
    <lineSegments ref={lineRef} geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={0.08} />
    </lineSegments>
  );
}

// Floating pan / kitchen element
function FloatingPan() {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.15;
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.15;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={ref} position={[0, -0.2, 0]}>
        {/* Pan body */}
        <mesh>
          <cylinderGeometry args={[0.6, 0.5, 0.12, 32]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.95} roughness={0.15} />
        </mesh>
        {/* Rim highlight */}
        <mesh position={[0, 0.06, 0]}>
          <torusGeometry args={[0.55, 0.01, 8, 32]} />
          <meshStandardMaterial color="#FF5A1F" emissive="#FF5A1F" emissiveIntensity={0.8} transparent opacity={0.4} />
        </mesh>
        {/* Handle */}
        <mesh position={[0.9, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 0.6, 6]} />
          <meshStandardMaterial color="#16162a" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>
    </Float>
  );
}

// Subtle grid floor
function GridFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]}>
      <planeGeometry args={[40, 40, 40, 40]} />
      <meshStandardMaterial color="#06060c" wireframe transparent opacity={0.06} />
    </mesh>
  );
}

export default function HeroScene() {
  const orbPositions: Array<{
    pos: [number, number, number];
    color: string;
    size: number;
    speed: number;
  }> = useMemo(() => [
    { pos: [-2.5, 0.8, -1], color: '#FF5A1F', size: 0.15, speed: 0.6 },
    { pos: [2.2, 1.2, -1.5], color: '#6366F1', size: 0.12, speed: 0.5 },
    { pos: [-1.5, -0.5, -0.5], color: '#818CF8', size: 0.1, speed: 0.7 },
    { pos: [1.8, -0.3, -1], color: '#FF5A1F', size: 0.08, speed: 0.8 },
    { pos: [0.5, 1.5, -2], color: '#6366F1', size: 0.18, speed: 0.4 },
    { pos: [-0.8, 0.3, -1.5], color: '#818CF8', size: 0.13, speed: 0.55 },
    { pos: [3, 0.2, -2], color: '#FF5A1F', size: 0.07, speed: 0.65 },
    { pos: [-3, -0.2, -1.8], color: '#6366F1', size: 0.06, speed: 0.75 },
  ], []);

  return (
    <Canvas
      camera={{ position: [0, 0.5, 4], fov: 45 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: true }}
      fallback={<div style={{ width: '100%', height: '100%', background: '#06060c' }} />}
      dpr={[1, 1.5]}
    >
      <color attach="background" args={['#06060c']} />
      <fog attach="fog" args={['#06060c', 4, 16]} />

      {/* Lighting — soft and directional */}
      <ambientLight intensity={0.06} />
      <pointLight position={[3, 4, 2]} intensity={0.6} color="#FF5A1F" distance={15} />
      <pointLight position={[-3, 3, -1]} intensity={0.4} color="#6366F1" distance={12} />
      <pointLight position={[0, -2, 3]} intensity={0.3} color="#818CF8" distance={10} />

      {/* Central kitchen element */}
      <FloatingPan />

      {/* Orbiting concept orbs */}
      {orbPositions.map((orb, i) => (
        <ConceptOrb
          key={i}
          position={orb.pos}
          color={orb.color}
          size={orb.size}
          speed={orb.speed}
          offset={i * 1.5}
        />
      ))}

      {/* Connection lines */}
      <ConnectionLine start={[-2.5, 0.8, -1]} end={[0.5, 1.5, -2]} color="#FF5A1F" />
      <ConnectionLine start={[2.2, 1.2, -1.5]} end={[-0.8, 0.3, -1.5]} color="#6366F1" />
      <ConnectionLine start={[-1.5, -0.5, -0.5]} end={[1.8, -0.3, -1]} color="#818CF8" />

      <GridFloor />

      {/* Sparse particles */}
      <Sparkles count={40} scale={8} size={0.8} speed={0.15} color="#FF5A1F" opacity={0.15} />
      <Sparkles count={20} scale={8} size={0.5} speed={0.1} color="#6366F1" opacity={0.08} />
    </Canvas>
  );
}
