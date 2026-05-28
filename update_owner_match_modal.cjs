const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const target1 = `      const [teamName, setTeamName] = useState("");
      const [level, setLevel] = useState("Vui vẻ mồ hôi");
      const [notes, setNotes] = useState("");`;

const replacement1 = `      const [teamName, setTeamName] = useState("");
      const [customerPhone, setCustomerPhone] = useState("");
      const [level, setLevel] = useState("Trung bình");
      const [notes, setNotes] = useState("");`;

code = code.replace(target1, replacement1);

const target2 = `        onSubmit({
          venueName: myVenue?.name || "Sân chưa xác định",
          district: "Thủ Đức",
          address: "123 Phạm Văn Đồng, Thủ Đức",
          time,
          date: finalDate,
          pitchType,
          price: parsedPrice,
          contact,
          teamName: teamName.trim(),
          level,
          notes: notes.trim()
        });`;

const replacement2 = `        onSubmit({
          venueName: myVenue?.name || "Sân chưa xác định",
          district: "Thủ Đức",
          address: "123 Phạm Văn Đồng, Thủ Đức",
          time,
          date: finalDate,
          pitchType,
          price: parsedPrice,
          contact,
          teamName: teamName.trim(),
          customerPhone: customerPhone.trim(),
          level,
          notes: notes.trim()
        });`;

code = code.replace(target2, replacement2);

const target3 = `              <div className="space-y-3">
                <h4 className="text-[11px] font-black text-amber-500 uppercase tracking-widest border-l-2 border-amber-500 pl-2">1. Thông tin Đội bóng</h4>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">Tên Đội Cần Tìm Đối</label>
                  <input type="text" required value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="VD: FC Gà Mờ" className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">Trình Độ Yêu Cầu</label>
                  <select value={level} onChange={e => setLevel(e.target.value)} className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500">
                    <option>Vui vẻ mồ hôi</option>
                    <option>Trung bình / Khá</option>
                    <option>Đá tốt / Chuyên nghiệp</option>
                  </select>
                </div>
              </div>`;

const replacement3 = `              <div className="space-y-3">
                <h4 className="text-[11px] font-black text-amber-500 uppercase tracking-widest border-l-2 border-amber-500 pl-2">1. Thông tin Đội bóng</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Tên Đội Cần Tìm Đối</label>
                    <input type="text" required value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="VD: FC Gà Mờ" className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">SĐT Đội Khách</label>
                    <input type="tel" required pattern="[0-9]{10}" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="SĐT khách..." className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">Trình Độ Yêu Cầu</label>
                  <select value={level} onChange={e => setLevel(e.target.value)} className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500">
                    <option value="Yếu">Yếu - đá chơi vui vẻ</option>
                    <option value="Trung bình">Trung bình - giao lưu nhẹ nhàng</option>
                    <option value="Khá">Khá - đá nhiệt tình</option>
                    <option value="Mạnh">Mạnh - đá căng hết sức</option>
                  </select>
                </div>
              </div>`;

code = code.replace(target3, replacement3);

const target4 = `          notes: "Chủ sân tạo kèo cho đội khách.",
          status: 'on_hold' // since it is linked to a match waiting for opponent
        };

        // 2. Create Match
        const newMatch = {
          id: 'KP' + Math.floor(Math.random() * 100000),
          teamName: formData.teamName,
          pairedWith: null,
          time: newSlot.timeSlot,
          venue: newSlot.venueName,
          venue_slot_id: newSlotId,
          phone: currentUser.phone,
          status: "Cần đối",
          level: formData.level,
          fee: newSlot.price,
          type: "Tìm đối",
          author_user_id: currentUser.id,
          avatar: "https://ui-avatars.com/api/?name=" + encodeURIComponent(formData.teamName) + "&background=random",
          notes: formData.notes
        };`;

const replacement4 = `          notes: \`SĐT Khách: \${formData.customerPhone}\`,
          status: 'on_hold' // since it is linked to a match waiting for opponent
        };

        // 2. Create Match
        const newMatch = {
          id: 'KP' + Math.floor(Math.random() * 100000),
          teamName: formData.teamName,
          pairedWith: null,
          time: newSlot.timeSlot,
          venue: newSlot.venueName,
          venue_slot_id: newSlotId,
          phone: currentUser.phone, // Kèo public vẫn dùng sđt chủ sân để liên hệ
          status: "Cần đối",
          level: formData.level,
          fee: newSlot.price,
          type: "Tìm đối",
          author_user_id: currentUser.id,
          avatar: "https://ui-avatars.com/api/?name=" + encodeURIComponent(formData.teamName) + "&background=random",
          notes: \`SĐT Khách: \${formData.customerPhone}. \${formData.notes}\`
        };`;

code = code.replace(target4, replacement4);

fs.writeFileSync('src/App.jsx', code);
console.log("Updated Match Modal with Phone and Levels");
