import React, { useState, useEffect } from 'react';
import { Building2, BedDouble, Syringe, Users, CheckCircle2, XCircle, Plus, Edit2, Trash2, AlertCircle, BarChart3, Bell, TrendingUp, Download } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export default function AdminDashboard({ onOpenAuthModal }) {
  const { user } = useAuth();
  const { lastBookingRequest } = useSocket();

  const [hospital, setHospital] = useState(null);
  const [beds, setBeds] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newRequestAlert, setNewRequestAlert] = useState(false);

  const exportCSV = (filename, headers, rows) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportBedsToCSV = () => {
    const headers = ['Bed Category', 'Total Capacity', 'Occupied Beds', 'Available Beds', 'Price Per Day (INR)', 'Occupancy Rate (%)'];
    const rows = beds.map((b) => [
      b.type,
      b.total,
      b.occupied,
      Math.max(0, b.total - b.occupied),
      b.pricePerDay,
      b.total > 0 ? `${Math.round((b.occupied / b.total) * 100)}%` : '0%',
    ]);
    exportCSV('Hospital_Bed_Inventory.csv', headers, rows);
  };

  const exportBookingsToCSV = () => {
    const headers = ['Patient ID', 'Patient Name', 'Phone', 'Bed Type', 'Status', 'Submitted Date'];
    const rows = bookings.map((b) => [
      b.uniquePatientId || b.patientId?.patientIdCode || 'PAT-2026-9842',
      b.patientName,
      b.patientPhone,
      b.bedType,
      b.status,
      new Date(b.createdAt).toLocaleString(),
    ]);
    exportCSV('Patient_Admission_Requests.csv', headers, rows);
  };

  // Form states for Bed Upsert
  const [editingBed, setEditingBed] = useState(null);
  const [bedForm, setBedForm] = useState({ type: 'General', total: 20, occupied: 10, pricePerDay: 1500 });
  const [bedModalOpen, setBedModalOpen] = useState(false);

  // Form states for Vaccine Upsert
  const [vaccineForm, setVaccineForm] = useState({ name: '', quantity: 50, price: 500 });
  const [vaccineModalOpen, setVaccineModalOpen] = useState(false);

  // Static demo data for hospital admin — no backend needed
  const STATIC_HOSPITAL = { name: 'Ruby Hall Clinic Super Speciality', address: '40 Sasoon Road, Sangamvadi, Pune', city: 'Pune' };
  const STATIC_BEDS = [
    { _id: 'b1', type: 'General',    total: 40, occupied: 28, pricePerDay: 1500 },
    { _id: 'b2', type: 'Oxygen',     total: 25, occupied: 19, pricePerDay: 2800 },
    { _id: 'b3', type: 'ICU',        total: 15, occupied: 12, pricePerDay: 6500 },
    { _id: 'b4', type: 'Ventilator', total: 8,  occupied: 5,  pricePerDay: 9500 },
  ];
  const STATIC_VACCINES = [
    { _id: 'v1', name: 'Covishield',   quantity: 150, price: 780  },
    { _id: 'v2', name: 'Covaxin',      quantity: 90,  price: 1200 },
    { _id: 'v3', name: 'Corbevax',     quantity: 60,  price: 400  },
  ];
  const STATIC_BOOKINGS = [
    { _id: 'bk1', uniquePatientId: 'PAT-2026-9842', patientName: 'Rahul Sharma', patientPhone: '+91 99887 76655', bedType: 'ICU', status: 'pending', notes: 'Severe pneumonia, needs urgent oxygen and ICU monitoring.', createdAt: new Date().toISOString() },
  ];
  const STATIC_FORECAST = {
    predictedPeakDay: 'Day 5',
    utilizationRisk: 'HIGH',
    historical: [
      { day: 'Day -6', demand: 52 }, { day: 'Day -5', demand: 58 }, { day: 'Day -4', demand: 61 },
      { day: 'Day -3', demand: 55 }, { day: 'Day -2', demand: 67 }, { day: 'Day -1', demand: 72 }, { day: 'Today', demand: 64 },
    ],
    forecast: [
      { day: '1', projectedDemand: 70, capacity: 88 }, { day: '2', projectedDemand: 75, capacity: 88 },
      { day: '3', projectedDemand: 79, capacity: 88 }, { day: '4', projectedDemand: 83, capacity: 88 },
      { day: '5', projectedDemand: 91, capacity: 88 }, { day: '6', projectedDemand: 86, capacity: 88 },
      { day: '7', projectedDemand: 80, capacity: 88 },
    ],
  };

  useEffect(() => {
    if (user && user.role === 'hospital_admin') {
      fetchAdminData();
    }
  }, [user]);

  useEffect(() => {
    if (lastBookingRequest) {
      setNewRequestAlert(true);
    }
  }, [lastBookingRequest]);

  const fetchAdminData = () => {
    setLoading(true);
    setHospital(STATIC_HOSPITAL);
    setBeds(STATIC_BEDS);
    setVaccines(STATIC_VACCINES);
    setBookings(STATIC_BOOKINGS);
    setForecastData(STATIC_FORECAST);
    setLoading(false);
  };

  const handleBedSubmit = (e) => {
    e.preventDefault();
    if (editingBed) {
      setBeds((prev) => prev.map((b) => b._id === editingBed._id ? { ...b, ...bedForm } : b));
    } else {
      setBeds((prev) => [...prev, { _id: 'b_' + Date.now(), ...bedForm }]);
    }
    setBedModalOpen(false);
  };

  const handleVaccineSubmit = (e) => {
    e.preventDefault();
    setVaccines((prev) => {
      const exists = prev.find((v) => v.name === vaccineForm.name);
      if (exists) return prev.map((v) => v.name === vaccineForm.name ? { ...v, ...vaccineForm } : v);
      return [...prev, { _id: 'v_' + Date.now(), ...vaccineForm }];
    });
    setVaccineModalOpen(false);
    setVaccineForm({ name: '', quantity: 50, price: 500 });
  };

  const handleVaccineDelete = (vacId) => {
    if (!window.confirm('Are you sure you want to delete this vaccine stock entry?')) return;
    setVaccines((prev) => prev.filter((v) => v._id !== vacId));
  };

  const handleBookingAction = (bookingId, status) => {
    setBookings((prev) => prev.map((b) => b._id === bookingId ? { ...b, status } : b));
  };

  // Chart Data Preparation
  const chartData = beds.map((b) => {
    const occPercent = b.total > 0 ? Math.round((b.occupied / b.total) * 100) : 0;
    return {
      type: b.type,
      Total: b.total,
      Occupied: b.occupied,
      Available: Math.max(0, b.total - b.occupied),
      OccupancyPercent: occPercent,
    };
  });

  const COLORS = ['#0284c7', '#0f766e', '#eab308', '#ef4444'];

  if (!user || user.role !== 'hospital_admin') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
          {/* HD Hero Visual Banner */}
          <div className="relative h-48 w-full bg-slate-950 flex flex-col justify-end p-6 text-white overflow-hidden">
            <img
              src="/images/hospital_bg.jpg"
              alt="Hospital Admin Portal HD"
              className="absolute inset-0 w-full h-full object-cover opacity-75 mix-blend-luminosity scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent"></div>

            <div className="relative z-10 space-y-1">
              <div className="inline-flex items-center space-x-2 bg-brand-500/20 text-brand-300 px-3 py-1 rounded-full text-[11px] font-bold border border-brand-500/30 backdrop-blur-md">
                <Building2 className="w-3.5 h-3.5" />
                <span>Healthcare Provider Network</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Hospital Admin Portal</h2>
              <p className="text-xs text-slate-200/90 font-medium">
                Manage live bed availability, vaccine inventory, emergency ICU care & bed reservations.
              </p>
            </div>
          </div>

          {/* White Card Body */}
          <div className="p-8 space-y-6 text-center">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
                <div className="text-xs font-bold text-slate-900">Bed Inventory</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Control General, ICU, Ventilator & Oxygen beds</div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
                <div className="text-xs font-bold text-slate-900">Live WebSockets</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Instant booking request alerts & badge count</div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
                <div className="text-xs font-bold text-slate-900">ML Forecast</div>
                <div className="text-[11px] text-slate-500 mt-0.5">7-day predictive bed demand spike analysis</div>
              </div>
            </div>

            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Please sign in or register with your hospital administrator account to manage bed availability and patient admission requests.
            </p>

            <div>
              <button
                onClick={onOpenAuthModal}
                className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-extrabold px-7 py-3.5 rounded-2xl shadow-lg shadow-brand-600/30 transition transform hover:scale-105 inline-flex items-center space-x-2"
              >
                <Building2 className="w-4 h-4" />
                <span>Sign In / Register as Hospital Admin</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {hospital ? hospital.name : 'Hospital Management Dashboard'}
            </h1>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              Admin Portal
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time bed management, vaccine inventory control, and patient admission workflow.
          </p>
        </div>

        {/* Real-time Notification Badge */}
        {newRequestAlert && (
          <div className="bg-amber-500/20 border border-amber-500/40 text-amber-300 px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 animate-bounce">
            <Bell className="w-4 h-4 text-amber-400" />
            <span>New Patient Booking Request Received!</span>
            <button
              onClick={() => setNewRequestAlert(false)}
              className="text-amber-200 hover:text-white text-xs underline pl-2"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Bed Occupancy Analytics Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart View */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-brand-600" /> Live Bed Occupancy & Capacity Analytics
              </h3>
              <p className="text-xs text-slate-500">Total vs Occupied bed breakdown by unit type</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="type" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Bar dataKey="Total" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Occupied" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Available" fill="#0f766e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Occupancy % Overview */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-600" /> Bed Occupancy Rate (%)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Live saturation metric per bed category</p>

            <div className="space-y-3 mt-4">
              {chartData.map((d, i) => (
                <div key={d.type} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">{d.type}</span>
                    <span className={d.OccupancyPercent > 80 ? 'text-red-600 font-bold' : 'text-slate-900'}>
                      {d.OccupancyPercent}% ({d.Occupied}/{d.Total})
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        d.OccupancyPercent > 85 ? 'bg-red-500' : d.OccupancyPercent > 65 ? 'bg-amber-500' : 'bg-teal-500'
                      }`}
                      style={{ width: `${Math.min(100, d.OccupancyPercent)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500">
            * Changes saved here broadcast in real-time to all connected patients.
          </div>
        </div>
      </div>

      {/* ML Bed-Demand Forecast Microservice Panel */}
      {forecastData && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-lg text-slate-900">ML Bed-Demand 7-Day Forecast</h3>
                <span className="bg-teal-100 text-teal-800 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                  Predictive Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Synthetic time-series regression predicting patient bed demand spikes over the next 7 days
              </p>
            </div>

            <div className="flex items-center space-x-3 text-xs font-semibold">
              <span className="text-slate-600">Peak Spike Day: <strong className="text-brand-700">{forecastData.predictedPeakDay}</strong></span>
              <span className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] ${
                forecastData.utilizationRisk === 'HIGH' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                Risk: {forecastData.utilizationRisk}
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[...(forecastData.historical || []), ...(forecastData.forecast || []).map(f => ({ day: f.day + ' (Fcst)', demand: f.projectedDemand, capacity: f.capacity }))]}>
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Legend />
                <Line type="monotone" dataKey="demand" stroke="#0284c7" strokeWidth={3} dot={{ r: 4 }} name="Bed Occupancy / Projected Demand" />
                <Line type="dashArray" dataKey="capacity" stroke="#ef4444" strokeDasharray="5 5" name="Total Hospital Capacity" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Bed Inventory CRUD Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              <BedDouble className="w-5 h-5 text-brand-600" /> Manage Bed Stock & Pricing
            </h3>
            <p className="text-xs text-slate-500">Update total beds, active occupancy, and daily pricing</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={exportBedsToCSV}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl flex items-center space-x-1.5 transition border border-slate-300"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Export CSV (Excel)</span>
            </button>
            <button
              onClick={() => {
                setEditingBed(null);
                setBedForm({ type: 'General', total: 20, occupied: 5, pricePerDay: 1500 });
                setBedModalOpen(true);
              }}
              className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Update Bed Inventory</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-y border-slate-200">
              <tr>
                <th className="p-3">Bed Type</th>
                <th className="p-3">Total Capacity</th>
                <th className="p-3">Occupied</th>
                <th className="p-3">Available (Auto)</th>
                <th className="p-3">Price / Day</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {beds.map((b) => {
                const available = Math.max(0, b.total - b.occupied);
                return (
                  <tr key={b._id} className="hover:bg-slate-50/80 transition font-medium">
                    <td className="p-3 font-bold text-slate-900">{b.type}</td>
                    <td className="p-3">{b.total}</td>
                    <td className="p-3 text-brand-700 font-bold">{b.occupied}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded font-bold ${available > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                        {available} Free
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-900">₹{b.pricePerDay}</td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingBed(b);
                          setBedForm({ type: b.type, total: b.total, occupied: b.occupied, pricePerDay: b.pricePerDay });
                          setBedModalOpen(true);
                        }}
                        className="text-brand-600 hover:text-brand-800 font-bold"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incoming Patient Booking Requests Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600" /> Incoming Patient Booking Requests
            </h3>
            <p className="text-xs text-slate-500">Real-time queue of patient bed reservation submissions</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={exportBookingsToCSV}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1 transition border border-slate-300"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Export Requests (CSV)</span>
            </button>
            <span className="bg-teal-50 text-teal-800 text-xs font-bold px-3 py-1.5 rounded-full border border-teal-200">
              {bookings.filter((b) => b.status === 'pending').length} Pending
            </span>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">No patient booking requests received yet.</div>
        ) : (
          <div className="space-y-3">
            {bookings.map((req) => (
              <div
                key={req._id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <h4 className="font-bold text-sm text-slate-900">{req.patientName}</h4>
                    <span className="bg-slate-900 text-teal-300 font-mono text-[11px] font-black px-2 py-0.5 rounded border border-slate-700">
                      ID: {req.uniquePatientId && req.uniquePatientId !== 'PAT-2026-9842' ? req.uniquePatientId : (req.patientId?.patientIdCode && req.patientId?.patientIdCode !== 'PAT-2026-9842' ? req.patientId.patientIdCode : `PAT-2026-${req._id ? req._id.toString().slice(-5).toUpperCase() : '9842'}`)}
                    </span>
                    <span className="bg-brand-100 text-brand-800 text-[10px] font-bold px-2 py-0.5 rounded">
                      {req.bedType} Bed
                    </span>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                        req.status === 'accepted'
                          ? 'bg-emerald-100 text-emerald-800'
                          : req.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1">
                    Phone: <strong>{req.patientPhone}</strong> {req.notes && `| Notes: ${req.notes}`}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Submitted: {new Date(req.createdAt).toLocaleString()}
                  </p>
                </div>

                {req.status === 'pending' && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleBookingAction(req._id, 'accepted')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1 transition shadow"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Accept</span>
                    </button>
                    <button
                      onClick={() => handleBookingAction(req._id, 'rejected')}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1 transition shadow"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Vaccines Management */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              <Syringe className="w-5 h-5 text-teal-600" /> Manage Vaccine Stock
            </h3>
            <p className="text-xs text-slate-500">Live vaccine dose counts & pricing</p>
          </div>
          <button
            onClick={() => setVaccineModalOpen(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1 transition shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vaccine</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {vaccines.map((vac) => (
            <div key={vac._id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{vac.name}</h4>
                  <p className="text-xs text-teal-700 font-semibold mt-0.5">₹{vac.price} / dose</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-extrabold text-slate-900">{vac.quantity}</span>
                  <span className="text-[10px] text-slate-500 block">Doses Left</span>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-200/60 text-xs">
                <button
                  onClick={() => {
                    setVaccineForm({ name: vac.name, quantity: vac.quantity, price: vac.price });
                    setVaccineModalOpen(true);
                  }}
                  className="text-teal-600 hover:text-teal-800 font-bold flex items-center space-x-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleVaccineDelete(vac._id)}
                  className="text-red-500 hover:text-red-700 font-bold flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bed Upsert Modal */}
      {bedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <h3 className="font-bold text-lg text-slate-900">Update Bed Inventory</h3>
            <form onSubmit={handleBedSubmit} className="space-y-3 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1">Bed Category</label>
                <select
                  value={bedForm.type}
                  onChange={(e) => setBedForm({ ...bedForm, type: e.target.value })}
                  className="w-full p-2.5 border rounded-lg"
                >
                  <option value="General">General</option>
                  <option value="Oxygen">Oxygen-Supported</option>
                  <option value="ICU">ICU</option>
                  <option value="Ventilator">Ventilator</option>
                </select>
              </div>
              <div>
                <label className="block mb-1">Total Capacity</label>
                <input
                  type="number"
                  value={bedForm.total}
                  onChange={(e) => setBedForm({ ...bedForm, total: Number(e.target.value) })}
                  className="w-full p-2.5 border rounded-lg"
                />
              </div>
              <div>
                <label className="block mb-1">Currently Occupied</label>
                <input
                  type="number"
                  value={bedForm.occupied}
                  onChange={(e) => setBedForm({ ...bedForm, occupied: Number(e.target.value) })}
                  className="w-full p-2.5 border rounded-lg"
                />
              </div>
              <div>
                <label className="block mb-1">Price Per Day (₹)</label>
                <input
                  type="number"
                  value={bedForm.pricePerDay}
                  onChange={(e) => setBedForm({ ...bedForm, pricePerDay: Number(e.target.value) })}
                  className="w-full p-2.5 border rounded-lg"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setBedModalOpen(false)} className="px-4 py-2 text-slate-500">
                  Cancel
                </button>
                <button type="submit" className="bg-brand-600 text-white font-bold px-4 py-2 rounded-lg">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vaccine Upsert Modal */}
      {vaccineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <h3 className="font-bold text-lg text-slate-900">Add Vaccine Stock</h3>
            <form onSubmit={handleVaccineSubmit} className="space-y-3 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1">Vaccine Name</label>
                <input
                  type="text"
                  required
                  value={vaccineForm.name}
                  onChange={(e) => setVaccineForm({ ...vaccineForm, name: e.target.value })}
                  placeholder="e.g. Covishield, Covaxin"
                  className="w-full p-2.5 border rounded-lg"
                />
              </div>
              <div>
                <label className="block mb-1">Quantity Available</label>
                <input
                  type="number"
                  value={vaccineForm.quantity}
                  onChange={(e) => setVaccineForm({ ...vaccineForm, quantity: Number(e.target.value) })}
                  className="w-full p-2.5 border rounded-lg"
                />
              </div>
              <div>
                <label className="block mb-1">Price per Dose (₹)</label>
                <input
                  type="number"
                  value={vaccineForm.price}
                  onChange={(e) => setVaccineForm({ ...vaccineForm, price: Number(e.target.value) })}
                  className="w-full p-2.5 border rounded-lg"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setVaccineModalOpen(false)} className="px-4 py-2 text-slate-500">
                  Cancel
                </button>
                <button type="submit" className="bg-teal-600 text-white font-bold px-4 py-2 rounded-lg">
                  Save Vaccine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
