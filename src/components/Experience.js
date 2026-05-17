import { Container, Row, Col } from "react-bootstrap";
import 'animate.css';
import TrackVisibility from 'react-on-screen';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export const Experience = () => {
    const [professionalExp, setProfessionalExp] = useState([]);
    const [education, setEducation] = useState([]);

    useEffect(() => {
        const fetchExperienceData = async () => {
            try {
                // Fetch Professional Experience (experience.json)
                const expUrl = 'https://raw.githubusercontent.com/garvkumar68/Portfolio/json-data/experience.json';
                const expResponse = await axios.get(expUrl);
                setProfessionalExp(expResponse.data);

                // Fetch Academic Education (education.json)
                const eduUrl = 'https://raw.githubusercontent.com/garvkumar68/Portfolio/json-data/education.json';
                const eduResponse = await axios.get(eduUrl);
                setEducation(eduResponse.data);
            } catch (err) {
                console.error('Error fetching experience/education data from GitHub', err);
            }
        };

        fetchExperienceData();
    }, []);

    return (
        <section className="project" id="experience-page">
            <Container>
                <Row>
                    <Col size={12}>
                        <TrackVisibility>
                            {({ isVisible }) => (
                                <div className={isVisible ? "animate__animated animate__fadeIn" : ""}>
                                    <h2 className="section-title">Professional Experience</h2>
                                    <p className="section-subtitle">
                                        An overview of my engineering history, research work, and academic background.
                                    </p>

                                    {/* Professional Experience Section */}
                                    <h3 className="divided-subheading">Work & Research Experience</h3>
                                    <div className="divided-grid mb-5">
                                        <Row className="g-4 justify-content-center">
                                            {professionalExp.map((item, index) => (
                                                <Col xs={12} sm={6} md={4} lg={3} key={index} className="d-flex align-items-stretch">
                                                    <div className="divided-card">
                                                        <div className="proj-imgbx">
                                                            <img
                                                                src={(item.imgUrl) || "/assets/fallback-image/fallback-image.png"}
                                                                alt={item.title}
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.src = process.env.PUBLIC_URL + "/assets/fallback-image/fallback-image.png";
                                                                }}
                                                            />
                                                            <div className="proj-txtx">
                                                                <span>{item.description}</span>
                                                            </div>
                                                        </div>
                                                        <button className={`proj-btn ${!item.link.trim() ? 'disabled' : ''}`}>
                                                            <div className="col-title">
                                                                <a href={item.link.trim() || '#'} target="_blank" rel="noopener noreferrer">
                                                                    <h4>{item.title}</h4>
                                                                </a>
                                                            </div>
                                                        </button>
                                                    </div>
                                                </Col>
                                            ))}
                                        </Row>
                                    </div>

                                    {/* Education Section */}
                                    <h3 className="divided-subheading mt-5">Education</h3>
                                    <div className="divided-grid">
                                        <Row className="g-4 justify-content-center">
                                            {education.map((item, index) => (
                                                <Col xs={12} sm={6} md={4} lg={3} key={index} className="d-flex align-items-stretch">
                                                    <div className="divided-card">
                                                        <div className="proj-imgbx">
                                                            <img
                                                                src={(item.imgUrl) || "/assets/fallback-image/fallback-image.png"}
                                                                alt={item.title}
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.src = process.env.PUBLIC_URL + "/assets/fallback-image/fallback-image.png";
                                                                }}
                                                            />
                                                            <div className="proj-txtx">
                                                                <span>{item.description}</span>
                                                            </div>
                                                        </div>
                                                        <button className={`proj-btn ${!item.link.trim() ? 'disabled' : ''}`}>
                                                            <div className="col-title">
                                                                <a href={item.link.trim() || '#'} target="_blank" rel="noopener noreferrer">
                                                                    <h4>{item.title}</h4>
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
