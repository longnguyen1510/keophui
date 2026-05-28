const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

code = code.replace(
  `        alert("🔥 Tạo kèo hộ khách thành công! Kèo đã được đăng lên Bảng tin Public.");
        closeModal();
        setCurrentTab("keo");`,
  `        alert("🔥 Tạo kèo hộ khách thành công! Kèo đã được đăng lên Bảng tin Public.");
        closeModal();
        setCurrentTab("owner_ql_san");`
);

code = code.replace(
  `        alert("🏟️ Đăng khung giờ trống thành công! Khách xem và các đội bóng có thể chọn tạo kèo ngay trên slot của bạn.");
        closeModal();
        setCurrentTab("san");`,
  `        alert("🏟️ Đăng khung giờ trống thành công! Khách xem và các đội bóng có thể chọn tạo kèo ngay trên slot của bạn.");
        closeModal();
        setCurrentTab("owner_ql_san");`
);

fs.writeFileSync('src/App.jsx', code);
console.log("Tab redirects fixed");
