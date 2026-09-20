const assert = require('assert');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const medicalRecordService = require('../services/medicalRecordService');
const userModel = require('../models/userModel');
const patientModel = require('../models/patientModel');
const doctorModel = require('../models/doctorModel');
const db = require('../config/database');

async function runRbacTests() {
  console.log('\n--- [TEST SUITE 2: RBAC & RESOURCE AUTHORIZATION] ---');
  await db.initDatabase();

  // 1. Role Middleware Guard Test: Patient accessing Doctor endpoint
  console.log('1. Testing Role Middleware (Patient accessing Doctor route)...');
  const doctorOnlyMiddleware = authorizeRoles('doctor');
  
  let patientBlocked = false;
  const mockReqPatient = { user: { userId: 99, role: 'patient' } };
  const mockRes = {
    status(code) {
      assert.strictEqual(code, 403, 'Unauthorized role access must return 403 Forbidden');
      return {
        json(data) {
          patientBlocked = true;
          assert.strictEqual(data.success, false);
        }
      };
    }
  };

  doctorOnlyMiddleware(mockReqPatient, mockRes, () => {
    assert.fail('Patient should not pass doctorOnlyMiddleware');
  });
  assert.strictEqual(patientBlocked, true, 'Patient must be rejected with 403');
  console.log('   ✅ Role middleware safely blocked unauthorized role.');

  // 2. Doctor Role passes Doctor endpoint
  console.log('2. Testing Role Middleware (Doctor accessing Doctor route)...');
  let doctorAllowed = false;
  const mockReqDoctor = { user: { userId: 5, role: 'doctor' } };
  doctorOnlyMiddleware(mockReqDoctor, mockRes, () => {
    doctorAllowed = true;
  });
  assert.strictEqual(doctorAllowed, true, 'Doctor must pass doctorOnlyMiddleware');
  console.log('   ✅ Doctor role successfully allowed.');

  // 3. Patient accessing another Patient medical records
  console.log('3. Testing Patient Isolation (Cross-patient record access)...');
  const [patients] = await db.query('SELECT patient_id, user_id FROM patients LIMIT 2');
  if (patients.length >= 1) {
    const targetPatientId = patients[0].patient_id;
    const differentUserId = 99999; // Not this patient's user_id

    try {
      await medicalRecordService.getPatientMedicalHistory(targetPatientId, differentUserId, 'patient');
      assert.fail('Patient should not be able to read another patient records');
    } catch (err) {
      assert.strictEqual(err.statusCode, 403, 'Cross-patient access must return 403 Forbidden');
      console.log('   ✅ Cross-patient medical record access rejected (403 Forbidden).');
    }
  }

  // 4. Unauthorized Doctor accessing Patient without appointment
  console.log('4. Testing Doctor Authorization (Doctor without relationship to patient)...');
  const [doctors] = await db.query('SELECT user_id, doctor_id FROM doctors LIMIT 1');
  if (doctors.length >= 1 && patients.length >= 1) {
    const docUserId = doctors[0].user_id;
    // Create an isolated dummy patient that has NO appointment with this doctor
    const dummyUserId = await userModel.create({
      name: 'Unconnected Patient',
      email: `unconnected_${Date.now()}@hospital.com`,
      passwordHash: 'hash',
      role: 'patient',
      emailVerified: 1
    });
    const dummyPatientId = await patientModel.create({ userId: dummyUserId });

    try {
      await medicalRecordService.getPatientMedicalHistory(dummyPatientId, docUserId, 'doctor');
      assert.fail('Doctor without clinical relationship should not access patient records');
    } catch (err) {
      assert.strictEqual(err.statusCode, 403, 'Doctor without appointment relationship must return 403 Forbidden');
      console.log('   ✅ Unauthorized physician access safely blocked (403 Forbidden).');
    }
  }

  console.log('🌟 [RBAC TESTS PASSED SUCCESSFULLY]\n');
}

if (require.main === module) {
  runRbacTests().then(() => process.exit(0)).catch(e => {
    console.error('❌ RBAC Test Failed:', e);
    process.exit(1);
  });
}

module.exports = runRbacTests;
