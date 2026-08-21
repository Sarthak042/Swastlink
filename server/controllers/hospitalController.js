const Hospital = require('../models/Hospital');
const Bed = require('../models/Bed');
const Vaccine = require('../models/Vaccine');
const { calculateDistance } = require('../utils/haversine');

// Get all hospitals with live beds, vaccines, distance & weighted sorting
exports.getAllHospitals = async (req, res) => {
  try {
    const { userLat, userLng, sortBy = 'nearest', search = '', bedType } = req.query;

    const lat = userLat ? parseFloat(userLat) : 18.5204; // Default Pune center
    const lng = userLng ? parseFloat(userLng) : 73.8567;

    let query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const hospitals = await Hospital.find(query).lean();

    const hospitalIds = hospitals.map((h) => h._id);
    const beds = await Bed.find({ hospitalId: { $in: hospitalIds } }).lean();
    const vaccines = await Vaccine.find({ hospitalId: { $in: hospitalIds } }).lean();

    const enrichedHospitals = hospitals.map((hospital) => {
      const hospitalBeds = beds.filter((b) => b.hospitalId.toString() === hospital._id.toString());
      const hospitalVaccines = vaccines.filter((v) => v.hospitalId.toString() === hospital._id.toString());

      // Filter by bed type if requested
      const relevantBeds = bedType
        ? hospitalBeds.filter((b) => b.type.toLowerCase() === bedType.toLowerCase())
        : hospitalBeds;

      const totalAvailableBeds = relevantBeds.reduce((acc, b) => acc + Math.max(0, b.total - b.occupied), 0);
      const totalCapacity = relevantBeds.reduce((acc, b) => acc + b.total, 0);

      // Find lowest bed price
      const prices = relevantBeds.map((b) => b.pricePerDay).filter((p) => p > 0);
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;

      const distance = calculateDistance(lat, lng, hospital.lat, hospital.lng);

      return {
        ...hospital,
        distance,
        beds: hospitalBeds.map((b) => ({
          ...b,
          available: Math.max(0, b.total - b.occupied),
        })),
        vaccines: hospitalVaccines,
        totalAvailableBeds,
        totalCapacity,
        minPrice,
      };
    });

    // Sorting
    let sortedHospitals = [...enrichedHospitals];
    if (sortBy === 'nearest') {
      sortedHospitals.sort((a, b) => a.distance - b.distance);
    } else if (sortBy === 'beds') {
      sortedHospitals.sort((a, b) => b.totalAvailableBeds - a.totalAvailableBeds);
    } else if (sortBy === 'cheapest') {
      sortedHospitals.sort((a, b) => (a.minPrice || Infinity) - (b.minPrice || Infinity));
    }

    res.json(sortedHospitals);
  } catch (err) {
    console.error('[getAllHospitals Error]:', err);
    res.status(500).json({ message: 'Error retrieving hospital inventory: ' + err.message });
  }
};

// Emergency SOS endpoint: find top 3 nearest hospitals with available ICU or Ventilator beds
exports.getEmergencySOS = async (req, res) => {
  try {
    const { userLat, userLng } = req.query;
    const lat = userLat ? parseFloat(userLat) : 18.5204;
    const lng = userLng ? parseFloat(userLng) : 73.8567;

    const hospitals = await Hospital.find().lean();
    const hospitalIds = hospitals.map((h) => h._id);

    // Look for ICU or Ventilator beds
    const criticalBeds = await Bed.find({
      hospitalId: { $in: hospitalIds },
      type: { $in: ['ICU', 'Ventilator'] },
    }).lean();

    const emergencyHospitals = hospitals
      .map((hospital) => {
        const bedsForHosp = criticalBeds.filter(
          (b) => b.hospitalId.toString() === hospital._id.toString()
        );
        const icuBed = bedsForHosp.find((b) => b.type === 'ICU');
        const ventBed = bedsForHosp.find((b) => b.type === 'Ventilator');

        const icuAvailable = icuBed ? Math.max(0, icuBed.total - icuBed.occupied) : 0;
        const ventAvailable = ventBed ? Math.max(0, ventBed.total - ventBed.occupied) : 0;
        const totalCriticalAvailable = icuAvailable + ventAvailable;

        const distance = calculateDistance(lat, lng, hospital.lat, hospital.lng);

        return {
          ...hospital,
          distance,
          icuAvailable,
          ventAvailable,
          totalCriticalAvailable,
          icuBed,
          ventBed,
        };
      })
      .filter((h) => h.totalCriticalAvailable > 0) // Only hospitals with critical beds
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3); // Top 3 nearest

    res.json({
      message: 'Emergency SOS Hospitals Retrieved',
      count: emergencyHospitals.length,
      hospitals: emergencyHospitals,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error triggering Emergency SOS: ' + err.message });
  }
};

// Get single hospital by ID
exports.getHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id).lean();
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found.' });
    }

    const beds = await Bed.find({ hospitalId: hospital._id }).lean();
    const vaccines = await Vaccine.find({ hospitalId: hospital._id }).lean();

    res.json({
      ...hospital,
      beds: beds.map((b) => ({ ...b, available: Math.max(0, b.total - b.occupied) })),
      vaccines,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving hospital details.' });
  }
};

// Admin update hospital profile
exports.updateHospitalProfile = async (req, res) => {
  try {
    const { name, address, lat, lng, contactNumber } = req.body;
    const hospital = await Hospital.findOne({ ownerId: req.user._id });
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital profile not found for this user.' });
    }

    if (name) hospital.name = name;
    if (address) hospital.address = address;
    if (lat) hospital.lat = parseFloat(lat);
    if (lng) hospital.lng = parseFloat(lng);
    if (contactNumber) hospital.contactNumber = contactNumber;

    await hospital.save();
    res.json(hospital);
  } catch (err) {
    res.status(500).json({ message: 'Error updating hospital profile.' });
  }
};

// ML Bed Demand Forecast Endpoint
exports.getHospitalForecast = async (req, res) => {
  try {
    const { generateBedDemandForecast } = require('../utils/forecast');
    const hospital = await Hospital.findOne({ ownerId: req.user._id });
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital profile not found.' });
    }

    const beds = await Bed.find({ hospitalId: hospital._id }).lean();
    const totalCapacity = beds.reduce((acc, b) => acc + b.total, 0) || 40;
    const totalOccupied = beds.reduce((acc, b) => acc + b.occupied, 0) || 25;

    const forecastData = generateBedDemandForecast(totalOccupied, totalCapacity);

    res.json({
      hospitalName: hospital.name,
      totalCapacity,
      currentOccupied: totalOccupied,
      ...forecastData,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error generating bed demand forecast: ' + err.message });
  }
};

