import React, { useState, useEffect } from 'react';
import { Search, MapPin, SlidersHorizontal, Map, List, BedDouble, Syringe, Phone, AlertCircle, ArrowUpDown, Clock, Sparkles, Loader2 } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import HospitalMap from '../components/HospitalMap';
import BedRequestModal from '../components/BedRequestModal';
import QRCodeModal from '../components/QRCodeModal';

const API = 'https://swastlink-api.onrender.com/api';

export default function PatientDashboard({ onOpenSOSModal }) {
  const { user, token } = useAuth();
  const { lastInventoryUpdate, lastBookingStatusChange } = useSocket();

  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('nearest');
  const [selectedBedType, setSelectedBedType] = useState('All');
  const [viewMode, setViewMode] = useState('list');

  const [selectedHospitalForBooking, setSelectedHospitalForBooking] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedBookingForQR, setSelectedBookingForQR] = useState(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [myBookings, setMyBookings] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => { fetchHospitals(); }, []);
  useEffect(() => { if (user && token) fetchMyBookings(); }, [user, token]);

  useEffect(() => {
    if (lastInventoryUpdate) { showToast('Live Update: Bed inventory changed'); fetchHospitals(); }
  }, [lastInventoryUpdate]);

  useEffect(() => {
    if (lastBookingStatusChange) {
      showToast(`Booking ${lastBookingStatusChange.booking?.status?.toUpperCase()}!`);
      fetchMyBookings();
    }
  }, [lastBookingStatusChange]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchHospitals = async () => {
    setLoading(true);
    setApiError('');
    try {
      const res = await fetch(`${API}/hospitals`);
      if (!res.ok) throw new Error('Server error');
      const data = await res.json();
      // data is array of hospitals, each with beds[] embedded or fetched separately
      const hospitals = Array.isArray(data) ? data : (data.hospitals || []);
      // Fetch beds for each hospital
      const enriched = await Promise.all(
        hospitals.map(async (h) => {
          try {
            const bedRes = await fetch(`${API}/beds/hospital/${h._id}`);
            const beds = bedRes.ok ? await bedRes.json() : [];
            return { ...h, beds: Array.isArray(beds) ? beds : [] };
          } catch {
            return { ...h, beds: [] };
          }
        })
      );
      setHospitals(enriched);
    } catch (err) {
      setApiError('Could not load hospitals. The server may be waking up — please wait 30 seconds and refresh.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBookings = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/bookings/my-bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMyBookings(Array.isArray(data) ? data : (data.bookings || []));
      }
    } catch {}
  };

  const handleBookingSuccess = (booking) => {
    setMyBookings((prev) => [booking, ...prev]);
    showToast('✅ Bed reservation submitted successfully!');
    fetchMyBookings();
  };

  // Client-side filter/sort on already-fetched hospitals
  const getFilteredHospitals = () => {
    let results = [...hospitals];
    if (search.trim()) {
      results = results.filter((h) =>
        h.name?.toLowerCase().includes(search.toLowerCase()) ||
        h.address?.toLowerCase().includes(search.toLowerCase()) ||
        h.city?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (selectedBedType !== 'All') {
      results = results.filter((h) =>
        (h.beds || []).some((b) => b.type === selectedBedType && b.total - b.occupied > 0)
      );
    }
    if (sortBy === 'beds') results.sort((a, b) =>
      (b.beds || []).reduce((s, x) => s + Math.max(0, x.total - x.occupied), 0) -
      (a.beds || []).reduce((s, x) => s + Math.max(0, x.total - x.occupied), 0)
    );
    else if (sortBy === 'cheapest') results.sort((a, b) => {
      const minA = (a.beds || []).length ? Math.min(...a.beds.map((x) => x.pricePerDay)) : 999999;
      const minB = (b.beds || []).length ? Math.min(...b.beds.map((x) => x.pricePerDay)) : 999999;
      return minA - minB;
    });
    return results;
  };

  const displayed = getFilteredHospitals();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-teal-500/40 flex items-center space-x-3">
          <Sparkles className="w-5 h-5 text-teal-400" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Hero Search Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="max-w-3xl">
          <span className="bg-teal-500/20 text-teal-300 text-xs font-semibold px-3 py-1 rounded-full border border-teal-500/30">
            Real-Time Resource Visibility
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-3">
            Find Hospital Beds &amp; Medical Care Instantly
          </h1>
          <p className="text-sm text-slate-300 mt-2">
            Live occupancy tracking across ICU, Oxygen, Ventilator &amp; General beds with transparent pricing.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={(e) => { e.preventDefault(); fetchHospitals(); }} className="mt-6 grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by hospital name, city or area..."
              className="w-full pl-11 pr-4 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div className="sm:col-span-4 relative">
            <ArrowUpDown className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none font-medium">
              <option value="nearest">Sort: Default</option>
              <option value="beds">Sort: Most Beds Available</option>
              <option value="cheapest">Sort: Lowest Price / Day</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-sm transition shadow-lg">Search</button>
          </div>
        </form>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-700/60">
          <div className="flex items-center space-x-2 overflow-x-auto pb-1">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1"><SlidersHorizontal className="w-3.5 h-3.5" /> Bed Type:</span>
            {['All', 'General', 'Oxygen', 'ICU', 'Ventilator'].map((type) => (
              <button key={type} onClick={() => setSelectedBedType(type)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${selectedBedType === type ? 'bg-teal-500 text-slate-950' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}>
                {type}
              </button>
            ))}
          </div>
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 space-x-1">
            {[['list', <List className="w-3.5 h-3.5" />, 'List'], ['map', <Map className="w-3.5 h-3.5" />, 'Map']].map(([mode, icon, label]) => (
              <button key={mode} onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${viewMode === mode ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                {icon}<span>{label} View</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      {viewMode === 'map' ? (
        <div className="h-[550px] w-full">
          <HospitalMap hospitals={displayed} onSelectHospital={(h) => { setSelectedHospitalForBooking(h); setBookingModalOpen(true); }} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Hospital Cards */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
              <span>Showing {displayed.length} Registered Healthcare Centers</span>
              <button onClick={fetchHospitals} className="text-brand-600 hover:underline">↻ Refresh</button>
            </div>

            {loading ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                <Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto" />
                <p className="mt-3 text-xs text-slate-500 font-medium">Loading hospitals from server...</p>
                <p className="text-xs text-slate-400 mt-1">First load may take ~30 sec (server waking up)</p>
              </div>
            ) : apiError ? (
              <div className="text-center py-16 bg-amber-50 rounded-2xl border border-amber-200 p-6">
                <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                <h4 className="font-bold text-slate-800">Server Waking Up</h4>
                <p className="text-xs text-slate-600 mt-2">{apiError}</p>
                <button onClick={fetchHospitals} className="mt-4 px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-lg hover:bg-brand-700 transition">
                  Try Again
                </button>
              </div>
            ) : displayed.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-6">
                <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <h4 className="font-bold text-slate-800">No Hospitals Found</h4>
                <p className="text-xs text-slate-500 mt-2">Try clearing filters or search term.</p>
              </div>
            ) : (
              displayed.map((hosp) => (
                <div key={hosp._id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2 flex-wrap gap-1">
                        <h3 className="font-bold text-lg text-slate-900">{hosp.name}</h3>
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          ★ {hosp.trustScore || 4.5}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 flex-wrap">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>{hosp.address}{hosp.city ? ` (${hosp.city})` : ''}</span>
                        {hosp.googleMapLink && (
                          <a href={hosp.googleMapLink} target="_blank" rel="noopener noreferrer"
                            className="text-brand-600 hover:underline font-semibold ml-2 text-[11px]">📍 Maps</a>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Beds */}
                  {hosp.beds && hosp.beds.length > 0 ? (
                    <div>
                      <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <BedDouble className="w-3.5 h-3.5 text-brand-600" /> Live Bed Occupancy
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {hosp.beds.map((bed) => {
                          const available = Math.max(0, bed.total - bed.occupied);
                          return (
                            <div key={bed._id || bed.type}
                              className={`p-2.5 rounded-xl border text-center ${available === 0 ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-slate-50/80 border-slate-200 hover:border-brand-400'}`}>
                              <div className="text-[11px] font-semibold text-slate-500 uppercase">{bed.type}</div>
                              <div className={`text-lg font-black mt-0.5 ${available === 0 ? 'text-slate-400' : 'text-slate-900'}`}>
                                {available} <span className="text-[10px] font-normal text-slate-500">/ {bed.total}</span>
                              </div>
                              <div className="text-[10px] font-bold text-brand-700 mt-1">₹{bed.pricePerDay}/day</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Bed information not yet updated by hospital.</p>
                  )}

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <a href={`tel:${hosp.contactNumber}`} className="text-xs font-semibold text-slate-600 hover:text-brand-600 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" /> {hosp.contactNumber || 'N/A'}
                    </a>
                    <button
                      onClick={() => { setSelectedHospitalForBooking(hosp); setBookingModalOpen(true); }}
                      className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-md">
                      Reserve / Book Bed
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-red-600 to-rose-700 rounded-2xl p-5 text-white shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="bg-white/20 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">Critical Care</span>
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
              </div>
              <h3 className="text-lg font-extrabold">Emergency SOS Needed?</h3>
              <p className="text-xs text-red-100">Instantly find nearest hospitals with available ICU &amp; Ventilator beds.</p>
              <button onClick={onOpenSOSModal} className="w-full bg-white text-red-700 font-extrabold text-xs py-2.5 rounded-xl shadow hover:bg-red-50 transition">
                OPEN EMERGENCY SOS
              </button>
            </div>

            {/* My Bookings */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-600" /> My Bed Booking Requests
              </h3>
              {!user ? (
                <div className="text-center py-6 text-slate-500 text-xs">Sign in to track your bookings.</div>
              ) : myBookings.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">No active reservations yet.</div>
              ) : (
                <div className="space-y-3">
                  {myBookings.map((b) => (
                    <div key={b._id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{b.hospitalId?.name || b.hospitalName || 'Hospital'}</span>
                        <span className={`px-2 py-0.5 rounded font-extrabold capitalize text-[10px] ${
                          b.status === 'accepted' ? 'bg-emerald-100 text-emerald-800'
                          : b.status === 'rejected' ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'}`}>
                          {b.status}
                        </span>
                      </div>
                      <div className="text-slate-600">
                        <strong>{b.bedType} Bed</strong> — {b.patientName}
                      </div>
                      <div className="font-mono text-[10px] font-black text-slate-700 bg-slate-200/80 px-1.5 py-0.5 rounded inline-block">
                        ID: {b.uniquePatientId || b._id}
                      </div>
                      {b.status === 'accepted' && (
                        <button onClick={() => { setSelectedBookingForQR(b); setQrModalOpen(true); }}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold py-1.5 rounded-lg flex items-center justify-center transition">
                          Get QR Admission Pass
                        </button>
                      )}
                      <div className="text-[10px] text-slate-400">{new Date(b.createdAt).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <BedRequestModal isOpen={bookingModalOpen} onClose={() => setBookingModalOpen(false)}
        hospital={selectedHospitalForBooking} onBookingSuccess={handleBookingSuccess} />
      <QRCodeModal isOpen={qrModalOpen} onClose={() => setQrModalOpen(false)} booking={selectedBookingForQR} />
    </div>
  );
}
