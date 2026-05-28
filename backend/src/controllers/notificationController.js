import prisma from '../services/prisma.js';

// 1. Fetch user notifications
export const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { recipientPhone: req.user.phone },
      orderBy: { createdAt: 'desc' },
    });

    // Format fields for frontend compatibility
    const formatted = notifications.map(n => ({
      id: n.id,
      recipientPhone: n.recipientPhone,
      type: n.type,
      title: n.title,
      message: n.message,
      isRead: n.isRead,
      createdAt: n.createdAt.getTime(), // returns timestamp ms
    }));

    return res.json(formatted);
  } catch (error) {
    console.error("Get notifications error:", error);
    return res.status(500).json({ error: 'Lấy danh sách thông báo thất bại!' });
  }
};

// 2. Mark specific notification or all notifications as read
export const readNotifications = async (req, res) => {
  const { notificationId } = req.body;

  try {
    if (notificationId) {
      // Mark specific notification as read
      await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });
    } else {
      // Mark all notifications as read for this user
      await prisma.notification.updateMany({
        where: { recipientPhone: req.user.phone },
        data: { isRead: true },
      });
    }

    return res.json({ message: 'Đã đánh dấu đọc thông báo!' });
  } catch (error) {
    console.error("Read notifications error:", error);
    return res.status(500).json({ error: 'Đánh dấu đọc thông báo thất bại!' });
  }
};
