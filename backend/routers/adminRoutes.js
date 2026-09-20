const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// All admin routes require authentication and 'admin' role
router.use(authMiddleware, authorizeRoles('admin'));

router.get('/metrics', adminController.getMetrics);
router.get('/users', adminController.getUsers);
router.patch('/users/:id/status', adminController.updateUserStatus);
router.patch('/users/:id/role', adminController.updateUserRole);
router.get('/appointments', adminController.getAllAppointments);
router.get('/audit-logs', adminController.getAuditLogs);
router.post('/specializations', adminController.addSpecialization);

module.exports = router;
