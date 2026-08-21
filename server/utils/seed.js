const bcrypt = require('bcryptjs');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Hospital = require('../models/Hospital');
const Bed = require('../models/Bed');
const Vaccine = require('../models/Vaccine');
const BookingRequest = require('../models/BookingRequest');
const PharmacyShop = require('../models/PharmacyShop');
const Medicine = require('../models/Medicine');

async function seedData() {
  console.log('[Seed] Starting database seeder for Pune region...');
  await connectDB();

  // Clear existing collections
  await User.deleteMany({});
  await Hospital.deleteMany({});
  await Bed.deleteMany({});
  await Vaccine.deleteMany({});
  await BookingRequest.deleteMany({});
  await PharmacyShop.deleteMany({});
  await Medicine.deleteMany({});

  console.log('[Seed] Cleared existing data.');

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  // 1. Create Users
  const patientUser = await User.create({
    name: 'Rahul Sharma (Patient)',
    email: 'patient@demo.com',
    passwordHash,
    role: 'patient',
  });

  const rubyHallAdmin = await User.create({
    name: 'Dr. Ananya Roy (Admin)',
    email: 'admin@rubyhall.com',
    passwordHash,
    role: 'hospital_admin',
  });

  const sahyadriAdmin = await User.create({
    name: 'Dr. Vikram Sethi (Admin)',
    email: 'admin@sahyadri.com',
    passwordHash,
    role: 'hospital_admin',
  });

  const manipalAdmin = await User.create({
    name: 'Dr. Rajesh Patel (Admin)',
    email: 'admin@manipal.com',
    passwordHash,
    role: 'hospital_admin',
  });

  const apolloPharmaAdmin = await User.create({
    name: 'Suresh Kumar (Pharmacist)',
    email: 'admin@apollopharma.com',
    passwordHash,
    role: 'pharmacy_admin',
  });

  console.log('[Seed] Created demo users.');

  // 2. Create Hospitals around Pune coordinates (Default Center: 18.5204, 73.8567)
  const rubyHallHosp = await Hospital.create({
    ownerId: rubyHallAdmin._id,
    name: 'Ruby Hall Clinic Super Speciality',
    address: '40 Sasoon Road, Sangamvadi, Pune',
    city: 'Pune',
    googleMapLink: 'https://maps.google.com/?q=Ruby+Hall+Clinic+Pune',
    lat: 18.5332,
    lng: 73.8770,
    licenseNo: 'HOSP-PUN-9842',
    contactNumber: '+91 20 6645 5100',
    trustScore: 4.9,
  });

  const sahyadriHosp = await Hospital.create({
    ownerId: sahyadriAdmin._id,
    name: 'Sahyadri Super Speciality Hospital',
    address: 'Plot No. 30, Erandwane, Deccan Gymkhana, Pune',
    city: 'Pune',
    googleMapLink: 'https://maps.google.com/?q=Sahyadri+Hospital+Deccan+Pune',
    lat: 18.5158,
    lng: 73.8418,
    licenseNo: 'HOSP-PUN-4421',
    contactNumber: '+91 20 6721 5000',
    trustScore: 4.8,
  });

  const manipalHosp = await Hospital.create({
    ownerId: manipalAdmin._id,
    name: 'Manipal Hospital Critical Care',
    address: 'Zensar IT Park Road, Kharadi, Pune',
    city: 'Pune',
    googleMapLink: 'https://maps.google.com/?q=Manipal+Hospital+Kharadi+Pune',
    lat: 18.5516,
    lng: 73.9348,
    licenseNo: 'HOSP-PUN-3310',
    contactNumber: '+91 20 6190 2200',
    trustScore: 4.7,
  });

  console.log('[Seed] Created Pune hospitals.');

  // 3. Create Beds for Hospitals
  await Bed.insertMany([
    // Ruby Hall Beds
    { hospitalId: rubyHallHosp._id, type: 'General', total: 40, occupied: 28, pricePerDay: 1500 },
    { hospitalId: rubyHallHosp._id, type: 'Oxygen', total: 25, occupied: 19, pricePerDay: 2800 },
    { hospitalId: rubyHallHosp._id, type: 'ICU', total: 15, occupied: 12, pricePerDay: 6500 },
    { hospitalId: rubyHallHosp._id, type: 'Ventilator', total: 8, occupied: 5, pricePerDay: 9500 },

    // Sahyadri Beds
    { hospitalId: sahyadriHosp._id, type: 'General', total: 50, occupied: 45, pricePerDay: 1200 },
    { hospitalId: sahyadriHosp._id, type: 'Oxygen', total: 30, occupied: 22, pricePerDay: 2400 },
    { hospitalId: sahyadriHosp._id, type: 'ICU', total: 10, occupied: 9, pricePerDay: 7000 },
    { hospitalId: sahyadriHosp._id, type: 'Ventilator', total: 6, occupied: 6, pricePerDay: 10500 },

    // Manipal Beds
    { hospitalId: manipalHosp._id, type: 'General', total: 35, occupied: 15, pricePerDay: 1800 },
    { hospitalId: manipalHosp._id, type: 'Oxygen', total: 20, occupied: 8, pricePerDay: 3000 },
    { hospitalId: manipalHosp._id, type: 'ICU', total: 12, occupied: 4, pricePerDay: 6000 },
    { hospitalId: manipalHosp._id, type: 'Ventilator', total: 5, occupied: 1, pricePerDay: 9000 },
  ]);

  console.log('[Seed] Created bed inventories.');

  // 4. Create Vaccines
  await Vaccine.insertMany([
    { hospitalId: rubyHallHosp._id, name: 'Covishield', quantity: 150, price: 780 },
    { hospitalId: rubyHallHosp._id, name: 'Covaxin', quantity: 90, price: 1200 },
    { hospitalId: rubyHallHosp._id, name: 'Corbevax', quantity: 60, price: 400 },

    { hospitalId: sahyadriHosp._id, name: 'Covishield', quantity: 80, price: 750 },
    { hospitalId: sahyadriHosp._id, name: 'Influenza (Flu Shot)', quantity: 45, price: 950 },

    { hospitalId: manipalHosp._id, name: 'Covaxin', quantity: 120, price: 1150 },
    { hospitalId: manipalHosp._id, name: 'Hepatitis B Vaccine', quantity: 30, price: 650 },
  ]);

  console.log('[Seed] Created vaccine stocks.');

  // 5. Create Sample Booking Request
  await BookingRequest.create({
    patientId: patientUser._id,
    hospitalId: rubyHallHosp._id,
    uniquePatientId: 'PAT-2026-9842',
    bedType: 'ICU',
    patientName: 'Rahul Sharma',
    patientPhone: '+91 99887 76655',
    notes: 'Severe pneumonia, needs urgent oxygen and ICU monitoring.',
    status: 'pending',
  });

  // 6. Create Pharmacy & Medicines in Pune
  const apolloPharma = await PharmacyShop.create({
    ownerId: apolloPharmaAdmin._id,
    name: 'Apollo Pharmacy 24/7 (Kothrud)',
    address: 'Shop 4, Karve Road, Kothrud, Pune',
    city: 'Pune',
    lat: 18.5074,
    lng: 73.8077,
    contactNumber: '+91 20 2544 1122',
    trustScore: 4.9,
  });

  await Medicine.insertMany([
    {
      pharmacyId: apolloPharma._id,
      name: 'Paracetamol 650mg (Dolo)',
      genericName: 'Paracetamol / Acetaminophen',
      quantity: 500,
      price: 32,
      expiryDate: '2027-08-31',
      requiresPrescription: false,
    },
    {
      pharmacyId: apolloPharma._id,
      name: 'Azithromycin 500mg (Azithral)',
      genericName: 'Azithromycin',
      quantity: 120,
      price: 118,
      expiryDate: '2026-11-30',
      requiresPrescription: true,
    },
    {
      pharmacyId: apolloPharma._id,
      name: 'Amoxicillin & Potassium Clavulanate 625mg',
      genericName: 'Augmentin / Amoxicillin',
      quantity: 85,
      price: 204,
      expiryDate: '2026-09-15',
      requiresPrescription: true,
    },
    {
      pharmacyId: apolloPharma._id,
      name: 'Montelukast & Levocetirizine',
      genericName: 'Montek LC',
      quantity: 210,
      price: 145,
      expiryDate: '2027-05-20',
      requiresPrescription: false,
    },
    {
      pharmacyId: apolloPharma._id,
      name: 'Pantoprazole 40mg (Pan-40)',
      genericName: 'Pantoprazole',
      quantity: 340,
      price: 95,
      expiryDate: '2027-10-10',
      requiresPrescription: false,
    },
  ]);

  console.log('[Seed] Pune Database successfully seeded!');
  await disconnectDB();
}

if (require.main === module) {
  seedData()
    .then(() => {
      console.log('[Seed] Done!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed Error]:', err);
      process.exit(1);
    });
}

module.exports = seedData;
