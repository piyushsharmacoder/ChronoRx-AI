import { useState, useEffect, useRef, useMemo } from "react";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from "recharts";

// ─── DESIGN TOKENS (unchanged — this is the existing visual identity) ────────
const C = {
  pearl: "#FBFAF8",
  paper: "#F6F4EF",
  navy: "#0A1424",
  ink: "#060B14",
  midnight: "#162338",
  indigo: "#5A5EEA",
  indigoDeep: "#4338CA",
  violet: "#8B5CF6",
  lavender: "#ECE9FF",
  cream: "#F3F0FF",
  muted: "#92A0B5",
  steel: "#5C6B82",
  emerald: "#0EA371",
  rose: "#E11D48",
  gold: "#D97706",
  line: "rgba(10,20,38,.08)",
  lineDark: "rgba(255,255,255,.09)",
};

const fontLink = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');`;
const display = "'Fraunces', serif";
const body = "'Inter', sans-serif";
const mono = "'JetBrains Mono', monospace";

const globalStyles = `
  ${fontLink}
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: ${C.pearl}; color: ${C.navy}; font-family: ${body}; overflow-x: hidden; -webkit-font-smoothing: antialiased; }
  .serif { font-family: ${display}; }
  .mono { font-family: ${mono}; }
  a { -webkit-tap-highlight-color: transparent; }
  button { font-family: ${body}; }
  button:focus-visible, a:focus-visible, input:focus-visible, select:focus-visible { outline: 2px solid ${C.indigo}; outline-offset: 2px; }

  @media (prefers-reduced-motion: reduce) {
    * { animation-duration: .001ms !important; animation-iteration-count: 1 !important; transition-duration: .001ms !important; }
  }

  @keyframes fadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes float { 0%,100% { transform:translateY(0px); } 50% { transform:translateY(-14px); } }
  @keyframes floatSlow { 0%,100% { transform:translateY(0px) rotate(-4deg); } 50% { transform:translateY(-10px) rotate(-2deg); } }
  @keyframes spin-slow { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
  @keyframes pulseDot { 0%,100% { transform:scale(1); opacity:.7; } 50% { transform:scale(1.5); opacity:0; } }
  @keyframes pulseRing { 0%,100% { transform:scale(1); opacity:.5; } 50% { transform:scale(1.18); opacity:0; } }
  @keyframes dash { to { stroke-dashoffset: 0; } }
  @keyframes travel { from { offset-distance: 0%; } to { offset-distance: 100%; } }
  @keyframes glowPulse { 0%,100% { filter: drop-shadow(0 0 10px rgba(90,94,234,.35)); } 50% { filter: drop-shadow(0 0 22px rgba(139,92,246,.55)); } }

  .float-anim { animation: floatSlow 6s ease-in-out infinite; }
  .float-anim-2 { animation: float 5s ease-in-out infinite .4s; }

  section { position: relative; }

  .glass {
    background: rgba(255,255,255,.62);
    backdrop-filter: blur(22px);
    -webkit-backdrop-filter: blur(22px);
    border: 1px solid rgba(255,255,255,.75);
  }
  .glass-dark {
    background: rgba(255,255,255,.045);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    border: 1px solid rgba(255,255,255,.09);
  }

  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: ${C.pearl}; }
  ::-webkit-scrollbar-thumb { background: ${C.lavender}; border-radius: 4px; }

  .desktop-nav { display: flex; }
  .mobile-toggle { display: none; }

  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; }
  .grid-auto-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
  .grid-auto-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
  .grid-auto-5 { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
  .hero-flex { display: flex; align-items: center; }
  .hero-visual { display: flex; align-items: center; justify-content: center; }
  .scroll-x { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; }
  .scroll-x > * { scroll-snap-align: start; }
  .brain-cols { display: grid; grid-template-columns: 1fr 1.15fr 1fr; gap: 28px; align-items: center; }
  .pipeline-row { display: flex; align-items: stretch; gap: 0; }
  .card-hover { transition: transform .3s ease, box-shadow .3s ease, border-color .3s ease; cursor: pointer; }
  .card-hover:hover { transform: translateY(-4px); box-shadow: 0 24px 56px rgba(10,22,40,.12); border-color: rgba(90,94,234,.3) !important; }

  @media (max-width: 980px) {
    .brain-cols { grid-template-columns: 1fr; }
    .pipeline-row { flex-direction: column; }
  }

  @media (max-width: 900px) {
    .desktop-nav { display: none; }
    .mobile-toggle { display: flex; }
    .hero-flex { flex-direction: column; align-items: stretch; }
    .hero-copy { max-width: 100% !important; flex: none !important; text-align: left; }
    .hero-visual { margin-top: 56px; transform: scale(.92); }
  }

  @media (max-width: 760px) {
    .grid-2 { grid-template-columns: 1fr; }
    section { padding-left: 6vw !important; padding-right: 6vw !important; }
  }
`;

// ─── ICONS ─────────────────────────────────────────────────────────────────
function Icon({ name, size = 22, color = "currentColor", sw = 1.6 }) {
  const common = { fill: "none", stroke: color, strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round" };
  const paths = {
    pulse: <path d="M2 12h4l2.5 -7 4 14 2.5 -10 1.5 3h5.5" {...common} />,
    dna: <>
      <path d="M8 2c0 5 8 5 8 10s-8 5-8 10" {...common} />
      <path d="M16 2c0 5 -8 5 -8 10s8 5 8 10" {...common} />
      <line x1="9.3" y1="6" x2="14.7" y2="6" {...common} />
      <line x1="9.3" y1="18" x2="14.7" y2="18" {...common} />
    </>,
    pill: <>
      <rect x="3.5" y="9" width="17" height="6" rx="3" transform="rotate(-32 12 12)" {...common} />
      <line x1="12" y1="8.3" x2="12" y2="15.7" transform="rotate(-32 12 12)" {...common} />
    </>,
    moon: <path d="M21 14.2A8.5 8.5 0 1110 3a7 7 0 0011 11.2z" {...common} />,
    clock: <>
      <circle cx="12" cy="12" r="9" {...common} />
      <line x1="12" y1="12" x2="12" y2="7" {...common} />
      <line x1="12" y1="12" x2="15.5" y2="14" {...common} />
    </>,
    shield: <>
      <path d="M12 3l7 3v6c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V6z" {...common} />
      <path d="M9 12l2 2 4-4.5" {...common} />
    </>,
    target: <>
      <circle cx="12" cy="12" r="8.5" {...common} />
      <circle cx="12" cy="12" r="5" {...common} />
      <circle cx="12" cy="12" r="1.4" fill={color} stroke="none" />
    </>,
    sync: <>
      <path d="M4 12a8 8 0 0113.6-5.7L20 8" {...common} />
      <path d="M20 12a8 8 0 01-13.6 5.7L4 16" {...common} />
      <path d="M17 4v4h-4" {...common} />
      <path d="M7 20v-4h4" {...common} />
    </>,
    calendar: <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" {...common} />
      <line x1="3.5" y1="9.5" x2="20.5" y2="9.5" {...common} />
      <line x1="8" y1="3" x2="8" y2="7" {...common} />
      <line x1="16" y1="3" x2="16" y2="7" {...common} />
    </>,
    chart: <>
      <polyline points="3.5,17 9,10.5 13,13.5 20.5,5.5" {...common} />
      <line x1="3.5" y1="20.5" x2="20.5" y2="20.5" {...common} />
    </>,
    flask: <>
      <path d="M9 3h6" {...common} />
      <path d="M10 3v6.5L4.8 18a2 2 0 001.7 3h11a2 2 0 001.7-3L14 9.5V3" {...common} />
      <line x1="7.2" y1="14.5" x2="16.8" y2="14.5" {...common} />
    </>,
    watch: <>
      <rect x="7" y="3" width="10" height="6" rx="1.6" {...common} />
      <rect x="7" y="15" width="10" height="6" rx="1.6" {...common} />
      <circle cx="12" cy="12" r="3.6" {...common} />
      <line x1="12" y1="9.6" x2="12" y2="12" {...common} />
    </>,
    layers: <>
      <path d="M12 3l8.5 4.5L12 12 3.5 7.5z" {...common} />
      <path d="M3.5 12.5L12 17l8.5-4.5" {...common} />
      <path d="M3.5 17.2L12 21.7l8.5-4.5" {...common} />
    </>,
    cross: <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3" {...common} />
      <line x1="12" y1="8" x2="12" y2="16" {...common} />
      <line x1="8" y1="12" x2="16" y2="12" {...common} />
    </>,
    brain: <>
      <path d="M8.5 4a3.2 3.2 0 00-3.2 3.2c-1.6.3-2.8 1.7-2.8 3.4 0 .9.35 1.7.9 2.3a3 3 0 00-.4 1.5 3.1 3.1 0 003.1 3.1c.2 1.5 1.5 2.7 3.1 2.7 1.3 0 2.4-.8 2.9-1.9" {...common} />
      <path d="M15.5 4a3.2 3.2 0 013.2 3.2c1.6.3 2.8 1.7 2.8 3.4 0 .9-.35 1.7-.9 2.3.27.45.4.97.4 1.5a3.1 3.1 0 01-3.1 3.1c-.2 1.5-1.5 2.7-3.1 2.7-1.3 0-2.4-.8-2.9-1.9" {...common} />
      <line x1="12" y1="4.3" x2="12" y2="19" {...common} />
    </>,
    users: <>
      <circle cx="9" cy="8.5" r="3" {...common} />
      <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" {...common} />
      <circle cx="17" cy="9.5" r="2.3" {...common} />
      <path d="M15.5 13.3c2 .2 3.8 1.7 4 4.5" {...common} />
    </>,
    mail: <>
      <rect x="3" y="5.5" width="18" height="13" rx="2.2" {...common} />
      <path d="M3.5 6.5l8.5 7 8.5-7" {...common} />
    </>,
    bolt: <path d="M13 2L4.5 13.5h6L10 22l9-12h-6.5z" {...common} />,
    check: <path d="M5 12.5l4.5 4.5L19 7" {...common} />,
    x: <><line x1="6" y1="6" x2="18" y2="18" {...common} /><line x1="18" y1="6" x2="6" y2="18" {...common} /></>,
    arrowRight: <path d="M5 12h14M13 5l7 7-7 7" {...common} />,
    arrowDown: <path d="M12 5v14M5 12l7 7 7-7" {...common} />,
    menu: <><line x1="4" y1="7" x2="20" y2="7" {...common} /><line x1="4" y1="12" x2="20" y2="12" {...common} /><line x1="4" y1="17" x2="20" y2="17" {...common} /></>,
    globe: <><circle cx="12" cy="12" r="9" {...common} /><ellipse cx="12" cy="12" rx="4" ry="9" {...common} /><line x1="3" y1="12" x2="21" y2="12" {...common} /></>,
    building: <><rect x="5" y="3.5" width="14" height="17" rx="1.5" {...common} /><line x1="10" y1="20.5" x2="10" y2="17.5" {...common} /><line x1="14" y1="20.5" x2="14" y2="17.5" {...common} /></>,
    trendUp: <><polyline points="3.5,16 9,10 13,13 20.5,5" {...common} /><polyline points="15,5 20.5,5 20.5,10.5" {...common} /></>,
    smartphone: <><rect x="7" y="2.5" width="10" height="19" rx="2.2" {...common} /><line x1="10.5" y1="19" x2="13.5" y2="19" {...common} /></>,
    activity: <path d="M2.5 12h4l2-7 4 14 2-9 1.5 2h5.5" {...common} />,
    sparkle: <><path d="M12 3v4M12 17v4M3 12h4M17 12h4" {...common} /><circle cx="12" cy="12" r="3.6" {...common} /></>,
    heart: <path d="M12 20.5S3.5 15 3.5 8.8A4.8 4.8 0 0112 6a4.8 4.8 0 018.5 2.8C20.5 15 12 20.5 12 20.5z" {...common} />,
    alert: <><path d="M12 3.5l9.5 16.5H2.5z" {...common} /><line x1="12" y1="9.5" x2="12" y2="14" {...common} /><circle cx="12" cy="17" r=".2" fill={color} stroke={color} /></>,
    doc: <><path d="M6 3h9l4.5 4.5V21H6z" {...common} /><path d="M15 3v4.5h4.5" {...common} /><line x1="8.5" y1="12" x2="15.5" y2="12" {...common} /><line x1="8.5" y1="16" x2="15.5" y2="16" {...common} /></>,
    stethoscope: <><path d="M6 3.5v6a4 4 0 008 0v-6" {...common} /><path d="M10 15.5v1.7a4.3 4.3 0 008.6 0V13.8" {...common} /><circle cx="19.6" cy="10.4" r="1.7" {...common} /></>,
    cloud: <path d="M6.5 18a4 4 0 01-.4-8 5.2 5.2 0 019.9-1.7A4.3 4.3 0 0119.5 18z" {...common} />,
    bed: <><path d="M2.5 19v-8.5A2 2 0 014.5 8.5H19.5a2 2 0 012 2V19" {...common} /><path d="M2.5 16h19" {...common} /><circle cx="7" cy="12" r="1.3" {...common} /></>,
    dumbbell: <><path d="M6 8v8M4 10v4M18 8v8M20 10v4M8 12h8" {...common} /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24">{paths[name] || null}</svg>;
}

// ─── UTILITIES ────────────────────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function useCountUp(target, duration = 1800, active = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [active, target, duration]);
  return val;
}

function Eyebrow({ children, color = C.indigo }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
      <div style={{ width: 7, height: 7, borderRadius: "50%", background: color }} />
      <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: ".18em", color, textTransform: "uppercase" }}>{children}</span>
    </div>
  );
}

