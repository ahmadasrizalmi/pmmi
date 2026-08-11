import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import Activate from './Activate';
const token=new URLSearchParams(location.search).get('activate');
createRoot(document.getElementById('root')!).render(<React.StrictMode>{token?<Activate token={token}/>:<App/>}</React.StrictMode>);
