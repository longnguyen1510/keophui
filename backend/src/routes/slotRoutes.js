import express from 'express';
import { getSlots, createSlot, bookSlot } from '../controllers/slotController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getSlots);
router.post('/create', requireAuth, createSlot);
router.post('/book', requireAuth, bookSlot);

export default router;
