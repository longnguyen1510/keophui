import prisma from '../services/prisma.js';

// 1. Get all active matches
export const getMatches = async (req, res) => {
  try {
    const matches = await prisma.match.findMany({
      include: {
        author: true,
        team: true,
        timeSlot: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Format to fit frontend expectations
    const formattedMatches = matches.map(m => ({
      id: m.id,
      team_id: m.teamId,
      teamName: m.teamName,
      status: m.status,
      time: m.time,
      rawTime: m.rawTime,
      venue: m.venue,
      district: m.district,
      pitchType: m.pitchType,
      fee: m.fee,
      level: m.level,
      notes: m.notes,
      adminContact: m.author.phone,
      venue_slot_id: m.venueSlotId,
      missingCount: m.missingCount,
      initialMissingCount: m.initialMissingCount,
      position: m.position,
      joinedPlayers: [], // MVP simple join lists
      requests: [],
    }));

    return res.json(formattedMatches);
  } catch (error) {
    console.error("Get matches error:", error);
    return res.status(500).json({ error: 'Lấy danh sách trận đấu thất bại!' });
  }
};

// 2. Create a new Match (finding opponent or recruiting solo players)
export const createMatch = async (req, res) => {
  const {
    teamId,
    teamName,
    status, // 'Cần đối', 'Thiếu người'
    time,
    rawTime,
    venue,
    district,
    pitchType,
    level,
    notes,
    venueSlotId,
    missingCount,
    position
  } = req.body;

  if (!status || !time || !rawTime || !venue || !district || !pitchType) {
    return res.status(400).json({ error: 'Vui lòng điền đầy đủ các thông tin trận đấu!' });
  }

  try {
    const newMatch = await prisma.match.create({
      data: {
        authorUserId: req.user.id,
        teamId: teamId || null,
        teamName: teamName || 'FC Phong Trào',
        status,
        time,
        rawTime,
        venue,
        district,
        pitchType,
        level: level || 'Vui vẻ',
        notes: notes || '',
        venueSlotId: venueSlotId || null,
        missingCount: parseInt(missingCount) || 0,
        initialMissingCount: parseInt(missingCount) || 0,
        position: position || 'Cầu đá',
      },
      include: {
        author: true,
      },
    });

    // If venueSlotId is provided, make sure it is updated to "on_hold"
    if (venueSlotId) {
      await prisma.timeSlot.update({
        where: { id: venueSlotId },
        data: {
          status: 'on_hold',
          customerName: teamName,
          customerPhone: req.user.phone,
        },
      });
    }

    return res.json({ message: 'Đăng kèo đấu thành công!', match: newMatch });
  } catch (error) {
    console.error("Create match error:", error);
    return res.status(500).json({ error: 'Tạo kèo đấu mới thất bại!' });
  }
};

// 3. Simple Join / Challenge a Match
export const joinMatch = async (req, res) => {
  const { matchId, challengerTeamName, challengerPhone, notes } = req.body;

  if (!matchId) {
    return res.status(400).json({ error: 'Missing matchId!' });
  }

  try {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { author: true },
    });

    if (!match) {
      return res.status(404).json({ error: 'Kèo đấu không tồn tại!' });
    }

    // Change status to confirmed/Đang chờ xác nhận depending on match type
    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: {
        status: 'confirmed', // Confirmed pairing!
      },
    });

    // If there is an associated slot, update its status to booked
    if (match.venueSlotId) {
      await prisma.timeSlot.update({
        where: { id: match.venueSlotId },
        data: {
          status: 'booked',
          customerName: `${match.teamName} vs ${challengerTeamName || 'Đối thủ'}`,
        },
      });
    }

    // Create notification for the match author
    await prisma.notification.create({
      data: {
        recipientPhone: match.author.phone,
        type: 'match_invite',
        title: '🤝 Kèo đấu đã chốt đối thủ!',
        message: `Trận đấu của bạn tại <strong>${match.venue}</strong> lúc <strong>${match.time}</strong> đã có đối thủ nhận kèo: <strong>${challengerTeamName || 'Đối tác'}</strong> (${challengerPhone || ''}).`,
      },
    });

    return res.json({ message: 'Nhận kèo ghép thành công!', match: updatedMatch });
  } catch (error) {
    console.error("Join match error:", error);
    return res.status(500).json({ error: 'Nhận kèo ghép thất bại!' });
  }
};
