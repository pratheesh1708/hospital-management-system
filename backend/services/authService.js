const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/environment');
const userModel = require('../models/userModel');
const patientModel = require('../models/patientModel');
const doctorModel = require('../models/doctorModel');
const otpService = require('./otpService');
const emailQueue = require('../queues/emailQueue');
const auditLogModel = require('../models/auditLogModel');

const authService = {
  generateToken(user) {
    // Only minimal non-sensitive authentication claims in JWT
    const payload = {
      userId: user.user_id,
      role: user.role
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn
    });
  },

  verifyToken(token) {
    return jwt.verify(token, config.jwt.secret);
  },

  getCookieOptions() {
    return {
      httpOnly: true,
      secure: config.jwt.cookieSecure,
      sameSite: config.jwt.cookieSameSite,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    };
  },

  async register({ name, email, password, role = 'patient', phone = null, ipAddress = null }) {
    const existing = await userModel.findByEmail(email);
    if (existing) {
      const error = new Error('An account with this email address already exists.');
      error.statusCode = 409;
      throw error;
    }

    // Role safety: OAuth/public register can create patient or doctor; never admin
    const allowedRoles = ['patient', 'doctor'];
    const assignedRole = allowedRoles.includes(role) ? role : 'patient';

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = await userModel.create({
      name,
      email,
      passwordHash,
      role: assignedRole,
      phone,
      emailVerified: 0
    });

    if (assignedRole === 'patient') {
      await patientModel.create({ userId });
    } else if (assignedRole === 'doctor') {
      await doctorModel.create({
        userId,
        specializationId: 1,
        qualification: 'General Medicine Practitioner',
        experience: 1,
        consultationFee: 50.00
      });
    }

    // Generate and dispatch verification OTP
    const rawOtp = await otpService.createOtp(email, 'registration', 10);
    emailQueue.add('send_otp', { email, otp: rawOtp, purpose: 'registration' });

    await auditLogModel.log({
      userId,
      action: 'USER_REGISTERED',
      entityType: 'USER',
      entityId: userId,
      ipAddress,
      details: { email, role: assignedRole }
    });

    return {
      userId,
      email,
      name,
      role: assignedRole,
      requiresVerification: true,
      message: 'Registration initiated. Please check your email for the verification code.'
    };
  },

  async verifyEmailOtp({ email, otp, ipAddress = null }) {
    const user = await userModel.findByEmail(email);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    const verification = await otpService.verifyOtp(email, otp, 'registration');
    if (!verification.success) {
      const error = new Error(verification.message);
      error.statusCode = 400;
      throw error;
    }

    await userModel.verifyEmail(user.user_id);

    await auditLogModel.log({
      userId: user.user_id,
      action: 'EMAIL_VERIFIED',
      entityType: 'USER',
      entityId: user.user_id,
      ipAddress,
      details: { email }
    });

    const token = this.generateToken(user);

    return {
      user: {
        userId: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      },
      token
    };
  },

  async login({ email, password, ipAddress = null }) {
    const user = await userModel.findByEmail(email);
    if (!user) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    if (user.status !== 'active') {
      const error = new Error('Your account is currently inactive or suspended. Please contact hospital support.');
      error.statusCode = 403;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      await auditLogModel.log({
        userId: user.user_id,
        action: 'LOGIN_FAILED',
        entityType: 'USER',
        entityId: user.user_id,
        ipAddress,
        details: { reason: 'Incorrect password' }
      });
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    if (!user.email_verified) {
      // Re-send OTP if unverified
      const rawOtp = await otpService.createOtp(user.email, 'registration', 10);
      emailQueue.add('send_otp', { email: user.email, otp: rawOtp, purpose: 'registration' });

      return {
        requiresVerification: true,
        email: user.email,
        message: 'Your email is not verified yet. A new verification OTP has been sent.'
      };
    }

    const token = this.generateToken(user);

    await auditLogModel.log({
      userId: user.user_id,
      action: 'LOGIN_SUCCESS',
      entityType: 'USER',
      entityId: user.user_id,
      ipAddress,
      details: { role: user.role }
    });

    // Fetch role specific profile ID
    let profileData = {};
    if (user.role === 'patient') {
      const pat = await patientModel.findByUserId(user.user_id);
      if (pat) profileData.patientId = pat.patient_id;
    } else if (user.role === 'doctor') {
      const doc = await doctorModel.findByUserId(user.user_id);
      if (doc) profileData.doctorId = doc.doctor_id;
    }

    return {
      user: {
        userId: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        ...profileData
      },
      token
    };
  },

  async resendOtp({ email, purpose = 'registration' }) {
    const user = await userModel.findByEmail(email);
    if (!user) {
      const error = new Error('Account with this email does not exist.');
      error.statusCode = 404;
      throw error;
    }

    const rawOtp = await otpService.createOtp(email, purpose, 10);
    emailQueue.add('send_otp', { email, otp: rawOtp, purpose });

    return {
      success: true,
      message: 'A fresh verification OTP has been dispatched to your email.'
    };
  },

  async requestPasswordReset({ email, ipAddress = null }) {
    const user = await userModel.findByEmail(email);
    if (!user) {
      // For security, do not disclose whether user exists
      return { success: true, message: 'If an account exists, a reset code has been sent.' };
    }

    const rawOtp = await otpService.createOtp(email, 'forgot_password', 15);
    emailQueue.add('send_otp', { email, otp: rawOtp, purpose: 'forgot_password' });

    await auditLogModel.log({
      userId: user.user_id,
      action: 'PASSWORD_RESET_REQUESTED',
      entityType: 'USER',
      entityId: user.user_id,
      ipAddress
    });

    return { success: true, message: 'If an account exists, a reset code has been sent.' };
  },

  async resetPassword({ email, otp, newPassword, ipAddress = null }) {
    const user = await userModel.findByEmail(email);
    if (!user) {
      const error = new Error('Invalid request.');
      error.statusCode = 400;
      throw error;
    }

    const verification = await otpService.verifyOtp(email, otp, 'forgot_password');
    if (!verification.success) {
      const error = new Error(verification.message);
      error.statusCode = 400;
      throw error;
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await userModel.updatePassword(user.user_id, newHash);

    await auditLogModel.log({
      userId: user.user_id,
      action: 'PASSWORD_RESET_COMPLETED',
      entityType: 'USER',
      entityId: user.user_id,
      ipAddress
    });

    return { success: true, message: 'Your password has been successfully updated. You may now log in.' };
  }
};

module.exports = authService;
