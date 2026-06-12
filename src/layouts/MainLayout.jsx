import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ParticleBackground from '../components/ParticleBackground';

/**
 * Main layout for public pages (Home, etc.)
 */
const MainLayout = () => {
  return (
    <div className="min-h-screen bg-dark-bg relative overflow-x-hidden">
      <ParticleBackground />
      <div className="relative z-10">
        <Navbar transparent />
        <main>
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
