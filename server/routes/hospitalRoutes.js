const express = require('express');
const router = express.Router();
const hospitalController = require('../controllers/hospitalController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/', hospitalController.getAllHospitals);
router.get('/sos', hospitalController.getEmergencySOS);
router.get('/forecast', verifyToken, requireRole('hospital_admin'), hospitalController.getHospitalForecast);
router.get('/:id', hospitalController.getHospitalById);
router.put('/profile', verifyToken, requireRole('hospital_admin'), hospitalController.updateHospitalProfile);

module.exports = router;
