import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
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
import { SideNav } from "./components/SideNav";
import { useEffect } from "react";

// Scroll to Top on route change helper
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Global Scroll Navigator
const routesOrder = [
  '/',
  '/skills',
  '/projects',
  '/experience',
  '/certifications',
  '/achievements',
  '/reachout'
];

const ScrollNavigator = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let isNavigating = false;
    let timeout;

    const handleWheel = (e) => {
      if (isNavigating) return;

      const currentPath = location.pathname;
      const currentIndex = routesOrder.indexOf(currentPath);

      // Add a small tolerance for scroll height comparison
      const isAtTop = window.scrollY <= 2;
      const isAtBottom = Math.abs((window.innerHeight + window.scrollY) - document.documentElement.scrollHeight) <= 2;

      // Ensure a reasonable scroll delta threshold
      if (e.deltaY > 30 && isAtBottom) {
        // Scrolling down and at the bottom of the page
        if (currentIndex !== -1 && currentIndex < routesOrder.length - 1) {
          isNavigating = true;
          navigate(routesOrder[currentIndex + 1]);
          timeout = setTimeout(() => { isNavigating = false; }, 800); // Lock navigation for a short duration
        }
      } else if (e.deltaY < -30 && isAtTop) {
        // Scrolling up and at the top of the page
        if (currentIndex > 0) {
          isNavigating = true;
          navigate(routesOrder[currentIndex - 1]);
          timeout = setTimeout(() => { isNavigating = false; }, 800); // Lock navigation for a short duration
        }
      }
    };

    window.addEventListener('wheel', handleWheel);
    return () => {
      window.removeEventListener('wheel', handleWheel);
      if (timeout) clearTimeout(timeout);
    };
  }, [location.pathname, navigate]);

  return null;
};

// Home Page Component (Main section only)
const HomePage = () => {
  return (
    <div className="animate__animated animate__fadeIn">
      <NavBar />
      <Banner />
    </div>
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
      <ScrollNavigator />
      <div className="App">
        <BlackHole targetId="blackhole-placeholder" />
        <MinimalistStarfield />
        <SideNav />
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
