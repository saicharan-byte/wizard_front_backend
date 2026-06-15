import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ParticleBackground from '../components/ParticleBackground.jsx';

function Signup() {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!name.trim()) { setError('Please enter your name'); return; }
        if (!phone.trim()) { setError('Please enter your phone number'); return; }
        if (!email.trim()) { setError('Please enter your email'); return; }
        if (!/\S+@\S+\.\S+/.test(email)) { setError('Please enter a valid email'); return; }
        if (!password) { setError('Please enter a password'); return; }
        if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
        if (password !== confirmPassword) { setError('Passwords do not match'); return; }

        setLoading(true);
        const result = await signup(name.trim(), email.trim(), phone.trim(), password);
        setLoading(false);

        if (!result.success) { setError(result.message); return; }
        setSuccess('Account created successfully! Redirecting to login...');
        setTimeout(() => navigate('/'), 1500);
    };

    const inputStyle = {
        width: '100%', padding: '12px 16px', borderRadius: '12px',
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        color: '#fff', fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit',
        boxSizing: 'border-box', transition: 'border-color 0.3s'
    };

    const labelStyle = {
        display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#9ca3af', marginBottom: '8px'
    };

    return (
        <div className="relative min-h-screen overflow-hidden"
             style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #1a1145 30%, #302b63 60%, #24243e 100%)' }}>
            <ParticleBackground />

            {/* Gradient Orbs */}
            <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none"
                 style={{ background: 'rgba(168, 85, 247, 0.2)' }} />
            <div className="absolute bottom-[-15%] left-[-10%] w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none"
                 style={{ background: 'rgba(99, 102, 241, 0.2)' }} />

            {/* Centered Layout */}
            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
                <div className="w-full" style={{ maxWidth: '520px' }}>

                    {/* Hero */}
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <span style={{
                            display: 'inline-block', padding: '8px 20px', borderRadius: '50px',
                            fontSize: '0.85rem', fontWeight: 600,
                            background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.25)',
                            color: '#c084fc', marginBottom: '20px'
                        }}>
                            🎓 Campus Events
                        </span>
                        <h1 style={{ fontSize: '2.8rem', fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: '12px' }}>
                            Create Your <span style={{
                                background: 'linear-gradient(to right, #c084fc, #f472b6, #818cf8)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                            }}>Account</span>
                        </h1>
                        <p style={{ color: '#9ca3af', fontSize: '0.95rem' }}>
                            Join EventHub to discover and register for exciting campus events
                        </p>
                    </div>

                    {/* Signup Card */}
                    <div className="glass-strong" style={{ borderRadius: '16px', padding: '36px 32px' }}>
                        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', marginBottom: '24px' }}>Sign Up</h2>

                        <form onSubmit={handleSignup}>
                            <div style={{ marginBottom: '18px' }}>
                                <label htmlFor="signup-name" style={labelStyle}>Full Name</label>
                                <input id="signup-name" type="text" placeholder="Enter your full name"
                                    value={name} onChange={(e) => setName(e.target.value)} style={inputStyle}
                                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                            </div>

                            <div style={{ marginBottom: '18px' }}>
                                <label htmlFor="signup-phone" style={labelStyle}>Phone Number</label>
                                <input id="signup-phone" type="tel" placeholder="Enter your phone number"
                                    value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle}
                                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                            </div>

                            <div style={{ marginBottom: '18px' }}>
                                <label htmlFor="signup-email" style={labelStyle}>Email Address</label>
                                <input id="signup-email" type="email" placeholder="you@college.edu"
                                    value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle}
                                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
                                <div>
                                    <label htmlFor="signup-password" style={labelStyle}>Password</label>
                                    <input id="signup-password" type="password" placeholder="Min 6 characters"
                                        value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle}
                                        onFocus={e => e.target.style.borderColor = '#6366f1'}
                                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                                </div>
                                <div>
                                    <label htmlFor="signup-confirm" style={labelStyle}>Confirm Password</label>
                                    <input id="signup-confirm" type="password" placeholder="Re-enter password"
                                        value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={inputStyle}
                                        onFocus={e => e.target.style.borderColor = '#6366f1'}
                                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                                </div>
                            </div>

                            {error && <p style={{ color: '#f87171', fontSize: '0.84rem', fontWeight: 500, marginBottom: '12px' }}>{error}</p>}
                            {success && <p style={{ color: '#34d399', fontSize: '0.84rem', fontWeight: 500, marginBottom: '12px' }}>{success}</p>}

                            <button type="submit" disabled={loading} style={{
                                width: '100%', padding: '13px', borderRadius: '12px',
                                background: 'linear-gradient(to right, #a855f7, #ec4899, #6366f1)',
                                color: '#fff', fontWeight: 700, fontSize: '0.95rem', border: 'none',
                                cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                                transition: 'all 0.3s ease', opacity: loading ? 0.7 : 1
                            }}
                            onMouseEnter={e => e.target.style.boxShadow = '0 6px 30px rgba(168,85,247,0.4)'}
                            onMouseLeave={e => e.target.style.boxShadow = 'none'}>
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </form>

                        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#6b7280', marginTop: '20px' }}>
                            Already have an account?{' '}
                            <Link to="/" style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>Login here</Link>
                        </p>
                    </div>
                </div>

                <footer style={{ padding: '24px 0 12px', color: '#4b5563', fontSize: '0.82rem', textAlign: 'center' }}>
                    <p>© 2026 EventHub — Built for Campus Communities</p>
                </footer>
            </div>
        </div>
    );
}

export default Signup;
