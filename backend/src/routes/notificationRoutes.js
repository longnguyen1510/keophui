import express from 'express';
import { getNotifications, readNotifications } from '../controllers/notificationController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, getNotifications);
router.post('/read', requireAuth, readNotifications);

export default router;
