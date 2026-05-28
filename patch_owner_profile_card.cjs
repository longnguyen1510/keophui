const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const startMarker = `                  {/* Venue Verification Header */}`;
const endMarker = `                  {/* Settings / Other options */}`;

const startIndex = code.indexOf(startMarker);
if (startIndex !== -1) {
  const endIndex = code.indexOf(endMarker, startIndex);
  if (endIndex !== -1) {
    const newCard = `                  {/* Venue Verification Header */}
                  <div className="bg-appDark-card border border-appDark-border rounded-2xl p-4 shadow-sm flex flex-col gap-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-neon-green/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
                    
                    <div className="flex justify-between items-start relative z-10">
                      <h4 className="text-base font-black text-white flex items-center gap-1.5"><span className="text-xl">🏟️</span> Sân: CÁ SẤU HOA CÀ</h4>
                      <span className="px-2.5 py-1 bg-neon-green/10 border border-neon-green/50 text-neon-green text-[10px] font-extrabold rounded-md shadow-[0_0_8px_rgba(16,185,129,0.15)] flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                        ĐÃ XÁC MINH
                      </span>
                    </div>
                    
                    <div className="space-y-1.5 relative z-10">
                      <p className="text-[11px] text-slate-300 font-medium">
                        <span className="text-slate-500 font-bold w-14 inline-block">Chủ sân:</span> 
                        <span className="font-extrabold text-neon-yellow">{currentUser?.name || "Số 2 (nội bộ)"}</span> <span className="text-slate-400">|</span> {currentUser?.phone || "0901111112"}
                      </p>
                      <p className="text-[11px] text-slate-300 font-medium">
                        <span className="text-slate-500 font-bold w-14 inline-block">Địa chỉ:</span> 
                        123 Phạm Văn Đồng, Thủ Đức (Thủ Đức)
                      </p>
                    </div>
                  </div>

`;
    code = code.substring(0, startIndex) + newCard + code.substring(endIndex);
    fs.writeFileSync('src/App.jsx', code);
    console.log("Card updated successfully");
  } else {
    console.log("End marker not found");
  }
} else {
  console.log("Start marker not found");
}
