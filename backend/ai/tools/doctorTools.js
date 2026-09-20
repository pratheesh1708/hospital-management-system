const doctorModel = require('../../models/doctorModel');
const specializationModel = require('../../models/specializationModel');

const doctorTools = {
  async findDoctors({ specialization = null, query = '' } = {}) {
    let specializationId = null;
    if (specialization) {
      const spec = await specializationModel.findByName(specialization);
      if (spec) {
        specializationId = spec.specialization_id;
      }
    }

    const doctors = await doctorModel.findAll({
      specializationId,
      search: query || (specialization && !specializationId ? specialization : ''),
      limit: 6
    });

    return doctors.map(d => ({
      doctorId: d.doctor_id,
      name: d.name,
      specialization: d.specialization_name,
      qualification: d.qualification,
      experienceYears: d.experience,
      consultationFee: `$${Number(d.consultation_fee).toFixed(2)}`,
      bio: d.bio,
      avatarUrl: d.avatar_url
    }));
  },

  async findAlternativeDoctors({ currentDoctorId, specialization }) {
    let specId = null;
    if (specialization) {
      const s = await specializationModel.findByName(specialization);
      if (s) specId = s.specialization_id;
    }

    if (!specId && currentDoctorId) {
      const currentDoc = await doctorModel.findById(currentDoctorId);
      if (currentDoc) specId = currentDoc.specialization_id;
    }

    const list = await doctorModel.findAll({ specializationId: specId, limit: 5 });
    const alternatives = list.filter(d => d.doctor_id !== parseInt(currentDoctorId, 10));

    return alternatives.map(d => ({
      doctorId: d.doctor_id,
      name: d.name,
      specialization: d.specialization_name,
      qualification: d.qualification,
      experienceYears: d.experience,
      consultationFee: `$${Number(d.consultation_fee).toFixed(2)}`
    }));
  }
};

module.exports = doctorTools;
