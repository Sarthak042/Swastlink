import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

// ── Static demo users — no backend / MongoDB needed ──────────────────────────
const DEMO_USERS = [
  { _id: 'u1', name: 'Rahul Sharma', email: 'patient@demo.com',         password: 'password123', role: 'patient'         },
  { _id: 'u2', name: 'Dr. Ananya Roy',    email: 'admin@rubyhall.com',      password: 'password123', role: 'hospital_admin'  },
  { _id: 'u3', name: 'Dr. Vikram Sethi',  email: 'admin@sahyadri.com',      password: 'password123', role: 'hospital_admin'  },
  { _id: 'u4', name: 'Dr. Rajesh Patel',  email: 'admin@manipal.com',       password: 'password123', role: 'hospital_admin'  },
  { _id: 'u5', name: 'Suresh Kumar',      email: 'admin@apollopharma.com',  password: 'password123', role: 'pharmacy_admin'  },
];

// In-memory registered users (persisted to sessionStorage so page refresh works)
const getRegisteredUsers = () => {
  try { return JSON.parse(sessionStorage.getItem('swasthlink_users') || '[]'); } catch { return []; }
};
const saveRegisteredUsers = (users) => {
  sessionStorage.setItem('swasthlink_users', JSON.stringify(users));
};

// ── Shared hospital registry — visible to all patients ────────────────────────
export const getRegisteredHospitals = () => {
  try { return JSON.parse(sessionStorage.getItem('swasthlink_hospitals') || '[]'); } catch { return []; }
};
const saveHospital = (user) => {
  if (user.role !== 'hospital_admin' || !user.hospitalName) return;
  const existing = getRegisteredHospitals();
  // avoid duplicates
  if (existing.find((h) => h.adminEmail === user.email)) return;
  const newHospital = {
    _id: 'h_' + user._id,
    adminEmail: user.email,
    name: user.hospitalName,
    address: user.address || '',
    city: user.city || '',
    contactNumber: user.contactNumber || '',
    googleMapLink: user.googleMapLink || '',
    lat: 18.5204, lng: 73.8567, // default Pune coords
    trustScore: 4.5,
    distance: 5.0,
    beds: [
      { type: 'General',    total: 20, occupied: 0, pricePerDay: 1500 },
      { type: 'Oxygen',     total: 10, occupied: 0, pricePerDay: 2500 },
      { type: 'ICU',        total: 5,  occupied: 0, pricePerDay: 6000 },
      { type: 'Ventilator', total: 3,  occupied: 0, pricePerDay: 9000 },
    ],
  };
  sessionStorage.setItem('swasthlink_hospitals', JSON.stringify([...existing, newHospital]));
};

const makeToken = (user) => btoa(JSON.stringify({ id: user._id, role: user.role, exp: Date.now() + 86400000 }));

export const AuthProvider = ({ children }) => {
  const [user, setUser]     = useState(null);
  const [token, setToken]   = useState(localStorage.getItem('swasthlink_token') || null);
  const [loading, setLoading] = useState(true);

  // On mount, restore session from localStorage token
  useEffect(() => {
    if (token) {
      try {
        const { id } = JSON.parse(atob(token));
        const allUsers = [...DEMO_USERS, ...getRegisteredUsers()];
        const found = allUsers.find((u) => u._id === id);
        if (found) {
          const { password: _, ...safe } = found;
          setUser(safe);
        } else {
          logout();
        }
      } catch {
        logout();
      }
    }
    setLoading(false);
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

  // Called by LoginRegister for normal sign-in
  const signIn = (email, password) => {
    const allUsers = [...DEMO_USERS, ...getRegisteredUsers()];
    const found = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!found) return { ok: false, message: 'Invalid email or password.' };
    const { password: _, ...safe } = found;
    const tok = makeToken(found);
    login(safe, tok);
    return { ok: true };
  };

  // Called by LoginRegister for registration
  const register = (userData) => {
    const allUsers = [...DEMO_USERS, ...getRegisteredUsers()];
    if (allUsers.find((u) => u.email.toLowerCase() === userData.email.toLowerCase())) {
      return { ok: false, message: 'An account with this email already exists.' };
    }
    const newUser = { _id: 'u_' + Date.now(), ...userData };
    const registered = getRegisteredUsers();
    saveRegisteredUsers([...registered, newUser]);
    // If hospital admin, publish their hospital to the shared registry for patients
    saveHospital(newUser);
    const { password: _, ...safe } = newUser;
    const tok = makeToken(newUser);
    login(safe, tok);
    return { ok: true };
  };

  // Quick demo login for any role
  const demoLogin = (role) => {
    const demos = { patient: 'patient@demo.com', hospital_admin: 'admin@rubyhall.com', pharmacy_admin: 'admin@apollopharma.com' };
    signIn(demos[role] || demos.patient, 'password123');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, signIn, register, demoLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
