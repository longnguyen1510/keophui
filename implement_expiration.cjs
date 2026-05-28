const fs = require('fs');

try {
  let code = fs.readFileSync('src/App.jsx', 'utf8');

  // 1. Add parseMatchStartTime inside App
  const parserCode = `
      const parseMatchStartTime = (timeStr, rawDateStr) => {
        if (!timeStr || !rawDateStr) return null;
        const timeMatch = timeStr.match(/^(\\d{1,2})[:h](\\d{2})/i);
        if (!timeMatch) return null;
        
        // rawDateStr format is usually YYYY-MM-DD
        const [year, month, day] = rawDateStr.split('-');
        if (!year || !month || !day) return null;

        const dateObj = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10), parseInt(timeMatch[1], 10), parseInt(timeMatch[2], 10), 0, 0);
        return dateObj.getTime();
      };

      // Real-time slot reservation expiration cleaner (ticks every 5 seconds)`;
  
  code = code.replace('// Real-time slot reservation expiration cleaner (ticks every 5 seconds)', parserCode);

  // 2. Update setInterval
  const oldInterval = `          setMatches(prevMatches => {
            const nextMatches = prevMatches.map(m => {
              if ((m.status === 'waiting_opponent' || m.status === 'pending_confirmation') && m.venue_slot_id) {
                const associatedSlot = slots.find(s => s.id === m.venue_slot_id);
                if (associatedSlot && associatedSlot.status === 'on_hold' && associatedSlot.hold_expires_at && now > new Date(associatedSlot.hold_expires_at)) {
                  matchesChanged = true;
                  return { ...m, status: 'expired' };
                }
              }
              if (m.status === 'confirmed') {
                const endTime = parseMatchEndTime(m.time, m.rawTime);
                // Wait 60 minutes: + 60 * 60 * 1000. But for testing, if it's past the end time, it will naturally trigger if it's already far in the past.
                if (endTime && now.getTime() > endTime + 60 * 60 * 1000) {
                  matchesChanged = true;
                  setTimeout(() => {`;

  const newInterval = `          setMatches(prevMatches => {
            const nextMatches = prevMatches.map(m => {
              const nowTime = now.getTime();
              const startTime = parseMatchStartTime(m.time, m.rawTime);
              
              // EXPIRATION LOGIC FOR OPEN MATCHES
              if (startTime && (m.status === 'waiting_opponent' || m.status === 'Thiếu người')) {
                const sixtyMins = 60 * 60 * 1000;
                
                if (m.status === 'Thiếu người') {
                  // Tuyển lẻ: expires 60 mins before start
                  if (nowTime > startTime - sixtyMins) {
                    matchesChanged = true;
                    return { ...m, status: 'expired' };
                  }
                } else if (m.status === 'waiting_opponent') {
                  // Tìm đối: 
                  const createdAt = m.created_at ? new Date(m.created_at).getTime() : 0;
                  const isCreatedLastMinute = (startTime - createdAt) < sixtyMins;
                  
                  if (isCreatedLastMinute) {
                    // Created last minute: expires 15 mins after creation
                    if (nowTime > createdAt + 15 * 60 * 1000) {
                      matchesChanged = true;
                      return { ...m, status: 'expired' };
                    }
                  } else {
                    // Created normally: expires 60 mins before start
                    if (nowTime > startTime - sixtyMins) {
                      matchesChanged = true;
                      return { ...m, status: 'expired' };
                    }
                  }
                }
              }

              // HOLD EXPIRATION FOR SLOTS
              if ((m.status === 'waiting_opponent' || m.status === 'pending_confirmation') && m.venue_slot_id) {
                const associatedSlot = slots.find(s => s.id === m.venue_slot_id);
                if (associatedSlot && associatedSlot.status === 'on_hold' && associatedSlot.hold_expires_at && now > new Date(associatedSlot.hold_expires_at)) {
                  matchesChanged = true;
                  return { ...m, status: 'expired' };
                }
              }

              if (m.status === 'confirmed') {
                // Approximate end time as start time + 90 mins
                const endTime = startTime ? startTime + 90 * 60 * 1000 : null;
                // Wait 60 minutes after end time
                if (endTime && nowTime > endTime + 60 * 60 * 1000) {
                  matchesChanged = true;
                  setTimeout(() => {`;

  code = code.replace(oldInterval, newInterval);

  fs.writeFileSync('src/App.jsx', code, 'utf8');
  console.log("Updated setInterval logic and added parser.");
} catch(e) {
  console.error(e);
}
