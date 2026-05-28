import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'keophui_super_secret_jwt_key_2026';

export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '🚫 Vui lòng đăng nhập để tiếp tục!' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, phone, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: '🚫 Phiên đăng nhập hết hạn hoặc không hợp lệ!' });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: '🚫 Vui lòng đăng nhập để tiếp tục!' });
    }
    
    const allowed = Array.isArray(roles) ? roles.includes(req.user.role) : req.user.role === roles;
    if (!allowed && req.user.role !== 'admin') {
      return res.status(403).json({ error: '🚫 Bạn không có quyền thực hiện thao tác này!' });
    }
    next();
  };
};
