import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import PatientDashboard from './pages/PatientDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PharmacyPortal from './pages/PharmacyPortal';
import EmergencySOSModal from './components/EmergencySOSModal';
import MedicineSearchModal from './components/MedicineSearchModal';
import LoginRegister from './pages/LoginRegister';

function AppContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('patient'); // 'patient' | 'admin' | 'pharmacy'
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [medicineModalOpen, setMedicineModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Auto-lock active tab to user's role upon login
  useEffect(() => {
    if (user) {
      if (user.role === 'hospital_admin') {
        setActiveTab('admin');
      } else if (user.role === 'pharmacy_admin') {
        setActiveTab('pharmacy');
      } else if (user.role === 'patient') {
        setActiveTab('patient');
      }
    }
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Header Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onOpenSOSModal={() => setSosModalOpen(true)}
        onOpenMedicineSearchModal={() => setMedicineModalOpen(true)}
      />

      {/* Main Dashboard Pages */}
      <main className="flex-1">
        {activeTab === 'patient' && (
          <PatientDashboard onOpenSOSModal={() => setSosModalOpen(true)} />
        )}
        {activeTab === 'admin' && <AdminDashboard onOpenAuthModal={() => setAuthModalOpen(true)} />}
        {activeTab === 'pharmacy' && <PharmacyPortal onOpenAuthModal={() => setAuthModalOpen(true)} />}
      </main>

      {/* Global Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-6 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white">SwasthLink</span>
            <span>— HackVenture 2K26 Healthcare Domain</span>
          </div>
          <div>
            Real-Time Resource Visibility • Bed Tracking • Vaccine Stock • Emergency SOS • Pharmacy Locator
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <EmergencySOSModal
        isOpen={sosModalOpen}
        onClose={() => setSosModalOpen(false)}
      />

      <MedicineSearchModal
        isOpen={medicineModalOpen}
        onClose={() => setMedicineModalOpen(false)}
      />

      <LoginRegister
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <AppContent />
      </SocketProvider>
    </AuthProvider>
  );
}
