import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, addDoc, updateDoc, onSnapshot, getDocs, writeBatch } from 'firebase/firestore';
import { 
  ShoppingCart, PackageCheck, History as HistoryIcon, 
  RotateCcw, Download, Filter, RefreshCcw, 
  ChevronUp, ChevronDown, ChevronsUp, ChevronsDown,
  Receipt, AlertCircle, Banknote, Landmark, Check, Lock, Volume2, VolumeX, BellRing, Loader2, Wifi, WifiOff, AlertTriangle
} from 'lucide-react';

// --- [CONFIGURATION] ---
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
const appId = "m5-integrated-v5-5";
const ADMIN_PW = "0927";

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

const App = () => {
  const [user, setUser] = useState(null);
  const [viewMode, setViewMode] = useState('counter'); 
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connStatus, setConnStatus] = useState('initializing');
  const [lastError, setLastError] = useState(null); // 에러 메시지 저장용
  const [products, setProducts] = useState(JSON.parse(JSON.stringify(INITIAL_PRODUCTS)));
  const [paymentType, setPaymentType] = useState('transfer'); 
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [showToast, setShowToast] = useState(null);
  const [showResetAuthModal, setShowResetAuthModal] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [isSoundOn, setIsSoundOn] = useState(false);
  const [showNewOrderPopup, setShowNewOrderPopup] = useState(false);

  const audioContextRef = useRef(null);
  const isInitialLoad = useRef(true);

  const formatPrice = (p) => p.toLocaleString('ko-KR');

  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        setLastError(`인증 오류: ${err.message}`);
        setConnStatus('error');
        setIsLoading(false);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        setConnStatus('connected');
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const ordersCol = collection(db, 'artifacts', appId, 'public', 'data', 'orders');
    const unsubscribe = onSnapshot(ordersCol, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const sorted = data.sort((a, b) => b.timestamp - a.timestamp);
      setOrders(sorted);
      setConnStatus('connected');
    }, (err) => {
      setLastError(`데이터베이스 오류: ${err.message}`);
      setConnStatus('error');
    });
    return () => unsubscribe();
  }, [user]);

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
      setShowToast("등록 완료!");
    } catch (err) {
      setLastError(`전송 오류: ${err.message}`);
      setShowToast("전송 실패");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setShowToast(null), 3000);
    }
  };

  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-white"><Loader2 className="animate-spin text-emerald-500" size={32} /></div>;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-black font-sans pb-40">
      <header className="sticky top-0 z-50 bg-black text-white px-4 py-2.5 shadow-2xl font-bold">
        <div className="w-full flex justify-between items-center mb-2.5">
          <div className="flex flex-col">
            <h1 className="text-sm font-black tracking-tight">부스 관리 시스템 V5.5</h1>
            <div className="flex items-center gap-1.5 mt-1">
               {connStatus === 'connected' ? <Wifi size={10} className="text-emerald-500" /> : <WifiOff size={10} className="text-red-500" />}
               <span className={`text-[8px] font-mono tracking-widest ${connStatus === 'connected' ? 'text-emerald-500' : 'text-red-500'}`}>
                 {connStatus === 'connected' ? 'CONNECTED' : 'OFFLINE'}
               </span>
            </div>
          </div>
          <button onClick={() => setIsSoundOn(!isSoundOn)} className={`p-1.5 rounded-full transition-all ${isSoundOn ? 'text-emerald-500' : 'text-red-500'}`}>
            {isSoundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
        <nav className="w-full flex gap-1 p-0.5 bg-zinc-900 rounded-xl">
          <button onClick={() => setViewMode('counter')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold ${viewMode === 'counter' ? 'bg-white text-black' : 'text-zinc-500'}`}>카운터</button>
          <button onClick={() => setViewMode('packing')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold ${viewMode === 'packing' ? 'bg-emerald-600 text-white' : 'text-zinc-500'}`}>포장</button>
          <button onClick={() => setViewMode('history')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold ${viewMode === 'history' ? 'bg-zinc-200 text-black' : 'text-zinc-500'}`}>장부</button>
        </nav>
      </header>

      {/* --- ERROR DIAGNOSTICS AREA --- */}
      {lastError && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
           <AlertTriangle size={14} className="text-red-600 mt-0.5 shrink-0" />
           <div className="flex flex-col gap-0.5">
             <p className="text-[10px] font-black text-red-600 uppercase tracking-tighter">System Error Detected</p>
             <p className="text-[11px] font-bold text-red-800 leading-tight">{lastError}</p>
             <p className="text-[9px] text-red-400 mt-1 italic">* 파이어베이스 콘솔에서 '승인된 도메인' 설정을 확인해 주세요.</p>
           </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto p-3 font-bold">
        {viewMode === 'counter' && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-zinc-100">
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button onClick={() => setPaymentType('transfer')} className={`py-3.5 rounded-xl font-bold text-[13px] border-2 transition-all ${paymentType === 'transfer' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border-zinc-50 text-zinc-400'}`}>계좌이체</button>
                <button onClick={() => setPaymentType('cash')} className={`py-3.5 rounded-xl font-bold text-[13px] border-2 transition-all ${paymentType === 'cash' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border-zinc-50 text-zinc-400'}`}>현금결제</button>
              </div>
            </div>

            {Object.entries(products).map(([cat, items]) => (
              <section key={cat} className="space-y-3 font-bold">
                <h2 className="text-base font-black border-l-[3px] border-black pl-2">{cat}</h2>
                <div className="grid grid-cols-1 gap-2.5">
                  {items.map((p) => (
                    <div key={p.id} className={`${CATEGORY_THEMES[cat]} rounded-xl p-3.5 flex flex-col items-center shadow-sm border-b-[3px] border-black/10`}>
                      <div className="w-full text-left mb-3">
                        <p className="font-extrabold text-[15px]">{p.name}</p>
                        <p className="text-[10px] font-bold opacity-40 font-mono">{formatPrice(p.price)}원</p>
                      </div>
                      <div className="flex items-center justify-center gap-1 bg-white/40 p-1 rounded-xl w-full max-w-[240px]">
                        <button onClick={() => updateCount(cat, p.id, -1)} className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm"><ChevronDown size={18}/></button>
                        <div className="flex-1 text-center font-black text-lg">{p.count}</div>
                        <button onClick={() => updateCount(cat, p.id, 1)} className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm"><ChevronUp size={18}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
        {/* 포장/장부 로직 생략(진단 집중) */}
      </main>

      {viewMode === 'counter' && (
        <div className={`fixed bottom-0 left-0 right-0 z-40`}>
           <div className="max-w-xl mx-auto px-4 pb-6">
              <div className="bg-white border-4 border-black p-6 rounded-3xl shadow-2xl">
                 <div className="flex justify-between items-end mb-6">
                    <span className="text-[10px] font-black text-zinc-300">TOTAL</span>
                    <span className="text-3xl font-black">{formatPrice(receiptItems.total)}원</span>
                 </div>
                 <button 
                  disabled={receiptItems.items.length === 0 || isSubmitting || connStatus !== 'connected'} 
                  onClick={handleConfirmOrder} 
                  className={`w-full py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all ${receiptItems.items.length > 0 && connStatus === 'connected' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-zinc-100 text-zinc-300'}`}
                 >
                   {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : <Check size={28} />}
                   <span>{connStatus !== 'connected' ? '통신 대기 중...' : isSubmitting ? '전송 중...' : '판매 완료'}</span>
                 </button>
              </div>
           </div>
        </div>
      )}

      {showToast && <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[120] bg-zinc-900 text-white px-6 py-3 rounded-full shadow-2xl text-[11px] font-bold">{showToast}</div>}
    </div>
  );
};

export default App;

