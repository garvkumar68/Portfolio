import { Container, Row, Col } from "react-bootstrap";
import 'animate.css';
import TrackVisibility from 'react-on-screen';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export const Projects = () => {
    const [projects, setProjects] = useState([]);

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
                                        Click on any project title to view details or source code.
                                    </p>
                                    <div className="divided-grid">
                                        <Row className="g-4 justify-content-start">
                                            {projects.map((project, index) => (
                                                <Col xs={12} sm={6} md={4} lg={3} key={index} className="d-flex align-items-stretch">
                                                     <div className="divided-card">
                                                         <div className="proj-imgbx">
                                                             <img
                                                                 src={(project.imgUrl) || "/assets/fallback-image/fallback-image.png"}
                                                                 alt={project.title}
                                                                 onError={(e) => {
                                                                     e.target.onerror = null;
                                                                     e.target.src = process.env.PUBLIC_URL + "/assets/fallback-image/fallback-image.png";
                                                                 }}
                                                             />
                                                             <div className="proj-txtx">
                                                                 <span>{project.description}</span>
                                                             </div>
                                                         </div>
                                                         <div className="card-body">
                                                             {project.link && project.link.trim() ? (
                                                                 <a href={project.link.trim()} target="_blank" rel="noopener noreferrer" className="card-title-link">
                                                                     <h4 className="card-title">{project.title}</h4>
                                                                 </a>
                                                             ) : (
                                                                 <h4 className="card-title">{project.title}</h4>
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
