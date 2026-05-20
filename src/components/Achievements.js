import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useMediaQuery } from "react-responsive";
import "./Achievements.css";
const SLIDE_MS = 6000;

function Player({ active, duration, achievements }) {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const a = achievements[active];
  const flipped = active % 2 === 1 && !isMobile;

  if (!a) return null;

  return (
    <section id="reel" className="ach-player">
      <div className="ach-player__frame">
        {/* progress bar (timer) */}
        <div className="ach-player__progress-container">
          <motion.div
            key={active}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: duration / 1000, ease: "linear" }}
            style={{ transformOrigin: "0% 50%" }}
            className="ach-player__progress-bar"
          />
        </div>

        {/* HUD top bar */}
        <div className="ach-player__hud-top">
          <div className="ach-player__hud-live ach-font-mono">
            <span className="ach-player__live-dot" />
            Live · Chapter {a.badge || String(active + 1).padStart(2, "0")} / {String(achievements.length).padStart(2, "0")}
          </div>
          <div className="ach-player__hud-title ach-font-mono">
            Achievements Reel · 2025
          </div>
        </div>

        {/* Stage */}
        <div className="ach-player__stage">
          <AnimatePresence mode="sync">
            <motion.div
              key={a.title}
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              className="ach-player__img-wrapper"
            >
              <img
                src={a.imgUrl || "/assets/fallback-image/fallback-image.png"}
                alt={a.title}
                className="ach-player__img"
                onError={(e) => { e.target.onerror = null; e.target.src = "/assets/fallback-image/fallback-image.png"; }}
              />
              <div className="ach-player__gradient-bottom" />
              <div className={flipped ? "ach-player__gradient-side-right" : "ach-player__gradient-side-left"} />
            </motion.div>
          </AnimatePresence>

          {/* Desktop Overlay Caption */}
          {!isMobile && (
            <div className={`ach-player__caption ${flipped ? "ach-player__caption--right" : "ach-player__caption--left"}`}>
              <div className="ach-player__caption-inner">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={a.title + "-place"}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="ach-player__place ach-font-mono"
                  >
                    {a.place || "Remote"} · {a.rank || "Winner"}
                  </motion.div>
                </AnimatePresence>

                <h3 key={a.title + "-title"} className="ach-player__title ach-font-display">
                  {a.title.split(" ").map((word, i) => (
                    <span key={`${a.title}-${i}`} className="mr-2 inline-block overflow-hidden align-bottom" style={{ marginRight: '8px' }}>
                      <motion.span
                        initial={{ y: "110%" }}
                        animate={{ y: "0%" }}
                        transition={{ duration: 0.8, delay: 0.25 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                        className="inline-block"
                      >
                        {word}
                      </motion.span>
                    </span>
                  ))}
                </h3>

                <AnimatePresence mode="wait">
                  <motion.p
                    key={a.title + "-desc"}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7, delay: 0.55 }}
                    className="ach-player__desc"
                  >
                    {a.description}
                  </motion.p>
                </AnimatePresence>

                  {a.teams && (
                    <motion.div
                      key={a.title + "-meta"}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5, delay: 0.8 }}
                      className="ach-player__meta ach-font-mono"
                    >
                      <span>{a.teams}</span>
                    </motion.div>
                  )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Stacked Caption */}
        {isMobile && (
          <div className="ach-player__mobile-caption">
            <div className="ach-player__place ach-font-mono">
              {a.place || "Remote"} · {a.rank || "Winner"}
            </div>
            <h3 className="ach-player__title ach-font-display" style={{ fontSize: '28px' }}>
              {a.title}
            </h3>
            <p className="ach-player__desc">
              {a.description}
            </p>
            {a.teams && (
              <div className="ach-player__meta ach-font-mono" style={{ justifyContent: 'flex-start' }}>
                <span>{a.teams}</span>
              </div>
            )}
          </div>
        )}

        {/* Bottom timeline chapter markers */}
        <div className="ach-markers">
          {achievements.map((b, i) => {
            const isActive = i === active;
            return (
              <div key={b.title} className="ach-marker">
                <div className="ach-marker__text ach-font-mono">
                  <span>{b.badge || String(i + 1).padStart(2, "0")}</span>
                  <span className={`ach-marker__title ${isActive ? "ach-marker__title--active" : ""}`}>
                    {b.title}
                  </span>
                </div>
                <div className="ach-marker__bar-bg">
                  {isActive && (
                    <motion.div
                      key={`bar-${active}`}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: duration / 1000, ease: "linear" }}
                      style={{ transformOrigin: "0% 50%" }}
                      className="ach-marker__bar-fill"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}



function AchievementList({ achievements }) {
  const [open, setOpen] = useState(achievements.length > 0 ? achievements[0].title : null);

  return (
    <section className="ach-list-section">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="ach-list__header"
      >
        <div>
          <div className="ach-list__header-label ach-font-mono">Full Index</div>
          <h3 className="ach-list__header-title ach-font-display">Every chapter, on demand.</h3>
        </div>
        <span className="ach-list__header-hint ach-font-mono">Tap to expand</span>
      </motion.div>

      <ul className="ach-list">
        {achievements.map((a, i) => {
          const isOpen = open === a.title;
          return (
            <li key={a.title} className="ach-list__item">
              <button
                onClick={() => setOpen(isOpen ? null : a.title)}
                className="ach-list__btn"
                aria-expanded={isOpen}
              >
                <span className="ach-list__btn-num ach-font-mono">
                  {a.badge || String(i + 1).padStart(2, "0")}
                </span>
                <span className="ach-list__btn-title ach-font-display">
                  {a.title}{" "}
                  <span className="ach-list__btn-place">— {a.place || "Remote"}</span>
                </span>
                <motion.span
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="ach-list__btn-icon"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
                    className="ach-list__content"
                  >
                    <div className="ach-list__content-grid">
                      <motion.div
                        initial={{ clipPath: "inset(0 0 100% 0)" }}
                        animate={{ clipPath: "inset(0 0 0% 0)" }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="ach-list__content-img"
                      >
                        <img
                          src={a.imgUrl || "/assets/fallback-image/fallback-image.png"}
                          alt={a.title}
                          loading="lazy"
                          onError={(e) => { e.target.onerror = null; e.target.src = "/assets/fallback-image/fallback-image.png"; }}
                        />
                      </motion.div>
                      <div className="ach-list__content-text">
                        <div className="ach-list__tags ach-font-mono">
                          <span className="ach-list__tag-rank">{a.rank || "Winner"}</span>
                          {a.teams && <span className="ach-list__tag-teams">{a.teams}</span>}
                        </div>
                        <p className="ach-list__desc">{a.description}</p>
                        {a.link && a.link.trim() && (
                          <div style={{ marginTop: '16px' }}>
                            <a 
                              href={a.link.trim()} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ 
                                color: 'var(--ach-accent)', 
                                border: '1px solid var(--ach-accent)',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                display: 'inline-block',
                                fontSize: '14px',
                                fontWeight: '600'
                              }}
                            >
                              View Details &rarr;
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export const Achievements = () => {
  const [achievements, setAchievementsData] = useState([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const url = 'https://raw.githubusercontent.com/garvkumar68/Portfolio/json-data/successStories.json';
        const response = await axios.get(url);
        setAchievementsData(response.data);
      } catch (err) {
        console.error('Error fetching achievements from GitHub', err);
      }
    };

    fetchAchievements();
  }, []);

  useEffect(() => {
    if (achievements.length === 0) return;
    const t = setInterval(() => {
      setActive((i) => (i + 1) % achievements.length);
    }, SLIDE_MS);
    return () => clearInterval(t);
  }, [achievements.length]);

  if (achievements.length === 0) {
    return <section className="ach-main" id="achievements-page"></section>;
  }

  return (
    <section className="ach-main" id="achievements-page">
      {/* fixed HUD overlay */}
      <div className="ach-hud ach-font-mono">
        ● Achievements Reel · 2025
      </div>

      {/* HERO TITLE */}
      <div className="ach-hero">
        <div className="ach-hero__content">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="ach-hero__subtitle ach-font-mono"
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              style={{ display: "inline-block", marginRight: "8px", color: "var(--ach-accent)" }}
            >
              ▸
            </motion.span>
            Now playing
          </motion.div>

          <div className="ach-hero__title-wrapper">
            <h2 className="ach-hero__title ach-font-display">
              {["ACHIEVEMENTS"].map((line, li) => (
                <span key={li} className="block overflow-hidden" style={{ display: 'block' }}>
                <motion.span
                  initial={{ y: "100%" }}
                  animate={{ y: "0%" }}
                  transition={{
                    duration: 1.1,
                    delay: 0.2 + li * 0.15,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{ display: 'inline-block' }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
            </h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="ach-hero__desc"
            >
              An auto-playing reel of milestones — hackathon wins, finalist runs,
              and the moments that shaped the work.
            </motion.p>
          </div>
        </div>
      </div>

      {/* AUTO-PLAYING PLAYER */}
      <Player active={active} duration={SLIDE_MS} achievements={achievements} />

      {/* LIST */}
      <AchievementList achievements={achievements} />

      <footer className="ach-footer ach-font-mono">
        End of reel · keep building
      </footer>
    </section>
  );
};
