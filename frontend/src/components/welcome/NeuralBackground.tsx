import { useEffect, useRef, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  pulsePhase: number;
}

interface NeuralBackgroundProps {
  particleCount?: number;
  connectionDistance?: number;
  className?: string;
}

export function NeuralBackground({ 
  particleCount = 80, 
  connectionDistance = 150,
  className = "" 
}: NeuralBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0 });

  const initParticles = useCallback((width: number, height: number) => {
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.3,
        pulsePhase: Math.random() * Math.PI * 2
      });
    }
    return particles;
  }, [particleCount]);

  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    ctx.clearRect(0, 0, width, height);

    const particles = particlesRef.current;

    // Update and draw particles
    particles.forEach((p, i) => {
      // Update position
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      // Mouse interaction - subtle attraction
      const dx = mouseRef.current.x - p.x;
      const dy = mouseRef.current.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 200 && dist > 0) {
        p.vx += (dx / dist) * 0.02;
        p.vy += (dy / dist) * 0.02;
      }

      // Damping
      p.vx *= 0.99;
      p.vy *= 0.99;

      // Pulsing opacity
      const pulse = Math.sin(time * 0.002 + p.pulsePhase) * 0.2 + 0.8;
      const currentOpacity = p.opacity * pulse;

      // Draw particle with glow
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3);
      gradient.addColorStop(0, `hsla(174, 100%, 50%, ${currentOpacity})`);
      gradient.addColorStop(0.5, `hsla(174, 100%, 50%, ${currentOpacity * 0.5})`);
      gradient.addColorStop(1, "transparent");

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Core particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(174, 100%, 70%, ${currentOpacity})`;
      ctx.fill();

      // Draw connections
      for (let j = i + 1; j < particles.length; j++) {
        const other = particles[j];
        const connDx = other.x - p.x;
        const connDy = other.y - p.y;
        const connDist = Math.sqrt(connDx * connDx + connDy * connDy);

        if (connDist < connectionDistance) {
          const opacity = (1 - connDist / connectionDistance) * 0.3;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(other.x, other.y);
          ctx.strokeStyle = `hsla(174, 100%, 50%, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    });
  }, [connectionDistance]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particlesRef.current = initParticles(canvas.width, canvas.height);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    let startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = time - startTime;
      draw(ctx, canvas.width, canvas.height, elapsed);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [initParticles, draw]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ background: "transparent" }}
    />
  );
}
