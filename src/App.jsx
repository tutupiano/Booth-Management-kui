import React, { useState, useEffect, useMemo, useRef, useCallback, memo } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, doc, updateDoc, onSnapshot, setDoc, addDoc } from 'firebase/firestore';
import { 
  ShoppingCart, PackageCheck, History as HistoryIcon, RotateCcw, Download, Filter, 
  RefreshCcw, ChevronUp, ChevronDown, ChevronsUp, ChevronsDown, Receipt, AlertCircle, 
  Banknote, Landmark, Check, Lock, Unlock, Volume2, VolumeX, BellRing, Loader2, X, 
  Settings, Plus, Trash2, Edit3, Image as ImageIcon, Info, GripVertical, User, 
  AlertTriangle, Wifi, WifiOff, Megaphone, Bold, Italic, Underline, Strikethrough, 
  AlignLeft, AlignCenter, AlignRight, Type, ArrowUp
} from 'lucide-react';

// --- [CONFIGURATION] ---
const getFirebaseConfig = () => {
  if (typeof __firebase_config !== 'undefined' && __firebase_config) {
    try { return JSON.parse(__firebase_config); } catch (e) {}
  }
  return {
    apiKey: "AIzaSyB7FOLlxPFT0VWFw3unZ-M_Zfasze5XzN8",
    authDomain: "booth-management-kui.firebaseapp.com",
    projectId: "booth-management-kui",
    storageBucket: "booth-management-kui.firebasestorage.app",
    messagingSenderId: "766168881320",
    appId: "1:766168881320:web:b4fd5704509ae527e54a9d",
    measurementId: "G-5D2XBGSDVR"
  };
};

const app = getApps().length === 0 ? initializeApp(getFirebaseConfig()) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

const appId = typeof __app_id !== 'undefined' ? __app_id : 'm5-integrated-v8-5';
const ADMIN_PW = "0927";

const DEFAULT_KIOSK_SETTINGS = {
  title: "KUIKUI GOODS STORE",
  bankName: "카카오뱅크",
  accountNumber: "3333-01-2345678",
  accountHolder: "김구이",
  footerNote: "🔔입금 전 반드시 받는 사람 이름과 보내는 금액을 확인해주세요!",
  noticeHTML: `<div style="text-align: center;"><font size="3">상품 재고는 입장시간에 맞춰 <b>3타임으로 분할판매</b> 됩니다.</font><div><font size="3"><br></font></div><div><font size="2" color="#ff0000">※ 오전 대량 구매 시 2~3차 판매가 없을 수 있습니다.</font></div></div>`,
  qrImageUrl: ""
};

const INITIAL_PRODUCTS = {
  "츠오미": [{ id: "tsu_1", name: "키레네 포스터", artist: "2o水", count: 0, price: 10000, unit: "개", color: "#FFD1DC", image: "", stock: 100, isTempActive: false, tempLimit: 0, tempSold: 0 }],
  "꾸이꾸이": [
    { id: "kui_1", name: "포카 : 선데이", artist: "KUIKUI💀", count: 0, price: 2000, unit: "개", color: "#CCEEFF", image: "", stock: 100, isTempActive: false, tempLimit: 0, tempSold: 0 },
    { id: "kui_2", name: "포카 : 파이논", artist: "KUIKUI💀", count: 0, price: 2000, unit: "개", color: "#CCEEFF", image: "", stock: 100, isTempActive: false, tempLimit: 0, tempSold: 0 },
    { id: "kui_3", name: "포카 : 마이데이", artist: "KUIKUI💀", count: 0, price: 2000, unit: "개", color: "#CCEEFF", image: "", stock: 100, isTempActive: false, tempLimit: 0, tempSold: 0 },
    { id: "kui_4", name: "포카 : 단항", artist: "KUIKUI💀", count: 0, price: 2000, unit: "개", color: "#CCEEFF", image: "", stock: 100, isTempActive: false, tempLimit: 0, tempSold: 0 },
    { id: "kui_5", name: "포카 SET", artist: "KUIKUI💀", count: 0, price: 7000, unit: "세트", color: "#CCEEFF", image: "", stock: 100, isTempActive: false, tempLimit: 0, tempSold: 0 },
    { id: "kui_6", name: "아크릴 키링 : 선데이", artist: "KUIKUI💀", count: 0, price: 7000, unit: "개", color: "#CCEEFF", image: "", stock: 100, isTempActive: false, tempLimit: 0, tempSold: 0 },
    { id: "kui_7", name: "아크릴 키링 : 파이논", artist: "KUIKUI💀", count: 0, price: 7000, unit: "개", color: "#CCEEFF", image: "", stock: 100, isTempActive: false, tempLimit: 0, tempSold: 0 },
    { id: "kui_8", name: "아크릴 키링 : 마이데이", artist: "KUIKUI💀", count: 0, price: 7000, unit: "개", color: "#CCEEFF", image: "", stock: 100, isTempActive: false, tempLimit: 0, tempSold: 0 },
    { id: "kui_9", name: "아크릴 키링 : 단항", artist: "KUIKUI💀", count: 0, price: 7000, unit: "개", color: "#CCEEFF", image: "", stock: 100, isTempActive: false, tempLimit: 0, tempSold: 0 },
    { id: "kui_10", name: "아크릴 키링 SET", artist: "KUIKUI💀", count: 0, price: 26000, unit: "세트", color: "#CCEEFF", image: "", stock: 100, isTempActive: false, tempLimit: 0, tempSold: 0 },
    { id: "kui_11", name: "키링참 : 선데이", artist: "KUIKUI💀", count: 0, price: 16000, unit: "개", color: "#CCEEFF", image: "", stock: 100, isTempActive: false, tempLimit: 0, tempSold: 0 },
    { id: "kui_12", name: "키링참 : 파이논", artist: "KUIKUI💀", count: 0, price: 16000, unit: "개", color: "#CCEEFF", image: "", stock: 100, isTempActive: false, tempLimit: 0, tempSold: 0 },
    { id: "kui_13", name: "키링참 : 마이데이", artist: "KUIKUI💀", count: 0, price: 16000, unit: "개", color: "#CCEEFF", image: "", stock: 100, isTempActive: false, tempLimit: 0, tempSold: 0 },
    { id: "kui_14", name: "키링참 : 단항", artist: "KUIKUI💀", count: 0, price: 16000, unit: "개", color: "#CCEEFF", image: "", stock: 100, isTempActive: false, tempLimit: 0, tempSold: 0 },
    { id: "kui_15", name: "키링참 SET", artist: "KUIKUI💀", count: 0, price: 60000, unit: "세트", color: "#CCEEFF", image: "", stock: 100, isTempActive: false, tempLimit: 0, tempSold: 0 },
    { id: "kui_16", name: "장패드", artist: "KUIKUI💀", count: 0, price: 20000, unit: "개", color: "#CCEEFF", image: "", stock: 100, isTempActive: false, tempLimit: 0, tempSold: 0 }
  ],
  "두근": [
    { id: "du_1", name: "레츄 만화책", artist: "DUGEUN", count: 0, price: 4000, unit: "권", color: "#EAE7E2", image: "", stock: 100, isTempActive: false, tempLimit: 0, tempSold: 0 },
    { id: "du_2", name: "교복 포카 : 파이논", artist: "DUGEUN", count: 0, price: 1000, unit: "개", color: "#EAE7E2", image: "", stock: 100, isTempActive: false, tempLimit: 0, tempSold: 0 },
    { id: "du_3", name: "교복 포카 : 아낙사", artist: "DUGEUN", count: 0, price: 1000, unit: "개", color: "#EAE7E2", image: "", stock: 100, isTempActive: false, tempLimit: 0, tempSold: 0 },
    { id: "du_4", name: "교복 포카 : 마이데이", artist: "DUGEUN", count: 0, price: 1000, unit: "개", color: "#EAE7E2", image: "", stock: 100, isTempActive: false, tempLimit: 0, tempSold: 0 },
    { id: "du_5", name: "교복 포카 : 스텔레", artist: "DUGEUN", count: 0, price: 1000, unit: "개", color: "#EAE7E2", image: "", stock: 100, isTempActive: false, tempLimit: 0, tempSold: 0 },
    { id: "du_6", name: "교복 포카 : 카일루스", artist: "DUGEUN", count: 0, price: 1000, unit: "개", color: "#EAE7E2", image: "", stock: 100, isTempActive: false, tempLimit: 0, tempSold: 0 },
    { id: "du_7", name: "히아킨 스티커", artist: "DUGEUN", count: 0, price: 3000, unit: "개", color: "#EAE7E2", image: "", stock: 100, isTempActive: false, tempLimit: 0, tempSold: 0 },
    { id: "du_8", name: "엡나&31 스티커", artist: "DUGEUN", count: 0, price: 3000, unit: "개", color: "#EAE7E2", image: "", stock: 100, isTempActive: false, tempLimit: 0, tempSold: 0 },
    { id: "du_9", name: "척자 스티커", artist: "DUGEUN", count: 0, price: 3000, unit: "개", color: "#EAE7E2", image: "", stock: 100, isTempActive: false, tempLimit: 0, tempSold: 0 }
  ],
  "기타": [
    { id: "etc_1", name: "낙텔 소설책", artist: "기타", count: 0, price: 15000, unit: "권", color: "#FFFFFF", image: "", stock: 100, isTempActive: false, tempLimit: 0, tempSold: 0 },
    { id: "etc_2", name: "조각 스티커", artist: "기타", count: 0, price: 2000, unit: "개", color: "#FFFFFF", image: "", stock: 100, isTempActive: false, tempLimit: 0, tempSold: 0 },
    { id: "etc_3", name: "수제 싸인지", artist: "기타", count: 0, price: 25000, unit: "장", color: "#FFFFFF", image: "", stock: 100, isTempActive: false, tempLimit: 0, tempSold: 0 }
  ]
};

