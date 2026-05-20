import React, { useEffect, useRef } from "react";

export const HexagonBackground = ({ className = "" }) => {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let W = 0, H = 0;
    const HEX_SIZE = 40;
    const GAP = 3;

    let hexes = [];
    const litHexes = new Map();
    const FADE_DURATION = 1100;

    let prevX = null;
    let prevY = null;

    function buildGrid() {
      hexes = [];
      const w = Math.sqrt(3) * HEX_SIZE;
      const h = 2 * HEX_SIZE;
      const cols = Math.ceil(W / w) + 2;
      const rows = Math.ceil(H / (h * 0.75)) + 2;
      for (let row = -1; row < rows; row++) {
        for (let col = -1; col < cols; col++) {
          const cx = col * w + (row % 2 === 1 ? w / 2 : 0);
          const cy = row * h * 0.75;
          hexes.push({ cx, cy });
        }
      }
    }

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildGrid();
    }

    function hexPts(cx, cy, r) {
      const pts = [];
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
      }
      return pts;
    }

    function getHexAt(px, py) {
      let best = -1, bestD = Infinity;
      for (let i = 0; i < hexes.length; i++) {
        const d = Math.hypot(hexes[i].cx - px, hexes[i].cy - py);
        if (d < HEX_SIZE && d < bestD) { bestD = d; best = i; }
      }
      return best;
    }

    function collectLine(x0, y0, x1, y1) {
      const steps = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / (HEX_SIZE * 0.35));
      const n = Math.max(steps, 1);
      const seen = [];
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        const idx = getHexAt(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t);
        if (idx >= 0 && !seen.includes(idx)) seen.push(idx);
      }
      return seen;
    }

    function drawHex3D(cx, cy, r, glow) {
      const outer = hexPts(cx, cy, r);
      const inner = hexPts(cx, cy, r * 0.82);

      // base fill
      ctx.beginPath();
      outer.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
      ctx.closePath();
      const baseLum = 18 + glow * 38;
      ctx.fillStyle = `rgb(${baseLum},${baseLum},${baseLum})`;
      ctx.fill();

      // bevel side faces
      for (let i = 0; i < 6; i++) {
        const [ax, ay] = outer[i];
        const [bx, by] = outer[(i + 1) % 6];
        const [cx2, cy2] = inner[(i + 1) % 6];
        const [dx2, dy2] = inner[i];
        const midAngle = Math.atan2((ay + by) / 2 - cy, (ax + bx) / 2 - cx);
        const light = (Math.cos(midAngle - Math.PI * 1.3) + 1) / 2;
        const lum = glow > 0.01
          ? Math.round(30 + light * 60 + glow * 80)
          : Math.round(12 + light * 18);
        const alpha = 0.55 + light * 0.3 + glow * 0.15;
        ctx.beginPath();
        ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
        ctx.lineTo(cx2, cy2); ctx.lineTo(dx2, dy2);
        ctx.closePath();
        ctx.fillStyle = `rgba(${lum},${lum},${lum},${alpha})`;
        ctx.fill();
      }

      // inner top face with radial shine
      ctx.beginPath();
      inner.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
      ctx.closePath();
      if (glow > 0.01) {
        const grad = ctx.createRadialGradient(cx - r * 0.18, cy - r * 0.22, 0, cx, cy, r * 0.82);
        const hi = Math.round(60 + glow * 180);
        const mid = Math.round(25 + glow * 60);
        grad.addColorStop(0,   `rgba(${hi},${hi},${hi},${0.55 + glow * 0.45})`);
        grad.addColorStop(0.5, `rgba(${mid},${mid},${mid},${0.3 + glow * 0.35})`);
        grad.addColorStop(1,   `rgba(14,14,14,${0.6 + glow * 0.2})`);
        ctx.fillStyle = grad;
      } else {
        const grad = ctx.createRadialGradient(cx - r * 0.18, cy - r * 0.22, 0, cx, cy, r * 0.82);
        grad.addColorStop(0,   "rgba(38,38,38,0.9)");
        grad.addColorStop(0.6, "rgba(22,22,22,0.95)");
        grad.addColorStop(1,   "rgba(12,12,12,1)");
        ctx.fillStyle = grad;
      }
      ctx.fill();

      // specular highlight
      if (glow > 0.05) {
        ctx.beginPath();
        inner.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
        ctx.closePath();
        const spec = ctx.createRadialGradient(
          cx - r * 0.28, cy - r * 0.3, 0,
          cx - r * 0.1,  cy - r * 0.1, r * 0.55
        );
        spec.addColorStop(0,   `rgba(255,255,255,${glow * 0.28})`);
        spec.addColorStop(0.5, `rgba(255,255,255,${glow * 0.06})`);
        spec.addColorStop(1,   "rgba(255,255,255,0)");
        ctx.fillStyle = spec;
        ctx.fill();
      }

      // outer border
      ctx.beginPath();
      outer.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
      ctx.closePath();
      ctx.strokeStyle = glow > 0.05
        ? `rgba(${Math.round(80 + glow * 120)},${Math.round(80 + glow * 120)},${Math.round(80 + glow * 120)},${0.4 + glow * 0.5})`
        : "rgba(255,255,255,0.07)";
      ctx.lineWidth = glow > 0.05 ? 0.8 + glow : 0.6;
      ctx.stroke();
    }

    function draw() {
      ctx.fillStyle = "#0d0d0d";
      ctx.fillRect(0, 0, W, H);
      const now = Date.now();

      for (const [idx, info] of litHexes) {
        if (now - info.litAt > FADE_DURATION) litHexes.delete(idx);
      }

      hexes.forEach((hex, i) => {
        let glow = 0;
        if (litHexes.has(i)) {
          const age = (now - litHexes.get(i).litAt) / FADE_DURATION;
          const t = Math.max(0, 1 - age);
          glow = t * t * t;
        }
        drawHex3D(hex.cx, hex.cy, HEX_SIZE - GAP, glow);
      });

      animFrameRef.current = requestAnimationFrame(draw);
    }

    function onMove(px, py) {
      const now = Date.now();
      const pts = prevX !== null
        ? collectLine(prevX, prevY, px, py)
        : [getHexAt(px, py)];
      for (const idx of pts) {
        if (idx >= 0) litHexes.set(idx, { litAt: now });
      }
      prevX = px;
      prevY = py;
    }

    function getCanvasPos(clientX, clientY) {
      const rect = canvas.getBoundingClientRect();
      return [clientX - rect.left, clientY - rect.top];
    }

    const onMouseMove = (e) => {
      const [x, y] = getCanvasPos(e.clientX, e.clientY);
      onMove(x, y);
    };
    const onMouseLeave = () => { prevX = null; prevY = null; };

    const onTouchMove = (e) => {
      e.preventDefault();
      const [x, y] = getCanvasPos(e.touches[0].clientX, e.touches[0].clientY);
      onMove(x, y);
    };
    const onTouchEnd = () => { prevX = null; prevY = null; };

    window.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd);

    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);
    resize();
    draw();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
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