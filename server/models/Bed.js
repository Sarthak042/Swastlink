const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema(
  {
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    type: {
      type: String,
      enum: ['General', 'ICU', 'Ventilator', 'Oxygen'],
      required: true,
    },
    total: { type: Number, required: true, min: 0 },
    occupied: { type: Number, required: true, min: 0 },
    pricePerDay: { type: Number, required: true, min: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

bedSchema.virtual('available').get(function () {
  return Math.max(0, this.total - this.occupied);
});

module.exports = mongoose.model('Bed', bedSchema);
