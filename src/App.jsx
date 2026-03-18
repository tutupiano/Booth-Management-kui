import React, { useState, useEffect, useMemo, useRef, useCallback, memo } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, doc, addDoc, updateDoc, onSnapshot, getDocs, writeBatch, setDoc } from 'firebase/firestore';
import { 
  ShoppingCart, PackageCheck, History as HistoryIcon, 
  RotateCcw, Download, Filter, RefreshCcw, 
  ChevronUp, ChevronDown, ChevronsUp, ChevronsDown,
  Receipt, AlertCircle, Banknote, Landmark, Check, Lock, Unlock, Volume2, VolumeX, BellRing, Loader2, X, Settings, Plus, Trash2, Edit3, Image as ImageIcon, Info, GripVertical, User, AlertTriangle
} from 'lucide-react';

// --- [CONFIGURATION] ---
const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : {
      apiKey: "AIzaSyB7FOLlxPFT0VWFw3unZ-M_Zfasze5XzN8",
      authDomain: "booth-management-kui.firebaseapp.com",
      projectId: "booth-management-kui",
      storageBucket: "booth-management-kui.firebasestorage.app",
      messagingSenderId: "766168881320",
      appId: "1:766168881320:web:b4fd5704509ae527e54a9d",
      measurementId: "G-5D2XBGSDVR"
    };

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : "m5-integrated-v8-5"; 
const ADMIN_PW = "0927";

// --- [GLOBAL UTILITIES] ---
const formatPrice = (p) => Number(p || 0).toLocaleString('ko-KR');

const getDarkerColor = (hex, amount = 120) => {
  if (!hex || hex === "#FFFFFF") return "#333333";
  let h = hex.replace("#", "");
  let num = parseInt(h, 16);
  let r = Math.max(0, (num >> 16) - amount);
  let g = Math.max(0, ((num >> 8) & 0x00FF) - amount);
  let b = Math.max(0, (num & 0x0000FF) - amount);
  return "#" + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
};

const resizeImage = (file, targetSize) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, targetSize, targetSize);
        resolve(canvas.toDataURL('image/jpeg', 0.7)); 
      };
    };
  });
};

// --- [V8.8 FULL RESTORED DATA] ---
const INITIAL_PRODUCTS = {
  "츠오미": [
    { id: "tsu_1", name: "키레네 포스터", artist: "2o水", count: 0, price: 10000, unit: "개", color: "#FFD1DC", image: "" }
  ],
  "꾸이꾸이": [
    { id: "kui_1", name: "포카 : 선데이", artist: "KUIKUI💀", count: 0, price: 2000, unit: "개", color: "#CCEEFF", image: "" },
    { id: "kui_2", name: "포카 : 파이논", artist: "KUIKUI💀", count: 0, price: 2000, unit: "개", color: "#CCEEFF", image: "" },
    { id: "kui_3", name: "포카 : 마이데이", artist: "KUIKUI💀", count: 0, price: 2000, unit: "개", color: "#CCEEFF", image: "" },
    { id: "kui_4", name: "포카 : 단항", artist: "KUIKUI💀", count: 0, price: 2000, unit: "개", color: "#CCEEFF", image: "" },
    { id: "kui_5", name: "포카 SET", artist: "KUIKUI💀", count: 0, price: 7000, unit: "세트", color: "#CCEEFF", image: "" },
    { id: "kui_6", name: "아크릴 키링 : 선데이", artist: "KUIKUI💀", count: 0, price: 7000, unit: "개", color: "#CCEEFF", image: "" },
    { id: "kui_7", name: "아크릴 키링 : 파이논", artist: "KUIKUI💀", count: 0, price: 7000, unit: "개", color: "#CCEEFF", image: "" },
    { id: "kui_8", name: "아크릴 키링 : 마이데이", artist: "KUIKUI💀", count: 0, price: 7000, unit: "개", color: "#CCEEFF", image: "" },
    { id: "kui_9", name: "아크릴 키링 : 단항", artist: "KUIKUI💀", count: 0, price: 7000, unit: "개", color: "#CCEEFF", image: "" },
    { id: "kui_10", name: "아크릴 키링 SET", artist: "KUIKUI💀", count: 0, price: 26000, unit: "세트", color: "#CCEEFF", image: "" },
    { id: "kui_11", name: "키링참 : 선데이", artist: "KUIKUI💀", count: 0, price: 16000, unit: "개", color: "#CCEEFF", image: "" },
    { id: "kui_12", name: "키링참 : 파이논", artist: "KUIKUI💀", count: 0, price: 16000, unit: "개", color: "#CCEEFF", image: "" },
    { id: "kui_13", name: "키링참 : 마이데이", artist: "KUIKUI💀", count: 0, price: 16000, unit: "개", color: "#CCEEFF", image: "" },
    { id: "kui_14", name: "키링참 : 단항", artist: "KUIKUI💀", count: 0, price: 16000, unit: "개", color: "#CCEEFF", image: "" },
    { id: "kui_15", name: "키링참 SET", artist: "KUIKUI💀", count: 0, price: 60000, unit: "세트", color: "#CCEEFF", image: "" },
    { id: "kui_16", name: "장패드", artist: "KUIKUI💀", count: 0, price: 20000, unit: "개", color: "#CCEEFF", image: "" }
  ],
  "두근": [
    { id: "du_1", name: "레츄 만화책", artist: "DUGEUN", count: 0, price: 4000, unit: "권", color: "#EAE7E2", image: "" },
    { id: "du_2", name: "교복 포카 : 파이논", artist: "DUGEUN", count: 0, price: 1000, unit: "개", color: "#EAE7E2", image: "" },
    { id: "du_3", name: "교복 포카 : 아낙사", artist: "DUGEUN", count: 0, price: 1000, unit: "개", color: "#EAE7E2", image: "" },
    { id: "du_4", name: "교복 포카 : 마이데이", artist: "DUGEUN", count: 0, price: 1000, unit: "개", color: "#EAE7E2", image: "" },
    { id: "du_5", name: "교복 포카 : 스텔레", artist: "DUGEUN", count: 0, price: 1000, unit: "개", color: "#EAE7E2", image: "" },
    { id: "du_6", name: "교복 포카 : 카일루스", artist: "DUGEUN", count: 0, price: 1000, unit: "개", color: "#EAE7E2", image: "" },
    { id: "du_7", name: "히아킨 스티커", artist: "DUGEUN", count: 0, price: 3000, unit: "개", color: "#EAE7E2", image: "" },
    { id: "du_8", name: "엡나&31 스티커", artist: "DUGEUN", count: 0, price: 3000, unit: "개", color: "#EAE7E2", image: "" },
    { id: "du_9", name: "척자 스티커", artist: "DUGEUN", count: 0, price: 3000, unit: "개", color: "#EAE7E2", image: "" }
  ],
  "기타": [
    { id: "etc_1", name: "낙텔 소설책", artist: "기타", count: 0, price: 15000, unit: "권", color: "#FFFFFF", image: "" },
    { id: "etc_2", name: "조각 스티커", artist: "기타", count: 0, price: 2000, unit: "개", color: "#FFFFFF", image: "" },
    { id: "etc_3", name: "수제 싸인지", artist: "기타", count: 0, price: 25000, unit: "장", color: "#FFFFFF", image: "" }
  ]
};

