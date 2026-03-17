import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, addDoc, updateDoc, onSnapshot, getDocs, writeBatch } from 'firebase/firestore';
import { 
  ShoppingCart, PackageCheck, History as HistoryIcon, 
  RotateCcw, Download, Filter, RefreshCcw, 
  ChevronUp, ChevronDown, ChevronsUp, ChevronsDown,
  Receipt, AlertCircle, Banknote, Landmark, Check, Lock, Volume2, VolumeX, BellRing, Loader2, Wifi, WifiOff, X
} from 'lucide-react';

// --- [CONFIGURATION] ---
const firebaseConfig = {
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
const appId = "m5-integrated-v6-2"; 
const ADMIN_PW = "0927";

// --- [BASE DATA] ---
const CATEGORY_THEMES = { "츠오미": "bg-[#FFD1DC]", "꾸이꾸이": "bg-[#CCEEFF]", "두근": "bg-[#EAE7E2]", "기타": "bg-white" };
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

const ALL_ITEM_NAMES = Object.values(INITIAL_PRODUCTS).flat().map(p => p.name);

const App = () => {
  const [user, setUser] = useState(null);
  const [viewMode, setViewMode] = useState('counter'); 
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connStatus, setConnStatus] = useState('initializing');
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
  const [filters, setFilters] = useState({ paymentType: 'all', minPrice: '', maxPrice: '', startTime: '', endTime: '', selectedItems: [] });

  const audioContextRef = useRef(null);
  const notifiedOrderIds = useRef(new Set());
  const isInitialLoad = useRef(true);

  const formatPrice = (p) => p.toLocaleString('ko-KR');

  const getCategoryInfo = useCallback((itemName) => {
    for (const [cat, items] of Object.entries(INITIAL_PRODUCTS)) {
      if (items.some(i => i.name === itemName)) return { char: cat[0], color: CATEGORY_THEMES[cat], fullName: cat };
    }
    return { char: "기", color: "bg-white", fullName: "기타" };
  }, []);

  const playiPhoneDing = async () => {
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
  };

  const toggleSound = () => {
    const nextState = !isSoundOn;
    setIsSoundOn(nextState);
    if (nextState) playiPhoneDing();
  };

  useEffect(() => {
    // --- [REQUIREMENT 1: Dynamic Page Title Update] ---
    document.title = "부스 현장판매 관리 시스템";

    const authUnsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        setConnStatus('connected');
        setIsLoading(false);
      } else {
        signInAnonymously(auth).catch(() => {
          setConnStatus('error');
          setIsLoading(false);
        });
      }
    });
    return () => authUnsubscribe();
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
    }, (err) => {
      setConnStatus('error');
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
    if (receiptItems.items.length === 0 || isSubmitting || !user) return;
    setIsSubmitting(true);
    try {
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
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), orderData);
      setProducts(JSON.parse(JSON.stringify(INITIAL_PRODUCTS)));
      setIsReceiptOpen(false);
      // --- [REQUIREMENT 6: Single-line Toast Message] ---
      setShowToast("판매 내역 기록이 완료되었습니다.");
    } catch (err) {
      setShowToast("저장 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setShowToast(null), 2500);
    }
  };

  const markAsPacked = async (id) => {
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', id), { status: 'packed' });
      setShowToast("포장 완료 처리됨");
      setTimeout(() => setShowToast(null), 1500);
    } catch (err) { console.error(err); }
  };

  const handleGlobalReset = async () => {
    if (resetPassword !== ADMIN_PW) return;
    try {
      const snapshot = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'orders'));
      const batch = writeBatch(db);
      snapshot.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();
      setShowResetAuthModal(false);
      setResetPassword('');
      setShowToast("데이터 초기화 완료");
    } catch (err) { console.error(err); }
  };

  // --- [REQUIREMENT 2 & 7: Advanced CSV Export with Robust Settlement] ---
  const downloadCSV = () => {
    if (orders.length === 0) return;
    
    // 1. 데이터 정순 정렬 (1번부터)
    const sortedOrders = [...orders].sort((a, b) => a.timestamp - b.timestamp);
    
    // 2. 카테고리별 합계 계산용 객체
    const settlement = { "츠오미": 0, "꾸이꾸이": 0, "두근": 0, "기타": 0 };
    
    // CSV 헤더 구성 (요청사항대로 시간 제거)
    const headers = ["번호", "유형", "카테고리", "내역", "금액"];
    
    const rows = sortedOrders.map((o, idx) => {
      // 유형 한글화
      const payKo = o.paymentType === 'cash' ? '현금결제' : o.paymentType === 'transfer' ? '계좌이체' : '파손분실';
      
      // 내역 상세 포맷팅 (불렛 포인트 및 줄바꿈 적용)
      const itemsDetail = o.items.map(it => `• ${it.name}(${it.count})`).join('\n');
      
      // 해당 주문에 포함된 고유 카테고리들
      const catsInOrder = Array.from(new Set(o.items.map(it => getCategoryInfo(it.name).fullName))).join(', ');
      
      // 정산 금액 누적 (파손분실 'loss' 항목은 수익에서 제외)
      if (o.paymentType !== 'loss') {
        o.items.forEach(it => {
          const cat = getCategoryInfo(it.name).fullName;
          if (settlement.hasOwnProperty(cat)) {
            settlement[cat] += (it.price * it.count);
          }
        });
      }

      return [
        idx + 1,
        payKo,
        catsInOrder,
        `"${itemsDetail}"`, // 줄바꿈을 위해 큰따옴표 감싸기
        o.total || o.lossValue
      ];
    });

    // 3. 정산용 하단 표 분리 생성
    const settlementRows = [
      [], // 구분 공백
      ["[ 카테고리별 최종 정산 내역 (파손/분실 제외) ]"],
      ["카테고리", "총 합계 금액"],
      ...Object.entries(settlement).map(([name, total]) => [name, `${total}원`]),
      ["전체 판매 수익 총액", `${Object.values(settlement).reduce((a,b)=>a+b, 0)}원`]
    ];

    const csvContent = [headers, ...rows, ...settlementRows].map(e => e.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `booth_final_settlement_${new Date().toLocaleDateString()}.csv`;
    link.click();
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      if (filters.paymentType !== 'all' && order.paymentType !== filters.paymentType) return false;
      const actualVal = order.total || order.lossValue;
      if (filters.minPrice && actualVal < Number(filters.minPrice)) return false;
      if (filters.maxPrice && actualVal > Number(filters.maxPrice)) return false;
      
      if (filters.startTime || filters.endTime) {
         const timeMatch = order.createdAt.match(/([오전후]+)\s(\d+):(\d+):(\d+)/);
         if (timeMatch) {
            let [_, ampm, h, m] = timeMatch;
            let hour = parseInt(h);
            if (ampm === "오후" && hour !== 12) hour += 12;
            if (ampm === "오전" && hour === 12) hour = 0;
            const totalMins = hour * 60 + parseInt(m);
            if (filters.startTime) {
               const [sh, sm] = filters.startTime.split(':').map(Number);
               if (totalMins < sh * 60 + sm) return false;
            }
            if (filters.endTime) {
               const [eh, em] = filters.endTime.split(':').map(Number);
               if (totalMins > eh * 60 + em) return false;
            }
         }
      }
      if (filters.selectedItems.length > 0) {
        const orderItemNames = order.items.map(it => it.name);
        if (!filters.selectedItems.some(name => orderItemNames.includes(name))) return false;
      }
      return true;
    });
  }, [orders, filters]);

  if (isLoading) return <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white"><Loader2 className="animate-spin text-emerald-500 mb-4" size={40}/><p className="text-xs font-bold animate-pulse tracking-widest uppercase">System Initialization...</p></div>;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-black font-sans pb-40">
      {/* --- [REQUIREMENT 3: REFINED HEADER UI] --- */}
      <header className="sticky top-0 z-50 bg-black text-white px-4 py-3 shadow-2xl font-bold">
        <div className="w-full flex justify-between items-start mb-3">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
               <h1 className="text-sm font-black tracking-tight">부스 현장판매 관리 시스템</h1>
               <span className="text-[10px] font-bold text-zinc-400">V6.2</span>
            </div>
            <p className="text-[9px] text-zinc-500 font-bold mt-0.5">by. KUIKUI💀</p>
            <div className="flex items-center gap-1.5 mt-1 opacity-60">
               {connStatus === 'connected' ? <Wifi size={8} className="text-emerald-500" /> : <WifiOff size={8} className="text-red-500" />}
               <span className="text-[7px] font-mono tracking-tighter uppercase">{connStatus === 'connected' ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
          <button onClick={toggleSound} className={`p-2 rounded-full transition-all active:scale-90 ${isSoundOn ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10'}`}>
            {isSoundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>
        <nav className="w-full flex gap-1 p-0.5 bg-zinc-900 rounded-xl font-bold">
          <button onClick={() => setViewMode('counter')} className={`flex-1 py-2.5 rounded-lg text-[10px] font-bold transition-all ${viewMode === 'counter' ? 'bg-white text-black shadow-lg scale-[1.02]' : 'text-zinc-500'}`}><ShoppingCart size={13} className="inline mr-1"/> 카운터</button>
          <button onClick={() => setViewMode('packing')} className={`flex-1 py-2.5 rounded-lg text-[10px] font-bold transition-all ${viewMode === 'packing' ? 'bg-emerald-600 text-white shadow-lg scale-[1.02]' : 'text-zinc-500'}`}><PackageCheck size={13} className="inline mr-1"/> 포장</button>
          <button onClick={() => setViewMode('history')} className={`flex-1 py-2.5 rounded-lg text-[10px] font-bold transition-all ${viewMode === 'history' ? 'bg-zinc-200 text-black shadow-lg scale-[1.02]' : 'text-zinc-500'}`}><HistoryIcon size={13} className="inline mr-1"/> 장부</button>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto p-3 font-bold">
        {viewMode === 'counter' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-zinc-100 font-bold">
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button onClick={() => setPaymentType('transfer')} className={`py-4 rounded-xl text-[13px] border-2 font-bold transition-all ${paymentType === 'transfer' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-white border-zinc-50 text-zinc-400'}`}><Landmark size={14} className="inline mr-1"/> 계좌이체</button>
                <button onClick={() => setPaymentType('cash')} className={`py-4 rounded-xl text-[13px] border-2 font-bold transition-all ${paymentType === 'cash' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-white border-zinc-50 text-zinc-400'}`}><Banknote size={14} className="inline mr-1"/> 현금결제</button>
              </div>
              <button onClick={() => setPaymentType('loss')} className={`w-full py-3 rounded-xl text-[11px] border-2 font-bold transition-all ${paymentType === 'loss' ? 'bg-red-600 text-white border-red-600 shadow-md' : 'bg-red-50 border-red-100 text-red-300'}`}><AlertCircle size={13} className="inline mr-1"/> 파손 / 분실 체크 모드</button>
            </div>

            {Object.entries(products).map(([cat, items]) => (
              <section key={cat} className="space-y-3 font-bold">
                <h2 className="text-base font-black border-l-[4px] border-black pl-2">{cat}</h2>
                <div className="grid grid-cols-1 gap-2.5">
                  {items.map((p) => (
                    <div key={p.id} className={`${CATEGORY_THEMES[cat]} rounded-xl p-4 flex flex-col items-center shadow-sm border-b-[4px] border-black/10 transition-transform active:scale-[0.99]`}>
                      <div className="w-full text-left mb-3">
                        <p className="font-extrabold text-[15px]">{p.name}</p>
                        <p className="text-[10px] font-bold opacity-40 font-mono">{formatPrice(p.price)}원 / {p.unit}</p>
                      </div>
                      <div className="flex items-center justify-center gap-1 bg-white/40 p-1.5 rounded-xl w-full max-w-[280px]">
                        <button onClick={() => updateCount(cat, p.id, -5)} className="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center shadow-sm active:scale-90"><ChevronsDown size={18}/></button>
                        <button onClick={() => updateCount(cat, p.id, -1)} className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm active:scale-90"><ChevronDown size={18}/></button>
                        <div className="flex-1 text-center font-black text-lg tabular-nums">{p.count}</div>
                        <button onClick={() => updateCount(cat, p.id, 1)} className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm active:scale-90"><ChevronUp size={18}/></button>
                        <button onClick={() => updateCount(cat, p.id, 5)} className="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center shadow-sm active:scale-90"><ChevronsUp size={18}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {viewMode === 'packing' && (
          <div className="space-y-5 pb-20 font-bold">
            <h2 className="text-xl font-black italic border-b-2 border-black pb-2">포장 대기 목록</h2>
            {orders.filter(o => o.status === 'pending').length === 0 ? (
               <div className="py-24 text-center text-zinc-300 italic">현재 대기 주문이 없습니다.</div>
            ) : (
              orders.filter(o => o.status === 'pending').slice().reverse().map(order => (
                <div key={order.id} className="bg-white border-2 border-black rounded-[28px] p-6 shadow-xl border-b-8 border-r-4">
                   <div className="flex justify-between items-center mb-4 border-b pb-3 font-bold">
                      <h3 className="text-xl font-black">No.{order.orderNo}</h3>
                      <span className="text-[10px] font-mono opacity-40 bg-zinc-100 px-2 py-1 rounded-md">{order.createdAt}</span>
                   </div>
                   <div className="space-y-1.5 mb-6 bg-zinc-50 p-4 rounded-xl border border-zinc-100 font-bold">
                      {order.items.map((it, idx) => (
                        <div key={idx} onClick={() => { const k = `${order.id}-${idx}`; setPackingChecked(prev => ({ ...prev, [k]: !prev[k] })); }} className={`flex justify-between text-[13px] font-bold border-b border-zinc-200/40 last:border-0 py-2 cursor-pointer transition-all ${packingChecked[`${order.id}-${idx}`] ? 'opacity-20 line-through text-zinc-400' : ''}`}>
                          <span className="flex items-center gap-2">
                             <div className={`w-1.5 h-1.5 rounded-full ${packingChecked[`${order.id}-${idx}`] ? 'bg-zinc-300' : 'bg-black animate-pulse'}`} />
                             {it.name}
                          </span>
                          <span className="bg-black text-white px-2.5 py-0.5 rounded-lg text-[10px]">x {it.count}</span>
                        </div>
                      ))}
                   </div>
                   <button onClick={() => markAsPacked(order.id)} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black shadow-lg active:scale-95 transition-all text-base">포장 완료 처리</button>
                </div>
              ))
            )}
          </div>
        )}

        {viewMode === 'history' && (
          <div className="space-y-5 pb-20 font-bold">
            <div className="flex justify-between items-center px-1 font-bold">
              <div className="flex flex-col">
                <h2 className="text-xl font-black">통합 판매 장부</h2>
                <span className="text-[8px] opacity-40 uppercase tracking-widest font-mono">Real-time DB Sync</span>
              </div>
              <div className="flex gap-2 font-bold">
                <button onClick={downloadCSV} className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shadow-sm hover:bg-emerald-100 transition-all font-bold"><Download size={20} /></button>
                <button onClick={() => setIsFilterOpen(!isFilterOpen)} className={`p-2.5 rounded-xl shadow-sm transition-all font-bold ${isFilterOpen ? 'bg-black text-white' : 'bg-white border'}`}><Filter size={20} /></button>
                <button onClick={() => setShowResetAuthModal(true)} className="p-2.5 bg-red-50 text-red-500 rounded-xl shadow-sm hover:bg-red-100 transition-all font-bold"><RotateCcw size={20} /></button>
              </div>
            </div>

            {/* --- [REQUIREMENT 4: SEARCH FILTER RESTORED] --- */}
            {isFilterOpen && (
              <div className="bg-white border-2 border-black p-5 rounded-[28px] shadow-2xl space-y-5 font-bold animate-in slide-in-from-top-4 overflow-hidden">
                <div className="flex justify-between items-center border-b pb-2">
                   <h3 className="text-xs font-black uppercase tracking-widest">Search Filter</h3>
                   <button onClick={() => setIsFilterOpen(false)}><X size={16} /></button>
                </div>
                <div className="space-y-4">
                   <div className="flex flex-col gap-1.5 font-bold">
                      <label className="text-[9px] font-black opacity-30 uppercase ml-1">결제수단</label>
                      <select value={filters.paymentType} onChange={(e) => setFilters({...filters, paymentType: e.target.value})} className="w-full bg-zinc-50 border-none rounded-xl p-3.5 text-xs font-bold outline-none ring-1 ring-zinc-100">
                        <option value="all">전체 내역</option>
                        <option value="cash">현금결제 내역</option>
                        <option value="transfer">계좌이체 내역</option>
                        <option value="loss">파손/분실 내역</option>
                      </select>
                   </div>
                   <div className="grid grid-cols-2 gap-2 font-bold">
                      <div className="flex flex-col gap-1.5 font-bold">
                         <label className="text-[9px] font-black opacity-30 uppercase ml-1">최소 금액</label>
                         <input type="number" placeholder="0" value={filters.minPrice} onChange={(e) => setFilters({...filters, minPrice: e.target.value})} className="w-full bg-zinc-50 rounded-xl p-3 text-xs outline-none ring-1 ring-zinc-100 font-bold" />
                      </div>
                      <div className="flex flex-col gap-1.5 font-bold">
                         <label className="text-[9px] font-black opacity-30 uppercase ml-1">최대 금액</label>
                         <input type="number" placeholder="MAX" value={filters.maxPrice} onChange={(e) => setFilters({...filters, maxPrice: e.target.value})} className="w-full bg-zinc-50 rounded-xl p-3 text-xs outline-none ring-1 ring-zinc-100 font-bold" />
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-2 font-bold">
                      <div className="flex flex-col gap-1.5 font-bold">
                         <label className="text-[9px] font-black opacity-30 uppercase ml-1">시작 시간</label>
                         <input type="time" value={filters.startTime} onChange={(e) => setFilters({...filters, startTime: e.target.value})} className="w-full bg-zinc-50 rounded-xl p-3 text-xs outline-none ring-1 ring-zinc-100 font-bold" />
                      </div>
                      <div className="flex flex-col gap-1.5 font-bold">
                         <label className="text-[9px] font-black opacity-30 uppercase ml-1">종료 시간</label>
                         <input type="time" value={filters.endTime} onChange={(e) => setFilters({...filters, endTime: e.target.value})} className="w-full bg-zinc-50 rounded-xl p-3 text-xs outline-none ring-1 ring-zinc-100 font-bold" />
                      </div>
                   </div>
                   <div className="flex flex-col gap-1.5 font-bold">
                      <label className="text-[9px] font-black opacity-30 uppercase ml-1">상품별 체크리스트</label>
                      <div className="bg-zinc-50 p-3 rounded-xl max-h-32 overflow-y-auto grid grid-cols-1 gap-1 border border-zinc-100 font-bold">
                         {ALL_ITEM_NAMES.map(name => (
                           <label key={name} className="flex items-center gap-2 text-[10px] cursor-pointer hover:bg-white p-1 rounded font-bold">
                              <input 
                                type="checkbox" 
                                checked={filters.selectedItems.includes(name)}
                                onChange={(e) => {
                                  const next = e.target.checked 
                                    ? [...filters.selectedItems, name] 
                                    : filters.selectedItems.filter(i => i !== name);
                                  setFilters({...filters, selectedItems: next});
                                }}
                                className="w-3 h-3 rounded"
                              />
                              <span className="truncate font-bold">{name}</span>
                           </label>
                         ))}
                      </div>
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-2 font-bold">
                   <button onClick={() => setFilters({paymentType:'all', minPrice:'', maxPrice:'', startTime:'', endTime:'', selectedItems:[]})} className="py-3.5 bg-zinc-100 text-zinc-400 rounded-2xl font-black text-xs font-bold">초기화</button>
                   <button onClick={() => setIsFilterOpen(false)} className="py-3.5 bg-black text-white rounded-2xl font-black text-xs shadow-lg active:scale-95 transition-all font-bold">검색 적용</button>
                </div>
              </div>
            )}

            <div className="space-y-4 font-bold">
              {filteredOrders.length === 0 ? (
                <div className="py-20 text-center text-zinc-300 italic text-sm font-bold">해당하는 내역이 없습니다.</div>
              ) : (
                filteredOrders.map(order => (
                  // --- [REQUIREMENT 1: Red Display for Loss] ---
                  <div key={order.id} className={`bg-white border rounded-[24px] p-5 shadow-sm border-l-[12px] ${order.status === 'packed' ? 'border-l-zinc-200 opacity-60' : (order.paymentType === 'loss' ? 'border-l-red-600 shadow-xl' : 'border-l-emerald-500 shadow-md')}`}>
                    <div className="flex justify-between items-center mb-3 opacity-70 font-black">
                       <span className="flex items-center gap-1.5 font-bold">
                          {/* --- [REQUIREMENT 2: Korean Payment Translation] --- */}
                          <span className={`text-[10px] uppercase tracking-tighter px-2 py-0.5 rounded-md font-bold ${order.paymentType === 'loss' ? 'bg-red-50 text-red-600' : 'bg-zinc-100 text-zinc-500'}`}>
                             {order.paymentType === 'transfer' ? '계좌이체' : order.paymentType === 'cash' ? '현금결제' : '파손/분실'}
                          </span>
                          <span className="text-[9px] opacity-40">No.{order.orderNo}</span>
                       </span>
                       <span className="text-[9px] font-mono italic">{order.createdAt}</span>
                    </div>
                    <div className="space-y-1.5 mb-4 text-[12px] font-bold">
                       {order.items.map((it, idx) => (
                         <div key={idx} className="flex justify-between items-center">
                           <span className="flex items-center gap-1.5 truncate pr-4">
                              <span className={`${getCategoryInfo(it.name).color} text-[8px] px-1.5 py-0.5 rounded font-black border border-black/5`}>[{getCategoryInfo(it.name).char}]</span>
                              <span className={order.paymentType === 'loss' ? 'text-red-700 font-bold' : ''}>{it.name} x{it.count}</span>
                           </span>
                           <span className="text-zinc-400 font-mono text-[11px] shrink-0">{formatPrice(it.price * it.count)}</span>
                         </div>
                       ))}
                    </div>
                    <div className="flex justify-between items-center border-t border-zinc-50 pt-3">
                       {/* --- [REQUIREMENT 3: Packaging Status Re-added] --- */}
                       <div className={`flex items-center gap-1.5 text-[9px] font-black ${order.status === 'packed' ? 'text-zinc-400' : 'text-emerald-600 animate-pulse'}`}>
                          {order.status === 'packed' ? <Check size={12}/> : <Loader2 size={12} className="animate-spin" />}
                          {order.status === 'packed' ? '포장완료' : '포장대기'}
                       </div>
                       <div className={`font-black text-lg tabular-nums ${order.paymentType === 'loss' ? 'text-red-600' : 'text-black'}`}>
                          {formatPrice(order.total || order.lossValue)}원
                       </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* --- [REQUIREMENT 5: Floating Receipt Height Adjustments] --- */}
      {viewMode === 'counter' && (
        <div className={`fixed bottom-0 left-0 right-0 z-40 transition-transform duration-500 ease-in-out ${isReceiptOpen ? 'translate-y-0' : 'translate-y-[calc(100%-65px)]'}`}>
          <div className="max-w-xl mx-auto px-4">
            <div className="flex justify-center">
              <button onClick={() => setIsReceiptOpen(!isReceiptOpen)} className="bg-black text-white px-10 py-3 rounded-t-[32px] flex items-center justify-center gap-2 font-black border-t border-white/10 shadow-[0_-20px_40px_rgba(0,0,0,0.35)] active:scale-95 transition-transform">
                {isReceiptOpen ? <ChevronDown size={22} /> : <ChevronUp size={22} />}
                <span className="text-[11px] uppercase tracking-widest leading-none font-bold">영수증 보기/접기 ({receiptItems.items.length}종)</span>
              </button>
            </div>
            {/* max-height restricted to 70vh and overflow auto to allow folding button access */}
            <div className="bg-white border-x-[8px] border-black p-8 h-auto max-h-[70vh] shadow-2xl rounded-t-sm font-bold overflow-y-auto">
              <div className="flex items-center gap-2 mb-6 opacity-30 font-black">
                 <Receipt size={18} />
                 <h3 className="text-[10px] uppercase tracking-[3px]">Current Order Log</h3>
              </div>
              <div className="space-y-4 mb-10 border-b-2 border-dashed border-zinc-100 pb-8 font-bold">
                {receiptItems.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-[15px] animate-in slide-in-from-bottom-2 font-bold">
                    <span className="truncate pr-4 flex items-center gap-2 font-bold">
                       <span className="text-[9px] opacity-30 font-black shrink-0">[{getCategoryInfo(item.name).char}]</span>
                       <span className="truncate font-bold">{item.name}</span>
                       <span className="opacity-40 text-[11px] font-mono shrink-0 ml-1 font-bold text-zinc-500">x{item.count}</span>
                    </span>
                    <span className="font-mono text-zinc-400 shrink-0 font-bold">{formatPrice(item.itemTotal)}</span>
                  </div>
                ))}
                {receiptItems.items.length === 0 && (
                  <div className="py-16 text-center flex flex-col items-center gap-2 opacity-15 font-bold">
                     <Receipt size={40} />
                     <p className="text-xs italic font-bold">상품을 담아주세요.</p>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 mb-10 font-bold">
                <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest font-bold">Total Amount</span>
                <span className={`text-5xl font-black tracking-tighter ${paymentType === 'loss' ? 'text-red-600' : 'text-black'} tabular-nums font-bold`}>{formatPrice(receiptItems.total)}원</span>
              </div>
              
              {/* --- [REQUIREMENT 7: Button Label Update] --- */}
              <button 
                disabled={receiptItems.items.length === 0 || isSubmitting || connStatus !== 'connected'} 
                onClick={handleConfirmOrder} 
                className={`w-full py-6 rounded-[28px] font-black text-xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-50 ${receiptItems.items.length > 0 && connStatus === 'connected' ? 'bg-emerald-600 text-white active:scale-95' : 'bg-zinc-100 text-zinc-300 cursor-not-allowed'} font-bold`}
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={28} />
                ) : (
                  paymentType === 'loss' ? <AlertCircle size={28}/> : <Check size={32} />
                )}
                <span className="font-bold">{connStatus !== 'connected' ? '네트워크 확인 중' : isSubmitting ? '전송 중...' : '판매완료'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODALS --- */}
      {showResetAuthModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md font-bold">
           <div className="bg-white w-full max-w-sm rounded-[36px] p-10 text-center border-t-[12px] border-red-600 shadow-2xl font-bold">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6"><Lock size={32} className="text-red-600" /></div>
              <h3 className="text-lg font-black mb-3 underline decoration-red-200 underline-offset-4 font-bold uppercase">DATABASE CLEANUP</h3>
              <p className="text-[11px] opacity-50 mb-8 leading-relaxed font-bold">데이터를 복구할 수 없습니다.<br/>관리자 비밀번호를 입력하십시오.</p>
              <input type="password" placeholder="****" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} className="w-full bg-zinc-50 border-2 rounded-2xl p-4 text-center text-4xl mb-6 outline-none font-black font-mono tracking-[10px] focus:ring-4 ring-red-50 transition-all font-bold" />
              <div className="flex flex-col gap-2 font-bold">
                <button onClick={handleGlobalReset} className="py-4.5 bg-red-600 text-white rounded-2xl font-black active:scale-95 transition-all shadow-lg shadow-red-50 font-bold">기록 완전 삭제</button>
                <button onClick={() => {setShowResetAuthModal(false); setResetPassword('');}} className="py-4.5 bg-zinc-100 text-zinc-400 rounded-2xl font-bold active:scale-95 transition-all font-bold">취소</button>
              </div>
           </div>
        </div>
      )}

      {showNewOrderPopup && viewMode === 'packing' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md font-bold">
          <div className="bg-white rounded-[48px] p-12 shadow-2xl text-center max-w-sm w-full animate-in zoom-in duration-300 border-[10px] border-black font-bold">
             <BellRing size={64} className="text-emerald-600 animate-bounce mx-auto mb-8 font-bold" />
             <h3 className="text-2xl font-black mb-2 tracking-tighter font-bold">새로운 주문 도착!</h3>
             <p className="text-zinc-500 text-xs mb-10 font-bold">방금 판매가 기록되었습니다.<br/>즉시 포장을 시작해 주십시오.</p>
             <button onClick={() => setShowNewOrderPopup(false)} className="w-full py-5 bg-black text-white rounded-3xl font-black text-lg shadow-xl active:scale-95 transition-all font-bold">확인</button>
          </div>
        </div>
      )}

      {/* --- [REQUIREMENT 6: Single-line Toast Message] --- */}
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[120] bg-zinc-900 text-white px-8 py-4 rounded-full shadow-2xl text-[11px] font-bold animate-in fade-in slide-in-from-top-6 flex items-center gap-3 whitespace-nowrap font-bold">
          <Check size={16} className="text-emerald-500 shrink-0 font-bold" />
          <span className="font-bold">{showToast}</span>
        </div>
      )}
    </div>
  );
};

export default App;
