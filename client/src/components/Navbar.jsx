import React from 'react';
import { Activity, BedDouble, ShieldCheck, Pill, Siren, Search, LogIn, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const tabs = [
  { id: 'patient', label: 'Patient View', icon: BedDouble },
  { id: 'admin', label: 'Hospital Admin', icon: ShieldCheck },
  { id: 'pharmacy', label: 'Pharmacy', icon: Pill },
];

export default function Navbar({ activeTab, setActiveTab, onOpenAuthModal, onOpenSOSModal, onOpenMedicineSearchModal }) {
  const { user, logout, demoLogin } = useAuth();

  return (
    <header className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <Activity className="text-emerald-400 w-6 h-6" />
          <span className="text-white font-bold text-lg tracking-tight">SwasthLink</span>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150 ${
                activeTab === id
                  ? 'bg-emerald-500 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Medicine Search */}
          <button
            onClick={onOpenMedicineSearchModal}
            title="Search Medicine"
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Emergency SOS */}
          <button
            onClick={onOpenSOSModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition shadow"
          >
            <Siren className="w-4 h-4" />
            <span className="hidden sm:inline">SOS</span>
          </button>

          {/* Auth */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 rounded-lg text-sm text-slate-300">
                <User className="w-4 h-4 text-emerald-400" />
                <span className="max-w-[100px] truncate">{user.name || user.email}</span>
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-slate-700 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
