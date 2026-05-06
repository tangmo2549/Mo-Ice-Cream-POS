import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Shield, Globe, ChevronLeft, ChevronRight, ChevronRight as ChevronR } from 'lucide-react';

// ─── FLAVORS ──────────────────────────────────────────────────────────────────
const FLAVORS = [
  { id: 0, name: 'STRAWBERRY', subname: 'สตรอว์เบอร์รี', accent: '#ec4899', accentRgb: '236,72,153', top: '#ffb3c6', mid: '#f48fb1', bot: '#c2185b', cone1: '#c8860a', cone2: '#7a4f00', drip: '#ff4081' },
  { id: 1, name: 'CHOCOLATE',  subname: 'ช็อกโกแลต',    accent: '#f97316', accentRgb: '249,115,22',  top: '#ffe0b2', mid: '#d97706', bot: '#78350f', cone1: '#c8860a', cone2: '#7a4f00', drip: '#f59e0b' },
  { id: 2, name: 'VANILLA',    subname: 'วานิลลา',       accent: '#00F2FF', accentRgb: '0,242,255',   top: '#fffde7', mid: '#fff9c4', bot: '#f9a825', cone1: '#c8860a', cone2: '#7a4f00', drip: '#fdd835' },
  { id: 3, name: 'MINT',       subname: 'มินต์',          accent: '#4ade80', accentRgb: '74,222,128',  top: '#b2dfdb', mid: '#4db6ac', bot: '#00695c', cone1: '#c8860a', cone2: '#7a4f00', drip: '#26a69a' },
];

const FEATURES = [
  { icon: Zap,    label: 'ซิงค์ข้อมูลเรียลไทม์' },
  { icon: Shield, label: 'เข้ารหัสปลอดภัยสูง 256-bit' },
  { icon: Globe,  label: 'รองรับหลายสาขา' },
];

const TYPEWRITER = ['จัดการสต็อกอัจฉริยะ', 'วิเคราะห์กำไรแม่นยำ', 'ขยายสาขาได้ทันที'];

// ─── 3D TILT CARD ─────────────────────────────────────────────────────────────
function TiltCard({ children, style, className, intensity = 12 }) {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    setTilt({ x: dy * intensity, y: -dx * intensity });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setTilt({ x: 0, y: 0 }); setHovered(false); }}
      style={{
        transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${hovered ? 1.02 : 1})`,
        transition: 'transform 0.15s ease-out',
        transformStyle: 'preserve-3d',
        ...style,
      }}
      className={className}
    >
      {children}
    </div>
  );
}

// ─── PARTICLE CANVAS ─────────────────────────────────────────────────────────
function Particles({ accentRgb }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); let id;
    let lastTime = 0;
    const INTERVAL = 1000 / 24;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize(); window.addEventListener('resize', resize);
    const pts = Array.from({ length: 22 }, () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      r: Math.random() * 1.6 + 0.4, dx: (Math.random() - 0.5) * 0.3, dy: (Math.random() - 0.5) * 0.3, a: Math.random() * 0.4 + 0.1,
    }));
    const draw = (timestamp) => {
      id = requestAnimationFrame(draw);
      if (timestamp - lastTime < INTERVAL) return;
      lastTime = timestamp;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach(p => {
        p.x = (p.x + p.dx + canvas.width) % canvas.width;
        p.y = (p.y + p.dy + canvas.height) % canvas.height;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${accentRgb},${p.a})`; ctx.fill();
      });
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
        if (d < 90) { ctx.beginPath(); ctx.strokeStyle = `rgba(${accentRgb},${0.07 * (1 - d / 90)})`; ctx.lineWidth = 0.6; ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke(); }
      }
    };
    id = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize', resize); };
  }, [accentRgb]);
  return <canvas ref={ref} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />;
}

