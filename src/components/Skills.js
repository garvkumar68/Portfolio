import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useMediaQuery } from "react-responsive";

const css = `
  .skills-section {
    position: relative;
    padding: 60px 0 80px;
    overflow: hidden;
  }

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

  .skills-stage {
    position: relative;
    width: 100%;
    max-width: 1100px;
    margin: 0 auto;
    height: 500px;
    perspective: 1600px;
  }

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
    50%       { opacity: 0.4; }
  }

  .skills-track {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
  }

  .skill-card-3d {
    position: absolute;
    left: 0;
    right: 0;
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
    padding: 28px 26px 30px;
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
  }

  .skills-timer-track {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: rgba(255,255,255,0.1);
    border-radius: 0 0 20px 20px;
    z-index: 10;
    overflow: hidden;
  }

  .skills-timer-fill {
    height: 100%;
    width: 0%;
    background: #00dfa2;
    box-shadow: 0 0 8px rgba(0, 223, 162, 0.7);
    border-radius: 0 0 20px 20px;
  }

  .skills-nav {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-top: 10px;
    position: relative;
    z-index: 100;
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

  @media (max-width: 768px) {
    .skills-title { font-size: 30px; }
    .skills-subtitle { font-size: 13px; }
    .skills-stage { height: 420px; perspective: 1200px; }
    .skill-card-3d { width: 88%; height: 400px; }
    .skill-card-inner { padding: 20px 18px 24px; gap: 14px; }
    .skill-card-title { font-size: 9px; }
    .skill-item-name { font-size: 8px; letter-spacing: 0.05em; }
    .skill-item-pct { font-size: 9px; }
    .skill-item-row { margin-bottom: 3px; }
  }
`;

/* ─────────────────────────────────────────────────────────────────────────────
 * ProgressBar
 * Uses the Web Animations API directly on a ref — completely bypasses React
 * rendering and CSS transition timing. Called imperatively via triggerAnimate().
 * ───────────────────────────────────────────────────────────────────────────── */
