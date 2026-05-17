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
                const url = 'https://raw.githubusercontent.com/garvkumar68/Portfolio/json-data/experience.json';
                const response = await axios.get(url);
                setProfessionalExp(response.data);
            } catch (err) {
                console.error('Error fetching experience data from GitHub', err);
            }
        };

        const fetchEducationData = async () => {
            try {
                const url = 'https://raw.githubusercontent.com/garvkumar68/Portfolio/json-data/education.json';
                const response = await axios.get(url);
                setEducation(response.data);
            } catch (err) {
                console.error('Error fetching education data from GitHub', err);
            }
        };

        fetchExperienceData();
        fetchEducationData();
    }, []);

    return (
        <section className="project" id="experience-page">
            <Container>
                <Row>
                    <Col size={12}>
                        <TrackVisibility>
                            {({ isVisible }) => (
                                <div className={isVisible ? "animate__animated animate__fadeIn" : ""}>
                                    <h2 className="section-title">Experience & Education</h2>
                                    <p className="section-subtitle">
                                        An overview of my engineering history, research work, and academic background.
                                    </p>

                                    {/* Professional Experience Section */}
                                    <h3 className="divided-subheading">Work & Research Experience</h3>
                                    <div className="divided-grid mb-5">
                                        <Row className="g-4 justify-content-start">
                                            {professionalExp
                                                .filter(item => !item.title.toLowerCase().includes("certification*") && !item.title.toLowerCase().includes("certification"))
                                                .map((item, index) => (
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
                                                        <div className="card-body">
                                                            {item.link && item.link.trim() ? (
                                                                <a href={item.link.trim()} target="_blank" rel="noopener noreferrer" className="card-title-link">
                                                                    <h4 className="card-title">{item.title}</h4>
                                                                </a>
                                                            ) : (
                                                                <h4 className="card-title">{item.title}</h4>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Col>
                                            ))}
                                        </Row>
                                    </div>

                                    {/* Education Section */}
                                    <h3 className="divided-subheading mt-5">Education</h3>
                                    <div className="divided-grid">
                                        <Row className="g-4 justify-content-start">
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
                                                        <div className="card-body">
                                                            {item.link && item.link.trim() ? (
                                                                <a href={item.link.trim()} target="_blank" rel="noopener noreferrer" className="card-title-link">
                                                                    <h4 className="card-title">{item.title}</h4>
                                                                </a>
                                                            ) : (
                                                                <h4 className="card-title">{item.title}</h4>
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
