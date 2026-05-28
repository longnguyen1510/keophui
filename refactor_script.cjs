const fs = require('fs');

const content = fs.readFileSync('index_old_backup.html', 'utf-8');

// Helper to extract a block of code based on start and end strings
function extractBlock(startStr, endStr) {
  const startIndex = content.indexOf(startStr);
  if (startIndex === -1) return null;
  const endIndex = content.indexOf(endStr, startIndex);
  if (endIndex === -1) return null;
  return content.substring(startIndex, endIndex + endStr.length);
}

// 1. Extract CSS
const cssBlock = extractBlock('<style>', '</style>');
if (cssBlock) {
  const cssContent = cssBlock.replace('<style>', '').replace('</style>', '').trim();
  fs.mkdirSync('src/styles', { recursive: true });
  fs.writeFileSync('src/styles/custom.css', cssContent);
  fs.writeFileSync('src/index.css', `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n@import './styles/custom.css';\n`);
  console.log('CSS extracted');
}

// 2. Extract Data
const dataDir = 'src/data';
fs.mkdirSync(dataDir, { recursive: true });

const extractData = (varName, fileName) => {
  const regex = new RegExp(`const ${varName} = (\\[[\\s\\S]*?\\]);`, 'm');
  const match = content.match(regex);
  if (match) {
    fs.writeFileSync(`${dataDir}/${fileName}.js`, `export const ${varName} = ${match[1]};\n`);
    console.log(`Extracted ${varName}`);
  } else {
    // try finding it without const (if it's var or let) or object
    const regexObj = new RegExp(`const ${varName} = ({[\\s\\S]*?});`, 'm');
    const matchObj = content.match(regexObj);
    if (matchObj) {
      fs.writeFileSync(`${dataDir}/${fileName}.js`, `export const ${varName} = ${matchObj[1]};\n`);
      console.log(`Extracted ${varName}`);
    } else {
      console.log(`Failed to extract ${varName}`);
    }
  }
}

extractData('SEED_USERS', 'seedUsers');
extractData('SEED_VENUES', 'seedVenues');
extractData('INITIAL_TEAMS', 'seedTeams');
extractData('INITIAL_MATCHES', 'seedMatches');
extractData('INITIAL_SLOTS', 'seedSlots');
extractData('MOCK_LIVE_EVENTS', 'mockLiveEvents');

// 3. Extract Utils
const utilsDir = 'src/utils';
fs.mkdirSync(utilsDir, { recursive: true });

// We'll write the utils manually as they are small
const storageUtils = `
export const getStorageItem = (key, defaultVal) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch(e) {
    console.error('Lỗi đọc localStorage:', e);
    return defaultVal;
  }
};

export const setStorageItem = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch(e) {
    console.error('Lỗi ghi localStorage:', e);
  }
};
`;
fs.writeFileSync(`${utilsDir}/storage.js`, storageUtils.trim());

const timeUtils = `
export const parseMatchEndTime = (timeStr, durationMin) => {
  const [h, m] = timeStr.split(':').map(Number);
  const totalMins = h * 60 + m + durationMin;
  const endH = Math.floor(totalMins / 60);
  const endM = totalMins % 60;
  return \`\${endH.toString().padStart(2, '0')}:\${endM.toString().padStart(2, '0')}\`;
};
`;
fs.writeFileSync(`${utilsDir}/time.js`, timeUtils.trim());

const matchUtils = `
export const checkOverlappingMatch = (user, newMatchDate, newMatchTime, newMatchDuration, matches) => {
  const [newH, newM] = newMatchTime.split(':').map(Number);
  const newStartMins = newH * 60 + newM;
  const newEndMins = newStartMins + newMatchDuration;

  return matches.some(m => {
    if (m.date !== newMatchDate) return false;
    // user is part of the match?
    const isPlayerInMatch = m.teamA?.members?.some(mb => mb.user_id === user.id) ||
                            m.teamB?.members?.some(mb => mb.user_id === user.id) ||
                            m.missingPlayers?.some(mp => mp.players?.some(p => p.user_id === user.id));
    if (!isPlayerInMatch) return false;

    const [existH, existM] = m.time.split(':').map(Number);
    const existStartMins = existH * 60 + existM;
    const existEndMins = existStartMins + m.duration;
    
    // Check overlap
    return (newStartMins < existEndMins && newEndMins > existStartMins);
  });
};
`;
fs.writeFileSync(`${utilsDir}/match.js`, matchUtils.trim());
console.log('Utils created');

// Fix index.html
const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/image/favicon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>Kèo Phủi - Chợ Kèo Bóng Đá Realtime</title>
  </head>
  <body class="bg-black text-white antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`;
fs.writeFileSync('index.html', indexHtml);
console.log('index.html replaced');

