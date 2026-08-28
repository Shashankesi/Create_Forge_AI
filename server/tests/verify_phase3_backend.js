require('dotenv').config();
const connectDB = require('../config/db');
const mongoose = require('mongoose');
const assert = require('assert');

const campaignBuilderService = require('../services/ai/campaignBuilderService');
const creativeMemoryService = require('../services/ai/creativeMemoryService');
const creativeDirectionService = require('../services/ai/creativeDirectionService');
const multimodalIntelligenceService = require('../services/ai/multimodalIntelligenceService');
const smartOptimizationService = require('../services/ai/smartOptimizationService');
const providerHealthService = require('../services/ai/providerHealthService');
const User = require('../models/User');
const Project = require('../models/Project');
const Campaign = require('../models/Campaign');
const Moodboard = require('../models/Moodboard');

async function runPhase3Tests() {
  console.log('🧪 Starting Phase 3 Backend & AI Intelligence Verification...\n');

  await connectDB();
  console.log('✅ Connected to MongoDB');

  // Test User
  const testUser = await User.findOne({ email: 'harish@gmail.com' });
  assert.ok(testUser, 'Test user harish@gmail.com must exist');
  const userId = testUser._id;

  // STEP 1: TEST CREATIVE MEMORY
  console.log('\n1️⃣ [Creative Memory] Testing memory initialization and decision recording...');
  const testProject = new Project({
    userId,
    name: 'Production QA Test Project',
    category: 'Technology',
    color: '#6366F1',
  });
  await testProject.save();

  const mem = await creativeMemoryService.recordDecision(testProject._id, userId, {
    type: 'image',
    title: 'Cinematic Holographic AI Core',
    status: 'approved',
    summary: 'Cinematic glassmorphism with electric purple illumination',
    keywords: ['cinematic', 'photorealistic', 'glassmorphism'],
  });
  assert.ok(mem.approvedConcepts.length > 0, 'Approved concepts must be recorded');
  assert.ok(mem.preferredVisualDirections.length > 0, 'Visual preference must be saved');
  console.log('   ✅ Creative memory successfully stored & updated.');

  // STEP 2: TEST CAMPAIGN HEALTH & NEXT BEST ACTION
  console.log('\n2️⃣ [Campaign Planner & Health] Testing real state calculation...');
  const health = await campaignBuilderService.calculateProjectHealth(testProject._id, userId);
  assert.ok(health.overall >= 0 && health.overall <= 100, 'Overall score must be 0-100');
  console.log('   ✅ Real health score calculated:', health.overall + '/100');

  const nextAction = await campaignBuilderService.getNextBestAction(testProject._id, userId);
  assert.ok(nextAction.title, 'Next best action title must be returned');
  console.log('   ✅ Next Best Action recommended:', nextAction.title, `(${nextAction.stage})`);

  const readiness = await campaignBuilderService.getLaunchReadiness(testProject._id, userId);
  assert.strictEqual(readiness.totalChecks, 10, 'Must have 10 launch readiness checks');
  console.log('   ✅ Launch Readiness check:', readiness.statusLabel);

  // STEP 3: TEST MULTIMODAL & SMART OPTIMIZATION AI SERVICES
  console.log('\n3️⃣ [Smart Optimization] Testing Content Gap Analysis...');
  const gapResult = await smartOptimizationService.analyzeContentGaps({
    topic: 'AI Creative Automation',
    articleContent: 'Artificial intelligence is changing the way marketing assets are designed.',
    keywords: ['autonomous campaign', 'creative workflows'],
  });
  assert.ok(gapResult.coveragePercentage > 0, 'Coverage percentage must be computed');
  console.log('   ✅ Content Gap Analysis completed. Coverage:', gapResult.coveragePercentage + '%');

  console.log('\n4️⃣ [Smart Optimization] Testing Naturalness & Originality Review...');
  const natReview = await smartOptimizationService.checkNaturalnessAndOriginality({
    content: 'In today’s fast-paced digital world, it is crucial to leverage cutting-edge technology for maximum efficiency.',
  });
  assert.ok(natReview.originalityScore > 0, 'Originality score must be returned');
  console.log('   ✅ Naturalness review score:', natReview.originalityScore + '/100');

  console.log('\n5️⃣ [Headline Lab] Testing Categorized Headline Generation...');
  const headlines = await smartOptimizationService.generateHeadlineLab({
    topic: 'Autonomous AI Campaign Builder',
  });
  assert.ok(headlines.headlines?.length > 0, 'Headline lab must generate headlines');
  console.log('   ✅ Headline Lab produced', headlines.headlines.length, 'headlines across psychological categories');

  // STEP 6: TEST PROVIDER HEALTH
  console.log('\n6️⃣ [Provider Health] Testing health monitor...');
  providerHealthService.recordSuccess('gemini', 1200);
  providerHealthService.recordSuccess('groq', 350);
  const healthSummary = providerHealthService.getHealthSummary();
  assert.ok(healthSummary.gemini.status === 'operational');
  console.log('   ✅ Provider Health Summary:', healthSummary);

  // Cleanup test project
  await Project.deleteOne({ _id: testProject._id });
  await Campaign.deleteMany({ projectId: testProject._id });
  await Moodboard.deleteMany({ projectId: testProject._id });

  await mongoose.disconnect();
  console.log('\n🎉 ALL PHASE 3 BACKEND & INTELLIGENCE TESTS PASSED 100%!\n');
}

runPhase3Tests().catch((err) => {
  console.error('❌ Phase 3 test failed:', err);
  process.exit(1);
});
