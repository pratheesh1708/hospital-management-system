const userModel = require('../models/userModel');
const patientModel = require('../models/patientModel');
const oauthAccountModel = require('../models/oauthAccountModel');
const authService = require('./authService');
const auditLogModel = require('../models/auditLogModel');
const crypto = require('crypto');

const oauthService = {
  async handleOAuthUser({ provider = 'google', providerUserId, email, name, ipAddress = null }) {
    if (!providerUserId || !email) {
      const error = new Error('OAuth profile is missing essential identity fields.');
      error.statusCode = 400;
      throw error;
    }

    // 1. Check if OAuth account is already linked
    let oauthRecord = await oauthAccountModel.findAccount(provider, providerUserId);
    let userId;
    let user;

    if (oauthRecord) {
      userId = oauthRecord.user_id;
      user = await userModel.findById(userId);
      if (!user || user.status !== 'active') {
        const error = new Error('Your linked hospital account is inactive or suspended.');
        error.statusCode = 403;
        throw error;
      }
    } else {
      // 2. Check if a hospital user already exists with this verified email
      const existingUser = await userModel.findByEmail(email);

      if (existingUser) {
        userId = existingUser.user_id;
        user = existingUser;
        // Link OAuth identity to existing account
        await oauthAccountModel.linkAccount({
          userId,
          provider,
          providerUserId,
          providerEmail: email
        });

        await auditLogModel.log({
          userId,
          action: 'OAUTH_ACCOUNT_LINKED',
          entityType: 'OAUTH_ACCOUNT',
          entityId: providerUserId,
          ipAddress,
          details: { provider, email }
        });
      } else {
        // 3. Create a brand new patient account (NEVER auto-grant admin or doctor)
        const randomPassHash = crypto.randomBytes(32).toString('hex');
        userId = await userModel.create({
          name: name || 'Hospital Patient',
          email,
          passwordHash: randomPassHash,
          role: 'patient',
          emailVerified: 1
        });

        await patientModel.create({ userId });

        await oauthAccountModel.linkAccount({
          userId,
          provider,
          providerUserId,
          providerEmail: email
        });

        await auditLogModel.log({
          userId,
          action: 'OAUTH_ACCOUNT_CREATED',
          entityType: 'USER',
          entityId: userId,
          ipAddress,
          details: { provider, email, role: 'patient' }
        });

        user = await userModel.findById(userId);
      }
    }

    const token = authService.generateToken(user);
    const patientProfile = await patientModel.findByUserId(user.user_id);

    return {
      user: {
        userId: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        patientId: patientProfile ? patientProfile.patient_id : null
      },
      token
    };
  }
};

module.exports = oauthService;
