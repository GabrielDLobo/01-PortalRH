import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Scene3D from './Scene3D';

function OrbScene() {
  const icosahedron = useRef<THREE.Mesh>(null);
  const torus = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (icosahedron.current) {
      icosahedron.current.rotation.y += 0.004;
      icosahedron.current.rotation.x += 0.0016;
    }
    if (torus.current) torus.current.rotation.z += 0.003;
  });

  return (
    <>
      <mesh ref={icosahedron}>
        <icosahedronGeometry args={[1.6, 1]} />
        <meshBasicMaterial color="#22D3EE" wireframe transparent opacity={0.45} />
      </mesh>
      <mesh ref={torus} rotation={[1.1, 0, 0]}>
        <torusGeometry args={[2.3, 0.01, 10, 120]} />
        <meshBasicMaterial color="#7C6FF0" transparent opacity={0.4} />
      </mesh>
    </>
  );
}

export default function DashboardOrb() {
  return (
    <Scene3D
      className="pointer-events-none absolute right-3 top-[-30px] hidden h-[220px] w-[280px] opacity-90 sm:block"
      camera={{ position: [0, 0, 5], fov: 50 }}
    >
      <OrbScene />
    </Scene3D>
  );
}
