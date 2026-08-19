const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const imageGenerationService = require('../services/imageGenerationService');

const testCases = [
  {
    name: 'TEST 1: Red Ferrari Sports Car on Mountain Highway',
    prompt: 'A realistic red Ferrari-style sports car driving on a mountain highway during golden hour',
    style: 'Realistic',
    aspectRatio: '16:9',
  },
  {
    name: 'TEST 2: Futuristic Electric Sports Car in Cyberpunk City',
    prompt: 'A futuristic electric sports car parked in a neon cyberpunk city',
    style: 'Cyberpunk',
    aspectRatio: '16:9',
  },
  {
    name: 'TEST 3: Premium Smartphone on Studio Table',
    prompt: 'A premium smartphone on a white studio table',
    style: 'Product',
    aspectRatio: '4:3',
  },
  {
    name: 'TEST 4: Mountain Lake Surrounded by Pine Forests',
    prompt: 'A peaceful mountain lake surrounded by pine forests at sunrise',
    style: 'Cinematic',
    aspectRatio: '16:9',
  },
  {
    name: 'TEST 5: Cute Golden Retriever in Garden',
    prompt: 'A cute golden retriever sitting in a garden',
    style: 'Realistic',
    aspectRatio: '3:4',
  },
];

async function runTests() {
  console.log('=====================================================');
  console.log('✦ CreateForge AI — Pollinations FLUX Image Test Suite');
  console.log('=====================================================\n');

  let passed = 0;
  let failed = 0;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    console.log(`\n--- Running [${i + 1}/${testCases.length}] ${tc.name} ---`);
    console.log(`Prompt: "${tc.prompt}"`);
    console.log(`Style: ${tc.style} | Ratio: ${tc.aspectRatio}`);

    const startTime = Date.now();
    try {
      const result = await imageGenerationService.generateImage({
        prompt: tc.prompt,
        style: tc.style,
        aspectRatio: tc.aspectRatio,
      });

      const elapsed = Date.now() - startTime;

      const hasValidImage =
        result &&
        result.success === true &&
        typeof result.imageUrl === 'string' &&
        (result.imageUrl.startsWith('data:image/') || result.imageUrl.startsWith('http')) &&
        result.imageUrl.length > 5000;

      const isFlux = result.provider === 'pollinations' && result.model === 'flux';

      if (hasValidImage && isFlux) {
        console.log(`✅ PASSED in ${elapsed}ms`);
        console.log(`   Provider: ${result.provider} | Model: ${result.model}`);
        console.log(`   Dimensions: ${result.dimensions.width}x${result.dimensions.height} (${result.dimensions.size})`);
        console.log(`   Image Data Length: ${result.imageUrl.length} chars`);
        console.log(`   Revised Prompt: ${result.revisedPrompt.substring(0, 100)}...`);
        passed++;
      } else {
        console.error(`❌ FAILED: Invalid response payload`);
        console.error(result);
        failed++;
      }
    } catch (err) {
      console.error(`❌ ERROR: ${err.message}`);
      if (err.statusCode) console.error(`   Status code: ${err.statusCode}`);
      failed++;
    }
  }

  console.log('\n=====================================================');
  console.log(`Test Results: ${passed} PASSED, ${failed} FAILED out of ${testCases.length}`);
  console.log('=====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
