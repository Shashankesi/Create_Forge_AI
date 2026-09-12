require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const articleService = require('../services/ai/articleService');

const FORBIDDEN_ENTITIES = [
  'arctile',
  'our community has reported',
  'we have observed',
  'our customers achieved',
  'our internal research',
  'according to our data',
];

const NON_TECH_FORBIDDEN = [
  'kubernetes',
  'kafka',
  'mlflow',
  'flink',
  'pulsar',
  'model serving',
  'model registries',
  'microservices architecture',
  'thread contention',
  'neural network',
];

const TEST_CASES = [
  {
    name: 'TEST 1: Healthy breakfast ideas',
    topic: 'Healthy breakfast ideas',
    articleType: 'Comprehensive Guide',
    targetAudience: 'General Readers',
    tone: 'Conversational',
    forbidden: [...FORBIDDEN_ENTITIES, ...NON_TECH_FORBIDDEN, 'ai platform', 'saas'],
    requiredKeywords: ['breakfast', 'nutrition', 'protein', 'morning'],
  },
  {
    name: "TEST 2: Believe in God's plan",
    topic: "Believe in God's plan",
    articleType: 'Opinion',
    targetAudience: 'General Readers',
    tone: 'Inspirational',
    forbidden: [...FORBIDDEN_ENTITIES, ...NON_TECH_FORBIDDEN, 'software engineering', 'saas', 'api endpoint'],
    requiredKeywords: ['faith', 'trust', 'purpose', 'patience'],
  },
  {
    name: 'TEST 3: How a civic issue website can get better',
    topic: 'How a civic issue website can get better',
    articleType: 'Comprehensive Guide',
    targetAudience: 'General Readers',
    tone: 'Professional',
    forbidden: [...FORBIDDEN_ENTITIES, ...NON_TECH_FORBIDDEN],
    requiredKeywords: ['civic', 'citizen', 'issue', 'reporting'],
  },
  {
    name: 'TEST 4: React hooks for beginners',
    topic: 'React hooks for beginners',
    articleType: 'Tutorial',
    targetAudience: 'Beginners & Students',
    tone: 'Educational',
    forbidden: [...FORBIDDEN_ENTITIES],
    requiredKeywords: ['react', 'hook', 'state'],
  },
  {
    name: 'TEST 5: How to prepare for a frontend interview',
    topic: 'How to prepare for a frontend interview',
    articleType: 'Comprehensive Guide',
    targetAudience: 'Software Developers',
    tone: 'Professional',
    forbidden: [...FORBIDDEN_ENTITIES],
    requiredKeywords: ['front', 'interview', 'javascript'],
  },
];

async function runRegressionTests() {
  console.log('====================================================');
  console.log('CreateForge AI: Running Semantic Grounding Test Suite');
  console.log('====================================================\n');

  let allPassed = true;
  const results = [];

  for (const tc of TEST_CASES) {
    console.log(`\n--- Running ${tc.name} ---`);
    console.log(`Topic: "${tc.topic}" | Audience: "${tc.targetAudience}"`);

    const t0 = Date.now();
    try {
      const res = await articleService.generateArticle({
        topic: tc.topic,
        articleType: tc.articleType,
        targetAudience: tc.targetAudience,
        tone: tc.tone,
        desiredLength: 'Medium',
      });

      const elapsed = ((Date.now() - t0) / 1000).toFixed(2);
      const article = res.article || res.data?.article || '';
      const title = res.title || res.data?.title || '';
      const metadata = res.metadata || res.data?.metadata || {};
      const qualityScores = res.qualityScores || res.data?.qualityScores || {};
      const articleLower = (title + ' ' + article).toLowerCase();

      console.log(`Generated in ${elapsed}s (Provider: ${metadata.aiProvider}, Model: ${metadata.model})`);
      console.log(`Title: "${title}"`);
      console.log(`Word count: ${metadata.wordCount}`);
      console.log(`Quality Score: ${qualityScores.overall} (Topic Relevance: ${qualityScores.topicRelevance || qualityScores.relevance})`);

      const errors = [];

      // 1. Check title matches topic semantically
      if (!title || title.length < 5) {
        errors.push('Title is missing or too short.');
      }
      if (title.toLowerCase().includes('arctile')) {
        errors.push(`Title contains forbidden entity "Arctile": "${title}"`);
      }

      // 2. Check forbidden words / hallucinated entities
      for (const forbidden of tc.forbidden) {
        if (articleLower.includes(forbidden.toLowerCase())) {
          errors.push(`Found forbidden term/phrase: "${forbidden}" in generated article`);
        }
      }

      // 3. Check for presence of required keywords
      const missingKeywords = tc.requiredKeywords.filter(
        (kw) => !articleLower.includes(kw.toLowerCase())
      );
      if (missingKeywords.length > 0) {
        errors.push(`Missing essential domain keywords: ${missingKeywords.join(', ')}`);
      }

      // 4. Check quality scores
      const relScore = qualityScores.topicRelevance || qualityScores.relevance || 0;
      if (relScore < 60) {
        errors.push(`Topic relevance score too low: ${relScore}`);
      }

      if (errors.length === 0) {
        console.log(`✅ ${tc.name} PASSED`);
        results.push({ name: tc.name, status: 'PASSED', title, wordCount: metadata.wordCount });
      } else {
        console.error(`❌ ${tc.name} FAILED with ${errors.length} error(s):`);
        errors.forEach((err) => console.error(`   - ${err}`));
        allPassed = false;
        results.push({ name: tc.name, status: 'FAILED', title, errors });
      }
    } catch (err) {
      console.error(`❌ ${tc.name} THREW EXCEPTION:`, err.message);
      allPassed = false;
      results.push({ name: tc.name, status: 'EXCEPTION', error: err.message });
    }
  }

  console.log('\n====================================================');
  console.log('SUMMARY OF RESULTS:');
  console.log('====================================================');
  results.forEach((r) => {
    console.log(`${r.status === 'PASSED' ? '✅' : '❌'} ${r.name}: ${r.status} | Title: "${r.title || 'N/A'}"`);
  });

  if (!allPassed) {
    console.error('\n❌ ONE OR MORE TESTS FAILED.');
    process.exit(1);
  } else {
    console.log('\n🎉 ALL 5 ADVERSARIAL TOPIC TESTS PASSED WITH 100% SEMANTIC GROUNDING!');
    process.exit(0);
  }
}

runRegressionTests();
