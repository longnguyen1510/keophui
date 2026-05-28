const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const helperFunc = `
const formatTimeDisplay = (timeStr) => {
  if (!timeStr) return "";
  const parts = timeStr.split(' ');
  if (parts.length >= 4) {
    const timePart = parts[0] + ' - ' + parts[2];
    const datePart = parts.slice(3).join(' ');
    return (
      <span className="inline-flex items-center gap-1.5">
        <span>{timePart}</span>
        <span className="text-slate-500/70 font-medium">|</span>
        <span className="text-white drop-shadow-sm">{datePart}</span>
      </span>
    );
  }
  return timeStr;
};
`;

code = code.replace("const parseMatchStartTime = ", helperFunc + "\nconst parseMatchStartTime = ");

// Replace specific occurrences in JSX:
// MatchCard:
code = code.replace(/<span className="text-neon-yellow font-black">\{match\.time\}<\/span>/g, '<span className="text-neon-yellow font-black">{formatTimeDisplay(match.time)}</span>');
// Slot card (Đặt Sân list):
code = code.replace(/<span className="text-\[11px\] font-black text-neon-yellow">\{slot\.timeSlot\}<\/span>/g, '<span className="text-[11px] font-black text-neon-yellow">{formatTimeDisplay(slot.timeSlot)}</span>');
// MatchSuggestionModal:
code = code.replace(/<span className="font-extrabold text-neon-yellow">\{match\.time\}<\/span>/g, '<span className="font-extrabold text-neon-yellow">{formatTimeDisplay(match.time)}</span>');
// My Booking Request modal:
code = code.replace(/<span className="font-bold text-slate-200">\{match\.time\}<\/span>/g, '<span className="font-bold text-slate-200">{formatTimeDisplay(match.time)}</span>');
// Match requests sent list (in Account tab):
code = code.replace(/<span className="font-bold text-neon-yellow">\{match\.time\}<\/span>/g, '<span className="font-bold text-neon-yellow">{formatTimeDisplay(match.time)}</span>');
// Match creation suggestion slots (in "Kèo cần tìm đối" modal ?):
code = code.replace(/<strong className="text-neon-yellow">\{slot\.timeSlot\}<\/strong>/g, '<strong className="text-neon-yellow">{formatTimeDisplay(slot.timeSlot)}</strong>');
// Match request item in history:
code = code.replace(/<span>🕒 \{match\.time\}<\/span>/g, '<span>🕒 {formatTimeDisplay(match.time)}</span>');


fs.writeFileSync('src/App.jsx', code);
console.log("Time format fixed");
