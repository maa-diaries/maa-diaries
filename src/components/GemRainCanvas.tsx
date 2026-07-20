import React, { useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';

interface GemParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  type: 'petal' | 'gold-leaf' | 'sparkle';
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  swaySpeed: number;
  swayOffset: number;
}

export const GemRainCanvas: React.FC = () => {
  const { triggerGemRain, setTriggerGemRain } = useStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!triggerGemRain) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: GemParticle[] = [];
    const maxParticles = 60; // Clean, not too cluttered

    // Set canvas dimensions
    const resizeCanvas = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Luxury palette: Soft rose gold, champagnes, whites
    const particleTypes = [
      { type: 'petal', color: 'rgba(255, 209, 220, 0.85)' },    // Soft rose pink
      { type: 'petal', color: 'rgba(255, 228, 225, 0.85)' },    // Misty rose
      { type: 'gold-leaf', color: 'rgba(212, 175, 55, 0.85)' },  // Classic Gold
      { type: 'gold-leaf', color: 'rgba(238, 203, 122, 0.85)' }, // Champagne Gold
      { type: 'sparkle', color: 'rgba(255, 255, 255, 0.95)' }   // Sparkling White
    ];

    // Create a particle
    const createParticle = (xPos?: number, yPos?: number): GemParticle => {
      const pConf = particleTypes[Math.floor(Math.random() * particleTypes.length)];
      return {
        x: xPos !== undefined ? xPos : Math.random() * canvas.width,
        y: yPos !== undefined ? yPos : -30 - Math.random() * 80,
        vx: (Math.random() - 0.5) * 2, // Gentler drift
        vy: 1.5 + Math.random() * 2.5,  // Slower, elegant fall
        size: 8 + Math.random() * 10,  // Delicate sizes
        color: pConf.color,
        type: pConf.type as GemParticle['type'],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.05,
        opacity: 0.9 + Math.random() * 0.1,
        swaySpeed: 0.02 + Math.random() * 0.03,
        swayOffset: Math.random() * Math.PI * 2
      };
    };

    // Initialize particles
    for (let i = 0; i < maxParticles; i++) {
      particles.push(createParticle());
    }

    const drawParticle = (p: GemParticle) => {
      if (!ctx) return;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;

      if (p.type === 'petal') {
        // Draw a beautiful soft flower petal
        const grad = ctx.createLinearGradient(-p.size, -p.size, p.size, p.size);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.4, p.color);
        grad.addColorStop(1, 'rgba(255, 182, 193, 0.6)');
        ctx.fillStyle = grad;

        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.bezierCurveTo(p.size * 0.8, -p.size * 0.8, p.size * 0.8, p.size * 0.5, 0, p.size);
        ctx.bezierCurveTo(-p.size * 0.8, p.size * 0.5, -p.size * 0.8, -p.size * 0.8, 0, -p.size);
        ctx.closePath();
        ctx.fill();

        // Highlight center vein
        ctx.beginPath();
        ctx.moveTo(0, -p.size * 0.6);
        ctx.quadraticCurveTo(p.size * 0.1, 0, 0, p.size * 0.8);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();

      } else if (p.type === 'gold-leaf') {
        // Draw a luxurious slender gold leaf
        const grad = ctx.createLinearGradient(-p.size, -p.size, p.size, p.size);
        grad.addColorStop(0, '#fff3cc');
        grad.addColorStop(0.5, p.color);
        grad.addColorStop(1, '#b38600');
        ctx.fillStyle = grad;

        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.quadraticCurveTo(p.size * 0.6, -p.size * 0.2, 0, p.size);
        ctx.quadraticCurveTo(-p.size * 0.6, -p.size * 0.2, 0, -p.size);
        ctx.closePath();
        ctx.fill();

        // Center spine
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.lineTo(0, p.size);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();

      } else {
        // Draw a clean, sparkling four-point star
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          ctx.lineTo(0, -p.size);
          ctx.lineTo(p.size * 0.25, -p.size * 0.25);
          ctx.rotate(Math.PI / 2);
        }
        ctx.closePath();
        ctx.fill();

        // Inner glowing core
        const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 0.4);
        glow.addColorStop(0, '#ffffff');
        glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    };

    let start = Date.now();
    const duration = 5000; // Run for 5 seconds

    const update = () => {
      const elapsed = Date.now() - start;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (elapsed > duration && particles.length === 0) {
        setTriggerGemRain(false);
        return;
      }

      particles.forEach((p, index) => {
        // Physics update with organic sway
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        
        // Sway sideways gently like wind
        const sway = Math.sin(elapsed * p.swaySpeed + p.swayOffset) * 0.8;
        p.x += p.vx + sway;

        // Slow fadeout towards the bottom or after duration
        if (p.y > canvas.height - 100 || elapsed > duration) {
          p.opacity -= 0.015;
        }

        // Draw particle
        if (p.opacity > 0) {
          drawParticle(p);
        }

        // Remove dead particles
        if (p.opacity <= 0 || p.y > canvas.height) {
          if (elapsed < duration) {
            // Respawn at top if the effect is still active
            particles[index] = createParticle();
          } else {
            // Otherwise, filter it out
            particles.splice(index, 1);
          }
        }
      });

      animationFrameId = requestAnimationFrame(update);
    };

    update();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [triggerGemRain, setTriggerGemRain]);

  if (!triggerGemRain) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 99999,
        background: 'transparent'
      }}
    />
  );
};
