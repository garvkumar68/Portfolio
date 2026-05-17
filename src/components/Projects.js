import { Container, Row, Col, Tab, Nav } from "react-bootstrap";
import 'animate.css';
import TrackVisibility from 'react-on-screen';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export const Projects = ({ defaultActiveTab = "first" }) => {
    const [projects, setProjectsData] = useState([]);
    const [successStories, setSuccessStoriesData] = useState([]);
    const [researchInsights, setResearchInsightsData] = useState([]);
    const [experience, setExperienceData] = useState([]);

    useEffect(() => {
        const fetchDataFromGitHub = async () => {
            try {
                const fetchData = async (fileName) => {
                    const url = `https://raw.githubusercontent.com/garvkumar68/Portfolio/json-data/${fileName}`;
                    
                    const response = await axios.get(url);
                    return response.data; // Directly return the JSON data
                };
                const projectsData = await fetchData('projects.json');
                const successStoriesData = await fetchData('successStories.json');
                const researchInsightsData = await fetchData('experience.json');
                const experienceData = await fetchData('education.json');

                setProjectsData(projectsData);
                setSuccessStoriesData(successStoriesData);
                setResearchInsightsData(researchInsightsData);
                setExperienceData(experienceData);
            } catch (err) {
                console.error('Error fetching data from GitHub', err);
            }
        };

        fetchDataFromGitHub();
    }, []);

    return (
        <section className="project" id="projects">
            <Container>
                <Row>
                    <Col size={12}>
                        <TrackVisibility>
                            {({ isVisible }) => (
                                <div className={isVisible ? "animate__animated animate__fadeIn" : ""}>
                                    <h2>Contributions</h2>
                                    <p>
                                        In this section, there is a variety of impactful <strong>projects</strong>,
                                        <strong>Achievements</strong>, <strong>research</strong>, and valuable
                                        <strong> experiences</strong>. 
                                        This space highlights my abilities and innovation in advancing technology,
                                        such as
                                        <strong> AI</strong>, <strong>Problem Solving</strong>, <strong> IoT</strong>,
                                        <strong> software development</strong>, and more...
                                    </p>
                                    <Tab.Container id="projects-tabs" defaultActiveKey={defaultActiveTab}>
                                        <Nav variant="pills" className="mb-5 justify-content-center align-items-center" id="pills-tab">
                                            <Nav.Item>
                                                <Nav.Link eventKey="first" className="btn btn-primary">Projects</Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item>
                                                <Nav.Link eventKey="second" className="btn btn-primary">Achievements</Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item>
                                                <Nav.Link eventKey="third" className="btn btn-primary">Experience</Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item>
                                                <Nav.Link eventKey="fourth" className="btn btn-primary">Education</Nav.Link>
                                            </Nav.Item>
                                        </Nav>
                                        <Tab.Content id="slideInUp" className={isVisible ? "animate__animated animate__slideInUp" : ""}>
                                            {/* Projects Tab */}
                                            <Tab.Pane eventKey="first">
                                                <div className="scrollable-projects">
                                                    <Row className="g-4">
                                                        {projects.slice(0, 6).map((project, index) => (
                                                            <Col xs={12} sm={6} md={4} lg={3} key={index}>
                                                                <div className="proj-imgbx">
                                                                    <img
                                                                        // Use the Google Drive link for image
                                                                        src={(project.imgUrl) || "/assets/fallback-image/fallback-image.png"}
                                                                        alt={project.title}
                                                                        onError={(e) => {
                                                                            e.target.onerror = null; // Prevent infinite loop
                                                                            e.target.src = process.env.PUBLIC_URL + "/assets/fallback-image/fallback-image.png"; // Fallback image
                                                                        }}
                                                                    />
                                                                    <div className="proj-txtx">
                                                                        <span>{project.description}</span>
                                                                    </div>
                                                                </div>
                                                                <button className={`proj-btn ${!project.link.trim() ? 'disabled' : ''}`}>
                                                                    <div className="col-title">
                                                                        <a href={project.link.trim() || '#'} target="_blank"
                                                                           rel="noopener noreferrer">
                                                                            <h4>{project.title}</h4>
                                                                        </a>
                                                                    </div>
                                                                </button>
                                                            </Col>
                                                        ))}
                                                    </Row>
                                                </div>
                                            </Tab.Pane>

                                            {/* Success Stories Tab */}
                                            <Tab.Pane eventKey="second">
                                                <div className="scrollable-projects">
                                                    <Row className="g-4">
                                                        {successStories.map((story, index) => (
                                                            <Col xs={12} sm={6} md={4} lg={3} key={index}>
                                                                <div className="proj-imgbx">
                                                                    <img
                                                                        src={(story.imgUrl || "/assets/fallback-image/fallback-image.png")}
                                                                        alt={story.title}
                                                                        onError={(e) => {
                                                                            e.target.onerror = null; // Prevent infinite loop
                                                                            e.target.src = process.env.PUBLIC_URL + "/assets/fallback-image/fallback-image.png"; // Fallback image
                                                                        }}
                                                                    />
                                                                    <div className="proj-txtx">
                                                                        <span>{story.description}</span>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    className={`proj-btn ${!story.link.trim() ? 'disabled' : ''}`}>
                                                                    <div className="col-title">
                                                                        <a href={story.link.trim() || '#'}
                                                                           target="_blank"
                                                                           rel="noopener noreferrer">
                                                                            <h4>{story.title}</h4>
                                                                        </a>
                                                                    </div>
                                                                </button>
                                                            </Col>
                                                        ))}
                                                    </Row>
                                                </div>
                                            </Tab.Pane>

                                            {/* Research Insights Tab */}
                                            <Tab.Pane eventKey="third">
                                                <div className="scrollable-projects">
                                                    <Row className="g-4">
                                                        {researchInsights.map((research, index) => (
                                                            <Col xs={12} sm={6} md={4} lg={3} key={index}>
                                                                <div className="proj-imgbx">
                                                                    <img
                                                                        src={(research.imgUrl || "/assets/fallback-image/fallback-image.png")}
                                                                        alt={research.title}
                                                                        onError={(e) => {
                                                                            e.target.onerror = null; // Prevent infinite loop
                                                                            e.target.src = process.env.PUBLIC_URL + "/assets/fallback-image/fallback-image.png"; // Fallback image
                                                                        }}
                                                                    />
                                                                    <div className="proj-txtx">
                                                                        <span>{research.description}</span>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    className={`proj-btn ${!research.link.trim() ? 'disabled' : ''}`}>
                                                                    <div className="col-title">
                                                                        <a href={research.link.trim() || '#'}
                                                                           target="_blank"
                                                                           rel="noopener noreferrer">
                                                                            <h4>{research.title}</h4>
                                                                        </a>
                                                                    </div>
                                                                </button>
                                                            </Col>
                                                        ))}
                                                    </Row>
                                                </div>
                                            </Tab.Pane>

                                            {/* Experience Tab */}
                                            <Tab.Pane eventKey="fourth">
                                                <div className="scrollable-projects">
                                                    <Row className="g-4">
                                                        {experience.map((exp, index) => (
                                                            <Col xs={12} sm={6} md={4} lg={3} key={index}>
                                                                <div className="proj-imgbx">
                                                                    <img
                                                                        src={(exp.imgUrl || "/assets/fallback-image/fallback-image.png")}
                                                                        alt={exp.title}
                                                                        onError={(e) => {
                                                                            e.target.onerror = null; // Prevent infinite loop
                                                                            e.target.src = process.env.PUBLIC_URL + "/assets/fallback-image/fallback-image.png"; // Fallback image
                                                                        }}
                                                                    />
                                                                    <div className="proj-txtx">
                                                                        <span>{exp.description}</span>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    className={`proj-btn ${!exp.link.trim() ? 'disabled' : ''}`}>
                                                                    <div className="col-title">
                                                                        <a href={exp.link.trim() || '#'}
                                                                           target="_blank"
                                                                           rel="noopener noreferrer">
                                                                            <h4>{exp.title}</h4>
                                                                        </a>
                                                                    </div>
                                                                </button>
                                                            </Col>
                                                        ))}
                                                    </Row>
                                                </div>
                                            </Tab.Pane>
                                        </Tab.Content>
                                    </Tab.Container>
                                </div>
                            )}
                        </TrackVisibility>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};
