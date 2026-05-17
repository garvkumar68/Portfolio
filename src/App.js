import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { NavBar } from "./components/NavBar";
import { Banner } from "./components/Banner";
import { Skills } from "./components/Skills";
import { Projects } from "./components/Projects";
import { Contact } from "./components/Contact";
import { ProfessionalSection } from './components/ProfessionalSection';
import { Footer } from "./components/Footer";
import { BlackHole } from "./components/BlackHole";



function App() {
  return (
    <div className="App">
      <BlackHole targetId="blackhole-placeholder" />
      <NavBar />
      <Banner />
      <Skills />
      <Projects />
      <Contact />
      <ProfessionalSection />
      <Footer />
    </div>
  );
}

export default App;
