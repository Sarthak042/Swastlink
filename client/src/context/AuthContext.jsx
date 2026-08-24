import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

const API = 'https://swastlink-api.onrender.com/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser]   = useState(null);
  const [token, setToken] = useState(localStorage.getItem('swasthlink_token') || null);
  const [loading, setLoading] = useState(true);

  // On mount — restore session from stored token
  useEffect(() => {
    const restore = async () => {
      if (token) {
        try {
          const res = await fetch(`${API}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data.user || data);
          } else {
            logout();
          }
        } catch {
          // Render may be sleeping — keep token, try again on next action
        }
      }
      setLoading(false);
    };
    restore();
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('swasthlink_token', authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('swasthlink_token');
  };

  // Sign in via Render backend → MongoDB
  const signIn = async (email, password) => {
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, message: data.message || 'Invalid email or password.' };
      login(data.user, data.token);
      return { ok: true };
    } catch {
      return { ok: false, message: 'Cannot reach server. Check your internet connection.' };
    }
  };

  // Register via Render backend → MongoDB
  const register = async (userData) => {
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, message: data.message || 'Registration failed.' };
      login(data.user, data.token);
      return { ok: true };
    } catch {
      return { ok: false, message: 'Cannot reach server. Check your internet connection.' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, signIn, register, API }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
