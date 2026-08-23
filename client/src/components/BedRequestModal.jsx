import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Building2, User, Phone, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function BedRequestModal({ isOpen, onClose, hospital, onBookingSuccess }) {
  const { user } = useAuth();
  const [bedType, setBedType] = useState('General');
  const [patientName, setPatientName] = useState(user ? user.name : '');
  const [patientPhone, setPatientPhone] = useState('+91 ');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !hospital) return null;

  const availableBeds = hospital.beds || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      setError('Please sign in or create a new account to submit a request.');
      return;
    }

    setLoading(true);
    setError('');

    // Create booking locally — no backend needed
    const booking = {
      _id: 'bk_' + Date.now(),
      uniquePatientId: 'PAT-2026-' + Math.floor(Math.random() * 9000 + 1000),
      hospitalId: hospital._id,
      hospitalName: hospital.name,
      bedType,
      patientName,
      patientPhone,
      notes,
      status: 'pending',
      createdAt: new Date().toISOString(),
      qrData: JSON.stringify({ hospital: hospital.name, bedType, patientName, patientPhone, ts: Date.now() }),
    };

    setTimeout(() => {
      onBookingSuccess(booking);
      onClose();
      setLoading(false);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-brand-600 rounded-xl">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">{hospital.name}</h3>
              <p className="text-xs text-slate-400">Request Bed Admission Reservation</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Select Bed Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Bed Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['General', 'Oxygen', 'ICU', 'Ventilator'].map((type) => {
                const bedObj = availableBeds.find((b) => b.type === type);
                const count = bedObj ? Math.max(0, bedObj.total - bedObj.occupied) : 0;
                const price = bedObj ? bedObj.pricePerDay : 0;
                const isAvailable = count > 0;

                return (
                  <button
                    type="button"
                    key={type}
                    disabled={!isAvailable}
                    onClick={() => setBedType(type)}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      bedType === type
                        ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-500/20'
                        : isAvailable
                        ? 'border-slate-200 hover:border-slate-300 bg-white'
                        : 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-sm text-slate-900">{type}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {isAvailable ? `${count} Left` : 'Full'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-2 font-medium">₹{price} / day</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Patient Details */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" /> Patient Full Name
              </label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> Contact Phone Number
              </label>
              <input
                type="text"
                required
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                placeholder="+91 99887 76655"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" /> Medical Notes / Symptoms
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe current symptoms or special requirements..."
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-brand-600/30 flex items-center space-x-2 transition"
            >
              {loading ? (
                <span>Submitting Request...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Bed Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
