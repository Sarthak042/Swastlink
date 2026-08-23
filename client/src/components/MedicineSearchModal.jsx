import React, { useState, useEffect } from 'react';
import { X, Search, Pill, MapPin, Camera, AlertCircle, Check, FileText } from 'lucide-react';
import Fuse from 'fuse.js';
import Tesseract from 'tesseract.js';

export default function MedicineSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrText, setOcrText] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchMedicines();
    }
  }, [isOpen]);

  const fetchMedicines = async () => {
    setLoading(true);
    // Static inventory — no database required
    const staticMedicines = [
      { _id: '1', name: 'Paracetamol 650mg (Dolo)', genericName: 'Paracetamol / Acetaminophen', quantity: 500, price: 32, requiresPrescription: false, pharmacy: { name: 'Apollo Pharmacy 24/7 (Kothrud)', distance: '1.2', contactNumber: '+91 20 2544 1122', address: 'Shop 4, Karve Road, Kothrud, Pune', city: 'Pune', googleMapLink: 'https://maps.google.com/?q=Apollo+Pharmacy+Kothrud+Pune' } },
      { _id: '2', name: 'Azithromycin 500mg (Azithral)', genericName: 'Azithromycin', quantity: 120, price: 118, requiresPrescription: true, pharmacy: { name: 'Apollo Pharmacy 24/7 (Kothrud)', distance: '1.2', contactNumber: '+91 20 2544 1122', address: 'Shop 4, Karve Road, Kothrud, Pune', city: 'Pune', googleMapLink: 'https://maps.google.com/?q=Apollo+Pharmacy+Kothrud+Pune' } },
      { _id: '3', name: 'Amoxicillin & Potassium Clavulanate 625mg', genericName: 'Augmentin / Amoxicillin', quantity: 85, price: 204, requiresPrescription: true, pharmacy: { name: 'Apollo Pharmacy 24/7 (Kothrud)', distance: '1.2', contactNumber: '+91 20 2544 1122', address: 'Shop 4, Karve Road, Kothrud, Pune', city: 'Pune', googleMapLink: 'https://maps.google.com/?q=Apollo+Pharmacy+Kothrud+Pune' } },
      { _id: '4', name: 'Montelukast & Levocetirizine (Montek LC)', genericName: 'Montelukast / Levocetirizine', quantity: 210, price: 145, requiresPrescription: false, pharmacy: { name: 'Apollo Pharmacy 24/7 (Kothrud)', distance: '1.2', contactNumber: '+91 20 2544 1122', address: 'Shop 4, Karve Road, Kothrud, Pune', city: 'Pune', googleMapLink: 'https://maps.google.com/?q=Apollo+Pharmacy+Kothrud+Pune' } },
      { _id: '5', name: 'Pantoprazole 40mg (Pan-40)', genericName: 'Pantoprazole', quantity: 340, price: 95, requiresPrescription: false, pharmacy: { name: 'Apollo Pharmacy 24/7 (Kothrud)', distance: '1.2', contactNumber: '+91 20 2544 1122', address: 'Shop 4, Karve Road, Kothrud, Pune', city: 'Pune', googleMapLink: 'https://maps.google.com/?q=Apollo+Pharmacy+Kothrud+Pune' } },
      { _id: '6', name: 'Metformin 500mg (Glycomet)', genericName: 'Metformin Hydrochloride', quantity: 180, price: 55, requiresPrescription: true, pharmacy: { name: 'MedPlus Pharmacy (Deccan)', distance: '2.4', contactNumber: '+91 20 2567 8899', address: 'FC Road, Deccan Gymkhana, Pune', city: 'Pune', googleMapLink: 'https://maps.google.com/?q=MedPlus+Deccan+Pune' } },
      { _id: '7', name: 'Cetirizine 10mg (Zyrtec)', genericName: 'Cetirizine Hydrochloride', quantity: 450, price: 28, requiresPrescription: false, pharmacy: { name: 'MedPlus Pharmacy (Deccan)', distance: '2.4', contactNumber: '+91 20 2567 8899', address: 'FC Road, Deccan Gymkhana, Pune', city: 'Pune', googleMapLink: 'https://maps.google.com/?q=MedPlus+Deccan+Pune' } },
      { _id: '8', name: 'Omeprazole 20mg (Omez)', genericName: 'Omeprazole', quantity: 290, price: 72, requiresPrescription: false, pharmacy: { name: 'MedPlus Pharmacy (Deccan)', distance: '2.4', contactNumber: '+91 20 2567 8899', address: 'FC Road, Deccan Gymkhana, Pune', city: 'Pune', googleMapLink: 'https://maps.google.com/?q=MedPlus+Deccan+Pune' } },
      { _id: '9', name: 'Ibuprofen 400mg (Brufen)', genericName: 'Ibuprofen', quantity: 15, price: 42, requiresPrescription: false, pharmacy: { name: 'HealthZone Chemist (Kharadi)', distance: '4.1', contactNumber: '+91 20 6634 5500', address: 'Zensar IT Park Road, Kharadi, Pune', city: 'Pune', googleMapLink: 'https://maps.google.com/?q=Kharadi+Pharmacy+Pune' } },
      { _id: '10', name: 'Atorvastatin 10mg (Lipitor)', genericName: 'Atorvastatin Calcium', quantity: 95, price: 138, requiresPrescription: true, pharmacy: { name: 'HealthZone Chemist (Kharadi)', distance: '4.1', contactNumber: '+91 20 6634 5500', address: 'Zensar IT Park Road, Kharadi, Pune', city: 'Pune', googleMapLink: 'https://maps.google.com/?q=Kharadi+Pharmacy+Pune' } },
    ];
    setMedicines(staticMedicines);
    setFilteredMedicines(staticMedicines);
    setLoading(false);
  };

  // Perform fuzzy search with Fuse.js when query changes
  useEffect(() => {
    if (!query.trim()) {
      setFilteredMedicines(medicines);
      return;
    }

    const fuse = new Fuse(medicines, {
      keys: ['name', 'genericName', 'pharmacy.name'],
      threshold: 0.4,
    });

    const results = fuse.search(query).map((res) => res.item);
    setFilteredMedicines(results);
  }, [query, medicines]);

  // Handle Photo OCR upload with Tesseract.js
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setOcrLoading(true);
    setOcrText('');

    try {
      const { data: { text } } = await Tesseract.recognize(file, 'eng', {
        logger: (m) => console.log(m),
      });

      console.log('Extracted OCR Text:', text);
      setOcrText(text);

      // Extract potential medical keywords (e.g. Paracetamol, Dolo, Azithromycin)
      const words = text.split(/\s+/).filter((w) => w.length > 3);
      if (words.length > 0) {
        setQuery(words[0]); // Auto set first prominent word into search query
      }
    } catch (err) {
      console.error('OCR Error:', err);
    } finally {
      setOcrLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-teal-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-teal-600 rounded-xl">
              <Pill className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Pharmacy Medicine Locator</h3>
              <p className="text-xs text-teal-200">Real-time stock availability & price comparison</p>
            </div>
          </div>
          <button onClick={onClose} className="text-teal-300 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & OCR trigger */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search medicine (e.g. Paracetamol, Dolo, Azithromycin)..."
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              />
            </div>

            {/* OCR Prescription Upload */}
            <label className="cursor-pointer bg-white hover:bg-slate-100 text-teal-700 border border-teal-300 px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm">
              <Camera className="w-4 h-4 text-teal-600" />
              <span>{ocrLoading ? 'Scanning...' : 'Prescription Photo'}</span>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>

          {ocrLoading && (
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 text-xs text-teal-800 flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Analyzing prescription photo with Tesseract OCR...</span>
            </div>
          )}

          {ocrText && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-xs text-emerald-800">
              <span className="font-bold">Extracted text:</span> "{ocrText.substring(0, 100)}..."
            </div>
          )}
        </div>

        {/* Medicine Stock List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {loading ? (
            <div className="text-center py-10 text-slate-500 text-sm">Searching pharmacy network...</div>
          ) : filteredMedicines.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">
              No matching medicines found for "{query}".
            </div>
          ) : (
            filteredMedicines.map((med) => (
              <div
                key={med._id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-teal-400 transition flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-base text-slate-900">{med.name}</h4>
                    {med.requiresPrescription && (
                      <span className="bg-rose-100 text-rose-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded border border-rose-200">
                        Rx Required
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Generic: {med.genericName}</p>
                  
                  {med.pharmacy && (
                    <div className="flex flex-col space-y-1 mt-2 text-xs text-slate-600">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center text-teal-700 font-semibold">
                          <MapPin className="w-3.5 h-3.5 mr-1" /> {med.pharmacy.name} ({med.pharmacy.distance} km)
                        </span>
                        <span>Tel: {med.pharmacy.contactNumber}</span>
                      </div>
                      {med.pharmacy.address && (
                        <div className="text-[11px] text-slate-500 flex items-center space-x-2">
                          <span>{med.pharmacy.address} {med.pharmacy.city && `(${med.pharmacy.city})`}</span>
                          {med.pharmacy.googleMapLink && (
                            <a
                              href={med.pharmacy.googleMapLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-teal-600 hover:underline font-semibold ml-1"
                            >
                              📍 Open Map
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div className="text-lg font-extrabold text-teal-700">₹{med.price}</div>
                  <div
                    className={`text-xs font-bold mt-0.5 ${
                      med.quantity > 20 ? 'text-emerald-600' : 'text-amber-600'
                    }`}
                  >
                    {med.quantity} in stock
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
