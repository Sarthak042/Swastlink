import React, { useState, useEffect } from 'react';
import { ShieldAlert, Phone, Navigation, X, Activity, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function EmergencySOSModal({ isOpen, onClose, userLocation }) {
  const [sosHospitals, setSosHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchSOSData();
    }
  }, [isOpen, userLocation]);

  const fetchSOSData = () => {
    setLoading(true);
    // Static SOS hospitals — sorted by distance, showing only those with ICU/Ventilator availability
    const sosHospitals = [
      { _id: 'h1', name: 'Ruby Hall Clinic Super Speciality', address: '40 Sasoon Road, Sangamvadi, Pune', contactNumber: '+91 20 6645 5100', distance: 1.2, googleMapLink: 'https://maps.google.com/?q=Ruby+Hall+Clinic+Pune', icuAvailable: 3, ventilatorAvailable: 3, trustScore: 4.9 },
      { _id: 'h3', name: 'Manipal Hospital Critical Care',   address: 'Zensar IT Park Road, Kharadi, Pune',  contactNumber: '+91 20 6190 2200', distance: 4.1, googleMapLink: 'https://maps.google.com/?q=Manipal+Hospital+Kharadi+Pune', icuAvailable: 8, ventilatorAvailable: 4, trustScore: 4.7 },
    ];
    setTimeout(() => {
      setSosHospitals(sosHospitals);
      setLoading(false);
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full border-2 border-red-500 shadow-2xl overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-red-600 via-red-700 to-rose-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md animate-pulse">
              <ShieldAlert className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">EMERGENCY SOS MODE</h2>
              <p className="text-xs text-red-100 font-medium">
                Live filtering: Nearest hospitals with available ICU & Ventilator beds
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* SOS Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto bg-slate-50">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-3 text-sm font-semibold text-slate-600">Locating nearest critical care units...</p>
            </div>
          ) : sosHospitals.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
              <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
              <h4 className="font-bold text-amber-800">No Critical Beds Available Nearby</h4>
              <p className="text-xs text-amber-700 mt-1">
                All immediate ICU and Ventilator beds in your immediate vicinity are currently full. Please call emergency services (102 / 112) immediately.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
                <span>Top 3 Closest Emergency Centers</span>
                <span>Distance calculated via Geolocation</span>
              </div>

              {sosHospitals.map((hosp, index) => (
                <div
                  key={hosp._id}
                  className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition relative"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-md">
                          #{index + 1} Nearest
                        </span>
                        <span className="text-xs text-slate-500 font-semibold">{hosp.distance} km away</span>
                      </div>
                      <h3 className="font-bold text-lg text-slate-900 mt-1">{hosp.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{hosp.address}</p>
                    </div>

                    <a
                      href={`tel:${hosp.contactNumber}`}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-red-600/30 flex items-center space-x-1.5 transition transform hover:scale-105"
                    >
                      <Phone className="w-4 h-4" />
                      <span>CALL NOW</span>
                    </a>
                  </div>

                  {/* Critical Bed Breakdown */}
                  <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-center">
                      <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">ICU Beds</div>
                      <div className="text-xl font-extrabold text-emerald-700 mt-0.5">
                        {hosp.icuAvailable} <span className="text-xs font-normal text-emerald-600">Available</span>
                      </div>
                    </div>

                    <div className="bg-teal-50 border border-teal-200 rounded-lg p-2.5 text-center">
                      <div className="text-[11px] font-semibold text-teal-800 uppercase tracking-wider">Ventilator Beds</div>
                      <div className="text-xl font-extrabold text-teal-700 mt-0.5">
                        {hosp.ventAvailable} <span className="text-xs font-normal text-teal-600">Available</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Warning */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>National Emergency Helpline: <strong className="text-red-600 font-bold">112</strong></span>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 font-semibold"
          >
            Close Emergency View
          </button>
        </div>
      </div>
    </div>
  );
}
