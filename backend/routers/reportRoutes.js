const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/my', authMiddleware, reportController.getMyReports);
router.get('/:id', authMiddleware, reportController.getReportById);

module.exports = router;
