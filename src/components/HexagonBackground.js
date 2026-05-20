import React, { useEffect, useRef } from "react";

export const HexagonBackground = ({ className = "" }) => {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width, height;
    const hexSize = 32;
    const gap = 3;
    const hexH = Math.sqrt(3) * hexSize;
    const hexW = 2 * hexSize;
    const colW = hexW * 0.75 + gap;
    const rowH = hexH + gap;

    const hexagons = [];
    let time = 0;
    let mouseX = -1000;
    let mouseY = -1000;

    // Random glow state
    let glowTargets = [];
    let glowTimer = 0;
    const GLOW_INTERVAL = 80; // frames between re-picks

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    window.addEventListener("mousemove", handleMouseMove);

    function resize() {
      width = canvas.width = canvas.offsetWidth * devicePixelRatio;
      height = canvas.height = canvas.offsetHeight * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
      buildGrid();
    }

    function buildGrid() {
      hexagons.length = 0;
      const cols = Math.ceil((width / devicePixelRatio) / colW) + 2;
      const rows = Math.ceil((height / devicePixelRatio) / rowH) + 2;
      for (let col = -1; col < cols; col++) {
        for (let row = -1; row < rows; row++) {
          const x = col * colW;
          const y = row * rowH + (col % 2 === 0 ? 0 : rowH / 2);
          hexagons.push({
            x,
            y,
            phase: Math.random() * Math.PI * 2,
            speed: 0.3 + Math.random() * 0.5,
            glowIntensity: 0,
            glowTarget: 0,
          });
        }
      }
      pickGlowTargets();
    }

    function pickGlowTargets() {
      // Fade out previous targets
      glowTargets.forEach((i) => {
        if (hexagons[i]) hexagons[i].glowTarget = 0;
      });

      // Pick ~4% of hexagons to glow
      const count = Math.max(4, Math.floor(hexagons.length * 0.04));
      glowTargets = [];
      for (let i = 0; i < count; i++) {
        const idx = Math.floor(Math.random() * hexagons.length);
        glowTargets.push(idx);
        hexagons[idx].glowTarget = 0.7 + Math.random() * 0.3;
      }
    }

    function hexPath(cx, cy, r) {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 180) * (60 * i - 30);
        const px = cx + r * Math.cos(angle);
        const py = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    }

    function draw() {
      const W = width / devicePixelRatio;
      const H = height / devicePixelRatio;
      ctx.clearRect(0, 0, W, H);

      // Dark background so glows are visible
      ctx.fillStyle = "rgba(30, 18, 10, 1)";
      ctx.fillRect(0, 0, W, H);

      // Cycle random glows
      glowTimer++;
      if (glowTimer >= GLOW_INTERVAL) {
        glowTimer = 0;
        pickGlowTargets();
      }

      for (const hex of hexagons) {
        // Smooth lerp toward glow target
        hex.glowIntensity += (hex.glowTarget - hex.glowIntensity) * 0.04;

        // Mouse hover
        const dx = hex.x - mouseX;
        const dy = hex.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 130;
        const hoverFactor = Math.max(0, 1 - dist / maxDist);

        const pulse = Math.sin(time * hex.speed + hex.phase);
        let brightness = 0.04 + ((pulse + 1) / 2) * 0.1;
        brightness += hoverFactor * 0.45;
        const glowBoost = hex.glowIntensity;
        brightness += glowBoost;

        const isGlowing = glowBoost > 0.05 || hoverFactor > 0.1;

        hexPath(hex.x, hex.y, hexSize - gap / 2);

        if (isGlowing) {
          // Coffee brown accent — was beige, now swapped
          ctx.fillStyle = `rgba(111, 78, 55, ${Math.min(1, brightness * 0.85)})`;
          ctx.fill();
          ctx.strokeStyle = `rgba(180, 120, 70, ${0.3 + glowBoost * 0.9})`;
          ctx.lineWidth = 1.5 + glowBoost * 2;
          ctx.stroke();

          // Extra glow halo for strongly lit hexes
          if (glowBoost > 0.2) {
            ctx.shadowColor = "rgba(160, 100, 50, 0.8)";
            ctx.shadowBlur = 12 + glowBoost * 18;
            hexPath(hex.x, hex.y, hexSize - gap / 2);
            ctx.strokeStyle = `rgba(200, 140, 80, ${glowBoost * 0.6})`;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.shadowColor = "transparent";
          }
        } else {
          // Beige base — was coffee, now swapped
          ctx.fillStyle = `rgba(212, 185, 150, ${brightness * 0.55})`;
          ctx.fill();
          ctx.strokeStyle = `rgba(212, 185, 150, ${0.08 + brightness * 0.4})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      time += 0.018;
      animFrameRef.current = requestAnimationFrame(draw);
    }

    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);

    resize();
    draw();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      ro.disconnect();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`hexagon-bg-canvas ${className}`}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
};