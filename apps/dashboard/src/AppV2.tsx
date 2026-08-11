import React,{useState} from 'react';
import App from './App';
import AdminPortfolioPanel from './AdminPortfolioPanel';
import { getSession } from './api';

export default function AppV2(){
  const [open,setOpen]=useState(false);const session=getSession();const isAdmin=session?.user.role==='ADMIN';
  return <><App/>{isAdmin&&<><button className="btn" style={{position:'fixed',right:20,bottom:20,zIndex:60,boxShadow:'0 8px 30px rgba(0,0,0,.45)'}} onClick={()=>setOpen(!open)}>{open?'Tutup Portfolio':'Portfolio Manager'}</button>{open&&<div style={{position:'fixed',inset:0,zIndex:55,background:'rgba(0,0,0,.86)',overflow:'auto',padding:'70px 24px 100px'}}><div style={{maxWidth:1200,margin:'0 auto'}}><AdminPortfolioPanel/></div></div>}</>}</>;
}
