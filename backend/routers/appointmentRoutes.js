const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/', authMiddleware, appointmentController.bookAppointment);
router.get('/my', authMiddleware, appointmentController.getMyAppointments);
router.get('/:id', authMiddleware, appointmentController.getAppointmentById);
router.patch('/:id/cancel', authMiddleware, appointmentController.cancelAppointment);

module.exports = router;
