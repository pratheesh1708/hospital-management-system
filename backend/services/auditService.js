const auditLogModel = require('../models/auditLogModel');

const auditService = {
  async getAuditLogs(query) {
    const logs = await auditLogModel.findAll(query);
    const total = await auditLogModel.count();
    return { logs, total };
  },

  async recordLog(data) {
    return auditLogModel.log(data);
  }
};

module.exports = auditService;
