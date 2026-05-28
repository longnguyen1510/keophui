const fs = require('fs');

try {
  let code = fs.readFileSync('src/App.jsx', 'utf8');

  const oldDistrictText = `<span className="font-extrabold text-slate-200">{match.district}</span>`;
  const newDistrictText = `<a 
                  href={\`https://www.google.com/maps/search/?api=1&query=\${encodeURIComponent((match.venue || "Sân bóng") + " " + (match.district || ""))}\`}
                  target="_blank" 
                  rel="noreferrer"
                  className="font-extrabold text-sky-400 hover:underline block"
                >
                  {match.district}
                </a>`;
  
  code = code.replace(oldDistrictText, newDistrictText);

  fs.writeFileSync('src/App.jsx', code, 'utf8');
  console.log("Updated district link.");
} catch(e) {
  console.error(e);
}
