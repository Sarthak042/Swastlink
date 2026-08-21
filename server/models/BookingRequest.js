const mongoose = require('mongoose');

const bookingRequestSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    uniquePatientId: { type: String, required: true },
    bedType: {
      type: String,
      enum: ['General', 'ICU', 'Ventilator', 'Oxygen'],
      required: true,
    },
    patientName: { type: String, required: true },
    patientPhone: { type: String, required: true },
    notes: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BookingRequest', bookingRequestSchema);
