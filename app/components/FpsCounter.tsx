'use client';

import { useEffect, useState, useRef } from 'react';
import styles from './FpsCounter.module.css';

export default function FpsCounter() {
  const [fps, setFps] = useState(0);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const animationFrameId = useRef<number>();

  useEffect(() => {
    const calculateFps = () => {
      const currentTime = performance.now();
      const elapsed = currentTime - lastTime.current;
      
      if (elapsed >= 1000) { // Update every second
        setFps(Math.round((frameCount.current * 1000) / elapsed));
        frameCount.current = 0;
        lastTime.current = currentTime;
      }
      
      frameCount.current++;
      animationFrameId.current = requestAnimationFrame(calculateFps);
    };

    animationFrameId.current = requestAnimationFrame(calculateFps);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return (
    <div className={styles.fpsCounter}>
      {fps} FPS
    </div>
  );
} 