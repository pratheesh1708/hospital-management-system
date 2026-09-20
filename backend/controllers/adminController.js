const userModel = require('../models/userModel');
const patientModel = require('../models/patientModel');
const doctorModel = require('../models/doctorModel');
const appointmentModel = require('../models/appointmentModel');
const auditService = require('../services/auditService');
const specializationModel = require('../models/specializationModel');

const adminController = {
  async getMetrics(req, res, next) {
    try {
      const patientCount = await patientModel.count();
      const doctorCount = await doctorModel.count();
      const apptMetrics = await appointmentModel.countMetrics();
      const userRoles = await userModel.countUsers();

      res.status(200).json({
        success: true,
        metrics: {
          totalPatients: patientCount,
          totalDoctors: doctorCount,
          appointments: apptMetrics,
          userBreakdown: userRoles
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async getUsers(req, res, next) {
    try {
      const { role, search, limit, offset } = req.query;
      const users = await userModel.findAllUsers({ role, search, limit, offset });
      res.status(200).json({
        success: true,
        count: users.length,
        users
      });
    } catch (err) {
      next(err);
    }
  },

  async updateUserStatus(req, res, next) {
    try {
      const userId = parseInt(req.params.id, 10);
      const { status } = req.body;

      if (!['active', 'inactive', 'suspended'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status must be one of: active, inactive, suspended.'
        });
      }

      await userModel.updateStatus(userId, status);
      await auditService.recordLog({
        userId: req.user.userId,
        action: 'ADMIN_USER_STATUS_UPDATED',
        entityType: 'USER',
        entityId: userId,
        ipAddress: req.ip,
        details: { newStatus: status }
      });

      res.status(200).json({
        success: true,
        message: `User status updated to ${status}.`
      });
    } catch (err) {
      next(err);
    }
  },

  async updateUserRole(req, res, next) {
    try {
      const userId = parseInt(req.params.id, 10);
      const { role } = req.body;

      if (!['patient', 'doctor', 'admin'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Role must be one of: patient, doctor, admin.'
        });
      }

      await userModel.updateRole(userId, role);
      await auditService.recordLog({
        userId: req.user.userId,
        action: 'ADMIN_USER_ROLE_UPDATED',
        entityType: 'USER',
        entityId: userId,
        ipAddress: req.ip,
        details: { newRole: role }
      });

      res.status(200).json({
        success: true,
        message: `User role updated to ${role}.`
      });
    } catch (err) {
      next(err);
    }
  },

  async getAllAppointments(req, res, next) {
    try {
      const { status, date, search, limit, offset } = req.query;
      const appointments = await appointmentModel.findAll({ status, date, search, limit, offset });
      res.status(200).json({
        success: true,
        count: appointments.length,
        appointments
      });
    } catch (err) {
      next(err);
    }
  },

  async getAuditLogs(req, res, next) {
    try {
      const { action, entityType, limit, offset } = req.query;
      const result = await auditService.getAuditLogs({ action, entityType, limit, offset });
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (err) {
      next(err);
    }
  },

  async addSpecialization(req, res, next) {
    try {
      const { name, description, icon } = req.body;
      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Specialization name is required.'
        });
      }

      const id = await specializationModel.create({ name, description, icon });
      res.status(201).json({
        success: true,
        specializationId: id,
        message: 'Specialization created successfully.'
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = adminController;
