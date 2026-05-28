const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const newModal = `
    // 18. OWNER CREATE MATCH MODAL (CHỦ SÂN ĐĂNG KÈO TÌM ĐỐI)
    function OwnerCreateMatchModal({ currentUser, venues, onClose, onSubmit }) {
      const myVenue = venues.find(v => v.phone === currentUser.phone || v.owner_user_id === currentUser.id);
      
      const [date, setDate] = useState(() => {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return \`\${day}/\${m}/\${y}\`;
      });
      const [customDate, setCustomDate] = useState("");
      
      const [time, setTime] = useState("19:00 - 20:30");
      const [pitchType, setPitchType] = useState("Sân 5");
      const [price, setPrice] = useState("");
      const [contact, setContact] = useState(currentUser?.phone || "");
      
      const [teamName, setTeamName] = useState("");
      const [level, setLevel] = useState("Vui vẻ mồ hôi");
      const [notes, setNotes] = useState("");

      const handleFormSubmit = (e) => {
        e.preventDefault();
        
        let finalDate = date;
        if (date === "custom") {
          if (!customDate) return alert("Vui lòng chọn ngày!");
          const [yr, mn, dy] = customDate.split("-");
          finalDate = \`\${dy}/\${mn}/\${yr}\`;
        }

        if (!price || isNaN(price.replace(/\\D/g, ''))) return alert("Vui lòng nhập giá thuê hợp lệ!");

        const parsedPrice = parseInt(price.replace(/\\D/g, ''));

        onSubmit({
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
        });
      };

      const handlePriceFormat = (e) => {
        const rawValue = e.target.value.replace(/\\D/g, '');
        if (!rawValue) {
          setPrice('');
          return;
        }
        const formatted = parseInt(rawValue).toLocaleString('vi-VN');
        setPrice(formatted);
      };

      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in px-4">
          <div className="absolute inset-0" onClick={onClose}></div>
          <div className="w-full max-w-md bg-appDark-bg border border-appDark-border rounded-2xl p-5 space-y-4 relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
            
            <div className="flex justify-between items-center border-b border-appDark-border pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-white">🔥 Đăng Kèo Tìm Đối</h3>
                <p className="text-[10px] text-slate-400">Tạo slot & đăng kèo hộ đội bóng</p>
              </div>
              <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-3">
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
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-[11px] font-black text-cyan-400 uppercase tracking-widest border-l-2 border-cyan-400 pl-2">2. Thông tin Khung giờ (Sân)</h4>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Ngày Đá</label>
                    <select value={date} onChange={e => setDate(e.target.value)} className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-2 py-2 text-white">
                      <option value={() => { const d=new Date(); return \`\${String(d.getDate()).padStart(2,'0')}/\${String(d.getMonth()+1).padStart(2,'0')}/\${d.getFullYear()}\`; }()}>Hôm nay</option>
                      <option value={() => { const d=new Date(); d.setDate(d.getDate()+1); return \`\${String(d.getDate()).padStart(2,'0')}/\${String(d.getMonth()+1).padStart(2,'0')}/\${d.getFullYear()}\`; }()}>Ngày mai</option>
                      <option value="custom">Tuỳ chọn...</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Giá Thuê (VNĐ)</label>
                    <input type="text" required value={price} onChange={handlePriceFormat} placeholder="Ví dụ: 350.000" className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-2 py-2 text-white" />
                  </div>
                </div>

                {date === "custom" && (
                  <div className="space-y-1 animate-fade-in">
                    <label className="text-[10px] font-bold text-cyan-400">Chọn ngày từ lịch</label>
                    <input type="date" required value={customDate} onChange={e => setCustomDate(e.target.value)} className="w-full text-xs font-semibold bg-appDark-deep border border-cyan-400 rounded-xl px-3 py-2 text-white" />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">Loại Sân</label>
                  <select value={pitchType} onChange={e => setPitchType(e.target.value)} className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2 text-white">
                    <option value="Sân 5">Sân 5 người</option>
                    <option value="Sân 7">Sân 7 người</option>
                    <option value="Sân 11">Sân 11 người</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">Khung Giờ</label>
                  <input type="text" required value={time} onChange={e => setTime(e.target.value)} placeholder="Nhập giờ..." className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2 text-white mb-1" />
                  <div className="flex flex-wrap gap-1 mt-1">
                    {["17:30 - 19:00", "19:00 - 20:30", "20:30 - 22:00"].map(t => (
                      <button key={t} type="button" onClick={() => setTime(t)} className="text-[9px] font-bold bg-appDark-deep hover:bg-cyan-500/20 text-slate-300 hover:text-white px-2 py-0.5 rounded border border-appDark-border/60 hover:border-cyan-500/40">
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <label className="text-[10px] font-bold text-slate-400">Lời Nhắn Tìm Đối (Tùy chọn)</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ví dụ: Đội đá giao lưu vui vẻ, chia tiền sân 50/50..." className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2 text-white focus:border-amber-500 h-16 resize-none" />
                </div>
              </div>

              <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black text-sm rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.4)] active:scale-95 transition-all">
                🚀 ĐĂNG KÈO LÊN BẢNG TIN
              </button>
            </form>
          </div>
        </div>
      );
    }
`;

const insertMarker = `    function VenueRegModal({ currentUser, onClose, onSubmit }) {`;

if (code.includes(insertMarker)) {
  code = code.replace(insertMarker, newModal + "\n" + insertMarker);
  fs.writeFileSync('src/App.jsx', code);
  console.log("Component injected successfully.");
} else {
  console.log("Error: insertMarker not found");
}
