import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaLinkedin, FaGithub, FaTwitter } from "react-icons/fa";

const CARD_DATA = {
  name: "Garv Kumar",
  username: "garvkumar68",
  bio: "Software Engineer · Computer Vision · ML · IoT · Data Analyst — building smart systems from data to deployment.",
  stats: { following: 12, followers: 180, posts: 34 },
  socialLinks: {
    linkedin: "https://www.linkedin.com/in/garv-kumar-aa09b0213",
    github: "https://github.com/garvkumar68",
    twitter: "https://twitter.com",
  },
};

const FALLBACK_IMG =
  "https://drive.google.com/uc?export=view&id=1yAZJCOeH9CGa3gtMfeDsZRs4dgKR-zQV";

const styles = `
  .flip-card-wrapper {
    width: 300px;
    height: 400px;
    perspective: 1200px;
    cursor: pointer;
    user-select: none;
  }

  .flip-card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transition: transform 0.65s cubic-bezier(0.4, 0.2, 0.2, 1);
  }

  .flip-card-inner.flipped {
    transform: rotateY(180deg);
  }

  .flip-card-front,
  .flip-card-back {
    position: absolute;
    inset: 0;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    border-radius: 16px;
    overflow: hidden;
  }

  /* ── FRONT: Dark slate base matching canvas ── */
  .flip-card-front {
    background: #0d0d0d;
    padding: 0;
    margin: 0;
  }

  .fc-front-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
    display: block;
    border-radius: 16px;
    margin: 0;
    padding: 0;
  }

  /* Specular border glow matching hexagon grid lines */
  .flip-card-front::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 16px;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
    pointer-events: none;
    z-index: 1;
  }

  /* ── BACK: Minimalistic Frosted Acrylic ── */
  .flip-card-back {
    background: rgba(18, 18, 18, 0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    transform: rotateY(180deg);
    display: flex;
    flex-direction: column;
    padding: 28px 24px 24px;
    box-sizing: border-box;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .fc-back-header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 24px;
  }

  .fc-back-avatar-wrap {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.15);
    flex-shrink: 0;
    background: #121212;
  }

  .fc-back-avatar {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
  }

  .fc-back-name {
    margin: 0 0 2px;
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
    letter-spacing: -0.01em;
  }

  .fc-back-handle {
    margin: 0;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.4);
  }

  /* ── STATS BLOCK ── */
  .fc-stats {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 12px 0;
    margin-bottom: 22px;
  }

  .fc-stat {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .fc-stat-val {
    font-size: 18px;
    font-weight: 600;
    color: #ffffff;
    line-height: 1.2;
  }

  .fc-stat-label {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.35);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .fc-stat-divider {
    width: 1px;
    height: 24px;
    background: rgba(255, 255, 255, 0.08);
  }

  /* ── BIO TEXT ── */
  .fc-back-bio {
    flex: 1;
    margin: 0 0 22px;
    font-size: 12.5px;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.6);
  }

  /* ── SOCIAL BUTTONS ── */
  .fc-socials {
    display: flex;
    gap: 8px;
  }

  .fc-social-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.55);
    text-decoration: none;
    transition: all 0.2s ease-in-out;
  }

  .fc-social-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #ffffff;
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }
`;

export const FlipCard = () => {
  const [flipped, setFlipped] = useState(false);
  const [imgUrl, setImgUrl] = useState(FALLBACK_IMG);

  useEffect(() => {
    axios
      .get(
        "https://raw.githubusercontent.com/garvkumar68/Portfolio/json-data/logo.json"
      )
      .then((res) => {
        if (res.data?.logo_url) setImgUrl(res.data.logo_url);
      })
      .catch(() => {});
  }, []);

  const { name, username, bio, stats, socialLinks } = CARD_DATA;

  return (
    <>
      <style>{styles}</style>
      <div
        className="flip-card-wrapper"
        onMouseEnter={() => setFlipped(true)}
        onMouseLeave={() => setFlipped(false)}
        onClick={() => setFlipped((f) => !f)}
      >
        <div className={`flip-card-inner${flipped ? " flipped" : ""}`}>

          {/* ── FRONT ── */}
          <div className="flip-card-front">
            <img
              src={imgUrl}
              alt={name}
              className="fc-front-img"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = FALLBACK_IMG;
              }}
            />
          </div>

          {/* ── BACK ── */}
          <div className="flip-card-back">
            <div className="fc-back-header">
              <div className="fc-back-avatar-wrap">
                <img
                  src={imgUrl}
                  alt={name}
                  className="fc-back-avatar"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = FALLBACK_IMG;
                  }}
                />
              </div>
              <div>
                <h4 className="fc-back-name">{name}</h4>
                <p className="fc-back-handle">@{username}</p>
              </div>
            </div>

            <div className="fc-stats">
              <div className="fc-stat">
                <span className="fc-stat-val">{stats.posts}</span>
                <span className="fc-stat-label">Posts</span>
              </div>
              <div className="fc-stat-divider" />
              <div className="fc-stat">
                <span className="fc-stat-val">{stats.followers}</span>
                <span className="fc-stat-label">Followers</span>
              </div>
              <div className="fc-stat-divider" />
              <div className="fc-stat">
                <span className="fc-stat-val">{stats.following}</span>
                <span className="fc-stat-label">Following</span>
              </div>
            </div>

            <p className="fc-back-bio">{bio}</p>

            <div className="fc-socials">
              {socialLinks.linkedin && (
                <a href={socialLinks.linkedin} target="_blank" rel="noreferrer"
                  className="fc-social-btn" onClick={(e) => e.stopPropagation()} title="LinkedIn">
                  <FaLinkedin size={16} />
                </a>
              )}
              {socialLinks.github && (
                <a href={socialLinks.github} target="_blank" rel="noreferrer"
                  className="fc-social-btn" onClick={(e) => e.stopPropagation()} title="GitHub">
                  <FaGithub size={16} />
                </a>
              )}
              {socialLinks.twitter && (
                <a href={socialLinks.twitter} target="_blank" rel="noreferrer"
                  className="fc-social-btn" onClick={(e) => e.stopPropagation()} title="Twitter">
                  <FaTwitter size={16} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};