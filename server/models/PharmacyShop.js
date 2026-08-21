const mongoose = require('mongoose');

const pharmacyShopSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    city: { type: String, default: 'Pune', trim: true },
    googleMapLink: { type: String, default: '' },
    lat: { type: Number, required: true, default: 18.5204 },
    lng: { type: Number, required: true, default: 73.8567 },
    contactNumber: { type: String, required: true },
    trustScore: { type: Number, default: 4.9 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PharmacyShop', pharmacyShopSchema);
