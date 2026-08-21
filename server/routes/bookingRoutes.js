const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.post('/', verifyToken, bookingController.createBooking);
router.get('/my-bookings', verifyToken, bookingController.getPatientBookings);
router.get('/hospital-requests', verifyToken, requireRole('hospital_admin'), bookingController.getHospitalBookings);
router.patch('/:id/status', verifyToken, requireRole('hospital_admin'), bookingController.updateBookingStatus);

module.exports = router;
