import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useMediaQuery } from "react-responsive";

/* ─── Inline Styles ─── */
const css = `
  .skills-section {
    position: relative;
    padding: 60px 0 80px;
    overflow: hidden;
  }

  /* Radial background glow matching theme */
  .skills-section::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at center, rgba(0, 223, 162, 0.06) 0%, transparent 70%);
    pointer-events: none;
  }

  .skills-header {
    text-align: left;
    padding: 0 24px;
    margin-bottom: 48px;
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
  }

  .skills-title {
    font-size: 42px;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: -0.5px;
    margin-bottom: 8px;
    font-family: 'Outfit', 'Inter', sans-serif;
  }

  .skills-subtitle {
    font-size: 14px;
    color: rgba(255,255,255,0.45);
    font-family: 'Outfit', 'Inter', monospace;
    letter-spacing: 0.3px;
  }

  /* ─── 3D Stage ─── */
  .skills-stage {
    position: relative;
    width: 100%;
    max-width: 1100px;
    margin: 0 auto;
    height: 500px;
    perspective: 1600px;
  }

  /* ─── Header row ─── */
  .skills-header {
    text-align: left;
    padding: 0 24px;
    margin-bottom: 48px;
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .skills-header-left {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  /* ─── Auto-scroll toggle button ─── */
  .skills-auto-btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: transparent;
    border: 1px solid rgba(0, 223, 162, 0.3);
    border-radius: 99px;
    padding: 6px 14px 6px 10px;
    font-family: 'Outfit', monospace;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: rgba(255,255,255,0.6);
    cursor: pointer;
    transition: border-color 0.25s, color 0.25s, background 0.25s;
    white-space: nowrap;
    margin-bottom: 2px;
  }

  .skills-auto-btn.on {
    border-color: rgba(0, 223, 162, 0.6);
    color: #00dfa2;
    background: rgba(0, 223, 162, 0.06);
  }

  .skills-auto-btn:hover {
    border-color: rgba(0, 223, 162, 0.7);
    color: #00dfa2;
    background: rgba(0, 223, 162, 0.08);
  }

  .skills-auto-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: rgba(255,255,255,0.25);
    flex-shrink: 0;
    transition: background 0.25s;
  }

  .skills-auto-btn.on .skills-auto-dot {
    background: #00dfa2;
    box-shadow: 0 0 6px rgba(0, 223, 162, 0.8);
    animation: autoPlayPulse 1.4s ease-in-out infinite;
  }

  @keyframes autoPlayPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  .skills-track {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
  }

  /* ─── Skill Card ─── */
  .skill-card-3d {
    position: absolute;
    inset-inline: 0;
    margin: 0 auto;
    width: 90%;
    max-width: 440px;
    height: 460px;
    cursor: pointer;
    transition: transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                opacity 0.7s ease;
    border-radius: 20px;
  }

  .skill-card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 20px;
    background: rgba(13, 20, 18, 0.92);
    border: 1px solid rgba(0, 223, 162, 0.18);
    padding: 28px 26px 30px; /* extra bottom padding leaves room for timer bar */
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    box-shadow: 0 20px 60px -20px rgba(0, 0, 0, 0.7),
                0 0 0 1px rgba(255,255,255,0.04) inset;
    display: flex;
    flex-direction: column;
    gap: 20px;
    overflow: hidden;
  }

  .skill-card-header {
    display: flex;
    align-items: baseline;
    gap: 10px;
    margin-bottom: 4px;
  }

  .skill-card-index {
    font-family: 'Outfit', monospace;
    font-size: 11px;
    color: #00dfa2;
    font-weight: 600;
    letter-spacing: 1px;
  }

  .skill-card-title {
    font-family: 'Outfit', monospace;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: rgba(255,255,255,0.85);
    font-weight: 600;
    line-height: 1.4;
  }

  .skill-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
    flex: 1;
  }

  .skill-item-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;
  }

  .skill-item-name {
    font-family: 'Outfit', monospace;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgba(255,255,255,0.55);
  }

  .skill-item-pct {
    font-family: 'Outfit', monospace;
    font-size: 10px;
    color: #00dfa2;
    font-weight: 600;
  }

  /* Smooth progress bar */
  .skill-bar-track {
    width: 100%;
    height: 5px;
    background: rgba(255,255,255,0.07);
    border-radius: 99px;
    overflow: hidden;
  }

  .skill-bar-fill {
    height: 100%;
    width: 0%;
    border-radius: 99px;
    background: linear-gradient(90deg, #00dfa2, #00ffcc);
    box-shadow: 0 0 10px rgba(0, 223, 162, 0.5);
    /* transition is set via JS (rAF) for reliable mount animation */
  }

  /* ─── Navigation ─── */
  .skills-nav {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-top: 10px;
  }

  .skills-nav-btn {
    background: rgba(13, 20, 18, 0.85);
    border: 1px solid rgba(0, 223, 162, 0.25);
    color: rgba(255,255,255,0.8);
    padding: 7px 18px;
    border-radius: 99px;
    font-family: 'Outfit', monospace;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    cursor: pointer;
    transition: border-color 0.25s ease, color 0.25s ease, background 0.25s ease;
  }

  .skills-nav-btn:hover {
    border-color: rgba(0, 223, 162, 0.7);
    color: #00dfa2;
    background: rgba(0, 223, 162, 0.08);
  }

  .skills-nav-dots {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .skills-nav-dot {
    height: 6px;
    border-radius: 99px;
    cursor: pointer;
    border: none;
    padding: 0;
    transition: width 0.5s ease, background 0.4s ease;
  }

  .skills-nav-dot.active {
    width: 30px;
    background: #00dfa2;
    box-shadow: 0 0 8px rgba(0, 223, 162, 0.5);
  }

  .skills-nav-dot.inactive {
    width: 6px;
    background: rgba(255,255,255,0.15);
  }

  /* ─── Auto-advance timer bar (inside card footer) ─── */
  .skills-timer-track {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 0 0 20px 20px;
    z-index: 10;
  }

  .skills-timer-fill {
    height: 100%;
    width: 0%;
    background: #00dfa2;
    box-shadow: 0 0 8px rgba(0, 223, 162, 0.7);
    border-radius: 0 0 20px 20px;
    /* width animated via JS requestAnimationFrame */
  }

  /* ─── Mobile flat layout ─── */
  .skills-mobile-wrapper {
    padding: 0 16px;
    max-width: 480px;
    margin: 0 auto;
  }

  .skill-card-mobile {
    background: rgba(13, 20, 18, 0.92);
    border: 1px solid rgba(0, 223, 162, 0.2);
    border-radius: 16px;
    padding: 22px 18px;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
    min-height: 380px;
    transition: opacity 0.4s ease;
  }

  .skills-mobile-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 10px;
    gap: 12px;
  }

  .skills-mobile-nav .skills-nav-btn {
    flex: 1;
    text-align: center;
  }

  @media (max-width: 768px) {
    .skills-title {
      font-size: 30px;
    }
    .skills-subtitle {
      font-size: 13px;
    }
  }
`;

