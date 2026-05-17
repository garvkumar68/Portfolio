import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export const MinimalistStarfield = () => {
  const containerRef = useRef(null);
  const location = useLocation();
  const pathname = location.pathname;

  const isHome =
    pathname === "/Portfolio" ||
    pathname === "/Portfolio/" ||
    pathname === "/" ||
    pathname.endsWith("/Portfolio") ||
    pathname.endsWith("/Portfolio/");

  useEffect(() => {
    if (isHome) return;

    const container = containerRef.current;
    if (!container) return;

    // Clear existing stars and blobs
    container.innerHTML = "";

    // 1. Generate very soft, huge blurry ambient cosmic light blobs
    const blobColors = [
      "rgba(138, 43, 226, 0.28)", // Purple
      "rgba(0, 191, 255, 0.25)",   // Blue
      "rgba(255, 105, 180, 0.25)",  // Pink
      "rgba(0, 223, 162, 0.22)"    // Green
    ];

    const blobCount = 5;
    for (let i = 0; i < blobCount; i++) {
      const blob = document.createElement("div");
      blob.className = "cosmic-blob";
      blob.style.background = `radial-gradient(circle, ${blobColors[i % blobColors.length]} 0%, rgba(0,0,0,0) 70%)`;
      const size = Math.random() * 400 + 400; // Huge size (400px to 800px)
      blob.style.width = `${size}px`;
      blob.style.height = `${size}px`;
      blob.style.left = `${Math.random() * 100}%`;
      blob.style.top = `${Math.random() * 100}%`;
      
      // Randomize animation delays and durations for non-synchronous drifting
      blob.style.animationDelay = `${Math.random() * -15}s`;
      blob.style.animationDuration = `${30 + Math.random() * 20}s`;
      
      container.appendChild(blob);
    }

    // 2. Generate minimalist stars exactly as requested
    const count = 100;
    for (let i = 0; i < count; i++) {
      const star = document.createElement("div");
      star.className = "star";
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`; // Spread stars vertically
      star.style.animationDelay = `${Math.random() * 5}s`;
      container.appendChild(star);
    }
  }, [isHome, pathname]);

  if (isHome) return null;

  return <div ref={containerRef} className="starfield-global"></div>;
};
