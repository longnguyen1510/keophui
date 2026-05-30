// Kèo Phủi Admin Dashboard Mock Data
// Generates realistic sport-themed data for the Vietnamese football booking ecosystem.

// 1. Generate 100 Users
export const MOCK_ADMIN_USERS = [
  { id: "u_admin", name: "Super Admin", phone: "admin", avatar: "👑", roles: ["super_admin"], created_at: "2026-04-01T08:00:00Z", last_active: "2026-05-30T10:15:00Z", playedCount: 0, status: "active" },
  { id: "u_1", name: "Lâm Phủi Thủ Đức", phone: "0901122334", avatar: "🏃", roles: ["team_owner", "player"], created_at: "2026-04-12T14:30:00Z", last_active: "2026-05-30T09:30:00Z", playedCount: 18, status: "active" },
  { id: "u_2", name: "Hoàng Messi Q7", phone: "0912233445", avatar: "⚽", roles: ["player"], created_at: "2026-04-15T09:15:00Z", last_active: "2026-05-29T21:40:00Z", playedCount: 22, status: "active" },
  { id: "u_3", name: "Thành Đạt GK", phone: "0923344556", avatar: "🧤", roles: ["team_admin", "player"], created_at: "2026-04-18T16:22:00Z", last_active: "2026-05-30T08:11:00Z", playedCount: 14, status: "active" },
  { id: "u_4", name: "Dũng Cá Sấu", phone: "0901111112", avatar: "🏟️", roles: ["venue_owner"], created_at: "2026-04-20T10:00:00Z", last_active: "2026-05-30T09:50:00Z", playedCount: 0, status: "active" },
  { id: "u_5", name: "Tuấn Anh FC", phone: "0934455667", avatar: "🏃", roles: ["team_owner", "player"], created_at: "2026-04-22T11:45:00Z", last_active: "2026-05-28T18:30:00Z", playedCount: 9, status: "active" },
  { id: "u_6", name: "Quang Hải Nhỏ", phone: "0945566778", avatar: "⚡", roles: ["player"], created_at: "2026-04-25T14:10:00Z", last_active: "2026-05-30T10:20:00Z", playedCount: 31, status: "active" },
  { id: "u_7", name: "Đức Chinh Quận 9", phone: "0956677889", avatar: "⚽", roles: ["player"], created_at: "2026-04-28T07:50:00Z", last_active: "2026-05-25T16:00:00Z", playedCount: 5, status: "active" },
  { id: "u_8", name: "Văn Lâm Bình Thạnh", phone: "0967788990", avatar: "🧤", roles: ["player"], created_at: "2026-05-01T15:35:00Z", last_active: "2026-05-29T20:15:00Z", playedCount: 11, status: "active" },
  { id: "u_9", name: "Phú Cường Win", phone: "0901111111", avatar: "🏟️", roles: ["venue_owner"], created_at: "2026-05-02T13:00:00Z", last_active: "2026-05-30T10:00:00Z", playedCount: 0, status: "active" },
  { id: "u_10", name: "Hùng Phủi Quận 2", phone: "0989123456", avatar: "🏃", roles: ["team_owner", "player"], created_at: "2026-05-03T18:20:00Z", last_active: "2026-05-30T09:12:00Z", playedCount: 26, status: "active" },
  // Violating/Suspicious Users
  { id: "u_91", name: "Tài Bịp Kèo", phone: "0977881122", avatar: "☠️", roles: ["player"], created_at: "2026-05-15T11:00:00Z", last_active: "2026-05-29T14:00:00Z", playedCount: 2, status: "suspended", reason: "Boom kèo 2 lần" },
  { id: "u_92", name: "Sơn Spam Lịch", phone: "0988771122", avatar: "⚠️", roles: ["team_owner", "player"], created_at: "2026-05-18T10:15:00Z", last_active: "2026-05-30T08:00:00Z", playedCount: 1, status: "warned", reason: "Spam tạo kèo ảo" }
];

