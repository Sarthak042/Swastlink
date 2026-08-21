const PharmacyShop = require('../models/PharmacyShop');
const Medicine = require('../models/Medicine');
const { calculateDistance } = require('../utils/haversine');

// Search medicines across pharmacies
exports.searchMedicines = async (req, res) => {
  try {
    const { query, lat = 18.5204, lng = 73.8567 } = req.query;

    let filter = {};
    if (query) {
      filter = {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { genericName: { $regex: query, $options: 'i' } },
        ],
      };
    }

    const pharmacies = await PharmacyShop.find().lean();
    const medicines = await Medicine.find(filter).lean();

    const results = medicines.map((med) => {
      const pharmacy = pharmacies.find((p) => p._id.toString() === med.pharmacyId.toString());
      const distance = pharmacy ? calculateDistance(lat, lng, pharmacy.lat, pharmacy.lng) : 0;

      return {
        ...med,
        pharmacy: pharmacy
          ? {
              id: pharmacy._id,
              name: pharmacy.name,
              address: pharmacy.address,
              city: pharmacy.city || 'Pune',
              googleMapLink: pharmacy.googleMapLink || '',
              contactNumber: pharmacy.contactNumber,
              distance,
            }
          : null,
      };
    });

    results.sort((a, b) => (a.pharmacy?.distance || 999) - (b.pharmacy?.distance || 999));
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Error searching medicines.' });
  }
};

// Get Pharmacy Inventory for logged-in pharmacy admin
exports.getPharmacyInventory = async (req, res) => {
  try {
    let pharmacy = await PharmacyShop.findOne({ ownerId: req.user._id });
    if (!pharmacy) {
      pharmacy = await PharmacyShop.create({
        ownerId: req.user._id,
        name: req.user.name ? `${req.user.name.replace(/\s*\(Pharmacist\)/, '')} Pharmacy` : 'Apollo Pharmacy 24/7',
        address: 'Shop 4, Karve Road, Kothrud, Pune',
        city: 'Pune',
        googleMapLink: '',
        lat: 18.5074,
        lng: 73.8077,
        contactNumber: '+91 20 2544 1122',
        trustScore: 4.9,
      });
    }

    const medicines = await Medicine.find({ pharmacyId: pharmacy._id }).sort({ updatedAt: -1 }).lean();
    res.json({ pharmacy, medicines });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching pharmacy inventory.' });
  }
};

// Create or Update Medicine Stock (Name, Generic Formula, Stock Qty, Price, Expiry, Rx Required)
exports.upsertMedicine = async (req, res) => {
  try {
    let pharmacy = await PharmacyShop.findOne({ ownerId: req.user._id });
    if (!pharmacy) {
      pharmacy = await PharmacyShop.create({
        ownerId: req.user._id,
        name: req.user.name ? `${req.user.name.replace(/\s*\(Pharmacist\)/, '')} Pharmacy` : 'Apollo Pharmacy 24/7',
        address: 'Shop 4, Karve Road, Kothrud, Pune',
        city: 'Pune',
        googleMapLink: '',
        lat: 18.5074,
        lng: 73.8077,
        contactNumber: '+91 20 2544 1122',
        trustScore: 4.9,
      });
    }

    const { id, name, genericName, quantity, price, expiryDate, requiresPrescription } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Medicine brand name is required.' });
    }

    const numQty = Math.max(0, parseInt(quantity, 10) || 0);
    const numPrice = Math.max(0, parseInt(price, 10) || 0);

    let medicine = null;
    if (id) {
      medicine = await Medicine.findOne({ _id: id, pharmacyId: pharmacy._id });
    }

    if (!medicine) {
      medicine = await Medicine.findOne({
        pharmacyId: pharmacy._id,
        name: { $regex: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      });
    }

    if (medicine) {
      medicine.name = name.trim();
      medicine.genericName = genericName ? genericName.trim() : medicine.genericName;
      medicine.quantity = numQty;
      medicine.price = numPrice;
      medicine.expiryDate = expiryDate || medicine.expiryDate;
      medicine.requiresPrescription = Boolean(requiresPrescription);
      await medicine.save();
    } else {
      medicine = await Medicine.create({
        pharmacyId: pharmacy._id,
        name: name.trim(),
        genericName: genericName ? genericName.trim() : name.trim(),
        quantity: numQty,
        price: numPrice,
        expiryDate: expiryDate || '2027-12-31',
        requiresPrescription: Boolean(requiresPrescription),
      });
    }

    res.json({ message: 'Medicine inventory updated successfully.', medicine });
  } catch (err) {
    console.error('[upsertMedicine Error]:', err);
    res.status(500).json({ message: 'Error updating medicine: ' + err.message });
  }
};

// Delete Medicine
exports.deleteMedicine = async (req, res) => {
  try {
    const pharmacy = await PharmacyShop.findOne({ ownerId: req.user._id });
    if (!pharmacy) {
      return res.status(403).json({ message: 'Unauthorized pharmacy admin.' });
    }

    await Medicine.findOneAndDelete({ _id: req.params.id, pharmacyId: pharmacy._id });
    res.json({ message: 'Medicine entry deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting medicine.' });
  }
};
