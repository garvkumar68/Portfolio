import { Container, Row, Col } from "react-bootstrap";
import 'animate.css';
import TrackVisibility from 'react-on-screen';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export const Achievements = () => {
    const [achievements, setAchievementsData] = useState([]);

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

    return (
        <section className="project" id="achievements-page">
            <Container>
                <Row>
                    <Col size={12}>
                        <TrackVisibility>
                            {({ isVisible }) => (
                                <div className={isVisible ? "animate__animated animate__fadeIn" : ""}>
                                    <h2 className="section-title">Achievements & Recognition</h2>
                                    <p className="section-subtitle">
                                        Highlights of my key milestones, hackathon wins, honors, research breakthroughs, 
                                        and other notable professional achievements.
                                    </p>
                                    <div className="divided-grid">
                                        <Row className="g-4 justify-content-center">
                                            {achievements.map((story, index) => (
                                                <Col xs={12} sm={6} md={4} lg={3} key={index} className="d-flex align-items-stretch">
                                                    <div className="divided-card">
                                                        <div className="proj-imgbx">
                                                            <img
                                                                src={(story.imgUrl) || "/assets/fallback-image/fallback-image.png"}
                                                                alt={story.title}
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.src = process.env.PUBLIC_URL + "/assets/fallback-image/fallback-image.png";
                                                                }}
                                                            />
                                                            <div className="proj-txtx">
                                                                <span>{story.description}</span>
                                                            </div>
                                                        </div>
                                                        <button className={`proj-btn ${!story.link.trim() ? 'disabled' : ''}`}>
                                                            <div className="col-title">
                                                                <a href={story.link.trim() || '#'} target="_blank" rel="noopener noreferrer">
                                                                    <h4>{story.title}</h4>
                                                                </a>
                                                            </div>
                                                        </button>
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
