import { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import axios from "axios";
import 'animate.css';

export const Skills = () => {
  const [skills, setSkills] = useState([]); // State for skills data

  // Fetch skills data from GitHub
  useEffect(() => {
    const fetchSkillsData = async () => {
      try {
        const url = "https://raw.githubusercontent.com/garvkumar68/Portfolio/json-data/skillsData.json";
        const response = await axios.get(url);
        setSkills(response.data.skills);
      } catch (err) {
        console.error('Error fetching skills from GitHub', err);
      }
    };

    fetchSkillsData();
  }, []);

  return (
    <section className="skills-section" id="skills-section">
      <Container>
        <div className="skills-header animate__animated animate__fadeInDown">
          <h2 className="skills-title">Skills</h2>
          <p className="skills-subtitle">Expertise developed across AI, ML, and emerging tech.</p>
        </div>

        <div className="skills-grid-container">
          <Row className="g-4">
            {skills.map((skill, index) => (
              <Col xs={12} md={6} lg={4} key={index} className="animate__animated animate__fadeInUp" style={{ animationDelay: `${index * 0.05}s` }}>
                <div className="skill-pill-card">
                  <div className="skill-pill-info">
                    <span className="skill-pill-name">{skill.name}</span>
                    <span className="skill-pill-percentage">{skill.progress}%</span>
                  </div>
                  <div className="skill-pill-bar-track">
                    <div 
                      className="skill-pill-bar-fill" 
                      style={{ width: `${skill.progress}%` }}
                    />
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </Container>
    </section>
  );
};
