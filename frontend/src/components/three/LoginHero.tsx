import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = () => setReduced(query.matches);
    query.addEventListener('change', handler);
    return () => query.removeEventListener('change', handler);
  }, []);

  return reduced;
}

function useParticlePositions(count: number): Float32Array {
  return useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 4 + Math.random() * 7;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    return positions;
  }, [count]);
}

function Scene({ reduced }: { reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Mesh>(null);
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  const particles = useRef<THREE.Points>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const { camera } = useThree();
  const particlePositions = useParticlePositions(700);

  useEffect(() => {
    if (reduced) return;
    const handler = (event: MouseEvent) => {
      mouse.current.x = event.clientX / window.innerWidth - 0.5;
      mouse.current.y = event.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, [reduced]);

  useFrame(() => {
    if (reduced) return;
    if (group.current) {
      group.current.rotation.y += 0.0022;
      group.current.rotation.x += 0.0009;
    }
    if (inner.current) inner.current.rotation.y -= 0.006;
    if (ring1.current) ring1.current.rotation.z += 0.004;
    if (ring2.current) ring2.current.rotation.z -= 0.003;
    if (particles.current) particles.current.rotation.y += 0.0006;

    camera.position.x += (mouse.current.x * 1.4 - camera.position.x) * 0.04;
    camera.position.y += (-mouse.current.y * 1.4 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <group ref={group}>
        <mesh>
          <icosahedronGeometry args={[1.5, 1]} />
          <meshBasicMaterial color="#22D3EE" wireframe transparent opacity={0.55} />
        </mesh>
        <mesh ref={inner}>
          <icosahedronGeometry args={[0.7, 0]} />
          <meshBasicMaterial color="#7C6FF0" transparent opacity={0.35} />
        </mesh>
        <mesh ref={ring1} rotation={[1.2, 0.3, 0]}>
          <torusGeometry args={[2.5, 0.012, 12, 140]} />
          <meshBasicMaterial color="#22D3EE" transparent opacity={0.4} />
        </mesh>
        <mesh ref={ring2} rotation={[0.4, 1.1, 0]}>
          <torusGeometry args={[3.1, 0.012, 12, 140]} />
          <meshBasicMaterial color="#22D3EE" transparent opacity={0.4} />
        </mesh>
      </group>
      <points ref={particles}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particlePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#22D3EE" size={0.03} transparent opacity={0.7} />
      </points>
    </>
  );
}

export default function LoginHero() {
  const reduced = useReducedMotion();

  return (
    <Canvas
      style={{ position: 'absolute', inset: 0 }}
      dpr={[1, 1.5]}
      frameloop={reduced ? 'demand' : 'always'}
      camera={{ position: [0, 0, 6], fov: 55 }}
      gl={{ alpha: true, antialias: true }}
    >
      <Scene reduced={reduced} />
    </Canvas>
  );
}