function SectionHead({ eyebrow, eyebrowColor, title, italic, italicColor = C.violet, sub, dark, center = true, max = 700 }) {
  return (
    <div style={{ textAlign: center ? "center" : "left", marginBottom: 88, maxWidth: max, marginLeft: center ? "auto" : 0, marginRight: center ? "auto" : 0 }}>
      <div style={{ display: "flex", justifyContent: center ? "center" : "flex-start" }}><Eyebrow color={eyebrowColor}>{eyebrow}</Eyebrow></div>
      <h2 style={{ fontFamily: display, fontWeight: 500, fontSize: "clamp(30px, 3.8vw, 52px)", color: dark ? "white" : C.navy, lineHeight: 1.15, letterSpacing: "-.02em" }}>
        {title}{italic && <><br /><em style={{ color: italicColor, fontStyle: "italic", fontWeight: 400 }}>{italic}</em></>}
      </h2>
      {sub && <p style={{ fontSize: 16, color: dark ? "rgba(255,255,255,.55)" : C.steel, margin: "26px auto 0", lineHeight: 1.75 }}>{sub}</p>}
    </div>
  );
}

function GlassTooltip({ active, payload, label, unit = "" }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: "rgba(10,20,38,.92)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 12, padding: "10px 14px", fontSize: 12, color: "white", fontFamily: mono }}>
      <div style={{ opacity: .6, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => <div key={i} style={{ color: p.color, fontWeight: 700 }}>{p.name}: {p.value}{unit}</div>)}
    </div>
  );
}

function ReviewBadge({ dark }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 13px", borderRadius: 100,
      background: dark ? "rgba(217,119,6,.14)" : "rgba(217,119,6,.1)", border: `1px solid rgba(217,119,6,.3)`,
    }}>
      <Icon name="stethoscope" size={13} color={C.gold} />
      <span style={{ fontSize: 11.5, fontWeight: 700, color: C.gold, letterSpacing: ".03em" }}>Physician Review Required</span>
    </div>
  );
}

// ─── NAV ──────────────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  const links = [
    ["The Brain", "chronorx-brain"], ["Science", "scientific-foundation"],
    ["Clinical Scenarios", "clinical-scenarios"], ["Dashboards", "doctor-dashboard"], ["Contact", "contact"],
  ];
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "0 5vw",
      transition: "all .4s ease",
      background: scrolled ? "rgba(251,250,248,.9)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? `1px solid ${C.line}` : "none",
    }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 78 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${C.indigo}, ${C.violet})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 0 2px ${C.lavender}` }}>
            <Icon name="target" size={17} color="white" sw={1.7} />
          </div>
          <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-.3px", color: C.navy, fontFamily: body }}>
            Chrono<span style={{ color: C.indigo }}>Rx</span> <span style={{ color: C.violet, fontWeight: 300 }}>AI</span>
          </span>
        </div>

        <div className="desktop-nav" style={{ gap: 34, alignItems: "center" }}>
          {links.map(([l, id]) => (
            <a key={l} href={`#${id}`} style={{ fontSize: 14, fontWeight: 500, color: C.steel, textDecoration: "none", letterSpacing: ".01em", transition: "color .2s" }}
              onMouseEnter={e => e.target.style.color = C.indigo} onMouseLeave={e => e.target.style.color = C.steel}>{l}</a>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button className="desktop-nav" style={{ fontSize: 13, fontWeight: 600, padding: "10px 22px", borderRadius: 100, border: `1.5px solid ${C.indigo}`, background: "transparent", color: C.indigo, cursor: "pointer", letterSpacing: ".02em", transition: "all .2s" }}
            onMouseEnter={e => { e.target.style.background = C.cream; }} onMouseLeave={e => { e.target.style.background = "transparent"; }}>
            See the AI Demo
          </button>
          <button style={{ fontSize: 13, fontWeight: 600, padding: "10px 22px", borderRadius: 100, border: "none", background: `linear-gradient(135deg, ${C.indigo}, ${C.violet})`, color: "white", cursor: "pointer", letterSpacing: ".02em", boxShadow: `0 4px 20px rgba(90,94,234,.35)`, transition: "all .2s" }}
            onMouseEnter={e => { e.target.style.transform = "translateY(-1px)"; e.target.style.boxShadow = `0 8px 28px rgba(90,94,234,.45)`; }}
            onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = `0 4px 20px rgba(90,94,234,.35)`; }}>
            Request Demo
          </button>
          <button className="mobile-toggle" onClick={() => setMenuOpen(m => !m)} style={{ width: 40, height: 40, borderRadius: 10, border: `1px solid ${C.line}`, background: "white", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Icon name={menuOpen ? "x" : "menu"} size={18} color={C.navy} />
          </button>
        </div>
      </div>
      {menuOpen && (
        <div style={{ background: "white", borderTop: `1px solid ${C.line}`, padding: "20px 0 28px", display: "flex", flexDirection: "column", gap: 18 }}>
          {links.map(([l, id]) => <a key={l} href={`#${id}`} onClick={() => setMenuOpen(false)} style={{ fontSize: 15, fontWeight: 600, color: C.navy, textDecoration: "none" }}>{l}</a>)}
        </div>
      )}
    </nav>
  );
}

