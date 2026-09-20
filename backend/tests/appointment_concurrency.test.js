const assert = require('assert');
const appointmentService = require('../services/appointmentService');
const userModel = require('../models/userModel');
const patientModel = require('../models/patientModel');
const doctorModel = require('../models/doctorModel');
const db = require('../config/database');

async function runConcurrencyTest() {
  console.log('\n--- [TEST SUITE 3: APPOINTMENT CONCURRENCY & RACE CONDITIONS] ---');
  await db.initDatabase();

  // 1. Prepare 2 distinct test patients
  const timestamp = Date.now();
  const userAId = await userModel.create({
    name: 'Patient Alpha',
    email: `alpha_${timestamp}@hospital.com`,
    passwordHash: 'hash',
    role: 'patient',
    emailVerified: 1
  });
  const patientAId = await patientModel.create({ userId: userAId });

  const userBId = await userModel.create({
    name: 'Patient Beta',
    email: `beta_${timestamp}@hospital.com`,
    passwordHash: 'hash',
    role: 'patient',
    emailVerified: 1
  });
  const patientBId = await patientModel.create({ userId: userBId });

  // 2. Target Doctor and target single slot
  const [doctors] = await db.query('SELECT d.doctor_id, u.name FROM doctors d JOIN users u ON d.user_id = u.user_id LIMIT 1');
  assert.ok(doctors.length > 0, 'Doctor must exist');
  const targetDoctorId = doctors[0].doctor_id;

  const uniqueOffset = 15 + Math.floor(Math.random() * 2000);
  const targetDate = new Date(Date.now() + uniqueOffset * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const targetStartTime = '11:00';
  const targetEndTime = '11:30';

  console.log(`Targeting Doctor ${doctors[0].name} (ID: ${targetDoctorId}) on ${targetDate} at ${targetStartTime}...`);
  console.log(`Simultaneously dispatching booking requests from Patient Alpha (ID: ${patientAId}) and Patient Beta (ID: ${patientBId})...`);

  // 3. Launch concurrent requests simultaneously
  const requestA = appointmentService.bookAppointment({
    patientId: patientAId,
    doctorId: targetDoctorId,
    appointmentDate: targetDate,
    startTime: targetStartTime,
    endTime: targetEndTime,
    reason: 'Concurrent booking test - Patient A'
  });

  const requestB = appointmentService.bookAppointment({
    patientId: patientBId,
    doctorId: targetDoctorId,
    appointmentDate: targetDate,
    startTime: targetStartTime,
    endTime: targetEndTime,
    reason: 'Concurrent booking test - Patient B'
  });

  const results = await Promise.allSettled([requestA, requestB]);

  const fulfilled = results.filter(r => r.status === 'fulfilled');
  const rejected = results.filter(r => r.status === 'rejected');

  console.log(`Results: ${fulfilled.length} Succeeded, ${rejected.length} Rejected.`);
  if (rejected.length > 0) {
    rejected.forEach((rej, idx) => console.log(`   Rejection #${idx + 1}:`, rej.reason));
  }

  // 4. Verify Assertions
  assert.strictEqual(fulfilled.length, 1, 'Exactly ONE booking must succeed');
  assert.strictEqual(rejected.length, 1, 'Exactly ONE booking must be safely rejected');

  const winner = fulfilled[0].value;
  const loserError = rejected[0].reason;

  assert.ok(winner.appointmentId, 'Winning booking must have appointmentId');
  assert.strictEqual(winner.status, 'CONFIRMED', 'Winning appointment must be CONFIRMED');
  console.log(`   ✅ Winning booking confirmed: Appointment ID #${winner.appointmentId}`);

  assert.strictEqual(loserError.statusCode, 409, 'Losing booking must be rejected with 409 Conflict');
  assert.ok(
    loserError.message.includes('booked by another patient') || loserError.message.includes('slot has just been booked'),
    `Rejection message must inform the user clearly. Received: "${loserError.message}"`
  );
  console.log(`   ✅ Losing booking received graceful collision message: "${loserError.message}"`);

  // 5. Verify database integrity
  const [dbRows] = await db.query(
    'SELECT appointment_id, patient_id, status FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND start_time = ? AND status != "CANCELLED"',
    [targetDoctorId, targetDate, targetStartTime]
  );

  assert.strictEqual(dbRows.length, 1, 'Database must contain EXACTLY 1 active appointment record for this slot');
  console.log('   ✅ Verified zero duplicate rows in database.');
  console.log('🌟 [CONCURRENCY RACE TEST PASSED WITH 100% SUCCESS]\n');
}

if (require.main === module) {
  runConcurrencyTest().then(() => process.exit(0)).catch(e => {
    console.error('❌ Concurrency Test Failed:', e);
    process.exit(1);
  });
}

module.exports = runConcurrencyTest;
