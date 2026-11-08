import express from 'express';
import { createBooking, getBookingByCode, getMyBookings, checkAvailability, getRoomAvailability } from '../controllers/bookingController.js';
import { protectedRoute } from '../middlewares/authMiddlewares.js';

const router = express.Router();

// Use the signed-in customer's identity when a bearer token is supplied.
const identifyCustomer = (req, res, next) => req.headers.authorization
  ? protectedRoute(req, res, next)
  : next();
router.post('/', identifyCustomer, createBooking);
router.get('/check-availability', identifyCustomer, checkAvailability);
router.get('/room-availability', getRoomAvailability);
router.get('/my-bookings', protectedRoute, getMyBookings);
router.get('/:code', getBookingByCode);

export default router;
