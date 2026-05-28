const fs = require('fs');

const content = fs.readFileSync('index_old_backup.html', 'utf-8');

function extractBlock(startStr, endStr) {
  const startIndex = content.indexOf(startStr);
  if (startIndex === -1) return null;
  const endIndex = content.indexOf(endStr, startIndex);
  if (endIndex === -1) return null;
  return content.substring(startIndex, endIndex + endStr.length);
}

let scriptBlock = extractBlock('<script type="text/babel">', '</script>');
if (scriptBlock) {
  scriptBlock = scriptBlock.replace('<script type="text/babel">', '').replace('</script>', '');
  
  // Remove the mock data declarations since we exported them to src/data
  const varsToRemove = [
    'SEED_USERS', 'SEED_VENUES', 'INITIAL_TEAMS', 'INITIAL_MATCHES', 'INITIAL_SLOTS', 'MOCK_LIVE_EVENTS'
  ];
  
  varsToRemove.forEach(v => {
    const regex = new RegExp(`const ${v} = [\\s\\S]*?;\\n\\n`, 'g');
    scriptBlock = scriptBlock.replace(regex, '');
  });

  // Remove util declarations that we imported
  const utilsToRemove = [
    /const getStorageItem = [\\s\\S]*?\\n\\n/g,
    /const setStorageItem = [\\s\\S]*?\\n\\n/g,
    /const parseMatchEndTime = [\\s\\S]*?\\n\\n/g,
    /const checkOverlappingMatch = [\\s\\S]*?\\n\\n/g,
    /const \\{ useState, useEffect, useMemo \\} = React;\\n/g,
    /const \\{ useState, useEffect, useRef, useMemo \\} = React;\\n/g
  ];

  utilsToRemove.forEach(regex => {
    scriptBlock = scriptBlock.replace(regex, '');
  });

  // Remove ReactDOM.render at the end
  scriptBlock = scriptBlock.replace("ReactDOM.render(<App />, document.getElementById('root'));", '');

  // Add imports
  const header = `import React, { useState, useEffect, useRef, useMemo } from 'react';
import { SEED_USERS } from './data/seedUsers.js';
import { SEED_VENUES } from './data/seedVenues.js';
import { INITIAL_TEAMS } from './data/seedTeams.js';
import { INITIAL_MATCHES } from './data/seedMatches.js';
import { INITIAL_SLOTS } from './data/seedSlots.js';
import { MOCK_LIVE_EVENTS } from './data/mockLiveEvents.js';
import { getStorageItem, setStorageItem } from './utils/storage.js';
import { parseMatchEndTime } from './utils/time.js';
import { checkOverlappingMatch } from './utils/match.js';

`;

  fs.writeFileSync('src/App.jsx', header + scriptBlock + '\nexport default App;\n');
  console.log('App.jsx created');
}
