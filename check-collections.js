const mongoose = require('mongoose');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pladivo';

async function checkCollections() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    console.log('\n📦 Available collections:');
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });

    // Check EventPlan collections specifically
    const eventPlanCollections = collections.filter(col => 
      col.name.toLowerCase().includes('eventplan')
    );

    console.log('\n🎯 EventPlan related collections:');
    if (eventPlanCollections.length === 0) {
      console.log('  ❌ No EventPlan collections found');
    } else {
      for (const col of eventPlanCollections) {
        const count = await db.collection(col.name).countDocuments();
        console.log(`  - ${col.name}: ${count} documents`);
        
        // Show sample document
        const sample = await db.collection(col.name).findOne();
        if (sample) {
          console.log(`    Sample fields: ${Object.keys(sample).join(', ')}`);
        }
      }
    }

    await mongoose.connection.close();
    console.log('\n✅ Connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkCollections();
