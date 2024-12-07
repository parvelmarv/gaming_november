'use client';

import { useEffect, useRef, useState } from 'react';

interface Mower {
  y: number;
  velocity: number;
}

interface Pipe {
  x: number;
  topHeight: number;
}

// Adjusted constants for handheld trimmer physics
const GRAVITY = 0.1;          // Even slower falling
const JUMP_FORCE = -3;        // More gentle upward movement
const PIPE_SPEED = 2;
const PIPE_SPACING = 300;
const GAP_SIZE = 200;

export default function FlappyBird() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const mowerRef = useRef<Mower>({ y: 250, velocity: 0 });
  const pipesRef = useRef<Pipe[]>([]);
  const animationFrameRef = useRef<number>();

  const jump = () => {
    if (!gameStarted) {
      setGameStarted(true);
      setGameOver(false);
      setScore(0);
      mowerRef.current = { y: 250, velocity: 0 };
      pipesRef.current = [];
    }
    if (!gameOver) {
      mowerRef.current.velocity = JUMP_FORCE;
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setScore(0);
    mowerRef.current = { y: 250, velocity: 0 };
    pipesRef.current = [];
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const gameLoop = () => {
      if (!gameStarted || gameOver) return;

      // Update mower
      mowerRef.current.velocity += GRAVITY;
      mowerRef.current.y += mowerRef.current.velocity;

      // Update pipes
      if (pipesRef.current.length === 0 || pipesRef.current[pipesRef.current.length - 1].x < canvas.width - PIPE_SPACING) {
        pipesRef.current.push({
          x: canvas.width,
          topHeight: Math.random() * (canvas.height - GAP_SIZE - 200) + 100,
        });
      }

      pipesRef.current.forEach((pipe) => {
        pipe.x -= PIPE_SPEED;
      });

      // Remove off-screen pipes
      pipesRef.current = pipesRef.current.filter((pipe) => pipe.x > -60);

      // Check collisions
      const mower = mowerRef.current;
      const mowerRect = {
        x: 50,
        y: mower.y,
        width: 50,  // Larger hitbox for mower
        height: 30,
      };

      pipesRef.current.forEach((pipe) => {
        const topPipeRect = {
          x: pipe.x,
          y: 0,
          width: 50,
          height: pipe.topHeight,
        };

        const bottomPipeRect = {
          x: pipe.x,
          y: pipe.topHeight + GAP_SIZE,
          width: 50,
          height: canvas.height - (pipe.topHeight + GAP_SIZE),
        };

        if (
          checkCollision(mowerRect, topPipeRect) ||
          checkCollision(mowerRect, bottomPipeRect) ||
          mower.y < 0 ||
          mower.y > canvas.height
        ) {
          setGameOver(true);
          setHighScore((prev) => Math.max(prev, score));
        }
      });

      // Update score
      pipesRef.current.forEach((pipe) => {
        if (pipe.x + PIPE_SPEED < 50 && pipe.x > 50 - PIPE_SPEED) {
          setScore((prev) => prev + 1);
        }
      });

      // Draw everything
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background (grass-like)
      ctx.fillStyle = '#228B22';  // Forest Green
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw handheld trimmer
      const trimmerX = 50;
      const trimmerY = mower.y;

      // Draw handle
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(trimmerX, trimmerY);
      ctx.lineTo(trimmerX + 40, trimmerY - 20);
      ctx.stroke();

      // Draw grip
      ctx.fillStyle = '#000000';
      ctx.fillRect(trimmerX + 35, trimmerY - 25, 10, 15);

      // Draw motor housing
      ctx.fillStyle = '#FF0000';  // Red
      ctx.beginPath();
      ctx.ellipse(trimmerX + 5, trimmerY + 5, 15, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw trimmer head
      ctx.fillStyle = '#DDDDDD';  // Light gray
      ctx.beginPath();
      ctx.arc(trimmerX, trimmerY + 5, 8, 0, Math.PI * 2);
      ctx.fill();

      // Draw spinning line effect
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      const now = Date.now();
      const rotation = (now / 100) % (Math.PI * 2);
      
      ctx.beginPath();
      ctx.moveTo(
        trimmerX + Math.cos(rotation) * 12,
        trimmerY + 5 + Math.sin(rotation) * 12
      );
      ctx.lineTo(
        trimmerX + Math.cos(rotation + Math.PI) * 12,
        trimmerY + 5 + Math.sin(rotation + Math.PI) * 12
      );
      ctx.stroke();

      // Draw grass patches with a more natural look
      ctx.fillStyle = '#006400';  // Dark green
      pipesRef.current.forEach((pipe) => {
        // Top grass
        drawGrassClump(ctx, pipe.x, 0, 50, pipe.topHeight);
        // Bottom grass
        drawGrassClump(
          ctx,
          pipe.x,
          pipe.topHeight + GAP_SIZE,
          50,
          canvas.height - (pipe.topHeight + GAP_SIZE)
        );
      });

      // Draw score
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '24px monospace';
      ctx.fillText(`Grass Cut: ${score}`, 10, 30);
      ctx.fillText(`Best: ${highScore}`, 10, 60);

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    // Remove keyboard controls and only use mouse
    canvas.addEventListener('click', jump);

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      canvas.removeEventListener('click', jump);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameStarted, gameOver, score, highScore]);

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <canvas
        ref={canvasRef}
        width={400}
        height={500}
        className="w-full bg-green-800 rounded-lg cursor-pointer"
        onClick={jump}
      />
      {!gameStarted && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center">
          <p className="text-xl mb-4">Click to start mowing!</p>
        </div>
      )}
      {gameOver && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center">
          <p className="text-xl mb-4">Game Over!</p>
          <button
            onClick={resetGame}
            className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700 transition-colors"
          >
            Mow Again
          </button>
        </div>
      )}
    </div>
  );
}

function checkCollision(rect1: any, rect2: any) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

function drawGrassClump(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const baseColor = '#006400';
  const highlightColor = '#008000';
  
  // Base grass patch
  ctx.fillStyle = baseColor;
  ctx.fillRect(x, y, width, height);
  
  // Add some grass blade details
  ctx.fillStyle = highlightColor;
  const bladeCount = Math.floor(width / 4);
  
  for (let i = 0; i < bladeCount; i++) {
    const bladeX = x + (i * 4);
    const bladeHeight = Math.random() * 15 + 5;
    const startY = y === 0 ? height - bladeHeight : y;
    
    ctx.beginPath();
    ctx.moveTo(bladeX, startY);
    ctx.lineTo(bladeX + 2, startY - bladeHeight);
    ctx.lineTo(bladeX + 4, startY);
    ctx.fill();
  }
} 