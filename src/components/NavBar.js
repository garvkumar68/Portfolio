import { useState, useEffect } from "react";
import { Navbar, Container, Nav } from "react-bootstrap";
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
  const [isOpen, setIsOpen] = useState(false); // Mobile menu toggle state

  const pathname = location.pathname;
  const isHome = pathname === "/Portfolio" || pathname === "/Portfolio/" || pathname === "/" || pathname.endsWith("/Portfolio") || pathname.endsWith("/Portfolio/");
  const isNavbarScrolled = !isHome || scrolled;

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

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleNavClick = (e, path) => {
    e.preventDefault();
    setIsOpen(false);
    navigate(path);
  };

  return (
      <Navbar expand="lg" className={`navbar-custom ${isNavbarScrolled ? "scrolled" : ""}`}>
        <Container fluid className="d-flex justify-content-between align-items-center position-relative ps-1 pe-4 ps-md-2 pe-md-5">
          <Navbar.Brand onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
            {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="navbar-logo" />
            ) : (
                <p style={{ color: "#fff", margin: 0 }}>Garv Kumar</p>
            )}
          </Navbar.Brand>

          {/* Desktop/Tablet standard Bootstrap Collapse */}
          <Navbar.Collapse id="basic-navbar-nav" className="d-none d-lg-flex">
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

          {/* Custom Hamburger Toggle Button (Visible on mobile/tablet) */}
          <button
              className={`custom-menu-toggle ${isOpen ? 'open' : ''} d-lg-none`}
              onClick={handleToggle}
              aria-label="Toggle Navigation"
          >
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>

          {/* Immersive Full-Screen Mobile Menu Overlay (Visible on mobile/tablet) */}
          <div className={`mobile-menu-overlay ${isOpen ? 'show' : ''}`}>
            <div className="mobile-menu-header">
              <div className="mobile-avatar-container">
                {logoUrl && <img src={logoUrl} alt="Avatar" className="mobile-menu-avatar" />}
              </div>
              <button className="mobile-menu-close" onClick={handleToggle} aria-label="Close Menu">
                <span className="close-icon">&times;</span>
              </button>
            </div>

            <div className="mobile-menu-body">
              <div className="mobile-nav-links">
                <a href="/" className={`mobile-nav-link ${activeLink === "home" ? "active" : ""}`} onClick={(e) => handleNavClick(e, "/")}>
                  Home
                </a>
                <a href="/skills" className={`mobile-nav-link ${activeLink === "skills" ? "active" : ""}`} onClick={(e) => handleNavClick(e, "/skills")}>
                  Skills
                </a>
                <a href="/projects" className={`mobile-nav-link ${activeLink === "projects" ? "active" : ""}`} onClick={(e) => handleNavClick(e, "/projects")}>
                  Projects
                </a>
                <a href="/experience" className={`mobile-nav-link ${activeLink === "experience" ? "active" : ""}`} onClick={(e) => handleNavClick(e, "/experience")}>
                  Experience
                </a>
                <a href="/certifications" className={`mobile-nav-link ${activeLink === "certifications" ? "active" : ""}`} onClick={(e) => handleNavClick(e, "/certifications")}>
                  Certifications
                </a>
                <a href="/achievements" className={`mobile-nav-link ${activeLink === "achievements" ? "active" : ""}`} onClick={(e) => handleNavClick(e, "/achievements")}>
                  Achievements
                </a>
                <a href="/reachout" className={`mobile-nav-link ${activeLink === "reachout" ? "active" : ""}`} onClick={(e) => handleNavClick(e, "/reachout")}>
                  Contact
                </a>
              </div>

              <div className="mobile-menu-socials">
                <a href="https://www.linkedin.com/in/garv-kumar-aa09b0213" target="_blank" rel="noopener noreferrer">
                  <img src={navIcon1} alt="LinkedIn" />
                </a>
                <a href="https://github.com/garvkumar68" target="_blank" rel="noopener noreferrer">
                  <img src={navIcon2} alt="GitHub" />
                </a>
                <a href="mailto:garvkumar68@gmail.com" target="_blank" rel="noopener noreferrer">
                  <img src={navIcon4} alt="Email" />
                </a>
              </div>
            </div>
          </div>
        </Container>
      </Navbar>
  );
};
