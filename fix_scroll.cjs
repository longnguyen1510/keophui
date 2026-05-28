const fs = require('fs');

try {
  let code = fs.readFileSync('src/App.jsx', 'utf8');

  // Fix upcoming tab created
  code = code.replace(
    `{upcomingSubTab === 'created' && (
                          <div className="space-y-2.5">`,
    `{upcomingSubTab === 'created' && (
                          <div className="space-y-2.5 max-h-[60vh] overflow-y-auto no-scrollbar pb-4">`
  );

  // Fix upcoming tab joined
  code = code.replace(
    `{upcomingSubTab === 'joined' && (
                          <div className="space-y-2.5">`,
    `{upcomingSubTab === 'joined' && (
                          <div className="space-y-2.5 max-h-[60vh] overflow-y-auto no-scrollbar pb-4">`
  );

  // Fix history tab activities
  code = code.replace(
    `{notificationSubTab === 'activities' && (
                            <div className="space-y-2">`,
    `{notificationSubTab === 'activities' && (
                            <div className="space-y-2 max-h-[60vh] overflow-y-auto no-scrollbar pb-4">`
  );

  // Fix history tab history
  code = code.replace(
    `<div className="space-y-2.5 animate-fade-in opacity-90">
                          {notificationSubTab === 'activities' && (`,
    `<div className="space-y-2.5 animate-fade-in opacity-90">
                          {notificationSubTab === 'activities' && (`
  );
  // Wait, history tab history uses:
  // <div className="space-y-2.5"> inside {myHistoryMatches.length === 0 ? (...) : (...)
  // Let's be more specific
  
  const historyReplacement = `                              ) : (
                                <div className="space-y-2.5 max-h-[60vh] overflow-y-auto no-scrollbar pb-4">
                                  {myHistoryMatches.map(m => (`;
  code = code.replace(
    `                              ) : (
                                <div className="space-y-2.5">
                                  {myHistoryMatches.map(m => (`,
    historyReplacement
  );

  fs.writeFileSync('src/App.jsx', code, 'utf8');
  console.log("Added scrolling to tabs.");
} catch(e) {
  console.error(e);
}
