const mongoose = require('mongoose');
require('dotenv').config();

async function syncLocalToAtlas() {
  console.log('🔄 Connecting to databases for synchronization...');
  const localUri = 'mongodb://127.0.0.1:27017/createforge_ai';
  const atlasUri = process.env.MONGODB_URI;

  const local = await mongoose.createConnection(localUri).asPromise();
  const atlas = await mongoose.createConnection(atlasUri, { dbName: 'createforge_ai' }).asPromise();

  const collections = [
    'users',
    'projects',
    'brandkits',
    'canvasworkspaces',
    'briefs',
    'researchitems',
    'contentversions',
    'generationhistories',
    'imagegenerations',
    'activitylogs',
  ];

  for (const colName of collections) {
    const localDocs = await local.collection(colName).find({}).toArray();
    let inserted = 0;
    for (const doc of localDocs) {
      try {
        const res = await atlas.collection(colName).updateOne(
          { _id: doc._id },
          { $setOnInsert: doc },
          { upsert: true }
        );
        if (res.upsertedCount > 0) inserted++;
      } catch (err) {
        console.warn(`[Sync] Skipped ${colName} doc ${doc._id}: ${err.message}`);
      }
    }
    const finalCount = await atlas.collection(colName).countDocuments();
    console.log(`✅ Collection [${colName}]: Synced ${inserted} new documents (Total in Atlas: ${finalCount})`);
  }

  await local.close();
  await atlas.close();
  console.log('🎉 Data synchronization to MongoDB Atlas finished!');
}

syncLocalToAtlas()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Sync failed:', err);
    process.exit(1);
  });
