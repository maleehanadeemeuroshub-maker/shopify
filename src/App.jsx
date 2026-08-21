import Navbar from './components/Navbar.jsx';
import CursorGlow from './components/CursorGlow.jsx';
import Hero from './sections/Hero.jsx';
import Features from './sections/Features.jsx';
import Footer from './sections/Footer.jsx';

export default function App() {
  return (
    <>
      <div className="grain" aria-hidden="true" />
      <CursorGlow />
      <Navbar />
      <main>
        <Hero />
        <Features />
      </main>
      <Footer />
    </>
  );
}
