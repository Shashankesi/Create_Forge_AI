const axios = require('axios');
const mongoose = require('mongoose');
const assert = require('assert');
require('dotenv').config();
const User = require('../models/User');

const baseURL = 'http://localhost:5000/api';

async function verifyAuthLifecycle() {
  console.log('🧪 Starting Comprehensive CreateForge AI Auth Lifecycle Verification...\n');

  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/createforge_ai');
  console.log('✅ [MongoDB] Connected to database');

  const client = axios.create({
    baseURL,
    withCredentials: true,
    validateStatus: () => true,
  });

  const testEmail = 'Shashankesi224@gmail.com';
  const testPassword = 'MySecretPassword123!';
  const testName = 'Shashank Kumar';

  // Clean up any old test record for clean run
  await User.deleteOne({ email: testEmail.toLowerCase() });

  // STEP 1: REGISTER ACCOUNT
  console.log('1️⃣ [STEP 1] Registering Account with mixed-case email:', testEmail);
  const regRes = await client.post('/auth/register', {
    name: testName,
    email: testEmail,
    password: testPassword,
  });
  assert.strictEqual(regRes.status, 201, 'Registration must return 201');
  assert.strictEqual(regRes.body?.success || regRes.data?.success, true);
  const registeredUser = regRes.data.user;
  const initialToken = regRes.data.token || regRes.data.data?.token;
  console.log('   ✅ Registered User ID:', registeredUser.id || registeredUser._id);
  console.log('   ✅ Email stored as:', registeredUser.email);
  assert.strictEqual(registeredUser.email, testEmail.toLowerCase());

  // STEP 2: CONFIRM USER APPEARS IN MONGODB
  console.log('\n2️⃣ [STEP 2] Verifying user document directly in MongoDB...');
  const mongoUser = await User.findOne({ email: testEmail.toLowerCase() }).select('+password');
  assert.ok(mongoUser, 'User must exist in MongoDB');
  assert.strictEqual(mongoUser.name, testName);
  assert.ok(mongoUser.password.startsWith('$2a$') || mongoUser.password.startsWith('$2b$'), 'Password must be bcrypt hashed');
  console.log('   ✅ User verified in MongoDB. Password hash:', mongoUser.password.slice(0, 15) + '...');

  // STEP 3: LOGIN WITH DIFFERENT CASING & SPACES
  console.log('\n3️⃣ [STEP 3] Logging in with uppercase email & whitespace...');
  const loginRes = await client.post('/auth/login', {
    email: '  ' + testEmail.toUpperCase() + '  ',
    password: testPassword,
  });
  assert.strictEqual(loginRes.status, 200, 'Login must succeed with 200');
  assert.strictEqual(loginRes.data.success, true);
  const sessionToken = loginRes.data.token || loginRes.data.data?.token;
  assert.ok(sessionToken, 'JWT session token must be returned');
  console.log('   ✅ Login successful for:', loginRes.data.user.email);

  // STEP 4: RESTORE SESSION / GET /api/auth/me (Simulate Page Refresh)
  console.log('\n4️⃣ [STEP 4] Simulating page refresh & session restoration (GET /api/auth/me)...');
  const refreshClient = axios.create({
    baseURL,
    validateStatus: () => true,
    headers: { Authorization: `Bearer ${sessionToken}` },
  });
  const meRes = await refreshClient.get('/auth/me');
  assert.strictEqual(meRes.status, 200, '/me must return 200');
  assert.strictEqual(meRes.data.user.name, testName);
  assert.strictEqual(meRes.data.user.email, testEmail.toLowerCase());
  console.log('   ✅ Session successfully restored. Authenticated user:', meRes.data.user.name);

  // STEP 5: TEST PROTECTED WORKSPACE DATA (History & Workspace)
  console.log('\n5️⃣ [STEP 5] Accessing protected History workspace with restored session...');
  const historyRes = await refreshClient.get('/history');
  assert.strictEqual(historyRes.status, 200, 'Protected history route must return 200');
  console.log('   ✅ Protected workspace accessed successfully.');

  // STEP 6: LOGOUT
  console.log('\n6️⃣ [STEP 6] Logging out (POST /api/auth/logout)...');
  const logoutRes = await client.post('/auth/logout');
  assert.strictEqual(logoutRes.status, 200, 'Logout must return 200');
  console.log('   ✅ Logout completed.');

  // STEP 7: VERIFY UNAUTHENTICATED ACCESS AFTER LOGOUT
  console.log('\n7️⃣ [STEP 7] Verifying that unauthenticated request to /auth/me fails...');
  const unauthRes = await client.get('/auth/me');
  assert.strictEqual(unauthRes.status, 401, 'Unauthenticated /me must return 401');
  console.log('   ✅ Unauthenticated request correctly rejected with 401.');

  // STEP 8: CONFIRM USER STILL EXISTS IN MONGODB (Account NOT deleted by logout)
  console.log('\n8️⃣ [STEP 8] Confirming MongoDB account persists after logout...');
  const userStillInDB = await User.findOne({ email: testEmail.toLowerCase() });
  assert.ok(userStillInDB, 'User account must remain in MongoDB after logout');
  console.log('   ✅ MongoDB account remains intact (ID: ' + userStillInDB._id + ')');

  // STEP 9: LOGIN AGAIN WITH THE SAME ACCOUNT (NO REGISTRATION NEEDED!)
  console.log('\n9️⃣ [STEP 9] Re-logging in using the SAME credentials (no new account created!)...');
  const reloginRes = await client.post('/auth/login', {
    email: testEmail,
    password: testPassword,
  });
  assert.strictEqual(reloginRes.status, 200, 'Re-login with existing account must succeed');
  assert.strictEqual(reloginRes.data.user.email, testEmail.toLowerCase());
  assert.strictEqual(reloginRes.data.user.name, testName);
  console.log('   ✅ Re-login succeeded for same user: ' + reloginRes.data.user.name);

  // STEP 10: ATTEMPT DUPLICATE REGISTRATION (MUST BE REJECTED)
  console.log('\n🔟 [STEP 10] Testing duplicate registration rejection...');
  const dupReg = await client.post('/auth/register', {
    name: 'Duplicate Attempt',
    email: testEmail.toUpperCase(),
    password: 'DifferentPassword123!',
  });
  assert.ok(dupReg.status === 409 || dupReg.status === 400, 'Duplicate must return 409 or 400');
  console.log('   ✅ Duplicate registration rejected with status ' + dupReg.status + ': ' + dupReg.data.message);

  await mongoose.disconnect();

  console.log('\n================================================================');
  console.log('🎉 ALL AUTHENTICATION & MONGODB SESSION LIFECYCLE TESTS PASSED 100%!');
  console.log('================================================================\n');
}

verifyAuthLifecycle().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
