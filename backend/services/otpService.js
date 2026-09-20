const crypto = require('crypto');
const otpModel = require('../models/otpModel');

const otpService = {
  // Generates cryptographically secure 6-digit OTP
  generateOtpCode() {
    return crypto.randomInt(100000, 1000000).toString();
  },

  // Hashes OTP with SHA-256 for secure DB persistence
  hashOtp(otp) {
    return crypto.createHash('sha256').update(String(otp).trim()).digest('hex');
  },

  // Creates and records hashed OTP with expiry time (default 10 minutes)
  async createOtp(email, purpose = 'registration', expirationMinutes = 10) {
    const rawOtp = this.generateOtpCode();
    const otpHash = this.hashOtp(rawOtp);
    const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000).toISOString();

    await otpModel.saveOtp({
      email,
      otpHash,
      purpose,
      expiresAt,
      maxAttempts: 5
    });

    return rawOtp;
  },

  // Verifies OTP with attempt count tracking and invalidation
  async verifyOtp(email, rawOtp, purpose = 'registration') {
    const record = await otpModel.findActiveOtp(email, purpose);

    if (!record) {
      return {
        success: false,
        message: 'No active OTP found or the code has expired. Please request a new one.'
      };
    }

    if (record.attempts >= record.max_attempts) {
      return {
        success: false,
        message: 'Maximum verification attempts exceeded. Please request a new OTP.'
      };
    }

    const candidateHash = this.hashOtp(rawOtp);
    if (candidateHash !== record.otp_hash) {
      await otpModel.incrementAttempts(record.otp_id);
      const remaining = record.max_attempts - (record.attempts + 1);
      return {
        success: false,
        message: `Incorrect code. ${remaining > 0 ? remaining + ' attempts remaining.' : 'Code locked. Please request a new OTP.'}`
      };
    }

    // OTP is valid - mark verified immediately
    await otpModel.markVerified(record.otp_id);
    return {
      success: true,
      message: 'OTP verified successfully.'
    };
  }
};

module.exports = otpService;