const DEFAULT_KIOSK_SETTINGS = {
  title: "계좌이체 안내",
  subtitle: "아래의 계좌로 입금 후 말씀해주세요!",
  bankName: "토스뱅크(모임통장)",
  accountNumber: "1002-4834-3267",
  accountHolder: "ㅂㅎㅂ",
  footerNote: "💸송금 전, 결제 정보와 송금액을 꼭 확인하고 보내주세요!",
  qrImageUrl: ""
};

// --- [MEMOIZED PRODUCT CARD] ---
const ProductCard = memo(({ p, cat, onUpdate }) => {
  const darkerColor = getDarkerColor(p.color, 140);
  return (
    <div style={{ backgroundColor: p.color || '#FFFFFF' }} className="rounded-[32px] p-5 flex flex-col items-center shadow-sm border-b-[6px] border-black/5 transition-transform active:scale-[0.99]">
      <div className="w-full flex justify-between items-start mb-4 font-bold text-left">
        <div className="flex gap-4 items-center flex-1">
          {p.image && <img src={p.image} className="w-16 h-16 rounded-[22px] object-cover border-4 border-white shadow-md" alt="Thumb" />}
          <div className="flex-1">
            <div className="flex items-center justify-between">
               <p className="font-black text-[18px] leading-tight text-black">{p.name}</p>
               <span className="text-[10px] text-zinc-500 font-bold bg-white/40 px-2.5 py-0.5 rounded-full border border-black/5 shrink-0 ml-1">담당: {p.artist}</span>
            </div>
            <p className="text-[17px] font-black mt-2" style={{ color: darkerColor }}>{formatPrice(p.price)}원 / {p.unit}</p>
          </div>
        </div>
        {p.count > 0 && <div className="bg-black text-white px-3 py-1 rounded-full text-[10px] animate-bounce shadow-lg ml-2 shrink-0">담김</div>}
      </div>
      <div className="flex items-center justify-center gap-1 bg-white/50 p-2 rounded-[24px] w-full max-w-[340px] shadow-inner font-bold">
        <button onClick={() => onUpdate(cat, p.id, -5)} className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center active:scale-90 shadow-sm"><ChevronsDown size={22}/></button>
        <button onClick={() => onUpdate(cat, p.id, -1)} className="w-12 h-12 bg-white rounded-xl flex items-center justify-center active:scale-90 border border-zinc-200"><ChevronDown size={22}/></button>
        <div className="flex-1 text-center font-black text-3xl tabular-nums bg-white/80 h-12 flex items-center justify-center rounded-xl mx-1 shadow-sm">{p.count}</div>
        <button onClick={() => onUpdate(cat, p.id, 1)} className="w-12 h-12 bg-white rounded-xl flex items-center justify-center active:scale-90 border border-zinc-200"><ChevronUp size={22}/></button>
        <button onClick={() => onUpdate(cat, p.id, 5)} className="w-12 h-12 bg-black text-white rounded-xl active:scale-90 shadow-md"><ChevronsUp size={22}/></button>
      </div>
    </div>
  );
});

