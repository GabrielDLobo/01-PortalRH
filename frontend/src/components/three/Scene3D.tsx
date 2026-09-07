import { CSSProperties, ReactNode, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';

export function useReducedMotion(): boolean {
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

interface Scene3DProps {
  children: ReactNode;
  camera?: { position: [number, number, number]; fov: number };
  className?: string;
  style?: CSSProperties;
  /** Pause the render loop (via frameloop="never") when the canvas scrolls out of view. */
  pauseOffscreen?: boolean;
}

/**
 * Shared wrapper for the app's two WebGL contexts (login orbit + dashboard
 * header object). Fully unmounts under prefers-reduced-motion and pauses
 * rendering when scrolled out of view, so at most one loop runs at a time
 * per screen.
 */
export default function Scene3D({
  children,
  camera,
  className,
  style,
  pauseOffscreen = true,
}: Scene3DProps) {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!pauseOffscreen) return undefined;
    const el = containerRef.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [pauseOffscreen]);

  if (reduced) return null;

  return (
    <div ref={containerRef} className={className} style={style}>
      <Canvas
        dpr={[1, 1.5]}
        frameloop={visible ? 'always' : 'never'}
        camera={{ position: camera?.position ?? [0, 0, 5], fov: camera?.fov ?? 50 }}
        gl={{ alpha: true, antialias: true }}
      >
        {children}
      </Canvas>
    </div>
  );
}
