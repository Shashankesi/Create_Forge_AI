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

  await t.test('POST /api/ai/title-analyze should evaluate headline metrics', async () => {
    const res = await request(app)
      .post('/api/ai/title-analyze')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        title: 'How Esports Became a Billion Dollar Global Industry',
        topic: 'Esports',
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.overallScore >= 60);
    assert.ok(res.body.data.clarity);
    assert.ok(res.body.data.seoScore);
  });

  await t.test('POST /api/ai/prompt-enhance should enrich simple prompt for FLUX', async () => {
    const res = await request(app)
      .post('/api/ai/prompt-enhance')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        prompt: 'a red sports car',
        style: 'Realistic',
        preset: 'automotive',
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.enhancedPrompt);
    assert.ok(res.body.data.enhancedPrompt.length > 'a red sports car'.length);
  });

  await t.test('POST /api/ai/repurpose should transform article into social format', async () => {
    const res = await request(app)
      .post('/api/ai/repurpose')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        articleTitle: 'The Future of AI Studios',
        articleContent: '# The Future of AI Studios\nAI studios are evolving from simple prompt wrappers into integrated creative operating systems.',
        format: 'linkedin-post',
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.content);
  });

  await t.test('POST /api/ai/content-pack should generate end-to-end creative bundle', async () => {
    const res = await request(app)
      .post('/api/ai/content-pack')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        topic: 'Remote Team Productivity in 2026',
        audience: 'Team Leads',
        generateCover: false,
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.articleTitle);
    assert.ok(res.body.data.articleContent);
    assert.ok(res.body.data.titles?.length >= 3);
  });

  let createdProjectId = '';
  await t.test('Projects API: Create, Get, Add Item, and Delete Project', async () => {
    // 1. Create Project
    const createRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        name: 'Q3 Launch Campaign',
        description: 'Marketing assets for product rollout',
        category: 'Marketing',
      });

    assert.strictEqual(createRes.status, 201);
    assert.strictEqual(createRes.body.success, true);
    createdProjectId = createRes.body.data.project._id || createRes.body.data.project.id;
    assert.ok(createdProjectId);

    // 2. Add Item to Project
    const itemRes = await request(app)
      .post(`/api/projects/${createdProjectId}/items`)
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        assetType: 'article',
        title: 'Launch Strategy Blueprint',
        content: 'Blueprint content...',
      });

    assert.strictEqual(itemRes.status, 200);
    assert.strictEqual(itemRes.body.success, true);

    // 3. Get Project by ID
    const getRes = await request(app)
      .get(`/api/projects/${createdProjectId}`)
      .set('Authorization', `Bearer ${userTokenA}`);

    assert.strictEqual(getRes.status, 200);
    assert.strictEqual(getRes.body.data.project.items.length, 1);

    // 4. Delete Project
    const delRes = await request(app)
      .delete(`/api/projects/${createdProjectId}`)
      .set('Authorization', `Bearer ${userTokenA}`);

    assert.strictEqual(delRes.status, 200);
  });

  await t.test('Brand Kit API: Get and Update user Brand Kit', async () => {
    const updateRes = await request(app)
      .put('/api/brand')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        brandName: 'Horizon Creative',
        tagline: 'Inspire the future',
        toneOfVoice: 'Visionary',
        preferredKeywords: ['pioneering', 'precision'],
      });

    assert.strictEqual(updateRes.status, 200);
    assert.strictEqual(updateRes.body.success, true);
    assert.strictEqual(updateRes.body.data.brandKit.brandName, 'Horizon Creative');

    const getRes = await request(app)
      .get('/api/brand')
      .set('Authorization', `Bearer ${userTokenA}`);

    assert.strictEqual(getRes.status, 200);
    assert.strictEqual(getRes.body.data.brandKit.brandName, 'Horizon Creative');
  });

  await t.test('Creative Canvas API: Save and Get canvas state', async () => {
    const saveRes = await request(app)
      .put('/api/canvas')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        title: 'Campaign Board',
        nodes: [
          {
            id: 'node-1',
            type: 'note',
            position: { x: 50, y: 50 },
            data: { title: 'Strategy Note', text: 'Focus on developer audience.' },
          },
        ],
      });

    assert.strictEqual(saveRes.status, 200);
    assert.strictEqual(saveRes.body.success, true);

    const getRes = await request(app)
      .get('/api/canvas')
      .set('Authorization', `Bearer ${userTokenA}`);

    assert.strictEqual(getRes.status, 200);
    assert.strictEqual(getRes.body.data.canvas.nodes.length, 1);
  });

  await t.test('GET /api/history/stats should return real user creation counts', async () => {
    const res = await request(app)
      .get('/api/history/stats')
      .set('Authorization', `Bearer ${userTokenA}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(typeof res.body.data.totalCreations === 'number');
    assert.ok(typeof res.body.data.articles === 'number');
  });

  await t.test('POST /api/briefs/generate should transform ideas into structured Creative Brief', async () => {
    const res = await request(app)
      .post('/api/briefs/generate')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        rawInput: 'Launch an AI creative studio app for developers and marketing teams',
        projectName: 'Dev Studio Launch',
        targetAudience: 'Software Engineers & Creators',
        industry: 'Developer Tools',
        brandPersonality: 'Technical & Visionary',
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.brief.campaignObjective);
    assert.ok(res.body.data.brief.requiredDeliverables?.length >= 3);
  });

  await t.test('POST /api/research/conduct should gather research findings and pain points', async () => {
    const res = await request(app)
      .post('/api/research/conduct')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        topic: 'Serverless Edge Functions in 2026',
        targetAudience: 'Cloud Architects',
        industry: 'Cloud Computing',
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.research.keyPoints?.length >= 2);
    assert.ok(res.body.data.research.questionsPeopleAsk?.length >= 2);
    assert.ok(res.body.data.research.audiencePainPoints?.length >= 1);
  });

  let createdVersionId = '';
  await t.test('Content Versioning API: Create, Get, Rename, and Delete Version Snapshots', async () => {
    const assetId = 'art-test-asset-123';

    // 1. Create Version 1
    const v1Res = await request(app)
      .post('/api/versions')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        assetId,
        title: 'Mastering Edge Compute',
        content: '# Mastering Edge Compute\nInitial draft content.',
        changesSummary: 'Initial generation snapshot',
        qualityScore: 92,
      });

    assert.strictEqual(v1Res.status, 201);
    assert.strictEqual(v1Res.body.success, true);
    assert.strictEqual(v1Res.body.data.version.versionNumber, 1);
    createdVersionId = v1Res.body.data.version._id || v1Res.body.data.version.id;

    // 2. Get Versions for Asset
    const listRes = await request(app)
      .get(`/api/versions/asset/${assetId}`)
      .set('Authorization', `Bearer ${userTokenA}`);

    assert.strictEqual(listRes.status, 200);
    assert.ok(listRes.body.data.versions.length >= 1);

    // 3. Rename Version
    const renameRes = await request(app)
      .patch(`/api/versions/${createdVersionId}/rename`)
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({ name: 'Release Candidate v1' });

    assert.strictEqual(renameRes.status, 200);
    assert.strictEqual(renameRes.body.data.version.name, 'Release Candidate v1');

    // 4. Delete Version
    const delRes = await request(app)
      .delete(`/api/versions/${createdVersionId}`)
      .set('Authorization', `Bearer ${userTokenA}`);

    assert.strictEqual(delRes.status, 200);
  });

  await t.test('POST /api/ai/social-pack should generate multi-platform social pack', async () => {
    const res = await request(app)
      .post('/api/ai/social-pack')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        topic: 'AI Creative Workspaces',
        targetAudience: 'Founders',
        tone: 'Bold & Disruptive',
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.linkedin.hooks?.length >= 3);
    assert.ok(res.body.data.twitter.thread?.length >= 3);
    assert.ok(res.body.data.instagram.carouselSlides?.length >= 3);
    assert.ok(res.body.data.youtube.titleOptions?.length >= 2);
  });

  await t.test('POST /api/ai/brand-consistency should evaluate content voice alignment', async () => {
    const res = await request(app)
      .post('/api/ai/brand-consistency')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        content: 'CreateForge AI empowers creators with visionary speed and precision.',
        brandKit: {
          brandName: 'CreateForge AI',
          toneOfVoice: 'Visionary',
          preferredKeywords: ['empowers', 'precision'],
          wordsToAvoid: ['cheap'],
        },
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.brandConsistencyScore >= 70);
  });

  await t.test('POST /api/ai/image-quality should audit FLUX image quality', async () => {
    const res = await request(app)
      .post('/api/ai/image-quality')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        prompt: 'a cinematic cybernetic city skyline',
        style: 'Cinematic',
        aspectRatio: '16:9',
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.qualityScore >= 75);
    assert.ok(res.body.data.suggestedImprovementPrompt);
  });

  await t.test('POST /api/ai/inline-transform should execute contextual text edits', async () => {
    const res = await request(app)
      .post('/api/ai/inline-transform')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        selectedText: 'we are making good progress on our software release.',
        action: 'professional',
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.transformedText);
  });

  await t.test('Campaign Export & Timeline API: Export campaign package', async () => {
    // 1. Create a project to export
    const pRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        name: 'Summer Growth Initiative',
        category: 'Marketing',
      });
    const projId = pRes.body.data.project._id || pRes.body.data.project.id;

    // 2. Export Campaign
    const expRes = await request(app)
      .get(`/api/export/campaign/${projId}`)
      .set('Authorization', `Bearer ${userTokenA}`);

    assert.strictEqual(expRes.status, 200);
    assert.strictEqual(expRes.body.success, true);
    assert.ok(expRes.body.data.masterMarkdown);
    assert.ok(expRes.body.data.jsonBundle);

    // 3. Get Project Timeline
    const timeRes = await request(app)
      .get(`/api/export/timeline/${projId}`)
      .set('Authorization', `Bearer ${userTokenA}`);

    assert.strictEqual(timeRes.status, 200);
    assert.ok(Array.isArray(timeRes.body.data.activities));
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

  // ==========================================
  // PHASE 6: CORE STUDIO INTELLIGENCE TESTS
  // ==========================================
  await t.test('Phase 6 Creative Context & Sources Management QA', async () => {
    // 1. Create a project
    const pRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        name: 'Phase 6 AI Workspace',
        category: 'Technology',
      });
    const pId = pRes.body.data.project._id || pRes.body.data.project.id;

    // 2. Update Creative Context
    const updateCtxRes = await request(app)
      .put(`/api/projects/${pId}/context`)
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        creativeContext: {
          topic: 'AI Developer Agents',
          audience: 'Senior Engineers',
          objective: 'In-Depth Technical Guide',
          tone: 'Authoritative',
        },
      });
    assert.strictEqual(updateCtxRes.status, 200);
    assert.strictEqual(updateCtxRes.body.success, true);
    assert.strictEqual(updateCtxRes.body.data.creativeContext.topic, 'AI Developer Agents');

    // 3. Get Creative Context
    const getCtxRes = await request(app)
      .get(`/api/projects/${pId}/context`)
      .set('Authorization', `Bearer ${userTokenA}`);
    assert.strictEqual(getCtxRes.status, 200);
    assert.strictEqual(getCtxRes.body.data.creativeContext.audience, 'Senior Engineers');

    // 4. Attach Source Material
    const srcRes = await request(app)
      .post(`/api/projects/${pId}/sources`)
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        name: 'Architecture Spec.txt',
        fileType: 'txt',
        textContent: 'Core memory architecture details for AI agents.',
      });
    assert.strictEqual(srcRes.status, 201);
    assert.strictEqual(srcRes.body.success, true);
    assert.strictEqual(srcRes.body.data.source.name, 'Architecture Spec.txt');

    const sourceId = srcRes.body.data.source._id;

    // 5. Delete Source Material
    const delSrcRes = await request(app)
      .delete(`/api/projects/${pId}/sources/${sourceId}`)
      .set('Authorization', `Bearer ${userTokenA}`);
    assert.strictEqual(delSrcRes.status, 200);
    assert.strictEqual(delSrcRes.body.success, true);
  });

  await t.test('Phase 6 Article Outline & Weakest Area Improvement QA', async () => {
    // 1. Generate Article Outline
    const outlineRes = await request(app)
      .post('/api/ai/article-outline')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        topic: 'Modern TypeScript Design Patterns',
        articleType: 'Comprehensive Guide',
        targetAudience: 'Frontend Developers',
      });
    assert.strictEqual(outlineRes.status, 200);
    assert.strictEqual(outlineRes.body.success, true);
    assert.ok(Array.isArray(outlineRes.body.data.sections));

    // 2. Improve Weakest Area
    const improveRes = await request(app)
      .post('/api/ai/article-improve-weakest')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        articleContent: '# TypeScript Patterns\n\nHere is a simple overview of TypeScript.',
        topic: 'TypeScript Patterns',
        weakestArea: 'Depth & Concrete Examples',
      });
    assert.strictEqual(improveRes.status, 200);
    assert.strictEqual(improveRes.body.success, true);
    assert.ok(improveRes.body.improvedContent);
  });

  await t.test('Phase 6 Title Variations & Titles From Article QA', async () => {
    // 1. Generate Title Variations
    const varRes = await request(app)
      .post('/api/ai/title-variations')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        title: 'How AI is Changing Web Development',
        topic: 'AI in Web Development',
        targetAudience: 'Developers',
      });
    assert.strictEqual(varRes.status, 200);
    assert.strictEqual(varRes.body.success, true);
    assert.ok(Array.isArray(varRes.body.data.variations));

    // 2. Generate Titles From Article
    const artTitleRes = await request(app)
      .post('/api/ai/titles-from-article')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        articleText: 'Modern micro frontends allow modular web architecture across enterprise teams.',
        targetAudience: 'Software Architects',
      });
    assert.strictEqual(artTitleRes.status, 200);
    assert.strictEqual(artTitleRes.body.success, true);
    assert.ok(Array.isArray(artTitleRes.body.data.titles));
  });

  await t.test('Phase 7 Quality Engine, Section Improvement, Natural Humanizer & Single Platform Social QA', async () => {
    const sampleArticle = `# Engineering Resilient AI Workflows\n\n## Foundational Architecture\nAI workflows require strict state separation.\n\n## Common Failure Modes\nRate limits and network timeouts cause unexpected service degradation.\n\n## Conclusion\nStructured resilience creates production-grade reliability.`;

    // 1. Weak Section Diagnosis
    const weakSecRes = await request(app)
      .post('/api/ai/article-weak-sections')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        articleContent: sampleArticle,
        topic: 'Resilient AI Workflows',
        targetAudience: 'Senior Engineers',
      });
    assert.strictEqual(weakSecRes.status, 200);
    assert.strictEqual(weakSecRes.body.success, true);
    assert.ok(Array.isArray(weakSecRes.body.data.weakSections));

    // 2. Targeted Section Improvement
    const impSecRes = await request(app)
      .post('/api/ai/article-improve-section')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        articleContent: sampleArticle,
        sectionHeading: 'Common Failure Modes',
        issue: 'Lacks concrete retry patterns',
        recommendation: 'Add exponential backoff and jitter code snippet',
        targetAudience: 'Senior Engineers',
      });
    assert.strictEqual(impSecRes.status, 200);
    assert.strictEqual(impSecRes.body.success, true);
    assert.ok(impSecRes.body.data.improvedContent);
    assert.strictEqual(impSecRes.body.data.sectionHeading, 'Common Failure Modes');

    // 3. Natural Humanization
    const humanizeRes = await request(app)
      .post('/api/ai/article-humanize')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        articleContent: sampleArticle,
        tone: 'Authoritative',
        targetAudience: 'Senior Engineers',
      });
    assert.strictEqual(humanizeRes.status, 200);
    assert.strictEqual(humanizeRes.body.success, true);
    assert.ok(humanizeRes.body.data.humanizedContent);

    // 4. Single Platform Social Generation
    const singleSocialRes = await request(app)
      .post('/api/ai/social-single-platform')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        platform: 'linkedin',
        hookStyle: 'Contrarian',
        topic: 'Resilient AI Workflows',
        articleTitle: 'Engineering Resilient AI Workflows',
        targetAudience: 'Engineering Leaders',
      });
    assert.strictEqual(singleSocialRes.status, 200);
    assert.strictEqual(singleSocialRes.body.success, true);
    assert.strictEqual(singleSocialRes.body.data.platform, 'linkedin');
    assert.strictEqual(singleSocialRes.body.data.hookStyle, 'Contrarian');
  });

  await t.test('Phase 8 Production Quality, Studio Pipeline & Cross-Project Isolation QA', async () => {
    // 1. User A creates Project Alpha
    const pAlphaRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        name: 'Project Alpha Production Studio',
        category: 'Technology',
      });
    assert.strictEqual(pAlphaRes.status, 201);
    const alphaId = pAlphaRes.body.data.project._id || pAlphaRes.body.data.project.id;

    // 2. User A adds Article Asset to Project Alpha
    const addArticleRes = await request(app)
      .post(`/api/projects/${alphaId}/items`)
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        assetType: 'article',
        title: 'Building Resilient SaaS Architectures',
        content: '# Resilient SaaS\n\nProduction architecture overview.',
      });
    assert.ok([200, 201].includes(addArticleRes.status));

    // 3. User A creates Project Beta
    const pBetaRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        name: 'Project Beta Clean Slate',
        category: 'Marketing',
      });
    assert.strictEqual(pBetaRes.status, 201);
    const betaId = pBetaRes.body.data.project._id || pBetaRes.body.data.project.id;

    // 4. Verify Project Beta does NOT contain Project Alpha items
    const getBetaRes = await request(app)
      .get(`/api/projects/${betaId}`)
      .set('Authorization', `Bearer ${userTokenA}`);
    assert.strictEqual(getBetaRes.status, 200);
    assert.strictEqual(getBetaRes.body.data.project.items.length, 0);

    // 5. Register User B
    const userBEmail = `prod_user_b_${Date.now()}@createforgeai.tech`;
    const regBRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User B Production Tester',
        email: userBEmail,
        password: 'Password123!',
      });
    assert.strictEqual(regBRes.status, 201);
    const userTokenB = regBRes.body.data.token;

    // 6. User B attempts to access User A's Project Alpha -> must return 404 or 403
    const bAccessAlphaRes = await request(app)
      .get(`/api/projects/${alphaId}`)
      .set('Authorization', `Bearer ${userTokenB}`);
    assert.ok([403, 404].includes(bAccessAlphaRes.status));

    // 7. User B attempts to update User A's Project Alpha context -> must return 403 or 404
    const bUpdateCtxRes = await request(app)
      .put(`/api/projects/${alphaId}/context`)
      .set('Authorization', `Bearer ${userTokenB}`)
      .send({
        creativeContext: { topic: 'Malicious Overwrite Attempt' },
      });
    assert.ok([403, 404].includes(bUpdateCtxRes.status));

    // 8. User B attempts to delete User A's Project Alpha -> must return 403 or 404
    const bDeleteAlphaRes = await request(app)
      .delete(`/api/projects/${alphaId}`)
      .set('Authorization', `Bearer ${userTokenB}`);
    assert.ok([403, 404].includes(bDeleteAlphaRes.status));

    // 9. Structured output service JSON parser & self-healing test
    const structuredOutputService = require('../services/ai/structuredOutputService');
    const dirtyJson = '```json\n{\n  "title": "Clean Headline",\n  "score": 95,\n}\n```';
    const repaired = structuredOutputService.parseAndRepair(dirtyJson);
    assert.ok(repaired);
    assert.strictEqual(repaired.title, 'Clean Headline');
    assert.strictEqual(repaired.score, 95);
    assert.strictEqual(structuredOutputService.validateSchema(repaired, ['title', 'score']), true);
  });

  await t.test('Phase 10 Final Production Gate, Health & Lifecycle Verification', async () => {
    // 1. Production Health Check
    const healthRes = await request(app).get('/api/health');
    assert.strictEqual(healthRes.status, 200);
    assert.strictEqual(healthRes.body.success, true);
    assert.strictEqual(healthRes.body.product, 'CreateForge AI');

    // 2. Unauthenticated request to protected endpoints must return 401
    const unauthProjectsRes = await request(app).get('/api/projects');
    assert.strictEqual(unauthProjectsRes.status, 401);
    assert.strictEqual(unauthProjectsRes.body.success, false);

    const unauthHistoryRes = await request(app).get('/api/history');
    assert.strictEqual(unauthHistoryRes.status, 401);
    assert.strictEqual(unauthHistoryRes.body.success, false);

    // 3. User C Lifecycle and Project Context Hardening
    const userCEmail = `prod_user_c_${Date.now()}@createforgeai.tech`;
    const regCRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User C Lifecycle Tester',
        email: userCEmail,
        password: 'Password123!',
      });
    assert.strictEqual(regCRes.status, 201);
    const tokenC = regCRes.body.data.token;

    // Create Project C
    const pCRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${tokenC}`)
      .send({
        name: 'AI Productivity for Developers',
        category: 'Technology',
        description: 'Complete studio workflow demonstration project',
      });
    assert.strictEqual(pCRes.status, 201);
    const projCId = pCRes.body.data.project._id || pCRes.body.data.project.id;

    // Add Article, Titles, Image, Social, SEO assets to Project C
    const addArtRes = await request(app)
      .post(`/api/projects/${projCId}/items`)
      .set('Authorization', `Bearer ${tokenC}`)
      .send({
        assetType: 'article',
        title: 'How AI is Changing Software Development',
        content: '# AI in Software Development\n\nExploring developer productivity.',
      });
    assert.ok([200, 201].includes(addArtRes.status));

    const addTitlesRes = await request(app)
      .post(`/api/projects/${projCId}/items`)
      .set('Authorization', `Bearer ${tokenC}`)
      .send({
        assetType: 'titles',
        title: 'Top 10 AI Productivity Workflows',
        content: JSON.stringify(['10x Dev Workflows', 'The Future of Coding with AI']),
      });
    assert.ok([200, 201].includes(addTitlesRes.status));

    // Update Creative Context
    const updateCtxRes = await request(app)
      .put(`/api/projects/${projCId}/context`)
      .set('Authorization', `Bearer ${tokenC}`)
      .send({
        creativeContext: {
          topic: 'AI developer productivity',
          targetAudience: 'Software Engineers',
          tone: 'Practical and technical',
          keywords: ['AI coding assistants', 'developer productivity'],
        },
      });
    assert.strictEqual(updateCtxRes.status, 200);
    assert.strictEqual(updateCtxRes.body.success, true);

    // Verify Project C details and assets count
    const getCRes = await request(app)
      .get(`/api/projects/${projCId}`)
      .set('Authorization', `Bearer ${tokenC}`);
    assert.strictEqual(getCRes.status, 200);
    assert.strictEqual(getCRes.body.data.project.items.length, 2);
    assert.strictEqual(getCRes.body.data.project.creativeContext.topic, 'AI developer productivity');
  });
});

