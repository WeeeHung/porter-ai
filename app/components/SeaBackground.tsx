'use client';

import { useEffect, useRef } from 'react';

export function SeaBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Determine if it's day or night based on local time
    const isDaytime = () => {
      const hour = new Date().getHours();
      return hour >= 6 && hour < 18; // Day is 6 AM to 6 PM
    };

    // Generate random stars for night sky
    const generateStars = (count: number) => {
      const stars: Array<{ x: number; y: number; size: number; twinklePhase: number }> = [];
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * (canvas.height / 2), // Only in top half
          size: Math.random() * 2 + 0.5,
          twinklePhase: Math.random() * Math.PI * 2,
        });
      }
      return stars;
    };

    const stars = generateStars(150);

    // Animation variables
    let animationId: number;
    let time = 0;

    // Sea colors
    const seaColors = [
      '#0f4c75', // Deep blue
      '#3282b8', // Medium blue
      '#0f4c75', // Deep blue
      '#1e3a8a', // Darker blue
    ];

    // Wave parameters
    const waves: Array<{
      amplitude: number;
      frequency: number;
      phase: number;
      speed: number;
      color: string;
    }> = [
      { amplitude: 20, frequency: 0.01, phase: 0, speed: 0.5, color: seaColors[0] },
      { amplitude: 15, frequency: 0.015, phase: Math.PI / 3, speed: 0.3, color: seaColors[1] },
      { amplitude: 25, frequency: 0.008, phase: Math.PI / 2, speed: 0.7, color: seaColors[2] },
    ];

    // Ships - Bigger and more prominent
    const ships: Array<{
      x: number;
      y: number;
      size: number;
      speed: number;
      type: 'container' | 'cargo';
      direction: 'left' | 'right';
    }> = [
      // Ships starting from far left (moving right →)
      { x: -150, y: 0.625, size: 120, speed: 0.15, type: 'container', direction: 'right' },
      { x: -600, y: 0.725, size: 140, speed: 0.18, type: 'container', direction: 'right' },
      { x: -900, y: 0.85, size: 110, speed: 0.13, type: 'cargo', direction: 'right' },
      
      // Ships starting from far right (moving left ←)
      { x: canvas.width + 400, y: 0.675, size: 100, speed: 0.12, type: 'cargo', direction: 'left' },
      { x: canvas.width + 700, y: 0.775, size: 130, speed: 0.16, type: 'container', direction: 'left' },
      { x: canvas.width + 1000, y: 0.875, size: 115, speed: 0.14, type: 'cargo', direction: 'left' },
    ];

    const animate = () => {
      time += 0.016; // ~60fps

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const horizonY = canvas.height / 2;
      const isDay = isDaytime();

      // Draw sky (top half)
      if (isDay) {
        // Daytime sky - light blue gradient
        const skyGradient = ctx.createLinearGradient(0, 0, 0, horizonY);
        skyGradient.addColorStop(0, '#87CEEB'); // Sky blue
        skyGradient.addColorStop(1, '#B0E0E6'); // Powder blue
        ctx.fillStyle = skyGradient;
      } else {
        // Nighttime sky - dark gradient
        const skyGradient = ctx.createLinearGradient(0, 0, 0, horizonY);
        skyGradient.addColorStop(0, '#0a0e27'); // Very dark blue
        skyGradient.addColorStop(1, '#1a1f3a'); // Dark blue
        ctx.fillStyle = skyGradient;
      }
      ctx.fillRect(0, 0, canvas.width, horizonY);

      // Draw stars if nighttime
      if (!isDay) {
        stars.forEach((star) => {
          const twinkle = Math.sin(time * 2 + star.twinklePhase) * 0.5 + 0.5;
          ctx.globalAlpha = twinkle * 0.8 + 0.2;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;
      }

      // Draw sea (bottom half) - gradient
      const seaGradient = ctx.createLinearGradient(0, horizonY, 0, canvas.height);
      seaGradient.addColorStop(0, '#1e3a8a');
      seaGradient.addColorStop(0.5, '#3282b8');
      seaGradient.addColorStop(1, '#0f4c75');
      ctx.fillStyle = seaGradient;
      ctx.fillRect(0, horizonY, canvas.width, canvas.height - horizonY);

      // Draw waves (adjusted to bottom half)
      waves.forEach((wave, index) => {
        ctx.beginPath();
        ctx.strokeStyle = wave.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6 - index * 0.1;

        for (let x = 0; x <= canvas.width; x += 2) {
          const y = horizonY + (canvas.height - horizonY) * 0.4 + 
            Math.sin(x * wave.frequency + time * wave.speed + wave.phase) * wave.amplitude;
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });

      ctx.globalAlpha = 1;

      // Draw ships
      ships.forEach((ship) => {
        let shipX;
        if (ship.direction === 'right') {
          // Moving left to right
          shipX = (ship.x + time * ship.speed * 50) % (canvas.width + 200);
        } else {
          // Moving right to left - start from far right and move left
          const traveled = time * ship.speed * 50;
          shipX = (ship.x - traveled) % (canvas.width + 200);
          // Keep wrapping around
          if (shipX < -200) {
            shipX = canvas.width + 200 + (shipX % (canvas.width + 200));
          }
        }
        
        const shipY = canvas.height * ship.y;

        ctx.save();
        ctx.translate(shipX, shipY);
        
        // Flip ship horizontally if going left
        if (ship.direction === 'left') {
          ctx.scale(-1, 1);
          ctx.translate(-120, 0);
        }
        
        ctx.scale(ship.size / 100, ship.size / 100);

        // Ship hull - Bigger
        ctx.fillStyle = '#2c3e50';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(120, 0);
        ctx.lineTo(110, 25);
        ctx.lineTo(10, 25);
        ctx.closePath();
        ctx.fill();

        // Ship deck - Bigger
        ctx.fillStyle = '#34495e';
        ctx.fillRect(5, -8, 110, 15);

        if (ship.type === 'container') {
          // Container stacks - Bigger and more detailed
          ctx.fillStyle = '#e74c3c';
          ctx.fillRect(15, -25, 20, 15);
          ctx.fillRect(40, -25, 20, 15);
          ctx.fillRect(65, -25, 20, 15);
          ctx.fillRect(90, -25, 20, 15);
          
          ctx.fillStyle = '#3498db';
          ctx.fillRect(15, -40, 20, 15);
          ctx.fillRect(40, -40, 20, 15);
          ctx.fillRect(65, -40, 20, 15);
          ctx.fillRect(90, -40, 20, 15);
          
          ctx.fillStyle = '#f39c12';
          ctx.fillRect(15, -55, 20, 15);
          ctx.fillRect(40, -55, 20, 15);
          ctx.fillRect(65, -55, 20, 15);
          ctx.fillRect(90, -55, 20, 15);
        } else {
          // Cargo ship crane - Bigger
          ctx.strokeStyle = '#7f8c8d';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(60, -8);
          ctx.lineTo(60, -35);
          ctx.lineTo(80, -35);
          ctx.stroke();
          
          // Crane hook
          ctx.beginPath();
          ctx.moveTo(80, -35);
          ctx.lineTo(90, -25);
          ctx.stroke();
        }

        ctx.restore();
      });

      // No floating containers - focus on ships only

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
      }}
    />
  );
}
