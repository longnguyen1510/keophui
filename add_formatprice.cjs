const fs = require('fs');

try {
  let code = fs.readFileSync('src/App.jsx', 'utf8');

  // Add formatPrice if it doesn't exist
  if (!code.includes('const formatPrice =')) {
    const insertAfter = `function App() {`;
    const formatPriceFunc = `
const formatPrice = (priceStr) => {
  if (!priceStr) return "Đang cập nhật";
  const num = parseInt(String(priceStr).replace(/\\D/g, ''));
  if (isNaN(num)) return priceStr;
  return num.toLocaleString('vi-VN') + "đ";
};

function App() {`;
    code = code.replace(insertAfter, formatPriceFunc);
    fs.writeFileSync('src/App.jsx', code, 'utf8');
    console.log("Added formatPrice globally.");
  } else {
    console.log("formatPrice already exists.");
  }
} catch(e) {
  console.error(e);
}
