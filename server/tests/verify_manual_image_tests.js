const imageGenerationService = require('../services/imageGenerationService');
const connectDB = require('../config/db');
const assert = require('assert');

const testCases = [
  {
    name: 'TEST 1: Realistic Red Sports Car',
    prompt: 'A realistic red sports car parked on a modern city street at sunset',
    style: 'Realistic',
    aspectRatio: '16:9',
  },
  {
    name: 'TEST 2: Cinematic Mountain Landscape',
    prompt: 'A cinematic mountain landscape with a futuristic city in the distance',
    style: 'Cinematic',
    aspectRatio: '16:9',
  },
  {
    name: 'TEST 3: Illustration Cute Orange Cat',
    prompt: 'A cute orange cat sitting on a wooden desk',
    style: 'Illustration',
    aspectRatio: '1:1',
  },
  {
    name: 'TEST 4: 3D Futuristic Gaming Room',
    prompt: 'A futuristic gaming room with RGB lighting',
    style: '3D',
    aspectRatio: '16:9',
  },
  {
    name: 'TEST 5: Product Premium Black Smartwatch',
    prompt: 'A premium black smartwatch on a clean studio background',
    style: 'Product',
    aspectRatio: '4:3',
  },
];

async function runManualImageTests() {
  console.log('🚀 Running CreateForge AI FLUX 5-Point Manual Verification Suite...\n');
  await connectDB();

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    console.log(`----------------------------------------------------------------`);
    console.log(`🖼️ [${i + 1}/${testCases.length}] Executing: ${tc.name}`);
    console.log(`   Prompt: "${tc.prompt}"`);
    console.log(`   Style: ${tc.style} | Aspect Ratio: ${tc.aspectRatio}`);

    const startTime = Date.now();
    try {
      const result = await imageGenerationService.generateImage({
        prompt: tc.prompt,
        style: tc.style,
        aspectRatio: tc.aspectRatio,
        userId: 'test_verifier',
      });

      assert.strictEqual(result.success, true, 'Result success should be true');
      assert.strictEqual(result.model, 'flux', 'Model must be flux');
      assert.ok(result.imageUrl, 'Image URL must exist');
      assert.ok(result.imageUrl.startsWith('data:image/') || result.imageUrl.startsWith('http'), 'Image URL must be valid data URI or HTTP link');
      assert.ok(result.imageUrl.length > 5000, 'Image payload must be substantial (>5KB)');

      const duration = Date.now() - startTime;
      console.log(`✅ [${i + 1}/${testCases.length}] PASSED in ${duration}ms!`);
      console.log(`   Model: ${result.model}`);
      console.log(`   Dimensions: ${result.dimensions.width}x${result.dimensions.height}`);
      console.log(`   Revised Prompt: "${result.revisedPrompt.slice(0, 75)}..."`);
    } catch (err) {
      console.error(`❌ [${i + 1}/${testCases.length}] FAILED:`, err.message);
      process.exit(1);
    }
  }

  console.log('\n================================================================');
  console.log('🎉 ALL 5 FLUX IMAGE TESTS PASSED WITH 100% SUCCESS!');
  console.log('================================================================\n');
  process.exit(0);
}

runManualImageTests();
