const fs = require('fs');

try {
  let code = fs.readFileSync('src/App.jsx', 'utf8');

  // 1. Remove parseMatchStartTime from inside App
  const oldFunc = `      const parseMatchStartTime = (timeStr, rawDateStr) => {
        if (!timeStr || !rawDateStr) return null;
        const timeMatch = timeStr.match(/^(\\d{1,2})[:h](\\d{2})/i);
        if (!timeMatch) return null;
        
        // rawDateStr format is usually YYYY-MM-DD
        const [year, month, day] = rawDateStr.split('-');
        if (!year || !month || !day) return null;

        const dateObj = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10), parseInt(timeMatch[1], 10), parseInt(timeMatch[2], 10), 0, 0);
        return dateObj.getTime();
      };`;

  code = code.replace(oldFunc, '');

  // 2. Add it before function App() {
  const insertGlobal = `
const parseMatchStartTime = (timeStr, rawDateStr) => {
  if (!timeStr || !rawDateStr) return null;
  const timeMatch = timeStr.match(/^(\\d{1,2})[:h](\\d{2})/i);
  if (!timeMatch) return null;
  
  const [year, month, day] = rawDateStr.split('-');
  if (!year || !month || !day) return null;

  const dateObj = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10), parseInt(timeMatch[1], 10), parseInt(timeMatch[2], 10), 0, 0);
  return dateObj.getTime();
};

function App() {`;

  code = code.replace(`    function App() {`, insertGlobal);

  fs.writeFileSync('src/App.jsx', code, 'utf8');
  console.log("Moved parseMatchStartTime out of App component.");
} catch(e) {
  console.error(e);
}
