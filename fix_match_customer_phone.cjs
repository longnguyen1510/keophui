const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const targetPhoneRender = `            {/* Note text */}
            <div className="space-y-1 text-left">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">💡 Ghi chú từ chủ kèo:</h4>
              <p className="bg-slate-900/60 p-3 rounded-xl border border-appDark-border/40 text-xs text-slate-300 leading-relaxed italic">
                {match.notes || "Không có ghi chú thêm."}
              </p>
            </div>`;

const replacementPhoneRender = `            {/* Note text */}
            <div className="space-y-1 text-left">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">💡 Ghi chú từ chủ kèo:</h4>
              <p className="bg-slate-900/60 p-3 rounded-xl border border-appDark-border/40 text-xs text-slate-300 leading-relaxed italic">
                {match.notes || "Không có ghi chú thêm."}
              </p>
            </div>
            
            {/* Customer Phone (Owner Only) */}
            {match.customerPhone && (match.author_user_id === currentUser?.id || isOwner) && (
              <div className="space-y-1 text-left animate-fade-in mt-2">
                <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">📞 SĐT KHÁCH YÊU CẦU ĐẶT:</h4>
                <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/30 flex items-center justify-between">
                  <span className="font-bold text-amber-400 tracking-wider text-sm">{match.customerPhone}</span>
                  <a href={\`tel:\${match.customerPhone}\`} className="bg-amber-500 text-slate-900 font-bold text-xs px-3 py-1.5 rounded-lg shadow-md">
                    Gọi Ngay
                  </a>
                </div>
              </div>
            )}`;

code = code.replace(targetPhoneRender, replacementPhoneRender);

fs.writeFileSync('src/App.jsx', code);
console.log("Customer phone render added to MatchSuggestionModal");
