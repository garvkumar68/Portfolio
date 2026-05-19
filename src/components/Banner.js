import { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { ArrowRightCircle } from "react-bootstrap-icons";
import "animate.css";
import TrackVisibility from "react-on-screen";
import axios from "axios";

export const Banner = () => {
  const [loopNum, setLoopNum] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [text, setText] = useState("");
  const [delta, setDelta] = useState(60); // Starting typing speed
  // eslint-disable-next-line
  const [index, setIndex] = useState(1);
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

  useEffect(() => {
    if (data && data.titles && data.titles.length > 0) {
      const ticker = setInterval(() => {
        tick();
      }, delta);

      return () => clearInterval(ticker);
    }
  },  // eslint-disable-next-line
    [text, delta, data.titles]); // Dependency on text, delta, and titles

  const tick = () => {
    if (!data || !data.titles || data.titles.length === 0) {
      return; // Prevent accessing data if titles are not available
    }

    const i = loopNum % data.titles.length;
    const fullText = data.titles[i];
    const updatedText = isDeleting
      ? fullText.substring(0, text.length - 1)
      : fullText.substring(0, text.length + 1);

    setText(updatedText);

    if (!isDeleting && updatedText === fullText) {
      setIsDeleting(true);
      setDelta(2500); // Pause for 2.5 seconds at the end of typing
      setIndex((prevIndex) => prevIndex - 1);
    } else if (isDeleting && updatedText === "") {
      setIsDeleting(false);
      setLoopNum(loopNum + 1);
      setDelta(400); // Brief pause before starting the next word
      setIndex(1);
    } else {
      setDelta(isDeleting ? 30 : 60); // Deleting is super fast (30ms), typing is fast (60ms)
    }
  };

  // Render Loading or Content
  return (
    <section className="banner" id="home">
      <Container>
        <Row className="align-items-center">
          <Col xs={12} md={6} xl={7}>
            <TrackVisibility>
              {({ isVisible }) => (
                <div className={isVisible ? "animate__animated animate__fadeIn" : ""}>
                  <span className="tagline">From Data to Solutions with AI</span>
                  <h1 className="display-4">I'm <span style={{ color: 'var(--accent-color, #57ff8c)' }}>Garv Kumar</span></h1>
                  <div className="typing-effect">
                    <span
                      className="txt-rotate"
                      data-period="500"
                      data-rotate='["Software Engineer","Computer Vision Engineer", "Data Analyst", "IoT Engineer","Business Analyst", "ML Engineer", "AutoCad Fusion 360" ]'
                      style={{ color: '#D3D3D3' }}  /* Inline style to change text color */
                    >
                      <span className="wrap">{text}</span>
                    </span>
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
          <Col xs={12} md={6} xl={5} className="d-none d-md-block">
            <TrackVisibility>
              {({ isVisible }) => (
                <div className={isVisible ? "animate__animated animate__fadeIn" : ""} style={{ height: '400px', width: '100%' }}>
                  <div id="blackhole-placeholder" style={{ width: '100%', height: '100%' }}></div>
                </div>
              )}
            </TrackVisibility>
          </Col>
        </Row>
      </Container>
    </section>
  );
};
