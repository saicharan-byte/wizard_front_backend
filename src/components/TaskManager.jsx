import { useState, useEffect, useRef } from 'react';

const API_BASE = 'http://localhost:8003';

function TaskManager() {
    const [tasks, setTasks] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [taskData, setTaskData] = useState(null);
    const [errors, setErrors] = useState({});
    const [searchValue, setSearchValue] = useState('');
    const [options, setOptions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [highlightIndex, setHighlightIndex] = useState(-1);
    const titleRef = useRef();
    const size = 5;

    useEffect(() => { loadTasks(1); }, []);

    const token = localStorage.getItem('token') || '';

    function loadTasks(p) {
        setLoading(true);
        setPage(p);
        fetch(API_BASE + `/taskservice/getalltasks/${p}/${size}`, {
            headers: { 'Token': token }
        })
        .then(res => res.json())
        .then(data => {
            if (data.code === 200) {
                setTasks(data.tasks || []);
                setTotalPages(data.totalpages || 1);
            }
            setLoading(false);
        })
        .catch(() => setLoading(false));
    }

    function addTask() {
        setErrors({});
        setTaskData({ id: '', title: '', description: '', createdby: 0, assignedto: '', priority: 0, deadline: '', status: 0 });
        setSearchValue('');
        setOptions([]);
        setShowPopup(true);
        setTimeout(() => titleRef.current?.focus(), 0);
    }

    function handleInput(e) {
        const { name, value } = e.target;
        setTaskData({ ...taskData, [name]: value });
    }

    function searchUser(e) {
        const { value } = e.target;
        setSearchValue(value);
        if (value.length === 0) { setOptions([]); setTaskData({ ...taskData, assignedto: '' }); setShowDropdown(false); return; }
        if (value.length % 2 === 0) {
            fetch(API_BASE + `/authservice/searchuser/${value}`, { headers: { 'Token': token } })
            .then(r => r.json())
            .then(res => { setHighlightIndex(-1); setOptions(res.users || []); setShowDropdown((res.users || []).length > 0); });
        }
    }

    function selectUser(user) {
        setSearchValue(user.fullname + ' (' + user.email + ')');
        setTaskData({ ...taskData, assignedto: user.id });
        setShowDropdown(false);
    }

    function completeSearchUser() {
        setShowDropdown(false);
        if (options.length === 0) return;
        const index = highlightIndex >= 0 ? highlightIndex : 0;
        const user = options[index];
        setSearchValue(user.fullname + ' (' + user.email + ')');
        setTaskData({ ...taskData, assignedto: user.id });
    }

    function handleKeyDown(e) {
        if (!showDropdown || options.length === 0) return;
        if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightIndex(i => i < options.length - 1 ? i + 1 : 0); }
        if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightIndex(i => i > 0 ? i - 1 : options.length - 1); }
        if (e.key === 'Enter') { e.preventDefault(); if (highlightIndex >= 0) selectUser(options[highlightIndex]); }
    }

    function validateData() {
        let err = {};
        if (!taskData?.title) err.title = true;
        if (!taskData?.description) err.description = true;
        if (!searchValue) err.assignedto = true;
        if (taskData?.deadline === '') err.deadline = true;
        setErrors(err);
        return Object.keys(err).length > 0;
    }

    function saveTask() {
        if (validateData()) return;
        setLoading(true);
        const isNew = taskData?.id === '';
        const method = isNew ? 'POST' : 'PUT';
        const url = isNew ? API_BASE + '/taskservice/createtask' : API_BASE + '/taskservice/updatetask/' + taskData?._id;
        fetch(url, {
            method, headers: { 'Content-Type': 'application/json', 'Token': token },
            body: JSON.stringify(taskData)
        })
        .then(r => r.json())
        .then(res => {
            alert(res.message);
            setLoading(false);
            if (res.code === 200) { setShowPopup(false); setTaskData(null); loadTasks(page); }
        })
        .catch(() => setLoading(false));
    }

    function editTask(id) {
        setLoading(true);
        setErrors({});
        fetch(API_BASE + '/taskservice/gettask/' + id, { headers: { 'Token': token } })
        .then(r => r.json())
        .then(res => {
            if (res.code !== 200) { alert(res.message); setLoading(false); return; }
            setTaskData(res.task);
            fetch(API_BASE + '/authservice/getuser/' + res.task?.assignedto, { headers: { 'Token': token } })
            .then(r2 => r2.json())
            .then(r2 => {
                setSearchValue((r2.user?.fullname || '') + ' (' + (r2.user?.email || '') + ')');
                setOptions([]);
                setShowPopup(true);
                setTimeout(() => titleRef.current?.focus(), 0);
                setLoading(false);
            });
        });
    }

    function deleteTask(id) {
        if (!confirm('Are you sure you want to delete this task?')) return;
        setLoading(true);
        fetch(API_BASE + '/taskservice/deletetask/' + id, { method: 'DELETE', headers: { 'Token': token } })
        .then(r => r.json())
        .then(res => { alert(res.message); loadTasks(page); });
    }

    const priorityLabel = (p) => p == 1 ? 'High' : 'Normal';
    const statusLabel = (s) => s == 0 ? 'Assigned' : s == 1 ? 'In-Progress' : 'Completed';
    const priorityColor = (p) => p == 1 ? '#f87171' : '#34d399';
    const statusColor = (s) => s == 0 ? '#818cf8' : s == 1 ? '#fbbf24' : '#34d399';

    const iS = { width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' };
    const errStyle = { border: '1px solid #f87171', background: 'rgba(248,113,113,0.08)' };

    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>📝 Task Manager</h1>
                <p style={{ fontSize: '0.95rem', color: '#9ca3af' }}>Create, assign, and manage tasks stored in MongoDB Atlas.</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <button onClick={addTask} style={{ padding: '10px 24px', borderRadius: '12px', background: 'linear-gradient(to right,#6366f1,#a855f7)', color: '#fff', fontWeight: 600, fontSize: '0.9rem', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>+ New Task</button>
                {loading && <span style={{ color: '#818cf8', fontSize: '0.85rem' }}>Loading...</span>}
            </div>

            {tasks.length === 0 ? (
                <div className="glass" style={{ borderRadius: '16px', padding: '40px', textAlign: 'center', color: '#6b7280' }}>No tasks yet. Click "+ New Task" to create one.</div>
            ) : (
                <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden', marginBottom: '20px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead><tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                            {['#', 'Title', 'Description', 'Priority', 'Deadline', 'Status', 'Actions'].map(h =>
                                <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: '#9ca3af', fontSize: '0.8rem', textTransform: 'uppercase' }}>{h}</th>
                            )}
                        </tr></thead>
                        <tbody>{tasks.map((t, i) => (
                            <tr key={t._id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '12px 16px', color: '#6b7280', fontWeight: 600 }}>{(page - 1) * size + i + 1}</td>
                                <td style={{ padding: '12px 16px', color: '#fff', fontWeight: 600 }}>{t.title}</td>
                                <td style={{ padding: '12px 16px', color: '#d1d5db', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description}</td>
                                <td style={{ padding: '12px 16px' }}><span style={{ padding: '3px 12px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600, background: `${priorityColor(t.priority)}20`, color: priorityColor(t.priority) }}>{priorityLabel(t.priority)}</span></td>
                                <td style={{ padding: '12px 16px', color: '#c084fc', fontSize: '0.85rem', fontWeight: 600 }}>{t.deadline}</td>
                                <td style={{ padding: '12px 16px' }}><span style={{ padding: '3px 12px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600, background: `${statusColor(t.status)}20`, color: statusColor(t.status) }}>{statusLabel(t.status)}</span></td>
                                <td style={{ padding: '12px 16px', display: 'flex', gap: '8px' }}>
                                    <button onClick={() => editTask(t._id)} style={{ padding: '5px 14px', borderRadius: '8px', border: '1px solid rgba(99,102,241,0.3)', background: 'transparent', color: '#818cf8', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>✏️</button>
                                    <button onClick={() => deleteTask(t._id)} style={{ padding: '5px 14px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', background: 'transparent', color: '#f87171', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>🗑️</button>
                                </td>
                            </tr>
                        ))}</tbody>
                    </table>
                </div>
            )}

            {totalPages > 1 && <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                {Array.from({ length: totalPages }, (_, i) => (
                    <button key={i} onClick={() => loadTasks(i + 1)} style={{ width: '36px', height: '36px', borderRadius: '10px', border: page === i + 1 ? 'none' : '1px solid rgba(255,255,255,0.1)', background: page === i + 1 ? 'linear-gradient(135deg,#6366f1,#a855f7)' : 'transparent', color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}>{i + 1}</button>
                ))}
            </div>}

            {showPopup && <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <div className="glass-strong" style={{ width: '460px', borderRadius: '16px', padding: '32px', position: 'relative' }}>
                    <button onClick={() => setShowPopup(false)} style={{ position: 'absolute', top: '12px', right: '16px', background: 'transparent', border: 'none', color: '#9ca3af', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '20px' }}>{taskData?.id === '' ? '✨ New Task' : '✏️ Update Task'}</h3>

                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#9ca3af', display: 'block', marginBottom: '6px' }}>Task Title*</label>
                    <input ref={titleRef} type="text" autoComplete="off" name="title" value={taskData?.title || ''} onChange={handleInput} style={{ ...iS, ...(errors.title ? errStyle : {}), marginBottom: '14px' }} />

                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#9ca3af', display: 'block', marginBottom: '6px' }}>Description*</label>
                    <textarea rows="2" name="description" value={taskData?.description || ''} onChange={handleInput} style={{ ...iS, ...(errors.description ? errStyle : {}), marginBottom: '14px', resize: 'vertical' }} />

                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#9ca3af', display: 'block', marginBottom: '6px' }}>Assigned To*</label>
                    <div style={{ position: 'relative', marginBottom: '14px' }}>
                        <input type="text" autoComplete="off" name="assignedto" value={searchValue} onChange={searchUser} onBlur={completeSearchUser} onKeyDown={handleKeyDown} style={{ ...iS, ...(errors.assignedto ? errStyle : {}) }} />
                        {showDropdown && <ul style={{ position: 'absolute', top: '100%', left: 0, width: '100%', background: 'rgba(15,12,41,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', maxHeight: '150px', overflowY: 'auto', listStyle: 'none', margin: '4px 0 0', padding: 0, zIndex: 999 }}>
                            {options.map((item, idx) => (
                                <li key={item.id} onMouseDown={() => selectUser(item)} style={{ padding: '10px 14px', cursor: 'pointer', color: '#fff', fontSize: '0.85rem', background: highlightIndex === idx ? 'rgba(99,102,241,0.2)' : 'transparent' }}>{item.fullname} ({item.email})</li>
                            ))}
                        </ul>}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                        <div>
                            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#9ca3af', display: 'block', marginBottom: '6px' }}>Priority*</label>
                            <select name="priority" value={taskData?.priority ?? 0} onChange={handleInput} style={{ ...iS, ...(errors.priority ? errStyle : {}) }}>
                                <option value={0}>Normal</option>
                                <option value={1}>High</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#9ca3af', display: 'block', marginBottom: '6px' }}>Status*</label>
                            <select name="status" value={taskData?.status ?? 0} onChange={handleInput} style={{ ...iS, ...(errors.status ? errStyle : {}) }}>
                                <option value={0}>Assigned</option>
                                <option value={1}>In-Progress</option>
                                <option value={2}>Completed</option>
                            </select>
                        </div>
                    </div>

                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#9ca3af', display: 'block', marginBottom: '6px' }}>Deadline*</label>
                    <input type="date" name="deadline" value={taskData?.deadline || ''} onChange={handleInput} style={{ ...iS, ...(errors.deadline ? errStyle : {}), marginBottom: '20px', colorScheme: 'dark' }} />

                    <button onClick={saveTask} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'linear-gradient(to right,#6366f1,#a855f7)', color: '#fff', fontWeight: 600, fontSize: '0.9rem', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                        {taskData?.id === '' ? '💾 Save Task' : '✅ Update Task'}
                    </button>
                </div>
            </div>}
        </div>
    );
}

export default TaskManager;
