const fs = require('fs');

try {
  let code = fs.readFileSync('src/App.jsx', 'utf8');

  code = code.replace(
    `            {/* OWNER ATTENDANCE PANEL */}
            {isOwner && isAttendanceTime && attendanceRequests.length > 0 && (`,
    `            {/* OWNER ATTENDANCE PANEL */}
            {isOwner && attendanceRequests.length > 0 && (`
  );

  fs.writeFileSync('src/App.jsx', code, 'utf8');
  console.log("Removed attendance time restriction.");
} catch(e) {
  console.error(e);
}
