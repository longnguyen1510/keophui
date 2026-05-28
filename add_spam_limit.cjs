const fs = require('fs');

try {
  let code = fs.readFileSync('src/App.jsx', 'utf8');

  const checkLogic = `
        const activeMatchesCount = matches.filter(m => ((currentUser.createdMatchIds || []).includes(m.id) || m.adminContact === currentUser.phone) && !['completed', 'cancelled', 'rejected'].includes(m.status)).length;
        if (activeMatchesCount >= 3) {
          alert('🚫 GIỚI HẠN TẠO KÈO\\n\\nBạn chỉ được phép mở tối đa 3 kèo cùng lúc. Vui lòng hoàn thành hoặc hủy các kèo hiện tại trước khi tạo mới.');
          return;
        }
`;

  // 1. submitCreateMatchFromSlot
  const func1Start = code.indexOf('const submitCreateMatchFromSlot = (formData) => {');
  if (func1Start !== -1) {
    const insertPos = code.indexOf('{', func1Start) + 1;
    code = code.substring(0, insertPos) + checkLogic + code.substring(insertPos);
  }

  // 2. submitCreateMissingPlayerForm
  const func2Start = code.indexOf('const submitCreateMissingPlayerForm = (formData) => {');
  if (func2Start !== -1) {
    const insertPos = code.indexOf('{', func2Start) + 1;
    code = code.substring(0, insertPos) + checkLogic + code.substring(insertPos);
  }

  // 3. submitInviteFriendly
  const func3Start = code.indexOf('const submitInviteFriendly = (formData) => {');
  if (func3Start !== -1) {
    const insertPos = code.indexOf('{', func3Start) + 1;
    code = code.substring(0, insertPos) + checkLogic + code.substring(insertPos);
  }

  fs.writeFileSync('src/App.jsx', code, 'utf8');
  console.log("Added anti-spam limits.");

} catch(e) {
  console.error(e);
}
