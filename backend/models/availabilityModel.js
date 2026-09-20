const db = require('../config/database');

const availabilityModel = {
  async getDoctorAvailability(doctorId, date) {
    const [rows] = await db.query(
      `SELECT da.*, 
              CASE WHEN a.appointment_id IS NOT NULL AND a.status != 'CANCELLED' THEN 'booked' ELSE da.status END as current_status
       FROM doctor_availability da
       LEFT JOIN appointments a ON da.doctor_id = a.doctor_id 
                               AND da.available_date = a.appointment_date 
                               AND da.start_time = a.start_time
                               AND a.status != 'CANCELLED'
       WHERE da.doctor_id = ? AND da.available_date = ?
       ORDER BY da.start_time ASC`,
      [doctorId, date]
    );
    return rows;
  },

  async getUpcomingAvailableSlots(doctorId, daysAhead = 7) {
    const today = new Date().toISOString().split('T')[0];
    const maxDate = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const [rows] = await db.query(
      `SELECT da.*
       FROM doctor_availability da
       LEFT JOIN appointments a ON da.doctor_id = a.doctor_id 
                               AND da.available_date = a.appointment_date 
                               AND da.start_time = a.start_time
                               AND a.status != 'CANCELLED'
       WHERE da.doctor_id = ? 
         AND da.available_date >= ? 
         AND da.available_date <= ?
         AND da.status = 'available'
         AND a.appointment_id IS NULL
       ORDER BY da.available_date ASC, da.start_time ASC`,
      [doctorId, today, maxDate]
    );
    return rows;
  },

  async createSlot({ doctorId, availableDate, startTime, endTime, status = 'available' }) {
    const [res] = await db.query(
      'INSERT INTO doctor_availability (doctor_id, available_date, start_time, end_time, status) VALUES (?, ?, ?, ?, ?)',
      [doctorId, availableDate, startTime, endTime, status]
    );
    return res.insertId;
  },

  async updateSlotStatus(availabilityId, status) {
    const [res] = await db.query(
      'UPDATE doctor_availability SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE availability_id = ?',
      [status, availabilityId]
    );
    return res.affectedRows > 0;
  },

  async deleteSlot(availabilityId, doctorId) {
    const [res] = await db.query(
      'DELETE FROM doctor_availability WHERE availability_id = ? AND doctor_id = ?',
      [availabilityId, doctorId]
    );
    return res.affectedRows > 0;
  }
};

module.exports = availabilityModel;
