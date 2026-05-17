import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { NavBar } from "./components/NavBar";
import { Banner } from "./components/Banner";
import { Skills } from "./components/Skills";
import { Projects } from "./components/Projects";
import { Experience } from "./components/Experience";
import { Achievements } from "./components/Achievements";
import { Certifications } from "./components/Certifications";
import { Contact } from "./components/Contact";
import { BlackHole } from "./components/BlackHole";
import { MinimalistStarfield } from "./components/MinimalistStarfield";
import { useEffect } from "react";

// Scroll to Top on route change helper
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Home Page Component (Main section only)
const HomePage = () => {
  return (
    <>
      <NavBar />
      <Banner />
    </>
  );
};

// Sub-pages with layout wrapper to prevent header overlap
const SkillsPage = () => (
  <div className="page-container animate__animated animate__fadeIn">
    <NavBar />
    <Skills />
  </div>
);

const ProjectsPage = () => (
  <div className="page-container animate__animated animate__fadeIn">
    <NavBar />
    <Projects />
  </div>
);

const ExperiencePage = () => (
  <div className="page-container animate__animated animate__fadeIn">
    <NavBar />
    <Experience />
  </div>
);

const CertificationsPage = () => (
  <div className="page-container animate__animated animate__fadeIn">
    <NavBar />
    <Certifications />
  </div>
);

const AchievementsPage = () => (
  <div className="page-container animate__animated animate__fadeIn">
    <NavBar />
    <Achievements />
  </div>
);

const ReachoutPage = () => (
  <div className="page-container animate__animated animate__fadeIn">
    <NavBar />
    <Contact />
  </div>
);

function App() {
  return (
    <Router basename="/Portfolio">
      <ScrollToTop />
      <div className="App">
        <BlackHole targetId="blackhole-placeholder" />
        <MinimalistStarfield />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/skills" element={<SkillsPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/experience" element={<ExperiencePage />} />
          <Route path="/certifications" element={<CertificationsPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/reachout" element={<ReachoutPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