/* ─── ProgressBar — ref+rAF so transition always fires from 0% ─── */
function ProgressBar({ level, animate }) {
  const fillRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!fillRef.current) return;
    cancelAnimationFrame(rafRef.current);

    if (!animate) {
      // instantly reset to 0 with no transition
      fillRef.current.style.transition = 'none';
      fillRef.current.style.width = '0%';
      return;
    }
    // Reset to 0% (no transition), then in next frame animate to level%
    fillRef.current.style.transition = 'none';
    fillRef.current.style.width = '0%';
    
    // Force a synchronous reflow so the browser registers the 0% width
    void fillRef.current.offsetHeight;

    rafRef.current = requestAnimationFrame(() => {
      if (fillRef.current) {
        fillRef.current.style.transition = 'width 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        fillRef.current.style.width = `${level}%`;
      }
    });
  }, [animate, level]);

  return (
    <div className="skill-bar-track">
      <div ref={fillRef} className="skill-bar-fill" />
    </div>
  );
}

/* ─── TimerBar — ref+rAF so fill always restarts from 0% on key change ─── */
function TimerBar({ timerKey }) {
  const fillRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!fillRef.current) return;
    cancelAnimationFrame(rafRef.current);
    // Snap to 0%, then animate to 100% over 4.5s
    fillRef.current.style.transition = 'none';
    fillRef.current.style.width = '0%';
    
    // Force a synchronous reflow so the browser registers the 0% width
    void fillRef.current.offsetHeight;

    rafRef.current = requestAnimationFrame(() => {
      if (fillRef.current) {
        fillRef.current.style.transition = 'width 4.5s linear';
        fillRef.current.style.width = '100%';
      }
    });
    return () => cancelAnimationFrame(rafRef.current);
  }, [timerKey]);

  return (
    <div className="skills-timer-track">
      <div ref={fillRef} className="skills-timer-fill" />
    </div>
  );
}

