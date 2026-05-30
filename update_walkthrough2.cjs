const fs = require('fs');

const wPath = '/Users/macbook/.gemini/antigravity/brain/52df2e17-5a75-4819-aafa-240b559429cb/artifacts/walkthrough.md';
let wContent = fs.readFileSync(wPath, 'utf8');

wContent += `\n\n---\n\n## 🚀 6. NÂNG CẤP TAB QL USER THÀNH DASHBOARD ĐA NĂNG\n`;
wContent += `Dựa trên yêu cầu tùy chỉnh mới nhất, Tab **QL USER** đã được thiết kế lại thành một "Trung tâm Quản trị" gồm 4 phân hệ chính, kiểm soát nội bộ bằng thanh Sub-navigation:\n`;
wContent += `- **KPI & Dashboard**: Hiển thị tổng quan số lượng User Active, Đội Bóng, Chủ Sân.\n`;
wContent += `- **👥 Danh Sách User**: Hỗ trợ bộ lọc tìm kiếm, gán/thu hồi đa vai trò (Super Admin, Team Owner, Venue Owner, Player) và tính năng khóa/mở khóa tài khoản.\n`;
wContent += `- **🛡️ Danh Sách Đội Bóng**: Quản lý chi tiết Đội bóng, cấp tích xanh xác minh (Verify) và huy hiệu uy tín.\n`;
wContent += `- **🔥 Top Hoạt Động (Leaderboard)**: Tôn vinh các Đội tạo kèo, nhận kèo và có đánh giá cao nhất.\n`;
wContent += `- **🚨 Vi Phạm (Danh Sách Đen)**: Xử lý các cá nhân, tổ chức có hành vi tiêu cực như Boom kèo, Spam.\n`;

fs.writeFileSync(wPath, wContent, 'utf8');
