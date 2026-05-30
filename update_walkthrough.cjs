const fs = require('fs');

const wPath = '/Users/macbook/.gemini/antigravity/brain/52df2e17-5a75-4819-aafa-240b559429cb/artifacts/walkthrough.md';
let wContent = fs.readFileSync(wPath, 'utf8');

wContent += `\n\n---\n\n## 🛠️ 5. KHÔI PHỤC THÀNH CÔNG DỮ LIỆU BỊ XÓA\n`;
wContent += `Sự cố mất dữ liệu 3 tab (Tổng Quan, QL Kèo, QL User) đã được khắc phục hoàn toàn. Toàn bộ mã nguồn đã được khôi phục, biên dịch lại thành công và hoạt động đồng bộ với tính năng QL Sân mới nhất.\n`;

fs.writeFileSync(wPath, wContent, 'utf8');
