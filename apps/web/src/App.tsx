import React from 'react';
import { Route,Routes } from 'react-router-dom';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import LandingPage from '../../../pages/LandingPage';
import AboutPage from '../../../pages/AboutPage';
import ProgramPage from '../../../pages/ProgramPage';
import FacilitiesPage from '../../../pages/FacilitiesPage';
import TeachersPage from '../../../pages/TeachersPage';
import AdmissionsPage from '../../../pages/AdmissionsPage';
import ContactPage from '../../../pages/ContactPage';
import GalleryPage from '../../../pages/GalleryPage';
import MarketingPage from '../../../pages/MarketingPage';
import RegisterPage from './pages/RegisterPage';
import PortfolioPage from './pages/PortfolioPage';
import PortfolioDetailPage from './pages/PortfolioDetailPage';

function ExistingSite({children}:{children:React.ReactNode}){return <><Header/><div className="pt-20">{children}</div><Footer/></>}

export default function App(){
  return <Routes>
    <Route path="/" element={<ExistingSite><LandingPage/></ExistingSite>}/>
    <Route path="/tentang" element={<ExistingSite><AboutPage/></ExistingSite>}/>
    <Route path="/program" element={<ExistingSite><ProgramPage/></ExistingSite>}/>
    <Route path="/fasilitas" element={<ExistingSite><FacilitiesPage/></ExistingSite>}/>
    <Route path="/pengajar" element={<ExistingSite><TeachersPage/></ExistingSite>}/>
    <Route path="/admisi" element={<ExistingSite><AdmissionsPage/></ExistingSite>}/>
    <Route path="/kontak" element={<ExistingSite><ContactPage/></ExistingSite>}/>
    <Route path="/galeri" element={<ExistingSite><GalleryPage/></ExistingSite>}/>
    <Route path="/marketing" element={<ExistingSite><MarketingPage/></ExistingSite>}/>
    <Route path="/daftar" element={<RegisterPage/>}/>
    <Route path="/portfolio" element={<PortfolioPage/>}/>
    <Route path="/portfolio/:slug" element={<PortfolioDetailPage/>}/>
    <Route path="*" element={<ExistingSite><LandingPage/></ExistingSite>}/>
  </Routes>;
}
