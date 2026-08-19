process.env.NODE_ENV = 'test';
const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../app');
const connectDB = require('../config/db');
const promptUnderstandingService = require('../services/ai/promptUnderstandingService');
const { SUPPORTED_ASPECT_RATIOS, getDimensionsForRatio, isValidAspectRatio } = require('../config/aspectRatios');

test('CreateForge AI Server, Engine & API Test Suite', async (t) => {
  await connectDB();
  let userTokenA = '';
  let generatedArticle = null;

  await t.test('GET /api/health should return 200 with CreateForge AI status', async () => {
    const res = await request(app).get('/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.product, 'CreateForge AI');
    assert.ok(res.body.timestamp);
  });

  await t.test('Aspect Ratio System & Central Validation QA', () => {
    // Test 1: Central config includes 3:2, 16:9, 1:1, 9:16, 4:3, 3:4
    assert.strictEqual(isValidAspectRatio('3:2'), true);
    assert.strictEqual(isValidAspectRatio('16:9'), true);
    assert.strictEqual(isValidAspectRatio('1:1'), true);
    assert.strictEqual(isValidAspectRatio('9:16'), true);
    assert.strictEqual(isValidAspectRatio('4:3'), true);
    assert.strictEqual(isValidAspectRatio('3:4'), true);
    assert.strictEqual(isValidAspectRatio('99:1'), false);

    // Test 2: Dimension mapping accuracy
    const dim32 = getDimensionsForRatio('3:2');
    assert.strictEqual(dim32.width, 1536);
    assert.strictEqual(dim32.height, 1024);

    const dim169 = getDimensionsForRatio('16:9');
    assert.strictEqual(dim169.width, 1536);
    assert.strictEqual(dim169.height, 864);

    const dim11 = getDimensionsForRatio('1:1');
    assert.strictEqual(dim11.width, 1024);
    assert.strictEqual(dim11.height, 1024);
  });

  await t.test('Comprehensive Topic Normalization QA Cases', () => {
    // Test 1: Typos & conversational instruction
    const t1 = promptUnderstandingService.normalize('genrate a article for the esports');
    assert.strictEqual(t1.normalizedTopic, 'Esports');

    // Test 2: Basic instruction
    const t2 = promptUnderstandingService.normalize('write article about cricket');
    assert.strictEqual(t2.normalizedTopic, 'Cricket');

    // Test 3: Implicit article type + tech term
    const t3 = promptUnderstandingService.normalize('create a beginner guide to React hooks');
    assert.strictEqual(t3.normalizedTopic, 'React Hooks');
    assert.strictEqual(t3.inferredArticleType, 'Beginner Guide');

    // Test 4: Dynamic transformation
    const t4 = promptUnderstandingService.normalize('article about how AI is changing software testing');
    assert.strictEqual(t4.normalizedTopic, 'AI in Software Testing');

    // Test 5: Comparison phrasing
    const t5 = promptUnderstandingService.normalize('write a comparison between React and Vue');
    assert.strictEqual(t5.normalizedTopic, 'React vs Vue');
    assert.strictEqual(t5.inferredArticleType, 'Comparison');

    // Test 6: Proper nouns with apostrophes
    const t6 = promptUnderstandingService.normalize("give me an article on India's space program");
    assert.strictEqual(t6.normalizedTopic, "India's Space Program");

    // Test 7: Prepositional phrasing
    const t7 = promptUnderstandingService.normalize('article for web development');
    assert.strictEqual(t7.normalizedTopic, 'Web Development');

    // Simple single-word input should NOT be overprocessed
    const t8 = promptUnderstandingService.normalize('esports');
    assert.strictEqual(t8.normalizedTopic, 'Esports');
  });

  const testUserEmail = `creator_${Date.now()}@createforgeai.tech`;
  const testUserPassword = 'Password123!';

  await t.test('POST /api/auth/register should create user in MongoDB, set cookie, and return JWT', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Alex Forge',
        email: testUserEmail,
        password: testUserPassword,
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.token || res.body.token);
    assert.strictEqual(res.body.user.email, testUserEmail.toLowerCase());
    assert.strictEqual(res.body.user.password, undefined);
    assert.strictEqual(res.body.user.passwordHash, undefined);
    userTokenA = res.body.data?.token || res.body.token;
  });

  await t.test('POST /api/auth/register with duplicate email should be cleanly rejected with 409 or 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Alex Forge Duplicate',
        email: testUserEmail.toUpperCase(), // Test case insensitivity
        password: testUserPassword,
      });

    assert.ok(res.status === 409 || res.status === 400);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes('already exists'));
  });

  await t.test('POST /api/auth/login with valid credentials (and mixed case email) succeeds', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUserEmail.toUpperCase(),
        password: testUserPassword,
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.token || res.body.token);
    assert.strictEqual(res.body.user.email, testUserEmail.toLowerCase());
  });

  await t.test('POST /api/auth/login with wrong password returns 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUserEmail,
        password: 'WrongPassword999!',
      });

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.message, 'Incorrect email or password.');
  });

  await t.test('POST /api/auth/login with unknown user returns 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'unknown_nonexistent_user@createforgeai.tech',
        password: 'SomePassword123!',
      });

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.message, 'Incorrect email or password.');
  });

  await t.test('GET /api/auth/me returns authenticated user details', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${userTokenA}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.user.email, testUserEmail.toLowerCase());
    assert.strictEqual(res.body.user.name, 'Alex Forge');
  });

  await t.test('GET /api/auth/me without token returns 401', async () => {
    const res = await request(app).get('/api/auth/me');
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
  });

  await t.test('GET /api/auth/me with invalid token returns 401', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid_malformed_token_string');
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
  });

  await t.test('POST /api/ai/image with invalid aspect ratio returns 400 error format', async () => {
    const res = await request(app)
      .post('/api/ai/image')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        prompt: 'Futuristic digital artwork',
        aspectRatio: '99:1',
      });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.error);
    assert.strictEqual(res.body.error.code, 'VALIDATION_ERROR');
    assert.ok(res.body.error.message.includes('Aspect ratio'));
  });

  await t.test('POST /api/ai/image with valid 3:2 ratio succeeds', async () => {
    const res = await request(app)
      .post('/api/ai/image')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        prompt: 'A futuristic cybernetic city skyline at dusk',
        style: 'Cinematic',
        aspectRatio: '3:2',
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.aspectRatio, '3:2');
    assert.strictEqual(res.body.data.dimensions.width, 1536);
    assert.strictEqual(res.body.data.dimensions.height, 1024);
    assert.ok(res.body.data.imageUrl);
  });

  await t.test('POST /api/ai/article should normalize prompt and generate topic-specific article', async () => {
    const res = await request(app)
      .post('/api/ai/article')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        topic: 'genrate a article for the esports',
        articleType: 'Comprehensive Guide',
        tone: 'Professional',
        desiredLength: 'Medium',
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.normalizedTopic, 'Esports');
    assert.ok(!res.body.data.title.toLowerCase().includes('genrate a article'));
    assert.ok(res.body.data.content.length > 200);
    assert.ok(!res.body.data.content.includes("in today's fast-evolving digital landscape"));
    assert.ok(!res.body.data.content.includes("cornerstone of sustainable growth"));
    generatedArticle = res.body.data;
  });

  await t.test('POST /api/ai/article-cover-image should generate contextual cover asset', async () => {
    const res = await request(app)
      .post('/api/ai/article-cover-image')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        title: generatedArticle.title,
        topic: generatedArticle.normalizedTopic,
        summary: generatedArticle.summary,
        style: 'Cinematic',
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.imageUrl);
  });

  await t.test('POST /api/ai/titles should normalize prompt and return categorized headlines', async () => {
    const res = await request(app)
      .post('/api/ai/titles')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        topic: 'give me titles for esports',
        niche: 'Gaming',
        count: 5,
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.normalizedTopic, 'Esports');
    assert.ok(res.body.data.titles.length >= 3);
    assert.ok(res.body.data.titles[0].category);
  });

  await t.test('POST /api/ai/background-remove should process data URI input', async () => {
    const sampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40" fill="#6366f1"/></svg>`;
    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(sampleSvg)}`;

    const res = await request(app)
      .post('/api/ai/background-remove')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        image: dataUrl,
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.processedImageUrl);
  });

  await t.test('GET /api/history should show clean normalized topic in primary display', async () => {
    const res = await request(app)
      .get('/api/history')
      .set('Authorization', `Bearer ${userTokenA}`);

    assert.strictEqual(res.status, 200);
    assert.ok(res.body.data.history.length >= 1);
    const articleHistory = res.body.data.history.find((h) => h.tool === 'article');
    assert.ok(articleHistory);
    assert.strictEqual(articleHistory.prompt.topic, 'Esports');
  });

  await t.test('User-specific data isolation: User B should NOT see User A history', async () => {
    // Register User B
    const emailB = `creator_b_${Date.now()}@createforgeai.tech`;
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Blake Creator',
        email: emailB,
        password: 'Password123!',
      });
    const userTokenB = regRes.body.data?.token || regRes.body.token;

    // Fetch User B history -> should be completely empty
    const histRes = await request(app)
      .get('/api/history')
      .set('Authorization', `Bearer ${userTokenB}`);

    assert.strictEqual(histRes.status, 200);
    assert.strictEqual(histRes.body.data.history.length, 0);
  });

  await t.test('POST /api/auth/logout should clear session cookies', async () => {
    const res = await request(app).post('/api/auth/logout');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.message, 'Logged out successfully.');
  });
});
