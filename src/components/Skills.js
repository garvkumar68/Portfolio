import { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import axios from "axios";
import 'animate.css';

export const Skills = () => {
  const [skillsCategories, setSkillsCategories] = useState([]); // State for categorized skills data

  // Fetch skills data from GitHub
  useEffect(() => {
    const fetchSkillsData = async () => {
      try {
        const url = "https://raw.githubusercontent.com/garvkumar68/Portfolio/json-data/skillsData.json";
        const response = await axios.get(url);
        
        // Handle categorized layout, fallback to legacy flat structure if needed
        if (response.data.categories) {
          setSkillsCategories(response.data.categories);
        } else if (response.data.skills) {
          setSkillsCategories([
            {
              title: "Technical Expertise",
              skills: response.data.skills
            }
          ]);
        }
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
          {skillsCategories.map((category, catIndex) => (
            <div key={catIndex} className="skills-category-group mb-5">
              <h3 className="skills-category-title animate__animated animate__fadeIn">
                {category.title}
              </h3>
              <Row className="g-3">
                {category.skills.map((skill, index) => (
                  <Col 
                    xs={12} 
                    md={6} 
                    lg={4} 
                    key={index} 
                    className="animate__animated animate__fadeInUp" 
                    style={{ animationDelay: `${index * 0.03}s` }}
                  >
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
          ))}
        </div>
      </Container>
    </section>
  );
};
