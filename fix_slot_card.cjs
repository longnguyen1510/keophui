const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const targetSlotCard = `                          <span className="text-sm font-extrabold text-white">
                            {slot.timeSlot.split(' ')[0] + ' - ' + slot.timeSlot.split(' ')[2]} <span className="text-slate-500 px-1">|</span> {slot.timeSlot.split(' ')[3]}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400">{slot.price} | {slot.pitchType}</span>
                        </div>`;

const replacementSlotCard = `                          <span className="text-sm font-extrabold text-white">
                            {slot.timeSlot.split(' ')[0] + ' - ' + slot.timeSlot.split(' ')[2]} <span className="text-slate-500 px-1">|</span> {slot.timeSlot.split(' ')[3]}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400">{slot.price} | {slot.pitchType}</span>
                          {slot.customerPhone && (
                            <span className="text-[10.5px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 mt-0.5 w-fit">
                              📞 Khách: {slot.customerPhone}
                            </span>
                          )}
                        </div>`;

code = code.replace(targetSlotCard, replacementSlotCard);

fs.writeFileSync('src/App.jsx', code);
console.log("Slot card fixed");
