const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const parseDateStrOrig = `const parseDateStr = (rawDateStr) => {
  if (rawDateStr === 'Hôm nay') {
    const d = new Date();
    return [d.getFullYear(), d.getMonth() + 1, d.getDate()];
  }
  if (rawDateStr === 'Ngày mai') {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return [d.getFullYear(), d.getMonth() + 1, d.getDate()];
  }`;

const parseDateStrNew = `const parseDateStr = (rawDateStr, baseDateStr = null) => {
  if (rawDateStr === 'Hôm nay') {
    const d = baseDateStr ? new Date(baseDateStr) : new Date();
    return [d.getFullYear(), d.getMonth() + 1, d.getDate()];
  }
  if (rawDateStr === 'Ngày mai') {
    const d = baseDateStr ? new Date(baseDateStr) : new Date();
    d.setDate(d.getDate() + 1);
    return [d.getFullYear(), d.getMonth() + 1, d.getDate()];
  }
  if (rawDateStr === 'Hôm qua') {
    const d = baseDateStr ? new Date(baseDateStr) : new Date();
    d.setDate(d.getDate() - 1);
    return [d.getFullYear(), d.getMonth() + 1, d.getDate()];
  }`;

code = code.replace(parseDateStrOrig, parseDateStrNew);

const parseMatchStartOrig = `const parseMatchStartTime = (timeStr, rawDateStr) => {
  if (!timeStr || !rawDateStr) return null;
  const timeMatch = timeStr.match(/^(\\d{1,2})[:h](\\d{2})/i);
  if (!timeMatch) return null;
  
  const dateParts = parseDateStr(rawDateStr);`;

const parseMatchStartNew = `const parseMatchStartTime = (timeStr, rawDateStr, baseDateStr = null) => {
  if (!timeStr || !rawDateStr) return null;
  const timeMatch = timeStr.match(/^(\\d{1,2})[:h](\\d{2})/i);
  if (!timeMatch) return null;
  
  const dateParts = parseDateStr(rawDateStr, baseDateStr);`;

code = code.replace(parseMatchStartOrig, parseMatchStartNew);

const parseMatchEndOrig = `const parseMatchEndTimeMs = (timeStr, rawDateStr) => {
  if (!timeStr || !rawDateStr) return null;
  const parts = timeStr.split('-');
  if (parts.length < 2) return null;
  const endTimeStr = parts[1].trim();
  const timeMatch = endTimeStr.match(/^(\\d{1,2})[:h](\\d{2})/i);
  if (!timeMatch) return null;
  
  const dateParts = parseDateStr(rawDateStr);`;

const parseMatchEndNew = `const parseMatchEndTimeMs = (timeStr, rawDateStr, baseDateStr = null) => {
  if (!timeStr || !rawDateStr) return null;
  const parts = timeStr.split('-');
  if (parts.length < 2) return null;
  const endTimeStr = parts[1].trim();
  const timeMatch = endTimeStr.match(/^(\\d{1,2})[:h](\\d{2})/i);
  if (!timeMatch) return null;
  
  const dateParts = parseDateStr(rawDateStr, baseDateStr);`;

code = code.replace(parseMatchEndOrig, parseMatchEndNew);

// Update calls in renderGroupedMatches
const sortOrig = `        const sorted = [...matchesList].sort((a, b) => {
          const rawDateA = a.rawDate || extractDateFromTime(a.time);
          const rawDateB = b.rawDate || extractDateFromTime(b.time);
          const tA = parseMatchStartTime(a.time, rawDateA) || 0;
          const tB = parseMatchStartTime(b.time, rawDateB) || 0;
          return tB - tA; // Newest first
        });`;

const sortNew = `        const sorted = [...matchesList].sort((a, b) => {
          const rawDateA = a.rawDate || extractDateFromTime(a.time);
          const rawDateB = b.rawDate || extractDateFromTime(b.time);
          const tA = parseMatchStartTime(a.time, rawDateA, a.created_at) || 0;
          const tB = parseMatchStartTime(b.time, rawDateB, b.created_at) || 0;
          return tB - tA; // Newest first
        });`;

code = code.replace(sortOrig, sortNew);

const groupOrig = `        sorted.forEach(m => {
          let dateLabel = "Chưa xác định";
          const rawDate = m.rawDate || extractDateFromTime(m.time);
          if (rawDate) {
            const ms = parseMatchStartTime(m.time, rawDate);`;

const groupNew = `        sorted.forEach(m => {
          let dateLabel = "Chưa xác định";
          const rawDate = m.rawDate || extractDateFromTime(m.time);
          if (rawDate) {
            const ms = parseMatchStartTime(m.time, rawDate, m.created_at);`;

code = code.replace(groupOrig, groupNew);

fs.writeFileSync('src/App.jsx', code);
console.log("Base date logic implemented");
