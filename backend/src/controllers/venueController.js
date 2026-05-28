import prisma from '../services/prisma.js';

// 1. Get all venues with their fields & combinations
export const getVenues = async (req, res) => {
  try {
    const venues = await prisma.venue.findMany({
      include: {
        fields: {
          include: {
            combinationsAsTarget: true,
          },
        },
      },
    });

    // Format combination rules into client structure [{target: '7A', parts: ['5A', '5B']}]
    const formattedVenues = await Promise.all(venues.map(async (v) => {
      const dbCombs = await prisma.fieldCombination.findMany({
        where: { venueId: v.id },
        include: {
          targetField: true,
          childField: true,
        },
      });

      // Group combinations by target field name
      const grouped = {};
      dbCombs.forEach(c => {
        const targetName = c.targetField.fieldName.replace("Sân ", "");
        const childName = c.childField.fieldName.replace("Sân ", "");
        if (!grouped[targetName]) {
          grouped[targetName] = [];
        }
        grouped[targetName].push(childName);
      });

      const combinations = Object.entries(grouped).map(([target, parts]) => ({
        target,
        parts,
      }));

      // Map capacities object format for frontend compatibility
      const capacity5Count = v.fields.filter(f => f.fieldType === "Sân 5").length;
      const capacity7Count = v.fields.filter(f => f.fieldType === "Sân 7").length;
      const capacity11Count = v.fields.filter(f => f.fieldType === "Sân 11").length;

      return {
        id: v.id,
        owner_user_id: v.ownerUserId,
        name: v.name,
        address: v.address,
        district: v.district,
        phone: v.phone,
        rating: v.rating,
        activeStartHour: v.activeStartHour,
        activeEndHour: v.activeEndHour,
        capacities: {
          '5': capacity5Count,
          '7': capacity7Count,
          '11': capacity11Count,
        },
        combinations,
      };
    }));

    return res.json(formattedVenues);
  } catch (error) {
    console.error("Get venues error:", error);
    return res.status(500).json({ error: 'Lấy thông tin cụm sân thất bại!' });
  }
};

// 2. Register a new Venue & auto-create default subfields
export const registerVenue = async (req, res) => {
  const { name, address, district, phone } = req.body;

  if (!name || !address || !phone) {
    return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ Tên, Địa chỉ và Số điện thoại!' });
  }

  try {
    // Check if user already owns a venue
    const existing = await prisma.venue.findFirst({
      where: { ownerUserId: req.user.id },
    });

    if (existing) {
      return res.status(400).json({ error: 'Mỗi tài khoản chủ sân chỉ được đăng ký tối đa 1 cụm sân bóng!' });
    }

    const newVenue = await prisma.venue.create({
      data: {
        ownerUserId: req.user.id,
        name: name.trim(),
        address: address.trim(),
        district: district || 'Thủ Đức',
        phone: phone.trim(),
      },
    });

    // Auto-create standard fields: 5A, 5B, 7A (Matches default FE seed behavior)
    const newFieldsData = [
      { venueId: newVenue.id, fieldName: "Sân 5A", fieldType: "Sân 5", defaultPrice: 300000 },
      { venueId: newVenue.id, fieldName: "Sân 5B", fieldType: "Sân 5", defaultPrice: 300000 },
      { venueId: newVenue.id, fieldName: "Sân 7A", fieldType: "Sân 7", defaultPrice: 500000 },
    ];

    await prisma.field.createMany({
      data: newFieldsData,
    });

    // Update user's role to 'owner'
    await prisma.user.update({
      where: { id: req.user.id },
      data: { role: 'owner' },
    });

    return res.json({ message: 'Đăng ký cụm sân thành công!', venue: newVenue });
  } catch (error) {
    console.error("Register venue error:", error);
    return res.status(500).json({ error: 'Đăng ký cụm sân thất bại!' });
  }
};

// 3. Configure capacities & combination rules
export const configVenue = async (req, res) => {
  const { capacities, combinations } = req.body; // capacities: {'5': 3, '7': 2}, combinations: [{target: '7A', parts: ['5A', '5B']}]

  try {
    const myVenue = await prisma.venue.findFirst({
      where: { ownerUserId: req.user.id },
      include: { fields: true },
    });

    if (!myVenue) {
      return res.status(404).json({ error: 'Không tìm thấy cụm sân bóng của bạn!' });
    }

    // Dynamic field creation/management: adjust count of Sân 5, Sân 7, Sân 11
    if (capacities) {
      const activeFields = myVenue.fields;

      for (const [typeKey, targetCount] of Object.entries(capacities)) {
        const fieldType = `Sân ${typeKey}`;
        const currentFields = activeFields.filter(f => f.fieldType === fieldType);
        const diff = targetCount - currentFields.length;

        if (diff > 0) {
          // Add fields
          const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
          const toCreate = [];
          for (let i = 0; i < diff; i++) {
            const nextLetter = alphabet[currentFields.length + i] || `${currentFields.length + i}`;
            const name = `${typeKey}${nextLetter}`;
            toCreate.push({
              venueId: myVenue.id,
              fieldName: `Sân ${name}`,
              fieldType,
              defaultPrice: typeKey === '5' ? 300000 : typeKey === '7' ? 500000 : 800000,
            });
          }
          await prisma.field.createMany({ data: toCreate });
        } else if (diff < 0) {
          // Deactivate or delete extra fields (keep dependencies safe by deactivating status)
          const toDeactivate = currentFields.slice(diff); // grab extra fields from the end
          for (const f of toDeactivate) {
            await prisma.field.update({
              where: { fieldId: f.fieldId },
              data: { status: 'inactive' },
            });
          }
        }
      }
    }

    // Refresh field reference list
    const refreshedFields = await prisma.field.findMany({
      where: { venueId: myVenue.id, status: 'active' },
    });

    // Update Dynamic combinations rules
    if (combinations) {
      // Clear old combination rules for this venue
      await prisma.fieldCombination.deleteMany({
        where: { venueId: myVenue.id },
      });

      const newCombs = [];
      for (const comb of combinations) {
        const targetField = refreshedFields.find(f => f.fieldName === `Sân ${comb.target}`);
        if (!targetField) continue;

        for (const partName of comb.parts) {
          const partField = refreshedFields.find(f => f.fieldName === `Sân ${partName}`);
          if (!partField) continue;

          newCombs.push({
            venueId: myVenue.id,
            targetFieldId: targetField.fieldId,
            childFieldId: partField.fieldId,
          });
        }
      }

      if (newCombs.length > 0) {
        await prisma.fieldCombination.createMany({
          data: newCombs,
        });
      }
    }

    return res.json({ message: 'Lưu cài đặt cấu hình gộp sân bóng thành công!' });
  } catch (error) {
    console.error("Config venue error:", error);
    return res.status(500).json({ error: 'Cấu hình sân bóng thất bại!' });
  }
};