// ─── CIRCADIAN CLOCK (signature element, extended with pattern overlays) ──
function CircadianClock({ size = 320, pattern = "normal" }) {
  const cx = size / 2, cy = size / 2, r = size * 0.38;
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const patterns = {
    normal: { zones: [{ start: 0, end: 5, color: "rgba(90,94,234,.13)" }, { start: 6, end: 10, color: "rgba(225,29,72,.16)" }, { start: 8, end: 10, color: "rgba(14,163,113,.28)" }], label: "Optimal Window", sub: "8 – 10 AM", dipPct: -18 },
    surge: { zones: [{ start: 5, end: 9, color: "rgba(225,29,72,.32)" }], label: "Morning Surge", sub: "+34 mmHg at 6 AM", dipPct: -16 },
    nondipper: { zones: [{ start: 22, end: 24, color: "rgba(217,119,6,.28)" }, { start: 0, end: 5, color: "rgba(217,119,6,.28)" }], label: "Non-Dipper", sub: "< 10% night dip", dipPct: -6 },
    reverse: { zones: [{ start: 21, end: 24, color: "rgba(139,92,246,.34)" }, { start: 0, end: 6, color: "rgba(139,92,246,.34)" }], label: "Reverse Dipper", sub: "Night BP > Day BP", dipPct: 4 },
  };
  const cfg = patterns[pattern] || patterns.normal;
  const now = new Date().getHours() + new Date().getMinutes() / 60;

  function arcPath(startH, endH, innerR, outerR) {
    const s = (startH / 24) * Math.PI * 2 - Math.PI / 2;
    const e = (endH / 24) * Math.PI * 2 - Math.PI / 2;
    const x1 = cx + Math.cos(s) * outerR, y1 = cy + Math.sin(s) * outerR;
    const x2 = cx + Math.cos(e) * outerR, y2 = cy + Math.sin(e) * outerR;
    const x3 = cx + Math.cos(e) * innerR, y3 = cy + Math.sin(e) * innerR;
    const x4 = cx + Math.cos(s) * innerR, y4 = cy + Math.sin(s) * innerR;
    const large = (endH - startH) / 24 > 0.5 ? 1 : 0;
    return `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${large} 0 ${x4} ${y4} Z`;
  }
  const handAngle = (now / 24) * 360 - 90;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r + 20} fill="none" stroke="rgba(139,92,246,.12)" strokeWidth={1} strokeDasharray="3 7" />
        {cfg.zones.map((z, i) => <path key={i} d={arcPath(z.start, z.end, r - 22, r + 8)} fill={z.color} />)}
        {hours.map(h => {
          const a = (h / 24) * Math.PI * 2 - Math.PI / 2;
          const major = h % 6 === 0;
          const inner = r - (major ? 14 : 8), outer = r - 2;
          return <line key={h} x1={cx + Math.cos(a) * inner} y1={cy + Math.sin(a) * inner} x2={cx + Math.cos(a) * outer} y2={cy + Math.sin(a) * outer} stroke={major ? C.indigo : "rgba(90,94,234,.32)"} strokeWidth={major ? 2 : 1} />;
        })}
        {[0, 6, 12, 18].map(h => {
          const a = (h / 24) * Math.PI * 2 - Math.PI / 2;
          const lx = cx + Math.cos(a) * (r - 34), ly = cy + Math.sin(a) * (r - 34);
          const labels = { 0: "12A", 6: "6A", 12: "12P", 18: "6P" };
          return <text key={h} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize={9} fill={C.steel} fontFamily="JetBrains Mono" fontWeight="500">{labels[h]}</text>;
        })}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(90,94,234,.22)" strokeWidth={1.5} />
        <line x1={cx} y1={cy} x2={cx + Math.cos((handAngle * Math.PI) / 180) * (r - 8)} y2={cy + Math.sin((handAngle * Math.PI) / 180) * (r - 8)} stroke={C.indigo} strokeWidth={2} strokeLinecap="round" style={{ transition: "all 1s ease" }} />
        <circle cx={cx} cy={cy} r={4} fill={C.indigo} />
      </svg>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
        <div style={{ fontSize: 10, color: C.muted, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 5 }}>{cfg.label}</div>
        <div style={{ fontSize: 20, fontWeight: 600, color: C.navy, fontFamily: display }}>{cfg.sub}</div>
      </div>
    </div>
  );
}

// ─── ANIMATED BP WAVEFORM (hero signature) ────────────────────────────────
function BPWaveform() {
  const pts = "M0,60 C 20,58 30,20 45,55 S 70,62 80,30 S 110,10 125,58 C 140,64 150,45 165,50 S 195,20 210,55 S 240,62 250,32 S 280,10 295,58 C 310,64 320,45 335,50 S 365,20 380,55 S 410,62 420,32";
  return (
    <svg viewBox="0 0 420 80" width="100%" style={{ display: "block" }}>
      <path d={pts} fill="none" stroke={C.indigo} strokeWidth="2.4" strokeLinecap="round"
        strokeDasharray="900" strokeDashoffset="900" style={{ animation: "dash 3.2s ease-in-out infinite alternate" }} />
    </svg>
  );
}

