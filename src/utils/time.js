export const parseMatchEndTime = (timeStr, durationMin) => {
  const [h, m] = timeStr.split(':').map(Number);
  const totalMins = h * 60 + m + durationMin;
  const endH = Math.floor(totalMins / 60);
  const endM = totalMins % 60;
  return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
};