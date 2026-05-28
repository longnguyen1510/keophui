const fs = require('fs');
const path = require('path');

const content = fs.readFileSync('src/App.jsx', 'utf-8');

// Define the components we want to extract
const components = [
  { name: 'MatchCard', type: 'cards' },
  { name: 'PlayerNeededCard', type: 'cards' },
  { name: 'VenueCard', type: 'cards' },
  { name: 'TeamCard', type: 'cards' },
  { name: 'ProfileMatchListItem', type: 'cards' },
  { name: 'MatchDetailModal', type: 'modals' },
  { name: 'JoinFormModal', type: 'modals' },
  { name: 'ReceiveFormModal', type: 'modals' },
  { name: 'CreateSlotFormModal', type: 'modals' },
  { name: 'EditSlotFormModal', type: 'modals' },
  { name: 'CreateTeamFormModal', type: 'modals' },
  { name: 'CreateMatchFromSlotModal', type: 'modals' },
  { name: 'InviteFriendlyModal', type: 'modals' },
  { name: 'CreateMissingPlayerFormModal', type: 'modals' },
  { name: 'ChangeNameModal', type: 'modals' },
  { name: 'VenueRegModal', type: 'modals' },
  { name: 'RateOpponentFormModal', type: 'modals' }
];

let appContent = content;
const imports = [];

components.forEach(comp => {
  const funcStart = `function ${comp.name}(`;
  const startIndex = appContent.indexOf(funcStart);
  
  if (startIndex !== -1) {
    // Find the end of this function. Since they are at the root level, we can find the next `function ` or the end of the file.
    // Or we can just count braces.
    let braceCount = 0;
    let started = false;
    let endIndex = startIndex;
    
    for (let i = startIndex; i < appContent.length; i++) {
      if (appContent[i] === '{') {
        braceCount++;
        started = true;
      } else if (appContent[i] === '}') {
        braceCount--;
      }
      
      if (started && braceCount === 0) {
        endIndex = i + 1;
        break;
      }
    }
    
    const componentCode = appContent.substring(startIndex, endIndex);
    
    // Save to file
    const dir = `src/components/${comp.type}`;
    fs.mkdirSync(dir, { recursive: true });
    
    const fileContent = `import React from 'react';\n\nexport default ${componentCode}\n`;
    fs.writeFileSync(`${dir}/${comp.name}.jsx`, fileContent);
    
    // Remove from App.jsx
    appContent = appContent.replace(componentCode, '');
    
    // Add import
    imports.push(`import ${comp.name} from './components/${comp.type}/${comp.name}.jsx';`);
    console.log(`Extracted ${comp.name}`);
  }
});

// Regex line removed

// Prepend imports
const importStr = imports.join('\\n') + '\\n\\n';

// We need to inject imports right after the other imports
const lastImportIndex = appContent.lastIndexOf('import ');
let insertIndex = 0;
if (lastImportIndex !== -1) {
  insertIndex = appContent.indexOf('\\n', lastImportIndex) + 1;
}

appContent = appContent.substring(0, insertIndex) + importStr + appContent.substring(insertIndex);

fs.writeFileSync('src/App.jsx', appContent);
console.log('App.jsx updated');
