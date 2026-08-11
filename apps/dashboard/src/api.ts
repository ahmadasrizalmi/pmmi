export const API_URL=(import.meta as any).env?.VITE_API_URL??'http://localhost:3001';

export type User={id:string;email:string;fullName?:string;full_name?:string;role:'ADMIN'|'USTADZ'|'SANTRI'|'ALUMNI'};
export type Session={token:string;user:User};

export function getSession():Session|null{try{const raw=localStorage.getItem('pmmi-session');return raw?JSON.parse(raw):null;}catch{return null;}}
export function setSession(session:Session|null){if(session)localStorage.setItem('pmmi-session',JSON.stringify(session));else localStorage.removeItem('pmmi-session');window.dispatchEvent(new Event('pmmi-session-changed'));}

export async function api<T=any>(path:string,options:RequestInit={}){
  const session=getSession();const headers=new Headers(options.headers);if(options.body&&!headers.has('content-type'))headers.set('content-type','application/json');if(session?.token)headers.set('authorization',`Bearer ${session.token}`);
  const response=await fetch(`${API_URL}${path}`,{...options,headers});const text=await response.text();let body:any;try{body=text?JSON.parse(text):null;}catch{body=text;}
  if(!response.ok){const error=new Error(body?.error??`HTTP ${response.status}`) as Error&{status?:number;body?:any};error.status=response.status;error.body=body;throw error;}return body as T;
}
