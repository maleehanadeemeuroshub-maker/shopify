import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { isWebGLAvailable } from '../utils/webgl.js';

// Reads a framer-motion MotionValue's current value every Three.js frame via
// `.get()` — not a React state subscription, so scroll updates never trigger
// a React re-render; only the R3F render loop (already running) picks it up.
function ScrollCore({ progress }) {
  const groupRef = useRef(null);
  const materialRef = useRef(null);
  const geometry = useMemo(() => new THREE.IcosahedronGeometry(1.7, 4), []);

  const colorA = useMemo(() => new THREE.Color('#1c3a2a'), []);
  const colorB = useMemo(() => new THREE.Color('#3a2a6b'), []);
  const tmpColor = useMemo(() => new THREE.Color(), []);

  useFrame((state, delta) => {
    const p = progress.get();

    if (groupRef.current) {
      groupRef.current.rotation.y = p * Math.PI * 5;
      groupRef.current.rotation.x = Math.sin(p * Math.PI * 2) * 0.5;
      groupRef.current.rotation.z += delta * 0.04;
      groupRef.current.position.z = -1.4 + p * 2.4;
    }
    if (materialRef.current) {
      materialRef.current.distort = 0.22 + p * 0.55;
      tmpColor.copy(colorA).lerp(colorB, p);
      materialRef.current.emissive = tmpColor;
      materialRef.current.emissiveIntensity = 0.35 + p * 0.5;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.1} rotationIntensity={0.3} floatIntensity={0.5}>
        <mesh geometry={geometry}>
          <MeshDistortMaterial
            ref={materialRef}
            color="#0f1613"
            roughness={0.15}
            metalness={0.7}
            distort={0.28}
            speed={1.3}
            transparent
            opacity={0.92}
          />
        </mesh>
        <mesh geometry={geometry} scale={1.012}>
          <meshBasicMaterial color="#95ff8a" wireframe transparent opacity={0.07} />
        </mesh>
      </Float>
    </group>
  );
}

function ScrollRig({ progress }) {
  useFrame((state) => {
    const p = progress.get();
    state.camera.position.z = THREE.MathUtils.lerp(6.4, 4.6, p);
    state.camera.position.y = THREE.MathUtils.lerp(0, -0.3, p);
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

function Scene({ progress }) {
  return (
    <>
      <fog attach="fog" args={['#07090a', 5, 12]} />
      <ambientLight intensity={0.35} />
      <pointLight position={[3, 2, 4]} color="#95ff8a" intensity={3} distance={14} />
      <pointLight position={[-4, -2, -2]} color="#8b6cff" intensity={2.6} distance={14} />
      <pointLight position={[0, -3, 2]} color="#2c6b46" intensity={1} distance={10} />

      <ScrollRig progress={progress} />
      <ScrollCore progress={progress} />
      <Sparkles count={90} scale={[7, 6, 6]} size={1.3} speed={0.2} opacity={0.5} color="#95ff8a" noise={1} />
      <Sparkles count={45} scale={[6, 5, 5]} size={1.1} speed={0.16} opacity={0.35} color="#8b6cff" noise={1} />
    </>
  );
}

/**
 * Fills its container with a Three.js scene whose rotation/position/material
 * evolve continuously as `progress` (a framer-motion MotionValue, 0..1)
 * changes — meant to sit behind a tall page of scroll-revealed content via
 * `position: sticky`, not driven by mouse like Scene3D.
 */
export default function ScrollScene3D({ progress, className }) {
  const supported = useMemo(() => isWebGLAvailable(), []);

  if (!supported) {
    return <div className={className} aria-hidden="true" />;
  }

  return (
    <Canvas
      className={className}
      dpr={[1, 1.75]}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 6.4], fov: 38 }}
      frameloop="always"
    >
      <Suspense fallback={null}>
        <Scene progress={progress} />
      </Suspense>
    </Canvas>
  );
}
