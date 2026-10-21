import express from 'express';
import { createBooking, getBookingByCode, getMyBookings, checkAvailability } from '../controllers/bookingController.js';

const router = express.Router();

router.post('/', createBooking);
router.get('/check-availability', checkAvailability);
router.get('/my-bookings', getMyBookings);
router.get('/:code', getBookingByCode);

export default router;
