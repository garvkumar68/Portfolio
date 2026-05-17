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
                                        <Row className="g-4 justify-content-start">
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
                                                        </div>
                                                        <div className="card-body">
                                                            {story.link && story.link.trim() ? (
                                                                <a href={story.link.trim()} target="_blank" rel="noopener noreferrer" className="card-title-link">
                                                                    <h4 className="card-title">{story.title}</h4>
                                                                </a>
                                                            ) : (
                                                                <h4 className="card-title">{story.title}</h4>
                                                            )}
                                                            {story.description && (
                                                                <p className="card-description">{story.description}</p>
                                                            )}
                                                            {story.link && story.link.trim() && (
                                                                <a href={story.link.trim()} target="_blank" rel="noopener noreferrer" className="card-action-btn">
                                                                    View Details &rarr;
                                                                </a>
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
