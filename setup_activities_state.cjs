const fs = require('fs');

try {
  let code = fs.readFileSync('src/App.jsx', 'utf8');

  // Change mockActivities to state
  const mockOld = `      const mockActivities = [
        { id: 1, type: 'match_accepted', title: 'FC Chicken đã nhận kèo của bạn', time: '5 phút trước', icon: '🔥', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
        { id: 2, type: 'team_review', title: 'FC Hữu Nghị đánh giá đội bạn 5⭐', time: '1 giờ trước', icon: '⭐', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
        { id: 3, type: 'join_request', title: 'Có 2 người xin vào đội', time: '2 giờ trước', icon: '👤', color: 'text-sky-400 bg-sky-400/10 border-sky-400/20' },
        { id: 4, type: 'venue_confirmed', title: 'Trận tối nay đã chốt sân', time: 'Hôm qua', icon: '⚽', color: 'text-neon-green bg-neon-green/10 border-neon-green/20' },
        { id: 5, type: 'player_cancelled', title: 'Một cầu thủ đã hủy tham gia', time: 'Hôm qua', icon: '❌', color: 'text-red-400 bg-red-400/10 border-red-400/20' },
      ];`;

  const mockNew = `      const [activities, setActivities] = useState([
        { id: 1, type: 'match_accepted', title: 'FC Chicken đã nhận kèo của bạn', time: '5 phút trước', icon: '🔥', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
        { id: 2, type: 'team_review', title: 'FC Hữu Nghị đánh giá đội bạn 5⭐', time: '1 giờ trước', icon: '⭐', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
        { id: 3, type: 'join_request', title: 'Có 2 người xin vào đội', time: '2 giờ trước', icon: '👤', color: 'text-sky-400 bg-sky-400/10 border-sky-400/20' },
        { id: 4, type: 'venue_confirmed', title: 'Trận tối nay đã chốt sân', time: 'Hôm qua', icon: '⚽', color: 'text-neon-green bg-neon-green/10 border-neon-green/20' },
        { id: 5, type: 'player_cancelled', title: 'Một cầu thủ đã hủy tham gia', time: 'Hôm qua', icon: '❌', color: 'text-red-400 bg-red-400/10 border-red-400/20' },
      ]);`;

  code = code.replace(mockOld, mockNew);

  fs.writeFileSync('src/App.jsx', code, 'utf8');
  console.log("Converted to state.");
} catch(e) {
  console.error(e);
}
