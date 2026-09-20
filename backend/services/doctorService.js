const doctorModel = require('../models/doctorModel');
const availabilityModel = require('../models/availabilityModel');
const specializationModel = require('../models/specializationModel');

const doctorService = {
  async getDoctors(query) {
    return doctorModel.findAll(query);
  },

  async getDoctorById(doctorId) {
    const doctor = await doctorModel.findById(doctorId);
    if (!doctor) {
      const error = new Error('Doctor not found.');
      error.statusCode = 404;
      throw error;
    }
    return doctor;
  },

  async getDoctorAvailability(doctorId, date) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    return availabilityModel.getDoctorAvailability(doctorId, targetDate);
  },

  async getUpcomingSlots(doctorId) {
    return availabilityModel.getUpcomingAvailableSlots(doctorId, 7);
  },

  async addAvailabilitySlot({ doctorUserId, availableDate, startTime, endTime }) {
    const doctor = await doctorModel.findByUserId(doctorUserId);
    if (!doctor) {
      const error = new Error('Doctor profile not found.');
      error.statusCode = 404;
      throw error;
    }

    const slotId = await availabilityModel.createSlot({
      doctorId: doctor.doctor_id,
      availableDate,
      startTime,
      endTime,
      status: 'available'
    });

    return {
      availabilityId: slotId,
      message: 'Availability slot added successfully.'
    };
  },

  async removeAvailabilitySlot({ availabilityId, doctorUserId }) {
    const doctor = await doctorModel.findByUserId(doctorUserId);
    if (!doctor) {
      const error = new Error('Doctor profile not found.');
      error.statusCode = 404;
      throw error;
    }

    const deleted = await availabilityModel.deleteSlot(availabilityId, doctor.doctor_id);
    if (!deleted) {
      const error = new Error('Slot could not be removed or does not exist.');
      error.statusCode = 400;
      throw error;
    }

    return { success: true, message: 'Slot deleted successfully.' };
  },

  async getSpecializations() {
    return specializationModel.findAll();
  }
};

module.exports = doctorService;
