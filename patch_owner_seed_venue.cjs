const fs = require('fs');
let code = fs.readFileSync('src/data/seedVenues.js', 'utf8');

const target = `export const SEED_VENUES = [`;
const insert = `export const SEED_VENUES = [
      {
        id: "v_casau",
        owner_user_id: "u_0901111112",
        name: "Sân Cá Sấu Hoa Cà",
        address: "123 Phạm Văn Đồng, Thủ Đức",
        district: "Thủ Đức",
        phone: "0901111112",
        images: "stadium1",
        verification_status: "verified",
        notes: "Sân nhà của chủ tài khoản mặc định."
      },`;

if (code.includes(target) && !code.includes('v_casau')) {
  code = code.replace(target, insert);
  fs.writeFileSync('src/data/seedVenues.js', code);
  console.log("Seeded venue added");
} else {
  console.log("Already seeded or target not found");
}
