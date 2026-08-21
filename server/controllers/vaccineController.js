const Vaccine = require('../models/Vaccine');
const Hospital = require('../models/Hospital');

// Get vaccines for hospital
exports.getVaccinesByHospital = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const vaccines = await Vaccine.find({ hospitalId }).lean();
    res.json(vaccines);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching vaccines.' });
  }
};

// Admin Create/Update Vaccine
exports.upsertVaccine = async (req, res) => {
  try {
    let hospital = await Hospital.findOne({ ownerId: req.user._id });
    if (!hospital) {
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

    const { name, quantity, price } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Vaccine name is required.' });
    }

    const numQty = Math.max(0, parseInt(quantity, 10) || 0);
    const numPrice = Math.max(0, parseInt(price, 10) || 0);

    let vaccine = await Vaccine.findOne({ hospitalId: hospital._id, name: { $regex: new RegExp(`^${name}$`, 'i') } });

    if (vaccine) {
      vaccine.quantity = numQty;
      vaccine.price = numPrice;
      await vaccine.save();
    } else {
      vaccine = await Vaccine.create({
        hospitalId: hospital._id,
        name,
        quantity: numQty,
        price: numPrice,
      });
    }

    if (req.io) {
      req.io.emit('inventory_updated', {
        hospitalId: hospital._id,
        hospitalName: hospital.name,
        resourceType: 'vaccine',
        vaccine,
      });
    }

    res.json({ message: 'Vaccine stock updated successfully', vaccine });
  } catch (err) {
    console.error('[upsertVaccine Error]:', err);
    res.status(500).json({ message: 'Error updating vaccine stock: ' + err.message });
  }
};

// Admin Delete Vaccine
exports.deleteVaccine = async (req, res) => {
  try {
    const { id } = req.params;
    const hospital = await Hospital.findOne({ ownerId: req.user._id });
    if (!hospital) {
      return res.status(403).json({ message: 'Unauthorized hospital admin.' });
    }

    const vaccine = await Vaccine.findOneAndDelete({ _id: id, hospitalId: hospital._id });
    if (!vaccine) {
      return res.status(404).json({ message: 'Vaccine record not found.' });
    }

    if (req.io) {
      req.io.emit('inventory_updated', {
        hospitalId: hospital._id,
        resourceType: 'vaccine_deleted',
        vaccineId: id,
      });
    }

    res.json({ message: 'Vaccine entry removed successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting vaccine.' });
  }
};
