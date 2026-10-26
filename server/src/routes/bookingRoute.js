import express from 'express';
import { getBookingCalendar } from '../controllers/bookingCalendarController.js';
import { createBooking, getBookingByCode, getMyBookings, checkAvailability } from '../controllers/bookingController.js';

const router = express.Router();

router.post('/', createBooking);
router.get('/check-availability', checkAvailability);
router.get('/calendar', getBookingCalendar);
router.get('/my-bookings', getMyBookings);
router.get('/:code', getBookingByCode);

export default router;
