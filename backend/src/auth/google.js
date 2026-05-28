import { OAuth2Client } from 'google-auth-library';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

export async function verifyGoogleToken(idToken) {
  // Gracefully fallback to mock bypass if client ID is unconfigured or mock token is detected
  if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.includes("YOUR_") || idToken.startsWith('mock_')) {
    const parts = idToken.split('_');
    const name = parts[1] ? decodeURIComponent(parts[1]) : 'Người chơi';
    const email = parts[2] || 'user@keophui.com';
    const avatar = parts[3] ? decodeURIComponent(parts[3]) : '⚽';
    return { name, email, avatar };
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return {
      name: payload.name || 'Người chơi',
      email: payload.email,
      avatar: payload.picture || '⚽',
    };
  } catch (error) {
    console.error("Error verifying Google Token:", error);
    throw new Error("Xác thực Token Google thất bại!");
  }
}
