import { Container, Row, Col } from "react-bootstrap";
import 'animate.css';
import TrackVisibility from 'react-on-screen';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export const Certifications = () => {
    const [certifications, setCertifications] = useState([]);

    useEffect(() => {
        const fetchCertifications = async () => {
            try {
                const url = 'https://raw.githubusercontent.com/garvkumar68/Portfolio/json-data/experience.json';
                const response = await axios.get(url);
                
                // Filter only items that contain certification keyword
                const certData = response.data.filter(item => 
                    item.title.toLowerCase().includes("certification*") || 
                    item.title.toLowerCase().includes("certification")
                );
                
                setCertifications(certData);
            } catch (err) {
                console.error('Error fetching certifications from GitHub', err);
            }
        };

        fetchCertifications();
    }, []);

    // Helper to strip the prefix for display
    const cleanTitle = (title) => {
        return title.replace(/certification\*/gi, "").replace(/certification/gi, "").trim();
    };

    return (
        <section className="project" id="certifications-page">
            <Container>
                <Row>
                    <Col size={12}>
                        <TrackVisibility>
                            {({ isVisible }) => (
                                <div className={isVisible ? "animate__animated animate__fadeIn" : ""}>
                                    <h2 className="section-title">Certifications</h2>
                                    <p className="section-subtitle">
                                        Professional qualifications, vendor certifications, and specialized credentials
                                        demonstrating expertise in artificial intelligence, cloud infrastructure, and software engineering.
                                    </p>
                                    <div className="divided-grid">
                                        <Row className="g-4 justify-content-start">
                                            {certifications.map((item, index) => (
                                                <Col xs={12} sm={6} md={4} lg={3} key={index} className="d-flex align-items-stretch">
                                                    <div className="divided-card">
                                                        <div className="proj-imgbx">
                                                            <img
                                                                src={(item.imgUrl) || "/assets/fallback-image/fallback-image.png"}
                                                                alt={cleanTitle(item.title)}
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.src = process.env.PUBLIC_URL + "/assets/fallback-image/fallback-image.png";
                                                                }}
                                                            />
                                                            <div className="proj-txtx">
                                                                <span>{item.description}</span>
                                                            </div>
                                                        </div>
                                                        <div className="card-body">
                                                            {item.link && item.link.trim() ? (
                                                                <a href={item.link.trim()} target="_blank" rel="noopener noreferrer" className="card-title-link">
                                                                    <h4 className="card-title">{cleanTitle(item.title)}</h4>
                                                                </a>
                                                            ) : (
                                                                <h4 className="card-title">{cleanTitle(item.title)}</h4>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Col>
                                            ))}
                                        </Row>
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
