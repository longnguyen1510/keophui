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