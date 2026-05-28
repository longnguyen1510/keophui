import express from 'express';
import { getVenues, registerVenue, configVenue } from '../controllers/venueController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getVenues);
router.post('/register', requireAuth, registerVenue);
router.post('/config', requireAuth, requireRole(['owner', 'admin']), configVenue);

export default router;
