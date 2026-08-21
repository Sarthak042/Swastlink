import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { X, QrCode, Download, CheckCircle2, UserCheck } from 'lucide-react';

export default function QRCodeModal({ isOpen, onClose, booking }) {
  const [qrUrl, setQrUrl] = useState('');

  const patientCode = (booking?.uniquePatientId && booking.uniquePatientId !== 'PAT-2026-9842')
    ? booking.uniquePatientId
    : (booking?.patientId?.patientIdCode && booking.patientId.patientIdCode !== 'PAT-2026-9842')
    ? booking.patientId.patientIdCode
    : `PAT-2026-${booking?._id ? booking._id.toString().slice(-5).toUpperCase() : '9842'}`;

  useEffect(() => {
    if (booking && isOpen) {
      const payload = JSON.stringify({
        patientId: patientCode,
        bookingId: booking._id,
        patientName: booking.patientName,
        patientPhone: booking.patientPhone,
        hospitalName: booking.hospitalId ? booking.hospitalId.name : 'Hospital',
        bedType: booking.bedType,
        status: booking.status,
        issuedAt: new Date().toISOString(),
      });

      QRCode.toDataURL(payload, { width: 250, margin: 2 })
        .then((url) => setQrUrl(url))
        .catch((err) => console.error('QR Generation Error:', err));
    }
  }, [booking, isOpen, patientCode]);

  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-sm w-full border border-slate-200 shadow-2xl p-6 text-center space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <QrCode className="w-5 h-5 text-brand-600" />
            <h3 className="font-bold text-base text-slate-900">Bed Admission QR Pass</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Unique Patient ID Badge */}
        <div className="bg-brand-50 border border-brand-200 rounded-xl py-1.5 px-3 inline-flex items-center space-x-1.5 text-brand-700">
          <UserCheck className="w-4 h-4 text-brand-600" />
          <span className="text-xs font-black tracking-wider">Patient ID: {patientCode}</span>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 inline-block">
          {qrUrl ? (
            <img src={qrUrl} alt="QR Admission Pass" className="w-48 h-48 mx-auto rounded-lg shadow-sm" />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400">Generating QR...</div>
          )}
        </div>

        <div className="space-y-1 text-xs text-slate-600">
          <div className="font-bold text-slate-900 text-sm">{booking.patientName}</div>
          <div>Bed Category: <strong className="text-brand-700">{booking.bedType}</strong></div>
          <div className="text-[10px] text-emerald-600 font-semibold flex items-center justify-center gap-1 mt-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Verified Admission Pass
          </div>
        </div>

        <a
          href={qrUrl}
          download={`SwasthLink-Pass-${patientCode}.png`}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-2.5 rounded-xl shadow flex items-center justify-center space-x-2 transition inline-flex"
        >
          <Download className="w-4 h-4" />
          <span>Save Digital Admission Pass</span>
        </a>
      </div>
    </div>
  );
}
