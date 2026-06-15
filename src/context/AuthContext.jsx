import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

const API_BASE = 'http://localhost:8003';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem('eventhub_user');
            return stored ? JSON.parse(stored) : null;
        } catch { return null; }
    });

    useEffect(() => {
        if (user) {
            localStorage.setItem('eventhub_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('eventhub_user');
        }
    }, [user]);

    const signup = async (name, email, phone, password) => {
        try {
            const response = await fetch(API_BASE + '/authservice/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullname: name, email, phone, password })
            });
            const data = await response.json();
            if (data.code === 200) {
                return { success: true, message: data.message };
            } else {
                return { success: false, message: data.message || 'Signup failed' };
            }
        } catch (err) {
            return { success: false, message: 'Server error. Please try again.' };
        }
    };

    const login = async (email, password) => {
        try {
            const response = await fetch(API_BASE + '/authservice/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: email, password })
            });
            const data = await response.json();
            if (data.code === 200) {
                localStorage.setItem('token', data.jwt);
                // Fetch user info using the JWT
                const uinfoRes = await fetch(API_BASE + '/authservice/uinfo', {
                    method: 'GET',
                    headers: { 'Token': data.jwt }
                });
                const uinfo = await uinfoRes.json();
                if (uinfo.code === 200) {
                    // Decode role from JWT (role is stored in the token)
                    // Parse the JWT payload to get the role
                    const tokenParts = data.jwt.split('.');
                    const payload = JSON.parse(atob(tokenParts[1]));
                    const role = payload.role;
                    const userObj = {
                        name: uinfo.fullname,
                        email: email,
                        role: role,  // integer: 1=User, 2=Admin
                        menulist: uinfo.menulist
                    };
                    setUser(userObj);
                    return { success: true, role: role };
                } else {
                    return { success: false, message: uinfo.message || 'Failed to load user info' };
                }
            } else {
                return { success: false, message: data.message || 'Invalid Credentials' };
            }
        } catch (err) {
            return { success: false, message: 'Server error. Please try again.' };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('eventhub_user');
    };

    return (
        <AuthContext.Provider value={{ user, signup, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}

export default AuthContext;
