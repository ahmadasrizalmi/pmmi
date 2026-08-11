import React,{useEffect,useState} from 'react';
import { api } from './api';

export default function AdminPortfolioPanel(){
  const [items,setItems]=useState<any[]>([]);const [message,setMessage]=useState('');const [reasons,setReasons]=useState<Record<string,string>>({});
  async function load(){try{const data=await api('/v1/admin/portfolio');setItems(data.items??[]);}catch(e:any){setMessage(e.message);}}
  useEffect(()=>{void load();},[]);
  async function setPolicy(id:string,featured:boolean){try{await api(`/v1/admin/portfolio/${id}`,{method:'PATCH',body:JSON.stringify({featured,reason:reasons[id]||undefined})});setMessage(featured?'Project dipublikasikan.':'Project di-unpublish.');await load();}catch(e:any){setMessage(e.message);}}
  return <div className="stack"><div className="sectionTitle"><h2>Portfolio Manager</h2><button className="btn secondary" onClick={()=>void load()}>Refresh</button></div>{message&&<div className="notice">{message}</div>}<div className="tableWrap"><table><thead><tr><th>Project</th><th>Santri</th><th>Lifecycle</th><th>Assets</th><th>Status</th><th>Policy</th></tr></thead><tbody>{items.map((p:any)=><tr key={p.id}><td><strong>{p.title}</strong><div className="muted">/{p.slug}</div></td><td>{p.student_name}<div className="muted">{p.student_email}</div></td><td>{p.student_status??'-'}</td><td>{p.asset_count??0}</td><td><span className="pill">{p.featured?'PUBLIC':'HIDDEN'}</span></td><td><input style={{minWidth:180}} placeholder="Alasan audit (opsional)" value={reasons[p.id]??''} onChange={e=>setReasons({...reasons,[p.id]:e.target.value})}/><div className="actions" style={{marginTop:6}}>{p.featured?<button className="btn danger" onClick={()=>void setPolicy(p.id,false)}>Unpublish</button>:<button className="btn" onClick={()=>void setPolicy(p.id,true)}>Publish</button>}</div></td></tr>)}</tbody></table></div></div>;
}
