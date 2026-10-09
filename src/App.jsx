import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {Routes, Route, NavLink, useNavigate} from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:3001';
const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);

function AuthProvider({children}) {
  const [user,setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('medireserva-user')) } catch { return null }
  });
  const login = async (email,password) => {
    const response = await axios.get(`${API}/users`, {params:{email,password}});
    if (!response.data.length) throw new Error('Correo o contraseña incorrectos.');
    const account = {name:response.data[0].name,email};
    sessionStorage.setItem('medireserva-user',JSON.stringify(account)); setUser(account);
  };
  const logout = () => {sessionStorage.removeItem('medireserva-user');setUser(null)};
  return <AuthContext.Provider value={{user,login,logout}}>{children}</AuthContext.Provider>;
}
function Login() {
 const {login}=useAuth(), nav=useNavigate(); const [email,setEmail]=useState('demo@medireserva.com'),[password,setPassword]=useState('demo123'),[error,setError]=useState('');
 async function submit(e){e.preventDefault();setError('');try{await login(email,password);nav('/')}catch(err){setError(err.message==='Network Error'?'No se pudo conectar con la API. Inicia el servidor siguiendo el README.':err.message)}}
 return <main className="login-wrap"><section className="login-card"><div className="brand-mark">+</div><p className="eyebrow">SALUD MÁS CERCA</p><h1>Bienvenido a MediReserva</h1><p className="muted">Ingresa para consultar y administrar tus citas médicas.</p><form onSubmit={submit}><label>Correo electrónico<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></label><label>Contraseña<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength="4"/></label>{error&&<p className="error">{error}</p>}<button className="primary full">Iniciar sesión</button></form><p className="hint">Demo: demo@medireserva.com · demo123</p></section></main>
}
function Layout({children}) {
 const {user,logout}=useAuth(); const nav=useNavigate();
 return <div className="app-shell"><aside className="sidebar"><div className="brand"><span className="brand-mark small">+</span><span>MediReserva</span></div><p className="side-label">MENÚ PRINCIPAL</p><NavLink to="/" end>▦ &nbsp; Resumen</NavLink><NavLink to="/citas">▣ &nbsp; Citas médicas</NavLink><div className="side-bottom"><div className="avatar">{user?.name?.[0]||'U'}</div><div className="profile"><b>{user?.name}</b><small>Paciente</small></div><button className="logout" title="Cerrar sesión" onClick={()=>{logout();nav('/login')}}>↪</button></div></aside><main className="main"><header className="topbar"><div><span className="muted">Portal del paciente</span><h2>Tu salud, organizada</h2></div><span className="today">{new Date().toLocaleDateString('es-CO',{weekday:'short',day:'numeric',month:'short',year:'numeric'})}</span></header>{children}<footer>© 2026 MediReserva · Proyecto académico demostrativo</footer></main></div>
}
function Dashboard() {
 const [items,setItems]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState('');
 useEffect(()=>{axios.get(`${API}/appointments`).then(r=>setItems(r.data)).catch(()=>setError('No se pudo cargar la información. Comprueba que la API esté activa.')).finally(()=>setLoading(false))},[]);
 const upcoming=items.filter(a=>a.status!=='Cancelada').sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
 return <><section className="welcome"><div><p className="eyebrow">PANEL DE USUARIO</p><h1>Hola, qué bueno verte 👋</h1><p>Consulta tus próximas citas y mantén el control de tu salud.</p></div><div className="welcome-icon">♡</div></section><section className="stats"><article className="stat"><span className="stat-icon blue">▣</span><div><small>Citas registradas</small><strong>{items.length}</strong></div></article><article className="stat"><span className="stat-icon green">✓</span><div><small>Confirmadas</small><strong>{items.filter(a=>a.status==='Confirmada').length}</strong></div></article><article className="stat"><span className="stat-icon orange">◷</span><div><small>Pendientes</small><strong>{items.filter(a=>a.status==='Pendiente').length}</strong></div></article></section><section className="panel"><div className="panel-head"><div><h3>Próximas citas</h3><p className="muted">Revisa la información de tus reservas.</p></div><button className="primary" onClick={()=>location.href='/citas'}>Administrar citas&nbsp; →</button></div>{loading?<p>Cargando citas...</p>:error?<p className="error">{error}</p>:upcoming.length===0?<p className="empty">No tienes citas activas.</p>:<div className="table-wrap"><table><thead><tr><th>Especialidad / médico</th><th>Fecha</th><th>Hora</th><th>Estado</th></tr></thead><tbody>{upcoming.slice(0,5).map(a=><tr key={a.id}><td><b>{a.specialty}</b><small className="cell-sub">{a.doctor}</small></td><td>{a.date}</td><td>{a.time}</td><td><span className={'status '+(a.status==='Confirmada'?'confirmed':a.status==='Pendiente'?'pending':'cancelled')}>{a.status}</span></td></tr>)}</tbody></table></div>}</section></>
}
function Appointments() {
 const [items,setItems]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const [specialty,setSpecialty]=useState('Medicina general'),[doctor,setDoctor]=useState('Dra. Laura Méndez'),[date,setDate]=useState(''),[time,setTime]=useState('09:00');
 async function load(){try{const r=await axios.get(`${API}/appointments`);setItems(r.data);setError('')}catch{setError('No se pudo conectar con la API. Consulta el README.')}finally{setLoading(false)}}
 useEffect(()=>{load()},[]);
 async function create(e){e.preventDefault();setNotice('');try{await axios.post(`${API}/appointments`,{patient:'Usuario Demo',specialty,doctor,date,time,status:'Pendiente'});setNotice('La cita se registró correctamente.');setDate('');await load()}catch{setError('No fue posible guardar la cita. Intenta de nuevo.')}}
 async function cancel(id){try{await axios.patch(`${API}/appointments/${id}`,{status:'Cancelada'});setNotice('La cita fue cancelada.');await load()}catch{setError('No se pudo cancelar la cita.')}}
 async function reschedule(a){const next=prompt('Escribe la nueva fecha (AAAA-MM-DD):',a.date);if(!next)return;if(!/^\d{4}-\d{2}-\d{2}$/.test(next)){setError('Formato inválido. Usa AAAA-MM-DD.');return}try{await axios.patch(`${API}/appointments/${a.id}`,{date:next,status:'Pendiente'});setNotice('La cita fue reprogramada.');await load()}catch{setError('No se pudo reprogramar la cita.')}}
 return <><div className="page-heading"><div><p className="eyebrow">GESTIÓN</p><h1>Citas médicas</h1><p className="muted">Agenda, consulta o modifica tus reservas.</p></div></div>{notice&&<p className="success">{notice}</p>}{error&&<p className="error">{error}</p>}<section className="panel"><h3>Solicitar una cita</h3><form className="appointment-form" onSubmit={create}><label>Especialidad<select value={specialty} onChange={e=>{setSpecialty(e.target.value);setDoctor(({ 'Medicina general':'Dra. Laura Méndez','Odontología':'Dr. Felipe Torres','Fisioterapia':'Dra. Paula Ríos'})[e.target.value])}}><option>Medicina general</option><option>Odontología</option><option>Fisioterapia</option></select></label><label>Profesional<input value={doctor} readOnly /></label><label>Fecha<input type="date" value={date} min={new Date().toISOString().slice(0,10)} onChange={e=>setDate(e.target.value)} required /></label><label>Hora<select value={time} onChange={e=>setTime(e.target.value)}>{['08:00','09:00','10:00','11:30','14:00','15:00','16:00'].map(t=><option key={t}>{t}</option>)}</select></label><button className="primary form-button">Reservar cita</button></form></section><section className="panel"><div className="panel-head"><div><h3>Listado de citas</h3><p className="muted">Acciones disponibles: reprogramar y cancelar.</p></div><button className="secondary" onClick={load}>↻ Actualizar</button></div>{loading?<p>Cargando...</p>:<div className="table-wrap"><table><thead><tr><th>Paciente / especialidad</th><th>Fecha</th><th>Hora</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{items.map(a=><tr key={a.id}><td><b>{a.specialty}</b><small className="cell-sub">{a.doctor}</small></td><td>{a.date}</td><td>{a.time}</td><td><span className={'status '+(a.status==='Confirmada'?'confirmed':a.status==='Pendiente'?'pending':'cancelled')}>{a.status}</span></td><td><div className="actions"><button disabled={a.status==='Cancelada'} onClick={()=>reschedule(a)}>Reprogramar</button><button className="danger" disabled={a.status==='Cancelada'} onClick={()=>cancel(a.id)}>Cancelar</button></div></td></tr>)}</tbody></table></div>}</section></>
}
function Guarded(){const {user}=useAuth();return user?<Layout><Routes><Route path="/" element={<Dashboard/>}/><Route path="/citas" element={<Appointments/>}/><Route path="*" element={<Dashboard/>}/></Routes></Layout>:<Login/>}
export default function App(){return <AuthProvider><Routes><Route path="/login" element={<Login/>}/><Route path="*" element={<Guarded/>}/></Routes></AuthProvider>}
