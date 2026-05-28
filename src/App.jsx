import React, { useState, useEffect, useRef, useMemo } from 'react';
import { SEED_USERS } from './data/seedUsers.js';
import { SEED_VENUES } from './data/seedVenues.js';
import { INITIAL_TEAMS } from './data/seedTeams.js';
import { INITIAL_MATCHES } from './data/seedMatches.js';
import { INITIAL_SLOTS } from './data/seedSlots.js';
import { MOCK_LIVE_EVENTS } from './data/mockLiveEvents.js';
import { getStorageItem, setStorageItem } from './utils/storage.js';
import { parseMatchEndTime } from './utils/time.js';
import { checkOverlappingMatch } from './utils/match.js';


    // Removed hook exports

    // --- UTILS & STORAGE KEYS ---
    const STORAGE_PREFIX = "keophui_";

    // --- PREMIUM MULTI-ROLE DATA SCHEMAS ---
            const SEED_TEAMS = [
      {
        id: "t1",
        name: "FC Anh Em",
        district: "Thủ Đức",
        level: "Trung bình",
        owner_user_id: "u_0901234567",
        invite_code: "FC-8392",
        invite_link: "/team/fc-anh-em/join",
        phone: "0901234567",
        timePreference: "19:00 - 21:00 Tối trong tuần",
        representative: "Anh Quân",
        created_at: new Date().toISOString(),
        members: [
          { user_id: "u_0901234567", role: "owner", status: "joined", name: "Anh Quân" },
          { user_id: "u_0956789012", role: "admin", status: "joined", name: "Tuấn Hài" }
        ],
        matchCount: 15,
        winRate: "60%",
        rating: 4.6,
        cancellationRate: "thấp"
      },
      {
        id: "t2",
        name: "FC Lão Tướng",
        district: "Bình Thạnh",
        level: "Vui vẻ",
        owner_user_id: "u_0912345678",
        invite_code: "FC-4720",
        invite_link: "/team/fc-lao-tuong/join",
        phone: "0912345678",
        timePreference: "20:00 - 22:00 Thứ 3 & Thứ 5",
        representative: "Chú Nam",
        created_at: new Date().toISOString(),
        members: [
          { user_id: "u_0912345678", role: "owner", status: "joined", name: "Chú Nam" }
        ],
        matchCount: 42,
        winRate: "45%",
        rating: 4.9,
        cancellationRate: "cực thấp"
      },
      {
        id: "t3",
        name: "FC Phủi Q7",
        district: "Quận 7",
        level: "Mạnh",
        owner_user_id: "u_0934567890",
        invite_code: "FC-9087",
        invite_link: "/team/fc-phui-q7/join",
        phone: "0934567890",
        timePreference: "18:00 - 20:00 Tối cuối tuần",
        representative: "Cường Phủi",
        created_at: new Date().toISOString(),
        members: [
          { user_id: "u_0934567890", role: "owner", status: "joined", name: "Cường Phủi" }
        ],
        matchCount: 28,
        winRate: "75%",
        rating: 4.8,
        cancellationRate: "thấp"
      },
      {
        id: "t4",
        name: "FC Trẻ Gò Vấp",
        district: "Gò Vấp",
        level: "Mạnh",
        owner_user_id: "u_0923456789",
        invite_code: "FC-3392",
        invite_link: "/team/fc-tre-go-vap/join",
        phone: "0923456789",
        timePreference: "18:00 - 20:00 Hàng ngày",
        representative: "Huy Captain",
        created_at: new Date().toISOString(),
        members: [
          { user_id: "u_0923456789", role: "owner", status: "joined", name: "Huy Captain" }
        ],
        matchCount: 33,
        winRate: "70%",
        rating: 4.5,
        cancellationRate: "thấp"
      }
    ];

    // --- MOCK DATA ---
                // Live events list to feed the real-time ticker
        // --- APP COMPONENT ---

const parseDateStr = (rawDateStr, baseDateStr = null) => {
  if (!rawDateStr) return null;
  
  if (rawDateStr === 'Hôm nay') {
    const d = baseDateStr ? new Date(baseDateStr) : new Date();
    return [d.getFullYear(), d.getMonth() + 1, d.getDate()];
  }
  if (rawDateStr === 'Ngày mai') {
    const d = baseDateStr ? new Date(baseDateStr) : new Date();
    d.setDate(d.getDate() + 1);
    return [d.getFullYear(), d.getMonth() + 1, d.getDate()];
  }
  if (rawDateStr === 'Hôm qua') {
    const d = baseDateStr ? new Date(baseDateStr) : new Date();
    d.setDate(d.getDate() - 1);
    return [d.getFullYear(), d.getMonth() + 1, d.getDate()];
  }
  
  // Try matching yyyy-mm-dd
  const parts = rawDateStr.split('-');
  if (parts.length === 3) {
    return [parseInt(parts[0], 10), parseInt(parts[1], 10), parseInt(parts[2], 10)];
  }
  
  // Try matching dd/mm/yyyy or dd/mm (handling weekday prefix like 'Thứ 4 27/5')
  const slashMatch = rawDateStr.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?/);
  if (slashMatch) {
    const day = parseInt(slashMatch[1], 10);
    const month = parseInt(slashMatch[2], 10);
    const year = slashMatch[3] ? parseInt(slashMatch[3], 10) : (baseDateStr ? new Date(baseDateStr).getFullYear() : new Date().getFullYear());
    return [year, month, day];
  }
  
  return null;
};


const formatTimeDisplay = (timeStr) => {
  if (!timeStr) return "";
  const parts = timeStr.split(' ');
  if (parts.length >= 4) {
    const timePart = parts[0] + ' - ' + parts[2];
    const datePart = parts.slice(3).join(' ');
    return (
      <span className="inline-flex items-center gap-1.5">
        <span>{timePart}</span>
        <span className="text-slate-500/70 font-medium">|</span>
        <span className="text-white drop-shadow-sm">{datePart}</span>
      </span>
    );
  }
  return timeStr;
};

const parseMatchStartTime = (timeStr, rawDateStr, baseDateStr = null) => {
  if (!timeStr || !rawDateStr) return null;
  const timeMatch = timeStr.match(/^(\d{1,2})[:h](\d{2})/i);
  if (!timeMatch) return null;
  
  const dateParts = parseDateStr(rawDateStr, baseDateStr);
  if (!dateParts) return null;
  const [year, month, day] = dateParts;

  const dateObj = new Date(year, month - 1, day, parseInt(timeMatch[1], 10), parseInt(timeMatch[2], 10), 0, 0);
  return dateObj.getTime();
};

const parseMatchEndTimeMs = (timeStr, rawDateStr, baseDateStr = null) => {
  if (!timeStr || !rawDateStr) return null;
  const parts = timeStr.split('-');
  if (parts.length < 2) return null;
  const endTimeStr = parts[1].trim();
  const timeMatch = endTimeStr.match(/^(\d{1,2})[:h](\d{2})/i);
  if (!timeMatch) return null;
  
  const dateParts = parseDateStr(rawDateStr, baseDateStr);
  if (!dateParts) return null;
  const [year, month, day] = dateParts;

  const dateObj = new Date(year, month - 1, day, parseInt(timeMatch[1], 10), parseInt(timeMatch[2], 10), 0, 0);
  return dateObj.getTime();
};

const isTimeOverlapping = (slotTimeStr, rangeTimeStr) => {
  if (!slotTimeStr || !rangeTimeStr) return false;
  
  // Extract time parts (handling any date strings appended at the end)
  const cleanTimeStr = (str) => {
    const parts = str.split(' ');
    // If it starts with a time slot like "07:30 - 09:00", parts[0] is "07:30", parts[1] is "-", parts[2] is "09:00"
    if (parts.length >= 3 && parts[1] === '-') {
      return `${parts[0]} - ${parts[2]}`;
    }
    return str;
  };
  
  const sTime = cleanTimeStr(slotTimeStr);
  const rTime = cleanTimeStr(rangeTimeStr);
  
  const parseTime = (t) => {
    if (!t) return 0;
    const m = t.match(/(\d{1,2})[:h](\d{2})/);
    if (!m) return 0;
    return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
  };
  
  const sParts = sTime.split('-');
  const rParts = rTime.split('-');
  if (sParts.length < 2 || rParts.length < 2) return false;
  
  const sStart = parseTime(sParts[0].trim());
  const sEnd = parseTime(sParts[1].trim());
  const rStart = parseTime(rParts[0].trim());
  const rEnd = parseTime(rParts[1].trim());
  
  return sStart < rEnd && sEnd > rStart;
};



const formatPrice = (priceStr) => {
  if (!priceStr) return "Đang cập nhật";
  const num = parseInt(String(priceStr).replace(/\D/g, ''));
  if (isNaN(num)) return priceStr;
  return num.toLocaleString('vi-VN') + "đ";
};


    // 11. FORM: EDIT MATCH
    function EditMatchModal({ match, onClose, onSubmit }) {
      const [timeSlot, setTimeSlot] = useState(match.time || "");
      const [venueName, setVenueName] = useState(match.venue || match.venueName || "");
      const [district, setDistrict] = useState(match.district || "");
      const [price, setPrice] = useState(() => {
        if (!match.price) return "";
        const raw = String(match.price).replace(/\D/g, '');
        return raw ? parseInt(raw).toLocaleString('vi-VN') : "";
      });
      const handlePriceFormat = (e) => {
        const rawValue = String(e.target.value).replace(/\D/g, '');
        if (!rawValue) {
          setPrice('');
          return;
        }
        const formatted = parseInt(rawValue).toLocaleString('vi-VN');
        setPrice(formatted);
      };
      const [needPlayersCount, setNeedPlayersCount] = useState(match.needPlayersCount || match.missingCount || 2);
      const [pitchType, setPitchType] = useState(match.pitchType || "Sân 5");

      const handleFormSubmit = (e) => {
        e.preventDefault();
        let priceNum = parseInt(String(price).replace(/\D/g, '')) || 0;
        onSubmit({
          time: timeSlot,
          venue: venueName,
          district: district,
          price: priceNum,
          needPlayersCount: parseInt(needPlayersCount) || 2,
          pitchType
        });
      };

      return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="absolute inset-0" onClick={onClose}></div>
          <form 
            onSubmit={handleFormSubmit}
            className="w-full max-w-md bg-appDark-bg border-t border-appDark-border rounded-t-3xl p-5 space-y-4 relative z-10 animate-slide-up shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-white">✏️ Chỉnh Sửa Kèo</h3>
              <button type="button" onClick={onClose} className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 font-bold">✕</button>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Khung giờ đá</label>
                <input type="text" value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} required className="w-full text-xs bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Khu vực / Quận</label>
                <select value={district} onChange={(e) => setDistrict(e.target.value)} className="w-full text-xs bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white">
                  <option value="Quận 1">Quận 1</option>
                  <option value="Quận 2">Quận 2</option>
                  <option value="Quận 3">Quận 3</option>
                  <option value="Quận 10">Quận 10</option>
                  <option value="Thủ Đức">Thủ Đức</option>
                  <option value="Bình Thạnh">Bình Thạnh</option>
                  <option value="Tân Bình">Tân Bình</option>
                  <option value="Gò Vấp">Gò Vấp</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Tên sân bóng</label>
                <input type="text" value={venueName} onChange={(e) => setVenueName(e.target.value)} required className="w-full text-xs bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Quy mô sân</label>
                <select value={pitchType} onChange={(e) => setPitchType(e.target.value)} className="w-full text-xs bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white">
                  <option value="Sân 5">Sân 5</option>
                  <option value="Sân 7">Sân 7</option>
                  <option value="Sân 11">Sân 11</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Giá sân (VNĐ)</label>
                <input type="text" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))} required className="w-full text-xs bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Số lượng cần tuyển</label>
                <input type="number" min="1" max="20" value={needPlayersCount} onChange={(e) => setNeedPlayersCount(e.target.value)} required className="w-full text-xs bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white" />
              </div>
            </div>
            <button type="submit" className="w-full font-bold uppercase bg-neon-green text-appDark-deep py-3.5 rounded-xl mt-4">Lưu Thay Đổi</button>
          </form>
        </div>
      );
    }

    const INITIAL_FIELDS = [
      // Sân Cá Sấu Hoa Cà (v_casau)
      { fieldId: "f_casau_5a", venueId: "v_casau", fieldName: "Sân 5A", fieldType: "Sân 5", defaultPrice: 270000, price60: 180000, price90: 270000, price120: 350000, status: "active" },
      { fieldId: "f_casau_5b", venueId: "v_casau", fieldName: "Sân 5B", fieldType: "Sân 5", defaultPrice: 270000, price60: 180000, price90: 270000, price120: 350000, status: "active" },
      { fieldId: "f_casau_7a", venueId: "v_casau", fieldName: "Sân 7A", fieldType: "Sân 7", defaultPrice: 480000, price60: 320000, price90: 480000, price120: 620000, status: "active" },
    ];

    const INITIAL_RECURRING_BLOCKS = [];

    const generateSlotsForFields = (fieldsList, venuesList, customRecurring = null) => {
      const generated = [];
      const today = new Date();
      const blocks = customRecurring || INITIAL_RECURRING_BLOCKS;
      
      for (let i = 0; i < 30; i++) {
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + i);
        
        const dateStr = String(targetDate.getDate()).padStart(2, '0') + '/' + String(targetDate.getMonth() + 1).padStart(2, '0') + '/' + targetDate.getFullYear();
        
        let rawDate = dateStr;
        if (i === 0) rawDate = "Hôm nay";
        else if (i === 1) rawDate = "Ngày mai";
        else {
          const weekdays = ["Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
          rawDate = `${weekdays[targetDate.getDay()]} ${targetDate.getDate()}/${targetDate.getMonth() + 1}`;
        }
        
        fieldsList.forEach(field => {
          const venue = venuesList.find(v => v.id === field.venueId);
          if (!venue) return;
          
          const startHour = venue.activeStartHour !== undefined ? parseInt(venue.activeStartHour) : 6;
          const endHour = venue.activeEndHour !== undefined ? parseInt(venue.activeEndHour) : 24;
          
          for (let hour = startHour; hour < endHour; hour++) {
            for (let min of [0, 30]) {
              const startStr = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
              
              let endHourVal = hour;
              let endMinVal = min + 30;
              if (endMinVal === 60) {
                endHourVal += 1;
                endMinVal = 0;
              }
              const endStr = `${String(endHourVal).padStart(2, '0')}:${String(endMinVal).padStart(2, '0')}`;
              
              const slotId = `slot_${field.fieldId}_${dateStr.replace(/\//g, '')}_${startStr.replace(':', '')}`;
              
              // Check if matches a recurring block
              let isBlocked = false;
              let blockNotes = "";
              blocks.forEach(block => {
                if (block.fieldId === field.fieldId && targetDate.getDay() === block.dayOfWeek) {
                  const currentMins = hour * 60 + min;
                  const [bStartH, bStartM] = block.startTime.split(':').map(Number);
                  const [bEndH, bEndM] = block.endTime.split(':').map(Number);
                  
                  const blockStartMins = bStartH * 60 + bStartM;
                  const blockEndMins = bEndH * 60 + bEndM;
                  
                  if (currentMins >= blockStartMins && currentMins < blockEndMins) {
                    isBlocked = true;
                    blockNotes = `Khách cố định: ${block.teamName}`;
                  }
                }
              });

              generated.push({
                id: slotId,
                slotId: slotId,
                venueId: venue.id,
                venueName: venue.name,
                district: venue.district,
                address: venue.address,
                fieldId: field.fieldId,
                fieldName: field.fieldName,
                pitchType: field.fieldType,
                startTime: startStr,
                endTime: endStr,
                timeSlot: `${startStr} - ${endStr}`,
                rawTime: rawDate,
                date: dateStr,
                price: field.price90 || field.defaultPrice || 300000,   // default display price = 90 phút
                price60: field.price60 || Math.round((field.defaultPrice || 300000) * 2/3),
                price90: field.price90 || field.defaultPrice || 300000,
                price120: field.price120 || Math.round((field.defaultPrice || 300000) * 4/3),
                status: isBlocked ? "blocked" : "available",
                holdingTeamId: null,
                matchId: null,
                contact: venue.phone,
                notes: isBlocked ? blockNotes : `Khung giờ trống tại ${field.fieldName}.`
              });
            }
          }
        });
      }
      return generated;
    };
  
function App() {
      // Main States
      const [currentTab, setCurrentTab] = useState(() => getStorageItem("user", null) ? "keo" : "toi"); // keo | san | doi | toi
      
      // Data States loaded from localStorage or Fallback to Initial Data
      const [users, setUsers] = useState(() => {
        const stored = getStorageItem("users", SEED_USERS);
        return Array.isArray(stored) ? stored : SEED_USERS;
      });
      const [venues, setVenues] = useState(() => {
        const stored = getStorageItem("venues", SEED_VENUES);
        const storedArr = Array.isArray(stored) ? stored : SEED_VENUES;
        const storedIds = new Set(storedArr.map(v => v.id));
        const missingVenues = SEED_VENUES.filter(v => !storedIds.has(v.id));
        if (missingVenues.length > 0) {
          return [...storedArr, ...missingVenues];
        }
        return storedArr;
      });

      const [fields, setFields] = useState(() => {
        const stored = getStorageItem("fields", INITIAL_FIELDS);
        const storedArr = Array.isArray(stored) ? stored : INITIAL_FIELDS;
        const storedIds = new Set(storedArr.map(f => f.fieldId));
        const missingFields = INITIAL_FIELDS.filter(f => !storedIds.has(f.fieldId));
        if (missingFields.length > 0) {
          return [...storedArr, ...missingFields];
        }
        return storedArr;
      });

      const [recurringBlocks, setRecurringBlocks] = useState(() => {
        const stored = getStorageItem("recurringBlocks", INITIAL_RECURRING_BLOCKS);
        return Array.isArray(stored) ? stored : INITIAL_RECURRING_BLOCKS;
      });

      const [slots, setSlots] = useState(() => {
        const stored = getStorageItem("slots", null);
        let currentSlots = Array.isArray(stored) ? stored : [];
        
        // Dynamically load active venues and fields from local storage to heal any missing slots for newly registered venues
        const currentVenues = getStorageItem("venues", SEED_VENUES);
        const currentVenuesArr = Array.isArray(currentVenues) ? currentVenues : SEED_VENUES;
        const currentFields = getStorageItem("fields", INITIAL_FIELDS);
        const currentFieldsArr = Array.isArray(currentFields) ? currentFields : INITIAL_FIELDS;

        if (currentSlots.length === 0) {
          currentSlots = generateSlotsForFields(currentFieldsArr, currentVenuesArr);
        }

        // Self-healing check: Ensure slots exist for all fields in the actual fields database
        const existingFieldIds = new Set(currentSlots.map(s => s.fieldId));
        const missingFields = currentFieldsArr.filter(f => !existingFieldIds.has(f.fieldId));
        if (missingFields.length > 0) {
          const generatedMissing = generateSlotsForFields(missingFields, currentVenuesArr);
          currentSlots = [...currentSlots, ...generatedMissing];
        }

        return currentSlots;
      });
      const [matches, setMatches] = useState(() => {
        const stored = getStorageItem("matches", INITIAL_MATCHES);
        return Array.isArray(stored) ? stored : INITIAL_MATCHES;
      });
      const [teams, setTeams] = useState(() => {
        const stored = getStorageItem("teams", SEED_TEAMS);
        return Array.isArray(stored) ? stored : SEED_TEAMS;
      });
      
      // User Profile Auth State
      const [currentUser, setCurrentUser] = useState(() => getStorageItem("user", null));
      const [loginPhone, setLoginPhone] = useState(() => localStorage.getItem("lastLoginPhone") || "");
      const [loginName, setLoginName] = useState("");
      const [loginStep, setLoginStep] = useState(1);
      
      // Google Auth Mock States
      const [showGoogleModal, setShowGoogleModal] = useState(false);
      const [googleStep, setGoogleStep] = useState(1); // 1: Choose Account, 2: Loading, 3: Input Phone
      const [googleSelectedAccount, setGoogleSelectedAccount] = useState(null);
      const [googlePhoneInput, setGooglePhoneInput] = useState("");
      
      // Filter States
      const [filterDistrict, setFilterDistrict] = useState("Tất cả"); // Tất cả, Thủ Đức, Bình Thạnh, Quận 7, Gò Vấp
      const [filterTime, setFilterTime] = useState("Tất cả");       // Tất cả, Hôm nay, Ngày mai, Cuối tuần, Chọn ngày cụ thể
      const [filterCustomDate, setFilterCustomDate] = useState(""); // YYYY-MM-DD custom date selector
      const [filterPitchType, setFilterPitchType] = useState("Tất cả"); // Tất cả, Sân 5, Sân 7, Sân 11
      const [filterCategory, setFilterCategory] = useState("Tất cả");   // Tất cả, Kèo Nam, Kèo Nữ, Lão Tướng
      const [ownerSlotFilter, setOwnerSlotFilter] = useState("Tất cả"); // Tất cả, Sân 5, Sân 7, Sân 11
      const [ownerStatusFilter, setOwnerStatusFilter] = useState("Tất cả"); // Tất cả, Đang trống, Đang chờ chốt, Đã chốt
      const [activeQuickAction, setActiveQuickAction] = useState(null); // 'doi' | 'thieu' | 'trong'
      const [activeRoleMode, setActiveRoleMode] = useState(() => {
        try { return localStorage.getItem("activeRoleMode") || "cầu thủ"; } catch { return "cầu thủ"; }
      });
      const [adminSubTab, setAdminSubTab] = useState("history"); // 'history' | 'manage' | 'pitch_owners'
      const [ownerSubTab, setOwnerSubTab] = useState("lich_san"); // 'cum_san' | 'san_con' | 'lich_san' | 'khach_co_dinh'
      const [ownerCalDate, setOwnerCalDate] = useState("Hôm nay");
      const [filterTeamSearch, setFilterTeamSearch] = useState(""); // Search teams by name or code
      const [sortTeamBy, setSortTeamBy] = useState("Rating"); // "Rating" | "Tỷ lệ bùng kèo" | "Trình"
      const [activeTeamId, setActiveTeamId] = useState(null); // Selected team in Profile Tab
      const [profileMatchTab, setProfileMatchTab] = useState("team");
      const [ownerAccountTab, setOwnerAccountTab] = useState("upcoming"); // 'team' | 'upcoming' | 'history' in Profile Tab
      const [notificationSubTab, setNotificationSubTab] = useState("pending"); // 'pending' | 'activity'
      const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
      const [activePitchFilter, setActivePitchFilter] = useState("Tất cả");
      const [selectedVenueSlot, setSelectedVenueSlot] = useState(null);

      // --- BACKEND API SYNCHRONIZATION LAYER ---
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

      // Enforce a strict 8-second timeout for server responses to maintain UX speed
      const fetchWithTimeout = async (url, options = {}, timeoutMs = 8000) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeoutMs);
        try {
          const response = await fetch(url, {
            ...options,
            signal: controller.signal
          });
          clearTimeout(id);
          return response;
        } catch (error) {
          clearTimeout(id);
          throw error;
        }
      };

      const refetchAllData = async () => {
        try {
          const res = await fetchWithTimeout(`${API_BASE}/slots`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0) setSlots(data);
          }
        } catch (e) {
          console.log("Failed to refetch slots (using offline fallback):", e);
        }

        try {
          const res = await fetchWithTimeout(`${API_BASE}/matches`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0) setMatches(data);
          }
        } catch (e) {
          console.log("Failed to refetch matches (using offline fallback):", e);
        }

        try {
          const res = await fetchWithTimeout(`${API_BASE}/venues`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0) {
              setVenues(data);
              const allFields = [];
              data.forEach(v => {
                if (v.fields) {
                  v.fields.forEach(f => {
                    allFields.push({
                      fieldId: f.fieldId,
                      venueId: f.venueId,
                      fieldName: f.fieldName,
                      fieldType: f.fieldType,
                      defaultPrice: f.defaultPrice,
                      status: f.status
                    });
                  });
                }
              });
              if (allFields.length > 0) setFields(allFields);
            }
          }
        } catch (e) {
          console.log("Failed to refetch venues (using offline fallback):", e);
        }

        try {
          const token = localStorage.getItem("authToken");
          if (token) {
            const res = await fetchWithTimeout(`${API_BASE}/notifications`, {
              headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
              const data = await res.json();
              if (data) setNotifications(data);
            }
          }
        } catch (e) {
          console.log("Failed to refetch notifications (using offline fallback):", e);
        }
      };

      useEffect(() => {
        refetchAllData();
        // Set up polling interval to keep multi-browser clients in sync
        const interval = setInterval(refetchAllData, 10000);
        return () => clearInterval(interval);
      }, []);

      // Venue Edit States
      const [editVenueName, setEditVenueName] = useState("");
      const [editVenueAddress, setEditVenueAddress] = useState("");
      const [editVenueDistrict, setEditVenueDistrict] = useState("Thủ Đức");
      const [editVenuePhone, setEditVenuePhone] = useState("");
      const [editVenueFacilities, setEditVenueFacilities] = useState([]);
      const [editVenueStartHour, setEditVenueStartHour] = useState(6);
      const [editVenueEndHour, setEditVenueEndHour] = useState(24);

      // Field Add States
      const [addFieldName, setAddFieldName] = useState("");
      const [addFieldType, setAddFieldType] = useState("Sân 5");
      const [addFieldPrice, setAddFieldPrice] = useState(300000);   // legacy, kept for compat
      const [addFieldPrice60, setAddFieldPrice60] = useState(200000);  // giá 60 phút
      const [addFieldPrice90, setAddFieldPrice90] = useState(300000);  // giá 90 phút
      const [addFieldPrice120, setAddFieldPrice120] = useState(400000); // giá 120 phút
      const [addFieldStatus, setAddFieldStatus] = useState("active");

      // Recurring Add States
      const [recTeamName, setRecTeamName] = useState("");
      const [recDayOfWeek, setRecDayOfWeek] = useState(2); // Tuesday
      const [recFieldId, setRecFieldId] = useState("");
      const [recStartTime, setRecStartTime] = useState("18:00");
      const [recEndTime, setRecEndTime] = useState("20:00");

      // Redesigned booking tab filter states
      const [bookingDistrict, setBookingDistrict] = useState("Tất cả");
      const [bookingDate, setBookingDate] = useState("Hôm nay");
      const [bookingCustomDate, setBookingCustomDate] = useState("");
      const [bookingTime, setBookingTime] = useState("Tất cả");
      const [bookingDuration, setBookingDuration] = useState("Tất cả"); // Tất cả, 60 phút, 90 phút, 120 phút
      const [bookingPitchType, setBookingPitchType] = useState("Tất cả");
      const [selectedBookingSlot, setSelectedBookingSlot] = useState(null);
      const [bookingInternalModalOpen, setBookingInternalModalOpen] = useState(false);
      const [fullScheduleVenue, setFullScheduleVenue] = useState(null);
      const [viewHoldingVenue, setViewHoldingVenue] = useState(null);
      const [isBookingFilterExpanded, setIsBookingFilterExpanded] = useState(false);
      const [expandedVenueId, setExpandedVenueId] = useState(null);
      const [expandedVenueType, setExpandedVenueType] = useState(null); // 'available' or 'holding'

      const [hourlySaleRules, setHourlySaleRules] = useState(() => {
        return getStorageItem("hourlySaleRules", [
          { id: "rule_1", startTime: "06:00", endTime: "08:30", discountPercent: 20, label: "Ưu đãi sáng sớm (Sale 20%)" },
          { id: "rule_2", startTime: "12:00", endTime: "15:30", discountPercent: 30, label: "Ưu đãi giờ trưa (Sale 30%)" }
        ]);
      });

      const [notifications, setNotifications] = useState(() => {
        const saved = getStorageItem("global_notifications");
        if (saved) return saved;
        return []; // Welcome notification sent on first registration with recipientPhone
      });
      // Badge đỏ chỉ tính: thông báo ACTION chưa xử lý
      const unreadCount = notifications.filter(n => (!n.recipientPhone || (currentUser && n.recipientPhone === currentUser.phone)) && n.actionRequired && n.status === 'pending').length;

      const dispatchNotification = (notification) => {
        setNotifications(prev => [{
          ...notification,
          id: 'notif_' + Date.now() + Math.random().toString(36).substring(2, 9),
          createdAt: Date.now(),
          isRead: false
        }, ...prev]);
      };
      const [upcomingSubTab, setUpcomingSubTab] = useState("created"); // 'created' | 'joined'
      
      // Pagination States
      const [matchPage, setMatchPage] = useState(1);
      const [venuePage, setVenuePage] = useState(1);
      const [teamPage, setTeamPage] = useState(1);
      const [ownerBookingPage, setOwnerBookingPage] = useState(1);
      const [fieldsPage, setFieldsPage] = useState(1);
      const ITEMS_PER_PAGE = 5;

      useEffect(() => {
        try { localStorage.setItem("activeRoleMode", activeRoleMode); } catch {}
        if (activeRoleMode === "admin") {
          setCurrentTab("admin_tong_quan");
        } else if (activeRoleMode === "chủ sân") {
          setCurrentTab("owner_tong_quan");
        } else {
          setCurrentTab("keo");
        }
      }, [activeRoleMode]);

      useEffect(() => {
        setMatchPage(1);
        setVenuePage(1);
        setTeamPage(1);
      }, [filterDistrict, filterTime, filterCustomDate, filterPitchType, activeQuickAction]);
      
      // Pitch Owners State (Only approved phone numbers can post empty slots/schedules)
      const [pitchOwners, setPitchOwners] = useState(() => getStorageItem("pitchOwners", ["0901234567", "0912345678", "0923456789", "0987654321"]));

      // Modal/Form States
      const [selectedMatch, setSelectedMatch] = useState(null);
      const [modalType, setModalType] = useState(null); // 'join' | 'receive' | 'create_slot' | 'create_team' | 'create_match_from_slot' | 'invite' | null
      const [modalData, setModalData] = useState(null); // custom context for active modal
      const [expandedTeamId, setExpandedTeamId] = useState(null);
      const [expandedJoinRequests, setExpandedJoinRequests] = useState(true);
      const [expandedMembersList, setExpandedMembersList] = useState(true);

      const isVenueOwnerGlobal = currentUser && (currentUser?.roles?.includes("super_admin") || venues.some(v => v.owner_user_id === currentUser.id && v.verification_status === 'verified'));

      // Realtime Activity Notification Ticker
      const dynamicLiveEventsText = useMemo(() => {
        let events = [];
        const sortedMatches = [...matches].sort((a,b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        sortedMatches.slice(0, 10).forEach(m => {
          if (m.status === 'Thiếu người') {
            events.push(`🔥 TUYỂN CẦU: Đội ${m.teamName || 'một đội'} đang tuyển thêm ${m.missingCount || 1} cầu lẻ tại ${m.venue || 'sân'}!`);
          } else if (m.status === 'Cần đối' || m.status === 'waiting_opponent' || m.status === 'pending_confirmation') {
            events.push(`⚡ TÌM ĐỐI: Đội ${m.teamName || 'một đội'} đang chờ đối giao lưu trình ${m.level || 'vui vẻ'} tại ${m.district || ''}.`);
          } else if (m.status === 'confirmed') {
            events.push(`🤝 CHỐT KÈO: Trận đấu giữa ${m.teamName} và đối thủ đã được chốt thành công!`);
          } else if (m.status === 'completed') {
            events.push(`✅ KẾT THÚC: Trận đấu của ${m.teamName} đã diễn ra thành công tốt đẹp.`);
          }
        });
        
        const sortedSlots = [...slots].sort((a,b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        sortedSlots.slice(0, 5).forEach(s => {
          if (s.status === "Đang trống") {
            events.push(`🏟️ TẠO SÂN MỚI: ${s.venueName || 'Một sân'} vừa cập nhật giờ trống lúc ${s.timeSlot || 'hôm nay'}!`);
          }
        });

        if (events.length === 0) {
          events = MOCK_LIVE_EVENTS;
        } else {
          events = [...events, ...MOCK_LIVE_EVENTS]; // mix with mock to make it longer
        }
        
        return events.join("  •  ");
      }, [matches, slots]);

      // Persist States to LocalStorage
      useEffect(() => {
        setStorageItem("matches", matches);
      }, [matches]);

      useEffect(() => {
        setStorageItem("global_notifications", notifications);
      }, [notifications]);

      useEffect(() => {
        setStorageItem("slots", slots);
      }, [slots]);

      useEffect(() => {
        setStorageItem("hourlySaleRules", hourlySaleRules);
      }, [hourlySaleRules]);

      useEffect(() => {
        setStorageItem("teams", teams);
      }, [teams]);

      // One-time self-healing trigger to clean mock matches and reset slots as requested by the user
      useEffect(() => {
        const hasCleanedMockups = localStorage.getItem("cleaned_mockups_v2");
        if (!hasCleanedMockups) {
          // Clear matches
          setMatches([]);
          setStorageItem("matches", []);
          
          // Clear venues to only have v_casau
          const filteredVenues = [
            {
              id: "v_casau",
              owner_user_id: "u_0901111112",
              name: "Sân Cá Sấu Hoa Cà",
              address: "123 Phạm Văn Đồng, Thủ Đức",
              district: "Thủ Đức",
              phone: "0901111112",
              images: "stadium1",
              verification_status: "verified",
              capacities: { '5': 3, '7': 2, '11': 1 },
              combinations: [{ target: '7A', parts: ['5A', '5B'] }],
              notes: "Sân nhà của chủ tài khoản mặc định.",
              facilities: ["📷 Camera sân", "⚖️ Thuê trọng tài", "🌧️ Cập nhật thời tiết", "📡 Livestream", "🏟️ Mái che", "👕 Thuê áo bib", "👟 Thuê giày", "🥇 Hay tổ chức giải"],
              activeStartHour: 6,
              activeEndHour: 24
            }
          ];
          setVenues(filteredVenues);
          setStorageItem("venues", filteredVenues);

          // Clear fields to only have v_casau fields
          const filteredFields = [
            { fieldId: "f_casau_5a", venueId: "v_casau", fieldName: "Sân 5A", fieldType: "Sân 5", defaultPrice: 270000, price60: 180000, price90: 270000, price120: 350000, status: "active" },
            { fieldId: "f_casau_5b", venueId: "v_casau", fieldName: "Sân 5B", fieldType: "Sân 5", defaultPrice: 270000, price60: 180000, price90: 270000, price120: 350000, status: "active" },
            { fieldId: "f_casau_7a", venueId: "v_casau", fieldName: "Sân 7A", fieldType: "Sân 7", defaultPrice: 480000, price60: 320000, price90: 480000, price120: 620000, status: "active" },
          ];
          setFields(filteredFields);
          setStorageItem("fields", filteredFields);
          
          // Reset slots to only have v_casau fields
          const newSlots = generateSlotsForFields(filteredFields, filteredVenues, []);
          setSlots(newSlots);
          setStorageItem("slots", newSlots);
          
          // Reset recurring blocks
          setRecurringBlocks([]);
          setStorageItem("recurringBlocks", []);

          // Clear mock venue owners
          setUsers(prev => prev.filter(u => !["0908765432", "0918765432", "0928765432"].includes(u.phone)));
          
          localStorage.setItem("cleaned_mockups_v2", "true");
        }
      }, []);

      useEffect(() => {
        setStorageItem("user", currentUser);
      }, [currentUser]);

      useEffect(() => {
        setStorageItem("pitchOwners", pitchOwners);
      }, [pitchOwners]);

      useEffect(() => {
        setStorageItem("users", users);
      }, [users]);

      useEffect(() => {
        setStorageItem("venues", venues);
      }, [venues]);

      useEffect(() => {
        setStorageItem("fields", fields);
      }, [fields]);

      useEffect(() => {
        setStorageItem("recurringBlocks", recurringBlocks);
      }, [recurringBlocks]);

      useEffect(() => {
        if (currentUser) {
          const myVenue = venues.find(v => v.phone === currentUser.phone || v.owner_user_id === currentUser.id);
          if (myVenue) {
            setEditVenueName(myVenue.name || "");
            setEditVenueAddress(myVenue.address || "");
            setEditVenueDistrict(myVenue.district || "Thủ Đức");
            setEditVenuePhone(myVenue.phone || "");
            setEditVenueFacilities(myVenue.facilities || ["📷 Camera sân", "⚖️ Thuê trọng tài", "🌧️ Cập nhật thời tiết", "📡 Livestream", "🏟️ Mái che", "👕 Thuê áo bib", "👟 Thuê giày", "🥇 Hay tổ chức giải"]);
            setEditVenueStartHour(myVenue.activeStartHour !== undefined ? myVenue.activeStartHour : 6);
            setEditVenueEndHour(myVenue.activeEndHour !== undefined ? myVenue.activeEndHour : 24);
          }
        }
      }, [currentUser, venues]);

      


      // Real-time slot reservation expiration cleaner (ticks every 5 seconds)
      useEffect(() => {
        const interval = setInterval(() => {
          const now = new Date();
          let slotsChanged = false;
          let matchesChanged = false;

          setSlots(prevSlots => {
            const nextSlots = prevSlots.map(s => {
              if (s.status === 'on_hold' && s.hold_expires_at && now > new Date(s.hold_expires_at)) {
                slotsChanged = true;
                return { ...s, status: 'available', hold_expires_at: null };
              }
              return s;
            });
            return slotsChanged ? nextSlots : prevSlots;
          });

          setMatches(prevMatches => {
            const nextMatches = prevMatches.map(m => {
              const nowTime = now.getTime();
              const startTime = parseMatchStartTime(m.time, m.rawTime);
              
              // Auto-resolve reported attendance (Timeout: 1 minute for testing, normally 60 mins)
              if (m.requests && m.requests.some(r => r.isReported)) {
                let changed = false;
                let reqs = m.requests.map(r => {
                  if (r.isReported && r.reportedAt && nowTime - r.reportedAt > 1 * 60 * 1000) {
                    // Auto approve
                    changed = true;
                    // Trigger handleReportAction equivalent logic here via setTimeout to avoid state update during render loop
                    setTimeout(() => handleReportAction(m.id, r.id, 'approve'), 0);
                    return { ...r, isReported: false };
                  }
                  return r;
                });
                if (changed) {
                   m = { ...m, requests: reqs };
                }
              }
              
              // EXPIRATION LOGIC FOR OPEN MATCHES
              if (startTime && (m.status === 'waiting_opponent' || m.status === 'Thiếu người')) {
                const sixtyMins = 60 * 60 * 1000;
                let isNowExpired = false;
                
                if (m.status === 'Thiếu người') {
                  // Tuyển lẻ: expires 60 mins before start
                  if (nowTime > startTime - sixtyMins) {
                    isNowExpired = true;
                  }
                } else if (m.status === 'waiting_opponent') {
                  // Tìm đối: 
                  const createdAt = m.created_at ? new Date(m.created_at).getTime() : 0;
                  const isCreatedLastMinute = (startTime - createdAt) < sixtyMins;
                  
                  if (isCreatedLastMinute) {
                    // Created last minute: expires 15 mins after creation
                    if (nowTime > createdAt + 15 * 60 * 1000) {
                      isNowExpired = true;
                    }
                  } else {
                    // Created normally: expires 60 mins before start
                    if (nowTime > startTime - sixtyMins) {
                      isNowExpired = true;
                    }
                  }
                }

                if (isNowExpired) {
                  matchesChanged = true;
                  return { ...m, status: 'expired' };
                } else {
                  // GỢI Ý KÈO PHÙ HỢP (KHI CHƯA HẾT HẠN)
                  const createdAt = m.created_at ? new Date(m.created_at).getTime() : 0;
                  const hasAcceptedRequests = m.requests && m.requests.some(r => r.status === 'accepted');
                  
                  if (nowTime > createdAt + sixtyMins && !hasAcceptedRequests) {
                    const lastSuggested = m.lastSuggestedAt || 0;
                    if (nowTime > lastSuggested + sixtyMins) {
                      const ignoredIds = m.ignoredSuggestions || [];
                      const similarMatches = prevMatches.filter(sim => {
                        if (sim.id === m.id) return false;
                        if (sim.status !== 'waiting_opponent' && sim.status !== 'Thiếu người') return false;
                        if (sim.adminContact === m.adminContact) return false;
                        if (ignoredIds.includes(sim.id)) return false;
                        if (sim.pitchType !== m.pitchType) return false;
                        
                        const simStartTime = parseMatchStartTime(sim.time, sim.rawTime || sim.rawDate);
                        if (!simStartTime) return false;
                        if (Math.abs(startTime - simStartTime) > sixtyMins) return false;
                        
                        return true;
                      });

                      if (similarMatches.length > 0) {
                        matchesChanged = true;
                        if (m.adminContact) {
                          setTimeout(() => {
                            setNotifications(prevAct => {
                              const newAct = {
                                id: 'notif_sugg_' + Date.now() + '_' + m.id,
                                type: 'suggestion',
                                relatedMatchId: m.id,
                                recipientPhone: m.adminContact,
                                title: `💡 Gợi ý kèo phù hợp`,
                                message: `Có ${similarMatches.length} kèo phù hợp với kèo lúc ${m.time.split(' ')[0]} của bạn. Nhấn để xem và mời giao hữu ngay!`,
                                createdAt: Date.now(),
                                isRead: false,
                                actionRequired: false,
                                status: 'resolved',
                                suggestedMatches: similarMatches.map(s => s.id)
                              };
                              return [newAct, ...prevAct];
                            });
                          }, 0);
                        }
                        return { ...m, lastSuggestedAt: nowTime };
                      }
                    }
                  }
                }
              }

              // HOLD EXPIRATION FOR SLOTS
              if ((m.status === 'waiting_opponent' || m.status === 'pending_confirmation') && m.venue_slot_id) {
                const associatedSlot = slots.find(s => s.id === m.venue_slot_id);
                if (associatedSlot && associatedSlot.status === 'on_hold' && associatedSlot.hold_expires_at && now > new Date(associatedSlot.hold_expires_at)) {
                  matchesChanged = true;
                  // Notify owner: keo het han khong co doi
                  if (m.adminContact) {
                    setTimeout(() => {
                      setNotifications(prevAct => {
                        const already = prevAct.some(n => n.type === 'match_expired' && n.relatedMatchId === m.id);
                        if (!already) {
                          return [{
                            id: 'notif_expired_' + Date.now(),
                            type: 'match_expired',
                            relatedMatchId: m.id,
                            recipientPhone: m.adminContact,
                            title: '⏰ Kèo hết hạn, chưa có đội nhận',
                            message: '❌ Kèo đấu lúc ' + (m.time || '').split(' ')[0] + ' tại ' + (m.venue || m.district) + ' đã hết hạn mà chưa có đội nào nhận. Bạn có thể đăng kèo mới khác.',
                            createdAt: Date.now(),
                            isRead: false,
                            actionRequired: false,
                            status: 'resolved'
                          }, ...prevAct];
                        }
                        return prevAct;
                      });
                    }, 0);
                  }
                  return { ...m, status: 'expired' };
                }
              }

              if (m.status === 'confirmed' || m.status === 'Đã chốt kèo') {
                let endTime = parseMatchEndTimeMs(m.time, m.rawTime || m.rawDate);
                if (!endTime) endTime = startTime ? startTime + 90 * 60 * 1000 : null;

                // NHAC NHO 60 PHUT TRUOC GIO DAU
                const sixtyMins = 60 * 60 * 1000;
                if (startTime && nowTime >= startTime - sixtyMins && nowTime < startTime) {
                  setTimeout(() => {
                    setNotifications(prevAct => {
                      const alreadyReminded = prevAct.some(n => n.type === 'match_reminder' && n.relatedMatchId === m.id);
                      if (!alreadyReminded) {
                        const toNotify = new Set();
                        if (m.adminContact) toNotify.add(m.adminContact);
                        (m.requests || []).filter(r => r.status === 'accepted').forEach(r => { if (r.phone) toNotify.add(r.phone); });
                        const reminders = [...toNotify].map(phone => ({
                          id: 'notif_reminder_' + Date.now() + '_' + phone,
                          type: 'match_reminder',
                          relatedMatchId: m.id,
                          recipientPhone: phone,
                          title: '⚽ Còn 60 phút nữa tới giờ đấu!',
                          message: '🏗️ Nhắc nhở: Trận đấu của ' + m.teamName + ' lúc ' + (m.time || '').split(' ')[0] + ' tại ' + (m.venue || m.district) + ' sắp bắt đầu. Hãy chuẩn bị đi nhé!',
                          createdAt: Date.now(),
                          isRead: false,
                          actionRequired: false,
                          status: 'resolved'
                        }));
                        return [...reminders, ...prevAct];
                      }
                      return prevAct;
                    });
                  }, 0);
                }
                
                // Complete match immediately after end time
                if (endTime && nowTime >= endTime) {
                  matchesChanged = true;
                  setTimeout(() => {
                    setTeams(prevTeams => {
                      let t1Id = m.team_id;
                      let t2Id = null;
                      const req = (m.requests || []).find(r => r.status === 'accepted');
                      if (req) t2Id = req.requester_team_id;
                      
                      return prevTeams.map(t => {
                        if (t.id === t1Id || t.id === t2Id) {
                          return { ...t, matchCount: (t.matchCount || 0) + 1 };
                        }
                        return t;
                      });
                    });
                    
                    // Thong bao tran hoan thanh & Yeu cau danh gia
                    setNotifications(prevAct => {
                      const alreadyNotified = prevAct.some(n => n.type === 'match_completed' && n.relatedMatchId === m.id);
                      if (!alreadyNotified) {
                        const newNotifs = [];
                        const toNotify = new Set();
                        if (m.adminContact) toNotify.add(m.adminContact);
                        (m.requests || []).filter(r => r.status === 'accepted').forEach(r => { if (r.phone) toNotify.add(r.phone); });
                        
                        [...toNotify].forEach(phone => {
                          // match_completed (Activity)
                          newNotifs.push({
                            id: 'notif_comp_' + Date.now() + '_' + phone,
                            type: 'match_completed',
                            relatedMatchId: m.id,
                            recipientPhone: phone,
                            title: 'Trận đấu hoàn thành',
                            message: `Trận đấu lúc ${(m.time || '').split(' ')[0]} tại ${m.venue || m.district} đã kết thúc.`,
                            createdAt: Date.now(),
                            isRead: false,
                            actionRequired: false,
                            status: 'resolved'
                          });
                          
                          // review_request (Action)
                          newNotifs.push({
                            id: 'notif_rev_' + Date.now() + '_' + phone,
                            type: 'review_request',
                            relatedMatchId: m.id,
                            recipientPhone: phone,
                            title: '⭐ Đánh giá đối thủ',
                            message: `Hãy dành chút thời gian đánh giá đối thủ trong trận đấu vừa qua để xây dựng cộng đồng tốt hơn!`,
                            createdAt: Date.now(),
                            isRead: false,
                            actionRequired: true,
                            status: 'pending'
                          });
                        });
                        
                        return [...newNotifs, ...prevAct];
                      }
                      return prevAct;
                    });
                  }, 0);
                  
                  return { ...m, status: 'completed' };
                }
              }

              if (m.status === 'completed') {
                let endTime = parseMatchEndTimeMs(m.time, m.rawTime || m.rawDate);
                if (!endTime) endTime = startTime ? startTime + 90 * 60 * 1000 : null;
                
                if (m.resultStatus === 'waiting_opponent' && m.resultDeadline) {
                  if (now > new Date(m.resultDeadline)) {
                    matchesChanged = true;
                    return { ...m, resultStatus: 'not_enough_confirmation' };
                  }
                }
                if ((!m.resultStatus || m.resultStatus === 'pending') && endTime) {
                  if (nowTime > endTime + 25 * 60 * 60 * 1000) { // 24 hours after completion
                    matchesChanged = true;
                    return { ...m, resultStatus: 'no_result' };
                  }
                }
              }

              return m;
            });
            return matchesChanged ? nextMatches : prevMatches;
          });
        }, 5000);

        return () => clearInterval(interval);
      }, [slots, matches]);

      // --- FILTERS LOGIC ---
      const checkMatchDate = (matchDateStr, matchTimeStr, targetFilter, customDateStr) => {
        const mDate = String(matchDateStr || "").trim();
        const mTime = String(matchTimeStr || "").trim();

        const today = new Date();
        const tomorrow = new Date(Date.now() + 86400000);
        
        const pad = (n) => String(n).padStart(2, '0');
        const formatDMY = (d) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
        const formatDM = (d) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
        const formatYMD = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

        const todayDMY = formatDMY(today);
        const todayDM = formatDM(today);
        const todayYMD = formatYMD(today);

        const tomorrowDMY = formatDMY(tomorrow);
        const tomorrowDM = formatDM(tomorrow);
        const tomorrowYMD = formatYMD(tomorrow);

        // Resolve relative day labels
        let isToday = mDate === "Hôm nay" || mTime.includes("Hôm nay") || mDate === todayYMD || mDate === todayDMY;
        let isTomorrow = mDate === "Ngày mai" || mTime.includes("Ngày mai") || mDate === tomorrowYMD || mDate === tomorrowDMY;

        // Fallback checks for string dates
        if (!isToday && (mDate.includes("/") || mTime.includes("/"))) {
          if (mDate === todayDMY || mTime.includes(todayDMY) || mTime.includes(todayDM)) {
            isToday = true;
          }
        }
        if (!isTomorrow && (mDate.includes("/") || mTime.includes("/"))) {
          if (mDate === tomorrowDMY || mTime.includes(tomorrowDMY) || mTime.includes(tomorrowDM)) {
            isTomorrow = true;
          }
        }

        if (targetFilter === "Hôm nay") return isToday;
        if (targetFilter === "Ngày mai") return isTomorrow;
        
        if (targetFilter === "Cuối tuần") {
          let dayOfWeek = -1;
          if (isToday) dayOfWeek = today.getDay();
          else if (isTomorrow) dayOfWeek = tomorrow.getDay();
          else {
            let parsedDate = null;
            if (mDate.includes("/")) {
              const [d, m, y] = mDate.split("/").map(Number);
              parsedDate = new Date(y, m - 1, d);
            } else if (mDate.includes("-")) {
              const [y, m, d] = mDate.split("-").map(Number);
              parsedDate = new Date(y, m - 1, d);
            }
            if (parsedDate && !isNaN(parsedDate.getTime())) {
              dayOfWeek = parsedDate.getDay();
            }
          }
          return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
        }

        if (targetFilter === "Chọn ngày cụ thể") {
          if (!customDateStr) return true;
          const [yr, mn, dy] = customDateStr.split("-");
          const ddmmyyyy = `${dy}/${mn}/${yr}`;
          const ddmm = `${dy}/${mn}`;

          if (customDateStr === todayYMD && isToday) return true;
          if (customDateStr === tomorrowYMD && isTomorrow) return true;

          return mDate === customDateStr || 
                 mDate === ddmmyyyy || 
                 mTime.includes(ddmmyyyy) || 
                 mTime.includes(ddmm);
        }

        return true;
      };

      const filteredMatches = useMemo(() => {
        return matches.filter(match => {
          // Exclude cancelled matches from general list (expired matches stay to show as dimmed)
          if (match.status === 'cancelled' || match.status === 'Đã hủy') return false;

          // District filter
          if (filterDistrict !== "Tất cả" && match.district !== filterDistrict) return false;
          
          // Time filter
          if (filterTime !== "Tất cả") {
            if (!checkMatchDate(match.rawTime || match.rawDate, match.time, filterTime, filterCustomDate)) {
              return false;
            }
          }
          
          // Pitch type filter
          if (filterPitchType !== "Tất cả" && match.pitchType !== filterPitchType) return false;
          
          // Category filter
          if (filterCategory !== "Tất cả") {
            const mCat = match.category || "Kèo Nam";
            if (mCat !== filterCategory) return false;
          }
          
          // Check if match has ended (using end time) or is completed
          const endTimeMs = parseMatchEndTimeMs(match.time, match.rawTime || match.rawDate) || parseMatchStartTime(match.time, match.rawTime || match.rawDate);
          const isOngoingOrPast = endTimeMs && (Date.now() >= endTimeMs);
          const isCompletedOrConfirmed = match.status === 'completed' || match.status === 'confirmed';
          const shouldHideFromActionFilters = isOngoingOrPast || isCompletedOrConfirmed;
          
          // Quick actions logic
          if (activeQuickAction === "doi") {
            if (
              match.status !== "Cần đối" && 
              match.status !== "Đang chờ xác nhận" && 
              match.status !== "waiting_opponent" && 
              match.status !== "pending_confirmation"
            ) {
              return false;
            }
          }
          if (activeQuickAction === "thieu") {
            if (match.status !== "Thiếu người" && match.status !== "Đã đủ người") return false;
          }
          
          return true;
        });
      }, [matches, filterDistrict, filterTime, filterCustomDate, filterPitchType, filterCategory, activeQuickAction]);

      const filteredSlots = useMemo(() => {
        return slots.filter(slot => {
          // Exclude booked or on_hold slots from public view
          if (slot.status && slot.status !== 'available') return false;

          // Exclude slots that have an active created match associated with them
          const hasActiveMatch = matches.some(m => 
            m.venue_slot_id === slot.id && 
            (m.status === 'waiting_opponent' || m.status === 'pending_confirmation' || m.status === 'confirmed' || m.status === 'Cần đối' || m.status === 'Đang chờ xác nhận')
          );
          if (hasActiveMatch) return false;

          if (filterDistrict !== "Tất cả" && slot.district !== filterDistrict) return false;
          
          if (filterTime !== "Tất cả") {
            if (!checkMatchDate(slot.rawTime || slot.rawDate, slot.timeSlot || slot.time, filterTime, filterCustomDate)) {
              return false;
            }
          }
          
          if (filterPitchType !== "Tất cả" && slot.pitchType !== filterPitchType) return false;
          return true;
        });
      }, [slots, matches, filterDistrict, filterTime, filterCustomDate, filterPitchType]);

      // Dynamic TimeSlot translation/enrichment and mapping logic for redesigned tab
      const bookingTimeSlots = useMemo(() => {
        const durationMap = {
          "60 phút": 2,
          "90 phút": 3,
          "120 phút": 4,
          "Tất cả": 3
        };
        const slotsNeeded = durationMap[bookingDuration] || 3;
        const aggregated = [];

        // Group slots by fieldId and date
        const grouped = {};
        slots.forEach(slot => {
          if (slot.status !== 'available' && slot.status !== 'holding') return;

          // Dynamic lookup: Skip slot if the sub-field con was deleted or set to maintenance (not active)
          const currentField = fields.find(f => f.fieldId === slot.fieldId);
          if (!currentField || currentField.status !== 'active') return;

          // Master Switch: Skip slot if any matching venue (by ID or Name with case-insensitive check) is marked as inactive (Tạm nghỉ)
          const isVenueInactive = venues.some(v => {
            if (v.status !== 'inactive') return false;
            if (v.id === slot.venueId) return true;
            
            const cleanV = (v.name || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/sân\s+/gi, "").replace(/[^a-z0-9]/g, "");
            const cleanS = (slot.venueName || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/sân\s+/gi, "").replace(/[^a-z0-9]/g, "");
            return cleanV === cleanS;
          });
          if (isVenueInactive) return;
          
          const key = `${slot.fieldId}_${slot.date}`;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(slot);
        });

        // Find consecutive sequences
        Object.keys(grouped).forEach(key => {
          // Deduplicate slots by startTime just in case localStorage has duplicates
          const uniqueSlots = {};
          grouped[key].forEach(s => {
            if (!uniqueSlots[s.startTime]) uniqueSlots[s.startTime] = s;
          });
          const list = Object.values(uniqueSlots);
          list.sort((a, b) => a.startTime.localeCompare(b.startTime));

          // Helper to aggregate a consecutive window/block
          const addAggregatedBlock = (window) => {
            const slotsCount = window.length;
            if (slotsCount < 2) return; // Must be at least 60 minutes (2 slots)

            const firstSlot = window[0];
            const lastSlot = window[slotsCount - 1];
            
            const holdingSlot = window.find(s => s.status === 'holding');
            const status = holdingSlot ? 'holding' : 'available';
            
            const associatedMatch = matches.find(m => 
              (m.venue_slot_id === firstSlot.id || m.venue_slot_id === firstSlot.slotId || window.some(s => s.id === m.venue_slot_id)) && 
              !['completed', 'cancelled', 'rejected'].includes(m.status)
            );

            // Get the latest pricing directly from the fields state so that any edits are instantly applied
            const currentField = fields.find(f => f.fieldId === firstSlot.fieldId);
            const basePrice = currentField ? (currentField.price90 || currentField.defaultPrice || 300000) : (firstSlot.price || 300000);
            const p60 = currentField ? currentField.price60 : firstSlot.price60;
            const p90 = currentField ? currentField.price90 : firstSlot.price90;
            const p120 = currentField ? currentField.price120 : firstSlot.price120;

            // Use tiered pricing based on duration
            let totalPrice = 0;
            if (slotsCount === 2) totalPrice = p60 || (basePrice * 2/3);
            else if (slotsCount === 3) totalPrice = p90 || basePrice;
            else if (slotsCount === 4) totalPrice = p120 || (basePrice * 4/3);
            else totalPrice = basePrice * (slotsCount / 3);

            // Apply hourly sale/discount rules for off-peak/empty hours
            let discountedPrice = totalPrice;
            let isSale = false;
            let discountPercent = 0;
            let saleLabel = "";

            if (hourlySaleRules && hourlySaleRules.length > 0) {
              hourlySaleRules.forEach(rule => {
                const [rStartH, rStartM] = rule.startTime.split(':').map(Number);
                const [rEndH, rEndM] = rule.endTime.split(':').map(Number);
                const [sStartH, sStartM] = firstSlot.startTime.split(':').map(Number);
                
                const ruleStart = rStartH * 60 + rStartM;
                const ruleEnd = rEndH * 60 + rEndM;
                const slotStart = sStartH * 60 + sStartM;
                
                if (slotStart >= ruleStart && slotStart < ruleEnd) {
                  isSale = true;
                  discountPercent = rule.discountPercent;
                  saleLabel = rule.label;
                  discountedPrice = Math.round(totalPrice * (1 - rule.discountPercent / 100));
                }
              });
            }
            
            const cleanStringForMatch = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/sân\s+/gi, "").replace(/[^a-z0-9]/g, "").trim();
            const venue = venues.find(v => {
              if (v.id === firstSlot.venueId) return true;
              const cleanV = cleanStringForMatch(v.name);
              const cleanSlotV = cleanStringForMatch(firstSlot.venueName);
              return cleanV === cleanSlotV;
            }) || {
              id: firstSlot.venueId || "v_unknown",
              rating: 4.8,
              distance: "1.5 km"
            };

            const aggId = `agg_${firstSlot.fieldId}_${firstSlot.date.replace(/\//g, '')}_${firstSlot.startTime.replace(':', '')}_${slotsCount}`;

            aggregated.push({
              ...firstSlot,
              id: aggId,
              slotId: aggId,
              venueId: venue.id,
              venueName: venue.name,
              district: venue.district,
              address: venue.address,
              fieldId: firstSlot.fieldId,
              fieldName: currentField ? currentField.fieldName : firstSlot.fieldName, // <--- Link Field Name!
              pitchType: currentField ? currentField.fieldType : firstSlot.pitchType, // <--- Link Pitch Type!
              startTime: firstSlot.startTime,
              endTime: lastSlot.endTime,
              timeSlot: `${firstSlot.startTime} - ${lastSlot.endTime}`,
              duration: slotsCount * 30,
              price: discountedPrice,
              originalPrice: totalPrice,
              isSale: isSale,
              discountPercent: discountPercent,
              saleLabel: saleLabel,
              status: status,
              holdingTeamId: holdingSlot ? holdingSlot.holdingTeamId : null,
              matchId: associatedMatch ? associatedMatch.id : (holdingSlot ? holdingSlot.matchId : null),
              contact: firstSlot.contact,
              notes: holdingSlot ? holdingSlot.notes : `Khung giờ trống tại ${currentField ? currentField.fieldName : firstSlot.fieldName}.`,
              subSlots: window.map(s => s.id),
              rating: venue.rating || 4.8,
              distance: venue.id === 'v_casau' ? '1.2 km' : venue.id === 'v_s1' ? '0.8 km' : '1.5 km'
            });
          };

          // Group into consecutive chunks
          let idx = 0;
          while (idx < list.length) {
            let next = idx;
            while (next < list.length - 1 && list[next].endTime === list[next + 1].startTime) {
              next++;
            }
            
            const group = list.slice(idx, next + 1);
            const groupLen = group.length;

            if (bookingDuration !== "Tất cả") {
              for (let k = 0; k <= groupLen - slotsNeeded; k += slotsNeeded) {
                addAggregatedBlock(group.slice(k, k + slotsNeeded));
              }
            } else {
              // In "Tất cả" mode, dynamically generate best-fitting durations (prefers 90, then 60, then 120)
              let rem = groupLen;
              let k = 0;
              while (rem >= 2) {
                let size = 3;
                if (rem === 2) size = 2;
                else if (rem === 4) size = 4;
                
                addAggregatedBlock(group.slice(k, k + size));
                k += size;
                rem -= size;
              }
            }

            idx = next + 1;
          }
        });

        // Final deduplication pass to ensure no overlapping or identical slot blocks are pushed to the UI
        const dedupedAggregated = [];
        const seenAggSlot = new Set();
        aggregated.forEach(slot => {
          const key = `${slot.fieldId}_${slot.startTime}_${slot.endTime}_${slot.rawTime || slot.date}`;
          if (!seenAggSlot.has(key)) {
            seenAggSlot.add(key);
            dedupedAggregated.push(slot);
          }
        });

        return dedupedAggregated;
      }, [slots, venues, matches, bookingDuration, fields, hourlySaleRules]);

      const filteredBookingSlots = useMemo(() => {
        return bookingTimeSlots.filter(slot => {
          if (bookingDistrict !== "Tất cả") {
            if (slot.district !== bookingDistrict) return false;
          }

          if (bookingDate !== "Tất cả") {
            if (bookingDate === "Chọn ngày cụ thể") {
              if (bookingCustomDate) {
                const todayStr = new Date().toISOString().split('T')[0];
                const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
                
                let slotDateStr = slot.rawTime || slot.rawDate;
                if (slotDateStr === "Hôm nay") slotDateStr = todayStr;
                else if (slotDateStr === "Ngày mai") slotDateStr = tomorrowStr;

                if (slotDateStr !== bookingCustomDate) {
                  const [yr, mn, dy] = bookingCustomDate.split("-");
                  const ddmmyyyy = `${dy}/${mn}/${yr}`;
                  const ddmm = `${dy}/${mn}`;
                  const isTextMatch = slot.timeSlot && (slot.timeSlot.includes(ddmmyyyy) || slot.timeSlot.includes(ddmm));
                  if (!isTextMatch) return false;
                }
              }
            } else {
              if (slot.rawTime !== bookingDate && slot.rawDate !== bookingDate) {
                return false;
              }
            }
          }

          if (bookingTime !== "Tất cả") {
            const startHour = slot.startTime ? (parseInt(slot.startTime.split(':')[0]) || 0) : 0;
            if (bookingTime === "Sáng") {
              if (startHour < 5 || startHour >= 12) return false;
            } else if (bookingTime === "Chiều") {
              if (startHour < 12 || startHour >= 17) return false;
            } else if (bookingTime === "Tối") {
              if (startHour < 17 || startHour >= 22) return false;
            } else if (bookingTime === "Đêm") {
              if (startHour >= 5 && startHour < 22) return false;
            } else {
              // Soft time filter: within 30 minutes of desired hour
              if (slot.startTime) {
                const [selH, selM] = bookingTime.split(':').map(Number);
                const [slotH, slotM] = slot.startTime.split(':').map(Number);
                const selMins = selH * 60 + selM;
                const slotMins = slotH * 60 + slotM;
                if (Math.abs(selMins - slotMins) > 30) return false;
              } else {
                return false;
              }
            }
          }

          if (bookingDuration !== "Tất cả") {
            let targetDuration = 90;
            if (bookingDuration === "60 phút") targetDuration = 60;
            else if (bookingDuration === "90 phút") targetDuration = 90;
            else if (bookingDuration === "120 phút") targetDuration = 120;

            if (slot.duration !== targetDuration) return false;
          }

          if (bookingPitchType !== "Tất cả") {
            if (slot.pitchType !== bookingPitchType) return false;
          }

          return true;
        });
      }, [bookingTimeSlots, bookingDistrict, bookingDate, bookingCustomDate, bookingTime, bookingDuration, bookingPitchType]);

      const filteredTeams = useMemo(() => {
        const filtered = teams.filter(team => {
          if (filterDistrict !== "Tất cả" && team.district !== filterDistrict) return false;
          if (filterTeamSearch.trim() !== "") {
            const query = filterTeamSearch.toLowerCase();
            const teamName = (team.teamName || "").toLowerCase();
            const teamCode = (team.invite_code || "").toLowerCase();
            if (!teamName.includes(query) && !teamCode.includes(query)) return false;
          }
          return true;
        });
        
        return filtered.sort((a, b) => {
          if (sortTeamBy === "Rating") {
            return (b.rating || 4.8) - (a.rating || 4.8);
          } else if (sortTeamBy === "Tỷ lệ bùng kèo") {
            const getBoomRate = (t) => {
               if (!t.totalRatings) return 0;
               return ((t.boomCount || 0) / t.totalRatings) * 100;
            };
            return getBoomRate(a) - getBoomRate(b);
          } else if (sortTeamBy === "Trình") {
            const levelMap = { "Mạnh": 4, "Khá": 3, "Trung bình": 2, "Yếu": 1 };
            const levelA = levelMap[a.level] || 0;
            const levelB = levelMap[b.level] || 0;
            return levelB - levelA;
          }
          return 0;
        });
      }, [teams, filterDistrict, filterTeamSearch, sortTeamBy]);

      const myManagedTeams = useMemo(() => {
        if (!currentUser) return [];
        if (currentUser.roles && currentUser.roles.includes("super_admin")) return teams;
        return teams.filter(t => 
          t.owner_user_id === currentUser.id || 
          (t.members && t.members.some(m => m.user_id === currentUser.id && (m.role === "owner" || m.role === "admin" && m.status === "joined")))
        );
      }, [currentUser, teams]);

      // Reset all filters
      const resetFilters = () => {
        setFilterDistrict("Tất cả");
        setFilterTime("Tất cả");
        setFilterCustomDate("");
        setFilterPitchType("Tất cả");
        setFilterCategory("Tất cả");
        setActiveQuickAction(null);
      };

      // --- ACTIONS HANDLERS ---
      const handleLogin = (e) => {
        e.preventDefault();
        const trimmedPhone = loginPhone.trim();
        if (!trimmedPhone) return;
        
        let targetUser = users.find(u => u.phone === trimmedPhone);
        
        if (trimmedPhone.toLowerCase() === "admin") {
          targetUser = users.find(u => u.phone === "admin") || {
            id: "u_admin",
            name: "Super Admin",
            phone: "admin",
            avatar: "👑",
            roles: ["super_admin", "player"],
            created_at: new Date().toISOString(),
            last_name_change: null,
            name_history: []
          };
          if (!users.some(u => u.phone === "admin")) {
            setUsers(prev => [...prev, targetUser]);
          }
          setCurrentUser(targetUser);
          setLoginName("");
          localStorage.setItem("lastLoginPhone", targetUser.phone || trimmedPhone);
          setLoginStep(1);
          setCurrentTab("keo");
          alert("👑 Chào mừng Super Admin đăng nhập hệ thống!");
          return;
        }

        if (loginStep === 1) {
          if (targetUser) {
            // Đã có tài khoản thì đăng nhập luôn
            setCurrentUser(targetUser);
            setLoginName("");
          localStorage.setItem("lastLoginPhone", targetUser.phone || trimmedPhone);
            setLoginStep(1);
            setCurrentTab("keo");
            alert(`⚽ Đăng nhập thành công! Chào mừng ${targetUser.name} quay lại.`);
          } else {
            // Chưa có tài khoản, sang bước 2 để nhập tên
            setLoginStep(2);
          }
        } else if (loginStep === 2) {
          if (targetUser) {
            // Đề phòng user bấm back xong click lại
            setCurrentUser(targetUser);
            setCurrentTab("keo");
            alert(`⚽ Đăng nhập thành công! Chào mừng ${targetUser.name} quay lại.`);
          } else {
            const finalName = loginName.trim() || `Người chơi ${trimmedPhone.slice(-4)}`;
            const newUser = {
              id: "u_" + Date.now(),
              name: finalName,
              phone: trimmedPhone,
              avatar: "⚽",
              roles: ["player"],
              created_at: new Date().toISOString(),
              last_name_change: null,
              name_history: [],
              playedMatchesCount: 0,
              goalsCount: 0,
              assistCount: 0,
              motmCount: 0,
              rating: 5.0,
              cancellationRate: "0%"
            };
            setUsers(prev => [...prev, newUser]);
            setCurrentUser(newUser);
            // Gửi thông báo chào mừng riêng cho user mới
            setNotifications(prev => [{
              id: 'notif_welcome_' + Date.now(),
              type: 'system',
              recipientPhone: trimmedPhone,
              title: '\u{1f3c6} Ch\u00e0o m\u1eebng ' + finalName + ' \u0111\u1ebfn v\u1edbi K\u00e8o Ph\u1ee7i!',
              message: 'T\u00e0i kho\u1ea3n c\u1ee7a b\u1ea1n \u0111\u00e3 \u0111\u01b0\u1ee3c t\u1ea1o th\u00e0nh c\u00f4ng. H\u00e3y kh\u00e1m ph\u00e1 c\u00e1c k\u00e8o \u0111ang m\u1edf, t\u00ecm \u0111\u1ed9i b\u00f3ng v\u00e0 b\u1eaft \u0111\u1ea7u tr\u1ea3i nghi\u1ec7m \u0111\u00e1 b\u00f3ng c\u00f9ng c\u1ed9ng \u0111\u1ed3ng!',
              createdAt: Date.now(),
              isRead: false,
              actionRequired: false,
              status: 'resolved'
            }, ...prev]);
            setCurrentTab("keo");
            alert('\u26bd \u0110\u0103ng k\u00fd t\u00e0i kho\u1ea3n m\u1edbi th\u00e0nh c\u00f4ng!');
          }
          setLoginName("");
          localStorage.setItem("lastLoginPhone", targetUser.phone || trimmedPhone);
          setLoginStep(1);
        }
      };

      const handleGoogleLoginSuccess = async (googleUser) => {
        const trimmedPhone = googleUser.phone.trim();
        const mockIdToken = `mock_${encodeURIComponent(googleUser.name)}_${googleUser.email}_${encodeURIComponent(googleUser.avatar || '⚽')}`;

        try {
          const response = await fetch(`${API_BASE}/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken: mockIdToken, phone: trimmedPhone })
          });

          if (response.ok) {
            const data = await response.json(); // { token, user }
            localStorage.setItem("authToken", data.token);
            setCurrentUser({
              ...data.user,
              roles: [data.user.role],
              created_at: data.user.createdAt
            });
            alert(`⚽ [Backend] Đăng nhập thành công qua Google! Chào mừng ${data.user.name}.`);
            await refetchAllData();
            localStorage.setItem("lastLoginPhone", trimmedPhone);
            setShowGoogleModal(false);
            setCurrentTab("keo");
            return;
          } else {
            const errData = await response.json();
            throw new Error(errData.error || "Lỗi xác thực!");
          }
        } catch (e) {
          console.error("Backend auth failed, using local mock auth:", e);
        }

        // --- LOCAL MOCK FALLBACK ---
        let targetUser = users.find(u => u.phone === trimmedPhone);
        
        if (targetUser) {
          const updatedUser = {
            ...targetUser,
            email: targetUser.email || googleUser.email,
            name: targetUser.name.startsWith("Người chơi") ? googleUser.name : targetUser.name
          };
          setUsers(prev => prev.map(u => u.id === targetUser.id ? updatedUser : u));
          setCurrentUser(updatedUser);
          alert(`⚽ [Mock] Đăng nhập thành công qua Google! Chào mừng ${updatedUser.name} quay lại.`);
        } else {
          const newUser = {
            id: "u_" + Date.now(),
            name: googleUser.name,
            phone: trimmedPhone,
            email: googleUser.email,
            avatar: googleUser.avatar || "⚽",
            roles: ["player"],
            created_at: new Date().toISOString(),
            last_name_change: null,
            name_history: [],
            playedMatchesCount: 0,
            goalsCount: 0,
            assistCount: 0,
            motmCount: 0,
            rating: 5.0,
            cancellationRate: "0%"
          };
          setUsers(prev => [...prev, newUser]);
          setCurrentUser(newUser);
          setNotifications(prev => [{
            id: 'notif_welcome_' + Date.now(),
            type: 'system',
            recipientPhone: trimmedPhone,
            title: '🏆 Chào mừng ' + googleUser.name + ' đến với Kèo Phủi!',
            message: 'Tài khoản của bạn đã được liên kết với Google thành công. Hãy khám phá các kèo đang mở và bắt đầu giao lưu bóng đá nhé!',
            createdAt: Date.now(),
            isRead: false,
            actionRequired: false,
            status: 'resolved'
          }, ...prev]);
          alert(`⚽ [Mock] Liên kết tài khoản Google & Đăng ký thành công! Chào mừng ${googleUser.name}.`);
        }
        
        localStorage.setItem("lastLoginPhone", trimmedPhone);
        setShowGoogleModal(false);
        setCurrentTab("keo");
      };

      const handleLogout = () => {
        if(confirm("Bạn có chắc muốn đăng xuất?")) {
          if (currentUser && currentUser.phone) {
            setLoginPhone(currentUser.phone);
          }
          setCurrentUser(null);
        }
      };

      const handleUpdateMatchStatus = (matchId, newStatus, extraData = {}) => {
        // Free or Book the associated slot based on new status
        const matchToUpdate = matches.find(m => m.id === matchId);
        if (matchToUpdate && matchToUpdate.venue_slot_id) {
          setSlots(prevSlots => {
            const consolidated = prevSlots.find(s => s.id === matchToUpdate.venue_slot_id || s.slotId === matchToUpdate.venue_slot_id);
            let subs = consolidated?.subSlots || [];
            
            // Self-healing fallback: if subSlots is empty, compute dynamically using overlap helper
            if (subs.length === 0 && consolidated) {
              subs = prevSlots.filter(s => {
                const isSameVenue = s.venueId === consolidated.venueId || (s.venueName && s.venueName.toLowerCase() === consolidated.venueName.toLowerCase());
                const isSameDate = (s.rawTime === consolidated.rawTime) || (s.date === consolidated.rawTime) || (s.rawDate === consolidated.rawTime);
                const isSamePitch = s.pitchType === consolidated.pitchType;
                return isSameVenue && isSameDate && isSamePitch && isTimeOverlapping(s.timeSlot, consolidated.timeSlot);
              }).map(s => s.id);
            }

            return prevSlots.map(s => {
              if (s.id === matchToUpdate.venue_slot_id || s.slotId === matchToUpdate.venue_slot_id || subs.includes(s.id)) {
                if (newStatus === 'Đã hủy' || newStatus === 'cancelled') {
                  return { ...s, status: 'available', customerName: '', customerPhone: '', bookingNotes: '', hold_expires_at: null };
                } else if (newStatus === 'Đã chốt kèo' || newStatus === 'confirmed') {
                  return { 
                    ...s, 
                    status: 'booked',
                    customerName: extraData.pairedWith || "FC Đối Tác",
                    customerPhone: matchToUpdate.phone || "",
                    bookingNotes: `Đã chốt kèo: ${matchToUpdate.teamName} vs ${extraData.pairedWith || "FC Đối Tác"}`
                  };
                }
              }
              return s;
            });
          });
        }

        setMatches(prevMatches => {
          return prevMatches.map(m => {
            if (m.id === matchId) {
              const bCode = m.booking_code || `MC-${Math.floor(100000 + Math.random() * 900000)}`;
              return {
                ...m,
                status: newStatus,
                booking_code: (newStatus === 'Đã chốt kèo' || newStatus === 'confirmed') ? bCode : m.booking_code,
                ...extraData
              };
            }
            return m;
          });
        });
      };

      const handleEditMatch = (matchId, updatedData) => {
        setMatches(prev => prev.map(m => {
          if (m.id === matchId) {
            return {
              ...m,
              time: updatedData.time,
              venue: updatedData.venue,
              district: updatedData.district,
              price: updatedData.price,
              pitchType: updatedData.pitchType,
              needPlayersCount: updatedData.needPlayersCount
            };
          }
          return m;
        }));
      };

      const handleUpdateSlotStatus = (slotId, newStatus, note = "") => {
        setSlots(prev => {
          const targetSlot = prev.find(s => s.id === slotId);
          const subs = targetSlot?.subSlots || [];
          return prev.map(s => {
            if (s.id === slotId || subs.includes(s.id)) {
              return {
                ...s,
                status: newStatus,
                notes: note || (newStatus === 'available' ? `Khung giờ trống tại ${s.fieldName}.` : s.notes)
              };
            }
            return s;
          });
        });
      };

      const handleCancelMatch = (matchId) => {
        const match = matches.find(m => m.id === matchId);
        if (!match) return;

        if (confirm("⚠️ Bạn có chắc chắn muốn hủy trận đấu này? Lịch sân liên quan (nếu có) sẽ được giải phóng tự động về trạng thái trống.")) {
          const reason = prompt("Nhập lý do hủy trận đấu này (không bắt buộc):", "Chủ kèo chủ động hủy trận");
          if (reason !== null) {
            handleUpdateMatchStatus(matchId, 'Đã hủy', { cancelReason: reason || "Chủ kèo chủ động hủy trận" });

            // Notify all parties who sent request (pending or accepted) that the match was cancelled
            const affectedRequests = (match.requests || []).filter(r => r.status === 'pending' || r.status === 'accepted');
            if (affectedRequests.length > 0) {
              const cancelNotifs = affectedRequests.map(r => ({
                id: 'notif_cancel_' + Date.now() + '_' + r.id,
                type: 'match_cancelled',
                relatedMatchId: matchId,
                recipientPhone: r.phone,
                title: `Trận đấu bị huỷ`,
                message: `❌ Chủ kèo ${match.teamName} đã huỷ trận đấu lúc ${(match.time || '').split(' ')[0]}. Lý do: ${reason || 'Chủ kèo chủ động hủy trận'}.`,
                createdAt: Date.now(),
                isRead: false,
                actionRequired: false,
                status: 'resolved'
              }));
              setNotifications(prev => [...cancelNotifs, ...prev]);
            }

            alert("✅ Đã hủy trận đấu thành công!");
            setSelectedMatch(null);
          }
        }
      };

      const handleRateOpponent = (matchId, targetTeamId, ratingValue, matchResult) => {
        setTeams(prevTeams => {
          return prevTeams.map(t => {
            if (t.id === targetTeamId) {
              const currentTotal = t.totalRatings || t.matchCount || 10;
              const currentRating = t.rating || 5.0;
              const newTotal = currentTotal + 1;
              const newRating = ((currentRating * currentTotal) + parseFloat(ratingValue)) / newTotal;
              
              let newCancelRate = t.cancellationRate || '0%';
              if (matchResult === 'noshow') {
                const currentCancelNum = parseInt(newCancelRate.replace('%', ''));
                newCancelRate = Math.min(100, currentCancelNum + 10) + '%';
              }

              return {
                ...t,
                rating: newRating,
                totalRatings: newTotal,
                cancellationRate: newCancelRate
              };
            }
            return t;
          });
        });

        let finalMessage = "✅ Đã nộp đánh giá! Đang chờ đối thủ xác nhận...";

        setMatches(prevMatches => {
          return prevMatches.map(m => {
            if (m.id === matchId) {
              const isOwner = currentUser && m.adminContact === currentUser.phone;
              let newAResult = isOwner ? matchResult : m.teamAResult;
              let newBResult = !isOwner ? matchResult : m.teamBResult;
              let newStatus = m.resultStatus || 'pending';
              let newDeadline = m.resultDeadline;

              if (newAResult && newBResult) {
                let matched = false;
                if (newAResult === 'win' && newBResult === 'lose') matched = true;
                if (newAResult === 'lose' && newBResult === 'win') matched = true;
                if (newAResult === 'draw' && newBResult === 'draw') matched = true;

                if (matched) {
                  newStatus = 'matched';
                  finalMessage = "✅ Đánh giá đã khớp! Kết quả trận đấu đã được ghi nhận.";
                  
                  setTimeout(() => {
                    setTeams(prevTeams => prevTeams.map(t => {
                      const updateWinRateOnly = (teamObj, result) => {
                        const currentMatches = teamObj.matchCount || 1; 
                        let currentWins = Math.round((currentMatches - 1) * (parseFloat(teamObj.winRate) / 100)) || 0;
                        if (isNaN(currentWins)) currentWins = 0;
                        let newWins = currentWins;
                        if (result === 'win') newWins += 1;
                        const newWinRate = Math.round((newWins / currentMatches) * 100) + '%';
                        return { ...teamObj, winRate: newWinRate };
                      };

                      if (t.id === m.team_id) { 
                        return updateWinRateOnly(t, newAResult);
                      }
                      const teamBId = m.requests?.find(r => r.status === 'accepted')?.requester_team_id || m.pairedWithId;
                      if (t.id === teamBId || t.id === targetTeamId) {
                        return updateWinRateOnly(t, newBResult);
                      }
                      return t;
                    }));
                  }, 0);
                  
                } else {
                  newStatus = 'conflict';
                  finalMessage = "⚠️ Kết quả 2 đội đưa ra chưa thống nhất. Hệ thống không tính tỷ lệ thắng/thua.";
                }
              } else {
                newStatus = 'waiting_opponent';
                if (!newDeadline) {
                  newDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
                }
              }

              return {
                ...m,
                isRatedByTeamA: isOwner ? true : m.isRatedByTeamA,
                isRatedByTeamB: !isOwner ? true : m.isRatedByTeamB,
                teamAResult: newAResult,
                teamBResult: newBResult,
                resultStatus: newStatus,
                resultDeadline: newDeadline
              };
            }
            return m;
          });
        });
        
        const targetTeamObj = teams.find(t => t.id === targetTeamId);
        if (targetTeamObj && targetTeamObj.phone) {
          setNotifications(prevAct => [{
            id: 'notif_rev_rec_' + Date.now(),
            type: 'review_received',
            relatedMatchId: matchId,
            recipientPhone: targetTeamObj.phone,
            title: '⭐ Nhận được đánh giá',
            message: `Đối thủ vừa gửi đánh giá và chấm điểm cho đội bóng của bạn.`,
            createdAt: Date.now(),
            isRead: false,
            actionRequired: false,
            status: 'resolved'
          }, ...prevAct]);
        }
        
        alert(finalMessage);
        setModalType(null);
        setSelectedMatch(null);
      };

      const handleCancelRequest = (matchId) => {
        const match = matches.find(m => m.id === matchId);
        if (!match) return;
        if (!currentUser) return;

        if (confirm("⚠️ Bạn có chắc chắn muốn hủy/rút yêu cầu tham gia trận đấu này?")) {
          // 1. Remove the request
          setMatches(prevMatches => {
            return prevMatches.map(m => {
              if (m.id !== matchId) return m;

              const updatedRequests = (m.requests || []).filter(r => r.phone !== currentUser.phone);
              
              // 2. Revert match status
              let newStatus = m.status;
              
              if (m.status === 'pending_confirmation' || m.status === 'Đang chờ xác nhận') {
                const hasPending = updatedRequests.some(r => r.status === 'pending');
                if (!hasPending) {
                  // Revert to original state: 'waiting_opponent' if slot-based, 'Cần đối' if non-slot-based
                  newStatus = m.venue_slot_id ? 'waiting_opponent' : 'Cần đối';
                }
              } else if (m.status === 'Đã đủ người') {
                const maxCount = m.needPlayersCount !== undefined ? m.needPlayersCount : (m.missingCount !== undefined ? m.missingCount : 2);
                const acceptedCount = updatedRequests.filter(r => r.status === 'accepted').reduce((sum, r) => sum + 1 + (parseInt(r.companions) || 0), 0);
                if (acceptedCount < maxCount) {
                  newStatus = 'Thiếu người';
                }
              }

              return {
                ...m,
                requests: updatedRequests,
                status: newStatus
              };
            });
          });

          // 3. Remove match ID from user's joinedMatchIds state in currentUser
          setCurrentUser(prevUser => {
            if (!prevUser) return prevUser;
            return {
              ...prevUser,
              joinedMatchIds: (prevUser.joinedMatchIds || []).filter(id => id !== matchId)
            };
          });

          // 4. Notify match owner that this team/player withdrew their request
          if (match.adminContact && match.adminContact !== currentUser.phone) {
            const myReq = (match.requests || []).find(r => r.phone === currentUser.phone);
            const withdrawerName = (myReq && myReq.teamName) ? myReq.teamName : (currentUser.name || 'Một đội bóng');
            setNotifications(prev => [{
              id: 'notif_withdraw_' + Date.now(),
              type: 'request_withdrawn',
              relatedMatchId: matchId,
              recipientPhone: match.adminContact,
              title: `Đội bóng rút yêu cầu`,
              message: `⚠️ ${withdrawerName} đã rút yêu cầu tham gia trận đấu lúc ${(match.time || '').split(' ')[0]} của bạn.`,
              createdAt: Date.now(),
              isRead: false,
              actionRequired: false,
              status: 'resolved'
            }, ...prev]);
          }

          alert("✅ Đã hủy/rút yêu cầu tham gia thành công!");
          setSelectedMatch(null);
        }
      };

      // Handle Accept / Reject / Move to Waitlist request actions

      // Handle Attendance for free agents
      const handleReportAction = (matchId, requestId, action) => {
        setMatches(prevMatches => {
          return prevMatches.map(m => {
            if (m.id !== matchId) return m;

            let updatedRequests = [...(m.requests || [])];
            const reqIndex = updatedRequests.findIndex(r => r.id === requestId);
            
            if (reqIndex !== -1) {
              const req = updatedRequests[reqIndex];
              
              if (action === 'approve') {
                let currentRating = parseFloat(req.rating) || 4.8;
                let newRating = Math.min(5.0, currentRating + 0.3); // refund 0.2 penalty + 0.1 bonus
                let newMatchesCount = (parseInt(req.matchCount) || 0) + 1;
                let newNoshowCount = Math.max(0, (req.noshowCount || 1) - 1);
                let newCancelRate = newMatchesCount + newNoshowCount > 0 ? Math.round((newNoshowCount / (newMatchesCount + newNoshowCount)) * 100) : 0;

                updatedRequests[reqIndex] = { 
                  ...req, 
                  status: 'present', 
                  isReported: false,
                  rating: newRating.toFixed(1),
                  matchCount: newMatchesCount,
                  noshowCount: newNoshowCount,
                  cancellationRate: newCancelRate + '%'
                };
                
                // Refund stats
                setUsers(prevUsers => prevUsers.map(u => {
                  if (u.phone === req.phone) {
                    const uMatches = u.playedMatchesCount || 0;
                    const uNoshows = u.noshowCount || 1;
                    let uRating = parseFloat(u.rating) || 4.8;
                    
                    let newURating = Math.min(5.0, uRating + 0.3);
                    let newUMatches = uMatches + 1;
                    let newUNoshows = Math.max(0, uNoshows - 1);
                    let newUCancelRate = newUMatches + newUNoshows > 0 ? Math.round((newUNoshows / (newUMatches + newUNoshows)) * 100) : 0;

                    return { 
                      ...u, 
                      playedMatchesCount: newUMatches, 
                      noshowCount: newUNoshows,
                      rating: newURating.toFixed(1),
                      cancellationRate: newUCancelRate + '%'
                    };
                  }
                  return u;
                }));

                // Notify player
                setNotifications(prevAct => [
                  {
                    id: 'notif_' + Date.now(),
                    type: 'report_approved',
                    relatedMatchId: m.id,
                    recipientPhone: req.phone,
                    title: `Khiếu nại được xử lý`,
                    message: `✅ Phản hồi của bạn đã được xử lý. Uy tín của bạn không bị trừ. Cảm ơn bạn.`,
                    createdAt: Date.now(),
                    isRead: false,
                    actionRequired: false,
                    status: 'resolved'
                  },
                  ...prevAct.filter(a => !(a.type === 'report_received' && a.requestId === requestId))
                ]);
                
              } else if (action === 'reject') {
                updatedRequests[reqIndex] = { ...req, isReported: false };
                
                // Notify player
                setNotifications(prevAct => [
                  {
                    id: 'notif_' + Date.now(),
                    type: 'report_rejected',
                    relatedMatchId: m.id,
                    recipientPhone: req.phone,
                    title: `Khiếu nại bị từ chối`,
                    message: `❌ QTV đã từ chối khiếu nại của bạn về trận đấu lúc ${m.time.split(' ')[0]}.`,
                    createdAt: Date.now(),
                    isRead: false,
                    actionRequired: false,
                    status: 'resolved'
                  },
                  ...prevAct.filter(a => !(a.type === 'report_received' && a.requestId === requestId))
                ]);
              }
            }

            return { ...m, requests: updatedRequests };
          });
        });
      };

      const handleAttendanceAction = (matchId, requestId, status) => {
        setMatches(prevMatches => {
          return prevMatches.map(m => {
            if (m.id !== matchId) return m;

            let updatedRequests = [...(m.requests || [])];
            const reqIndex = updatedRequests.findIndex(r => r.id === requestId);
            
            if (reqIndex !== -1) {
              const req = { ...updatedRequests[reqIndex] };
              
              if (status === 'report_noshow') {
                updatedRequests[reqIndex] = { ...req, isReported: true, reportedAt: Date.now() };
                
                setNotifications(prevAct => {
                   let updatedAct = [...prevAct];
                   // 1. Mark old player activity as pending
                   let actIdx = updatedAct.findIndex(a => a.type === 'attendance' && a.requestId === req.id && a.relatedMatchId === m.id);
                   if (actIdx !== -1) {
                     updatedAct[actIdx] = { ...updatedAct[actIdx], status: 'pending', message: 'Đang chờ QTV xử lý...' };
                   }
                   
                   // 2. Push to owner
                   updatedAct.unshift({
                     id: 'notif_' + Date.now(),
                     type: 'report_received',
                     relatedMatchId: m.id,
                     recipientPhone: m.adminContact,
                     requestId: req.id,
                     title: `⚠️ Có khiếu nại!`,
                     message: `Cầu thủ ${req.name} báo cáo CÓ MẶT tại trận đấu. Bạn có xác nhận đổi điểm không?`,
                     createdAt: Date.now(),
                     isRead: false,
                     actionRequired: true,
                     status: 'pending'
                   });
                   return updatedAct;
                });
                
                alert("Đã gửi khiếu nại thành công! QTV hệ thống sẽ kiểm tra.");
                return { ...m, requests: updatedRequests };
              }
              
              // 1. Tự động cập nhật chỉ số của người đăng ký ngay lập tức để hiển thị
              const currentMatches = parseInt(req.matchCount) || 15;
              let currentNoshows = req.noshowCount || 0;
              const currentRating = parseFloat(req.rating) || 4.8;
              
              if (status === 'present') {
                const newMatches = currentMatches + 1;
                req.matchCount = newMatches;
                req.rating = Math.min(5.0, currentRating + 0.1).toFixed(1);
                req.cancellationRate = (newMatches + currentNoshows > 0 ? Math.round((currentNoshows / (newMatches + currentNoshows)) * 100) : 0) + '%';
              } else if (status === 'noshow') {
                currentNoshows += 1;
                req.noshowCount = currentNoshows;
                req.rating = Math.max(1.0, currentRating - 0.2).toFixed(1);
                req.cancellationRate = (currentMatches + currentNoshows > 0 ? Math.round((currentNoshows / (currentMatches + currentNoshows)) * 100) : 0) + '%';
              }

              req.status = status;
              updatedRequests[reqIndex] = req;

              // 2. Cập nhật vào DB người dùng ảo (nếu có)
              setUsers(prevUsers => {
                const newUsers = prevUsers.map(u => {
                  if (u.phone === req.phone) {
                    const uMatches = u.playedMatchesCount || 0;
                    let uNoshows = u.noshowCount || 0;
                    let uRating = parseFloat(u.rating) || 4.8;
                    
                    if (status === 'present') {
                      uRating = Math.min(5.0, uRating + 0.1);
                      const newMatches = uMatches + 1;
                      const newCancelRate = newMatches + uNoshows > 0 ? Math.round((uNoshows / (newMatches + uNoshows)) * 100) : 0;
                      return { ...u, playedMatchesCount: newMatches, rating: uRating.toFixed(1), cancellationRate: newCancelRate + '%' };
                    } else if (status === 'noshow') {
                      uNoshows += 1;
                      uRating = Math.max(1.0, uRating - 0.2);
                      const newCancelRate = uMatches + uNoshows > 0 ? Math.round((uNoshows / (uMatches + uNoshows)) * 100) : 0;
                      return { ...u, noshowCount: uNoshows, cancellationRate: newCancelRate + '%', rating: uRating.toFixed(1) };
                    }
                  }
                  return u;
                });
                
                // Đồng bộ cập nhật vào phiên đang đăng nhập nếu có trùng lặp
                if (currentUser && currentUser.phone === req.phone) {
                  const updatedCurrent = newUsers.find(u => u.phone === currentUser.phone);
                  if (updatedCurrent) {
                    setCurrentUser(updatedCurrent);
                  }
                }
                
                return newUsers;
              });

              // 3. Đẩy thông báo vào lịch sử
              setNotifications(prevAct => {
                const newAct = {
                  id: 'notif_' + Date.now(),
                  type: status === 'present' ? 'attendance' : 'no_show_warning',
                  relatedMatchId: m.id,
                  recipientPhone: req.phone, // Restrict notification to the player only
                  title: status === 'present' ? `Bạn Đã có mặt` : `⚠️ Báo cáo Không tới`,
                  message: `Chủ đội ${m.teamName} đã xác nhận bạn ${status === 'present' ? 'Đã có mặt' : 'Không tới'} trận lúc ${m.time.split(' ')[0]}. ${status === 'present' ? 'Điểm số và uy tín của bạn đã được cộng thêm.' : 'Bạn có thể vào khiếu nại nếu bạn thực sự có mặt.'}`,
                  requestId: req.id,
                  createdAt: Date.now(),
                  isRead: false,
                  actionRequired: status === 'noshow', // Requires action to appeal
                  status: status === 'noshow' ? 'pending' : 'resolved'
                };
                return [newAct, ...prevAct];
              });
            }

            return { ...m, requests: updatedRequests };
          });
        });
      };

      const handleRequestAction = (matchId, requestId, action) => {
        setMatches(prevMatches => {
          return prevMatches.map(m => {
            if (m.id !== matchId) return m;

            let updatedRequests = [...(m.requests || [])];
            const maxCount = m.needPlayersCount !== undefined ? m.needPlayersCount : (m.missingCount !== undefined ? m.missingCount : 2);
            // Declare reqObj here so both accept and reject can use it for notification
            const reqObj = updatedRequests.find(r => r.id === requestId);

            if (action === 'accept') {
              const acceptedCount = updatedRequests.filter(r => r.status === 'accepted').reduce((sum, r) => sum + 1 + (parseInt(r.companions) || 0), 0);
              const reqToAccept = reqObj;
              const totalNeeded = reqToAccept ? 1 + (parseInt(reqToAccept.companions) || 0) : 1;
              if (acceptedCount + totalNeeded > maxCount) {
                alert(`🚫 Trận đấu chỉ còn ${maxCount - acceptedCount} slot, nhưng người chơi này cần tới ${totalNeeded} slot! Không thể đồng ý.`);
                return m;
              }

              updatedRequests = updatedRequests.map(r => {
                if (r.id === requestId) {
                  return { ...r, status: 'accepted' };
                }
                return r;
              });

              // Cancel source match if this request came from a suggestion
              setTimeout(() => {
                if (reqObj.source_match_id) {
                  setMatches(currMatches => currMatches.map(cm => {
                    if (cm.id === reqObj.source_match_id && (cm.status === 'waiting_opponent' || cm.status === 'Thiếu người')) {
                       return { ...cm, status: 'cancelled', cancelReason: 'Đã ghép thành công với kèo khác qua tính năng Gợi ý.' };
                    }
                    return cm;
                  }));
                }
              }, 0);

              // Check if now fully filled
              const newAcceptedCount = updatedRequests.filter(r => r.status === 'accepted').reduce((sum, r) => sum + 1 + (parseInt(r.companions) || 0), 0);
              let newStatus = m.status;
              if (newAcceptedCount >= maxCount) {
                newStatus = "Đã đủ người";
                if (m.venue_slot_id) {
                  setSlots(prevSlots => {
                    const consolidated = prevSlots.find(s => s.id === m.venue_slot_id || s.slotId === m.venue_slot_id);
                    let subs = consolidated?.subSlots || [];
                    
                    // Self-healing fallback
                    if (subs.length === 0 && consolidated) {
                      subs = prevSlots.filter(s => {
                        const isSameVenue = s.venueId === consolidated.venueId || (s.venueName && s.venueName.toLowerCase() === consolidated.venueName.toLowerCase());
                        const isSameDate = (s.rawTime === consolidated.rawTime) || (s.date === consolidated.rawTime) || (s.rawDate === consolidated.rawTime);
                        const isSamePitch = s.pitchType === consolidated.pitchType;
                        return isSameVenue && isSameDate && isSamePitch && isTimeOverlapping(s.timeSlot, consolidated.timeSlot);
                      }).map(s => s.id);
                    }

                    return prevSlots.map(s => {
                      if (s.id === m.venue_slot_id || s.slotId === m.venue_slot_id || subs.includes(s.id)) {
                        return { 
                          ...s, 
                          status: 'booked',
                          customerName: m.teamName || "FC Đặt Sân",
                          customerPhone: m.adminContact || "",
                          bookingNotes: `Đã đủ người chốt kèo: ${m.teamName}`
                        };
                      }
                      return s;
                    });
                  });
                }
              }

              // Notify the other party
              const targetPhone = (currentUser && currentUser.phone === reqObj.phone) ? m.adminContact : reqObj.phone;
              setNotifications(prevAct => [
                {
                  id: 'notif_' + Date.now(),
                  type: 'request_accepted',
                  relatedMatchId: m.id,
                  recipientPhone: targetPhone,
                  title: (currentUser && currentUser.phone === reqObj.phone) ? `Lời mời giao hữu được đồng ý` : `Chấp nhận yêu cầu tham gia`,
                  message: (currentUser && currentUser.phone === reqObj.phone) 
                    ? `✅ Đội ${reqObj.teamName || reqObj.name} đã đồng ý lời mời giao hữu trận đấu lúc ${m.time.split(' ')[0]} của bạn!` 
                    : `✅ Chúc mừng! Chủ đội ${m.teamName} đã đồng ý yêu cầu tham gia trận đấu lúc ${m.time.split(' ')[0]} của bạn.`,
                  createdAt: Date.now(),
                  isRead: false,
                  actionRequired: false,
                  status: 'resolved'
                },
                ...prevAct
              ]);

              alert("✅ Đã đồng ý yêu cầu tham gia! Thông tin liên hệ đã mở cho cả hai bên.");
              return {
                ...m,
                requests: updatedRequests,
                status: newStatus
              };
            } 
            
            if (action === 'reject') {
              const wasAccepted = reqObj && reqObj.status === 'accepted';

              updatedRequests = updatedRequests.map(r => {
                if (r.id === requestId) return { ...r, status: 'rejected' };
                return r;
              });

              if (wasAccepted) {
                // Promote first waitlist player if available
                const firstWaitlistIndex = updatedRequests.findIndex(r => r.status === 'waitlist');
                if (firstWaitlistIndex !== -1) {
                  updatedRequests = updatedRequests.map((r, idx) => {
                    if (idx === firstWaitlistIndex) {
                      alert(`⚡ Cầu thủ dự bị ${r.name} đã tự động được đẩy lên danh sách chính thức (Accepted) để thế chỗ!`);
                      return { ...r, status: 'accepted' };
                    }
                    return r;
                  });
                }
              }

              const newAcceptedCount = updatedRequests.filter(r => r.status === 'accepted').reduce((sum, r) => sum + 1 + (parseInt(r.companions) || 0), 0);
              let newStatus = m.status;
              if (newAcceptedCount < maxCount) {
                newStatus = "Thiếu người";
              }

              // Notify the other party
              const targetPhone = (currentUser && currentUser.phone === reqObj.phone) ? m.adminContact : reqObj.phone;
              setNotifications(prevAct => [
                {
                  id: 'notif_' + Date.now(),
                  type: 'request_rejected',
                  relatedMatchId: m.id,
                  recipientPhone: targetPhone,
                  title: (currentUser && currentUser.phone === reqObj.phone) ? `Từ chối giao hữu` : `Yêu cầu tham gia bị từ chối`,
                  message: (currentUser && currentUser.phone === reqObj.phone)
                    ? `❌ Đội ${reqObj.teamName || reqObj.name} đã từ chối lời mời giao hữu trận đấu lúc ${m.time.split(' ')[0]}.`
                    : `❌ Rất tiếc, chủ đội ${m.teamName} đã từ chối yêu cầu tham gia trận đấu lúc ${m.time.split(' ')[0]} của bạn.`,
                  createdAt: Date.now(),
                  isRead: false,
                  actionRequired: false,
                  status: 'resolved'
                },
                ...prevAct
              ]);

              alert("❌ Đã từ chối yêu cầu tham gia.");
              return {
                ...m,
                requests: updatedRequests,
                status: newStatus
              };
            }

            if (action === 'waitlist') {
              const reqObj = updatedRequests.find(r => r.id === requestId);
              const wasAccepted = reqObj && reqObj.status === 'accepted';

              updatedRequests = updatedRequests.map(r => {
                if (r.id === requestId) return { ...r, status: 'waitlist' };
                return r;
              });

              if (wasAccepted) {
                const firstWaitlistIndex = updatedRequests.findIndex(r => r.status === 'waitlist');
                if (firstWaitlistIndex !== -1) {
                  updatedRequests = updatedRequests.map((r, idx) => {
                    if (idx === firstWaitlistIndex) {
                      alert(`⚡ Cầu thủ dự bị ${r.name} đã tự động được đẩy lên danh sách chính thức (Accepted) để thế chỗ!`);
                      return { ...r, status: 'accepted' };
                    }
                    return r;
                  });
                }
              }

              const newAcceptedCount = updatedRequests.filter(r => r.status === 'accepted').reduce((sum, r) => sum + 1 + (parseInt(r.companions) || 0), 0);
              let newStatus = m.status;
              if (newAcceptedCount < maxCount) {
                newStatus = "Thiếu người";
              }

              alert("⏳ Đã chuyển cầu thủ sang danh sách dự bị (Waitlist).");
              return {
                ...m,
                requests: updatedRequests,
                status: newStatus
              };
            }

            if (action === 'restore') {
              updatedRequests = updatedRequests.map(r => {
                if (r.id === requestId) return { ...r, status: 'pending' };
                return r;
              });
              return { ...m, requests: updatedRequests };
            }

            if (action === 'accept_rival') {
              const bookingCode = `KP-${Math.floor(1000 + Math.random() * 9000)}`;
              
              if (m.venue_slot_id) {
                setSlots(prevSlots => {
                  const consolidated = prevSlots.find(s => s.id === m.venue_slot_id || s.slotId === m.venue_slot_id);
                  let subs = consolidated?.subSlots || [];
                  
                  // Self-healing fallback
                  if (subs.length === 0 && consolidated) {
                    subs = prevSlots.filter(s => {
                      const isSameVenue = s.venueId === consolidated.venueId || (s.venueName && s.venueName.toLowerCase() === consolidated.venueName.toLowerCase());
                      const isSameDate = (s.rawTime === consolidated.rawTime) || (s.date === consolidated.rawTime) || (s.rawDate === consolidated.rawTime);
                      const isSamePitch = s.pitchType === consolidated.pitchType;
                      return isSameVenue && isSameDate && isSamePitch && isTimeOverlapping(s.timeSlot, consolidated.timeSlot);
                    }).map(s => s.id);
                  }

                  return prevSlots.map(s => {
                    if (s.id === m.venue_slot_id || s.slotId === m.venue_slot_id || subs.includes(s.id)) {
                      return { 
                        ...s, 
                        status: 'booked',
                        customerName: reqObj.teamName || reqObj.name || "FC Đối Tác",
                        customerPhone: reqObj.phone || "",
                        bookingNotes: `Đã chốt kèo: ${m.teamName} vs ${reqObj.teamName || reqObj.name || "FC Đối Tác"}`
                      };
                    }
                    return s;
                  });
                });
              }

              updatedRequests = updatedRequests.map(r => {
                if (r.id === requestId) return { ...r, status: 'accepted' };
                return { ...r, status: 'rejected' };
              });
              
              // Notifications & Source Match Cancellation
              setTimeout(() => {
                if (reqObj.source_match_id) {
                  setMatches(currMatches => currMatches.map(cm => {
                    if (cm.id === reqObj.source_match_id && (cm.status === 'waiting_opponent' || cm.status === 'Thiếu người')) {
                       return { ...cm, status: 'cancelled', cancelReason: 'Đã ghép thành công với kèo khác qua tính năng Gợi ý.' };
                    }
                    return cm;
                  }));
                }

                setNotifications(prevAct => {
                  const newNotifs = [];
                  const timeStr = (m.time || '').split(' ')[0];
                  
                  // Notify requester that their request was accepted
                  newNotifs.push({
                    id: 'notif_acc_' + Date.now() + '_' + reqObj.phone,
                    type: 'request_accepted',
                    relatedMatchId: m.id,
                    recipientPhone: reqObj.phone,
                    title: 'Chấp nhận yêu cầu nhận kèo',
                    message: `✅ Đội ${m.teamName} đã đồng ý yêu cầu nhận kèo trận đấu lúc ${timeStr} của bạn.`,
                    createdAt: Date.now(),
                    isRead: false,
                    actionRequired: false,
                    status: 'resolved'
                  });
                  
                  // Notify all parties that match is confirmed
                  const toNotify = new Set();
                  if (m.adminContact) toNotify.add(m.adminContact);
                  if (reqObj.phone) toNotify.add(reqObj.phone);
                  
                  // Also notify the venue owner if the match is linked to a slot
                  if (m.venue_slot_id) {
                    const assocSlot = slots.find(s => s.id === m.venue_slot_id || s.slotId === m.venue_slot_id);
                    if (assocSlot && assocSlot.contact) {
                      toNotify.add(assocSlot.contact);
                    }
                  }
                  
                  [...toNotify].forEach(phone => {
                    newNotifs.push({
                      id: 'notif_conf_' + Date.now() + '_' + phone,
                      type: 'match_confirmed',
                      relatedMatchId: m.id,
                      recipientPhone: phone,
                      title: '🎉 Chốt kèo thành công!',
                      message: `Hai bên đã chốt kèo trận đấu lúc ${timeStr} tại ${m.venue || m.district}.`,
                      createdAt: Date.now(),
                      isRead: false,
                      actionRequired: false,
                      status: 'resolved'
                    });
                  });
                  
                  // Notify rejected teams
                  updatedRequests.filter(r => r.id !== requestId && r.status === 'rejected').forEach(r => {
                    newNotifs.push({
                      id: 'notif_rej_' + Date.now() + '_' + r.phone,
                      type: 'request_rejected',
                      relatedMatchId: m.id,
                      recipientPhone: r.phone,
                      title: 'Yêu cầu bị từ chối',
                      message: `❌ Rất tiếc, đội ${m.teamName} đã chốt kèo với đội khác cho trận đấu lúc ${timeStr}.`,
                      createdAt: Date.now(),
                      isRead: false,
                      actionRequired: false,
                      status: 'resolved'
                    });
                  });
                  
                  return [...newNotifs, ...prevAct];
                });
              }, 0);

              alert(`🎉 CHỐT KÈO THÀNH CÔNG!\n\nMã đặt sân (Booking Code): ${bookingCode}\n\nThông tin liên hệ của 2 đội và chủ sân đã được mở khóa!`);
              return {
                ...m,
                status: 'confirmed',
                booking_code: bookingCode,
                requests: updatedRequests
              };
            }

            if (action === 'reject_rival') {
              updatedRequests = updatedRequests.map(r => {
                if (r.id === requestId) return { ...r, status: 'rejected' };
                return r;
              });

              const hasPending = updatedRequests.some(r => r.status === 'pending');
              const newStatus = hasPending ? 'pending_confirmation' : 'waiting_opponent';

              alert("❌ Đã từ chối yêu cầu nhận kèo. Slot sân vẫn tiếp tục mở để các đội khác nhận!");
              return {
                ...m,
                status: newStatus,
                requests: updatedRequests
              };
            }

            return m;
          });
        });
      };

      const triggerActionWithAuth = (actionType, data) => {
        // Check if user is logged in
        if (!currentUser) {
          // Open Login tab and warn
          setCurrentTab("toi");
          alert("Vui lòng nhập Số điện thoại của bạn ở tab 'Tôi' trước khi thực hiện thao tác này.");
          return;
        }

        const isSuper = currentUser.roles && currentUser.roles.includes("super_admin");

        // Role-based Access Control
        if (actionType === 'create_slot' || actionType === 'edit_slot') {
          const userVenue = venues.find(v => v.owner_user_id === currentUser.id);
          const isVerified = isSuper || (userVenue && userVenue.verification_status === 'verified');
          if (!isVerified) {
            if (userVenue && userVenue.verification_status === 'pending_verification') {
              alert("⏳ YÊU CẦU ĐANG XỬ LÝ!\n\nĐăng ký Chủ Sân của bạn đang chờ phê duyệt. Vui lòng chờ Super Admin xác minh trước khi đăng lịch trống!");
            } else {
              alert("🚫 QUYỀN HẠN BỊ TỪ CHỐI!\n\nChỉ những tài khoản được ADMIN xác nhận là CHỦ SÂN đã xác minh mới được phép đăng lịch và thanh lý sân trống.\n\nVui lòng kéo xuống phần thông tin tài khoản ở tab 'Tôi' và đăng ký Chủ Sân để bắt đầu!");
            }
            return;
          }
        }

        if (actionType === 'create_slot' && !data) {
          const userVenue = venues.find(v => v.owner_user_id === currentUser.id);
          if (userVenue) {
            data = userVenue;
          }
        }

        if (actionType === 'create_missing_player' || actionType === 'create_match_from_slot') {
          const hasManagedTeam = myManagedTeams && myManagedTeams.length > 0;
          if (!isSuper && !hasManagedTeam) {
            alert("🚫 QUYỀN HẠN BỊ TỪ CHỐI!\n\nChỉ Team Owner hoặc Team Admin mới được phép Đăng tuyển cầu lẻ hoặc Đăng tìm đối.\n\nVui lòng Tạo Đội Mới hoặc xin gia nhập đội bóng trước!");
            return;
          }
        }
        
        setModalType(actionType);
        setModalData(data);
      };

      // Handle sending Join Request (Tham gia kèo lẻ)
      const submitJoinForm = (formData) => {
        const { matchId, name, phone, position, note, companions } = formData;
        
        // Prevent duplicate requests
        const targetMatch = matches.find(m => m.id === matchId);
        if (targetMatch && targetMatch.requests && targetMatch.requests.some(r => r.phone === phone)) {
          alert("BẠN ĐÃ ĐĂNG KÝ RỒI. HÃY KIỂM TRA TRONG PHẦN KÈO CỦA TÔI NHÉ.");
          return;
        }

        // Prevent overbooking
        if (targetMatch) {
          const maxCount = targetMatch.needPlayersCount !== undefined ? targetMatch.needPlayersCount : (targetMatch.missingCount !== undefined ? targetMatch.missingCount : 2);
          const acceptedCount = (targetMatch.requests || []).filter(r => r.status === 'accepted').reduce((sum, r) => sum + 1 + (parseInt(r.companions) || 0), 0);
          const totalNeeded = 1 + (parseInt(companions) || 0);
          
          if (totalNeeded > (maxCount - acceptedCount)) {
            alert(`⚠️ Rất tiếc! Sân hiện tại chỉ còn ${Math.max(0, maxCount - acceptedCount)} slot, nhưng nhóm của bạn có tới ${totalNeeded} người.`);
            return;
          }
        }

        let waitlistPosition = 0;
        let isAddedToWaitlist = false;

        // Update matches state to add player to match requests
        setMatches(prevMatches => {
          return prevMatches.map(m => {
            if (m.id === matchId) {
              const maxCount = m.needPlayersCount !== undefined ? m.needPlayersCount : (m.missingCount !== undefined ? m.missingCount : 2);
              const acceptedCount = (m.requests || []).filter(r => r.status === 'accepted').reduce((sum, r) => sum + 1 + (parseInt(r.companions) || 0), 0);
              
              const statusVal = acceptedCount >= maxCount ? 'waitlist' : 'pending';
              if (statusVal === 'waitlist') {
                isAddedToWaitlist = true;
                waitlistPosition = (m.requests || []).filter(r => r.status === 'waitlist').length + 1;
              }

              const newRequest = {
                id: "req_" + Date.now() + "_" + Math.floor(Math.random()*1000),
                name,
                phone,
                position,
                note: note || "Giao lưu vui vẻ xả stress cùng anh em!",
                companions: companions || 0,
                status: statusVal,
                rating: (4.0 + Math.random() * 0.9).toFixed(1),
                createdAt: new Date().toISOString()
              };

              const updatedRequests = [...(m.requests || []), newRequest];
              return { 
                ...m, 
                requests: updatedRequests
              };
            }
            return m;
          });
        });

        // Add to user joined lists
        setCurrentUser(prevUser => {
          const updated = {
            ...prevUser,
            joinedMatchIds: [...new Set([...(prevUser.joinedMatchIds || []), matchId])]
          };
          return updated;
        });

        if (isAddedToWaitlist) {
          alert(`⏳ Trận đấu hiện tại đã nhận đủ người chính thức. Yêu cầu của bạn đã được chuyển vào hàng chờ. Bạn đang ở vị trí dự bị #${waitlistPosition}!`);
        } else {
          // Notify owner
          if (targetMatch && targetMatch.adminContact) {
            setNotifications(prevAct => [
              {
                id: 'notif_' + Date.now(),
                type: 'join_request',
                relatedMatchId: matchId,
                recipientPhone: targetMatch.adminContact,
                title: `Có người xin tham gia`,
                message: `Cầu thủ ${name} muốn xin một suất tham gia trận đấu lúc ${targetMatch.time.split(' ')[0]}. Vui lòng xác nhận!`,
                createdAt: Date.now(),
                isRead: false,
                actionRequired: true,
                status: 'pending'
              },
              ...prevAct
            ]);
          }
          alert("📩 Yêu cầu tham gia đã được gửi. Đang chờ đội xác nhận.");
        }
        closeModal();
      };

      // Handle receiving match (Nhận đối bóng cho cả đội)
      const submitReceiveForm = (formData) => {
        const { matchId, teamId, teamName, representative, phone, level, district, matchCount, rating, note } = formData;

        setMatches(prevMatches => {
          return prevMatches.map(m => {
            if (m.id === matchId) {
              const newRequest = { 
                id: 'req_' + Date.now(),
                requester_team_id: teamId,
                teamName, 
                representative, 
                phone, 
                level, 
                district,
                matchCount,
                rating,
                note, 
                status: 'pending',
                created_at: new Date().toISOString()
              };
              return { 
                ...m, 
                requests: [...(m.requests || []), newRequest],
                status: "pending_confirmation" // pending_confirmation (Có đội gửi yêu cầu)
              };
            }
            return m;
          });
        });

        // Add to user joined list
        setCurrentUser(prevUser => {
          return {
            ...prevUser,
            joinedMatchIds: [...new Set([...(prevUser.joinedMatchIds || []), matchId])]
          };
        });

        // Notify owner
        const targetMatch = matches.find(m => m.id === matchId);
        if (targetMatch && targetMatch.adminContact) {
          setNotifications(prevAct => [
            {
              id: 'notif_' + Date.now(),
              type: 'receive_request',
              relatedMatchId: matchId,
              relatedTeamId: teamId,
              recipientPhone: targetMatch.adminContact,
              title: `Đội bóng nhận kèo`,
              message: `Đội ${teamName} muốn nhận kèo trận đấu lúc ${targetMatch.time.split(' ')[0]}. Vui lòng xác nhận!`,
              createdAt: Date.now(),
              isRead: false,
              actionRequired: true,
              status: 'pending'
            },
            ...prevAct
          ]);
        }

        alert("🤝 Đã gửi yêu cầu nhận đối thành công! Yêu cầu của bạn đã được chuyển tới đội trưởng tạo kèo. Vui lòng chờ họ xét duyệt và phản hồi!");
        closeModal();
      };

      // Handle creating a new pitch slot (Chủ sân đăng giờ trống)
      
      const submitOwnerBookCustomerForm = (formData) => {
        const myVenue = venues.find(v => v.phone === currentUser?.phone || v.owner_user_id === currentUser?.id);
        
        // Check if there is already a booked/holding slot on that specific sub-field
        if (formData.fieldId) {
          const hasConflict = slots.some(s => {
            const isSameVenue = s.venueId === myVenue?.id;
            const isSameDate = (s.rawTime === formData.date) || (s.date === formData.date) || (s.rawDate === formData.date);
            const isSameField = s.fieldId === formData.fieldId;
            const isActive = s.status === 'booked' || s.status === 'holding' || s.status === 'on_hold' || s.status === 'blocked';
            return isSameVenue && isSameDate && isSameField && isActive && isTimeOverlapping(s.timeSlot, formData.timeSlot);
          });
          if (hasConflict) {
            alert("❌ Không thể chốt sân! Sân con này đã có lịch đặt hoặc đang bảo trì vào khung giờ này.");
            return;
          }
        }

        // Find matching 30-minute slots to lock them
        const matchingSubSlots = slots.filter(s => {
          const isSameVenue = s.venueId === myVenue?.id || (s.venueName && s.venueName.toLowerCase() === myVenue?.name.toLowerCase());
          const isSameDate = (s.rawTime === formData.date) || (s.date === formData.date) || (s.rawDate === formData.date);
          const isSameField = formData.fieldId ? (s.fieldId === formData.fieldId) : (s.pitchType === formData.pitchType);
          return isSameVenue && isSameDate && isSameField && isTimeOverlapping(s.timeSlot, formData.timeSlot);
        }).map(s => s.id);

        const newSlot = {
          id: 'slot_' + Date.now(),
          venueId: myVenue ? myVenue.id : "",
          venueName: formData.venueName || (myVenue ? myVenue.name : ""),
          address: myVenue ? myVenue.address : "123 Phạm Văn Đồng, Thủ Đức",
          fieldId: formData.fieldId || "",
          fieldName: formData.fieldName || "",
          timeSlot: formData.timeSlot,
          rawTime: formData.date,
          type: 'booked',
          status: 'booked',
          pitchType: formData.pitchType,
          price: formData.price,
          contact: currentUser.phone,
          customerPhone: formData.customerPhone,
          notes: `Khách: ${formData.customerName} (${formData.customerPhone}). ${formData.notes}`,
          owner_user_id: currentUser.id,
          subSlots: matchingSubSlots // Link matching 30-minute sub-slots
        };

        // Update slots state (append new consolidated slot and lock all matching sub-slots)
        setSlots(prevSlots => {
          const updated = prevSlots.map(s => {
            if (matchingSubSlots.includes(s.id)) {
              return {
                ...s,
                status: 'booked',
                customerName: formData.customerName,
                customerPhone: formData.customerPhone,
                bookingNotes: `Đã được chốt tay bởi chủ sân`
              };
            }
            return s;
          });
          return [newSlot, ...updated];
        });

        setModalType(null);
        alert(`✅ Đã ghi nhận sân ${formData.timeSlot} được chốt bởi khách ${formData.customerName}!`);
        setCurrentTab("owner_ql_san");
      };

      const submitOwnerCreateMatchForm = (formData) => {
        // Validation using Soft Conflict helper
        const myVenue = venues.find(v => v.phone === currentUser.phone || v.owner_user_id === currentUser.id);
        const myCapacities = myVenue?.capacities || { '5': 0, '7': 0, '11': 0 };
        const myCombinations = myVenue?.combinations || [];

        // Check if there is already a booked/holding slot on that specific sub-field
        if (formData.fieldId) {
          const hasConflict = slots.some(s => {
            const isSameVenue = s.venueId === myVenue?.id;
            const isSameDate = (s.rawTime === formData.date) || (s.date === formData.date) || (s.rawDate === formData.date);
            const isSameField = s.fieldId === formData.fieldId;
            const isActive = s.status === 'booked' || s.status === 'holding' || s.status === 'on_hold' || s.status === 'blocked';
            return isSameVenue && isSameDate && isSameField && isActive && isTimeOverlapping(s.timeSlot, formData.time);
          });
          if (hasConflict) {
            alert("❌ Không thể đăng kèo! Sân con này đã có lịch đặt hoặc đang bảo trì vào khung giờ này.");
            return;
          }
        }

        const allDateSlots = slots.filter(s => 
          s.contact === currentUser.phone && 
          (s.rawTime || s.date) === formData.date
        );

        const testSlot = {
          id: 'test_' + Date.now(),
          timeSlot: `${formData.time} ${formData.date}`,
          pitchType: formData.pitchType,
          contact: currentUser.phone
        };

        const { unplacedSlots } = assignSlotsToBins([...allDateSlots, testSlot], myCapacities, myCombinations);

        if (unplacedSlots.some(s => s.id === testSlot.id)) {
           alert("❌ Không thể đăng kèo! Sân này đang bị ảnh hưởng bởi giới hạn số lượng sân hoặc bị khóa do quy tắc Ghép Sân (Sân ghép đã chốt). Vui lòng kiểm tra lại bảng quản lý sân.");
           return;
        }

        // Find matching 30-minute slots to hold them
        const matchingSubSlots = slots.filter(s => {
          const isSameVenue = s.venueId === myVenue?.id || (s.venueName && s.venueName.toLowerCase() === myVenue?.name.toLowerCase());
          const isSameDate = (s.rawTime === formData.date) || (s.date === formData.date) || (s.rawDate === formData.date);
          const isSameField = formData.fieldId ? (s.fieldId === formData.fieldId) : (s.pitchType === formData.pitchType);
          return isSameVenue && isSameDate && isSameField && isTimeOverlapping(s.timeSlot, formData.time);
        }).map(s => s.id);

        // 1. Create Slot
        const newSlotId = 's_' + Date.now();
        const newSlot = {
          id: newSlotId,
          venueId: myVenue ? myVenue.id : "",
          venueName: formData.venueName || (myVenue ? myVenue.name : ""),
          district: formData.district || (myVenue ? myVenue.district : "Thủ Đức"),
          address: formData.address || (myVenue ? myVenue.address : ""),
          fieldId: formData.fieldId || "",
          fieldName: formData.fieldName || "",
          timeSlot: `${formData.time} ${formData.date}`,
          rawTime: formData.date,
          pitchType: formData.pitchType,
          price: formData.price.toLocaleString('vi-VN') + "đ",
          contact: formData.contact,
          notes: `SĐT Khách: ${formData.customerPhone}`,
          customerPhone: formData.customerPhone,
          status: 'on_hold', // since it is linked to a match waiting for opponent
          subSlots: matchingSubSlots // Link matching 30-minute sub-slots
        };

        // 2. Create Match
        const newMatch = {
          id: 'KP' + Math.floor(Math.random() * 100000),
          teamName: formData.teamName,
          pairedWith: null,
          time: newSlot.timeSlot,
          venue: newSlot.venueName,
          district: newSlot.district,
          pitchType: newSlot.pitchType,
          fieldId: newSlot.fieldId,
          fieldName: newSlot.fieldName,
          venue_slot_id: newSlotId,
          phone: currentUser.phone, // Kèo public vẫn dùng sđt chủ sân để liên hệ
          status: "Cần đối",
          level: formData.level,
          fee: newSlot.price,
          type: "Tìm đối",
          author_user_id: currentUser.id,
          avatar: "https://ui-avatars.com/api/?name=" + encodeURIComponent(formData.teamName) + "&background=random",
          notes: formData.notes,
          customerPhone: formData.customerPhone
        };

        // Update slots state (append new consolidated slot and put matching sub-slots on hold)
        setSlots(prevSlots => {
          const updated = prevSlots.map(s => {
            if (matchingSubSlots.includes(s.id)) {
              return {
                ...s,
                status: 'on_hold',
                customerName: formData.teamName,
                customerPhone: formData.customerPhone,
                bookingNotes: `Đang chờ ghép đối tác`
              };
            }
            return s;
          });
          return [newSlot, ...updated];
        });
        setMatches(prev => [newMatch, ...prev]);
        
        alert("🔥 Tạo kèo hộ khách thành công! Kèo đã được đăng lên Bảng tin Public.");
        closeModal();
        setCurrentTab("owner_ql_san");
      };

      const submitCreateSlotForm = async (formData) => {
        // --- BACKEND SYNC ATTEMPT ---
        try {
          const token = localStorage.getItem("authToken");
          const response = await fetch(`${API_BASE}/slots/create`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
              time: formData.time,
              date: formData.date,
              pitchType: formData.pitchType,
              price: formData.price,
              notes: formData.notes
            })
          });

          if (response.ok) {
            await refetchAllData();
            alert("🏟️ [Backend] Đăng khung giờ trống lên MySQL thành công!");
            closeModal();
            setCurrentTab("owner_ql_san");
            return;
          } else {
            const err = await response.json();
            throw new Error(err.error || "Lỗi lưu khung giờ!");
          }
        } catch (e) {
          console.error("Backend slot creation failed, using local mock state:", e);
        }

        // --- LOCAL MOCK FALLBACK ---
        const myVenue = venues.find(v => v.phone === currentUser.phone || v.owner_user_id === currentUser.id);
        const myCapacities = myVenue?.capacities || { '5': 0, '7': 0, '11': 0 };
        const myCombinations = myVenue?.combinations || [];

        const allDateSlots = slots.filter(s => 
          s.contact === currentUser.phone && 
          (s.rawTime || s.date) === formData.date
        );

        const testSlot = {
          id: 'test_' + Date.now(),
          timeSlot: `${formData.time} ${formData.date}`,
          pitchType: formData.pitchType,
          contact: currentUser.phone
        };

        const { unplacedSlots } = assignSlotsToBins([...allDateSlots, testSlot], myCapacities, myCombinations);

        if (unplacedSlots.some(s => s.id === testSlot.id)) {
           alert("❌ Không thể đăng giờ! Sân này đang bị ảnh hưởng bởi giới hạn sân hoặc bị khóa do quy tắc Ghép Sân (Ví dụ: 7A = 5A + 5B). Vui lòng kiểm tra lại bảng quản lý.");
           return;
        }

        const newSlot = {
          id: 's_' + Date.now(),
          venueName: formData.venueName,
          district: formData.district,
          address: formData.address,
          timeSlot: `${formData.time} ${formData.date}`,
          rawTime: formData.date,
          pitchType: formData.pitchType,
          price: formData.price.toLocaleString('vi-VN') + "đ",
          contact: formData.contact,
          notes: formData.notes || "Giờ trống từ chủ sân đăng bán nhanh."
        };

        setSlots(prev => [newSlot, ...prev]);
        alert("🏟️ [Mock] Đăng khung giờ trống thành công! Khách xem và các đội bóng có thể chọn tạo kèo ngay trên slot của bạn.");
        closeModal();
        setCurrentTab("owner_ql_san");
      };

      // Handle editing pitch slot
      const submitEditSlotForm = (formData) => {
        setSlots(prev => prev.map(s => {
          if (s.id === formData.id) {
            return {
              ...s,
              timeSlot: formData.timeSlot,
              price: formData.price.toLocaleString('vi-VN') + "đ",
              notes: formData.notes
            };
          }
          return s;
        }));
        alert("✅ Cập nhật thông tin sân trống thành công!");
        closeModal();
      };

      // Handle change name



      const submitChangeNameForm = (newName, newPhone) => {
        if (!currentUser) return;
        const now = new Date();
        
        const nameChanged = newName !== currentUser.name;
        const phoneChanged = newPhone && newPhone.trim() !== (currentUser.phone || "").trim();

        if (nameChanged) {
          const lastChange = currentUser.last_name_change ? new Date(currentUser.last_name_change) : null;
          if (lastChange && now - lastChange < 30 * 24 * 60 * 60 * 1000) {
            const daysLeft = 30 - Math.floor((now - lastChange) / (24 * 60 * 60 * 1000));
            alert(`🚫 Bạn chỉ được đổi tên 1 lần trong vòng 30 ngày. Vui lòng thử lại sau ${daysLeft} ngày nữa.`);
            return;
          }
        }

        if (phoneChanged) {
          const trimmedPhone = newPhone.trim();
          if (trimmedPhone.length !== 10) {
            alert("🚫 Số điện thoại phải gồm đúng 10 chữ số!");
            return;
          }
          const isPhoneDup = users.some(u => u.phone === trimmedPhone && u.id !== currentUser.id);
          if (isPhoneDup) {
            alert(`🚫 Số điện thoại ${trimmedPhone} đã được một tài khoản khác sử dụng trên hệ thống. Vui lòng nhập số khác!`);
            return;
          }
        }

        let history = currentUser.name_history || [];
        if (nameChanged) {
          history = [...history, {
            old_name: currentUser.name,
            changed_at: now.toISOString()
          }];
        }

        const updatedUser = {
          ...currentUser,
          name: newName,
          phone: phoneChanged ? newPhone.trim() : (currentUser.phone || ""),
          last_name_change: nameChanged ? now.toISOString() : currentUser.last_name_change,
          name_history: history
        };

        setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
        setCurrentUser(updatedUser);
        
        // Sync lastLoginPhone storage if phone was changed
        if (phoneChanged) {
          localStorage.setItem("lastLoginPhone", newPhone.trim());
        }

        alert(`✅ Cập nhật thông tin thành công!`);
        closeModal();
      };

      // Handle creating new team
      const submitCreateTeamForm = (formData) => {
        // 1. Check max 2 teams limit
        const myTeamsCount = teams.filter(t => t.owner_user_id === currentUser.id || (t.members && t.members.some(m => m.user_id === currentUser.id && (m.status === 'joined' || m.status === 'pending')))).length;
        if (myTeamsCount >= 2) {
          alert("⚠️ Tài khoản của bạn đã đạt giới hạn tham gia tối đa 2 đội bóng (bao gồm đội đã tạo và xin gia nhập). Vui lòng nâng cấp gói Trả Phí để tham gia thêm!");
          closeModal();
          return;
        }

        // 2. Check if user already owns a team
        const hasOwnedTeam = teams.some(t => t.owner_user_id === currentUser.id);
        if (hasOwnedTeam) {
          alert("⚠️ Bạn đã đăng ký sở hữu một đội bóng rồi! Mỗi tài khoản chỉ được đăng ký tối đa 1 đội bóng trên hệ thống.");
          closeModal();
          return;
        }

        // 2. Check if phone number is already registered to another team
        const isPhoneDup = teams.some(t => t.phone === formData.phone);
        if (isPhoneDup) {
          alert(`⚠️ Số điện thoại ${formData.phone} đã được đăng ký liên hệ cho một đội bóng khác. Vui lòng dùng SĐT khác!`);
          closeModal();
          return;
        }

        const cleanStr = s => s.toLowerCase().trim().replace(/fc\s+/gi, "").replace(/\s+fc/gi, "");
        const newCleanName = cleanStr(formData.teamName);
        
        const similarTeam = teams.find(t => {
          const existingCleanName = cleanStr(t.name || t.teamName || "");
          const nameMatch = existingCleanName.includes(newCleanName) || newCleanName.includes(existingCleanName);
          const districtMatch = (t.district === formData.district);
          const phoneMatch = (t.phone === formData.phone);
          return (nameMatch && districtMatch) || phoneMatch;
        });

        if (similarTeam) {
          const wantJoin = confirm(`Có vẻ đội này đã tồn tại. Bạn muốn xin tham gia đội này không?\n\n(Đội phát hiện trùng: ${similarTeam.name || similarTeam.teamName} - SĐT: ${similarTeam.phone})\n\n- Chọn OK để gửi yêu cầu tham gia.\n- Chọn Cancel để bỏ qua và tiếp tục tạo đội mới.`);
          
          if (wantJoin) {
            // Submit request to join
            setTeams(prevTeams => {
              return prevTeams.map(t => {
                if (t.id === similarTeam.id) {
                  const reqs = t.members || [];
                  if (reqs.some(m => m.user_id === currentUser.id)) return t;
                  return {
                    ...t,
                    members: [...reqs, {
                      user_id: currentUser.id,
                      name: currentUser.name,
                      role: "member",
                      status: "pending"
                    }]
                  };
                }
                return t;
              });
            });
            alert(`📩 Yêu cầu gia nhập đội ${similarTeam.name || similarTeam.teamName} đã được gửi thành công!`);
            closeModal();
            return;
          }
        }

        const teamSlug = formData.teamName.toLowerCase().trim().replace(/\s+/g, "-");
        const codeNum = Math.floor(1000 + Math.random() * 9000);
        const inviteCode = `FC-${codeNum}`;

        const newTeam = {
          id: 't_' + Date.now(),
          name: formData.teamName,
          teamName: formData.teamName,
          district: formData.district,
          level: formData.level,
          preferTime: formData.preferTime,
          representative: formData.representative,
          phone: formData.phone,
          avatar: formData.avatar,
          owner_user_id: currentUser.id,
          invite_code: inviteCode,
          invite_link: `/team/${teamSlug}/join`,
          members: [
            { user_id: currentUser.id, name: currentUser.name, role: "owner", status: "joined" }
          ],
          matchCount: 0,
          winRate: "Chưa đá",
          rating: 5.0,
          cancellationRate: "0%"
        };

        setTeams(prev => [newTeam, ...prev]);

        // Add 'team_owner' role to user
        setUsers(prevUsers => {
          return prevUsers.map(u => {
            if (u.id === currentUser.id) {
              const updatedRoles = [...new Set([...(u.roles || []), "team_owner"])];
              const updatedUser = { ...u, roles: updatedRoles };
              setCurrentUser(updatedUser);
              return updatedUser;
            }
            return u;
          });
        });

        alert(`⚽ Tạo đội bóng mới thành công!\nMã mời gia nhập của bạn: ${inviteCode}\n\nBạn đã tự động nhận vai trò Team Owner.`);
        closeModal();
        setCurrentTab("doi");
      };

      // Change Team Avatar
      const changeTeamAvatar = (teamId) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
              setTeams(prev => prev.map(t => t.id === teamId ? { ...t, avatar: reader.result } : t));
              alert("🖼️ Cập nhật ảnh đại diện đội bóng thành công!");
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
      };

      // Change Team Name (Max once every 60 days)
      const changeTeamName = (teamId) => {
        const team = teams.find(t => t.id === teamId);
        if (!team) return;
        
        const now = Date.now();
        const lastModified = team.nameLastModifiedAt || 0;
        const daysSinceLastModified = (now - lastModified) / (1000 * 60 * 60 * 24);
        
        if (lastModified > 0 && daysSinceLastModified < 60) {
          const daysLeft = Math.ceil(60 - daysSinceLastModified);
          alert(`⏳ Tên đội bóng chỉ được đổi 60 ngày 1 lần.\nBạn cần đợi thêm ${daysLeft} ngày nữa để đổi tên!`);
          return;
        }

        const newName = prompt("Nhập tên đội bóng mới:", team.name || team.teamName);
        if (newName && newName.trim() !== "") {
          setTeams(prev => prev.map(t => t.id === teamId ? { ...t, name: newName.trim(), teamName: newName.trim(), nameLastModifiedAt: now } : t));
          alert("✅ Cập nhật tên đội bóng thành công!");
        }
      };

      // Leave Team
      const leaveTeam = (teamId) => {
        if (window.confirm("⚠️ Bạn có chắc chắn muốn rời khỏi Đội Bóng này không?")) {
          setTeams(prev => prev.map(t => {
            if (t.id === teamId) {
              return {
                ...t,
                members: t.members.filter(m => m.user_id !== currentUser.id)
              };
            }
            return t;
          }));
          setActiveTeamId(null);
          alert("Bạn đã rời khỏi đội bóng!");
        }
      };

      // Delete Team
      const deleteTeam = (teamId) => {
        if (window.confirm("⚠️ Bạn có chắc chắn muốn XÓA VĨNH VIỄN Đội Bóng này không? Mọi thông tin và lịch sử sẽ bị mất!")) {
          setTeams(prev => prev.filter(t => t.id !== teamId));
          setActiveTeamId(null);
          alert("Đã xóa đội bóng thành công!");
        }
      };

      // Remove Member from Team
      const removeMember = (teamId, userId) => {
        if (window.confirm("⚠️ Bạn có chắc chắn muốn xóa thành viên này khỏi đội bóng không?")) {
          setTeams(prev => prev.map(t => {
            if (t.id === teamId) {
              const uObj = users.find(u => u.id === userId);
              if (uObj && uObj.phone) {
                setTimeout(() => {
                  setNotifications(prevAct => [{
                    id: 'notif_role_' + Date.now(),
                    type: 'role_removed',
                    recipientPhone: uObj.phone,
                    title: 'Bị xóa khỏi đội',
                    message: `Bạn đã bị xóa khỏi đội bóng ${t.name}.`,
                    createdAt: Date.now(),
                    isRead: false,
                    actionRequired: false,
                    status: 'resolved'
                  }, ...prevAct]);
                }, 0);
              }
              return {
                ...t,
                members: t.members.filter(m => m.user_id !== userId)
              };
            }
            return t;
          }));
          alert("🚮 Đã xóa thành viên khỏi đội bóng.");
        }
      };

      // Promote member to Admin
      const promoteMember = (teamId, userId) => {
        setTeams(prev => prev.map(t => {
          if (t.id === teamId) {
            const uObj = users.find(u => u.id === userId);
            if (uObj && uObj.phone) {
              setTimeout(() => {
                setNotifications(prevAct => [{
                  id: 'notif_role_' + Date.now(),
                  type: 'captain_transfer',
                  recipientPhone: uObj.phone,
                  title: 'Thăng cấp Quản trị viên',
                  message: `Bạn đã được bổ nhiệm làm Quản trị viên (Admin) của đội ${t.name}.`,
                  createdAt: Date.now(),
                  isRead: false,
                  actionRequired: false,
                  status: 'resolved'
                }, ...prevAct]);
              }, 0);
            }
            return {
              ...t,
              members: t.members.map(m => m.user_id === userId ? { ...m, role: "admin" } : m)
            };
          }
          return t;
        }));
        setUsers(prevUsers => prevUsers.map(u => {
          if (u.id === userId) {
            return { ...u, roles: [...new Set([...(u.roles || []), "team_admin"])] };
          }
          return u;
        }));
        alert("⚡ Đã bổ nhiệm thành viên làm Quản Trị Đội thành công!");
      };

      // Demote admin to member
      const demoteMember = (teamId, userId) => {
        setTeams(prev => prev.map(t => {
          if (t.id === teamId) {
            const uObj = users.find(u => u.id === userId);
            if (uObj && uObj.phone) {
              setTimeout(() => {
                setNotifications(prevAct => [{
                  id: 'notif_role_' + Date.now(),
                  type: 'role_removed',
                  recipientPhone: uObj.phone,
                  title: 'Hạ quyền thành viên',
                  message: `Bạn đã bị hạ quyền xuống làm thành viên thường của đội ${t.name}.`,
                  createdAt: Date.now(),
                  isRead: false,
                  actionRequired: false,
                  status: 'resolved'
                }, ...prevAct]);
              }, 0);
            }
            return {
              ...t,
              members: t.members.map(m => m.user_id === userId ? { ...m, role: "member" } : m)
            };
          }
          return t;
        }));
        alert("⚡ Đã hạ quyền quản trị viên xuống thành viên thường.");
      };

      // Approve pending member candidate
      const approveMember = (teamId, userId) => {
        setTeams(prev => prev.map(t => {
          if (t.id === teamId) {
            const uObj = users.find(u => u.id === userId);
            if (uObj && uObj.phone) {
              setTimeout(() => {
                setNotifications(prevAct => [{
                  id: 'notif_join_' + Date.now(),
                  type: 'team_join_approved',
                  recipientPhone: uObj.phone,
                  title: 'Đã được duyệt vào đội',
                  message: `Yêu cầu xin gia nhập đội ${t.name} của bạn đã được duyệt.`,
                  createdAt: Date.now(),
                  isRead: false,
                  actionRequired: false,
                  status: 'resolved'
                }, ...prevAct]);
              }, 0);
            }
            return {
              ...t,
              members: t.members.map(m => m.user_id === userId ? { ...m, status: "joined" } : m)
            };
          }
          return t;
        }));
        alert("✅ Đã phê duyệt thành viên tham gia đội bóng!");
      };

      // Reject pending member candidate
      const rejectMember = (teamId, userId) => {
        if (confirm("Bạn có chắc chắn muốn từ chối yêu cầu tham gia của thành viên này?")) {
          setTeams(prev => prev.map(t => {
            if (t.id === teamId) {
              const uObj = users.find(u => u.id === userId);
              if (uObj && uObj.phone) {
                setTimeout(() => {
                  setNotifications(prevAct => [{
                    id: 'notif_join_' + Date.now(),
                    type: 'team_join_rejected',
                    recipientPhone: uObj.phone,
                    title: 'Bị từ chối vào đội',
                    message: `Yêu cầu xin gia nhập đội ${t.name} của bạn đã bị từ chối.`,
                    createdAt: Date.now(),
                    isRead: false,
                    actionRequired: false,
                    status: 'resolved'
                  }, ...prevAct]);
                }, 0);
              }
              return {
                ...t,
                members: t.members.filter(m => m.user_id !== userId)
              };
            }
            return t;
          }));
          alert("❌ Đã từ chối yêu cầu gia nhập.");
        }
      };

      // Cancel sent join team request
      const cancelJoinTeamRequest = (teamId) => {
        if (confirm("Bạn có chắc chắn muốn hủy yêu cầu xin gia nhập đội bóng này?")) {
          setTeams(prevTeams => prevTeams.map(t => {
            if (t.id === teamId) {
              return {
                ...t,
                members: (t.members || []).filter(m => m.user_id !== currentUser.id)
              };
            }
            return t;
          }));
          alert("✅ Đã hủy yêu cầu xin gia nhập thành công.");
        }
      };

      // Join team by invitation code
      const handleJoinTeamByCode = (e) => {
        e.preventDefault();
        const code = e.target.elements.joinTeamCode.value.trim().toUpperCase();
        if (!code) return;

        // Check max 2 teams limit
        const myTeamsCount = teams.filter(t => t.owner_user_id === currentUser.id || (t.members && t.members.some(m => m.user_id === currentUser.id && (m.status === 'joined' || m.status === 'pending')))).length;
        if (myTeamsCount >= 2) {
          alert("⚠️ Tài khoản của bạn đã đạt giới hạn tham gia tối đa 2 đội bóng (bao gồm đội đã tạo và xin gia nhập). Vui lòng nâng cấp gói Trả Phí để tham gia thêm!");
          return;
        }
        
        const targetTeam = teams.find(t => t.invite_code === code);
        if (!targetTeam) {
          alert("❌ Mã đội bóng không hợp lệ hoặc không tồn tại. Vui lòng kiểm tra lại!");
          return;
        }

        const isMember = targetTeam.members && targetTeam.members.some(m => m.user_id === currentUser.id);
        if (isMember) {
          alert("😊 Bạn đã là thành viên hoặc đã gửi yêu cầu gia nhập đội này rồi!");
          return;
        }

        // Push pending member to targetTeam
        setTeams(prevTeams => {
          return prevTeams.map(t => {
            if (t.id === targetTeam.id) {
              const reqs = t.members || [];
              return {
                ...t,
                members: [...reqs, {
                  user_id: currentUser.id,
                  name: currentUser.name,
                  role: "member",
                  status: "pending"
                }]
              };
            }
            return t;
          });
        });

        alert(`📩 Đã gửi yêu cầu gia nhập FC ${targetTeam.name || targetTeam.teamName} thành công! Vui lòng chờ Owner hoặc Admin của đội phê duyệt.`);
        e.target.reset();
      };

      // Submit Pitch Owner registration form
      const submitVenueRegistration = (e) => {
        e.preventDefault();
        const nameVal = e.target.elements.venueName.value.trim();
        const addressVal = e.target.elements.address.value.trim();
        const districtVal = e.target.elements.district.value;
        const phoneVal = e.target.elements.venuePhone.value.trim();
        const notesVal = e.target.elements.venueNotes.value.trim();
        const cap5 = parseInt(e.target.elements.cap5.value) || 0;
        const cap7 = parseInt(e.target.elements.cap7.value) || 0;
        const cap11 = parseInt(e.target.elements.cap11.value) || 0;

        const newVenue = {
          id: "v_" + Date.now(),
          owner_user_id: currentUser.id,
          name: nameVal,
          address: addressVal,
          district: districtVal,
          phone: phoneVal,
          verification_status: "pending_verification",
          notes: notesVal || "Sân cỏ nhân tạo chất lượng tốt.",
          capacities: {
            '5': cap5,
            '7': cap7,
            '11': cap11
          }
        };

        setVenues(prev => [...prev, newVenue]);

        // Add venue_owner role to user
        setUsers(prevUsers => {
          return prevUsers.map(u => {
            if (u.id === currentUser.id) {
              const updatedRoles = [...new Set([...(u.roles || []), "venue_owner"])];
              const updated = { ...u, roles: updatedRoles };
              setCurrentUser(updated);
              return updated;
            }
            return u;
          });
        });

        alert("🎉 Gửi yêu cầu đăng ký Chủ Sân thành công!\n\nVui lòng chờ Super Admin xác minh & phê duyệt sân của bạn.");
        closeModal();
      };

      // Overlapping match check helper
      const checkOverlappingMatch = (teamId, matchDate, timeStr, currentMatches) => {
        if (!teamId) return null;
        const targetTeamMatches = currentMatches.filter(m => 
          m.team_id === teamId && 
          m.status !== 'completed' && m.status !== 'cancelled' && m.status !== 'Đã chốt kèo' && m.status !== 'Đã hủy' && m.status !== 'Đã hoàn thành' && m.status !== 'Đã hủy bỏ' && m.status !== 'expired'
        );

        if (targetTeamMatches.length === 0) return null;

        const parseTimeRange = (str) => {
          const regex = /(\d{1,2})[h:](\d{2})\s*-\s*(\d{1,2})[h:](\d{2})/i;
          const match = str.match(regex);
          if (!match) return { start: 0, end: 1440 };
          return {
            start: parseInt(match[1]) * 60 + parseInt(match[2]),
            end: parseInt(match[3]) * 60 + parseInt(match[4])
          };
        };

        const newRange = parseTimeRange(timeStr);

        for (let m of targetTeamMatches) {
          // Check if same date
          const dateMatch = (m.rawTime === matchDate || m.time.includes(matchDate));
          if (dateMatch) {
            const activeRange = parseTimeRange(m.time);
            if (newRange.start < activeRange.end && activeRange.start < newRange.end) {
              return m;
            }
          }
        }
        return null;
      };

      // Handle creating Match from an empty Slot
      const submitCreateMatchFromSlot = (formData) => {
        const activeMatchesCount = matches.filter(m => ((currentUser.createdMatchIds || []).includes(m.id) || m.adminContact === currentUser.phone) && !['completed', 'cancelled', 'rejected'].includes(m.status)).length;
        if (activeMatchesCount >= 10) {
          alert('🚫 GIỚI HẠN TẠO KÈO\n\nBạn chỉ được phép mở tối đa 10 kèo cùng lúc. Vui lòng hoàn thành hoặc hủy các kèo hiện tại trước khi tạo mới.');
          return;
        }

        const { slot, teamId, teamName, level, category, adminContact, notes } = formData;
        
        // Anti-duplicate active match check
        const overlap = checkOverlappingMatch(teamId, slot.rawTime, slot.timeSlot, matches);
        if (overlap) {
          alert(`🚫 TRÙNG KHUNG GIỜ HOẠT ĐỘNG!\n\nĐội của bạn đã có một kèo hoạt động trong khung giờ này (${overlap.time} tại ${overlap.venue}).\n\nVui lòng chỉnh sửa kèo cũ thay vì tạo kèo mới.`);
          return;
        }

        const newMatch = {
          id: 'm_' + Date.now(),
          created_at: new Date().toISOString(),
          team_id: teamId,
          teamName: teamName,
          status: "waiting_opponent", // waiting_opponent (Đang chờ đối)
          time: slot.timeSlot,
          rawTime: slot.rawTime,
          venue: slot.venueName,
          district: slot.district,
          pitchType: slot.pitchType,
          price: slot.price,
          level: level,
          category: category || "Kèo Nam",
          notes: notes || `Kèo tạo nhanh từ khung giờ trống của ${slot.venueName}.`,
          adminContact: adminContact,
          venue_slot_id: slot.id,
          joinedPlayers: [],
          requests: [],
          created_at: new Date().toISOString()
        };

        setMatches(prev => [newMatch, ...prev]);
        
        // Put slot on hold
        setSlots(prevSlots => {
          const updated = prevSlots.map(s => {
            if (slot.subSlots && slot.subSlots.includes(s.id)) {
              return {
                ...s,
                status: "on_hold",
                customerPhone: adminContact || currentUser?.phone || "",
                customerName: teamName || currentUser?.name || "Cầu thủ",
                bookingNotes: notes || `Ghép kèo tìm đối tác đá chung (Public).`,
                hold_expires_at: new Date(Date.now() + 40 * 60 * 1000).toISOString()
              };
            }
            return s;
          });

          const consolidatedSlot = {
            ...slot,
            status: "on_hold",
            customerPhone: adminContact || currentUser?.phone || "",
            customerName: teamName || currentUser?.name || "Cầu thủ",
            bookingNotes: notes || `Ghép kèo tìm đối tác đá chung (Public).`,
            hold_expires_at: new Date(Date.now() + 40 * 60 * 1000).toISOString()
          };

          return [consolidatedSlot, ...updated];
        });

        // Notify venue owner
        const targetVenue = venues.find(v => v.name === slot.venueName);
        if (targetVenue) {
          const ownerPhone = targetVenue.phone || targetVenue.owner_user_id || "";
          setNotifications(prev => [
            {
              id: 'notif_booking_hold_' + Date.now(),
              type: 'booking_holding',
              recipientPhone: ownerPhone,
              title: `🟡 Yêu cầu giữ chỗ (Ghép kèo)`,
              message: `Sân <strong>${slot.venueName}</strong> (${slot.pitchType}) có yêu cầu giữ chỗ để ghép kèo tìm đối cho khung giờ <strong>${slot.timeSlot}</strong> ngày ${slot.rawTime || slot.date || 'hôm nay'}. Tạo bởi đội <strong>${teamName}</strong> (${adminContact || currentUser?.phone || ""}).`,
              createdAt: Date.now(),
              isRead: false,
              actionRequired: false,
              status: 'resolved'
            },
            ...prev
          ]);
        }

        // Add to user created list
        setCurrentUser(prevUser => {
          return {
            ...prevUser,
            createdMatchIds: [...new Set([...(prevUser.createdMatchIds || []), newMatch.id])]
          };
        });

        alert("🔥 Đặt sân thành công! Hệ thống đã tự động liên kết với slot và chuyển sang giữ chỗ (on_hold). Hệ thống sẽ chuyển bạn sang trang Quản lý Booking của Chủ Sân để theo dõi.");
        closeModal();
        setActiveRoleMode("chủ sân");
        setCurrentTab("owner_booking");
      };

      // Handle creating recruitment match (Đăng tuyển người chạy lẻ)
      const submitCreateMissingPlayerForm = (formData) => {
        const activeMatchesCount = matches.filter(m => ((currentUser.createdMatchIds || []).includes(m.id) || m.adminContact === currentUser.phone) && !['completed', 'cancelled', 'rejected'].includes(m.status)).length;
        if (activeMatchesCount >= 10) {
          alert('🚫 GIỚI HẠN TẠO KÈO\n\nBạn chỉ được phép mở tối đa 10 kèo cùng lúc. Vui lòng hoàn thành hoặc hủy các kèo hiện tại trước khi tạo mới.');
          return;
        }

        const { teamId, teamName, missingCount, position, pitchType, date, time, venue, district, adminContact, notes, level } = formData;
        
        // 30 mins before start block check
        const startTime = parseMatchStartTime(time, date);
        if (startTime && (startTime - Date.now()) <= 30 * 60 * 1000) {
          alert('🚫 KHÔNG ĐỦ THỜI GIAN\n\nKhông thể tạo tin tuyển cầu lẻ khi trận đấu chỉ còn dưới 30 phút vì sẽ không đủ thời gian tìm người.');
          return;
        }

        // Tuyển cầu lẻ - Duplicate post check
        const isDuplicatePost = matches.some(m => 
          m.status === "Thiếu người" && 
          m.rawTime === date && 
          m.time.includes(time) && 
          m.district === district && 
          m.team_id === teamId && 
          m.pitchType === pitchType
        );

        if (isDuplicatePost) {
          alert('🚫 TIN NÀY ĐÃ TỒN TẠI\n\nTin này đã có người đăng trước đó. Bạn hãy kiểm tra lại trong mục tuyển cầu lẻ.');
          return;
        }

        // Anti-duplicate active match check
        const overlap = checkOverlappingMatch(teamId, date, time, matches);
        if (overlap) {
          alert(`🚫 TRÙNG KHUNG GIỜ HOẠT ĐỘNG!\n\nĐội của bạn đã có một kèo hoạt động trong khung giờ này (${overlap.time} tại ${overlap.venue}).\n\nVui lòng chỉnh sửa kèo cũ thay vì tạo kèo mới.`);
          return;
        }

        const newMatch = {
          id: 'm_' + Date.now(),
          created_at: new Date().toISOString(),
          team_id: teamId,
          teamName: teamName,
          status: "Thiếu người", // "Thiếu người" instead of "finding_players" so it shows up on the board
          missingCount: missingCount,
          initialMissingCount: missingCount,
          position: position,
          positionsNeeded: position,
          needPlayersCount: missingCount,
          time: `${time} (${date})`,
          rawTime: date,
          venue: venue,
          district: district,
          pitchType: pitchType,
          level: level || "Vui vẻ",
          notes: notes || `Tuyển gấp ${missingCount} chân chạy lẻ vị trí ${position} giao lưu vui vẻ.`,
          adminContact: adminContact,
          joinedPlayers: [],
          requests: []
        };

        setMatches(prev => [newMatch, ...prev]);

        // Add to user created list
        setCurrentUser(prevUser => {
          return {
            ...prevUser,
            createdMatchIds: [...new Set([...(prevUser.createdMatchIds || []), newMatch.id])]
          };
        });

        // Reset filters and switch tab to force-show the new post immediately
        setCurrentTab("keo");
        setActiveQuickAction("thieu");
        setFilterTime("Tất cả");
        setFilterDistrict("Tất cả");
        setFilterPitchType("Tất cả");
        setFilterCategory("Tất cả");

        alert("🏃‍♂️ Đăng tuyển người chạy lẻ thành công! Tin tuyển dụng của bạn đã xuất hiện ở tab 'Kèo' dưới dạng thẻ 'Thiếu người'.");
        closeModal();
      };

      // Invite friendly match
      const submitInviteFriendly = (formData) => {
        const activeMatchesCount = matches.filter(m => ((currentUser.createdMatchIds || []).includes(m.id) || m.adminContact === currentUser.phone) && !['completed', 'cancelled', 'rejected'].includes(m.status)).length;
        if (activeMatchesCount >= 10) {
          alert('🚫 GIỚI HẠN TẠO KÈO\n\nBạn chỉ được phép mở tối đa 10 kèo cùng lúc. Vui lòng hoàn thành hoặc hủy các kèo hiện tại trước khi tạo mới.');
          return;
        }

        const { targetTeam, teamId, myTeamName, myPhone, slot, desiredLevel, proposalDetails } = formData;

        // Anti-duplicate active match check
        const overlap = checkOverlappingMatch(teamId, slot.rawTime, slot.timeSlot, matches);
        if (overlap) {
          alert(`🚫 TRÙNG KHUNG GIỜ HOẠT ĐỘNG!\n\nĐội của bạn đã có một kèo hoạt động trong khung giờ này (${overlap.time} tại ${overlap.venue}).\n\nVui lòng chỉnh sửa kèo cũ thay vì tạo kèo mới.`);
          return;
        }

        const initialRequest = {
          id: 'req_' + Date.now(),
          requester_team_id: targetTeam.id,
          teamName: targetTeam.teamName,
          representative: targetTeam.representative || targetTeam.captainName || "Captain",
          phone: targetTeam.phone,
          level: targetTeam.level || "Trung bình",
          district: targetTeam.district || targetTeam.region || "Quận 7",
          matchCount: targetTeam.matchCount || 12,
          rating: targetTeam.rating || 5.0,
          note: proposalDetails || "Đội bóng nhận lời mời giao hữu.",
          is_invite: true,
          status: 'pending',
          created_at: new Date().toISOString()
        };

        const newMatch = {
          id: 'm_' + Date.now(),
          team_id: teamId,
          teamName: myTeamName,
          status: "pending_confirmation", // Directly pending confirmation
          time: slot.timeSlot,
          rawTime: slot.rawTime,
          venue: slot.venueName,
          district: slot.district,
          pitchType: slot.pitchType,
          price: slot.price,
          level: desiredLevel,
          notes: proposalDetails || `Mời giao hữu đội ${targetTeam.teamName}.`,
          adminContact: myPhone,
          venue_slot_id: slot.id,
          requests: [initialRequest],
          created_at: new Date().toISOString()
        };

        // Put slot on hold
        setSlots(prevSlots => prevSlots.map(s => {
          if (s.id === slot.id) {
            return {
              ...s,
              status: "on_hold",
              hold_expires_at: new Date(Date.now() + 40 * 60 * 1000).toISOString()
            };
          }
          return s;
        }));

        setMatches(prev => [newMatch, ...prev]);

        // Add to user created list
        setCurrentUser(prevUser => {
          return {
            ...prevUser,
            createdMatchIds: [...new Set([...(prevUser.createdMatchIds || []), newMatch.id])]
          };
        });

        // Notify target team
        if (targetTeam && targetTeam.phone) {
          setNotifications(prevAct => [
            {
              id: 'notif_' + Date.now(),
              type: 'friendly_invite',
              relatedMatchId: newMatch.id,
              relatedTeamId: teamId,
              recipientPhone: targetTeam.phone,
              title: `Lời mời giao hữu`,
              message: `Đội ${myTeamName} muốn mời đội bạn đá giao hữu trận đấu lúc ${slot.timeSlot.split(' ')[0]}. Vui lòng phản hồi!`,
              createdAt: Date.now(),
              isRead: false,
              actionRequired: true,
              status: 'pending'
            },
            ...prevAct
          ]);
        }

        alert(`📬 ĐÃ GỬI LỜI MỜI GIAO HỮU!\n\nSlot sân tại ${slot.venueName} đã được giữ chỗ trong 40 phút.\n\nĐội bóng ${targetTeam.teamName} đã nhận được lời mời. Bạn có thể theo dõi và duyệt kèo trong màn quản lý của mình.`);
        closeModal();
        setCurrentTab("keo");
      };

      const closeModal = () => {
        setModalType(null);
        setModalData(null);
      };

            const getPersonalStatus = (match) => {
        if (!currentUser) return match.status;
        
        // Kèo tôi tạo
        if ((currentUser.createdMatchIds || []).includes(match.id) || match.adminContact === currentUser.phone) {
          if (match.status === 'waiting_opponent' || match.status === 'Thiếu người') return 'Đang mở';
          if (match.status === 'waiting_approval' || match.status === 'pending_confirmation') return 'Chờ xác nhận';
          if (match.status === 'confirmed' || match.status === 'Đã chốt kèo') return 'Đã chốt';
          if (match.status === 'completed') return 'Hoàn thành';
          if (match.status === 'cancelled' || match.status === 'Đã hủy') return 'Đã hủy';
          return match.status;
        }

        // Kèo tôi tham gia
        let myReq = (match.requests || []).find(r => r.phone === currentUser.phone);
        if (!myReq && currentUser.teamIds) {
          myReq = (match.requests || []).find(r => r.requester_team_id && currentUser.teamIds.includes(r.requester_team_id));
        }

        if (myReq) {
          if (myReq.status === 'pending') return myReq.is_invite ? 'Lời mời tới' : 'Chờ duyệt';
          if (myReq.status === 'accepted') return 'Đã chốt';
          if (myReq.status === 'waitlist') return 'Danh sách chờ';
          if (myReq.status === 'rejected') return 'Bị từ chối';
        }

        const inJoined = (match.joinedPlayers || []).some(p => p.phone === currentUser.phone) || (currentUser.joinedMatchIds || []).includes(match.id);
        if (inJoined) return 'Đã chốt';

        if (match.team_id && currentUser.teamIds && currentUser.teamIds.includes(match.team_id)) {
          if (match.status === 'waiting_opponent' || match.status === 'Thiếu người') return 'Đang mở';
          if (match.status === 'waiting_approval' || match.status === 'pending_confirmation') return 'Chờ xác nhận';
          if (match.status === 'confirmed' || match.status === 'Đã chốt kèo') return 'Đã chốt';
          if (match.status === 'completed') return 'Hoàn thành';
          if (match.status === 'cancelled' || match.status === 'Đã hủy') return 'Đã hủy';
        }

        return match.status;
      };

      // Count stats for Profile Tab
      const myCreatedMatches = useMemo(() => {
        if (!currentUser) return [];
        return matches.filter(m => (currentUser.createdMatchIds || []).includes(m.id) || m.adminContact === currentUser.phone);
      }, [matches, currentUser]);

      const myJoinedMatches = useMemo(() => {
        if (!currentUser) return [];
        return matches.filter(m => {
          // Kèo do tôi tạo -> Không nằm trong "Tôi tham gia"
          if ((currentUser.createdMatchIds || []).includes(m.id) || m.adminContact === currentUser.phone) return false;
          
          // User tham gia với tư cách cá nhân (slot lẻ)
          const isJoinedAsPlayer = (currentUser.joinedMatchIds || []).includes(m.id) || (m.joinedPlayers || []).some(p => p.phone === currentUser.phone);
          const hasRequestedAsPlayer = (m.requests || []).some(req => req.phone === currentUser.phone);
          
          // User tham gia với tư cách thành viên đội (đội nhận kèo hoặc tạo kèo tìm đối)
          const isJoinedAsTeam = m.team_id && currentUser.teamIds && currentUser.teamIds.includes(m.team_id);
          const hasRequestedAsTeam = (m.requests || []).some(req => req.requester_team_id && currentUser.teamIds && currentUser.teamIds.includes(req.requester_team_id));
          
          return isJoinedAsPlayer || hasRequestedAsPlayer || isJoinedAsTeam || hasRequestedAsTeam;
        });
      }, [matches, currentUser]);

      const extractDateFromTime = (timeStr) => {
        if (!timeStr) return null;
        if (timeStr.includes('Hôm nay')) return 'Hôm nay';
        if (timeStr.includes('Ngày mai')) return 'Ngày mai';
        if (timeStr.includes('Hôm qua')) return 'Hôm qua';
        const match = timeStr.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?/);
        if (match) return match[0];
        return null;
      };

      const renderGroupedMatches = (matchesList) => {
        const sorted = [...matchesList].sort((a, b) => {
          const rawDateA = a.rawDate || extractDateFromTime(a.time);
          const rawDateB = b.rawDate || extractDateFromTime(b.time);
          const tA = parseMatchStartTime(a.time, rawDateA, a.created_at) || 0;
          const tB = parseMatchStartTime(b.time, rawDateB, b.created_at) || 0;
          return tB - tA; // Newest first
        });

        const groups = [];
        sorted.forEach(m => {
          let dateLabel = "Chưa xác định";
          const rawDate = m.rawDate || extractDateFromTime(m.time);
          if (rawDate) {
            const ms = parseMatchStartTime(m.time, rawDate, m.created_at);
            if (ms) {
              const d = new Date(ms);
              const today = new Date();
              const yesterday = new Date(today);
              yesterday.setDate(yesterday.getDate() - 1);
              const tomorrow = new Date(today);
              tomorrow.setDate(tomorrow.getDate() + 1);
              
              const isSameDay = (d1, d2) => d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
              
              if (isSameDay(d, today)) dateLabel = `Hôm nay (${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')})`;
              else if (isSameDay(d, yesterday)) dateLabel = `Hôm qua (${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')})`;
              else if (isSameDay(d, tomorrow)) dateLabel = `Ngày mai (${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')})`;
              else dateLabel = `Ngày ${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}`;
            }
          }
          
          let group = groups.find(g => g.label === dateLabel);
          if (!group) {
            group = { label: dateLabel, matches: [] };
            groups.push(group);
          }
          group.matches.push(m);
        });

        if (groups.length === 0) return null;

        return groups.map((g, i) => (
          <div key={i} className="space-y-2.5">
            <h4 className="text-[10px] font-black text-neon-yellow uppercase tracking-widest pl-1 pt-3 border-t border-appDark-border/50 mt-3 first:mt-0 first:border-0 first:pt-0">
              📅 {g.label}
            </h4>
            <div className="space-y-2.5">
              {g.matches.map(m => (
                <ProfileMatchListItem key={m.id} match={m} personalStatus={getPersonalStatus(m)} onSelect={() => setSelectedMatch(m)} />
              ))}
            </div>
          </div>
        ));
      };

      const myHistoryMatches = useMemo(() => {
        if (!currentUser) return [];
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return matches.filter(m => {
          if (m.status !== "completed") return false;
          const isOwner = (currentUser.createdMatchIds || []).includes(m.id) || m.adminContact === currentUser.phone;
          const isJoined = (currentUser.joinedMatchIds || []).includes(m.id) || (m.requests || []).some(req => req.phone === currentUser.phone);
          if (!isOwner && !isJoined) return false;
          
          if (m.createdAt) {
             const matchDate = new Date(m.createdAt);
             if (matchDate < sevenDaysAgo) return false;
          }
          return true;
        });
      }, [matches, currentUser]);

      const handleIgnoreSuggestion = (targetMatchId) => {
        setMatches(prevMatches => prevMatches.map(m => {
          if (m.id === modalData.matchId) {
            return {
              ...m,
              ignoredSuggestions: [...(m.ignoredSuggestions || []), targetMatchId]
            };
          }
          return m;
        }));
        setModalData(prev => ({
          ...prev,
          suggestedMatchesIds: prev.suggestedMatchesIds.filter(id => id !== targetMatchId)
        }));
      };

      const handleInviteSuggestion = (targetMatchId) => {
        if (!currentUser) return;
        
        const originalMatchId = modalData.matchId;
        const targetMatch = matches.find(m => m.id === targetMatchId);
        const originalMatch = matches.find(m => m.id === originalMatchId);
        if (!targetMatch || !originalMatch) return;

        setMatches(prevMatches => {
          return prevMatches.map(m => {
            if (m.id === targetMatchId) {
              const newReq = {
                id: 'req_' + Date.now(),
                match_id: targetMatchId,
                requester_user_id: currentUser.id,
                requester_team_id: originalMatch.team_id,
                name: originalMatch.teamName || currentUser.name,
                phone: currentUser.phone,
                level: originalMatch.level || "Vui vẻ",
                companions: 0,
                status: 'pending',
                created_at: new Date().toISOString(),
                source_match_id: originalMatchId // Gắn ID kèo gốc vào request
              };
              return { ...m, requests: [...(m.requests || []), newReq] };
            }
            return m;
          });
        });

        setTimeout(() => {
          setNotifications(prev => [{
            id: 'notif_req_' + Date.now(),
            type: 'receive_request',
            relatedMatchId: targetMatchId,
            recipientPhone: targetMatch.adminContact,
            title: '⚽ Có đội xin nhận kèo (từ Gợi ý)',
            message: `Đội ${originalMatch.teamName || currentUser.name} đã xin nhận kèo của bạn lúc ${targetMatch.time.split(' ')[0]}.`,
            createdAt: Date.now(),
            isRead: false,
            actionRequired: true,
            status: 'pending'
          }, ...prev]);
        }, 0);

        alert(`✅ Đã gửi yêu cầu nhận kèo thành công!\n\nKèo của bạn vẫn được giữ trên bảng tin. Nếu đối phương đồng ý, kèo của bạn sẽ tự động được hủy để tránh trùng lịch.`);
        closeModal();
      };

      
      // HELPER: Assign slots to physical bins considering combinations
      const assignSlotsToBins = (slotsToAssign, capacities, combinations) => {
        const timeToMins = (tStr) => {
          if (!tStr) return 0;
          const [h, m] = tStr.split(':').map(Number);
          return h * 60 + (m || 0);
        };
        const checkOverlap = (t1, t2) => {
          if (!t1 || !t2) return false;
          let [start1, end1] = t1.split(' - ');
          let [start2, end2] = t2.split(' - ');
          let s1 = timeToMins(start1);
          let e1 = end1 ? timeToMins(end1) : s1 + 90;
          let s2 = timeToMins(start2);
          let e2 = end2 ? timeToMins(end2) : s2 + 90;
          return Math.max(s1, s2) < Math.min(e1, e2);
        };

        // Initialize bins
        const bins = {};
        Object.keys(capacities).forEach(pType => {
          const cap = Math.max(capacities[pType] || 0, 1); // fallback to 1 if slots exist
          for (let i = 0; i < cap; i++) {
            const binName = `${pType}${String.fromCharCode(65 + i)}`;
            bins[binName] = [];
          }
        });

        // Ensure bins exist for all pitch types present in slots (in case capacity is missing but slots exist)
        slotsToAssign.forEach(s => {
           const pTypeNum = s.pitchType.replace('Sân ', '');
           const binNameA = `${pTypeNum}A`;
           if (!bins[binNameA]) bins[binNameA] = [];
        });

        // Helper to check if a time overlaps with any slot in a specific bin
        const isBinFree = (binName, timeStr) => {
          if (!bins[binName]) return true;
          return !bins[binName].some(s => checkOverlap(s.timeSlot ? s.timeSlot.split(' ')[0] : s.time, timeStr));
        };

        // HARD LOCK: Check if a bin has an overlapping slot that is ACTUALLY BOOKED ('Đã chốt' / 'booked')
        const isBinHardLocked = (binName, timeStr) => {
          if (!bins[binName]) return false;
          return bins[binName].some(s => {
             const overlaps = checkOverlap(s.timeSlot ? s.timeSlot.split(' ')[0] : s.time, timeStr);
             const isBooked = s.type === 'booked' || s.status === 'Đã chốt';
             return overlaps && isBooked;
          });
        };

        // SOFT CONFLICT ALLOWED: Only return false if dependencies are Hard Locked
        const isBinSoftFree = (binName, timeStr) => {
          if (!isBinFree(binName, timeStr)) return false; // Self overlap is always bad

          // Check if this bin is a target, are its parts Hard Locked?
          for (const comb of combinations) {
            if (comb.target === binName) {
              for (const part of comb.parts) {
                if (isBinHardLocked(part, timeStr)) return false;
              }
            }
          }

          // Check if this bin is a part, is its target Hard Locked?
          for (const comb of combinations) {
            if (comb.parts.includes(binName)) {
              if (isBinHardLocked(comb.target, timeStr)) return false;
            }
          }

          return true;
        };

        // Sort slots chronologically
        const sortedSlots = [...slotsToAssign].sort((a, b) => {
           const tA = a.timeSlot ? a.timeSlot.split(' ')[0] : a.time;
           const tB = b.timeSlot ? b.timeSlot.split(' ')[0] : b.time;
           return tA.localeCompare(tB);
        });

        const unplacedSlots = [];

        sortedSlots.forEach(slot => {
          const pTypeNum = slot.pitchType.replace('Sân ', '');
          const timeStr = slot.timeSlot ? slot.timeSlot.split(' ')[0] : slot.time;
          
          let placed = false;
          // Find all bins for this pitch type
          const candidateBins = Object.keys(bins).filter(b => b.startsWith(pTypeNum) && b.length === pTypeNum.length + 1);
          
          for (const binName of candidateBins) {
            if (isBinSoftFree(binName, timeStr)) {
              bins[binName].push(slot);
              placed = true;
              break;
            }
          }

          if (!placed) {
            unplacedSlots.push(slot);
            // push to last candidate bin anyway to show error
            if (candidateBins.length > 0) {
               bins[candidateBins[candidateBins.length - 1]].push(slot);
            }
          }
        });

        // Generate virtual slots ONLY FOR HARD LOCKED SLOTS
        const virtualSlots = [];
        Object.keys(bins).forEach(binName => {
          bins[binName].forEach(slot => {
            if (slot.type !== 'booked' && slot.status !== 'Đã chốt') return; // Soft conflict -> skip virtual slots
            
            const timeStr = slot.timeSlot ? slot.timeSlot.split(' ')[0] : slot.time;
            
            // If this bin is a target, block its parts
            combinations.forEach(comb => {
              if (comb.target === binName) {
                comb.parts.forEach(part => {
                  if (bins[part]) {
                    virtualSlots.push({
                      ...slot,
                      id: 'v_' + slot.id + '_' + part,
                      binName: part,
                      isVirtual: true,
                      status: 'Bị khóa',
                      notes: `Do ${binName} đã chốt`,
                      contact: slot.contact
                    });
                  }
                });
              }
            });

            // If this bin is a part, block its target
            combinations.forEach(comb => {
              if (comb.parts.includes(binName)) {
                if (bins[comb.target]) {
                  virtualSlots.push({
                    ...slot,
                    id: 'v_' + slot.id + '_' + comb.target,
                    binName: comb.target,
                    isVirtual: true,
                    status: 'Bị khóa',
                    notes: `Do ${binName} đã chốt`,
                    contact: slot.contact
                  });
                }
              }
            });
          });
        });

        virtualSlots.forEach(vs => {
          if (bins[vs.binName]) {
            const timeStr = vs.timeSlot ? vs.timeSlot.split(' ')[0] : vs.time;
            // Find if there is an existing 'empty' or soft slot overlapping, and remove it
            bins[vs.binName] = bins[vs.binName].filter(s => {
               if (s.isVirtual) return true; // keep existing virtuals maybe
               const overlaps = checkOverlap(s.timeSlot ? s.timeSlot.split(' ')[0] : s.time, timeStr);
               return !overlaps; // Remove overlapped real soft slots
            });

            // Now push the virtual slot (avoid exact duplicate virtual slots)
            const overlap = bins[vs.binName].some(s => checkOverlap(s.timeSlot ? s.timeSlot.split(' ')[0] : s.time, timeStr));
            if (!overlap) {
               bins[vs.binName].push(vs);
            }
          }
        });

        return { bins, unplacedSlots };
      };

      const availableRoles = ["cầu thủ"];
      if (currentUser) {
        const isAdminCheck = currentUser.roles && currentUser.roles.includes("super_admin");
        const isOwnerCheck = isAdminCheck || pitchOwners.includes(currentUser.phone) || venues.some(v => v.owner_user_id === currentUser.id && v.verification_status === 'verified');
        
        if (isOwnerCheck) availableRoles.push("chủ sân");
        if (isAdminCheck) availableRoles.push("admin");
      }

      
      const ownerDashboardData = useMemo(() => {
        if (!currentUser) return { metrics: { empty: 0, booked: 0, pending: 0 }, subVenuesList: [] };

        const ownerSlots = slots.filter(s => {
          if (s.contact !== currentUser.phone) return false;
          
          const slotDate = s.rawTime || s.date;
          
          let dateMatches = false;
          if (ownerCalDate === "Tất cả") {
            dateMatches = true;
          } else if (ownerCalDate === "Hôm nay") {
            const todayStr = (() => { const d=new Date(); return String(d.getDate()).padStart(2,'0') + '/' + String(d.getMonth()+1).padStart(2,'0') + '/' + d.getFullYear(); })();
            dateMatches = (slotDate === todayStr);
          } else if (ownerCalDate === "Ngày mai") {
            const tmrStr = (() => { const d=new Date(); d.setDate(d.getDate()+1); return String(d.getDate()).padStart(2,'0') + '/' + String(d.getMonth()+1).padStart(2,'0') + '/' + d.getFullYear(); })();
            dateMatches = (slotDate === tmrStr);
          } else {
            dateMatches = (slotDate === ownerCalDate);
          }
          
          return dateMatches;
        });
        let emptyCount = 0;
        let bookedCount = 0;
        let pendingCount = 0;

        const groupedSlots = {
          'Sân 5': [],
          'Sân 7': [],
          'Sân 11': []
        };

        ownerSlots.forEach(slot => {
          let slotType = 'empty';
          let slotStatusStr = 'Trống';

          if (slot.status === 'on_hold') {
            slotType = 'matching';
            slotStatusStr = 'Chờ ghép đội';
          } else if (slot.status === 'booked' || slot.type === 'booked') {
            slotType = 'booked';
            slotStatusStr = 'Đã chốt';
          }

          const associatedMatches = matches.filter(m => m.venue_slot_id === slot.id);
          const hasConfirmed = associatedMatches.some(m => m.status === 'Đã chốt kèo');
          const hasPending = associatedMatches.some(m => m.status === 'Cần đối' || m.status === 'Đang chờ xác nhận');

          if (hasConfirmed) {
            slotType = 'booked';
            slotStatusStr = 'Đã chốt';
            bookedCount++;
          } else if (hasPending) {
            slotType = 'matching';
            slotStatusStr = 'Chờ ghép đội';
            pendingCount++;
          } else if (slotType === 'pending') {
            pendingCount++;
          } else if (slotType === 'booked') {
            bookedCount++;
          } else {
            emptyCount++;
          }

          const slotData = {
            ...slot,
            time: slot.timeSlot,
            type: slotType,
            status: slotStatusStr
          };

          const pType = slot.pitchType.replace(' người', '');
          if (groupedSlots[pType]) {
            groupedSlots[pType].push(slotData);
          }
        });

        const myVenue = venues.find(v => v.phone === currentUser.phone || v.owner_user_id === currentUser.id);
        const myCapacities = myVenue?.capacities || { '5': 0, '7': 0, '11': 0 };
        const myCombinations = myVenue?.combinations || [];

        // Flatten all grouped slots to pass to our new helper
        let allSlotsToAssign = [];
        Object.keys(groupedSlots).forEach(ptype => {
           allSlotsToAssign = [...allSlotsToAssign, ...groupedSlots[ptype]];
        });

        const { bins } = assignSlotsToBins(allSlotsToAssign, myCapacities, myCombinations);

        const subVenuesList = [];
        
        // Group bins back by pitch type ('Sân 5', 'Sân 7')
        const binKeys = Object.keys(bins).sort();
        const groupedBins = {};
        binKeys.forEach(binName => {
           const pTypeNum = binName.match(/\d+/)[0];
           const groupName = `Sân ${pTypeNum} người`;
           if (!groupedBins[groupName]) groupedBins[groupName] = [];
           groupedBins[groupName].push({
             name: binName,
             slots: bins[binName]
           });
        });

        Object.keys(groupedBins).forEach(groupName => {
           subVenuesList.push({
              group: groupName,
               venues: groupedBins[groupName]
           });
        });

        return {
          metrics: { empty: emptyCount, booked: bookedCount, pending: pendingCount },
          subVenuesList
        };
      }, [slots, matches, currentUser, ownerCalDate, venues]);

      const renderBottomNav = () => {
        if (activeRoleMode === "admin") {
          return (
            <nav className="glass-nav absolute bottom-0 inset-x-0 h-16 flex items-center justify-around z-40 border-t border-appDark-border/80">
              {/* Tab Tổng quan */}
              <button onClick={() => setCurrentTab("admin_tong_quan")} className="flex flex-col items-center justify-center w-16 h-full transition-all relative group">
                <div className={`p-1 rounded-xl transition-all duration-300 ${currentTab === "admin_tong_quan" ? "text-neon-green scale-110 drop-shadow-[0_0_10px_rgba(16,185,129,0.75)]" : "text-slate-400 group-hover:text-slate-300 group-hover:scale-105"}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" /></svg>
                </div>
                <span className={`text-[10px] font-extrabold tracking-wider transition-all duration-300 ${currentTab === "admin_tong_quan" ? "text-neon-green text-shadow-green scale-105" : "text-slate-500 font-semibold"}`}>Tổng quan</span>
                {currentTab === "admin_tong_quan" && <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-neon-green shadow-[0_0_8px_#10b981] animate-pulse"></div>}
              </button>

              {/* Tab QL Kèo */}
              <button onClick={() => setCurrentTab("admin_ql_keo")} className="flex flex-col items-center justify-center w-16 h-full transition-all relative group">
                <div className={`p-1 rounded-xl transition-all duration-300 ${currentTab === "admin_ql_keo" ? "text-neon-green scale-110 drop-shadow-[0_0_10px_rgba(16,185,129,0.75)]" : "text-slate-400 group-hover:text-slate-300 group-hover:scale-105"}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <span className={`text-[10px] font-extrabold tracking-wider transition-all duration-300 ${currentTab === "admin_ql_keo" ? "text-neon-green text-shadow-green scale-105" : "text-slate-500 font-semibold"}`}>QL Kèo</span>
                {currentTab === "admin_ql_keo" && <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-neon-green shadow-[0_0_8px_#10b981] animate-pulse"></div>}
              </button>

              {/* Tab QL User */}
              <button onClick={() => setCurrentTab("admin_ql_user")} className="flex flex-col items-center justify-center w-16 h-full transition-all relative group">
                <div className={`p-1 rounded-xl transition-all duration-300 ${currentTab === "admin_ql_user" ? "text-neon-green scale-110 drop-shadow-[0_0_10px_rgba(16,185,129,0.75)]" : "text-slate-400 group-hover:text-slate-300 group-hover:scale-105"}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
                <span className={`text-[10px] font-extrabold tracking-wider transition-all duration-300 ${currentTab === "admin_ql_user" ? "text-neon-green text-shadow-green scale-105" : "text-slate-500 font-semibold"}`}>QL User</span>
                {currentTab === "admin_ql_user" && <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-neon-green shadow-[0_0_8px_#10b981] animate-pulse"></div>}
              </button>

              {/* Tab QL Sân */}
              <button onClick={() => setCurrentTab("admin_ql_san")} className="flex flex-col items-center justify-center w-16 h-full transition-all relative group">
                <div className={`p-1 rounded-xl transition-all duration-300 ${currentTab === "admin_ql_san" ? "text-neon-green scale-110 drop-shadow-[0_0_10px_rgba(16,185,129,0.75)]" : "text-slate-400 group-hover:text-slate-300 group-hover:scale-105"}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <span className={`text-[10px] font-extrabold tracking-wider transition-all duration-300 ${currentTab === "admin_ql_san" ? "text-neon-green text-shadow-green scale-105" : "text-slate-500 font-semibold"}`}>QL Sân</span>
                {currentTab === "admin_ql_san" && <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-neon-green shadow-[0_0_8px_#10b981] animate-pulse"></div>}
              </button>
            </nav>
          );
        }

        if (activeRoleMode === "chủ sân") {
          return (
            <nav className="glass-nav absolute bottom-0 inset-x-0 h-16 flex items-center justify-around z-40 border-t border-appDark-border/80">
              <button onClick={() => setCurrentTab("owner_tong_quan")} className="flex flex-col items-center justify-center w-16 h-full transition-all relative group">
                <div className={`p-1 rounded-xl transition-all duration-300 ${currentTab === "owner_tong_quan" ? "text-neon-green scale-110 drop-shadow-[0_0_10px_rgba(16,185,129,0.75)]" : "text-slate-400 group-hover:text-slate-300 group-hover:scale-105"}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" /></svg>
                </div>
                <span className={`text-[10px] font-extrabold tracking-wider transition-all duration-300 ${currentTab === "owner_tong_quan" ? "text-neon-green text-shadow-green scale-105" : "text-slate-500 font-semibold"}`}>Tổng quan</span>
                {currentTab === "owner_tong_quan" && <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-neon-green shadow-[0_0_8px_#10b981] animate-pulse"></div>}
              </button>

              <button onClick={() => setCurrentTab("owner_ql_san")} className="flex flex-col items-center justify-center w-16 h-full transition-all relative group">
                <div className={`p-1 rounded-xl transition-all duration-300 ${currentTab === "owner_ql_san" ? "text-neon-green scale-110 drop-shadow-[0_0_10px_rgba(16,185,129,0.75)]" : "text-slate-400 group-hover:text-slate-300 group-hover:scale-105"}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <span className={`text-[10px] font-extrabold tracking-wider transition-all duration-300 ${currentTab === "owner_ql_san" ? "text-neon-green text-shadow-green scale-105" : "text-slate-500 font-semibold"}`}>QL Sân</span>
                {currentTab === "owner_ql_san" && <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-neon-green shadow-[0_0_8px_#10b981] animate-pulse"></div>}
              </button>

              <button onClick={() => setCurrentTab("owner_booking")} className="flex flex-col items-center justify-center w-16 h-full transition-all relative group">
                <div className={`p-1 rounded-xl transition-all duration-300 ${currentTab === "owner_booking" ? "text-neon-green scale-110 drop-shadow-[0_0_10px_rgba(16,185,129,0.75)]" : "text-slate-400 group-hover:text-slate-300 group-hover:scale-105"}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <span className={`text-[10px] font-extrabold tracking-wider transition-all duration-300 ${currentTab === "owner_booking" ? "text-neon-green text-shadow-green scale-105" : "text-slate-500 font-semibold"}`}>Booking</span>
                {currentTab === "owner_booking" && <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-neon-green shadow-[0_0_8px_#10b981] animate-pulse"></div>}
              </button>

              <button onClick={() => setCurrentTab("owner_tai_khoan")} className="flex flex-col items-center justify-center w-16 h-full transition-all relative group">
                <div className={`p-1 rounded-xl transition-all duration-300 ${currentTab === "owner_tai_khoan" ? "text-neon-green scale-110 drop-shadow-[0_0_10px_rgba(16,185,129,0.75)]" : "text-slate-400 group-hover:text-slate-300 group-hover:scale-105"}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                </div>
                <span className={`text-[10px] font-extrabold tracking-wider transition-all duration-300 ${currentTab === "owner_tai_khoan" ? "text-neon-green text-shadow-green scale-105" : "text-slate-500 font-semibold"}`}>Tài khoản</span>
                {currentTab === "owner_tai_khoan" && <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-neon-green shadow-[0_0_8px_#10b981] animate-pulse"></div>}
              </button>
            </nav>
          );
        }

        // Cầu thủ
        return (
          <nav className="glass-nav absolute bottom-0 inset-x-0 h-16 flex items-center justify-around z-40 border-t border-appDark-border/80">
            <button onClick={() => { if(!currentUser) { alert("Vui lòng đăng nhập để tiếp tục thao tác!"); setCurrentTab("toi"); return; } resetFilters(); setCurrentTab("keo"); }} className="flex flex-col items-center justify-center w-16 h-full transition-all relative group">
              <div className={`p-1 rounded-xl transition-all duration-300 ${currentTab === "keo" ? "text-neon-green scale-110 drop-shadow-[0_0_10px_rgba(16,185,129,0.75)]" : "text-slate-400 group-hover:text-slate-300 group-hover:scale-105"}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M5 19L19 5M5 14l5 5M4 20l2-2" /><path strokeLinecap="round" strokeLinejoin="round" d="M19 19L5 5M19 14l-5 5M20 20l-2-2" /></svg>
              </div>
              <span className={`text-[10px] font-extrabold tracking-wider transition-all duration-300 ${currentTab === "keo" ? "text-neon-green text-shadow-green scale-105" : "text-slate-500 font-semibold"}`}>Kèo</span>
              {currentTab === "keo" && <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-neon-green shadow-[0_0_8px_#10b981] animate-pulse"></div>}
            </button>

            <button onClick={() => { if(!currentUser) { alert("Vui lòng đăng nhập để tiếp tục thao tác!"); setCurrentTab("toi"); return; } setCurrentTab("san"); }} className="flex flex-col items-center justify-center w-16 h-full transition-all relative group">
              <div className={`p-1 rounded-xl transition-all duration-300 ${currentTab === "san" ? "text-neon-green scale-110 drop-shadow-[0_0_10px_rgba(16,185,129,0.75)]" : "text-slate-400 group-hover:text-slate-300 group-hover:scale-105"}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-7 h-7">
                  <rect x="2" y="4" width="20" height="16" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="12" y1="4" x2="12" y2="20" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 8h3v8H2M22 8h-3v8h3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className={`text-[10px] whitespace-nowrap font-extrabold tracking-wider transition-all duration-300 ${currentTab === "san" ? "text-neon-green text-shadow-green scale-105" : "text-slate-500 font-semibold"}`}>Tìm Sân</span>
              {currentTab === "san" && <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-neon-green shadow-[0_0_8px_#10b981] animate-pulse"></div>}
            </button>

            <button onClick={() => { if(!currentUser) { alert("Vui lòng đăng nhập để tiếp tục thao tác!"); setCurrentTab("toi"); return; } setCurrentTab("doi"); }} className="flex flex-col items-center justify-center w-16 h-full transition-all relative group">
              <div className={`p-1 rounded-xl transition-all duration-300 ${currentTab === "doi" ? "text-neon-green scale-110 drop-shadow-[0_0_10px_rgba(16,185,129,0.75)]" : "text-slate-400 group-hover:text-slate-300 group-hover:scale-105"}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>
              </div>
              <span className={`text-[10px] font-extrabold tracking-wider transition-all duration-300 ${currentTab === "doi" ? "text-neon-green text-shadow-green scale-105" : "text-slate-500 font-semibold"}`}>Đội</span>
              {currentTab === "doi" && <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-neon-green shadow-[0_0_8px_#10b981] animate-pulse"></div>}
            </button>

            <button onClick={() => setCurrentTab("toi")} className="flex flex-col items-center justify-center w-16 h-full transition-all relative group">
              <div className={`p-1 rounded-xl transition-all duration-300 ${currentTab === "toi" ? "text-neon-green scale-110 drop-shadow-[0_0_10px_rgba(16,185,129,0.75)]" : "text-slate-400 group-hover:text-slate-300 group-hover:scale-105"}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
              </div>
              <span className={`text-[10px] font-extrabold tracking-wider transition-all duration-300 ${currentTab === "toi" ? "text-neon-green text-shadow-green scale-105" : "text-slate-500 font-semibold"}`}>Tôi</span>
              {currentTab === "toi" && <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-neon-green shadow-[0_0_8px_#10b981] animate-pulse"></div>}
            </button>
          </nav>
        );
      };

      return (
        <div className="min-h-screen bg-[#070A13] text-slate-100 flex justify-center selection:bg-neon-green selection:text-appDark-deep relative">
          
          {/* Outer Premium Layout Container (App Simulator on Desktop) */}
          <div className="w-full max-w-md bg-appDark-bg min-h-screen shadow-2xl flex flex-col relative pb-20 border-x border-appDark-border">
            
            {/* HEADER */}
            <div className="sticky top-0 z-50 w-full flex flex-col shadow-md">
              <header className="glass-header relative z-50 px-3 py-2 flex items-center justify-between border-b border-appDark-border/30 bg-appDark-bg/95 backdrop-blur-md">
                <div className="flex items-center gap-2" onClick={() => resetFilters()}>
                  <img src="/logo1.png" alt="Kèo Phủi" className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] cursor-pointer" />
                  <div>
                    <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-neon-green bg-clip-text text-transparent cursor-pointer">
                      KÈO PHỦI
                    </h1>
                    <p className="text-[9px] text-neon-green font-semibold tracking-wider uppercase -mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse inline-block"></span>
                      Chợ kèo bóng realtime
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 relative">
                  {currentUser ? (
                    <div className="relative">
                      <div 
                        onClick={() => setIsHeaderMenuOpen(!isHeaderMenuOpen)} 
                        className="flex items-center gap-2 bg-appDark-card px-2 py-1.5 rounded-xl border border-appDark-border cursor-pointer hover:border-neon-green transition-all"
                      >
                        <div className="w-6 h-6 rounded-full bg-neon-yellow text-appDark-deep flex items-center justify-center text-xs font-bold uppercase shrink-0">
                          {currentUser.name.charAt(0)}
                        </div>
                        <div className="flex flex-col items-start pr-1">
                          <span className="text-[11px] font-bold max-w-[80px] truncate text-slate-200 leading-tight">{currentUser.name}</span>
                          <span className="text-[9px] text-slate-400 font-semibold leading-tight flex items-center gap-1">
                            {activeRoleMode === "admin" ? "👑 Admin" : activeRoleMode === "chủ sân" ? "🏟️ Chủ sân" : "⚽ Cầu thủ"} ▼
                          </span>
                        </div>
                      </div>
                      
                      {isHeaderMenuOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setIsHeaderMenuOpen(false)}></div>
                          <div className="absolute right-0 top-full mt-2 w-44 bg-appDark-card border border-appDark-border rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in-up">
                            <div className="flex flex-col p-1">
                              <button 
                                onClick={() => { setActiveRoleMode("cầu thủ"); setCurrentTab("toi"); setIsHeaderMenuOpen(false); }}
                                className={`flex items-center gap-2 px-3 py-2 text-[11px] font-bold rounded-lg transition-all ${activeRoleMode === "cầu thủ" ? "bg-neon-green/20 text-neon-green" : "text-slate-300 hover:bg-appDark-deep"}`}
                              >
                                ⚽ Chế độ cầu thủ
                              </button>
                              {availableRoles.includes("chủ sân") && (
                                <button 
                                  onClick={() => { setActiveRoleMode("chủ sân"); setCurrentTab("owner_tong_quan"); setIsHeaderMenuOpen(false); }}
                                  className={`flex items-center gap-2 px-3 py-2 text-[11px] font-bold rounded-lg transition-all ${activeRoleMode === "chủ sân" ? "bg-neon-green/20 text-neon-green" : "text-slate-300 hover:bg-appDark-deep"}`}
                                >
                                  🏟️ Chế độ chủ sân
                                </button>
                              )}
                              {availableRoles.includes("admin") && (
                                <button 
                                  onClick={() => { setActiveRoleMode("admin"); setCurrentTab("admin_tong_quan"); setIsHeaderMenuOpen(false); }}
                                  className={`flex items-center gap-2 px-3 py-2 text-[11px] font-bold rounded-lg transition-all ${activeRoleMode === "admin" ? "bg-neon-green/20 text-neon-green" : "text-slate-300 hover:bg-appDark-deep"}`}
                                >
                                  👑 Chế độ admin
                                </button>
                              )}
                              <div className="h-px bg-appDark-border/50 my-1 mx-2"></div>
                              <button 
                                onClick={() => { 
                                  setIsHeaderMenuOpen(false);
                                  if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
                                    setCurrentUser(null);
                                    localStorage.removeItem('user');
                                    setCurrentTab('toi');
                                  }
                                }}
                                className="flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                              >
                                🚪 Đăng xuất
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <button 
                      onClick={() => setCurrentTab("toi")} 
                      className="text-[11px] font-bold px-3 py-1.5 bg-gradient-to-r from-neon-yellow to-amber-400 text-appDark-deep rounded-xl hover:scale-105 transition-all shadow-sm flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                      Đăng nhập
                    </button>
                  )}
                </div>
              </header>

              {/* REALTIME LIVE ACTIVITY TICKER */}
              <div className="bg-appDark-deep border-b border-appDark-border/50 py-1.5 px-3 overflow-hidden flex items-center gap-2 shadow-sm">
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-red-500/20 text-red-500 shrink-0 flex items-center gap-1 animate-pulse border border-red-500/40 relative z-10 bg-appDark-deep shadow-[0_0_10px_rgba(0,0,0,1)]">
                  <svg className="w-1.5 h-1.5 fill-current text-red-500" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3"/></svg> Live
                </span>
                <div className="relative w-full h-5 overflow-hidden flex-1 group">
                  <div className="absolute top-0 left-0 h-full flex items-center text-xs text-slate-300 font-medium whitespace-nowrap">
                    <marquee scrollamount="4" className="w-full">{dynamicLiveEventsText}</marquee>
                  </div>
                </div>
              </div>
            </div>

            {/* TAB CONTENT: KÈO (HOME) */}
            {currentTab === "keo" && (
              <main className="flex-1 p-4 space-y-4 overflow-y-auto no-scrollbar">
                

                
                
                <div 
                  className="relative h-28 rounded-2xl overflow-hidden border border-appDark-border shadow-lg flex items-center justify-between p-4 group"
                  style={{
                    backgroundImage: "url('/soccer_field_banner_bg.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center 60%'
                  }}
                >
                  {/* Overlay gradient mask */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent z-10"></div>
                  
                  {/* Glowing neon green lights inside */}
                  <div className="absolute top-0 right-1/4 w-32 h-32 bg-neon-green/20 rounded-full blur-2xl group-hover:scale-110 transition-all duration-700 z-10"></div>
                  
                  <div className="relative z-20 space-y-1 max-w-[70%] text-left">
                    <span className="inline-block text-[9px] font-black tracking-widest text-appDark-deep bg-gradient-to-r from-neon-green to-emerald-400 px-2 py-0.5 rounded-full uppercase shadow-[0_0_8px_#10B981]">
                      KÈO PHỦI CHỢ HÔM NAY
                    </span>
                    <h2 className="text-xs font-black text-white leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                      SÂN ĐẸP - GIỜ VÀNG - ĐỐI CỨNG
                    </h2>
                    <p className="text-[9.5px] text-slate-300 font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] leading-snug">
                      Hàng trăm câu lạc bộ đang tìm đối và ghép lẻ tại TP.HCM. Đăng sân trống ngay!
                    </p>
                  </div>
                  
                  {/* Floating Action Badge on Right */}
                  {isVenueOwnerGlobal && (
                    <div className="relative z-20 shrink-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md border border-neon-green/30 rounded-xl p-2.5 shadow-md neon-glow-green hover:scale-105 active:scale-95 cursor-pointer transition-all duration-350"
                         onClick={() => triggerActionWithAuth('create_slot')}>
                      <span className="text-xs font-black text-neon-green tracking-wider uppercase">Đăng Sân</span>
                      <span className="text-[9px] text-slate-300 font-bold">Click Ngay ⚡</span>
                    </div>
                  )}
                </div>

                {/* 1. BỘ LỌC NHANH Ở ĐẦU TRANG */}
                <div className="bg-appDark-card rounded-2xl p-4 border border-appDark-border space-y-3 shadow-md">
                  <div className="flex items-center justify-between border-b border-appDark-border/50 pb-2">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-neon-green">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
                      </svg>
                      Bộ lọc nhanh
                    </span>
                    {(filterDistrict !== "Tất cả" || filterTime !== "Tất cả" || filterPitchType !== "Tất cả" || filterCategory !== "Tất cả" || activeQuickAction !== null) && (
                      <button 
                        onClick={resetFilters} 
                        className="text-[10px] font-semibold text-neon-yellow bg-neon-yellow/10 px-2 py-0.5 rounded border border-neon-yellow/20 hover:bg-neon-yellow/20 transition-all"
                      >
                        Xóa lọc
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    {/* Khu Vực */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-slate-400">Khu vực</label>
                      <select 
                        value={filterDistrict}
                        onChange={(e) => setFilterDistrict(e.target.value)}
                        className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-lg px-2 py-1.5 text-slate-200 focus:outline-none focus:border-neon-green transition-all"
                      >
                        <option value="Tất cả">Tất cả</option>
                        <option value="Thủ Đức">Thủ Đức</option>
                        <option value="Bình Thạnh">Bình Thạnh</option>
                        <option value="Gò Vấp">Gò Vấp</option>
                      </select>
                    </div>

                    {/* Thời Gian */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-slate-400">Thời gian</label>
                      <select 
                        value={filterTime}
                        onChange={(e) => {
                          setFilterTime(e.target.value);
                          if (e.target.value !== "Chọn ngày cụ thể") {
                            setFilterCustomDate("");
                          }
                        }}
                        className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-lg px-2 py-1.5 text-slate-200 focus:outline-none focus:border-neon-green transition-all"
                      >
                        <option value="Tất cả">Tất cả</option>
                        <option value="Hôm nay">Hôm nay</option>
                        <option value="Ngày mai">Ngày mai</option>
                        <option value="Chọn ngày cụ thể">📅 Chọn...</option>
                      </select>
                    </div>

                    {/* Loại Sân */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-slate-400">Loại sân</label>
                      <select 
                        value={filterPitchType}
                        onChange={(e) => setFilterPitchType(e.target.value)}
                        className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-lg px-2 py-1.5 text-slate-200 focus:outline-none focus:border-neon-green transition-all"
                      >
                        <option value="Tất cả">Tất cả</option>
                        <option value="Sân 5">Sân 5</option>
                        <option value="Sân 7">Sân 7</option>
                        <option value="Sân 11">Sân 11</option>
                      </select>
                    </div>

                    {/* Đối Tượng */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-slate-400">Đối tượng</label>
                      <select 
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-lg px-2 py-1.5 text-slate-200 focus:outline-none focus:border-neon-green transition-all"
                      >
                        <option value="Tất cả">Tất cả</option>
                        <option value="Kèo Nam">Kèo Nam</option>
                        <option value="Kèo Nữ">Kèo Nữ</option>
                        <option value="Lão Tướng">Lão Tướng</option>
                      </select>
                    </div>
                  </div>

                  {filterTime === "Chọn ngày cụ thể" && (
                    <div className="pt-2 border-t border-appDark-border/30 mt-2 space-y-1 animate-fade-in">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neon-green flex items-center gap-1">
                        📅 Lọc ngày cụ thể từ lịch:
                      </label>
                      <input 
                        type="date"
                        value={filterCustomDate}
                        onChange={(e) => setFilterCustomDate(e.target.value)}
                        className="w-full text-xs font-semibold bg-appDark-deep border border-neon-green/40 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-neon-green transition-all"
                      />
                    </div>
                  )}
                </div>

                {/* 2. QUICK ACTION BUTTONS */}
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => setActiveQuickAction(activeQuickAction === 'doi' ? null : 'doi')}
                    className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center border transition-all ${
                      activeQuickAction === 'doi' 
                        ? 'bg-neon-green text-appDark-deep border-neon-green font-bold shadow-md neon-glow-green scale-105' 
                        : 'bg-appDark-card text-slate-200 border-appDark-border hover:border-slate-500'
                    }`}
                  >
                    <span className="text-lg mb-0.5">🤝</span>
                    <span className="text-[10px] font-bold tracking-tight">Tìm Đối</span>
                  </button>

                  <button 
                    onClick={() => setActiveQuickAction(activeQuickAction === 'thieu' ? null : 'thieu')}
                    className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center border transition-all ${
                      activeQuickAction === 'thieu' 
                        ? 'bg-neon-green text-appDark-deep border-neon-green font-bold shadow-md neon-glow-green scale-105' 
                        : 'bg-appDark-card text-slate-200 border-appDark-border hover:border-slate-500'
                    }`}
                  >
                    <span className="text-lg mb-0.5">🏃‍♂️</span>
                    <span className="text-[10px] font-bold tracking-tight">Thiếu Người</span>
                  </button>

                  <button 
                    onClick={() => {
                      resetFilters();
                      setCurrentTab("san");
                    }}
                    className="py-2 px-1 rounded-xl flex flex-col items-center justify-center bg-appDark-card text-slate-200 border border-appDark-border hover:border-slate-500 transition-all"
                  >
                    <span className="text-lg mb-0.5">🏟️</span>
                    <span className="text-[10px] font-bold tracking-tight">Tìm Sân</span>
                  </button>
                </div>

                {/* SHOWING FILTER CONTEXT IF FILTERED */}
                {(filterDistrict !== "Tất cả" || filterTime !== "Tất cả" || filterPitchType !== "Tất cả" || activeQuickAction !== null) && (
                  <div className="flex items-center justify-between bg-appDark-cardLight px-3 py-2 rounded-xl text-xs border border-appDark-border">
                    <div className="flex flex-wrap gap-1 items-center">
                      <span className="text-slate-400">Đang lọc:</span>
                      {filterDistrict !== "Tất cả" && <span className="bg-appDark-deep text-neon-green px-2 py-0.5 rounded font-semibold">{filterDistrict}</span>}
                      {filterTime !== "Tất cả" && <span className="bg-appDark-deep text-neon-green px-2 py-0.5 rounded font-semibold">{filterTime}</span>}
                      {filterPitchType !== "Tất cả" && <span className="bg-appDark-deep text-neon-green px-2 py-0.5 rounded font-semibold">{filterPitchType}</span>}
                      {activeQuickAction && <span className="bg-neon-yellow text-appDark-deep px-2 py-0.5 rounded font-bold">{activeQuickAction === 'doi' ? 'Tìm đối' : 'Thiếu người'}</span>}
                    </div>
                    <button onClick={resetFilters} className="text-neon-yellow text-xs font-bold hover:underline shrink-0">Bỏ lọc</button>
                  </div>
                )}

                {/* 3. SECTION "KÈO HOT" */}
                {activeQuickAction !== 'thieu' && (
                  <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-neon-green shadow-[0_0_8px_#10B981]"></span>
                        🔥 Kèo Hot Chợ Hôm Nay - {String(new Date().getDate()).padStart(2, '0')}/{String(new Date().getMonth() + 1).padStart(2, '0')} 🔥
                      </h2>
                      <span className="text-[10px] text-slate-400 font-bold ml-4 mt-0.5 uppercase tracking-wide">
                        ⚡ Đang có <span className="text-neon-green font-extrabold">{filteredMatches.filter(m => m.status === 'Cần đối' || m.status === 'Đang chờ xác nhận' || m.status === 'waiting_opponent' || m.status === 'pending_confirmation').length} trận đấu</span> đang chờ nhận đối
                      </span>
                    </div>
                    <button 
                      onClick={() => triggerActionWithAuth('create_missing_player')}
                      className="text-[10px] font-black bg-gradient-to-r from-neon-yellow to-amber-500 text-appDark-deep px-2.5 py-1.5 rounded-xl hover:scale-105 transition-all shadow-md neon-glow-yellow flex items-center gap-0.5 shrink-0"
                    >
                      <span>+</span> Tuyển Cầu Lẻ
                    </button>
                  </div>

                  {(() => {
                    const hotMatches = filteredMatches.filter(m => m.status === 'Cần đối' || m.status === 'Đang chờ xác nhận' || m.status === 'waiting_opponent' || m.status === 'pending_confirmation');
                    const totalMatchPages = Math.ceil(hotMatches.length / ITEMS_PER_PAGE);
                    const paginatedHotMatches = hotMatches.slice((matchPage - 1) * ITEMS_PER_PAGE, matchPage * ITEMS_PER_PAGE);

                    if (hotMatches.length === 0) {
                      return (
                        <div className="bg-appDark-card border border-appDark-border rounded-2xl py-8 px-4 text-center">
                          <p className="text-slate-400 text-sm">Không tìm thấy kèo đấu hot nào phù hợp.</p>
                          <button onClick={resetFilters} className="mt-3 text-xs font-bold text-neon-green hover:underline">Xem tất cả các kèo</button>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3.5">
                        {paginatedHotMatches.map(match => (
                          <MatchCard 
                            key={match.id} 
                            match={match} 
                            onSelect={() => setSelectedMatch(match)}
                            onAction={(type, e) => {
                              e.stopPropagation();
                              triggerActionWithAuth(type, match);
                            }}
                          />
                        ))}

                        {/* Pagination Controls */}
                        {totalMatchPages > 1 && (
                          <div className="flex items-center justify-center gap-1.5 pt-4 pb-2">
                            <button 
                              disabled={matchPage === 1}
                              onClick={() => setMatchPage(matchPage - 1)}
                              className="p-1 px-2.5 rounded-lg bg-appDark-card border border-appDark-border text-slate-400 text-[10px] uppercase font-bold hover:border-slate-500 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
                            >
                              Trước
                            </button>
                            {Array.from({ length: totalMatchPages }, (_, i) => i + 1).map(page => (
                              <button 
                                key={page}
                                onClick={() => setMatchPage(page)}
                                className={`w-7 h-7 rounded-lg text-xs font-black transition-all ${
                                  matchPage === page 
                                    ? 'bg-neon-green text-appDark-deep shadow-md neon-glow-green scale-105' 
                                    : 'bg-appDark-card border border-appDark-border text-slate-400 hover:border-slate-500 hover:text-white'
                                }`}
                              >
                                {page}
                              </button>
                            ))}
                            <button 
                              disabled={matchPage === totalMatchPages}
                              onClick={() => setMatchPage(matchPage + 1)}
                              className="p-1 px-2.5 rounded-lg bg-appDark-card border border-appDark-border text-slate-400 text-[10px] uppercase font-bold hover:border-slate-500 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
                            >
                              Sau
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  </div>
                )}

                {/* 4. SECTION "KÈO THIẾU NGƯỜI" */}
                {activeQuickAction !== 'doi' && (
                  <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-neon-yellow shadow-[0_0_8px_#FACC15]"></span>
                      🏃‍♂️ Ghép Lẻ / Thiếu Người ({filteredMatches.filter(m => m.status === 'Thiếu người' || m.status === 'Đã đủ người').length})
                    </h2>
                  </div>

                  {filteredMatches.filter(m => m.status === 'Thiếu người' || m.status === 'Đã đủ người').length === 0 ? (
                    <div className="bg-appDark-card border border-appDark-border rounded-2xl py-8 px-4 text-center">
                      <p className="text-slate-400 text-sm">Hiện tại không có tin tuyển lẻ nào phù hợp.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {filteredMatches
                        .filter(m => m.status === 'Thiếu người' || m.status === 'Đã đủ người')
                        .map(match => (
                          <PlayerNeededCard 
                            key={match.id}
                            match={match}
                            onSelect={() => setSelectedMatch(match)}
                            onJoin={(e) => {
                              e.stopPropagation();
                              triggerActionWithAuth('join', match);
                            }}
                          />
                        ))}
                    </div>
                  )}
                  </div>
                )}



              </main>
            )}

            {/* TAB CONTENT: ĐẶT SÂN (Redesigned realtime inventory grid) */}
            {currentTab === "san" && (
              <main className="flex-1 p-4 space-y-4 overflow-y-auto no-scrollbar">
                {/* VENUE OWNER REGISTRATION BANNER */}
                {(() => {
                  const myVenue = venues.find(v => v.owner_user_id === currentUser?.id);
                  if (!myVenue && !isVenueOwnerGlobal) {
                    return (
                      <div 
                        className="relative h-28 rounded-2xl overflow-hidden border border-appDark-border shadow-lg flex items-center justify-between p-4 group mb-4"
                        style={{
                          backgroundImage: "url('/soccer_field_banner_bg.png')",
                          backgroundSize: 'cover',
                          backgroundPosition: 'center 60%'
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent z-10"></div>
                        <div className="absolute top-0 right-1/4 w-32 h-32 bg-sky-400/20 rounded-full blur-2xl group-hover:scale-110 transition-all duration-700 z-10"></div>
                        
                        <div className="relative z-20 space-y-1 max-w-[70%] text-left">
                          <span className="inline-block text-[9px] font-black tracking-widest text-appDark-deep bg-gradient-to-r from-sky-400 to-blue-500 px-2 py-0.5 rounded-full uppercase shadow-[0_0_8px_#38BDF8]">
                            HỢP TÁC CHỦ SÂN
                          </span>
                          <h2 className="text-xs font-black text-white leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                            BẠN SỞ HỮU SÂN BÓNG CỎ NHÂN TẠO?
                          </h2>
                          <p className="text-[9.5px] text-slate-300 font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] leading-snug">
                            Hãy đăng ký vai trò Chủ Sân để đăng tin bán giờ trống, slot ưu đãi cho các đội bóng!
                          </p>
                        </div>
                        
                        <div className="relative z-20 shrink-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md border border-sky-400/30 rounded-xl p-2.5 shadow-md hover:scale-105 active:scale-95 cursor-pointer transition-all duration-350"
                            onClick={() => triggerActionWithAuth('venue_registration')}>
                          <span className="text-[10px] font-black text-sky-400 tracking-wider uppercase text-center leading-tight">Đăng<br/>Ký Ngay</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
                
                {/* HEAD & POST ACTION FOR OWNERS */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight">🏟️ Tìm Sân Cỏ Real-Time</h2>
                    <p className="text-xs text-slate-400">Chọn sân bóng và đặt lịch trực tiếp theo nhu cầu</p>
                  </div>
                  {activeRoleMode === "chủ sân" || activeRoleMode === "admin" ? (
                    <button 
                      onClick={() => triggerActionWithAuth('create_slot')}
                      className="text-xs font-bold bg-gradient-to-r from-neon-green to-emerald-500 text-appDark-deep px-3 py-2 rounded-xl flex items-center gap-1 hover:scale-105 transition-all shadow-md neon-glow-green shrink-0"
                    >
                      <span>+</span> Đăng Sân Trống
                    </button>
                  ) : null}
                </div>

                {/* FILTERS FOR PITCH TAB */}
                {!isBookingFilterExpanded ? (
                  <div className="bg-appDark-card border border-appDark-border rounded-2xl p-3 flex flex-wrap gap-2 items-center justify-between shadow-md">
                    {/* Left: Summary of active filters */}
                    <div className="flex flex-wrap gap-1 items-center">
                      <span className="text-[9px] font-black uppercase text-neon-green bg-neon-green/10 px-1.5 py-0.5 rounded border border-neon-green/20">📍 LỌC NHANH</span>
                      <span className="text-[11px] font-bold text-slate-300 bg-slate-800/60 px-2 py-0.5 rounded-xl border border-slate-700/50">
                        {bookingDistrict === 'Tất cả' ? 'Khu vực' : `📍 ${bookingDistrict}`}
                      </span>
                      <span className="text-[11px] font-bold text-slate-300 bg-slate-800/60 px-2 py-0.5 rounded-xl border border-slate-700/50">
                        {bookingDate === 'Chọn ngày cụ thể' ? `📅 ${bookingCustomDate || 'Chọn ngày'}` : `📅 ${bookingDate}`}
                      </span>
                      <span className="text-[11px] font-bold text-slate-300 bg-slate-800/60 px-2 py-0.5 rounded-xl border border-slate-700/50">
                        {bookingPitchType === 'Tất cả' ? 'Tất cả sân' : `⚽ ${bookingPitchType}`}
                      </span>
                      <span className="text-[11px] font-bold text-slate-300 bg-slate-800/60 px-2 py-0.5 rounded-xl border border-slate-700/50">
                        {bookingTime === 'Tất cả' ? 'Cả ngày' : `⏱️ ${bookingTime}`}
                      </span>
                    </div>
                    {/* Right: Expand Button */}
                    <button 
                      onClick={() => setIsBookingFilterExpanded(true)}
                      className="text-xs font-black uppercase text-neon-green bg-neon-green/10 border border-neon-green/30 px-3 py-1 rounded-xl hover:bg-neon-green/20 transition-all flex items-center gap-1 shrink-0"
                    >
                      Bộ lọc ▾
                    </button>
                  </div>
                ) : (
                  <div className="bg-appDark-card border border-appDark-border rounded-2xl p-4 space-y-3.5 animate-fade-in shadow-xl relative overflow-hidden">
                    <div className="flex items-center justify-between border-b border-appDark-border/40 pb-2">
                      <div className="text-[11px] font-black uppercase text-neon-green tracking-wider flex items-center gap-1">
                        🔍 BỘ LỌC TÌM KIẾM SÂN CHI TIẾT
                      </div>
                      <button 
                        onClick={() => setIsBookingFilterExpanded(false)}
                        className="text-xs font-black uppercase text-slate-400 hover:text-white transition-all flex items-center gap-1"
                      >
                        Thu gọn ▴
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {/* Khu vực */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wide">Khu vực</label>
                        <select 
                          value={bookingDistrict}
                          onChange={(e) => setBookingDistrict(e.target.value)}
                          className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-neon-green transition-all"
                        >
                          <option value="Tất cả">Tất cả khu vực</option>
                          <option value="Thủ Đức">Thủ Đức</option>
                          <option value="Bình Thạnh">Bình Thạnh</option>
                          <option value="Gò Vấp">Gò Vấp</option>
                          <option value="Quận 7">Quận 7</option>
                        </select>
                      </div>

                      {/* Ngày */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wide">Ngày đá</label>
                        <select 
                          value={bookingDate}
                          onChange={(e) => {
                            setBookingDate(e.target.value);
                            if (e.target.value !== "Chọn ngày cụ thể") {
                              setBookingCustomDate("");
                            }
                          }}
                          className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-neon-green transition-all"
                        >
                          <option value="Tất cả">Tất cả ngày</option>
                          <option value="Hôm nay">Hôm nay</option>
                          <option value="Ngày mai">Ngày mai</option>
                          <option value="Chọn ngày cụ thể">📅 Chọn ngày...</option>
                        </select>
                      </div>

                      {/* Loại sân */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wide">Loại Sân</label>
                        <select 
                          value={bookingPitchType}
                          onChange={(e) => setBookingPitchType(e.target.value)}
                          className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-neon-green transition-all"
                        >
                          <option value="Tất cả">Tất cả</option>
                          <option value="Sân 5">Sân 5</option>
                          <option value="Sân 7">Sân 7</option>
                          <option value="Sân 11">Sân 11</option>
                        </select>
                      </div>

                      {/* Giờ muốn đá */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wide">Giờ đá</label>
                        <select 
                          value={bookingTime}
                          onChange={(e) => setBookingTime(e.target.value)}
                          className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-neon-green transition-all"
                        >
                          <option value="Tất cả">Tất cả khung giờ</option>
                          <optgroup label="⚡ Lọc nhanh theo buổi">
                            <option value="Sáng">🌅 Sáng (5:00 - 12:00)</option>
                            <option value="Chiều">☀️ Chiều (12:00 - 17:00)</option>
                            <option value="Tối">🌙 Tối (17:00 - 22:00)</option>
                            <option value="Đêm">🌌 Đêm (22:00 - 5:00)</option>
                          </optgroup>
                          <optgroup label="⏰ Giờ cụ thể">
                            <option value="06:00">06:00</option>
                            <option value="06:30">06:30</option>
                            <option value="07:00">07:00</option>
                            <option value="07:30">07:30</option>
                            <option value="08:00">08:00</option>
                            <option value="08:30">08:30</option>
                            <option value="09:00">09:00</option>
                            <option value="09:30">09:30</option>
                            <option value="10:00">10:00</option>
                            <option value="10:30">10:30</option>
                            <option value="11:00">11:00</option>
                            <option value="11:30">11:30</option>
                            <option value="12:00">12:00</option>
                            <option value="12:30">12:30</option>
                            <option value="13:00">13:00</option>
                            <option value="13:30">13:30</option>
                            <option value="14:00">14:00</option>
                            <option value="14:30">14:30</option>
                            <option value="15:00">15:00</option>
                            <option value="15:30">15:30</option>
                            <option value="16:00">16:00</option>
                            <option value="16:30">16:30</option>
                            <option value="17:00">17:00</option>
                            <option value="17:30">17:30</option>
                            <option value="18:00">18:00</option>
                            <option value="18:30">18:30</option>
                            <option value="19:00">19:00</option>
                            <option value="19:30">19:30</option>
                            <option value="20:00">20:00</option>
                            <option value="20:30">20:30</option>
                            <option value="21:00">21:00</option>
                            <option value="21:30">21:30</option>
                            <option value="22:00">22:00</option>
                            <option value="22:30">22:30</option>
                            <option value="23:00">23:00</option>
                            <option value="23:30">23:30</option>
                            <option value="00:00">00:00 (24:00)</option>
                          </optgroup>
                        </select>
                      </div>

                      {/* Thời lượng */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wide">Thời lượng</label>
                        <select 
                          value={bookingDuration}
                          onChange={(e) => setBookingDuration(e.target.value)}
                          className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-neon-green transition-all"
                        >
                          <option value="Tất cả">Tất cả thời lượng</option>
                          <option value="60 phút">60 phút</option>
                          <option value="90 phút">90 phút</option>
                          <option value="120 phút">120 phút</option>
                        </select>
                      </div>
                    </div>

                    {bookingDate === "Chọn ngày cụ thể" && (
                      <div className="pt-2 border-t border-appDark-border/30 mt-1 space-y-1 animate-fade-in col-span-2 sm:col-span-3">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-neon-green flex items-center gap-1">
                          📅 Chọn ngày cụ thể từ lịch:
                        </label>
                        <input 
                          type="date"
                          value={bookingCustomDate}
                          onChange={(e) => setBookingCustomDate(e.target.value)}
                          className="w-full text-xs font-semibold bg-appDark-deep border border-neon-green/45 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-neon-green transition-all"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* SLOTS REALTIME INVENTORY GROUPED BY VENUE */}
                {(() => {
                  const venuesWithSlots = [];
                  venues.forEach(v => {
                    // Skip completely if the venue is marked as inactive (master switch OFF)
                    if (v.status === 'inactive') return;
                    
                    // Self-healing: Check if any other venue with a matching name (case-insensitive) is marked as inactive
                    const cleanVName = (v.name || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/sân\s+/gi, "").replace(/[^a-z0-9]/g, "");
                    const hasInactiveMatch = venues.some(ov => {
                      if (ov.status !== 'inactive') return false;
                      const cleanOVName = (ov.name || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/sân\s+/gi, "").replace(/[^a-z0-9]/g, "");
                      return cleanOVName === cleanVName;
                    });
                    if (hasInactiveMatch) return;

                    // Filter venues by district geographically first
                    if (bookingDistrict !== 'Tất cả' && v.district !== bookingDistrict) return;

                    const cleanCompare = (name) => (name || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/sân\s+/gi, "").replace(/[^a-z0-9]/g, "").trim();
                    const venueSlots = filteredBookingSlots.filter(s => s.venueId === v.id || cleanCompare(s.venueName) === cleanCompare(v.name));
                    
                    // Always show the venue card to keep it on the board even if 0 slots match preference filters
                    venuesWithSlots.push({
                      venue: v,
                      slots: venueSlots
                    });
                  });

                  if (venuesWithSlots.length === 0) {
                    return (
                      <div className="bg-appDark-card border border-appDark-border rounded-2xl py-12 text-center">
                        <p className="text-slate-400 text-sm">Hiện chưa có cụm sân nào có khung giờ trống phù hợp với bộ lọc của bạn.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      {venuesWithSlots.map(({ venue, slots: venueSlots }) => {
                        const availableCount = venueSlots.filter(s => s.status === 'available').length;
                        
                        // Count real matches waiting for opponents associated with this venue
                        const cleanVenueNameForMatch = (vName) => (vName || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/sân\s+/gi, "").replace(/[^a-z0-9]/g, "");
                        const cleanVName = cleanVenueNameForMatch(venue.name);
                        
                        const venueMatches = matches.filter(m => {
                          const isWaiting = m.status === 'Cần đối' || m.status === 'waiting_opponent' || m.status === 'pending_confirmation' || m.status === 'Đang chờ xác nhận';
                          if (!isWaiting) return false;
                          
                          const mVenueName = cleanVenueNameForMatch(m.venue);
                          return mVenueName === cleanVName || m.venueId === venue.id || (m.venue_slot_id && slots.some(s => (s.id === m.venue_slot_id || s.slotId === m.venue_slot_id) && (s.venueId === venue.id || cleanVenueNameForMatch(s.venueName) === cleanVName)));
                        });
                        
                        const holdingCount = venueMatches.length;

                        return (
                          <div 
                            key={venue.id} 
                            className="bg-appDark-card border border-appDark-border rounded-2xl overflow-hidden group shadow-lg hover:border-slate-700/80 transition-all duration-300 flex flex-col"
                          >
                            {/* Mini Image Preview Banner with Field Type Badge - Reduced height to exactly 15px and kept blank/empty as requested */}
                            <div className="h-[15px] relative bg-slate-900 border-b border-appDark-border/30 shrink-0">
                              {/* Sleek CSS Soccer field pattern / Gradient banner */}
                              <div className="absolute inset-0 bg-gradient-to-r from-emerald-800/40 via-slate-950/75 to-emerald-950/40 z-0"></div>
                              <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.18),rgba(0,0,0,0))] z-0"></div>
                            </div>

                            <div className="p-4 space-y-4">
                              {/* Venue details */}
                              <div className="flex justify-between items-start">
                                <div className="space-y-1 max-w-[70%]">
                                  <h3 className="font-extrabold text-base text-white tracking-tight text-left">
                                    {venue.name}
                                  </h3>
                                  <p className="text-[11px] text-slate-400 flex items-center gap-1 leading-snug text-left">
                                    <span>📍</span> {venue.address}
                                  </p>
                                  
                                  {/* Quick Venue Compact Badges - Dynamically linked to Owner's Control Panel configurations */}
                                  <div className="flex flex-wrap gap-1 pt-1.5">
                                    {(venue.facilities || ["📷 Camera sân", "⚖️ Thuê trọng tài", "🌧️ Cập nhật thời tiết", "📡 Livestream", "🏟️ Mái che", "👕 Thuê áo bib", "👟 Thuê giày", "🥇 Hay tổ chức giải"]).map(fac => {
                                      let emoji = "";
                                      if (fac === "Wifi") emoji = "📶 ";
                                      else if (fac === "Đèn chiếu sáng") emoji = "💡 ";
                                      else if (fac === "Gửi xe") emoji = "🅿️ ";
                                      else if (fac === "Căn tin") emoji = "🥤 ";
                                      else if (fac === "Nước free") emoji = "💧 ";
                                      else if (fac === "Trọng tài") emoji = "🏁 ";
                                      
                                      return (
                                        <span 
                                          key={fac} 
                                          className="text-[9px] font-bold text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/40"
                                        >
                                          {emoji}{fac}
                                        </span>
                                      );
                                    })}
                                  </div>
                                </div>
                                
                                <div className="flex flex-col items-end space-y-1 shrink-0">
                                  <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-1 rounded-lg border border-amber-400/20">
                                    ⭐ {venue.rating || "4.8"}
                                  </div>
                                  <div className="text-[10px] font-extrabold text-neon-yellow bg-neon-yellow/10 px-2 py-0.5 rounded border border-neon-yellow/20">
                                    🚗 {venue.id === 'v_casau' ? '1.2 km' : venue.id === 'v_s1' ? '0.8 km' : venue.id === 'v_s2' ? '2.3 km' : '1.5 km'}
                                  </div>
                                </div>
                              </div>

                              {/* Slot Summary Bar & Full calendar button */}
                              <div className="flex items-center justify-between bg-appDark-deep/40 rounded-xl p-2.5 border border-appDark-border/60 text-[10.5px] font-extrabold text-slate-400 flex-wrap gap-2">
                                <div className="flex gap-2 flex-wrap">
                                  <button
                                    onClick={() => {
                                      if (availableCount > 0) {
                                        if (expandedVenueId === venue.id && expandedVenueType === 'available') {
                                          setExpandedVenueId(null);
                                          setExpandedVenueType(null);
                                        } else {
                                          setExpandedVenueId(venue.id);
                                          setExpandedVenueType('available');
                                        }
                                      } else {
                                        alert("🏟️ Không có slot trống nào phù hợp với bộ lọc hiện tại.");
                                      }
                                    }}
                                    className={`px-2.5 py-1.5 rounded-lg border transition-all text-[10px] font-black uppercase flex items-center gap-1 cursor-pointer hover:scale-102 active:scale-98 ${
                                      expandedVenueId === venue.id && expandedVenueType === 'available'
                                        ? 'bg-neon-green text-appDark-deep border-neon-green shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                                        : 'bg-neon-green/10 text-neon-green border-neon-green/20 hover:bg-neon-green/20'
                                    }`}
                                    title="Bấm vào để xem các slot trống cụ thể"
                                  >
                                    🟢 Còn {availableCount} slot trống
                                  </button>

                                  <button
                                    onClick={() => {
                                      if (holdingCount > 0) {
                                        if (expandedVenueId === venue.id && expandedVenueType === 'holding') {
                                          setExpandedVenueId(null);
                                          setExpandedVenueType(null);
                                        } else {
                                          setExpandedVenueId(venue.id);
                                          setExpandedVenueType('holding');
                                        }
                                      } else {
                                        alert("🏟️ Cụm sân này chưa có kèo đấu nào đang chờ đối.");
                                      }
                                    }}
                                    className={`px-2.5 py-1.5 rounded-lg border transition-all text-[10px] font-black uppercase flex items-center gap-1 cursor-pointer hover:scale-102 active:scale-98 ${
                                      expandedVenueId === venue.id && expandedVenueType === 'holding'
                                        ? 'bg-neon-yellow text-appDark-deep border-neon-yellow shadow-[0_0_10px_rgba(234,179,8,0.4)]'
                                        : 'bg-neon-yellow/10 text-neon-yellow border-neon-yellow/20 hover:bg-neon-yellow/20'
                                    }`}
                                    title="Bấm vào để xem các kèo đang chờ đối"
                                  >
                                    🟡 {holdingCount} kèo chờ đối
                                  </button>
                                </div>
                                <button 
                                  onClick={() => setFullScheduleVenue(venue)}
                                  className="text-sky-400 hover:text-sky-300 hover:underline transition-all flex items-center gap-0.5 shrink-0 font-extrabold"
                                >
                                  📅 Xem lịch đầy đủ
                                </button>
                              </div>

                              {/* Expanded matching slots list */}
                              {expandedVenueId === venue.id && expandedVenueType === 'available' && (
                                <div className="p-3 bg-appDark-deep/80 rounded-xl border border-neon-green/30 space-y-2 animate-fade-in">
                                  <div className="flex justify-between items-center pb-2 border-b border-appDark-border/30">
                                    <span className="text-[9.5px] font-black uppercase text-neon-green tracking-wider">🎯 Khung giờ trống phù hợp ({availableCount})</span>
                                    <button 
                                      onClick={() => {
                                        setExpandedVenueId(null);
                                        setExpandedVenueType(null);
                                      }}
                                      className="text-slate-400 hover:text-white text-[10px] font-bold"
                                    >Đóng ✕</button>
                                  </div>
                                  <div className="max-h-48 overflow-y-auto space-y-1.5 no-scrollbar">
                                    {venueSlots.filter(s => s.status === 'available').length === 0 ? (
                                      <div className="text-center py-4 text-slate-500 text-[11px]">Không có slot nào trống phù hợp.</div>
                                    ) : (
                                      venueSlots.filter(s => s.status === 'available').map(slot => {
                                        const getCleanSubName = (name) => {
                                          if (!name) return '';
                                          return name.replace(/^(sân|Sân|SÂN)\s*/i, '').trim();
                                        };
                                        const displayName = slot.fieldName 
                                          ? `${getCleanSubName(slot.fieldName)} · ${slot.pitchType}` 
                                          : 'Sân con';

                                        return (
                                          <div 
                                            key={slot.id}
                                            onClick={() => setSelectedBookingSlot(slot)}
                                            className="flex items-center justify-between p-2 rounded-xl bg-appDark-card border border-appDark-border hover:border-neon-green/50 transition-all cursor-pointer active:scale-[0.99] text-xs text-left"
                                          >
                                            <div className="flex flex-col gap-0.5 truncate max-w-[65%]">
                                              <div className="flex items-center gap-1.5">
                                                <span className="text-[10px] text-slate-300 font-extrabold">{slot.rawTime || slot.rawDate || "Hôm nay"}</span>
                                                <span className="text-slate-600">•</span>
                                                <span className="font-extrabold text-white text-[11px]">{slot.startTime} - {slot.endTime}</span>
                                              </div>
                                              <div className="text-[10px] text-slate-400 font-semibold">{displayName}</div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                              {slot.isSale ? (
                                                <div className="flex flex-col items-end">
                                                  <span className="text-slate-500 line-through text-[8px] font-bold">{(slot.originalPrice || 0).toLocaleString('vi-VN')}đ</span>
                                                  <span className="text-amber-400 font-black text-[10.5px]">{(slot.price || 0).toLocaleString('vi-VN')}đ</span>
                                                </div>
                                              ) : (
                                                <span className="text-neon-green font-black text-[10.5px]">{(slot.price || 300000).toLocaleString('vi-VN')}đ</span>
                                              )}
                                              <button className="px-2.5 py-1 bg-neon-green text-appDark-deep text-[9px] font-black uppercase rounded-lg shadow-md hover:scale-105 transition-all">
                                                Đặt ngay
                                              </button>
                                            </div>
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Expanded matching holding matches list */}
                              {expandedVenueId === venue.id && expandedVenueType === 'holding' && (
                                <div className="p-3 bg-appDark-deep/80 rounded-xl border border-neon-yellow/30 space-y-2 animate-fade-in">
                                  <div className="flex justify-between items-center pb-2 border-b border-appDark-border/30">
                                    <span className="text-[9.5px] font-black uppercase text-neon-yellow tracking-wider">🔥 Kèo chờ đối phù hợp ({holdingCount})</span>
                                    <button 
                                      onClick={() => {
                                        setExpandedVenueId(null);
                                        setExpandedVenueType(null);
                                      }}
                                      className="text-slate-400 hover:text-white text-[10px] font-bold"
                                    >Đóng ✕</button>
                                  </div>
                                  <div className="max-h-48 overflow-y-auto space-y-1.5 no-scrollbar">
                                    {venueMatches.length === 0 ? (
                                      <div className="text-center py-4 text-slate-500 text-[11px]">Không có kèo đấu nào đang chờ đối.</div>
                                    ) : (
                                      venueMatches.map(match => {
                                        const slot = slots.find(s => s.id === match.venue_slot_id || s.slotId === match.venue_slot_id);
                                        return (
                                          <div 
                                            key={match.id}
                                            onClick={() => triggerActionWithAuth('receive', match)}
                                            className="flex items-center justify-between p-2 rounded-xl bg-appDark-card border border-appDark-border hover:border-neon-yellow/50 transition-all cursor-pointer active:scale-[0.99] text-xs text-left"
                                          >
                                            <div className="flex flex-col gap-0.5 truncate max-w-[70%]">
                                              <div className="flex items-center gap-1.5">
                                                <span className="text-[10px] text-slate-300 font-extrabold">{match.dateStr || "Hôm nay"}</span>
                                                <span className="text-slate-600">•</span>
                                                <span className="font-extrabold text-neon-yellow text-[11px]">{match.timeSlot || (slot ? `${slot.startTime}-${slot.endTime}` : '')}</span>
                                              </div>
                                              <div className="text-[10.5px] text-white font-extrabold truncate">{match.teamName || 'FC Gà Rừng'}</div>
                                            </div>
                                            <button className="px-2.5 py-1 bg-gradient-to-r from-neon-yellow to-amber-500 text-appDark-deep text-[9px] font-black uppercase rounded-lg shadow-md hover:scale-105 transition-all">
                                              Nhận kèo
                                            </button>
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Compact slot summary + max 2 holding keo */}
                              {(() => {
                                const holdingSlots = venueSlots.filter(s => s.status === 'holding').slice(0, 2);
                                return holdingSlots.length > 0 && expandedVenueId !== venue.id ? (
                                  <div className="space-y-1.5">
                                    <div className="text-[9px] font-black uppercase text-amber-400/80 tracking-widest">🔥 Kèo đang chờ đối</div>
                                    {holdingSlots.map(slot => {
                                      const assocMatch = matches.find(m => m.venue_slot_id === slot.slotId || m.venue_slot_id === slot.id);
                                      return (
                                        <div
                                          key={slot.id}
                                          onClick={() => assocMatch ? triggerActionWithAuth('receive', assocMatch) : alert('⚠️ Kèo không khả dụng!')}
                                          className="flex items-center justify-between p-2 rounded-xl bg-amber-400/5 border border-amber-400/20 cursor-pointer hover:bg-amber-400/10 transition-all active:scale-[0.99]"
                                        >
                                          <div className="text-[10px] font-black text-neon-yellow flex items-center gap-1.5 truncate max-w-[70%]">
                                            <span>🟡</span>
                                            <span className="truncate">{assocMatch?.teamName || 'FC Gà Rừng'} · {slot.startTime}-{slot.endTime}</span>
                                            <span className="animate-pulse text-[8px] bg-amber-500/20 px-1.5 py-0.5 rounded-full border border-amber-400/30 shrink-0">HOT</span>
                                          </div>
                                          <button className="px-2 py-1 bg-gradient-to-r from-neon-yellow to-amber-500 text-appDark-deep text-[9px] font-black uppercase rounded-lg shadow-md shrink-0 hover:scale-105 transition-all">
                                            Nhận kèo
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : null;
                              })()}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </main>
            )}

            {/* TAB CONTENT: ĐỘI */}
            {currentTab === "doi" && (
              <main className="flex-1 p-4 space-y-4 overflow-y-auto no-scrollbar">
                
                {/* 0. TEAM MATCH BANNER */}
                <div className="relative w-full rounded-2xl overflow-hidden shadow-lg border border-appDark-border">
                  <img src="/teammatch.png" alt="Team Match" className="w-full h-auto object-cover" />
                </div>

                {/* HEAD & ACTIONS */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight">🤝 Chợ Tìm Đối Giao Hữu</h2>
                    <p className="text-xs text-slate-400">Danh sách các câu lạc bộ đang hoạt động ({filteredTeams.length} đội)</p>
                  </div>
                  <button 
                    onClick={() => triggerActionWithAuth('create_team')}
                    className="text-xs font-bold bg-gradient-to-r from-neon-green to-emerald-500 text-appDark-deep px-3 py-2 rounded-xl flex items-center gap-1 hover:scale-105 transition-all shadow-md neon-glow-green shrink-0"
                  >
                    <span>+</span> Tạo Đội Mới
                  </button>
                </div>

                {/* SEARCH TEAM */}
                <div className="bg-appDark-card border border-appDark-border rounded-2xl p-2.5 shadow-sm">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      🔍
                    </span>
                    <input 
                      type="text" 
                      placeholder="Tìm kiếm theo Tên đội bóng hoặc Mã đội (Mã chia sẻ)..." 
                      value={filterTeamSearch}
                      onChange={(e) => setFilterTeamSearch(e.target.value)}
                      className="w-full bg-appDark-deep border border-appDark-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-neon-green transition-all"
                    />
                  </div>
                </div>

                {/* FILTER BY REGION AND SORT */}
                <div className="bg-appDark-card border border-appDark-border rounded-2xl p-2.5 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Khu vực:</span>
                    <select 
                      value={filterDistrict}
                      onChange={(e) => setFilterDistrict(e.target.value)}
                      className="text-[11px] font-semibold bg-appDark-deep border border-appDark-border rounded-lg px-2 py-1.5 text-slate-200 focus:outline-none"
                    >
                      <option value="Tất cả">Tất cả</option>
                      <option value="Thủ Đức">Thủ Đức</option>
                      <option value="Bình Thạnh">Bình Thạnh</option>
                      <option value="Gò Vấp">Gò Vấp</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Sắp xếp:</span>
                    <select 
                      value={sortTeamBy}
                      onChange={(e) => setSortTeamBy(e.target.value)}
                      className="text-[11px] font-semibold bg-appDark-deep border border-appDark-border rounded-lg px-2 py-1.5 text-slate-200 focus:outline-none"
                    >
                      <option value="Rating">Rating</option>
                      <option value="Trình">Trình độ</option>
                      <option value="Tỷ lệ bùng kèo">Tỷ lệ bùng kèo</option>
                    </select>
                  </div>
                </div>

                {/* TEAMS LIST */}
                {(() => {
                  const totalTeamPages = Math.ceil(filteredTeams.length / ITEMS_PER_PAGE);
                  const paginatedTeams = filteredTeams.slice((teamPage - 1) * ITEMS_PER_PAGE, teamPage * ITEMS_PER_PAGE);

                  if (filteredTeams.length === 0) {
                    return (
                      <div className="bg-appDark-card border border-appDark-border rounded-2xl py-12 text-center">
                        <p className="text-slate-400 text-sm">Không tìm thấy câu lạc bộ nào hoạt động tại khu vực này.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3.5">
                      {paginatedTeams.map(team => (
                        <TeamCard 
                          key={team.id} 
                          team={team} 
                          onInvite={() => triggerActionWithAuth('invite', team)}
                        />
                      ))}

                      {/* Pagination Controls */}
                      {totalTeamPages > 1 && (
                        <div className="flex items-center justify-center gap-1.5 pt-4 pb-2">
                          <button 
                            disabled={teamPage === 1}
                            onClick={() => setTeamPage(teamPage - 1)}
                            className="p-1 px-2.5 rounded-lg bg-appDark-card border border-appDark-border text-slate-400 text-[10px] uppercase font-bold hover:border-slate-500 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
                          >
                            Trước
                          </button>
                          {Array.from({ length: totalTeamPages }, (_, i) => i + 1).map(page => (
                            <button 
                              key={page}
                              onClick={() => setTeamPage(page)}
                              className={`w-7 h-7 rounded-lg text-xs font-black transition-all ${
                                teamPage === page 
                                  ? 'bg-neon-green text-appDark-deep shadow-md neon-glow-green scale-105' 
                                  : 'bg-appDark-card border border-appDark-border text-slate-400 hover:border-slate-500 hover:text-white'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                          <button 
                            disabled={teamPage === totalTeamPages}
                            onClick={() => setTeamPage(teamPage + 1)}
                            className="p-1 px-2.5 rounded-lg bg-appDark-card border border-appDark-border text-slate-400 text-[10px] uppercase font-bold hover:border-slate-500 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
                          >
                            Sau
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </main>
            )}

            {/* TAB CONTENT: OWNER QUẢN LÝ SÂN (REALTIME CONTROL CENTER) */}
            {currentTab === "owner_ql_san" && (() => {
              // 1. Resolve current owner's venue (fallback to venues[0] for Super Admin so they don't see empty screens)
              const isSuperAdmin = currentUser?.roles?.includes("super_admin");
              const myVenue = venues.find(v => v.phone === currentUser?.phone || v.owner_user_id === currentUser?.id) || 
                              (isSuperAdmin ? venues.find(v => v.id === "v_s1") || venues[0] : null);

              // If owner has no venue, show a registration screen to easily get started!
              if (!myVenue) {
                return (
                  <main className="flex-1 p-4 space-y-5 overflow-y-auto no-scrollbar flex flex-col justify-center items-center">
                    <div className="bg-gradient-to-b from-appDark-card to-appDark-deep border border-appDark-border/60 rounded-3xl p-6 shadow-2xl w-full max-w-md space-y-6 text-center relative overflow-hidden animate-fade-in-up">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-green to-emerald-500"></div>
                      <span className="text-5xl">🏟️</span>
                      <h2 className="text-2xl font-black text-white leading-tight">Đăng Ký Cụm Sân Của Bạn</h2>
                      <p className="text-xs text-slate-400 font-bold">Bạn chưa liên kết cụm sân nào. Hãy tạo cụm sân mới để thiết lập lịch trình và nhận hàng trăm khách đặt mỗi ngày!</p>
                      
                      <div className="space-y-4 text-left">
                        <div>
                          <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Tên cụm sân</label>
                          <input 
                            type="text" 
                            placeholder="Ví dụ: Sân Win Thủ Đức" 
                            id="reg_venue_name"
                            className="w-full bg-appDark-deep border border-appDark-border rounded-xl p-3 text-xs font-bold text-white mt-1 focus:outline-none focus:border-neon-green"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Địa chỉ cụm sân</label>
                          <input 
                            type="text" 
                            placeholder="Ví dụ: 12 Đường số 12, Thủ Đức" 
                            id="reg_venue_address"
                            className="w-full bg-appDark-deep border border-appDark-border rounded-xl p-3 text-xs font-bold text-white mt-1 focus:outline-none focus:border-neon-green"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Khu vực quận/huyện</label>
                            <select 
                              id="reg_venue_district"
                              className="w-full bg-appDark-deep border border-appDark-border rounded-xl p-3 text-xs font-bold text-slate-300 mt-1 focus:outline-none focus:border-neon-green"
                            >
                              <option value="Thủ Đức">Thủ Đức</option>
                              <option value="Bình Thạnh">Bình Thạnh</option>
                              <option value="Gò Vấp">Gò Vấp</option>
                              <option value="Quận 7">Quận 7</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Số điện thoại chủ sân</label>
                            <input 
                              type="text" 
                              placeholder="Ví dụ: 0908765432" 
                              id="reg_venue_phone"
                              defaultValue={currentUser?.phone || ""}
                              className="w-full bg-appDark-deep border border-appDark-border rounded-xl p-3 text-xs font-bold text-white mt-1 focus:outline-none focus:border-neon-green"
                            />
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => {
                          const name = document.getElementById("reg_venue_name").value.trim();
                          const address = document.getElementById("reg_venue_address").value.trim();
                          const district = document.getElementById("reg_venue_district").value;
                          const phone = document.getElementById("reg_venue_phone").value.trim();

                          if (!name || !address || !phone) {
                            alert("Vui lòng điền đầy đủ các thông tin cần thiết!");
                            return;
                          }

                          // Register Venue
                          const newVenueId = "v_" + Date.now();
                          const newVenue = {
                            id: newVenueId,
                            owner_user_id: currentUser?.id || "u_unknown",
                            name: name,
                            address: address,
                            district: district,
                            phone: phone,
                            images: "stadium1",
                            verification_status: "verified",
                            capacities: { '5': 2, '7': 1, '11': 0 },
                            combinations: [],
                            facilities: ["📷 Camera sân", "⚖️ Thuê trọng tài", "🌧️ Cập nhật thời tiết", "📡 Livestream", "🏟️ Mái che", "👕 Thuê áo bib", "👟 Thuê giày", "🥇 Hay tổ chức giải"],
                            activeStartHour: 6,
                            activeEndHour: 24,
                            rating: 5.0
                          };

                          // Create default sub-fields for the venue
                          const newFields = [
                            { fieldId: `f_${newVenueId}_5a`, venueId: newVenueId, fieldName: "Sân 5A", fieldType: "Sân 5", defaultPrice: 300000, status: "active" },
                            { fieldId: `f_${newVenueId}_5b`, venueId: newVenueId, fieldName: "Sân 5B", fieldType: "Sân 5", defaultPrice: 300000, status: "active" },
                            { fieldId: `f_${newVenueId}_7a`, venueId: newVenueId, fieldName: "Sân 7A", fieldType: "Sân 7", defaultPrice: 500000, status: "active" }
                          ];

                          // Update State
                          setVenues(prev => [...prev, newVenue]);
                          setFields(prev => [...prev, ...newFields]);

                          // Generate slots for the fields
                          const newSlots = generateSlotsForFields(newFields, [newVenue]);
                          setSlots(prev => [...prev, ...newSlots]);

                          alert(`🎉 Chúc mừng! Đăng ký cụm sân "${name}" thành công và tự động tạo 3 sân con con!`);
                        }}
                        className="w-full py-3.5 bg-gradient-to-r from-neon-green to-emerald-500 hover:from-neon-green hover:to-emerald-400 text-appDark-deep font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all active:scale-95"
                      >
                        Hoàn tất đăng ký cụm sân 🚀
                      </button>
                    </div>
                  </main>
                );
              }

              // Real-time calculations for this specific venue
              const myFieldIds = fields.filter(f => f.venueId === myVenue.id).map(f => f.fieldId);
              const myFields = fields.filter(f => f.venueId === myVenue.id);
              // Include slots from ANY venueId that belong to myVenue's fields
              // This handles venueId mismatches when fields were added at different times
              const mySlots = slots.filter(s => 
                s.venueId === myVenue.id || myFieldIds.includes(s.fieldId)
              );
              const myCombinations = myVenue?.combinations || [];
              
              const emptyCount = mySlots.filter(s => s.status === 'available').length;
              const bookedCount = mySlots.filter(s => s.status === 'booked').length;
              const pendingCount = mySlots.filter(s => s.status === 'holding').length;

              // Generate dates for horizontal day selection in C (Calendar)
              // 30 days so owner can see bookings made up to a month in advance
              const calendarDays = [];
              const today = new Date();
              for (let i = 0; i < 30; i++) {
                const targetDate = new Date(today);
                targetDate.setDate(today.getDate() + i);
                const dateStr = String(targetDate.getDate()).padStart(2, '0') + '/' + String(targetDate.getMonth() + 1).padStart(2, '0') + '/' + targetDate.getFullYear();
                
                let label = dateStr;
                if (i === 0) label = "Hôm nay";
                else if (i === 1) label = "Ngày mai";
                else {
                  const weekdays = ["Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
                  label = `${weekdays[targetDate.getDay()]} ${targetDate.getDate()}/${targetDate.getMonth() + 1}`;
                }
                calendarDays.push({ label, dateStr });
              }

              // Always resolve to real DD/MM/YYYY dateStr for slot lookup
              // ownerCalDate may be "Hôm nay" (initial) or a real dateStr after clicking
              const activeCalDate = calendarDays.find(cd => cd.label === ownerCalDate)?.dateStr
                || (calendarDays.find(cd => cd.dateStr === ownerCalDate)?.dateStr)
                || calendarDays[0]?.dateStr
                || '';

              return (
                <main className="flex-1 overflow-y-auto no-scrollbar flex flex-col relative pb-4 animate-fade-in">
                  
                  {/* Sticky Header with statistics metrics */}
                  <div className="sticky top-0 z-30 bg-appDark-bg/95 backdrop-blur-md border-b border-appDark-border p-3 space-y-3 shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <h2 className="text-base font-black text-white leading-tight flex items-center gap-1.5">
                          <span className="text-lg">📡</span> {myVenue.name}
                        </h2>
                        <p className="text-[10px] text-slate-400 font-bold">{myVenue.address}</p>
                      </div>
                      
                      {/* Master Switch for Venue Status (Hoạt động / Tạm nghỉ) */}
                      <div className="flex items-center gap-2 bg-appDark-card border border-appDark-border/60 px-3 py-1.5 rounded-xl shrink-0">
                        <span className={`text-[9px] font-black uppercase tracking-wider ${
                          (myVenue.status || 'active') === 'active' ? 'text-neon-green' : 'text-red-400'
                        }`}>
                          {(myVenue.status || 'active') === 'active' ? '🟢 ĐANG MỞ' : '🔴 TẠM NGHỈ'}
                        </span>
                        <button
                          onClick={() => {
                            const newStatus = (myVenue.status || 'active') === 'active' ? 'inactive' : 'active';
                            setVenues(prev => prev.map(v => {
                              // Self-healing: Update all matching copies of this owner's venues to avoid duplicate state desync
                              if (v.id === myVenue.id || v.phone === myVenue.phone || (myVenue.owner_user_id && v.owner_user_id === myVenue.owner_user_id)) {
                                return { ...v, status: newStatus };
                              }
                              return v;
                            }));
                            alert(`📢 Đã chuyển trạng thái cụm sân "${myVenue.name}" sang [${newStatus === 'active' ? 'Đang Hoạt động (Hiện trên bảng tin)' : 'Tạm nghỉ (Ẩn khỏi bảng tin)'}]!`);
                          }}
                          className={`w-9 h-5 rounded-full p-0.5 transition-all duration-350 cursor-pointer ${
                            (myVenue.status || 'active') === 'active' ? 'bg-neon-green' : 'bg-slate-700'
                          } flex items-center`}
                        >
                          <div className={`w-4 h-4 bg-appDark-deep rounded-full shadow-md transform transition-all duration-350 ${
                            (myVenue.status || 'active') === 'active' ? 'translate-x-4' : 'translate-x-0'
                          }`}></div>
                        </button>
                      </div>
                    </div>

                    {/* Metrics grid */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-appDark-card border border-neon-green/20 rounded-xl p-2 flex flex-col items-center justify-center relative overflow-hidden">
                        <span className="text-lg font-black text-neon-green drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]">{emptyCount}</span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Slot Trống</span>
                      </div>
                      <div className="bg-appDark-card border border-red-500/25 rounded-xl p-2 flex flex-col items-center justify-center relative overflow-hidden">
                        <span className="text-lg font-black text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]">{bookedCount}</span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Đã chốt</span>
                      </div>
                      <div className="bg-appDark-card border border-cyan-400/25 rounded-xl p-2 flex flex-col items-center justify-center relative overflow-hidden">
                        <span className="text-lg font-black text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)] animate-pulse">{pendingCount}</span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Chờ ghép</span>
                      </div>
                    </div>

                    {/* Four sub-tabs segmented controls */}
                    <div className="flex bg-appDark-deep p-1 rounded-xl border border-appDark-border/60">
                      <button 
                        onClick={() => setOwnerSubTab("cum_san")}
                        className={`flex-1 py-2 text-[9px] font-extrabold uppercase rounded-lg transition-all flex items-center justify-center gap-1 ${ownerSubTab === 'cum_san' ? 'bg-neon-green text-appDark-deep shadow-md' : 'text-slate-400 hover:text-white'}`}
                      >
                        🏟️ Cụm sân
                      </button>
                      <button 
                        onClick={() => setOwnerSubTab("san_con")}
                        className={`flex-1 py-2 text-[9px] font-extrabold uppercase rounded-lg transition-all flex items-center justify-center gap-1 ${ownerSubTab === 'san_con' ? 'bg-neon-green text-appDark-deep shadow-md' : 'text-slate-400 hover:text-white'}`}
                      >
                        🥅 Sân con
                      </button>
                      <button 
                        onClick={() => setOwnerSubTab("lich_san")}
                        className={`flex-1 py-2 text-[9px] font-extrabold uppercase rounded-lg transition-all flex items-center justify-center gap-1 ${ownerSubTab === 'lich_san' ? 'bg-neon-green text-appDark-deep shadow-md' : 'text-slate-400 hover:text-white'}`}
                      >
                        📅 Lịch sân
                      </button>
                      <button 
                        onClick={() => setOwnerSubTab("khach_co_dinh")}
                        className={`flex-1 py-2 text-[9px] font-extrabold uppercase rounded-lg transition-all flex items-center justify-center gap-1 ${ownerSubTab === 'khach_co_dinh' ? 'bg-neon-green text-appDark-deep shadow-md' : 'text-slate-400 hover:text-white'}`}
                      >
                        🔒 Lịch khoá
                      </button>
                    </div>
                  </div>

                  {/* Body Content based on ownerSubTab */}
                  <div className="p-4 flex-1">
                    
                    {/* PANEL A: CỤM SÂN */}
                    {ownerSubTab === "cum_san" && (
                      <div className="space-y-4 animate-fade-in-up">
                        <div className="bg-gradient-to-b from-appDark-card to-appDark-deep border border-appDark-border/60 rounded-2xl p-4 space-y-4 shadow-lg">
                          <h3 className="text-xs font-black text-white uppercase border-l-2 border-neon-green pl-2 tracking-wide">Cập nhật thông tin cụm sân</h3>
                          
                          <div className="space-y-3 text-left">
                            <div>
                              <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Tên cụm sân</label>
                              <input 
                                type="text" 
                                value={editVenueName}
                                onChange={(e) => setEditVenueName(e.target.value)}
                                className="w-full bg-appDark-deep border border-appDark-border rounded-xl p-3 text-xs font-bold text-white mt-1 focus:outline-none focus:border-neon-green"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Địa chỉ cụm sân</label>
                              <input 
                                type="text" 
                                value={editVenueAddress}
                                onChange={(e) => setEditVenueAddress(e.target.value)}
                                className="w-full bg-appDark-deep border border-appDark-border rounded-xl p-3 text-xs font-bold text-white mt-1 focus:outline-none focus:border-neon-green"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Khu vực</label>
                                <select 
                                  value={editVenueDistrict}
                                  onChange={(e) => setEditVenueDistrict(e.target.value)}
                                  className="w-full bg-appDark-deep border border-appDark-border rounded-xl p-3 text-xs font-bold text-slate-300 mt-1 focus:outline-none"
                                >
                                  <option value="Thủ Đức">Thủ Đức</option>
                                  <option value="Bình Thạnh">Bình Thạnh</option>
                                  <option value="Gò Vấp">Gò Vấp</option>
                                  <option value="Quận 7">Quận 7</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Số điện thoại liên hệ</label>
                                <input 
                                  type="text" 
                                  value={editVenuePhone}
                                  onChange={(e) => setEditVenuePhone(e.target.value)}
                                  className="w-full bg-appDark-deep border border-appDark-border rounded-xl p-3 text-xs font-bold text-white mt-1 focus:outline-none focus:border-neon-green"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">⏰ Giờ mở cửa</label>
                                <select 
                                  value={editVenueStartHour}
                                  onChange={(e) => setEditVenueStartHour(Number(e.target.value))}
                                  className="w-full bg-appDark-deep border border-appDark-border rounded-xl p-3 text-xs font-bold text-slate-300 mt-1 focus:outline-none focus:border-neon-green"
                                >
                                  {Array.from({ length: 24 }).map((_, i) => (
                                    <option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">🌙 Giờ đóng cửa</label>
                                <select 
                                  value={editVenueEndHour}
                                  onChange={(e) => setEditVenueEndHour(Number(e.target.value))}
                                  className="w-full bg-appDark-deep border border-appDark-border rounded-xl p-3 text-xs font-bold text-slate-300 mt-1 focus:outline-none focus:border-neon-green"
                                >
                                  {Array.from({ length: 25 }).map((_, i) => {
                                    const val = i === 24 ? 24 : i;
                                    const label = i === 24 ? "24:00" : `${String(i).padStart(2, '0')}:00`;
                                    return <option key={i} value={val}>{label}</option>;
                                  })}
                                </select>
                              </div>
                            </div>

                            {/* Facilities checkboxes */}
                            <div>
                              <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Tiện ích sân bóng</label>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {[
                                  "📷 Camera sân", 
                                  "⚖️ Thuê trọng tài", 
                                  "🌧️ Cập nhật thời tiết", 
                                  "📡 Livestream", 
                                  "🏟️ Mái che", 
                                  "👕 Thuê áo bib", 
                                  "👟 Thuê giày", 
                                  "🥇 Hay tổ chức giải"
                                ].map(fac => {
                                  const isChecked = editVenueFacilities.includes(fac);
                                  return (
                                    <button
                                      key={fac}
                                      onClick={() => {
                                        if (isChecked) {
                                          setEditVenueFacilities(prev => prev.filter(x => x !== fac));
                                        } else {
                                          setEditVenueFacilities(prev => [...prev, fac]);
                                        }
                                      }}
                                      className={`px-3 py-2 rounded-xl border text-[10px] font-extrabold transition-all flex items-center gap-1.5 ${
                                        isChecked ? "bg-neon-green/10 border-neon-green text-neon-green shadow-[0_0_10px_rgba(16,185,129,0.2)]" : "bg-appDark-deep border-appDark-border text-slate-500 hover:text-slate-300"
                                      }`}
                                    >
                                      {fac}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              if (!editVenueName || !editVenueAddress || !editVenuePhone) {
                                alert("Vui lòng điền đầy đủ các thông tin cần thiết!");
                                return;
                              }

                              const updatedVenues = venues.map(v => {
                                if (v.id === myVenue.id) {
                                  return {
                                    ...v,
                                    name: editVenueName,
                                    address: editVenueAddress,
                                    district: editVenueDistrict,
                                    phone: editVenuePhone,
                                    facilities: editVenueFacilities,
                                    activeStartHour: editVenueStartHour,
                                    activeEndHour: editVenueEndHour
                                  };
                                }
                                return v;
                              });

                              setVenues(updatedVenues);
                              setStorageItem("venues", updatedVenues);

                              // Dynamic Slots adjustment
                              const myFields = fields.filter(f => f.venueId === myVenue.id);
                              const myFieldIds = myFields.map(f => f.fieldId);
                              const updatedVenueObj = {
                                ...myVenue,
                                name: editVenueName,
                                address: editVenueAddress,
                                district: editVenueDistrict,
                                phone: editVenuePhone,
                                facilities: editVenueFacilities,
                                activeStartHour: editVenueStartHour,
                                activeEndHour: editVenueEndHour
                              };

                              const newGenSlots = generateSlotsForFields(myFields, [updatedVenueObj], recurringBlocks);

                              const preservedSlots = slots.filter(s => {
                                if (s.venueId !== myVenue.id && !myFieldIds.includes(s.fieldId)) return false;
                                return s.status === 'booked' || s.status === 'holding' || s.status === 'on_hold' || s.status === 'maintenance' || s.status === 'blocked';
                              });

                              const filteredNewGenSlots = newGenSlots.filter(newSlot => {
                                const hasOverlap = preservedSlots.some(p => {
                                  if (p.fieldId !== newSlot.fieldId || p.date !== newSlot.date) return false;
                                  const pSlotTime = p.timeSlot || `${p.startTime} - ${p.endTime}`;
                                  return isTimeOverlapping(pSlotTime, newSlot.timeSlot);
                                });
                                return !hasOverlap;
                              });

                              const otherVenuesSlots = slots.filter(s => s.venueId !== myVenue.id && !myFieldIds.includes(s.fieldId));
                              const finalSlots = [...otherVenuesSlots, ...preservedSlots, ...filteredNewGenSlots];

                              setSlots(finalSlots);
                              setStorageItem("slots", finalSlots);

                              alert("🎉 Cập nhật thông tin cụm sân thành công! Lịch sân đã được đồng bộ tự động theo khung giờ mới.");
                            }}
                            className="w-full py-3.5 bg-gradient-to-r from-neon-green to-emerald-500 text-appDark-deep font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                          >
                            🏟️ Lưu Thay Đổi Cụm Sân
                          </button>
                        </div>
                      </div>
                    )}

                    {/* PANEL B: SÂN CON */}
                    {ownerSubTab === "san_con" && (
                      <div className="space-y-4 animate-fade-in-up">
                        {/* Inline add form */}
                        <div className="bg-gradient-to-b from-appDark-card to-appDark-deep border border-appDark-border/60 rounded-2xl p-4 space-y-3.5 shadow-lg">
                          <h3 className="text-xs font-black text-white uppercase border-l-2 border-neon-green pl-2 tracking-wide">Thêm sân con mới</h3>
                          
                          <div className="grid grid-cols-2 gap-3 text-left">
                            <div>
                              <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Tên sân con</label>
                              <input 
                                type="text" 
                                placeholder="Ví dụ: Sân 5C" 
                                value={addFieldName}
                                onChange={(e) => setAddFieldName(e.target.value)}
                                className="w-full bg-appDark-deep border border-appDark-border rounded-xl p-2.5 text-xs font-bold text-white mt-1 focus:outline-none focus:border-neon-green"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Loại sân</label>
                              <select 
                                value={addFieldType}
                                onChange={(e) => setAddFieldType(e.target.value)}
                                className="w-full bg-appDark-deep border border-appDark-border rounded-xl p-2.5 text-xs font-bold text-slate-300 mt-1 focus:outline-none"
                              >
                                  <option value="Sân 5">Sân 5 người</option>
                                  <option value="Sân 7">Sân 7 người</option>
                                  <option value="Sân 11">Sân 11 người</option>
                              </select>
                            </div>
                          </div>

                          {/* Price tier inputs */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">Bảng giá theo thời gian</label>
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <label className="text-[9px] font-bold text-amber-400 block mb-1">⏱ 60 phút</label>
                                <input 
                                  type="number" 
                                  placeholder="200000" 
                                  value={addFieldPrice60}
                                  onChange={(e) => setAddFieldPrice60(Number(e.target.value))}
                                  className="w-full bg-appDark-deep border border-appDark-border rounded-xl p-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-bold text-neon-green block mb-1">⏱ 90 phút</label>
                                <input 
                                  type="number" 
                                  placeholder="300000" 
                                  value={addFieldPrice90}
                                  onChange={(e) => setAddFieldPrice90(Number(e.target.value))}
                                  className="w-full bg-appDark-deep border border-appDark-border rounded-xl p-2 text-xs font-bold text-white focus:outline-none focus:border-neon-green"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-bold text-cyan-400 block mb-1">⏱ 120 phút</label>
                                <input 
                                  type="number" 
                                  placeholder="400000" 
                                  value={addFieldPrice120}
                                  onChange={(e) => setAddFieldPrice120(Number(e.target.value))}
                                  className="w-full bg-appDark-deep border border-appDark-border rounded-xl p-2 text-xs font-bold text-white focus:outline-none focus:border-cyan-400"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-left">
                            <div className="col-span-2">
                              <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Trạng thái ban đầu</label>
                              <select 
                                value={addFieldStatus}
                                onChange={(e) => setAddFieldStatus(e.target.value)}
                                className="w-full bg-appDark-deep border border-appDark-border rounded-xl p-2.5 text-xs font-bold text-slate-300 mt-1 focus:outline-none"
                              >
                                  <option value="active">Hoạt động</option>
                                  <option value="maintenance">Bảo trì</option>
                              </select>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              if (!addFieldName || (addFieldPrice60 <= 0 && addFieldPrice90 <= 0)) {
                                alert("Vui lòng điền Tên sân con và ít nhất một mức giá!");
                                return;
                              }

                              const newFieldId = `f_${myVenue.id}_${Date.now()}`;
                              const newField = {
                                fieldId: newFieldId,
                                venueId: myVenue.id,
                                fieldName: addFieldName,
                                fieldType: addFieldType,
                                defaultPrice: addFieldPrice90 || addFieldPrice90 || 300000,
                                price60: addFieldPrice60,
                                price90: addFieldPrice90,
                                price120: addFieldPrice120,
                                status: addFieldStatus
                              };

                              setFields(prev => [...prev, newField]);
                              const newSlots = generateSlotsForFields([newField], [myVenue], recurringBlocks);
                              setSlots(prev => [...prev, ...newSlots]);

                              // Navigate to the page of the newly added field con
                              const totalPages = Math.ceil((myFields.length + 1) / 4);
                              setFieldsPage(totalPages);

                              alert(`🎉 Thêm sân con "${addFieldName}" và tự động tạo lịch hoạt động thành công!`);
                              setAddFieldName("");
                              setAddFieldPrice60(200000);
                              setAddFieldPrice90(300000);
                              setAddFieldPrice120(400000);
                            }}
                            className="w-full py-3 bg-neon-green hover:bg-neon-green/90 text-appDark-deep font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                          >
                            <span>➕</span> Thêm Sân Con Mới
                          </button>
                        </div>

                        {/* List of current Fields */}
                        <div className="space-y-3">
                          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Danh sách sân con ({myFields.length})</h3>
                          
                          {myFields.length === 0 ? (
                            <div className="bg-appDark-card border border-appDark-border/40 rounded-2xl py-8 text-center">
                              <p className="text-xs text-slate-400">🏟️ Chưa có sân con nào được thêm. Hãy thêm sân con mới ở trên!</p>
                            </div>
                          ) : (
                            <>
                              <div className="grid grid-cols-2 gap-3">
                                {(() => {
                                  const startIndex = (fieldsPage - 1) * 4;
                                  const paginatedFields = myFields.slice(startIndex, startIndex + 4);
                                  return paginatedFields.map(field => (
                                    <div key={field.fieldId} className="bg-appDark-card border border-appDark-border/60 rounded-2xl p-3 flex flex-col justify-between relative overflow-hidden group shadow-md text-left">
                                      <div className="absolute top-0 right-0 w-8 h-8 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition-all"></div>
                                      <div>
                                        <div className="flex justify-between items-start">
                                          <span className="font-black text-base text-white">{field.fieldName}</span>
                                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                                            field.status === 'active' ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" : "bg-purple-500/10 border border-purple-500/30 text-purple-400"
                                          }`}>{field.status === 'active' ? "Hoạt động" : "Bảo trì"}</span>
                                        </div>
                                        <div className="flex flex-col text-[10px] font-bold text-slate-400 mt-2 space-y-1">
                                          <span>Loại sân: <strong className="text-slate-200">{field.fieldType}</strong></span>
                                          <div className="grid grid-cols-3 gap-1 mt-1">
                                            <div className="bg-amber-400/10 border border-amber-400/20 rounded-lg px-1.5 py-1 text-center">
                                              <span className="text-[8px] text-amber-400 font-black block">60'</span>
                                              <span className="text-[9px] text-white font-black">{((field.price60 || Math.round((field.defaultPrice||300000)*2/3))).toLocaleString('vi-VN')}đ</span>
                                            </div>
                                            <div className="bg-neon-green/10 border border-neon-green/20 rounded-lg px-1.5 py-1 text-center">
                                              <span className="text-[8px] text-neon-green font-black block">90'</span>
                                              <span className="text-[9px] text-white font-black">{((field.price90 || field.defaultPrice || 300000)).toLocaleString('vi-VN')}đ</span>
                                            </div>
                                            <div className="bg-cyan-400/10 border border-cyan-400/20 rounded-lg px-1.5 py-1 text-center">
                                              <span className="text-[8px] text-cyan-400 font-black block">120'</span>
                                              <span className="text-[9px] text-white font-black">{((field.price120 || Math.round((field.defaultPrice||300000)*4/3))).toLocaleString('vi-VN')}đ</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="flex gap-2 mt-4 border-t border-appDark-border/40 pt-2 shrink-0">
                                        <button
                                          onClick={() => {
                                            const nextStatus = field.status === 'active' ? 'maintenance' : 'active';
                                            
                                            setFields(prev => prev.map(f => {
                                              if (f.fieldId === field.fieldId) {
                                                return { ...f, status: nextStatus };
                                              }
                                              return f;
                                            }));

                                            setSlots(prevSlots => prevSlots.map(s => {
                                              if (s.fieldId === field.fieldId) {
                                                if (nextStatus === 'maintenance') {
                                                  if (s.status === 'available') return { ...s, status: 'maintenance' };
                                                } else {
                                                  if (s.status === 'maintenance') return { ...s, status: 'available' };
                                                }
                                              }
                                              return s;
                                            }));

                                            alert(`🔧 Đã chuyển trạng thái sân ${field.fieldName} sang [${nextStatus === 'active' ? 'Hoạt động' : 'Bảo trì'}]!`);
                                          }}
                                          className="flex-1 py-1.5 text-[9px] font-extrabold uppercase rounded-lg border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 transition-all text-center animate-all"
                                        >
                                          ⚙️ Bảo trì
                                        </button>
                                        <button
                                          onClick={() => {
                                            if (confirm(`Bạn có chắc chắn muốn XÓA sân con "${field.fieldName}" và toàn bộ lịch sân liên quan?`)) {
                                              setFields(prev => prev.filter(f => f.fieldId !== field.fieldId));
                                              setSlots(prev => prev.filter(s => s.fieldId !== field.fieldId));
                                              const totalPages = Math.ceil((myFields.length - 1) / 4);
                                              if (fieldsPage > totalPages && totalPages > 0) {
                                                setFieldsPage(totalPages);
                                              }
                                              alert(`🗑️ Đã xóa sân con "${field.fieldName}" khỏi hệ thống!`);
                                            }
                                          }}
                                          className="py-1.5 px-2 text-[9px] font-extrabold uppercase rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-all text-center"
                                        >
                                          🗑️ Xóa
                                        </button>
                                      </div>
                                    </div>
                                  ));
                                })()}
                              </div>

                              {/* Modern Pagination controls */}
                              {myFields.length > 4 && (
                                <div className="flex items-center justify-between bg-appDark-deep/40 border border-appDark-border/30 rounded-xl px-4 py-2.5 mt-2 animate-fade-in">
                                  <button
                                    onClick={() => setFieldsPage(prev => Math.max(prev - 1, 1))}
                                    disabled={fieldsPage === 1}
                                    className={`px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider rounded-lg border transition-all ${
                                      fieldsPage === 1 
                                        ? 'border-appDark-border text-slate-600 cursor-not-allowed opacity-50' 
                                        : 'border-neon-green/30 text-neon-green hover:bg-neon-green/10'
                                    }`}
                                  >
                                    ◀ Trước
                                  </button>
                                  <span className="text-[10px] font-black text-slate-400 tracking-wider">
                                    TRANG <span className="text-white">{fieldsPage}</span> / {Math.ceil(myFields.length / 4)}
                                  </span>
                                  <button
                                    onClick={() => setFieldsPage(prev => Math.min(prev + 1, Math.ceil(myFields.length / 4)))}
                                    disabled={fieldsPage === Math.ceil(myFields.length / 4)}
                                    className={`px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider rounded-lg border transition-all ${
                                      fieldsPage === Math.ceil(myFields.length / 4)
                                        ? 'border-appDark-border text-slate-600 cursor-not-allowed opacity-50' 
                                        : 'border-neon-green/30 text-neon-green hover:bg-neon-green/10'
                                    }`}
                                  >
                                    Sau ▶
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        {/* 🔥 HOURLY SALE RULES MANAGEMENT */}
                        <div className="bg-gradient-to-b from-appDark-card to-appDark-deep border border-amber-500/20 rounded-2xl p-4 space-y-3.5 shadow-lg mt-4 text-left">
                          <h3 className="text-xs font-black text-amber-400 uppercase border-l-2 border-amber-400 pl-2 tracking-wide flex items-center gap-1.5">
                            <span>🔥 Cài đặt Khung Giờ Sale (Giờ Vắng)</span>
                          </h3>
                          <p className="text-[10px] text-slate-400">Thiết lập các khung giờ vắng khách để tự động giảm giá, kích thích cầu thủ đặt sân.</p>
                          
                          {/* Add rule inline form */}
                          <div className="bg-appDark-deep/60 p-3 rounded-xl border border-appDark-border/50 grid grid-cols-3 gap-2 text-left">
                            <div>
                              <label className="text-[9px] font-bold text-slate-400 block mb-0.5">Từ giờ</label>
                              <select id="sale_start_time" className="w-full bg-appDark-deep border border-appDark-border rounded-lg p-1.5 text-xs text-white">
                                <option value="06:00">06:00</option>
                                <option value="08:00">08:00</option>
                                <option value="10:00">10:00</option>
                                <option value="12:00">12:00</option>
                                <option value="14:00">14:00</option>
                                <option value="16:00">16:00</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-slate-400 block mb-0.5">Đến giờ</label>
                              <select id="sale_end_time" className="w-full bg-appDark-deep border border-appDark-border rounded-lg p-1.5 text-xs text-white">
                                <option value="08:00">08:00</option>
                                <option value="10:00">10:00</option>
                                <option value="12:00">12:00</option>
                                <option value="14:00">14:00</option>
                                <option value="16:00">16:00</option>
                                <option value="17:00">17:00</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-slate-400 block mb-0.5">% Giảm</label>
                              <div className="flex gap-1.5">
                                <input id="sale_discount" type="number" placeholder="20" defaultValue="20" className="w-full bg-appDark-deep border border-appDark-border rounded-lg p-1.5 text-xs text-white font-bold" />
                                <button 
                                  onClick={() => {
                                    const start = document.getElementById("sale_start_time").value;
                                    const end = document.getElementById("sale_end_time").value;
                                    const disc = parseInt(document.getElementById("sale_discount").value) || 0;
                                    if (disc <= 0 || disc > 100) {
                                      alert("Vui lòng nhập phần trăm giảm giá hợp lệ (1-100)!");
                                      return;
                                    }
                                    const newRule = {
                                      id: "rule_" + Date.now(),
                                      startTime: start,
                                      endTime: end,
                                      discountPercent: disc,
                                      label: `Sale Giờ Vắng ${start}-${end} (-${disc}%)`
                                    };
                                    setHourlySaleRules(prev => [...prev, newRule]);
                                    alert("✅ Thêm khung giờ sale thành công!");
                                  }}
                                  className="bg-amber-500 hover:bg-amber-600 text-appDark-deep font-black text-xs px-2.5 rounded-lg shrink-0"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* List of active rules */}
                          <div className="space-y-1.5">
                            {hourlySaleRules.map(rule => (
                              <div key={rule.id} className="flex justify-between items-center bg-appDark-deep p-2.5 rounded-xl border border-appDark-border/60 text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="text-amber-400">🔥</span>
                                  <span className="font-extrabold text-white">{rule.startTime} - {rule.endTime}</span>
                                  <span className="text-slate-600">|</span>
                                  <span className="font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded">Giảm {rule.discountPercent}%</span>
                                </div>
                                <button 
                                  onClick={() => {
                                    setHourlySaleRules(prev => prev.filter(r => r.id !== rule.id));
                                  }}
                                  className="text-red-500 hover:text-red-400 font-bold px-2 py-0.5"
                                >
                                  Xóa
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    )}

                    {/* PANEL C: LỊCH SÂN (REALTIME SCHEDULER GRID) */}
                    {ownerSubTab === "lich_san" && (
                      <div className="space-y-4 animate-fade-in-up">
                        {/* Day Scroll Picker */}
                        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                          {calendarDays.map(cd => (
                            <button
                              key={cd.dateStr}
                              onClick={() => setOwnerCalDate(cd.dateStr)}
                              className={`whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                                cd.dateStr === activeCalDate
                                  ? "bg-neon-green text-appDark-deep border-neon-green shadow-[0_0_10px_rgba(16,185,129,0.4)] scale-105"
                                  : "bg-appDark-card text-slate-400 border-appDark-border/60 hover:text-slate-200"
                              }`}
                            >
                              {cd.label}
                            </button>
                          ))}
                        </div>

                        {/* Interactive Scheduler Grid Card */}
                        <div className="bg-gradient-to-b from-appDark-card to-appDark-deep border border-appDark-border/60 rounded-2xl shadow-xl overflow-hidden flex flex-col">
                          
                          {/* Grid Table Container */}
                          <div className="max-h-[460px] overflow-y-auto no-scrollbar text-xs">
                            <table className="w-full text-left border-collapse">
                              <thead className="sticky top-0 z-20 bg-appDark-deep border-b border-appDark-border shadow-sm">
                                <tr>
                                  <th className="p-3 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-appDark-deep border-r border-appDark-border/30 w-16 text-center">Giờ</th>
                                  {myFields.map(f => (
                                    <th key={f.fieldId} className="p-3 text-[10px] font-black text-white uppercase tracking-wider text-center border-r border-appDark-border/30">
                                      {f.fieldName}
                                      <span className="block text-[8px] text-slate-500 font-bold tracking-tighter normal-case mt-0.5">({f.fieldType})</span>
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {(() => {
                                  // Construct 30-minute intervals from 06:00 to 24:00 (36 intervals)
                                  const intervals = [];
                                  for (let h = 6; h < 24; h++) {
                                    intervals.push(`${String(h).padStart(2, '0')}:00`);
                                    intervals.push(`${String(h).padStart(2, '0')}:30`);
                                  }

                                  return intervals.map(startStr => {
                                    return (
                                      <tr key={startStr} className="border-b border-appDark-border/40 hover:bg-white/[0.02] transition-all">
                                        {/* Time column */}
                                        <td className="p-2 font-black text-[10px] text-slate-300 text-center bg-black/10 border-r border-appDark-border/30">
                                          {startStr}
                                        </td>
                                        
                                        {/* Field cells */}
                                        {myFields.map(field => {
                                          // Always match by real dateStr (DD/MM/YYYY)
                                          const slot = mySlots.find(s =>
                                            s.fieldId === field.fieldId &&
                                            s.startTime === startStr &&
                                            s.date === activeCalDate
                                          );

                                          // Dynamic combination verification
                                          const cleanName = field.fieldName.replace(/^(sân|Sân|SÂN)\s*/i, '').trim();
                                          let isLockedByCombination = false;
                                          let lockReason = "";

                                          // Calculate the actual 30-minute interval range for this grid cell row
                                          const getEndTimeOf30MinSlot = (timeStr) => {
                                            const [h, m] = timeStr.split(':').map(Number);
                                            let endH = h;
                                            let endM = m + 30;
                                            if (endM >= 60) {
                                              endH += 1;
                                              endM -= 60;
                                            }
                                            return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
                                          };
                                          const cellInterval = `${startStr} - ${getEndTimeOf30MinSlot(startStr)}`;

                                          // Case A: This field is a target of a combination (e.g. Sân 7A). Check if its parts (5C, 5D, 5E) are locked
                                          const targetComb = myCombinations.find(c => c.target.toLowerCase() === cleanName.toLowerCase());
                                          if (targetComb) {
                                            const parts = targetComb.parts.map(p => p.toLowerCase());
                                            const conflictingSlot = mySlots.find(s => {
                                              if (s.date !== activeCalDate) return false;
                                              const sCleanName = (s.fieldName || "").replace(/^(sân|Sân|SÂN)\s*/i, '').trim().toLowerCase();
                                              if (!parts.includes(sCleanName)) return false;
                                              
                                              const overlaps = isTimeOverlapping(s.timeSlot || `${s.startTime} - ${s.endTime}`, cellInterval);
                                              const isActive = s.status === 'booked' || s.status === 'holding' || s.status === 'on_hold' || s.status === 'blocked';
                                              return overlaps && isActive;
                                            });

                                            if (conflictingSlot) {
                                              isLockedByCombination = true;
                                              const confName = conflictingSlot.fieldName || "sân con";
                                              lockReason = `Do ${confName} đã chốt`;
                                            }
                                          }

                                          // Case B: This field is a part in some combinations (e.g. Sân 5C). Check if the target (Sân 7A) is locked
                                          const partCombs = myCombinations.filter(c => c.parts.some(p => p.toLowerCase() === cleanName.toLowerCase()));
                                          if (partCombs.length > 0) {
                                            const targets = partCombs.map(c => c.target.toLowerCase());
                                            const conflictingSlot = mySlots.find(s => {
                                              if (s.date !== activeCalDate) return false;
                                              const sCleanName = (s.fieldName || "").replace(/^(sân|Sân|SÂN)\s*/i, '').trim().toLowerCase();
                                              if (!targets.includes(sCleanName)) return false;

                                              const overlaps = isTimeOverlapping(s.timeSlot || `${s.startTime} - ${s.endTime}`, cellInterval);
                                              const isActive = s.status === 'booked' || s.status === 'holding' || s.status === 'on_hold' || s.status === 'blocked';
                                              return overlaps && isActive;
                                            });

                                            if (conflictingSlot) {
                                              isLockedByCombination = true;
                                              const confName = conflictingSlot.fieldName || "sân lớn";
                                              lockReason = `Do ${confName} đã chốt`;
                                            }
                                          }

                                          if (!slot) {
                                            // Slot not in DB for this date.
                                            // Check combination block even if slot is missing.
                                            if (isLockedByCombination) {
                                              return (
                                                <td key={field.fieldId} className="p-1 border-r border-appDark-border/30 text-center">
                                                  <button
                                                    type="button"
                                                    onClick={() => alert(`⚠️ Khung giờ này đã bị khóa tự động (${lockReason})!`)}
                                                    className="w-full py-1 text-[9px] font-black uppercase text-center rounded-lg transition-all tracking-tighter bg-slate-700/20 border border-slate-700/30 text-slate-400 hover:bg-slate-700/30 active:scale-95 cursor-pointer"
                                                  >
                                                    🔒 Khóa
                                                  </button>
                                                </td>
                                              );
                                            }
                                            return (
                                              <td key={field.fieldId} className="p-1 border-r border-appDark-border/30 text-center">
                                                <button
                                                  type="button"
                                                  disabled
                                                  className="w-full py-1 text-[9px] font-black uppercase text-center rounded-lg transition-all tracking-tighter bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 opacity-50 cursor-default"
                                                >
                                                  🟢 Trống
                                                </button>
                                              </td>
                                            );
                                          }

                                          let colorClasses = "bg-slate-700/20 border-slate-700/40 text-slate-500";
                                          let statusLabel = "Khóa";
                                          let onClickHandler = () => setSelectedVenueSlot(slot);

                                          if (isLockedByCombination) {
                                            colorClasses = "bg-slate-700/20 border border-slate-700/30 text-slate-400 hover:bg-slate-700/30";
                                            statusLabel = "🔒 Khóa";
                                            onClickHandler = () => alert(`⚠️ Khung giờ này đã bị khóa tự động (${lockReason})!`);
                                          } else if (slot.status === 'available') {
                                            colorClasses = "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20";
                                            statusLabel = "🟢 Trống";
                                          } else if (slot.status === 'holding' || slot.status === 'on_hold') {
                                            colorClasses = "bg-amber-400/15 border border-amber-400/30 text-amber-400 animate-pulse hover:bg-amber-400/25";
                                            statusLabel = "🟡 Chờ ghép";
                                          } else if (slot.status === 'booked') {
                                            colorClasses = "bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20";
                                            statusLabel = "🔴 Chốt";
                                          } else if (slot.status === 'maintenance') {
                                            colorClasses = "bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20";
                                            statusLabel = "⚙️ Bảo trì";
                                          } else if (slot.status === 'blocked') {
                                            colorClasses = "bg-slate-700/20 border border-slate-700/30 text-slate-400 hover:bg-slate-700/30";
                                            statusLabel = "🔒 Đã khóa";
                                          }

                                          return (
                                            <td key={field.fieldId} className="p-1 border-r border-appDark-border/30 text-center">
                                              <button
                                                type="button"
                                                onClick={onClickHandler}
                                                className={`w-full py-1 text-[9px] font-black uppercase text-center rounded-lg transition-all active:scale-95 tracking-tighter ${colorClasses}`}
                                              >
                                                {statusLabel}
                                              </button>
                                            </td>
                                          );
                                        })}
                                      </tr>
                                    );
                                  });
                                })()}
                              </tbody>
                            </table>
                          </div>

                          {/* Scheduler Legend */}
                          <div className="bg-appDark-deep border-t border-appDark-border p-2.5 flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-slate-400">
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Trống</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Chờ ghép</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Đã Chốt</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-600"></span> Khóa</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span> Bảo trì</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* PANEL D: KHÁCH CỐ ĐỊNH / LỊCH KHÓA */}
                    {ownerSubTab === "khach_co_dinh" && (
                      <div className="space-y-4 animate-fade-in-up">
                        
                        {/* Setup Lịch Cố Định Form */}
                        <div className="bg-gradient-to-b from-appDark-card to-appDark-deep border border-appDark-border/60 rounded-2xl p-4 space-y-4 shadow-lg text-left">
                          <h3 className="text-xs font-black text-white uppercase border-l-2 border-neon-green pl-2 tracking-wide">Thiết lập lịch khách cố định hàng tuần</h3>
                          
                          <div className="space-y-3">
                            <div>
                              <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Tên đội đại diện / ghi chú</label>
                              <input 
                                type="text" 
                                placeholder="Ví dụ: FC Anh Em (Cố định T3-T5)" 
                                value={recTeamName}
                                onChange={(e) => setRecTeamName(e.target.value)}
                                className="w-full bg-appDark-deep border border-appDark-border rounded-xl p-3 text-xs font-bold text-white mt-1 focus:outline-none focus:border-neon-green"
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Thứ trong tuần</label>
                                <select 
                                  value={recDayOfWeek}
                                  onChange={(e) => setRecDayOfWeek(Number(e.target.value))}
                                  className="w-full bg-appDark-deep border border-appDark-border rounded-xl p-3 text-xs font-bold text-slate-300 mt-1 focus:outline-none"
                                >
                                  <option value={1}>Thứ 2</option>
                                  <option value={2}>Thứ 3</option>
                                  <option value={3}>Thứ 4</option>
                                  <option value={4}>Thứ 5</option>
                                  <option value={5}>Thứ 6</option>
                                  <option value={6}>Thứ 7</option>
                                  <option value={0}>Chủ Nhật</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Chọn Sân con</label>
                                <select 
                                  value={recFieldId}
                                  onChange={(e) => setRecFieldId(e.target.value)}
                                  className="w-full bg-appDark-deep border border-appDark-border rounded-xl p-3 text-xs font-bold text-slate-300 mt-1 focus:outline-none"
                                >
                                  <option value="">-- Chọn sân con --</option>
                                  {myFields.map(f => (
                                    <option key={f.fieldId} value={f.fieldId}>{f.fieldName} ({f.fieldType})</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Giờ bắt đầu</label>
                                <select 
                                  value={recStartTime}
                                  onChange={(e) => setRecStartTime(e.target.value)}
                                  className="w-full bg-appDark-deep border border-appDark-border rounded-xl p-3 text-xs font-bold text-slate-300 mt-1 focus:outline-none"
                                >
                                  {Array.from({ length: 18 }).map((_, idx) => {
                                    const hour = idx + 6;
                                    return (
                                      <React.Fragment key={hour}>
                                        <option value={`${String(hour).padStart(2,'0')}:00`}>{String(hour).padStart(2,'0')}:00</option>
                                        <option value={`${String(hour).padStart(2,'0')}:30`}>{String(hour).padStart(2,'0')}:30</option>
                                      </React.Fragment>
                                    );
                                  })}
                                </select>
                              </div>
                              <div>
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Giờ kết thúc</label>
                                <select 
                                  value={recEndTime}
                                  onChange={(e) => setRecEndTime(e.target.value)}
                                  className="w-full bg-appDark-deep border border-appDark-border rounded-xl p-3 text-xs font-bold text-slate-300 mt-1 focus:outline-none"
                                >
                                  {Array.from({ length: 18 }).map((_, idx) => {
                                    const hour = idx + 6;
                                    return (
                                      <React.Fragment key={hour}>
                                        <option value={`${String(hour).padStart(2,'0')}:00`}>{String(hour).padStart(2,'0')}:00</option>
                                        <option value={`${String(hour).padStart(2,'0')}:30`}>{String(hour).padStart(2,'0')}:30</option>
                                      </React.Fragment>
                                    );
                                  })}
                                </select>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              if (!recTeamName || !recFieldId || !recStartTime || !recEndTime) {
                                alert("Vui lòng điền đầy đủ Tên đội bóng, chọn Sân con và Khung giờ!");
                                return;
                              }

                              const startMins = parseInt(recStartTime.split(':')[0]) * 60 + parseInt(recStartTime.split(':')[1]);
                              const endMins = parseInt(recEndTime.split(':')[0]) * 60 + parseInt(recEndTime.split(':')[1]);

                              if (startMins >= endMins) {
                                alert("Giờ bắt đầu phải sớm hơn giờ kết thúc!");
                                return;
                              }

                              const newBlock = {
                                id: `rec_${Date.now()}`,
                                venueId: myVenue.id,
                                fieldId: recFieldId,
                                dayOfWeek: recDayOfWeek,
                                startTime: recStartTime,
                                endTime: recEndTime,
                                teamName: recTeamName
                              };

                              // Update recurringBlocks state
                              const updatedBlocks = [...recurringBlocks, newBlock];
                              setRecurringBlocks(updatedBlocks);

                              // Update corresponding slots in 30 days to 'blocked'
                              setSlots(prevSlots => prevSlots.map(s => {
                                if (s.fieldId === recFieldId && s.venueId === myVenue.id) {
                                  const [dy, mn, yr] = s.date.split('/');
                                  const sDate = new Date(Number(yr), Number(mn) - 1, Number(dy));
                                  
                                  if (sDate.getDay() === recDayOfWeek) {
                                    const [sH, sM] = s.startTime.split(':').map(Number);
                                    const sMins = sH * 60 + sM;
                                    
                                    if (sMins >= startMins && sMins < endMins) {
                                      return { 
                                        ...s, 
                                        status: "blocked", 
                                        notes: `Khách cố định: ${recTeamName}` 
                                      };
                                    }
                                  }
                                }
                                return s;
                              }));

                              alert(`🔒 Đã đăng ký lịch cố định cho "${recTeamName}" và tự động khóa các khung giờ phù hợp!`);
                              setRecTeamName("");
                            }}
                            className="w-full py-3.5 bg-gradient-to-r from-neon-green to-emerald-500 text-appDark-deep font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                          >
                            <span>🔒</span> Áp Dụng Lịch Cố Định Hàng Tuần
                          </button>
                        </div>

                        {/* List of current Blocks */}
                        <div className="space-y-2 text-left">
                          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Danh sách lịch khách cố định (${recurringBlocks.filter(b => b.venueId === myVenue.id).length})</h3>
                          <div className="space-y-2.5">
                            {recurringBlocks.filter(b => b.venueId === myVenue.id).map(block => {
                              const blockField = myFields.find(f => f.fieldId === block.fieldId) || { fieldName: "Sân con" };
                              const weekdays = ["Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
                              
                              return (
                                <div key={block.id} className="bg-appDark-card border border-appDark-border/60 rounded-xl p-3 flex justify-between items-center shadow-md">
                                  <div className="space-y-0.5">
                                    <span className="font-extrabold text-white text-xs block">{block.teamName}</span>
                                    <span className="text-[10px] text-slate-400 block font-bold">
                                      🏢 {blockField.fieldName} | 🗓️ {weekdays[block.dayOfWeek]} ({block.startTime} - {block.endTime})
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => {
                                      if (confirm(`Bạn có chắc muốn HỦY lịch khách cố định của "${block.teamName}"? Lịch sân sẽ được mở trống trở lại.`)) {
                                        setRecurringBlocks(prev => prev.filter(b => b.id !== block.id));
                                        
                                        const startMins = parseInt(block.startTime.split(':')[0]) * 60 + parseInt(block.startTime.split(':')[1]);
                                        const endMins = parseInt(block.endTime.split(':')[0]) * 60 + parseInt(block.endTime.split(':')[1]);

                                        setSlots(prevSlots => prevSlots.map(s => {
                                          if (s.fieldId === block.fieldId && s.venueId === myVenue.id) {
                                            const [dy, mn, yr] = s.date.split('/');
                                            const sDate = new Date(Number(yr), Number(mn) - 1, Number(dy));
                                            
                                            if (sDate.getDay() === block.dayOfWeek) {
                                              const [sH, sM] = s.startTime.split(':').map(Number);
                                              const sMins = sH * 60 + sM;
                                              
                                              if (sMins >= startMins && sMins < endMins && s.status === 'blocked') {
                                                return { 
                                                  ...s, 
                                                  status: "available", 
                                                  notes: `Khung giờ trống tại ${s.fieldName}.` 
                                                };
                                              }
                                            }
                                          }
                                          return s;
                                        }));

                                        alert(`🗑️ Đã hủy lịch cố định của "${block.teamName}" thành công!`);
                                      }
                                    }}
                                    className="py-1 px-3 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-all text-[9px] font-black uppercase"
                                  >
                                    Hủy khóa
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* CELL/SLOT CLICK INTERACTIVE ACTION MODAL (BOTTOM SHEET) */}
                  {selectedVenueSlot && (
                    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
                      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity" onClick={() => setSelectedVenueSlot(null)}></div>
                      <div className="bg-appDark-bg w-full sm:w-[380px] rounded-t-3xl sm:rounded-3xl border-t sm:border border-appDark-border p-5 relative z-10 animate-slide-up sm:animate-fade-in-up pb-10 sm:pb-5 shadow-2xl">
                        <div className="flex justify-between items-start mb-4 pb-3.5 border-b border-appDark-border/50 text-left">
                          <div>
                            <h3 className="text-base font-black text-white leading-tight flex items-center gap-1.5">
                              {selectedVenueSlot.fieldName}
                              <span className="text-slate-500">|</span> 
                              <span className="text-neon-green bg-neon-green/10 px-2 py-0.5 rounded-md text-xs">{selectedVenueSlot.startTime} - {selectedVenueSlot.endTime}</span>
                            </h3>
                            <p className="text-[10px] text-slate-400 font-bold mt-1">Ngày {selectedVenueSlot.date} ({selectedVenueSlot.rawTime})</p>
                            <p className="text-[10px] font-black uppercase mt-1 text-slate-300">
                              Trạng thái: 
                              <span className={`ml-1 font-black ${
                                selectedVenueSlot.status === 'available' ? 'text-neon-green' :
                                selectedVenueSlot.status === 'holding' ? 'text-amber-400' :
                                selectedVenueSlot.status === 'booked' ? 'text-red-500' :
                                selectedVenueSlot.status === 'blocked' ? 'text-slate-400' :
                                'text-purple-400'
                              }`}>{selectedVenueSlot.status}</span>
                            </p>
                          </div>
                          <button onClick={() => setSelectedVenueSlot(null)} className="p-1.5 rounded-full bg-appDark-card text-slate-400 hover:text-white hover:bg-slate-700 border border-appDark-border transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>

                        {/* Dynamic pricing and booked match info lookup */}
                        {(() => {
                          const currentField = fields.find(f => f.fieldId === selectedVenueSlot.fieldId);
                          if (!currentField) return null;
                          
                          const basePrice = currentField.price90 || currentField.defaultPrice || 300000;
                          const p60 = currentField.price60 || Math.round(basePrice * 2/3);
                          const p90 = currentField.price90 || basePrice;
                          const p120 = currentField.price120 || Math.round(basePrice * 4/3);

                          let discountPercent = 0;
                          if (hourlySaleRules && hourlySaleRules.length > 0) {
                            hourlySaleRules.forEach(rule => {
                              const [rStartH, rStartM] = rule.startTime.split(':').map(Number);
                              const [rEndH, rEndM] = rule.endTime.split(':').map(Number);
                              const [sStartH, sStartM] = selectedVenueSlot.startTime.split(':').map(Number);
                              
                              const ruleStart = rStartH * 60 + rStartM;
                              const ruleEnd = rEndH * 60 + rEndM;
                              const slotStart = sStartH * 60 + sStartM;
                              
                              if (slotStart >= ruleStart && slotStart < ruleEnd) {
                                discountPercent = rule.discountPercent;
                              }
                            });
                          }

                          const finalP60 = discountPercent > 0 ? Math.round(p60 * (1 - discountPercent / 100)) : p60;
                          const finalP90 = discountPercent > 0 ? Math.round(p90 * (1 - discountPercent / 100)) : p90;
                          const finalP120 = discountPercent > 0 ? Math.round(p120 * (1 - discountPercent / 100)) : p120;

                          // Search for overlap booked match/booking
                          const associatedMatch = matches.find(m => 
                            m.fieldId === selectedVenueSlot.fieldId &&
                            m.date === selectedVenueSlot.date &&
                            (() => {
                              try {
                                const parts = m.timeSlot.split(' - ');
                                if (parts.length < 2) return false;
                                const [mStartH, mStartM] = parts[0].split(':').map(Number);
                                const [mEndH, mEndM] = parts[1].split(':').map(Number);
                                const [sStartH, sStartM] = selectedVenueSlot.startTime.split(':').map(Number);
                                
                                const matchStart = mStartH * 60 + mStartM;
                                const matchEnd = mEndH * 60 + mEndM;
                                const slotStart = sStartH * 60 + sStartM;
                                
                                return slotStart >= matchStart && slotStart < matchEnd;
                              } catch {
                                return false;
                              }
                            })() &&
                            !['completed', 'cancelled', 'rejected'].includes(m.status)
                          );

                          return (
                            <div className="space-y-3.5 mb-4">
                              {/* Booked Match info card */}
                              {associatedMatch && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-left space-y-2 shadow-md">
                                  <span className="text-[9px] font-black text-red-400 uppercase block tracking-wider flex items-center gap-1.5">
                                    <span>⚽ THÔNG TIN ĐƠN ĐẶT SÂN</span>
                                  </span>
                                  <div className="text-[11px] font-bold text-slate-300 space-y-1.5">
                                    <p>⏰ Khung giờ: <strong className="text-white">{associatedMatch.timeSlot}</strong></p>
                                    <p>👤 Khách đặt: <strong className="text-white">{associatedMatch.teamName}</strong></p>
                                    <p>📞 Liên hệ: <strong className="text-neon-green">{associatedMatch.adminContact}</strong></p>
                                    <p>💰 Tiền sân: <strong className="text-neon-yellow">{associatedMatch.price}</strong></p>
                                    {associatedMatch.notes && (
                                      <p>💬 Ghi chú: <span className="text-slate-400 font-medium italic">"{associatedMatch.notes}"</span></p>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Realtime Pricing Table */}
                              <div className="bg-appDark-deep border border-appDark-border/60 rounded-xl p-3 text-left space-y-2 shadow-md">
                                <span className="text-[9px] font-black text-slate-400 uppercase block tracking-wider flex justify-between">
                                  <span>💰 BẢNG GIÁ ĐỒNG BỘ REALTIME</span>
                                  {discountPercent > 0 && (
                                    <span className="text-amber-400 font-extrabold animate-pulse">🔥 SALE {discountPercent}% ĐANG BẬT</span>
                                  )}
                                </span>
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="bg-appDark-card border border-appDark-border/50 rounded-lg p-1.5 text-center">
                                    <span className="text-[8px] text-slate-500 font-bold block">⏱ 60'</span>
                                    {discountPercent > 0 ? (
                                      <div className="flex flex-col items-center">
                                        <span className="text-[7.5px] text-slate-500 line-through font-bold">{p60.toLocaleString('vi-VN')}đ</span>
                                        <span className="text-[9px] text-amber-400 font-black">{finalP60.toLocaleString('vi-VN')}đ</span>
                                      </div>
                                    ) : (
                                      <span className="text-[10px] text-neon-green font-black">{p60.toLocaleString('vi-VN')}đ</span>
                                    )}
                                  </div>
                                  <div className="bg-appDark-card border border-appDark-border/50 rounded-lg p-1.5 text-center">
                                    <span className="text-[8px] text-slate-500 font-bold block">⏱ 90'</span>
                                    {discountPercent > 0 ? (
                                      <div className="flex flex-col items-center">
                                        <span className="text-[7.5px] text-slate-500 line-through font-bold">{p90.toLocaleString('vi-VN')}đ</span>
                                        <span className="text-[9px] text-amber-400 font-black">{finalP90.toLocaleString('vi-VN')}đ</span>
                                      </div>
                                    ) : (
                                      <span className="text-[10px] text-neon-green font-black">{p90.toLocaleString('vi-VN')}đ</span>
                                    )}
                                  </div>
                                  <div className="bg-appDark-card border border-appDark-border/50 rounded-lg p-1.5 text-center">
                                    <span className="text-[8px] text-slate-500 font-bold block">⏱ 120'</span>
                                    {discountPercent > 0 ? (
                                      <div className="flex flex-col items-center">
                                        <span className="text-[7.5px] text-slate-500 line-through font-bold">{p120.toLocaleString('vi-VN')}đ</span>
                                        <span className="text-[9px] text-amber-400 font-black">{finalP120.toLocaleString('vi-VN')}đ</span>
                                      </div>
                                    ) : (
                                      <span className="text-[10px] text-neon-green font-black">{p120.toLocaleString('vi-VN')}đ</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {selectedVenueSlot.notes && !matches.some(m => m.fieldId === selectedVenueSlot.fieldId && m.date === selectedVenueSlot.date) && (
                          <div className="mb-4 bg-appDark-deep p-2.5 rounded-xl border border-appDark-border/60 text-left">
                            <span className="text-[9px] font-black text-slate-500 uppercase block tracking-wider">Ghi chú slot:</span>
                            <span className="text-[11px] font-bold text-slate-300 block mt-0.5">{selectedVenueSlot.notes}</span>
                          </div>
                        )}

                        <div className="space-y-2">
                          <button 
                            onClick={() => { handleUpdateSlotStatus(selectedVenueSlot.id, 'available'); setSelectedVenueSlot(null); alert("🟢 Đã mở trống slot sân này!"); }}
                            className="w-full py-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 font-black text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                          >🟢 MỞ TRỐNG KHUNG GIỜ</button>

                          <button 
                            onClick={() => { handleUpdateSlotStatus(selectedVenueSlot.id, 'booked', "Khách đặt ngoài hệ thống / Chốt cứng"); setSelectedVenueSlot(null); alert("🔴 Đã đánh dấu chốt slot sân này!"); }}
                            className="w-full py-3 bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20 font-black text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                          >🔴 ĐÁNH DẤU ĐÃ CHỐT SÂN</button>

                          <button 
                            onClick={() => { handleUpdateSlotStatus(selectedVenueSlot.id, 'blocked', "Khóa vì khách ngoài app"); setSelectedVenueSlot(null); alert("🔒 Đã khóa slot sân này!"); }}
                            className="w-full py-3 bg-slate-700/30 border border-slate-600/40 text-slate-300 hover:bg-slate-700/50 font-black text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                          >🔒 KHÓA SLOT (KHÁCH NGOÀI APP)</button>

                          <button 
                            onClick={() => { handleUpdateSlotStatus(selectedVenueSlot.id, 'maintenance', "Sân đang bảo trì"); setSelectedVenueSlot(null); alert("⚙️ Đã chuyển slot sân này sang trạng thái Bảo trì!"); }}
                            className="w-full py-3 bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 font-black text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                          >⚙️ BÁO CÁO BẢO TRÌ SÂN</button>

                          {(selectedVenueSlot.status === 'blocked' || selectedVenueSlot.status === 'maintenance' || selectedVenueSlot.status === 'booked') && (
                            <div className="pt-2 border-t border-appDark-border/30">
                              <button 
                                onClick={() => { handleUpdateSlotStatus(selectedVenueSlot.id, 'available'); setSelectedVenueSlot(null); alert("🔄 Đã mở khóa thành công!"); }}
                                className="w-full py-3 bg-neon-green text-appDark-deep font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                              >🔄 MỞ KHÓA / RESET KHUNG GIỜ</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                </main>
              );
            })()}

            {/* TAB CONTENT: OWNER BOOKING */}
            {currentTab === "owner_booking" && (() => {
              // Resolve owner's venue
              const isSuperAdmin = currentUser?.roles?.includes("super_admin");
              const myVenue = venues.find(v => v.phone === currentUser?.phone || v.owner_user_id === currentUser?.id) || 
                              (isSuperAdmin ? venues.find(v => v.id === "v_s1") || venues[0] : null);

              // Filter slots belonging to this owner's venue (not ALL slots from ALL venues)
              // Only show slots that are: on_hold or holding (pending slots, aka "ĐANG GIỮ")
              const myVenueSlots = myVenue 
                ? slots.filter(s => (s.venueId === myVenue.id || (s.venueName && s.venueName.toLowerCase() === myVenue.name.toLowerCase())) && (s.status === 'on_hold' || s.status === 'holding'))
                : slots.filter(s => s.contact === currentUser?.phone && (s.status === 'on_hold' || s.status === 'holding'));

              // Also include legacy slots posted directly that are on_hold/holding
              const legacyPostedSlots = slots.filter(s => 
                s.contact === currentUser?.phone && 
                s.timeSlot && 
                s.price && 
                (s.status === 'on_hold' || s.status === 'holding') &&
                !s.venueId // old-style slots without venueId
              );

              // Combine unique pending slots
              const allContactSlots = [...myVenueSlots, ...legacyPostedSlots.filter(ls => !myVenueSlots.find(ms => ms.id === ls.id))]
                .filter(s => !s.id.startsWith('slot_f_') && s.status !== 'booked');

              // Posted matches (as venue owner)
              const ownerMatches = matches.filter(m => {
                const isConfirmed = m.status === 'Đã chốt kèo' || m.status === 'confirmed' || m.status === 'Đã đủ người';
                if (!isConfirmed) return false;

                const isDirectCreator = m.phone === currentUser?.phone || m.adminContact === currentUser?.phone;
                if (isDirectCreator) return true;

                const cleanStringForMatch = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/sân\s+/gi, "").replace(/[^a-z0-9]/g, "").trim();

                // Direct venue match check
                if (myVenue) {
                  if (m.venueId && m.venueId === myVenue.id) return true;
                  if (m.venue && cleanStringForMatch(m.venue) === cleanStringForMatch(myVenue.name)) return true;
                }

                if (m.venue_slot_id) {
                  let fieldId = null;
                  if (String(m.venue_slot_id).startsWith("agg_")) {
                    const parts = String(m.venue_slot_id).split('_');
                    fieldId = parts[1];
                  }
                  
                  const assocSlot = slots.find(s => 
                    s.id === m.venue_slot_id || 
                    s.slotId === m.venue_slot_id || 
                    (fieldId && s.fieldId === fieldId)
                  );
                  if (assocSlot) {
                    return (myVenue && assocSlot.venueId === myVenue.id) || assocSlot.contact === currentUser?.phone;
                  }
                }
                return false;
              });

              // Helper to format price with thousand separator
              const fmtPrice = (p) => {
                if (!p && p !== 0) return 'Liên hệ';
                return Number(p).toLocaleString('vi-VN') + 'đ';
              };

              // Helper to get display time for a slot
              const getSlotTimeLabel = (slot) => {
                if (slot.startTime && slot.endTime) {
                  const dateLabel = slot.rawTime || slot.date || '';
                  return `${slot.startTime} - ${slot.endTime} | ${dateLabel}`;
                }
                if (slot.timeSlot) {
                  const parts = slot.timeSlot.split(' ');
                  return `${parts[0] || ''} - ${parts[2] || ''}`;
                }
                return 'N/A';
              };

              // Direct booked slots that don't have an associated match in matches list (avoid duplicates)
              const directBookedSlots = slots.filter(s => {
                const isMySlot = myVenue 
                  ? (s.venueId === myVenue.id || (s.venueName && s.venueName.toLowerCase() === myVenue.name.toLowerCase()))
                  : s.contact === currentUser?.phone;
                const isBooked = s.status === 'booked';
                if (!isMySlot || !isBooked) return false;
                
                const isFake = s.id.startsWith('slot_f_');
                if (isFake) return false;

                const hasMatch = matches.some(m => {
                  if (m.venue_slot_id === s.id || m.venue_slot_id === s.slotId) return true;
                  if (String(m.venue_slot_id).startsWith("agg_")) {
                    const parts = String(m.venue_slot_id).split('_');
                    const fieldId = parts[1];
                    const datePart = parts[2];
                    
                    const cleanSlotDate = (s.rawTime || s.date || "").replace(/\//g, '');
                    if (s.fieldId === fieldId && cleanSlotDate === datePart) {
                      return isTimeOverlapping(s.timeSlot, m.timeSlot || m.time);
                    }
                  }
                  return false;
                });
                return !hasMatch;
              });

              // Map directBookedSlots to match-like objects
              const directMatches = directBookedSlots.map(slot => ({
                id: `BOOK-${slot.id}`,
                teamName: slot.customerName || "Khách chốt tay",
                pairedWith: "Chủ sân tự đặt",
                time: getSlotTimeLabel(slot),
                rawTime: slot.timeSlot || slot.time,
                venue: slot.venueName || "Sân bóng",
                district: slot.district || "",
                pitchType: slot.pitchType || "Sân 7",
                price: slot.price || 300000,
                status: 'confirmed',
                booking_code: slot.bookingCode || slot.booking_code || `MC-${Math.floor(100000 + Math.random() * 900000)}`,
                adminContact: slot.customerPhone || slot.contact || "",
                requests: []
              }));

              // Combine regular matches and direct slot matches under Kèo Đã Chốt
              const combinedMatches = [...ownerMatches, ...directMatches];

              const BOOKING_PAGE_SIZE = 10;
              const totalSlotPages = Math.ceil(allContactSlots.length / BOOKING_PAGE_SIZE) || 1;
              const totalMatchPages = Math.ceil(combinedMatches.length / BOOKING_PAGE_SIZE) || 1;
              const safeBookingPage = Math.min(ownerBookingPage, Math.max(totalSlotPages, totalMatchPages));
              
              const paginatedSlots = allContactSlots.slice((safeBookingPage - 1) * BOOKING_PAGE_SIZE, safeBookingPage * BOOKING_PAGE_SIZE);
              const paginatedMatches = combinedMatches.slice((safeBookingPage - 1) * BOOKING_PAGE_SIZE, safeBookingPage * BOOKING_PAGE_SIZE);
              const totalPages = Math.max(totalSlotPages, totalMatchPages);

              const getSlotSubLabel = (slot) => {
                const priceStr = fmtPrice(slot.price);
                const typeStr = slot.pitchType || slot.fieldType || '';
                const nameStr = slot.fieldName ? ` · ${slot.fieldName}` : '';
                return `${priceStr} | ${typeStr}${nameStr}`;
              };

              return (
                <main className="flex-1 p-4 space-y-5 overflow-y-auto no-scrollbar">
                  <div className="bg-appDark-deep border border-appDark-border rounded-xl p-4 shadow-md space-y-4">
                    
                    {/* Quick Action Buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      <button onClick={() => triggerActionWithAuth('create_slot')} className="w-full py-3 px-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-[9px] sm:text-[10px] rounded-xl shadow-[0_0_10px_rgba(34,211,238,0.3)] transition-all active:scale-95 flex flex-col items-center justify-center gap-1 leading-tight text-center">
                        <span className="text-lg">🏟️</span><span>Đăng Sân Trống</span>
                      </button>
                      <button onClick={() => triggerActionWithAuth('owner_create_match')} className="w-full py-3 px-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold text-[9px] sm:text-[10px] rounded-xl shadow-[0_0_10px_rgba(245,158,11,0.3)] transition-all active:scale-95 flex flex-col items-center justify-center gap-1 leading-tight text-center">
                        <span className="text-lg">🔥</span><span>Đăng Tìm Đối</span>
                      </button>
                      <button onClick={() => triggerActionWithAuth('owner_book_customer')} className="w-full py-3 px-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-[9px] sm:text-[10px] rounded-xl shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all active:scale-95 flex flex-col items-center justify-center gap-1 leading-tight text-center">
                        <span className="text-lg">💼</span><span>Khách Đã Đặt</span>
                      </button>
                    </div>

                    {/* Stats Header */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="bg-appDark-card border border-amber-500/20 rounded-xl p-2 text-center">
                        <span className="text-lg font-black text-amber-400">{allContactSlots.length}</span>
                        <span className="text-[9px] font-bold text-slate-500 block uppercase">Slot đang giữ</span>
                      </div>
                      <div className="bg-appDark-card border border-emerald-500/20 rounded-xl p-2 text-center">
                        <span className="text-lg font-black text-emerald-400">{combinedMatches.length}</span>
                        <span className="text-[9px] font-bold text-slate-500 block uppercase">Kèo đã chốt</span>
                      </div>
                    </div>

                    {/* Slot list section */}
                    {allContactSlots.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-2 border-amber-400 pl-2">
                          Slot sân đang giữ ({allContactSlots.length})
                        </h4>
                        <div className="space-y-2 max-h-[340px] overflow-y-auto no-scrollbar">
                          {paginatedSlots.map(slot => {
                            const assocMatch = matches.find(m => m.venue_slot_id === slot.id || m.venue_slot_id === slot.slotId);
                            const mockMatch = assocMatch || (slot.status === 'booked' ? {
                              id: `BOOK-${slot.id}`,
                              teamName: slot.customerName || "Khách chốt tay",
                              pairedWith: "Chủ sân tự đặt",
                              time: getSlotTimeLabel(slot),
                              rawTime: slot.timeSlot || slot.time,
                              venue: slot.venueName || "Sân bóng",
                              district: slot.district || "",
                              pitchType: slot.pitchType || "Sân 7",
                              price: slot.price || 300000,
                              status: 'confirmed',
                              booking_code: slot.bookingCode || slot.booking_code || `MC-${Math.floor(100000 + Math.random() * 900000)}`,
                              adminContact: slot.customerPhone || slot.contact || "",
                              requests: []
                            } : null);

                            const isClickable = !!mockMatch;

                            return (
                              <div 
                                key={slot.id} 
                                onClick={() => {
                                  if (isClickable) {
                                    setSelectedMatch(mockMatch);
                                  }
                                }}
                                className={`bg-appDark-card border border-appDark-border rounded-xl p-3 flex justify-between items-start group transition-all active:scale-[0.99] ${isClickable ? 'cursor-pointer hover:border-cyan-500/50 hover:bg-cyan-500/5 shadow-sm' : 'hover:border-cyan-500/30'}`}
                              >
                                <div className="flex flex-col gap-1.5 flex-1 min-w-0 pr-2 text-left">
                                  <span className="text-xs font-extrabold text-white leading-tight flex items-center gap-1.5">
                                    <span>⏰ {getSlotTimeLabel(slot)}</span>
                                    {isClickable && <span className="text-[9px] text-cyan-400 font-bold bg-cyan-400/10 px-1 rounded border border-cyan-400/20">🔍 Chi tiết</span>}
                                  </span>
                                  <span className="text-[10px] font-semibold text-slate-400 bg-appDark-deep/60 px-2.5 py-0.5 rounded border border-appDark-border/40 w-fit">
                                    {getSlotSubLabel(slot)}
                                  </span>
                                  {(slot.customerName || slot.customerPhone) && (
                                    <div className="bg-appDark-deep/80 border border-appDark-border/60 rounded-xl p-2.5 mt-1.5 space-y-1.5 max-w-md w-full">
                                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px]">
                                        {slot.customerName && (
                                          <span className="font-extrabold text-white flex items-center gap-1">
                                            👤 <span className="text-slate-400">Khách:</span> {slot.customerName}
                                          </span>
                                        )}
                                        {slot.customerPhone && (
                                          <span className="font-extrabold text-neon-green flex items-center gap-1">
                                            📞 <span className="text-slate-400">SĐT:</span> {slot.customerPhone}
                                          </span>
                                        )}
                                      </div>
                                      
                                      {/* QUICK VIEW CONFIRMATION CODE */}
                                      {mockMatch && mockMatch.booking_code && (
                                        <div className="text-[9.5px] font-black text-amber-400 flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded w-fit select-all">
                                          🔑 Mã chốt: <span className="font-mono tracking-wider font-extrabold text-white select-all">{mockMatch.booking_code}</span>
                                        </div>
                                      )}

                                      {(slot.bookingNotes || slot.notes) && (
                                        <p className="text-[9.5px] text-slate-400 bg-slate-950/40 p-1.5 rounded-lg border border-slate-900/50 italic leading-snug">
                                          💬 Ghi chú: {slot.bookingNotes || slot.notes}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-col gap-1.5 items-end shrink-0">
                                  {slot.status === 'on_hold' || slot.status === 'holding' ? (
                                    <span className="px-2 py-0.5 border border-amber-500/50 text-amber-400 text-[8px] font-extrabold rounded-md whitespace-nowrap">CHỜ GHÉP</span>
                                  ) : slot.status === 'booked' ? (
                                    <span className="px-2 py-0.5 border border-emerald-500/30 text-emerald-400 text-[8px] font-extrabold rounded-md whitespace-nowrap">ĐÃ CHỐT</span>
                                  ) : (
                                    <span className="px-2 py-0.5 border border-cyan-500/50 text-cyan-400 text-[8px] font-extrabold rounded-md whitespace-nowrap">TRỐNG</span>
                                  )}
                                  <div className="flex gap-1.5">
                                    {slot.status !== 'on_hold' && slot.status !== 'booked' && slot.status !== 'holding' && (
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          triggerActionWithAuth('edit_slot', slot);
                                        }} 
                                        className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500/20 text-[9px] font-bold rounded transition-all"
                                      >
                                        Sửa
                                      </button>
                                    )}
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const subs = slot.subSlots || [];
                                        setSlots(prev => {
                                          const updated = prev.map(s => {
                                            if (subs.includes(s.id)) {
                                              return {
                                                ...s,
                                                status: 'available',
                                                customerPhone: '',
                                                customerName: '',
                                                bookingNotes: '',
                                                hold_expires_at: null
                                              };
                                            }
                                            return s;
                                          });
                                          return updated.filter(s => s.id !== slot.id);
                                        });
                                        setMatches(prev => prev.filter(m => m.venue_slot_id !== slot.id && m.venue_slot_id !== slot.slotId));
                                      }} 
                                      className="px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 text-[9px] font-bold rounded transition-all"
                                    >
                                      Xóa
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Match list section */}
                    {combinedMatches.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-2 border-emerald-400 pl-2">
                          Kèo đã chốt ({combinedMatches.length})
                        </h4>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto no-scrollbar">
                          {paginatedMatches.map(m => (
                            <div 
                              key={m.id} 
                              onClick={() => setSelectedMatch(m)}
                              className="bg-appDark-card border border-emerald-500/20 rounded-xl p-3 flex justify-between items-center group hover:border-emerald-500/50 hover:bg-emerald-500/5 cursor-pointer transition-all active:scale-[0.99] shadow-sm"
                            >
                              <div className="flex flex-col gap-1 text-left">
                                <span className="text-xs font-extrabold text-white">{m.time}</span>
                                <span className="text-[10px] font-semibold text-amber-400">{m.teamName} vs {m.pairedWith || '?'}</span>
                                {m.venue && <span className="text-[10px] text-slate-500 font-medium">{m.venue}</span>}
                                {m.booking_code && (
                                  <span className="text-[9px] font-extrabold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded w-fit mt-0.5 font-mono select-all">
                                    🔑 Mã: {m.booking_code}
                                  </span>
                                )}
                              </div>
                              <span className="px-2 py-0.5 border border-emerald-500/30 text-emerald-400 text-[8px] font-extrabold rounded-md shrink-0">ĐÃ CHỐT</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Empty state */}
                    {allContactSlots.length === 0 && combinedMatches.length === 0 && (
                      <div className="bg-appDark-card border border-appDark-border rounded-2xl py-10 text-center">
                        <span className="text-3xl block mb-2">🏟️</span>
                        <p className="text-slate-400 text-xs font-bold">Chưa có booking nào.</p>
                        <p className="text-slate-600 text-[10px] font-medium mt-1">Đăng sân trống hoặc tìm đối để bắt đầu!</p>
                      </div>
                    )}

                    {/* Pagination Controls — only show if multiple pages */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-1.5 pt-3 border-t border-appDark-border/30">
                        <button disabled={safeBookingPage === 1} onClick={() => setOwnerBookingPage(safeBookingPage - 1)} className="p-1 px-2.5 rounded-lg bg-appDark-card border border-appDark-border text-slate-400 text-[10px] uppercase font-bold hover:border-slate-500 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all">◀</button>
                        <span className="text-xs font-black text-slate-300">Trang {safeBookingPage} / {totalPages}</span>
                        <button disabled={safeBookingPage === totalPages} onClick={() => setOwnerBookingPage(safeBookingPage + 1)} className="p-1 px-2.5 rounded-lg bg-appDark-card border border-appDark-border text-slate-400 text-[10px] uppercase font-bold hover:border-slate-500 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all">▶</button>
                      </div>
                    )}
                  </div>
                </main>
              );
            })()}

            {/* TAB CONTENT: OWNER TÀI KHOẢN */}
            {currentTab === "owner_tai_khoan" && (() => {
              const isSuperAdmin = currentUser?.roles?.includes("super_admin");
              const myVenue = venues.find(v => v.phone === currentUser?.phone || v.owner_user_id === currentUser?.id) || 
                              (isSuperAdmin ? venues.find(v => v.id === "v_s1") || venues[0] : null) || 
                              venues[0]; // Safe fallback so it's never empty

              return (
                <main className="flex-1 p-4 space-y-5 overflow-y-auto no-scrollbar">
                  
                  <div className="space-y-5 pb-6">
                    {/* Venue Verification Header */}
                    <div className="bg-appDark-card border border-appDark-border rounded-xl p-2.5 px-3.5 shadow-sm flex flex-col gap-1 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-neon-green/5 rounded-full blur-xl -mr-6 -mt-6"></div>
                      
                      <div className="flex justify-between items-center relative z-10">
                        <h4 className="text-xs font-black text-white flex items-center gap-1"><span className="text-base">🏟️</span> Sân: {myVenue?.name || "CHƯA LIÊN KẾT"}</h4>
                        <span className="px-1.5 py-0.2 bg-neon-green/10 border border-neon-green/40 text-neon-green text-[8.5px] font-black rounded flex items-center gap-0.5 shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor" className="w-2 h-2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                          ĐÃ XÁC MINH
                        </span>
                      </div>
                      
                      <div className="space-y-0.5 relative z-10 text-[9.5px] border-t border-appDark-border/20 pt-1.5 mt-0.5">
                        <p className="text-slate-400 font-medium truncate">
                          <span className="text-slate-500 font-bold w-11 inline-block">Chủ sân:</span> 
                          <span className="font-extrabold text-neon-yellow">{currentUser?.name || myVenue?.owner || "Chủ sân"}</span> <span className="text-slate-600">|</span> {currentUser?.phone || myVenue?.phone || ""}
                        </p>
                        <p className="text-slate-400 font-medium truncate">
                          <span className="text-slate-500 font-bold w-11 inline-block">Địa chỉ:</span> 
                          <span className="text-slate-300 font-semibold">{myVenue?.address || "Chưa cập nhật"} {myVenue?.district ? `(${myVenue.district})` : ""}</span>
                        </p>
                      </div>
                    </div>

                  {/* OWNER MAIN TABS */}
                  <div className="flex gap-1 mt-2 relative z-10 px-1">
                    <button 
                      onClick={() => setOwnerAccountTab('upcoming')} 
                      className={`flex-1 py-3 font-extrabold text-[11px] uppercase rounded-t-xl transition-all ${ownerAccountTab === 'upcoming' ? 'bg-appDark-card border-t border-l border-r border-appDark-border text-white shadow-[0_-4px_10px_rgba(0,0,0,0.2)]' : 'bg-appDark-deep/50 text-slate-400 border-b border-appDark-border hover:bg-appDark-deep'}`}
                    >
                      Lịch sử trận
                    </button>
                    <button 
                      onClick={() => {
                        setOwnerAccountTab('history');
                        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                      }} 
                      className={`relative flex-1 py-3 font-extrabold text-[11px] uppercase rounded-t-xl transition-all ${ownerAccountTab === 'history' ? 'bg-appDark-card border-t border-l border-r border-appDark-border text-white shadow-[0_-4px_10px_rgba(0,0,0,0.2)]' : 'bg-appDark-deep/50 text-slate-400 border-b border-appDark-border hover:bg-appDark-deep'}`}
                    >
                      Thông Báo
                      {(() => {
                        const unread = notifications.filter(n => !n.isRead && (!n.recipientPhone || (currentUser && n.recipientPhone === currentUser.phone))).length;
                        return unread > 0 ? (
                          <span className="absolute top-2 right-2 min-w-[16px] h-4 px-0.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse text-[9px] font-black text-white flex items-center justify-center">{unread}</span>
                        ) : null;
                      })()}
                    </button>
                  </div>
                  
                  {ownerAccountTab === 'upcoming' && (
                    <div className="bg-appDark-card border border-appDark-border rounded-b-2xl p-4 space-y-4 shadow-md -mt-px relative z-0">
                      <div className="space-y-4 animate-fade-in">
                        <div className="space-y-2.5 max-h-[50vh] overflow-y-auto no-scrollbar pb-4">
                          {(() => {
                            const now = new Date().getTime();
                            const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
                            const ownerSlotsIds = slots.filter(s => s.contact === currentUser?.phone || s.owner_user_id === currentUser?.id).map(s => s.id);
                            
                            const completedMatches = matches.filter(m => {
                              const cleanStringForMatch = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/sân\s+/gi, "").replace(/[^a-z0-9]/g, "").trim();
                              
                              let isOwnerMatch = m.adminContact === currentUser?.phone;
                              if (!isOwnerMatch && myVenue) {
                                if (m.venueId && m.venueId === myVenue.id) isOwnerMatch = true;
                                else if (m.venue && cleanStringForMatch(m.venue) === cleanStringForMatch(myVenue.name)) isOwnerMatch = true;
                              }
                              
                              if (!isOwnerMatch && m.venue_slot_id) {
                                let fieldId = null;
                                if (String(m.venue_slot_id).startsWith("agg_")) {
                                  const parts = String(m.venue_slot_id).split('_');
                                  fieldId = parts[1];
                                }
                                const assocSlot = slots.find(s => 
                                  s.id === m.venue_slot_id || 
                                  s.slotId === m.venue_slot_id || 
                                  (fieldId && s.fieldId === fieldId)
                                );
                                if (assocSlot) {
                                  isOwnerMatch = (myVenue && assocSlot.venueId === myVenue.id) || assocSlot.contact === currentUser?.phone;
                                }
                              }
                              
                              if (!isOwnerMatch) return false;
                              
                              const matchTimeMs = parseMatchStartTime(m.time, m.rawTime || m.rawDate);
                              const isCompleted = (m.status === 'Đã chốt kèo' || m.status === 'completed' || m.status === 'Đã hoàn thành') && (matchTimeMs < now);
                              
                              if (!isCompleted) return false;
                              if (matchTimeMs < sevenDaysAgo) return false;
                              return true;
                            }).sort((a, b) => parseMatchStartTime(b.time, b.rawTime || b.rawDate) - parseMatchStartTime(a.time, a.rawTime || a.rawDate));

                            if (completedMatches.length === 0) {
                              return (
                                <div className="bg-appDark-deep border border-appDark-border/40 rounded-xl p-3 text-center text-[10px] text-slate-500 italic">
                                  Không có trận đấu nào hoàn thành trong 7 ngày qua.
                                </div>
                              );
                            }
                            return renderGroupedMatches(completedMatches);
                          })()}
                        </div>
                      </div>
                    </div>
                  )}

                  {ownerAccountTab === 'history' && (
                    <div className="bg-appDark-card border border-appDark-border rounded-b-2xl p-4 shadow-md -mt-px relative z-0">
                      <div className="space-y-2.5 animate-fade-in opacity-90 max-h-[50vh] overflow-y-auto no-scrollbar pb-4 pt-2">
                        {(() => {
                          const ownerRelevantKeywords = ['nhận kèo', 'xin một suất', 'đặt sân', 'giữ chỗ', 'chốt kèo', 'thành công', 'hủy', 'huỷ', 'rút', 'phê duyệt', 'cấp quyền'];
                          const myNotifs = notifications.filter(n => {
                            if (n.recipientPhone && currentUser && n.recipientPhone !== currentUser.phone) return false;
                            
                            const msg = (n.message || '').toLowerCase();
                            return ownerRelevantKeywords.some(kw => msg.includes(kw));
                          });
                          
                          let displayNotifs = myNotifs;

                          if (displayNotifs.length === 0) {
                            return (
                              <div className="bg-appDark-deep border border-appDark-border/40 rounded-xl p-3 text-center text-[10px] text-slate-500 italic">
                                Bạn không có thông báo nào ở mục này.
                              </div>
                            );
                          }

                          return displayNotifs.map(act => (
                              <div 
                                key={act.id} 
                                onClick={() => {
                                  if (!act.isRead) {
                                    setNotifications(prev => prev.map(n => n.id === act.id ? { ...n, isRead: true } : n));
                                  }
                                  if (act.type === 'suggestion') {
                                    const matchToOpen = matches.find(m => m.id === act.relatedMatchId);
                                    if (matchToOpen && act.suggestedMatches && act.suggestedMatches.length > 0) {
                                      setModalData({
                                        matchId: matchToOpen.id,
                                        match: matchToOpen,
                                        suggestedMatchesIds: act.suggestedMatches
                                      });
                                      setModalType('suggestion');
                                    } else {
                                      alert('Kèo đấu này không còn khả dụng hoặc đã bị hủy!');
                                    }
                                  }
                                }}
                                className={`p-3 rounded-xl border transition-all text-left ${
                                  !act.isRead 
                                    ? 'bg-slate-800/80 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.1)]' 
                                    : 'bg-appDark-deep/40 border-appDark-border/40'
                                }`}
                              >
                                <div className="flex justify-between items-start mb-1">
                                  <span className="text-[10px] font-bold text-slate-400">{act.time}</span>
                                  {!act.isRead && <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse"></span>}
                                </div>
                                <p className="text-[11px] text-slate-200 leading-relaxed" dangerouslySetInnerHTML={{ __html: act.message }}></p>
                                {act.actionRequired && act.status === 'pending' && (
                                  <div className="mt-2 text-right">
                                    <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider">Cần xác nhận ➜</span>
                                  </div>
                                )}
                              </div>
                          ));
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Settings / Other options */}
                  <div className="bg-appDark-card border border-appDark-border rounded-2xl p-4 mt-6">
                    <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-widest mb-3 border-l-2 border-neon-green pl-2">TÙY CHỌN KHÁC</h4>
                    <div className="space-y-1">
                      
                      <button onClick={() => setModalType('venue_settings')} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">⚙️</span>
                          <span className="text-sm font-extrabold text-slate-300">Cài đặt sân (Loại sân & Ghép sân)</span>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4 text-slate-500"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                      </button>
                      <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">🎧</span>
                          <span className="text-sm font-extrabold text-slate-300">Trợ giúp & Hỗ trợ</span>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4 text-slate-500"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </main>
            );
          })()}

            {(currentTab === "toi" || currentTab.startsWith("admin_") || (currentTab.startsWith("owner_") && currentTab !== "owner_tong_quan" && currentTab !== "owner_ql_san" && currentTab !== "owner_booking" && currentTab !== "owner_tai_khoan")) && (
              <main className="flex-1 p-4 space-y-5 overflow-y-auto no-scrollbar">
                
                {/* UNATHENTICATED STATE */}
                {!currentUser && currentTab === "toi" ? (
                  <div className="space-y-6 py-6">
                    <div className="text-center space-y-2">
                      <img 
                        src="/logo1.png" 
                        alt="Logo Kèo Phủi" 
                        className="w-20 h-20 mx-auto mb-2 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] object-contain animate-fade-in" 
                      />
                      <h2 className="text-xl font-extrabold text-white tracking-tight">Kèo Phủi Xin Chào!</h2>
                      <p className="text-xs text-slate-400 px-6 leading-relaxed">
                        Chỉ cần nhập Số điện thoại để bắt đầu nhận kèo, ghép đội và tạo các thông tin bóng đá của riêng bạn. Không cần mật khẩu!
                      </p>
                    </div>

                    <form onSubmit={handleLogin} className="bg-appDark-card border border-appDark-border rounded-2xl p-5 space-y-4 shadow-md">
                      {loginStep === 1 ? (
                        <div className="space-y-1 animate-fade-in">
                          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Số điện thoại đăng nhập</label>
                          <input 
                            type="tel" 
                            placeholder="Nhập 10 số di động của bạn..." 
                            value={loginPhone}
                            onChange={(e) => setLoginPhone(e.target.value)}
                            required
                            pattern="[0-9]{10}"
                            className="w-full text-sm font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-neon-green transition-all"
                          />
                          <p className="text-[10px] text-slate-400">Chúng tôi dùng SĐT để định danh tài khoản duy nhất của bạn.</p>
                          <p className="text-[10px] text-red-500 font-bold">Lưu ý: Hãy nhập đúng số điện thoại của bạn để chủ sân có thể liên hệ</p>
                        </div>
                      ) : (
                        <div className="space-y-4 animate-fade-in">
                          <div className="p-3 bg-appDark-deep rounded-xl border border-appDark-border">
                            <p className="text-xs text-slate-400 mb-1">Số điện thoại đăng ký:</p>
                            <p className="text-sm font-bold text-white flex justify-between items-center">
                              {loginPhone}
                              <span 
                                className="text-[10px] text-neon-green underline cursor-pointer hover:text-emerald-400"
                                onClick={() => setLoginStep(1)}
                              >Sửa SĐT</span>
                            </p>
                          </div>
                          
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Họ & Tên hiển thị</label>
                            <input 
                              type="text" 
                              placeholder="Ví dụ: Anh Quân Phủi, Tuấn GK..." 
                              value={loginName}
                              onChange={(e) => setLoginName(e.target.value)}
                              required
                              className="w-full text-sm font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-neon-green transition-all"
                            />
                            <p className="text-[10px] text-amber-400/80">Lưu ý: Tên đăng ký chỉ được đổi 1 lần trong 30 ngày để chống spam.</p>
                          </div>
                        </div>
                      )}

                      <button 
                        type="submit" 
                        className="w-full font-bold bg-gradient-to-r from-neon-green to-emerald-500 text-appDark-deep py-3 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md neon-glow-green text-sm flex items-center justify-center gap-1"
                      >
                        {loginStep === 1 ? "Tiếp Tục ➜" : "Hoàn Tất Đăng Ký ➜"}
                      </button>

                      {loginStep === 1 && (
                        <>
                          <div className="flex items-center my-1 py-1">
                            <div className="flex-1 border-t border-appDark-border/30"></div>
                            <span className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Hoặc đăng nhập với</span>
                            <div className="flex-1 border-t border-appDark-border/30"></div>
                          </div>

                          <button 
                            type="button"
                            onClick={() => {
                              setGoogleStep(1);
                              setShowGoogleModal(true);
                            }}
                            className="w-full font-black bg-white hover:bg-slate-100 text-slate-800 py-3 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_4px_12px_rgba(0,0,0,0.15)] text-xs flex items-center justify-center gap-2 border border-slate-200"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            ĐĂNG NHẬP BẰNG GOOGLE
                          </button>
                        </>
                      )}
                      
                      <div className="text-center pt-2.5 border-t border-appDark-border/30">
                        <button
                          type="button"
                          onClick={() => {
                            const adminUser = {
                              name: "System Admin",
                              phone: "admin",
                              isAdmin: true,
                              joinedMatchIds: [],
                              createdMatchIds: []
                            };
                            setCurrentUser(adminUser);
                            alert("🔑 Đăng nhập Portal Quản Trị thành công!");
                          }}
                          className="text-[11px] text-neon-yellow hover:underline font-extrabold tracking-wider uppercase flex items-center justify-center gap-1 mx-auto"
                        >
                          🔑 Đăng Nhập Admin Quản Trị
                        </button>
                      </div>
                    </form>
                    
                    <div className="bg-appDark-card/50 rounded-2xl p-4 border border-appDark-border/50 text-center">
                      <p className="text-[10px] text-slate-400">
                        🔒 Chúng tôi cam kết không thu thập thông tin rườm rà. SĐT của bạn chỉ dùng để hỗ trợ đội bóng liên hệ ghép kèo giao lưu văn minh thể thao.
                      </p>
                    </div>
                  </div>
                ) : currentUser.isAdmin ? (
                  // ADMIN SYSTEM DASHBOARD
                  <div className="space-y-5 pb-6">
                    {/* Admin Header Card */}
                    <div className="bg-gradient-to-r from-red-950/80 to-appDark-card border border-red-900/30 rounded-2xl p-5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-red-500 to-amber-500 text-white flex items-center justify-center text-xl font-black shadow-md">
                            ⚙️
                          </div>
                          <div>
                            <h3 className="font-extrabold text-base text-white flex items-center gap-1.5 leading-tight">
                              Portal Admin
                              <span className="bg-red-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-widest animate-pulse">ADMIN</span>
                            </h3>
                            <p className="text-xs text-slate-400 font-medium">Xin chào, {currentUser.name}</p>
                          </div>
                        </div>
                        
                        <button 
                          onClick={handleLogout} 
                          className="bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-red-500/30 active:scale-95 transition-all"
                        >
                          Đăng xuất
                        </button>
                      </div>
                    </div>

                    {/* PENDING NOTIFICATION ALERTS */}
                    {venues.filter(v => v.verification_status === "pending_verification").length > 0 && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3.5 flex items-center justify-between text-xs animate-pulse">
                        <div className="space-y-0.5">
                          <p className="font-extrabold text-red-400">🚨 Yêu Cầu Duyệt Chủ Sân Mới!</p>
                          <p className="text-[10px] text-slate-400">
                            Có <strong>{venues.filter(v => v.verification_status === "pending_verification").length} sân bóng</strong> đang chờ xét duyệt quyền đối tác.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setProfileMatchTab("manage");
                            setAdminSubTab("pitch_owners");
                          }}
                          className="text-[10px] font-black bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition-all shadow shrink-0"
                        >
                          Xem Ngay ➜
                        </button>
                      </div>
                    )}

                    {/* STATS OVERVIEW */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-appDark-card border border-appDark-border rounded-xl p-3 text-center shadow-md">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ghép Thành Công</span>
                        <span className="text-xl font-black text-neon-green">
                          {matches.filter(m => m.status === 'Đã chốt kèo' || m.status === 'confirmed' || m.status === 'Đã đủ người').length} trận
                        </span>
                      </div>
                      <div className="bg-appDark-card border border-appDark-border rounded-xl p-3 text-center shadow-md">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hủy / Ghép Thất Bại</span>
                        <span className="text-xl font-black text-red-400">
                          {matches.filter(m => m.status === 'Đã hủy').length} trận
                        </span>
                      </div>
                      <div className="bg-appDark-card border border-appDark-border rounded-xl p-3 text-center shadow-md">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Đang Chờ Đối</span>
                        <span className="text-xl font-black text-neon-yellow">
                          {matches.filter(m => m.status === 'Cần đối').length} kèo
                        </span>
                      </div>
                      <div className="bg-appDark-card border border-appDark-border rounded-xl p-3 text-center shadow-md">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sân Trống Sẵn Có</span>
                        <span className="text-xl font-black text-cyan-400">
                          {slots.length} sân
                        </span>
                      </div>
                    </div>

                    {/* TAB SELECTOR INSIDE ADMIN PANEL */}
                    <div className="flex bg-appDark-deep p-1 rounded-xl border border-appDark-border gap-1">
                      <button
                        onClick={() => setAdminSubTab("history")}
                        className={`flex-1 text-center py-2 text-[11px] font-bold rounded-lg transition-all ${
                          adminSubTab === "history" 
                            ? "bg-gradient-to-r from-neon-green to-emerald-500 text-appDark-deep shadow" 
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        📜 Lịch Sử
                      </button>
                      <button
                        onClick={() => setAdminSubTab("manage")}
                        className={`flex-1 text-center py-2 text-[11px] font-bold rounded-lg transition-all ${
                          adminSubTab === "manage" 
                            ? "bg-gradient-to-r from-neon-green to-emerald-500 text-appDark-deep shadow" 
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        🛠️ Quản Lý Kèo
                      </button>
                      <button
                        onClick={() => setAdminSubTab("pitch_owners")}
                        className={`flex-1 text-center py-2 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                          adminSubTab === "pitch_owners" 
                            ? "bg-gradient-to-r from-neon-green to-emerald-500 text-appDark-deep shadow" 
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <span>🔑 Chủ Sân</span>
                        {venues.filter(v => v.verification_status === "pending_verification").length > 0 ? (
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-extrabold">({pitchOwners.length})</span>
                        )}
                      </button>
                    </div>

                    {/* SUB TAB 1: HISTORY OF PAIRED AND CANCELLED MATCHES */}
                    {adminSubTab === "history" && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                            Lịch sử ghép kèo chi tiết
                          </h4>
                          <span className="text-[10px] bg-appDark-cardLight border border-appDark-border px-2 py-0.5 rounded text-slate-400 font-semibold">
                            Realtime
                          </span>
                        </div>

                        {matches.filter(m => m.status === 'Đã chốt kèo' || m.status === 'confirmed' || m.status === 'Đã đủ người' || m.status === 'Đã hủy').length === 0 ? (
                          <div className="bg-appDark-card border border-appDark-border rounded-xl p-8 text-center text-xs text-slate-400">
                            Chưa có lịch sử ghép kèo thành công hay hủy trận nào.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {matches
                              .filter(m => m.status === 'Đã chốt kèo' || m.status === 'confirmed' || m.status === 'Đã đủ người' || m.status === 'Đã hủy')
                              .map(m => {
                                const isSuccess = m.status === 'Đã chốt kèo' || m.status === 'confirmed' || m.status === 'Đã đủ người';
                                return (
                                  <div 
                                    key={m.id}
                                    className={`bg-appDark-card border-y border-r border-l-4 rounded-xl p-4 space-y-2 shadow relative overflow-hidden ${
                                      isSuccess 
                                        ? 'border-emerald-500/20 border-l-emerald-500' 
                                        : 'border-red-500/20 border-l-red-500'
                                    }`}
                                  >
                                    <div className="flex justify-between items-start">
                                      <div className="space-y-0.5">
                                        <h5 className="font-extrabold text-xs text-white">
                                          {isSuccess ? (
                                            <span className="flex items-center gap-1.5 flex-wrap">
                                              <span>{m.teamName}</span>
                                              <span className="text-neon-green font-bold text-[10px]">⚔️ VS ⚔️</span>
                                              <span className="text-neon-yellow">{m.pairedWith || "Đối Tác Ghép"}</span>
                                            </span>
                                          ) : (
                                            <span className="text-slate-200">{m.teamName}</span>
                                          )}
                                        </h5>
                                        <p className="text-[10px] text-slate-400 font-medium">
                                          🏟️ {m.venue} ({m.district}) | {m.pitchType}
                                        </p>
                                        <p className="text-[10px] text-neon-green font-semibold">
                                          ⏰ Thời gian: {m.time}
                                        </p>
                                      </div>
                                      
                                      <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wide ${
                                        isSuccess 
                                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                      }`}>
                                        {isSuccess ? 'Thành công' : 'Đã hủy'}
                                      </span>
                                    </div>

                                    {m.status === 'Đã hủy' && (
                                      <div className="bg-red-950/20 border border-red-500/20 rounded-lg p-2.5 mt-1">
                                        <p className="text-[10px] text-red-300 leading-relaxed">
                                          ⚠️ <span className="font-bold">Lý do hủy:</span> {m.cancelReason || "Hủy ghép không thành công."}
                                        </p>
                                      </div>
                                    )}

                                    {isSuccess && (
                                      <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-lg px-2 py-1 mt-1 text-[9.5px] text-emerald-300 flex items-center justify-between">
                                        <span>📞 Liên hệ Admin: {m.adminContact}</span>
                                        <span className="font-bold text-neon-green">Ghép thành công ✓</span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* SUB TAB 2: DATA MANAGE SYSTEM */}
                    {adminSubTab === "manage" && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                            Quản lý toàn bộ danh sách kèo
                          </h4>
                          <span className="text-[10px] bg-neon-green/10 border border-neon-green/20 px-2 py-0.5 rounded text-neon-green font-bold">
                            Tổng: {matches.length} kèo
                          </span>
                        </div>

                        <div className="space-y-3">
                          {matches.map(m => (
                            <div key={m.id} className="bg-appDark-card border border-appDark-border rounded-xl p-3.5 space-y-2.5 shadow-sm">
                              <div className="flex justify-between items-start gap-2">
                                <div>
                                  <h5 className="font-bold text-xs text-white flex items-center gap-1.5">
                                    {m.teamName} 
                                    <span className="text-[10px] font-normal text-slate-400">({m.pitchType})</span>
                                  </h5>
                                  <p className="text-[10px] text-slate-400 mt-0.5">{m.venue} | {m.time}</p>
                                </div>
                                
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                                  m.status === 'Cần đối' || m.status === 'waiting_opponent' ? 'bg-neon-green/10 text-neon-green border-neon-green/20' :
                                  m.status === 'Thiếu người' ? 'bg-neon-yellow/10 text-neon-yellow border-neon-yellow/20' :
                                  m.status === 'Đã chốt kèo' || m.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                  m.status === 'Đã hủy' || m.status === 'cancelled' || m.status === 'expired' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                  'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                }`}>
                                  {m.status === 'waiting_opponent' ? 'Đang chờ đối' : 
                                   m.status === 'pending_confirmation' ? 'Có đối đăng ký' : 
                                   m.status === 'confirmed' ? 'Kèo đã chốt' :
                                   m.status === 'cancelled' ? 'Đã hủy' :
                                   m.status === 'expired' ? 'Hết hạn' : m.status}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 flex-wrap pt-1.5 border-t border-appDark-border/30">
                                <button
                                  onClick={() => handleUpdateMatchStatus(m.id, 'Cần đối')}
                                  className="text-[9px] font-bold bg-appDark-deep hover:bg-neon-green/20 text-slate-300 hover:text-neon-green border border-appDark-border hover:border-neon-green/30 px-2 py-1 rounded transition-all"
                                >
                                  Cần đối
                                </button>
                                <button
                                  onClick={() => handleUpdateMatchStatus(m.id, 'Thiếu người')}
                                  className="text-[9px] font-bold bg-appDark-deep hover:bg-neon-yellow/20 text-slate-300 hover:text-neon-yellow border border-appDark-border hover:border-neon-yellow/30 px-2 py-1 rounded transition-all"
                                >
                                  Thiếu người
                                </button>
                                <button
                                  onClick={() => {
                                    const opponent = prompt("Nhập tên Đội Đối Tác ghép kèo thành công:", m.pairedWith || "");
                                    if (opponent !== null) {
                                      handleUpdateMatchStatus(m.id, 'Đã chốt kèo', { pairedWith: opponent || "FC Đối Tác" });
                                    }
                                  }}
                                  className="text-[9px] font-bold bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/30 px-2 py-1 rounded transition-all"
                                >
                                  Chốt đối thành công ✓
                                </button>
                                <button
                                  onClick={() => {
                                    const reason = prompt("Nhập lý do hủy kèo đấu này:", m.cancelReason || "");
                                    if (reason !== null) {
                                      handleUpdateMatchStatus(m.id, 'Đã hủy', { cancelReason: reason || "Ghép không thành công" });
                                    }
                                  }}
                                  className="text-[9px] font-bold bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 px-2 py-1 rounded transition-all"
                                >
                                  Hủy kèo ✗
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SUB TAB 3: PITCH OWNER PERMISSION MANAGEMENT */}
                    {adminSubTab === "pitch_owners" && (
                      <div className="space-y-4 text-left">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                            Danh sách Chủ Sân được duyệt
                          </h4>
                          <span className="text-[10px] bg-neon-green/10 border border-neon-green/20 px-2 py-0.5 rounded text-neon-green font-bold">
                            {pitchOwners.length} tài khoản
                          </span>
                        </div>

                        {/* Fast Add Owner Form */}
                        <form 
                          onSubmit={(e) => {
                            e.preventDefault();
                            const newOwnerPhone = e.target.elements.newOwnerPhone.value.trim();
                            if (!newOwnerPhone) return;
                            if (pitchOwners.includes(newOwnerPhone)) {
                              alert("Số điện thoại này đã được phê duyệt làm Chủ Sân trước đó!");
                              return;
                            }
                            setPitchOwners(prev => [...prev, newOwnerPhone]);
                            e.target.reset();
                            alert(`🔑 Đã phê duyệt số điện thoại ${newOwnerPhone} làm CHỦ SÂN thành công!`);
                          }}
                          className="bg-appDark-deep p-3 rounded-xl border border-appDark-border space-y-2 shadow-sm"
                        >
                          <label className="text-[10px] font-bold text-slate-400 block uppercase">
                            ⚡ Phê duyệt nhanh Chủ Sân mới
                          </label>
                          <div className="flex gap-2">
                            <input 
                              type="tel"
                              name="newOwnerPhone"
                              placeholder="Nhập số điện thoại chủ sân..."
                              required
                              className="flex-1 text-xs bg-appDark-card border border-appDark-border rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-neon-green"
                            />
                            <button
                              type="submit"
                              className="text-xs font-black bg-gradient-to-r from-neon-green to-emerald-500 text-appDark-deep px-3.5 py-2 rounded-lg hover:scale-105 active:scale-95 transition-all shadow-md shrink-0"
                            >
                              Duyệt
                            </button>
                          </div>
                        </form>

                        {/* List of current pitch owners */}
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1 no-scrollbar">
                          {pitchOwners.length === 0 ? (
                            <p className="text-[10px] text-slate-500 italic text-center py-4 bg-appDark-deep rounded-xl border border-appDark-border/30">
                              Chưa phê duyệt chủ sân nào.
                            </p>
                          ) : (
                            pitchOwners.map((ownerPhone) => (
                              <div key={ownerPhone} className="flex justify-between items-center text-xs bg-appDark-card border border-appDark-border p-2.5 rounded-xl">
                                <div className="space-y-0.5 font-sans">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-extrabold text-white">🏟️ SĐT: {ownerPhone}</span>
                                    <span className="text-[9px] bg-neon-green/20 text-neon-green border border-neon-green/30 px-1.5 py-0.5 rounded font-black uppercase">
                                      CHỦ SÂN
                                    </span>
                                  </div>
                                  <p className="text-[9px] text-slate-500">Quyền đăng lịch, giờ, thanh lý sân trống ✓</p>
                                </div>
                                
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`Bạn có chắc chắn muốn THU HỒI quyền Chủ Sân của số điện thoại ${ownerPhone}?`)) {
                                      setPitchOwners(prev => prev.filter(p => p !== ownerPhone));
                                      alert(`❌ Đã thu hồi quyền Chủ Sân của ${ownerPhone}.`);
                                    }
                                  }}
                                  className="text-[9px] font-bold bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 px-2 py-1 rounded transition-all animate-pulse"
                                >
                                  Thu Hồi
                                </button>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Pending venues section */}
                        <div className="space-y-3.5 mt-4 pt-4 border-t border-appDark-border/40">
                          <h5 className="text-[10px] font-black text-neon-yellow uppercase tracking-wider">
                            🏟️ Yêu Cầu Duyệt Chủ Sân & Venue Mới ({venues.filter(v => v.verification_status === "pending_verification").length})
                          </h5>
                          {venues.filter(v => v.verification_status === "pending_verification").length === 0 ? (
                            <p className="text-[10px] text-slate-500 italic text-center py-4 bg-appDark-deep rounded-xl border border-appDark-border/30">
                              Không có yêu cầu duyệt sân nào đang chờ.
                            </p>
                          ) : (
                            venues.filter(v => v.verification_status === "pending_verification").map((v) => {
                              const ownerUser = users.find(u => u.id === v.owner_user_id) || { name: "Người dùng ẩn", phone: v.phone };
                              return (
                                <div key={v.id} className="bg-appDark-card border border-appDark-border/60 rounded-xl p-3.5 space-y-2 text-xs">
                                  <div className="flex justify-between items-start">
                                    <div className="space-y-0.5">
                                      <h6 className="font-extrabold text-white">{v.name} ({v.district})</h6>
                                      <p className="text-[10px] text-slate-400">Chủ sân: <strong className="text-slate-300">{ownerUser.name}</strong> - SĐT: <strong className="text-neon-green">{v.phone || ownerUser.phone}</strong></p>
                                      <p className="text-[10px] text-slate-400">Địa chỉ: {v.address}</p>
                                      {v.notes && <p className="text-[10px] text-slate-500 italic">"{v.notes}"</p>}
                                    </div>
                                    <span className="text-[8px] bg-neon-yellow/10 text-neon-yellow border border-neon-yellow/20 px-2 py-0.5 rounded font-black uppercase shrink-0">
                                      CHỜ DUYỆT
                                    </span>
                                  </div>

                                  <div className="flex gap-2 pt-2 border-t border-appDark-border/20">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        // Approve venue owner
                                        setVenues(prev => prev.map(x => x.id === v.id ? { ...x, verification_status: "verified" } : x));
                                        const ownerPhone = v.phone || ownerUser.phone;
                                        if (ownerPhone && !pitchOwners.includes(ownerPhone)) {
                                          setPitchOwners(prev => [...prev, ownerPhone]);
                                        }
                                        alert(`✅ Đã phê duyệt sân "${v.name}" và cấp quyền CHỦ SÂN cho số ${ownerPhone}!`);
                                      }}
                                      className="flex-1 font-bold bg-gradient-to-r from-neon-green to-emerald-500 text-appDark-deep py-1.5 rounded-lg text-[10px] uppercase hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    >
                                      Phê Duyệt ✓
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (confirm(`Bạn có chắc chắn muốn TỪ CHỐI yêu cầu của sân "${v.name}"?`)) {
                                          setVenues(prev => prev.map(x => x.id === v.id ? { ...x, verification_status: "rejected" } : x));
                                          alert(`❌ Đã từ chối yêu cầu của sân "${v.name}".`);
                                        }
                                      }}
                                      className="font-bold bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white px-3 py-1.5 rounded-lg text-[10px] uppercase border border-red-500/30 transition-all animate-pulse"
                                    >
                                      Từ Chối
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="space-y-5 pb-6">
                
                                    
                    
                                    {/* VENUE OWNER REGISTRATION BANNER */}
                {(() => {
                  const myVenue = venues.find(v => v.owner_user_id === currentUser?.id);
                  if (!myVenue && !isVenueOwnerGlobal) {
                    return (
                      <div 
                        className="relative h-28 rounded-2xl overflow-hidden border border-appDark-border shadow-lg flex items-center justify-between p-4 group mb-4"
                        style={{
                          backgroundImage: "url('/soccer_field_banner_bg.png')",
                          backgroundSize: 'cover',
                          backgroundPosition: 'center 60%'
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent z-10"></div>
                        <div className="absolute top-0 right-1/4 w-32 h-32 bg-sky-400/20 rounded-full blur-2xl group-hover:scale-110 transition-all duration-700 z-10"></div>
                        
                        <div className="relative z-20 space-y-1 max-w-[70%] text-left">
                          <span className="inline-block text-[9px] font-black tracking-widest text-appDark-deep bg-gradient-to-r from-sky-400 to-blue-500 px-2 py-0.5 rounded-full uppercase shadow-[0_0_8px_#38BDF8]">
                            HỢP TÁC CHỦ SÂN
                          </span>
                          <h2 className="text-xs font-black text-white leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                            BẠN SỞ HỮU SÂN BÓNG CỎ NHÂN TẠO?
                          </h2>
                          <p className="text-[9.5px] text-slate-300 font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] leading-snug">
                            Hãy đăng ký vai trò Chủ Sân để đăng tin bán giờ trống, slot ưu đãi cho các đội bóng!
                          </p>
                        </div>
                        
                        <div className="relative z-20 shrink-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md border border-sky-400/30 rounded-xl p-2.5 shadow-md hover:scale-105 active:scale-95 cursor-pointer transition-all duration-350"
                            onClick={() => triggerActionWithAuth('venue_registration')}>
                          <span className="text-[10px] font-black text-sky-400 tracking-wider uppercase text-center leading-tight">Đăng<br/>Ký Ngay</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
                    {/* User Intro Card & Quick Actions */}
                    <div className="bg-gradient-to-r from-appDark-card to-appDark-cardLight border border-appDark-border rounded-2xl p-4 relative shadow-sm">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-neon-green/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
                      
                      {/* Top Info */}
                      <div className="flex items-center justify-between relative z-10 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-neon-yellow to-amber-500 text-appDark-deep flex items-center justify-center text-xl font-black shadow-sm uppercase shrink-0">
                            {currentUser.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-extrabold text-base text-white flex items-center gap-1.5">
                              {currentUser.name}
                              <button 
                                onClick={() => setModalType('change_name')}
                                className="text-[10px] text-slate-400 hover:text-white transition-all ml-1"
                              >✏️</button>
                            </h3>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5 flex items-center gap-2">
                              {currentUser.phone}
                              <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-neon-green/10 text-neon-green">
                                ⚽ Cầu thủ
                              </span>
                              {pitchOwners.includes(currentUser.phone) && (
                                <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                  🔑 Chủ sân
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={handleLogout} 
                          className="w-8 h-8 rounded-full bg-appDark-deep border border-appDark-border flex items-center justify-center text-slate-400 hover:text-red-400 transition-all shrink-0"
                          title="Đăng xuất"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        </button>
                      </div>

                      {/* STATS GRID */}
                      <div className="grid grid-cols-4 gap-2 mb-4 relative z-10">
                        <div className="bg-appDark-deep/50 border border-appDark-border rounded-lg p-2 flex flex-col items-center justify-center">
                          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Số trận</span>
                          <span className="text-xs font-black text-white">{currentUser.playedMatchesCount ?? currentUser.matchCount ?? 0}</span>
                        </div>
                        <div className="bg-appDark-deep/50 border border-appDark-border rounded-lg p-2 flex flex-col items-center justify-center">
                          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mb-0.5 flex items-center gap-1">Vị trí</span>
                          <div className="relative flex items-center justify-center">
                            <select 
                              className="appearance-none bg-transparent text-xs font-black text-cyan-400 text-center focus:outline-none cursor-pointer pr-3"
                              value={currentUser.position || 'Tự do'}
                              onChange={(e) => setCurrentUser({...currentUser, position: e.target.value})}
                            >
                              <option value="GK" className="bg-appDark-card text-white">GK</option>
                              <option value="Hậu vệ" className="bg-appDark-card text-white">Hậu vệ</option>
                              <option value="Tiền vệ" className="bg-appDark-card text-white">Tiền vệ</option>
                              <option value="Tiền đạo" className="bg-appDark-card text-white">Tiền đạo</option>
                              <option value="Tự do" className="bg-appDark-card text-white">Tự do</option>
                            </select>
                            <div className="pointer-events-none absolute right-[-2px] flex items-center text-slate-500">
                              <span className="text-[10px]">▾</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-appDark-deep/50 border border-appDark-border rounded-lg p-2 flex flex-col items-center justify-center">
                          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Rating</span>
                          <span className="text-xs font-black text-neon-yellow">{currentUser.rating || '4.8'} ⭐</span>
                        </div>
                        <div className="bg-appDark-deep/50 border border-appDark-border rounded-lg p-2 flex flex-col items-center justify-center">
                          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Hủy kèo</span>
                          <span className="text-xs font-black text-red-400">{currentUser.cancellationRate || '0%'}</span>
                        </div>
                      </div>
                    </div>

                                        {/* PROFILE MAIN TABS */}
                    <div className="flex gap-1 mt-2 relative z-10 px-1">
                      <button 
                        onClick={() => setProfileMatchTab('team')} 
                        className={`flex-1 py-3 font-extrabold text-[11px] uppercase rounded-t-xl transition-all ${profileMatchTab === 'team' ? 'bg-appDark-card border-t border-l border-r border-appDark-border text-white shadow-[0_-4px_10px_rgba(0,0,0,0.2)]' : 'bg-appDark-deep/50 text-slate-400 border-b border-appDark-border hover:bg-appDark-deep'}`}
                      >
                        Đội Của Tôi
                      </button>
                      <button 
                        onClick={() => setProfileMatchTab('upcoming')} 
                        className={`flex-1 py-3 font-extrabold text-[11px] uppercase rounded-t-xl transition-all ${profileMatchTab === 'upcoming' ? 'bg-appDark-card border-t border-l border-r border-appDark-border text-white shadow-[0_-4px_10px_rgba(0,0,0,0.2)]' : 'bg-appDark-deep/50 text-slate-400 border-b border-appDark-border hover:bg-appDark-deep'}`}
                      >
                        Kèo Của Tôi
                      </button>
                      <button 
                        onClick={() => {
                          setProfileMatchTab('history');
                          // Mark all unread notifications as read when opening the tab
                          setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                        }} 
                        className={`relative flex-1 py-3 font-extrabold text-[11px] uppercase rounded-t-xl transition-all ${profileMatchTab === 'history' ? 'bg-appDark-card border-t border-l border-r border-appDark-border text-white shadow-[0_-4px_10px_rgba(0,0,0,0.2)]' : 'bg-appDark-deep/50 text-slate-400 border-b border-appDark-border hover:bg-appDark-deep'}`}
                      >
                        Thông Báo
                        {(() => {
                          const unread = notifications.filter(n => !n.isRead && (!n.recipientPhone || (currentUser && n.recipientPhone === currentUser.phone))).length;
                          return unread > 0 ? (
                            <span className="absolute top-2 right-2 min-w-[16px] h-4 px-0.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse text-[9px] font-black text-white flex items-center justify-center">{unread}</span>
                          ) : null;
                        })()}
                      </button>
                    </div>
                    
                    {profileMatchTab === 'team' && (
                    <div className="bg-appDark-card border border-appDark-border rounded-b-2xl rounded-tr-2xl p-4 space-y-4 shadow-md -mt-px relative z-0">
                      {/* TEAM MEMBERSHIP & MANAGEMENT PANEL */}
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                          QUẢN LÝ ĐỘI BÓNG CỦA BẠN
                        </h4>
                      </div>

                      {(() => {
                        const myTeams = teams.filter(t => 
                          t.owner_user_id === currentUser.id || 
                          (t.members && t.members.some(m => m.user_id === currentUser.id && (m.status === 'joined' || m.status === 'pending')))
                        ).sort((a, b) => {
                          const aIsOwner = a.owner_user_id === currentUser.id;
                          const bIsOwner = b.owner_user_id === currentUser.id;
                          if (aIsOwner && !bIsOwner) return -1;
                          if (!aIsOwner && bIsOwner) return 1;
                          return 0;
                        });

                        if (myTeams.length === 0) {
                          return (
                            <div className="bg-appDark-deep rounded-xl p-3.5 border border-appDark-border/30 text-left space-y-3.5">
                              <p className="text-[10px] text-slate-400 leading-relaxed">
                                Bạn chưa gia nhập đội bóng nào. Hãy tạo một đội bóng mới để làm Captain, hoặc nhập mã mời của đội bóng khác để xin gia nhập!
                              </p>
                              
                              <button
                                type="button"
                                onClick={() => triggerActionWithAuth('create_team')}
                                className="w-full text-xs font-bold bg-gradient-to-r from-neon-green to-emerald-500 text-appDark-deep py-2.5 rounded-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-1 shadow"
                              >
                                ➕ Tạo Đội Bóng Mới
                              </button>

                              <div className="pt-3 border-t border-appDark-border/30 space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">⚡ Nhập Mã Gia Nhập Đội</label>
                                <form onSubmit={handleJoinTeamByCode} className="flex gap-2">
                                  <input 
                                    type="text" 
                                    placeholder="Ví dụ: FC-4720..." 
                                    name="joinTeamCode"
                                    required
                                    className="flex-1 text-xs bg-appDark-card border border-appDark-border rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-neon-yellow"
                                  />
                                  <button type="submit" className="text-xs font-black bg-neon-yellow hover:bg-neon-yellow/90 text-appDark-deep px-4 py-2 rounded-lg transition-all shrink-0">Xin Vào</button>
                                </form>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div className="space-y-4">
                            {/* Horizontal Scroll Team Switcher */}
                            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar border-b border-appDark-border/50 -mx-4 px-4">
                              {myTeams.map(team => {
                                const isSelected = activeTeamId ? team.id === activeTeamId : team.id === myTeams[0].id;
                                const isCaptain = team.owner_user_id === currentUser.id;
                                return (
                                  <div 
                                    key={team.id}
                                    onClick={() => setActiveTeamId(team.id)}
                                    className={`flex flex-col items-center gap-1 cursor-pointer transition-all shrink-0 w-[52px] relative ${isSelected ? 'opacity-100' : 'opacity-50 hover:opacity-80'}`}
                                  >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-sm shadow-sm uppercase overflow-hidden border-2 transition-all ${isSelected ? 'border-neon-yellow shadow-[0_0_10px_rgba(202,243,36,0.3)]' : 'border-transparent bg-appDark-deep'}`}>
                                      {team.avatar ? (
                                        <img src={team.avatar} alt={team.name || team.teamName} className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                          {(team.name || team.teamName || 'FC').substring(0,2).toUpperCase()}
                                        </div>
                                      )}
                                    </div>
                                    {isCaptain && (
                                      <div className="absolute -top-1 -right-0.5 text-[10px] rotate-12 drop-shadow-md z-10">👑</div>
                                    )}
                                    <span className={`text-[8.5px] truncate w-full text-center font-bold ${isSelected ? 'text-neon-yellow' : 'text-slate-400'}`}>
                                      {team.name || team.teamName}
                                    </span>
                                  </div>
                                );
                              })}
                              {/* Create Team Square */}
                              <div 
                                onClick={() => triggerActionWithAuth('create_team')}
                                className="flex flex-col items-center gap-1 cursor-pointer transition-all shrink-0 w-[52px] opacity-70 hover:opacity-100"
                              >
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-sm shadow-sm border-2 border-dashed border-slate-500 bg-appDark-deep hover:border-neon-green transition-all">
                                  ➕
                                </div>
                                <span className="text-[8.5px] truncate w-full text-center font-bold text-slate-400">
                                  Thêm đội
                                </span>
                              </div>
                            </div>
                            
                            {/* Selected Team Details */}
                            {(() => {
                              const displayTeamId = activeTeamId && myTeams.some(x => x.id === activeTeamId) ? activeTeamId : myTeams[0].id;
                              const t = myTeams.find(x => x.id === displayTeamId);
                              if (!t) return null;

                              const isOwner = t.owner_user_id === currentUser.id;
                              const myRoleObj = t.members?.find(m => m.user_id === currentUser.id);
                              const isAdmin = myRoleObj?.role === 'admin';
                              const joinedMembers = t.members?.filter(m => m.status === 'joined') || [];
                              const pendingMembers = t.members?.filter(m => m.status === 'pending') || [];

                              return (
                                <div className="animate-fade-in space-y-3">
                                  {/* Tên, Vai trò & Mã Mời */}
                                  <div className="flex justify-between items-center bg-appDark-card/50 p-2.5 rounded-lg border border-appDark-border/50">
                                    <div>
                                      <h5 className="font-extrabold text-white text-sm mb-0.5">{t.name || t.teamName}</h5>
                                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                                        Vai trò: <span className="text-amber-400">
                                          {isOwner ? 'CHỦ ĐỘI' : isAdmin ? 'QUẢN TRỊ' : myRoleObj?.status === 'pending' ? 'ĐANG CHỜ DUYỆT' : 'THÀNH VIÊN'}
                                        </span>
                                      </p>
                                      <p className="text-[9.5px] text-neon-yellow">Mã mời: <strong className="text-white tracking-widest">{t.invite_code}</strong></p>
                                    </div>
                                    {(isOwner || isAdmin) && (
                                      <div className="flex flex-col gap-1.5">
                                        <button type="button" onClick={() => changeTeamAvatar(t.id)} className="text-[8px] font-bold bg-slate-800 text-slate-300 px-2 py-1 rounded hover:text-white transition-all w-full">Đổi Ảnh</button>
                                        <button type="button" onClick={() => changeTeamName(t.id)} className="text-[8px] font-bold bg-slate-800 text-slate-300 px-2 py-1 rounded hover:text-white transition-all w-full">Đổi Tên</button>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* TEAM STATS */}
                                  <div className="flex gap-4 text-[9.5px] text-slate-300 bg-appDark-card/50 p-2.5 rounded-lg border border-appDark-border/50 justify-between px-4">
                                    <div className="flex flex-col items-center">
                                      <span className="text-slate-500 font-medium text-[8.5px] uppercase">Trận Đấu</span>
                                      <strong className="text-white mt-0.5">{t.matchCount || 0}</strong>
                                    </div>
                                    <div className="flex flex-col items-center border-l border-appDark-border/50 pl-4">
                                      <span className="text-slate-500 font-medium text-[8.5px] uppercase">Tỉ Lệ Thắng</span>
                                      <strong className="text-emerald-400 mt-0.5">{t.winRate || '0%'}</strong>
                                    </div>
                                    <div className="flex flex-col items-center border-l border-appDark-border/50 pl-4">
                                      <span className="text-slate-500 font-medium text-[8.5px] uppercase">Đánh Giá</span>
                                      <strong className="text-amber-400 flex items-center gap-0.5 mt-0.5">{(t.rating || 5).toFixed(1)} <svg className="w-2.5 h-2.5 pb-[1px]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg></strong>
                                    </div>
                                  </div>

                                  {myRoleObj?.status === 'pending' && (
                                    <button
                                      type="button"
                                      onClick={() => cancelJoinTeamRequest(t.id)}
                                      className="mt-2 w-full text-[10px] font-bold bg-red-500/10 border border-red-500/30 text-red-400 py-2 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                                    >
                                      ❌ Hủy Yêu Cầu Xin Gia Nhập
                                    </button>
                                  )}

                                  {/* Candidates awaiting approval */}
                                  {(isOwner || isAdmin) && (
                                    <div className="space-y-2 border-t border-appDark-border/30 pt-3">
                                      <div 
                                        className="flex justify-between items-center cursor-pointer"
                                        onClick={() => setExpandedJoinRequests(!expandedJoinRequests)}
                                      >
                                        <p className="text-[9.5px] font-black text-neon-yellow uppercase tracking-wider flex items-center gap-1">
                                          <span>⏳ Yêu Cầu Xin Gia Nhập ({pendingMembers.length})</span>
                                        </p>
                                        <span className="text-slate-400 text-xs">{expandedJoinRequests ? '▼' : '▲'}</span>
                                      </div>
                                      
                                      {expandedJoinRequests && (
                                        pendingMembers.length === 0 ? (
                                          <p className="text-[9px] text-slate-500 italic">Không có thành viên nào đang chờ duyệt.</p>
                                        ) : (
                                          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 no-scrollbar">
                                          {pendingMembers.map(m => {
                                            const userObj = users.find(u => u.id === m.user_id);
                                            const phoneDisplay = userObj ? userObj.phone : "";
                                            return (
                                            <div key={m.user_id} className="bg-appDark-card border border-appDark-border rounded-lg p-2 flex items-center justify-between text-xs">
                                              <div className="flex flex-col">
                                                <span className="font-extrabold text-slate-200">{userObj ? userObj.name : m.name}</span>
                                                {phoneDisplay && (
                                                  <a href={`tel:${phoneDisplay}`} className="text-[9.5px] text-slate-400 mt-0.5 hover:text-neon-yellow transition-colors block">
                                                    📞 {phoneDisplay}
                                                  </a>
                                                )}
                                              </div>
                                              <div className="flex gap-1">
                                                <button
                                                  type="button"
                                                  onClick={() => approveMember(t.id, m.user_id)}
                                                  className="text-[9px] font-black bg-neon-green hover:bg-neon-green/90 text-appDark-deep px-2.5 py-1 rounded transition-all"
                                                >
                                                  Đồng Ý
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => rejectMember(t.id, m.user_id)}
                                                  className="text-[9px] font-bold bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-2 py-1 rounded transition-all"
                                                >
                                                  Từ Chối
                                                </button>
                                              </div>
                                            </div>
                                          )})}
                                          </div>
                                        )
                                      )}
                                    </div>
                                  )}

                                  {/* Member List with promote/demote controls */}
                                  {(!myRoleObj || myRoleObj.status === 'joined' || isOwner) && (
                                    <div className="space-y-2 border-t border-appDark-border/30 pt-3">
                                      <div 
                                        className="flex justify-between items-center cursor-pointer"
                                        onClick={() => setExpandedMembersList(!expandedMembersList)}
                                      >
                                        <p className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider">⚽ Danh sách thành viên ({joinedMembers.length})</p>
                                        <span className="text-slate-400 text-xs">{expandedMembersList ? '▼' : '▲'}</span>
                                      </div>
                                      
                                      {expandedMembersList && (
                                        <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1 no-scrollbar">
                                          {joinedMembers.map(m => {
                                            const userObj = users.find(u => u.id === m.user_id);
                                            const phoneDisplay = userObj ? userObj.phone : "";
                                            const cancelRate = userObj?.cancellationRate || "Thấp (2%)";
                                            return (
                                            <div key={m.user_id} className="flex justify-between items-center text-[11px] bg-appDark-card/40 border border-appDark-border/30 p-2.5 rounded-lg">
                                              <div className="flex flex-col">
                                                <div className="flex items-center gap-1.5">
                                                  <span className="font-bold text-slate-200">{userObj ? userObj.name : m.name}</span>
                                                <span className={`text-[7.5px] font-black uppercase px-1.5 py-0.5 rounded border ${
                                                  m.role === 'owner' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                  m.role === 'admin' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                                  'bg-slate-800 text-slate-400 border-slate-700'
                                                }`}>
                                                  {m.role === 'owner' ? 'Chủ đội' : m.role === 'admin' ? 'QTV' : 'Cầu thủ'}
                                                </span>
                                              </div>
                                              {phoneDisplay && (
                                                <a href={`tel:${phoneDisplay}`} className="text-[9.5px] text-slate-400 mt-0.5 hover:text-neon-yellow transition-colors block">
                                                  📞 {phoneDisplay}
                                                </a>
                                              )}
                                            </div>

                                            {/* Team Admin controls */}
                                            {(isOwner || isAdmin) && m.user_id !== currentUser.id && (
                                              <div className="flex gap-1.5 items-center">
                                                {isOwner && (
                                                  <>
                                                    {m.role === 'member' ? (
                                                      <button
                                                        type="button"
                                                        onClick={() => promoteMember(t.id, m.user_id)}
                                                        className="text-[8.5px] font-extrabold bg-orange-500/10 hover:bg-orange-500 text-orange-400 hover:text-appDark-deep px-2 py-1 rounded transition-all"
                                                      >
                                                        Phong QTV
                                                      </button>
                                                    ) : m.role === 'admin' ? (
                                                      <button
                                                        type="button"
                                                        onClick={() => demoteMember(t.id, m.user_id)}
                                                        className="text-[8.5px] font-extrabold bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white px-2 py-1 rounded transition-all"
                                                      >
                                                        Hủy QTV
                                                      </button>
                                                    ) : null}
                                                  </>
                                                )}
                                                
                                                {/* Both Owner and Admin can remove members, but Admin cannot remove Owner or other Admins */}
                                                {(isOwner || (isAdmin && m.role === 'member')) && (
                                                  <button
                                                    type="button"
                                                    onClick={() => removeMember(t.id, m.user_id)}
                                                    className="text-[8.5px] font-extrabold bg-slate-800 hover:bg-red-500 text-slate-400 hover:text-white px-2 py-1 rounded transition-all"
                                                  >
                                                    Xóa
                                                  </button>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        )})}
                                      </div>
                                      )}
                                    </div>
                                  )}
                                  {/* Team Dangerous Actions */}
                                  {isOwner && (
                                    <button 
                                      type="button"
                                      onClick={() => deleteTeam(t.id)}
                                      className="w-full text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/30 py-2.5 rounded-lg hover:bg-red-500 hover:text-white transition-all mt-4"
                                    >
                                      🗑 XÓA ĐỘI BÓNG
                                    </button>
                                  )}
                                  {!isOwner && myRoleObj?.status === 'joined' && (
                                    <button 
                                      type="button"
                                      onClick={() => leaveTeam(t.id)}
                                      className="w-full text-xs font-bold bg-orange-500/10 text-orange-500 border border-orange-500/30 py-2.5 rounded-lg hover:bg-orange-500 hover:text-white transition-all mt-4"
                                    >
                                      🚪 RỜI KHỎI ĐỘI
                                    </button>
                                  )}
                                </div>
                              );
                            })()}
                            
                            {/* Nút Nhập Mã (Luôn hiển thị) */}
                            <div className="pt-2 border-t border-appDark-border/30 space-y-2 mt-4">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">⚡ Nhập Mã Xin Gia Nhập Đội Khác</label>
                              <form onSubmit={handleJoinTeamByCode} className="flex gap-2">
                                <input 
                                  type="text" 
                                  placeholder="Ví dụ: FC-4720..." 
                                  name="joinTeamCode"
                                  required
                                  className="flex-1 text-xs bg-appDark-card border border-appDark-border rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-neon-yellow"
                                />
                                <button type="submit" className="text-xs font-black bg-neon-yellow hover:bg-neon-yellow/90 text-appDark-deep px-4 py-2 rounded-lg transition-all shrink-0">Xin Vào</button>
                              </form>
                            </div>
                          </div>
                        );
                      })()}

                                        </div>
                    )}

                    {profileMatchTab === 'upcoming' && (
                    <div className="bg-appDark-card border border-appDark-border rounded-b-2xl rounded-tl-2xl p-4 shadow-md -mt-px relative z-0">

                      {/* SUBTABS */}
                      <div className="flex gap-2 border-b border-appDark-border pb-3 mb-4">
                        <button 
                          onClick={() => setUpcomingSubTab('created')}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${upcomingSubTab === 'created' ? 'bg-neon-green text-appDark-deep' : 'bg-appDark-deep text-slate-400 hover:text-slate-200'}`}
                        >
                          Tôi Tạo ({myCreatedMatches.length})
                        </button>
                        <button 
                          onClick={() => setUpcomingSubTab('joined')}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${upcomingSubTab === 'joined' ? 'bg-neon-yellow text-appDark-deep' : 'bg-appDark-deep text-slate-400 hover:text-slate-200'}`}
                        >
                          Tôi Tham Gia ({myJoinedMatches.length})
                        </button>
                      </div>

                      <div className="space-y-4 animate-fade-in">
                        {upcomingSubTab === 'created' && (
                          <div className="space-y-2.5 max-h-[60vh] overflow-y-auto no-scrollbar pb-4">
                            {myCreatedMatches.length === 0 ? (
                              <div className="bg-appDark-deep border border-appDark-border/40 rounded-xl p-3 text-center text-[10px] text-slate-500 italic">
                                Bạn chưa tạo kèo đấu nào.
                              </div>
                            ) : (
                              renderGroupedMatches(myCreatedMatches)
                            )}
                          </div>
                        )}
                        
                        {upcomingSubTab === 'joined' && (
                          <div className="space-y-2.5 max-h-[60vh] overflow-y-auto no-scrollbar pb-4">
                            {myJoinedMatches.length === 0 ? (
                              <div className="bg-appDark-deep border border-appDark-border/40 rounded-xl p-3 text-center text-[10px] text-slate-500 italic">
                                Bạn chưa tham gia kèo nào.
                              </div>
                            ) : (
                              renderGroupedMatches(myJoinedMatches)
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    )}

                    {profileMatchTab === 'history' && (
                      <div className="bg-appDark-card border border-appDark-border rounded-b-2xl rounded-tl-2xl p-4 shadow-md -mt-px relative z-0">
                        
                        {/* SUBTABS */}
                        <div className="flex gap-2 border-b border-appDark-border pb-3 mb-4">
                          <button 
                            onClick={() => setNotificationSubTab('pending')}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${notificationSubTab === 'pending' ? 'bg-amber-400 text-appDark-deep' : 'bg-appDark-deep text-slate-400 hover:text-slate-200'}`}
                          >
                            Chờ xử lý ({notifications.filter(n => (!n.recipientPhone || (currentUser && n.recipientPhone === currentUser.phone)) && n.actionRequired && n.status === 'pending').length})
                          </button>
                          <button 
                            onClick={() => setNotificationSubTab('activity')}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${notificationSubTab === 'activity' ? 'bg-sky-400 text-appDark-deep' : 'bg-appDark-deep text-slate-400 hover:text-slate-200'}`}
                          >
                            Hoạt động
                          </button>
                        </div>

                        <div className="space-y-2.5 animate-fade-in opacity-90 max-h-[60vh] overflow-y-auto no-scrollbar pb-4">
                          {(() => {
                            const myNotifs = notifications.filter(n => (!n.recipientPhone || (currentUser && n.recipientPhone === currentUser.phone)));
                            let displayNotifs = [];
                            if (notificationSubTab === 'pending') {
                              displayNotifs = myNotifs.filter(n => n.actionRequired && n.status === 'pending');
                            } else {
                              displayNotifs = myNotifs.filter(n => !n.actionRequired || n.status === 'resolved');
                            }

                            if (displayNotifs.length === 0) {
                              return (
                                <div className="bg-appDark-deep border border-appDark-border/40 rounded-xl p-3 text-center text-[10px] text-slate-500 italic">
                                  Bạn không có thông báo nào ở mục này.
                                </div>
                              );
                            }

                            return displayNotifs.map(act => (
                                <div 
                                  key={act.id} 
                                  onClick={() => {
                                    if (!act.isRead) {
                                      setNotifications(prev => prev.map(n => n.id === act.id ? { ...n, isRead: true } : n));
                                    }
                                    if (act.type === 'suggestion') {
                                      const matchToOpen = matches.find(m => m.id === act.relatedMatchId);
                                      if (matchToOpen && act.suggestedMatches && act.suggestedMatches.length > 0) {
                                        setModalData({
                                          matchId: matchToOpen.id,
                                          match: matchToOpen,
                                          suggestedMatchesIds: act.suggestedMatches
                                        });
                                        setModalType('suggestion');
                                      } else {
                                        alert("Rất tiếc, danh sách gợi ý không còn khả dụng.");
                                      }
                                      return;
                                    }
                                    if (act.relatedMatchId) {
                                      const matchToOpen = matches.find(m => m.id === act.relatedMatchId);
                                      if (matchToOpen) {
                                        setSelectedMatch(matchToOpen);
                                      }
                                    }
                                  }}
                                  className={`flex flex-col gap-1.5 border rounded-xl p-3 transition-all cursor-pointer hover:border-slate-400 ${act.isRead ? 'bg-appDark-deep/40 border-appDark-border/40' : 'bg-appDark-deep border-sky-500/50 relative'}`}
                                >
                                  {!act.isRead && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse"></span>}
                                  
                                  <h5 className="text-white font-semibold text-xs pr-4">{act.title}</h5>
                                  {act.message && <p className="text-slate-300 text-[10px] leading-snug">{act.message}</p>}
                                  
                                  <p className="text-slate-500 text-[9px] mt-0.5">{new Date(act.createdAt).toLocaleString('vi-VN')}</p>
                                </div>
                            ));
                          })()}
                        </div>
                      </div>
                    )}

                  </div>
                )}

              </main>
            )}

            {renderBottomNav()}

            {/* --- MODAL DIALOGUES & SLIDE-UPS --- */}
            {selectedMatch && (
              <MatchDetailModal 
                match={matches.find(m => m.id === selectedMatch.id) || selectedMatch} 
                venues={venues}
                onClose={() => setSelectedMatch(null)} 
                currentUser={currentUser}
                teams={teams}
                onAction={(actionType, data) => {
                  const m = matches.find(m => m.id === selectedMatch.id) || selectedMatch;
                  triggerActionWithAuth(actionType, data || m);
                }}
                onRequestHandler={handleRequestAction}
                onCancelMatch={handleCancelMatch}
                  onEditMatch={handleEditMatch}
                onCancelRequest={handleCancelRequest}
                onAttendanceAction={handleAttendanceAction}
              />
            )}

            {modalType === 'join' && (
              <JoinFormModal 
                match={modalData} 
                currentUser={currentUser}
                onClose={closeModal} 
                onSubmit={submitJoinForm}
              />
            )}

            {modalType === 'receive' && (
              <ReceiveFormModal 
                match={modalData} 
                currentUser={currentUser}
                myManagedTeams={myManagedTeams}
                onClose={closeModal} 
                onSubmit={submitReceiveForm}
              />
            )}

            {modalType === 'create_slot' && (
              <CreateSlotFormModal 
                currentUser={currentUser}
                venue={modalData}
                onClose={closeModal} 
                onSubmit={submitCreateSlotForm}
              />
            )}

            {modalType === 'edit_slot' && (
              <EditSlotFormModal 
                slot={modalData}
                onClose={closeModal} 
                onSubmit={submitEditSlotForm}
              />
            )}

            {modalType === 'create_team' && (
              <CreateTeamFormModal 
                currentUser={currentUser}
                onClose={closeModal} 
                onSubmit={submitCreateTeamForm}
              />
            )}

            {modalType === 'create_match_from_slot' && (
              <CreateMatchFromSlotModal 
                slot={modalData}
                currentUser={currentUser}
                myManagedTeams={myManagedTeams}
                onClose={closeModal}
                onSubmit={submitCreateMatchFromSlot}
              />
            )}

            {modalType === 'invite' && (
              <InviteFriendlyModal 
                targetTeam={modalData}
                currentUser={currentUser}
                myManagedTeams={myManagedTeams}
                slots={slots}
                onClose={closeModal}
                onSubmit={submitInviteFriendly}
              />
            )}

            {modalType === 'create_missing_player' && (
              <CreateMissingPlayerFormModal 
                currentUser={currentUser}
                myManagedTeams={myManagedTeams}
                onClose={closeModal} 
                onSubmit={submitCreateMissingPlayerForm}
              />
            )}

            {modalType === 'change_name' && (
              <ChangeNameModal 
                currentUser={currentUser}
                onClose={closeModal} 
                onSubmit={submitChangeNameForm}
              />
            )}

            {modalType === 'rate_opponent' && (
              <RateOpponentFormModal
                data={modalData}
                onClose={closeModal}
                onSubmit={(rating, matchResult) => {
                  handleRateOpponent(modalData.matchId, modalData.targetTeamId, rating, matchResult);
                  closeModal();
                }}
              />
            )}

            {modalType === 'venue_settings' && (
              <VenueSettingsModal
                venue={venues.find(v => v.phone === currentUser.phone || v.owner_user_id === currentUser.id)}
                onClose={closeModal}
                onSubmit={(data) => {
                  setVenues(prev => prev.map(v => {
                    if (v.phone === currentUser.phone || v.owner_user_id === currentUser.id) {
                      return { ...v, name: data.name, phone: data.phone, capacities: data.capacities, combinations: data.combinations };
                    }
                    return v;
                  }));
                  alert("✅ Cập nhật thông tin & cài đặt sân thành công!");
                  closeModal();
                }}
              />
            )}

            {modalType === 'venue_registration' && (
              <VenueRegModal
                currentUser={currentUser}
                onClose={closeModal}
                onSubmit={submitVenueRegistration}
              />
            )}

            
            {modalType === 'owner_book_customer' && (
              <OwnerBookCustomerModal 
                currentUser={currentUser}
                venues={venues}
                fields={fields}
                onClose={closeModal} 
                onSubmit={submitOwnerBookCustomerForm}
              />
            )}

            {modalType === 'owner_create_match' && (
              <OwnerCreateMatchModal
                currentUser={currentUser}
                venues={venues}
                fields={fields}
                onClose={closeModal}
                onSubmit={submitOwnerCreateMatchForm}
              />
            )}

            {modalType === 'suggestion' && (
              <MatchSuggestionModal
                match={modalData.match}
                suggestedMatchesIds={modalData.suggestedMatchesIds}
                allMatches={matches}
                onClose={closeModal}
                onIgnore={handleIgnoreSuggestion}
                onInvite={handleInviteSuggestion}
              />
            )}

            {selectedBookingSlot && (
              <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/70 backdrop-blur-sm animate-fade-in p-0 sm:p-4">
                <div className="absolute inset-0 bg-transparent" onClick={() => setSelectedBookingSlot(null)}></div>
                <div className="w-full max-w-md bg-appDark-bg border-t sm:border border-appDark-border rounded-t-3xl sm:rounded-2xl p-6 space-y-4 relative z-10 animate-slide-up shadow-2xl overflow-hidden">
                  
                  {/* Native drag handle on mobile */}
                  <div className="w-12 h-1 bg-slate-700/60 rounded-full mx-auto mb-2 block sm:hidden"></div>
                  
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase text-neon-green tracking-wider">⚡ ĐẶT SÂN NHANH</h3>
                    <button onClick={() => setSelectedBookingSlot(null)} className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 font-bold hover:text-white transition-all flex items-center justify-center">✕</button>
                  </div>
                  
                  <div className="bg-appDark-deep p-4 rounded-xl border border-appDark-border/60 space-y-2.5 text-sm text-left relative overflow-hidden">
                    <div className="absolute top-2 right-2 text-[45px] text-slate-800/10 font-black pointer-events-none select-none">SOCCER</div>
                    
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">📍 Sân bóng</p>
                      <p className="font-extrabold text-white text-base leading-tight">{selectedBookingSlot.venueName}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-appDark-border/30">
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">⏱️ Khung giờ</p>
                        <p className="font-black text-neon-yellow text-xs">{selectedBookingSlot.startTime} - {selectedBookingSlot.endTime}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">🥅 Quy mô</p>
                        <p className="font-black text-sky-400 text-xs">{selectedBookingSlot.pitchType}</p>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-appDark-border/30 flex justify-between items-center">
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">💰 Tổng tiền sân</p>
                        <p className="font-black text-neon-green text-sm">{(selectedBookingSlot.price || 0).toLocaleString('vi-VN')} VNĐ</p>
                      </div>
                      <span className="text-[9px] font-black uppercase text-neon-green bg-neon-green/10 border border-neon-green/30 px-2 py-0.5 rounded">
                        ⚡ Realtime
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <button 
                      onClick={() => {
                        const slotToBook = selectedBookingSlot;
                        setSelectedBookingSlot(null);
                        triggerActionWithAuth('create_match_from_slot', slotToBook);
                      }}
                      className="w-full py-3.5 bg-gradient-to-r from-neon-green to-emerald-500 text-appDark-deep font-black uppercase text-xs rounded-xl shadow-md neon-glow-green hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                    >
                      🤝 Ghép kèo tìm đối thủ (Public)
                    </button>
                    
                    <button 
                      onClick={() => {
                        if (!currentUser) {
                          setCurrentTab("toi");
                          setSelectedBookingSlot(null);
                          alert("Vui lòng nhập Số điện thoại của bạn ở tab 'Tôi' trước khi thực hiện thao tác này.");
                          return;
                        }

                        const defaultTeam = myManagedTeams[0]?.teamName || currentUser.name || "Đội nội bộ";
                        const newMatch = {
                          id: 'm_internal_' + Date.now(),
                          created_at: new Date().toISOString(),
                          team_id: myManagedTeams[0]?.id || 'internal',
                          teamName: defaultTeam,
                          status: "confirmed",
                          time: selectedBookingSlot.timeSlot || selectedBookingSlot.startTime + ' - ' + selectedBookingSlot.endTime,
                          rawTime: selectedBookingSlot.rawTime || '90 phút',
                          venue: selectedBookingSlot.venueName,
                          district: selectedBookingSlot.district || 'Thủ Đức',
                          pitchType: selectedBookingSlot.pitchType,
                          price: selectedBookingSlot.price,
                          level: "Nội bộ",
                          notes: `Đá tập nội bộ. Tự chia tiền sân.`,
                          adminContact: currentUser.phone,
                          venue_slot_id: selectedBookingSlot.id,
                          joinedPlayers: [],
                          requests: [],
                        };

                        setMatches(prev => [newMatch, ...prev]);

                        setSlots(prevSlots => {
                          const updated = prevSlots.map(s => {
                            if (selectedBookingSlot.subSlots && selectedBookingSlot.subSlots.includes(s.id)) {
                              return {
                                ...s,
                                status: "booked",
                                customerPhone: currentUser.phone,
                                customerName: currentUser.name || defaultTeam,
                                bookingNotes: "Đá nội bộ (Đặt nhanh ⚡)",
                                notes: `Đã đặt bởi: ${defaultTeam} (${currentUser.phone})`
                              };
                            }
                            return s;
                          });

                          const consolidatedSlot = {
                            ...selectedBookingSlot,
                            status: "booked",
                            customerPhone: currentUser.phone,
                            customerName: currentUser.name || defaultTeam,
                            bookingNotes: "Đá nội bộ (Đặt nhanh ⚡)",
                            notes: `Đã đặt bởi: ${defaultTeam} (${currentUser.phone})`
                          };

                          return [consolidatedSlot, ...updated];
                        });

                        // Notify venue owner
                        const targetVenue = venues.find(v => v.name === selectedBookingSlot.venueName);
                        if (targetVenue) {
                          const ownerPhone = targetVenue.phone || targetVenue.owner_user_id || "";
                          setNotifications(prev => [
                            {
                              id: 'notif_booking_quick_' + Date.now(),
                              type: 'booking_created',
                              recipientPhone: ownerPhone,
                              title: `⚡ Khách đặt sân mới (Đá nội bộ)`,
                              message: `Sân <strong>${selectedBookingSlot.venueName}</strong> (${selectedBookingSlot.pitchType}) có lượt đặt sân mới cho khung giờ <strong>${selectedBookingSlot.startTime} - ${selectedBookingSlot.endTime}</strong> ngày ${selectedBookingSlot.rawTime || selectedBookingSlot.date || 'hôm nay'}. Đã chốt bởi <strong>${currentUser.name || defaultTeam}</strong> (${currentUser.phone}).`,
                              createdAt: Date.now(),
                              isRead: false,
                              actionRequired: false,
                              status: 'resolved'
                            },
                            ...prev
                          ]);
                        }

                        const slotTime = selectedBookingSlot.startTime;
                        const slotEndTime = selectedBookingSlot.endTime;
                        const slotVenue = selectedBookingSlot.venueName;

                        setSelectedBookingSlot(null);
                        alert(`✅ Đặt sân thành công! Khung giờ lúc ${slotTime} - ${slotEndTime} tại ${slotVenue} hiện đã được chốt riêng cho bạn. Hệ thống sẽ tự động đưa bạn về trang Quản lý Booking của Chủ Sân để xem.`);
                        
                        setActiveRoleMode("chủ sân");
                        setCurrentTab("owner_booking");
                      }}
                      className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black uppercase text-xs rounded-xl shadow-md neon-glow-blue hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                    >
                      👥 Đá nội bộ (Chốt nhanh ⚡)
                    </button>
                  </div>
                  
                  <p className="text-[10px] text-slate-500 text-center leading-relaxed max-w-[90%] mx-auto">
                    * Bấm <strong>Ghép kèo tìm đối</strong> nếu muốn hệ thống tìm đối tác đá chung. Bấm <strong>Đá nội bộ</strong> để chốt lịch tức thì cho đội của bạn.
                  </p>
                </div>
              </div>
            )}

            {fullScheduleVenue && (
              <VenueScheduleModal
                venue={fullScheduleVenue}
                allSlots={bookingTimeSlots}
                matches={matches}
                onClose={() => setFullScheduleVenue(null)}
                onSelectSlot={(slot) => setSelectedBookingSlot(slot)}
                triggerActionWithAuth={triggerActionWithAuth}
                bookingPitchType={bookingPitchType}
                bookingTime={bookingTime}
                bookingDate={bookingDate}
                bookingCustomDate={bookingCustomDate}
              />
            )}

            {viewHoldingVenue && (
              <VenueHoldingMatchesModal
                venue={viewHoldingVenue}
                matches={matches}
                slots={slots}
                onClose={() => setViewHoldingVenue(null)}
                triggerActionWithAuth={triggerActionWithAuth}
              />
            )}

            {showGoogleModal && (
              <GoogleMockAuthModal
                onClose={() => setShowGoogleModal(false)}
                onLoginSuccess={handleGoogleLoginSuccess}
              />
            )}

          </div>
        </div>
      );
    }

    // --- SUB-COMPONENTS & MODALS ---

    function GoogleMockAuthModal({ onClose, onLoginSuccess }) {
      const mockAccounts = [
        { name: "Hùng Phủi Nguyễn", email: "hung.nguyen.phui@gmail.com", avatar: "⚽", phone: "0989123456" },
        { name: "Tuấn GK Trần", email: "tuan.tran.gk@gmail.com", avatar: "🧤", phone: "0977223344" },
        { name: "Khánh Messi", email: "khanh.messi99@gmail.com", avatar: "🏃", phone: "0966556677" },
      ];

      const [step, setStep] = useState(1); // 1: Select, 2: Loading, 3: Custom Login, 4: Enter Phone
      const [customEmail, setCustomEmail] = useState("");
      const [customName, setCustomName] = useState("");
      const [selectedAcc, setSelectedAcc] = useState(null);
      const [phoneInput, setPhoneInput] = useState("");

      const handleSelectAccount = (acc) => {
        setSelectedAcc(acc);
        setStep(2);
        setTimeout(() => {
          if (acc.phone) {
            onLoginSuccess(acc);
          } else {
            setStep(4);
          }
        }, 1200);
      };

      const handleCustomSubmit = (e) => {
        e.preventDefault();
        if (!customEmail || !customName) return;
        const newAcc = {
          name: customName,
          email: customEmail,
          avatar: "⚽",
          phone: ""
        };
        setSelectedAcc(newAcc);
        setStep(2);
        setTimeout(() => {
          setStep(4);
        }, 1200);
      };

      const handlePhoneSubmit = (e) => {
        e.preventDefault();
        if (!phoneInput || phoneInput.length !== 10) {
          alert("Vui lòng nhập số điện thoại gồm 10 chữ số!");
          return;
        }
        const finalizedAcc = { ...selectedAcc, phone: phoneInput };
        onLoginSuccess(finalizedAcc);
      };

      return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-appDark-deep/80 backdrop-blur-md animate-fade-in text-left">
          <div className="bg-white text-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-100 flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">accounts.google.com</span>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center font-bold text-sm transition-all"
              >
                ✕
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 overflow-y-auto no-scrollbar min-h-[320px] flex flex-col justify-center">
              
              {/* STEP 1: Select Account */}
              {step === 1 && (
                <div className="space-y-5 animate-fade-in w-full">
                  <div className="text-center space-y-1.5 mb-2">
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">Chọn một tài khoản</h3>
                    <p className="text-xs text-slate-500">để tiếp tục liên kết với ứng dụng <strong className="text-emerald-600">Kèo Phủi</strong></p>
                  </div>

                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                    {mockAccounts.map((acc, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelectAccount(acc)}
                        className="w-full flex items-center gap-3.5 p-3 rounded-2xl hover:bg-slate-50 active:scale-[0.98] transition-all border border-slate-100 text-left hover:border-slate-200"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-50 to-emerald-100 flex items-center justify-center text-lg font-bold text-slate-700 shadow-sm border border-emerald-200/50">
                          {acc.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">{acc.name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{acc.email}</p>
                        </div>
                        <div className="text-[10px] bg-slate-100 text-slate-600 font-extrabold px-2 py-0.5 rounded-full uppercase border border-slate-200/40">
                          Sẵn sàng
                        </div>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setStep(3)}
                    className="w-full py-3 rounded-2xl hover:bg-slate-50 text-slate-600 hover:text-slate-800 text-xs font-bold transition-all border border-dashed border-slate-300 flex items-center justify-center gap-1.5"
                  >
                    👤 Sử dụng một tài khoản khác
                  </button>
                </div>
              )}

              {/* STEP 2: Loading Authenticating */}
              {step === 2 && (
                <div className="text-center space-y-5 animate-fade-in py-8">
                  <div className="relative w-16 h-16 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-red-500 border-b-yellow-500 border-l-green-500 animate-spin"></div>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-800">Đang đăng nhập bằng Google...</h4>
                    <p className="text-xs text-slate-400">accounts.google.com đang kiểm tra quyền truy cập</p>
                  </div>
                </div>
              )}

              {/* STEP 3: Custom Login Account */}
              {step === 3 && (
                <form onSubmit={handleCustomSubmit} className="space-y-4 animate-fade-in w-full">
                  <div className="text-center space-y-1 mb-2">
                    <h3 className="text-lg font-black text-slate-800">Đăng nhập tài khoản Google khác</h3>
                    <p className="text-xs text-slate-500">Nhập thông tin mock để kiểm tra luồng đăng nhập</p>
                  </div>

                  <div className="space-y-3.5 text-left">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Địa chỉ Email</label>
                      <input
                        type="email"
                        required
                        placeholder="VD: name@gmail.com"
                        value={customEmail}
                        onChange={(e) => setCustomEmail(e.target.value)}
                        className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Họ & Tên của bạn</label>
                      <input
                        type="text"
                        required
                        placeholder="VD: Nguyễn Văn A"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-2.5 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                    >
                      Quay lại
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md"
                    >
                      Tiếp tục
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 4: Link/Verify Phone Number */}
              {step === 4 && (
                <form onSubmit={handlePhoneSubmit} className="space-y-4 animate-fade-in w-full text-slate-700">
                  <div className="text-center space-y-1.5 mb-2">
                    <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-lg mx-auto mb-2">
                      🔐
                    </div>
                    <h3 className="text-base font-extrabold text-slate-800">Liên kết số điện thoại</h3>
                    <p className="text-xs text-slate-500">
                      Hệ thống Kèo Phủi yêu cầu một số điện thoại để các đội bóng có thể liên hệ giao lưu, bắt đối.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-base">
                      👤
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-xs font-black text-slate-700 truncate">{selectedAcc?.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{selectedAcc?.email}</p>
                    </div>
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Số điện thoại liên kết</label>
                    <input
                      type="tel"
                      required
                      pattern="[0-9]{10}"
                      placeholder="VD: 0989999999"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-center tracking-widest"
                    />
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-2.5 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md"
                    >
                      Hoàn tất liên kết
                    </button>
                  </div>
                </form>
              )}

            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 text-center flex justify-between items-center text-[10px] text-slate-400">
              <span>Đăng nhập an toàn bằng Google API</span>
              <div className="flex gap-2.5">
                <a href="#privacy" className="hover:underline">Bảo mật</a>
                <a href="#terms" className="hover:underline">Điều khoản</a>
              </div>
            </div>

          </div>
        </div>
      );
    }

    function VenueHoldingMatchesModal({ venue, matches, slots, onClose, triggerActionWithAuth }) {
      const cleanVenueName = (v) => (v || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
      const cleanVName = cleanVenueName(venue.name);
      
      const venueMatches = matches.filter(m => {
        const isWaiting = m.status === 'Cần đối' || m.status === 'waiting_opponent' || m.status === 'pending_confirmation' || m.status === 'Đang chờ xác nhận';
        if (!isWaiting) return false;
        
        const mVenueName = cleanVenueName(m.venue);
        const isVenueMatch = mVenueName === cleanVName || m.venueId === venue.id || (m.venue_slot_id && slots.some(s => (s.id === m.venue_slot_id || s.slotId === m.venue_slot_id) && (s.venueId === venue.id || cleanVenueName(s.venueName) === cleanVName)));
        return isVenueMatch;
      });

      return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-appDark-deep/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-appDark-card border border-appDark-border rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[85vh] animate-scale-up">
            
            {/* Header */}
            <div className="p-5 pb-4 border-b border-appDark-border/40 relative flex justify-between items-center bg-gradient-to-r from-emerald-950/20 to-slate-900">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🏟️</span>
                <div className="text-left">
                  <h3 className="font-black text-base text-white tracking-tight">{venue.name}</h3>
                  <p className="text-[10px] font-extrabold text-neon-yellow uppercase tracking-wider">Kèo Đang Chờ Đối ({venueMatches.length})</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-appDark-deep border border-appDark-border/60 hover:border-slate-500 text-white flex items-center justify-center font-bold text-sm transition-all"
              >
                ✕
              </button>
            </div>

            {/* Content list */}
            <div className="p-5 overflow-y-auto space-y-4 max-h-[60vh] no-scrollbar">
              {venueMatches.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <span className="text-4xl block">⚽</span>
                  <p className="text-xs text-slate-400 font-bold max-w-[80%] mx-auto leading-relaxed">
                    Hiện tại chưa có kèo đấu nào đang chờ đối tác tại cụm sân này. Hãy click <span className="text-sky-400">"Xem lịch đầy đủ"</span> để tự mình thuê sân và tạo kèo mới nhé!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {venueMatches.map(match => (
                    <div 
                      key={match.id}
                      className="bg-appDark-deep/50 border border-appDark-border/60 hover:border-slate-600 rounded-2xl p-4 transition-all relative overflow-hidden group text-left"
                    >
                      {/* Left highlight strip */}
                      <div className="absolute left-0 inset-y-0 w-1 bg-gradient-to-b from-neon-yellow to-amber-500"></div>

                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div>
                          <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5 truncate max-w-[280px]">
                            <span>{match.teamName}</span>
                            <span className="text-xs text-slate-400 font-extrabold shrink-0">· {match.pitchType}</span>
                          </h4>
                          <div className="flex items-center gap-1.5 text-[10px] text-neon-yellow font-black mt-1 bg-neon-yellow/5 px-2.5 py-0.5 rounded-md border border-neon-yellow/10 w-fit">
                            <span>📅</span>
                            <span>{match.rawTime || match.date || "Hôm nay"}</span>
                            <span className="text-neon-yellow/30 font-light">•</span>
                            <span>{match.time}</span>
                          </div>
                        </div>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                          match.status === 'pending_confirmation' || match.status === 'Đang chờ xác nhận'
                            ? "bg-purple-500/10 border border-purple-500/30 text-purple-400"
                            : "bg-neon-yellow/10 border border-neon-yellow/30 text-neon-yellow"
                        }`}>
                          {match.status === 'pending_confirmation' || match.status === 'Đang chờ xác nhận' ? "Đang chờ duyệt" : "Đang chờ đối"}
                        </span>
                      </div>

                      <div className="bg-appDark-card/50 border border-appDark-border/30 rounded-xl p-2.5 space-y-1.5 text-[11px] text-slate-300 font-bold mb-3">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Trình độ:</span>
                          <span className="text-white">{match.level}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Tiền sân (tạm tính):</span>
                          <span className="text-neon-green font-extrabold">{match.price ? match.price.toLocaleString('vi-VN') + 'đ' : 'Chưa cập nhật'}</span>
                        </div>
                        {match.notes && (
                          <div className="border-t border-appDark-border/30 pt-1.5 mt-1">
                            <span className="text-slate-400 block mb-0.5">Lời nhắn:</span>
                            <p className="text-[10px] text-slate-300 font-medium italic leading-relaxed">"{match.notes}"</p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            onClose();
                            triggerActionWithAuth('receive', match);
                          }}
                          className="flex-1 py-2.5 bg-gradient-to-r from-neon-yellow to-amber-500 hover:from-neon-yellow/90 hover:to-amber-500/90 text-appDark-deep text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 text-center"
                        >
                          🤝 Nhận kèo giao hữu
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-appDark-border/40 bg-appDark-deep/40 text-center shrink-0">
              <button 
                onClick={onClose}
                className="px-6 py-2 rounded-xl bg-appDark-deep border border-appDark-border text-white text-xs font-black uppercase tracking-wider hover:border-slate-500 transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      );
    }

    function VenueScheduleModal({ 
      venue, 
      allSlots, 
      matches, 
      onClose, 
      onSelectSlot, 
      triggerActionWithAuth,
      bookingPitchType,
      bookingTime,
      bookingDate,
      bookingCustomDate
    }) {
      const venueAllSlots = React.useMemo(() => {
        return allSlots.filter(s => {
          // Normalize comparison for safety
          const cleanSName = (s.venueName || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/sân\s+/gi, "").replace(/[^a-z0-9]/g, "");
          const cleanVName = (venue.name || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/sân\s+/gi, "").replace(/[^a-z0-9]/g, "");
          
          if (s.venueId !== venue.id && cleanSName !== cleanVName) return false;
          return true;
        });
      }, [allSlots, venue]);

      // Group slots by date
      const slotsByDate = React.useMemo(() => {
        const groups = {};
        venueAllSlots.forEach(slot => {
          const d = slot.rawTime || slot.rawDate || "Hôm nay";
          if (!groups[d]) groups[d] = [];
          groups[d].push(slot);
        });
        // Sort slots within each group by start time
        Object.keys(groups).forEach(d => {
          groups[d].sort((a, b) => a.startTime.localeCompare(b.startTime));
        });
        return groups;
      }, [venueAllSlots]);

      const sortedDates = React.useMemo(() => {
        return Object.keys(slotsByDate).sort((a, b) => {
          const slotA = slotsByDate[a][0];
          const slotB = slotsByDate[b][0];
          if (!slotA || !slotB) return 0;
          
          const [dayA, monthA, yearA] = slotA.date.split('/').map(Number);
          const [dayB, monthB, yearB] = slotB.date.split('/').map(Number);
          
          const dateA = new Date(yearA, monthA - 1, dayA);
          const dateB = new Date(yearB, monthB - 1, dayB);
          
          return dateA - dateB;
        });
      }, [slotsByDate]);

      // Find the best initial selected date based on user's active filters
      const initialDate = React.useMemo(() => {
        if (bookingDate === "Hôm nay" && sortedDates.includes("Hôm nay")) {
          return "Hôm nay";
        }
        if (bookingDate === "Ngày mai" && sortedDates.includes("Ngày mai")) {
          return "Ngày mai";
        }
        if (bookingDate === "Chọn ngày cụ thể" && bookingCustomDate) {
          const todayStr = new Date().toISOString().split('T')[0];
          const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
          const [yr, mn, dy] = bookingCustomDate.split("-");
          const targetDayMonth = `${parseInt(dy)}/${parseInt(mn)}`; // e.g. "27/5"
          
          const matchingDate = sortedDates.find(d => {
            if (d === "Hôm nay" && bookingCustomDate === todayStr) return true;
            if (d === "Ngày mai" && bookingCustomDate === tomorrowStr) return true;
            return d.includes(targetDayMonth);
          });
          if (matchingDate) return matchingDate;
        }
        return sortedDates[0] || "Hôm nay";
      }, [bookingDate, bookingCustomDate, sortedDates]);

      const [selectedDate, setSelectedDate] = React.useState(initialDate);

      React.useEffect(() => {
        if (initialDate && sortedDates.includes(initialDate)) {
          setSelectedDate(initialDate);
        }
      }, [initialDate, sortedDates]);

      const dailySlots = slotsByDate[selectedDate] || [];

      // Sort order: holding first, available second, booked last
      const sortedDailySlots = React.useMemo(() => {
        const score = { 'holding': 1, 'available': 2, 'booked': 3 };
        return [...dailySlots].sort((a, b) => score[a.status] - score[b.status]);
      }, [dailySlots]);

      return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/80 backdrop-blur-md p-0 sm:p-4">
          <div className="absolute inset-0 bg-transparent" onClick={onClose}></div>
          <div className="w-full max-w-md bg-appDark-bg border-t sm:border border-appDark-border rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-slide-up relative z-10">
            
            {/* Mobile Drag Indicator */}
            <div className="w-12 h-1 bg-slate-700/60 rounded-full mx-auto my-3 shrink-0 block sm:hidden"></div>

            {/* Compact Header */}
            <div className="px-5 pb-3 flex items-start justify-between border-b border-appDark-border/40 shrink-0">
              <div className="text-left space-y-1">
                <span className="text-[9px] font-black text-neon-green tracking-widest uppercase">📅 HỆ THỐNG LỊCH TRÌNH REALTIME</span>
                <h3 className="font-extrabold text-base text-white leading-tight">{venue.name}</h3>
                <p className="text-[10.5px] text-slate-400 flex items-center gap-1.5 flex-wrap">
                  <span>⭐ {venue.rating || "4.8"}</span>
                  <span className="text-slate-600">•</span>
                  <span>📍 {venue.id === 'v_casau' ? '1.2 km' : venue.id === 'v_s1' ? '0.8 km' : '1.5 km'}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-neon-green font-bold">{venue.district}</span>
                </p>
              </div>
              <button type="button" onClick={onClose} className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white font-black transition-all flex items-center justify-center shrink-0">✕</button>
            </div>

            {/* Date Selector (Horizontal Tags) */}
            {sortedDates.length > 0 ? (
              <div className="flex gap-2 px-5 py-3 bg-appDark-deep/40 overflow-x-auto border-b border-appDark-border/60 shrink-0 no-scrollbar">
                {sortedDates.map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelectedDate(d)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                      selectedDate === d
                        ? 'bg-gradient-to-r from-neon-green to-emerald-500 text-appDark-deep shadow-md'
                        : 'bg-appDark-card border border-appDark-border text-slate-300 hover:text-white'
                    }`}
                  >
                    {d === 'Hôm nay' ? '📆 Hôm nay' : d === 'Ngày mai' ? '📆 Ngày mai' : `📆 ${d}`}
                  </button>
                ))}
              </div>
            ) : null}

            {/* High Density CGV Slots Inventory List */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2 no-scrollbar">
              {sortedDailySlots.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  Không có lịch hoạt động nào cho ngày đã chọn.
                </div>
              ) : (
                <div className="space-y-2">
                  {sortedDailySlots.map(slot => {
                    const assocMatch = matches.find(m => m.venue_slot_id === slot.slotId || m.venue_slot_id === slot.id);
                    const getCleanSubName = (name) => {
                      if (!name) return '';
                      return name.replace(/^(sân|Sân|SÂN)\s*/i, '').trim();
                    };
                    const displayName = slot.fieldName 
                      ? `${getCleanSubName(slot.fieldName)} · ${slot.pitchType}` 
                      : 'Sân con';

                    if (slot.status === 'booked') {
                      return (
                        <div 
                          key={slot.id}
                          className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-slate-800/10 border border-slate-700/5 opacity-25 text-xs select-none cursor-not-allowed"
                        >
                          <div className="flex items-center gap-2 text-left truncate max-w-[80%]">
                            <span className="text-red-500 text-[10px] shrink-0">🔴</span>
                            <span className="font-bold text-slate-500 text-[11px] shrink-0">{slot.startTime} - {slot.endTime}</span>
                            <span className="text-slate-700 shrink-0">|</span>
                            <span className="text-slate-500 truncate font-semibold">{displayName}</span>
                          </div>
                          <span className="text-[9px] font-black text-slate-600 italic uppercase">🔒 Đã kín</span>
                        </div>
                      );
                    }

                    if (slot.status === 'holding' || slot.status === 'on_hold') {
                      return (
                        <div 
                          key={slot.id}
                          onClick={() => {
                            if (assocMatch) {
                              onClose();
                              triggerActionWithAuth('receive', assocMatch);
                            } else {
                              alert("⚠️ Kèo bóng đá cho slot này hiện không khả dụng!");
                            }
                          }}
                          className="flex items-center justify-between py-2 px-3 rounded-xl bg-neon-yellow/5 border border-neon-yellow/20 hover:bg-neon-yellow/10 transition-all cursor-pointer active:scale-[0.99] text-xs"
                        >
                          <div className="flex items-center gap-2 text-left truncate max-w-[75%]">
                            <span className="text-neon-yellow text-[10px] shrink-0">🟡</span>
                            <span className="font-extrabold text-neon-yellow text-[11px] shrink-0">{slot.startTime} - {slot.endTime}</span>
                            <span className="text-slate-600 shrink-0">|</span>
                            <span className="text-slate-200 font-black truncate">{assocMatch?.teamName || 'FC Gà Rừng'} chờ đối</span>
                            <span className="animate-pulse text-[8px] font-black text-neon-yellow bg-neon-yellow/10 border border-neon-yellow/20 px-1 py-0.5 rounded uppercase shrink-0 leading-none">HOT</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[9px] font-black uppercase text-neon-yellow bg-neon-yellow/10 border border-neon-yellow/30 px-1.5 py-0.5 rounded leading-none">Ghép</span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div 
                        key={slot.id}
                        onClick={() => {
                          onClose();
                          onSelectSlot(slot);
                        }}
                        className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-800/40 border border-appDark-border hover:border-slate-600 transition-all cursor-pointer active:scale-[0.99] text-xs"
                      >
                        <div className="flex items-center gap-2 text-left truncate max-w-[75%]">
                          <span className="text-neon-green text-[10px] shrink-0">🟢</span>
                          <span className="font-extrabold text-white text-[11px] shrink-0">{slot.startTime} - {slot.endTime}</span>
                          <span className="text-slate-600 shrink-0">|</span>
                          <span className="text-slate-300 truncate font-semibold">{displayName}</span>
                          {slot.isSale && (
                            <span className="animate-pulse text-[8.5px] font-black text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded leading-none shrink-0">
                              🔥 SALE {slot.discountPercent}%
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {slot.isSale ? (
                            <div className="flex flex-col items-end">
                              <span className="text-slate-500 line-through text-[9px] font-bold">{(slot.originalPrice || 0).toLocaleString('vi-VN')}đ</span>
                              <span className="text-amber-400 font-black text-[11px]">{(slot.price || 0).toLocaleString('vi-VN')}đ</span>
                            </div>
                          ) : (
                            <span className="text-neon-green font-black text-[11px]">{(slot.price || 0).toLocaleString('vi-VN')}đ</span>
                          )}
                          <span className="text-[9px] font-black uppercase text-neon-green bg-neon-green/10 border border-neon-green/30 px-1.5 py-0.5 rounded leading-none">Đặt</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="bg-appDark-deep p-3.5 border-t border-appDark-border/40 text-center shrink-0">
              <p className="text-[9.5px] text-slate-500 font-bold uppercase tracking-wider">
                ⚡ Cập nhật thời gian thực · Click vào slot để thực hiện
              </p>
            </div>
          </div>
        </div>
      );
    }

    // 1. MATCH CARD COMPONENT
    function MatchCard({ match, onSelect, onAction }) {
      const getBadgeClass = (status, isFull) => {
        if (status === 'Thiếu người' && isFull) {
          return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
        switch(status) {
          case 'Cần đối':
          case 'waiting_opponent': 
            return 'bg-neon-green/20 text-neon-green border-neon-green/30';
          case 'Thiếu người': 
            return 'bg-neon-yellow/20 text-neon-yellow border-neon-yellow/30';
          case 'Đang chờ xác nhận':
          case 'pending_confirmation': 
            return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
          case 'confirmed':
            return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
          case 'completed':
            return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
          case 'expired':
            return 'bg-slate-500/40 text-slate-300 border-slate-500/50';
          default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
      };

      const getFriendlyStatusText = (status, isFull) => {
        if (status === 'Thiếu người' && isFull) return 'Đã đủ người';
        switch(status) {
          case 'Cần đối':
          case 'waiting_opponent': return 'Cần đối';
          case 'Đang chờ xác nhận':
          case 'pending_confirmation': return 'Có đối đăng ký';
          case 'Đã chốt kèo':
          case 'confirmed': return 'Đã chốt kèo';
          case 'completed': return 'Đã hoàn thành';
          case 'expired': return 'Hết hạn';
          default: return status;
        }
      };

      const getLevelBadgeClass = (level) => {
        switch(level) {
          case 'Mạnh': return 'text-red-400 bg-red-400/10 border border-red-500/20';
          case 'Khá': return 'text-orange-400 bg-orange-400/10 border border-orange-500/20';
          case 'Trung bình': return 'text-emerald-400 bg-emerald-400/10 border border-emerald-500/20';
          default: return 'text-sky-400 bg-sky-400/10 border border-sky-500/20';
        }
      };

      const getCategoryBadgeClass = (cat) => {
        if (!cat) return "";
        if (cat === "Kèo Nữ") {
          return "text-pink-400 bg-pink-400/10 border border-pink-500/20 shadow-[0_0_8px_rgba(244,63,94,0.1)]";
        }
        if (cat === "Lão Tướng") {
          return "text-orange-400 bg-orange-400/10 border border-orange-500/20 shadow-[0_0_8px_rgba(249,115,22,0.1)]";
        }
        return "text-sky-400 bg-sky-500/10 border border-sky-500/25";
      };

      const maxCount = match.needPlayersCount !== undefined ? match.needPlayersCount : (match.missingCount !== undefined ? match.missingCount : 2);
      const acceptedCount = (match.requests || []).filter(r => r.status === 'accepted').reduce((sum, r) => sum + 1 + (parseInt(r.companions) || 0), 0);
      const slotsLeft = Math.max(0, maxCount - acceptedCount);
      const isFull = slotsLeft === 0;

      const isSlotFriendlyMatch = match.status === 'waiting_opponent' || match.status === 'pending_confirmation' || match.status === 'confirmed' || match.status === 'completed';

      const endTimeMs = parseMatchEndTimeMs(match.time, match.rawTime || match.rawDate) || parseMatchStartTime(match.time, match.rawTime);
      const isOngoingOrPast = endTimeMs && (Date.now() >= endTimeMs);
      
      const isClosedMatch = match.status === 'confirmed' || match.status === 'completed' || match.status === 'Đã đủ người' || isOngoingOrPast;
      const isExpired = match.status === 'expired';

      return (
        <div 
          onClick={isExpired ? undefined : onSelect}
          className={`bg-appDark-card border border-appDark-border rounded-xl p-3 px-3.5 space-y-2 transition-all relative overflow-hidden shadow-sm ${
            isExpired ? 'opacity-40 grayscale pointer-events-none' : 'cursor-pointer hover:border-slate-500 hover:scale-[1.01] active:scale-[0.99] group'
          }`}
        >
          {/* Accent border highlight */}
          <div className="absolute left-0 inset-y-0 w-1 bg-gradient-to-b from-neon-green to-emerald-500 opacity-70 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-white tracking-tight flex items-center gap-1 truncate max-w-[250px]">
              <span className="truncate">{match.teamName}</span>
              <span className="text-slate-300 font-extrabold shrink-0"> - {match.pitchType}</span>
            </h3>
            <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border shrink-0 ${getBadgeClass(match.status, isFull)}`}>
              {getFriendlyStatusText(match.status, isFull)}
            </span>
          </div>

          <div className="text-[11px] text-slate-300 space-y-1">
            <p className="flex items-center gap-1.5 truncate">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5 text-neon-yellow shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-neon-yellow font-black">{formatTimeDisplay(match.time)}</span>
              <span className="text-slate-500">•</span>
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((match.address || match.venue) + ' ' + (match.district || ''))}`}
                target="_blank" 
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="font-semibold text-sky-400 hover:underline flex items-center gap-1 truncate"
                title="Xem trên Google Maps"
              >
                <span className="truncate">{match.venue}</span>
                <span className="text-slate-400 text-[10px] no-underline shrink-0">({match.district}) 📍</span>
              </a>
            </p>
            
            {match.status === "Thiếu người" && (
              <p className="text-[10px] text-neon-yellow font-bold flex items-center gap-1">
                <span>🏃‍♂️ Cần tuyển:</span>
                <span className={`px-1.5 py-0.2 rounded text-[9px] border font-black ${
                  isFull 
                    ? 'bg-slate-500/20 border-slate-500/30 text-slate-400' 
                    : 'bg-neon-yellow/20 border-neon-yellow/30 text-neon-yellow'
                }`}>
                  {isFull ? 'Đủ' : `${acceptedCount}/${maxCount}`} người
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-200 font-semibold">{match.position || match.positionsNeeded || "Cầu đá"}</span>
              </p>
            )}

            {isSlotFriendlyMatch && (
              <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <span>🏟️ Trạng thái slot:</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] border border-emerald-500/25 bg-emerald-500/10 text-emerald-400 font-black uppercase">
                  {match.status === 'confirmed' ? 'Đã khoá sân' : 'Đang giữ slot'}
                </span>
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-1.5 border-t border-appDark-border/30">
            <div className="flex items-center gap-1.5">
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${getLevelBadgeClass(match.level)}`}>
                {match.level}
              </span>
              {match.category && (
                <span className={`text-[9.5px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide ${getCategoryBadgeClass(match.category)}`}>
                  {match.category}
                </span>
              )}
            </div>

            {(match.status === "Cần đối" || match.status === "waiting_opponent" || match.status === "pending_confirmation") && (
              <button 
                onClick={(e) => onAction('receive', e)}
                className="text-[10px] font-black uppercase bg-gradient-to-r from-neon-green to-emerald-500 text-appDark-deep px-3 py-1 rounded-lg hover:scale-105 active:scale-95 transition-all shadow-sm shrink-0"
              >
                Nhận kèo
              </button>
            )}

            {match.status === "Thiếu người" && (
              <button 
                onClick={(e) => onAction('join', e)}
                className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg hover:scale-105 active:scale-95 transition-all shadow-sm shrink-0 ${
                  isFull 
                    ? 'bg-appDark-deep border border-neon-yellow/35 text-neon-yellow'
                    : 'bg-gradient-to-r from-neon-yellow to-amber-400 text-appDark-deep'
                }`}
              >
                {isFull ? 'Dự bị' : 'Tham gia'}
              </button>
            )}

            {match.status === "Đang chờ xác nhận" && (
              <span className="text-[9px] font-semibold text-purple-400 italic">Đang chờ xác nhận...</span>
            )}
          </div>
        </div>
      );
    }

    // 2. PLAYER NEEDED (THIẾU NGƯỜI) CARD
    function PlayerNeededCard({ match, onSelect, onJoin }) {
      const getLevelBadgeClass = (level) => {
        switch(level) {
          case 'Mạnh': return 'text-red-400 bg-red-400/10 border border-red-500/20';
          case 'Khá': return 'text-orange-400 bg-orange-400/10 border border-orange-500/20';
          case 'Trung bình': return 'text-emerald-400 bg-emerald-400/10 border border-emerald-500/20';
          default: return 'text-sky-400 bg-sky-400/10 border border-sky-500/20';
        }
      };

      const getCategoryBadgeClass = (cat) => {
        if (!cat) return "";
        if (cat === "Kèo Nữ") {
          return "text-pink-400 bg-pink-400/10 border border-pink-500/20 shadow-[0_0_8px_rgba(244,63,94,0.1)]";
        }
        if (cat === "Lão Tướng") {
          return "text-orange-400 bg-orange-400/10 border border-orange-500/20 shadow-[0_0_8px_rgba(249,115,22,0.1)]";
        }
        return "text-sky-400 bg-sky-500/10 border border-sky-500/25";
      };

      const maxCount = match.needPlayersCount !== undefined ? match.needPlayersCount : (match.missingCount !== undefined ? match.missingCount : 2);
      const acceptedCount = (match.requests || []).filter(r => r.status === 'accepted').reduce((sum, r) => sum + 1 + (parseInt(r.companions) || 0), 0);
      const slotsLeft = Math.max(0, maxCount - acceptedCount);
      const isFull = slotsLeft === 0;

      const isClosedMatch = match.status === 'confirmed' || match.status === 'completed' || match.status === 'Đã đủ người';

      return (
        <div 
          onClick={onSelect}
          className="bg-appDark-card border border-appDark-border rounded-xl p-3 px-3.5 space-y-2 cursor-pointer transition-all relative overflow-hidden shadow-sm hover:border-slate-500 hover:scale-[1.01] active:scale-[0.99] group"
        >
          <div className="absolute right-0 top-0 w-12 h-12 bg-neon-yellow/5 rounded-full blur-xl"></div>
          
          <div className="flex items-center justify-between">
            <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border shrink-0 ${
              isFull 
                ? 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                : 'bg-neon-yellow/20 text-neon-yellow border-neon-yellow/30'
            }`}>
              {isFull ? '🚨 Đủ người' : '🚨 Tuyển Lẻ Ghép Đội'}
            </span>
            <span className="text-xs font-black text-neon-yellow shrink-0">{match.pitchType}</span>
          </div>

          <div className="text-[11px] text-slate-300 space-y-1">
            <h3 className="font-extrabold text-sm text-white tracking-tight leading-tight truncate">
              {match.teamName} - {isFull ? 'Đã chốt' : `Cần tuyển [ ${slotsLeft} cầu ]`}
            </h3>
            
            <p className="flex items-center gap-1.5 truncate">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5 text-neon-yellow shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-neon-yellow font-black">{formatTimeDisplay(match.time)}</span>
              <span className="text-slate-500">•</span>
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((match.address || match.venue) + ' ' + (match.district || ''))}`}
                target="_blank" 
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="font-semibold text-sky-400 hover:underline flex items-center gap-1 truncate"
                title="Xem trên Google Maps"
              >
                <span className="truncate">{match.venue}</span>
                <span className="text-slate-400 text-[10px] no-underline shrink-0">({match.district}) 📍</span>
              </a>
            </p>
            
            <p className="text-[10px] text-slate-400">
              Vị trí cần tuyển: <strong className="text-neon-yellow font-bold">{match.position || match.positionsNeeded || "Cầu đá"}</strong>
            </p>
          </div>

          <div className="flex items-center justify-between pt-1.5 border-t border-appDark-border/30">
              <div className="flex items-center gap-1.5">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${getLevelBadgeClass(match.level)}`}>
                  {match.level}
                </span>
                {match.category && (
                  <span className={`text-[9.5px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide ${getCategoryBadgeClass(match.category)}`}>
                    {match.category}
                  </span>
                )}
              </div>
              <button 
                onClick={onJoin}
                className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg hover:scale-105 active:scale-95 transition-all shadow-sm shrink-0 ${
                  isFull 
                    ? 'bg-appDark-deep border border-neon-yellow/35 text-neon-yellow'
                    : 'bg-gradient-to-r from-neon-yellow to-amber-400 text-appDark-deep'
                }`}
              >
                {isFull ? 'Dự bị' : 'Tham gia'}
              </button>
            </div>
        </div>
      );
    }

    // 3. VENUE CARD (SÂN TRỐNG)
    function VenueCard({ slot, onCreateMatch }) {
      return (
        <div className="bg-appDark-card border border-appDark-border rounded-xl p-3 px-3.5 space-y-2 relative overflow-hidden group shadow-sm">
          <div className="absolute right-3 top-2.5 px-3 py-1 rounded-lg bg-gradient-to-r from-sky-500/20 to-sky-400/10 border border-sky-400/50 font-black text-lg text-sky-300 shadow-[0_0_10px_rgba(56,189,248,0.2)]">
            {slot.pitchType}
          </div>

          <div className="space-y-0.5">
            <span className="text-[9px] font-extrabold uppercase bg-sky-400/20 text-sky-400 px-1.5 py-0.5 rounded border border-sky-400/30">
              🏟️ SÂN TRỐNG
            </span>
            <h3 className="font-extrabold text-sm text-white tracking-tight pt-1 truncate max-w-[240px]">
              {slot.venueName}
            </h3>
            <p className="text-[10px] text-slate-400 flex items-center gap-1 truncate">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3 h-3 text-slate-500 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25gA7.5 7.5 0 1119.5 10.5z" />
              </svg>
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(slot.address || slot.venueName)}`} 
                target="_blank" 
                rel="noreferrer" 
                className="truncate hover:text-sky-400 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {slot.address}
              </a>
            </p>
          </div>

          <div className="flex items-center justify-between bg-appDark-deep px-3 py-1.5 rounded-lg border border-appDark-border/60 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Giờ:</span>
              <span className="text-[11px] font-black text-neon-yellow">{formatTimeDisplay(slot.timeSlot)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Giá:</span>
              <span className="text-[11px] font-black text-neon-green">{formatPrice(slot.price)}</span>
            </div>
          </div>

          {slot.notes && (
            <p className="text-[10px] text-slate-500 leading-relaxed italic truncate">
              * Ghi chú: {slot.notes}
            </p>
          )}

          <div className="pt-1.5 border-t border-appDark-border/30 flex justify-end">
            <button 
              onClick={onCreateMatch}
              className="text-[10px] font-black uppercase bg-gradient-to-r from-neon-green to-emerald-500 text-appDark-deep px-3.5 py-1.5 rounded-lg hover:scale-105 active:scale-95 transition-all shadow-sm neon-glow-green shrink-0"
            >
              Tạo kèo từ slot này
            </button>
          </div>
        </div>
      );
    }

    // 4. TEAM CARD (ĐỘI BÓNG)
    function TeamCard({ team, onInvite }) {
      const displayName = team.teamName || team.name || "Unknown Team";
      return (
        <div className="bg-appDark-card border border-appDark-border rounded-xl p-3 px-3.5 space-y-2 relative shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-black text-white text-sm shadow-sm uppercase shrink-0 overflow-hidden">
                {team.avatar ? (
                  <img src={team.avatar} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  displayName.slice(-2)
                )}
              </div>
              <div className="space-y-0.5 truncate">
                <h3 className="font-extrabold text-sm text-white tracking-tight truncate max-w-[160px]">{displayName}</h3>
                <p className="text-[10px] text-slate-400">Đại diện: <strong className="text-slate-300 font-semibold">{team.representative}</strong></p>
              </div>
            </div>
            <span className="text-[9px] font-extrabold text-orange-400 bg-orange-400/10 px-1.5 py-0.5 rounded border border-orange-500/20 shrink-0">
              Trình: {team.level}
            </span>
          </div>

          <div className="bg-appDark-deep p-2 rounded-lg border border-appDark-border/60 text-[11px] flex justify-between gap-2">
            <div>
              <span className="text-slate-500 uppercase text-[9px] font-bold block">Khu vực / Giờ:</span>
              <span className="font-semibold text-slate-200">{team.district} • {team.preferTime}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 uppercase text-[9px] font-bold block">Thống kê:</span>
              <span className="font-semibold text-neon-green">{team.matchCount} trận ({team.winRate} Thắng)</span>
            </div>
          </div>

          {/* Reputation Info Row */}
          <div className="flex items-center justify-between text-[10px] px-0.5 py-0.5 border-b border-appDark-border/30 pb-1.5">
            <span className="text-slate-300 font-semibold flex items-center gap-1">
              ⭐ Rating: <strong className="text-neon-yellow font-black">{team.rating || 4.8} ⭐</strong>
            </span>
            <span className="text-slate-300 font-semibold flex items-center gap-1">
              ❌ Tỷ lệ bùng kèo: <strong className="text-red-400 font-black">{team.cancellationRate || "thấp"}</strong>
            </span>
          </div>

          <div className="pt-0.5">
            <button 
              onClick={onInvite}
              className="w-full text-center text-[11px] font-black uppercase bg-gradient-to-r from-neon-green to-emerald-500 text-appDark-deep py-2 rounded-lg hover:scale-[1.01] active:scale-[0.99] transition-all shadow-sm shrink-0"
            >
              Mời giao hữu
            </button>
          </div>
        </div>
      );
    }

    // 5. MATCH DETAIL MODAL
    function MatchDetailModal({ match, venues = [], onClose, currentUser, teams = [], onAction, onRequestHandler, onCancelMatch, onCancelRequest, onAttendanceAction, onEditMatch }) {
      const venueObj = venues.find(v => v.name === match.venue);
      const displayAddress = match.address || (venueObj ? venueObj.address : `${match.venue || "Sân bóng"} ${match.district || ""}`.trim());
      const [showEditModal, setShowEditModal] = useState(false);
      const getLevelBadgeClass = (level) => {
        switch(level) {
          case 'Mạnh': return 'text-red-400 bg-red-400/10 border border-red-500/20';
          case 'Khá': return 'text-orange-400 bg-orange-400/10 border border-orange-500/20';
          case 'Trung bình': return 'text-emerald-400 bg-emerald-400/10 border border-emerald-500/20';
          default: return 'text-sky-400 bg-sky-400/10 border border-sky-500/20';
        }
      };

      const isOwner = currentUser && currentUser.phone === match.adminContact;
      const canCancel = isOwner || (currentUser && currentUser.roles && currentUser.roles.includes("super_admin"));
      const maxCount = match.needPlayersCount !== undefined ? match.needPlayersCount : (match.missingCount !== undefined ? match.missingCount : 2);
      const acceptedRequests = (match.requests || []).filter(r => r.status === 'accepted');
      const acceptedCount = acceptedRequests.reduce((sum, r) => sum + 1 + (parseInt(r.companions) || 0), 0);
      const slotsLeft = Math.max(0, maxCount - acceptedCount);
      const isFull = slotsLeft === 0;

      let myRequest = currentUser ? (match.requests || []).find(r => r.phone === currentUser.phone) : null;
      if (!myRequest && currentUser && currentUser.teamIds) {
        myRequest = (match.requests || []).find(r => r.requester_team_id && currentUser.teamIds.includes(r.requester_team_id));
      }
      const ownerTeam = teams.find(t => t.phone === match.adminContact || t.name === match.teamName) || {};
      
      const startTimeMs = parseMatchStartTime(match.time, match.rawTime);
      const nowMs = new Date().getTime();
      const isAttendanceTime = startTimeMs && (nowMs >= startTimeMs - 30 * 60 * 1000);
      const attendanceRequests = (match.requests || []).filter(r => r.status === 'accepted' || r.status === 'present' || r.status === 'noshow');
      const showCancelRequest = !isOwner && myRequest && (!myRequest.is_invite || myRequest.status !== 'pending') && match.status !== 'confirmed' && match.status !== 'Đã chốt kèo' && match.status !== 'Đã hủy' && match.status !== 'cancelled' && match.status !== 'expired';

      if (match.status === 'Đã hủy' || match.status === 'cancelled') {
        return (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="absolute inset-0" onClick={onClose}></div>
            <div className="w-full max-w-md bg-appDark-bg border-t border-appDark-border rounded-t-3xl p-5 space-y-4 relative z-10 animate-slide-up shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar">
              <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto -mt-2 mb-3"></div>
              
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                  KÈO ĐÃ HỦY THÀNH CÔNG
                </span>
                <button 
                  onClick={onClose}
                  className="w-7 h-7 rounded-full bg-slate-800 border border-appDark-border flex items-center justify-center hover:bg-slate-700 text-slate-400 font-bold"
                >
                  ✕
                </button>
              </div>

              {/* CANCELLED REASON CARD */}
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-center space-y-1 neon-glow-red animate-pulse">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">LÝ DO HỦY TRẬN</p>
                <h3 className="text-sm font-bold text-red-400">{match.cancelReason || "Kèo đấu đã bị hủy bởi chủ kèo hoặc hệ thống."}</h3>
              </div>

              {/* SPECS LIST */}
              <div className="bg-appDark-deep border border-appDark-border rounded-xl p-3.5 space-y-2 text-xs text-left">
                <div className="flex justify-between py-1 border-b border-appDark-border/30">
                  <span className="text-slate-400">🏟️ Sân bóng:</span>
                  <span className="font-bold text-white">{match.venue}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-appDark-border/30">
                  <span className="text-slate-400">📍 Địa chỉ:</span>
                  {displayAddress ? (
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayAddress)}`}
                      target="_blank" 
                      rel="noreferrer"
                      className="font-semibold text-sky-400 text-right truncate max-w-[200px] hover:underline flex items-center gap-1"
                    >
                      {displayAddress} 📍
                    </a>
                  ) : (
                    <span className="font-semibold text-slate-200 text-right truncate max-w-[200px]">Liên hệ chủ sân</span>
                  )}
                </div>
                <div className="flex justify-between py-1 border-b border-appDark-border/30">
                  <span className="text-slate-400">🕒 Giờ đá:</span>
                  <span className="font-bold text-neon-yellow">{formatTimeDisplay(match.time)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-appDark-border/30">
                  <span className="text-slate-400">⚽ Quy mô:</span>
                  <span className="font-semibold text-slate-200">{match.pitchType}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">💰 Giá sân:</span>
                  <span className="font-black text-neon-green">{typeof formatPrice !== 'undefined' ? formatPrice(match.price) : match.price}</span>
                </div>
              </div>
            </div>
          </div>
        );
      }

      if (match.status === 'expired') {
        return (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="absolute inset-0" onClick={onClose}></div>
            <div className="w-full max-w-md bg-appDark-bg border-t border-appDark-border rounded-t-3xl p-5 space-y-4 relative z-10 animate-slide-up shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar">
              <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto -mt-2 mb-3"></div>
              
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black bg-slate-500/10 text-slate-400 border border-slate-500/20 px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse"></span>
                  KÈO ĐÃ HẾT HẠN
                </span>
                <button 
                  onClick={onClose}
                  className="w-7 h-7 rounded-full bg-slate-800 border border-appDark-border flex items-center justify-center hover:bg-slate-700 text-slate-400 font-bold"
                >
                  ✕
                </button>
              </div>

              {/* EXPIRED CARD */}
              <div className="bg-slate-500/10 border border-slate-500/20 rounded-2xl p-4 text-center space-y-1">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">TRẠNG THÁI</p>
                <h3 className="text-sm font-bold text-slate-300">Kèo đã quá thời gian xác nhận (40 phút) và tự động hết hiệu lực.</h3>
              </div>

              {/* SPECS LIST */}
              <div className="bg-appDark-deep border border-appDark-border rounded-xl p-3.5 space-y-2 text-xs text-left">
                <div className="flex justify-between py-1 border-b border-appDark-border/30">
                  <span className="text-slate-400">🏟️ Sân bóng:</span>
                  <span className="font-bold text-white">{match.venue}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-appDark-border/30">
                  <span className="text-slate-400">📍 Địa chỉ:</span>
                  {displayAddress ? (
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayAddress)}`}
                      target="_blank" 
                      rel="noreferrer"
                      className="font-semibold text-sky-400 text-right truncate max-w-[200px] hover:underline flex items-center gap-1"
                    >
                      {displayAddress} 📍
                    </a>
                  ) : (
                    <span className="font-semibold text-slate-200 text-right truncate max-w-[200px]">Liên hệ chủ sân</span>
                  )}
                </div>
                <div className="flex justify-between py-1 border-b border-appDark-border/30">
                  <span className="text-slate-400">🕒 Giờ đá:</span>
                  <span className="font-bold text-neon-yellow">{formatTimeDisplay(match.time)}</span>
                </div>
              </div>
            </div>
          </div>
        );
      }

      if (match.status === 'confirmed' || match.status === 'Đã chốt kèo') {
        const acceptedReq = (match.requests || []).find(r => r.status === 'accepted') || {};
        const bookingCode = match.booking_code || `MC-${Math.floor(100000 + Math.random() * 900000)}`;
        
        return (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="absolute inset-0" onClick={onClose}></div>
            <div className="w-full max-w-md bg-appDark-bg border-t border-appDark-border rounded-t-3xl p-5 space-y-4 relative z-10 animate-slide-up shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar">
              <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto -mt-2 mb-3"></div>
              
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  KÈO ĐÃ CHỐT THÀNH CÔNG
                </span>
                <button 
                  onClick={onClose}
                  className="w-7 h-7 rounded-full bg-slate-800 border border-appDark-border flex items-center justify-center hover:bg-slate-700 text-slate-400 font-bold"
                >
                  ✕
                </button>
              </div>

              {/* BOOKING CODE CARD */}
              <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center space-y-1">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">MÃ ĐẶT SÂN (BOOKING CODE)</p>
                <h3 className="text-2xl font-black text-neon-green tracking-wider">{bookingCode}</h3>
                <p className="text-[9px] text-slate-500 italic">* Xuất trình mã này cho chủ sân để nhận nước suối và nhận sân đá.</p>
              </div>

              {/* MATCHUP VERSUS TITLE */}
              <div className="bg-appDark-card border border-appDark-border rounded-2xl p-4 flex items-center justify-between text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-neon-green/5 to-transparent pointer-events-none"></div>
                <div className="w-2/5 space-y-1 z-10">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">ĐỘI TẠO KÈO</span>
                  <h4 className="font-extrabold text-sm text-white truncate">{match.teamName}</h4>
                  <span className="text-[9px] px-1.5 py-0.2 rounded font-extrabold bg-appDark-deep text-slate-300 border border-slate-800">{match.level}</span>
                </div>
                <div className="w-1/5 font-black text-lg text-neon-yellow z-10 flex flex-col items-center justify-center">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-tighter">vs</span>
                  <div className="w-8 h-8 rounded-full bg-neon-yellow/10 border border-neon-yellow/30 flex items-center justify-center text-xs">⚔️</div>
                </div>
                <div className="w-2/5 space-y-1 z-10">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">ĐỘI NHẬN KÈO</span>
                  <h4 className="font-extrabold text-sm text-white truncate">{acceptedReq.teamName || match.pairedWith || "Đối tác"}</h4>
                  <span className="text-[9px] px-1.5 py-0.2 rounded font-extrabold bg-appDark-deep text-slate-300 border border-slate-800">{acceptedReq.level || match.level}</span>
                </div>
              </div>

              {/* SPECS LIST */}
              <div className="bg-appDark-deep border border-appDark-border rounded-xl p-3.5 space-y-2 text-xs text-left">
                <div className="flex justify-between py-1 border-b border-appDark-border/30">
                  <span className="text-slate-400">🏟️ Sân bóng:</span>
                  <span className="font-bold text-white">{match.venue}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-appDark-border/30">
                  <span className="text-slate-400">📍 Địa chỉ:</span>
                  {displayAddress ? (
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayAddress)}`}
                      target="_blank" 
                      rel="noreferrer"
                      className="font-semibold text-sky-400 text-right truncate max-w-[200px] hover:underline flex items-center gap-1"
                    >
                      {displayAddress} 📍
                    </a>
                  ) : (
                    <span className="font-semibold text-slate-200 text-right truncate max-w-[200px]">Liên hệ chủ sân</span>
                  )}
                </div>
                <div className="flex justify-between py-1 border-b border-appDark-border/30">
                  <span className="text-slate-400">🕒 Giờ đá:</span>
                  <span className="font-bold text-neon-yellow">{formatTimeDisplay(match.time)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-appDark-border/30">
                  <span className="text-slate-400">⚽ Quy mô:</span>
                  <span className="font-semibold text-slate-200">{match.pitchType}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">💰 Giá sân:</span>
                  <span className="font-black text-neon-green">{formatPrice(match.price)}</span>
                </div>
              </div>

              {/* CONTACT CHANNELS */}
              <div className="space-y-2 text-left">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">📞 KÊNH LIÊN HỆ CHỦ SÂN</h4>
                <div className="space-y-1.5">
                  <div className="bg-appDark-card border border-appDark-border/60 p-3 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Quản lý / Chủ sân ({match.venue})</p>
                      <p className="font-bold text-slate-200 mt-0.5">SĐT Hỗ Trợ: <span className="text-sky-400 font-black">{match.venuePhone || "0987654321"}</span></p>
                    </div>
                    <a href={`tel:${match.venuePhone || "0987654321"}`} className="bg-sky-400 text-appDark-deep px-3 py-1.5 rounded-lg text-[10px] font-black uppercase shadow-sm">Gọi</a>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              {canCancel && onCancelMatch && (
                <div className="pt-2">
                  <button 
                    onClick={() => onCancelMatch(match.id)}
                    className="w-full font-bold uppercase tracking-wider bg-gradient-to-r from-red-500 to-rose-600 text-white py-3.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md neon-glow-red text-xs flex items-center justify-center gap-1.5"
                  >
                    ❌ Hủy Trận Đấu
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      }

      if (match.status === 'completed') {
        const acceptedReq = (match.requests || []).find(r => r.status === 'accepted');
        const isFriendly = !!acceptedReq;
        
        return (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="absolute inset-0" onClick={onClose}></div>
            <div className="w-full max-w-md bg-appDark-bg border-t border-appDark-border rounded-t-3xl p-5 space-y-4 relative z-10 animate-slide-up shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar">
              <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto -mt-2 mb-3"></div>
              
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                  TRẬN ĐẤU ĐÃ KẾT THÚC
                </span>
                <button 
                  onClick={onClose}
                  className="w-7 h-7 rounded-full bg-slate-800 border border-appDark-border flex items-center justify-center hover:bg-slate-700 text-slate-400 font-bold"
                >
                  ✕
                </button>
              </div>

              {isFriendly && (
                <div className="bg-appDark-card border border-appDark-border rounded-2xl p-4 text-center relative overflow-hidden space-y-3">
                  <div className="space-y-1 z-10 relative">
                    <h4 className="font-extrabold text-sm text-white">Kết quả trận đấu</h4>
                    
                    {(!match.resultStatus || match.resultStatus === 'pending') && (
                      <p className="text-[11px] text-slate-400">Trận đấu với <strong className="text-white">{acceptedReq.teamName}</strong> đã kết thúc. Vui lòng để lại đánh giá về đối tác và kết quả trận đấu.</p>
                    )}
                    
                    {match.resultStatus === 'waiting_opponent' && (
                      <div className="text-[11px] font-bold py-1.5 px-3 bg-amber-500/20 text-amber-500 border border-amber-500/30 rounded-lg">
                        ⏳ Chờ đối thủ xác nhận kết quả...
                      </div>
                    )}
                    
                    {match.resultStatus === 'conflict' && (
                      <div className="text-[11px] font-bold py-1.5 px-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg">
                        ⚠️ Kết quả 2 đội chưa thống nhất
                      </div>
                    )}

                    {match.resultStatus === 'not_enough_confirmation' && (
                      <div className="text-[11px] font-bold py-1.5 px-3 bg-slate-500/20 text-slate-400 border border-slate-500/30 rounded-lg">
                        ℹ️ Không đủ xác nhận kết quả (Quá hạn)
                      </div>
                    )}

                    {match.resultStatus === 'no_result' && (
                      <div className="text-[11px] font-bold py-1.5 px-3 bg-slate-500/20 text-slate-400 border border-slate-500/30 rounded-lg">
                        ℹ️ Không có kết quả (Quá hạn)
                      </div>
                    )}

                    {match.resultStatus === 'matched' && (
                      <div className="text-[11px] font-bold py-1.5 px-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg">
                        ✅ Kết quả đã khớp và ghi nhận!
                      </div>
                    )}
                  </div>
                  
                  {((isOwner && !match.isRatedByTeamA) || (!isOwner && !match.isRatedByTeamB)) && (
                    <button onClick={() => { onAction('rate_opponent', { matchId: match.id, targetTeamId: isOwner ? acceptedReq.requester_team_id : match.team_id, targetTeamName: isOwner ? acceptedReq.teamName : match.teamName }); onClose(); }} className="w-full py-3 rounded-xl font-black text-[13px] bg-sky-500 text-white shadow-lg active:scale-[0.98] transition-transform">
                      ⭐ ĐÁNH GIÁ & BÁO KẾT QUẢ
                    </button>
                  )}
                </div>
              )}

              {/* MATCH CONFIRMATION CODE */}
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-3 text-center space-y-1">
                <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">MÃ XÁC NHẬN KÈO ĐẤU (LƯU ĐỐI CHIẾU)</p>
                <h3 className="text-xl font-black text-slate-300 tracking-wider">{match.booking_code || "KP-1938"}</h3>
              </div>

              {/* SPECS LIST */}
              <div className="bg-appDark-deep border border-appDark-border rounded-xl p-3.5 space-y-2 text-xs text-left">
                <div className="flex justify-between py-1 border-b border-appDark-border/30">
                  <span className="text-slate-400">🏟️ Sân bóng:</span>
                  <span className="font-bold text-white">{match.venue}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-appDark-border/30">
                  <span className="text-slate-400">📍 Địa chỉ:</span>
                  {displayAddress ? (
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayAddress)}`}
                      target="_blank" 
                      rel="noreferrer"
                      className="font-semibold text-sky-400 text-right truncate max-w-[200px] hover:underline flex items-center gap-1"
                    >
                      {displayAddress} 📍
                    </a>
                  ) : (
                    <span className="font-semibold text-slate-200 text-right truncate max-w-[200px]">Liên hệ chủ sân</span>
                  )}
                </div>
                <div className="flex justify-between py-1 border-b border-appDark-border/30">
                  <span className="text-slate-400">🕒 Giờ đá:</span>
                  <span className="font-bold text-slate-200">{formatTimeDisplay(match.time)}</span>
                </div>
                <div className="flex flex-col gap-2 py-1">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Tình trạng:</span>
                    <span className={`font-black uppercase text-[10px] ${myRequest ? (myRequest.status === 'present' ? 'text-sky-400' : myRequest.status === 'noshow' ? 'text-red-500' : 'text-slate-400') : 'text-sky-400'}`}>
                      {myRequest ? (
                         myRequest.status === 'present' ? 'Hoàn thành & Cộng điểm' :
                         myRequest.status === 'noshow' ? 'Không hoàn thành & Trừ uy tín' :
                         'Đã kết thúc'
                      ) : 'Đã kết thúc'}
                    </span>
                  </div>
                  {myRequest && myRequest.status === 'noshow' && !myRequest.isReported && (
                     <button onClick={() => {
                        onAttendanceAction(match.id, myRequest.id, 'report_noshow');
                     }} className="mt-1 w-full text-[10px] font-bold py-1.5 px-3 bg-red-600/30 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-600/50 hover:text-white transition-all block text-center">
                       🚨 Khiếu nại đánh giá sai
                     </button>
                  )}
                  {myRequest && myRequest.status === 'noshow' && myRequest.isReported && (
                     <div className="mt-1 w-full text-center text-[10px] font-bold py-1.5 px-3 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg block">
                       ⏳ Đang xử lý khiếu nại...
                     </div>
                  )}
                </div>
              </div>

              {/* LIST OF ATTENDEES FOR ADMIN */}
              {isOwner && attendanceRequests.length > 0 && (
                <div className="space-y-2 pt-2 text-left animate-fade-in">
                  <h4 className="text-[11px] font-black text-sky-400 uppercase tracking-wider">
                    📋 KẾT QUẢ ĐIỂM DANH
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1 no-scrollbar">
                    {attendanceRequests.map(req => (
                      <div key={req.id} className="bg-appDark-deep p-2.5 rounded-xl border border-appDark-border/60 flex items-center justify-between">
                        <div className="flex flex-col gap-0.5">
                          <p className="text-white text-[11px] font-bold">{req.name} <span className="text-slate-400 font-normal">({req.phone})</span></p>
                        </div>
                        <span className={`text-[8.5px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                          req.status === 'present' ? 'bg-sky-500/20 text-sky-400 border-sky-500/30' :
                          req.status === 'noshow' ? 'bg-red-500/20 text-red-500 border-red-500/30' :
                          'bg-amber-500/20 text-amber-500 border-amber-500/30'
                        }`}>
                          {req.status === 'present' ? 'Hoàn thành' : req.status === 'noshow' ? 'Bom kèo' : req.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      }

      return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          {/* Click background to close */}
          <div className="absolute inset-0" onClick={onClose}></div>
          
          <div className="w-full max-w-md bg-appDark-bg border-t border-appDark-border rounded-t-3xl p-5 space-y-4 relative z-10 animate-slide-up shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar">
            
            {/* Grab handle indicator */}
            <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto -mt-2 mb-3"></div>

            {/* Header info */}
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1 pr-2">
                <span className="inline-block text-[9px] font-extrabold text-neon-green bg-neon-green/10 px-2 py-0.5 rounded border border-neon-green/20 uppercase tracking-wider">
                  Chi tiết kèo đấu
                </span>
                <h2 className="text-xl font-black text-white tracking-tight leading-none pt-1">{match.teamName}</h2>
                <p className="text-[11px] text-slate-400 flex items-center gap-1 pt-1 pb-1">
                  Chủ kèo: <strong className="text-slate-200">{isOwner ? `${ownerTeam.representative || match.teamName} - ${match.adminContact} (Bạn)` : `${ownerTeam.representative || match.teamName} - ${match.adminContact}`}</strong>
                </p>
                
                {/* Team stats addition */}
                <div className="flex items-center gap-2 mt-2 bg-appDark-deep p-2 rounded-lg border border-appDark-border/60">
                  <div className="flex flex-col items-center flex-1 border-r border-appDark-border/50">
                    <span className="text-[9px] text-slate-500 uppercase font-black">Số trận</span>
                    <span className="text-xs font-black text-neon-green">{ownerTeam.matchCount || 0}</span>
                  </div>
                  <div className="flex flex-col items-center flex-1 border-r border-appDark-border/50">
                    <span className="text-[9px] text-slate-500 uppercase font-black">Rating</span>
                    <span className="text-xs font-black text-neon-yellow">{ownerTeam.rating || 5.0} ⭐</span>
                  </div>
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-[9px] text-slate-500 uppercase font-black">Huỷ kèo</span>
                    <span className="text-xs font-black text-red-400">{ownerTeam.cancellationRate || "0%"}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-slate-800 border border-appDark-border flex items-center justify-center hover:bg-slate-700 text-slate-400 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Premium Request Status Card at top */}
            {myRequest && (
              <div className={`border rounded-2xl p-4 flex items-center gap-3.5 text-left relative overflow-hidden ${
                myRequest.status === 'accepted' ? 'bg-emerald-500/10 border-emerald-500/25 neon-glow-green' :
                myRequest.status === 'rejected' ? 'bg-red-500/10 border-red-500/25 neon-glow-red' :
                myRequest.status === 'waitlist' ? 'bg-purple-500/10 border-purple-500/25 neon-glow-purple' :
                'bg-amber-500/10 border-amber-500/25 neon-glow-yellow animate-pulse'
              }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                  myRequest.status === 'accepted' ? 'bg-emerald-500/20 text-neon-green' :
                  myRequest.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                  myRequest.status === 'waitlist' ? 'bg-purple-500/20 text-purple-400' :
                  'bg-amber-500/20 text-amber-400'
                }`}>
                  {myRequest.status === 'accepted' ? '✅' :
                   myRequest.status === 'rejected' ? '❌' :
                   myRequest.status === 'waitlist' ? '⏳' : '⏳'}
                </div>
                <div className="space-y-0.5 flex-1 z-10">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    {myRequest.is_invite ? 'Lời mời giao hữu' : 'Trạng thái yêu cầu của bạn'}
                  </span>
                  <h4 className={`font-black text-sm uppercase ${
                    myRequest.status === 'accepted' ? 'text-neon-green' :
                    myRequest.status === 'present' ? 'text-sky-400' :
                    myRequest.status === 'noshow' ? 'text-red-500' :
                    myRequest.status === 'rejected' ? 'text-red-400' :
                    myRequest.status === 'waitlist' ? 'text-purple-400' :
                    'text-amber-400'
                  }`}>
                    {myRequest.status === 'accepted' ? 'Đã được chấp nhận' :
                     myRequest.status === 'present' ? 'Hoàn thành & Cộng điểm' :
                     myRequest.status === 'noshow' ? 'Không hoàn thành & Trừ uy tín' :
                     myRequest.status === 'rejected' ? 'Bị từ chối' :
                     myRequest.status === 'waitlist' ? 'Danh sách dự bị' : 
                     (myRequest.is_invite ? 'Lời mời tới' : 'Đang chờ duyệt')}
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-normal mt-1">
                    {myRequest.status === 'accepted' && 'Chúc mừng! Bạn đã được chấp nhận tham gia trận đấu này. Thông tin liên lạc đã được mở khóa bên dưới!'}
                    {myRequest.status === 'present' && 'Đội trưởng đã xác nhận sự có mặt của bạn. Cảm ơn bạn đã tham gia nghiêm túc!'}
                    {myRequest.status === 'noshow' && 'Bạn đã bị đánh dấu là "Bom kèo" (Không tới sân). Điểm uy tín của bạn đã bị trừ nghiêm trọng.'}
                    {myRequest.status === 'rejected' && 'Rất tiếc, yêu cầu tham gia của bạn không được đội trưởng chấp nhận cho trận đấu này.'}
                    {myRequest.status === 'waitlist' && `Bạn đang ở vị trí dự bị #${((match.requests || []).filter(r => r.status === 'waitlist').findIndex(r => r.id === myRequest.id) + 1) || 1} trong danh sách chờ thế chỗ.`}
                    {myRequest.status === 'pending' && (myRequest.is_invite 
                      ? 'Đội bóng này đã gửi lời mời giao hữu. Vui lòng phản hồi lời mời ở dưới cùng nhé!' 
                      : 'Đã gửi yêu cầu thành công. Vui lòng chờ đội trưởng phê duyệt yêu cầu của bạn.')}
                  </p>
                  {myRequest.status === 'noshow' && !myRequest.isReported && (
                     <button onClick={() => {
                        onAttendanceAction(match.id, myRequest.id, 'report_noshow');
                     }} className="mt-2 w-full text-[10px] font-bold py-1.5 px-3 bg-red-600/30 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-600/50 hover:text-white transition-all block text-center">
                       🚨 Khiếu nại đánh giá sai
                     </button>
                  )}
                  {myRequest.status === 'noshow' && myRequest.isReported && (
                     <div className="mt-2 w-full text-center text-[10px] font-bold py-1.5 px-3 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg block">
                       ⏳ Đang xử lý khiếu nại...
                     </div>
                  )}
                </div>
              </div>
            )}

            {/* Full grid specs */}
            <div className="bg-appDark-card border border-appDark-border rounded-2xl p-4 grid grid-cols-2 gap-3.5 text-xs">
              <div className="space-y-0.5 text-left">
                <span className="text-slate-400 block font-medium">🕒 Khung giờ đá</span>
                <span className="font-extrabold text-neon-yellow">{formatTimeDisplay(match.time)}</span>
              </div>
              <div className="space-y-0.5 text-left">
                <span className="text-slate-400 block font-medium">🏟️ Sân bóng</span>
                <span className="font-extrabold text-white">{match.venue}</span>
              </div>
              <div className="space-y-0.5 text-left">
                <span className="text-slate-400 block font-medium">📍 Khu vực / Quận</span>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((match.venue || "Sân bóng") + " " + (match.district || ""))}`}
                  target="_blank" 
                  rel="noreferrer"
                  className="font-extrabold text-sky-400 hover:underline block"
                >
                  {match.district}
                </a>
              </div>
              <div className="space-y-0.5 text-left">
                <span className="text-slate-400 block font-medium">⚽ Quy mô & Cỡ sân</span>
                <span className="font-extrabold text-slate-200">{match.pitchType}</span>
              </div>
              <div className="space-y-0.5 col-span-2 border-t border-appDark-border/40 pt-2 flex items-center justify-between">
                <span className="text-slate-400 font-medium">💪 Trình độ & Đối tượng</span>
                <div className="flex items-center gap-1.5">
                  <span className={`font-semibold px-2 py-0.5 rounded-md text-[11px] ${getLevelBadgeClass(match.level)}`}>
                    {match.level}
                  </span>
                  {match.category && (
                    <span className="font-extrabold px-2 py-0.5 rounded-md text-[11px] bg-sky-500/10 text-sky-400 border border-sky-500/25 uppercase">
                      {match.category}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Status explanation */}
            <div className="bg-appDark-deep border border-appDark-border p-3.5 rounded-xl space-y-1.5 text-left">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Trạng thái:</span>
                <span className={`font-extrabold uppercase text-[10px] px-2 py-0.5 rounded border ${
                  match.status === 'Thiếu người' && isFull 
                    ? 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                    : 'bg-neon-yellow/20 text-neon-yellow border-neon-yellow/30'
                }`}>
                  {match.status === 'Thiếu người' && isFull ? 'Đã đủ người' : 
                   match.status === 'waiting_opponent' ? 'Đang chờ đối' :
                   match.status === 'pending_confirmation' ? 'Chờ xác nhận' :
                   match.status === 'confirmed' ? 'Kèo đã chốt' :
                   match.status === 'cancelled' ? 'Đã hủy' :
                   match.status === 'expired' ? 'Hết hạn' : match.status}
                </span>
              </div>
              {match.status === "Thiếu người" && (
                <div className="flex justify-between items-center text-xs border-t border-appDark-border/30 pt-1.5">
                  <span className="text-slate-400 font-medium">Vị trí & Số lượng:</span>
                  <span className="font-extrabold text-neon-yellow">
                    Cần {isFull ? 'Đủ' : `${acceptedCount}/${maxCount}`} người ({match.position || match.positionsNeeded || "Cầu đá"})
                  </span>
                </div>
              )}
            </div>

            {/* Note text */}
            <div className="space-y-1 text-left">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">💡 Ghi chú từ chủ kèo:</h4>
              <p className="bg-slate-900/60 p-3 rounded-xl border border-appDark-border/40 text-xs text-slate-300 leading-relaxed italic">
                {match.notes || "Không có ghi chú thêm."}
              </p>
            </div>


            {/* My Request Status display */}
            {myRequest && (
              <div className="bg-appDark-deep border border-appDark-border p-3.5 rounded-xl space-y-1.5 text-left">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {myRequest.is_invite ? '📩 Lời mời giao hữu:' : '📩 Yêu cầu tham gia của bạn:'}
                </h4>
                <div className="flex justify-between items-center">
                  <div className="text-xs">
                    {myRequest.status === 'pending' && (
                      <span className="text-amber-400 font-bold">
                        {myRequest.is_invite ? '⏳ Lời mời đang chờ bạn xác nhận...' : '⏳ Đang chờ đội bóng xác nhận...'}
                      </span>
                    )}
                    {myRequest.status === 'accepted' && (
                      <div className="space-y-1">
                        <span className="text-neon-green font-bold">
                          ✅ Đã được nhận tham gia!
                        </span>
                        <p className="text-[10px] text-slate-300">
                          Số điện thoại liên hệ: <strong className="text-neon-yellow">{match.adminContact}</strong>
                        </p>
                      </div>
                    )}
                    {myRequest.status === 'rejected' && (
                      <span className="text-red-400 font-bold">
                        ❌ Đội đã từ chối yêu cầu tham gia.
                      </span>
                    )}
                    {myRequest.status === 'waitlist' && (
                      <span className="text-purple-400 font-bold">
                        ⏳ Bạn đang ở vị trí dự bị #{((match.requests || []).filter(r => r.status === 'waitlist').findIndex(r => r.id === myRequest.id) + 1) || 1}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                    myRequest.status === 'accepted' ? 'bg-neon-green/20 text-neon-green border-neon-green/30' :
                    myRequest.status === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                    myRequest.status === 'waitlist' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                    'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  }`}>
                    {myRequest.status === 'accepted' ? 'Đồng ý' :
                     myRequest.status === 'rejected' ? 'Từ chối' :
                     myRequest.status === 'waitlist' ? 'Dự bị' : 'Đang chờ'}
                  </span>
                </div>
              </div>
            )}

            {/* RIVAL TEAM MATCHMAKER APPROVAL PANEL */}
            {isOwner && (match.status === "waiting_opponent" || match.status === "pending_confirmation") && (
              <div className="space-y-2 border-t border-appDark-border/50 pt-3 text-left animate-fade-in">
                <div className="flex justify-between items-center">
                  <h4 className="text-[11px] font-black text-neon-yellow uppercase tracking-wider flex items-center gap-1.5">
                    <span>📋 DANH SÁCH ĐỘI NHẬN KÈO</span>
                    <span className="bg-neon-yellow/20 text-neon-yellow px-1.5 py-0.2 rounded font-black text-[9px]">
                      {(match.requests || []).filter(r => r.status === 'pending').length}
                    </span>
                  </h4>
                </div>

                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 no-scrollbar">
                  {(!match.requests || match.requests.length === 0 || !match.requests.some(r => r.status === 'pending')) ? (
                    <p className="text-[10px] text-slate-500 italic text-center py-4 bg-appDark-deep rounded-xl border border-appDark-border/30">
                      Chưa có đội bóng nào gửi yêu cầu nhận kèo.
                    </p>
                  ) : (
                    match.requests.filter(r => r.status === 'pending').map((req) => {
                      const isLevelMismatched = match.level !== req.level;
                      return (
                        <div key={req.id} className="bg-appDark-deep p-3 rounded-xl border border-appDark-border/60 space-y-2.5 shadow-sm text-left relative overflow-hidden group">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-xs text-white">{req.teamName}</span>
                                <span className="text-[9px] px-1.5 py-0.2 rounded font-extrabold bg-slate-800 text-slate-300 border border-slate-700">{req.level}</span>
                              </div>
                              
                              <div className="text-[10px] text-slate-400 space-y-0.5">
                                <p className="flex items-center gap-1.5">
                                  <span>🏟️ Quận: <strong className="text-slate-300">{req.district || 'Thủ Đức'}</strong></span>
                                  <span>•</span>
                                  <span>⚽ Số trận: <strong className="text-slate-300">{req.matchCount || '15'}</strong></span>
                                </p>
                                <p className="flex items-center gap-1.5">
                                  <span>⭐ Rating: <strong className="text-neon-yellow">{req.rating || '4.8'} ⭐</strong></span>
                                </p>
                              </div>
                            </div>
                          </div>

                          {isLevelMismatched && (
                            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] px-2.5 py-1 rounded-lg leading-normal font-semibold">
                              ⚠️ Đội này có trình độ ({req.level}) khác với trình độ bạn yêu cầu ({match.level}). Bạn vẫn muốn đồng ý chứ?
                            </div>
                          )}

                          {req.note && (
                            <p className="text-[10.5px] text-slate-300 italic bg-black/30 px-2.5 py-1.5 rounded-lg leading-relaxed">
                              "{req.note}"
                            </p>
                          )}

                          {/* Quick management actions */}
                          {req.is_invite ? (
                            <div className="flex gap-2 pt-1">
                              <button 
                                disabled
                                className="w-full text-[10px] font-bold py-1.5 bg-slate-500/20 text-slate-400 border border-slate-500/30 rounded-lg uppercase"
                              >
                                Đã gửi lời mời, đang chờ đối thủ xác nhận...
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2 pt-1">
                              <button 
                                type="button"
                                onClick={() => onRequestHandler(match.id, req.id, 'accept_rival')}
                                className="flex-1 text-[10px] font-black py-1.5 bg-gradient-to-r from-neon-green to-emerald-500 text-appDark-deep rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md neon-glow-green uppercase"
                              >
                                Đồng ý chốt
                              </button>
                              <button 
                                type="button"
                                onClick={() => onRequestHandler(match.id, req.id, 'reject_rival')}
                                className="flex-1 text-[10px] font-black py-1.5 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-600 hover:text-white transition-all uppercase"
                              >
                                Từ chối
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* OWNER MATCHMAKER APPROVAL PANEL */}
            {isOwner && match.status === "Thiếu người" && (
              <div className="space-y-2 border-t border-appDark-border/50 pt-3 text-left">
                <div className="flex justify-between items-center">
                  <h4 className="text-[11px] font-black text-neon-yellow uppercase tracking-wider">
                    📋 BẢNG DUYỆT CẦU LẺ ({acceptedCount}/{maxCount} đã nhận)
                  </h4>
                  {isFull && (
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-500/20 text-slate-400 border border-slate-500/30">
                      Đã đầy slot
                    </span>
                  )}
                </div>

                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 no-scrollbar">
                  {(!match.requests || match.requests.filter(r => r.status === 'pending' || r.status === 'waitlist').length === 0) ? (
                    <p className="text-[10px] text-slate-500 italic text-center py-4 bg-appDark-deep rounded-xl border border-appDark-border/30">
                      Không có yêu cầu nào đang chờ duyệt.
                    </p>
                  ) : (
                    match.requests.filter(r => r.status === 'pending' || r.status === 'waitlist').map((req) => {
                      const getStatusBadge = (status) => {
                        switch(status) {
                          case 'accepted': return 'bg-neon-green/20 text-neon-green border-neon-green/30';
                          case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
                          case 'waitlist': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
                          default: return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
                        }
                      };

                      const getStatusText = (status) => {
                        switch(status) {
                          case 'accepted': return 'Đồng ý';
                          case 'rejected': return 'Từ chối';
                          case 'waitlist': return 'Dự bị';
                          default: return 'Chờ duyệt';
                        }
                      };

                      // Tạm thời hiển thị đầy đủ SĐT (theo yêu cầu)
                      const displayPhone = req.phone;

                      return (
                        <div key={req.id} className="bg-appDark-deep p-3 rounded-xl border border-appDark-border/60 space-y-2 shadow-sm text-left">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-xs text-white">{req.name} {req.companions > 0 && <span className="text-neon-green ml-1">(+ {req.companions} người)</span>}</span>
                                <span className="text-[10px] text-slate-400">({req.position})</span>
                              </div>
                              <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                                <span>⭐ Uy tín: <strong className="text-neon-yellow">{req.rating || '4.8'}</strong></span>
                                <span>•</span>
                                <span>💣 Bom kèo: <strong className="text-red-400">{req.cancellationRate || '0%'}</strong></span>
                                <span>•</span>
                                <span>📱 SĐT: <strong className={req.status === 'accepted' ? "text-neon-green font-bold" : "text-slate-300 font-normal"}>{displayPhone}</strong></span>
                              </div>
                            </div>
                            <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${getStatusBadge(req.status)}`}>
                              {getStatusText(req.status)}
                            </span>
                          </div>
                          
                          {req.note && (
                            <p className="text-[10.5px] text-slate-300 italic bg-black/30 px-2 py-1 rounded">
                              "{req.note}"
                            </p>
                          )}

                          {/* Quick management actions */}
                          <div className="flex gap-1.5 pt-1">
                            {req.status !== 'accepted' && (
                              <button 
                                type="button"
                                onClick={() => onRequestHandler(match.id, req.id, 'accept')}
                                className="flex-1 text-[10px] font-bold py-1 bg-neon-green text-appDark-deep rounded-md hover:scale-[1.02] active:scale-[0.98] transition-all"
                              >
                                Đồng ý
                              </button>
                            )}
                            {req.status !== 'rejected' && (
                              <button 
                                type="button"
                                onClick={() => onRequestHandler(match.id, req.id, 'reject')}
                                className="flex-1 text-[10px] font-bold py-1 bg-red-600/30 text-red-400 border border-red-500/20 rounded-md hover:bg-red-600/50 hover:text-white transition-all"
                              >
                                Từ chối
                              </button>
                            )}
                            {req.status !== 'waitlist' && (
                              <button 
                                type="button"
                                onClick={() => onRequestHandler(match.id, req.id, 'waitlist')}
                                className="flex-1 text-[10px] font-bold py-1 bg-purple-500/20 text-purple-400 border border-purple-500/35 rounded-md hover:bg-purple-500/40 transition-all"
                              >
                                Dự bị
                              </button>
                            )}
                            {(req.status === 'rejected' || req.status === 'waitlist') && (
                              <button 
                                type="button"
                                onClick={() => onRequestHandler(match.id, req.id, 'restore')}
                                className="flex-1 text-[10px] font-bold py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded-md hover:bg-slate-700 transition-all"
                              >
                                Phục hồi
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* OWNER ATTENDANCE PANEL */}
            {isOwner && attendanceRequests.length > 0 && (
              <div className="space-y-2 border-t border-appDark-border/50 pt-3 text-left animate-fade-in">
                <div className="flex justify-between items-center">
                  <h4 className="text-[11px] font-black text-sky-400 uppercase tracking-wider">
                    📋 ĐIỂM DANH CẦU LẺ
                  </h4>
                  {nowMs >= startTimeMs + 90 * 60 * 1000 && attendanceRequests.some(r => r.status === 'accepted') && (
                     <span className="bg-red-500/20 text-red-400 px-1.5 py-0.2 rounded font-black text-[9px] animate-pulse">Cần chốt!</span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400">Xác nhận có mặt để cộng điểm uy tín cho cầu thủ.</p>
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 no-scrollbar">
                  {attendanceRequests.map(req => (
                    <div key={req.id} className="bg-appDark-deep p-3 rounded-xl border border-appDark-border/60 flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <p className="text-white text-[11px] font-bold">{req.name} <span className="text-slate-400 font-normal">({req.phone})</span></p>
                        <span className={`text-[8.5px] font-bold uppercase px-1.5 py-0.5 rounded border self-start ${
                          req.status === 'accepted' ? 'bg-neon-green/20 text-neon-green border-neon-green/30' :
                          req.status === 'present' ? 'bg-sky-500/20 text-sky-400 border-sky-500/30' :
                          req.status === 'noshow' ? 'bg-red-500/20 text-red-500 border-red-500/30' :
                          'bg-amber-500/20 text-amber-500 border-amber-500/30'
                        }`}>
                          {req.status === 'accepted' ? 'Đã nhận (Chờ điểm danh)' : req.status === 'present' ? 'Hoàn thành & Cộng điểm' : 'Không hoàn thành & Trừ uy tín'}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <button 
                          onClick={() => onAttendanceAction(match.id, req.id, 'present')}
                          className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all ${req.status === 'present' ? 'bg-sky-500 text-white shadow-lg' : 'bg-appDark-card border border-appDark-border text-slate-400 hover:text-sky-400 hover:border-sky-500'}`}
                        >
                          ✅ Đã có mặt
                        </button>
                        <button 
                          onClick={() => onAttendanceAction(match.id, req.id, 'noshow')}
                          className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all ${req.status === 'noshow' ? 'bg-red-500 text-white shadow-lg' : 'bg-appDark-card border border-appDark-border text-slate-400 hover:text-red-500 hover:border-red-500'}`}
                        >
                          ❌ Không tới
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NORMAL PLAYER LIST VIEW (PRIVACY ENFORCED) */}
            {!isOwner && match.requests && match.requests.length > 0 && (
              <div className="space-y-2 border-t border-appDark-border/40 pt-2 text-left">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Thành viên đăng ký ({acceptedCount}/{maxCount}):</h4>
                <div className="grid grid-cols-2 gap-1.5 max-h-24 overflow-y-auto pr-1 no-scrollbar">
                  {match.requests.map((req, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[11px] bg-slate-900/40 p-2 rounded-xl border border-appDark-border/30">
                      <span className="text-slate-300 truncate max-w-[120px]">
                        👤 {req.name} ({req.position})
                      </span>
                      <span className={`text-[8.5px] font-bold uppercase px-1 py-0.5 rounded border ${
                        req.status === 'accepted' ? 'bg-neon-green/10 text-neon-green border-neon-green/20' :
                        req.status === 'waitlist' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {req.status === 'accepted' ? 'Đã nhận' :
                         req.status === 'waitlist' ? 'Dự bị' : 'Chờ duyệt'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action CTAs */}
            <div className="flex gap-2 pt-2">
              <a 
                href={isOwner || (myRequest && myRequest.status === 'accepted') ? `tel:${match.adminContact}` : '#'}
                onClick={(e) => {
                  if (!isOwner && (!myRequest || myRequest.status !== 'accepted')) {
                    e.preventDefault();
                    alert("🔒 Số điện thoại liên hệ của đội bóng sẽ được hiển thị sau khi yêu cầu của bạn được chấp nhận (Accepted)!");
                  }
                }}
                className={`${(canCancel || showCancelRequest) ? 'w-1/2' : 'w-1/3'} text-center text-xs font-bold uppercase tracking-wider bg-appDark-card border border-appDark-border text-slate-200 py-3.5 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5`}
              >
                📞 Gọi Admin
              </a>

              {isOwner ? (
                <>
                  <button 
                    onClick={() => {
                      if (!match.time) {
                        setShowEditModal(true);
                        return;
                      }
                      
                      const timeMatch = match.time.match(/(\d{1,2}):(\d{2})/);
                      if (timeMatch) {
                        const matchDate = match.rawDate ? new Date(match.rawDate) : new Date();
                        matchDate.setHours(parseInt(timeMatch[1]), parseInt(timeMatch[2]), 0, 0);
                        
                        // If rawDate is missing and time has passed today, it might be for tomorrow
                        if (!match.rawDate && matchDate.getTime() < Date.now()) {
                          matchDate.setDate(matchDate.getDate() + 1);
                        }
                        
                        const diffMs = matchDate.getTime() - Date.now();
                        const diffMins = Math.floor(diffMs / 60000);
                        
                        if (diffMins > 0 && diffMins <= 60) {
                          alert("⏳ Trận đấu sắp diễn ra (dưới 60 phút). Bạn không thể thay đổi thông tin lúc này, chỉ có thể Hủy kèo.");
                          return;
                        }
                      }
                      setShowEditModal(true);
                    }}
                    className="flex-1 font-bold uppercase tracking-wider bg-appDark-deep text-neon-yellow border border-neon-yellow/30 py-3.5 rounded-xl hover:bg-neon-yellow/10 transition-all text-xs flex items-center justify-center gap-1.5"
                  >
                    ✏️ Sửa Kèo
                  </button>
                  <button 
                    onClick={() => onCancelMatch && onCancelMatch(match.id)}
                    className="flex-1 font-bold uppercase tracking-wider bg-gradient-to-r from-red-500 to-rose-600 text-white py-3.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md neon-glow-red text-xs flex items-center justify-center gap-1.5"
                  >
                    ❌ Hủy Trận
                  </button>
                </>
              ) : canCancel ? (
                <button 
                  onClick={() => onCancelMatch && onCancelMatch(match.id)}
                  className="w-1/2 font-bold uppercase tracking-wider bg-gradient-to-r from-red-500 to-rose-600 text-white py-3.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md neon-glow-red text-xs flex items-center justify-center gap-1.5"
                >
                  ❌ Hủy Trận
                </button>
              ) : showCancelRequest ? (
                <button 
                  onClick={() => onCancelRequest && onCancelRequest(match.id)}
                  className="w-1/2 font-bold uppercase tracking-wider bg-gradient-to-r from-rose-500 to-red-600 text-white py-3.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md neon-glow-red text-xs flex items-center justify-center gap-1.5"
                >
                  ❌ Hủy Yêu Cầu
                </button>
              ) : (
                <>
                  {match.status === "Cần đối" && (
                    <button 
                      onClick={() => onAction('receive')}
                      className="w-2/3 font-bold uppercase tracking-wider bg-gradient-to-r from-neon-green to-emerald-500 text-appDark-deep py-3.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md neon-glow-green text-xs"
                    >
                      🤝 Nhận Kèo Cho Đội
                    </button>
                  )}

                  {match.status === "Thiếu người" && (
                    myRequest ? (
                      <div className="w-2/3 text-center py-3.5 bg-appDark-card border border-appDark-border text-slate-400 rounded-xl text-xs font-bold flex items-center justify-center">
                        Đã gửi yêu cầu ({myRequest.status === 'waitlist' ? 'Hàng chờ' : 'Chờ duyệt'})
                      </div>
                    ) : (
                      <button 
                        onClick={() => onAction('join')}
                        className={`w-2/3 font-bold uppercase tracking-wider py-3.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md text-xs ${
                          isFull 
                            ? 'bg-appDark-deep border border-neon-yellow/35 text-neon-yellow'
                            : 'bg-gradient-to-r from-neon-yellow to-amber-500 text-appDark-deep neon-glow-yellow'
                        }`}
                      >
                        {isFull ? '🏃‍♂️ Vào danh sách dự bị' : '🏃‍♂️ Đăng Ký Tham Gia'}
                      </button>
                    )
                  )}

                  {(match.status === "Đang chờ xác nhận" || match.status === "pending_confirmation" || match.status === "waiting_opponent") && (
                    myRequest && myRequest.is_invite && myRequest.status === 'pending' ? (
                      <div className="w-2/3 flex gap-2">
                        <button 
                          onClick={() => onRequestHandler(match.id, myRequest.id, 'accept_rival')}
                          className="flex-1 py-3.5 rounded-xl font-bold text-xs bg-emerald-500 text-white hover:scale-[1.02] transition-all"
                        >
                          Chấp nhận kèo
                        </button>
                        <button 
                          onClick={() => onRequestHandler(match.id, myRequest.id, 'reject_rival')}
                          className="flex-1 py-3.5 rounded-xl font-bold text-xs bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md neon-glow-red hover:scale-[1.02] transition-all"
                        >
                          Từ chối
                        </button>
                      </div>
                    ) : (
                      <div className="w-2/3 text-center py-3.5 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl text-xs font-bold italic">
                        Đang Chờ Xác Nhận Kèo...
                      </div>
                    )
                  )}
                </>
              )}
            </div>

          </div>
          
          {showEditModal && (
            <EditMatchModal 
              match={match} 
              onClose={() => setShowEditModal(false)}
              onSubmit={(data) => {
                onEditMatch && onEditMatch(match.id, data);
                setShowEditModal(false);
              }}
            />
          )}
        </div>
      );
    }

    // 6. FORM: JOIN MATCH (THAM GIA KÈO LẺ)
    function JoinFormModal({ match, currentUser, onClose, onSubmit }) {
      const [name, setName] = useState(currentUser ? currentUser.name : "");
      const [phone, setPhone] = useState(currentUser ? currentUser.phone : "");
      const [position, setPosition] = useState("Tự do");
      const [note, setNote] = useState("");
      const [companions, setCompanions] = useState(0);

      const handleFormSubmit = (e) => {
        e.preventDefault();
        onSubmit({
          matchId: match.id,
          name,
          phone,
          position,
          note,
          companions
        });
      };

      return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="absolute inset-0" onClick={onClose}></div>
          <form 
            onSubmit={handleFormSubmit}
            className="w-full max-w-md bg-appDark-bg border-t border-appDark-border rounded-t-3xl p-5 space-y-4 relative z-10 animate-slide-up shadow-2xl"
          >
            <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto -mt-2 mb-3"></div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-white tracking-tight">🏃‍♂️ Tham Gia Kèo Phủi Lẻ</h3>
                <p className="text-xs text-slate-400">Bạn đang đăng ký ghép lẻ cùng <strong className="text-slate-200">{match.teamName}</strong></p>
              </div>
              <button 
                type="button" 
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-slate-800 border border-appDark-border flex items-center justify-center hover:bg-slate-700 text-slate-400 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Họ tên của bạn</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required
                  placeholder="Nhập họ và tên..."
                  className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-neon-yellow transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Số điện thoại</label>
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  required
                  pattern="[0-9]{10}"
                  placeholder="Nhập 10 số di động..."
                  className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-neon-yellow transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">+ Thêm người đi cùng</label>
                <div className="flex items-center gap-3 bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2">
                  <button type="button" onClick={() => setCompanions(Math.max(0, companions - 1))} className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-white hover:bg-slate-700 transition-colors font-bold text-lg">-</button>
                  <span className="flex-1 text-center font-bold text-white text-sm">{companions} người</span>
                  <button type="button" onClick={() => setCompanions(companions + 1)} className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-white hover:bg-slate-700 transition-colors font-bold text-lg">+</button>
                </div>
                <p className="text-[9px] text-slate-500 italic">Hệ thống sẽ tính tổng là {1 + companions} người đăng ký.</p>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Vị trí ưu thích đá</label>
                <select 
                  value={position} 
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-neon-yellow transition-all"
                >
                  <option value="Tự do">Mọi vị trí (Tự do)</option>
                  <option value="Tiền đạo">Tiền đạo (Fwd)</option>
                  <option value="Tiền vệ">Tiền vệ (Mid)</option>
                  <option value="Hậu vệ">Hậu vệ (Def)</option>
                  <option value="Thủ môn">Thủ môn (GK)</option>
                  <option value="Chạy cánh">Chạy cánh (Winger)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ghi chú ngắn gửi chủ kèo</label>
                <textarea 
                  value={note} 
                  onChange={(e) => setNote(e.target.value)}
                  rows="2"
                  placeholder="Ví dụ: Mình đá trung bình vui vẻ, có thể đóng tiền nước hoặc chia 5/5 sân..."
                  className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-neon-yellow transition-all"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full font-bold bg-gradient-to-r from-neon-yellow to-amber-500 text-appDark-deep py-3.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md neon-glow-yellow text-xs uppercase"
            >
              Gửi Yêu Cầu Tham Gia ➜
            </button>
          </form>
        </div>
      );
    }

    // 7. FORM: RECEIVE MATCH (NHẬN ĐỐI BÓNG CHO ĐỘI)
    function ReceiveFormModal({ match, currentUser, myManagedTeams, onClose, onSubmit }) {
      const [selectedTeamId, setSelectedTeamId] = useState(() => myManagedTeams && myManagedTeams.length > 0 ? myManagedTeams[0].id : "");
      const [teamName, setTeamName] = useState(() => myManagedTeams && myManagedTeams.length > 0 ? (myManagedTeams[0].name || myManagedTeams[0].teamName) : "");
      const [representative, setRepresentative] = useState(currentUser ? currentUser.name : "");
      const [phone, setPhone] = useState(currentUser ? currentUser.phone : "");
      const [level, setLevel] = useState(() => myManagedTeams && myManagedTeams.length > 0 ? (myManagedTeams[0].level || "Trung bình") : "Trung bình");
      const [note, setNote] = useState("");

      const handleFormSubmit = (e) => {
        e.preventDefault();
        const chosenTeam = (myManagedTeams || []).find(t => t.id === selectedTeamId) || {};
        onSubmit({
          matchId: match.id,
          teamId: selectedTeamId,
          teamName,
          representative,
          phone,
          level,
          district: chosenTeam.district || currentUser?.district || "Quận 7",
          matchCount: chosenTeam.matchCount || 10,
          rating: chosenTeam.rating || 5.0,
          note
        });
      };

      return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="absolute inset-0" onClick={onClose}></div>
          <form 
            onSubmit={handleFormSubmit}
            className="w-full max-w-md bg-appDark-bg border-t border-appDark-border rounded-t-3xl p-5 space-y-4 relative z-10 animate-slide-up shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
          >
            <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto -mt-2 mb-3"></div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-white tracking-tight">🤝 Nhận Kèo Đá Đối</h3>
                <p className="text-xs text-slate-400">Bạn đang nhận giao hữu với đội <strong className="text-slate-200">{match.teamName}</strong></p>
              </div>
              <button 
                type="button" 
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-slate-800 border border-appDark-border flex items-center justify-center hover:bg-slate-700 text-slate-400 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Đội bóng của bạn</label>
                {myManagedTeams && myManagedTeams.length > 0 ? (
                  <select
                    value={selectedTeamId}
                    onChange={(e) => {
                      const tId = e.target.value;
                      setSelectedTeamId(tId);
                      const t = myManagedTeams.find(x => x.id === tId);
                      if (t) {
                        setTeamName(t.name || t.teamName);
                        setLevel(t.level || "Trung bình");
                      }
                    }}
                    className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white focus:outline-none"
                  >
                    {myManagedTeams.map(t => (
                      <option key={t.id} value={t.id}>{t.name || t.teamName} ({t.district})</option>
                    ))}
                  </select>
                ) : (
                  <input 
                    type="text" 
                    value={teamName} 
                    onChange={(e) => setTeamName(e.target.value)} 
                    required
                    placeholder="Ví dụ: FC Real Madrid, FC Sông Lam..."
                    className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-neon-green transition-all"
                  />
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Người đại diện (Captain/Manager)</label>
                <input 
                  type="text" 
                  value={representative} 
                  onChange={(e) => setRepresentative(e.target.value)} 
                  required
                  placeholder="Nhập tên người đại diện..."
                  className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-neon-green transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Số điện thoại liên hệ</label>
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  required
                  pattern="[0-9]{10}"
                  placeholder="Nhập 10 số di động..."
                  className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Trình độ đội của bạn</label>
                <select 
                  value={level} 
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white focus:outline-none"
                >
                  <option value="Yếu">Yếu - đá chơi vui vẻ</option>
                  <option value="Trung bình">Trung bình - giao lưu nhẹ nhàng</option>
                  <option value="Khá">Khá - đá nhiệt tình</option>
                  <option value="Mạnh">Mạnh - đá căng hết sức</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ghi chú thảo luận (Tiền sân, Màu áo...)</label>
                <textarea 
                  value={note} 
                  onChange={(e) => setNote(e.target.value)}
                  rows="2"
                  placeholder="Ví dụ: Team mặc áo xanh dương, tiền sân chia 5/5 sòng phẳng, đá văn minh không bạo lực..."
                  className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-neon-green transition-all"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full font-bold bg-gradient-to-r from-neon-green to-emerald-500 text-appDark-deep py-3.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md neon-glow-green text-xs uppercase"
            >
              Gửi Yêu Cầu Nhận Kèo ➜
            </button>
          </form>
        </div>
      );
    }

    // 8. FORM: CREATE SLOT (CHỦ SÂN ĐĂNG GIỜ TRỐNG)
    function CreateSlotFormModal({ currentUser, venue, onClose, onSubmit }) {
      const [venueName, setVenueName] = useState(venue?.name || "");
      const [district, setDistrict] = useState(venue?.district || "Thủ Đức");
      const [address, setAddress] = useState(venue?.address || "");
      const [pitchType, setPitchType] = useState("Sân 7");
      const [date, setDate] = useState("Hôm nay");
      const [customDate, setCustomDate] = useState("");
      const [time, setTime] = useState("");
      const [price, setPrice] = useState("");
      const [contact, setContact] = useState(currentUser ? currentUser.phone : "");

      const handlePriceFormat = (e) => {
        const rawValue = String(e.target.value).replace(/\D/g, '');
        if (!rawValue) {
          setPrice('');
          return;
        }
        const formatted = parseInt(rawValue).toLocaleString('vi-VN');
        setPrice(formatted);
      };
      const [notes, setNotes] = useState("");

      const handleFormSubmit = (e) => {
        e.preventDefault();
        
        let priceNum = parseInt(String(price).replace(/\D/g, '')) || 500000;
        let finalDateLabel = date;
        if (date === "Hôm nay") {
          const d = new Date();
          finalDateLabel = String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
        } else if (date === "Ngày mai") {
          const d = new Date();
          d.setDate(d.getDate() + 1);
          finalDateLabel = String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
        } else if (date === "Chọn ngày cụ thể") {
          if (customDate) {
            const [yr, mn, dy] = customDate.split("-");
            finalDateLabel = `${dy}/${mn}/${yr}`;
          } else {
            const d = new Date();
            finalDateLabel = String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
          }
        }

        onSubmit({
          venueName,
          district,
          address,
          pitchType,
          date: finalDateLabel,
          customDate: date === "Chọn ngày cụ thể" ? customDate : "",
          time,
          price: priceNum,
          contact,
          notes
        });
      };

      return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="absolute inset-0" onClick={onClose}></div>
          <form 
            onSubmit={handleFormSubmit}
            className="w-full max-w-md bg-appDark-bg border-t border-appDark-border rounded-t-3xl p-5 space-y-3.5 relative z-10 animate-slide-up shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
          >
            <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto -mt-2 mb-3"></div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-white tracking-tight">🏟️ Đăng Khung Giờ Sân Trống</h3>
                <p className="text-xs text-slate-400">Dành riêng cho chủ sân / quản lý sân thanh lý giờ</p>
              </div>
              <button 
                type="button" 
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-slate-800 border border-appDark-border flex items-center justify-center hover:bg-slate-700 text-slate-400 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tên Sân Bóng</label>
                <input 
                  type="text" 
                  value={venueName} 
                  onChange={(e) => setVenueName(e.target.value)} 
                  required
                  readOnly={!!venue}
                  placeholder="Ví dụ: Sân cỏ nhân tạo Trường Sơn, Sân Win..."
                  className={`w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2 text-white focus:outline-none ${venue ? 'opacity-70 cursor-not-allowed' : ''}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Quận / Huyện</label>
                  <select 
                    value={district} 
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="Thủ Đức">Thủ Đức</option>
                    <option value="Bình Thạnh">Bình Thạnh</option>
                    <option value="Gò Vấp">Gò Vấp</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SĐT Chủ sân / Quản lý</label>
                  <input 
                    type="tel" 
                    value={contact} 
                    onChange={(e) => setContact(e.target.value)} 
                    required
                    pattern="[0-9]{10}"
                    placeholder="SĐT liên hệ đặt..."
                    className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Địa chỉ cụ thể</label>
                <input 
                  type="text" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  required
                  placeholder="Nhập số nhà, tên đường..."
                  className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Chọn Ngày</label>
                  <select 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="Hôm nay">Hôm nay</option>
                    <option value="Ngày mai">Ngày mai</option>
                    <option value="Chọn ngày cụ thể">📅 Chọn ngày cụ thể...</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Khung giờ đá</label>
                  <input 
                    type="text" 
                    value={time} 
                    onChange={(e) => setTime(e.target.value)} 
                    required
                    placeholder="Ví dụ: 18:30 - 20:00"
                    className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                  {/* Suggestion Time Chips */}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {["05:00 - 06:30", "06:00 - 07:30", "16:00 - 17:30", "17:30 - 19:00", "19:00 - 20:30", "19:30 - 21:00", "20:00 - 21:30", "22:00 - 23:30", "23:00 - 00:30", "00:00 - 01:30"].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTime(t)}
                        className="text-[9px] font-bold bg-appDark-deep hover:bg-neon-green/20 text-slate-300 hover:text-white px-2 py-0.5 rounded border border-appDark-border/60 hover:border-neon-green/40 transition-all shrink-0"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {date === "Chọn ngày cụ thể" && (
                <div className="space-y-1 animate-fade-in">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neon-green">Lựa chọn ngày cụ thể từ lịch</label>
                  <input 
                    type="date"
                    required
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full text-xs font-semibold bg-appDark-deep border border-neon-green/45 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-neon-green transition-all"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Giá thuê (VNĐ)</label>
                  <input 
                    type="text" 
                    value={price} 
                    onChange={handlePriceFormat} 
                    required
                    placeholder="Ví dụ: 600.000"
                    className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Quy mô sân</label>
                  <select 
                    value={pitchType} 
                    onChange={(e) => setPitchType(e.target.value)}
                    className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="Sân 5">Sân 5 người</option>
                    <option value="Sân 7">Sân 7 người</option>
                    <option value="Sân 11">Sân 11 người</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ghi chú & Ưu đãi</label>
                <textarea 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)}
                  rows="2"
                  placeholder="Ví dụ: Free trà đá, bóng thi đấu tiêu chuẩn..."
                  className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full font-bold bg-gradient-to-r from-neon-green to-emerald-500 text-appDark-deep py-3 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md neon-glow-green text-xs uppercase"
            >
              Đăng Giờ Trống Sân ➜
            </button>
          </form>
        </div>
      );
    }

    // 8.5. FORM: EDIT SLOT (CHỦ SÂN SỬA GIỜ TRỐNG)
    function EditSlotFormModal({ slot, onClose, onSubmit }) {
      const [timeSlot, setTimeSlot] = useState(slot.timeSlot || "");
      const [price, setPrice] = useState(() => {
        if (!slot.price) return "";
        const raw = String(slot.price).replace(/\D/g, '');
        return raw ? parseInt(raw).toLocaleString('vi-VN') : "";
      });
      const handlePriceFormat = (e) => {
        const rawValue = String(e.target.value).replace(/\D/g, '');
        if (!rawValue) {
          setPrice('');
          return;
        }
        const formatted = parseInt(rawValue).toLocaleString('vi-VN');
        setPrice(formatted);
      };
      const [notes, setNotes] = useState(slot.notes || "");

      const handleFormSubmit = (e) => {
        e.preventDefault();
        onSubmit({
          id: slot.id,
          timeSlot,
          price: parseInt(String(price).replace(/\D/g, '')) || 0,
          notes
        });
      };

      return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="absolute inset-0" onClick={onClose}></div>
          <form 
            onSubmit={handleFormSubmit}
            className="w-full max-w-md bg-appDark-bg border-t border-appDark-border rounded-t-3xl p-5 space-y-3.5 relative z-10 animate-slide-up shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
          >
            <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto -mt-2 mb-3"></div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-white tracking-tight">✏️ Sửa Thông Tin Sân Trống</h3>
                <p className="text-xs text-slate-400">Cập nhật lại giờ hoặc tiền sân</p>
              </div>
              <button 
                type="button" 
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-slate-800 border border-appDark-border flex items-center justify-center hover:bg-slate-700 text-slate-400 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-300 mt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Giờ & Ngày</label>
                <input 
                  type="text" 
                  value={timeSlot} 
                  onChange={(e) => setTimeSlot(e.target.value)} 
                  required
                  placeholder="Ví dụ: 17:30 - 19:00 Hôm nay"
                  className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tiền sân (VNĐ)</label>
                <input 
                  type="text" 
                  value={price} 
                  onChange={handlePriceFormat} 
                  required
                  placeholder="Ví dụ: 600.000"
                  className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ghi chú & Ưu đãi</label>
                <textarea 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)}
                  rows="2"
                  placeholder="Ví dụ: Free trà đá, bóng thi đấu tiêu chuẩn..."
                  className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-appDark-deep py-3 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md text-xs uppercase mt-2"
            >
              Lưu Thay Đổi ➜
            </button>
          </form>
        </div>
      );
    }

    // 9. FORM: CREATE TEAM (TẠO ĐỘI MỚI)
    function CreateTeamFormModal({ currentUser, onClose, onSubmit }) {
      const [teamName, setTeamName] = useState("");
      const [district, setDistrict] = useState("Thủ Đức");
      const [level, setLevel] = useState("Trung bình");
      const [preferTime, setPreferTime] = useState("");
      const [representative, setRepresentative] = useState(currentUser ? currentUser.name : "");
      const [phone, setPhone] = useState(currentUser ? currentUser.phone : "");
      const [avatar, setAvatar] = useState("");

      const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setAvatar(reader.result);
          };
          reader.readAsDataURL(file);
        }
      };

      const handleFormSubmit = (e) => {
        e.preventDefault();
        onSubmit({
          teamName,
          district,
          level,
          preferTime,
          representative,
          phone,
          avatar
        });
      };

      return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="absolute inset-0" onClick={onClose}></div>
          <form 
            onSubmit={handleFormSubmit}
            className="w-full max-w-md bg-appDark-bg border-t border-appDark-border rounded-t-3xl p-5 space-y-4 relative z-10 animate-slide-up shadow-2xl"
          >
            <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto -mt-2 mb-3"></div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-white tracking-tight">⚽ Đăng Ký Đội Bóng Mới</h3>
                <p className="text-xs text-slate-400">Tạo profile đội bóng để tìm đối, ghép giao lưu lâu dài</p>
              </div>
              <button 
                type="button" 
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-slate-800 border border-appDark-border flex items-center justify-center hover:bg-slate-700 text-slate-400 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full border-2 border-appDark-border border-dashed flex items-center justify-center shrink-0 relative overflow-hidden bg-appDark-deep">
                  {avatar ? (
                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-slate-500 text-[9px] text-center px-1 font-bold">Logo</span>
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    title="Chọn logo đội"
                  />
                </div>
                <div className="space-y-1 flex-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tên Đội Bóng</label>
                  <input 
                    type="text" 
                    value={teamName} 
                    onChange={(e) => setTeamName(e.target.value)} 
                    required
                    placeholder="Ví dụ: FC Star phủi..."
                    className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Khu vực hay đá (Quận)</label>
                  <select 
                    value={district} 
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white focus:outline-none"
                  >
                    <option value="Thủ Đức">Thủ Đức</option>
                    <option value="Bình Thạnh">Bình Thạnh</option>
                    <option value="Gò Vấp">Gò Vấp</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Trình độ đội</label>
                  <select 
                    value={level} 
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white focus:outline-none"
                  >
                    <option value="Yếu">Yếu - đá chơi vui vẻ</option>
                    <option value="Trung bình">Trung bình - giao lưu nhẹ nhàng</option>
                    <option value="Khá">Khá - đá nhiệt tình</option>
                    <option value="Mạnh">Mạnh - đá căng hết sức</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Khung giờ hay đá</label>
                <input 
                  type="text" 
                  value={preferTime} 
                  onChange={(e) => setPreferTime(e.target.value)} 
                  required
                  placeholder="Ví dụ: 19:00 - 21:30 các tối thứ 2, 4, 6"
                  className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white focus:outline-none"
                />
                {/* Preferred time suggestion chips */}
                <div className="flex flex-wrap gap-1 mt-1">
                  {["Tối 2, 4, 6", "Tối 3, 5, 7", "Chiều cuối tuần", "Hàng ngày sau 18h"].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setPreferTime(t)}
                      className="text-[9px] font-bold bg-appDark-deep hover:bg-neon-green/20 text-slate-300 hover:text-white px-2 py-0.5 rounded border border-appDark-border/60 hover:border-neon-green/40 transition-all shrink-0"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Đại diện (Captain)</label>
                  <input 
                    type="text" 
                    value={representative} 
                    onChange={(e) => setRepresentative(e.target.value)} 
                    required
                    placeholder="Họ tên đại diện..."
                    className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SĐT liên hệ</label>
                  <input 
                    type="tel" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    required
                    pattern="[0-9]{10}"
                    placeholder="10 số di động..."
                    className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full font-bold bg-gradient-to-r from-neon-green to-emerald-500 text-appDark-deep py-3.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md neon-glow-green text-xs uppercase"
            >
              Hoàn Tất Đăng Ký Đội ➜
            </button>
          </form>
        </div>
      );
    }

    // 10. FORM: CREATE MATCH FROM SLOT (TẠO KÈO ĐẤU TỪ SLOT TRỐNG CÓ SẴN)
    function CreateMatchFromSlotModal({ slot, currentUser, myManagedTeams, onClose, onSubmit }) {
      const [selectedTeamId, setSelectedTeamId] = useState(() => myManagedTeams && myManagedTeams.length > 0 ? myManagedTeams[0].id : "");
      const [teamName, setTeamName] = useState(() => myManagedTeams && myManagedTeams.length > 0 ? (myManagedTeams[0].name || myManagedTeams[0].teamName) : "");
      const [level, setLevel] = useState("Trung bình");
      const [category, setCategory] = useState("Kèo Nam");
      const [adminContact, setAdminContact] = useState(currentUser ? currentUser.phone : "");
      const [notes, setNotes] = useState("");

      const handleFormSubmit = (e) => {
        e.preventDefault();
        onSubmit({
          slot,
          teamId: selectedTeamId,
          teamName: teamName.trim(),
          level,
          category,
          adminContact: adminContact.trim(),
          notes: notes.trim()
        });
      };

      return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="absolute inset-0" onClick={onClose}></div>
          <form 
            onSubmit={handleFormSubmit}
            className="w-full max-w-md bg-appDark-bg border-t border-appDark-border rounded-t-3xl p-5 space-y-4 relative z-10 animate-slide-up shadow-2xl"
          >
            <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto -mt-2 mb-3"></div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-white tracking-tight">🔥 Tạo Kèo Nhanh Từ Sân Trống</h3>
                <p className="text-xs text-slate-400">Hệ thống sẽ giữ slot tại <strong className="text-slate-200">{slot.venueName}</strong> để tìm đối cho bạn</p>
              </div>
              <button 
                type="button" 
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-slate-800 border border-appDark-border flex items-center justify-center hover:bg-slate-700 text-slate-400 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Render selected slot context summary */}
            <div className="bg-appDark-card border border-appDark-border rounded-2xl p-3 text-xs space-y-1 bg-opacity-40">
              <p className="text-slate-400">Sân đấu: <strong className="text-white">{slot.venueName} ({slot.district})</strong></p>
              <p className="text-slate-400">Giờ đá: <strong className="text-neon-yellow">{formatTimeDisplay(slot.timeSlot)}</strong></p>
              <p className="text-slate-400">Tiền sân: <strong className="text-neon-green">{formatPrice(slot.price)}</strong></p>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Chọn Đội Bóng Của Bạn</label>
                  {myManagedTeams && myManagedTeams.length > 0 ? (
                    <select
                      value={selectedTeamId}
                      onChange={(e) => {
                        const tId = e.target.value;
                        setSelectedTeamId(tId);
                        const t = myManagedTeams.find(x => x.id === tId);
                        if (t) setTeamName(t.name || t.teamName);
                      }}
                      className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-neon-yellow"
                    >
                      {myManagedTeams.map(t => (
                        <option key={t.id} value={t.id}>{t.name || t.teamName} ({t.district})</option>
                      ))}
                    </select>
                  ) : (
                    <input 
                      type="text" 
                      value={teamName} 
                      onChange={(e) => setTeamName(e.target.value)} 
                      required
                      placeholder="Nhập tên CLB..."
                      className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-neon-yellow"
                    />
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SĐT Liên Hệ Admin</label>
                  <input 
                    type="tel" 
                    value={adminContact} 
                    onChange={(e) => setAdminContact(e.target.value)} 
                    required
                    pattern="[0-9]{10}"
                    placeholder="SĐT liên hệ..."
                    className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-neon-yellow"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Trình độ đội</label>
                  <select 
                    value={level} 
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-neon-yellow"
                  >
                    <option value="Yếu">Yếu - đá chơi vui vẻ</option>
                    <option value="Trung bình">Trung bình - giao lưu</option>
                    <option value="Khá">Khá - đá nhiệt tình</option>
                    <option value="Mạnh">Mạnh - đá căng hết sức</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Đối tượng (Loại kèo)</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-neon-yellow"
                  >
                    <option value="Kèo Nam">Kèo Nam</option>
                    <option value="Kèo Nữ">Kèo Nữ</option>
                    <option value="Lão Tướng">{"Lão Tướng (>40t)"}</option>
                    <option value="Nam Nữ">Kèo Nam Nữ</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mô tả thêm / Chia tiền sân</label>
                <textarea 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)}
                  rows="2"
                  placeholder="Ví dụ: Team chia đôi tiền sân nước, tìm đối tương đương giao lưu văn minh..."
                  className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white focus:outline-none"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full font-bold bg-gradient-to-r from-neon-green to-emerald-500 text-appDark-deep py-3.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md neon-glow-green text-xs uppercase"
            >
              Đăng Kèo Lên Chợ Đối ➜
            </button>
          </form>
        </div>
      );
    }

    // 11. FORM: INVITE FRIENDLY (MỜI GIAO HỮU ĐỘI BÓNG)
    function InviteFriendlyModal({ targetTeam, currentUser, myManagedTeams, slots, onClose, onSubmit }) {
      const [selectedTeamId, setSelectedTeamId] = useState(() => myManagedTeams && myManagedTeams.length > 0 ? myManagedTeams[0].id : "");
      const [myTeamName, setMyTeamName] = useState(() => myManagedTeams && myManagedTeams.length > 0 ? (myManagedTeams[0].name || myManagedTeams[0].teamName) : "");
      const [myPhone, setMyPhone] = useState(currentUser ? currentUser.phone : "");
      const [selectedSlotId, setSelectedSlotId] = useState("");
      const [desiredLevel, setDesiredLevel] = useState("Trung bình");
      const [proposalDetails, setProposalDetails] = useState("");

      const availableSlots = (slots || []).filter(s => !s.status || s.status === 'available');

      const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!selectedSlotId) {
          alert("⚠️ Bạn bắt buộc phải chọn một slot sân trống cụ thể từ hệ thống để tiếp tục!");
          return;
        }
        const chosenSlot = availableSlots.find(s => s.id === selectedSlotId);
        onSubmit({
          targetTeam,
          teamId: selectedTeamId,
          myTeamName,
          myPhone,
          slot: chosenSlot,
          desiredLevel,
          proposalDetails
        });
      };

      return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="absolute inset-0" onClick={onClose}></div>
          <form 
            onSubmit={handleFormSubmit}
            className="w-full max-w-md bg-appDark-bg border-t border-appDark-border rounded-t-3xl p-5 space-y-4 relative z-10 animate-slide-up shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
          >
            <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto -mt-2 mb-3"></div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-white tracking-tight">📬 Gửi Lời Mời Giao Hữu</h3>
                <p className="text-xs text-slate-400">Mời đội <strong className="text-slate-200">{targetTeam.teamName}</strong> đá giao lưu cọ xát</p>
              </div>
              <button 
                type="button" 
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-slate-800 border border-appDark-border flex items-center justify-center hover:bg-slate-700 text-slate-400 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Đội bóng của bạn</label>
                {myManagedTeams && myManagedTeams.length > 0 ? (
                  <select
                    value={selectedTeamId}
                    onChange={(e) => {
                      const tId = e.target.value;
                      setSelectedTeamId(tId);
                      const t = myManagedTeams.find(x => x.id === tId);
                      if (t) setMyTeamName(t.name || t.teamName);
                    }}
                    className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white focus:outline-none"
                  >
                    {myManagedTeams.map(t => (
                      <option key={t.id} value={t.id}>{t.name || t.teamName}</option>
                    ))}
                  </select>
                ) : (
                  <input 
                    type="text" 
                    value={myTeamName} 
                    onChange={(e) => setMyTeamName(e.target.value)} 
                    required
                    placeholder="Nhập tên câu lạc bộ của bạn..."
                    className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white focus:outline-none"
                  />
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SĐT Liên Hệ Đại Diện</label>
                <input 
                  type="tel" 
                  value={myPhone} 
                  onChange={(e) => setMyPhone(e.target.value)} 
                  required
                  pattern="[0-9]{10}"
                  placeholder="Số di động của bạn..."
                  className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white focus:outline-none"
                />
              </div>

              {/* Slot Sân Picker */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neon-green">Chọn Slot Sân Trống Trên Hệ Thống <span className="text-red-400 font-bold">*</span></label>
                <select
                  value={selectedSlotId}
                  onChange={(e) => {
                    const sId = e.target.value;
                    setSelectedSlotId(sId);
                    const sl = availableSlots.find(x => x.id === sId);
                    if (sl) {
                      setProposalDetails(`Gửi anh em ${targetTeam.teamName}, đội mình đề xuất đá trận giao lưu tại ${sl.venueName} (${sl.district}) vào khung giờ vàng ${sl.timeSlot} (${sl.pitchType}). Tiền sân ${sl.price} chia đôi, nước suối tẹt ga nhé!`);
                    }
                  }}
                  required
                  className="w-full text-xs font-semibold bg-appDark-deep border border-neon-green/40 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-neon-green"
                >
                  <option value="">-- Click chọn 1 slot sân trống --</option>
                  {availableSlots.map(s => (
                    <option key={s.id} value={s.id}>
                      🏟️ {s.venueName} ({s.district}) - 🕒 {s.timeSlot} - {s.pitchType} ({s.price})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Trình độ thi đấu đề xuất</label>
                <select
                  value={desiredLevel}
                  onChange={(e) => setDesiredLevel(e.target.value)}
                  className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white focus:outline-none"
                >
                  <option value="Yếu">Yếu - đá chơi vui vẻ</option>
                  <option value="Trung bình">Trung bình - giao lưu nhẹ nhàng</option>
                  <option value="Khá">Khá - đá nhiệt tình</option>
                  <option value="Mạnh">Mạnh - đá căng hết sức</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Đề xuất thời gian / Địa điểm sân (Tự động điền)</label>
                <textarea 
                  value={proposalDetails} 
                  onChange={(e) => setProposalDetails(e.target.value)}
                  rows="3"
                  required
                  placeholder="Ví dụ: Team mình đề xuất đá tối Thứ 5 này tầm 19h00 tại Sân K34 Gò Vấp, tiền sân chia đôi nước suối..."
                  className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white focus:outline-none"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={!selectedSlotId}
              className={`w-full font-bold py-3.5 rounded-xl transition-all shadow-md text-xs uppercase ${
                selectedSlotId 
                  ? 'bg-gradient-to-r from-neon-green to-emerald-500 text-appDark-deep hover:scale-[1.02] active:scale-[0.98] neon-glow-green'
                  : 'bg-slate-800 text-slate-500 border border-appDark-border cursor-not-allowed'
              }`}
            >
              Gửi Lời Mời Ngay ➜
            </button>
          </form>
        </div>
      );
    }


    // 12. MINIFIED PROFILE MATCH ITEM (HIỂN THỊ TẠI TAB TÔI)
    function ProfileMatchListItem({ match, personalStatus, onSelect }) {
      const isPast = match.status === 'completed' || match.status === 'cancelled' || match.status === 'Đã hủy' || personalStatus === 'Đã hủy' || personalStatus === 'Hoàn thành' || personalStatus === 'Bị từ chối';
      return (
        <div 
          onClick={onSelect}
          className={`bg-appDark-card border border-appDark-border/60 hover:border-slate-500 rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all text-xs ${isPast ? 'opacity-50 grayscale' : ''}`}
        >
          <div className="space-y-0.5 max-w-[280px]">
            <h5 className="font-bold text-white truncate">{match.teamName}</h5>
            <p className="text-[10px] text-neon-yellow flex items-center gap-1 font-semibold">
              <span>🕒 {formatTimeDisplay(match.time)}</span>
              <span className="text-slate-500">•</span>
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((match.address || match.venue) + ' ' + (match.district || ''))}`}
                target="_blank" 
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="font-semibold text-sky-400 hover:underline truncate flex items-center gap-1"
                title="Xem trên Google Maps"
              >
                🏟️ {match.venue} 📍
              </a>
            </p>
          </div>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 uppercase tracking-wide border ${
            match.status === 'Đã hủy' || match.status === 'cancelled' || match.status === 'expired' || personalStatus === 'Bị từ chối'
              ? 'text-red-400 bg-red-500/10 border-red-500/20'
              : match.status === 'Đã chốt kèo' || match.status === 'confirmed' || personalStatus === 'Đã chốt'
              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
              : match.status === 'pending_confirmation' || match.status === 'Đang chờ xác nhận' || personalStatus === 'Lời mời tới'
              ? 'text-purple-400 bg-purple-500/10 border-purple-500/20'
              : 'text-neon-green bg-neon-green/10 border-neon-green/20'
          }`}>
            {personalStatus || (
              match.status === 'waiting_opponent' ? 'Đang chờ đối' :
              match.status === 'pending_confirmation' ? 'Có đối đăng ký' :
              match.status === 'confirmed' ? 'Kèo đã chốt' :
              match.status === 'cancelled' ? 'Đã hủy' :
              match.status === 'expired' ? 'Hết hạn' : match.status
            )}
          </span>
        </div>
      );
    }

    // 13. CREATE MISSING PLAYER FORM MODAL (ĐĂNG TUYỂN NGƯỜI)
    function CreateMissingPlayerFormModal({ currentUser, myManagedTeams, onClose, onSubmit }) {
      const [selectedTeamId, setSelectedTeamId] = React.useState(() => myManagedTeams && myManagedTeams.length > 0 ? myManagedTeams[0].id : "");
      const [teamName, setTeamName] = React.useState(() => myManagedTeams && myManagedTeams.length > 0 ? (myManagedTeams[0].name || myManagedTeams[0].teamName) : "");
      const [missingCount, setMissingCount] = React.useState("2");
      const [position, setPosition] = React.useState("Cầu đá");
      const [pitchType, setPitchType] = React.useState("Sân 7");
      const [date, setDate] = React.useState("Hôm nay");
      const [customDate, setCustomDate] = React.useState("");
      const [level, setLevel] = React.useState("Vui vẻ mồ hôi");
      const [time, setTime] = React.useState("");
      const [venue, setVenue] = React.useState("");
      const [district, setDistrict] = React.useState("Thủ Đức");
      const [adminContact, setAdminContact] = React.useState(currentUser ? currentUser.phone : "");
      const [notes, setNotes] = React.useState("");

      const handleFormSubmit = (e) => {
        e.preventDefault();
        
        let finalDateLabel = date;
        if (date === "Chọn ngày cụ thể") {
          if (customDate) {
            const [yr, mn, dy] = customDate.split("-");
            finalDateLabel = `${dy}/${mn}/${yr}`;
          } else {
            finalDateLabel = "Hôm nay";
          }
        }

        onSubmit({
          teamId: selectedTeamId,
          teamName: teamName.trim() || "FC Phong Trào",
          missingCount: parseInt(missingCount) || 1,
          position,
          pitchType,
          date: finalDateLabel,
          customDate: date === "Chọn ngày cụ thể" ? customDate : "",
          time,
          venue: venue.trim() || "Sân Bóng Phủi",
          district,
          level,
          adminContact: adminContact.trim(),
          notes: notes.trim()
        });
      };

      return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="absolute inset-0" onClick={onClose}></div>
          <form 
            onSubmit={handleFormSubmit}
            className="w-full max-w-md bg-appDark-bg border-t border-appDark-border rounded-t-3xl p-5 space-y-3.5 relative z-10 animate-slide-up shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
          >
            <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto -mt-2 mb-3"></div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-white tracking-tight">🏃‍♂️ Đăng Tuyển Người Đá Lẻ</h3>
                <p className="text-xs text-slate-400">Tuyển thêm chân chạy lẻ hoặc thủ môn (GK) cho đội bóng</p>
              </div>
              <button 
                type="button" 
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-slate-800 border border-appDark-border flex items-center justify-center hover:bg-slate-700 text-slate-400 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Đội bóng tuyển</label>
                  {myManagedTeams && myManagedTeams.length > 0 ? (
                    <select
                      value={selectedTeamId}
                      onChange={(e) => {
                        const tId = e.target.value;
                        setSelectedTeamId(tId);
                        const t = myManagedTeams.find(x => x.id === tId);
                        if (t) setTeamName(t.name || t.teamName);
                      }}
                      className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-neon-yellow transition-all"
                    >
                      {myManagedTeams.map(t => (
                        <option key={t.id} value={t.id}>{t.name || t.teamName}</option>
                      ))}
                    </select>
                  ) : (
                    <input 
                      type="text"
                      required
                      placeholder="Ví dụ: FC Anh Em..."
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-neon-yellow transition-all"
                    />
                  )}
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Số lượng tuyển</label>
                  <input 
                    type="number"
                    required
                    min="1"
                    max="10"
                    placeholder="Số người..."
                    value={missingCount}
                    onChange={(e) => setMissingCount(e.target.value)}
                    className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-neon-yellow transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Vị Trí Cần Tuyển</label>
                  <select 
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-neon-yellow"
                  >
                    <option value="Cầu đá">Cầu đá (Chạy cánh, Tiền đạo,...)</option>
                    <option value="Thủ môn (GK)">Thủ môn (GK)</option>
                    <option value="Hậu vệ / Thòng">Hậu vệ / Thòng</option>
                    <option value="Cần cả Cầu và GK">Cần cả Cầu và GK</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Loại Sân</label>
                  <select 
                    value={pitchType}
                    onChange={(e) => setPitchType(e.target.value)}
                    className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-neon-yellow"
                  >
                    <option value="Sân 5">Sân 5</option>
                    <option value="Sân 7">Sân 7</option>
                    <option value="Sân 11">Sân 11</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ngày Đá</label>
                  <select 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-neon-yellow"
                  >
                    <option value="Hôm nay">Hôm nay</option>
                    <option value="Ngày mai">Ngày mai</option>
                    <option value="Chọn ngày cụ thể">📅 Chọn ngày cụ thể...</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Giờ Đá</label>
                  <input 
                    type="text"
                    required
                    placeholder="Ví dụ: 19:00 - 20:30..."
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-neon-yellow transition-all"
                  />
                  {/* Suggestion Time Chips */}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {["17:30 - 19:00", "19:00 - 20:30", "20:30 - 22:00", "18:00 - 19:30"].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTime(t)}
                        className="text-[9px] font-bold bg-appDark-deep hover:bg-neon-yellow/20 text-slate-300 hover:text-white px-2 py-0.5 rounded border border-appDark-border/60 hover:border-neon-yellow/40 transition-all shrink-0"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {date === "Chọn ngày cụ thể" && (
                <div className="space-y-1 animate-fade-in">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neon-yellow">Lựa chọn ngày cụ thể từ lịch</label>
                  <input 
                    type="date"
                    required
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full text-xs font-semibold bg-appDark-deep border border-neon-yellow/50 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-neon-yellow transition-all"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tên Sân / Địa Điểm</label>
                <input 
                  type="text"
                  required
                  placeholder="Ví dụ: Sân Win Thủ Đức..."
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-neon-yellow transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Khu vực (Quận)</label>
                  <select 
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-neon-yellow"
                  >
                    <option value="Thủ Đức">Thủ Đức</option>
                    <option value="Bình Thạnh">Bình Thạnh</option>
                    <option value="Gò Vấp">Gò Vấp</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Trình Độ Yêu Cầu</label>
                  <select 
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-neon-yellow"
                  >
                    <option value="Vui vẻ mồ hôi">Vui vẻ mồ hôi</option>
                    <option value="Khá">Khá</option>
                    <option value="Đá tốt">Đá tốt</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Số Điện Thoại Liên Hệ</label>
                <input 
                  type="tel"
                  required
                  pattern="[0-9]{10,11}"
                  placeholder="Nhập số điện thoại liên hệ..."
                  value={adminContact}
                  onChange={(e) => setAdminContact(e.target.value)}
                  className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-neon-yellow transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ghi chú yêu cầu</label>
                <textarea 
                  placeholder="Ví dụ: Cần chạy nhiệt tình, chia tiền sân nhẹ nhàng..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full h-16 text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-neon-yellow transition-all resize-none"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full font-bold bg-gradient-to-r from-neon-yellow to-amber-500 text-appDark-deep py-3 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md neon-glow-yellow text-sm flex items-center justify-center gap-1"
            >
              Đăng Tuyển Ngay ➜
            </button>
          </form>
        </div>
      );
    }

    // 14. CHANGE NAME MODAL



    function ChangeNameModal({ currentUser, onClose, onSubmit }) {
      const [newName, setNewName] = React.useState(currentUser.name);
      const [newPhone, setNewPhone] = React.useState(currentUser.phone || "");

      const handleFormSubmit = (e) => {
        e.preventDefault();
        onSubmit(newName, newPhone);
      };

      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in text-left">
          <div className="absolute inset-0" onClick={onClose}></div>
          <form 
            onSubmit={handleFormSubmit}
            className="w-[90%] max-w-sm bg-appDark-bg border border-appDark-border rounded-2xl p-5 space-y-4 relative z-10 animate-scale-in shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-white tracking-tight">Đổi Thông Tin Cá Nhân</h3>
                <p className="text-[10px] text-amber-400">Lưu ý: Chỉ được đổi tên 1 lần mỗi 30 ngày</p>
              </div>
              <button 
                type="button" 
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-slate-800 border border-appDark-border flex items-center justify-center hover:bg-slate-700 text-slate-400 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Tên Mới</label>
                <input 
                  type="text" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)} 
                  required
                  className="w-full text-sm font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-neon-green"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Số Điện Thoại</label>
                <input 
                  type="tel" 
                  pattern="[0-9]{10}"
                  value={newPhone} 
                  onChange={(e) => setNewPhone(e.target.value)} 
                  required
                  className="w-full text-sm font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-neon-green"
                />
                <p className="text-[10px] text-slate-400 leading-tight">Chúng tôi dùng SĐT để định danh tài khoản duy nhất của bạn</p>
                <p className="text-[10px] text-red-500 font-bold leading-tight">Lưu ý: Hãy nhập đúng số điện thoại của bạn để chủ sân có thể liên hệ</p>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="w-full font-bold bg-neon-green text-appDark-deep py-2.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Cập Nhật Thông Tin
            </button>

            {currentUser.name_history && currentUser.name_history.length > 0 && (
              <div className="pt-3 border-t border-appDark-border/50">
                <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase">Lịch Sử Đổi Tên</p>
                <div className="space-y-1.5 max-h-32 overflow-y-auto no-scrollbar">
                  {currentUser.name_history.slice().reverse().map((h, i) => (
                    <div key={i} className="flex justify-between items-center text-[10px] bg-appDark-deep p-1.5 rounded-lg border border-appDark-border/30">
                      <span className="text-slate-300 font-medium">{h.old_name}</span>
                      <span className="text-slate-500">{new Date(h.changed_at).toLocaleDateString('vi-VN')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>
      );
    }

    // 15. VENUE REGISTRATION MODAL

    // 17. VENUE SETTINGS MODAL (CÀI ĐẶT SÂN & GHÉP SÂN)
    function VenueSettingsModal({ venue, onClose, onSubmit }) {
      const [venueName, setVenueName] = useState(venue?.name || "");
      const [venuePhone, setVenuePhone] = useState(venue?.phone || "");
      const [cap5, setCap5] = useState(venue?.capacities?.['5'] || 0);
      const [cap7, setCap7] = useState(venue?.capacities?.['7'] || 0);
      const [cap11, setCap11] = useState(venue?.capacities?.['11'] || 0);
      
      const [combinations, setCombinations] = useState(venue?.combinations || []);
      const [newTarget, setNewTarget] = useState('7A');
      const [newParts, setNewParts] = useState('5A, 5B');

      const handleAddCombination = () => {
        if (!newTarget.trim() || !newParts.trim()) return;
        const partsArray = newParts.split(',').map(p => p.trim()).filter(Boolean);
        setCombinations([...combinations, { target: newTarget.trim(), parts: partsArray }]);
        setNewTarget('');
        setNewParts('');
      };

      const handleRemoveCombination = (idx) => {
        setCombinations(combinations.filter((_, i) => i !== idx));
      };

      const handleFormSubmit = (e) => {
        e.preventDefault();
        onSubmit({
          name: venueName.trim(),
          phone: venuePhone.trim(),
          capacities: {
            '5': parseInt(cap5) || 0,
            '7': parseInt(cap7) || 0,
            '11': parseInt(cap11) || 0
          },
          combinations
        });
      };

      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="absolute inset-0" onClick={onClose}></div>
          <div className="w-[90%] max-w-sm bg-appDark-bg border border-appDark-border rounded-2xl p-5 space-y-4 relative z-10 animate-scale-in shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-white tracking-tight">⚙️ Cài Đặt Sân Bóng</h3>
                <p className="text-[10px] text-slate-400">Sửa số lượng & cấu hình ghép sân</p>
              </div>
              <button onClick={onClose} className="w-7 h-7 rounded-full bg-slate-800 border border-appDark-border flex items-center justify-center hover:bg-slate-700 text-slate-400 font-bold">✕</button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-neon-green uppercase border-b border-appDark-border pb-1">1. Số Lượng Sân</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Sân 5</span>
                    <input type="number" min="0" value={cap5} onChange={e => setCap5(e.target.value)} className="w-full text-xs bg-appDark-deep border border-appDark-border rounded-lg px-2 py-2 text-white focus:outline-none focus:border-neon-green text-center" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Sân 7</span>
                    <input type="number" min="0" value={cap7} onChange={e => setCap7(e.target.value)} className="w-full text-xs bg-appDark-deep border border-appDark-border rounded-lg px-2 py-2 text-white focus:outline-none focus:border-neon-green text-center" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Sân 11</span>
                    <input type="number" min="0" value={cap11} onChange={e => setCap11(e.target.value)} className="w-full text-xs bg-appDark-deep border border-appDark-border rounded-lg px-2 py-2 text-white focus:outline-none focus:border-neon-green text-center" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-neon-yellow uppercase border-b border-appDark-border pb-1">2. Quy Tắc Ghép Sân</h4>
                <p className="text-[10px] text-slate-400 italic">Ví dụ: Để gộp 2 sân 5 thành 1 sân 7, cấu hình: 7A = 5A, 5B. Hệ thống sẽ khóa 5A và 5B nếu 7A có người đặt.</p>
                
                <div className="bg-appDark-deep p-3 rounded-xl border border-appDark-border space-y-2">
                  <div className="flex gap-2 items-end">
                    <div className="flex-1 space-y-1">
                      <label className="text-[9px] font-bold text-slate-400">Sân Đích (Gộp thành)</label>
                      <input type="text" value={newTarget} onChange={e => setNewTarget(e.target.value)} placeholder="VD: 7A" className="w-full text-xs bg-appDark-bg border border-appDark-border rounded-lg px-2 py-1.5 text-white focus:outline-none focus:border-neon-yellow" />
                    </div>
                    <div className="text-slate-400 font-bold mb-2">=</div>
                    <div className="flex-[2] space-y-1">
                      <label className="text-[9px] font-bold text-slate-400">Các Sân Con (Cách nhau dấu phẩy)</label>
                      <input type="text" value={newParts} onChange={e => setNewParts(e.target.value)} placeholder="VD: 5A, 5B" className="w-full text-xs bg-appDark-bg border border-appDark-border rounded-lg px-2 py-1.5 text-white focus:outline-none focus:border-neon-yellow" />
                    </div>
                  </div>
                  <button type="button" onClick={handleAddCombination} className="w-full py-1.5 bg-slate-800 text-slate-300 text-[10px] font-bold rounded-lg border border-slate-700 hover:bg-slate-700">
                    + Thêm quy tắc
                  </button>
                </div>

                {combinations.length > 0 && (
                  <div className="space-y-1.5 mt-3">
                    {combinations.map((comb, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-appDark-deep px-3 py-2 rounded-lg border border-appDark-border text-xs">
                        <div>
                          <span className="font-extrabold text-neon-yellow">{comb.target}</span> 
                          <span className="text-slate-400 mx-2">=</span> 
                          <span className="font-bold text-slate-300">{comb.parts.join(' + ')}</span>
                        </div>
                        <button onClick={() => handleRemoveCombination(idx)} className="text-red-400 hover:text-red-300 font-bold">Xóa</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button onClick={handleFormSubmit} className="w-full font-bold bg-gradient-to-r from-neon-green to-emerald-500 text-appDark-deep py-2.5 rounded-xl text-sm uppercase mt-4">
              Lưu Cài Đặt
            </button>
          </div>
        </div>
      );
    }


    // 18. OWNER CREATE MATCH MODAL (CHỦ SÂN ĐĂNG KÈO TÌM ĐỐI)
    
    function OwnerBookCustomerModal({ currentUser, venues, fields, onClose, onSubmit }) {
      const myVenue = venues.find(v => v.phone === currentUser.phone || v.owner_user_id === currentUser.id);
      const myFields = fields ? fields.filter(f => f.venueId === myVenue?.id && f.status !== "inactive") : [];
      
      const [date, setDate] = useState(() => {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${day}/${m}/${y}`;
      });
      const [customDate, setCustomDate] = useState("");
      
      const [time, setTime] = useState("19:00 - 20:30");
      const [selectedFieldId, setSelectedFieldId] = useState("");
      const [pitchType, setPitchType] = useState("Sân 5");
      const [price, setPrice] = useState("");
      const [customerName, setCustomerName] = useState("");
      const [customerPhone, setCustomerPhone] = useState("");
      const [notes, setNotes] = useState("");

      useEffect(() => {
        if (myFields.length > 0 && !selectedFieldId) {
          setSelectedFieldId(myFields[0].fieldId);
          setPitchType(myFields[0].fieldType);
          const defaultVal = myFields[0].price90 || myFields[0].defaultPrice || 300000;
          setPrice(defaultVal.toLocaleString('vi-VN'));
        }
      }, [myFields]);

      const handleFieldChange = (fieldId) => {
        setSelectedFieldId(fieldId);
        const field = myFields.find(f => f.fieldId === fieldId);
        if (field) {
          setPitchType(field.fieldType);
          const defaultVal = field.price90 || field.defaultPrice || 300000;
          setPrice(defaultVal.toLocaleString('vi-VN'));
        }
      };

      const handleFormSubmit = (e) => {
        e.preventDefault();
        
        let finalDate = date;
        if (date === "custom") {
          if (!customDate) return alert("Vui lòng chọn ngày!");
          const [yr, mn, dy] = customDate.split("-");
          finalDate = `${dy}/${mn}/${yr}`;
        }

        if (!price || isNaN(price.replace(/\D/g, ''))) return alert("Vui lòng nhập giá thuê hợp lệ!");

        const parsedPrice = parseInt(price.replace(/\D/g, ''));
        const selectedField = myFields.find(f => f.fieldId === selectedFieldId);

        onSubmit({
          venueName: myVenue?.name || "Sân chưa xác định",
          timeSlot: `${time} ${finalDate}`,
          date: finalDate,
          fieldId: selectedFieldId,
          fieldName: selectedField ? selectedField.fieldName : "Sân con",
          pitchType: selectedField ? selectedField.fieldType : pitchType,
          price: parsedPrice,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          notes: notes.trim()
        });
      };

      const handlePriceFormat = (e) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        if (!rawValue) {
          setPrice('');
          return;
        }
        const formatted = parseInt(rawValue).toLocaleString('vi-VN');
        setPrice(formatted);
      };

      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in px-4">
          <div className="absolute inset-0" onClick={onClose}></div>
          <div className="w-full max-w-md bg-appDark-bg border border-appDark-border rounded-2xl p-5 space-y-4 relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
            
            <div className="flex justify-between items-center border-b border-appDark-border pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-white">💼 Khách Đặt Sân</h3>
                <p className="text-[10px] text-slate-400">Ghi nhận sân đã được khách thuê kín</p>
              </div>
              <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-3">
                <h4 className="text-[11px] font-black text-emerald-500 uppercase tracking-widest border-l-2 border-emerald-500 pl-2">1. Thông tin Khách hàng</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Tên Khách</label>
                    <input type="text" required value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="VD: Anh Tuấn" className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">SĐT Khách</label>
                    <input type="tel" required pattern="[0-9]{10}" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="SĐT khách..." className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500" />
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-[11px] font-black text-cyan-400 uppercase tracking-widest border-l-2 border-cyan-400 pl-2">2. Thông tin Sân</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Ngày</label>
                    <select value={date} onChange={(e) => setDate(e.target.value)} className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400">
                      <option value={(() => { const d=new Date(); return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear(); })()}>Hôm nay</option>
                      <option value={(() => { const d=new Date(); d.setDate(d.getDate()+1); return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear(); })()}>Ngày mai</option>
                      <option value="custom">Ngày khác...</option>
                    </select>
                  </div>
                  {date === "custom" && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400">Chọn Ngày</label>
                      <input type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)} className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400" />
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Khung Giờ</label>
                    <input type="text" required value={time} onChange={(e) => setTime(e.target.value)} placeholder="VD: 19:00 - 20:30" className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Loại Sân</label>
                    {myFields.length > 0 ? (
                      <select 
                        value={selectedFieldId} 
                        onChange={(e) => handleFieldChange(e.target.value)} 
                        className="w-full text-xs font-semibold bg-appDark-deep border border-emerald-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                      >
                        {myFields.map(f => (
                          <option key={f.fieldId} value={f.fieldId}>
                            {f.fieldName} ({f.fieldType})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <select 
                        value={pitchType} 
                        onChange={(e) => setPitchType(e.target.value)} 
                        className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                      >
                        <option value="Sân 5">Sân 5 Người</option>
                        <option value="Sân 7">Sân 7 Người</option>
                        <option value="Sân 11">Sân 11 Người</option>
                      </select>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Giá Sân (VNĐ)</label>
                    <input type="text" required value={price} onChange={handlePriceFormat} placeholder="VD: 500.000" className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-1 pt-2">
                <label className="text-[10px] font-bold text-slate-400">Ghi chú (Tùy chọn)</label>
                <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="VD: Khách quen, thu cọc 200k..." className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500" />
              </div>

              <button type="submit" className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black py-3 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all">
                Lưu Chốt Sân
              </button>
            </form>
          </div>
        </div>
      );
    }

    function OwnerCreateMatchModal({ currentUser, venues, fields, onClose, onSubmit }) {
      const myVenue = venues.find(v => v.phone === currentUser.phone || v.owner_user_id === currentUser.id);
      const myFields = fields ? fields.filter(f => f.venueId === myVenue?.id && f.status !== "inactive") : [];
      
      const [date, setDate] = useState(() => {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${day}/${m}/${y}`;
      });
      const [customDate, setCustomDate] = useState("");
      
      const [time, setTime] = useState("19:00 - 20:30");
      const [selectedFieldId, setSelectedFieldId] = useState("");
      const [pitchType, setPitchType] = useState("Sân 5");
      const [price, setPrice] = useState("");
      const [contact, setContact] = useState(currentUser?.phone || "");
      
      const [teamName, setTeamName] = useState("");
      const [customerPhone, setCustomerPhone] = useState("");
      const [level, setLevel] = useState("Trung bình");
      const [notes, setNotes] = useState("");

      useEffect(() => {
        if (myFields.length > 0 && !selectedFieldId) {
          setSelectedFieldId(myFields[0].fieldId);
          setPitchType(myFields[0].fieldType);
          const defaultVal = myFields[0].price90 || myFields[0].defaultPrice || 300000;
          setPrice(defaultVal.toLocaleString('vi-VN'));
        }
      }, [myFields]);

      const handleFieldChange = (fieldId) => {
        setSelectedFieldId(fieldId);
        const field = myFields.find(f => f.fieldId === fieldId);
        if (field) {
          setPitchType(field.fieldType);
          const defaultVal = field.price90 || field.defaultPrice || 300000;
          setPrice(defaultVal.toLocaleString('vi-VN'));
        }
      };

      const handleFormSubmit = (e) => {
        e.preventDefault();
        
        let finalDate = date;
        if (date === "custom") {
          if (!customDate) return alert("Vui lòng chọn ngày!");
          const [yr, mn, dy] = customDate.split("-");
          finalDate = `${dy}/${mn}/${yr}`;
        }

        if (!price || isNaN(price.replace(/\D/g, ''))) return alert("Vui lòng nhập giá thuê hợp lệ!");

        const parsedPrice = parseInt(price.replace(/\D/g, ''));
        const selectedField = myFields.find(f => f.fieldId === selectedFieldId);

        onSubmit({
          venueName: myVenue?.name || "Sân chưa xác định",
          district: myVenue?.district || "Thủ Đức",
          address: myVenue?.address || "123 Phạm Văn Đồng, Thủ Đức",
          time,
          date: finalDate,
          fieldId: selectedFieldId,
          fieldName: selectedField ? selectedField.fieldName : "Sân con",
          pitchType: selectedField ? selectedField.fieldType : pitchType,
          price: parsedPrice,
          contact,
          teamName: teamName.trim(),
          customerPhone: customerPhone.trim(),
          level,
          notes: notes.trim()
        });
      };

      const handlePriceFormat = (e) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        if (!rawValue) {
          setPrice('');
          return;
        }
        const formatted = parseInt(rawValue).toLocaleString('vi-VN');
        setPrice(formatted);
      };

      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in px-4">
          <div className="absolute inset-0" onClick={onClose}></div>
          <div className="w-full max-w-md bg-appDark-bg border border-appDark-border rounded-2xl p-5 space-y-4 relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
            
            <div className="flex justify-between items-center border-b border-appDark-border pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-white">🔥 Đăng Kèo Tìm Đối</h3>
                <p className="text-[10px] text-slate-400">Tạo slot & đăng kèo hộ đội bóng</p>
              </div>
              <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-3">
                <h4 className="text-[11px] font-black text-amber-500 uppercase tracking-widest border-l-2 border-amber-500 pl-2">1. Thông tin Đội bóng</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Tên Đội Cần Tìm Đối</label>
                    <input type="text" required value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="VD: FC Gà Mờ" className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">SĐT Đội Khách</label>
                    <input type="tel" required pattern="[0-9]{10}" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="SĐT khách..." className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">Trình Độ Yêu Cầu</label>
                  <select value={level} onChange={e => setLevel(e.target.value)} className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500">
                    <option value="Yếu">Yếu - đá chơi vui vẻ</option>
                    <option value="Trung bình">Trung bình - giao lưu nhẹ nhàng</option>
                    <option value="Khá">Khá - đá nhiệt tình</option>
                    <option value="Mạnh">Mạnh - đá căng hết sức</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-[11px] font-black text-cyan-400 uppercase tracking-widest border-l-2 border-cyan-400 pl-2">2. Thông tin Khung giờ (Sân)</h4>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Ngày Đá</label>
                    <select value={date} onChange={e => setDate(e.target.value)} className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-2 py-2 text-white">
                      <option value={(() => { const d=new Date(); return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear(); })()}>Hôm nay</option>
                      <option value={(() => { const d=new Date(); d.setDate(d.getDate()+1); return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear(); })()}>Ngày mai</option>
                      <option value="custom">Tuỳ chọn...</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Giá Thuê (VNĐ)</label>
                    <input type="text" required value={price} onChange={handlePriceFormat} placeholder="Ví dụ: 350.000" className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-2 py-2 text-white" />
                  </div>
                </div>

                {date === "custom" && (
                  <div className="space-y-1 animate-fade-in">
                    <label className="text-[10px] font-bold text-cyan-400">Chọn ngày từ lịch</label>
                    <input type="date" required value={customDate} onChange={e => setCustomDate(e.target.value)} className="w-full text-xs font-semibold bg-appDark-deep border border-cyan-400 rounded-xl px-3 py-2 text-white" />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Loại Sân</label>
                  {myFields.length > 0 ? (
                    <select 
                      value={selectedFieldId} 
                      onChange={e => handleFieldChange(e.target.value)} 
                      className="w-full text-xs font-semibold bg-appDark-deep border border-neon-green/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-neon-green"
                    >
                      {myFields.map(f => (
                        <option key={f.fieldId} value={f.fieldId}>
                          {f.fieldName} ({f.fieldType})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <select 
                      value={pitchType} 
                      onChange={e => setPitchType(e.target.value)} 
                      className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2 text-white"
                    >
                      <option value="Sân 5">Sân 5 người</option>
                      <option value="Sân 7">Sân 7 người</option>
                      <option value="Sân 11">Sân 11 người</option>
                    </select>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">Khung Giờ</label>
                  <input type="text" required value={time} onChange={e => setTime(e.target.value)} placeholder="Nhập giờ..." className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2 text-white mb-1" />
                  <div className="flex flex-wrap gap-1 mt-1">
                    {["17:30 - 19:00", "19:00 - 20:30", "20:30 - 22:00"].map(t => (
                      <button key={t} type="button" onClick={() => setTime(t)} className="text-[9px] font-bold bg-appDark-deep hover:bg-cyan-500/20 text-slate-300 hover:text-white px-2 py-0.5 rounded border border-appDark-border/60 hover:border-cyan-500/40">
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <label className="text-[10px] font-bold text-slate-400">Lời Nhắn Tìm Đối (Tùy chọn)</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ví dụ: Đội đá giao lưu vui vẻ, chia tiền sân 50/50..." className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2 text-white focus:border-amber-500 h-16 resize-none" />
                </div>
              </div>

              <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black text-sm rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.4)] active:scale-95 transition-all">
                🚀 ĐĂNG KÈO LÊN BẢNG TIN
              </button>
            </form>
          </div>
        </div>
      );
    }

    function VenueRegModal({ currentUser, onClose, onSubmit }) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="absolute inset-0" onClick={onClose}></div>
          <form 
            onSubmit={onSubmit}
            className="w-[90%] max-w-sm bg-appDark-bg border border-appDark-border rounded-2xl p-5 space-y-4 relative z-10 animate-scale-in shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-white tracking-tight">Đăng Ký Chủ Sân</h3>
                <p className="text-[10px] text-slate-400">Gửi thông tin cho Admin xét duyệt</p>
              </div>
              <button 
                type="button" 
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-slate-800 border border-appDark-border flex items-center justify-center hover:bg-slate-700 text-slate-400 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 block uppercase">Tên sân bóng</label>
              <input type="text" name="venueName" required placeholder="Ví dụ: Sân cỏ nhân tạo Kỳ Hòa..." className="w-full text-xs bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-neon-green" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 block uppercase">Khu Vực (Quận)</label>
                <select name="district" className="w-full text-xs bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-slate-300 focus:outline-none focus:border-neon-green">
                  <option value="Thủ Đức">Thủ Đức</option>
                  <option value="Bình Thạnh">Bình Thạnh</option>
                  <option value="Gò Vấp">Gò Vấp</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 block uppercase">SĐT liên hệ sân</label>
                <input type="tel" name="venuePhone" defaultValue={currentUser?.phone || ""} required placeholder="10 số di động..." className="w-full text-xs bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-neon-green" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 block uppercase">Địa chỉ cụ thể</label>
              <input type="text" name="address" required placeholder="Địa chỉ chính xác..." className="w-full text-xs bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-neon-green" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 block uppercase">SỐ LƯỢNG SÂN ĐANG SỞ HỮU</label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400">Sân 5</span>
                  <input type="number" min="0" name="cap5" defaultValue="0" className="w-full text-xs bg-appDark-deep border border-appDark-border rounded-lg px-2 py-2 text-white focus:outline-none focus:border-neon-green text-center" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Sân 7</span>
                  <input type="number" min="0" name="cap7" defaultValue="0" className="w-full text-xs bg-appDark-deep border border-appDark-border rounded-lg px-2 py-2 text-white focus:outline-none focus:border-neon-green text-center" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Sân 11</span>
                  <input type="number" min="0" name="cap11" defaultValue="0" className="w-full text-xs bg-appDark-deep border border-appDark-border rounded-lg px-2 py-2 text-white focus:outline-none focus:border-neon-green text-center" />
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 block uppercase">Ghi chú thêm</label>
              <input type="text" name="venueNotes" placeholder="Tiện ích sân, giờ mở cửa..." className="w-full text-xs bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-neon-green" />
            </div>
            <button type="submit" className="w-full font-bold bg-gradient-to-r from-neon-green to-emerald-500 text-appDark-deep py-2.5 rounded-xl text-sm uppercase hover:scale-[1.02] active:scale-[0.98] transition-all">Gửi Xác Nhận</button>
          </form>
        </div>
      );
    }

    // 16. RATE OPPONENT MODAL
    function RateOpponentFormModal({ data, onClose, onSubmit }) {
      const [rating, setRating] = React.useState(5);
      const [matchResult, setMatchResult] = React.useState("win");

      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="absolute inset-0" onClick={onClose}></div>
          <form 
            onSubmit={(e) => { e.preventDefault(); onSubmit(rating, matchResult); }}
            className="w-[90%] max-w-sm bg-appDark-bg border border-appDark-border rounded-2xl p-6 space-y-5 relative z-10 animate-scale-in shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">Đánh Giá Đối Thủ</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Nhận xét về đội <strong className="text-neon-yellow">{data.targetTeamName}</strong></p>
              </div>
              <button 
                type="button" 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-800 border border-appDark-border flex items-center justify-center hover:bg-slate-700 text-slate-400 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 bg-appDark-deep p-4 rounded-xl border border-appDark-border/50 text-center">
              <label className="text-xs font-black uppercase text-slate-300">Rating Kỹ năng & Thái độ</label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-3xl transition-transform ${rating >= star ? 'grayscale-0 scale-110' : 'grayscale opacity-30 hover:opacity-60'}`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 font-bold">{rating} / 5 Sao</p>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black uppercase text-slate-300">Kết Quả Trận Đấu</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMatchResult("win")}
                  className={`py-3 rounded-xl border font-black text-xs transition-all ${matchResult === "win" ? 'bg-neon-green/20 border-neon-green text-neon-green shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-appDark-deep border-appDark-border text-slate-400 hover:border-slate-500'}`}
                >
                  Đội Tôi Thắng
                </button>
                <button
                  type="button"
                  onClick={() => setMatchResult("draw")}
                  className={`py-3 rounded-xl border font-black text-xs transition-all ${matchResult === "draw" ? 'bg-amber-500/20 border-amber-500 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 'bg-appDark-deep border-appDark-border text-slate-400 hover:border-slate-500'}`}
                >
                  Hòa
                </button>
                <button
                  type="button"
                  onClick={() => setMatchResult("lose")}
                  className={`py-3 rounded-xl border font-black text-xs transition-all ${matchResult === "lose" ? 'bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'bg-appDark-deep border-appDark-border text-slate-400 hover:border-slate-500'}`}
                >
                  Đội Tôi Thua
                </button>
              </div>
              <button
                type="button"
                onClick={() => setMatchResult("noshow")}
                className={`w-full py-3 mt-2 rounded-xl border font-black text-xs transition-all ${matchResult === "noshow" ? 'bg-red-600/20 border-red-500 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'bg-appDark-deep border-appDark-border text-slate-400 hover:border-slate-500'}`}
              >
                🚨 Đội Bạn Không Lên Đá (Bom Kèo)
              </button>
            </div>

            <button 
              type="submit" 
              className="w-full font-black bg-gradient-to-r from-sky-500 to-blue-600 text-white py-3.5 rounded-xl text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-sky-500/30"
            >
              Gửi Đánh Giá
            </button>
          </form>
        </div>
      );
    }

    function MatchSuggestionModal({ match, suggestedMatchesIds, allMatches, onClose, onIgnore, onInvite }) {
      const suggestions = allMatches.filter(m => suggestedMatchesIds.includes(m.id) && (m.status === 'waiting_opponent' || m.status === 'Thiếu người'));
      
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="absolute inset-0" onClick={onClose}></div>
          <div className="w-[90%] max-w-md bg-appDark-bg border border-appDark-border rounded-2xl p-5 space-y-4 relative z-10 animate-scale-in shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between shrink-0">
              <h3 className="text-lg font-extrabold text-white">💡 Gợi Ý Kèo Phù Hợp</h3>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 font-bold flex items-center justify-center hover:bg-slate-700 transition-colors">✕</button>
            </div>
            
            <p className="text-xs text-slate-400 shrink-0">Hệ thống tìm thấy một số kèo đang mở phù hợp với tiêu chí của bạn. Bạn có muốn gửi lời mời ngay?</p>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 no-scrollbar">
              {suggestions.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">Không còn kèo phù hợp nào đang mở.</div>
              ) : (
                suggestions.map(s => {
                  const isVeryMatch = s.district === match.district;
                  const matchLevelText = isVeryMatch ? '🔥 Rất phù hợp' : '✨ Phù hợp';
                  const matchLevelColor = isVeryMatch ? 'text-orange-400 bg-orange-400/10 border-orange-400/20' : 'text-blue-400 bg-blue-400/10 border-blue-400/20';

                  return (
                    <div key={s.id} className="bg-appDark-deep border border-appDark-border rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-white font-bold">{s.teamName || 'Đội chưa có tên'}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{s.district} • {s.pitchType}</div>
                        </div>
                        <span className={`text-[10px] px-2 py-1 rounded border font-medium ${matchLevelColor}`}>
                          {matchLevelText}
                        </span>
                      </div>
                      
                      <div className="flex gap-4 text-xs font-medium bg-black/20 p-2 rounded-lg">
                        <div className="flex flex-col">
                          <span className="text-slate-500 text-[10px]">Thời gian</span>
                          <span className="text-neon-green">{s.time.split(' ')[0]}</span>
                        </div>
                        <div className="flex flex-col border-l border-white/5 pl-4">
                          <span className="text-slate-500 text-[10px]">Trình độ</span>
                          <span className="text-white">{s.level}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button 
                          onClick={() => onInvite(s.id)}
                          className="flex-1 bg-neon-green text-appDark-deep font-bold text-xs py-2.5 rounded-lg hover:bg-green-400 transition-colors"
                        >
                          Gửi lời mời
                        </button>
                        <button 
                          onClick={() => onIgnore(s.id)}
                          className="px-4 bg-appDark-bg border border-appDark-border text-slate-300 font-bold text-xs py-2.5 rounded-lg hover:bg-slate-800 transition-colors"
                        >
                          Bỏ qua
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      );
    }

export default App;