// Helper to fill up to 100 users with realistic data
for (let i = 11; i <= 100; i++) {
  if (i === 91 || i === 92) continue;
  const names = ["Minh", "Khánh", "Duy", "Thắng", "Quân", "Long", "Nam", "Việt", "Kiên", "Tùng", "Sơn", "Trung", "Hoàng", "Hiếu", "Phúc"];
  const surnames = ["Nguyễn", "Trần", "Lê", "Phạm", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng", "Bùi"];
  const districts = ["Thủ Đức", "Bình Thạnh", "Quận 7", "Quận 2", "Quận 9", "Gò Vấp", "Phú Nhuận", "Tân Bình"];
  
  const randName = surnames[Math.floor(Math.random() * surnames.length)] + " " + names[Math.floor(Math.random() * names.length)];
  const randDistrict = districts[Math.floor(Math.random() * districts.length)];
  const randPhone = "09" + String(Math.floor(10000000 + Math.random() * 90000000));
  const randPlayed = Math.floor(Math.random() * 20);
  const randRole = Math.random() > 0.7 ? "team_owner" : "player";

  MOCK_ADMIN_USERS.push({
    id: `u_${i}`,
    name: randName + " " + randDistrict,
    phone: randPhone,
    avatar: "🏃",
    roles: [randRole, "player"],
    created_at: new Date(Date.now() - (100 - i) * 24 * 3600 * 1000).toISOString(),
    last_active: new Date(Date.now() - Math.random() * 15 * 24 * 3600 * 1000).toISOString(),
    playedCount: randPlayed,
    status: "active"
  });
}

// 2. Generate 20 Teams
export const MOCK_ADMIN_TEAMS = [
  { id: "t_1", name: "FC Anh Em Thủ Đức", district: "Thủ Đức", level: "Trung bình", owner_user_id: "u_1", phone: "0901122334", representative: "Lâm Phủi", matchCount: 32, rating: 4.8, uyTin: 98, cancellationRate: 2, last_active: "2026-05-30T09:30:00Z", verified: true },
  { id: "t_2", name: "FC Lão Tướng Q7", district: "Quận 7", level: "Khá", owner_user_id: "u_2", phone: "0912233445", representative: "Hoàng Messi", matchCount: 45, rating: 4.7, uyTin: 95, cancellationRate: 4, last_active: "2026-05-29T21:40:00Z", verified: true },
  { id: "t_3", name: "FC Gà Rừng", district: "Bình Thạnh", level: "Mạnh", owner_user_id: "u_10", phone: "0989123456", representative: "Hùng Phủi", matchCount: 52, rating: 4.9, uyTin: 99, cancellationRate: 0, last_active: "2026-05-30T09:12:00Z", verified: true },
  { id: "t_4", name: "FC Sinh Viên Hutech", district: "Bình Thạnh", level: "Trung bình", owner_user_id: "u_5", phone: "0934455667", representative: "Tuấn Anh", matchCount: 18, rating: 4.2, uyTin: 85, cancellationRate: 15, last_active: "2026-05-28T18:30:00Z", verified: false },
  // Violating Teams
  { id: "t_19", name: "FC Hủy Trận", district: "Gò Vấp", level: "Trung bình", owner_user_id: "u_91", phone: "0977881122", representative: "Tài Bịp", matchCount: 12, rating: 2.5, uyTin: 40, cancellationRate: 58, last_active: "2026-05-29T14:00:00Z", verified: false, boomKèoCount: 3 },
  { id: "t_20", name: "FC Spam", district: "Tân Bình", level: "Yếu", owner_user_id: "u_92", phone: "0988771122", representative: "Sơn Spam", matchCount: 5, rating: 3.1, uyTin: 60, cancellationRate: 35, last_active: "2026-05-30T08:00:00Z", verified: false, spamCount: 5 }
];

// Helper to fill up to 20 teams
for (let i = 5; i <= 18; i++) {
  const teamNames = ["Bóng Đá Trẻ", "Đại Học Y", "Chiến Binh", "Rồng Vàng", "Hổ Cáp", "Phủi Sài Gòn", "Huynh Đệ", "Đồng Đội", "Lốc Xoáy", "Độc Lập", "Kinh Tế FC", "Bách Khoa FC", "Ngân Hàng FC", "Hải Đăng FC"];
  const districts = ["Thủ Đức", "Bình Thạnh", "Quận 7", "Quận 2", "Quận 9", "Gò Vấp", "Phú Nhuận", "Tân Bình"];
  const levels = ["Yếu", "Trung bình", "Khá", "Mạnh", "Vui vẻ"];
  
  const randName = "FC " + teamNames[Math.floor(Math.random() * teamNames.length)] + " " + districts[Math.floor(Math.random() * districts.length)];
  const randDistrict = districts[Math.floor(Math.random() * districts.length)];
  const randLevel = levels[Math.floor(Math.random() * levels.length)];
  const randMatches = Math.floor(10 + Math.random() * 40);
  const randRating = parseFloat((3.8 + Math.random() * 1.2).toFixed(1));
  const randUyTin = Math.floor(75 + Math.random() * 25);
  const randCancel = Math.floor(Math.random() * 15);

  MOCK_ADMIN_TEAMS.push({
    id: `t_${i}`,
    name: randName,
    district: randDistrict,
    level: randLevel,
    owner_user_id: `u_${i + 10}`,
    phone: "09" + String(Math.floor(10000000 + Math.random() * 90000000)),
    representative: "Đội Trưởng " + i,
    matchCount: randMatches,
    rating: randRating,
    uyTin: randUyTin,
    cancellationRate: randCancel,
    last_active: new Date(Date.now() - Math.random() * 10 * 24 * 3600 * 1000).toISOString(),
    verified: Math.random() > 0.4
  });
}

// 3. Generate 8 Venues
export const MOCK_ADMIN_VENUES = [
  { id: "v_win_thuduc", owner_user_id: "u_9", name: "Sân bóng Win Thủ Đức", address: "Đường số 9, Linh Trung, Thủ Đức", district: "Thủ Đức", phone: "0901111111", verification_status: "verified", capacities: { '5': 4, '7': 2, '11': 1 }, slotRegistered: 24, slotBooked: 16, fillRate: 66, revenue: 4800000, commission: 480000 },
  { id: "v_casau", owner_user_id: "u_4", name: "Sân Cá Sấu Hoa Cà", address: "123 Phạm Văn Đồng, Thủ Đức", district: "Thủ Đức", phone: "0901111112", verification_status: "verified", capacities: { '5': 3, '7': 2, '11': 1 }, slotRegistered: 18, slotBooked: 12, fillRate: 66, revenue: 3600000, commission: 360000 },
  { id: "v_vietnam", owner_user_id: "u_15", name: "Sân bóng Ngôi Sao Q7", address: "456 Nguyễn Thị Thập, Quận 7", district: "Quận 7", phone: "0933445566", verification_status: "verified", capacities: { '5': 6, '7': 3, '11': 2 }, slotRegistered: 30, slotBooked: 21, fillRate: 70, revenue: 6300000, commission: 630000 },
  { id: "v_rachchiec", owner_user_id: "u_16", name: "Trung tâm Rạch Chiếc Q2", address: "Xa Lộ Hà Nội, An Phú, Quận 2", district: "Quận 2", phone: "0944556677", verification_status: "verified", capacities: { '5': 8, '7': 4, '11': 2 }, slotRegistered: 40, slotBooked: 28, fillRate: 70, revenue: 8400000, commission: 840000 },
  { id: "v_chilang", owner_user_id: "u_17", name: "Sân bóng Chi Lăng Gò Vấp", address: "789 Phan Văn Trị, Gò Vấp", district: "Gò Vấp", phone: "0955667788", verification_status: "verified", capacities: { '5': 4, '7': 1 }, slotRegistered: 12, slotBooked: 4, fillRate: 33, revenue: 1200000, commission: 120000 },
  { id: "v_tanbinh", owner_user_id: "u_18", name: "CLB Hoàng Hoa Thám", address: "12 Hoàng Hoa Thám, Tân Bình", district: "Tân Bình", phone: "0966778899", verification_status: "verified", capacities: { '5': 5, '7': 2 }, slotRegistered: 16, slotBooked: 10, fillRate: 62, revenue: 3000000, commission: 300000 },
  { id: "v_binhthanh", owner_user_id: "u_19", name: "Sân bóng Thanh Đa", address: "Bình Quới, Bình Thạnh", district: "Bình Thạnh", phone: "0977889900", verification_status: "verified", capacities: { '5': 3, '7': 1 }, slotRegistered: 8, slotBooked: 2, fillRate: 25, revenue: 600000, commission: 60000 },
  { id: "v_phunhuan", owner_user_id: "u_20", name: "Sân Phú Nhuận Kênh Nhiêu Lộc", address: "Trường Sa, Phú Nhuận", district: "Phú Nhuận", phone: "0988990011", verification_status: "verified", capacities: { '5': 4, '7': 2 }, slotRegistered: 14, slotBooked: 8, fillRate: 57, revenue: 2400000, commission: 240000 }
];

// 4. Pending Host Requests (Chủ sân chờ duyệt)
export const MOCK_PENDING_OWNERS = [
  { id: "req_1", name: "Nguyễn Văn Đạt", phone: "0901234432", venueName: "Sân bóng Mini Đạt Đức", address: "14 Lê Văn Việt, Quận 9", district: "Quận 9", notes: "Sân mới cỏ chất lượng cao Fifa, khai trương có ưu đãi đặc biệt.", created_at: "2026-05-29T16:45:00Z" },
  { id: "req_2", name: "Trần Thế Hùng", phone: "0911556633", venueName: "Cụm Sân bóng Hùng Vương", address: "200 Hùng Vương, Quận 5", district: "Quận 5", notes: "Cụm 4 sân 5 có thể ghép thành sân 7, camera AI tự động quay video.", created_at: "2026-05-30T07:12:00Z" },
  { id: "req_3", name: "Lê Thị Thảo", phone: "0933887766", venueName: "Sân cỏ nhân tạo Thảo Điền", address: "Thảo Điền, Quận 2", district: "Quận 2", notes: "Phục vụ 24/7, có sẵn canteen nước suối, trà chanh miễn phí.", created_at: "2026-05-30T08:30:00Z" },
  { id: "req_4", name: "Phạm Bình Minh", phone: "0944991122", venueName: "Sân bóng Bình Minh Phú Nhuận", address: "Phan Xích Long, Phú Nhuận", district: "Phú Nhuận", notes: "Hệ thống chiếu sáng LED thế hệ mới cực sáng không chói mắt.", created_at: "2026-05-30T09:15:00Z" },
  { id: "req_5", name: "Vũ Tiến Dũng", phone: "0988223311", venueName: "Sân vận động Dũng Tiến Gò Vấp", address: "Nguyễn Oanh, Gò Vấp", district: "Gò Vấp", notes: "Đã có bãi giữ xe hơi rộng rãi, phục vụ giao lưu hội nhóm doanh nghiệp.", created_at: "2026-05-30T10:05:00Z" }
];

// 5. System Reports & Complaints (Khiếu nại)
export const MOCK_ADMIN_REPORTS = [
  { id: "rep_1", matchId: "match_102", reporterPhone: "0901122334", reportedPhone: "0977881122", reporterTeam: "FC Anh Em Thủ Đức", reportedTeam: "FC Hủy Trận", type: "boom_kèo", content: "Đội FC Hủy Trận chốt kèo đá sân Win lúc 19:30 tối qua nhưng không đến, gọi điện thoại thuê bao không liên lạc được, làm đội chúng tôi chịu tiền cọc sân.", status: "pending", created_at: "2026-05-29T21:00:00Z" },
  { id: "rep_2", matchId: "match_105", reporterPhone: "0912233445", reportedPhone: "0988771122", reporterTeam: "FC Lão Tướng Q7", reportedTeam: "FC Spam", type: "gian_lận_trình", content: "Ghi thông tin đội trình độ Vui vẻ nhưng mang toàn cầu thủ chuyên nghiệp, phủi cứng đến đá áp đảo ăn tiền độ không lành mạnh.", status: "pending", created_at: "2026-05-30T08:30:00Z" },
  { id: "rep_3", matchId: "match_109", reporterPhone: "0989123456", reportedPhone: "0911559988", reporterTeam: "FC Gà Rừng", reportedTeam: "FC Hổ Báo", type: "vi_phạm_uy_tín", content: "Lối đá bạo lực triệt hạ đối phương, cãi cọ xô xát trên sân gây mất trật tự thể thao.", status: "verified", created_at: "2026-05-30T09:00:00Z" },
  { id: "rep_4", matchId: "match_112", reporterPhone: "0934455667", reportedPhone: "0901111111", reporterTeam: "FC Sinh Viên Hutech", reportedTeam: "Chủ Sân Win", type: "sai_giá_tiền", content: "Thông báo trên app giá sân 90 phút là 450k nhưng khi thanh toán chủ sân thu 550k nói là tính phụ thu đèn chiếu sáng ngoài giờ.", status: "pending", created_at: "2026-05-30T09:45:00Z" }
];

// Helper to fill other report records to make it 8
for (let i = 5; i <= 8; i++) {
  MOCK_ADMIN_REPORTS.push({
    id: `rep_${i}`,
    matchId: `match_10${i + 5}`,
    reporterPhone: "090112233" + i,
    reportedPhone: "098765432" + i,
    reporterTeam: "FC Reporter Team " + i,
    reportedTeam: "FC Reported Team " + i,
    type: Math.random() > 0.5 ? "boom_kèo" : "hủy_sát_giờ",
    content: "Đội đối tác tự ý hủy trận sát giờ đá 30 phút mà không có lý do thỏa đáng, vi phạm quy định giao hữu của cộng đồng.",
    status: Math.random() > 0.4 ? "resolved" : "pending",
    created_at: new Date(Date.now() - Math.random() * 2 * 24 * 3600 * 1000).toISOString()
  });
}

// 6. Generate 60 Slots
export const MOCK_ADMIN_SLOTS = [];
const slotDates = [
  "2026-05-30", "2026-05-31", "2026-06-01", "2026-06-02", "2026-06-03"
];
const slotHours = [
  "06:00 - 07:30", "07:30 - 09:00", "16:00 - 17:30", "17:30 - 19:00", "19:00 - 20:30", "20:30 - 22:00"
];
const slotStatuses = ["Available", "Booked", "On hold", "Expired", "Cancelled"];

for (let i = 1; i <= 60; i++) {
  const venue = MOCK_ADMIN_VENUES[Math.floor(Math.random() * MOCK_ADMIN_VENUES.length)];
  const randDate = slotDates[Math.floor(Math.random() * slotDates.length)];
  const randHour = slotHours[Math.floor(Math.random() * slotHours.length)];
  const randSize = Math.random() > 0.6 ? 7 : 5;
  const randPrice = randSize === 7 ? 600000 : 400000;
  const randStatus = i <= 25 ? "Booked" : i <= 45 ? "Available" : i <= 52 ? "On hold" : i <= 56 ? "Expired" : "Cancelled";

  MOCK_ADMIN_SLOTS.push({
    id: `slot_${i}`,
    venueName: venue.name,
    district: venue.district,
    date: randDate,
    time: randHour,
    pitchSize: randSize,
    price: randPrice,
    status: randStatus,
    created_at: new Date(Date.now() - Math.random() * 5 * 24 * 3600 * 1000).toISOString()
  });
}

// 7. Generate 40 Matches
export const MOCK_ADMIN_MATCHES = [];
const matchStatuses = ["waiting_opponent", "pending_confirmation", "confirmed", "completed", "cancelled"];

// Pre-fill 25 Completed Matches
for (let i = 1; i <= 25; i++) {
  const teamA = MOCK_ADMIN_TEAMS[Math.floor(Math.random() * 10)];
  const teamB = MOCK_ADMIN_TEAMS[Math.floor(Math.random() * 10 + 10)];
  const venue = MOCK_ADMIN_VENUES[Math.floor(Math.random() * MOCK_ADMIN_VENUES.length)];
  
  MOCK_ADMIN_MATCHES.push({
    id: `match_comp_${i}`,
    booking_code: `KP-${100000 + Math.floor(Math.random() * 900000)}`,
    teamName: teamA.name,
    team_id: teamA.id,
    pairedWith: teamB.name,
    venue: venue.name,
    district: venue.district,
    time: "19:00 - 20:30",
    pitchType: "Sân 7",
    status: "completed",
    requests: [
      { id: `req_a_${i}`, teamName: teamB.name, phone: teamB.phone, status: "accepted", level: teamB.level }
    ],
    adminContact: teamA.phone,
    price: 600000,
    created_at: new Date(Date.now() - i * 24 * 3600 * 1000).toISOString()
  });
}

// Pre-fill 6 Cancelled Matches
for (let i = 1; i <= 6; i++) {
  const teamA = MOCK_ADMIN_TEAMS[Math.floor(Math.random() * 10)];
  const venue = MOCK_ADMIN_VENUES[Math.floor(Math.random() * MOCK_ADMIN_VENUES.length)];

  MOCK_ADMIN_MATCHES.push({
    id: `match_canc_${i}`,
    booking_code: `KP-${100000 + Math.floor(Math.random() * 900000)}`,
    teamName: teamA.name,
    team_id: teamA.id,
    pairedWith: "",
    venue: venue.name,
    district: venue.district,
    time: "17:30 - 19:00",
    pitchType: "Sân 5",
    status: "cancelled",
    cancelReason: i % 2 === 0 ? "Không tìm được đối thủ ghép cùng giờ đá." : "Đội bận việc đột xuất không thể thi đấu.",
    requests: [],
    adminContact: teamA.phone,
    price: 400000,
    created_at: new Date(Date.now() - i * 2 * 24 * 3600 * 1000).toISOString()
  });
}

// Pre-fill 9 Pending/Open Matches (waiting_opponent or pending_confirmation)
for (let i = 1; i <= 9; i++) {
  const teamA = MOCK_ADMIN_TEAMS[Math.floor(Math.random() * 10)];
  const venue = MOCK_ADMIN_VENUES[Math.floor(Math.random() * MOCK_ADMIN_VENUES.length)];
  const isWaiting = i <= 6;

  MOCK_ADMIN_MATCHES.push({
    id: `match_active_${i}`,
    booking_code: `KP-${100000 + Math.floor(Math.random() * 900000)}`,
    teamName: teamA.name,
    team_id: teamA.id,
    pairedWith: !isWaiting ? "FC Hổ Cáp" : "",
    venue: venue.name,
    district: venue.district,
    time: i % 2 === 0 ? "19:00 - 20:30" : "20:30 - 22:00",
    pitchType: i % 3 === 0 ? "Sân 7" : "Sân 5",
    status: isWaiting ? "waiting_opponent" : "pending_confirmation",
    requests: !isWaiting ? [
      { id: `req_join_${i}`, teamName: "FC Hổ Cáp", phone: "0944558899", status: "pending", level: "Khá", companions: 0 }
    ] : [],
    adminContact: teamA.phone,
    price: i % 3 === 0 ? 600000 : 400000,
    created_at: new Date(Date.now() - i * 3 * 3600 * 1000).toISOString()
  });
}

// 8. Event Log System
export const MOCK_ADMIN_EVENTS = [
  { id: "ev_1", event_type: "user_registered", user_id: "u_1", metadata: { name: "Lâm Phủi", phone: "0901122334" }, created_at: "2026-05-28T08:00:00Z" },
  { id: "ev_2", event_type: "team_created", team_id: "t_1", metadata: { name: "FC Anh Em Thủ Đức", owner: "Lâm Phủi" }, created_at: "2026-05-28T09:30:00Z" },
  { id: "ev_3", event_type: "venue_owner_requested", user_id: "u_9", venue_id: "v_win_thuduc", metadata: { venue: "Sân bóng Win Thủ Đức" }, created_at: "2026-05-28T10:00:00Z" },
  { id: "ev_4", event_type: "venue_owner_verified", user_id: "u_9", venue_id: "v_win_thuduc", metadata: { verified_by: "super_admin" }, created_at: "2026-05-28T14:00:00Z" },
  { id: "ev_5", event_type: "slot_created", venue_id: "v_win_thuduc", metadata: { date: "2026-05-30", time: "19:00 - 20:30", size: 7 }, created_at: "2026-05-29T08:15:00Z" },
  { id: "ev_6", event_type: "open_match_created", match_id: "match_active_1", metadata: { teamName: "FC Anh Em Thủ Đức", size: "Sân 7" }, created_at: "2026-05-29T09:00:00Z" },
  { id: "ev_7", event_type: "match_request_sent", match_id: "match_active_1", metadata: { teamName: "FC Hổ Cáp", message: "Xin ghép giao lưu học hỏi" }, created_at: "2026-05-29T10:30:00Z" },
  { id: "ev_8", event_type: "match_request_accepted", match_id: "match_active_1", metadata: { pairedWith: "FC Hổ Cáp" }, created_at: "2026-05-29T11:45:00Z" },
  { id: "ev_9", event_type: "match_confirmed", match_id: "match_active_1", metadata: { bookingCode: "KP-102938" }, created_at: "2026-05-29T11:45:00Z" },
  { id: "ev_10", event_type: "slot_booked", slot_id: "slot_12", metadata: { booked_by: "FC Anh Em Thủ Đức" }, created_at: "2026-05-29T11:45:00Z" },
  { id: "ev_11", event_type: "report_created", match_id: "match_comp_2", metadata: { type: "boom_kèo", reported: "FC Hủy Trận" }, created_at: "2026-05-30T08:00:00Z" },
  { id: "ev_12", event_type: "match_completed", match_id: "match_comp_5", metadata: { scoreA: 5, scoreB: 3 }, created_at: "2026-05-30T09:00:00Z" }
];

// Fill rest of the events up to 30 events
for (let i = 13; i <= 30; i++) {
  const eventTypes = [
    "user_registered", "team_created", "team_join_requested", "slot_created", 
    "slot_booked", "slot_cancelled", "open_match_created", "match_request_sent", 
    "match_confirmed", "match_completed", "match_cancelled", "report_created"
  ];
  const randType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
  MOCK_ADMIN_EVENTS.push({
    id: `ev_${i}`,
    event_type: randType,
    metadata: { info: `Hành động mẫu số ${i} diễn ra tự động.` },
    created_at: new Date(Date.now() - (30 - i) * 2 * 3600 * 1000).toISOString()
  });
}
