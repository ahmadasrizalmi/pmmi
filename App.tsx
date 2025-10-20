import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import ProgramPage from './pages/ProgramPage';
import FacilitiesPage from './pages/FacilitiesPage';
import TeachersPage from './pages/TeachersPage';
import AdmissionsPage from './pages/AdmissionsPage';
import GalleryPage from './pages/GalleryPage';
import ContactPage from './pages/ContactPage';
import MaterialsPage from './src/pages/MaterialsPage';
import ArticlePage from './src/pages/ArticlePage';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
        <Header />
        <main className="flex-grow z-10">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/program" element={<ProgramPage />} />
            <Route path="/facilities" element={<FacilitiesPage />} />
            <Route path="/teachers" element={<TeachersPage />} />
            <Route path="/admissions" element={<AdmissionsPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/materials/:categoryId" element={<MaterialsPage />} />
            <Route path="/materials/:categoryId/:articleId" element={<ArticlePage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;