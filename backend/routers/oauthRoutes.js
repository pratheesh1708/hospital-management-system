const express = require('express');
const router = express.Router();
const oauthController = require('../controllers/oauthController');

router.get('/config', oauthController.getConfig);
router.get('/google', oauthController.initiateGoogle);
router.post('/google', oauthController.handleGoogleCallback);
router.get('/google/callback', oauthController.handleGoogleCallback);
router.post('/google/callback', oauthController.handleGoogleCallback);

module.exports = router;
