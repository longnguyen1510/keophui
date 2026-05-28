const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const targetRenderNotes = `            {/* Note text */}
            {match.notes && (
              <div className="space-y-1 text-left">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">💡 Ghi chú từ chủ kèo:</h4>
                <p className="bg-slate-900/60 p-3 rounded-xl border border-appDark-border/40 text-xs text-slate-300 leading-relaxed italic">
                  {match.notes}
                </p>
              </div>
            )}`;

const replacementRenderNotes = `            {/* Note text */}
            <div className="space-y-1 text-left">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">💡 Ghi chú từ chủ kèo:</h4>
              <p className="bg-slate-900/60 p-3 rounded-xl border border-appDark-border/40 text-xs text-slate-300 leading-relaxed italic">
                {match.notes || "Không có ghi chú thêm."}
              </p>
            </div>`;

code = code.replace(targetRenderNotes, replacementRenderNotes);

fs.writeFileSync('src/App.jsx', code);
console.log("MatchSuggestionModal notes render fixed");
