const fs = require('fs');

try {
  let code = fs.readFileSync('src/App.jsx', 'utf8');

  // 1. Replace QUICK ACTIONS
  const quickActionsStart = code.indexOf('{/* QUICK ACTIONS */}');
  const quickActionsEndStr = '{/* TEAM MEMBERSHIP & MANAGEMENT PANEL */}';
  
  const quickActionsEnd = code.indexOf(quickActionsEndStr);
  
  if (quickActionsStart !== -1 && quickActionsEnd !== -1) {
    const newTabsHtml = `                    {/* PROFILE MAIN TABS */}
                    <div className="flex gap-1 mt-2 relative z-10 px-1">
                      <button 
                        onClick={() => setProfileMatchTab('team')} 
                        className={\`flex-1 py-3 font-extrabold text-[11px] uppercase rounded-t-xl transition-all \${profileMatchTab === 'team' ? 'bg-appDark-card border-t border-l border-r border-appDark-border text-white shadow-[0_-4px_10px_rgba(0,0,0,0.2)]' : 'bg-appDark-deep/50 text-slate-400 border-b border-appDark-border hover:bg-appDark-deep'}\`}
                      >
                        Đội Của Tôi
                      </button>
                      <button 
                        onClick={() => setProfileMatchTab('upcoming')} 
                        className={\`flex-1 py-3 font-extrabold text-[11px] uppercase rounded-t-xl transition-all \${profileMatchTab === 'upcoming' ? 'bg-appDark-card border-t border-l border-r border-appDark-border text-white shadow-[0_-4px_10px_rgba(0,0,0,0.2)]' : 'bg-appDark-deep/50 text-slate-400 border-b border-appDark-border hover:bg-appDark-deep'}\`}
                      >
                        Kèo Của Tôi
                      </button>
                      <button 
                        onClick={() => setProfileMatchTab('history')} 
                        className={\`flex-1 py-3 font-extrabold text-[11px] uppercase rounded-t-xl transition-all \${profileMatchTab === 'history' ? 'bg-appDark-card border-t border-l border-r border-appDark-border text-white shadow-[0_-4px_10px_rgba(0,0,0,0.2)]' : 'bg-appDark-deep/50 text-slate-400 border-b border-appDark-border hover:bg-appDark-deep'}\`}
                      >
                        Lịch Sử
                      </button>
                    </div>
                    
                    {profileMatchTab === 'team' && (
                    <div className="bg-appDark-card border border-appDark-border rounded-b-2xl rounded-tr-2xl p-4 space-y-4 shadow-md -mt-px relative z-0">
                      {/* TEAM MEMBERSHIP & MANAGEMENT PANEL */}`;
    
    code = code.substring(0, quickActionsStart) + newTabsHtml + code.substring(quickActionsEnd + quickActionsEndStr.length);
    console.log("Replaced QUICK ACTIONS!");
  } else {
    console.log("Could not find QUICK ACTIONS boundaries.");
  }

  fs.writeFileSync('src/App.jsx', code, 'utf8');
} catch(e) {
  console.error(e);
}
