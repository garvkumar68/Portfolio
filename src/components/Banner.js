import { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { ArrowRightCircle } from "react-bootstrap-icons";
import "animate.css";
import TrackVisibility from "react-on-screen";
import axios from "axios";
import { FlipCard } from "./FlipCard";
import { DiaTextReveal } from "./DiaTextReveal";

export const Banner = () => {
  const [data, setData] = useState({}); // State for banner data
  const [loading, setLoading] = useState(true); // Loading state for the data
  const [profLinks, setProfLinks] = useState({}); // State for Resume and Visume links

  // Fetch Banner Data and Professional Links
  useEffect(() => {
    const fetchBannerData = async () => {
      try {
        const url = "https://raw.githubusercontent.com/garvkumar68/Portfolio/json-data/BannerDetails.json";
        const response = await axios.get(url);
        setData(response.data); // Set the state with fetched data
        setLoading(false); // Set loading to false once data is fetched
      } catch (err) {
        console.error('Error fetching data from GitHub', err);
        setLoading(false);
      }
    };

    const fetchProfessionalLinks = async () => {
      try {
        const url = "https://raw.githubusercontent.com/garvkumar68/Portfolio/json-data/professionalLinks.json";
        const response = await axios.get(url);
        setProfLinks(response.data);
      } catch (err) {
        console.error('Error fetching professional links from GitHub', err);
      }
    };

    fetchBannerData();
    fetchProfessionalLinks();
  }, []); // Empty dependency array to fetch data only once when the component mounts

  // Render Loading or Content
  return (
    <section className="banner" id="home">
      <Container>
        <Row className="align-items-center">
          <Col xs={12} md={6} xl={7}>
            <TrackVisibility>
              {({ isVisible }) => (
                <div className={isVisible ? "animate__animated animate__fadeIn" : ""}>
                  <h1 className="display-4" style={{ textShadow: '0 0 15px rgba(255, 255, 255, 0.2)' }}><span style={{ color: '#00dfa2', textShadow: '0 0 15px rgba(0, 223, 162, 0.4)' }}>Garv Kumar</span></h1>
                  <div className="typing-effect" style={{ fontSize: '24px', fontWeight: '600', minHeight: '44px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                    I'm <DiaTextReveal
                      text={data.titles && data.titles.length > 0 ? data.titles : ["Software Engineer", "Computer Vision Engineer", "Data Analyst", "IoT Engineer", "Business Analyst", "ML Engineer", "AutoCad Fusion 360"]}
                      colors={["#A97CF8", "#F38CB8", "#FDCC92"]}
                      repeat={true}
                      repeatDelay={4.0}
                      duration={1.5}
                      textColor="#00dfa2"
                    />
                  </div>
                  <p className="lead">{loading ? "Loading..." : data.description}</p>
                  <div className="banner-buttons d-flex align-items-center flex-wrap gap-3 mt-4">
                    <button
                      className="btn btn-outline-light btn-lg"
                      onClick={() => window.open(profLinks.resume_PDF || '#', '_blank')}
                      disabled={!profLinks.resume_PDF}
                    >
                      Resume
                    </button>
                    <button
                      className="btn btn-outline-light btn-lg"
                      onClick={() => window.open(profLinks.visume_video ? profLinks.visume_video.replace('/embed/', '/watch?v=') : '#', '_blank')}
                      disabled={!profLinks.visume_video}
                    >
                      Visume
                    </button>
                    <button
                      className="btn btn-outline-light btn-lg"
                      onClick={() => window.open('https://www.linkedin.com/in/garv-kumar-aa09b0213', '_blank')}
                    >
                      Let's Connect <ArrowRightCircle size={25} />
                    </button>
                  </div>
                </div>
              )}
            </TrackVisibility>
          </Col>
          <Col xs={12} md={6} xl={5} className="mt-5 mt-md-0 d-flex justify-content-center">
            <TrackVisibility>
              {({ isVisible }) => (
                <div
                  className={isVisible ? "animate__animated animate__fadeIn" : ""}
                  style={{
                    height: '420px',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FlipCard />
                </div>
              )}
            </TrackVisibility>
          </Col>
        </Row>
      </Container>
    </section>
  );
};
