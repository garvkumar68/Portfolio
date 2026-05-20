import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Container, Row, Col } from "react-bootstrap";
import axios from 'axios';
import TrackVisibility from 'react-on-screen';
import 'animate.css';
import { HoneycombHive } from './HoneycombHive';
import './Projects.css';

// Safe inline SVG Chevron icons to eliminate extra package dependencies
const ChevronLeft = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const ChevronRight = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

export const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [offset, setOffset] = useState(0);
    const [activeIdx, setActiveIdx] = useState(0); // default active index in visible row (1st one open)
    const [isMobile, setIsMobile] = useState(false);

    // Fetch projects dynamically
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const url = 'https://raw.githubusercontent.com/garvkumar68/Portfolio/json-data/projects.json';
                const response = await axios.get(url);
                setProjects(response.data);
            } catch (err) {
                console.error('Error fetching projects data from GitHub', err);
            }
        };

        fetchProjects();
    }, []);

    // Responsive breakpoint listener
    useEffect(() => {
        const mq = window.matchMedia("(max-width: 768px)");
        const handler = () => setIsMobile(mq.matches);
        handler();
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    // Process and map raw fetched project data into the showcase format
    const mappedProjects = useMemo(() => {
        return projects.map((p, idx) => {
            // Smart Tagline: Use the first sentence of the description
            const desc = p.description || "";
            const parts = desc.split('. ');
            const tagline = parts[0] ? parts[0] + (parts[0].endsWith('.') ? '' : '.') : "Innovative technology showcase.";
            const restOfDesc = parts.slice(1).join('. ') || desc;

            // Smart Tag guessing based on keywords
            const text = `${p.title} ${desc}`.toLowerCase();
            let tag = "Engineering";
            if (text.includes("lunar") || text.includes("space") || text.includes("rover")) {
                tag = "Aerospace";
            } else if (text.includes("learning") || text.includes("ai") || text.includes("vision") || text.includes("intelligence") || text.includes("model")) {
                tag = "AI / ML";
            } else if (text.includes("iot") || text.includes("sensor") || text.includes("hardware") || text.includes("embedded") || text.includes("telemetry") || text.includes("black box")) {
                tag = "IoT & Embedded";
            } else if (text.includes("web") || text.includes("react") || text.includes("full-stack") || text.includes("app") || text.includes("software")) {
                tag = "Software";
            }

            return {
                id: p.id || `p-${idx}`,
                title: p.title || "Project Title",
                tagline: tagline,
                description: restOfDesc,
                tag: tag,
                image: p.imgUrl || "/assets/fallback-image/fallback-image.png",
                link: p.link || ""
            };
        });
    }, [projects]);

    const total = mappedProjects.length;

    // visible count of blade slots
    const visibleCount = useMemo(() => {
        if (total === 0) return 0;
        if (isMobile) return total; // Show all projects on mobile
        // If 6 or less projects, show all of them as expanding blades (no honeycomb)
        return total > 6 ? 5 : total;
    }, [isMobile, total]);

    const activeClamped = Math.min(activeIdx, Math.max(0, visibleCount - 1));

    // Dynamic subsets of projects for rendering
    const visibleProjects = useMemo(() => {
        if (total === 0 || visibleCount === 0) return [];
        return Array.from({ length: visibleCount }, (_, i) => mappedProjects[(offset + i) % total]);
    }, [offset, visibleCount, mappedProjects, total]);

    const queuedProjects = useMemo(() => {
        if (total <= 6 || visibleCount === 0) return [];
        const queue = [];
        for (let i = visibleCount; i < total; i++) {
            queue.push(mappedProjects[(offset + i) % total]);
        }
        return queue;
    }, [offset, visibleCount, mappedProjects, total]);

    // Carousel actions
    const next = useCallback(() => {
        if (total > 0) setOffset((o) => (o + 1) % total);
    }, [total]);

    const prev = useCallback(() => {
        if (total > 0) setOffset((o) => (o - 1 + total) % total);
    }, [total]);

    // Keyboard navigation
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "ArrowRight") next();
            if (e.key === "ArrowLeft") prev();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [next, prev]);

    // Touch swipe support
    const [touchStart, setTouchStart] = useState(null);
    const onTouchStart = (e) => setTouchStart(e.touches[0].clientX);
    const onTouchEnd = (e) => {
        if (touchStart == null) return;
        const delta = e.changedTouches[0].clientX - touchStart;
        if (Math.abs(delta) > 50) {
            if (delta < 0) next();
            else prev();
        }
        setTouchStart(null);
    };

    if (total === 0) {
        return (
            <section className="project" id="projects-page">
                <Container>
                    <Row>
                        <Col size={12}>
                            <h2 className="section-title">My Projects</h2>
                            <p className="section-subtitle">Loading projects...</p>
                        </Col>
                    </Row>
                </Container>
            </section>
        );
    }

    return (
        <section className="project" id="projects-page">
            <Container>
                <Row>
                    <Col size={12}>
                        <TrackVisibility>
                            {({ isVisible }) => (
                                <div className={isVisible ? "animate__animated animate__fadeIn" : ""}>
                                    <h2 className="section-title">My Projects</h2>
                                    <p className="section-subtitle">
                                        A showcase of machine learning systems, computer vision models, 
                                        embedded IoT applications, and full-stack software development. 
                                        Click on any project to expand its details.
                                    </p>
                                    
                                    <div className="ps-root">
                                        <div
                                            className="ps-row"
                                            onTouchStart={onTouchStart}
                                            onTouchEnd={onTouchEnd}
                                        >
                                            {visibleProjects.map((p, i) => {
                                                const isActive = i === activeClamped;
                                                return (
                                                    <button
                                                        type="button"
                                                        key={`${p.id}-${i}`}
                                                        className={`ps-blade ${isActive ? "ps-blade--active" : ""}`}
                                                        onClick={() => setActiveIdx(i)}
                                                        aria-label={p.title}
                                                    >
                                                        <div 
                                                            className="ps-blade__bg" 
                                                            style={{ backgroundImage: `url(${p.image})` }} 
                                                        />
                                                        <div className="ps-blade__scrim" />
                                                        {/* Compact strip label — only visible on inactive mobile blades */}
                                                        <div className="ps-blade__strip">
                                                            <span className="ps-blade__strip-num">{String(((offset + i) % total) + 1).padStart(2, "00")}</span>
                                                            <span className="ps-blade__strip-title">{p.title}</span>
                                                            <span className="ps-blade__strip-tag">{p.tag}</span>
                                                        </div>
                                                        <div className="ps-blade__num">
                                                            {String(((offset + i) % total) + 1).padStart(2, "00")}
                                                        </div>
                                                        <div className="ps-blade__content">
                                                            <div className="ps-blade__text-group">
                                                                <span className="ps-blade__tag">{p.tag}</span>
                                                                <h3 className="ps-blade__title">{p.title}</h3>
                                                                <p className="ps-blade__tagline">{p.tagline}</p>
                                                                <p className="ps-blade__desc">{p.description}</p>
                                                            </div>
                                                            {p.link && p.link.trim() && (
                                                                <a 
                                                                    href={p.link.trim()} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer" 
                                                                    className="ps-blade__action"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    View Project &rarr;
                                                                </a>
                                                            )}
                                                        </div>
                                                    </button>
                                                );
                                            })}

                                            {/* Only show 3D Honeycomb queue if total projects is greater than 6 (desktop only) */}
                                            {total > 6 && !isMobile && (
                                                <div className="ps-hive" aria-label="Project queue">
                                                    <HoneycombHive
                                                        projects={queuedProjects}
                                                        onSelect={(_p, qIdx) => {
                                                            setOffset((o) => (o + visibleCount + qIdx) % total);
                                                        }}
                                                    />
                                                    <div className="ps-hive__fade" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Only show controls if total projects is greater than 6 (desktop only) */}
                                        {total > 6 && !isMobile && (
                                            <div className="ps-controls">
                                                <button className="ps-ctrl" onClick={prev} aria-label="Previous">
                                                    <ChevronLeft />
                                                </button>
                                                <div className="ps-counter">
                                                    <span className="ps-counter__cur">{String((offset % total) + 1).padStart(2, "0")}</span>
                                                    <span className="ps-counter__sep">/</span>
                                                    <span className="ps-counter__tot">{String(total).padStart(2, "0")}</span>
                                                </div>
                                                <button className="ps-ctrl" onClick={next} aria-label="Next">
                                                    <ChevronRight />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            )}
                        </TrackVisibility>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};
