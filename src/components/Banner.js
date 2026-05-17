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
  const [delta, setDelta] = useState(150); // Typing speed
  // eslint-disable-next-line
  const [index, setIndex] = useState(1);
  const [data, setData] = useState({}); // State for banner data
  const [loading, setLoading] = useState(true); // Loading state for the data

  // Fetch Banner Data
  useEffect(() => {
    const fetchBannerData = async () => {
      try {
        // Fetch the BannerDetails.json file directly from the raw URL
        const url = "https://raw.githubusercontent.com/garvkumar68/Portfolio/json-data/BannerDetails.json";
        const response = await axios.get(url);

        setData(response.data); // Set the state with fetched data
        setLoading(false); // Set loading to false once data is fetched
      } catch (err) {
        console.error('Error fetching data from GitHub', err);
        setLoading(false); // Handle error and stop loading
      }
    };

    fetchBannerData();
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
      setIndex((prevIndex) => prevIndex - 1);
    } else if (isDeleting && updatedText === "") {
      setIsDeleting(false);
      setLoopNum(loopNum + 1);
      setIndex(1);
    }

    setDelta(isDeleting ? 100 : 150); // Faster typing when deleting
  };

  // Create Stars in the Background
  const createStars = () => {
    const starField = document.querySelector(".starfield");
    if (!starField) return;

    for (let i = 0; i < 100; i++) {
      const star = document.createElement("div");
      star.className = "star";
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`; // Spread stars vertically
      star.style.animationDelay = `${Math.random() * 5}s`;
      starField.appendChild(star);
    }
  };

  // Initialize stars on mount
  useEffect(() => {
    createStars();
  }, []);

  // Render Loading or Content
  return (
      <section className="banner" id="home">
        <Container>
          <Row className="align-items-center">
            <Col xs={12} md={6} xl={7}>
              <TrackVisibility>
                {({ isVisible }) => (
                    <div className={isVisible ? "animate__animated animate__fadeIn" : ""}>
                      <span className="tagline">Let's Automate the Future</span>
                      <h1 className="display-4">Hi! I'm Garv Kumar</h1>
                      <div className="typing-effect">
                    <span
                        className="txt-rotate"
                        dataPeriod="500"
                        data-rotate='["Software Engineer","Computer Vision Engineer", "Data Analyst", "IoT Engineer","Business Analyst", "ML Engineer", "AutoCad Fusion 360" ]'
                        style={{ color: '#D3D3D3' }}  /* Inline style to change text color */
                    >
                      <span className="wrap">{text}</span>
                    </span>
                      </div>
                      <p className="lead">{loading ? "Loading..." : data.description}</p>
                      <button
                          className="btn btn-outline-light btn-lg"
                          onClick={() => window.open('https://www.linkedin.com/in/garv-kumar-aa09b0213', '_blank')}
                      >
                        Let's Connect <ArrowRightCircle size={25} />
                      </button>
                    </div>
                )}
              </TrackVisibility>
            </Col>
            <Col xs={12} md={6} xl={5}>
              <TrackVisibility>
                {({ isVisible }) => (
                    <div className={isVisible ? "animate__animated animate__fadeIn" : ""}>
                      <img src={data.imgUrl} alt="Header Img" className="img-fluid" />
                    </div>
                )}
              </TrackVisibility>
            </Col>
          </Row>
        </Container>
        <div className="starfield"></div>
      </section>
  );
};
