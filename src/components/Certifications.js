import { Container, Row, Col } from "react-bootstrap";
import 'animate.css';
import TrackVisibility from 'react-on-screen';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiAward, FiExternalLink } from 'react-icons/fi';
import { Marquee } from "./Marquee";

export const Certifications = () => {
    const [certifications, setCertifications] = useState([]);

    useEffect(() => {
        const fetchCertifications = async () => {
            try {
                const url = 'https://raw.githubusercontent.com/garvkumar68/Portfolio/json-data/experience.json';
                const response = await axios.get(url);
                const data = response.data;

                // Support new {certifications:[...]} structure and legacy flat array
                if (data && data.certifications) {
                    setCertifications(data.certifications);
                } else if (Array.isArray(data)) {
                    const certData = data.filter(item =>
                        item.title.toLowerCase().includes("certification*") ||
                        item.title.toLowerCase().includes("certification")
                    );
                    setCertifications(certData);
                }
            } catch (err) {
                console.error('Error fetching certifications from GitHub', err);
            }
        };

        fetchCertifications();
    }, []);

    // Parser helper to extract issuer and clean title
    const parseCert = (title) => {
        let clean = title.replace(/certification\*/gi, "").replace(/certification/gi, "").trim();
        let issuer = "CERTIFICATION";
        
        const lowerTitle = title.toLowerCase();
        
        if (lowerTitle.includes("microsoft") && lowerTitle.includes("coursera")) {
            issuer = "MICROSOFT · COURSERA";
            clean = clean.replace(/microsoft/gi, "").replace(/coursera/gi, "").trim();
        } else if (lowerTitle.includes("google") && lowerTitle.includes("coursera")) {
            issuer = "GOOGLE · COURSERA";
            clean = clean.replace(/google/gi, "").replace(/coursera/gi, "").trim();
        } else if (lowerTitle.includes("ibm") && lowerTitle.includes("coursera")) {
            issuer = "IBM · COURSERA";
            clean = clean.replace(/ibm/gi, "").replace(/coursera/gi, "").trim();
        } else if (lowerTitle.includes("aws") || lowerTitle.includes("amazon")) {
            issuer = "AMAZON WEB SERVICES";
        } else if (lowerTitle.includes("microsoft")) {
            issuer = "MICROSOFT";
            clean = clean.replace(/certified:/gi, "").trim();
            if (!clean.startsWith("Microsoft")) {
                clean = "Microsoft " + clean;
            }
        } else if (lowerTitle.includes("google")) {
            issuer = "GOOGLE";
        } else if (lowerTitle.includes("ibm")) {
            issuer = "IBM";
        }

        // Clean up leading/trailing symbols or colons
        clean = clean.replace(/^[:\s-]+/, "").replace(/[:\s-]+$/, "").replace(/\s+/g, " ").trim();
        
        return { issuer, title: clean };
    };

    const firstRow = certifications.filter((_, i) => i % 3 === 0);
    const secondRow = certifications.filter((_, i) => i % 3 === 1);
    const thirdRow = certifications.filter((_, i) => i % 3 === 2);

    const renderCertCard = (item, index) => {
        const { issuer, title } = parseCert(item.title);
        const bgImg = item.imgUrl || process.env.PUBLIC_URL + "/assets/fallback-image/fallback-image.png";

        return (
            <div 
                key={index} 
                className="cert-card" 
                style={{ backgroundImage: `url(${bgImg})` }}
            >
                <div className="cert-card-overlay"></div>
                <div className="cert-card-content">
                    <div className="cert-card-issuer">
                        <FiAward className="cert-card-issuer-icon" />
                        <span>{issuer}</span>
                    </div>
                    <h4 className="cert-card-title">{title}</h4>
                    {item.stack && (
                        <div className="cert-card-stack">
                            {item.stack.split(',').map((tag, i) => (
                                <span key={i} className="cert-stack-tag">{tag.trim()}</span>
                            ))}
                        </div>
                    )}
                    {item.link && item.link.trim() && (
                        <a
                            href={item.link.trim()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cert-card-action"
                        >
                            <span>View credential</span>
                            <FiExternalLink className="cert-card-action-icon" />
                        </a>
                    )}
                </div>
            </div>
        );
    };

    return (
        <section className="certifications-section" id="certifications-page">
            <Container>
                <Row>
                    <Col size={12}>
                        <TrackVisibility>
                            {({ isVisible }) => (
                                <div className={isVisible ? "animate__animated animate__fadeIn" : ""}>
                                    <div className="certifications-header">
                                        <h2 className="certifications-title">Certifications</h2>
                                        <p className="certifications-subtitle">
                                            Continuous learning across AI, cloud, and data.
                                        </p>
                                    </div>
                                    <div className="certifications-grid">
                                        <div style={{ 
                                            position: "relative", display: "flex", width: "100%", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: "10px 0",
                                            maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
                                            WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)"
                                        }}>
                                            <Marquee pauseOnHover style={{ '--duration': '60s' }}>
                                                {firstRow.map(renderCertCard)}
                                            </Marquee>
                                            <Marquee reverse pauseOnHover style={{ '--duration': '60s' }}>
                                                {secondRow.map(renderCertCard)}
                                            </Marquee>
                                            <Marquee pauseOnHover style={{ '--duration': '60s' }}>
                                                {thirdRow.map(renderCertCard)}
                                            </Marquee>
                                        </div>
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
