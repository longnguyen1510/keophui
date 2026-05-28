const fs = require('fs');

try {
  let code = fs.readFileSync('src/App.jsx', 'utf8');

  // Fix 1: Filter requests in BẢNG DUYỆT CẦU LẺ
  const oldApprovalListMap = `{(!match.requests || match.requests.length === 0) ? (
                    <p className="text-[10px] text-slate-500 italic text-center py-4 bg-appDark-deep rounded-xl border border-appDark-border/30">
                      Chưa có ai đăng ký tham gia kèo này.
                    </p>
                  ) : (
                    match.requests.map((req) => {`;
                    
  const newApprovalListMap = `{(!match.requests || match.requests.filter(r => r.status === 'pending' || r.status === 'waitlist').length === 0) ? (
                    <p className="text-[10px] text-slate-500 italic text-center py-4 bg-appDark-deep rounded-xl border border-appDark-border/30">
                      Không có yêu cầu nào đang chờ duyệt.
                    </p>
                  ) : (
                    match.requests.filter(r => r.status === 'pending' || r.status === 'waitlist').map((req) => {`;
  
  code = code.replace(oldApprovalListMap, newApprovalListMap);

  fs.writeFileSync('src/App.jsx', code, 'utf8');
  console.log("Updated approval list mapping.");
} catch(e) {
  console.error(e);
}