// ─── SVG ICE CREAM ────────────────────────────────────────────────────────────
function IceCream({ f, size }) {
  const id = `ic${f.id}`;
  const w = size, h = size * 1.4;
  return (
    <svg width={w} height={h} viewBox="0 0 120 168" fill="none">
      <defs>
        <radialGradient id={`s1-${id}`} cx="38%" cy="32%" r="68%">
          <stop offset="0%" stopColor={f.top} /><stop offset="100%" stopColor={f.bot} />
        </radialGradient>
        <radialGradient id={`s2-${id}`} cx="38%" cy="32%" r="68%">
          <stop offset="0%" stopColor={f.mid} /><stop offset="100%" stopColor={f.bot} />
        </radialGradient>
        <radialGradient id={`s3-${id}`} cx="38%" cy="32%" r="68%">
          <stop offset="0%" stopColor={f.top} /><stop offset="100%" stopColor={f.mid} />
        </radialGradient>
        <linearGradient id={`cone-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={f.cone1} /><stop offset="100%" stopColor={f.cone2} />
        </linearGradient>
        <filter id={`g-${id}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Cone */}
      <polygon points="60,156 24,86 96,86" fill={`url(#cone-${id})`}/>
      {[0.2,0.4,0.6,0.8].map((t,i)=>{
        const y=86+(156-86)*t; const hw=(96-24)*(1-t)/2;
        return <line key={i} x1={60-hw} y1={y} x2={60+hw} y2={y} stroke="rgba(0,0,0,0.18)" strokeWidth="0.6"/>;
      })}
      {[-18,-9,0,9,18].map((ox,i)=>(
        <line key={i} x1={60+ox} y1={86} x2={60+ox*0.25} y2={156} stroke="rgba(0,0,0,0.13)" strokeWidth="0.6"/>
      ))}
      {/* Scoop 1 */}
      <ellipse cx="60" cy="80" rx="34" ry="30" fill={`url(#s1-${id})`} filter={`url(#g-${id})`}/>
      <ellipse cx="53" cy="70" rx="16" ry="11" fill="rgba(255,255,255,0.28)"/>
      {/* Scoop 2 */}
      <ellipse cx="60" cy="52" rx="27" ry="25" fill={`url(#s2-${id})`} filter={`url(#g-${id})`}/>
      <ellipse cx="54" cy="44" rx="12" ry="9" fill="rgba(255,255,255,0.22)"/>
      {/* Scoop 3 */}
      <ellipse cx="60" cy="28" rx="20" ry="19" fill={`url(#s3-${id})`} filter={`url(#g-${id})`}/>
      <ellipse cx="55" cy="22" rx="9" ry="7" fill="rgba(255,255,255,0.3)"/>
      {/* Drips */}
      <path d={`M44 77 Q39 89 42 97`} stroke={f.drip} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.8"/>
      <path d={`M75 73 Q80 84 78 92`} stroke={f.drip} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.65"/>
      {/* Cherry */}
      <circle cx="60" cy="10" r="7" fill="#ff3d5e" filter={`url(#glow-${id})`}/>
      <circle cx="63" cy="8" r="2.8" fill="rgba(255,255,255,0.5)"/>
      <path d="M60 3 Q66 -1 72 2" stroke="#4ade80" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

// ─── TYPEWRITER ───────────────────────────────────────────────────────────────
function TypewriterText({ accent }) {
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI(x => (x + 1) % TYPEWRITER.length), 2800); return () => clearInterval(t); }, []);
  return (
    <div style={{ height: 28, overflow: 'hidden' }}>
      <AnimatePresence mode="wait">
        <motion.span key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.3 }} className="block text-sm font-semibold" style={{ color: accent }}>
          → {TYPEWRITER[i]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

// ─── GLOW DIVIDER ────────────────────────────────────────────────────────────
function Divider({ accentRgb }) {
  return (
    <div style={{ height: 1 }}>
      <div style={{ height: '100%', background: `linear-gradient(90deg, transparent, rgba(${accentRgb},0.5) 30%, rgba(${accentRgb},0.5) 70%, transparent)`, boxShadow: `0 0 8px rgba(${accentRgb},0.35)` }} />
    </div>
  );
}

// ─── STATIC BG ORBS (CSS only, no JS animation) ───────────────────────────────
function FloatingOrbs({ accentRgb }) {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      <div style={{
        position: 'absolute', width: 500, height: 500, left: '10%', top: '20%',
        transform: 'translate(-50%,-50%)', borderRadius: '50%',
        background: `radial-gradient(circle, rgba(${accentRgb},0.07) 0%, transparent 70%)`,
        filter: 'blur(40px)', transition: 'background 1.2s ease',
      }} />
      <div style={{
        position: 'absolute', width: 350, height: 350, left: '75%', top: '65%',
        transform: 'translate(-50%,-50%)', borderRadius: '50%',
        background: `radial-gradient(circle, rgba(${accentRgb},0.05) 0%, transparent 70%)`,
        filter: 'blur(40px)', transition: 'background 1.2s ease',
      }} />
    </div>
  );
}

