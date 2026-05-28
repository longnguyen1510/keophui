const fs = require('fs');

try {
  let code = fs.readFileSync('src/App.jsx', 'utf8');

  const oldMap = `                              {mockActivities.map(act => (
                                <div key={act.id} className="flex items-center gap-3 bg-appDark-deep/80 border border-appDark-border/40 hover:border-slate-600 rounded-xl p-3 transition-all cursor-pointer">
                                  <div className={\`w-10 h-10 rounded-full flex items-center justify-center text-lg border \${act.color}\`}>
                                    {act.icon}
                                  </div>
                                  <div className="flex-1">
                                    <h5 className="text-white font-semibold text-xs">{act.title}</h5>
                                    <p className="text-slate-500 text-[10px] font-medium mt-0.5">{act.time}</p>
                                  </div>
                                </div>
                              ))}`;

  const newMap = `                              {mockActivities.map(act => (
                                <div key={act.id} className="flex flex-col justify-center gap-0.5 bg-appDark-deep/80 border border-appDark-border/40 hover:border-slate-600 rounded-xl p-3 transition-all cursor-pointer">
                                  <h5 className="text-white font-semibold text-xs leading-snug">{act.title}</h5>
                                  <p className="text-slate-500 text-[10px] font-medium">{act.time}</p>
                                </div>
                              ))}`;

  code = code.replace(oldMap, newMap);
  fs.writeFileSync('src/App.jsx', code, 'utf8');
  console.log("Removed activity icon.");
} catch(e) {
  console.error(e);
}
