const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecordController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Doctor completes clinical consultation
router.post('/', authMiddleware, authorizeRoles('doctor'), medicalRecordController.completeConsultation);

// Fetch specific medical record (with resource-level authorization)
router.get('/:id', authMiddleware, medicalRecordController.getRecordById);

module.exports = router;