// ─── CAROUSEL ────────────────────────────────────────────────────────────────
function Carousel({ idx, setIdx, accentRgb, accent }) {
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % FLAVORS.length), 5000);
    return () => clearInterval(t);
  }, [setIdx]);

  const getPos = (i) => {
    const d = ((i - idx) + FLAVORS.length) % FLAVORS.length;
    const signed = d > FLAVORS.length / 2 ? d - FLAVORS.length : d;
    if (signed === 0)  return { x: 0,    scale: 1,    opacity: 1,    z: 10, blur: 0, rotateY: 0 };
    if (Math.abs(signed) === 1) return { x: signed * 170, scale: 0.55, opacity: 0.35, z: 5, blur: 1.5, rotateY: signed * -25 };
    return { x: signed * 240, scale: 0.35, opacity: 0.1, z: 0, blur: 3, rotateY: signed * -40 };
  };

  const SIZE = 190;
  const f = FLAVORS[idx];

  return (
    <div className="flex flex-col items-center" style={{ width: 420, flexShrink: 0 }}>
      {/* 3D Platform */}
      <div style={{ position: 'relative', perspective: '900px', perspectiveOrigin: '50% 60%' }}>
        <div className="pointer-events-none" style={{
          width: 340, height: 360, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center',
        }}>
          {/* Static aura — CSS transition only, no repeat animation */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: `radial-gradient(ellipse 140px 200px at 50% 44%, rgba(${accentRgb},0.28) 0%, transparent 65%)`,
            transition: 'background 0.9s',
          }} />

          {FLAVORS.map((fl, i) => {
            const pos = getPos(i);
            return (
              <motion.div key={fl.id} className="absolute flex flex-col items-center cursor-pointer select-none"
                style={{ zIndex: pos.z }}
                animate={{ x: pos.x, scale: pos.scale, opacity: pos.opacity, filter: `blur(${pos.blur}px)`, rotateY: pos.rotateY }}
                transition={{ type: 'spring', stiffness: 220, damping: 28 }}
                onClick={() => setIdx(i)}>
                {/* float only on active item */}
                <motion.div
                  animate={i === idx ? { y: [0, -14, 0] } : {}}
                  transition={i === idx ? { duration: 4.5, repeat: Infinity, ease: 'easeInOut' } : {}}>
                  <IceCream f={fl} size={i === idx ? SIZE : 90} />
                </motion.div>
              </motion.div>
            );
          })}

        </div>
      </div>

      {/* Name */}
      <AnimatePresence mode="wait">
        <motion.div key={idx} initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }} className="text-center mt-1" style={{ lineHeight: 1.5 }}>
          <p className="text-base font-black tracking-widest" style={{ color: f.accent }}>{f.name}</p>
          <p className="text-sm text-white/40">{f.subname}</p>
        </motion.div>
      </AnimatePresence>

      {/* Arrows + Dots */}
      <div className="flex items-center gap-3 mt-4">
        <motion.button onClick={() => setIdx((idx - 1 + FLAVORS.length) % FLAVORS.length)}
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: `rgba(${accentRgb},0.1)`, border: `1px solid rgba(${accentRgb},0.3)` }}
          whileHover={{ scale: 1.15, background: `rgba(${accentRgb},0.2)` }}
          whileTap={{ scale: 0.9 }}>
          <ChevronLeft className="w-4 h-4 text-white" />
        </motion.button>
        {FLAVORS.map((_, i) => (
          <motion.button key={i} onClick={() => setIdx(i)}
            className="rounded-full"
            animate={{ width: i === idx ? 20 : 6, height: 6, background: i === idx ? f.accent : 'rgba(255,255,255,0.18)' }}
            transition={{ type: 'spring', stiffness: 300 }}
          />
        ))}
        <motion.button onClick={() => setIdx((idx + 1) % FLAVORS.length)}
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: `rgba(${accentRgb},0.1)`, border: `1px solid rgba(${accentRgb},0.3)` }}
          whileHover={{ scale: 1.15, background: `rgba(${accentRgb},0.2)` }}
          whileTap={{ scale: 0.9 }}>
          <ChevronRight className="w-4 h-4 text-white" />
        </motion.button>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate();
  const [idx, setIdx] = useState(2);
  const [exiting, setExiting] = useState(false);
  const [exitFlash, setExitFlash] = useState(false);
  const f = FLAVORS[idx];

  const handleLaunch = () => {
    setExitFlash(true);
    setTimeout(() => { setExiting(true); }, 320);
    setTimeout(() => navigate('/login'), 1100);
  };

  return (
    <motion.div className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ background: '#05070A', fontFamily: "'Noto Sans Thai', sans-serif" }}
      animate={exiting ? { scale: 1.08, opacity: 0, filter: 'blur(18px)' } : {}}
      transition={exiting ? { duration: 0.75, ease: 'easeIn' } : {}}>

      <Particles accentRgb={f.accentRgb} />
      <FloatingOrbs accentRgb={f.accentRgb} />

      {/* Perspective grid floor */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(${f.accentRgb},0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(${f.accentRgb},0.03) 1px, transparent 1px)`,
        backgroundSize: '56px 56px',
        zIndex: 0,
        transition: 'background-image 1.2s',
        maskImage: 'radial-gradient(ellipse 80% 60% at 50% 100%, black 0%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 100%, black 0%, transparent 100%)',
      }} />

      {/* Cyan flash on launch */}
      <AnimatePresence>
        {exitFlash && (
          <motion.div className="fixed inset-0 pointer-events-none" style={{ zIndex: 100, background: `rgba(${f.accentRgb},0.22)` }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} />
        )}
      </AnimatePresence>

      {/* ── NAV ─────────────────────────────────────────── */}
      <Divider accentRgb={f.accentRgb} />
      <motion.nav
        className="relative z-10 flex items-center justify-between px-8 py-3.5"
        style={{ borderBottom: `1px solid rgba(${f.accentRgb},0.1)`, backdropFilter: 'blur(12px)', background: 'rgba(5,7,10,0.6)' }}
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* Logo */}
        <div className="flex items-center gap-3">
          <motion.div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: `rgba(${f.accentRgb},0.15)`, boxShadow: `0 0 18px rgba(${f.accentRgb},0.35)`, transition: 'all 0.6s', border: `1px solid rgba(${f.accentRgb},0.35)` }}
            whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
            transition={{ duration: 0.4 }}>
            <span className="text-xl">🍦</span>
          </motion.div>
          <div>
            <p className="font-black text-sm tracking-[0.2em]" style={{ color: '#e8eaf6' }}>MO ICE CREAM</p>
            <p className="text-[10px] tracking-[0.25em]" style={{ color: f.accent, transition: 'color 0.6s' }}>ENTERPRISE POS</p>
          </div>
        </div>
        {/* Right */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.18)' }}>
            <span className="w-2 h-2 rounded-full animate-pulse bg-green-400" />
            <span className="text-xs text-white/60 font-medium">System Online</span>
          </div>
          <motion.button onClick={handleLaunch}
            className="relative overflow-hidden flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold"
            style={{ background: 'transparent', border: `1.5px solid rgba(${f.accentRgb},0.65)`, color: f.accent, transition: 'color 0.5s, border-color 0.5s' }}
            whileHover={{ boxShadow: `0 0 20px rgba(${f.accentRgb},0.55), 0 0 40px rgba(${f.accentRgb},0.2), inset 0 0 18px rgba(${f.accentRgb},0.06)` }}
            whileTap={{ scale: 0.95 }}>
            <motion.div className="absolute inset-0 pointer-events-none"
              style={{ background: `linear-gradient(90deg, transparent 0%, rgba(${f.accentRgb},0.22) 50%, transparent 100%)`, backgroundSize: '200% 100%' }}
              animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }} />
            <span className="relative z-10">Sign In</span>
            <ChevronR className="relative z-10 w-3.5 h-3.5" />
          </motion.button>
        </div>
      </motion.nav>

      {/* ── HERO ────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-1 items-center px-8 lg:px-14 gap-0">

        {/* LEFT: content */}
        <motion.div className="flex flex-col gap-4 shrink-0" style={{ width: 280 }}
          initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>

          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full self-start"
            style={{ background: `rgba(${f.accentRgb},0.1)`, border: `1px solid rgba(${f.accentRgb},0.25)`, transition: 'all 0.6s' }}
            whileHover={{ scale: 1.04 }}>
            <Zap className="w-3 h-3" style={{ color: f.accent }} />
            <span className="text-xs font-semibold tracking-wide" style={{ color: f.accent }}>Frozen Retail · Enterprise</span>
          </motion.div>

          <div>
            <motion.h1
              className="font-black leading-none text-white tracking-tight"
              style={{ fontSize: '2rem' }}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}>
              MO ENTERPRISE
            </motion.h1>
            <motion.span
              className="font-black tracking-tight"
              style={{ color: f.accent, transition: 'color 0.6s', fontSize: '2rem', display: 'block' }}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}>
              POS
            </motion.span>
          </div>

          <motion.p
            className="text-white/80 leading-relaxed font-medium"
            style={{ maxWidth: 280, fontSize: '1.05rem' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.6 }}>
            ระบบบริหารจัดการร้านไอศกรีมยุคใหม่
          </motion.p>

          <motion.p
            className="text-white/50 leading-relaxed"
            style={{ maxWidth: 260, fontSize: '0.85rem' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.6 }}>
            จัดการสต็อกอัจฉริยะ วิเคราะห์กำไรแม่นยำ<br />พร้อมขยายสาขาได้ทันที
          </motion.p>

          <TypewriterText accent={f.accent} />

          {/* Launch button */}
          <motion.div className="relative inline-flex self-start mt-1"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }}>
            {[1, 2].map(i => (
              <motion.div key={i} className="absolute inset-0 rounded-xl pointer-events-none"
                style={{ border: `1.5px solid rgba(${f.accentRgb},0.5)` }}
                animate={{ scale: [1, 1.5 + i * 0.2], opacity: [0.55, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.65, ease: 'easeOut' }} />
            ))}
            <motion.button onClick={handleLaunch}
              className="relative flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black text-white overflow-hidden"
              style={{
                background: `linear-gradient(135deg, rgba(${f.accentRgb},0.85), rgba(${f.accentRgb},0.42))`,
                boxShadow: `0 0 28px rgba(${f.accentRgb},0.42)`,
                border: `1px solid rgba(${f.accentRgb},0.5)`,
                transition: 'all 0.6s',
              }}
              whileHover={{ scale: 1.05, boxShadow: `0 0 40px rgba(${f.accentRgb},0.65)` }}
              whileTap={{ scale: 0.96 }}>
              <motion.div className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)', backgroundSize: '200% 100%' }}
                animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} />
              <span className="relative z-10">🚀 เริ่มใช้งานระบบ</span>
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div className="flex items-center gap-6 mt-1"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.5 }}>
            {[['3', 'สาขา'], ['PIN', 'ปลอดภัย'], ['Live', 'ซิงค์']].map(([v, l]) => (
              <TiltCard key={l} intensity={6}>
                <p className="text-sm font-extrabold" style={{ color: f.accent }}>{v}</p>
                <p className="text-xs text-white/40">{l}</p>
              </TiltCard>
            ))}
          </motion.div>
        </motion.div>

        {/* CENTER: 3D Carousel */}
        <motion.div className="flex-1 flex justify-center items-center"
          initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.8, type: 'spring', stiffness: 120 }}>
          <Carousel idx={idx} setIdx={setIdx} accentRgb={f.accentRgb} accent={f.accent} />
        </motion.div>

        {/* RIGHT: Feature tags */}
        <motion.div className="flex flex-col gap-3.5 shrink-0" style={{ width: 260 }}
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.15 }}>
          {FEATURES.map(({ icon: Icon, label }, fi) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + fi * 0.1, duration: 0.5 }}>
              <TiltCard
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: `1.5px solid rgba(${f.accentRgb},0.22)`,
                  backdropFilter: 'blur(14px)',
                  boxShadow: `0 0 22px rgba(${f.accentRgb},0.06), 0 4px 24px rgba(0,0,0,0.3)`,
                  transition: 'all 0.6s',
                  borderRadius: '0.75rem',
                  padding: '0.875rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.875rem',
                }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `rgba(${f.accentRgb},0.14)`, border: `1px solid rgba(${f.accentRgb},0.32)`, transition: 'all 0.6s', boxShadow: `0 0 14px rgba(${f.accentRgb},0.2)` }}>
                  <Icon className="w-4.5 h-4.5" style={{ color: f.accent, width: 18, height: 18 }} />
                </div>
                <p className="text-sm font-semibold text-white/90">{label}</p>
              </TiltCard>
            </motion.div>
          ))}

          {/* Mini dashboard preview card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.6 }}>
            <TiltCard
              style={{
                background: 'rgba(5,10,26,0.92)',
                border: `1px solid rgba(${f.accentRgb},0.2)`,
                boxShadow: `0 0 24px rgba(${f.accentRgb},0.08), 0 8px 32px rgba(0,0,0,0.4)`,
                transition: 'all 0.6s',
                borderRadius: '0.75rem',
                overflow: 'hidden',
              }}>
              <div className="px-3 py-2.5 flex items-center gap-1.5" style={{ borderBottom: `1px solid rgba(${f.accentRgb},0.12)`, background: `rgba(${f.accentRgb},0.04)` }}>
                {['#f87171','#fbbf24','#4ade80'].map(c => <div key={c} className="w-2 h-2 rounded-full" style={{ background: c }} />)}
                <div className="flex-1" />
                <span className="text-[10px] font-mono" style={{ color: `rgba(${f.accentRgb},0.5)` }}>LIVE</span>
              </div>
              <div className="p-3">
                <div className="grid grid-cols-3 gap-2 mb-2.5">
                  {[['Demo','Revenue','#4ade80'],['—','Orders','#00F2FF'],['36.4%','Margin','#facc15']].map(([v,l,c])=>(
                    <div key={l} className="rounded-lg p-2" style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${c}22` }}>
                      <p className="text-[9px] text-white/35 mb-0.5">{l}</p>
                      <p className="text-xs font-bold" style={{ color: c }}>{v}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-end gap-1 h-10">
                  {[38,60,46,75,68,88,62].map((h,i)=>(
                    <motion.div key={i} className="flex-1 rounded-sm"
                      style={{ background: i===5? f.accent: `rgba(${f.accentRgb},0.25)`, transition: 'background 0.6s' }}
                      initial={{ height: 0 }} animate={{ height: `${h}%` }}
                      transition={{ delay: 0.9+i*0.05, duration: 0.5 }}/>
                  ))}
                </div>
              </div>
            </TiltCard>
          </motion.div>
        </motion.div>
      </div>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <Divider accentRgb={f.accentRgb} />
      <motion.footer
        className="relative z-10 flex items-center justify-between px-8 py-3"
        style={{ backdropFilter: 'blur(12px)', background: 'rgba(5,7,10,0.5)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.5 }}>
        <p className="text-xs font-mono text-white/30">© ระบบบริหารจัดการ MO ICE CREAM · สงวนลิขสิทธิ์</p>
        <div className="flex items-center gap-5">
          {['นโยบายความเป็นส่วนตัว', 'มาตรฐานความปลอดภัย', 'คู่มือการใช้งาน'].map(l => (
            <motion.button key={l} className="text-xs text-white/35 font-medium" whileHover={{ color: 'rgba(255,255,255,0.7)' }} style={{ transition: 'color 0.2s' }}>{l}</motion.button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono text-white/30">ความเสถียร:</span>
            <span className="text-xs font-mono font-bold" style={{ color: `rgba(${f.accentRgb},0.6)` }}>&lt;10ms</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: f.accent }} />
            <span className="text-xs font-medium" style={{ color: f.accent }}>System Online</span>
          </div>
        </div>
      </motion.footer>
    </motion.div>
  );
}