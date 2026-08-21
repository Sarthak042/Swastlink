const express = require('express');
const router = express.Router();
const bedController = require('../controllers/bedController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/hospital/:hospitalId', bedController.getBedsByHospital);
router.post('/upsert', verifyToken, requireRole('hospital_admin'), bedController.upsertBed);
router.delete('/:id', verifyToken, requireRole('hospital_admin'), bedController.deleteBed);

module.exports = router;