// --- [UTILITIES] ---
const formatPrice = (p) => Number(p || 0).toLocaleString('ko-KR');

const getDarkerColor = (hex, amount = 120) => {
  if (!hex || hex === "#FFFFFF") return "#333333";
  let h = hex.replace("#", ""), num = parseInt(h, 16);
  let r = Math.max(0, (num >> 16) - amount), g = Math.max(0, ((num >> 8) & 0x00FF) - amount), b = Math.max(0, (num & 0x0000FF) - amount);
  return "#" + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
};

const getPaymentLabel = (type) => {
  if (type === 'transfer') return '계좌이체';
  if (type === 'cash') return '현금결제';
  if (type === 'loss') return '파손/분실';
  return type;
};

const hsvToHex = (h, s, v) => {
  let r, g, b;
  let i = Math.floor(h * 6);
  let f = h * 6 - i;
  let p = v * (1 - s);
  let q = v * (1 - f * s);
  let t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }
  const toHex = x => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const hexToHsv = (hex) => {
  let r = parseInt(hex.slice(1, 3), 16) / 255 || 0;
  let g = parseInt(hex.slice(3, 5), 16) / 255 || 0;
  let b = parseInt(hex.slice(5, 7), 16) / 255 || 0;
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, v = max;
  let d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h, s, v };
};

