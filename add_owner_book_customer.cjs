const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Add the component before OwnerCreateMatchModal
const bookCustomerModalCode = `
    function OwnerBookCustomerModal({ currentUser, venues, onClose, onSubmit }) {
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
      const [customerName, setCustomerName] = useState("");
      const [customerPhone, setCustomerPhone] = useState("");
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
          timeSlot: \`\${time} \${finalDate}\`,
          pitchType,
          price: parsedPrice,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
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
                <h3 className="text-lg font-extrabold text-white">💼 Khách Đặt Sân</h3>
                <p className="text-[10px] text-slate-400">Ghi nhận sân đã được khách thuê kín</p>
              </div>
              <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-3">
                <h4 className="text-[11px] font-black text-emerald-500 uppercase tracking-widest border-l-2 border-emerald-500 pl-2">1. Thông tin Khách hàng</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Tên Khách</label>
                    <input type="text" required value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="VD: Anh Tuấn" className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">SĐT Khách</label>
                    <input type="tel" required pattern="[0-9]{10}" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="SĐT khách..." className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500" />
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-[11px] font-black text-cyan-400 uppercase tracking-widest border-l-2 border-cyan-400 pl-2">2. Thông tin Sân</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Ngày</label>
                    <select value={date} onChange={(e) => setDate(e.target.value)} className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400">
                      <option value={(() => { const d=new Date(); return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear(); })()}>Hôm nay</option>
                      <option value={(() => { const d=new Date(); d.setDate(d.getDate()+1); return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear(); })()}>Ngày mai</option>
                      <option value="custom">Ngày khác...</option>
                    </select>
                  </div>
                  {date === "custom" && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400">Chọn Ngày</label>
                      <input type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)} className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400" />
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Khung Giờ</label>
                    <input type="text" required value={time} onChange={(e) => setTime(e.target.value)} placeholder="VD: 19:00 - 20:30" className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Loại Sân</label>
                    <select value={pitchType} onChange={(e) => setPitchType(e.target.value)} className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400">
                      <option value="Sân 5">Sân 5 Người</option>
                      <option value="Sân 7">Sân 7 Người</option>
                      <option value="Sân 11">Sân 11 Người</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Giá Sân (VNĐ)</label>
                    <input type="text" required value={price} onChange={handlePriceFormat} placeholder="VD: 500.000" className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-1 pt-2">
                <label className="text-[10px] font-bold text-slate-400">Ghi chú (Tùy chọn)</label>
                <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="VD: Khách quen, thu cọc 200k..." className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500" />
              </div>

              <button type="submit" className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black py-3 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all">
                Lưu Chốt Sân
              </button>
            </form>
          </div>
        </div>
      );
    }
`;
code = code.replace("function OwnerCreateMatchModal", bookCustomerModalCode + "\n    function OwnerCreateMatchModal");

// 2. Add submit handler
const submitHandlerCode = `
      const submitOwnerBookCustomerForm = (formData) => {
        const newSlot = {
          id: 'slot_' + Date.now(),
          venueName: formData.venueName,
          address: "123 Phạm Văn Đồng, Thủ Đức",
          timeSlot: formData.timeSlot,
          type: 'booked',
          status: 'booked',
          pitchType: formData.pitchType,
          price: formData.price,
          contact: currentUser.phone,
          customerPhone: formData.customerPhone,
          notes: \`Khách: \${formData.customerName} (\${formData.customerPhone}). \${formData.notes}\`,
          owner_user_id: currentUser.id
        };
        setSlots(prev => [newSlot, ...prev]);
        setModalType(null);
        alert(\`✅ Đã ghi nhận sân \${formData.timeSlot} được chốt bởi khách \${formData.customerName}!\`);
      };
`;
code = code.replace("const submitOwnerCreateMatchForm = (formData) => {", submitHandlerCode + "\n      const submitOwnerCreateMatchForm = (formData) => {");

// 3. Render Modal
const renderModalCode = `
            {modalType === 'owner_book_customer' && (
              <OwnerBookCustomerModal 
                currentUser={currentUser}
                venues={venues}
                onClose={closeModal} 
                onSubmit={submitOwnerBookCustomerForm}
              />
            )}
`;
code = code.replace("{modalType === 'owner_create_match' && (", renderModalCode + "\n            {modalType === 'owner_create_match' && (");

// 4. Update the layout in Booking tab to grid-cols-3 and add the button
const targetGrid = `                  {/* Main Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => triggerActionWithAuth('create_slot')} className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-[11px] rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all active:scale-95 flex flex-col items-center justify-center gap-1 leading-tight">
                      <span className="text-xl">🏟️</span> 
                      <span>Đăng Sân Trống</span>
                    </button>
                    <button onClick={() => triggerActionWithAuth('owner_create_match')} className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold text-[11px] rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all active:scale-95 flex flex-col items-center justify-center gap-1 leading-tight">
                      <span className="text-xl">🔥</span> 
                      <span>Đăng Kèo Tìm Đối</span>
                    </button>
                  </div>`;

const replacementGrid = `                  {/* Main Action Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => triggerActionWithAuth('create_slot')} className="w-full py-3 px-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-[10px] rounded-xl shadow-[0_0_10px_rgba(34,211,238,0.3)] transition-all active:scale-95 flex flex-col items-center justify-center gap-1 leading-tight text-center">
                      <span className="text-lg">🏟️</span> 
                      <span>Sân Trống</span>
                    </button>
                    <button onClick={() => triggerActionWithAuth('owner_create_match')} className="w-full py-3 px-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold text-[10px] rounded-xl shadow-[0_0_10px_rgba(245,158,11,0.3)] transition-all active:scale-95 flex flex-col items-center justify-center gap-1 leading-tight text-center">
                      <span className="text-lg">🔥</span> 
                      <span>Tìm Đối</span>
                    </button>
                    <button onClick={() => triggerActionWithAuth('owner_book_customer')} className="w-full py-3 px-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-[10px] rounded-xl shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all active:scale-95 flex flex-col items-center justify-center gap-1 leading-tight text-center">
                      <span className="text-lg">💼</span> 
                      <span>Khách Đặt</span>
                    </button>
                  </div>`;

code = code.replace(targetGrid, replacementGrid);

fs.writeFileSync('src/App.jsx', code);
console.log("Khách Đặt Sân button and modal added");
