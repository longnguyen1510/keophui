const fs = require('fs');

try {
  let code = fs.readFileSync('src/App.jsx', 'utf8');

  // 1. Change default state
  code = code.replace('useState("upcoming");', 'useState("team");');

  // 2. Replace QUICK ACTIONS
  const quickActionsStart = code.indexOf('{/* QUICK ACTIONS */}');
  const quickActionsEndStr = '                    </div>\n\n\n                    \n                    <div className="bg-appDark-card border border-appDark-border rounded-2xl p-4 space-y-4 shadow-md">\n                      <div className="flex justify-between items-center">\n                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">\n                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>\n                          QUẢN LÝ ĐỘI BÓNG CỦA BẠN';
  
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
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                          QUẢN LÝ ĐỘI BÓNG CỦA BẠN`;
    
    code = code.substring(0, quickActionsStart) + newTabsHtml + code.substring(quickActionsEnd + quickActionsEndStr.length);
  } else {
    console.log("Could not find QUICK ACTIONS");
  }

  // 3. Remove inner tabs
  const tabsStart = code.indexOf('{/* DANG SACH KEO (TABS) */}');
  const tabsEnd = code.indexOf('{profileMatchTab === \'upcoming\' ? (');
  
  if (tabsStart !== -1 && tabsEnd !== -1) {
    const endOfTeamHtml = `                    </div>
                    )}

                    {profileMatchTab === 'upcoming' && (
                    <div className="bg-appDark-card border border-appDark-border rounded-b-2xl rounded-tl-2xl p-4 space-y-4 shadow-md -mt-px relative z-0">
`;
    code = code.substring(0, tabsStart) + endOfTeamHtml + code.substring(tabsEnd + "{profileMatchTab === 'upcoming' ? (".length);
  } else {
    console.log("Could not find inner tabs");
  }

  // 4. Change history split
  const historySplitStart = code.indexOf(') : (');
  const historySplitStr = `                        </div>
                      ) : (
                        <div className="space-y-4 animate-fade-in">`;
                        
  const historySplitPos = code.indexOf(historySplitStr);
  
  if (historySplitPos !== -1) {
    const newHistorySplitHtml = `                        </div>
                    </div>
                    )}

                    {profileMatchTab === 'history' && (
                    <div className="bg-appDark-card border border-appDark-border rounded-b-2xl rounded-tl-2xl p-4 space-y-4 shadow-md -mt-px relative z-0">
                        <div className="space-y-4 animate-fade-in">`;
    code = code.substring(0, historySplitPos) + newHistorySplitHtml + code.substring(historySplitPos + historySplitStr.length);
  } else {
    console.log("Could not find history split");
  }

  // 5. Update final close
  const finalCloseStr = `                        </div>
                      )}
                    </div>`;
  const newFinalCloseStr = `                        </div>
                    </div>
                    )}`;
  // wait, the final close is just `                      )}` followed by `</div>` which was the old wrapper.
  // Actually, let's just let it be, but replace the wrapper.
  // We removed the top of the wrapper in step 3. 
  // Let's find the bottom of the wrapper:
  const bottomWrapperIndex = code.indexOf('                      )}\n                    </div>');
  if (bottomWrapperIndex !== -1) {
    code = code.substring(0, bottomWrapperIndex) + '                      </div>\n                    )}' + code.substring(bottomWrapperIndex + '                      )}\n                    </div>'.length);
  } else {
    console.log("Could not find final close");
  }

  fs.writeFileSync('src/App.jsx', code, 'utf8');
  console.log("Rewrite complete.");

} catch(e) {
  console.error(e);
}
