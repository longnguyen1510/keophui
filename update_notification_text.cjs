const fs = require('fs');

try {
  let code = fs.readFileSync('src/App.jsx', 'utf8');

  const oldTitle = `title: \`Chủ đội \${m.teamName} đã xác nhận bạn \${status === 'present' ? 'Đã có mặt' : 'Không tới'} trận lúc \${m.time.split(' ')[0]}.\`,
                  desc: 'Nếu có sai sót, hãy bấm vào đây để báo cáo QTV.',`;

  const newTitle = `title: \`Chủ đội \${m.teamName} đã xác nhận bạn \${status === 'present' ? 'Đã có mặt' : 'Không tới'} trận lúc \${m.time.split(' ')[0]}. \${status === 'present' ? 'Điểm số của bạn đã được tính.' : 'Điểm uy tín bom kèo của bạn sẽ bị tính.'}\`,
                  desc: status === 'noshow' ? 'Nếu có sai sót, hãy bấm vào đây để báo cáo QTV.' : '',
                  requestId: req.id,`;

  code = code.replace(oldTitle, newTitle);

  fs.writeFileSync('src/App.jsx', code, 'utf8');
  console.log("Updated notification texts.");
} catch(e) {
  console.error(e);
}
