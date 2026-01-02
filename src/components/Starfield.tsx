import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;
  pz: number;
}

const Starfield: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const numStars = 250;
    const speed = 0.15;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initStars = () => {
      starsRef.current = [];
      for (let i = 0; i < numStars; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.width - canvas.width / 2,
          y: Math.random() * canvas.height - canvas.height / 2,
          z: Math.random() * canvas.width,
          pz: 0,
        });
      }
    };

    const animate = () => {
      ctx.fillStyle = 'rgba(3, 0, 20, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      starsRef.current.forEach((star) => {
        star.pz = star.z;
        star.z -= speed;

        if (star.z <= 0) {
          star.x = Math.random() * canvas.width - centerX;
          star.y = Math.random() * canvas.height - centerY;
          star.z = canvas.width;
          star.pz = star.z;
        }

        const sx = (star.x / star.z) * canvas.width + centerX;
        const sy = (star.y / star.z) * canvas.height + centerY;
        const px = (star.x / star.pz) * canvas.width + centerX;
        const py = (star.y / star.pz) * canvas.height + centerY;

        if (sx < 0 || sx > canvas.width || sy < 0 || sy > canvas.height) {
          return;
        }

        const size = Math.max(0.5, (1 - star.z / canvas.width) * 2);
        const opacity = Math.min(1, (1 - star.z / canvas.width) * 1.5);

        // Draw star trail
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.3})`;
        ctx.lineWidth = size * 0.5;
        ctx.stroke();

        // Draw star point
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    initStars();
    animate();

    window.addEventListener('resize', () => {
      resizeCanvas();
      initStars();
    });

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ background: '#030014' }}
    />
  );
};

export default Starfield;
