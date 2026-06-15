import { useState } from 'react';
import { useEvents } from '../context/EventContext.jsx';

function RegistrationModal({ eventName, studentName, studentEmail, onClose }) {
    const [step, setStep] = useState(1);
    const [name, setName] = useState(studentName);
    const [email, setEmail] = useState(studentEmail || '');
    const [phone, setPhone] = useState('');
    const [errors, setErrors] = useState({});
    const { addRegistration } = useEvents();

    const validateStep = () => {
        const newErrors = {};
        if (step === 1 && !name.trim()) newErrors.name = 'Name is required';
        if (step === 2 && !email.trim()) newErrors.email = 'Email is required';
        else if (step === 2 && !/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Enter a valid email';
        if (step === 3 && !phone.trim()) newErrors.phone = 'Phone number is required';
        else if (step === 3 && !/^\d{10}$/.test(phone.replace(/\D/g, ''))) newErrors.phone = 'Enter a valid 10-digit phone number';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => { if (validateStep()) setStep((prev) => prev + 1); };
    const handleBack = () => { setErrors({}); setStep((prev) => prev - 1); };
    const handleSubmit = () => {
        if (validateStep()) {
            addRegistration({ studentName: name.trim(), eventName, email: email.trim(), phone: phone.trim() });
            onClose();
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    const inputStyle = (hasError) => ({
        width: '100%', padding: '12px 16px', borderRadius: '12px',
        background: 'rgba(255,255,255,0.05)',
        border: `1px solid ${hasError ? '#f87171' : 'rgba(255,255,255,0.1)'}`,
        color: '#fff', fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit',
        boxSizing: 'border-box', transition: 'border-color 0.3s'
    });

    const stepLabels = ['NAME', 'EMAIL', 'PHONE'];

    return (
        <div onClick={handleOverlayClick} style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px'
        }}>
            <div className="glass-strong" style={{
                borderRadius: '20px', width: '100%', maxWidth: '440px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)', overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '28px 28px 16px' }}>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Event Registration</h2>
                        <p style={{ fontSize: '0.88rem', color: '#818cf8', fontWeight: 500 }}>📌 {eventName}</p>
                    </div>
                    <button onClick={onClose} style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        color: '#9ca3af', fontSize: '1rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>✕</button>
                </div>

                {/* Step Indicator */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '40px', padding: '0 28px 24px', position: 'relative' }}>
                    {[1, 2, 3].map((s) => (
                        <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 10 }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.9rem', fontWeight: 700, transition: 'all 0.3s',
                                ...(s === step ? {
                                    background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff',
                                    border: '2px solid #818cf8', boxShadow: '0 0 20px rgba(99,102,241,0.3)'
                                } : s < step ? {
                                    background: '#10b981', color: '#fff', border: '2px solid #34d399'
                                } : {
                                    background: 'rgba(255,255,255,0.05)', color: '#6b7280', border: '2px solid rgba(255,255,255,0.1)'
                                })
                            }}>
                                {s < step ? '✓' : s}
                            </div>
                            <span style={{
                                fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px',
                                color: s === step ? '#818cf8' : '#4b5563'
                            }}>{stepLabels[s - 1]}</span>
                        </div>
                    ))}
                    {/* Connector line */}
                    <div style={{
                        position: 'absolute', top: '20px', left: '110px', right: '110px',
                        height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', zIndex: 0
                    }}>
                        <div style={{
                            height: '100%', borderRadius: '4px', transition: 'width 0.4s',
                            background: 'linear-gradient(to right, #6366f1, #a855f7)',
                            width: `${((step - 1) / 2) * 100}%`
                        }} />
                    </div>
                </div>

                {/* Body */}
                <div style={{ padding: '0 28px 24px' }}>
                    {step === 1 && (
                        <div>
                            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#9ca3af', marginBottom: '8px' }}>Full Name</label>
                            <input type="text" placeholder="Enter your full name" value={name}
                                onChange={(e) => setName(e.target.value)} style={inputStyle(errors.name)}
                                onFocus={e => { if (!errors.name) e.target.style.borderColor = '#6366f1'; }}
                                onBlur={e => { if (!errors.name) e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }} />
                            {errors.name && <p style={{ color: '#f87171', fontSize: '0.8rem', fontWeight: 500, marginTop: '8px' }}>{errors.name}</p>}
                        </div>
                    )}
                    {step === 2 && (
                        <div>
                            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#9ca3af', marginBottom: '8px' }}>Email Address</label>
                            <input type="email" placeholder="you@college.edu" value={email}
                                onChange={(e) => setEmail(e.target.value)} style={inputStyle(errors.email)}
                                onFocus={e => { if (!errors.email) e.target.style.borderColor = '#6366f1'; }}
                                onBlur={e => { if (!errors.email) e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }} />
                            {errors.email && <p style={{ color: '#f87171', fontSize: '0.8rem', fontWeight: 500, marginTop: '8px' }}>{errors.email}</p>}
                        </div>
                    )}
                    {step === 3 && (
                        <div>
                            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#9ca3af', marginBottom: '8px' }}>Phone Number</label>
                            <input type="tel" placeholder="10-digit phone number" value={phone}
                                onChange={(e) => setPhone(e.target.value)} style={inputStyle(errors.phone)}
                                onFocus={e => { if (!errors.phone) e.target.style.borderColor = '#6366f1'; }}
                                onBlur={e => { if (!errors.phone) e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }} />
                            {errors.phone && <p style={{ color: '#f87171', fontSize: '0.8rem', fontWeight: 500, marginTop: '8px' }}>{errors.phone}</p>}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: step > 1 ? 'space-between' : 'flex-end',
                    padding: '20px 28px', borderTop: '1px solid rgba(255,255,255,0.1)'
                }}>
                    {step > 1 && (
                        <button onClick={handleBack} style={{
                            padding: '10px 24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
                            background: 'transparent', color: '#9ca3af', fontSize: '0.88rem', fontWeight: 600,
                            cursor: 'pointer', fontFamily: 'inherit'
                        }}>← Back</button>
                    )}

                    {step < 3 ? (
                        <button onClick={handleNext} style={{
                            padding: '10px 24px', borderRadius: '12px', border: 'none',
                            background: 'linear-gradient(to right, #6366f1, #a855f7)',
                            color: '#fff', fontSize: '0.88rem', fontWeight: 700,
                            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.3s'
                        }}>Next →</button>
                    ) : (
                        <button onClick={handleSubmit} style={{
                            padding: '10px 24px', borderRadius: '12px', border: 'none',
                            background: 'linear-gradient(to right, #10b981, #14b8a6)',
                            color: '#fff', fontSize: '0.88rem', fontWeight: 700,
                            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.3s'
                        }}>✓ Submit Registration</button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default RegistrationModal;
