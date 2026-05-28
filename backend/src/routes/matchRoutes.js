import express from 'express';
import { getMatches, createMatch, joinMatch } from '../controllers/matchController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getMatches);
router.post('/create', requireAuth, createMatch);
router.post('/join', requireAuth, joinMatch);

export default router;
