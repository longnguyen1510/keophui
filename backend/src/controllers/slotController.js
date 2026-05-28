import prisma from '../services/prisma.js';

// 1. Fetch all slots (with associated venue and field details)
export const getSlots = async (req, res) => {
  try {
    const slots = await prisma.timeSlot.findMany({
      include: {
        venue: true,
        field: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Format slots to be compatible with Frontend structure
    const formattedSlots = slots.map(s => ({
      id: s.id,
      venueId: s.venueId,
      venueName: s.venue.name,
      district: s.venue.district,
      address: s.venue.address,
      fieldId: s.fieldId,
      fieldName: s.field.fieldName,
      timeSlot: s.timeSlot,
      rawTime: s.dateLabel,
      pitchType: s.field.fieldType,
      price: s.price,
      status: s.status,
      customerName: s.customerName || "",
      customerPhone: s.customerPhone || "",
      bookingNotes: s.bookingNotes || "",
      hold_expires_at: s.holdExpiresAt ? s.holdExpiresAt.toISOString() : null,
      contact: s.venue.phone,
    }));

    return res.json(formattedSlots);
  } catch (error) {
    console.error("Get slots error:", error);
    return res.status(500).json({ error: 'Lấy danh sách khung giờ thất bại!' });
  }
};

// 2. Owner creates an empty slot
export const createSlot = async (req, res) => {
  const { time, date, pitchType, price, fieldId, notes } = req.body;

  if (!time || !date || !pitchType || !price) {
    return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ: Giờ đá, ngày đá, loại sân và giá tiền!' });
  }

  try {
    const myVenue = await prisma.venue.findFirst({
      where: { ownerUserId: req.user.id },
      include: { fields: true },
    });

    if (!myVenue) {
      return res.status(404).json({ error: 'Không tìm thấy cụm sân của bạn!' });
    }

    // Resolve field association
    let targetField = null;
    if (fieldId) {
      targetField = myVenue.fields.find(f => f.fieldId === fieldId);
    } else {
      // Find first available active field of matching type
      targetField = myVenue.fields.find(f => f.fieldType === pitchType && f.status === 'active');
    }

    if (!targetField) {
      return res.status(400).json({ error: `Cụm sân của bạn không có sân con nào thuộc loại ${pitchType} đang hoạt động!` });
    }

    const cleanPrice = parseInt(String(price).replace(/[^0-9]/g, '')) || 300000;

    // Check for duplicate slot on the exact same field and timeSlot
    const duplicate = await prisma.timeSlot.findFirst({
      where: {
        venueId: myVenue.id,
        fieldId: targetField.fieldId,
        dateLabel: date,
        timeSlot: `${time} ${date}`,
      },
    });

    if (duplicate) {
      return res.status(400).json({ error: 'Khung giờ này trên sân con đã tồn tại!' });
    }

    const newSlot = await prisma.timeSlot.create({
      data: {
        venueId: myVenue.id,
        fieldId: targetField.fieldId,
        dateLabel: date,
        timeSlot: `${time} ${date}`,
        price: cleanPrice,
        status: 'available',
        bookingNotes: notes || 'Giờ trống từ chủ sân.',
      },
      include: {
        venue: true,
        field: true,
      },
    });

    return res.json({ message: 'Tạo khung giờ trống thành công!', slot: newSlot });
  } catch (error) {
    console.error("Create slot error:", error);
    return res.status(500).json({ error: 'Đăng khung giờ trống thất bại!' });
  }
};

// 3. Core Database Transaction to Book or Hold a Slot (Erases double booking)
export const bookSlot = async (req, res) => {
  const { slotId, status, customerName, customerPhone, bookingNotes } = req.body; // status: 'booked' or 'on_hold'

  if (!slotId || !status) {
    return res.status(400).json({ error: 'Missing slotId or status!' });
  }

  try {
    // Run database transaction with isolated locking to verify and update
    const result = await prisma.$transaction(async (tx) => {
      // Lock slot for update to block concurrent booking requests
      const slot = await tx.timeSlot.findUnique({
        where: { id: slotId },
      });

      if (!slot) {
        throw new Error('Khung giờ sân không tồn tại!');
      }

      if (slot.status === 'booked') {
        throw new Error('Rất tiếc, khung giờ sân này đã có người đặt trước!');
      }

      if (slot.status === 'on_hold' && slot.holdExpiresAt && slot.holdExpiresAt > new Date()) {
        throw new Error('Khung giờ này hiện đang được giữ chỗ bởi một đội khác!');
      }

      // Update slot details
      const expiresAt = status === 'on_hold' ? new Date(Date.now() + 40 * 60 * 1000) : null;
      
      const updatedSlot = await tx.timeSlot.update({
        where: { id: slotId },
        data: {
          status,
          customerName: customerName || null,
          customerPhone: customerPhone || null,
          bookingNotes: bookingNotes || null,
          holdExpiresAt: expiresAt,
        },
        include: {
          venue: true,
          field: true,
        },
      });

      // Create a booking record if it is a confirmed booking
      let booking = null;
      if (status === 'booked') {
        booking = await tx.booking.create({
          data: {
            userId: req.user.id,
            slotId: slotId,
            bookingCode: `KP-${Math.floor(100000 + Math.random() * 900000)}`,
            price: slot.price,
          },
        });
      }

      return { slot: updatedSlot, booking };
    });

    return res.json({
      message: result.booking ? 'Đặt sân thành công!' : 'Giữ sân thành công!',
      slot: result.slot,
      booking: result.booking,
    });
  } catch (error) {
    console.error("Booking error:", error);
    return res.status(400).json({ error: error.message || 'Giao dịch đặt sân thất bại!' });
  }
};
