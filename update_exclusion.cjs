const fs = require('fs');

try {
  let code = fs.readFileSync('src/App.jsx', 'utf8');

  // Remove expired from the exclusion so it stays on the board (and gets dimmed)
  const oldExclusion = `          // Exclude expired or cancelled matches from general list
          if (match.status === 'expired' || match.status === 'cancelled' || match.status === 'Đã hủy') return false;`;

  const newExclusion = `          // Exclude cancelled matches from general list (expired matches stay to show as dimmed)
          if (match.status === 'cancelled' || match.status === 'Đã hủy') return false;`;

  code = code.replace(oldExclusion, newExclusion);
  fs.writeFileSync('src/App.jsx', code, 'utf8');
  console.log("Updated exclusion logic.");
} catch(e) {
  console.error(e);
}
