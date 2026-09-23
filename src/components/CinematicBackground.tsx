'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  z: number;
  baseRadius: number;
  color: string;
  vx: number;
  vy: number;
  vz: number;
  alpha: number;
  pulseSpeed: number;
  pulseOffset: number;
}

export default function CinematicBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates with smooth damping
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Palette of rich 3D cinematic tones: Electric Emerald, Neon Mint, Cosmic Violet, Cyber Cyan
    const colors = [
      'rgba(16, 185, 129, ',  // Emerald
      'rgba(200, 255, 85, ',  // Mint
      'rgba(139, 92, 246, ',  // Violet
      'rgba(6, 182, 212, ',   // Cyan
      'rgba(255, 255, 255, ', // White star
    ];

    // Initialize 3D particles
    const particleCount = Math.min(85, Math.floor((width * height) / 16000));
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width * 1.5,
        y: (Math.random() - 0.5) * height * 1.5,
        z: Math.random() * 800 + 100,
        baseRadius: Math.random() * 2.2 + 0.8,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.6,
        alpha: Math.random() * 0.6 + 0.25,
        pulseSpeed: Math.random() * 0.02 + 0.008,
        pulseOffset: Math.random() * Math.PI * 2,
      });
    }

    const fov = 350; // Field of view for 3D perspective projection
    let time = 0;

    const render = () => {
      time += 0.015;

      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      const mouseOffset3DX = (mouse.x - width / 2) * 0.15;
      const mouseOffset3DY = (mouse.y - height / 2) * 0.15;

      ctx.clearRect(0, 0, width, height);

      // Render connecting constellation lines between nearby 3D points
      const projectedList: { px: number; py: number; scale: number; alpha: number; color: string }[] = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Particle physics
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        // Wrap around 3D boundaries
        if (p.z <= 20) p.z = 900;
        if (p.z > 900) p.z = 21;
        if (p.x < -width) p.x = width;
        if (p.x > width) p.x = -width;
        if (p.y < -height) p.y = height;
        if (p.y > height) p.y = -height;

        // 3D Perspective Projection
        const scale = fov / (fov + p.z);
        const px = (p.x - mouseOffset3DX) * scale + width / 2;
        const py = (p.y - mouseOffset3DY) * scale + height / 2;

        const pulse = Math.sin(time * p.pulseSpeed * 60 + p.pulseOffset) * 0.3 + 0.7;
        const currentAlpha = p.alpha * scale * pulse;

        projectedList.push({ px, py, scale, alpha: currentAlpha, color: p.color });

        // Draw particle with luminous glow
        const radius = Math.max(0.6, p.baseRadius * scale * 1.8);
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${Math.min(1, currentAlpha * 1.2)})`;
        ctx.shadowColor = `${p.color}0.8)`;
        ctx.shadowBlur = radius * 4;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }

      // Draw subtle connection links between close points
      const maxDistance = 110;
      for (let i = 0; i < projectedList.length; i++) {
        for (let j = i + 1; j < projectedList.length; j++) {
          const p1 = projectedList[i];
          const p2 = projectedList[j];

          const dx = p1.px - p2.px;
          const dy = p1.py - p2.py;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const lineAlpha = (1 - dist / maxDistance) * 0.16 * p1.alpha * p2.alpha;
            ctx.beginPath();
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            ctx.strokeStyle = `rgba(16, 185, 129, ${lineAlpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="cinematic-bg-container" aria-hidden="true">
      {/* Dynamic 3D Interactive Particle Canvas */}
      <canvas ref={canvasRef} className="cinematic-canvas" />

      {/* Atmospheric Luminous 3D Aurora Glow Spheres */}
      <div className="cinematic-aurora cinematic-aurora--emerald" />
      <div className="cinematic-aurora cinematic-aurora--violet" />
      <div className="cinematic-aurora cinematic-aurora--cyan" />
      <div className="cinematic-aurora cinematic-aurora--amber" />

      {/* 3D Perspective Digital Cyber Grid Floor */}
      <div className="cinematic-3d-perspective-grid" />

      {/* Cinematic Vignette Overlay to enhance contrast and focus */}
      <div className="cinematic-vignette" />
    </div>
  );
}
