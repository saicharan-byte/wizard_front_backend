import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useEvents } from '../context/EventContext.jsx';
import { useEffect } from 'react';

function AdminDashboard() {
    const [activePage, setActivePage] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [newEvent, setNewEvent] = useState('');
    const [newEventDate, setNewEventDate] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [editingEvent, setEditingEvent] = useState(null);
    const [editEventName, setEditEventName] = useState('');
    const [editEventDate, setEditEventDate] = useState('');
    const [newRegStudentName, setNewRegStudentName] = useState('');
    const [newRegEmail, setNewRegEmail] = useState('');
    const [newRegEventName, setNewRegEventName] = useState('');
    const [newRegPhone, setNewRegPhone] = useState('');
    const [confirmDeleteReg, setConfirmDeleteReg] = useState(null);
    // Vector Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [reindexStatus, setReindexStatus] = useState('');
    const [allUsers, setAllUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const { user, logout } = useAuth();
    const { events, registrations, addEvent, removeEvent, updateEvent, addRegistration, removeRegistration, searchEvents, reindexEvents } = useEvents();
    const navigate = useNavigate();

    const handleEditEventClick = (ev) => {
        setEditingEvent(ev._id);
        setEditEventName(ev.name);
        setEditEventDate(ev.date || '');
    };

    const handleUpdateEvent = async (id) => {
        if (!editEventName.trim() || !editEventDate) return;
        await updateEvent(id, editEventName.trim(), editEventDate);
        setEditingEvent(null);
    };

    const handleAddEvent = () => {
        if (!newEvent.trim() || !newEventDate) return;
        addEvent(newEvent.trim(), newEventDate);
        setNewEvent(''); setNewEventDate('');
    };
    const handleAddRegistration = async () => {
        if (!newRegStudentName.trim() || !newRegEmail.trim() || !newRegEventName || !newRegPhone.trim()) return;
        await addRegistration({ studentName: newRegStudentName.trim(), email: newRegEmail.trim(), eventName: newRegEventName, phone: newRegPhone.trim() });
        setNewRegStudentName(''); setNewRegEmail(''); setNewRegEventName(''); setNewRegPhone('');
    };
    const handleRemoveEvent = (id) => { removeEvent(id); setConfirmDelete(null); };
    const handleRemoveRegistration = (id, email, eventName) => { removeRegistration(id, email, eventName); setConfirmDeleteReg(null); };
    const handleLogout = () => { logout(); navigate('/'); };

    // Vector Search handler
    const handleVectorSearch = async () => {
        if (!searchQuery.trim()) return;
        setSearchLoading(true);
        try {
            const data = await searchEvents(searchQuery.trim());
            setSearchResults(data);
        } catch (err) {
            console.error('Search failed:', err);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleReindex = async () => {
        setReindexStatus('Reindexing...');
        const result = await reindexEvents();
        setReindexStatus(result.message || 'Done!');
        setTimeout(() => setReindexStatus(''), 3000);
    };

    const fetchUsers = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        setLoadingUsers(true);
        try {
            const res = await fetch('http://localhost:8003/authservice/getallusers/1/1000', {
                headers: { 'Token': token }
            });
            const data = await res.json();
            if (data.code === 200 && data.users) {
                setAllUsers(data.users);
            }
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setLoadingUsers(false);
        }
    };

    useEffect(() => {
        if (activePage === 'users' && allUsers.length === 0) {
            fetchUsers();
        }
    }, [activePage]);

    const totalStudents = allUsers.length > 0 ? allUsers.length : 0;
    const uniqueReg = [...new Set(registrations.map(r => r.email))].length;
    const fmt = (d) => d ? new Date(d+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '';
    const isExpired = (dateStr) => { if (!dateStr) return false; const today = new Date(); today.setHours(0,0,0,0); return new Date(dateStr+'T00:00:00') < today; };

    const sideItems = [
        {id:'overview',label:'Dashboard',icon:'📊'},{id:'add-events',label:'Add Events',icon:'✨'},
        {id:'manage-events',label:'Manage Events',icon:'📅'},{id:'registrations',label:'Registrations',icon:'📋'},
        {id:'users',label:'Users',icon:'👥'},{id:'settings',label:'Settings',icon:'⚙️'}
    ];
    const stats = [
        {icon:'📅',value:events.length,label:'Total Events',g:'linear-gradient(135deg,#6366f1,#a855f7)'},
        {icon:'📝',value:registrations.length,label:'Total Registrations',g:'linear-gradient(135deg,#a855f7,#ec4899)'},
        {icon:'🎓',value:totalStudents,label:'Registered Students',g:'linear-gradient(135deg,#3b82f6,#6366f1)'},
        {icon:'✅',value:uniqueReg,label:'Active Participants',g:'linear-gradient(135deg,#10b981,#14b8a6)'}
    ];
    const iS={width:'100%',padding:'12px 16px',borderRadius:'12px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'#fff',fontSize:'0.95rem',outline:'none',fontFamily:'inherit',boxSizing:'border-box'};

    const Sidebar = () => (
        <aside className="glass-strong" style={{width:sidebarOpen?'260px':'0',overflow:sidebarOpen?'visible':'hidden',opacity:sidebarOpen?1:0,display:'flex',flexDirection:'column',position:'sticky',top:0,height:'100vh',flexShrink:0,transition:'all 0.3s',borderRight:sidebarOpen?'1px solid rgba(255,255,255,0.1)':'none'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 16px',borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
                <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                    <span style={{fontSize:'1.8rem'}}>🛡️</span>
                    <div><div style={{fontSize:'1.05rem',fontWeight:800,color:'#fff'}}>EventHub</div><div style={{fontSize:'0.65rem',fontWeight:600,textTransform:'uppercase',letterSpacing:'1.5px',color:'#818cf8'}}>Admin Panel</div></div>
                </div>
                <button onClick={()=>setSidebarOpen(false)} style={{width:'32px',height:'32px',borderRadius:'8px',border:'1px solid rgba(255,255,255,0.1)',background:'transparent',color:'#9ca3af',fontSize:'0.9rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
            </div>
            <nav style={{flex:1,padding:'12px',display:'flex',flexDirection:'column',gap:'4px'}}>
                {sideItems.map(i=>(
                    <button key={i.id} onClick={()=>setActivePage(i.id)} style={{width:'100%',display:'flex',alignItems:'center',gap:'12px',padding:'12px 16px',borderRadius:'12px',border:'none',fontSize:'0.88rem',fontWeight:activePage===i.id?600:500,fontFamily:'inherit',cursor:'pointer',textAlign:'left',background:activePage===i.id?'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(99,102,241,0.08))':'transparent',color:activePage===i.id?'#818cf8':'#9ca3af'}}>
                        <span style={{fontSize:'1.1rem',width:'24px',textAlign:'center'}}>{i.icon}</span><span>{i.label}</span>
                    </button>
                ))}
            </nav>
            <div style={{padding:'16px',borderTop:'1px solid rgba(255,255,255,0.1)'}}>
                <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'12px'}}>
                    <div style={{width:'36px',height:'36px',borderRadius:'50%',background:'linear-gradient(135deg,#6366f1,#a855f7)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'0.85rem',flexShrink:0}}>{user?.name?.charAt(0)?.toUpperCase()||'A'}</div>
                    <div style={{overflow:'hidden'}}><div style={{fontSize:'0.88rem',fontWeight:600,color:'#fff'}}>{user?.name||'Admin'}</div><div style={{fontSize:'0.72rem',color:'#6b7280'}}>{user?.email||''}</div></div>
                </div>
                <button onClick={handleLogout} style={{width:'100%',padding:'10px',borderRadius:'12px',border:'1px solid rgba(255,255,255,0.1)',background:'transparent',color:'#9ca3af',fontSize:'0.85rem',fontWeight:600,fontFamily:'inherit',cursor:'pointer'}}>Logout</button>
            </div>
        </aside>
    );

    return (
        <div style={{display:'flex',minHeight:'100vh',background:'linear-gradient(135deg,#0f0c29 0%,#1a1145 30%,#302b63 60%,#24243e 100%)'}}>
            <Sidebar/>
            {!sidebarOpen&&<button onClick={()=>setSidebarOpen(true)} className="glass-strong" style={{position:'fixed',top:'16px',left:'16px',zIndex:200,width:'40px',height:'40px',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.1)',color:'#9ca3af',fontSize:'1.1rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>☰</button>}

            <main style={{flex:1,overflowY:'auto',height:'100vh'}}>
                <div style={{padding:'36px 40px',paddingLeft:sidebarOpen?'40px':'72px',maxWidth:'1100px'}}>

                    {activePage==='overview'&&<div>
                        <div style={{marginBottom:'32px'}}><h1 style={{fontSize:'1.8rem',fontWeight:800,color:'#fff',marginBottom:'6px'}}>Dashboard Overview</h1><p style={{fontSize:'0.95rem',color:'#9ca3af'}}>Welcome back, {user?.name||'Admin'}!</p></div>
                        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'20px',marginBottom:'36px'}}>
                            {stats.map((s,i)=>(<div key={i} className="glass" style={{borderRadius:'16px',padding:'24px',display:'flex',alignItems:'center',gap:'16px'}}><div style={{width:'52px',height:'52px',borderRadius:'14px',background:s.g,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.6rem',flexShrink:0}}>{s.icon}</div><div><div style={{fontSize:'1.8rem',fontWeight:800,color:'#fff',lineHeight:1}}>{s.value}</div><div style={{fontSize:'0.78rem',color:'#9ca3af',marginTop:'4px'}}>{s.label}</div></div></div>))}
                        </div>
                        <h2 style={{fontSize:'1.2rem',fontWeight:700,color:'#fff',marginBottom:'20px'}}>🕐 Recent Registrations</h2>
                        {registrations.length===0?<div className="glass" style={{borderRadius:'16px',padding:'40px',textAlign:'center',color:'#6b7280'}}>No registrations yet.</div>:
                        <div className="glass" style={{borderRadius:'16px',overflow:'hidden',marginBottom:'36px'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.9rem'}}><thead><tr style={{background:'rgba(255,255,255,0.05)'}}>
                            {['#','Student','Event','Email'].map(h=><th key={h} style={{padding:'14px 20px',textAlign:'left',fontWeight:600,color:'#9ca3af',fontSize:'0.8rem',textTransform:'uppercase'}}>{h}</th>)}
                        </tr></thead><tbody>{registrations.slice(-5).reverse().map((r,i)=><tr key={i} style={{borderTop:'1px solid rgba(255,255,255,0.05)'}}>
                            <td style={{padding:'14px 20px',color:'#6b7280',fontWeight:600}}>{registrations.length-i}</td>
                            <td style={{padding:'14px 20px',color:'#fff',fontWeight:600}}>{r.studentName}</td>
                            <td style={{padding:'14px 20px'}}><span style={{padding:'3px 12px',borderRadius:'50px',fontSize:'0.8rem',fontWeight:600,background:'rgba(99,102,241,0.15)',color:'#818cf8'}}>{r.eventName}</span></td>
                            <td style={{padding:'14px 20px',color:'#d1d5db'}}>{r.email}</td>
                            <td style={{padding:'14px 20px',textAlign:'right'}}>
                                {confirmDeleteReg===r._id?
                                    <div style={{display:'flex',alignItems:'center',gap:'4px',justifyContent:'flex-end'}}>
                                        <span style={{fontSize:'0.7rem',color:'#f87171',fontWeight:600}}>Sure?</span>
                                        <button onClick={()=>handleRemoveRegistration(r._id)} style={{padding:'4px 10px',background:'#ef4444',color:'#fff',border:'none',borderRadius:'6px',fontSize:'0.7rem',fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>Yes</button>
                                        <button onClick={()=>setConfirmDeleteReg(null)} style={{padding:'4px 10px',background:'transparent',color:'#9ca3af',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'6px',fontSize:'0.7rem',fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>No</button>
                                    </div>
                                    :<button onClick={()=>setConfirmDeleteReg(r._id)} style={{padding:'4px 12px',background:'transparent',border:'1px solid rgba(239,68,68,0.3)',borderRadius:'8px',color:'#f87171',fontSize:'0.7rem',fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>🗑️ Remove</button>
                                }
                            </td>
                        </tr>)}</tbody></table></div>}
                        <h2 style={{fontSize:'1.2rem',fontWeight:700,color:'#fff',marginBottom:'20px'}}>📅 Events Overview</h2>
                        <div style={{display:'flex',flexWrap:'wrap',gap:'10px'}}>{events.map((ev,i)=>{const c=registrations.filter(r=>r.eventName===ev.name).length;return <div key={i} className="glass" style={{padding:'10px 20px',borderRadius:'50px',display:'flex',alignItems:'center',gap:'8px',fontSize:'0.88rem'}}><span style={{width:'8px',height:'8px',borderRadius:'50%',background:'#818cf8'}}/><span style={{color:'#fff'}}>{ev.name}</span><span style={{fontSize:'0.72rem',color:'#c084fc',fontWeight:600}}>📆 {fmt(ev.date)}</span><span style={{fontSize:'0.72rem',color:'#6b7280',fontWeight:600}}>{c} reg{c!==1?'s':''}</span></div>})}</div>
                    </div>}

                    {activePage==='add-events'&&<div>
                        <div style={{marginBottom:'32px'}}><h1 style={{fontSize:'1.8rem',fontWeight:800,color:'#fff',marginBottom:'6px'}}>Add New Event</h1><p style={{fontSize:'0.95rem',color:'#9ca3af'}}>Create exciting events for students to discover and join.</p></div>
                        <div className="glass-strong" style={{borderRadius:'16px',padding:'40px',textAlign:'center',marginBottom:'36px'}}>
                            <div style={{fontSize:'3rem',marginBottom:'16px'}}>✨</div>
                            <h3 style={{fontSize:'1.3rem',fontWeight:700,color:'#fff',marginBottom:'8px'}}>Create Event</h3>
                            <p style={{fontSize:'0.9rem',color:'#9ca3af',maxWidth:'450px',margin:'0 auto 24px'}}>Enter the event name and date below.</p>
                            <div style={{maxWidth:'520px',margin:'0 auto'}}>
                                <div style={{display:'flex',gap:'12px',marginBottom:'12px'}}>
                                    <input type="text" placeholder="Event name (e.g., Tech Fest 2026)" value={newEvent} onChange={e=>setNewEvent(e.target.value)} style={{...iS,flex:2}}/>
                                    <input type="date" value={newEventDate} onChange={e=>setNewEventDate(e.target.value)} style={{...iS,flex:1,colorScheme:'dark'}}/>
                                </div>
                                <button onClick={handleAddEvent} style={{width:'100%',padding:'12px',borderRadius:'12px',background:'linear-gradient(to right,#6366f1,#a855f7)',color:'#fff',fontWeight:600,fontSize:'0.9rem',border:'none',cursor:'pointer',fontFamily:'inherit',opacity:(!newEvent.trim()||!newEventDate)?0.5:1}}>+ Add Event</button>
                            </div>
                        </div>
                        <h2 style={{fontSize:'1.2rem',fontWeight:700,color:'#fff',marginBottom:'20px'}}>📅 Current Events <span style={{fontSize:'0.75rem',padding:'3px 12px',borderRadius:'50px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'#9ca3af',marginLeft:'8px'}}>{events.length}</span></h2>
                        <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>{events.length===0?<div className="glass" style={{borderRadius:'16px',padding:'40px',textAlign:'center',color:'#6b7280'}}>No events yet.</div>:events.map((ev,i)=><div key={i} className="glass" style={{borderRadius:'16px',padding:'16px 22px',display:'flex',alignItems:'center',justifyContent:'space-between'}}><div style={{display:'flex',alignItems:'center',gap:'12px'}}><span style={{width:'8px',height:'8px',borderRadius:'50%',background:'#818cf8'}}/><span style={{color:'#fff',fontWeight:600}}>{ev.name}</span></div><span style={{fontSize:'0.82rem',color:'#c084fc',fontWeight:600}}>📆 {fmt(ev.date)}</span></div>)}</div>
                    </div>}

                    {activePage==='manage-events'&&<div>
                        <div style={{marginBottom:'32px'}}><h1 style={{fontSize:'1.8rem',fontWeight:800,color:'#fff',marginBottom:'6px'}}>Manage Events</h1><p style={{fontSize:'0.95rem',color:'#9ca3af'}}>View, manage, or remove existing events. <span style={{color:'#818cf8',fontWeight:600}}>Vector Search</span> is available below.</p></div>
                        
                        {/* Vector Search Section integrated into Manage Events */}
                        <div className="glass" style={{borderRadius:'16px',padding:'32px',marginBottom:'36px', borderTop:'4px solid #818cf8'}}>
                            <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px'}}>
                                <span style={{fontSize:'2rem'}}>🧠</span>
                                <div>
                                    <h3 style={{fontSize:'1.3rem',fontWeight:700,color:'#fff',marginBottom:'4px'}}>Semantic Event Search</h3>
                                    <p style={{fontSize:'0.85rem',color:'#9ca3af'}}>Type a natural language query to find events by meaning, not just exact words.</p>
                                </div>
                            </div>
                            <div style={{display:'flex',gap:'12px', marginBottom:'16px'}}>
                                <input type="text" placeholder='Try: "coding contest", "artificial intelligence", "sports"' value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleVectorSearch()} style={{...iS,flex:1,fontSize:'1rem',padding:'14px 20px'}}/>
                                <button onClick={handleVectorSearch} disabled={searchLoading||!searchQuery.trim()} style={{padding:'14px 28px',borderRadius:'12px',background:searchLoading?'#4b5563':'linear-gradient(135deg,#6366f1,#a855f7)',color:'#fff',fontWeight:700,fontSize:'0.95rem',border:'none',cursor:searchLoading?'wait':'pointer',fontFamily:'inherit',whiteSpace:'nowrap'}}>{searchLoading?'⏳ Searching...':'🔍 Search'}</button>
                            </div>
                            
                            <div style={{display:'flex',alignItems:'center',gap:'12px', justifyContent:'space-between'}}>
                                <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                                    {['coding competition','tech conference','sports event'].map(s=>(
                                        <button key={s} onClick={()=>{setSearchQuery(s);}} style={{padding:'4px 12px',borderRadius:'50px',background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.2)',color:'#818cf8',fontSize:'0.75rem',fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>{s}</button>
                                    ))}
                                </div>
                                <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                                    <button onClick={handleReindex} style={{padding:'6px 14px',borderRadius:'8px',background:'rgba(16,185,129,0.15)',border:'1px solid rgba(16,185,129,0.3)',color:'#10b981',fontSize:'0.75rem',fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>🔄 Re-index</button>
                                    {reindexStatus&&<span style={{fontSize:'0.75rem',color:'#10b981',fontWeight:600}}>{reindexStatus}</span>}
                                </div>
                            </div>

                            {/* Search Results */}
                            {searchResults&&<div style={{marginTop:'24px', paddingTop:'24px', borderTop:'1px solid rgba(255,255,255,0.1)'}}>
                                <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'16px'}}>
                                    <h4 style={{fontSize:'1rem',fontWeight:700,color:'#fff'}}>Search Results</h4>
                                    <span style={{fontSize:'0.7rem',padding:'3px 10px',borderRadius:'50px',background:'rgba(99,102,241,0.15)',color:'#818cf8',fontWeight:700}}>{searchResults.totalResults} found</span>
                                </div>

                                {searchResults.totalResults===0?<div style={{padding:'20px',textAlign:'center',color:'#6b7280',fontSize:'0.9rem'}}>No matching events found.</div>:
                                <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                                    {searchResults.results.map((r,i)=>{
                                        const pct = Math.round(r.similarity*100);
                                        const color = pct>=80?'#10b981':pct>=50?'#f59e0b':pct>=30?'#f97316':'#ef4444';
                                        return <div key={i} style={{background:'rgba(0,0,0,0.2)',borderRadius:'12px',padding:'12px 16px',borderLeft:`3px solid ${color}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                                            <div>
                                                <div style={{fontWeight:700,color:'#fff',fontSize:'0.95rem'}}>{r.name}</div>
                                                <div style={{fontSize:'0.75rem',color:'#9ca3af',marginTop:'2px'}}>📆 {r.date ? new Date(r.date+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : 'N/A'}</div>
                                            </div>
                                            <div style={{textAlign:'right'}}>
                                                <div style={{fontSize:'1.6rem',fontWeight:800,color}}>{pct}%</div>
                                                <div style={{fontSize:'0.65rem',color:'#6b7280',fontWeight:600,textTransform:'uppercase',marginBottom:'8px'}}>Match</div>
                                                {/* Delete controls */}
                                                {confirmDelete===r._id?
                                                    <div style={{display:'flex',alignItems:'center',gap:'4px',justifyContent:'flex-end'}}>
                                                        <span style={{fontSize:'0.7rem',color:'#f87171',fontWeight:600}}>Sure?</span>
                                                        <button onClick={()=>{handleRemoveEvent(r._id);setSearchResults(prev=>({...prev, results: prev.results.filter(res=>res._id!==r._id), totalResults: prev.totalResults-1}));}} style={{padding:'4px 10px',background:'#ef4444',color:'#fff',border:'none',borderRadius:'6px',fontSize:'0.7rem',fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>Yes</button>
                                                        <button onClick={()=>setConfirmDelete(null)} style={{padding:'4px 10px',background:'transparent',color:'#9ca3af',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'6px',fontSize:'0.7rem',fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>No</button>
                                                    </div>
                                                    :<button onClick={()=>setConfirmDelete(r._id)} style={{padding:'4px 12px',background:'transparent',border:'1px solid rgba(239,68,68,0.3)',borderRadius:'8px',color:'#f87171',fontSize:'0.7rem',fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>🗑️ Remove</button>
                                                }
                                            </div>
                                        </div>;
                                    })}
                                </div>}
                            </div>}
                        </div>

                        <h2 style={{fontSize:'1.2rem',fontWeight:700,color:'#fff',marginBottom:'20px'}}>All Current Events</h2>
                        {events.length===0?<div className="glass" style={{borderRadius:'16px',padding:'40px',textAlign:'center',color:'#6b7280'}}>No events to manage.</div>:
                        <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>{events.map((ev,i)=>{const c=registrations.filter(r=>r.eventName===ev.name).length;return <div key={i} className="glass" style={{borderRadius:'16px',padding:'18px 22px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                            {editingEvent === ev._id ? (
                                <div style={{display:'flex', gap:'10px', alignItems:'center', width:'100%'}}>
                                    <input type="text" value={editEventName} onChange={e=>setEditEventName(e.target.value)} style={{...iS, flex:2, padding:'8px 12px'}}/>
                                    <input type="date" value={editEventDate} onChange={e=>setEditEventDate(e.target.value)} style={{...iS, flex:1, padding:'8px 12px', colorScheme:'dark'}}/>
                                    <button onClick={()=>handleUpdateEvent(ev._id)} style={{padding:'8px 16px', background:'#10b981', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:600}}>Save</button>
                                    <button onClick={()=>setEditingEvent(null)} style={{padding:'8px 16px', background:'transparent', color:'#9ca3af', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', cursor:'pointer', fontWeight:600}}>Cancel</button>
                                </div>
                            ) : (
                                <>
                                    <div style={{display:'flex',alignItems:'center',gap:'14px'}}><span style={{fontSize:'1.4rem'}}>🎯</span><div><div style={{fontWeight:600,color:'#fff',fontSize:'0.95rem'}}>{ev.name} {isExpired(ev.date)&&<span style={{fontSize:'0.7rem',padding:'2px 8px',borderRadius:'50px',background:'rgba(239,68,68,0.15)',color:'#f87171',fontWeight:700,marginLeft:'6px'}}>Expired</span>}</div><div style={{fontSize:'0.78rem',color:'#6b7280',marginTop:'2px'}}>📆 {fmt(ev.date)} · {c} registration{c!==1?'s':''}</div></div></div>
                                    {confirmDelete===ev._id?<div style={{display:'flex',alignItems:'center',gap:'8px'}}><span style={{fontSize:'0.82rem',color:'#f87171',fontWeight:600}}>Delete?</span><button onClick={()=>handleRemoveEvent(ev._id)} style={{padding:'6px 16px',background:'#ef4444',color:'#fff',border:'none',borderRadius:'8px',fontSize:'0.8rem',fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>Yes</button><button onClick={()=>setConfirmDelete(null)} style={{padding:'6px 16px',background:'transparent',color:'#9ca3af',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'8px',fontSize:'0.8rem',fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>No</button></div>
                                    :<div style={{display:'flex', gap:'8px'}}>
                                        <button onClick={()=>handleEditEventClick(ev)} style={{padding:'8px 18px',background:'transparent',border:'1px solid rgba(99,102,241,0.3)',borderRadius:'12px',color:'#818cf8',fontSize:'0.82rem',fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>✏️ Edit</button>
                                        <button onClick={()=>setConfirmDelete(ev._id)} style={{padding:'8px 18px',background:'transparent',border:'1px solid rgba(239,68,68,0.3)',borderRadius:'12px',color:'#f87171',fontSize:'0.82rem',fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>🗑️ Remove</button>
                                    </div>}
                                </>
                            )}
                        </div>})}</div>}
                    </div>}

                    {activePage==='registrations'&&<div>
                        <div style={{marginBottom:'32px'}}><h1 style={{fontSize:'1.8rem',fontWeight:800,color:'#fff',marginBottom:'6px'}}>Student Registrations</h1><p style={{fontSize:'0.95rem',color:'#9ca3af'}}>{registrations.length} total registration{registrations.length!==1?'s':''}.</p></div>
                        <div className="glass-strong" style={{borderRadius:'16px',padding:'24px',marginBottom:'36px'}}>
                            <h3 style={{fontSize:'1.1rem',fontWeight:700,color:'#fff',marginBottom:'16px'}}>Add New Registration</h3>
                            <div style={{display:'flex',gap:'12px',marginBottom:'16px',flexWrap:'wrap'}}>
                                <input type="text" placeholder="Student Name" value={newRegStudentName} onChange={e=>setNewRegStudentName(e.target.value)} style={{...iS,flex:'1 1 200px'}}/>
                                <input type="email" placeholder="Email Address" value={newRegEmail} onChange={e=>setNewRegEmail(e.target.value)} style={{...iS,flex:'1 1 200px'}}/>
                                <input type="tel" placeholder="Phone Number" value={newRegPhone} onChange={e=>setNewRegPhone(e.target.value)} style={{...iS,flex:'1 1 200px'}}/>
                                <select value={newRegEventName} onChange={e=>setNewRegEventName(e.target.value)} style={{...iS,flex:'1 1 200px',appearance:'none'}}>
                                    <option value="" disabled style={{color:'#000'}}>Select Event</option>
                                    {events.map((ev, i)=><option key={i} value={ev.name} style={{color:'#000'}}>{ev.name}</option>)}
                                </select>
                            </div>
                            <button onClick={handleAddRegistration} disabled={!newRegStudentName.trim() || !newRegEmail.trim() || !newRegEventName || !newRegPhone.trim()} style={{width:'100%',padding:'12px',borderRadius:'12px',background:'linear-gradient(to right,#6366f1,#a855f7)',color:'#fff',fontWeight:600,fontSize:'0.9rem',border:'none',cursor:'pointer',fontFamily:'inherit',opacity:(!newRegStudentName.trim() || !newRegEmail.trim() || !newRegEventName || !newRegPhone.trim())?0.5:1}}>+ Add Registration</button>
                        </div>
                        {registrations.length===0?<div className="glass" style={{borderRadius:'16px',padding:'40px',textAlign:'center',color:'#6b7280'}}>No registrations yet.</div>:
                        <div className="glass" style={{borderRadius:'16px',overflow:'hidden',marginBottom:'36px'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.9rem'}}><thead><tr style={{background:'rgba(255,255,255,0.05)'}}>
                            {['#','Student','Event','Email','Phone','Action'].map(h=><th key={h} style={{padding:'14px 20px',textAlign:h==='Action'?'right':'left',fontWeight:600,color:'#9ca3af',fontSize:'0.8rem',textTransform:'uppercase'}}>{h}</th>)}
                        </tr></thead><tbody>{registrations.map((r,i)=><tr key={i} style={{borderTop:'1px solid rgba(255,255,255,0.05)'}}>
                            <td style={{padding:'14px 20px',color:'#6b7280',fontWeight:600}}>{i+1}</td>
                            <td style={{padding:'14px 20px',color:'#fff',fontWeight:600}}>{r.studentName}</td>
                            <td style={{padding:'14px 20px'}}><span style={{padding:'3px 12px',borderRadius:'50px',fontSize:'0.8rem',fontWeight:600,background:'rgba(99,102,241,0.15)',color:'#818cf8'}}>{r.eventName}</span></td>
                            <td style={{padding:'14px 20px',color:'#d1d5db'}}>{r.email}</td>
                            <td style={{padding:'14px 20px',color:'#d1d5db'}}>{r.phone}</td>
                            <td style={{padding:'14px 20px',textAlign:'right'}}>
                                {confirmDeleteReg===r._id?
                                    <div style={{display:'flex',alignItems:'center',gap:'4px',justifyContent:'flex-end'}}>
                                        <span style={{fontSize:'0.7rem',color:'#f87171',fontWeight:600}}>Sure?</span>
                                        <button onClick={()=>handleRemoveRegistration(r._id, r.email, r.eventName)} style={{padding:'4px 10px',background:'#ef4444',color:'#fff',border:'none',borderRadius:'6px',fontSize:'0.7rem',fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>Yes</button>
                                        <button onClick={()=>setConfirmDeleteReg(null)} style={{padding:'4px 10px',background:'transparent',color:'#9ca3af',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'6px',fontSize:'0.7rem',fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>No</button>
                                    </div>
                                    :<button onClick={()=>setConfirmDeleteReg(r._id)} style={{padding:'4px 12px',background:'transparent',border:'1px solid rgba(239,68,68,0.3)',borderRadius:'8px',color:'#f87171',fontSize:'0.7rem',fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>🗑️ Remove</button>
                                }
                            </td>
                        </tr>)}</tbody></table></div>}
                        {registrations.length>0&&<div><h2 style={{fontSize:'1.2rem',fontWeight:700,color:'#fff',marginBottom:'20px'}}>📊 Per-Event Breakdown</h2>
                        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:'16px'}}>{events.map((ev,i)=>{const c=registrations.filter(r=>r.eventName===ev.name).length;return <div key={i} className="glass" style={{borderRadius:'16px',padding:'24px 20px',textAlign:'center'}}><div style={{fontSize:'2rem',fontWeight:800,background:'linear-gradient(to right,#818cf8,#c084fc)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',marginBottom:'6px'}}>{c}</div><div style={{fontSize:'0.82rem',color:'#fff',fontWeight:600}}>{ev.name}</div><div style={{fontSize:'0.72rem',color:'#9ca3af',marginTop:'2px'}}>📆 {fmt(ev.date)}</div></div>})}</div></div>}
                    </div>}

                    {activePage==='users'&&<div>
                        <div style={{marginBottom:'32px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                            <div>
                                <h1 style={{fontSize:'1.8rem',fontWeight:800,color:'#fff',marginBottom:'6px'}}>Platform Users</h1>
                            </div>
                            <button onClick={fetchUsers} style={{padding:'10px 16px',borderRadius:'10px',background:'rgba(99,102,241,0.15)',color:'#818cf8',border:'1px solid rgba(99,102,241,0.3)',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:'8px'}}>🔄 Refresh</button>
                        </div>
                        
                        {loadingUsers ? <div style={{textAlign:'center',padding:'40px',color:'#9ca3af'}}>Loading users...</div> :
                        allUsers.length === 0 ? <div className="glass" style={{borderRadius:'16px',padding:'40px',textAlign:'center',color:'#6b7280'}}>No users found.</div> :
                        <div className="glass" style={{borderRadius:'16px',overflow:'hidden'}}>
                            <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.9rem'}}>
                                <thead>
                                    <tr style={{background:'rgba(255,255,255,0.05)'}}>
                                        {['ID','Name','Email','Phone'].map(h=><th key={h} style={{padding:'14px 20px',textAlign:'left',fontWeight:600,color:'#9ca3af',fontSize:'0.8rem',textTransform:'uppercase'}}>{h}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {allUsers.map((u, i)=><tr key={i} style={{borderTop:'1px solid rgba(255,255,255,0.05)'}}>
                                        <td style={{padding:'14px 20px',color:'#6b7280',fontWeight:600}}>{u.id}</td>
                                        <td style={{padding:'14px 20px',color:'#fff',fontWeight:600}}>{u.fullname}</td>
                                        <td style={{padding:'14px 20px',color:'#d1d5db'}}>{u.email}</td>
                                        <td style={{padding:'14px 20px',color:'#d1d5db'}}>{u.phone || 'N/A'}</td>
                                    </tr>)}
                                </tbody>
                            </table>
                        </div>}
                    </div>}

                    {activePage==='settings'&&<div>
                        <div style={{marginBottom:'32px'}}><h1 style={{fontSize:'1.8rem',fontWeight:800,color:'#fff',marginBottom:'6px'}}>Settings</h1><p style={{fontSize:'0.95rem',color:'#9ca3af'}}>Platform information and admin details.</p></div>
                        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'20px'}}>
                            {[{t:'📌 Platform Info',r:[['Platform','EventHub v1.0'],['Environment','Frontend Simulation'],['Framework','React 19 + Vite']]},{t:'👤 Admin Profile',r:[['Name',user?.name||'N/A'],['Email',user?.email||'N/A'],['Role', user?.role === 2 ? 'Admin' : 'User']]},{t:'📈 Quick Stats',r:[['Total Events',events.length],['Total Registrations',registrations.length]]}].map((c,i)=>(
                                <div key={i} className="glass" style={{borderRadius:'16px',padding:'28px'}}><h3 style={{fontSize:'1.05rem',fontWeight:700,color:'#fff',marginBottom:'20px',paddingBottom:'12px',borderBottom:'1px solid rgba(255,255,255,0.1)'}}>{c.t}</h3>{c.r.map(([l,v],j)=><div key={j} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderTop:j>0?'1px solid rgba(255,255,255,0.03)':'none'}}><span style={{fontSize:'0.88rem',color:'#9ca3af'}}>{l}</span><span style={{fontSize:'0.88rem',color:'#fff',fontWeight:600}}>{v}</span></div>)}</div>
                            ))}
                        </div>
                    </div>}
                </div>
            </main>
        </div>
    );
}
export default AdminDashboard;
