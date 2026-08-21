import React, { useState, useEffect } from 'react';
import { Search, MapPin, SlidersHorizontal, Map, List, BedDouble, Syringe, Phone, CheckCircle2, AlertCircle, ArrowUpDown, Clock, Sparkles } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import HospitalMap from '../components/HospitalMap';
import BedRequestModal from '../components/BedRequestModal';
import QRCodeModal from '../components/QRCodeModal';

export default function PatientDashboard({ onOpenSOSModal }) {
  const { user } = useAuth();
  const { lastInventoryUpdate, lastBookingStatusChange } = useSocket();

  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('nearest'); // 'nearest' | 'beds' | 'cheapest'
  const [selectedBedType, setSelectedBedType] = useState('All');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'
  const [userLocation, setUserLocation] = useState({ lat: 18.5204, lng: 73.8567 });

  // Modal State
  const [selectedHospitalForBooking, setSelectedHospitalForBooking] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedBookingForQR, setSelectedBookingForQR] = useState(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [myBookings, setMyBookings] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    // Get Browser Geolocation if available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => console.log('Geolocation fallback used')
      );
    }
  }, []);

  useEffect(() => {
    fetchHospitals();
  }, [sortBy, userLocation, selectedBedType]);

  useEffect(() => {
    if (user && user.role === 'patient') {
      fetchMyBookings();
    }
  }, [user]);

  // Listen to Socket.io real-time inventory updates
  useEffect(() => {
    if (lastInventoryUpdate) {
      showToast(`Live Update from ${lastInventoryUpdate.hospitalName || 'Hospital'}: Inventory modified`);
      fetchHospitals(); // Refresh live status
    }
  }, [lastInventoryUpdate]);

  // Listen to Socket.io booking status updates
  useEffect(() => {
    if (lastBookingStatusChange) {
      showToast(`Your booking request was ${lastBookingStatusChange.booking.status.toUpperCase()} by hospital!`);
      fetchMyBookings();
    }
  }, [lastBookingStatusChange]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const typeQuery = selectedBedType !== 'All' ? `&bedType=${selectedBedType}` : '';
      const res = await fetch(
        `/api/hospitals?userLat=${userLocation.lat}&userLng=${userLocation.lng}&sortBy=${sortBy}&search=${encodeURIComponent(search)}${typeQuery}`
      );
      const data = await res.json();
      if (res.ok) {
        setHospitals(data || []);
      }
    } catch (err) {
      console.error('Error fetching hospitals:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBookings = async () => {
    try {
      const token = localStorage.getItem('swasthlink_token');
      if (!token) return;
      const res = await fetch('/api/bookings/my-bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setMyBookings(data || []);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHospitals();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-teal-500/40 flex items-center space-x-3 animate-bounce">
          <Sparkles className="w-5 h-5 text-teal-400" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Hero Search & Controls Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="max-w-3xl">
          <span className="bg-teal-500/20 text-teal-300 text-xs font-semibold px-3 py-1 rounded-full border border-teal-500/30">
            Real-Time Resource Visibility
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-3">
            Find Hospital Beds & Medical Care Instantly
          </h1>
          <p className="text-sm text-slate-300 mt-2 font-normal">
            Live occupancy tracking across ICU, Oxygen, Ventilator & General beds with distance-weighted sorting and transparent pricing.
          </p>
        </div>

        {/* Search & Sort Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-6 grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by hospital name or area..."
              className="w-full pl-11 pr-4 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="sm:col-span-4 relative">
            <ArrowUpDown className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none font-medium"
            >
              <option value="nearest">Sort: Nearest Distance First</option>
              <option value="beds">Sort: Most Beds Available</option>
              <option value="cheapest">Sort: Lowest Price / Day</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-brand-600/30"
            >
              Search
            </button>
          </div>
        </form>

        {/* Filter Chips & View Mode Toggle */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-700/60">
          {/* Bed Type Filters */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1">
            <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Bed Type:
            </span>
            {['All', 'General', 'Oxygen', 'ICU', 'Ventilator'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedBedType(type)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  selectedBedType === type
                    ? 'bg-teal-500 text-slate-950 font-bold'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* List vs Map Switcher */}
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 space-x-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                viewMode === 'list' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List View</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                viewMode === 'map' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Map View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'map' ? (
        <div className="h-[550px] w-full">
          <HospitalMap
            hospitals={hospitals}
            onSelectHospital={(hosp) => {
              setSelectedHospitalForBooking(hosp);
              setBookingModalOpen(true);
            }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Hospital Cards List (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
              <span>Showing {hospitals.length} Available Healthcare Centers</span>
              <span>Live Updates active</span>
            </div>

            {loading ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                <div className="inline-block w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-3 text-xs text-slate-500 font-medium">Fetching real-time inventory...</p>
              </div>
            ) : hospitals.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-6">
                <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <h4 className="font-bold text-slate-800">No Hospitals Found</h4>
                <p className="text-xs text-slate-500 mt-1">Try clearing filters or modifying your search query.</p>
              </div>
            ) : (
              hospitals.map((hosp) => (
                <div
                  key={hosp._id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition space-y-4"
                >
                  {/* Top Info */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-lg text-slate-900">{hosp.name}</h3>
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          ★ {hosp.trustScore || 4.8} Trust Score
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 flex-wrap">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>{hosp.address} {hosp.city && `(${hosp.city})`}</span>
                        {hosp.googleMapLink && (
                          <a
                            href={hosp.googleMapLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-600 hover:underline font-semibold ml-2 text-[11px]"
                          >
                            📍 Open Google Maps
                          </a>
                        )}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="inline-block bg-brand-50 text-brand-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-brand-200">
                        {hosp.distance} km away
                      </span>
                    </div>
                  </div>

                  {/* Bed Breakdown Cards */}
                  <div>
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <BedDouble className="w-3.5 h-3.5 text-brand-600" /> Live Bed Occupancy Status
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(hosp.beds || []).map((bed) => {
                        const available = Math.max(0, bed.total - bed.occupied);
                        const isFull = available === 0;

                        return (
                          <div
                            key={bed.type}
                            className={`p-2.5 rounded-xl border text-center transition ${
                              isFull
                                ? 'bg-slate-50 border-slate-200 opacity-60'
                                : 'bg-slate-50/80 border-slate-200 hover:border-brand-400'
                            }`}
                          >
                            <div className="text-[11px] font-semibold text-slate-500 uppercase">{bed.type}</div>
                            <div
                              className={`text-lg font-black mt-0.5 ${
                                isFull ? 'text-slate-400' : 'text-slate-900'
                              }`}
                            >
                              {available} <span className="text-[10px] font-normal text-slate-500">/ {bed.total}</span>
                            </div>
                            <div className="text-[10px] font-bold text-brand-700 mt-1">₹{bed.pricePerDay}/day</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Vaccine Summary if present */}
                  {hosp.vaccines && hosp.vaccines.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                      <span className="flex items-center gap-1 font-semibold text-teal-700">
                        <Syringe className="w-3.5 h-3.5" /> Vaccines in Stock:
                      </span>
                      <div className="flex items-center space-x-2">
                        {hosp.vaccines.map((v) => (
                          <span key={v._id} className="bg-teal-50 text-teal-800 px-2 py-0.5 rounded text-[11px] font-medium border border-teal-200">
                            {v.name}: <strong>{v.quantity}</strong>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <a
                      href={`tel:${hosp.contactNumber}`}
                      className="text-xs font-semibold text-slate-600 hover:text-brand-600 flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" /> {hosp.contactNumber}
                    </a>

                    <button
                      onClick={() => {
                        setSelectedHospitalForBooking(hosp);
                        setBookingModalOpen(true);
                      }}
                      className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-md shadow-brand-600/20"
                    >
                      Reserve / Book Bed
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sidebar: Patient Reservations & Emergency SOS Banner (1 Col) */}
          <div className="space-y-6">
            {/* Quick SOS Card */}
            <div className="bg-gradient-to-r from-red-600 to-rose-700 rounded-2xl p-5 text-white shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="bg-white/20 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  Critical Care
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
              </div>
              <h3 className="text-lg font-extrabold">Emergency SOS Needed?</h3>
              <p className="text-xs text-red-100">
                Instantly filter top 3 nearest hospitals with available ICU & Ventilator beds in 1-tap.
              </p>
              <button
                onClick={onOpenSOSModal}
                className="w-full bg-white text-red-700 font-extrabold text-xs py-2.5 rounded-xl shadow hover:bg-red-50 transition"
              >
                OPEN EMERGENCY SOS
              </button>
            </div>

            {/* My Booking Status Panel */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-600" /> My Bed Booking Requests
              </h3>

              {!user ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  Sign in or create an account to track your bed reservation status.
                </div>
              ) : myBookings.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No active bed reservation requests submitted yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {myBookings.map((b) => (
                    <div
                      key={b._id}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">
                          {b.hospitalId ? b.hospitalId.name : 'Hospital'}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded font-extrabold capitalize text-[10px] ${
                            b.status === 'accepted'
                              ? 'bg-emerald-100 text-emerald-800'
                              : b.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>
                      <div className="text-slate-600 flex items-center justify-between flex-wrap gap-1">
                        <span>Requested: <strong className="text-slate-800">{b.bedType} Bed</strong> for {b.patientName}</span>
                        <span className="font-mono text-[10px] font-black text-slate-700 bg-slate-200/80 px-1.5 py-0.5 rounded">
                          ID: {b.uniquePatientId && b.uniquePatientId !== 'PAT-2026-9842' ? b.uniquePatientId : (b.patientId?.patientIdCode && b.patientId?.patientIdCode !== 'PAT-2026-9842' ? b.patientId.patientIdCode : `PAT-2026-${b._id ? b._id.toString().slice(-5).toUpperCase() : '9842'}`)}
                        </span>
                      </div>

                      {b.status === 'accepted' && (
                        <button
                          onClick={() => {
                            setSelectedBookingForQR(b);
                            setQrModalOpen(true);
                          }}
                          className="mt-1 w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold py-1.5 rounded-lg flex items-center justify-center space-x-1 transition"
                        >
                          <span>Get QR Admission Pass</span>
                        </button>
                      )}

                      <div className="text-[10px] text-slate-400">
                        {new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      <BedRequestModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        hospital={selectedHospitalForBooking}
        onBookingSuccess={() => {
          showToast('Bed reservation request submitted to hospital!');
          fetchMyBookings();
        }}
      />

      {/* QR Admission Pass Modal */}
      <QRCodeModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        booking={selectedBookingForQR}
      />
    </div>
  );
}
