const BookingRequest = require('../models/BookingRequest');
const Hospital = require('../models/Hospital');
const Bed = require('../models/Bed');

// Create new bed booking request (Patient)
exports.createBooking = async (req, res) => {
  try {
    const { hospitalId, bedType, patientName, patientPhone, notes } = req.body;

    if (!hospitalId || !bedType || !patientName || !patientPhone) {
      return res.status(400).json({ message: 'Hospital ID, Bed Type, Patient Name, and Phone are required.' });
    }

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found.' });
    }

    // Check bed availability
    const bed = await Bed.findOne({ hospitalId, type: bedType });
    if (!bed || bed.total - bed.occupied <= 0) {
      return res.status(400).json({ message: `No available beds for type: ${bedType} at ${hospital.name}.` });
    }

    const uniquePatientId = req.user.patientIdCode || ('PAT-2026-' + Math.floor(1000 + Math.random() * 9000));

    const booking = await BookingRequest.create({
      patientId: req.user._id,
      hospitalId,
      uniquePatientId,
      bedType,
      patientName,
      patientPhone,
      notes: notes || '',
      status: 'pending',
    });

    const populatedBooking = await BookingRequest.findById(booking._id)
      .populate('patientId', 'name email')
      .populate('hospitalId', 'name contactNumber address')
      .lean();

    // Emit Socket.io event to Hospital Admin
    if (req.io) {
      req.io.emit('new_booking_request', {
        hospitalId,
        booking: populatedBooking,
      });
    }

    res.status(201).json({
      message: 'Bed reservation request submitted successfully!',
      booking: populatedBooking,
    });
  } catch (err) {
    console.error('[createBooking Error]:', err);
    res.status(500).json({ message: 'Error submitting booking request: ' + err.message });
  }
};

// Get booking requests for Hospital Admin
exports.getHospitalBookings = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ ownerId: req.user._id });
    if (!hospital) {
      return res.status(404).json({ message: 'No hospital profile associated with this account.' });
    }

    const bookings = await BookingRequest.find({ hospitalId: hospital._id })
      .populate('patientId', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching hospital booking requests.' });
  }
};

// Get patient's own bookings
exports.getPatientBookings = async (req, res) => {
  try {
    const bookings = await BookingRequest.find({ patientId: req.user._id })
      .populate('hospitalId', 'name address contactNumber lat lng')
      .sort({ createdAt: -1 })
      .lean();

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching your booking requests.' });
  }
};

// Admin Accept / Reject booking request with intelligent bed inventory sync
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be accepted or rejected.' });
    }

    const hospital = await Hospital.findOne({ ownerId: req.user._id });
    if (!hospital) {
      return res.status(403).json({ message: 'Unauthorized hospital admin.' });
    }

    const booking = await BookingRequest.findOne({ _id: id, hospitalId: hospital._id });
    if (!booking) {
      return res.status(404).json({ message: 'Booking request not found.' });
    }

    const previousStatus = booking.status;

    // Bed Inventory Adjustments
    const bed = await Bed.findOne({ hospitalId: hospital._id, type: booking.bedType });

    if (status === 'accepted' && previousStatus !== 'accepted') {
      if (bed && bed.occupied < bed.total) {
        bed.occupied += 1;
        await bed.save();
      }
    } else if (status === 'rejected' && previousStatus === 'accepted') {
      if (bed && bed.occupied > 0) {
        bed.occupied -= 1;
        await bed.save();
      }
    }

    booking.status = status;
    await booking.save();

    // Broadcast inventory update if bed changed
    if (bed && req.io) {
      req.io.emit('inventory_updated', {
        hospitalId: hospital._id,
        hospitalName: hospital.name,
        resourceType: 'bed',
        bed: {
          ...bed.toObject(),
          available: Math.max(0, bed.total - bed.occupied),
        },
      });
    }

    const updatedBooking = await BookingRequest.findById(booking._id)
      .populate('hospitalId', 'name contactNumber')
      .lean();

    // Broadcast status change to patient
    if (req.io) {
      req.io.emit('booking_status_changed', {
        patientId: booking.patientId,
        booking: updatedBooking,
      });
    }

    res.json({
      message: `Booking request marked as ${status}`,
      booking: updatedBooking,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error updating booking status: ' + err.message });
  }
};
