/**
 * Standalone Seed Script
 * Run: cd backend && npx tsx src/scripts/seed.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'backend', '.env') });

const MONGODB_URI = process.env.MONGODB_URI || '';
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not set in .env');
  process.exit(1);
}

async function main() {
  console.log('🔌 Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 20000,
    connectTimeoutMS: 25000,
  });
  console.log('✅ Connected:', mongoose.connection.host, '/', mongoose.connection.name);

  const { College } = await import('../models/College.js');
  const { User } = await import('../models/User.js');

  // Drop existing college data to force a fresh seed
  const existing = await College.countDocuments();
  console.log(`📊 Existing colleges: ${existing}`);
  if (existing > 0) {
    await College.deleteMany({});
    console.log('🗑️  Cleared existing colleges');
  }

  // Create admin user if not exists
  const adminExists = await User.findOne({ role: 'admin' });
  if (!adminExists) {
    await User.create({
      name: 'Admin',
      email: 'admin@campusnavigator.in',
      password: 'Admin@1234',
      role: 'admin',
      isVerified: true,
    });
    console.log('👤 Admin created: admin@campusnavigator.in / Admin@1234');
  }

  // Now disconnect and reconnect so database.ts autoSeedIfEmpty triggers
  await mongoose.disconnect();
  console.log('🔄 Reconnecting to trigger auto-seed...');

  const { connectDatabase } = await import('../config/database.js');
  await connectDatabase();

  const finalCount = await College.countDocuments();
  console.log(`\n✅ SEED COMPLETE — ${finalCount} colleges in database`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
