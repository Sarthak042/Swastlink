import React, { useState, useEffect } from 'react';
import { Pill, Plus, Edit2, Trash2, ShieldAlert, CheckCircle2, Search, FileText, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function PharmacyPortal({ onOpenAuthModal }) {
  const { user } = useAuth();
  const [pharmacy, setPharmacy] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);

  const [form, setForm] = useState({
    id: '',
    name: '',
    genericName: '',
    quantity: 100,
    price: 150,
    expiryDate: '2027-12-31',
    requiresPrescription: false,
  });

  const exportMedicinesToCSV = () => {
    const headers = ['Medicine Name', 'Generic Formula', 'Stock Quantity', 'Price (INR)', 'Expiry Date', 'Rx Required'];
    const rows = medicines.map((m) => [
      m.name,
      m.genericName,
      m.quantity,
      m.price,
      m.expiryDate,
      m.requiresPrescription ? 'Yes' : 'No',
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Pharmacy_Medicine_Inventory.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (user && user.role === 'pharmacy_admin') {
      fetchInventory();
    }
  }, [user]);

  const fetchInventory = () => {
    setLoading(true);
    // Static inventory — no database required
    const staticPharmacy = { name: 'Apollo Pharmacy 24/7 (Kothrud)', address: 'Shop 4, Karve Road, Kothrud, Pune', city: 'Pune' };
    const staticMedicines = [
      { _id: '1', name: 'Paracetamol 650mg (Dolo)', genericName: 'Paracetamol / Acetaminophen', quantity: 500, price: 32, expiryDate: '2027-08-31', requiresPrescription: false },
      { _id: '2', name: 'Azithromycin 500mg (Azithral)', genericName: 'Azithromycin', quantity: 120, price: 118, expiryDate: '2026-11-30', requiresPrescription: true },
      { _id: '3', name: 'Amoxicillin & Potassium Clavulanate 625mg', genericName: 'Augmentin / Amoxicillin', quantity: 85, price: 204, expiryDate: '2026-09-15', requiresPrescription: true },
      { _id: '4', name: 'Montelukast & Levocetirizine (Montek LC)', genericName: 'Montelukast / Levocetirizine', quantity: 210, price: 145, expiryDate: '2027-05-20', requiresPrescription: false },
      { _id: '5', name: 'Pantoprazole 40mg (Pan-40)', genericName: 'Pantoprazole', quantity: 340, price: 95, expiryDate: '2027-10-10', requiresPrescription: false },
    ];
    setPharmacy(staticPharmacy);
    setMedicines(staticMedicines);
    setLoading(false);
  };

  const handleOpenNewModal = () => {
    setEditingMedicine(null);
    setForm({
      id: '',
      name: '',
      genericName: '',
      quantity: 100,
      price: 150,
      expiryDate: '2027-12-31',
      requiresPrescription: false,
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (medicine) => {
    setEditingMedicine(medicine);
    setForm({
      id: medicine._id,
      name: medicine.name,
      genericName: medicine.genericName || medicine.name,
      quantity: medicine.quantity,
      price: medicine.price,
      expiryDate: medicine.expiryDate || '2027-12-31',
      requiresPrescription: medicine.requiresPrescription || false,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingMedicine) {
      // Update existing medicine in local state
      setMedicines((prev) =>
        prev.map((m) => (m._id === form.id ? { ...m, ...form, _id: m._id } : m))
      );
    } else {
      // Add new medicine to local state
      const newMed = { ...form, _id: Date.now().toString() };
      setMedicines((prev) => [...prev, newMed]);
    }
    setModalOpen(false);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this medicine from your catalog?')) return;
    setMedicines((prev) => prev.filter((m) => m._id !== id));
  };

  if (!user || user.role !== 'pharmacy_admin') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
          {/* HD Hero Visual Banner */}
          <div className="relative h-48 w-full bg-teal-950 flex flex-col justify-end p-6 text-white overflow-hidden">
            <img
              src="/images/pharmacy_bg.jpg"
              alt="Pharmacy Portal HD"
              className="absolute inset-0 w-full h-full object-cover opacity-75 mix-blend-luminosity scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-teal-950 via-teal-900/60 to-transparent"></div>

            <div className="relative z-10 space-y-1">
              <div className="inline-flex items-center space-x-2 bg-teal-500/20 text-teal-300 px-3 py-1 rounded-full text-[11px] font-bold border border-teal-500/30 backdrop-blur-md">
                <Pill className="w-3.5 h-3.5" />
                <span>Pharmacy Partner Network</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Pharmacy Portal</h2>
              <p className="text-xs text-teal-100/90 font-medium">
                Connect your medical store with patients searching for real-time medicine availability.
              </p>
            </div>
          </div>

          {/* White Card Body */}
          <div className="p-8 space-y-6 text-center">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <div className="bg-teal-50/60 border border-teal-100 rounded-2xl p-3.5">
                <div className="text-xs font-bold text-teal-900">Live Inventory</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Broadcast real-time stock & daily pricing</div>
              </div>
              <div className="bg-teal-50/60 border border-teal-100 rounded-2xl p-3.5">
                <div className="text-xs font-bold text-teal-900">Fuzzy Search</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Auto-match brand & generic drug formulas</div>
              </div>
              <div className="bg-teal-50/60 border border-teal-100 rounded-2xl p-3.5">
                <div className="text-xs font-bold text-teal-900">OCR Scanner</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Instant patient prescription photo reading</div>
              </div>
            </div>

            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Please sign in or create a pharmacy account to manage your medicine inventory and stock levels.
            </p>

            <div>
              <button
                onClick={onOpenAuthModal}
                className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-extrabold px-7 py-3.5 rounded-2xl shadow-lg shadow-teal-600/30 transition transform hover:scale-105 inline-flex items-center space-x-2"
              >
                <Pill className="w-4 h-4" />
                <span>Sign In / Register as Pharmacy Admin</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {pharmacy ? pharmacy.name : 'Pharmacy Inventory Portal'}
          </h1>
          <p className="text-xs text-teal-200 mt-1">
            Manage medicine brand names, generic formulas, stock levels, pricing, and prescription flags.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={exportMedicinesToCSV}
            className="bg-teal-800 hover:bg-teal-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center space-x-1.5 transition border border-teal-700"
          >
            <Download className="w-4 h-4 text-teal-200" />
            <span>Export CSV (Excel)</span>
          </button>
          <button
            onClick={handleOpenNewModal}
            className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-1.5 transition shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Medicine</span>
          </button>
        </div>
      </div>

      {/* Medicines Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900">Live Medicine Catalog ({medicines.length})</h3>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500 text-xs">Loading inventory...</div>
        ) : medicines.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">No medicine stock added yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-y border-slate-200">
                <tr>
                  <th className="p-3">Brand Name</th>
                  <th className="p-3">Generic Name</th>
                  <th className="p-3">Stock Qty</th>
                  <th className="p-3">Price (₹)</th>
                  <th className="p-3">Rx Flag</th>
                  <th className="p-3">Expiry Date</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {medicines.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 font-bold text-slate-900">{m.name}</td>
                    <td className="p-3 text-slate-500">{m.genericName}</td>
                    <td className="p-3 font-extrabold text-teal-700">{m.quantity}</td>
                    <td className="p-3 font-semibold text-slate-900">₹{m.price}</td>
                    <td className="p-3">
                      {m.requiresPrescription ? (
                        <span className="bg-rose-100 text-rose-800 font-extrabold text-[10px] px-2 py-0.5 rounded">
                          Rx Required
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-600 font-medium text-[10px] px-2 py-0.5 rounded">
                          OTC
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-500">{m.expiryDate}</td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(m)}
                        className="text-teal-600 hover:text-teal-800 font-bold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(m._id)}
                        className="text-red-600 hover:text-red-800 font-bold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upsert Medicine Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <h3 className="font-bold text-lg text-slate-900">
              {editingMedicine ? 'Edit Medicine Stock & Brand Name' : 'Add New Medicine Stock'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1">Brand Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Paracetamol 650mg (Dolo)"
                  className="w-full p-2.5 border rounded-lg"
                />
              </div>

              <div>
                <label className="block mb-1">Generic Name / Active Formula</label>
                <input
                  type="text"
                  required
                  value={form.genericName}
                  onChange={(e) => setForm({ ...form, genericName: e.target.value })}
                  placeholder="e.g. Paracetamol / Acetaminophen"
                  className="w-full p-2.5 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1">Quantity Available</label>
                  <input
                    type="number"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                    className="w-full p-2.5 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block mb-1">Price per Unit (₹)</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full p-2.5 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                  className="w-full p-2.5 border rounded-lg"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="rx"
                  checked={form.requiresPrescription}
                  onChange={(e) => setForm({ ...form, requiresPrescription: e.target.checked })}
                  className="w-4 h-4 text-teal-600 rounded"
                />
                <label htmlFor="rx" className="text-slate-700">Requires Doctor Prescription (Rx)</label>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2 rounded-lg transition shadow">
                  {editingMedicine ? 'Save Medicine Changes' : 'Add Medicine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
