const doctorService = require('../services/doctorService');

const doctorController = {
  async getDoctors(req, res, next) {
    try {
      const { specializationId, search, minExperience, limit, offset } = req.query;
      const doctors = await doctorService.getDoctors({
        specializationId: specializationId ? parseInt(specializationId, 10) : null,
        search,
        minExperience: minExperience ? parseInt(minExperience, 10) : 0,
        limit: limit ? parseInt(limit, 10) : 50,
        offset: offset ? parseInt(offset, 10) : 0
      });

      res.status(200).json({
        success: true,
        count: doctors.length,
        doctors
      });
    } catch (err) {
      next(err);
    }
  },

  async getDoctorById(req, res, next) {
    try {
      const doctorId = parseInt(req.params.id, 10);
      const doctor = await doctorService.getDoctorById(doctorId);
      res.status(200).json({
        success: true,
        doctor
      });
    } catch (err) {
      next(err);
    }
  },

  async getAvailability(req, res, next) {
    try {
      const doctorId = parseInt(req.params.id, 10);
      const { date } = req.query;
      const slots = await doctorService.getDoctorAvailability(doctorId, date);

      res.status(200).json({
        success: true,
        doctorId,
        date: date || new Date().toISOString().split('T')[0],
        slots
      });
    } catch (err) {
      next(err);
    }
  },

  async addAvailability(req, res, next) {
    try {
      const { availableDate, startTime, endTime } = req.body;
      if (!availableDate || !startTime || !endTime) {
        return res.status(400).json({
          success: false,
          message: 'Date, start time, and end time are required.'
        });
      }

      const result = await doctorService.addAvailabilitySlot({
        doctorUserId: req.user.userId,
        availableDate,
        startTime,
        endTime
      });

      res.status(201).json({
        success: true,
        ...result
      });
    } catch (err) {
      next(err);
    }
  },

  async removeAvailability(req, res, next) {
    try {
      const availabilityId = parseInt(req.params.availabilityId, 10);
      const result = await doctorService.removeAvailabilitySlot({
        availabilityId,
        doctorUserId: req.user.userId
      });

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  async getSpecializations(req, res, next) {
    try {
      const list = await doctorService.getSpecializations();
      res.status(200).json({
        success: true,
        specializations: list
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = doctorController;
