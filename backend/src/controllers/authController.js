import jwt from 'jsonwebtoken';
import prisma from '../services/prisma.js';
import { verifyGoogleToken } from '../auth/google.js';

const JWT_SECRET = process.env.JWT_SECRET || 'keophui_super_secret_jwt_key_2026';

// 1. Google OAuth Authentication & Sync
export const googleLogin = async (req, res) => {
  const { idToken, phone } = req.body;

  if (!idToken || !phone) {
    return res.status(400).json({ error: 'Missing idToken or phone!' });
  }

  const cleanPhone = phone.trim();

  try {
    // Verify token using our verification module
    const googleProfile = await verifyGoogleToken(idToken);

    // Look for user by phone number
    let user = await prisma.user.findUnique({
      where: { phone: cleanPhone },
    });

    if (user) {
      // User exists, update Google profile attributes if they were unset/generic
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          email: user.email || googleProfile.email,
          avatar: user.avatar || googleProfile.avatar,
          name: user.name.startsWith("Người chơi") ? googleProfile.name : user.name,
        },
      });
    } else {
      // Register new user
      user = await prisma.user.create({
        data: {
          name: googleProfile.name,
          email: googleProfile.email,
          phone: cleanPhone,
          avatar: googleProfile.avatar,
          role: 'player', // default role
        },
      });
    }

    // Sign session token
    const token = jwt.sign(
      { id: user.id, phone: user.phone, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({ token, user });
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(500).json({ error: error.message || 'Xác thực Google thất bại!' });
  }
};

// 2. Local Testing Bypass Login (Bypass Google Auth)
export const mockBypassLogin = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ error: 'Missing phone number!' });
  }

  const cleanPhone = phone.trim();

  try {
    let user = await prisma.user.findUnique({
      where: { phone: cleanPhone },
    });

    if (!user) {
      // Auto-register a default mock player
      user = await prisma.user.create({
        data: {
          name: `Cầu thủ Phủi ${cleanPhone.slice(-4)}`,
          phone: cleanPhone,
          role: 'player',
          avatar: '⚽',
        },
      });
    }

    // Sign session token
    const token = jwt.sign(
      { id: user.id, phone: user.phone, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({ token, user });
  } catch (error) {
    console.error("Bypass error:", error);
    return res.status(500).json({ error: 'Mock login bypass failed!' });
  }
};
