import React, { useState, useEffect } from 'react';
import { X, Activity, User, Building2, Pill, Lock, Mail, Phone, MapPin, Link2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginRegister({ isOpen, onClose }) {
  const { signIn, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('patient');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [pharmacyName, setPharmacyName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Pune');
  const [googleMapLink, setGoogleMapLink] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Clear fields whenever modal opens or tab toggles
  useEffect(() => {
    if (isOpen) {
      resetFields();
    }
  }, [isOpen, isLogin]);

  const resetFields = () => {
    setEmail('');
    setPassword('');
    setName('');
    setHospitalName('');
    setPharmacyName('');
    setAddress('');
    setCity('Pune');
    setGoogleMapLink('');
    setContactNumber('');
    setError('');
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let result;
    if (isLogin) {
      result = signIn(email, password);
    } else {
      result = register({
        name,
        email,
        password,
        role,
        hospitalName,
        pharmacyName,
        address,
        city,
        googleMapLink,
        contactNumber,
      });
    }

    if (result.ok) {
      resetFields();
      onClose();
    } else {
      setError(result.message || 'Authentication failed');
    }
    setLoading(false);
  };

  // Determine background image based on selected role
  const bgImage = role === 'pharmacy_admin' ? '/images/pharmacy_bg.jpg' : '/images/hospital_bg.jpg';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        {/* HD Visual Hero Header Banner */}
        <div className="relative h-44 w-full overflow-hidden bg-slate-900 text-white flex flex-col justify-between p-6">
          {/* HD Light Background Image with Smooth Gradient Overlay */}
          <img
            src={bgImage}
            alt="Medical Background"
            className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity scale-105 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/70 to-slate-900/30"></div>

          {/* Banner Top Row */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600/90 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/20">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-extrabold tracking-wider uppercase text-teal-300">SwasthLink Portal</span>
            </div>
            <button
              onClick={onClose}
              className="text-slate-300 hover:text-white p-1.5 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Banner Bottom Row Title */}
          <div className="relative z-10">
            <h3 className="font-extrabold text-xl text-white tracking-tight leading-snug">
              {isLogin
                ? 'Sign In to SwasthLink'
                : role === 'hospital_admin'
                ? 'Hospital Partner Registration'
                : role === 'pharmacy_admin'
                ? 'Pharmacy Partner Registration'
                : 'Create Patient Account'}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              {isLogin
                ? 'Access real-time resource visibility & inventory management'
                : role === 'hospital_admin'
                ? 'Broadcast live bed availability & emergency ICU capacity'
                : role === 'pharmacy_admin'
                ? 'Sync medicine stock, generic formulas & prescription scanning'
                : 'Search live hospital beds, vaccines & pharmacy locator'}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              resetFields();
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              resetFields();
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              !isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Register Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white max-h-[65vh] overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl font-medium">
              {error}
            </div>
          )}

          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select Account Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'patient', label: 'Patient', icon: User },
                  { id: 'hospital_admin', label: 'Hospital', icon: Building2 },
                  { id: 'pharmacy_admin', label: 'Pharmacy', icon: Pill },
                ].map((r) => {
                  const Icon = r.icon;
                  return (
                    <button
                      type="button"
                      key={r.id}
                      onClick={() => setRole(r.id)}
                      className={`p-2.5 rounded-xl border text-center text-xs font-bold flex flex-col items-center justify-center space-y-1 transition ${
                        role === r.id
                          ? 'border-brand-600 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{r.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          )}

          {!isLogin && role === 'hospital_admin' && (
            <div className="space-y-3 pt-1 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Hospital Name</label>
                <input
                  type="text"
                  required
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  placeholder="e.g. Ruby Hall Clinic"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Pune"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Emergency Phone</label>
                  <input
                    type="text"
                    required
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="+91 20 6645 5100"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Hospital Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Sasoon Road, Sangamvadi, Pune"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center justify-between">
                  <span>Google Maps Link</span>
                  <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="url"
                  value={googleMapLink}
                  onChange={(e) => setGoogleMapLink(e.target.value)}
                  placeholder="https://maps.google.com/?q=..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {!isLogin && role === 'pharmacy_admin' && (
            <div className="space-y-3 pt-1 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Pharmacy Name</label>
                <input
                  type="text"
                  required
                  value={pharmacyName}
                  onChange={(e) => setPharmacyName(e.target.value)}
                  placeholder="e.g. Apollo Pharmacy 24/7"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Pune"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="+91 20 2544 1122"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Pharmacy Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Shop 4, Karve Road, Kothrud, Pune"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center justify-between">
                  <span>Google Maps Link</span>
                  <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="url"
                  value={googleMapLink}
                  onChange={(e) => setGoogleMapLink(e.target.value)}
                  placeholder="https://maps.google.com/?q=..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-brand-600/30"
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In to Account' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
