const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/', doctorController.getDoctors);
router.get('/specializations', doctorController.getSpecializations);
router.get('/:id', doctorController.getDoctorById);
router.get('/:id/availability', doctorController.getAvailability);

// Doctor only: manage availability slots
router.post('/availability', authMiddleware, authorizeRoles('doctor'), doctorController.addAvailability);
router.delete('/availability/:availabilityId', authMiddleware, authorizeRoles('doctor'), doctorController.removeAvailability);

module.exports = router;