/* ─── SkillCard ─── */
function SkillCard({ category, index, activated, timerKey, showTimer }) {
  const formatIndex = (i) => String(i + 1).padStart(2, "0");
  const formatTitle = (t) => t.toUpperCase().replace(/&/g, "AND");

  return (
    <div className="skill-card-inner">
      <div className="skill-card-header">
        <span className="skill-card-index">{formatIndex(index)}</span>
        <h3 className="skill-card-title">{formatTitle(category.title)}</h3>
      </div>
      <div className="skill-list">
        {category.skills.map((s) => (
          <div key={s.name}>
            <div className="skill-item-row">
              <span className="skill-item-name">{s.name.toUpperCase()}</span>
              <span className="skill-item-pct">{s.progress}%</span>
            </div>
            <ProgressBar level={s.progress} animate={activated} />
          </div>
        ))}
      </div>
      {/* Timer bar — only when active card AND autoPlay is on */}
      {activated && showTimer && <TimerBar timerKey={timerKey} />}
    </div>
  );
}

/* ─── Main Component ─── */
export const Skills = () => {
  const [categories, setCategories] = useState([]);
  const [active, setActive] = useState(0);
  const [timerKey, setTimerKey] = useState(0);
  const [inView, setInView] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const sectionRef = useRef(null);
  const intervalRef = useRef(null);
  const categoriesLenRef = useRef(0);
  const inViewRef = useRef(false);
  const autoPlayRef = useRef(true);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  /* Fetch skills data */
  useEffect(() => {
    axios
      .get("https://raw.githubusercontent.com/garvkumar68/Portfolio/json-data/skillsData.json")
      .then((res) => {
        if (res.data.categories) setCategories(res.data.categories);
        else if (res.data.skills) setCategories([{ title: "Technical Expertise", skills: res.data.skills }]);
      })
      .catch((err) => console.error("Error fetching skills:", err));
  }, []);

  /* IntersectionObserver for animation trigger */
  useEffect(() => {
    if (!sectionRef.current) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.2 });
    io.observe(sectionRef.current);
    return () => io.disconnect();
  }, []);

  /* Keep refs in sync so callbacks always have fresh values */
  useEffect(() => { categoriesLenRef.current = categories.length; }, [categories.length]);
  useEffect(() => { inViewRef.current = inView; }, [inView]);
  useEffect(() => { autoPlayRef.current = autoPlay; }, [autoPlay]);

  /* Start/restart the auto-advance interval */
  const startAutoAdvance = () => {
    clearInterval(intervalRef.current);
    if (!autoPlayRef.current) return; // respect toggle
    intervalRef.current = setInterval(() => {
      setActive((i) => (i + 1) % categoriesLenRef.current);
      setTimerKey((k) => k + 1);
    }, 4500);
  };

  /* Begin auto-advance once in view and data is loaded */
  useEffect(() => {
    if (!inView || categories.length === 0) return;
    if (autoPlay) startAutoAdvance();
    return () => clearInterval(intervalRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, categories.length]);

  /* Toggle auto-play on/off */
  const toggleAutoPlay = () => {
    setAutoPlay((prev) => {
      const next = !prev;
      autoPlayRef.current = next;
      if (next) {
        // turning on — restart immediately
        clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
          setActive((i) => (i + 1) % categoriesLenRef.current);
          setTimerKey((k) => k + 1);
        }, 4500);
        setTimerKey((k) => k + 1); // reset bar
      } else {
        // turning off — stop
        clearInterval(intervalRef.current);
      }
      return next;
    });
  };

  /* Manual navigation — resets interval so timer always starts fresh */
  const go = (dir) => {
    setActive((i) => (i + dir + categoriesLenRef.current) % categoriesLenRef.current);
    setTimerKey((k) => k + 1);
    if (inViewRef.current && autoPlayRef.current) startAutoAdvance();
  };

  if (categories.length === 0) return null;

  return (
    <section className="skills-section" id="skills-section" ref={sectionRef}>
      <style>{css}</style>

      <div className="skills-header">
        <div className="skills-header-left">
          <h2 className="skills-title">Skills</h2>
          <p className="skills-subtitle">Expertise developed across AI, ML, and emerging tech.</p>
        </div>
        <button
          className={`skills-auto-btn ${autoPlay ? "on" : ""}`}
          onClick={toggleAutoPlay}
          title={autoPlay ? "Pause auto-scroll" : "Resume auto-scroll"}
        >
          <span className="skills-auto-dot" />
          {autoPlay ? "Auto ON" : "Auto OFF"}
        </button>
      </div>

      {isMobile ? (
        /* ── Mobile: flat swipeable card ── */
        <div className="skills-mobile-wrapper">
          <div className="skill-card-mobile">
            <SkillCard
              category={categories[active]}
              index={active}
              activated={inView}
              timerKey={timerKey}
              showTimer={autoPlay}
            />
          </div>
          <div className="skills-mobile-nav">
            <button className="skills-nav-btn" onClick={() => go(-1)}>← Prev</button>
            <div className="skills-nav-dots">
              {categories.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setActive(i); setTimerKey((k) => k + 1); if (inViewRef.current) startAutoAdvance(); }}
                  className={`skills-nav-dot ${i === active ? "active" : "inactive"}`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
            <button className="skills-nav-btn" onClick={() => go(1)}>Next →</button>
          </div>
        </div>
      ) : (
        /* ── Desktop: 3D carousel ── */
        <>
          <div className="skills-stage">
            <div className="skills-track">
              {categories.map((cat, i) => {
                const total = categories.length;
                let offset = i - active;
                if (offset > total / 2) offset -= total;
                if (offset < -total / 2) offset += total;

                const abs = Math.abs(offset);
                const translateX = offset * 290;
                const translateZ = -abs * 230;
                const rotateY = offset * -28;
                const opacity = abs > 2 ? 0 : 1 - abs * 0.25;
                const isActive = offset === 0;

                return (
                  <div
                    key={cat.title}
                    className="skill-card-3d"
                    onClick={() => setActive(i)}
                    style={{
                      transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg)`,
                      opacity,
                      zIndex: 10 - abs,
                      pointerEvents: abs > 2 ? "none" : "auto",
                    }}
                  >
                    <SkillCard category={cat} index={i} activated={isActive && inView} timerKey={timerKey} showTimer={autoPlay} />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="skills-nav">
            <button className="skills-nav-btn" onClick={() => go(-1)}>← Prev</button>
            <div className="skills-nav-dots">
              {categories.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setActive(i); setTimerKey((k) => k + 1); if (inViewRef.current) startAutoAdvance(); }}
                  className={`skills-nav-dot ${i === active ? "active" : "inactive"}`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
            <button className="skills-nav-btn" onClick={() => go(1)}>Next →</button>
          </div>
        </>
      )}
    </section>
  );
};
