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

  // Helper to format index to double digits (e.g. 01, 02)
  const formatIndex = (index) => {
    return String(index + 1).padStart(2, '0');
  };

  // Helper to transform titles to standard cockpit-HUD uppercase with clean spacing
  const formatHudTitle = (title) => {
    return title.toUpperCase().replace(/&/g, 'AND').replace(/\s+/g, ' ').trim();
  };

  const numSegments = 14; // Number of blocks in our segmented HUD progress bar

  return (
    <section className="skills-section" id="skills-section">
      <Container>
        <div className="skills-header animate__animated animate__fadeInDown">
          <h2 className="skills-title">Skills</h2>
          <p className="skills-subtitle">Expertise developed across AI, ML, and emerging tech.</p>
        </div>

        <Row className="g-4 skills-hud-grid">
          {skillsCategories.map((category, catIndex) => (
            <Col 
              xs={12} 
              md={6} 
              lg={4} 
              key={catIndex} 
              className="skills-category-col mb-4 animate__animated animate__fadeInUp"
              style={{ animationDelay: `${catIndex * 0.05}s` }}
            >
              <div className="skills-hud-column">
                <div className="skills-hud-header">
                  <span className="skills-hud-index">{formatIndex(catIndex)}</span>
                  <h3 className="skills-hud-title">{formatHudTitle(category.title)}</h3>
                </div>
                
                <div className="skills-hud-list">
                  {category.skills.map((skill, index) => {
                    const filledSegments = Math.round((skill.progress / 100) * numSegments);
                    return (
                      <div key={index} className="skill-hud-item">
                        <div className="skill-hud-info">
                          <span className="skill-hud-name">{skill.name.toUpperCase()}</span>
                          <span className="skill-hud-percentage">{skill.progress}%</span>
                        </div>
                        <div className="skill-hud-bar">
                          {Array.from({ length: numSegments }).map((_, i) => (
                            <div 
                              key={i} 
                              className={`skill-hud-segment ${i < filledSegments ? 'filled' : ''}`}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};
