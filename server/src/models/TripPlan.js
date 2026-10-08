const mongoose = require('mongoose');

const tripPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  totalBudget: { type: Number, required: true, min: 0 },
  days: { type: Number, required: true, min: 1 },
  destination: { type: String, required: true, trim: true },
  preferences: [{ type: String }],
  schedule: { type: mongoose.Schema.Types.Mixed, required: true }, // Mixed để lưu JSON linh hoạt từ Gemini AI
}, { timestamps: true });

module.exports = mongoose.model('TripPlan', tripPlanSchema);