// ─── HERO ──────────────────────────────────────────────────────────────────
function Hero() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);
  return (
    <section style={{
      minHeight: "100vh", display: "flex", alignItems: "center", padding: "150px 5vw 110px",
      background: `radial-gradient(ellipse 80% 60% at 62% 38%, rgba(90,94,234,.09) 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 18% 82%, rgba(139,92,246,.07) 0%, transparent 60%), ${C.pearl}`,
      overflow: "hidden",
    }}>
      <div className="hero-flex" style={{ maxWidth: 1320, margin: "0 auto", width: "100%", gap: "5vw" }}>
        <div className="hero-copy" style={{ flex: "0 0 54%", maxWidth: 640, opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(24px)", transition: "all .9s cubic-bezier(.2,.8,.2,1)" }}>
          <Eyebrow>Doctor-Guided AI · Clinical Decision Support</Eyebrow>
          <h1 style={{ fontFamily: display, fontWeight: 500, fontSize: "clamp(38px, 5vw, 66px)", lineHeight: 1.08, letterSpacing: "-.02em", color: C.navy, marginBottom: 28 }}>
            Doctor-guided AI for<br /><em style={{ fontStyle: "italic", color: C.violet, fontWeight: 400 }}>personalized</em> medication timing.
          </h1>
          <p style={{ fontSize: 17, color: C.steel, lineHeight: 1.8, marginBottom: 20, maxWidth: 540 }}>
            ChronoRx AI reads blood pressure, heart rate, sleep and adherence patterns against each patient's circadian rhythm and drug pharmacokinetics — then hands a physician a fully explained timing recommendation to review.
          </p>
          <div style={{ marginBottom: 40 }}><ReviewBadge /></div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 52 }}>
            <a href="#chronorx-brain" style={{ textDecoration: "none" }}>
              <button style={{ fontSize: 14.5, fontWeight: 700, padding: "16px 30px", borderRadius: 100, border: "none", background: `linear-gradient(135deg, ${C.indigo}, ${C.violet})`, color: "white", cursor: "pointer", boxShadow: `0 12px 32px rgba(90,94,234,.35)` }}>
                See how the AI thinks →
              </button>
            </a>
            <a href="#doctor-dashboard" style={{ textDecoration: "none" }}>
              <button style={{ fontSize: 14.5, fontWeight: 700, padding: "16px 28px", borderRadius: 100, border: `1.5px solid ${C.line}`, background: "white", color: C.navy, cursor: "pointer" }}>
                View doctor dashboard
              </button>
            </a>
          </div>
          <div style={{ padding: "18px 22px", borderRadius: 18, background: "white", border: `1px solid ${C.line}`, maxWidth: 460 }}>
            <div style={{ fontSize: 10.5, color: C.muted, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 6 }}>Same patient, two dosing times</div>
            <BPWaveform />
          </div>
        </div>

        <div className="hero-visual" style={{ flex: "1 1 46%", position: "relative", opacity: loaded ? 1 : 0, transition: "opacity 1s ease .3s" }}>
          <div style={{ position: "relative", filter: "drop-shadow(0 30px 60px rgba(90,94,234,.18))" }}>
            <CircadianClock size={360} pattern="normal" />
          </div>
          <div className="glass float-anim-2" style={{ position: "absolute", top: 10, left: -30, padding: "13px 17px", borderRadius: 16, display: "flex", gap: 11, alignItems: "center", boxShadow: "0 18px 44px rgba(10,22,40,.14)" }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(225,29,72,.12)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="alert" size={14} color={C.rose} /></div>
            <div><div style={{ fontSize: 9.5, color: C.steel }}>Pattern detected</div><div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>Morning surge</div></div>
          </div>
          <div className="glass float-anim" style={{ position: "absolute", bottom: 4, right: -20, padding: "13px 17px", borderRadius: 16, display: "flex", gap: 11, alignItems: "center", boxShadow: "0 18px 44px rgba(10,22,40,.14)" }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(14,163,113,.12)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="stethoscope" size={14} color={C.emerald} /></div>
            <div><div style={{ fontSize: 9.5, color: C.steel }}>Confidence</div><div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>92% · Doctor review pending</div></div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── TRUST BAR ───────────────────────────────────────────────────────────
function TrustBar() {
  const [ref, visible] = useInView();
  const items = [
    { icon: "stethoscope", label: "Built for physician review, never replacement" },
    { icon: "shield", label: "Grounded in published chronotherapy research" },
    { icon: "flask", label: "Explainable at every recommendation" },
    { icon: "cloud", label: "Designed for hospital & remote monitoring workflows" },
  ];
  return (
    <section ref={ref} style={{ padding: "36px 5vw", borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}`, background: "white" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 32, justifyContent: "space-between", opacity: visible ? 1 : 0, transition: "opacity .8s ease" }}>
        {items.map(({ icon, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 11, flex: "1 1 220px" }}>
            <Icon name={icon} size={17} color={C.indigo} />
            <span style={{ fontSize: 13.5, color: C.steel, fontWeight: 500 }}>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── PROBLEM SECTION ───────────────────────────────────────────────────────
function ProblemSection() {
  const [ref, visible] = useInView();
  const [revealed, setRevealed] = useState(false);
  useEffect(() => { if (visible) setTimeout(() => setRevealed(true), 500); }, [visible]);
  return (
    <section ref={ref} style={{ padding: "150px 5vw", background: C.pearl }}>
      <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <Eyebrow>The Problem</Eyebrow>
        <div style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(20px)", transition: "all .8s ease" }}>
          {["Same medicine.", "Same dose.", "Different outcomes."].map((line, i) => (
            <h2 key={i} style={{ fontFamily: display, fontWeight: 500, fontSize: "clamp(30px, 4.4vw, 58px)", lineHeight: 1.15, letterSpacing: "-.02em", color: i === 2 ? C.violet : C.navy, fontStyle: i === 2 ? "italic" : "normal" }}>
              {line}
            </h2>
          ))}
        </div>
        <div style={{ marginTop: 56, height: 1, transition: "opacity .6s ease", opacity: revealed ? 1 : 0 }}>
          <div style={{ display: "inline-block", padding: "22px 34px", borderRadius: 20, background: "white", border: `1px solid ${C.line}`, boxShadow: "0 20px 50px rgba(10,22,40,.08)" }}>
            <p style={{ fontSize: 17, color: C.steel, lineHeight: 1.7, maxWidth: 560 }}>
              Two patients on identical antihypertensives, same milligram dose — one takes it at 8 AM, the other at 9 PM.
              Their 24-hour BP curves diverge because blood pressure itself follows a circadian rhythm most prescriptions never account for.
              <strong style={{ color: C.navy }}> Sometimes, timing matters.</strong>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CIRCADIAN BIOLOGY SECTION ──────────────────────────────────────────
function CircadianBiologySection() {
  const [ref, visible] = useInView();
  const [active, setActive] = useState("normal");
  const cards = [
    { key: "normal", label: "Morning Surge", desc: "A natural rise in BP 1–2 hours after waking, driven by cortisol and sympathetic activation.", color: C.rose },
    { key: "reverse", label: "Dipper Pattern", desc: "BP falls 10–20% overnight — the expected, healthy nocturnal pattern.", color: C.emerald },
    { key: "nondipper", label: "Non-Dipper", desc: "Night BP falls less than 10% — linked to higher cardiovascular risk.", color: C.gold },
    { key: "reverse", label: "Reverse Dipper", desc: "Night BP is higher than daytime BP — the pattern of greatest concern.", color: C.violet },
  ];
  return (
    <section ref={ref} id="circadian-biology" style={{ padding: "150px 5vw", background: "white" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <SectionHead eyebrow="Circadian Biology" title="Blood pressure has a" italic="24-hour rhythm" sub="Every patient's BP naturally rises and falls across the day. ChronoRx AI maps where each patient sits on this curve before anything else." />
        <div className="grid-2" style={{ gap: 60, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", justifyContent: "center", opacity: visible ? 1 : 0, transform: visible ? "none" : "scale(.92)", transition: "all .8s ease" }}>
            <CircadianClock size={320} pattern={active} />
          </div>
          <div style={{ display: "grid", gap: 16 }}>
            {cards.map(({ key, label, desc, color }, i) => (
              <div key={label} onMouseEnter={() => setActive(key)} className="card-hover"
                style={{ padding: "20px 24px", borderRadius: 18, background: C.pearl, border: `1px solid ${C.line}`, opacity: visible ? 1 : 0, transform: visible ? "none" : "translateX(20px)", transition: `all .6s ease ${i * .08}s` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                  <span style={{ fontSize: 15.5, fontWeight: 700, color: C.navy }}>{label}</span>
                </div>
                <p style={{ fontSize: 13.5, color: C.steel, lineHeight: 1.65, paddingLeft: 20 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── WHY TIMING MATTERS ────────────────────────────────────────────────
function WhyTimingMatters() {
  const [ref, visible] = useInView();
  const steps = [
    { icon: "pill", title: "Drug absorbed", desc: "Peak plasma concentration depends on when the dose is taken." },
    { icon: "clock", title: "Rhythm aligned", desc: "Circadian biology determines when BP is naturally rising or falling." },
    { icon: "chart", title: "Effect matched", desc: "Aligning the two can improve nocturnal control without changing the dose." },
  ];
  return (
    <section ref={ref} style={{ padding: "130px 5vw", background: C.pearl }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <SectionHead eyebrow="Why Timing Matters" title="Chronotherapy, in three moves" max={620} />
        <div className="grid-auto-3" style={{ gap: 24 }}>
          {steps.map(({ icon, title, desc }, i) => (
            <div key={title} style={{ textAlign: "center", padding: "40px 28px", borderRadius: 22, background: "white", border: `1px solid ${C.line}`, opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(24px)", transition: `all .6s ease ${i * .12}s` }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: C.lavender, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}><Icon name={icon} size={24} color={C.indigo} /></div>
              <h3 style={{ fontFamily: display, fontSize: 20, fontWeight: 500, color: C.navy, marginBottom: 10 }}>{title}</h3>
              <p style={{ fontSize: 14, color: C.steel, lineHeight: 1.65 }}>{desc}</p>
              {i < steps.length - 1 && <div style={{ display: "none" }} />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── WHAT IS CHRONORX (flow) ────────────────────────────────────────────
function WhatIsChronoRx() {
  const [ref, visible] = useInView();
  const flow = [
    { icon: "users", label: "Patient" },
    { icon: "activity", label: "Health Data" },
    { icon: "brain", label: "ChronoRx Intelligence Engine" },
    { icon: "stethoscope", label: "Doctor Review" },
    { icon: "clock", label: "Personalized Medication Timing" },
  ];
  return (
    <section ref={ref} style={{ padding: "140px 5vw", background: "white" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <SectionHead eyebrow="What Is ChronoRx AI" title="A clinical decision" italic="support pipeline" max={620} />
        <div className="pipeline-row" style={{ gap: 8, opacity: visible ? 1 : 0, transition: "opacity .8s ease" }}>
          {flow.map(({ icon, label }, i) => (
            <div key={label} style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <div style={{ flex: 1, textAlign: "center", padding: "28px 14px", borderRadius: 18, background: i === 2 ? C.navy : C.pearl, border: `1px solid ${i === 2 ? "transparent" : C.line}` }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: i === 2 ? "rgba(139,92,246,.2)" : C.lavender, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                  <Icon name={icon} size={19} color={i === 2 ? C.violet : C.indigo} />
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: i === 2 ? "white" : C.navy, lineHeight: 1.4 }}>{label}</div>
              </div>
              {i < flow.length - 1 && <div className="desktop-nav" style={{ padding: "0 6px" }}><Icon name="arrowRight" size={16} color={C.muted} /></div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── INSIDE THE CHRONORX BRAIN (centerpiece) ──────────────────────────
function ChronoRxBrain() {
  const [ref, visible] = useInView(0.1);
  const inputs = ["Blood Pressure", "Heart Rate", "Sleep", "Medication", "Adherence", "Activity", "Symptoms", "Weight", "Lifestyle", "Medical History", "Drug PK/PD", "Circadian Rhythm", "Home BP", "Wearables"];
  const engines = ["Pattern Recognition", "Circadian Intelligence", "Drug PK Engine", "Prediction Engine", "Risk Engine", "Explainable AI", "Confidence Engine"];
  const outputs = ["Medication Timing", "Clinical Insights", "Doctor Alerts", "Risk Detection", "Reports", "Prediction", "Confidence Score", "Physician Review"];
  const [pulse, setPulse] = useState(0);
  useEffect(() => { const t = setInterval(() => setPulse(p => (p + 1) % engines.length), 1100); return () => clearInterval(t); }, []);

  return (
    <section ref={ref} id="chronorx-brain" style={{ padding: "150px 5vw", background: C.navy, overflow: "hidden" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <SectionHead dark eyebrow="Inside The ChronoRx Brain" eyebrowColor={C.violet} title="Every signal, one" italic="explainable decision" italicColor={C.violet}
          sub="Fourteen streams of patient data flow into a layered reasoning engine — and every layer is visible to the reviewing physician." />
        <div className="brain-cols" style={{ opacity: visible ? 1 : 0, transition: "opacity 1s ease" }}>
          {/* INPUTS */}
          <div style={{ display: "grid", gap: 9 }}>
            {inputs.map((label, i) => (
              <div key={label} className="glass-dark" style={{ padding: "10px 16px", borderRadius: 12, fontSize: 12.5, color: "rgba(255,255,255,.75)", fontWeight: 500, transform: visible ? "none" : "translateX(-30px)", opacity: visible ? 1 : 0, transition: `all .5s ease ${i * .04}s`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {label}
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.violet, opacity: pulse % inputs.length === i % inputs.length ? 1 : 0.25 }} />
              </div>
            ))}
          </div>

          {/* ENGINE STACK */}
          <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0" }}>
            <div style={{ position: "relative", width: 190, height: 190, marginBottom: 24 }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `radial-gradient(circle, rgba(90,94,234,.35), transparent 70%)`, animation: "glowPulse 2.4s ease-in-out infinite" }} />
              <div style={{ position: "absolute", inset: 20, borderRadius: "50%", border: "1.5px solid rgba(139,92,246,.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="brain" size={64} color={C.violet} sw={1.3} />
              </div>
            </div>
            <div style={{ display: "grid", gap: 8, width: "100%", maxWidth: 300 }}>
              {engines.map((e, i) => (
                <div key={e} style={{
                  padding: "11px 18px", borderRadius: 100, textAlign: "center", fontSize: 12.5, fontWeight: 700,
                  background: pulse === i ? `linear-gradient(135deg, ${C.indigo}, ${C.violet})` : "rgba(255,255,255,.06)",
                  color: pulse === i ? "white" : "rgba(255,255,255,.55)",
                  border: "1px solid rgba(255,255,255,.1)", transition: "all .5s ease",
                }}>{e}</div>
              ))}
            </div>
          </div>

          {/* OUTPUTS */}
          <div style={{ display: "grid", gap: 9 }}>
            {outputs.map((label, i) => (
              <div key={label} className="glass-dark" style={{ padding: "10px 16px", borderRadius: 12, fontSize: 12.5, color: "rgba(255,255,255,.75)", fontWeight: 500, transform: visible ? "none" : "translateX(30px)", opacity: visible ? 1 : 0, transition: `all .5s ease ${i * .05}s`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {label}
                {label === "Physician Review" && <Icon name="stethoscope" size={13} color={C.gold} />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── PATTERN RECOGNITION (interactive cards) ────────────────────────────
function PatternRecognition() {
  const [ref, visible] = useInView();
  const [open, setOpen] = useState(null);
  const groups = [
    { title: "Blood Pressure Patterns", color: C.rose, icon: "pulse", items: ["Morning Surge", "Nocturnal BP", "Dipper", "Reverse Dipper", "Variability"] },
    { title: "Heart Rate Patterns", color: C.indigo, icon: "heart", items: ["Resting HR", "Circadian HR", "HRV (wearable)"] },
    { title: "Sleep Patterns", color: C.violet, icon: "moon", items: ["Duration", "Consistency", "Circadian Stability"] },
    { title: "Medication Patterns", color: C.emerald, icon: "pill", items: ["Adherence", "Timing Consistency", "Drug Response"] },
    { title: "Lifestyle Patterns", color: C.gold, icon: "dumbbell", items: ["Activity", "Weight", "Sedentary Time"] },
  ];
  return (
    <section ref={ref} style={{ padding: "150px 5vw", background: C.pearl }}>
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <SectionHead eyebrow="Pattern Recognition" title="Five families of signal," italic="one unified read" max={640} />
        <div className="grid-auto-3" style={{ gap: 22 }}>
          {groups.map((g, i) => {
            const isOpen = open === i;
            return (
              <div key={g.title} onClick={() => setOpen(isOpen ? null : i)} className="card-hover"
                style={{ padding: "28px 26px", borderRadius: 22, background: "white", border: `1px solid ${C.line}`, opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(20px)", transition: `all .6s ease ${i * .07}s` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 13, background: `${g.color}16`, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={g.icon} size={21} color={g.color} /></div>
                  <h3 style={{ fontSize: 16.5, fontWeight: 700, color: C.navy }}>{g.title}</h3>
                </div>
                <div style={{ maxHeight: isOpen ? 300 : 0, overflow: "hidden", transition: "max-height .4s ease" }}>
                  {g.items.map(it => (
                    <div key={it} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderTop: `1px solid ${C.line}`, fontSize: 13.5, color: C.steel }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: g.color }} />{it}
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: g.color, fontWeight: 700, marginTop: isOpen ? 4 : 0 }}>{isOpen ? "Show less ↑" : `${g.items.length} tracked signals ↓`}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── HOW CHRONORX THINKS (animated pipeline) ────────────────────────────
function HowChronoRxThinks() {
  const [ref, visible] = useInView();
  const [active, setActive] = useState(0);
  const steps = ["Collect Data", "Analyze Patterns", "Learn Circadian Rhythm", "Drug PK Matching", "Predict BP Response", "Generate Confidence", "Explain Recommendation", "Doctor Review"];
  useEffect(() => {
    if (!visible) return;
    const t = setInterval(() => setActive(a => (a + 1) % steps.length), 1300);
    return () => clearInterval(t);
  }, [visible]);
  return (
    <section ref={ref} style={{ padding: "140px 5vw", background: "white" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <SectionHead eyebrow="How ChronoRx Thinks" title="An explainable" italic="reasoning pipeline" max={600} />
        <div style={{ display: "grid", gap: 10 }}>
          {steps.map((s, i) => (
            <div key={s} style={{
              display: "flex", alignItems: "center", gap: 18, padding: "17px 24px", borderRadius: 16,
              background: active === i ? C.navy : C.pearl, transition: "all .5s ease", border: `1px solid ${active === i ? "transparent" : C.line}`,
            }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: active === i ? `linear-gradient(135deg,${C.indigo},${C.violet})` : "white", border: active === i ? "none" : `1px solid ${C.line}`, fontSize: 12.5, fontWeight: 700, color: active === i ? "white" : C.muted }}>
                {i + 1}
              </div>
              <span style={{ fontSize: 14.5, fontWeight: 600, color: active === i ? "white" : C.navy, flex: 1 }}>{s}</span>
              {i === steps.length - 1 && <Icon name="stethoscope" size={16} color={active === i ? C.gold : C.muted} />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── INTERACTIVE AI DEMO ─────────────────────────────────────────────────
function AIDemo() {
  const [ref, visible] = useInView();
  const [morningBP, setMorningBP] = useState(148);
  const [nightBP, setNightBP] = useState(132);
  const [sleep, setSleep] = useState(6.2);
  const [medTime, setMedTime] = useState(8);
  const [missed, setMissed] = useState(1);
  const [activity, setActivity] = useState(5200);

  const result = useMemo(() => {
    const dip = ((morningBP - nightBP) / morningBP) * 100;
    let pattern = "Dipper", risk = "Low", conf = 90, color = C.emerald;
    if (dip < 5) { pattern = "Reverse Dipper"; risk = "High"; conf = 87; color = C.violet; }
    else if (dip < 10) { pattern = "Non-Dipper"; risk = "Moderate"; conf = 85; color = C.gold; }
    if (missed >= 2) conf -= 8;
    if (sleep < 6) conf -= 4;
    conf = Math.max(60, Math.min(96, conf));
    const timing = pattern === "Dipper" ? "Morning, 8:00 AM" : "Evening, 8:30–9:00 PM";
    const reasoning = pattern === "Dipper"
      ? "Nocturnal dip is within healthy range; current morning dosing aligns with circadian pattern."
      : `Reduced nocturnal dip (${dip.toFixed(0)}%) suggests evening dosing may better align drug peak effect with the overnight BP window.`;
    return { pattern, risk, conf, color, timing, reasoning, dip };
  }, [morningBP, nightBP, sleep, medTime, missed, activity]);

  const Slider = ({ label, val, set, min, max, step = 1, unit = "" }) => (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: C.steel, fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 13, color: C.indigo, fontWeight: 700, fontFamily: mono }}>{val}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={val} onChange={e => set(Number(e.target.value))}
        style={{ width: "100%", accentColor: C.indigo }} />
    </div>
  );

  return (
    <section ref={ref} style={{ padding: "140px 5vw", background: C.pearl }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <SectionHead eyebrow="Interactive AI Demo" title="Move the sliders." italic="Watch the reasoning update." max={640} />
        <div className="grid-2" style={{ gap: 40, alignItems: "start", flexWrap: "wrap", opacity: visible ? 1 : 0, transition: "opacity .8s ease" }}>
          <div style={{ padding: "36px 34px", borderRadius: 24, background: "white", border: `1px solid ${C.line}` }}>
            <Slider label="Morning Systolic BP" val={morningBP} set={setMorningBP} min={110} max={190} unit=" mmHg" />
            <Slider label="Night Systolic BP" val={nightBP} set={setNightBP} min={95} max={170} unit=" mmHg" />
            <Slider label="Sleep Duration" val={sleep} set={setSleep} min={3} max={9} step={0.1} unit=" hrs" />
            <Slider label="Current Medication Time" val={medTime} set={setMedTime} min={5} max={22} unit=":00" />
            <Slider label="Missed Doses (per week)" val={missed} set={setMissed} min={0} max={5} unit="" />
            <Slider label="Daily Activity" val={activity} set={setActivity} min={500} max={12000} step={100} unit=" steps" />
          </div>

          <div style={{ padding: "36px 34px", borderRadius: 24, background: C.navy, color: "white" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 10.5, color: "rgba(255,255,255,.5)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 6 }}>Detected Pattern</div>
                <div style={{ fontSize: 22, fontWeight: 600, fontFamily: display, color: result.color }}>{result.pattern}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10.5, color: "rgba(255,255,255,.5)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 6 }}>Confidence</div>
                <div style={{ fontSize: 22, fontWeight: 700, fontFamily: mono }}>{result.conf}%</div>
              </div>
            </div>
            <div style={{ height: 5, borderRadius: 4, background: "rgba(255,255,255,.1)", marginBottom: 28 }}>
              <div style={{ width: `${result.conf}%`, height: "100%", borderRadius: 4, background: `linear-gradient(90deg,${C.indigo},${C.violet})`, transition: "width .4s ease" }} />
            </div>
            <div style={{ padding: "16px 18px", borderRadius: 14, background: "rgba(90,94,234,.14)", border: "1px solid rgba(90,94,234,.3)", marginBottom: 16 }}>
              <div style={{ fontSize: 9.5, color: "rgba(255,255,255,.5)", marginBottom: 6 }}>SUGGESTED TIMING WINDOW</div>
              <div style={{ fontSize: 19, fontWeight: 600, fontFamily: display }}>{result.timing}</div>
            </div>
            <div style={{ padding: "16px 18px", borderRadius: 14, background: "rgba(255,255,255,.05)", marginBottom: 16 }}>
              <div style={{ fontSize: 9.5, color: "rgba(255,255,255,.5)", marginBottom: 6 }}>REASONING</div>
              <div style={{ fontSize: 13.5, lineHeight: 1.65, color: "rgba(255,255,255,.85)" }}>{result.reasoning}</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 18px", borderRadius: 14, background: "rgba(217,119,6,.12)", border: "1px solid rgba(217,119,6,.3)" }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: C.gold }}>Cardiovascular Risk: {result.risk}</span>
              <ReviewBadge dark />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── EXPLAINABLE AI ─────────────────────────────────────────────────────
function ExplainableAISection() {
  const [ref, visible] = useInView();
  const evidence = ["Non-dipper pattern (6% nocturnal dip)", "3 missed doses in past 7 days", "Sleep onset delayed by 90 min", "Drug half-life favors evening peak"];
  return (
    <section ref={ref} style={{ padding: "140px 5vw", background: "white" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <SectionHead eyebrow="Explainable AI" title="No black boxes." italic="Every output shows its work." max={620} />
        <div className="glass card-hover" style={{ padding: "40px 40px", borderRadius: 26, background: "white", border: `1px solid ${C.line}`, boxShadow: "0 30px 70px rgba(10,22,40,.08)", opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(20px)", transition: "all .8s ease" }}>
          <div className="grid-2" style={{ gap: 32, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 11, color: C.muted, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 10 }}>Recommendation</div>
              <div style={{ fontSize: 24, fontWeight: 600, fontFamily: display, color: C.navy, marginBottom: 22 }}>Shift Amlodipine to 8:30 PM</div>
              <div style={{ display: "flex", gap: 24, marginBottom: 22 }}>
                <div><div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Confidence</div><div style={{ fontSize: 20, fontWeight: 700, color: C.indigo }}>89%</div></div>
                <div><div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Risk Flag</div><div style={{ fontSize: 20, fontWeight: 700, color: C.gold }}>Moderate</div></div>
              </div>
              <ReviewBadge />
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.muted, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 12 }}>Evidence Factors</div>
              {evidence.map(e => (
                <div key={e} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "9px 0", borderTop: `1px solid ${C.line}`, fontSize: 13.5, color: C.steel }}>
                  <Icon name="check" size={13} color={C.emerald} sw={2} /><span>{e}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── SCIENTIFIC FOUNDATION ───────────────────────────────────────────────
function ScientificFoundation() {
  const [ref, visible] = useInView();
  const items = [
    { title: "Circadian Biology", icon: "clock", desc: "The 24-hour rhythm governing BP, heart rate and hormone cycles." },
    { title: "Chronotherapy", icon: "moon", desc: "Timing treatment to a patient's biological rhythm rather than the clock alone." },
    { title: "Pharmacokinetics", icon: "flask", desc: "How the body absorbs, distributes and clears a drug over time." },
    { title: "Pharmacodynamics", icon: "activity", desc: "How a drug's concentration translates into physiological effect." },
    { title: "Home BP Monitoring", icon: "smartphone", desc: "Patient-collected readings that reveal real-world, out-of-clinic patterns." },
    { title: "Ambulatory BP Monitoring", icon: "watch", desc: "Continuous 24-hour BP capture, the clinical gold standard for dipping status." },
    { title: "Remote Patient Monitoring", icon: "cloud", desc: "Continuous data flow from patient to clinician outside the hospital." },
    { title: "Explainable AI", icon: "brain", desc: "Model outputs paired with the evidence and reasoning behind them." },
    { title: "Clinical Decision Support", icon: "stethoscope", desc: "Structured information that assists — never replaces — physician judgment." },
    { title: "Digital Therapeutics", icon: "pill", desc: "Software-driven interventions used alongside, not instead of, medical care." },
  ];
  return (
    <section ref={ref} id="scientific-foundation" style={{ padding: "150px 5vw", background: C.pearl }}>
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <SectionHead eyebrow="Scientific Foundation" title="Built on established science," italic="not invented claims" sub="ChronoRx AI integrates decades of published clinical concepts into one explainable platform. It does not originate these fields — it applies them." max={680} />
        <div className="grid-auto-4" style={{ gap: 20 }}>
          {items.map(({ title, icon, desc }, i) => (
            <div key={title} className="card-hover" style={{ padding: "26px 24px", borderRadius: 20, background: "white", border: `1px solid ${C.line}`, opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(16px)", transition: `all .5s ease ${i * .04}s` }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: C.lavender, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}><Icon name={icon} size={19} color={C.indigo} /></div>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: C.navy, marginBottom: 8 }}>{title}</h4>
              <p style={{ fontSize: 13, color: C.steel, lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CLINICAL SCENARIOS ─────────────────────────────────────────────────
function ClinicalScenarios() {
  const [ref, visible] = useInView();
  const [tab, setTab] = useState(0);
  const scenarios = [
    { name: "Morning Surge Detected", obs: "Systolic BP rises 32 mmHg within 2 hours of waking.", reason: "Sharp surge magnitude correlates with elevated stroke risk in published cohorts.", timing: "Morning, 30 min before waking window", conf: 88 },
    { name: "Non-Dipper Pattern", obs: "Nocturnal dip measured at 7%, below the 10% healthy threshold.", reason: "Evening dosing may extend drug coverage into the overnight window.", timing: "Evening, 8–9 PM", conf: 85 },
    { name: "Reverse Dipper", obs: "Night BP exceeds daytime average by 6 mmHg.", reason: "Pattern associated with highest cardiovascular risk category; flagged for priority review.", timing: "Evening — physician-led reassessment recommended", conf: 91 },
    { name: "Elevated Night BP", obs: "Ambulatory monitoring shows sustained nighttime readings above target.", reason: "Current dosing may not be covering the overnight period.", timing: "Evening, timing adjustment candidate", conf: 84 },
    { name: "Poor Medication Adherence", obs: "4 of 7 doses missed this week.", reason: "Adherence gaps reduce confidence in any timing recommendation.", timing: "Not applicable until adherence stabilizes", conf: 58 },
    { name: "Shift Worker", obs: "Sleep window shifts between day and night across the week.", reason: "Circadian anchor point is unstable, so standard timing windows apply with reduced confidence.", timing: "Individualized — anchored to wake time, not clock time", conf: 63 },
    { name: "Irregular Sleep", obs: "Sleep onset varies by more than 2 hours night to night.", reason: "Circadian rhythm instability limits precision of a timing recommendation.", timing: "Deferred pending sleep pattern stabilization", conf: 60 },
    { name: "Medication Recently Changed", obs: "New antihypertensive started 5 days ago.", reason: "Insufficient data history to establish a reliable pattern yet.", timing: "Re-evaluate after 14 days of data", conf: 55 },
    { name: "Stable BP Control", obs: "BP within target range with consistent 15% nocturnal dip.", reason: "No indication that a timing change would improve outcomes.", timing: "Maintain current schedule", conf: 93 },
    { name: "Elderly Patient, Dizziness", obs: "Reported dizziness episodes coincide with overnight BP troughs.", reason: "Symptom correlation flagged for orthostatic risk review before any timing change.", timing: "No timing change suggested — physician evaluation first", conf: 70 },
  ];
  const s = scenarios[tab];
  return (
    <section ref={ref} id="clinical-scenarios" style={{ padding: "150px 5vw", background: "white" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <SectionHead eyebrow="When ChronoRx AI Thinks Differently" title="Ten patterns," italic="ten different reasoning paths" sub="Illustrative examples only — not treatment protocols. Every case still ends with a physician." max={700} />
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 40, justifyContent: "center", opacity: visible ? 1 : 0, transition: "opacity .8s ease" }}>
          {scenarios.map((sc, i) => (
            <button key={sc.name} onClick={() => setTab(i)} style={{
              padding: "9px 16px", borderRadius: 100, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
              border: `1.5px solid ${tab === i ? C.indigo : C.line}`, background: tab === i ? C.indigo : "white", color: tab === i ? "white" : C.steel, transition: "all .25s",
            }}>{sc.name}</button>
          ))}
        </div>
        <div style={{ padding: "40px", borderRadius: 26, background: C.pearl, border: `1px solid ${C.line}` }}>
          <div style={{ display: "grid", gap: 16 }}>
            {[
              ["Clinical Pattern", s.name, C.navy],
              ["AI Observations", s.obs, C.steel],
              ["Clinical Reasoning", s.reason, C.steel],
              ["Suggested Timing Window", s.timing, C.indigo],
            ].map(([label, val, color]) => (
              <div key={label} style={{ padding: "18px 22px", borderRadius: 16, background: "white", border: `1px solid ${C.line}` }}>
                <div style={{ fontSize: 10.5, color: C.muted, letterSpacing: ".07em", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
                <div style={{ fontSize: 15, fontWeight: label === "Clinical Pattern" || label === "Suggested Timing Window" ? 700 : 500, color, lineHeight: 1.55 }}>{val}</div>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px", borderRadius: 16, background: "white", border: `1px solid ${C.line}` }}>
              <div>
                <div style={{ fontSize: 10.5, color: C.muted, letterSpacing: ".07em", textTransform: "uppercase", marginBottom: 6 }}>Confidence Score</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: C.emerald }}>{s.conf}%</div>
              </div>
              <ReviewBadge />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── DOCTOR DASHBOARD ────────────────────────────────────────────────────
function DoctorDashboard() {
  const [ref, visible] = useInView();
  const [selected, setSelected] = useState(0);
  const patients = [
    { name: "R. Mehta, 58", flag: "Morning Surge", risk: "High", color: C.rose },
    { name: "A. Kapoor, 64", flag: "Non-Dipper", risk: "Moderate", color: C.gold },
    { name: "S. Iyer, 47", flag: "Stable", risk: "Low", color: C.emerald },
    { name: "P. Nair, 71", flag: "Reverse Dipper", risk: "High", color: C.rose },
  ];
  const bpTrend = [
    { t: "Mon", bp: 142 }, { t: "Tue", bp: 138 }, { t: "Wed", bp: 145 }, { t: "Thu", bp: 136 }, { t: "Fri", bp: 133 }, { t: "Sat", bp: 130 }, { t: "Sun", bp: 128 },
  ];
  return (
    <section ref={ref} id="doctor-dashboard" style={{ padding: "150px 5vw", background: C.navy }}>
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <SectionHead dark eyebrow="Doctor Dashboard" eyebrowColor={C.violet} title="A hospital-grade" italic="clinical workflow" italicColor={C.violet}
          sub="Priority queue, AI-generated insight, and one-tap physician action — approve, modify, or reject." max={640} />
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24, opacity: visible ? 1 : 0, transition: "opacity .9s ease" }} className="grid-2">
          <div className="glass-dark" style={{ borderRadius: 22, padding: 18 }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.45)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 14, padding: "0 6px" }}>Priority Queue</div>
            {patients.map((p, i) => (
              <div key={p.name} onClick={() => setSelected(i)} style={{
                padding: "14px 16px", borderRadius: 14, marginBottom: 8, cursor: "pointer",
                background: selected === i ? "rgba(90,94,234,.16)" : "transparent", border: `1px solid ${selected === i ? "rgba(90,94,234,.4)" : "transparent"}`, transition: "all .2s",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: "white" }}>{p.name}</span>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: p.color, marginTop: 5 }} />
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)" }}>{p.flag} · {p.risk} risk</div>
              </div>
            ))}
          </div>

          <div className="glass-dark" style={{ borderRadius: 22, padding: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontSize: 19, fontWeight: 700, color: "white" }}>{patients[selected].name}</div>
                <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.5)" }}>{patients[selected].flag} pattern · Adherence 91%</div>
              </div>
              <button style={{ fontSize: 12, fontWeight: 700, padding: "9px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,.15)", background: "transparent", color: "white", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="doc" size={13} color="white" /> Export PDF
              </button>
            </div>
            <div style={{ height: 180, marginBottom: 22, background: "rgba(255,255,255,.03)", borderRadius: 14, padding: "14px 8px 4px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bpTrend}>
                  <defs><linearGradient id="bpg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.violet} stopOpacity={.5} /><stop offset="100%" stopColor={C.violet} stopOpacity={0} /></linearGradient></defs>
                  <XAxis dataKey="t" tick={{ fill: "rgba(255,255,255,.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis hide domain={[110, 155]} />
                  <Tooltip content={<GlassTooltip unit=" mmHg" />} />
                  <Area type="monotone" dataKey="bp" stroke={C.violet} strokeWidth={2} fill="url(#bpg)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div style={{ padding: "18px 20px", borderRadius: 16, background: "rgba(90,94,234,.12)", border: "1px solid rgba(90,94,234,.28)", marginBottom: 18 }}>
              <div style={{ fontSize: 10.5, color: "rgba(255,255,255,.5)", marginBottom: 6 }}>AI RECOMMENDATION · 87% CONFIDENCE</div>
              <div style={{ fontSize: 15, color: "white", fontWeight: 600, marginBottom: 14 }}>Shift dosing from 7:30 AM to 8:30 PM to improve nocturnal coverage.</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button style={{ padding: "9px 18px", borderRadius: 10, border: "none", background: C.emerald, color: "white", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>Approve</button>
                <button style={{ padding: "9px 18px", borderRadius: 10, border: "1px solid rgba(255,255,255,.2)", background: "transparent", color: "white", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>Modify</button>
                <button style={{ padding: "9px 18px", borderRadius: 10, border: "1px solid rgba(225,29,72,.4)", background: "transparent", color: C.rose, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>Reject</button>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
              {[["Morning Surge", "+28 mmHg"], ["Sleep", "6.1 hrs avg"], ["Heart Rate", "76 bpm"]].map(([l, v]) => (
                <div key={l} style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,.04)" }}>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,.45)", marginBottom: 4 }}>{l}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "white" }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── PATIENT DASHBOARD ───────────────────────────────────────────────────
function PatientDashboard() {
  const [ref, visible] = useInView();
  const [step, setStep] = useState(0);
  useEffect(() => { const t = setInterval(() => setStep(s => (s + 1) % 4), 2600); return () => clearInterval(t); }, []);
  const screens = [
    <div key={0} style={{ height: "100%", background: C.navy, padding: "26px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ color: "rgba(255,255,255,.5)", fontSize: 10, letterSpacing: ".08em" }}>MEDICATION REMINDER</div>
      <div style={{ fontFamily: display, fontSize: 26, color: "white", fontWeight: 500 }}>Amlodipine · 8:30 PM</div>
      <div style={{ fontSize: 11, color: C.emerald, fontWeight: 600 }}>Aligned to your circadian window</div>
      <div style={{ marginTop: "auto", padding: "13px 15px", borderRadius: 14, background: "rgba(90,94,234,.12)", border: "1px solid rgba(90,94,234,.25)" }}>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,.5)", marginBottom: 5 }}>NEXT DOSE</div>
        <div style={{ fontSize: 13, color: "white", fontWeight: 600 }}>In 2 hours 15 minutes</div>
      </div>
    </div>,
    <div key={1} style={{ height: "100%", background: C.navy, padding: "26px 18px", display: "flex", flexDirection: "column", gap: 13 }}>
      <div style={{ color: "rgba(255,255,255,.5)", fontSize: 10, letterSpacing: ".1em" }}>BP TREND — 7 DAYS</div>
      {[130, 145, 118].map((h, i) => null)}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 90 }}>
        {[62, 70, 55, 66, 48, 44, 40].map((h, i) => <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: 4, background: i > 3 ? C.emerald : C.indigo, opacity: .85 }} />)}
      </div>
      <div style={{ fontSize: 12, color: C.emerald, fontWeight: 700, marginTop: 4 }}>Trending down — nice work</div>
    </div>,
    <div key={2} style={{ height: "100%", background: `linear-gradient(160deg, ${C.navy}, #160a30)`, padding: "26px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ color: "rgba(255,255,255,.5)", fontSize: 10, letterSpacing: ".1em" }}>SLEEP</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}><span style={{ fontFamily: display, fontSize: 40, color: "white" }}>7.1</span><span style={{ fontSize: 16, color: "rgba(255,255,255,.5)" }}>hrs</span></div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,.6)" }}>Consistent bedtime 3 nights running</div>
      <div style={{ marginTop: 8, padding: "13px 15px", borderRadius: 14, background: "rgba(139,92,246,.14)", border: "1px solid rgba(139,92,246,.3)" }}>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,.5)", marginBottom: 5 }}>ACHIEVEMENT</div>
        <div style={{ fontSize: 13, color: "white", fontWeight: 700 }}>🏅 7-day adherence streak</div>
      </div>
    </div>,
    <div key={3} style={{ height: "100%", background: C.pearl, padding: "26px 18px", display: "flex", flexDirection: "column", gap: 11 }}>
      <div style={{ fontSize: 10, color: C.muted, letterSpacing: ".06em" }}>AI INSIGHTS</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: C.navy, fontFamily: display }}>This Week</div>
      {[["BP", "−7 mmHg", C.emerald, "chart"], ["Adherence", "96%", C.indigo, "check"], ["Reviewed by", "Dr. Chen", C.violet, "stethoscope"]].map(([l, v, color, icon]) => (
        <div key={l} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 14, background: "white", border: "1px solid rgba(0,0,0,.05)" }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={icon} size={15} color={color} /></div>
          <div style={{ flex: 1 }}><div style={{ fontSize: 11, color: C.muted }}>{l}</div><div style={{ fontSize: 15, fontWeight: 600, color: C.navy }}>{v}</div></div>
        </div>
      ))}
    </div>,
  ];
  return (
    <section ref={ref} style={{ padding: "150px 5vw", background: "white" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="grid-2" style={{ gap: 60, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateX(-20px)", transition: "all .8s ease" }}>
            <SectionHead center={false} eyebrow="Patient Dashboard" title="Simple for patients," italic="powered underneath" max={480} />
            <div style={{ display: "grid", gap: 16 }}>
              {[["calendar", "Medication reminders", "Aligned to the AI's recommended window, not just a fixed clock time."], ["chart", "BP & activity trends", "Home readings and wearable data, visualized clearly over time."], ["stethoscope", "Doctor-reviewed insights", "Every recommendation the patient sees has already been reviewed."]].map(([icon, t, d]) => (
                <div key={t} style={{ display: "flex", gap: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: C.lavender, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name={icon} size={18} color={C.indigo} /></div>
                  <div><div style={{ fontSize: 14.5, fontWeight: 700, color: C.navy, marginBottom: 3 }}>{t}</div><div style={{ fontSize: 13, color: C.steel, lineHeight: 1.6 }}>{d}</div></div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", opacity: visible ? 1 : 0, transition: "opacity 1s ease .2s" }}>
            <div style={{ position: "relative", width: 224, height: 466 }} className="float-anim">
              <div style={{ position: "absolute", inset: 0, borderRadius: 40, transform: "rotate(-6deg)", background: C.navy, boxShadow: `0 36px 88px rgba(10,22,40,.5), 0 0 0 1.5px rgba(255,255,255,.1), inset 0 0 0 2px rgba(255,255,255,.05)`, overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 13, left: "50%", transform: "translateX(-50%)", width: 82, height: 23, background: C.ink, borderRadius: 12, zIndex: 10 }} />
                <div style={{ position: "absolute", inset: 0, borderRadius: 40, overflow: "hidden", margin: 1.5 }}>
                  <div style={{ position: "relative", height: "100%" }}>{screens[step]}</div>
                </div>
              </div>
              <div style={{ position: "absolute", bottom: -30, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
                {screens.map((_, i) => <div key={i} onClick={() => setStep(i)} style={{ width: i === step ? 20 : 6, height: 6, borderRadius: 4, background: i === step ? C.indigo : "rgba(90,94,234,.3)", transition: "all .3s", cursor: "pointer" }} />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── REMOTE PATIENT MONITORING ──────────────────────────────────────────
function RemoteMonitoring() {
  const [ref, visible] = useInView();
  const flow = [["users", "Patient"], ["cloud", "Cloud"], ["brain", "AI"], ["stethoscope", "Doctor Dashboard"], ["alert", "Alerts"], ["doc", "Reports"]];
  return (
    <section ref={ref} style={{ padding: "130px 5vw", background: C.pearl }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <SectionHead eyebrow="Remote Patient Monitoring" title="Data moves continuously," italic="doctors act deliberately" max={600} />
        <div className="pipeline-row" style={{ gap: 6, opacity: visible ? 1 : 0, transition: "opacity .8s ease" }}>
          {flow.map(([icon, label], i) => (
            <div key={label} style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <div style={{ flex: 1, textAlign: "center", padding: "22px 10px", borderRadius: 16, background: "white", border: `1px solid ${C.line}` }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: C.lavender, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}><Icon name={icon} size={17} color={C.indigo} /></div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.navy }}>{label}</div>
              </div>
              {i < flow.length - 1 && <div className="desktop-nav" style={{ padding: "0 4px" }}><Icon name="arrowRight" size={14} color={C.muted} /></div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CONTACT SECTION ─────────────────────────────────────────────────────
function ContactSection() {
  const [ref, visible] = useInView();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", org: "", interest: "Hospital Partnership" });
  function handleSubmit() { if (!form.email) return; setSent(true); }
  const interests = ["Hospital Partnership", "Investor Inquiry", "Research Collaboration", "Press / Media", "Request Demo"];

  return (
    <section ref={ref} id="contact" style={{ padding: "160px 5vw", background: C.pearl }}>
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <div className="grid-2" style={{ gap: "6vw", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateX(-20px)", transition: "all .7s ease" }}>
            <Eyebrow>Get In Touch</Eyebrow>
            <h2 style={{ fontFamily: display, fontWeight: 500, fontSize: "clamp(30px, 3.5vw, 48px)", color: C.navy, lineHeight: 1.18, letterSpacing: "-.02em", marginBottom: 28 }}>Built for hospitals,<br />trusted by physicians</h2>
            <p style={{ fontSize: 16, color: C.steel, lineHeight: 1.8, marginBottom: 48 }}>We're seeking hospital partners, research collaborators and forward-thinking investors who believe medication timing deserves the same rigor as medication choice.</p>
            {[{ icon: "cross", label: "Hospital Partnerships", desc: "Pilot programs for cardiology and primary care departments" }, { icon: "chart", label: "Investor Relations", desc: "Seed-stage investment opportunities in precision chronotherapy" }, { icon: "flask", label: "Research Collaborations", desc: "IRB study partnerships with academic medical centers" }].map(({ icon, label, desc }) => (
              <div key={label} style={{ display: "flex", gap: 18, alignItems: "flex-start", marginBottom: 32 }}>
                <div style={{ width: 48, height: 48, borderRadius: 13, background: C.lavender, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name={icon} size={21} color={C.indigo} /></div>
                <div><div style={{ fontSize: 15, fontWeight: 700, color: C.navy, marginBottom: 5 }}>{label}</div><div style={{ fontSize: 14, color: C.steel }}>{desc}</div></div>
              </div>
            ))}
          </div>

          <div style={{ padding: "48px 44px", borderRadius: 30, background: "white", border: `1px solid ${C.line}`, boxShadow: "0 24px 64px rgba(90,94,234,.08)", opacity: visible ? 1 : 0, transform: visible ? "none" : "translateX(20px)", transition: "all .7s ease .15s" }}>
            {sent ? (
              <div style={{ textAlign: "center", padding: "44px 0" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(14,163,113,.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}><Icon name="check" size={26} color={C.emerald} sw={2.2} /></div>
                <h3 style={{ fontFamily: display, fontWeight: 500, fontSize: 28, color: C.navy, marginBottom: 14 }}>Message received.</h3>
                <p style={{ fontSize: 15, color: C.steel }}>We'll reach out within 48 hours.</p>
              </div>
            ) : (
              <>
                <h3 style={{ fontFamily: display, fontWeight: 500, fontSize: 24, color: C.navy, marginBottom: 32 }}>Request a Demo</h3>
                {[{ label: "Full Name", key: "name", placeholder: "Dr. Sarah Chen" }, { label: "Email Address", key: "email", placeholder: "sarah@hospital.org", type: "email" }, { label: "Organization", key: "org", placeholder: "Stanford Medical Center" }].map(({ label, key, placeholder, type = "text" }) => (
                  <div key={key} style={{ marginBottom: 22 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 9 }}>{label}</label>
                    <input type={type} value={form[key]} placeholder={placeholder} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                      style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: "1.5px solid rgba(10,20,38,.1)", background: C.pearl, fontSize: 14, color: C.navy, outline: "none", transition: "border-color .2s" }}
                      onFocus={e => e.target.style.borderColor = C.indigo} onBlur={e => e.target.style.borderColor = "rgba(10,20,38,.1)"} />
                  </div>
                ))}
                <div style={{ marginBottom: 32 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 9 }}>Area of Interest</label>
                  <select value={form.interest} onChange={e => setForm(p => ({ ...p, interest: e.target.value }))} style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: "1.5px solid rgba(10,20,38,.1)", background: C.pearl, fontSize: 14, color: C.navy, outline: "none" }}>
                    {interests.map(i => <option key={i}>{i}</option>)}
                  </select>
                </div>
                <button onClick={handleSubmit} style={{ width: "100%", padding: "17px", borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${C.indigo}, ${C.violet})`, color: "white", fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: `0 10px 32px rgba(90,94,234,.35)`, letterSpacing: ".01em", transition: "all .25s" }}
                  onMouseEnter={e => { e.target.style.transform = "translateY(-1px)"; e.target.style.boxShadow = `0 14px 40px rgba(90,94,234,.5)`; }}
                  onMouseLeave={e => { e.target.style.transform = "none"; e.target.style.boxShadow = `0 10px 32px rgba(90,94,234,.35)`; }}>
                  Submit Request →
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background: C.navy, padding: "80px 5vw 48px", borderTop: `1px solid ${C.lineDark}` }}>
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 48, marginBottom: 64 }}>
          <div style={{ maxWidth: 320 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 18 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg,${C.indigo},${C.violet})`, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="target" size={16} color="white" sw={1.7} /></div>
              <span style={{ color: "white", fontSize: 16, fontWeight: 700 }}>ChronoRx <span style={{ color: C.violet }}>AI</span></span>
            </div>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,.4)", lineHeight: 1.75 }}>Doctor-guided AI clinical decision support for personalized medication timing. Every recommendation requires physician review.</p>
          </div>
          <div style={{ display: "flex", gap: 56, flexWrap: "wrap" }}>
            {[{ heading: "Platform", links: ["The Brain", "Doctor Dashboard", "Patient App"] }, { heading: "Science", links: ["Scientific Foundation", "Clinical Scenarios"] }, { heading: "Company", links: ["Contact", "Privacy", "Terms"] }].map(({ heading, links }) => (
              <div key={heading}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.3)", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 22 }}>{heading}</div>
                {links.map(l => <div key={l} style={{ marginBottom: 13 }}><a href="#" style={{ fontSize: 14, color: "rgba(255,255,255,.5)", textDecoration: "none", transition: "color .2s" }} onMouseEnter={e => e.target.style.color = "white"} onMouseLeave={e => e.target.style.color = "rgba(255,255,255,.5)"}>{l}</a></div>)}
              </div>
            ))}
          </div>
        </div>
        <div style={{ borderTop: `1px solid ${C.lineDark}`, paddingTop: 30, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.25)" }}>© 2026 ChronoRx AI. Clinical decision support — not a substitute for medical judgment.</div>
          <div style={{ display: "flex", gap: 26 }}>{["Privacy", "Terms", "HIPAA Compliance"].map(l => <a key={l} href="#" style={{ fontSize: 13, color: "rgba(255,255,255,.3)", textDecoration: "none" }}>{l}</a>)}</div>
        </div>
      </div>
    </footer>
  );
}

// ─── APP ───────────────────────────────────────────────────────────────────
export default function ChronoRxAppV2() {
  return (
    <>
      <style>{globalStyles}</style>
      <Nav />
      <main>
        <Hero />
        <TrustBar />
        <ProblemSection />
        <CircadianBiologySection />
        <WhyTimingMatters />
        <WhatIsChronoRx />
        <ChronoRxBrain />
        <PatternRecognition />
        <HowChronoRxThinks />
        <AIDemo />
        <ExplainableAISection />
        <ScientificFoundation />
        <ClinicalScenarios />
        <DoctorDashboard />
        <PatientDashboard />
        <RemoteMonitoring />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
