import { useState, useEffect } from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import axios from "axios"; // Import axios for fetching the JSON data
import { useNavigate, useLocation } from "react-router-dom";

import navIcon1 from "../assets/img/nav-icon1.svg";
import navIcon2 from "../assets/img/nav-icon2.svg";
import navIcon4 from "../assets/img/nav-icon4.svg";

export const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [logoUrl, setLogoUrl] = useState(""); // State to store the logo URL

  useEffect(() => {
    // Fetch logo URL from the JSON
    const fetchLogoData = async () => {
      try {
        const response = await axios.get(
            "https://raw.githubusercontent.com/garvkumar68/Portfolio/json-data/logo.json"
        );
        setLogoUrl(response.data.logo_url); // Set the logo URL from the JSON
      } catch (error) {
        console.error("Error fetching logo data: ", error);
      }
    };

    fetchLogoData();

    // Scroll event handler
    const onScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const getActiveKey = () => {
    const path = location.pathname;
    if (path === "/") return "home";
    if (path === "/skills") return "skills";
    if (path === "/projects") return "projects";
    if (path === "/experience") return "experience";
    if (path === "/certifications") return "certifications";
    if (path === "/achievements") return "achievements";
    if (path === "/reachout") return "reachout";
    return "";
  };

  const activeLink = getActiveKey();

  return (
      <Navbar expand="lg" className={`navbar-custom ${scrolled ? "scrolled" : ""}`}>
        <Container>
          <Navbar.Brand onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
            {/* Use the dynamically loaded logo */}
            {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="navbar-logo" />
            ) : (
                <p>Loading...</p> // Display loading text if the logo URL is not yet loaded
            )}
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav">
            <span className="navbar-toggler-icon"></span>
          </Navbar.Toggle>
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto align-items-center">
              <Nav.Link
                  className={activeLink === "home" ? "active navbar-link" : "navbar-link"}
                  onClick={() => navigate("/")}
              >
                Home
              </Nav.Link>
              <Nav.Link
                  className={activeLink === "skills" ? "active navbar-link" : "navbar-link"}
                  onClick={() => navigate("/skills")}
              >
                Skills
              </Nav.Link>
              <Nav.Link
                  className={activeLink === "projects" ? "active navbar-link" : "navbar-link"}
                  onClick={() => navigate("/projects")}
              >
                Projects
              </Nav.Link>
              <Nav.Link
                  className={activeLink === "experience" ? "active navbar-link" : "navbar-link"}
                  onClick={() => navigate("/experience")}
              >
                Experience
              </Nav.Link>
              <Nav.Link
                  className={activeLink === "certifications" ? "active navbar-link" : "navbar-link"}
                  onClick={() => navigate("/certifications")}
              >
                Certifications
              </Nav.Link>
              <Nav.Link
                  className={activeLink === "achievements" ? "active navbar-link" : "navbar-link"}
                  onClick={() => navigate("/achievements")}
              >
                Achievements
              </Nav.Link>
            </Nav>
            <span className="navbar-text">
            <div className="social-icon">
              <a href="https://www.linkedin.com/in/garv-kumar-aa09b0213" target="_blank" rel="noopener noreferrer">
                <img src={navIcon1} alt="LinkedIn" className="social-icon-img" />
              </a>
              <a href="https://github.com/garvkumar68" target="_blank" rel="noopener noreferrer">
                <img src={navIcon2} alt="GitHub" className="social-icon-img" />
              </a>
              <a href="mailto:garvkumar68@gmail.com" target="_blank" rel="noopener noreferrer">
                <img src={navIcon4} alt="Email" className="social-icon-img" />
              </a>
            </div>
            <button
                className={`vvd ${activeLink === "reachout" ? "active" : ""}`}
                onClick={() => navigate("/reachout")}
            >
              <span>Reach Out</span>
            </button>
          </span>
          </Navbar.Collapse>
        </Container>
      </Navbar>
  );
};
