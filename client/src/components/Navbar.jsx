import React from 'react';
import { Activity, ShieldAlert, Building2, Pill, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activeTab, setActiveTab, onOpenAuthModal, onOpenSOSModal, onOpenMedicineSearchModal }) {
  const { user, logout } = useAuth();

  const handleTabChange = (targetTab) => {
    if (user) {
      if (targetTab === 'patient' && user.role !== 'patient') {
        logout();
      } else if (targetTab === 'admin' && user.role !== 'hospital_admin') {
        logout();
      } else if (targetTab === 'pharmacy' && user.role !== 'pharmacy_admin') {
        logout();
      }
    }
    setActiveTab(targetTab);
  };

  const handleLogoClick = () => {
    if (user) {
      if (user.role === 'hospital_admin') setActiveTab('admin');
      else if (user.role === 'pharmacy_admin') setActiveTab('pharmacy');
      else setActiveTab('patient');
    } else {
      setActiveTab('patient');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={handleLogoClick}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xl tracking-tight text-white">SwasthLink</span>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Live
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Healthcare Resource Visibility Platform</p>
            </div>
          </div>

          {/* Role-Restricted Portal Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {/* Show Patient Portal button if not logged in OR if logged in as patient */}
            {(!user || user.role === 'patient') && (
              <button
                onClick={() => handleTabChange('patient')}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'patient'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                Patient Portal
              </button>
            )}

            {/* Show Hospital Admin button if not logged in OR if logged in as hospital_admin */}
            {(!user || user.role === 'hospital_admin') && (
              <button
                onClick={() => handleTabChange('admin')}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Hospital Admin</span>
              </button>
            )}

            {/* Show Pharmacy Portal button if not logged in OR if logged in as pharmacy_admin */}
            {(!user || user.role === 'pharmacy_admin') && (
              <button
                onClick={() => handleTabChange('pharmacy')}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5 ${
                  activeTab === 'pharmacy'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Pill className="w-4 h-4" />
                <span>Pharmacy Portal</span>
              </button>
            )}
          </nav>

          {/* Action Tools & Account Control */}
          <div className="flex items-center space-x-3">
            {/* Pharmacy Medicine Search Trigger */}
            <button
              onClick={onOpenMedicineSearchModal}
              className="hidden lg:flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 transition"
            >
              <Pill className="w-3.5 h-3.5 text-teal-400" />
              <span>Medicine Finder</span>
            </button>

            {/* Emergency SOS Button */}
            <button
              onClick={onOpenSOSModal}
              className="bg-red-600 hover:bg-red-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-lg shadow-red-600/30 flex items-center space-x-1.5 animate-pulse-red transition"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>SOS EMERGENCY</span>
            </button>

            {/* Auth Profile / Sign In */}
            {user ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-700">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold text-white leading-tight">{user.name}</div>
                  <div className="text-[10px] text-teal-400 capitalize font-medium">{user.role.replace('_', ' ')}</div>
                </div>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition flex items-center gap-1 text-xs"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow"
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
