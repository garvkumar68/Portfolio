import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { HashRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { NavBar } from "./components/NavBar";
import { Banner } from "./components/Banner";
import { Skills } from "./components/Skills";
import { Projects } from "./components/Projects";
import { Contact } from "./components/Contact";
import { ProfessionalSection } from './components/ProfessionalSection';
import { Footer } from "./components/Footer";
import { BlackHole } from "./components/BlackHole";
import { useEffect } from "react";

// Home Page Component
const HomePage = () => {
  return (
    <>
      <BlackHole targetId="blackhole-placeholder" />
      <NavBar />
      <Banner />
    </>
  );
};

// Info Page Component
const InfoPage = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150); // A small delay to guarantee rendering is done
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return (
    <>
      <NavBar />
      <Skills />
      <Projects />
      <Contact />
      <ProfessionalSection />
      <Footer />
    </>
  );
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/info" element={<InfoPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
