const express = require('express');
const router = express.Router();
const vaccineController = require('../controllers/vaccineController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/hospital/:hospitalId', vaccineController.getVaccinesByHospital);
router.post('/upsert', verifyToken, requireRole('hospital_admin'), vaccineController.upsertVaccine);
router.delete('/:id', verifyToken, requireRole('hospital_admin'), vaccineController.deleteVaccine);

module.exports = router;
