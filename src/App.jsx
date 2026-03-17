import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, addDoc, updateDoc, onSnapshot, getDocs, writeBatch } from 'firebase/firestore';
import { 
  ShoppingCart, PackageCheck, History as HistoryIcon, 
  RotateCcw, Download, Filter, RefreshCcw, 
  ChevronUp, ChevronDown, ChevronsUp, ChevronsDown,
  Receipt, AlertCircle, Banknote, Landmark, Check, Lock, Volume2, VolumeX, BellRing
} from 'lucide-react';

// --- [CONFIGURATION] ---
// KUIKUI💀님의 파이어베이스 스크린샷 값을 바탕으로 직접 입력 완료하였습니다.
const firebaseConfig = {
  apiKey: "AIzaSyB7FOLLxPFT0VWFw3un_H5R3C9_v2WJ9_w",
  authDomain: "booth-management-kui.firebaseapp.com",
  projectId: "booth-management-kui",
  storageBucket: "booth-management-kui.firebasestorage.app",
  messagingSenderId: "766168881320",
  appId: "1:766168881320:web:b4fd576082989cc64268e3",
  measurementId: "G-5D2XBGSDVR"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'm5-booth-integrated-v5-2';
const ADMIN_PW = "0927";

// --- [CONSTANTS & THEMES] ---
const CATEGORY_THEMES = {
  "츠오미": "bg-[#FFD1DC]", 
  "꾸이꾸이": "bg-[#CCEEFF]", 
  "두근": "bg-[#EAE7E2]", 
  "기타": "bg-white"
};

const INITIAL_PRODUCTS = {
  "츠오미": [{ id: "tsu_1", name: "키레네 포스터", count: 0, price: 10000, unit: "개" }],
  "꾸이꾸이": [
    { id: "kui_1", name: "포카 : 선데이", count: 0, price: 2000, unit: "개" },
    { id: "kui_2", name: "포카 : 파이논", count: 0, price: 2000, unit: "개" },
    { id: "kui_3", name: "포카 : 마이데이", count: 0, price: 2000, unit: "개" },
    { id: "kui_4", name: "포카 : 단항", count: 0, price: 2000, unit: "개" },
    { id: "kui_5", name: "포카 SET", count: 0, price: 7000, unit: "세트" },
    { id: "kui_6", name: "아크릴 키링 : 선데이", count: 0, price: 7000, unit: "개" },
    { id: "kui_7", name: "아크릴 키링 : 파이논", count: 0, price: 7000, unit: "개" },
    { id: "kui_8", name: "아크릴 키링 : 마이데이", count: 0, price: 7000, unit: "개" },
    { id: "kui_9", name: "아크릴 키링 : 단항", count: 0, price: 7000, unit: "개" },
    { id: "kui_10", name: "아크릴 키링 SET", count: 0, price: 26000, unit: "세트" },
    { id: "kui_11", name: "키링참 : 선데이", count: 0, price: 16000, unit: "개" },
    { id: "kui_12", name: "키링참 : 파이논", count: 0, price: 16000, unit: "개" },
    { id: "kui_13", name: "키링참 : 마이데이", count: 0, price: 16000, unit: "개" },
    { id: "kui_14", name: "키링참 : 단항", count: 0, price: 16000, unit: "개" },
    { id: "kui_15", name: "키링참 SET", count: 0, price: 60000, unit: "세트" },
    { id: "kui_16", name: "장패드", count: 0, price: 20000, unit: "개" }
  ],
  "두근": [
    { id: "du_1", name: "레츄 만화책", count: 0, price: 4000, unit: "권" },
    { id: "du_2", name: "교복 포카 : 파이논", count: 0, price: 1000, unit: "개" },
    { id: "du_3", name: "교복 포카 : 아낙사", count: 0, price: 1000, unit: "개" },
    { id: "du_4", name: "교복 포카 : 마이데이", count: 0, price: 1000, unit: "개" },
    { id: "du_5", name: "교복 포카 : 스텔레", count: 0, price: 1000, unit: "개" },
    { id: "du_6", name: "교복 포카 : 카일루스", count: 0, price: 1000, unit: "개" },
    { id: "du_7", name: "히아킨 스티커", count: 0, price: 3000, unit: "개" },
    { id: "du_8", name: "엡나&31 스티커", count: 0, price: 3000, unit: "개" },
    { id: "du_9", name: "척자 스티커", count: 0, price: 3000, unit: "개" }
  ],
  "기타": [
    { id: "etc_1", name: "낙텔 소설책", count: 0, price: 15000, unit: "권" },
    { id: "etc_2", name: "조각 스티커", count: 0, price: 2000, unit: "개" },
    { id: "etc_3", name: "수제 싸인지", count: 0, price: 25000, unit: "장" }
  ]
};

const App = () => {
  const [user, setUser] = useState(null);
  const [viewMode, setViewMode] = useState('counter'); 
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState(JSON.parse(JSON.stringify(INITIAL_PRODUCTS)));
  const [paymentType, setPaymentType] = useState('transfer'); 
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [showToast, setShowToast] = useState(null);
  const [showResetAuthModal, setShowResetAuthModal] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [isSoundOn, setIsSoundOn] = useState(false);
  const [showNewOrderPopup, setShowNewOrderPopup] = useState(false);
  const [packingChecked, setPackingChecked] = useState({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ paymentType: 'all', category: 'all', startTime: '', endTime: '', selectedItems: [], minPrice: '', maxPrice: '' });

  const audioContextRef = useRef(null);
  const notifiedOrderIds = useRef(new Set());
  const isInitialLoad = useRef(true);

  const formatPrice = (p) => p.toLocaleString('ko-KR');

  const CATEGORY_MAP = useMemo(() => {
    const map = {};
    Object.keys(INITIAL_PRODUCTS).forEach(cat => { map[cat] = INITIAL_PRODUCTS[cat].map(p => p.name); });
    return map;
  }, []);

  const getCategoryInfo = useCallback((itemName) => {
    for (const [cat, names] of Object.entries(CATEGORY_MAP)) {
      if (names.includes(itemName)) return { char: cat[0], color: CATEGORY_THEMES[cat] };
    }
    return { char: "기", color: "bg-white" };
  }, [CATEGORY_MAP]);

  const ALL_ITEM_NAMES = useMemo(() => Object.values(INITIAL_PRODUCTS).flat().map(i => i.name), []);

  const toggleSound = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    const nextState = !isSoundOn;
    setIsSoundOn(nextState);
    if (nextState) {
      playiPhoneDing();
      setShowToast("알림음이 켜졌습니다.");
    } else {
      setShowToast("알림음이 꺼졌습니다.");
    }
    setTimeout(() => setShowToast(null), 2000);
  };

  const playiPhoneDing = async () => {
    if (!audioContextRef.current) return;
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
  };

  useEffect(() => {
    const initApp = async () => {
      await signInAnonymously(auth);
    };
    initApp();
    const unsubscribe = onAuthStateChanged(auth, (u) => { setUser(u); setIsLoading(false); });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const ordersCol = collection(db, 'artifacts', appId, 'public', 'data', 'orders');
    const unsubscribe = onSnapshot(ordersCol, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const sorted = data.sort((a, b) => b.timestamp - a.timestamp);
      const currentPendingOrders = data.filter(o => o.status === 'pending');
      if (isInitialLoad.current) {
        currentPendingOrders.forEach(o => notifiedOrderIds.current.add(o.id));
        isInitialLoad.current = false;
      } else {
        let hasNew = false;
        currentPendingOrders.forEach(o => {
          if (!notifiedOrderIds.current.has(o.id)) {
            notifiedOrderIds.current.add(o.id);
            hasNew = true;
          }
        });
        if (hasNew && isSoundOn) {
          playiPhoneDing();
          if (viewMode === 'packing') setShowNewOrderPopup(true);
        }
      }
      setOrders(sorted);
    });
    return () => unsubscribe();
  }, [user, viewMode, isSoundOn]);

  const updateCount = (cat, id, delta) => {
    setProducts(prev => ({
      ...prev,
      [cat]: prev[cat].map(item => item.id === id ? { ...item, count: Math.max(0, Math.min(999, item.count + delta)) } : item)
    }));
  };

  const receiptItems = useMemo(() => {
    let items = [];
    let total = 0;
    Object.values(products).flat().forEach(p => {
      if (p.count > 0) {
        items.push({ ...p, itemTotal: p.count * p.price });
        total += p.count * p.price;
      }
    });
    return { items, total };
  }, [products]);

  const handleConfirmOrder = async () => {
    if (receiptItems.items.length === 0 || !user) return;
    const orderData = {
      orderNo: orders.length + 1,
      items: receiptItems.items.map(i => ({ name: i.name, count: i.count, price: i.price })),
      total: paymentType === 'loss' ? 0 : receiptItems.total,
      lossValue: paymentType === 'loss' ? receiptItems.total : 0,
      paymentType,
      status: paymentType === 'loss' ? 'packed' : 'pending',
      timestamp: Date.now(),
      createdAt: new Date().toLocaleTimeString('ko-KR')
    };
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), orderData);
      setProducts(JSON.parse(JSON.stringify(INITIAL_PRODUCTS)));
      setPaymentType('transfer'); 
      setIsReceiptOpen(false); 
      setShowToast("내역 작성이 완료되었습니다.");
      setTimeout(() => setShowToast(null), 2500);
    } catch (err) { setShowToast("저장 실패"); }
  };

  const markAsPacked = async (id) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', id), { status: 'packed' });
      setShowToast("포장 완료 처리되었습니다.");
      setTimeout(() => setShowToast(null), 2500);
    } catch (err) { console.error(err); }
  };

  const handleGlobalReset = async () => {
    if (resetPassword !== ADMIN_PW) {
      setShowToast("비밀번호 불일치");
      setTimeout(() => setShowToast(null), 2000);
      return;
    }
    try {
      const ordersCol = collection(db, 'artifacts', appId, 'public', 'data', 'orders');
      const snapshot = await getDocs(ordersCol);
      const batch = writeBatch(db);
      snapshot.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();
      setShowResetAuthModal(false);
      setResetPassword('');
      setShowToast("장부가 초기화되었습니다.");
      setTimeout(() => setShowToast(null), 2500);
    } catch (err) { console.error(err); }
  };

  const downloadCSV = () => {
    if (orders.length === 0) return;
    const headers = ["번호", "날짜시간", "결제유형", "상품내역", "금액", "상태"];
    const rows = orders.map(o => [o.orderNo, o.createdAt, o.paymentType, o.items.map(it => `${it.name}(${it.count})`).join(';'), o.total || o.lossValue, o.status]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `KUIKUI_M5_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    setShowToast("CSV 다운로드 완료");
    setTimeout(() => setShowToast(null), 2000);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      if (filters.paymentType !== 'all' && order.paymentType !== filters.paymentType) return false;
      const actualVal = order.total || order.lossValue;
      if (filters.minPrice && actualVal < Number(filters.minPrice)) return false;
      if (filters.maxPrice && actualVal > Number(filters.maxPrice)) return false;
      if (filters.category !== 'all' && !order.items.some(it => CATEGORY_MAP[filters.category].includes(it.name))) return false;
      if (filters.selectedItems.length > 0 && !order.items.some(it => filters.selectedItems.includes(it.name))) return false;
      if (filters.startTime || filters.endTime) {
        const d = new Date(order.timestamp);
        const mins = d.getHours() * 60 + d.getMinutes();
        if (filters.startTime) { const [h, m] = filters.startTime.split(':').map(Number); if (mins < h * 60 + m) return false; }
        if (filters.endTime) { const [h, m] = filters.endTime.split(':').map(Number); if (mins > h * 60 + m) return false; }
      }
      return true;
    });
  }, [orders, filters, CATEGORY_MAP]);

  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-sans"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-black font-sans pb-40">
      <header className="sticky top-0 z-50 bg-black text-white px-4 py-2.5 shadow-2xl flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-2.5">
          <div className="flex flex-col">
            <h1 className="text-sm font-black tracking-tight leading-tight font-bold">붕스온리전 : M5 부스 통합 장부</h1>
            <p className="text-[8px] text-zinc-500 font-mono uppercase tracking-widest opacity-60 mt-1 leading-none font-bold">KUIKUI💀 Management V5.2</p>
          </div>
          <button onClick={toggleSound} className={`p-1.5 rounded-full transition-all active:scale-90 ${isSoundOn ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10 animate-pulse'}`}>
            {isSoundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
        <nav className="w-full flex gap-1 p-0.5 bg-zinc-900 rounded-xl font-bold">
          <button onClick={() => setViewMode('counter')} className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-bold transition-all ${viewMode === 'counter' ? 'bg-white text-black shadow-lg scale-[1.02]' : 'text-zinc-500'}`}><ShoppingCart size={13} /> <span>카운터</span></button>
          <button onClick={() => setViewMode('packing')} className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-bold transition-all ${viewMode === 'packing' ? 'bg-emerald-600 text-white shadow-lg scale-[1.02]' : 'text-zinc-500'}`}><PackageCheck size={13} /> <span>포장</span></button>
          <button onClick={() => setViewMode('history')} className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-bold transition-all ${viewMode === 'history' ? 'bg-zinc-200 text-black shadow-lg scale-[1.02]' : 'text-zinc-500'}`}><HistoryIcon size={13} /> <span>장부</span></button>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto p-3 sm:p-4 font-bold">
        {viewMode === 'counter' && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-zinc-100 relative font-bold">
              <div className="flex justify-between items-center mb-3">
                <label className="text-[8px] font-black text-zinc-400 uppercase tracking-widest block font-bold">기록 모드</label>
                <button onClick={() => setShowResetAuthModal(true)} className="p-1.5 bg-red-50 text-red-400 rounded-lg hover:bg-red-100 shadow-sm"><RotateCcw size={12} /></button>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button onClick={() => setPaymentType('transfer')} className={`flex items-center justify-center gap-1.5 py-3.5 rounded-xl font-bold text-[13px] border-2 transition-all ${paymentType === 'transfer' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-white border-zinc-50 text-zinc-400'}`}><Landmark size={16} /> 계좌이체</button>
                <button onClick={() => setPaymentType('cash')} className={`flex items-center justify-center gap-1.5 py-3.5 rounded-xl font-bold text-[13px] border-2 transition-all ${paymentType === 'cash' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-white border-zinc-50 text-zinc-400'}`}><Banknote size={16} /> 현금결제</button>
              </div>
              <button onClick={() => setPaymentType('loss')} className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-[11px] border-2 transition-all ${paymentType === 'loss' ? 'bg-red-600 text-white border-red-600 shadow-md' : 'bg-red-50 border-red-100 text-red-300'}`}><AlertCircle size={14} /> 파손 / 분실 체크 모드</button>
            </div>
            {Object.entries(products).map(([cat, items]) => (
              <section key={cat} className="space-y-3">
                <h2 className="text-base font-black border-l-[3px] border-black pl-2 font-bold">{cat}</h2>
                <div className="grid grid-cols-1 gap-2.5 font-bold">
                  {items.map((p) => (
                    <div key={p.id} className={`${CATEGORY_THEMES[cat]} border-b-[3px] border-black/10 rounded-xl p-3.5 flex flex-col items-center shadow-sm transition-transform active:scale-[0.98]`}>
                      <div className="w-full text-left mb-3">
                        <p className="font-extrabold text-[15px] tracking-tight leading-tight font-bold">{p.name}</p>
                        <p className="text-[10px] font-bold opacity-40 font-mono text-zinc-700 font-bold">{formatPrice(p.price)}원 / {p.unit}</p>
                      </div>
                      <div className="flex items-center justify-center gap-0.5 bg-white/40 p-1 rounded-xl w-full max-w-[260px] font-bold">
                        <button onClick={() => updateCount(cat, p.id, -5)} className="w-9 h-9 flex items-center justify-center bg-black text-white rounded-lg active:scale-90 shadow-sm shrink-0 font-bold"><ChevronsDown size={18} /></button>
                        <button onClick={() => updateCount(cat, p.id, -1)} className="w-9 h-9 flex items-center justify-center bg-white border border-black/5 rounded-lg active:scale-90 shadow-sm shrink-0 font-bold"><ChevronDown size={18} /></button>
                        <div className="bg-white min-w-[56px] h-9 flex items-center justify-center font-black rounded-md shadow-sm mx-0.5 px-2 flex-1 font-bold">
                           <span className="text-base tabular-nums text-black font-bold font-bold">{p.count}</span>
                        </div>
                        <button onClick={() => updateCount(cat, p.id, 1)} className="w-9 h-9 flex items-center justify-center bg-white border border-black/5 rounded-lg active:scale-90 shadow-sm shrink-0 font-bold"><ChevronUp size={18} /></button>
                        <button onClick={() => updateCount(cat, p.id, 5)} className={`w-9 h-9 flex items-center justify-center rounded-lg active:scale-90 shadow-md transition-all shrink-0 font-bold ${paymentType === 'loss' ? 'bg-red-600 text-white' : 'bg-black text-white'}`}><ChevronsUp size={18} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {viewMode === 'packing' && (
          <div className="space-y-5 animate-in slide-in-from-bottom duration-500 pb-20 px-1 font-bold">
            <h2 className="text-xl font-black flex items-center gap-2 font-bold font-black">실시간 포장 리스트 <span className="text-[9px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full animate-pulse font-black uppercase font-bold">LIVE</span></h2>
            {orders.filter(o => o.status === 'pending').length === 0 ? (
              <div className="py-24 text-center text-zinc-300 font-bold font-black"><PackageCheck size={56} className="mx-auto mb-3 opacity-10" /><p className="text-base tracking-tight font-black font-bold">대기 중인 주문이 없습니다.</p></div>
            ) : (
              <div className="grid grid-cols-1 gap-4 font-bold">
                {orders.filter(o => o.status === 'pending').slice().reverse().map(order => (
                  <div key={order.id} className="bg-white border-[1.5px] border-black rounded-[24px] p-5 shadow-xl border-b-10 border-r-8 overflow-hidden font-bold">
                    <div className="flex justify-between items-center mb-3 border-b pb-3 border-zinc-100 font-bold font-black font-bold">
                      <h3 className="text-xl font-black italic leading-tight font-bold font-black">No.{order.orderNo}</h3>
                      <span className="text-[9px] font-mono text-zinc-400 font-bold bg-zinc-50 px-1.5 py-0.5 rounded-md font-bold font-black">{order.createdAt}</span>
                    </div>
                    <div className="space-y-0.5 mb-5 bg-zinc-50 p-4 rounded-2xl border border-zinc-100 font-bold font-bold">
                      {order.items.map((it, idx) => (
                        <div key={idx} onClick={() => { const k = `${order.id}-${idx}`; setPackingChecked(prev => ({ ...prev, [k]: !prev[k] })); }} className={`flex justify-between items-center text-[13px] font-bold py-1 border-b border-zinc-200/40 last:border-0 cursor-pointer select-none transition-all ${packingChecked[`${order.id}-${idx}`] ? 'opacity-20 line-through text-black' : 'text-black'}`}>
                          <span className="truncate pr-3 flex items-center gap-1.5 font-black leading-tight font-bold font-black font-bold"><div className={`w-1.5 h-1.5 rounded-full shrink-0 ${packingChecked[`${order.id}-${idx}`] ? 'bg-zinc-300' : 'bg-black animate-pulse'}`}></div>{it.name}</span>
                          <span className={`${packingChecked[`${order.id}-${idx}`] ? 'bg-zinc-200 text-zinc-400' : 'bg-black text-white'} px-2 py-0.5 rounded-lg text-[10px] font-black shrink-0 font-bold font-black`}>x {it.count}</span>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => markAsPacked(order.id)} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-base flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-emerald-200 font-bold font-black">포장 완료</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {viewMode === 'history' && (
          <div className="space-y-5 animate-in fade-in pb-20 font-bold font-black">
            <div className="flex justify-between items-center px-1 font-bold font-black">
              <div className="flex flex-col font-bold">
                <h2 className="text-xl font-black tracking-tight leading-tight font-black font-bold font-black">실시간 통합 장부</h2>
                <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider font-bold font-black font-bold">TOTAL {filteredOrders.length} RECORDS</p>
              </div>
              <div className="flex items-center gap-1.5 font-bold font-black">
                <button onClick={downloadCSV} className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 hover:bg-emerald-100 active:scale-90 shadow-sm transition-all" title="내역 다운로드"><Download size={18} /></button>
                <button onClick={() => setFilters({paymentType:'all',category:'all',startTime:'',endTime:'',selectedItems:[],minPrice:'',maxPrice:''})} className="p-2.5 rounded-xl bg-white border border-zinc-200 text-zinc-400 hover:text-black active:scale-90 shadow-sm transition-all font-bold" title="초기화"><RefreshCcw size={18} /></button>
                <button onClick={() => setIsFilterOpen(!isFilterOpen)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-[11px] transition-all font-bold font-black ${isFilterOpen ? 'bg-black text-white font-bold font-black' : 'bg-white border border-zinc-200 text-zinc-600'}`}><Filter size={14} /> 필터 조회</button>
              </div>
            </div>
            {isFilterOpen && (
              <div className="bg-white border border-zinc-200 p-5 rounded-[28px] shadow-2xl space-y-4 animate-in slide-in-from-top-4 overflow-hidden font-bold">
                <div className="grid grid-cols-2 gap-2 font-black font-bold">
                  <div className="flex flex-col font-black">
                    <label className="text-[9px] font-black text-zinc-400 uppercase mb-1">결제 수단</label>
                    <select value={filters.paymentType} onChange={(e) => setFilters({...filters, paymentType: e.target.value})} className="w-full bg-zinc-50 border-none rounded-xl p-3 text-[11px] font-bold focus:ring-2 focus:ring-black outline-none transition-all">
                      <option value="all">전체</option><option value="cash">현금</option><option value="transfer">계좌</option><option value="loss">파손/분실</option>
                    </select>
                  </div>
                  <div className="flex flex-col font-black">
                    <label className="text-[9px] font-black text-zinc-400 uppercase mb-1 font-bold">카테고리</label>
                    <select value={filters.category} onChange={(e) => setFilters({...filters, category: e.target.value})} className="w-full bg-zinc-50 border-none rounded-xl p-3 text-[11px] font-bold focus:ring-2 focus:ring-black outline-none transition-all">
                      <option value="all">전체</option>{Object.keys(INITIAL_PRODUCTS).map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-2 font-black font-bold">
                  <label className="text-[9px] font-black text-zinc-400 uppercase font-bold text-left font-bold font-black font-bold">시간대 검색</label>
                  <div className="flex items-center gap-2 font-bold font-black">
                     <input type="time" value={filters.startTime} onChange={(e) => setFilters({...filters, startTime: e.target.value})} className="flex-1 bg-zinc-50 border-none rounded-xl p-3 text-[11px] font-bold outline-none" />
                     <span className="text-zinc-200 font-bold font-black">~</span>
                     <input type="time" value={filters.endTime} onChange={(e) => setFilters({...filters, endTime: e.target.value})} className="flex-1 bg-zinc-50 border-none rounded-xl p-3 text-[11px] font-bold outline-none" />
                  </div>
                </div>
                <div className="flex flex-col gap-2 font-black font-bold">
                  <label className="text-[9px] font-black text-zinc-400 uppercase font-bold text-left w-full font-bold">금액 구간</label>
                  <div className="flex items-center gap-2 justify-center font-bold">
                     <input type="number" placeholder="최소" value={filters.minPrice} onChange={(e) => setFilters({...filters, minPrice: e.target.value})} className="w-1/2 bg-zinc-50 border-none rounded-xl p-3 text-[11px] font-bold outline-none" />
                     <span className="text-zinc-200 font-black font-bold">-</span>
                     <input type="number" placeholder="최대" value={filters.maxPrice} onChange={(e) => setFilters({...filters, maxPrice: e.target.value})} className="w-1/2 bg-zinc-50 border-none rounded-xl p-3 text-[11px] font-bold outline-none" />
                  </div>
                </div>
                <div className="flex flex-col font-black font-bold">
                  <label className="text-[9px] font-black text-zinc-400 uppercase mb-1.5 font-bold font-bold font-black font-bold">상품별 필터 (체크리스트)</label>
                  <div className="max-h-40 overflow-y-auto grid grid-cols-1 gap-1 border border-zinc-100 p-1.5 rounded-xl bg-zinc-50 font-bold font-black font-bold">
                    {ALL_ITEM_NAMES.map(name => (
                      <label key={name} className="flex items-center gap-2.5 text-[11px] font-black p-2 hover:bg-white rounded-lg cursor-pointer select-none leading-tight font-bold font-black">
                        <input type="checkbox" checked={filters.selectedItems.includes(name)} onChange={(e) => { const next = e.target.checked ? [...filters.selectedItems, name] : filters.selectedItems.filter(i => i !== name); setFilters({...filters, selectedItems: next}); }} className="w-4 h-4 rounded text-black focus:ring-black border-zinc-200 shrink-0 font-bold" />
                        <span className="truncate font-black font-bold">{name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <button onClick={() => setIsFilterOpen(false)} className="w-full py-4 bg-black text-white rounded-2xl font-black text-[12px] shadow-lg active:scale-[0.98] transition-all tracking-widest uppercase font-black font-bold">조회 결과 적용</button>
              </div>
            )}
            <div className="space-y-4 font-bold font-black">
              {filteredOrders.length === 0 ? (
                <div className="py-24 text-center text-zinc-300 font-bold italic opacity-30 tracking-tight font-bold font-black">기록이 없습니다.</div>
              ) : (
                filteredOrders.map(order => (
                  <div key={order.id} className={`bg-white border rounded-[28px] p-5 shadow-sm border-l-[12px] ${order.status === 'packed' ? 'border-l-zinc-300 opacity-60' : (order.paymentType === 'loss' ? 'border-l-red-500 shadow-md' : 'border-l-emerald-500 shadow-md')} font-bold font-black`}>
                    <div className="flex items-center justify-between mb-4 overflow-hidden font-bold font-black">
                      <div className="flex items-center gap-1.5 flex-shrink-0 font-bold font-black font-bold font-black">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-black text-white shadow-sm ${order.status === 'packed' ? 'bg-zinc-400' : (order.paymentType === 'loss' ? 'bg-red-600' : 'bg-emerald-600')} font-bold font-black font-bold font-black`}>No.{order.orderNo}</span>
                        <span className={`text-[8px] font-black uppercase tracking-tight ${order.paymentType === 'loss' ? 'text-red-500' : 'text-emerald-600'} font-black font-bold font-black font-bold font-black`}>{order.paymentType === 'cash' ? '현금결제' : order.paymentType === 'transfer' ? '계좌이체' : '파손/분실'}</span>
                        {order.paymentType !== 'loss' && (
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${order.status === 'packed' ? 'bg-zinc-100 text-zinc-400 border border-zinc-200' : 'bg-emerald-50 text-emerald-600 animate-pulse border border-emerald-200'} font-bold font-black font-bold font-black`}>{order.status === 'packed' ? '포장완료' : '포장중'}</span>
                        )}
                      </div>
                      <span className="text-[9px] text-zinc-300 font-mono font-black italic opacity-60 font-black font-bold font-black">{order.createdAt}</span>
                    </div>
                    <div className="space-y-1.5 mb-4 font-bold font-black font-bold font-black">
                      {order.items.map((it, idx) => {
                        const info = getCategoryInfo(it.name);
                        return (
                          <div key={idx} className="flex justify-between text-xs font-black leading-tight items-center font-bold font-black font-bold font-black">
                            <span className="text-zinc-700 flex items-center gap-1.5 truncate pr-2 font-bold font-black font-bold font-black font-bold">
                              <span className={`${info.color} text-zinc-900 text-[9px] px-1.5 py-0.5 rounded-md font-black border border-black/5 shadow-sm font-bold font-black font-bold font-black`}>[{info.char}]</span>
                              <span className="truncate font-bold font-black font-bold font-black font-bold font-black">{it.name} / {it.count}</span>
                            </span>
                            <span className="text-zinc-400 font-mono font-black font-bold font-black font-mono font-bold font-black">{formatPrice(it.price * it.count)}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="border-t border-dashed border-zinc-100 pt-3 flex justify-between items-end font-bold font-black font-bold font-black">
                      <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest font-black font-bold font-black font-bold">최종 금액</span>
                      <span className={`text-xl font-black leading-none ${order.paymentType === 'loss' ? 'text-red-600' : 'text-black'} whitespace-nowrap font-black font-mono font-bold font-black`}>{formatPrice(order.paymentType === 'loss' ? order.lossValue : order.total)}원</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {viewMode === 'counter' && (
        <div className={`fixed bottom-0 left-0 right-0 z-40 transition-transform duration-500 ease-in-out ${isReceiptOpen ? 'translate-y-0' : 'translate-y-[calc(100%-60px)]'}`}>
          <div className="max-w-xl mx-auto px-4 font-black font-bold font-bold font-bold">
            <div className="flex justify-center">
              <button onClick={() => setIsReceiptOpen(!isReceiptOpen)} className="bg-black text-white px-10 py-2.5 rounded-t-[24px] shadow-2xl flex items-center gap-2 font-black border-t border-white/10 font-bold font-black font-bold font-bold">
                {isReceiptOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                <span className="text-[11px] font-bold leading-none font-black font-bold font-bold font-black">{isReceiptOpen ? '접기' : '영수증 보기'}</span>
              </button>
            </div>
            <div className={`bg-white border-x-[6px] border-t-[6px] border-black rounded-t-[40px] shadow-[0_-30px_60px_rgba(0,0,0,0.25)] p-6 h-auto max-h-[75vh] overflow-y-auto font-black font-bold font-bold`}>
              <div className="flex justify-between items-center mb-5 pb-4 border-b border-zinc-50 font-bold font-black font-bold font-bold">
                <div className="flex items-center gap-2 font-bold font-black font-bold font-bold font-black font-bold font-black"><Receipt size={20} className="text-zinc-300" /><h3 className="text-xs font-black uppercase tracking-tight text-zinc-400 italic font-bold font-black font-bold font-bold font-bold font-black">Current Order</h3></div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black shadow-sm ${paymentType === 'loss' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'} font-bold font-bold font-black`}>{paymentType === 'cash' ? '현금결제' : paymentType === 'transfer' ? '계좌이체' : '파손/분실'}</div>
              </div>
              {receiptItems.items.length === 0 ? (
                <div className="py-20 text-center text-zinc-200 font-bold text-sm italic font-bold font-black opacity-40 font-bold font-black font-bold">물품을 선택하세요...</div>
              ) : (
                <div className="space-y-3 mb-10 font-bold font-black font-bold font-bold font-black">
                  {receiptItems.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center font-bold animate-in slide-in-from-bottom-2 font-black font-bold font-bold font-bold font-black">
                      <span className="text-[14px] font-black text-zinc-800 leading-tight flex items-center gap-1.5 truncate pr-2 font-bold font-black font-bold font-bold font-bold font-black font-bold font-black">
                        <span className="text-[10px] text-zinc-400 font-bold font-black shrink-0 font-bold font-black font-bold font-black font-bold font-black font-bold font-black font-bold">[{getCategoryInfo(item.name).char}]</span>
                        <span className="truncate font-bold font-black font-bold font-black font-bold font-bold font-black font-bold font-black font-bold">{item.name}</span> <span className="text-[11px] opacity-40 ml-1 font-mono shrink-0 font-normal font-bold font-black font-mono font-bold font-black font-bold font-black font-mono font-black font-mono font-black font-mono font-black font-mono">x{item.count}</span>
                      </span>
                      <span className="text-[14px] font-black font-mono text-zinc-400 shrink-0 font-bold font-black font-mono font-bold font-black font-mono font-bold font-black font-mono font-bold font-black font-mono font-bold font-black font-mono font-bold font-black font-mono">{formatPrice(item.itemTotal)}</span>
                    </div>
                  ))}
                  <div className="h-[2px] bg-zinc-50 my-6 font-bold font-bold font-bold font-black"></div>
                  <div className="flex flex-col items-end gap-1 font-bold font-black font-bold font-bold font-black">
                    <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest font-black leading-none font-bold font-black font-bold font-bold font-black font-black font-bold">TOTAL AMOUNT</span>
                    <span className={`text-4xl font-black leading-none ${paymentType === 'loss' ? 'text-red-600' : 'text-black'} whitespace-nowrap font-bold font-black font-mono font-bold font-black font-mono font-bold font-black font-mono font-bold font-black font-mono font-bold`}>{formatPrice(receiptItems.total)}원</span>
                  </div>
                </div>
              )}
              <button disabled={receiptItems.items.length === 0} onClick={handleConfirmOrder} className={`w-full py-5 rounded-[22px] font-black text-xl flex items-center justify-center gap-3 shadow-2xl active:scale-[0.96] transition-all ${receiptItems.items.length > 0 ? 'bg-emerald-600 text-white shadow-emerald-200 shadow-xl font-bold font-black font-bold font-bold font-black' : 'bg-zinc-100 text-zinc-200 cursor-not-allowed font-bold font-black font-bold font-bold font-black font-black'}`}>
                {paymentType === 'loss' ? <AlertCircle size={28} /> : <Check size={32} />}
                <span className="font-bold font-bold font-bold font-black font-bold">판매 완료</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showResetAuthModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 font-sans font-bold font-bold font-bold font-black">
           <div className="bg-white w-full max-w-sm rounded-[36px] p-10 shadow-2xl text-center border-t-[10px] border-red-600 font-bold font-bold font-bold font-black font-bold">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 font-bold font-black font-bold font-bold font-black"><Lock size={32} className="text-red-600" /></div>
              <h3 className="text-xl font-black mb-2 font-black font-bold font-black font-bold font-black font-bold">전체 장부 초기화</h3>
              <p className="text-zinc-500 text-[11px] mb-8 font-bold leading-relaxed font-bold font-black font-bold font-black font-bold font-black">저장된 모든 판매 내역이 삭제됩니다.<br/>관리자 비밀번호를 입력하세요.</p>
              <input type="password" placeholder="****" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} className="w-full bg-zinc-50 border-4 border-zinc-100 rounded-[20px] p-4 text-center font-black text-3xl mb-5 focus:border-red-600 transition-all outline-none font-bold font-black font-bold font-black font-bold" />
              <div className="flex flex-col gap-2 font-bold font-black font-black font-bold font-black">
                <button onClick={handleGlobalReset} className="w-full py-4.5 bg-red-600 text-white rounded-2xl font-black shadow-lg shadow-red-200 active:scale-95 font-bold font-black font-black font-bold font-black font-black">기록 삭제</button>
                <button onClick={() => {setShowResetAuthModal(false); setResetPassword('');}} className="w-full py-4.5 bg-zinc-100 text-zinc-400 rounded-2xl font-bold active:scale-95 font-bold font-black font-black font-bold font-black font-black">취소</button>
              </div>
           </div>
        </div>
      )}

      {showNewOrderPopup && viewMode === 'packing' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300 font-black font-bold font-bold font-black">
          <div className="bg-white rounded-[42px] p-10 shadow-2xl text-center max-w-sm w-full animate-in zoom-in duration-300 border-[8px] border-black font-black font-bold font-bold font-black">
             <BellRing size={56} className="text-emerald-600 animate-bounce mx-auto mb-6 font-bold font-bold font-black" />
             <h3 className="text-2xl font-black mb-2 font-black font-bold font-black font-bold font-black font-bold">새 주문 도착!</h3>
             <p className="text-zinc-500 text-xs mb-10 font-bold leading-relaxed font-bold font-black font-black font-bold font-black font-black">결제가 완료되었습니다.<br/>즉시 포장을 시작해 주세요.</p>
             <button onClick={() => setShowNewOrderPopup(false)} className="w-full py-4.5 bg-black text-white rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-all font-bold font-black font-bold font-black font-bold">확인</button>
          </div>
        </div>
      )}

      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[120] bg-zinc-900 text-white px-8 py-3.5 rounded-full shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-10 whitespace-nowrap font-bold font-black font-bold font-black">
          <Check size={18} className="text-emerald-500 shrink-0 font-bold font-bold font-black" /> 
          <span className="text-[11px] font-black tracking-tight font-black font-bold font-black font-bold font-black font-bold font-black">{showToast}</span>
        </div>
      )}
    </div>
  );
};

export default App;

