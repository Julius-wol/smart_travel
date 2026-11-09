import mongoose from 'mongoose';

const TripPlanSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  destinationCity: { 
    type: String, 
    required: true, 
    trim: true 
  },
  days: { 
    type: Number, 
    required: true, 
    min: 1 
  },
  totalBudget: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  schedule: { 
    type: mongoose.Schema.Types.Mixed, 
    required: true 
  }, // Dữ liệu JSON chi tiết từ Gemini AI
  linkedBookings: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Booking' 
  }],
  radiusKm: {
    type: Number,
    default: 5,
    min: 1
  },
  homestay: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    name: { type: String, default: '' },
    address: { type: String, default: '' },
    lat: { type: Number },
    lng: { type: Number }
  },
  preferences: [{ 
    type: String 
  }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual tương thích trường 'destination' cũ
TripPlanSchema.virtual('destination')
  .get(function() { return this.destinationCity; })
  .set(function(v) { this.destinationCity = v; });

const TripPlan = mongoose.model('TripPlan', TripPlanSchema);
export default TripPlan;
