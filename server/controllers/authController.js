const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Hospital = require('../models/Hospital');
const PharmacyShop = require('../models/PharmacyShop');

const JWT_SECRET = process.env.JWT_SECRET || 'swasthlink_super_secret_hackventure_2026_key';

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, hospitalName, address, lat, lng, contactNumber, licenseNo, pharmacyName } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const patientIdCode = 'PAT-2026-' + Math.floor(1000 + Math.random() * 9000);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: role || 'patient',
      patientIdCode,
    });

    let hospital = null;
    let pharmacy = null;

    if (user.role === 'hospital_admin') {
      hospital = await Hospital.create({
        ownerId: user._id,
        name: hospitalName || `${name}'s Medical Center`,
        address: address || 'Kothrud, Pune',
        city: req.body.city || 'Pune',
        googleMapLink: req.body.googleMapLink || '',
        lat: lat ? parseFloat(lat) : 18.5204,
        lng: lng ? parseFloat(lng) : 73.8567,
        licenseNo: licenseNo || 'HOSP-PUN-' + Math.floor(1000 + Math.random() * 9000),
        contactNumber: contactNumber || '+91 20 2544 1122',
      });
    } else if (user.role === 'pharmacy_admin') {
      pharmacy = await PharmacyShop.create({
        ownerId: user._id,
        name: pharmacyName || `${name}'s Pharmacy`,
        address: address || 'Kothrud, Pune',
        city: req.body.city || 'Pune',
        googleMapLink: req.body.googleMapLink || '',
        lat: lat ? parseFloat(lat) : 18.5204,
        lng: lng ? parseFloat(lng) : 73.8567,
        contactNumber: contactNumber || '+91 20 2544 1122',
      });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        patientIdCode: user.patientIdCode,
        name: user.name,
        email: user.email,
        role: user.role,
        hospital: hospital ? { id: hospital._id, name: hospital.name } : null,
        pharmacy: pharmacy ? { id: pharmacy._id, name: pharmacy.name } : null,
      },
    });
  } catch (err) {
    console.error('[AuthRegister Error]:', err);
    res.status(500).json({ message: 'Server error during registration: ' + err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    if (!user.patientIdCode) {
      user.patientIdCode = 'PAT-2026-' + Math.floor(1000 + Math.random() * 9000);
      await user.save();
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    let hospital = null;
    let pharmacy = null;

    if (user.role === 'hospital_admin') {
      hospital = await Hospital.findOne({ ownerId: user._id });
    } else if (user.role === 'pharmacy_admin') {
      pharmacy = await PharmacyShop.findOne({ ownerId: user._id });
    }

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        patientIdCode: user.patientIdCode,
        name: user.name,
        email: user.email,
        role: user.role,
        hospital: hospital ? { id: hospital._id, name: hospital.name, lat: hospital.lat, lng: hospital.lng } : null,
        pharmacy: pharmacy ? { id: pharmacy._id, name: pharmacy.name } : null,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during login: ' + err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = req.user;
    if (!user.patientIdCode) {
      user.patientIdCode = 'PAT-2026-' + Math.floor(1000 + Math.random() * 9000);
      await user.save();
    }

    let hospital = null;
    let pharmacy = null;

    if (user.role === 'hospital_admin') {
      hospital = await Hospital.findOne({ ownerId: user._id });
    } else if (user.role === 'pharmacy_admin') {
      pharmacy = await PharmacyShop.findOne({ ownerId: user._id });
    }

    res.json({
      id: user._id,
      patientIdCode: user.patientIdCode,
      name: user.name,
      email: user.email,
      role: user.role,
      hospital: hospital ? { id: hospital._id, name: hospital.name, lat: hospital.lat, lng: hospital.lng } : null,
      pharmacy: pharmacy ? { id: pharmacy._id, name: pharmacy.name } : null,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile.' });
  }
};
