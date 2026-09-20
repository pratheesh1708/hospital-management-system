const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecordController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Patient views their own medical history
router.get('/me/medical-history', authMiddleware, authorizeRoles('patient'), medicalRecordController.getMyMedicalHistory);

// Authorized doctor or admin views patient's medical history
router.get('/:patientId/medical-history', authMiddleware, authorizeRoles('doctor', 'admin'), medicalRecordController.getPatientHistory);

module.exports = router;
