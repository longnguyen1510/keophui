const fs = require('fs');

try {
  let code = fs.readFileSync('src/App.jsx', 'utf8');

  const oldSubmitJoinForm = `      const submitJoinForm = (formData) => {
        const { matchId, name, phone, position, note } = formData;
        
        let waitlistPosition = 0;`;

  const newSubmitJoinForm = `      const submitJoinForm = (formData) => {
        const { matchId, name, phone, position, note } = formData;
        
        // Prevent duplicate requests
        const targetMatch = matches.find(m => m.id === matchId);
        if (targetMatch && targetMatch.requests && targetMatch.requests.some(r => r.phone === phone)) {
          alert("BẠN ĐÃ ĐĂNG KÝ RỒI. HÃY KIỂM TRA TRONG PHẦN KÈO CỦA TÔI NHÉ.");
          return;
        }

        let waitlistPosition = 0;`;

  code = code.replace(oldSubmitJoinForm, newSubmitJoinForm);

  // Check if there are other places where join is requested (e.g., submitReceiveForm for teams)
  // The user said "1 NGƯỜI/SĐT CHỈ ĐƯỢC ẤN ĐKY THAM GIA 1 LẦN ĐỂ TRÁNH BỊ TRÙNG SLOT."
  // So this is for individual players (submitJoinForm). For teams it is submitReceiveForm.
  
  const oldSubmitReceiveForm = `      const submitReceiveForm = (formData) => {
        const myTeam = myManagedTeams.find(t => t.id === formData.teamId);`;

  const newSubmitReceiveForm = `      const submitReceiveForm = (formData) => {
        // Prevent duplicate team requests
        const targetMatch = matches.find(m => m.id === modalData.id);
        if (targetMatch && targetMatch.requests && targetMatch.requests.some(r => r.teamId === formData.teamId)) {
          alert("ĐỘI CỦA BẠN ĐÃ ĐĂNG KÝ NHẬN KÈO NÀY RỒI. HÃY KIỂM TRA TRONG PHẦN KÈO CỦA TÔI NHÉ.");
          return;
        }
        const myTeam = myManagedTeams.find(t => t.id === formData.teamId);`;

  code = code.replace(oldSubmitReceiveForm, newSubmitReceiveForm);

  fs.writeFileSync('src/App.jsx', code, 'utf8');
  console.log("Added duplicate request prevention.");
} catch(e) {
  console.error(e);
}
