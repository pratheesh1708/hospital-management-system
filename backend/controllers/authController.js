const authService = require('../services/authService');
const userModel = require('../models/userModel');
const patientModel = require('../models/patientModel');
const doctorModel = require('../models/doctorModel');

const authController = {
  async register(req, res, next) {
    try {
      const { name, email, password, role, phone } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, and password are required.'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long.'
        });
      }

      const result = await authService.register({
        name,
        email,
        password,
        role: role || 'patient',
        phone,
        ipAddress: req.ip
      });

      res.status(201).json({
        success: true,
        ...result
      });
    } catch (err) {
      next(err);
    }
  },

  async verifyEmail(req, res, next) {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          message: 'Email and OTP code are required.'
        });
      }

      const result = await authService.verifyEmailOtp({
        email,
        otp,
        ipAddress: req.ip
      });

      // Set Secure HttpOnly cookie
      res.cookie('token', result.token, authService.getCookieOptions());

      res.status(200).json({
        success: true,
        message: 'Email verified successfully. You are now logged in.',
        user: result.user
      });
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required.'
        });
      }

      const result = await authService.login({
        email,
        password,
        ipAddress: req.ip
      });

      if (result.requiresVerification) {
        return res.status(200).json({
          success: true,
          requiresVerification: true,
          email: result.email,
          message: result.message
        });
      }

      // Set Secure HttpOnly cookie
      res.cookie('token', result.token, authService.getCookieOptions());

      res.status(200).json({
        success: true,
        message: 'Login successful.',
        user: result.user
      });
    } catch (err) {
      next(err);
    }
  },

  async logout(req, res, next) {
    try {
      res.clearCookie('token', authService.getCookieOptions());
      res.status(200).json({
        success: true,
        message: 'Logged out successfully.'
      });
    } catch (err) {
      next(err);
    }
  },

  async getMe(req, res, next) {
    try {
      const user = await userModel.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User account not found.'
        });
      }

      let profileData = {};
      if (user.role === 'patient') {
        const patient = await patientModel.findByUserId(user.user_id);
        if (patient) {
          profileData = {
            patientId: patient.patient_id,
            bloodGroup: patient.blood_group,
            dateOfBirth: patient.date_of_birth,
            gender: patient.gender,
            address: patient.address,
            emergencyContact: patient.emergency_contact
          };
        }
      } else if (user.role === 'doctor') {
        const doctor = await doctorModel.findByUserId(user.user_id);
        if (doctor) {
          profileData = {
            doctorId: doctor.doctor_id,
            specializationId: doctor.specialization_id,
            specializationName: doctor.specialization_name,
            qualification: doctor.qualification,
            experience: doctor.experience,
            consultationFee: doctor.consultation_fee,
            bio: doctor.bio
          };
        }
      }

      res.status(200).json({
        success: true,
        user: {
          userId: user.user_id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          status: user.status,
          emailVerified: Boolean(user.email_verified),
          createdAt: user.created_at,
          ...profileData
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async resendOtp(req, res, next) {
    try {
      const { email, purpose } = req.body;
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email address is required.'
        });
      }

      const result = await authService.resendOtp({
        email,
        purpose: purpose || 'registration'
      });

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email address is required.'
        });
      }

      const result = await authService.requestPasswordReset({
        email,
        ipAddress: req.ip
      });

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  async resetPassword(req, res, next) {
    try {
      const { email, otp, newPassword } = req.body;
      if (!email || !otp || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Email, OTP, and new password are required.'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters.'
        });
      }

      const result = await authService.resetPassword({
        email,
        otp,
        newPassword,
        ipAddress: req.ip
      });

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = authController;
