const express = require('express');
const router = express.Router();
const pharmacyController = require('../controllers/pharmacyController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/search', pharmacyController.searchMedicines);
router.get('/inventory', verifyToken, requireRole('pharmacy_admin'), pharmacyController.getPharmacyInventory);
router.post('/medicine', verifyToken, requireRole('pharmacy_admin'), pharmacyController.upsertMedicine);
router.delete('/medicine/:id', verifyToken, requireRole('pharmacy_admin'), pharmacyController.deleteMedicine);

module.exports = router;
