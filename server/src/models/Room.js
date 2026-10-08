const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  pricePerNight: { type: Number, required: true, min: 0 },
  maxGuests: { type: Number, required: true, min: 1 },
  images: [{ type: String }],
  amenities: [{ type: String }],
  rating: { type: Number, default: 0, min: 0, max: 5 },
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
