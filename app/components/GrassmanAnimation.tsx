'use client';

import { useEffect, useRef } from 'react';

interface Props {
  width: number;
  height: number;
}

export default function GrassmanAnimation({ width, height }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const positionRef = useRef({ x: 0, direction: 1 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const drawGrassman = (x: number, direction: number) => {
      ctx.clearRect(0, 0, width, height);

      // Draw grass (taller grass area)
      ctx.fillStyle = '#1a0b2e';
      ctx.fillRect(0, height - 60, width, 60);

      // Draw person (larger size)
      const centerX = x;
      const centerY = height - 80;  // Adjusted position for larger character

      // Body (larger)
      ctx.fillStyle = '#ff2975';
      ctx.fillRect(centerX - 20, centerY - 40, 40, 60);

      // Head (larger)
      ctx.beginPath();
      ctx.arc(centerX, centerY - 50, 16, 0, Math.PI * 2);
      ctx.fillStyle = '#ff8a2c';
      ctx.fill();

      // Arms holding trimmer (thicker and longer)
      ctx.strokeStyle = '#ff2975';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - 30);
      ctx.lineTo(centerX + (direction * 40), centerY - 10);
      ctx.stroke();

      // Trimmer (larger)
      ctx.strokeStyle = '#7597de';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(centerX + (direction * 30), centerY - 10);
      ctx.lineTo(centerX + (direction * 60), centerY);
      ctx.stroke();

      // Spinning trimmer line effect (larger radius)
      const now = Date.now();
      const rotation = (now / 100) % (Math.PI * 2);
      ctx.strokeStyle = '#00fff9';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(
        centerX + (direction * 60) + Math.cos(rotation) * 16,
        centerY + Math.sin(rotation) * 16
      );
      ctx.lineTo(
        centerX + (direction * 60) + Math.cos(rotation + Math.PI) * 16,
        centerY + Math.sin(rotation + Math.PI) * 16
      );
      ctx.stroke();

      // Cut grass effect (larger particles)
      ctx.fillStyle = '#ff2975';
      for (let i = 0; i < 8; i++) {
        const grassX = centerX + (direction * 60) + (Math.random() - 0.5) * 40;
        const grassY = height - 60 + Math.random() * 20;
        ctx.fillRect(grassX, grassY, 4, 20);
      }
    };

    let animationFrame: number;
    const animate = () => {
      const speed = 3;  // Slightly faster movement
      positionRef.current.x += speed * positionRef.current.direction;

      // Change direction at edges (adjusted for larger character)
      if (positionRef.current.x > width - 100) {
        positionRef.current.direction = -1;
      } else if (positionRef.current.x < 100) {
        positionRef.current.direction = 1;
      }

      drawGrassman(positionRef.current.x, positionRef.current.direction);
      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute top-0 left-0 -z-0 w-full h-full"
    />
  );
} 