import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clean old data in safe sequence
  await prisma.notification.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.match.deleteMany({});
  await prisma.timeSlot.deleteMany({});
  await prisma.fieldCombination.deleteMany({});
  await prisma.field.deleteMany({});
  await prisma.team.deleteMany({});
  await prisma.venue.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('🗑️  Existing tables cleared.');

  // 2. Seed Users
  const user1 = await prisma.user.create({
    data: {
      name: 'Hùng Phủi Nguyễn',
      email: 'hung.nguyen.phui@gmail.com',
      phone: '0989123456',
      role: 'player',
      position: 'Tiền đạo (CF)',
      avatar: '⚽',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Tuấn GK Trần',
      email: 'tuan.tran.gk@gmail.com',
      phone: '0977223344',
      role: 'player',
      position: 'Thủ môn (GK)',
      avatar: '🧤',
    },
  });

  const owner = await prisma.user.create({
    data: {
      name: 'Nguyễn Văn Đạt (Chủ Sân Win)',
      email: 'dat.nguyen.win@gmail.com',
      phone: '0901111111',
      role: 'owner',
      position: 'Cầu đá',
      avatar: '🏟️',
    },
  });

  console.log('👥 Users seeded successfully.');

  // 3. Seed Venue & Fields
  const venue = await prisma.venue.create({
    data: {
      ownerUserId: owner.id,
      name: 'Sân Bóng Win Thủ Đức',
      address: '12 Đường số 12, Phường Trường Thọ, Thủ Đức, TP. HCM',
      district: 'Thủ Đức',
      phone: '0901111111',
      rating: 4.8,
    },
  });

  const field5A = await prisma.field.create({
    data: { venueId: venue.id, fieldName: 'Sân 5A', fieldType: 'Sân 5', defaultPrice: 300000 },
  });

  const field5B = await prisma.field.create({
    data: { venueId: venue.id, fieldName: 'Sân 5B', fieldType: 'Sân 5', defaultPrice: 300000 },
  });

  const field7A = await prisma.field.create({
    data: { venueId: venue.id, fieldName: 'Sân 7A', fieldType: 'Sân 7', defaultPrice: 500000 },
  });

  console.log('🏟️ Venue and subfields seeded.');

  // 4. Seed dynamic Field Combinations rules (7A = 5A + 5B)
  await prisma.fieldCombination.create({
    data: {
      venueId: venue.id,
      targetFieldId: field7A.fieldId,
      childFieldId: field5A.fieldId,
    },
  });

  await prisma.fieldCombination.create({
    data: {
      venueId: venue.id,
      targetFieldId: field7A.fieldId,
      childFieldId: field5B.fieldId,
    },
  });

  console.log('⚙️ Field combination rules established.');

  // 5. Seed Time Slots
  const today = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const formatYMD = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  const todayStr = formatYMD(today);
  const tomorrowStr = formatYMD(new Date(Date.now() + 86400000));

  const datesToSeed = [todayStr, tomorrowStr];
  const times = [
    { start: '17:30 - 19:00', price5: 300000, price7: 500000 },
    { start: '19:00 - 20:30', price5: 350000, price7: 550000 },
    { start: '20:30 - 22:00', price5: 300000, price7: 500000 },
  ];

  let slotCount = 0;
  for (const date of datesToSeed) {
    for (const t of times) {
      // Slot 5A
      await prisma.timeSlot.create({
        data: {
          venueId: venue.id,
          fieldId: field5A.fieldId,
          dateLabel: date,
          timeSlot: `${t.start} ${date === todayStr ? 'Hôm nay' : 'Ngày mai'}`,
          price: t.price5,
          status: 'available',
        },
      });

      // Slot 5B
      await prisma.timeSlot.create({
        data: {
          venueId: venue.id,
          fieldId: field5B.fieldId,
          dateLabel: date,
          timeSlot: `${t.start} ${date === todayStr ? 'Hôm nay' : 'Ngày mai'}`,
          price: t.price5,
          status: 'available',
        },
      });

      // Slot 7A
      await prisma.timeSlot.create({
        data: {
          venueId: venue.id,
          fieldId: field7A.fieldId,
          dateLabel: date,
          timeSlot: `${t.start} ${date === todayStr ? 'Hôm nay' : 'Ngày mai'}`,
          price: t.price7,
          status: 'available',
        },
      });

      slotCount += 3;
    }
  }

  console.log(`⏰ Seeded ${slotCount} active time slots.`);

  // 6. Seed a Match waiting for opponent
  const seedTeam = await prisma.team.create({
    data: {
      captainUserId: user1.id,
      name: 'FC Rồng Phủi',
      level: 'Khá',
    },
  });

  const slotForMatch = await prisma.timeSlot.findFirst({
    where: { fieldId: field7A.fieldId, dateLabel: todayStr },
  });

  if (slotForMatch) {
    // Put slot on hold
    await prisma.timeSlot.update({
      where: { id: slotForMatch.id },
      data: {
        status: 'on_hold',
        customerName: seedTeam.name,
        customerPhone: user1.phone,
        bookingNotes: 'Kèo public tìm đối cứng cựa giao lưu.',
      },
    });

    await prisma.match.create({
      data: {
        authorUserId: user1.id,
        teamId: seedTeam.id,
        teamName: seedTeam.name,
        venueSlotId: slotForMatch.id,
        status: 'Cần đối',
        time: slotForMatch.timeSlot,
        rawTime: todayStr,
        venue: venue.name,
        district: venue.district,
        pitchType: 'Sân 7',
        level: 'Khá',
        fee: `${slotForMatch.price.toLocaleString('vi-VN')}đ`,
        notes: 'Cần tìm đối đá vui vẻ mồ hôi, chia đôi tiền sân sân Win Thủ Đức.',
      },
    });

    console.log('🤝 Seeded a challenge match on Sân 7A.');
  }

  console.log('🚀 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
