import React from 'react';
import { Link,Route,Routes } from 'react-router-dom';
import RegisterPage from '../../web/src/pages/RegisterPage';
import PortfolioPage from '../../web/src/pages/PortfolioPage';
import PortfolioDetailPage from '../../web/src/pages/PortfolioDetailPage';

const chrome=(children:React.ReactNode)=><><nav style={{position:'fixed',inset:'0 0 auto',zIndex:20,display:'flex',justifyContent:'space-between',padding:'18px 24px',background:'#09090bee',borderBottom:'1px solid #27272a',fontFamily:'Inter,system-ui'}}><a href="/" style={{color:'white',textDecoration:'none',fontWeight:800}}>PMMI</a><div style={{display:'flex',gap:16}}><Link style={{color:'#e879f9'}} to="/daftar">Daftar</Link><Link style={{color:'#e879f9'}} to="/portfolio">Portfolio</Link></div></nav>{children}</>;
export default function App(){return <Routes><Route path="/daftar" element={chrome(<RegisterPage/>)}/><Route path="/portfolio" element={chrome(<PortfolioPage/>)}/><Route path="/portfolio/:slug" element={chrome(<PortfolioDetailPage/>)}/><Route path="*" element={<main style={{minHeight:'100vh',display:'grid',placeItems:'center',background:'#09090b',color:'white',fontFamily:'Inter,system-ui'}}><div><h1>PMMI</h1><p>Gunakan <Link to="/daftar">/daftar</Link> atau <Link to="/portfolio">/portfolio</Link>.</p></div></main>}/></Routes>}
