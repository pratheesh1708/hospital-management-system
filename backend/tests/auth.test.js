const assert = require('assert');
const authService = require('../services/authService');
const otpService = require('../services/otpService');
const userModel = require('../models/userModel');
const db = require('../config/database');

async function runAuthTests() {
  console.log('\n--- [TEST SUITE 1: AUTHENTICATION & SECURITY] ---');
  await db.initDatabase();

  const testEmail = `test_patient_${Date.now()}@hospital.com`;
  const testPassword = 'SecurePassword123!';

  // 1. Registration Test
  console.log('1. Testing User Registration...');
  const regResult = await authService.register({
    name: 'Alice Wonder',
    email: testEmail,
    password: testPassword,
    role: 'patient',
    phone: '+1-555-8888'
  });
  assert.strictEqual(regResult.requiresVerification, true, 'Registration should require email verification');
  assert.strictEqual(regResult.email, testEmail, 'Returned email should match');
  console.log('   ✅ Registration succeeded with OTP dispatch.');

  // 2. Duplicate Email Test
  console.log('2. Testing Duplicate Email Rejection...');
  try {
    await authService.register({
      name: 'Alice Wonder Duplicate',
      email: testEmail,
      password: testPassword,
      role: 'patient'
    });
    assert.fail('Should not allow duplicate registration with identical email');
  } catch (err) {
    assert.strictEqual(err.statusCode, 409, 'Duplicate registration must return 409 Conflict');
    console.log('   ✅ Duplicate registration safely rejected (409 Conflict).');
  }

  // 3. Password Hashing Verification
  console.log('3. Testing Password Bcrypt Hashing...');
  const savedUser = await userModel.findByEmail(testEmail);
  assert.notStrictEqual(savedUser.password_hash, testPassword, 'Password must never be saved as plaintext');
  assert.ok(savedUser.password_hash.startsWith('$2'), 'Password must be a valid bcrypt hash');
  console.log('   ✅ Password securely stored as bcrypt hash.');

  // 4. Invalid OTP Test
  console.log('4. Testing Invalid OTP Rejection...');
  const invalidOtpRes = await otpService.verifyOtp(testEmail, '999999', 'registration');
  assert.strictEqual(invalidOtpRes.success, false, 'Invalid OTP should be rejected');
  console.log('   ✅ Invalid OTP rejected.');

  // 5. Valid OTP Verification Test
  console.log('5. Testing Valid OTP Email Verification...');
  // Retrieve the generated OTP hash from DB and simulate valid code
  const [activeOtp] = await db.query(
    'SELECT * FROM otp_verifications WHERE email = ? AND purpose = ?',
    [testEmail, 'registration']
  );
  assert.ok(activeOtp.length > 0, 'Active OTP must exist in database');
  
  // Re-create a fresh known OTP to verify exact hash match
  const freshOtp = await otpService.createOtp(testEmail, 'registration', 10);
  const verifyRes = await authService.verifyEmailOtp({ email: testEmail, otp: freshOtp });
  assert.ok(verifyRes.token, 'Verification should return an auth JWT token');
  assert.strictEqual(verifyRes.user.email, testEmail, 'User profile should match');
  console.log('   ✅ Email OTP verified and account activated.');

  // 6. Login with Wrong Password Test
  console.log('6. Testing Login with Incorrect Password...');
  try {
    await authService.login({ email: testEmail, password: 'WrongPassword!' });
    assert.fail('Should not login with incorrect password');
  } catch (err) {
    assert.strictEqual(err.statusCode, 401, 'Invalid password must return 401 Unauthorized');
    console.log('   ✅ Incorrect password safely rejected (401 Unauthorized).');
  }

  // 7. Successful Login & JWT Claims Test
  console.log('7. Testing Successful Login & JWT Structure...');
  const loginRes = await authService.login({ email: testEmail, password: testPassword });
  assert.ok(loginRes.token, 'Login must yield JWT token');
  const decoded = authService.verifyToken(loginRes.token);
  assert.strictEqual(decoded.userId, savedUser.user_id, 'Token userId must match');
  assert.strictEqual(decoded.role, 'patient', 'Token role must match');
  assert.strictEqual(decoded.password_hash, undefined, 'JWT must NEVER contain password hash');
  assert.strictEqual(decoded.medical_records, undefined, 'JWT must NEVER contain medical history');
  console.log('   ✅ Login succeeded; JWT contains only non-sensitive claims.');

  console.log('🌟 [AUTH TESTS PASSED SUCCESSFULLY]\n');
}

if (require.main === module) {
  runAuthTests().then(() => process.exit(0)).catch(e => {
    console.error('❌ Auth Test Failed:', e);
    process.exit(1);
  });
}

module.exports = runAuthTests;
