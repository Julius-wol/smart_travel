import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import User from '../src/models/User.js';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)), quiet: true });

try {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smart_travel', {
    autoIndex: false,
    serverSelectionTimeoutMS: 10000
  });
  // Install scoped constraints before removing legacy global constraints.
  // If existing data violates them, stop and leave the old indexes untouched.
  await User.createIndexes();
  const indexes = await User.collection.indexes();
  for (const index of indexes) {
    const keys = Object.keys(index.key);
    if (index.unique && keys.length === 1 && ['email', 'username'].includes(keys[0])) {
      await User.collection.dropIndex(index.name);
      console.log(`Removed legacy global unique index: ${index.name}`);
    }
  }
  console.log('Role-scoped account indexes ready. No account documents were changed.');
} catch (error) {
  console.error('Role-scoped index migration failed:', error.code || error.name);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
