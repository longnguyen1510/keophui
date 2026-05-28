const fs = require('fs');

try {
  let code = fs.readFileSync('src/App.jsx', 'utf8');

  // 1. Add formatPrice utility if it doesn't exist
  if (!code.includes('const formatPrice =')) {
    const insertAfter = `const formatTimeAgo = (dateStr) => {`;
    const formatPriceFunc = `const formatPrice = (priceStr) => {
  if (!priceStr) return "Đang cập nhật";
  const num = parseInt(String(priceStr).replace(/\\D/g, ''));
  if (isNaN(num)) return priceStr;
  return num.toLocaleString('vi-VN') + "đ";
};

const formatTimeAgo = (dateStr) => {`;
    code = code.replace(insertAfter, formatPriceFunc);
  }

  // 2. Format currency in rendering
  // MatchDetailModal
  code = code.replace(
    `<span className="font-black text-neon-green">{match.price || "Đang cập nhật"}</span>`,
    `<span className="font-black text-neon-green">{typeof formatPrice !== 'undefined' ? formatPrice(match.price) : match.price}</span>`
  );
  // Do it globally for all match.price in JSX rendering
  code = code.replace(
    /\{match\.price \|\| "Đang cập nhật"\}/g,
    `{formatPrice(match.price)}`
  );

  // also in MatchList items
  code = code.replace(
    /\{slot\.price\}/g,
    `{formatPrice(slot.price)}`
  );
  
  // also in MatchListItem extraInfo
  code = code.replace(
    /let extraInfo = \`\$\{sl\.price\} \| \$\{sl\.pitchType\}\`;/g,
    `let extraInfo = \`\$\{formatPrice(sl.price)\} | \$\{sl.pitchType\}\`;`
  );

  // 3. Add Google Maps link in MatchDetailModal
  // Find where venue name and district are rendered in Modal
  const oldVenueModal = `<p className="text-[13px] font-bold text-white mt-0.5 group-hover:text-neon-yellow transition-colors">{match.district}</p>`;
  const newVenueModal = `<p className="text-[13px] font-bold text-white mt-0.5 group-hover:text-neon-yellow transition-colors hover:underline">
                                <a href={\`https://www.google.com/maps/search/\${encodeURIComponent((match.venueName || "Sân bóng") + " " + (match.district || ""))}\`} target="_blank" rel="noreferrer">
                                  {match.district}
                                </a>
                              </p>`;
  code = code.replace(oldVenueModal, newVenueModal);
  
  // 4. Change "Vị trí & Số lượng: Cần 3/10 người..." to "Đang có 3/10 người"
  const oldCandi = `Cần {missingCount}/{totalCount} người`;
  const newCandi = `Đang có {totalCount - missingCount}/{totalCount} người`;
  code = code.replace(oldCandi, newCandi);

  const oldCandi2 = `Cần {match.missingCount || 2}/{match.needPlayersCount || 10} người`;
  const newCandi2 = `Đang có {(match.needPlayersCount || 10) - (match.missingCount || 2)}/{match.needPlayersCount || 10} người`;
  code = code.replace(oldCandi2, newCandi2);

  // 5. Change "Sân bóng" to "Tiền sân" inside MatchDetailModal for price label
  const oldSanBong = `<p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                🏟️ Sân bóng
                              </p>`;
  const newSanBong = `<p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                🏟️ Tiền sân
                              </p>`;
  code = code.replace(oldSanBong, newSanBong);

  // 6. Add "Tỷ lệ bom kèo" (cancellationRate) or reliability score to player approval list (BẢNG DUYỆT CẦU LẺ)
  const oldApprovalRow = `<span>⭐ Uy tín: <strong className="text-neon-yellow">{req.rating || '4.8'}</strong></span>
                                <span>•</span>`;
  const newApprovalRow = `<span>⭐ Uy tín: <strong className="text-neon-yellow">{req.rating || '4.8'}</strong></span>
                                <span>•</span>
                                <span>💣 Bom kèo: <strong className="text-red-400">{req.cancellationRate || '0%'}</strong></span>
                                <span>•</span>`;
  code = code.replace(oldApprovalRow, newApprovalRow);
  
  // But wait, req doesn't have cancellationRate. We might need to mock it if not present.
  // The rendering already has \`{req.cancellationRate || '0%'}\` which is fine.

  fs.writeFileSync('src/App.jsx', code, 'utf8');
  console.log("Updated UI logic");
} catch(e) {
  console.error(e);
}
