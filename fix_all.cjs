const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// FIX 1: ownerDashboardData Date filtering logic
const targetFilter = `          let dateMatches = false;
          if (activeDateFilter === "Tất cả") {
            dateMatches = true;
          } else if (activeDateFilter === "Tuỳ chọn thời gian" || activeDateFilter === "Tuỳ chọn") {
            if (!activeCustomDate) {
              dateMatches = true;
            } else {
              const [yr, mn, dy] = activeCustomDate.split("-");
              const formattedCustom = \`\${dy}/\${mn}/\${yr}\`;
              dateMatches = (slotDate === formattedCustom);
            }
          } else {
            dateMatches = (slotDate === activeDateFilter);
          }`;

const replacementFilter = `          let dateMatches = false;
          if (activeDateFilter === "Tất cả") {
            dateMatches = true;
          } else if (activeDateFilter === "Tuỳ chọn thời gian" || activeDateFilter === "Tuỳ chọn") {
            if (!activeCustomDate) {
              dateMatches = true;
            } else {
              const [yr, mn, dy] = activeCustomDate.split("-");
              const formattedCustom = \`\${dy}/\${mn}/\${yr}\`;
              dateMatches = (slotDate === formattedCustom);
            }
          } else if (activeDateFilter === "Hôm nay") {
            const todayStr = (() => { const d=new Date(); return String(d.getDate()).padStart(2,'0') + '/' + String(d.getMonth()+1).padStart(2,'0') + '/' + d.getFullYear(); })();
            dateMatches = (slotDate === todayStr);
          } else if (activeDateFilter === "Ngày mai") {
            const tmrStr = (() => { const d=new Date(); d.setDate(d.getDate()+1); return String(d.getDate()).padStart(2,'0') + '/' + String(d.getMonth()+1).padStart(2,'0') + '/' + d.getFullYear(); })();
            dateMatches = (slotDate === tmrStr);
          } else {
            dateMatches = (slotDate === activeDateFilter);
          }`;

code = code.replace(targetFilter, replacementFilter);

// FIX 2, 3, 4: Owner Booking Tab UI
// Target 1: Delete select filters
const targetSelects = `                  {/* Filters */}
                  <div className="flex justify-between items-end pt-2">
                    <h4 className="text-[11px] font-black text-slate-300 uppercase tracking-widest">Khung giờ đã đăng ({slots.filter(s => s.contact === currentUser?.phone).length + matches.filter(m => m.status === 'Đã chốt kèo' && m.phone === currentUser?.phone).length})</h4>
                    <div className="flex gap-2">
                      <select className="bg-appDark-card border border-appDark-border text-slate-300 text-[9px] font-bold rounded p-1 focus:outline-none focus:border-cyan-500">
                        <option>Trạng thái</option>
                      </select>
                      <select className="bg-appDark-card border border-appDark-border text-slate-300 text-[9px] font-bold rounded p-1 focus:outline-none focus:border-cyan-500">
                        <option>Loại sân</option>
                      </select>
                    </div>
                  </div>`;

const replacementSelects = `                  {/* List Header */}
                  <div className="flex justify-between items-end pt-2">
                    <h4 className="text-[11px] font-black text-slate-300 uppercase tracking-widest">Khung giờ đã đăng ({slots.filter(s => s.contact === currentUser?.phone).length + matches.filter(m => m.status === 'Đã chốt kèo' && m.phone === currentUser?.phone).length})</h4>
                  </div>`;

code = code.replace(targetSelects, replacementSelects);

// Target 2: Time split & Status text
const targetSlotCard = `                        <div className="flex flex-col gap-1.5">
                          <span className="text-sm font-extrabold text-white">{slot.timeSlot}</span>
                          <span className="text-[10px] font-semibold text-slate-400">{slot.price} | {slot.pitchType}</span>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          {slot.status === 'on_hold' ? (
                            <span className="px-3 py-1 border border-amber-500/50 text-amber-400 text-[9px] font-extrabold rounded-md shadow-[0_0_8px_rgba(245,158,11,0.15)]">GIỮ CHỖ (40p)</span>
                          ) : (
                            <span className="px-3 py-1 border border-cyan-500/50 text-cyan-400 text-[9px] font-extrabold rounded-md shadow-[0_0_8px_rgba(34,211,238,0.15)]">ĐANG TRỐNG</span>
                          )}`;

const replacementSlotCard = `                        <div className="flex flex-col gap-1.5">
                          <span className="text-sm font-extrabold text-white">
                            {slot.timeSlot.split(' ')[0] + ' - ' + slot.timeSlot.split(' ')[2]} <span className="text-slate-500 px-1">|</span> {slot.timeSlot.split(' ')[3]}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400">{slot.price} | {slot.pitchType}</span>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          {slot.status === 'on_hold' ? (
                            <span className="px-3 py-1 border border-amber-500/50 text-amber-400 text-[9px] font-extrabold rounded-md shadow-[0_0_8px_rgba(245,158,11,0.15)]">ĐANG TÌM ĐỐI</span>
                          ) : (
                            <span className="px-3 py-1 border border-cyan-500/50 text-cyan-400 text-[9px] font-extrabold rounded-md shadow-[0_0_8px_rgba(34,211,238,0.15)]">ĐANG TRỐNG</span>
                          )}`;

code = code.replace(targetSlotCard, replacementSlotCard);


fs.writeFileSync('src/App.jsx', code);
console.log("Fixes applied successfully");
