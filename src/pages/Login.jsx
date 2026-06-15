import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ParticleBackground from '../components/ParticleBackground.jsx';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        if (!email.trim()) { setError('Please enter your email'); return; }
        if (!password) { setError('Please enter your password'); return; }

        setLoading(true);
        const result = await login(email.trim(), password);
        setLoading(false);

        if (!result.success) { setError(result.message); return; }
        // role 2 = Admin, role 1 = User/Student
        navigate(result.role === 2 ? '/admin' : '/student');
    };

    return (
        <div className="relative min-h-screen overflow-hidden"
             style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #1a1145 30%, #302b63 60%, #24243e 100%)' }}>
            <ParticleBackground />

            {/* Gradient Orbs */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none"
                 style={{ background: 'rgba(99, 102, 241, 0.2)' }} />
            <div className="absolute bottom-[-15%] right-[-10%] w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none"
                 style={{ background: 'rgba(168, 85, 247, 0.2)' }} />

            {/* Centered Layout */}
            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
                <div className="w-full" style={{ maxWidth: '440px' }}>

                    {/* Hero */}
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <span style={{
                            display: 'inline-block', padding: '8px 20px', borderRadius: '50px',
                            fontSize: '0.85rem', fontWeight: 600,
                            background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.25)',
                            color: '#818cf8', marginBottom: '20px'
                        }}>
                            🎓 Campus Events
                        </span>
                        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: '16px' }}>
                            Event<span style={{
                                background: 'linear-gradient(to right, #818cf8, #a855f7, #ec4899)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                            }}>Hub</span>
                        </h1>
                        <p style={{ color: '#9ca3af', fontSize: '1.05rem', maxWidth: '450px', margin: '0 auto' }}>
                            Your one-stop platform for college event management and registration
                        </p>
                    </div>

                    {/* Login Form */}
                    <div className="glass-strong" style={{
                        borderRadius: '16px', padding: '36px 32px'
                    }}>
                        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', marginBottom: '28px' }}>
                            🔐 Login
                        </h2>

                        <form onSubmit={handleLogin}>
                            <div style={{ marginBottom: '20px' }}>
                                <label htmlFor="login-email" style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#9ca3af', marginBottom: '8px' }}>
                                    Email Address
                                </label>
                                <input
                                    id="login-email" type="email" placeholder="you@college.edu"
                                    value={email} onChange={(e) => setEmail(e.target.value)}
                                    style={{
                                        width: '100%', padding: '12px 16px', borderRadius: '12px',
                                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                        color: '#fff', fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit',
                                        boxSizing: 'border-box', transition: 'border-color 0.3s'
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label htmlFor="login-password" style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#9ca3af', marginBottom: '8px' }}>
                                    Password
                                </label>
                                <input
                                    id="login-password" type="password" placeholder="Enter your password"
                                    value={password} onChange={(e) => setPassword(e.target.value)}
                                    style={{
                                        width: '100%', padding: '12px 16px', borderRadius: '12px',
                                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                        color: '#fff', fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit',
                                        boxSizing: 'border-box', transition: 'border-color 0.3s'
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                />
                            </div>

                            {error && <p style={{ color: '#f87171', fontSize: '0.84rem', fontWeight: 500, marginBottom: '16px' }}>{error}</p>}

                            <button type="submit" disabled={loading} style={{
                                width: '100%', padding: '13px', borderRadius: '12px',
                                background: 'linear-gradient(to right, #6366f1, #a855f7, #ec4899)',
                                color: '#fff', fontWeight: 700, fontSize: '0.95rem', border: 'none',
                                cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', marginTop: '4px',
                                transition: 'all 0.3s ease', opacity: loading ? 0.7 : 1
                            }}
                            onMouseEnter={e => e.target.style.boxShadow = '0 6px 30px rgba(99,102,241,0.4)'}
                            onMouseLeave={e => e.target.style.boxShadow = 'none'}>
                                {loading ? 'Logging in...' : "Let's Go"}
                            </button>
                        </form>

                        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#6b7280', marginTop: '20px' }}>
                            Don&apos;t have an account?{' '}
                            <Link to="/signup" style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>Sign up here</Link>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <footer style={{ padding: '32px 0 16px', color: '#4b5563', fontSize: '0.82rem', textAlign: 'center' }}>
                    <p>© 2026 EventHub — Built for Campus Communities</p>
                </footer>
            </div>
        </div>
    );
}

export default Login;
