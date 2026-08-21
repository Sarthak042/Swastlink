const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    pharmacyId: { type: mongoose.Schema.Types.ObjectId, ref: 'PharmacyShop', required: true },
    name: { type: String, required: true, trim: true },
    genericName: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    expiryDate: { type: String, default: '' },
    requiresPrescription: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Medicine', medicineSchema);
