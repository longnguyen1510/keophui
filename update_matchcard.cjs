const fs = require('fs');

try {
  let code = fs.readFileSync('src/App.jsx', 'utf8');

  // Add expired to getBadgeClass
  code = code.replace(`          case 'completed':
            return 'bg-sky-500/20 text-sky-400 border-sky-500/30';`, 
            `          case 'completed':
            return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
          case 'expired':
            return 'bg-slate-500/40 text-slate-300 border-slate-500/50';`);

  // Add expired to getFriendlyStatusText
  code = code.replace(`          case 'completed': return 'Đã hoàn thành';`,
            `          case 'completed': return 'Đã hoàn thành';
          case 'expired': return 'Hết hạn';`);

  // Update wrapper class
  const oldClass = `      const isClosedMatch = match.status === 'confirmed' || match.status === 'completed' || match.status === 'Đã đủ người';

      return (
        <div 
          onClick={onSelect}
          className={\`bg-appDark-card border border-appDark-border rounded-xl p-3 px-3.5 space-y-2 cursor-pointer transition-all relative overflow-hidden shadow-sm \${
            isClosedMatch ? 'opacity-50 hover:opacity-100' : 'hover:border-slate-500 hover:scale-[1.01] active:scale-[0.99] group'
          }\`}`;

  const newClass = `      const isClosedMatch = match.status === 'confirmed' || match.status === 'completed' || match.status === 'Đã đủ người';
      const isExpired = match.status === 'expired';

      return (
        <div 
          onClick={isExpired ? undefined : onSelect}
          className={\`bg-appDark-card border border-appDark-border rounded-xl p-3 px-3.5 space-y-2 transition-all relative overflow-hidden shadow-sm \${
            isExpired ? 'opacity-50 grayscale pointer-events-none' : (isClosedMatch ? 'opacity-50 hover:opacity-100 cursor-pointer' : 'cursor-pointer hover:border-slate-500 hover:scale-[1.01] active:scale-[0.99] group')
          }\`}`;

  code = code.replace(oldClass, newClass);
  fs.writeFileSync('src/App.jsx', code, 'utf8');
  console.log("Updated MatchCard.");

} catch(e) {
  console.error(e);
}
