import express from 'express';
import {
  getInventory,
  getRoomById,
  createRoom,
  updateRoom,
  toggleStatus,
  duplicateRoom,
  deleteRoom,
  exportExcel,
} from '../controllers/hostRoomInventoryController.js';

const router = express.Router();

// GET /api/rooms/host/inventory
router.get('/', getInventory);

// GET /api/rooms/host/inventory/export
router.get('/export', exportExcel);

// GET /api/rooms/host/inventory/:id
router.get('/:id', getRoomById);

// POST /api/rooms/host/inventory
router.post('/', createRoom);

// PUT /api/rooms/host/inventory/:id
router.put('/:id', updateRoom);

// PATCH /api/rooms/host/inventory/:id/status
router.patch('/:id/status', toggleStatus);

// POST /api/rooms/host/inventory/:id/duplicate
router.post('/:id/duplicate', duplicateRoom);

// DELETE /api/rooms/host/inventory/:id
router.delete('/:id', deleteRoom);

export default router;