// --- [MAIN COMPONENT] ---
const App = () => {
  const [user, setUser] = useState(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [viewMode, setViewMode] = useState('order'); 
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [categoryOrder, setCategoryOrder] = useState(["츠오미", "꾸이꾸이", "두근", "기타"]);
  const [kioskSettings, setKioskSettings] = useState(DEFAULT_KIOSK_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connStatus, setConnStatus] = useState('initializing');
  const [isSoundOn, setIsSoundOn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [adminPwInput, setAdminPwInput] = useState('');
  const [showOrderDonePopup, setShowOrderDonePopup] = useState(false);
  const [showNewOrderPopup, setShowNewOrderPopup] = useState(false);
  const [showResetAuthModal, setShowResetAuthModal] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [showToast, setShowToast] = useState(null);
  const [paymentType, setPaymentType] = useState('transfer');
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [packingChecked, setPackingChecked] = useState({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ paymentType: 'all', category: 'all', artist: 'all', startTime: '', endTime: '', selectedItems: [], minPrice: '', maxPrice: '' });
  const [draggedItem, setDraggedItem] = useState(null);

  const audioContextRef = useRef(null);
  const notifiedOrderIds = useRef(new Set());
  const isInitialLoad = useRef(true);

  // --- [UTILITIES] ---
  const getCategoryInfo = useCallback((itemName) => {
    for (const [cat, items] of Object.entries(products)) {
      if (Array.isArray(items) && items.some(i => i.name === itemName)) {
        return { char: cat[0] || "?", color: items[0]?.color || "#FFFFFF", fullName: cat };
      }
    }
    return { char: "기", color: "#FFFFFF", fullName: "기타" };
  }, [products]);

  const receiptItems = useMemo(() => {
    let items = []; let total = 0;
    Object.entries(products).forEach(([cat, list]) => {
      if (Array.isArray(list)) {
        list.forEach(p => {
          if (p.count > 0) { items.push({ ...p, category: cat, itemTotal: p.count * p.price }); total += p.count * p.price; }
        });
      }
    });
    return { items, total };
  }, [products]);

  const updateItemCount = useCallback((cat, id, delta) => {
    setProducts(prev => {
      const next = { ...prev };
      if (next[cat]) next[cat] = next[cat].map(p => p.id === id ? { ...p, count: Math.max(0, Math.min(999, p.count + delta)) } : p);
      return next;
    });
  }, []);

  const playiPhoneDing = useCallback(async () => {
    if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();
    const ctx = audioContextRef.current;
    const now = ctx.currentTime;
    const playTone = (freq, vol, start, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + start);
      gain.gain.setValueAtTime(vol, now + start);
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + duration);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now + start); osc.stop(now + start + duration);
    };
    playTone(1318.51, 0.1, 0, 0.4); 
    playTone(1567.98, 0.1, 0.1, 0.4); 
  }, []);

  const toggleSound = useCallback(() => {
    if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    if (audioContextRef.current.state === 'suspended') audioContextRef.current.resume();
    const nextState = !isSoundOn;
    setIsSoundOn(nextState);
    if (nextState) playiPhoneDing();
  }, [isSoundOn, playiPhoneDing]);

  // --- [DB SYNC] ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) { setConnStatus('error'); }
    };
    initAuth();
    onAuthStateChanged(auth, (u) => { 
      setUser(u); setIsLoading(false); 
      if (u) setConnStatus('connected');
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubOrders = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const sorted = data.sort((a, b) => b.timestamp - a.timestamp);
      const pending = data.filter(o => o.status === 'pending');
      
      if (isInitialLoad.current) {
        pending.forEach(o => notifiedOrderIds.current.add(o.id));
        isInitialLoad.current = false;
      } else {
        let hasNew = false;
        pending.forEach(o => { if (!notifiedOrderIds.current.has(o.id)) { notifiedOrderIds.current.add(o.id); hasNew = true; } });
        if (hasNew && isSoundOn) {
          playiPhoneDing();
          if (viewMode === 'packing') setShowNewOrderPopup(true);
        }
      }
      setOrders(sorted);
      setConnStatus('connected');
    }, () => setConnStatus('error'));

    const metadataDoc = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'metadata');
    const unsubMeta = onSnapshot(metadataDoc, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.products) setProducts(data.products);
        if (data.categoryOrder) setCategoryOrder(data.categoryOrder);
        if (data.kioskSettings) setKioskSettings(data.kioskSettings);
      } else {
        setDoc(metadataDoc, { products: INITIAL_PRODUCTS, categoryOrder: ["츠오미", "꾸이꾸이", "두근", "기타"], kioskSettings: DEFAULT_KIOSK_SETTINGS });
      }
    });

    return () => { unsubOrders(); unsubMeta(); };
  }, [user, viewMode, isSoundOn, playiPhoneDing]);

  // --- [FILTERED ORDERS FOR DISPLAY AND EXCEL] ---
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (filters.paymentType !== 'all' && o.paymentType !== filters.paymentType) return false;
      const val = o.total || o.lossValue;
      if (filters.minPrice && val < Number(filters.minPrice)) return false;
      if (filters.maxPrice && val > Number(filters.maxPrice)) return false;
      if (filters.category !== 'all' && !o.items.some(it => getCategoryInfo(it.name).fullName === filters.category)) return false;
      if (filters.artist !== 'all' && !o.items.some(it => it.artist === filters.artist)) return false;
      if (filters.startTime || filters.endTime) {
        const d = new Date(o.timestamp); const currentMins = d.getHours() * 60 + d.getMinutes();
        if (filters.startTime) { const [h, m] = filters.startTime.split(':').map(Number); if (currentMins < h * 60 + m) return false; }
        if (filters.endTime) { const [h, m] = filters.endTime.split(':').map(Number); if (currentMins > h * 60 + m) return false; }
      }
      if (filters.selectedItems.length > 0 && !o.items.some(it => filters.selectedItems.includes(it.name))) return false;
      return true;
    });
  }, [orders, filters, getCategoryInfo]);

  const ALL_ITEM_NAMES_SORTED = useMemo(() => {
    const set = new Set(); Object.values(products).flat().forEach(p => set.add(p.name));
    return Array.from(set).sort((a,b) => a.localeCompare(b, 'ko')); 
  }, [products]);

  const ALL_ARTISTS_LIST = useMemo(() => {
    const set = new Set(); Object.values(products).flat().forEach(p => set.add(p.artist));
    return Array.from(set).sort((a,b) => a.localeCompare(b, 'ko'));
  }, [products]);

  // --- [EVENT HANDLERS] ---
  const handleAdminAuth = () => {
    if (adminPwInput === ADMIN_PW) {
      setIsAdminMode(true); setShowAuthModal(false); setAdminPwInput('');
      setShowToast("관리자 인증 성공");
    } else { setShowToast("비밀번호 불일치"); }
    setTimeout(() => setShowToast(null), 2000);
  };

  const handleOrderSubmit = async () => {
    if (receiptItems.items.length === 0 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const orderData = {
        orderNo: orders.length + 1,
        items: receiptItems.items.map(i => ({ name: i.name, count: i.count, price: i.price, artist: i.artist })),
        total: paymentType === 'loss' ? 0 : receiptItems.total,
        lossValue: paymentType === 'loss' ? receiptItems.total : 0,
        paymentType, status: paymentType === 'loss' ? 'packed' : 'pending',
        timestamp: Date.now(), createdAt: new Date().toLocaleTimeString('ko-KR')
      };
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), orderData);
      setProducts(prev => {
        const n = { ...prev };
        Object.keys(n).forEach(c => n[c] = n[c].map(p => ({ ...p, count: 0 })));
        return n;
      });
      setIsReceiptOpen(false);
      if (paymentType !== 'loss') setShowOrderDonePopup(true);
      else setShowToast("파손 기록 완료");
    } catch (e) { setShowToast("저장 실패"); }
    finally { setIsSubmitting(false); setTimeout(() => setShowToast(null), 2500); }
  };

  const markAsPacked = async (id) => {
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', id), { status: 'packed' });
    setShowToast("포장 완료");
    setTimeout(() => setShowToast(null), 1500);
  };

  const downloadCSV = () => {
    // 1. 현재 필터링된 내역을 시간순(정순)으로 재정렬
    const targetOrders = [...filteredOrders].sort((a, b) => a.timestamp - b.timestamp);
    if (targetOrders.length === 0) { setShowToast("출력할 내역이 없습니다."); return; }
    
    const artistSales = {}; 
    const artistLosses = {}; 
    let totalRev = 0;
    let totalLoss = 0;

    const rows = targetOrders.map((o) => {
      const payKo = o.paymentType === 'cash' ? '현금' : o.paymentType === 'transfer' ? '계좌' : '파손';
      const detail = o.items.map(it => {
        const itemTotal = it.price * it.count;
        if (o.paymentType !== 'loss') {
          artistSales[it.artist] = (artistSales[it.artist] || 0) + itemTotal;
          totalRev += itemTotal;
        } else {
          artistLosses[it.artist] = (artistLosses[it.artist] || 0) + itemTotal;
          totalLoss += itemTotal;
        }
        return `[${it.artist}] ${it.name}(${it.count})`;
      }).join('\n');
      return [o.orderNo, payKo, `"${detail}"`, (o.total || o.lossValue)];
    });

    const summary = [
      [],
      ["--- [ 작가별 실제 판매 수익 정산 (조회 필터 기준) ] ---"],
      ["작가명", "정산 금액"],
      ...Object.entries(artistSales).map(([n, t]) => [n, `"${t.toLocaleString()}원"`]),
      ["실제 판매 총 수익 합계", `"${totalRev.toLocaleString()}원"`],
      [],
      ["--- [ 작가별 파손 및 분실 손실 내역 (조회 필터 기준) ] ---"],
      ["작가명", "손실 금액"],
      ...Object.entries(artistLosses).map(([n, t]) => [n, `"${t.toLocaleString()}원"`]),
      ["파손/분실 총 손실 합계", `"${totalLoss.toLocaleString()}원"`]
    ];

    const blob = new Blob(["\uFEFF" + [["번호", "유형", "주문 상세", "금액"], ...rows, ...summary].map(e => e.join(",")).join("\n")], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob); 
    link.download = `booth_v8.8_settlement_${new Date().toLocaleDateString()}.csv`; 
    link.click();
  };

  const handleImageFile = async (cat, idx, mode) => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setIsSubmitting(true);
      try {
        const targetSize = mode === 'kiosk' ? 450 : 100;
        const resized = await resizeImage(file, targetSize);
        if (mode === 'kiosk') setKioskSettings(prev => ({ ...prev, qrImageUrl: resized }));
        else setProducts(prev => { const n = { ...prev }; n[cat][idx].image = resized; return n; });
        setShowToast("이미지 등록 완료");
      } catch (err) { setShowToast("이미지 처리 실패"); }
      finally { setIsSubmitting(false); setTimeout(() => setShowToast(null), 2000); }
    };
    input.click();
  };

  // Drag & Drop
  const onDragStart = (cat, idx) => setDraggedItem({ cat, idx });
  const onDragOver = (e) => {
    e.preventDefault();
    const threshold = 120;
    if (e.clientY < threshold) window.scrollBy(0, -15);
    if (window.innerHeight - e.clientY < threshold) window.scrollBy(0, 15);
  };
  const onDrop = (targetCat, targetIdx) => {
    if (!draggedItem) return;
    const { cat: srcCat, idx: srcIdx } = draggedItem;
    const nextP = { ...products };
    const [moved] = nextP[srcCat].splice(srcIdx, 1);
    moved.color = nextP[targetCat]?.[0]?.color || "#FFFFFF";
    if (targetIdx === -1) (nextP[targetCat] = nextP[targetCat] || []).push(moved);
    else nextP[targetCat].splice(targetIdx, 0, moved);
    setProducts(nextP); setDraggedItem(null);
    setShowToast("위치 변경됨 ✨");
  };

  if (isLoading) return <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white font-bold"><Loader2 className="animate-spin text-emerald-500 mb-4" size={40}/><p className="animate-pulse">시스템 로딩 중...</p></div>;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-black font-sans pb-40">
      <header className="sticky top-0 z-50 bg-black text-white px-4 py-3 shadow-2xl font-bold border-b border-white/5">
        <div className="w-full flex justify-between items-center mb-3">
          <div className="w-48 flex flex-col shrink-0 text-left">
            <h1 className="text-[16px] font-black tracking-tighter uppercase leading-none">부스 현장판매 관리 시스템</h1>
            <p className="text-[10px] text-zinc-500 font-bold mt-1.5 opacity-80 italic leading-none font-bold tracking-widest">by. KUIKUI💀 <span className="text-emerald-500 ml-1">V8.8</span></p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowOrderDonePopup(true)} className="p-2 rounded-full bg-zinc-800 text-white active:scale-90 shadow-sm"><Info size={18} /></button>
            <button onClick={toggleSound} className={`p-2 rounded-full transition-all active:scale-90 ${isSoundOn ? 'text-emerald-500 bg-emerald-500/10' : 'text-zinc-600 bg-zinc-900'}`}>{isSoundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}</button>
            <button onClick={() => isAdminMode ? (setIsAdminMode(false), setViewMode('order')) : setShowAuthModal(true)} className={`p-2 rounded-full transition-all active:scale-90 ${isAdminMode ? 'text-amber-500 bg-amber-500/10' : 'text-zinc-600 bg-zinc-900'}`}>{isAdminMode ? <Unlock size={18} /> : <Lock size={18} />}</button>
          </div>
        </div>
        <nav className="w-full flex justify-center p-0.5 bg-zinc-900 rounded-2xl font-bold">
           <div className={`flex w-full ${isAdminMode ? 'max-w-md' : 'max-w-xs'} gap-1`}>
             <button onClick={() => setViewMode('order')} className={`flex-1 py-2.5 rounded-xl text-[11px] font-black transition-all ${viewMode === 'order' ? 'bg-white text-black shadow-lg scale-[1.02]' : 'text-zinc-500'}`}>주문</button>
             {isAdminMode && (
               <>
                 <button onClick={() => setViewMode('packing')} className={`flex-1 py-2.5 rounded-xl text-[11px] font-black transition-all ${viewMode === 'packing' ? 'bg-emerald-600 text-white shadow-lg scale-[1.02]' : 'text-zinc-500'}`}>포장</button>
                 <button onClick={() => setViewMode('history')} className={`flex-1 py-2.5 rounded-xl text-[11px] font-black transition-all ${viewMode === 'history' ? 'bg-zinc-700 text-white shadow-lg' : 'text-zinc-500'}`}>장부</button>
                 <button onClick={() => setViewMode('settings')} className={`flex-1 py-2.5 rounded-xl text-[11px] font-black transition-all ${viewMode === 'settings' ? 'bg-amber-600 text-white shadow-lg' : 'text-zinc-500'} flex items-center justify-center`}><Settings size={14}/></button>
               </>
             )}
           </div>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto p-3 font-bold">
        {viewMode === 'order' && (
          <div className="space-y-6">
            {isAdminMode && (
               <div className="bg-white rounded-[32px] p-5 shadow-sm border border-zinc-100 font-bold flex justify-between items-center animate-in slide-in-from-top-4">
                 <span className="text-[11px] font-black text-zinc-400 ml-2 uppercase">Admin Exclusive</span>
                 <button onClick={() => setPaymentType(p => p === 'loss' ? 'transfer' : 'loss')} className={`px-6 py-3 rounded-2xl text-[11px] font-black transition-all border-2 ${paymentType === 'loss' ? 'bg-red-600 text-white border-red-600 shadow-lg' : 'bg-red-50 text-red-400 border-red-100'}`}>파손 / 분실 기록 모드</button>
               </div>
            )}
            {categoryOrder.map((cat) => (
              <section key={cat} className="space-y-3 font-bold text-left">
                <h2 className="text-base font-black border-l-[4px] border-black pl-2 uppercase">{cat}</h2>
                <div className="grid grid-cols-1 gap-3">
                  {(products[cat] || []).map((p) => (
                    <ProductCard key={p.id} p={p} cat={cat} onUpdate={updateItemCount} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {viewMode === 'packing' && (
           <div className="space-y-5 pb-20 font-bold animate-in slide-in-from-bottom-6 text-left">
             <h2 className="text-xl font-black italic border-b-2 border-black pb-2">포장 대기 리스트</h2>
             {orders.filter(o => o.status === 'pending').length === 0 ? (
                <div className="py-24 text-center text-zinc-300 font-bold text-xs uppercase">No pending orders</div>
             ) : (
               orders.filter(o => o.status === 'pending').map(order => (
                 <div key={order.id} className="bg-white border-2 border-black rounded-[32px] p-6 shadow-xl border-b-8 border-r-4">
                    <div className="flex justify-between items-center mb-4 border-b pb-3 border-zinc-100">
                       <h3 className="text-xl font-black italic font-black">No.{order.orderNo}</h3>
                       <span className="text-[10px] font-mono opacity-40 bg-zinc-50 px-2 py-1 rounded">{order.createdAt}</span>
                    </div>
                    <div className="space-y-1.5 mb-6 bg-zinc-50 p-4 rounded-2xl border border-zinc-100 font-bold">
                       {order.items.map((it, idx) => (
                         <div key={idx} onClick={() => { const k = `${order.id}-${idx}`; setPackingChecked(prev => ({ ...prev, [k]: !prev[k] })); }} 
                              className={`flex justify-between items-center text-[13px] font-bold py-2 border-b border-zinc-200 last:border-0 cursor-pointer transition-all ${packingChecked[`${order.id}-${idx}`] ? 'opacity-20 line-through' : ''}`}>
                           <span className="flex items-center gap-2 font-bold truncate pr-3">
                             <div className={`w-1.5 h-1.5 rounded-full ${packingChecked[`${order.id}-${idx}`] ? 'bg-zinc-300' : 'bg-black animate-pulse'}`} />
                             {it.name}
                           </span>
                           <span className="bg-black text-white px-2.5 py-0.5 rounded-md text-[10px] font-bold">x {it.count}</span>
                         </div>
                       ))}
                    </div>
                    <button onClick={() => markAsPacked(order.id)} className="w-full py-5 bg-emerald-600 text-white rounded-[24px] font-black shadow-lg active:scale-95 text-base">포장 완료</button>
                 </div>
               ))
             )}
           </div>
        )}

        {viewMode === 'history' && (
           <div className="space-y-5 pb-20 font-bold animate-in fade-in text-left">
             <div className="flex justify-between items-center px-1">
               <div className="flex flex-col">
                 <h2 className="text-xl font-black uppercase">판매 통합 장부</h2>
                 <span className="text-[8px] opacity-40 uppercase tracking-widest font-mono">Live Data Sync</span>
               </div>
               <div className="flex gap-2">
                 <button onClick={downloadCSV} className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shadow-sm active:scale-90"><Download size={20} /></button>
                 <button onClick={() => setIsFilterOpen(!isFilterOpen)} className={`p-2.5 rounded-xl transition-all ${isFilterOpen ? 'bg-black text-white shadow-lg' : 'bg-white border text-zinc-300'}`}><Filter size={20} /></button>
                 <button onClick={() => setShowResetAuthModal(true)} className="p-2.5 bg-red-50 text-red-500 rounded-xl shadow-sm active:scale-90 font-black"><RotateCcw size={20} /></button>
               </div>
             </div>

             {isFilterOpen && (
                <div className="bg-white border-2 border-black p-5 rounded-[28px] shadow-2xl space-y-4 animate-in slide-in-from-top-4 font-bold">
                    <div className="grid grid-cols-2 gap-2">
                      <select value={filters.paymentType} onChange={(e) => setFilters({...filters, paymentType: e.target.value})} className="w-full bg-zinc-50 border-none rounded-xl p-3 text-[11px] font-bold focus:ring-1 focus:ring-black">
                        <option value="all">전체 수단</option><option value="cash">현금</option><option value="transfer">계좌</option><option value="loss">파손</option>
                      </select>
                      <select value={filters.category} onChange={(e) => setFilters({...filters, category: e.target.value})} className="w-full bg-zinc-50 border-none rounded-xl p-3 text-[11px] font-bold">
                        <option value="all">전체 카테고리</option>{categoryOrder.map(k => <option key={k} value={k}>{k}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <select value={filters.artist} onChange={(e) => setFilters({...filters, artist: e.target.value})} className="w-full bg-zinc-50 border-none rounded-xl p-3 text-[11px] font-bold">
                        <option value="all">전체 작가</option>{ALL_ARTISTS_LIST.map(k => <option key={k} value={k}>{k}</option>)}
                      </select>
                      <div className="flex gap-1">
                         <input type="number" placeholder="최소금액" value={filters.minPrice} onChange={(e) => setFilters({...filters, minPrice: e.target.value})} className="w-1/2 bg-zinc-50 border-none rounded-xl p-3 text-[10px] font-bold" />
                         <input type="number" placeholder="최대금액" value={filters.maxPrice} onChange={(e) => setFilters({...filters, maxPrice: e.target.value})} className="w-1/2 bg-zinc-50 border-none rounded-xl p-3 text-[10px] font-bold" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <input type="time" value={filters.startTime} onChange={(e) => setFilters({...filters, startTime: e.target.value})} className="w-1/2 bg-zinc-50 border-none rounded-xl p-3 text-[11px] font-bold" />
                       <input type="time" value={filters.endTime} onChange={(e) => setFilters({...filters, endTime: e.target.value})} className="w-1/2 bg-zinc-50 border-none rounded-xl p-3 text-[11px] font-bold" />
                    </div>
                    <div className="max-h-40 overflow-y-auto border p-2 rounded-xl bg-zinc-50">
                      {ALL_ITEM_NAMES_SORTED.map(name => (
                        <label key={name} className="flex items-center gap-2 p-2 hover:bg-white rounded-lg text-sm cursor-pointer select-none font-bold">
                          <input type="checkbox" checked={filters.selectedItems.includes(name)} onChange={(e) => { const next = e.target.checked ? [...filters.selectedItems, name] : filters.selectedItems.filter(i => i !== name); setFilters({...filters, selectedItems: next}); }} className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500" />
                          <span className="truncate">{name}</span>
                        </label>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => setFilters({paymentType:'all',category:'all',artist:'all',startTime:'',endTime:'',selectedItems:[],minPrice:'',maxPrice:''})} className="py-4 bg-zinc-100 text-zinc-400 rounded-2xl font-bold text-sm">초기화</button>
                      <button onClick={() => setIsFilterOpen(false)} className="py-4 bg-black text-white rounded-2xl font-bold text-sm shadow-xl active:scale-95 transition-all">조회 적용</button>
                    </div>
                </div>
             )}

             <div className="space-y-3.5">
               {filteredOrders.map(order => (
                 <div key={order.id} className={`bg-white border rounded-[22px] p-5 shadow-sm border-l-[12px] ${order.status === 'packed' ? 'border-l-zinc-200 opacity-60' : (order.paymentType === 'loss' ? 'border-l-red-600 shadow-lg' : 'border-l-emerald-500 shadow-md')}`}>
                   <div className="flex justify-between items-center mb-2.5 opacity-70 font-black">
                      <span className="flex items-center gap-2">
                         <span className={`text-[10px] px-2 py-0.5 rounded-md ${order.paymentType === 'loss' ? 'bg-red-50 text-red-600' : 'bg-zinc-100 text-zinc-500'}`}>
                            {order.paymentType === 'transfer' ? '계좌' : order.paymentType === 'cash' ? '현금' : '파손'}
                         </span>
                         <span className="text-[9px] text-zinc-400">No.{order.orderNo}</span>
                      </span>
                      <span className="text-[9px] font-mono italic">{order.createdAt}</span>
                    </div>
                   <div className="space-y-1 mb-3 text-[12px]">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span className="text-zinc-600 truncate pr-4 text-[13px]">• [{it.artist}] {it.name} x{it.count}</span>
                          <span className="text-zinc-400 font-mono font-bold">{formatPrice(it.price * it.count)}</span>
                        </div>
                      ))}
                   </div>
                   <div className="flex justify-between items-center border-t border-zinc-50 pt-2.5 font-bold">
                      <div className={`flex items-center gap-1.5 text-[10px] ${order.status === 'packed' ? 'text-zinc-300' : 'text-emerald-600 animate-pulse'}`}>
                         {order.status === 'packed' ? <Check size={12}/> : <Loader2 size={12} className="animate-spin" />}
                         {order.status === 'packed' ? '포장완료' : '포장전'}
                      </div>
                      <div className={`font-black text-lg ${order.paymentType === 'loss' ? 'text-red-600' : 'text-black'}`}>
                         {formatPrice(order.total || order.lossValue)}원
                      </div>
                   </div>
                 </div>
               ))}
             </div>
           </div>
        )}

        {isAdminMode && viewMode === 'settings' && (
           <div className="space-y-12 pb-48 animate-in fade-in font-bold text-left">
             <h2 className="text-2xl font-black border-b-4 border-black inline-block uppercase">시스템 환경설정</h2>
             <section className="space-y-6">
                <h3 className="text-[18px] font-black flex items-center gap-2 font-bold"><Landmark size={22} className="text-amber-500" /> 결제 정보</h3>
                <div className="bg-zinc-800 p-6 rounded-[56px] shadow-inner font-bold border-4 border-zinc-700 font-black">
                   <div className="bg-white w-full max-w-sm mx-auto rounded-[42px] p-8 shadow-2xl border-[8px] border-black text-center font-bold">
                      <input className="bg-zinc-900 text-emerald-400 py-3 px-6 rounded-2xl inline-block mb-6 uppercase tracking-widest text-[13px] font-black w-full text-center border-none outline-none focus:ring-2 ring-emerald-500/50" value={kioskSettings.title} onChange={(e) => setKioskSettings({...kioskSettings, title: e.target.value})} />
                      <textarea className="text-sm font-black mb-8 opacity-60 leading-relaxed text-center w-full border-none resize-none outline-none" value={kioskSettings.subtitle} onChange={(e) => setKioskSettings({...kioskSettings, subtitle: e.target.value})} />
                      <div className="bg-zinc-50 rounded-[44px] p-4 mb-8 border-4 border-dashed border-zinc-200 flex flex-col items-center justify-center min-h-[160px] relative group overflow-hidden">
                        {kioskSettings.qrImageUrl ? <img src={kioskSettings.qrImageUrl} alt="QR" className="w-full h-full object-contain rounded-2xl" /> : <div className="flex flex-col items-center text-zinc-300 font-black font-bold"><ImageIcon size={40} className="mb-2"/><span className="text-[10px]">이미지가 없습니다.</span></div>}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center rounded-[28px] gap-2">
                           <button onClick={() => handleImageFile(null, null, 'kiosk')} className="bg-white text-black px-4 py-2 rounded-xl text-[10px] font-black shadow-lg font-bold">QR 이미지 첨부</button>
                           {kioskSettings.qrImageUrl && <button onClick={() => setKioskSettings({...kioskSettings, qrImageUrl: ""})} className="bg-red-500 text-white px-4 py-2 rounded-xl text-[10px] font-black shadow-lg font-bold">이미지 삭제</button>}
                        </div>
                      </div>
                      <div className="bg-zinc-50 rounded-3xl p-6 mb-8 text-left border border-zinc-100 font-bold space-y-4 shadow-sm font-black">
                         <div className="flex justify-between items-center border-b border-zinc-200/50 pb-2 font-black font-bold"><span className="text-[10px] opacity-40 uppercase font-black font-bold">Bank</span><input className="text-[12px] font-black text-right bg-transparent border-none w-1/2 outline-none font-bold font-black" value={kioskSettings.bankName} onChange={(e) => setKioskSettings({...kioskSettings, bankName: e.target.value})} /></div>
                         <div className="flex justify-between items-center border-b border-zinc-200/50 pb-2 font-black font-bold"><span className="text-[10px] opacity-40 uppercase font-black font-bold font-black">Account</span><input className="text-[14px] font-mono font-black text-right bg-transparent border-none w-2/3 outline-none font-black font-bold font-black" value={kioskSettings.accountNumber} onChange={(e) => setKioskSettings({...kioskSettings, accountNumber: e.target.value})} /></div>
                         <div className="flex justify-between items-center font-black font-bold"><span className="text-[10px] opacity-40 uppercase font-black font-bold font-black">Name</span><input className="text-[12px] font-black text-right bg-transparent border-none w-1/2 outline-none font-black font-bold font-black" value={kioskSettings.accountHolder} onChange={(e) => setKioskSettings({...kioskSettings, accountHolder: e.target.value})} /></div>
                      </div>
                      <textarea className="bg-amber-50 text-amber-700 p-4 rounded-2xl text-[11px] mb-8 w-full border-none resize-none font-bold text-center leading-relaxed outline-none font-bold font-black" value={kioskSettings.footerNote} onChange={(e) => setKioskSettings({...kioskSettings, footerNote: e.target.value})} />
                   </div>
                </div>
             </section>

             <section className="space-y-8 font-bold" onDragOver={onDragOver}>
                <h3 className="text-[18px] font-black flex items-center gap-2 mt-12 font-black font-bold"><Edit3 size={22} className="text-emerald-500" /> 상품 목록 편집</h3>
                <div className="space-y-12 mt-4 font-black">
                  {categoryOrder.map((cat) => (
                    <div key={cat} className="bg-white p-7 rounded-[48px] shadow-sm border border-zinc-100 font-bold font-black" onDrop={() => onDrop(cat, -1)}>
                       <div className="flex justify-between items-center mb-10 border-b pb-5 font-black font-bold">
                          <div className="flex gap-4 items-center font-black font-bold">
                            <input type="text" value={cat} className="text-[19px] font-black bg-zinc-50 px-4 py-2.5 rounded-2xl outline-none border border-zinc-100 font-black font-bold" onChange={(e) => {
                               const nextOrder = [...categoryOrder]; const idx = nextOrder.indexOf(cat); nextOrder[idx] = e.target.value; setCategoryOrder(nextOrder);
                               const nextProds = { ...products }; nextProds[e.target.value] = nextProds[cat]; delete nextProds[cat]; setProducts(nextProds);
                            }} />
                            <input type="color" value={products[cat]?.[0]?.color || "#FFFFFF"} className="w-12 h-12 rounded-full border-4 border-white shadow-lg cursor-pointer font-black font-bold" onChange={(e) => {
                              const next = { ...products }; next[cat] = next[cat].map(it => ({ ...it, color: e.target.value })); setProducts(next);
                            }} />
                          </div>
                          <button onClick={() => { if(window.confirm(`${cat} 삭제?`)) { const nextP = {...products}; delete nextP[cat]; setProducts(nextP); setCategoryOrder(categoryOrder.filter(c => c !== cat)); } }} className="text-red-300 p-2 font-black font-bold"><Trash2 size={22}/></button>
                       </div>
                       <div className="space-y-5 font-bold font-black">
                          {(products[cat] || []).map((it, idx) => (
                            <div key={it.id} draggable="true" onDragStart={() => onDragStart(cat, idx)} onDrop={(e) => { e.stopPropagation(); onDrop(cat, idx); }} style={{ backgroundColor: it.color || '#FFFFFF' }}
                              className={`rounded-[32px] p-5 flex flex-col items-center border-[2px] border-black/5 relative group cursor-grab active:cursor-grabbing transition-all ${draggedItem?.cat === cat && draggedItem?.idx === idx ? 'opacity-25 scale-95' : 'hover:border-black/10 shadow-sm'}`}
                            >
                               <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-20 group-hover:opacity-100 transition-opacity font-bold font-black"><GripVertical size={24}/></div>
                               <div className="w-full flex gap-4 items-center ml-7 font-bold font-black font-bold">
                                  <div className="relative shrink-0 font-black font-bold">
                                    {it.image ? <img src={it.image} className="w-16 h-16 rounded-[22px] object-cover border-4 border-white shadow-md font-black" alt="T" /> : <div className="w-16 h-16 bg-white/50 rounded-[22px] flex items-center justify-center text-zinc-300 border-2 border-dashed border-zinc-200 font-black"><ImageIcon size={28}/></div>}
                                    <div className="absolute -bottom-2 -right-2 flex flex-col gap-1">
                                      <button onClick={() => handleImageFile(cat, idx, 'product')} className="bg-black text-white p-2 rounded-full shadow-xl active:scale-90 transition-transform font-black font-bold font-black"><Plus size={12}/></button>
                                      {it.image && <button onClick={() => { const n = {...products}; n[cat][idx].image = ""; setProducts(n); }} className="bg-red-500 text-white p-2 rounded-full shadow-xl active:scale-90 font-black font-bold font-black"><X size={12}/></button>}
                                    </div>
                                  </div>
                                  <div className="flex-1 space-y-2.5 font-bold font-black">
                                     <div className="flex items-center gap-2 font-black font-bold">
                                       <input placeholder="상품명" value={it.name} className="flex-1 bg-white/80 p-3 rounded-2xl text-sm font-black border-none outline-none shadow-sm font-black font-bold" onChange={(e) => { const n = {...products}; n[cat][idx].name = e.target.value; setProducts(n); }} />
                                       <input placeholder="작가" value={it.artist || ""} className="w-24 bg-white/60 p-2 rounded-xl text-[10px] font-bold border-none outline-none shadow-sm text-center font-black font-bold" onChange={(e) => { const n = {...products}; n[cat][idx].artist = e.target.value; setProducts(n); }} />
                                     </div>
                                     <div className="flex gap-2.5 items-center font-black">
                                        <div className="flex-1 bg-white/80 rounded-[18px] px-3.5 shadow-sm border border-zinc-50 flex items-center h-12 font-bold">
                                           <span className="text-[10px] text-zinc-400 mr-2 font-mono font-bold font-black">₩</span>
                                           <input type="number" placeholder="가격입력" value={it.price} className="w-full bg-transparent p-2 text-[14px] font-black border-none outline-none text-right font-bold font-black" onChange={(e) => { const n = {...products}; n[cat][idx].price = Number(e.target.value); setProducts(n); }} />
                                        </div>
                                        <button onClick={() => { const n = {...products}; n[cat].splice(idx,1); setProducts(n); }} className="text-zinc-400 hover:text-red-400 p-2 transition-colors font-bold font-black"><Trash2 size={20}/></button>
                                     </div>
                                  </div>
                               </div>
                            </div>
                          ))}
                          <button onClick={() => { setProducts({...products, [cat]: [...(products[cat] || []), {id: Date.now(), name: "새 상품", artist: "KUIKUI💀", price: 0, count: 0, unit: "개", color: products[cat]?.[0]?.color || "#FFFFFF", image: ""}]}); }} className="w-full py-4.5 border-2 border-dashed border-zinc-200 rounded-[32px] text-zinc-300 text-[13px] font-black hover:border-black hover:text-black transition-all font-black font-bold">+ 새로운 상품 추가</button>
                       </div>
                    </div>
                  ))}
                  <button onClick={() => { const n = "신규 카테고리"; setProducts({...products, [n]: []}); setCategoryOrder([...categoryOrder, n]); }} className="w-full py-6 bg-zinc-900 text-white rounded-[36px] font-black text-sm active:scale-95 shadow-xl transition-all font-bold">+ 새로운 카테고리 추가</button>
                </div>
             </section>
             <div className="fixed bottom-24 left-4 right-4 z-[70] animate-in slide-in-from-bottom-10 font-bold font-black">
                <button onClick={async () => { try { await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'metadata'), { products, categoryOrder, kioskSettings }); setShowToast("설정 저장 완료!"); } catch(e) { setShowToast("저장 오류 (용량 과다)"); } setTimeout(() => setShowToast(null), 3000); }} className="w-full py-6 bg-emerald-600 text-white rounded-[32px] font-black text-xl shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all border-b-8 border-emerald-800 font-bold">
                  <Check size={28} /> 설정 저장
                </button>
             </div>
           </div>
        )}
      </main>

      {/* --- ORDER FOOTER --- */}
      {viewMode === 'order' && (
        <div className={`fixed bottom-0 left-0 right-0 z-40 transition-transform duration-500 ease-in-out ${isReceiptOpen ? 'translate-y-0' : 'translate-y-[calc(100%-60px)]'}`}>
          <div className="max-w-xl mx-auto px-4 font-bold font-black">
            <div className="flex justify-center font-bold font-black">
              <button onClick={() => setIsReceiptOpen(!isReceiptOpen)} className="bg-black text-white px-10 py-3 rounded-t-[32px] flex items-center justify-center gap-2 font-black border-t border-white/10 shadow-[0_-20px_40px_rgba(0,0,0,0.35)] active:scale-95 transition-transform font-bold font-black">
                {isReceiptOpen ? <ChevronDown size={22} /> : <ChevronUp size={22} />}
                <span className="text-[11px] font-bold leading-none font-black">{isReceiptOpen ? '접기' : '영수증 보기'}</span>
              </button>
            </div>
            <div className={`bg-white border-x-[8px] border-t-[8px] border-black rounded-t-[40px] shadow-2xl p-8 h-auto max-h-[75vh] overflow-y-auto font-black`}>
              <div className="bg-zinc-50 p-2 rounded-3xl grid grid-cols-2 gap-3 mb-10 border-2 border-zinc-100 font-bold font-black">
                 <button onClick={() => setPaymentType('transfer')} className={`py-4 rounded-2xl text-xs font-black transition-all ${paymentType === 'transfer' ? 'bg-emerald-600 text-white shadow-lg scale-[1.03]' : 'text-zinc-400'}`}>계좌이체</button>
                 <button onClick={() => setPaymentType('cash')} className={`py-4 rounded-2xl text-xs font-black transition-all ${paymentType === 'cash' ? 'bg-emerald-600 text-white shadow-lg scale-[1.03]' : 'text-zinc-400'}`}>현금결제</button>
              </div>
              <div className="space-y-4 mb-10 border-b-2 border-dashed border-zinc-100 pb-8 font-black font-bold">
                {receiptItems.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-[15px] animate-in slide-in-from-bottom-2 font-bold font-black">
                    <span className="truncate pr-4 flex items-center gap-2 font-bold font-black">
                       <span className="text-[9px] opacity-30 font-black shrink-0 font-black font-bold">[{getCategoryInfo(item.name).char}]</span>
                       <span className="truncate font-black text-black font-bold">{item.name}</span> <span className="text-[11px] opacity-40 ml-1 font-mono shrink-0 font-normal font-black">x{item.count}</span>
                    </span>
                    <span className="font-mono text-zinc-400 shrink-0 font-bold font-black font-mono">{formatPrice(item.itemTotal)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mb-10 font-bold font-black">
                <div className="flex flex-col items-start gap-1 font-bold font-black">
                   <span className="text-red-500 text-[10px] font-black animate-bounce font-bold">총액을 확인해주세요!</span>
                   <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest leading-none font-bold">Total Amount</span>
                </div>
                <span className={`text-5xl font-black tracking-tighter ${paymentType === 'loss' ? 'text-red-600' : 'text-black'} tabular-nums font-black font-bold`}>{formatPrice(receiptItems.total)}원</span>
              </div>
              <button disabled={receiptItems.items.length === 0 || isSubmitting} onClick={handleOrderSubmit} className={`w-full py-6 rounded-[28px] font-black text-xl flex items-center justify-center gap-3 shadow-2xl active:scale-[0.96] transition-all ${receiptItems.items.length > 0 && !isSubmitting ? 'bg-emerald-600 text-white shadow-emerald-100 font-bold font-black font-bold' : 'bg-zinc-100 text-zinc-200 cursor-not-allowed font-bold font-black'}`}>
                {isSubmitting ? <Loader2 className="animate-spin" size={28} /> : (paymentType === 'loss' ? <AlertCircle size={28} /> : <Check size={32} />)}
                <span className="font-bold">주문하기</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODALS --- */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md font-bold font-black">
           <div className="bg-white w-full max-w-sm rounded-[48px] p-12 shadow-2xl border-t-[12px] border-black font-bold">
              <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner font-bold"><Lock size={36} className="text-black" /></div>
              <h3 className="text-xl font-black mb-8 text-center uppercase tracking-tight">Admin Authentication</h3>
              <input type="password" value={adminPwInput} onChange={(e) => setAdminPwInput(e.target.value)} placeholder="****" className="w-full bg-zinc-50 border-4 border-zinc-100 rounded-[28px] p-5 text-center text-4xl mb-10 outline-none font-black font-mono tracking-[12px] focus:border-amber-400 transition-all font-bold" />
              <div className="flex flex-col gap-3.5">
                <button onClick={handleAdminAuth} className="py-5 bg-black text-white rounded-[24px] font-black active:scale-95 font-bold text-lg shadow-xl uppercase">인증</button>
                <button onClick={() => {setShowAuthModal(false); setAdminPwInput('');}} className="py-5 bg-zinc-100 text-zinc-400 rounded-[24px] font-bold active:scale-95 font-bold uppercase">취소</button>
              </div>
           </div>
        </div>
      )}

      {showResetAuthModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 font-sans font-bold">
           <div className="bg-white w-full max-w-sm rounded-[36px] p-10 shadow-2xl text-center border-t-[10px] border-red-600 font-bold">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 font-bold font-black"><Lock size={32} className="text-red-600" /></div>
              <h3 className="text-xl font-black mb-2 font-black font-bold">전체 데이터 초기화</h3>
              <p className="text-zinc-500 text-[11px] mb-8 font-bold leading-relaxed font-bold">저장된 모든 판매 내역이 삭제됩니다.<br/>비밀번호($0927$)를 입력하세요.</p>
              <input type="password" placeholder="****" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} className="w-full bg-zinc-50 border-4 border-zinc-100 rounded-[20px] p-4 text-center font-black text-3xl mb-5 focus:border-red-600 transition-all outline-none font-bold font-black" />
              <div className="flex flex-col gap-2 font-bold font-black">
                <button onClick={async () => { if (resetPassword !== ADMIN_PW) { setShowToast("비밀번호 불일치"); return; } const snap = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'orders')); const batch = writeBatch(db); snap.docs.forEach(d => batch.delete(d.ref)); await batch.commit(); setShowResetAuthModal(false); setResetPassword(''); setShowToast("장부 초기화 완료"); }} className="w-full py-4.5 bg-red-600 text-white rounded-2xl font-black shadow-lg shadow-red-200 active:scale-95 transition-all font-bold">기록 삭제</button>
                <button onClick={() => {setShowResetAuthModal(false); setResetPassword('');}} className="w-full py-4.5 bg-zinc-100 text-zinc-400 rounded-2xl font-bold active:scale-95 font-bold">취소</button>
              </div>
           </div>
        </div>
      )}

      {showOrderDonePopup && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md font-bold font-black">
           <div className="bg-white w-full max-w-sm rounded-[56px] p-10 shadow-2xl border-[10px] border-black text-center font-bold relative overflow-hidden font-black">
              <div className="bg-zinc-900 text-emerald-400 py-3.5 px-7 rounded-2xl inline-block mb-8 uppercase tracking-widest text-[14px] font-black font-bold font-black">{kioskSettings.title}</div>
              <p className="text-[15px] font-black mb-8 opacity-70 leading-relaxed font-bold break-keep font-black font-bold">{kioskSettings.subtitle}</p>
              {kioskSettings.qrImageUrl && <div className="aspect-square bg-zinc-100 rounded-[44px] mb-8 overflow-hidden border-4 border-zinc-50 p-5 shadow-inner font-black"><img src={kioskSettings.qrImageUrl} alt="QR" className="w-full h-full object-contain font-black" /></div>}
              <div className="bg-zinc-50 rounded-[32px] p-6 mb-8 text-left border border-zinc-100 font-bold space-y-4 shadow-sm font-black font-bold">
                 <div className="flex justify-between items-center font-black font-bold font-black"><span className="text-[10px] opacity-40 uppercase font-black font-bold">Bank</span><span className="text-[13px] font-black font-bold">{kioskSettings.bankName}</span></div>
                 <div className="flex justify-between items-center border-t border-zinc-200/50 pt-3.5 font-black font-bold font-black"><span className="text-[10px] opacity-40 uppercase font-black font-bold font-black">Account</span><span className="text-[16px] font-mono font-black tracking-tight font-black font-bold">{kioskSettings.accountNumber}</span></div>
                 <div className="flex justify-between items-center border-t border-zinc-200/50 pt-3.5 font-black font-bold font-black"><span className="text-[10px] opacity-40 uppercase font-black font-bold font-black">Name</span><span className="text-[13px] font-black font-bold font-black font-black">{kioskSettings.accountHolder}</span></div>
              </div>
              <div className="bg-amber-50 text-amber-700 p-5 rounded-3xl text-[11px] mb-8 flex items-start gap-3 text-left leading-relaxed font-bold border border-amber-100 font-black font-bold font-black"><AlertCircle size={20} className="shrink-0 mt-0.5 font-black" />{kioskSettings.footerNote}</div>
              <button onClick={() => setShowOrderDonePopup(false)} className="w-full py-5.5 bg-black text-white rounded-[32px] font-black text-xl active:scale-95 shadow-xl border-b-8 border-zinc-800 transition-all font-black font-bold font-black">확인</button>
           </div>
        </div>
      )}

      {showNewOrderPopup && viewMode === 'packing' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300 font-black font-bold">
          <div className="bg-white rounded-[42px] p-10 shadow-2xl text-center max-w-sm w-full animate-in zoom-in duration-300 border-[8px] border-black font-black font-bold">
             <BellRing size={56} className="text-emerald-600 animate-bounce mx-auto mb-6" />
             <h3 className="text-2xl font-black mb-2 font-black">새 주문 도착!</h3>
             <p className="text-zinc-500 text-xs mb-10 font-bold leading-relaxed">결제가 완료되었습니다.<br/>즉시 포장을 시작해 주세요.</p>
             <button onClick={() => setShowNewOrderPopup(false)} className="w-full py-4.5 bg-black text-white rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-all font-bold">확인</button>
          </div>
        </div>
      )}

      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[250] bg-zinc-900 text-white px-10 py-3.5 rounded-full shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-10 whitespace-nowrap font-bold font-black">
          {showToast === "비밀번호 불일치" ? <AlertTriangle size={18} className="text-amber-500" /> : <Check size={18} className="text-emerald-500" />}
          <span className="text-[11px] font-black tracking-tight font-bold">{showToast}</span>
        </div>
      )}
    </div>
  );
};

export default App;
