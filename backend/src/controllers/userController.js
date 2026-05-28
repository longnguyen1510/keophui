import prisma from '../services/prisma.js';

// Get profile of authenticated user
export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        venues: true,
        teams: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng!' });
    }

    return res.json(user);
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({ error: 'Lấy thông tin cá nhân thất bại!' });
  }
};

// Update profile details
export const updateProfile = async (req, res) => {
  const { name, position, avatar, role } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        position: position !== undefined ? position.trim() : undefined,
        avatar: avatar !== undefined ? avatar : undefined,
        role: role !== undefined ? role : undefined,
      },
    });

    return res.json(updatedUser);
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ error: 'Cập nhật thông tin cá nhân thất bại!' });
  }
};