const SVArea = ({ hsv, onChange }) => {
  const areaRef = useRef();
  const handleMove = (e) => {
    if (!areaRef.current) return;
    const rect = areaRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    let s = (clientX - rect.left) / rect.width;
    let v = 1 - ((clientY - rect.top) / rect.height);
    onChange({ ...hsv, s: Math.max(0, Math.min(1, s)), v: Math.max(0, Math.min(1, v)) });
  };
  const onDown = (e) => {
    handleMove(e);
    const onMove = (moveEvt) => handleMove(moveEvt);
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
  };
  return (
     <div ref={areaRef} onMouseDown={onDown} onTouchStart={onDown} className="relative w-full h-40 rounded-lg overflow-hidden cursor-crosshair touch-none border border-zinc-200 shadow-inner" style={{ backgroundColor: `hsl(${hsv.h * 360}, 100%, 50%)` }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #fff, rgba(255,255,255,0))' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #000, rgba(0,0,0,0))' }} />
        <div className="absolute w-4 h-4 border-2 border-white rounded-full shadow-[0_0_4px_rgba(0,0,0,0.5)] -ml-2 -mt-2 pointer-events-none" style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%` }} />
     </div>
  );
};

const HueArea = ({ hsv, onChange }) => {
  const areaRef = useRef();
  const handleMove = (e) => {
    if (!areaRef.current) return;
    const rect = areaRef.current.getBoundingClientRect();
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    let h = (clientY - rect.top) / rect.height;
    onChange({ ...hsv, h: Math.max(0, Math.min(1, h)) });
  };
  const onDown = (e) => {
    handleMove(e);
    const onMove = (moveEvt) => handleMove(moveEvt);
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
  };
  return (
     <div ref={areaRef} onMouseDown={onDown} onTouchStart={onDown} className="relative w-10 h-40 rounded-lg cursor-ns-resize ml-4 touch-none border border-zinc-200 shadow-inner" style={{ background: 'linear-gradient(to bottom, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)' }}>
        <div className="absolute left-[-4px] right-[-4px] h-3 bg-white border border-zinc-300 rounded shadow-md -mt-1.5 pointer-events-none" style={{ top: `${hsv.h * 100}%` }} />
     </div>
  );
};

const CustomColorPickerPopup = ({ initialColor, onChange, onConfirm, onClose }) => {
  const [hsv, setHsv] = useState(() => hexToHsv(initialColor || '#ffffff'));
  const [hexVal, setHexVal] = useState(initialColor || '#ffffff');

  const handleHsvChange = (newHsv) => {
    setHsv(newHsv);
    const newHex = hsvToHex(newHsv.h, newHsv.s, newHsv.v);
    setHexVal(newHex);
    if(onChange) onChange(newHex);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 animate-in fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[24px] p-6 shadow-2xl flex flex-col w-full max-w-xs min-w-0">
         <h3 className="text-[16px] font-black mb-5 text-zinc-900 tracking-tight text-center">맞춤 색상 설정</h3>
         <div className="flex mb-6">
            <SVArea hsv={hsv} onChange={handleHsvChange} />
            <HueArea hsv={hsv} onChange={handleHsvChange} />
         </div>
         <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full shadow-inner border-[3px] border-zinc-100" style={{ backgroundColor: hexVal }} />
            <input type="text" value={hexVal} readOnly className="flex-1 bg-zinc-50 p-3.5 rounded-[12px] font-mono text-[14px] font-bold text-zinc-700 outline-none border border-zinc-200 text-center" />
         </div>
         <button onClick={() => { if(onConfirm) onConfirm(hexVal); onClose(); }} className="w-full py-4 bg-zinc-900 text-white rounded-[16px] font-bold text-[14px] active:scale-95 transition-all shadow-md">완료</button>
      </div>
    </div>
  );
};

const resizeImage = (file, targetSize = 250) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = targetSize; canvas.height = targetSize;
        const ctx = canvas.getContext('2d');
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, targetSize, targetSize);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
    };
  });
};

// --- [SUB-COMPONENTS] ---
const NoticeBox = ({ html }) => (
  <div className="bg-white rounded-[24px] p-5 shadow-sm border border-zinc-100/80 text-left relative overflow-hidden mb-5 min-w-0">
    <div className="flex items-center gap-2 mb-3 text-zinc-400 font-bold shrink-0 border-b border-zinc-50 pb-2">
      <Megaphone size={14} className="text-emerald-500" />
      <span className="uppercase text-[11px] tracking-wider font-bold">Notice</span>
    </div>
    <div className="rich-notice-view leading-relaxed text-zinc-800 font-medium text-[13px] min-w-0 overflow-hidden" dangerouslySetInnerHTML={{ __html: html || "공지사항 없음" }} />
  </div>
);

// 실시간 에디터
const NoticeEditor = ({ title, initialHTML, onChange }) => {
  const editorRef = useRef(null);
  const savedRange = useRef(null);
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [pickerConfig, setPickerConfig] = useState(null);

  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
        savedRange.current = range.cloneRange();
      }
    }
  }, []);

  const restoreSelection = useCallback(() => {
    if (savedRange.current) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
  }, []);

  const execCmd = (cmd, val = null) => {
    restoreSelection();
    document.execCommand(cmd, false, val);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      editorRef.current.focus();
    }
  };

  return (
    <div className="flex flex-col gap-2 min-w-0 relative">
      <div className="bg-white border border-zinc-200 rounded-[16px] shadow-sm flex flex-col divide-y divide-zinc-100 shrink-0">
        <div className="flex items-center justify-around p-2 gap-1.5">
          <button onMouseDown={(e) => {e.preventDefault(); restoreSelection();}} onClick={() => execCmd('bold')} className="flex-1 h-9 flex items-center justify-center bg-zinc-50 hover:bg-zinc-100 rounded-[10px] text-zinc-700 transition-colors"><Bold size={14}/></button>
          <button onMouseDown={(e) => {e.preventDefault(); restoreSelection();}} onClick={() => execCmd('underline')} className="flex-1 h-9 flex items-center justify-center bg-zinc-50 hover:bg-zinc-100 rounded-[10px] text-zinc-700 transition-colors"><Underline size={14}/></button>
          <button onMouseDown={(e) => {e.preventDefault(); restoreSelection();}} onClick={() => execCmd('strikeThrough')} className="flex-1 h-9 flex items-center justify-center bg-zinc-50 hover:bg-zinc-100 rounded-[10px] text-zinc-700 transition-colors"><Strikethrough size={14}/></button>
          <div className="w-[1px] h-5 bg-zinc-200 mx-0.5"></div>
          <button onMouseDown={(e) => {e.preventDefault(); restoreSelection();}} onClick={() => execCmd('justifyLeft')} className="flex-1 h-9 flex items-center justify-center bg-zinc-50 hover:bg-zinc-100 rounded-[10px] text-zinc-700 transition-colors"><AlignLeft size={14}/></button>
          <button onMouseDown={(e) => {e.preventDefault(); restoreSelection();}} onClick={() => execCmd('justifyCenter')} className="flex-1 h-9 flex items-center justify-center bg-zinc-50 hover:bg-zinc-100 rounded-[10px] text-zinc-700 transition-colors"><AlignCenter size={14}/></button>
          <button onMouseDown={(e) => {e.preventDefault(); restoreSelection();}} onClick={() => execCmd('justifyRight')} className="flex-1 h-9 flex items-center justify-center bg-zinc-50 hover:bg-zinc-100 rounded-[10px] text-zinc-700 transition-colors"><AlignRight size={14}/></button>
        </div>
        
        <div className="flex items-center p-2 gap-2 bg-zinc-50/50">
          <button onMouseDown={(e) => { e.preventDefault(); saveSelection(); setPickerConfig({ cmd: 'foreColor', initial: '#000000' }); }} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-[10px] flex-1 justify-center border border-zinc-100 shadow-sm cursor-pointer hover:bg-zinc-50 transition-colors active:scale-95">
             <span className="text-[10px] font-black text-zinc-500 tracking-tight shrink-0">글자색</span>
             <div className="w-4 h-4 rounded-full shadow-inner border border-zinc-200" style={{ background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }} />
          </button>
          <button onMouseDown={(e) => { e.preventDefault(); saveSelection(); setPickerConfig({ cmd: 'hiliteColor', initial: '#ffffff' }); }} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-[10px] flex-1 justify-center border border-zinc-100 shadow-sm cursor-pointer hover:bg-zinc-50 transition-colors active:scale-95">
             <span className="text-[10px] font-black text-zinc-500 tracking-tight shrink-0">배경색</span>
             <div className="w-4 h-4 rounded-full shadow-inner border border-zinc-200" style={{ background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }} />
          </button>
          
          <div className="relative flex items-center bg-white px-2 py-1.5 rounded-[10px] border border-zinc-100 shadow-sm shrink-0 min-w-[80px] h-[34px]">
             <button
                onMouseDown={(e) => { e.preventDefault(); restoreSelection(); setShowSizeMenu(!showSizeMenu); }}
                className="w-full flex justify-between items-center text-[11px] font-black text-zinc-600 outline-none"
             >
               <span>크기</span> <ChevronDown size={12}/>
             </button>
             {showSizeMenu && (
               <div className="absolute top-full right-0 mt-2 w-[90px] bg-white border border-zinc-200 rounded-[12px] shadow-[0_10px_20px_rgba(0,0,0,0.15)] z-50 flex flex-col py-1 overflow-hidden">
                  {[ {label:'10pt', val:'1'}, {label:'13pt', val:'2'}, {label:'16pt', val:'3'}, {label:'18pt', val:'4'}, {label:'24pt', val:'5'}, {label:'32pt', val:'6'}, {label:'48pt', val:'7'} ].map(sz => (
                     <button
                       key={sz.val}
                       onMouseDown={(e) => {
                         e.preventDefault();
                         restoreSelection();
                         execCmd('fontSize', sz.val);
                         setShowSizeMenu(false);
                       }}
                       className="text-center px-3 py-2.5 text-[12px] font-bold hover:bg-zinc-100 text-zinc-700 transition-colors"
                     >
                       {sz.label}
                     </button>
                  ))}
               </div>
             )}
          </div>
        </div>
      </div>
      
      <div className="bg-white border-[1.5px] border-emerald-500 rounded-[24px] p-5 shadow-sm text-left relative overflow-hidden min-w-0 mt-2 z-0">
        <div className="flex items-center justify-between mb-3 shrink-0 border-b border-zinc-100 pb-2">
          <div className="flex items-center gap-2 text-zinc-400 font-bold">
            <Megaphone size={14} className="text-emerald-500"/>
            <span className="uppercase text-[11px] tracking-wider font-bold whitespace-nowrap">{title}</span>
          </div>
          <span className="text-[9px] bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md font-bold">Live Preview</span>
        </div>
        <div 
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onMouseUp={saveSelection}
          onKeyUp={saveSelection}
          onTouchEnd={saveSelection}
          onBlur={saveSelection}
          onInput={(e) => onChange(e.currentTarget.innerHTML)}
          className="rich-notice-view leading-relaxed text-zinc-800 font-medium text-[13px] min-w-0 outline-none min-h-[80px]"
          dangerouslySetInnerHTML={{ __html: initialHTML || "" }}
        />
      </div>

      {pickerConfig && (
        <CustomColorPickerPopup
          initialColor={pickerConfig.initial}
          onConfirm={(newColor) => execCmd(pickerConfig.cmd, newColor)}
          onClose={() => setPickerConfig(null)}
        />
      )}
    </div>
  );
};

const ProductCard = memo(({ p, cat, onUpdate }) => {
  if (!p) return null;
  const darkerColor = getDarkerColor(p.color, 140);
  const stock = Number(p.stock || 0);
  const isSoldOut = stock <= 0;
  const isTempOut = p.isTempActive && p.tempLimit > 0 && (p.tempSold || 0) >= p.tempLimit;
  const isUnavailable = isSoldOut || isTempOut;
  const atMaxLimit = p.count >= stock || (p.isTempActive && (p.count + (p.tempSold||0) >= p.tempLimit));
  const currentRemaining = (p.isTempActive && p.tempLimit > 0) ? Math.max(0, p.tempLimit - (p.tempSold || 0)) : Math.max(0, stock);

  return (
    <div style={{ backgroundColor: p.color || '#FFFFFF' }} className="rounded-[28px] p-4 flex flex-col items-center shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all relative overflow-hidden min-w-0 mb-3 border border-white/60">
      
      {isUnavailable && (
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-white/20 backdrop-blur-[1.5px]" />
          <span 
            className="relative text-red-600 font-black text-[28px] rotate-[-10deg] uppercase text-center whitespace-nowrap tracking-widest"
            style={{ 
              textShadow: '-3px -3px 0 #fff, 3px -3px 0 #fff, -3px 3px 0 #fff, 3px 3px 0 #fff, 0px 5px 15px rgba(0,0,0,0.25)',
              zIndex: 40
            }}
          >
            {isSoldOut ? 'SOLD OUT' : '일시품절'}
          </span>
        </div>
      )}
      <div className={`w-full flex flex-col items-center min-w-0 ${isUnavailable ? 'grayscale-[0.4] opacity-80' : ''}`}>
        <div className="w-full flex items-start mb-4 font-bold text-left gap-4 min-w-0">
          <div className="shrink-0">
            {p.image ? (
              <img src={p.image} className="w-20 h-20 rounded-[20px] object-cover border-[3px] border-white shadow-md bg-white" alt="Thumb" />
            ) : (
              <div className="w-20 h-20 bg-white/50 border-[3px] border-white border-dashed rounded-[20px] flex items-center justify-center text-zinc-300 shadow-sm"><ImageIcon size={24}/></div>
            )}
          </div>
          
          <div className="flex-1 min-w-0 flex flex-col justify-between h-20 py-0.5">
            <div className="min-w-0">
              <div className="flex items-center justify-between min-w-0 gap-2 mb-1">
                 <p className="font-black text-[15px] text-zinc-900 truncate min-w-0 leading-tight tracking-tight">{String(p.name)}</p>
                 <span className="text-[8px] text-zinc-500 font-bold bg-white/60 px-2 py-0.5 rounded-full border border-black/5 whitespace-nowrap shrink-0">{String(p.artist)}</span>
              </div>
            </div>
            
            <div className="flex items-end justify-between mt-1">
              <div className="flex items-center gap-2 min-w-0">
                 <p className="text-[14px] font-black truncate whitespace-nowrap shrink-0" style={{ color: darkerColor }}>{formatPrice(p.price)}원</p>
                 {!isUnavailable && currentRemaining <= 3 && (
                    <span className="animate-bounce text-[9px] font-black text-red-600 tracking-tight whitespace-nowrap bg-white/80 px-2 py-0.5 rounded-full border border-red-200 shadow-sm shrink-0">
                      재고가 {currentRemaining}개 남았어요!
                    </span>
                 )}
              </div>
              {p.count > 0 ? (
                <div className="bg-zinc-900 text-white px-2.5 py-1 rounded-lg text-[9px] font-bold animate-pulse shadow-sm ml-2 shrink-0">담김: {p.count}개</div>
              ) : <div className="h-[22px]"/>}
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between bg-white/60 p-1.5 rounded-[20px] w-full shadow-sm backdrop-blur-sm border border-white/40">
          <div className="flex items-center gap-1 w-full">
            <button disabled={isUnavailable || p.count <= 0} onClick={() => onUpdate(cat, p.id, -5)} className="flex-1 h-10 bg-white rounded-[14px] flex items-center justify-center active:scale-95 disabled:opacity-40 text-zinc-500 shadow-sm transition-all"><ChevronsDown size={18}/></button>
            <button disabled={isUnavailable || p.count <= 0} onClick={() => onUpdate(cat, p.id, -1)} className="flex-[1.2] h-10 bg-white rounded-[14px] flex items-center justify-center active:scale-95 disabled:opacity-40 text-zinc-800 shadow-sm transition-all"><ChevronDown size={18}/></button>
            <div className="flex-[1.5] text-center font-black text-xl tabular-nums text-zinc-900 h-10 flex items-center justify-center min-w-[45px] tracking-tight">{p.count}</div>
            <button disabled={isUnavailable || atMaxLimit} onClick={() => onUpdate(cat, p.id, 1)} className="flex-[1.2] h-10 bg-zinc-900 rounded-[14px] flex items-center justify-center active:scale-95 disabled:opacity-40 text-white shadow-sm transition-all"><ChevronUp size={18}/></button>
            <button disabled={isUnavailable || atMaxLimit || (p.isTempActive && (p.count + 4 >= p.tempLimit))} onClick={() => onUpdate(cat, p.id, 5)} className="flex-1 h-10 bg-zinc-800 rounded-[14px] flex items-center justify-center active:scale-95 disabled:opacity-40 text-zinc-200 shadow-sm transition-all"><ChevronsUp size={18}/></button>
          </div>
        </div>
      </div>
    </div>
  );
});

const EditableProductCard = ({ p, cat, idx, products, setProducts, onDragStart, onDrop }) => {
  if (!p) return null;
  const darkerColor = getDarkerColor(p.color, 140);
  
  return (
    <div draggable onDragStart={() => onDragStart(cat, idx)} onDrop={(e) => { e.stopPropagation(); onDrop(cat, idx); }}
         style={{ backgroundColor: p.color || '#FFFFFF' }} 
         className="rounded-[24px] p-4 flex flex-col items-center shadow-sm relative cursor-grab active:cursor-grabbing min-w-0 mb-3 border border-white/50">
      
      <div className="w-full flex flex-col items-center min-w-0">
        <div className="w-full flex items-start mb-3 font-bold text-left gap-3 min-w-0">
          <div className="shrink-0 cursor-pointer group" onClick={() => {
              const input = document.createElement('input'); 
              input.type = 'file'; input.accept = 'image/*'; 
              input.onchange = async (e) => { 
                const file = e.target.files[0]; if (!file) return; 
                const resized = await resizeImage(file, 250); 
                const n = {...products}; n[cat][idx].image = resized; setProducts(n); 
              }; 
              input.click(); 
          }}>
            {p.image ? (
              <div className="relative w-20 h-20 rounded-[16px] overflow-hidden shadow-sm bg-white border-[3px] border-white">
                <img src={p.image} className="w-full h-full object-cover" alt="T" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Edit3 size={16} className="text-white"/></div>
              </div>
            ) : (
              <div className="w-20 h-20 bg-white/60 rounded-[16px] flex flex-col items-center justify-center text-zinc-400 shadow-sm border border-dashed border-zinc-300">
                <ImageIcon size={20} className="mb-1"/>
                <span className="text-[8px]">이미지</span>
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0 flex flex-col justify-center gap-2 h-20 py-1">
            <div className="flex items-center gap-2 min-w-0">
               <input placeholder="상품명" value={String(p.name || "")} className="font-bold text-[14px] text-zinc-900 bg-white/60 px-2 py-1.5 rounded-lg outline-none truncate flex-1 min-w-0 placeholder-zinc-400 border border-white/50 focus:border-zinc-300 transition-colors" onChange={(e) => { const n = {...products}; n[cat][idx].name = e.target.value; setProducts(n); }} />
               <input placeholder="작가명" value={String(p.artist || "")} className="text-[10px] text-zinc-600 font-bold bg-white/60 px-2 py-1.5 rounded-lg shrink-0 w-[60px] text-center outline-none border border-white/50 focus:border-zinc-300 transition-colors" onChange={(e) => { const n = {...products}; n[cat][idx].artist = e.target.value; setProducts(n); }} />
            </div>
            <div className="flex items-center gap-1 min-w-0">
               <input type="number" value={p.price || 0} className="text-[13px] font-bold text-zinc-900 bg-white/60 px-2 py-1.5 rounded-lg outline-none w-[70px] text-right border border-white/50 focus:border-zinc-300 transition-colors" onChange={(e) => { const n = {...products}; n[cat][idx].price = Number(e.target.value); setProducts(n); }} />
               <span className="text-[12px] font-bold text-zinc-600">원 /</span>
               <input placeholder="단위" value={String(p.unit || "")} className="text-[12px] font-bold text-zinc-900 bg-white/60 px-2 py-1.5 rounded-lg outline-none w-[40px] text-center border border-white/50 focus:border-zinc-300 transition-colors" onChange={(e) => { const n = {...products}; n[cat][idx].unit = e.target.value; setProducts(n); }} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 bg-white/50 p-2.5 rounded-[20px] w-full shadow-sm border border-white/40">
           <div className="flex items-center justify-between gap-2 w-full">
             <div className="flex items-center gap-2 pl-2">
               <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Stock</span>
               <input type="number" value={p.stock || 0} className="w-16 h-8 bg-white rounded-[10px] text-center font-bold text-[12px] outline-none shadow-sm text-zinc-900" onChange={(e) => { const n = {...products}; n[cat][idx].stock = Number(e.target.value); setProducts(n); }} />
             </div>
             <button onClick={() => { const n = {...products}; n[cat].splice(idx,1); setProducts(n); }} className="h-8 px-3.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-[10px] flex items-center gap-1.5 active:scale-95 shadow-sm shrink-0 transition-colors">
               <Trash2 size={12} strokeWidth={2.5}/>
               <span className="text-[10px] font-bold">삭제</span>
             </button>
           </div>
           
           <div className="flex items-center gap-2 bg-red-50/80 p-2 rounded-[12px] border border-red-100">
             <label className="flex items-center gap-2 cursor-pointer ml-1">
               <input type="checkbox" checked={p.isTempActive || false} onChange={(e) => { const n = {...products}; n[cat][idx].isTempActive = e.target.checked; if(e.target.checked) n[cat][idx].tempSold = 0; setProducts(n); }} className="w-4 h-4 accent-red-500 rounded" />
               <span className="text-[11px] font-bold text-red-600 tracking-tight">일시품절 한도</span>
             </label>
             {p.isTempActive && (
               <div className="flex items-center gap-1.5 ml-auto">
                 <input type="number" value={p.tempLimit || 0} onChange={(e) => { const n = {...products}; n[cat][idx].tempLimit = Number(e.target.value); setProducts(n); }} className="w-14 h-7 bg-white rounded-[8px] text-center font-bold text-[12px] outline-none border border-red-200 text-red-600 shadow-sm" />
                 <span className="text-[10px] font-bold text-red-500 pr-1">개</span>
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

// --- [MAIN APP] ---
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
  const [connStatus, setConnStatus] = useState('offline');
  const [adminPwInput, setAdminPwInput] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showOrderDonePopup, setShowOrderDonePopup] = useState(false);
  const [showToast, setShowToast] = useState('');
  const [paymentType, setPaymentType] = useState('transfer');
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [packingChecked, setPackingChecked] = useState({});
  const [filters, setFilters] = useState({ paymentType: 'all', category: 'all' });
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [activeColorPicker, setActiveColorPicker] = useState(null);

  const dragItem = useRef(null);
  const audioContextRef = useRef(null);
  const notifiedOrderIds = useRef(new Set());
  const isInitialLoad = useRef(true);
  const initialNoticeRef = useRef(null);

  const pendingOrders = useMemo(() => orders.filter(o => o.status === 'pending'), [orders]);
  
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (filters.paymentType !== 'all' && o.paymentType !== filters.paymentType) return false;
      return true;
    });
  }, [orders, filters]);

  const receiptItems = useMemo(() => {
    let items = [], total = 0;
    Object.entries(products).forEach(([cat, list]) => {
      if (Array.isArray(list)) list.forEach(p => { if (p.count > 0) { items.push({ ...p, category: cat, itemTotal: p.count * p.price }); total += p.count * p.price; } });
    });
    return { items, total };
  }, [products]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const downloadExcel = useCallback(() => {
    let tableStr = `
      <html xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head><meta charset="utf-8"></head>
      <body>
        <table border="1">
          <tr>
            <th style="background-color:#f0f0f0;">번호</th>
            <th style="background-color:#f0f0f0;">이름</th>
            <th style="background-color:#f0f0f0;">구매 상세</th>
            <th style="background-color:#f0f0f0;">결제 금액</th>
            <th style="background-color:#f0f0f0;">결제 방법</th>
          </tr>`;

    const sortedOrders = [...filteredOrders].sort((a, b) => a.orderNo - b.orderNo);

    sortedOrders.forEach(order => {
      const details = order.items.map(i => `${i.name}(${i.count})`).join(' / ');
      const amount = order.paymentType === 'loss' ? 0 : order.total;
      const method = order.paymentType === 'transfer' ? '계좌이체' : order.paymentType === 'cash' ? '현금결제' : '파손/분실';
      tableStr += `<tr>
        <td style="text-align:center;">${order.orderNo}</td>
        <td></td>
        <td>${details}</td>
        <td style="text-align:right;">${amount}</td>
        <td style="text-align:center;">${method}</td>
      </tr>`;
    });

    tableStr += `<tr><td colspan="5"></td></tr><tr><td colspan="5"></td></tr>`;
    tableStr += `<tr><th style="background-color:#ffe599;">작가명</th><th style="background-color:#ffe599;">판매수량</th><th style="background-color:#ffe599;">총 정산금액</th><th colspan="2"></th></tr>`;

    const artistStats = {};
    sortedOrders.forEach(order => {
      if (order.paymentType !== 'loss') {
        order.items.forEach(item => {
          if (!artistStats[item.artist]) artistStats[item.artist] = { qty: 0, total: 0 };
          artistStats[item.artist].qty += item.count;
          artistStats[item.artist].total += item.price * item.count;
        });
      }
    });

    Object.entries(artistStats).forEach(([artist, stats]) => {
      tableStr += `<tr><td style="text-align:center;">${artist}</td><td style="text-align:center;">${stats.qty}</td><td style="text-align:right;">${stats.total}</td><td colspan="2"></td></tr>`;
    });

    tableStr += `</table></body></html>`;

    const blob = new Blob([tableStr], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `판매장부_${new Date().toLocaleDateString('ko-KR').replace(/ /g, '')}.xls`;
    link.click();
    URL.revokeObjectURL(url);
  }, [filteredOrders]);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 200);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const playNotificationSound = useCallback(async () => {
    try {
      if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();
      const ctx = audioContextRef.current;
      const now = ctx.currentTime;
      const playTone = (freq, vol, start, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine'; osc.frequency.setValueAtTime(freq, now + start);
        gain.gain.setValueAtTime(vol, now + start); gain.gain.exponentialRampToValueAtTime(0.001, now + start + duration);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now + start); osc.stop(now + start + duration);
      };
      playTone(1318.51, 0.1, 0, 0.4); playTone(1567.98, 0.1, 0.1, 0.4); 
    } catch (e) {}
  }, []);

  const handleAdminAuth = useCallback(() => {
    if (adminPwInput === ADMIN_PW) { setIsAdminMode(true); setShowAuthModal(false); setAdminPwInput(''); setShowToast("관리자 모드 활성화"); }
    else { setShowToast("비밀번호가 맞지 않습니다."); setAdminPwInput(''); }
    setTimeout(() => setShowToast(''), 2000);
  }, [adminPwInput]);

  const updateItemCount = useCallback((cat, id, delta) => {
    setProducts(prev => {
      const next = { ...prev };
      if (next[cat]) {
        next[cat] = next[cat].map(p => {
          if (p.id === id) {
            const currentLimit = (p.isTempActive && p.tempLimit > 0) ? (p.tempLimit - (p.tempSold || 0)) : (p.stock || 999);
            return { ...p, count: Math.max(0, Math.min(currentLimit, p.count + delta)) };
          }
          return p;
        });
      }
      return next;
    });
  }, []);

  const markAsPacked = async (id) => {
    if (!user) return;
    try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', id), { status: 'packed' }); setShowToast("포장 완료"); }
    catch(e) { setShowToast("오류: 권한이 없습니다."); }
    setTimeout(() => setShowToast(''), 2000);
  };

  const handleOrderSubmit = async () => {
    if (!user) { setShowToast("연결 확인 필요"); return; }
    if (receiptItems.items.length === 0 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') audioContextRef.current.resume();
      const isLoss = paymentType === 'loss';
      const orderData = {
        orderNo: orders.length + 1,
        items: receiptItems.items.map(i => ({ id: String(i.id), name: String(i.name), count: Number(i.count), price: Number(i.price), artist: String(i.artist), category: String(i.category) })),
        total: isLoss ? 0 : Number(receiptItems.total),
        lossValue: isLoss ? Number(receiptItems.total) : 0,
        paymentType: String(paymentType), status: isLoss ? 'packed' : 'pending', timestamp: Date.now(), createdAt: new Date().toLocaleTimeString('ko-KR')
      };
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), orderData);
      
      const nextProducts = JSON.parse(JSON.stringify(products));
      receiptItems.items.forEach(soldItem => {
        if (nextProducts[soldItem.category]) {
          const p = nextProducts[soldItem.category].find(it => it.id === soldItem.id);
          if (p) { p.stock = Math.max(0, (p.stock || 0) - soldItem.count); if (p.isTempActive) p.tempSold = (p.tempSold || 0) + soldItem.count; }
        }
      });
      Object.keys(nextProducts).forEach(c => { if (Array.isArray(nextProducts[c])) nextProducts[c].forEach(p => p.count = 0); });
      
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'metadata'), { products: nextProducts }, { merge: true });
      setProducts(nextProducts); setIsReceiptOpen(false);
      
      if (isLoss) { setShowToast("파손/분실 기록 완료"); setPaymentType('transfer'); }
      else setShowOrderDonePopup(true);
    } catch (e) { setShowToast("저장 실패"); }
    finally { setIsSubmitting(false); setTimeout(() => setShowToast(''), 3000); }
  };

  const onDragStart = (cat, index) => { dragItem.current = { cat, index }; };
  const onDrop = (cat, targetIndex) => {
    if (!dragItem.current) return;
    const { cat: sourceCat, index: sourceIndex } = dragItem.current;
    if (!products[sourceCat]) return;
    
    const nextProducts = { ...products };
    const sourceItems = [...(nextProducts[sourceCat] || [])];
    const [movedItem] = sourceItems.splice(sourceIndex, 1);
    
    if (sourceCat === cat) {
      sourceItems.splice(targetIndex === -1 ? sourceItems.length : targetIndex, 0, movedItem);
      nextProducts[cat] = sourceItems;
    } else {
      const targetItems = [...(nextProducts[cat] || [])];
      const targetColor = targetItems[0]?.color || "#FFFFFF";
      movedItem.color = targetColor;
      targetItems.splice(targetIndex === -1 ? targetItems.length : targetIndex, 0, movedItem);
      nextProducts[sourceCat] = sourceItems;
      nextProducts[cat] = targetItems;
    }
    setProducts(nextProducts);
    dragItem.current = null;
  };

  useEffect(() => {
    const initAuth = async () => {
      try { (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) ? await signInWithCustomToken(auth, __initial_auth_token) : await signInAnonymously(auth); setConnStatus('online'); }
      catch (e) { setConnStatus('offline'); }
    };
    initAuth();
    const unsubAuth = onAuthStateChanged(auth, (u) => { setUser(u); setIsLoading(false); });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubOrders = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (isInitialLoad.current) { data.forEach(o => notifiedOrderIds.current.add(o.id)); isInitialLoad.current = false; }
      else {
        let hasNew = false;
        data.forEach(o => { if (!notifiedOrderIds.current.has(o.id)) { notifiedOrderIds.current.add(o.id); if (o.status === 'pending') hasNew = true; } });
        if (hasNew) playNotificationSound();
      }
      setOrders(data.sort((a, b) => b.timestamp - a.timestamp));
    });
    
    const unsubMeta = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'metadata'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.products) setProducts(data.products);
        if (data.categoryOrder) setCategoryOrder(data.categoryOrder);
        if (data.kioskSettings) { 
          setKioskSettings(prev => ({ ...DEFAULT_KIOSK_SETTINGS, ...data.kioskSettings })); 
          if (initialNoticeRef.current === null) initialNoticeRef.current = data.kioskSettings.noticeHTML || DEFAULT_KIOSK_SETTINGS.noticeHTML; 
        }
      } else {
        setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'metadata'), { products: INITIAL_PRODUCTS, categoryOrder: ["츠오미", "꾸이꾸이", "두근", "기타"], kioskSettings: DEFAULT_KIOSK_SETTINGS }, { merge: true });
        if (initialNoticeRef.current === null) initialNoticeRef.current = DEFAULT_KIOSK_SETTINGS.noticeHTML;
      }
    });
    return () => { unsubOrders(); unsubMeta(); };
  }, [user, playNotificationSound]);

  if (isLoading) return <div className="min-h-screen bg-[#F4F5F7] flex flex-col items-center justify-center text-zinc-800"><Loader2 className="animate-spin mb-4 text-zinc-400" size={32}/><p className="text-[11px] font-bold tracking-widest text-zinc-500">LOADING</p></div>;

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-zinc-900 pb-40 select-none overflow-x-hidden font-sans">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl px-4 py-3 border-b border-zinc-200/50 shadow-sm">
        <div className="max-w-4xl mx-auto w-full flex justify-between items-center mb-3 min-w-0">
          <div className="flex flex-col text-left min-w-0 flex-1 pr-2">
            <h1 className="text-[15px] leading-tight font-black text-zinc-900 tracking-tight truncate">Booth Management</h1>
            <p className="text-[10px] text-zinc-400 mt-0.5 font-bold tracking-wide truncate">V8.13.3 <span className="text-emerald-500 ml-1">ONLINE</span></p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => setShowOrderDonePopup(true)} className="p-2 rounded-full text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-colors active:scale-95 border border-zinc-200 shadow-sm"><Banknote size={16} /></button>
            <button onClick={() => isAdminMode ? setIsAdminMode(false) : setShowAuthModal(true)} className="p-2 rounded-full text-white bg-zinc-900 hover:bg-black transition-colors shadow-sm">{isAdminMode ? <Unlock size={16} /> : <Lock size={16} />}</button>
          </div>
        </div>
        <nav className="max-w-4xl mx-auto w-full flex justify-center p-1 bg-zinc-100 rounded-[16px] shadow-inner">
            <div className={`flex w-full ${isAdminMode ? 'max-w-md' : 'max-w-xs'} gap-1.5`}>
              <button onClick={() => setViewMode('order')} className={`flex-1 py-2 rounded-[12px] text-[12px] font-bold whitespace-nowrap transition-all shadow-sm ${viewMode === 'order' ? 'bg-white text-zinc-900' : 'bg-transparent text-zinc-500 shadow-none hover:text-zinc-700'}`}>주문</button>
              {isAdminMode && (
                <>
                  <button onClick={() => setViewMode('packing')} className={`flex-1 py-2 rounded-[12px] text-[12px] font-bold whitespace-nowrap relative transition-all shadow-sm ${viewMode === 'packing' ? 'bg-zinc-900 text-white' : 'bg-transparent text-zinc-500 shadow-none hover:text-zinc-700'}`}>
                    포장 {pendingOrders.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full animate-pulse font-black shadow-sm">{pendingOrders.length}</span>}
                  </button>
                  <button onClick={() => setViewMode('history')} className={`flex-1 py-2 rounded-[12px] text-[12px] font-bold whitespace-nowrap transition-all shadow-sm ${viewMode === 'history' ? 'bg-zinc-900 text-white' : 'bg-transparent text-zinc-500 shadow-none hover:text-zinc-700'}`}>장부</button>
                  <button onClick={() => setViewMode('settings')} className={`flex-1 py-2 rounded-[12px] text-[12px] font-bold whitespace-nowrap flex items-center justify-center transition-all shadow-sm ${viewMode === 'settings' ? 'bg-zinc-900 text-white' : 'bg-transparent text-zinc-500 shadow-none hover:text-zinc-700'}`}><Settings size={14}/></button>
                </>
              )}
            </div>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        {viewMode === 'order' && (
          <div className="space-y-6">
            {kioskSettings?.noticeHTML && <NoticeBox html={kioskSettings.noticeHTML} />}
            
            {isAdminMode && (
               <div className="bg-red-50 rounded-[20px] p-4 shadow-sm border border-red-100 flex justify-between items-center">
                 <div className="flex flex-col">
                   <span className="text-[11px] text-red-600 font-black uppercase tracking-wider">Admin Mode</span>
                   <span className="text-[10px] text-red-400 font-medium">파손 및 분실 재고를 처리합니다.</span>
                 </div>
                 <button onClick={() => setPaymentType(p => p === 'loss' ? 'transfer' : 'loss')} className={`px-5 py-2.5 rounded-[12px] text-[11px] font-black transition-all shadow-sm ${paymentType === 'loss' ? 'bg-red-600 text-white' : 'bg-white text-red-500 border border-red-200'}`}>{paymentType === 'loss' ? '기록 모드 켜짐' : '기록 모드 켜기'}</button>
               </div>
            )}

            {(categoryOrder || []).map((cat) => {
              if (!products[cat] || products[cat].length === 0) return null;
              return (
                <section key={cat} className="space-y-3 text-left mb-8 min-w-0">
                  <h2 className="text-[16px] font-black text-zinc-800 pl-1 uppercase tracking-tight">{cat}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-w-0">
                    {products[cat].map((p) => ( <ProductCard key={p.id} p={p} cat={cat} onUpdate={updateItemCount} /> ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {viewMode === 'packing' && (
           <div className="space-y-4 pb-20 text-left min-w-0">
             <div className="flex justify-between items-center mb-2 px-1">
               <h2 className="text-[18px] font-black text-zinc-800 uppercase tracking-tight">Packing Queue</h2>
               <span className="text-[11px] bg-zinc-800 text-white px-3 py-1 rounded-full font-bold shadow-sm">{pendingOrders.length}건 대기</span>
             </div>
             {pendingOrders.length === 0 && <div className="bg-white rounded-[24px] py-12 text-center text-zinc-400 text-[13px] font-medium border border-zinc-100 shadow-sm">현재 대기 중인 주문이 없습니다.</div>}
             {pendingOrders.map(order => (
                 <div key={order.id} className="bg-white rounded-[24px] p-5 shadow-sm mb-3 border border-zinc-100 flex flex-col min-w-0">
                    <div className="flex justify-between items-center mb-3 min-w-0">
                       <h3 className="text-[15px] font-black text-zinc-900 truncate shrink-0 pr-2">No.{order.orderNo}</h3>
                       <span className="text-[10px] text-zinc-400 font-medium shrink-0 whitespace-nowrap bg-zinc-50 px-2 py-1 rounded-md">{order.createdAt}</span>
                    </div>
                    <div className="space-y-1 mb-4 bg-zinc-50/50 p-3 rounded-[16px] min-w-0 border border-zinc-100/50">
                       {(order.items || []).map((it, idx) => {
                         const k = `${order.id}-${idx}`;
                         const isChecked = packingChecked[k];
                         return (
                           <div key={idx} onClick={() => setPackingChecked(prev => ({ ...prev, [k]: !isChecked }))} className={`flex justify-between items-center py-2 border-b border-zinc-100 last:border-0 cursor-pointer min-w-0 transition-opacity ${isChecked ? 'opacity-30 line-through grayscale' : ''}`}>
                             <span className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                               <div className={`w-4 h-4 rounded-full shrink-0 flex items-center justify-center border transition-colors ${isChecked ? 'bg-zinc-200 border-zinc-300' : 'bg-white border-zinc-300'}`}>
                                  {isChecked && <Check size={10} className="text-zinc-500" />}
                               </div>
                               <span className="truncate flex-1 min-w-0 text-[13px] font-bold text-zinc-800">{String(it.name)}</span>
                             </span>
                             <span className="bg-zinc-800 text-white px-2.5 py-1 rounded-lg text-[11px] shrink-0 whitespace-nowrap font-black shadow-sm">x {String(it.count)}</span>
                           </div>
                         );
                       })}
                    </div>
                    <button onClick={() => markAsPacked(order.id)} className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[14px] font-black text-[13px] active:scale-95 transition-all whitespace-nowrap shadow-sm">포장 완료 처리</button>
                 </div>
               ))}
           </div>
        )}

        {viewMode === 'history' && (
           <div className="space-y-4 pb-20 text-left min-w-0">
             <div className="flex justify-between items-center mb-2 px-1 min-w-0">
               <h2 className="text-[18px] font-black text-zinc-800 uppercase tracking-tight truncate shrink-0">Sales Ledger</h2>
               <div className="flex items-center gap-2 shrink-0">
                 <span className="text-[11px] text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full font-bold whitespace-nowrap shrink-0">총 {filteredOrders.length}건</span>
                 <button onClick={downloadExcel} className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[11px] font-bold hover:bg-emerald-100 transition-colors shadow-sm whitespace-nowrap active:scale-95 border border-emerald-100" title="엑셀 다운로드">
                    <Download size={12} strokeWidth={2.5}/> 다운로드
                 </button>
               </div>
             </div>
             <div className="space-y-3">
               {filteredOrders.length === 0 && <div className="bg-white rounded-[24px] py-12 text-center text-zinc-400 text-[13px] font-medium border border-zinc-100 shadow-sm">판매 내역이 없습니다.</div>}
               {filteredOrders.map(order => (
                 <div key={order.id} className={`bg-white border border-zinc-100 rounded-[20px] p-4 shadow-sm flex flex-col min-w-0 relative overflow-hidden`}>
                   <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${order.paymentType === 'loss' ? 'bg-red-500' : (order.status === 'packed' ? 'bg-zinc-200' : 'bg-emerald-400')}`} />
                   <div className="pl-2">
                     <div className="flex justify-between items-center mb-2 font-black min-w-0 gap-2">
                       <span className={`text-[11px] px-2 py-0.5 rounded-md shrink-0 whitespace-nowrap ${order.paymentType === 'loss' ? 'bg-red-50 text-red-600' : 'bg-zinc-100 text-zinc-800'}`}>No.{order.orderNo}</span>
                       <span className="text-[10px] text-zinc-400 font-medium shrink-0 whitespace-nowrap">{order.createdAt}</span>
                     </div>
                     <div className="space-y-1 mb-3 text-[12px] w-full min-w-0 font-medium text-zinc-700">
                       {(order.items || []).map((it, idx) => ( 
                         <div key={idx} className={`flex justify-between items-center min-w-0 gap-2 ${order.paymentType === 'loss' ? 'text-red-500/80' : ''}`}>
                           <span className="truncate flex-1 pr-2 min-w-0">• {it.name} <span className="text-[10px] text-zinc-400 ml-1">x{it.count}</span></span>
                           <span className="font-bold shrink-0 whitespace-nowrap">{formatPrice(it.price * it.count)}원</span>
                         </div> 
                       ))}
                     </div>
                     <div className="flex justify-between items-center border-t border-zinc-100 pt-3 min-w-0 gap-2">
                       <div className={`text-[14px] font-black truncate shrink-0 ${order.paymentType === 'loss' ? 'text-red-600' : 'text-zinc-900'}`}>
                         {order.paymentType === 'loss' ? `-${formatPrice(order.lossValue)}원` : `${formatPrice(order.total)}원`}
                       </div>
                       <div className="flex items-center gap-1.5 shrink-0">
                         <span className={`text-[9px] font-bold px-2 py-1 rounded-md uppercase whitespace-nowrap ${order.paymentType === 'loss' ? 'bg-red-50 text-red-500' : 'bg-zinc-100 text-zinc-600'}`}>
                           {getPaymentLabel(order.paymentType)}
                         </span>
                         <span className={`text-[9px] font-bold px-2 py-1 rounded-md whitespace-nowrap ${order.status === 'packed' ? 'bg-zinc-100 text-zinc-400' : 'bg-emerald-50 text-emerald-600'}`}>
                           {order.status === 'packed' ? '포장완료' : '포장중'}
                         </span>
                       </div>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
           </div>
        )}

        {isAdminMode && viewMode === 'settings' && (
           <div className="space-y-8 pb-32 text-left">
             <div className="flex justify-between items-center px-1">
               <h2 className="text-[18px] font-black text-zinc-800 uppercase tracking-tight">Settings</h2>
               <button onClick={async () => { 
                 if(!user) return;
                 try { await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'metadata'), { products, categoryOrder, kioskSettings }, { merge: true }); setShowToast("설정 저장됨"); } catch(e) { setShowToast("저장 실패"); } 
                 setTimeout(() => setShowToast(''), 2000); 
               }} className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-[11px] shadow-sm flex items-center justify-center gap-1.5 active:scale-95 font-bold"><Check size={14} /> 설정 저장</button>
             </div>

             <section className="bg-white p-5 rounded-[24px] shadow-sm border border-zinc-100 space-y-3">
                <h3 className="text-[13px] font-black flex items-center gap-1.5 text-zinc-800 border-b border-zinc-100 pb-2"><Megaphone size={14} className="text-emerald-500" /> 공지사항 에디터</h3>
                <NoticeEditor 
                  title="공지사항 (미리보기)"
                  initialHTML={initialNoticeRef.current || ""} 
                  onChange={(html) => setKioskSettings(prev => ({ ...prev, noticeHTML: html }))} 
                />
             </section>

             <section className="bg-white p-5 rounded-[24px] shadow-sm border border-zinc-100 space-y-3">
                <h3 className="text-[13px] font-black flex items-center gap-1.5 text-zinc-800 border-b border-zinc-100 pb-2"><Landmark size={14} className="text-amber-500" /> 결제 팝업 에디터</h3>
                
                <div className="w-full max-w-sm rounded-[24px] p-5 shadow-sm border border-zinc-200 text-center min-w-0 mx-auto bg-white mt-2">
                  <h3 className="text-[16px] font-black mb-5 uppercase tracking-tight text-zinc-900">계좌 이체 안내</h3>
                  <div className="bg-zinc-50 rounded-[20px] p-4 mb-4 text-left border border-zinc-100 space-y-3 min-w-0">
                    <div className="flex justify-between items-center min-w-0 border-b border-zinc-200/60 pb-2 gap-2">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase shrink-0">Bank</span>
                      <input type="text" value={kioskSettings?.bankName || ""} onChange={e => setKioskSettings(p => ({...p, bankName: e.target.value}))} className="text-[14px] font-black text-zinc-900 bg-transparent outline-none w-full text-right placeholder-zinc-300 transition-colors focus:text-emerald-600" placeholder="은행명 입력" />
                    </div>
                    <div className="flex justify-between items-center min-w-0 border-b border-zinc-200/60 pb-2 gap-2">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase shrink-0">Account</span>
                      <div className="w-full overflow-x-auto scrollbar-hide py-1 text-right">
                        <input type="text" value={kioskSettings?.accountNumber || ""} onChange={e => setKioskSettings(p => ({...p, accountNumber: e.target.value}))} className="text-[16px] font-black text-emerald-600 bg-transparent outline-none w-full placeholder-zinc-300 font-mono transition-colors focus:text-emerald-500 whitespace-nowrap text-right tracking-tighter min-w-[200px]" placeholder="계좌번호 입력" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center min-w-0 gap-2">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase shrink-0">Name</span>
                      <input type="text" value={kioskSettings?.accountHolder || ""} onChange={e => setKioskSettings(p => ({...p, accountHolder: e.target.value}))} className="text-[14px] font-black text-zinc-900 bg-transparent outline-none w-full text-right placeholder-zinc-300 transition-colors focus:text-emerald-600" placeholder="예금주 입력" />
                    </div>
                  </div>
                  <textarea value={kioskSettings?.footerNote || ""} onChange={e => setKioskSettings(p => ({...p, footerNote: e.target.value}))} className="w-full text-[11px] text-red-500 font-bold bg-red-50/50 p-3 rounded-[16px] outline-none text-center resize-none border border-red-100 placeholder-red-300 leading-relaxed" rows="2" placeholder="하단 안내 문구 입력" />
                  <button disabled className="w-full py-3.5 bg-zinc-100 text-zinc-400 rounded-[16px] font-black text-[13px] mt-4 opacity-70">확인 (미리보기)</button>
                </div>
             </section>

             <section className="bg-white p-5 rounded-[24px] shadow-sm border border-zinc-100 space-y-4" onDragOver={(e) => e.preventDefault()}>
                <h3 className="text-[13px] font-black flex items-center gap-1.5 text-zinc-800 border-b border-zinc-100 pb-2"><Edit3 size={14} className="text-emerald-500" /> 상품 및 재고 편집</h3>
                <div className="space-y-4">
                  {(categoryOrder || []).map((cat) => {
                    if (!products[cat]) return null;
                    return (
                      <div key={cat} className="bg-zinc-50 p-3.5 rounded-[20px] shadow-inner border border-zinc-200/60 font-bold min-w-0" onDrop={() => onDrop(cat, -1)}>
                         <div className="flex justify-between items-center mb-4 pb-3 font-black min-w-0 gap-2 border-b border-zinc-200">
                            <input type="text" value={String(cat)} className="text-[14px] font-black text-zinc-800 bg-white px-3 py-1.5 rounded-lg outline-none truncate flex-1 min-w-0 border border-zinc-200 shadow-sm focus:border-zinc-400 transition-colors" onChange={(e) => { 
                              const oldCat = cat; const newCat = e.target.value; if (oldCat === newCat) return;
                              const nOrder = [...categoryOrder]; nOrder[nOrder.indexOf(oldCat)] = newCat; setCategoryOrder(nOrder);
                              const p = {...products}; p[newCat] = p[oldCat]; delete p[oldCat]; setProducts(p);
                            }} />
                            <div className="shrink-0 flex items-center">
                               <button onClick={() => setActiveColorPicker(cat)} className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-[12px] border border-zinc-200 shadow-sm hover:bg-zinc-50 transition-colors active:scale-95">
                                  <span className="text-[10px] text-zinc-500 font-black tracking-tight">컬러 변경</span>
                                  <div className="w-5 h-5 rounded-full shadow-inner border border-zinc-200" style={{ backgroundColor: products[cat]?.[0]?.color || "#FFFFFF" }} />
                               </button>
                            </div>
                         </div>
                         <div className="space-y-2 font-black">
                            {(products[cat] || []).map((it, idx) => ( <EditableProductCard key={it.id} p={it} cat={cat} idx={idx} products={products} setProducts={setProducts} onDragStart={onDragStart} onDrop={onDrop} /> ))}
                            <button onClick={() => { setProducts({...products, [cat]: [...(products[cat] || []), {id: Date.now(), name: "새 상품", artist: "KUIKUI💀", price: 0, count: 0, unit: "개", color: products[cat]?.[0]?.color || "#FFFFFF", image: "", stock: 100, isTempActive: false, tempLimit: 0, tempSold: 0}]}); }} className="w-full py-3.5 bg-white border border-dashed border-zinc-300 rounded-[16px] text-zinc-500 text-[11px] font-bold shadow-sm hover:bg-zinc-50 transition-colors">+ 상품 추가</button>
                         </div>
                      </div>
                    );
                  })}
                  <button onClick={() => { const n = "신규 카테고리 " + (categoryOrder.length + 1); setProducts({...products, [n]: []}); setCategoryOrder([...categoryOrder, n]); }} className="w-full py-3.5 bg-zinc-900 text-white rounded-[16px] text-[12px] font-bold shadow-sm active:scale-95 transition-all">+ 카테고리 추가</button>
                </div>
             </section>

             <section className="pt-2 min-w-0">
                <button onClick={() => setShowResetConfirm(true)} className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-[16px] flex items-center justify-center gap-1.5 text-[11px] font-black transition-colors border border-red-100"><RotateCcw size={12} /> 전체 데이터 초기화 (롤백)</button>
             </section>
           </div>
        )}
      </main>

      {/* 맞춤 색상 픽커 팝업 */}
      {activeColorPicker && (
        <CustomColorPickerPopup 
          initialColor={products[activeColorPicker]?.[0]?.color || "#FFFFFF"}
          onChange={(newColor) => {
             const nextProducts = {...products};
             nextProducts[activeColorPicker] = nextProducts[activeColorPicker].map(p => ({...p, color: newColor}));
             setProducts(nextProducts);
          }}
          onClose={() => setActiveColorPicker(null)}
        />
      )}

      {showScrollTop && <button onClick={scrollToTop} className={`fixed right-5 z-[90] w-12 h-12 bg-white text-zinc-800 rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-zinc-100 active:scale-90 transition-all ${viewMode === 'order' ? 'bottom-24' : 'bottom-8'}`}><ArrowUp size={22} /></button>}

      {viewMode === 'order' && (
        <div className={`fixed bottom-0 left-0 right-0 z-40 transition-transform duration-500 ${isReceiptOpen ? 'translate-y-0' : 'translate-y-[calc(100%-52px)]'}`}>
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex justify-center"><button onClick={() => setIsReceiptOpen(!isReceiptOpen)} className="bg-zinc-900 text-white px-8 py-2.5 rounded-t-[20px] flex items-center justify-center gap-1.5 font-bold shadow-lg">{isReceiptOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}<span className="text-[10px] whitespace-nowrap tracking-wide">영수증 보기 ({receiptItems.items.length})</span></button></div>
            <div className="bg-white border-t border-zinc-200 rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.08)] p-6 h-auto max-h-[75vh] overflow-y-auto min-w-0 flex flex-col">
              <div className="bg-zinc-50 p-1.5 rounded-[16px] grid grid-cols-2 gap-1.5 mb-5 border border-zinc-100 shrink-0">
                 <button disabled={paymentType === 'loss'} onClick={() => setPaymentType('transfer')} className={`py-3 rounded-[12px] text-[11px] font-bold transition-all truncate shadow-sm ${paymentType === 'transfer' ? 'bg-zinc-900 text-white' : (paymentType === 'loss' ? 'bg-zinc-100 text-zinc-300 shadow-none' : 'bg-white text-zinc-500 hover:text-zinc-700')}`}>계좌이체</button>
                 <button disabled={paymentType === 'loss'} onClick={() => setPaymentType('cash')} className={`py-3 rounded-[12px] text-[11px] font-bold transition-all truncate shadow-sm ${paymentType === 'cash' ? 'bg-zinc-900 text-white' : (paymentType === 'loss' ? 'bg-zinc-100 text-zinc-300 shadow-none' : 'bg-white text-zinc-500 hover:text-zinc-700')}`}>현금결제</button>
              </div>
              <div className="space-y-2 mb-5 border-b border-dashed border-zinc-200 pb-5 min-w-0 flex-1 overflow-y-auto max-h-[30vh]">
                {receiptItems.items.length === 0 && <div className="text-[11px] text-center text-zinc-400 py-4 font-medium">담긴 상품이 없습니다.</div>}
                {receiptItems.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-[12px] min-w-0 bg-white p-1">
                    <span className="text-zinc-800 font-medium truncate flex-1 min-w-0 pr-2">{item.name}</span>
                    <div className="flex items-center gap-2 shrink-0">
                       <span className="text-zinc-400 font-mono text-[10px] font-medium">x{item.count}</span>
                       <span className="text-zinc-900 font-mono w-[60px] text-right truncate font-bold">{formatPrice(item.itemTotal)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mb-5 min-w-0 shrink-0 gap-3">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold shrink-0">Total Amount</span>
                <span className={`text-3xl font-black truncate shrink-0 tracking-tight ${paymentType === 'loss' ? 'text-red-500' : 'text-zinc-900'}`}>{formatPrice(receiptItems.total)}원</span>
              </div>
              <button disabled={receiptItems.items.length === 0 || isSubmitting} onClick={handleOrderSubmit} className={`w-full py-4 rounded-[18px] font-black text-[15px] flex items-center justify-center gap-1.5 shrink-0 transition-all shadow-md ${receiptItems.items.length > 0 && !isSubmitting ? (paymentType === 'loss' ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white') : 'bg-zinc-100 text-zinc-400 shadow-none cursor-not-allowed'} whitespace-nowrap`}><Check size={18} className="shrink-0" />{paymentType === 'loss' ? '파손/분실 기록 완료' : '주문 확정'}</button>
            </div>
          </div>
        </div>
      )}

      {showResetConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl text-center">
              <AlertTriangle size={40} className="text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-black mb-2 text-zinc-900">전체 데이터 리셋</h3>
              <p className="text-[13px] text-zinc-500 mb-8 font-bold leading-relaxed">모든 상품 및 설정이 초기화됩니다.<br/>정말 진행하시겠습니까?</p>
              <div className="flex gap-2">
                <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-4 bg-zinc-100 text-zinc-600 rounded-[16px] font-bold text-[14px] transition-colors hover:bg-zinc-200">취소</button>
                <button onClick={async () => {
                  try {
                    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'metadata'), { products: INITIAL_PRODUCTS, categoryOrder: ["츠오미", "꾸이꾸이", "두근", "기타"], kioskSettings: DEFAULT_KIOSK_SETTINGS }, { merge: true });
                    setShowToast("초기화 완료");
                  } catch (e) { setShowToast("초기화 실패"); }
                  setShowResetConfirm(false);
                }} className="flex-1 py-4 bg-red-500 hover:bg-red-600 text-white rounded-[16px] font-black text-[14px] transition-colors shadow-sm">초기화</button>
              </div>
           </div>
        </div>
      )}

      {showAuthModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
           <div className="bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl text-center min-w-0"><Lock size={28} className="text-zinc-800 mx-auto mb-6" /><input type="password" value={adminPwInput} onChange={(e) => setAdminPwInput(e.target.value)} placeholder="PIN" className="w-full bg-zinc-50 border border-zinc-200 rounded-[16px] p-4 text-center text-xl mb-6 outline-none tracking-widest font-black text-zinc-800 focus:border-zinc-400 transition-colors" autoFocus /><div className="flex flex-col gap-2"><button onClick={handleAdminAuth} className="py-3.5 bg-zinc-900 text-white rounded-[14px] font-bold text-[13px] active:scale-95 transition-transform">인증</button><button onClick={() => {setShowAuthModal(false); setAdminPwInput('');}} className="py-3.5 bg-white border border-zinc-200 text-zinc-500 rounded-[14px] font-bold text-[13px] active:scale-95 transition-transform">취소</button></div></div>
        </div>
      )}

      {showOrderDonePopup && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl text-center min-w-0">
              <h3 className="text-xl font-black mb-6 uppercase tracking-tight text-zinc-900">계좌 이체 안내</h3>
              <div className="bg-zinc-50 rounded-[20px] p-5 mb-5 text-left border border-zinc-100 space-y-4 min-w-0 shadow-inner">
                 <div className="flex justify-between items-center min-w-0 gap-2 border-b border-zinc-200/80 pb-3">
                   <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider shrink-0">Bank</span>
                   <span className="text-[15px] font-black text-zinc-900 truncate text-right">{kioskSettings?.bankName || ""}</span>
                 </div>
                 <div className="flex justify-between items-center min-w-0 gap-2 border-b border-zinc-200/80 pb-3">
                   <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider shrink-0">Account</span>
                   <div className="w-full overflow-x-auto scrollbar-hide py-1 text-right">
                     <span className="block text-[20px] font-black text-emerald-600 leading-none font-mono whitespace-nowrap tracking-tighter">{kioskSettings?.accountNumber || ""}</span>
                   </div>
                 </div>
                 <div className="flex justify-between items-center min-w-0 gap-2">
                   <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider shrink-0">Name</span>
                   <span className="text-[15px] font-black text-zinc-900 truncate text-right">{kioskSettings?.accountHolder || ""}</span>
                 </div>
              </div>
              {kioskSettings?.footerNote && ( <div className="bg-red-50 text-red-500 p-4 rounded-[16px] mb-6 border border-red-100"><p className="text-[12px] font-bold whitespace-pre-wrap leading-relaxed text-center break-keep">{kioskSettings.footerNote}</p></div> )}
              <button onClick={() => setShowOrderDonePopup(false)} className="w-full py-4 bg-zinc-900 text-white rounded-[16px] font-black text-[15px] shadow-md active:scale-95 transition-all">확인 완료</button>
           </div>
        </div>
      )}

      {showToast && typeof showToast === 'string' && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[250] bg-zinc-800 text-white px-5 py-2.5 rounded-full shadow-lg animate-in fade-in slide-in-from-top-4 text-[11px] whitespace-nowrap font-medium max-w-[90vw] min-w-0"><span className="truncate">{showToast}</span></div>
      )}
    </div>
  );
};

export default App;


