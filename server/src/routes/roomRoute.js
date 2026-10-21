import express from 'express';
import { getAllRooms, getRoomById, seedRooms } from '../controllers/roomController.js';

const router = express.Router();

router.get('/', getAllRooms);
router.get('/seed', seedRooms);
router.get('/:id', getRoomById);

export default router;
