const Bed = require('../models/Bed');
const Hospital = require('../models/Hospital');

// Get all beds for hospital
exports.getBedsByHospital = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const beds = await Bed.find({ hospitalId }).lean();
    const enrichedBeds = beds.map((b) => ({
      ...b,
      available: Math.max(0, b.total - b.occupied),
    }));
    res.json(enrichedBeds);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching beds.' });
  }
};

// Admin CRUD: Create or Update Bed
exports.upsertBed = async (req, res) => {
  try {
    let hospital = await Hospital.findOne({ ownerId: req.user._id });
    if (!hospital) {
      // Auto-create hospital profile if not already linked
      hospital = await Hospital.create({
        ownerId: req.user._id,
        name: req.user.name ? `${req.user.name.replace(/\s*\(Admin\)/, '')} Medical Center` : 'City Super Speciality Hospital',
        address: 'Kothrud, Pune',
        city: 'Pune',
        googleMapLink: '',
        lat: 18.5204,
        lng: 73.8567,
        licenseNo: 'HOSP-PUN-' + Math.floor(1000 + Math.random() * 9000),
        contactNumber: '+91 20 2544 1122',
        trustScore: 4.8,
      });
    }

    const { type, total, occupied, pricePerDay } = req.body;

    if (!type) {
      return res.status(400).json({ message: 'Bed type is required.' });
    }

    let numTotal = Math.max(0, parseInt(total, 10) || 0);
    let numOccupied = Math.max(0, parseInt(occupied, 10) || 0);
    let numPrice = Math.max(0, parseInt(pricePerDay, 10) || 0);

    if (numOccupied > numTotal) {
      numOccupied = numTotal;
    }

    let bed = await Bed.findOne({ hospitalId: hospital._id, type });

    if (bed) {
      bed.total = numTotal;
      bed.occupied = numOccupied;
      bed.pricePerDay = numPrice;
      await bed.save();
    } else {
      bed = await Bed.create({
        hospitalId: hospital._id,
        type,
        total: numTotal,
        occupied: numOccupied,
        pricePerDay: numPrice,
      });
    }

    const bedData = bed.toObject();
    bedData.available = Math.max(0, bed.total - bed.occupied);

    // Socket.io real-time broadcast to all connected clients!
    if (req.io) {
      req.io.emit('inventory_updated', {
        hospitalId: hospital._id,
        hospitalName: hospital.name,
        resourceType: 'bed',
        bed: bedData,
      });
    }

    res.json({ message: 'Bed inventory updated successfully', bed: bedData });
  } catch (err) {
    console.error('[upsertBed Error]:', err);
    res.status(500).json({ message: 'Error updating bed inventory: ' + err.message });
  }
};

// Admin Delete Bed
exports.deleteBed = async (req, res) => {
  try {
    const { id } = req.params;
    const hospital = await Hospital.findOne({ ownerId: req.user._id });
    if (!hospital) {
      return res.status(403).json({ message: 'Unauthorized hospital admin.' });
    }

    const bed = await Bed.findOneAndDelete({ _id: id, hospitalId: hospital._id });
    if (!bed) {
      return res.status(404).json({ message: 'Bed record not found.' });
    }

    if (req.io) {
      req.io.emit('inventory_updated', {
        hospitalId: hospital._id,
        resourceType: 'bed_deleted',
        bedId: id,
      });
    }

    res.json({ message: 'Bed entry removed successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting bed.' });
  }
};
