import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { usePointer } from '../hooks/usePointer.js';
import { isWebGLAvailable } from '../utils/webgl.js';

function ParallaxRig({ pointer, children }) {
  const group = useRef(null);
  useFrame((state) => {
    if (!group.current) return;
    const { x, y } = pointer.current;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, x * 0.22, 0.04);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -y * 0.14, 0.04);
    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, x * 0.25, 0.03);
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, y * 0.15, 0.03);

    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, x * 0.3, 0.02);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, -y * 0.2, 0.02);
    state.camera.lookAt(0, 0, 0);
  });
  return <group ref={group}>{children}</group>;
}

function Core() {
  const geometry = useMemo(() => new THREE.IcosahedronGeometry(1.5, 4), []);
  return (
    <Float speed={1.1} rotationIntensity={0.45} floatIntensity={0.7}>
      <mesh geometry={geometry}>
        <MeshDistortMaterial
          color="#0f1613"
          emissive="#1c3a2a"
          emissiveIntensity={0.4}
          roughness={0.15}
          metalness={0.7}
          distort={0.32}
          speed={1.4}
          transparent
          opacity={0.92}
        />
      </mesh>
      <mesh geometry={geometry} scale={1.012}>
        <meshBasicMaterial color="#95ff8a" wireframe transparent opacity={0.06} />
      </mesh>
    </Float>
  );
}

function Satellite({ radius, speed, size, color, offset = 0 }) {
  const ref = useRef(null);
  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed + offset;
    if (ref.current) {
      ref.current.position.set(Math.cos(t) * radius, Math.sin(t * 0.6) * (radius * 0.4), Math.sin(t) * radius);
    }
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[size, 0]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} roughness={0.3} />
    </mesh>
  );
}

function Scene() {
  const pointer = usePointer();
  return (
    <>
      <fog attach="fog" args={['#07090a', 5, 13]} />
      <ambientLight intensity={0.35} />
      <pointLight position={[3, 2, 4]} color="#95ff8a" intensity={3} distance={14} />
      <pointLight position={[-4, -2, -2]} color="#8b6cff" intensity={2.4} distance={14} />
      <pointLight position={[0, -3, 2]} color="#2c6b46" intensity={1} distance={10} />

      <ParallaxRig pointer={pointer}>
        <Core />
        <Satellite radius={2.6} speed={0.25} size={0.09} color="#95ff8a" />
        <Satellite radius={2.1} speed={0.34} size={0.06} color="#8b6cff" offset={2.1} />
        <Satellite radius={3.1} speed={0.18} size={0.05} color="#c9ffbc" offset={4.4} />
        <Sparkles count={70} scale={[6, 5, 5]} size={1.4} speed={0.25} opacity={0.5} color="#95ff8a" noise={1} />
        <Sparkles count={40} scale={[5, 4, 4]} size={1.1} speed={0.18} opacity={0.35} color="#8b6cff" noise={1} />
      </ParallaxRig>
    </>
  );
}

export default function Scene3D({ className }) {
  const supported = useMemo(() => isWebGLAvailable(), []);

  if (!supported) {
    return <div className={className} aria-hidden="true" />;
  }

  return (
    <Canvas
      className={className}
      dpr={[1, 1.75]}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 6.2], fov: 38 }}
      frameloop="always"
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  );
}
