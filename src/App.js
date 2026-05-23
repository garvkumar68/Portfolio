import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useMediaQuery } from 'react-responsive';
import { NavBar } from "./components/NavBar";
import { Banner } from "./components/Banner";
import { Skills } from "./components/Skills";
import { Projects } from "./components/Projects";
import { Experience } from "./components/Experience";
import { Achievements } from "./components/Achievements";
import { Certifications } from "./components/Certifications";
import { Contact } from "./components/Contact";
import { HexagonBackground } from "./components/HexagonBackground";
import { MinimalistStarfield } from "./components/MinimalistStarfield";
import { SideNav } from "./components/SideNav";
import AdminPage from "./components/AdminPage";
import { Toaster } from "sonner";
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
    setTimeout(() => setShowTopGlow(false), 700);
  };

  const triggerBottomGlow = () => {
    setShowBottomGlow(true);
    setTimeout(() => setShowBottomGlow(false), 700);
  };

  useEffect(() => {
    let isNavigating = false;
    let timeout;
    let touchStartY = 0;
    let touchEndY = 0;
    
    // Trackpad and scroll boundary cooldown tracking
    let isAtBoundary = false;
    let boundaryHitTime = 0;
    

    
    // Mobile gesture tracking
    let touchStartedAtBoundary = false;
    let touchStartedAtTop = false;
    let touchStartedAtBottom = false;

    const navigateToNext = (currentIndex) => {
      if (currentIndex !== -1 && currentIndex < routesOrder.length - 1) {
        isNavigating = true;
        // Lock body and html scroll immediately to absorb all precision mouse/trackpad inertia
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        
        // Wait 250ms to let the green boundary glow completely fill and shine before the route slides
        timeout = setTimeout(() => {
          navigate(routesOrder[currentIndex + 1]);
          timeout = setTimeout(() => { 
            isNavigating = false;
            // Cleanly restore scroll functionality once transition is complete
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
          }, 1000);
        }, 250);
      }
    };

    const navigateToPrev = (currentIndex) => {
      if (currentIndex > 0) {
        isNavigating = true;
        // Lock body and html scroll immediately to absorb all precision mouse/trackpad inertia
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        
        // Wait 250ms to let the green boundary glow completely fill and shine before the route slides
        timeout = setTimeout(() => {
          navigate(routesOrder[currentIndex - 1]);
          timeout = setTimeout(() => { 
            isNavigating = false;
            // Cleanly restore scroll functionality once transition is complete
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
          }, 1000);
        }, 250);
      }
    };

    const handleWheel = (e) => {
      if (isNavigating) return;

      const currentPath = location.pathname;
      const currentIndex = routesOrder.indexOf(currentPath);

      const isAtTop = window.scrollY <= 5;
      const isAtBottom = Math.abs((window.innerHeight + window.scrollY) - document.documentElement.scrollHeight) <= 5;

      const now = Date.now();

      // Track boundary arrival state
      if (isAtTop || isAtBottom) {
        if (!isAtBoundary) {
          isAtBoundary = true;
          boundaryHitTime = now;
        }
      } else {
        isAtBoundary = false;
        boundaryHitTime = 0;
      }

      // Safeguard: when first arriving at the top or bottom of a page, absorb inertia for 500ms 
      // before allowing any transitions. This lets users scroll to the bottom of the content safely!
      if (isAtBoundary && (now - boundaryHitTime < 500)) {
        return;
      }

      // Deliberate mouse wheel scroll threshold (100px) to prevent accidental quick transitions
      if (e.deltaY > 100 && isAtBottom) {
        triggerBottomGlow();
        navigateToNext(currentIndex);
      } else if (e.deltaY < -100 && isAtTop) {
        triggerTopGlow();
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
      
      // Ensure scroll is fully restored on unmount/cleanup
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
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
    <div className="animate__animated animate__fadeIn" style={{ position: 'relative' }}>
      <HexagonBackground />
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

        <Toaster theme="dark" position="top-right" />
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
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
