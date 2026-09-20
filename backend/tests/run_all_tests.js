const runAuthTests = require('./auth.test');
const runRbacTests = require('./rbac.test');
const runConcurrencyTest = require('./appointment_concurrency.test');
const runChatbotTests = require('./chatbot_tools.test');

async function runAll() {
  console.log('===============================================================');
  console.log('🧪 ST. JUDE HOSPITAL MANAGEMENT SYSTEM - AUTOMATED TEST SUITE');
  console.log('===============================================================');

  const startTime = Date.now();
  try {
    await runAuthTests();
    await runRbacTests();
    await runConcurrencyTest();
    await runChatbotTests();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('===============================================================');
    console.log(`🎉 ALL TEST SUITES PASSED FLAWLESSLY IN ${duration}s!`);
    console.log('✅ Authentication & Security: Verified');
    console.log('✅ RBAC & Clinical Authorization: Verified');
    console.log('✅ Concurrency & Double-Booking Race Prevention: Verified');
    console.log('✅ AI Chatbot & Medical Safety Guardrails: Verified');
    console.log('===============================================================');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ TEST SUITE FAILED:', err);
    process.exit(1);
  }
}

runAll();
