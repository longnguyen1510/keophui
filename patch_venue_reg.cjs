const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Add fields to VenueRegModal
const uiTarget = `<div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 block uppercase">Địa chỉ cụ thể</label>
              <input type="text" name="address" required placeholder="Địa chỉ chính xác..." className="w-full text-xs bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-neon-green" />
            </div>`;

const uiReplacement = `<div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 block uppercase">Địa chỉ cụ thể</label>
              <input type="text" name="address" required placeholder="Địa chỉ chính xác..." className="w-full text-xs bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-neon-green" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 block uppercase">SỐ LƯỢNG SÂN ĐANG SỞ HỮU</label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400">Sân 5</span>
                  <input type="number" min="0" name="cap5" defaultValue="0" className="w-full text-xs bg-appDark-deep border border-appDark-border rounded-lg px-2 py-2 text-white focus:outline-none focus:border-neon-green text-center" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Sân 7</span>
                  <input type="number" min="0" name="cap7" defaultValue="0" className="w-full text-xs bg-appDark-deep border border-appDark-border rounded-lg px-2 py-2 text-white focus:outline-none focus:border-neon-green text-center" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Sân 11</span>
                  <input type="number" min="0" name="cap11" defaultValue="0" className="w-full text-xs bg-appDark-deep border border-appDark-border rounded-lg px-2 py-2 text-white focus:outline-none focus:border-neon-green text-center" />
                </div>
              </div>
            </div>`;

code = code.replace(uiTarget, uiReplacement);

// 2. Update submitVenueRegistration
const submitTarget = `const notesVal = e.target.elements.venueNotes.value.trim();

        const newVenue = {
          id: "v_" + Date.now(),
          owner_user_id: currentUser.id,
          name: nameVal,
          address: addressVal,
          district: districtVal,
          phone: phoneVal,
          verification_status: "pending_verification",
          notes: notesVal || "Sân cỏ nhân tạo chất lượng tốt."
        };`;

const submitReplacement = `const notesVal = e.target.elements.venueNotes.value.trim();
        const cap5 = parseInt(e.target.elements.cap5.value) || 0;
        const cap7 = parseInt(e.target.elements.cap7.value) || 0;
        const cap11 = parseInt(e.target.elements.cap11.value) || 0;

        const newVenue = {
          id: "v_" + Date.now(),
          owner_user_id: currentUser.id,
          name: nameVal,
          address: addressVal,
          district: districtVal,
          phone: phoneVal,
          verification_status: "pending_verification",
          notes: notesVal || "Sân cỏ nhân tạo chất lượng tốt.",
          capacities: {
            '5': cap5,
            '7': cap7,
            '11': cap11
          }
        };`;

code = code.replace(submitTarget, submitReplacement);

fs.writeFileSync('src/App.jsx', code);
console.log("Venue reg patched");
