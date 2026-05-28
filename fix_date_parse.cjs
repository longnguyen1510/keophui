const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const targetFunction = `      const renderGroupedMatches = (matchesList) => {`;
const helperFunction = `      const extractDateFromTime = (timeStr) => {
        if (!timeStr) return null;
        if (timeStr.includes('Hôm nay')) return 'Hôm nay';
        if (timeStr.includes('Ngày mai')) return 'Ngày mai';
        if (timeStr.includes('Hôm qua')) return 'Hôm qua';
        const match = timeStr.match(/(\\d{1,2})\\/(\\d{1,2})(?:\\/(\\d{4}))?/);
        if (match) return match[0];
        return null;
      };

      const renderGroupedMatches = (matchesList) => {`;

code = code.replace(targetFunction, helperFunction);

// Now update the sort logic
const sortLogicOriginal = `        const sorted = [...matchesList].sort((a, b) => {
          const tA = parseMatchStartTime(a.time, a.rawDate) || 0;
          const tB = parseMatchStartTime(b.time, b.rawDate) || 0;
          return tB - tA; // Newest first
        });`;

const sortLogicNew = `        const sorted = [...matchesList].sort((a, b) => {
          const rawDateA = a.rawDate || extractDateFromTime(a.time);
          const rawDateB = b.rawDate || extractDateFromTime(b.time);
          const tA = parseMatchStartTime(a.time, rawDateA) || 0;
          const tB = parseMatchStartTime(b.time, rawDateB) || 0;
          return tB - tA; // Newest first
        });`;

code = code.replace(sortLogicOriginal, sortLogicNew);

// Now update the grouping logic
const groupLogicOriginal = `        sorted.forEach(m => {
          let dateLabel = "Chưa xác định";
          if (m.rawDate) {
            const ms = parseMatchStartTime(m.time, m.rawDate);`;

const groupLogicNew = `        sorted.forEach(m => {
          let dateLabel = "Chưa xác định";
          const rawDate = m.rawDate || extractDateFromTime(m.time);
          if (rawDate) {
            const ms = parseMatchStartTime(m.time, rawDate);`;

code = code.replace(groupLogicOriginal, groupLogicNew);

fs.writeFileSync('src/App.jsx', code);
console.log("Date parsing logic fixed");
