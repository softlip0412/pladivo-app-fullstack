const mongoose = require('mongoose');
// require('dotenv').config({ path: '.env.local' });

// Assuming the connection string is in process.env.MONGODB_URI or similar
// I'll try to read the .env file first or just use the connectDB helper if I can import it.
// But importing helper in a standalone script might be tricky with Next.js aliases.
// I'll try to read the .env file.

const fs = require('fs');
const path = require('path');

async function run() {
  try {
    // Read .env or .env.local to get MONGODB_URI
    let uri = '';
    try {
        const envConfig = fs.readFileSync('.env', 'utf8');
        const match = envConfig.match(/MONGO_URL=(.*)/);
        if (match) uri = match[1];
    } catch (e) {}
    
    if (!uri) {
        try {
            const envConfig = fs.readFileSync('.env.local', 'utf8');
            const match = envConfig.match(/MONGO_URL=(.*)/);
            if (match) uri = match[1];
        } catch (e) {}
    }

    if (!uri) {
        console.log("Could not find MONGODB_URI in .env or .env.local");
        // Fallback or exit
        // Let's assume the user has it set in their environment or I can find it in the codebase.
        // I'll check app/api/common/db.js to see how it connects.
        return;
    }
    
    // Remove quotes if present
    uri = uri.replace(/"/g, '').replace(/'/g, '').trim();

    await mongoose.connect(uri);
    console.log("Connected to DB");

    const partnerSchema = new mongoose.Schema({
        company_name: String,
        partner_type: String,
    }, { strict: false });

    const Partner = mongoose.model('Partner', partnerSchema);

    const partners = await Partner.find({});
    console.log("Found partners:", partners.length);
    partners.forEach(p => {
        console.log(`- Name: ${p.company_name}, Type: '${p.partner_type}'`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
  }
}

run();
