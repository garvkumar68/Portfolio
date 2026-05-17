import { useState, useEffect } from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import axios from "axios"; // Import axios for fetching the JSON data

import navIcon1 from "../assets/img/nav-icon1.svg";
import navIcon2 from "../assets/img/nav-icon2.svg";
import navIcon4 from "../assets/img/nav-icon4.svg";

export const NavBar = () => {
  const [activeLink, setActiveLink] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const [contactInView, setContactInView] = useState(false);
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

      const sections = ["home", "skills", "projects", "connect"];
      let currentSection = "";

      sections.forEach((section) => {
        const element = document.getElementById(section);
        if (element && window.scrollY >= element.offsetTop - 100) {
          currentSection = section;
        }
      });

      setActiveLink(currentSection);

      const contactSection = document.getElementById("connect");
      if (contactSection) {
        const rect = contactSection.getBoundingClientRect();
        if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
          setContactInView(true);
        } else {
          setContactInView(false);
        }
      }
    };

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleScrollToSection = (sectionId) => {
    setActiveLink(sectionId);
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
      <Navbar expand="md" className={`navbar-custom ${scrolled ? "scrolled" : ""}`}>
        <Container>
          <Navbar.Brand href="/">
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
            <Nav className="ms-auto">
              <Nav.Link
                  className={activeLink === "home" ? "active navbar-link" : "navbar-link"}
                  onClick={() => handleScrollToSection("home")}
              >
                Home
              </Nav.Link>
              <Nav.Link
                  className={activeLink === "skills" ? "active navbar-link" : "navbar-link"}
                  onClick={() => handleScrollToSection("skills")}
              >
                Skills
              </Nav.Link>
              <Nav.Link
                  className={activeLink === "projects" ? "active navbar-link" : "navbar-link"}
                  onClick={() => handleScrollToSection("projects")}
              >
                Contributions
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
                className={`vvd ${contactInView ? "active" : ""}`}
                onClick={() => handleScrollToSection("connect")}
            >
              <span>Reach Out</span>
            </button>
          </span>
          </Navbar.Collapse>
        </Container>
      </Navbar>
  );
};
