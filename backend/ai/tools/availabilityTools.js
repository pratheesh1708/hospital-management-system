const availabilityModel = require('../../models/availabilityModel');
const doctorModel = require('../../models/doctorModel');

const availabilityTools = {
  async checkDoctorAvailability({ doctorId, date }) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const doctor = await doctorModel.findById(doctorId);
    if (!doctor) {
      return { error: 'Doctor not found.' };
    }

    const slots = await availabilityModel.getDoctorAvailability(doctorId, targetDate);
    const availableSlots = slots.filter(s => s.current_status === 'available');

    return {
      doctorId,
      doctorName: doctor.name,
      specialization: doctor.specialization_name,
      date: targetDate,
      totalSlots: slots.length,
      availableSlotsCount: availableSlots.length,
      availableSlots: availableSlots.map(s => ({
        startTime: s.start_time,
        endTime: s.end_time
      }))
    };
  },

  async getAvailableSlots({ doctorId, date }) {
    const res = await this.checkDoctorAvailability({ doctorId, date });
    return res.availableSlots || [];
  }
};

module.exports = availabilityTools;
