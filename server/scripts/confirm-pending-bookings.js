import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import Booking from '../src/models/Booking.js';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)), quiet: true });

const applyChanges = process.argv.includes('--apply');

try {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smart_travel', {
    serverSelectionTimeoutMS: 10000,
  });

  const pendingCount = await Booking.countDocuments({ status: 'PENDING' });
  if (!applyChanges) {
    console.log(`Dry run: ${pendingCount} pending booking(s) would be confirmed.`);
  } else {
    const result = await Booking.updateMany(
      { status: 'PENDING' },
      { $set: { status: 'CONFIRMED' }, $unset: { slaDeadline: '' } },
    );
    const remaining = await Booking.countDocuments({ status: 'PENDING' });
    console.log(`Confirmed ${result.modifiedCount} pending booking(s); ${remaining} pending booking(s) remain.`);
    if (remaining > 0) process.exitCode = 1;
  }
} catch (error) {
  console.error('Pending booking migration failed:', error.code || error.name);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