function ProgressBar({ level, delay }) {
  const fillRef = useRef(null);
  const animRef = useRef(null);

  /* Exposed via ref so the parent can call it at exactly the right moment */
  const triggerAnimate = useCallback(() => {
    const el = fillRef.current;
    if (!el) return;

    // cancel previous animations
    el.getAnimations().forEach((a) => a.cancel());

    // force reset
    el.style.width = "0%";

    // force reflow
    void el.offsetWidth;

    el.animate(
      [{ width: "0%" }, { width: `${level}%` }],
      {
        duration: 1400,
        delay: delay,
        easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        fill: "forwards",
      }
    );
  }, [level, delay]);

  /* Attach the trigger function to the DOM node so the parent can call it */
  useEffect(() => {
    if (fillRef.current) {
      fillRef.current._triggerAnimate = triggerAnimate;
    }
  }, [triggerAnimate]);

  return (
    <div className="skill-bar-track">
      <div className="skill-bar-fill" ref={fillRef} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * TimerBar
 * Web Animations API driven. triggerTimer() is called imperatively.
 * ───────────────────────────────────────────────────────────────────────────── */
function TimerBar({ timerRef }) {
  const fillRef = useRef(null);

  useEffect(() => {
    /* Attach imperative trigger to the ref the parent holds */
    if (timerRef) {
      timerRef.current = {
        trigger: () => {
          const el = fillRef.current;
          if (!el) return;

          // cancel previous animations
          el.getAnimations().forEach((a) => a.cancel());

          // force reset
          el.style.width = "0%";

          // force reflow
          void el.offsetWidth;

          el.animate(
            [{ width: "0%" }, { width: "100%" }],
            { duration: 4500, easing: "linear", fill: "forwards" }
          );
        },
      };
    }
  }, [timerRef]);

  return (
    <div className="skills-timer-track">
      <div className="skills-timer-fill" ref={fillRef} />
    </div>
  );
}

const getTier = (progress) => {
  if (typeof progress === 'string' && isNaN(Number(progress))) {
    return progress.charAt(0).toUpperCase() + progress.slice(1).toLowerCase();
  }
  const p = Number(progress);
  if (p <= 30) return "Aware";
  if (p < 60) return "Beginner";
  if (p <= 84) return "Intermediate";
  if (p <= 95) return "Advanced";
  return "Expert";
};

const getProgressNumber = (progress) => {
  if (typeof progress === 'string' && isNaN(Number(progress))) {
    const lower = progress.toLowerCase();
    if (lower === "aware") return 25;
    if (lower === "beginner") return 50;
    if (lower === "intermediate") return 75;
    if (lower === "advanced") return 90;
    if (lower === "expert") return 98;
    return 50;
  }
  return Number(progress);
};

/* ─────────────────────────────────────────────────────────────────────────────
 * SkillCard
 * Holds refs to all bar DOM nodes. When activated changes to true, it calls
 * _triggerAnimate() on each fill element directly — no re-render needed.
 * ───────────────────────────────────────────────────────────────────────────── */
function SkillCard({ category, index, activated, showTimer }) {
  const cardRef    = useRef(null);
  const timerCtrl  = useRef(null);   /* TimerBar controller */
  const prevActive = useRef(false);

  const formatIndex = (i) => String(i + 1).padStart(2, "0");
  const formatTitle = (t) => t.toUpperCase().replace(/&/g, "AND");

  /* Runs the animations imperatively whenever activated flips to true */
  const runAnimations = useCallback(() => {
    if (!cardRef.current) return;

    /* Trigger every progress bar */
    const fills = cardRef.current.querySelectorAll(".skill-bar-fill");
    fills.forEach((el) => {
      if (typeof el._triggerAnimate === "function") {
        el._triggerAnimate();
      }
    });

    /* Trigger the timer bar */
    if (showTimer && timerCtrl.current?.trigger) {
      timerCtrl.current.trigger();
    }
  }, [showTimer]);

  useEffect(() => {
    if (activated && !prevActive.current) {
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(runAnimations);
      });
      prevActive.current = true;
      return () => cancelAnimationFrame(id);
    }
    if (!activated && prevActive.current) {
      prevActive.current = false;
      
      if (!cardRef.current) return;
      
      // Animate progress bars back to 0%
      const fills = cardRef.current.querySelectorAll(".skill-bar-fill");
      fills.forEach((el) => {
        const currentWidth = window.getComputedStyle(el).width;
        el.getAnimations().forEach((a) => a.cancel());
        el.style.width = currentWidth;
        void el.offsetWidth;
        
        el.animate(
          [{ width: "0%" }],
          { duration: 600, easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)", fill: "forwards" }
        );
      });

      // Animate timer bar back to 0%
      const timerFill = cardRef.current.querySelector(".skills-timer-fill");
      if (timerFill) {
        const currentWidth = window.getComputedStyle(timerFill).width;
        timerFill.getAnimations().forEach((a) => a.cancel());
        timerFill.style.width = currentWidth;
        void timerFill.offsetWidth;
        
        timerFill.animate(
          [{ width: "0%" }],
          { duration: 400, easing: "ease-out", fill: "forwards" }
        );
      }
    }
  }, [activated, runAnimations]);

  /* Handle toggling Auto-Scroll back ON for an already-active card */
  useEffect(() => {
    // If the card is ALREADY active (prevActive.current) and showTimer flips to true:
    if (activated && showTimer && prevActive.current) {
      const id = setTimeout(() => {
        if (timerCtrl.current?.trigger) {
          timerCtrl.current.trigger();
        }
      }, 50);
      return () => clearTimeout(id);
    }
  }, [activated, showTimer]);

  return (
    <div className="skill-card-inner" ref={cardRef}>
      <div className="skill-card-header">
        <span className="skill-card-index">{formatIndex(index)}</span>
        <h3 className="skill-card-title">{formatTitle(category.title)}</h3>
      </div>
      <div className="skill-list">
        {category.skills.map((s, si) => (
          <div key={s.name}>
            <div className="skill-item-row">
              <span className="skill-item-name">{s.name.toUpperCase()}</span>
              <span className="skill-item-pct">{getTier(s.progress)}</span>
            </div>
            <ProgressBar level={getProgressNumber(s.progress)} delay={si * 80} />
          </div>
        ))}
      </div>
      {showTimer && <TimerBar timerRef={timerCtrl} />}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Main Skills component
 * ───────────────────────────────────────────────────────────────────────────── */
export const Skills = () => {
  const [categories, setCategories]   = useState([]);
  const [active, setActive]           = useState(0);
  const [inView, setInView]           = useState(false);
  const [autoPlay, setAutoPlay]       = useState(true);

  const sectionRef        = useRef(null);
  const intervalRef       = useRef(null);
  const activeRef         = useRef(0);
  const categoriesLenRef  = useRef(0);
  const inViewRef         = useRef(false);
  const autoPlayRef       = useRef(true);

  const isMobile = useMediaQuery({ maxWidth: 768 });

  /* Keep refs in sync */
  useEffect(() => { activeRef.current = active; }, [active]);
  useEffect(() => { categoriesLenRef.current = categories.length; }, [categories.length]);
  useEffect(() => { inViewRef.current = inView; }, [inView]);
  useEffect(() => { autoPlayRef.current = autoPlay; }, [autoPlay]);

  /* Fetch */
  useEffect(() => {
    axios
      .get("https://raw.githubusercontent.com/garvkumar68/Portfolio/json-data/skillsData.json")
      .then((res) => {
        if (res.data.categories) setCategories(res.data.categories);
        else if (res.data.skills)
          setCategories([{ title: "Technical Expertise", skills: res.data.skills }]);
      })
      .catch((err) => console.error("Error fetching skills:", err));
  }, []);

  /* Auto-advance */
  const startAutoAdvance = useCallback(() => {
    clearInterval(intervalRef.current);
    if (!autoPlayRef.current) return;
    intervalRef.current = setInterval(() => {
      setActive((i) => (i + 1) % categoriesLenRef.current);
    }, 4500);
  }, []);

  /* IntersectionObserver */
  useEffect(() => {
    if (!sectionRef.current) return;
    const io = new IntersectionObserver(
      ([e]) => {
        const visible = e.isIntersecting;
        setInView(visible);
        if (visible && autoPlayRef.current && categoriesLenRef.current > 0) {
          startAutoAdvance();
        } else if (!visible) {
          clearInterval(intervalRef.current);
        }
      },
      { threshold: 0.2 }
    );
    io.observe(sectionRef.current);
    return () => io.disconnect();
  }, [startAutoAdvance, categories]);

  /* Start once data loads while already in view */
  useEffect(() => {
    if (inView && categories.length > 0 && autoPlay) startAutoAdvance();
    return () => clearInterval(intervalRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories.length]);

  const toggleAutoPlay = () => {
    setAutoPlay((prev) => {
      const next = !prev;
      autoPlayRef.current = next;
      if (next) startAutoAdvance();
      else clearInterval(intervalRef.current);
      return next;
    });
  };

  const go = (dir) => {
    setActive((i) => (i + dir + categoriesLenRef.current) % categoriesLenRef.current);
    if (inViewRef.current && autoPlayRef.current) startAutoAdvance();
  };

  const goTo = (i) => {
    setActive(i);
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
          {autoPlay ? "Auto-Scroll ON" : "Auto-Scroll OFF"}
        </button>
      </div>

      <div className="skills-stage">
        <div className="skills-track">
          {categories.map((cat, i) => {
            const total = categories.length;
            let offset = i - active;
            if (offset > total / 2) offset -= total;
            if (offset < -total / 2) offset += total;

            const abs = Math.abs(offset);
            const translateX = offset * (isMobile ? 150 : 290);
            const translateZ = -abs * (isMobile ? 160 : 230);
            const rotateY    = offset * (isMobile ? -15 : -28);
            const opacity    = abs > 2 ? 0 : 1 - abs * (isMobile ? 0.35 : 0.25);
            const isActive   = offset === 0;

            return (
              <div
                key={cat.title}
                className="skill-card-3d"
                onClick={() => goTo(i)}
                style={{
                  transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg)`,
                  opacity,
                  zIndex: 10 - abs,
                  pointerEvents: abs > 2 ? "none" : "auto",
                }}
              >
                <SkillCard
                  category={cat}
                  index={i}
                  activated={isActive && inView}
                  showTimer={autoPlay}
                />
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
              onClick={() => goTo(i)}
              className={`skills-nav-dot ${i === active ? "active" : "inactive"}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
        <button className="skills-nav-btn" onClick={() => go(1)}>Next →</button>
      </div>
    </section>
  );
};