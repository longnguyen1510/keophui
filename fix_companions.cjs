const fs = require('fs');

try {
  let code = fs.readFileSync('src/App.jsx', 'utf8');

  // 1. JoinFormModal updates
  const oldJoinFormUI = `<div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Vị trí ưu thích đá</label>`;
  const newJoinFormUI = `<div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">+ Thêm người đi cùng</label>
                <div className="flex items-center gap-3 bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2">
                  <button type="button" onClick={() => setCompanions(Math.max(0, companions - 1))} className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-white hover:bg-slate-700 transition-colors font-bold text-lg">-</button>
                  <span className="flex-1 text-center font-bold text-white text-sm">{companions} người</span>
                  <button type="button" onClick={() => setCompanions(companions + 1)} className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-white hover:bg-slate-700 transition-colors font-bold text-lg">+</button>
                </div>
                <p className="text-[9px] text-slate-500 italic">Hệ thống sẽ tính tổng là {1 + companions} người đăng ký.</p>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Vị trí ưu thích đá</label>`;
  code = code.replace(oldJoinFormUI, newJoinFormUI);

  const oldJoinFormStates = `const [position, setPosition] = useState("Tự do");
      const [note, setNote] = useState("");`;
  const newJoinFormStates = `const [position, setPosition] = useState("Tự do");
      const [note, setNote] = useState("");
      const [companions, setCompanions] = useState(0);`;
  code = code.replace(oldJoinFormStates, newJoinFormStates);

  const oldJoinFormSubmit = `onSubmit({
          matchId: match.id,
          name,
          phone,
          position,
          note
        });`;
  const newJoinFormSubmit = `onSubmit({
          matchId: match.id,
          name,
          phone,
          position,
          note,
          companions
        });`;
  code = code.replace(oldJoinFormSubmit, newJoinFormSubmit);

  // 2. submitJoinForm updates
  const oldSubmitJoinExt = `const { matchId, name, phone, position, note } = formData;`;
  const newSubmitJoinExt = `const { matchId, name, phone, position, note, companions } = formData;`;
  code = code.replace(oldSubmitJoinExt, newSubmitJoinExt);

  const oldSubmitJoinReq = `note: note || "Giao lưu vui vẻ xả stress cùng anh em!",
                status: statusVal,`;
  const newSubmitJoinReq = `note: note || "Giao lưu vui vẻ xả stress cùng anh em!",
                companions: companions || 0,
                status: statusVal,`;
  code = code.replace(oldSubmitJoinReq, newSubmitJoinReq);

  const oldSubmitJoinNoti = `title: \`👤 \${currentUser.name} vừa xin tham gia trận đấu của bạn vào lúc \${match.time.split(' ')[0]}. Hãy duyệt ngay!\`,`;
  const newSubmitJoinNoti = `title: \`👤 \${currentUser.name} \${companions > 0 ? '(+ ' + companions + ' người) ' : ''}vừa xin tham gia trận đấu của bạn vào lúc \${match.time.split(' ')[0]}. Hãy duyệt ngay!\`,`;
  code = code.replace(oldSubmitJoinNoti, newSubmitJoinNoti);

  // 3. acceptedCount replacements globally
  const countReducer = `.reduce((sum, r) => sum + 1 + (parseInt(r.companions) || 0), 0)`;
  
  // Replaces occurrences of `.filter(...).length` with `.filter(...).reduce(...)`
  code = code.replace(/updatedRequests\.filter\(r => r\.status === 'accepted'\)\.length/g, `updatedRequests.filter(r => r.status === 'accepted')${countReducer}`);
  code = code.replace(/\(m\.requests \|\| \[\]\)\.filter\(r => r\.status === 'accepted'\)\.length/g, `(m.requests || []).filter(r => r.status === 'accepted')${countReducer}`);
  code = code.replace(/\(match\.requests \|\| \[\]\)\.filter\(r => r\.status === 'accepted'\)\.length/g, `(match.requests || []).filter(r => r.status === 'accepted')${countReducer}`);
  code = code.replace(/acceptedRequests\.length/g, `acceptedRequests${countReducer}`);

  // 4. handleRequestAction validation
  const oldActionCheck = `if (acceptedCount >= maxCount) {
                alert("🚫 Trận đấu đã nhận đủ người! Không thể đồng ý thêm cầu thủ chính thức. Vui lòng chuyển sang danh sách dự bị (Waitlist).");
                return m;
              }`;
  const newActionCheck = `const reqToAccept = updatedRequests.find(r => r.id === requestId);
              const totalNeeded = reqToAccept ? 1 + (parseInt(reqToAccept.companions) || 0) : 1;
              if (acceptedCount + totalNeeded > maxCount) {
                alert(\`🚫 Trận đấu chỉ còn \${maxCount - acceptedCount} slot, nhưng người chơi này cần tới \${totalNeeded} slot! Không thể đồng ý.\`);
                return m;
              }`;
  code = code.replace(oldActionCheck, newActionCheck);

  // 5. Update UI in BẢNG DUYỆT CẦU LẺ
  const oldReqName = `<span className="font-extrabold text-xs text-white">{req.name}</span>`;
  const newReqName = `<span className="font-extrabold text-xs text-white">{req.name} {req.companions > 0 && <span className="text-neon-green ml-1">(+ {req.companions} người)</span>}</span>`;
  code = code.replace(oldReqName, newReqName);

  fs.writeFileSync('src/App.jsx', code, 'utf8');
  console.log("Companions feature implemented.");
} catch(e) {
  console.error(e);
}
