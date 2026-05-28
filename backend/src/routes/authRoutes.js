import express from 'express';
import { googleLogin, mockBypassLogin } from '../controllers/authController.js';

const router = express.Router();

router.post('/google', googleLogin);
router.post('/mock-bypass', mockBypassLogin);

export default router;
