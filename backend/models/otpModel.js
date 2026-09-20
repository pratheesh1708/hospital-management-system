const db = require('../config/database');

const otpModel = {
  async saveOtp({ email, otpHash, purpose, expiresAt, maxAttempts = 5 }) {
    // Invalidate previous unverified OTPs for this email & purpose
    await db.query(
      'DELETE FROM otp_verifications WHERE LOWER(email) = LOWER(?) AND purpose = ?',
      [email.trim(), purpose]
    );

    const [res] = await db.query(
      `INSERT INTO otp_verifications (email, otp_hash, purpose, attempts, max_attempts, expires_at, verified)
       VALUES (?, ?, ?, 0, ?, ?, 0)`,
      [email.trim().toLowerCase(), otpHash, purpose, maxAttempts, expiresAt]
    );
    return res.insertId;
  },

  async findActiveOtp(email, purpose) {
    const [rows] = await db.query(
      `SELECT * FROM otp_verifications 
       WHERE LOWER(email) = LOWER(?) 
         AND purpose = ? 
         AND verified = 0 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [email.trim(), purpose]
    );
    if (!rows || rows.length === 0) return null;
    const record = rows[0];
    if (new Date(record.expires_at).getTime() < Date.now()) {
      return null; // Expired
    }
    return record;
  },

  async incrementAttempts(otpId) {
    const [res] = await db.query(
      'UPDATE otp_verifications SET attempts = attempts + 1 WHERE otp_id = ?',
      [otpId]
    );
    return res.affectedRows > 0;
  },

  async markVerified(otpId) {
    const [res] = await db.query(
      'UPDATE otp_verifications SET verified = 1 WHERE otp_id = ?',
      [otpId]
    );
    return res.affectedRows > 0;
  },

  async cleanupExpired() {
    await db.query('DELETE FROM otp_verifications WHERE expires_at < CURRENT_TIMESTAMP OR verified = 1');
  }
};

module.exports = otpModel;
