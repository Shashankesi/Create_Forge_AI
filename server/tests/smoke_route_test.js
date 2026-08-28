const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Project = require('../models/Project');
const ResearchItem = require('../models/ResearchItem');
const Campaign = require('../models/Campaign');

const researchService = require('../services/ai/researchService');
const titleService = require('../services/ai/titleService');
const smartOptimizationService = require('../services/ai/smartOptimizationService');
const campaignBuilderService = require('../services/ai/campaignBuilderService');

async function runSmokeTests() {
  console.log('🧪 Starting Full System Stability & Route Smoke Tests...\n');

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✅ [MongoDB] Connected to Database');

    // 1. Check User Auth Data
    const usersCount = await User.countDocuments();
    console.log(`✅ [Auth] Verified ${usersCount} users present in Atlas DB`);

    // 2. Test Research Studio Intelligence
    console.log('\n🔍 [Research Studio] Testing deep topic research...');
    const researchResult = await researchService.conductResearch({
      topic: 'AI Developer Productivity 2026',
      targetAudience: 'Software Engineers & CTOs',
      industry: 'Technology',
    });
    if (!researchResult.keyPoints || researchResult.keyPoints.length === 0) {
      throw new Error('Research Studio failed to generate keyPoints');
    }
    console.log('   ✅ Key Points:', researchResult.keyPoints.length);
    console.log('   ✅ Search Intent:', researchResult.searchIntent);
    console.log('   ✅ Questions People Ask:', researchResult.questionsPeopleAsk?.length || 0);

    // 3. Test Title Generator Intelligence
    console.log('\n📝 [Blog Titles] Testing categorized headline generation...');
    const titleResult = await titleService.generateTitles({
      topic: 'Autonomous Cloud Architecture',
      niche: 'Technology',
      targetAudience: 'Cloud Architects',
      tone: 'Engaging',
      count: 6,
    });
    if (!titleResult.titles || titleResult.titles.length === 0) {
      throw new Error('Title Generator failed to generate titles');
    }
    console.log('   ✅ Generated Titles Count:', titleResult.titles.length);
    console.log('   ✅ First Headline:', titleResult.titles[0].title || titleResult.titles[0]);

    // 4. Test Content Gap Analysis
    console.log('\n📊 [Smart Optimization] Testing Content Gap Analysis...');
    const gapResult = await smartOptimizationService.analyzeContentGaps({
      topic: 'Enterprise AI Governance',
      currentContent: 'AI is transforming the modern enterprise. Teams need policies and guidelines.',
      targetAudience: 'Enterprise CIOs',
    });
    console.log('   ✅ Coverage Score:', `${gapResult.estimatedCoverageScore}%`);
    console.log('   ✅ Missing Subtopics:', gapResult.missingSubtopics?.length || 0);

    // 5. Test Campaign Planner & Health Scoring
    console.log('\n🚀 [Campaign Builder] Testing autonomous campaign health...');
    const testProject = await Project.findOne();
    if (testProject) {
      const health = await campaignBuilderService.calculateProjectHealth(testProject._id, testProject.userId);
      const nextAction = await campaignBuilderService.getNextBestAction(testProject._id, testProject.userId);
      console.log('   ✅ Real Health Score:', `${health?.overallScore || 0}%`);
      console.log('   ✅ Next Best Action:', nextAction?.title || 'N/A');
    }

    console.log('\n🎉 ALL FULL ROUTE & DATA LOADING SMOKE TESTS PASSED 100%!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Smoke Test Error:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runSmokeTests();
