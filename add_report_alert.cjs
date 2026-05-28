const fs = require('fs');

try {
  let code = fs.readFileSync('src/App.jsx', 'utf8');

  const oldOnClick = `                                  onClick={() => {
                                    if (act.type === 'suggestion') {
                                      setFilterDistrict(act.district || 'Tất cả');
                                      setCurrentTab('keo');
                                    }
                                  }}`;

  const newOnClick = `                                  onClick={() => {
                                    if (act.type === 'suggestion') {
                                      setFilterDistrict(act.district || 'Tất cả');
                                      setCurrentTab('keo');
                                    } else if (act.type === 'attendance') {
                                      alert("Đã gửi báo cáo khiếu nại lên Quản trị viên (QTV). QTV sẽ liên hệ với bạn và chủ sân để đối chiếu sự việc.");
                                    }
                                  }}`;

  code = code.replace(oldOnClick, newOnClick);

  fs.writeFileSync('src/App.jsx', code, 'utf8');
  console.log("Added report alert.");
} catch(e) {
  console.error(e);
}
