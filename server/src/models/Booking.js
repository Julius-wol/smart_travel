import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  bookingCode: { type: String, required: true, unique: true, uppercase: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  fullName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  nights: { type: Number, default: 2 },
  guests: { type: Number, required: true, min: 1, default: 2 },
  notes: { type: String, trim: true },
  paymentMethod: { type: String, default: 'momo' },
  totalPrice: { type: Number, required: true, min: 0 },
  status: { 
    type: String, 
    enum: ['PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'COMPLETED'], 
    default: 'CONFIRMED' 
  },
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
