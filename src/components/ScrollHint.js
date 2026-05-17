import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './ScrollHint.css';

const routesOrder = [
  '/',
  '/skills',
  '/projects',
  '/experience',
  '/certifications',
  '/achievements',
  '/reachout'
];

export const ScrollHint = () => {
  const location = useLocation();
  // pullDir: null | 'up' | 'down'
  // pullAmount: 0-100 (how far user has pulled, drives the animation)
  const [pullDir, setPullDir] = useState(null);
  const [pullAmount, setPullAmount] = useState(0);

  const isMobile = () => window.innerWidth <= 768;

  useEffect(() => {
    if (!isMobile()) return;

    let touchStartY = 0;
    let active = false;

    const currentIndex = routesOrder.indexOf(location.pathname);
    const canGoDown = currentIndex < routesOrder.length - 1;
    const canGoUp = currentIndex > 0;

    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
      active = true;
    };

    const handleTouchMove = (e) => {
      if (!active) return;
      const dy = touchStartY - e.touches[0].clientY; // positive = swiping up (going next)
      const isAtTop = window.scrollY <= 2;
      const isAtBottom = Math.abs((window.innerHeight + window.scrollY) - document.documentElement.scrollHeight) <= 2;

      if (dy > 10 && isAtBottom && canGoDown) {
        // User pulling up at the bottom -> going to next page
        const pct = Math.min(dy / 80, 1) * 100;
        setPullDir('down'); // arrow points down (dragging page up)
        setPullAmount(pct);
      } else if (dy < -10 && isAtTop && canGoUp) {
        // User pulling down at top -> going to previous page
        const pct = Math.min(Math.abs(dy) / 80, 1) * 100;
        setPullDir('up'); // arrow points up (dragging page down)
        setPullAmount(pct);
      } else {
        setPullDir(null);
        setPullAmount(0);
      }
    };

    const handleTouchEnd = () => {
      active = false;
      setPullDir(null);
      setPullAmount(0);
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [location.pathname]);

  if (!pullDir) return null;

  return (
    <div className={`pull-hint pull-hint-${pullDir}`} style={{ '--pull': `${pullAmount}%` }}>
      <div className="pull-hint-arrow-wrap">
        <svg className="pull-hint-arrow-svg" viewBox="0 0 24 24" fill="none">
          {pullDir === 'down' ? (
            // Arrow pointing down (next page)
            <polyline points="6 9 12 15 18 9" stroke="#00dfa2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          ) : (
            // Arrow pointing up (prev page)
            <polyline points="6 15 12 9 18 15" stroke="#00dfa2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          )}
        </svg>
      </div>
    </div>
  );
};
