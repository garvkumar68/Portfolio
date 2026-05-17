import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useMediaQuery } from 'react-responsive';
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
import { useEffect, useState } from "react";

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
  const isMobile = useMediaQuery({ maxWidth: 768 });

  // Custom overscroll glows matching the green theme color (#00dfa2 / #57ff8c)
  const [showTopGlow, setShowTopGlow] = useState(false);
  const [showBottomGlow, setShowBottomGlow] = useState(false);

  const triggerTopGlow = () => {
    setShowTopGlow(true);
    setTimeout(() => setShowTopGlow(false), 500);
  };

  const triggerBottomGlow = () => {
    setShowBottomGlow(true);
    setTimeout(() => setShowBottomGlow(false), 500);
  };

  useEffect(() => {
    let isNavigating = false;
    let timeout;
    let touchStartY = 0;
    let touchEndY = 0;
    
    // Trackpad inertia absorption
    let isAtBoundary = false;
    let boundaryHitTime = 0;
    
    // Mobile gesture tracking
    let touchStartedAtBoundary = false;
    let touchStartedAtTop = false;
    let touchStartedAtBottom = false;

    const navigateToNext = (currentIndex) => {
      if (currentIndex !== -1 && currentIndex < routesOrder.length - 1) {
        isNavigating = true;
        navigate(routesOrder[currentIndex + 1]);
        timeout = setTimeout(() => { isNavigating = false; }, 800);
      }
    };

    const navigateToPrev = (currentIndex) => {
      if (currentIndex > 0) {
        isNavigating = true;
        navigate(routesOrder[currentIndex - 1]);
        timeout = setTimeout(() => { isNavigating = false; }, 800);
      }
    };

    const handleWheel = (e) => {
      if (isNavigating) return;

      const currentPath = location.pathname;
      const currentIndex = routesOrder.indexOf(currentPath);

      const isAtTop = window.scrollY <= 5;
      const isAtBottom = Math.abs((window.innerHeight + window.scrollY) - document.documentElement.scrollHeight) <= 5;

      const now = Date.now();
      
      // Track boundary hit and duration
      if (isAtTop || isAtBottom) {
        if (!isAtBoundary) {
          isAtBoundary = true;
          boundaryHitTime = now;
        }
      } else {
        isAtBoundary = false;
        boundaryHitTime = 0;
      }

      // Visual flash glow bar when trying to scroll past boundaries
      if (e.deltaY < 0 && isAtTop) {
        triggerTopGlow();
      } else if (e.deltaY > 0 && isAtBottom) {
        triggerBottomGlow();
      }

      // Safeguard against trackpad scroll inertia page-jumping
      const timeSinceBoundaryHit = now - boundaryHitTime;
      if (isAtBoundary && timeSinceBoundaryHit < 400) {
        return; // Ignore quick/inertial events
      }

      // Deliberate mouse wheel scroll threshold (60px)
      if (e.deltaY > 60 && isAtBottom) {
        navigateToNext(currentIndex);
      } else if (e.deltaY < -60 && isAtTop) {
        navigateToPrev(currentIndex);
      }
    };

    const handleTouchStart = (e) => {
      const isAtTop = window.scrollY <= 5;
      const isAtBottom = Math.abs((window.innerHeight + window.scrollY) - document.documentElement.scrollHeight) <= 5;
      
      touchStartedAtTop = isAtTop;
      touchStartedAtBottom = isAtBottom;
      touchStartedAtBoundary = isAtTop || isAtBottom;
      
      touchStartY = e.touches[0].clientY;
      touchEndY = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      touchEndY = e.touches[0].clientY;
      
      // Show dynamic boundary glow while dragging finger
      if (touchStartedAtBoundary) {
        const deltaY = touchStartY - touchEndY;
        if (deltaY < -20 && touchStartedAtTop) {
          setShowTopGlow(true);
        } else if (deltaY > 20 && touchStartedAtBottom) {
          setShowBottomGlow(true);
        }
      }
    };

    const handleTouchEnd = () => {
      setShowTopGlow(false);
      setShowBottomGlow(false);

      if (isNavigating) return;
      
      // If the swipe started in the middle of a scrollable page, let it scroll normally!
      if (!touchStartedAtBoundary) return;
      if (!touchStartY || !touchEndY) return;

      const currentPath = location.pathname;
      const currentIndex = routesOrder.indexOf(currentPath);

      const deltaY = touchStartY - touchEndY; // positive = swiped up (go next)
      
      // High deliberate threshold for mobile gestures (130px) to prevent accidental swipe transitions
      const swipeThreshold = isMobile ? 130 : 100;

      if (deltaY > swipeThreshold && touchStartedAtBottom) {
        navigateToNext(currentIndex);
      } else if (deltaY < -swipeThreshold && touchStartedAtTop) {
        navigateToPrev(currentIndex);
      }

      touchStartY = 0;
      touchEndY = 0;
      touchStartedAtBoundary = false;
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      if (timeout) clearTimeout(timeout);
    };
  }, [location.pathname, navigate, isMobile]);

  return (
    <>
      <div className={`overscroll-glow-bar top-glow ${showTopGlow ? 'active' : ''}`} />
      <div className={`overscroll-glow-bar bottom-glow ${showBottomGlow ? 'active' : ''}`} />
    </>
  );
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
