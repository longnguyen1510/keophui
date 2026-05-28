const fs = require('fs');

try {
  let code = fs.readFileSync('src/App.jsx', 'utf8');

  const oldOwnerText = `Chủ kèo: <strong className="text-slate-200">{isOwner ? \`\${match.adminContact} (Bạn)\` : \`\${match.adminContact.substring(0, 7)}***\`}</strong`;
  
  const newOwnerText = `Chủ kèo: <strong className="text-slate-200">{isOwner ? \`\${ownerTeam.representative || match.teamName} - \${match.adminContact} (Bạn)\` : \`\${ownerTeam.representative || match.teamName} - \${match.adminContact}\`}</strong`;

  code = code.replace(oldOwnerText, newOwnerText);

  fs.writeFileSync('src/App.jsx', code, 'utf8');
  console.log("Updated match owner text.");
} catch(e) {
  console.error(e);
}
