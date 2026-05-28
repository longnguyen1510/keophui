const fs = require('fs');

try {
  let code = fs.readFileSync('src/App.jsx', 'utf8');

  const oldRender = `                                  <h5 className="text-white font-semibold text-xs leading-snug">{act.title}</h5>
                                  <p className="text-slate-500 text-[10px] font-medium">{act.time}</p>`;

  const newRender = `                                  <h5 className="text-white font-semibold text-xs leading-snug">{act.title}</h5>
                                  {act.desc && <p className="text-amber-400 text-[10px] font-medium leading-snug">{act.desc}</p>}
                                  <p className="text-slate-500 text-[10px] font-medium mt-0.5">{act.time}</p>`;

  code = code.replace(oldRender, newRender);

  fs.writeFileSync('src/App.jsx', code, 'utf8');
  console.log("Updated activities UI.");
} catch(e) {
  console.error(e);
}
