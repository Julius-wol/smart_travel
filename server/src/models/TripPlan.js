import mongoose from 'mongoose';

const tripPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  totalBudget: { type: Number, required: true, min: 0 },
  days: { type: Number, required: true, min: 1 },
  destination: { type: String, required: true, trim: true },
  preferences: [{ type: String }],
  schedule: { type: mongoose.Schema.Types.Mixed, required: true },
}, { timestamps: true });

const TripPlan = mongoose.model('TripPlan', tripPlanSchema);
export default TripPlan;
