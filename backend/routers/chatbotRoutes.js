const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const { optionalAuthMiddleware } = require('../middleware/authMiddleware');
const { chatLimiter } = require('../middleware/rateLimitMiddleware');

router.post('/', chatLimiter, optionalAuthMiddleware, chatbotController.chat);

module.exports = router;
