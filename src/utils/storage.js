export const getStorageItem = (key, defaultVal) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch(e) {
    console.error('Lỗi đọc localStorage:', e);
    return defaultVal;
  }
};

export const setStorageItem = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch(e) {
    console.error('Lỗi ghi localStorage:', e);
  }
};