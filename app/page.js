'use client';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';

const R  = '#C8102E';
const BG = '#0A0A0C';
const C1 = '#111114';
const C2 = '#181820';
const BR = '#22222C';
const T1 = '#F0F0F4';
const T2 = '#80808A';
const T3 = '#3A3A44';
const OK = '#34D399';
const WN = '#FBBF24';
const ER = '#F87171';
const H  = "'Syne', system-ui, sans-serif";
const M  = "'DM Mono', monospace";

// ── Store coordinates for USA map (SVG space 700x420) ────────────
const STORES = [
  { id:1, num:'#4821', city:'Madison',     state:'WI', addr:'1847 E. Washington Ave', mgr:'Sandra Kowalski', phone:'(608)555-0142', online:true,  alerts:0, dailyCooks:6.2, avgDwell:'3h 22m', compliance:99.1,  mapX:498, mapY:152 },
  { id:2, num:'#4822', city:'Madison',     state:'WI', addr:'2204 Mineral Point Rd',  mgr:'Tom Reeves',      phone:'(608)555-0198', online:true,  alerts:1, dailyCooks:5.8, avgDwell:'3h 15m', compliance:97.8,  mapX:494, mapY:158 },
  { id:3, num:'#7984', city:'Newcastle',   state:'OK', addr:'901 NW 32nd St',         mgr:'Janice Miller',   phone:'(405)555-0221', online:true,  alerts:0, dailyCooks:4.9, avgDwell:'3h 44m', compliance:100.0, mapX:400, mapY:258 },
  { id:4, num:'#4824', city:'Middleton',   state:'WI', addr:'7503 University Ave',    mgr:'Chris Andersen',  phone:'(608)555-0187', online:false, alerts:2, dailyCooks:5.5, avgDwell:'3h 08m', compliance:96.2,  mapX:491, mapY:155 },
];

const USERS = [
  { id:1, name:'Dave Pulvermacher', email:'admin@wyze.io',              pass:'admin', role:'admin',      stores:[1,2,3,4], title:'System Administrator' },
  { id:2, name:'Morgan Lee',        email:'morgan@arbys.com',           pass:'demo',  role:'franchisee', stores:[1,2],     title:'District Franchisee'  },
  { id:3, name:'Sandra Kowalski',   email:'sandra@arbys.com',           pass:'store', role:'manager',    stores:[1],       title:'Store Manager'        },
  { id:4, name:'Dominic Johnson',   email:'dkjohnson@inspirebrands.com',pass:'admin', role:'admin',      stores:[1,2,3,4], title:'Innovation Lead'      },
];

// ── Equipment data per store ──────────────────────────────────────
const EQUIPMENT = {
  1: {
    controller: { mac:'A4:CF:12:7B:3E:01', fw:'v2.4.1', updating:false },
    probes: [
      { id:'7B:3E:01', cooks:187, since:'Jan 12, 2024' },
      { id:'7B:3E:02', cooks:184, since:'Jan 12, 2024' },
      { id:'7B:3E:03', cooks:179, since:'Jan 14, 2024' },
      { id:'7B:3E:04', cooks:182, since:'Jan 13, 2024' },
      { id:'7B:3E:05', cooks:175, since:'Jan 18, 2024' },
      { id:'7B:3E:06', cooks:171, since:'Jan 22, 2024' },
      { id:'7B:3E:07', cooks:168, since:'Jan 25, 2024' },
      { id:'7B:3E:08', cooks:165, since:'Feb 01, 2024' },
      { id:'7B:3E:09', cooks:158, since:'Feb 08, 2024' },
      { id:'7B:3E:0A', cooks:143, since:'Feb 22, 2024' },
    ],
  },
  2: {
    controller: { mac:'A4:CF:12:9C:2A:11', fw:'v2.3.8', updating:false },
    probes: [
      { id:'9C:2A:11', cooks:201, since:'Jan 05, 2024' },
      { id:'9C:2A:12', cooks:198, since:'Jan 05, 2024' },
      { id:'9C:2A:13', cooks:194, since:'Jan 07, 2024' },
      { id:'9C:2A:14', cooks:190, since:'Jan 09, 2024' },
      { id:'9C:2A:15', cooks:185, since:'Jan 12, 2024' },
      { id:'9C:2A:16', cooks:180, since:'Jan 15, 2024' },
      { id:'9C:2A:17', cooks:174, since:'Jan 20, 2024' },
      { id:'9C:2A:18', cooks:169, since:'Jan 26, 2024' },
      { id:'9C:2A:19', cooks:152, since:'Feb 10, 2024' },
      { id:'9C:2A:1A', cooks:138, since:'Feb 28, 2024' },
    ],
  },
  3: {
    controller: { mac:'A4:CF:12:4D:8F:21', fw:'v2.4.1', updating:false },
    probes: [
      { id:'4D:8F:21', cooks:162, since:'Jan 20, 2024' },
      { id:'4D:8F:22', cooks:159, since:'Jan 20, 2024' },
      { id:'4D:8F:23', cooks:155, since:'Jan 22, 2024' },
      { id:'4D:8F:24', cooks:151, since:'Jan 25, 2024' },
      { id:'4D:8F:25', cooks:148, since:'Jan 28, 2024' },
      { id:'4D:8F:26', cooks:144, since:'Feb 01, 2024' },
      { id:'4D:8F:27', cooks:139, since:'Feb 05, 2024' },
      { id:'4D:8F:28', cooks:133, since:'Feb 12, 2024' },
      { id:'4D:8F:29', cooks:121, since:'Feb 25, 2024' },
      { id:'4D:8F:2A', cooks:108, since:'Mar 10, 2024' },
    ],
  },
  4: {
    controller: { mac:'A4:CF:12:F1:5C:31', fw:'v2.3.5', updating:false },
    probes: [
      { id:'F1:5C:31', cooks:145, since:'Jan 30, 2024' },
      { id:'F1:5C:32', cooks:141, since:'Jan 30, 2024' },
      { id:'F1:5C:33', cooks:138, since:'Feb 02, 2024' },
      { id:'F1:5C:34', cooks:134, since:'Feb 05, 2024' },
      { id:'F1:5C:35', cooks:129, since:'Feb 09, 2024' },
      { id:'F1:5C:36', cooks:124, since:'Feb 14, 2024' },
      { id:'F1:5C:37', cooks:118, since:'Feb 20, 2024' },
      { id:'F1:5C:38', cooks:111, since:'Feb 28, 2024' },
      { id:'F1:5C:39', cooks:98,  since:'Mar 14, 2024' },
      { id:'F1:5C:3A', cooks:82,  since:'Apr 01, 2024' },
    ],
  },
};

const COOK_INIT = [
  { id:1, name:'BEEF 001', unit:'Oven 1', op:'S. Kowalski', target:138, hold:140, elapsed:138, total:240, temp:104,   status:'cooking', probeId:'7B:3E:01' },
  { id:2, name:'BEEF 002', unit:'Oven 2', op:'T. Morales',  target:138, hold:140, elapsed:215, total:215, temp:141.2, status:'holding', probeId:'7B:3E:02' },
  { id:3, name:'BEEF 003', unit:'Oven 3', op:'J. Chen',     target:138, hold:140, elapsed:51,  total:235, temp:80.7,  status:'cooking', probeId:'7B:3E:03' },
  { id:4, name:'BEEF 004', unit:'Oven 4', op:'R. Davis',    target:138, hold:140, elapsed:192, total:208, temp:150.2, status:'holding', probeId:'7B:3E:04' },
];

function buildCookData(elapsed, target) {
  const pts = [];
  for (let i = 0; i <= elapsed; i++) {
    const prog = i / 260;
    const raw  = 38 + (target - 38) * (1 - Math.exp(-prog * 3.9));
    pts.push({ t: i, v: +(raw + (Math.random() - 0.5) * 1.1).toFixed(1) });
  }
  return pts;
}

// ── Finished cook history (for beef sheet popup) ──────────────────
function buildHistory() {
  const probes = ['7B:3E:01','7B:3E:02','7B:3E:03','7B:3E:04','7B:3E:05','7B:3E:06'];
  return Array.from({ length: 14 }, (_, i) => {
    const startHour  = 4 + Math.floor(Math.random() * 8);
    const startMin   = Math.floor(Math.random() * 6) * 10;
    const durMins    = 180 + Math.floor(Math.random() * 60);
    const endHour    = Math.floor((startHour * 60 + startMin + durMins) / 60) % 24;
    const endMin     = (startMin + durMins) % 60;
    const fmt = (h, m) => `${h % 12 || 12}:${String(m).padStart(2,'0')} ${h < 12 ? 'AM' : 'PM'}`;
    const dwellMins  = 120 + Math.floor(Math.random() * 120);
    return {
      id:       i + 1,
      beefNum:  `BEEF ${String(i + 1).padStart(3,'0')}`,
      date:     new Date(Date.now() - i * 4.5 * 3600000).toLocaleDateString('en-US', { month:'short', day:'numeric' }),
      start:    fmt(startHour, startMin),
      end:      fmt(endHour, endMin),
      dur:      `${Math.floor(durMins/60)}h ${String(durMins%60).padStart(2,'0')}m`,
      maxTemp:  136 + Math.floor(Math.random() * 8),
      dwell:    `${Math.floor(dwellMins/60)}h ${String(dwellMins%60).padStart(2,'0')}m`,
      probeId:  probes[i % probes.length],
      pass:     Math.random() > 0.07,
    };
  });
}

// ── Logo bar ──────────────────────────────────────────────────────
function LogoBar({ size = 'normal' }) {
  const h = size === 'small' ? 28 : 40;
  return (
    <div style={{ display:'flex', alignItems:'center', gap: size==='small'?10:16 }}>
      <img src="/WyzeTemp_LOGO.png" alt="WyzeTemp" style={{ height:h, width:'auto', objectFit:'contain', display:'block' }} />
      <div style={{ width:1, height:h*0.7, background:BR, flexShrink:0 }} />
      <img src="/arbys_logo.png"    alt="Arby's"   style={{ height:h, width:'auto', objectFit:'contain', display:'block' }} />
    </div>
  );
}

function Stat({ label, val, sub, color }) {
  return (
    <div style={{ background:C1, border:`1px solid ${BR}`, borderRadius:8, padding:'13px 15px' }}>
      <div style={{ fontSize:10, color:T2, letterSpacing:1.5, textTransform:'uppercase', marginBottom:7, fontFamily:M }}>{label}</div>
      <div style={{ fontFamily:H, fontWeight:700, fontSize:22, color:color||T1 }}>{val}</div>
      {sub && <div style={{ fontSize:10, color:T3, marginTop:3, fontFamily:M }}>{sub}</div>}
    </div>
  );
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return <div style={{ background:C2, border:`1px solid ${BR}`, borderRadius:4, padding:'4px 8px', fontFamily:M, fontSize:11, color:T1 }}>{payload[0].value}°F</div>;
}

// ── Cook card ─────────────────────────────────────────────────────
function CookCard({ cook }) {
  const pct     = Math.min(100, (cook.elapsed / cook.total) * 100);
  const rem     = cook.total - cook.elapsed;
  const sc      = cook.status === 'holding' ? OK : cook.status === 'cooking' ? WN : ER;
  const holding = cook.status === 'holding';
  return (
    <div style={{ background:C1, border:`1px solid ${holding?OK+'33':BR}`, borderRadius:10, padding:18, display:'flex', flexDirection:'column', gap:12 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <div style={{ fontFamily:H, fontWeight:700, fontSize:14, color:T1, marginBottom:3 }}>{cook.name}</div>
          <div style={{ fontSize:10, color:T2, fontFamily:M }}>{cook.unit} · {cook.op} · Probe {cook.probeId}</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:5, background:`${sc}15`, border:`1px solid ${sc}33`, borderRadius:20, padding:'3px 9px' }}>
          <div style={{ width:5, height:5, borderRadius:'50%', background:sc, animation:cook.status==='cooking'?'blink 1.8s ease-in-out infinite':'none' }} />
          <span style={{ fontSize:9, color:sc, letterSpacing:1.5, textTransform:'uppercase', fontFamily:M }}>{cook.status}</span>
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'baseline', gap:10 }}>
        <div style={{ fontFamily:H, fontWeight:800, fontSize:34, color:sc, letterSpacing:-1, lineHeight:1 }}>{cook.temp.toFixed(1)}°</div>
        <div style={{ fontFamily:M, fontSize:11 }}>
          <div style={{ color:T2 }}>Target <span style={{ color:R }}>{cook.target}°F</span></div>
          <div style={{ color:T3 }}>Dwell starts at {cook.target}°F</div>
        </div>
      </div>
      <div style={{ height:72 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={cook.data} margin={{ top:2, right:2, bottom:2, left:0 }}>
            <YAxis domain={[35, cook.target+6]} hide />
            <XAxis dataKey="t" hide />
            <Tooltip content={<ChartTooltip />} />
            <ReferenceLine y={cook.target} stroke={R}  strokeDasharray="3 2" strokeWidth={1} />
            <Line type="monotone" dataKey="v" stroke={sc} strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div>
        <div style={{ display:'flex', justifyContent:'space-between', fontFamily:M, fontSize:10, color:T2, marginBottom:5 }}>
          <span>{Math.floor(cook.elapsed/60)}h {String(Math.floor(cook.elapsed%60)).padStart(2,'0')}m elapsed</span>
          <span>{holding ? 'Dwell running' : `~${Math.floor(rem/60)}h ${String(Math.floor(rem%60)).padStart(2,'0')}m left`}</span>
        </div>
        <div style={{ height:3, background:C2, borderRadius:2, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${pct}%`, background:holding?OK:R, borderRadius:2, transition:'width .6s ease' }} />
        </div>
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────
function Sidebar({ view, setView, user, onLogout }) {
  const links = [
    ...(user?.role !== 'manager' ? [{ id:'multi', icon:'▦', label:'All Stores' }] : []),
    { id:'store', icon:'◈', label:'Store View' },
    ...(user?.role === 'admin'   ? [{ id:'admin', icon:'⚙', label:'Admin'      }] : []),
  ];
  return (
    <div style={{ position:'fixed', left:0, top:0, bottom:0, width:210, background:C1, borderRight:`1px solid ${BR}`, display:'flex', flexDirection:'column', zIndex:200 }}>
      <div style={{ padding:'16px 14px', borderBottom:`1px solid ${BR}` }}>
        <LogoBar size="small" />
      </div>
      <nav style={{ flex:1, padding:'10px 7px' }}>
        {links.map(l => (
          <button key={l.id} onClick={() => setView(l.id)} style={{
            width:'100%', display:'flex', alignItems:'center', gap:9, padding:'9px 10px',
            borderRadius:6, border:'none', marginBottom:2, textAlign:'left', fontSize:12,
            letterSpacing:.2, fontFamily:M, cursor:'pointer',
            background: view===l.id ? `${R}22` : 'transparent',
            color:      view===l.id ? R        : T2,
          }}>
            <span style={{ fontSize:13, opacity:.8 }}>{l.icon}</span>{l.label}
          </button>
        ))}
      </nav>
      <div style={{ padding:'11px 13px', borderTop:`1px solid ${BR}` }}>
        <div style={{ fontSize:11, color:T1, marginBottom:1, fontFamily:M }}>{user?.name}</div>
        <div style={{ fontSize:10, color:T3, marginBottom:10, fontFamily:M }}>{user?.title}</div>
        <button onClick={onLogout} style={{ width:'100%', background:'transparent', border:`1px solid ${BR}`, borderRadius:5, padding:'6px', color:T2, fontSize:10, cursor:'pointer', fontFamily:M }}>Sign Out</button>
      </div>
    </div>
  );
}

// ── Beef Sheet popup — finished cooks only ────────────────────────
function BeefSheet({ store, history, onClose }) {
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.78)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'#fff', color:'#111', borderRadius:12, padding:26, maxWidth:820, width:'100%', maxHeight:'88vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:18 }}>
          <div>
            <div style={{ fontFamily:'Georgia,serif', fontSize:19, fontWeight:700 }}>BEEF COOK LOG</div>
            <div style={{ fontSize:11, color:'#666', marginTop:2 }}>Arby's {store.num} · {store.addr} · {store.city}, {store.state}</div>
            <div style={{ fontSize:11, color:'#888', marginTop:1 }}>Completed cooks — {new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</div>
          </div>
          <button onClick={onClose} style={{ background:'#eee', border:'none', borderRadius:6, padding:'6px 12px', fontSize:12, cursor:'pointer' }}>✕ Close</button>
        </div>
        <table style={{ borderCollapse:'collapse', width:'100%', fontSize:12 }}>
          <thead>
            <tr style={{ background:'#C8102E', color:'#fff' }}>
              {['Beef #','Date','Start','End','Duration','Max Temp','Dwell Time','Probe ID',''].map(h => (
                <th key={h} style={{ padding:'7px 10px', textAlign:'left', fontWeight:600, fontSize:10, whiteSpace:'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.map((r, i) => (
              <tr key={r.id} style={{ background:i%2===0?'#f9f9f9':'#fff', borderBottom:'1px solid #eee' }}>
                <td style={{ padding:'7px 10px', fontWeight:600 }}>{r.beefNum}</td>
                <td style={{ padding:'7px 10px', color:'#555' }}>{r.date}</td>
                <td style={{ padding:'7px 10px' }}>{r.start}</td>
                <td style={{ padding:'7px 10px' }}>{r.end}</td>
                <td style={{ padding:'7px 10px' }}>{r.dur}</td>
                <td style={{ padding:'7px 10px', fontWeight:700, color:r.maxTemp>=138?'#16a34a':'#dc2626' }}>{r.maxTemp}°F</td>
                <td style={{ padding:'7px 10px' }}>{r.dwell}</td>
                <td style={{ padding:'7px 10px', fontSize:10, color:'#777', fontFamily:'monospace' }}>{r.probeId}</td>
                <td style={{ padding:'7px 10px' }}>
                  <a href="/arbys-beef-sheet.pdf" download={`beef-${r.beefNum.replace(' ','-')}.pdf`}
                    style={{ background:'#C8102E', color:'#fff', border:'none', borderRadius:5, padding:'4px 10px', fontSize:10, fontWeight:600, cursor:'pointer', textDecoration:'none', whiteSpace:'nowrap' }}>
                    ↓ PDF
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop:14, background:'#f5f5f5', borderRadius:5, padding:'9px 12px', fontSize:11, color:'#666' }}>
          <strong>HACCP Note:</strong> Dwell timer starts when internal temp reaches 138°F. Hold ≥140°F. Discard after 4h dwell. Retain records 30+ days.
        </div>
      </div>
    </div>
  );
}

// ── Equipment panel (store-level) ─────────────────────────────────
function EquipmentPanel({ storeId }) {
  const [eq, setEq] = useState(() => JSON.parse(JSON.stringify(EQUIPMENT[storeId] || EQUIPMENT[1])));
  const triggerUpdate = () => {
    setEq(prev => ({ ...prev, controller: { ...prev.controller, updating:true } }));
    setTimeout(() => setEq(prev => ({ ...prev, controller: { ...prev.controller, fw:'v2.4.1', updating:false } })), 3000);
  };
  const needsUpdate = eq.controller.fw !== 'v2.4.1';
  return (
    <div style={{ marginTop:28 }}>
      <div style={{ fontSize:10, color:T2, letterSpacing:1.5, textTransform:'uppercase', marginBottom:10, fontFamily:M }}>WyzeTemp Equipment</div>
      {/* Controller */}
      <div style={{ background:C1, border:`1px solid ${BR}`, borderRadius:10, padding:16, marginBottom:12 }}>
        <div style={{ fontSize:10, color:T2, letterSpacing:1.2, textTransform:'uppercase', marginBottom:10, fontFamily:M }}>Controller</div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ display:'flex', gap:32 }}>
            <div>
              <div style={{ fontSize:9, color:T3, letterSpacing:1, textTransform:'uppercase', fontFamily:M, marginBottom:3 }}>MAC Address</div>
              <div style={{ fontSize:12, color:T1, fontFamily:M }}>{eq.controller.mac}</div>
            </div>
            <div>
              <div style={{ fontSize:9, color:T3, letterSpacing:1, textTransform:'uppercase', fontFamily:M, marginBottom:3 }}>Firmware</div>
              <div style={{ fontSize:12, color:needsUpdate?WN:OK, fontFamily:M }}>{eq.controller.fw}{needsUpdate?' ⚠':' ✓'}</div>
            </div>
          </div>
          <button onClick={triggerUpdate} disabled={!needsUpdate||eq.controller.updating} style={{
            background: eq.controller.updating?C2:(needsUpdate?WN:'transparent'),
            border:`1px solid ${needsUpdate?WN:BR}`, borderRadius:6, padding:'7px 14px',
            color: eq.controller.updating?T2:(needsUpdate?BG:T3),
            fontSize:11, fontFamily:M, cursor:needsUpdate?'pointer':'default',
          }}>
            {eq.controller.updating ? 'Updating...' : needsUpdate ? '↑ Update' : 'Up to date'}
          </button>
        </div>
      </div>
      {/* Probes */}
      <div style={{ background:C1, border:`1px solid ${BR}`, borderRadius:10, overflow:'hidden' }}>
        <div style={{ padding:'10px 14px', borderBottom:`1px solid ${BR}` }}>
          <span style={{ fontSize:10, color:T2, letterSpacing:1.2, textTransform:'uppercase', fontFamily:M }}>Probes ({eq.probes.length})</span>
        </div>
        <table style={{ borderCollapse:'collapse', width:'100%' }}>
          <thead>
            <tr style={{ borderBottom:`1px solid ${BR}` }}>
              {['Probe ID','Total Cooks','In Service Since'].map(h => (
                <th key={h} style={{ padding:'7px 14px', textAlign:'left', fontSize:9, color:T2, letterSpacing:1.5, textTransform:'uppercase', fontWeight:400, fontFamily:M }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {eq.probes.map((p, i) => (
              <tr key={p.id} style={{ borderBottom:`1px solid ${i===eq.probes.length-1?'transparent':BR}` }}>
                <td style={{ padding:'7px 14px', fontSize:11, color:T1, fontFamily:M }}>{p.id}</td>
                <td style={{ padding:'7px 14px', fontSize:11, color:T2, fontFamily:M }}>{p.cooks}</td>
                <td style={{ padding:'7px 14px', fontSize:11, color:T3, fontFamily:M }}>{p.since}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Login ─────────────────────────────────────────────────────────
function LoginView({ onLogin }) {
  const [email, setEmail] = useState('');
  const [pass,  setPass ] = useState('');
  const [err,   setErr  ] = useState('');
  const attempt = () => {
    const u = USERS.find(u => u.email===email && u.pass===pass);
    u ? onLogin(u) : setErr('Invalid credentials. Try a demo button below.');
  };
  return (
    <div style={{ minHeight:'100vh', background:BG, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ width:'100%', maxWidth:400 }}>
        <div style={{ display:'flex', justifyContent:'center', marginBottom:32 }}><LogoBar size="normal" /></div>
        <div style={{ background:C1, border:`1px solid ${BR}`, borderRadius:12, padding:26 }}>
          <div style={{ marginBottom:15 }}>
            <label style={{ display:'block', fontSize:10, color:T2, letterSpacing:1.5, textTransform:'uppercase', marginBottom:7, fontFamily:M }}>Email</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&attempt()} placeholder="you@arbys.com"
              style={{ width:'100%', background:BG, border:`1px solid ${BR}`, borderRadius:6, padding:'10px 13px', color:T1, fontFamily:M, fontSize:12, outline:'none' }} />
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={{ display:'block', fontSize:10, color:T2, letterSpacing:1.5, textTransform:'uppercase', marginBottom:7, fontFamily:M }}>Password</label>
            <input type="password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&attempt()}
              style={{ width:'100%', background:BG, border:`1px solid ${BR}`, borderRadius:6, padding:'10px 13px', color:T1, fontFamily:M, fontSize:12, outline:'none' }} />
          </div>
          {err && <div style={{ background:`${ER}12`, border:`1px solid ${ER}33`, borderRadius:5, padding:'7px 11px', color:ER, fontSize:11, marginBottom:14, fontFamily:M }}>{err}</div>}
          <button onClick={attempt} style={{ width:'100%', background:R, border:'none', borderRadius:6, padding:'11px', color:'#fff', fontFamily:H, fontSize:13, fontWeight:700, cursor:'pointer' }}>Sign In →</button>
          <div style={{ borderTop:`1px solid ${BR}`, marginTop:20, paddingTop:17 }}>
            <div style={{ fontSize:10, color:T3, letterSpacing:1.5, textTransform:'uppercase', marginBottom:10, textAlign:'center', fontFamily:M }}>Demo Access</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:7 }}>
              {['admin','franchisee','manager'].map(role => (
                <button key={role} onClick={()=>onLogin(USERS.find(u=>u.role===role))}
                  style={{ background:C2, border:`1px solid ${BR}`, borderRadius:6, padding:'8px 4px', color:T2, fontSize:10, cursor:'pointer', fontFamily:M }}>
                  {role.charAt(0).toUpperCase()+role.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ textAlign:'center', marginTop:16, fontSize:10, color:T3, fontFamily:M }}>WyzeTemp v2.1 · HACCP Compliant</div>
      </div>
    </div>
  );
}

// ── Store view ────────────────────────────────────────────────────
function StoreView({ store, cooks, history, onBeefSheet }) {
  return (
    <div style={{ padding:22, maxWidth:1200 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
        <div>
          <div style={{ fontFamily:H, fontWeight:800, fontSize:23, color:T1, letterSpacing:-.5 }}>Arby's {store.num}</div>
          <div style={{ fontSize:12, color:T2, fontFamily:M, marginTop:3 }}>{store.addr} · {store.city}, {store.state}</div>
          <div style={{ fontSize:11, color:T3, fontFamily:M, marginTop:2 }}>Mgr: {store.mgr} · {store.phone}</div>
        </div>
        <div style={{ display:'flex', gap:11, alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:OK, fontFamily:M }}>
            <div style={{ width:6, height:6, background:OK, borderRadius:'50%', animation:'blink 1.8s ease-in-out infinite' }} />
            Live · {new Date().toLocaleTimeString()}
          </div>
          <button onClick={onBeefSheet} style={{ background:R, border:'none', borderRadius:6, padding:'8px 14px', color:'#fff', fontFamily:H, fontSize:12, fontWeight:700, cursor:'pointer' }}>
            ↓ Beef Sheet
          </button>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:20 }}>
        <Stat label="Avg Daily Cooks" val={store.dailyCooks} sub="cooks / day" />
        <Stat label="Avg Dwell Time"  val={store.avgDwell}   sub="per batch" />
        <Stat label="Compliance Rate" val={`${store.compliance}%`} sub="30-day avg" color={OK} />
        <Stat label="Active Alerts"   val={store.alerts}     sub="right now" color={store.alerts>0?ER:T2} />
      </div>

      <div style={{ fontSize:10, color:T2, letterSpacing:1.5, textTransform:'uppercase', marginBottom:10, fontFamily:M }}>Live Cooks</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12, marginBottom:24 }}>
        {cooks.map(c => <CookCard key={c.id} cook={c} />)}
      </div>

      <div style={{ fontSize:10, color:T2, letterSpacing:1.5, textTransform:'uppercase', marginBottom:10, fontFamily:M }}>Recent Cook History</div>
      <div style={{ background:C1, border:`1px solid ${BR}`, borderRadius:10, overflow:'hidden', marginBottom:4 }}>
        <table style={{ borderCollapse:'collapse', width:'100%' }}>
          <thead>
            <tr style={{ borderBottom:`1px solid ${BR}` }}>
              {['Beef #','Date','Start','End','Duration','Max Temp','Dwell Time','Probe ID','Result'].map(h => (
                <th key={h} style={{ padding:'8px 12px', textAlign:'left', fontSize:9, color:T2, letterSpacing:1.5, textTransform:'uppercase', fontWeight:400, fontFamily:M }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.map((r, i) => (
              <tr key={r.id} style={{ borderBottom:`1px solid ${i===history.length-1?'transparent':BR}` }}>
                <td style={{ padding:'8px 12px', fontSize:11, color:T1, fontFamily:M, fontWeight:600 }}>{r.beefNum}</td>
                <td style={{ padding:'8px 12px', fontSize:11, color:T3, fontFamily:M }}>{r.date}</td>
                <td style={{ padding:'8px 12px', fontSize:11, color:T2, fontFamily:M }}>{r.start}</td>
                <td style={{ padding:'8px 12px', fontSize:11, color:T2, fontFamily:M }}>{r.end}</td>
                <td style={{ padding:'8px 12px', fontSize:11, color:T2, fontFamily:M }}>{r.dur}</td>
                <td style={{ padding:'8px 12px', fontSize:11, color:r.maxTemp>=138?OK:ER, fontFamily:M }}>{r.maxTemp}°F</td>
                <td style={{ padding:'8px 12px', fontSize:11, color:T2, fontFamily:M }}>{r.dwell}</td>
                <td style={{ padding:'8px 12px', fontSize:10, color:T3, fontFamily:M }}>{r.probeId}</td>
                <td style={{ padding:'8px 12px' }}>
                  <span style={{ background:r.pass?`${OK}15`:`${ER}15`, border:`1px solid ${r.pass?OK+'33':ER+'33'}`, borderRadius:20, padding:'2px 9px', fontSize:9, color:r.pass?OK:ER, letterSpacing:1.5, fontFamily:M }}>
                    {r.pass?'PASS':'FAIL'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EquipmentPanel storeId={store.id} />
    </div>
  );
}

// ── USA Map with store dots ───────────────────────────────────────
function USAMap({ stores, onSelect, setView }) {
  const [hovered, setHovered] = useState(null);
  // Simplified USA SVG outline path
  const usa = "M108,73 L112,58 L130,52 L148,48 L160,44 L178,42 L192,44 L200,50 L210,48 L224,44 L238,42 L252,44 L262,50 L272,52 L282,48 L294,44 L310,42 L326,44 L338,50 L348,52 L358,48 L372,46 L388,48 L400,52 L410,56 L418,62 L422,70 L426,78 L428,88 L426,96 L422,104 L418,110 L412,116 L408,124 L406,132 L408,140 L412,148 L418,154 L422,160 L424,168 L422,176 L418,182 L412,186 L404,190 L396,194 L388,198 L380,204 L374,210 L368,216 L360,220 L350,222 L338,222 L326,220 L314,218 L302,218 L290,220 L278,222 L266,222 L254,220 L242,216 L232,212 L222,208 L212,206 L202,206 L192,208 L182,212 L172,216 L162,218 L150,218 L140,216 L132,212 L124,206 L118,200 L112,194 L108,188 L106,180 L106,172 L108,164 L110,156 L110,148 L108,140 L106,132 L106,124 L108,116 L110,108 L110,100 L108,92 L108,82 Z";

  return (
    <div style={{ background:C1, border:`1px solid ${BR}`, borderRadius:10, padding:18, marginBottom:20 }}>
      <div style={{ fontSize:10, color:T2, letterSpacing:1.5, textTransform:'uppercase', marginBottom:12, fontFamily:M }}>Store Locations</div>
      <div style={{ position:'relative' }}>
        <svg viewBox="0 0 540 280" width="100%" style={{ display:'block' }}>
          {/* USA fill */}
          <path d={usa} fill={C2} stroke={BR} strokeWidth="1" />
          {/* Alaska suggestion */}
          <rect x="90" y="210" width="60" height="40" rx="4" fill={C2} stroke={BR} strokeWidth="0.5" opacity="0.5"/>
          <text x="120" y="234" textAnchor="middle" style={{ fontSize:7, fill:T3, fontFamily:M }}>AK</text>
          {/* Hawaii suggestion */}
          <rect x="165" y="220" width="40" height="22" rx="4" fill={C2} stroke={BR} strokeWidth="0.5" opacity="0.5"/>
          <text x="185" y="234" textAnchor="middle" style={{ fontSize:7, fill:T3, fontFamily:M }}>HI</text>

          {/* State label hints */}
          <text x="498" y="162" textAnchor="middle" style={{ fontSize:8, fill:T3, fontFamily:M }}>WI</text>
          <text x="400" y="272" textAnchor="middle" style={{ fontSize:8, fill:T3, fontFamily:M }}>OK</text>

          {/* Store dots */}
          {stores.map(s => (
            <g key={s.id} style={{ cursor:'pointer' }}
              onClick={() => { onSelect(s); setView('store'); }}
              onMouseEnter={() => setHovered(s.id)}
              onMouseLeave={() => setHovered(null)}>
              {/* Pulse ring */}
              {s.online && (
                <circle cx={s.mapX} cy={s.mapY} r="10" fill="none" stroke={R} strokeWidth="1" opacity={hovered===s.id?0.6:0.25} />
              )}
              <circle cx={s.mapX} cy={s.mapY} r="5"
                fill={s.online ? R : T3}
                stroke={hovered===s.id ? '#fff' : C1}
                strokeWidth="1.5" />
              {/* Tooltip on hover */}
              {hovered===s.id && (
                <g>
                  <rect x={s.mapX+10} y={s.mapY-28} width={130} height={38} rx="4" fill={C1} stroke={BR} strokeWidth="0.5"/>
                  <text x={s.mapX+16} y={s.mapY-12} style={{ fontSize:9, fill:T1, fontFamily:'system-ui', fontWeight:600 }}>Arby's {s.num}</text>
                  <text x={s.mapX+16} y={s.mapY+2}  style={{ fontSize:8, fill:T2, fontFamily:'system-ui' }}>{s.city}, {s.state}</text>
                </g>
              )}
            </g>
          ))}
        </svg>
        {/* Legend */}
        <div style={{ display:'flex', gap:16, marginTop:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, color:T2, fontFamily:M }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:R }} /> Online
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, color:T2, fontFamily:M }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:T3 }} /> Offline
          </div>
          <div style={{ fontSize:10, color:T3, fontFamily:M, marginLeft:'auto' }}>Click a dot to open store</div>
        </div>
      </div>
    </div>
  );
}

// ── Multi-store view ──────────────────────────────────────────────
function MultiView({ stores, user, onSelect, setView }) {
  const online  = stores.filter(s => s.online).length;
  const alerts  = stores.reduce((a, s) => a + s.alerts, 0);
  const avgComp = (stores.reduce((a, s) => a + s.compliance, 0) / stores.length).toFixed(1);
  return (
    <div style={{ padding:22, maxWidth:1200 }}>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontFamily:H, fontWeight:800, fontSize:23, color:T1, letterSpacing:-.5 }}>Operations Overview</div>
        <div style={{ fontSize:12, color:T2, fontFamily:M, marginTop:3 }}>{user.name} · {stores.length} locations</div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:22 }}>
        <Stat label="Locations"      val={stores.length} sub="total" />
        <Stat label="Online Now"     val={online}        sub="active"     color={OK} />
        <Stat label="Active Alerts"  val={alerts}        sub="all stores" color={alerts>0?ER:T2} />
        <Stat label="Avg Compliance" val={`${avgComp}%`} sub="30-day"    color={OK} />
      </div>

      <USAMap stores={stores} onSelect={onSelect} setView={setView} />

      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12 }}>
        {stores.map(s => (
          <div key={s.id} style={{ background:C1, border:`1px solid ${s.alerts>0?ER+'44':s.online?BR:T3+'55'}`, borderRadius:10, padding:19 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:13 }}>
              <div>
                <div style={{ fontFamily:H, fontWeight:700, fontSize:16, color:T1 }}>Arby's {s.num}</div>
                <div style={{ fontSize:11, color:T2, fontFamily:M, marginTop:2 }}>{s.addr}</div>
                <div style={{ fontSize:10, color:T3, fontFamily:M, marginTop:1 }}>{s.city}, {s.state}</div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:5 }}>
                <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, color:s.online?OK:T3, fontFamily:M }}>
                  <div style={{ width:5, height:5, borderRadius:'50%', background:s.online?OK:T3 }} />
                  {s.online?'Online':'Offline'}
                </div>
                {s.alerts>0 && (
                  <div style={{ background:`${ER}15`, border:`1px solid ${ER}33`, borderRadius:20, padding:'2px 8px', fontSize:9, color:ER, fontFamily:M }}>
                    {s.alerts} alert{s.alerts>1?'s':''}
                  </div>
                )}
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:13 }}>
              {['Daily Cooks','Avg Dwell','Compliance'].map((label, idx) => (
                <div key={label} style={{ background:C2, borderRadius:6, padding:'7px 9px' }}>
                  <div style={{ fontSize:9, color:T3, letterSpacing:1, textTransform:'uppercase', marginBottom:4, fontFamily:M }}>{label}</div>
                  <div style={{ fontSize:12, color:T1, fontFamily:M }}>{[s.dailyCooks, s.avgDwell, `${s.compliance}%`][idx]}</div>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ fontSize:11, color:T2, fontFamily:M }}>Mgr: {s.mgr}</div>
              <button onClick={() => { onSelect(s); setView('store'); }}
                style={{ background:R, border:'none', borderRadius:6, padding:'6px 13px', color:'#fff', fontFamily:H, fontSize:11, fontWeight:700, cursor:'pointer' }}>
                View →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Admin view ────────────────────────────────────────────────────
function AdminView() {
  const [equipment, setEquipment] = useState(() => JSON.parse(JSON.stringify(EQUIPMENT)));
  const triggerUpdate = (storeId) => {
    setEquipment(prev => ({ ...prev, [storeId]: { ...prev[storeId], controller: { ...prev[storeId].controller, updating:true } } }));
    setTimeout(() => setEquipment(prev => ({ ...prev, [storeId]: { ...prev[storeId], controller: { ...prev[storeId].controller, fw:'v2.4.1', updating:false } } })), 3000);
  };
  const systems = [
    ['API Gateway','Operational',OK], ['Data Sync','Operational',OK],
    ['Alert Engine','Operational',OK], ['PDF Service','Operational',OK],
    ['Azure Backup','Syncing',WN],    ['Firmware OTA','Ready',T2],
  ];
  return (
    <div style={{ padding:22, maxWidth:1060 }}>
      <div style={{ fontFamily:H, fontWeight:800, fontSize:23, color:T1, letterSpacing:-.5, marginBottom:3 }}>Administration</div>
      <div style={{ fontSize:12, color:T2, fontFamily:M, marginBottom:22 }}>System config · User management · Thresholds</div>

      <div style={{ fontSize:10, color:T2, letterSpacing:1.5, textTransform:'uppercase', marginBottom:10, fontFamily:M }}>Cook Thresholds</div>
      <div style={{ background:C1, border:`1px solid ${BR}`, borderRadius:10, padding:19, marginBottom:20 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
          {[['Beef Target Temp','138°F','Dwell trigger'],['Holding Temperature','140°F','Safe hold minimum'],['Max Hold Time','4h 00m','Before discard']].map(([l,v,n]) => (
            <div key={l}>
              <div style={{ fontSize:10, color:T2, letterSpacing:1, textTransform:'uppercase', marginBottom:6, fontFamily:M }}>{l}</div>
              <div style={{ fontFamily:H, fontSize:22, fontWeight:700, color:R, marginBottom:3 }}>{v}</div>
              <div style={{ fontSize:10, color:T3, fontFamily:M }}>{n}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ fontSize:10, color:T2, letterSpacing:1.5, textTransform:'uppercase', marginBottom:10, fontFamily:M }}>Users</div>
      <div style={{ background:C1, border:`1px solid ${BR}`, borderRadius:10, overflow:'hidden', marginBottom:20 }}>
        <table style={{ borderCollapse:'collapse', width:'100%' }}>
          <thead>
            <tr style={{ borderBottom:`1px solid ${BR}` }}>
              {['Name','Email','Role','Stores','Status'].map(h => (
                <th key={h} style={{ padding:'8px 12px', textAlign:'left', fontSize:9, color:T2, letterSpacing:1.5, textTransform:'uppercase', fontWeight:400, fontFamily:M }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {USERS.map((u, i) => (
              <tr key={u.id} style={{ borderBottom:`1px solid ${i===USERS.length-1?'transparent':BR}` }}>
                <td style={{ padding:'8px 12px', fontSize:11, color:T1, fontFamily:M }}>{u.name}</td>
                <td style={{ padding:'8px 12px', fontSize:11, color:T2, fontFamily:M }}>{u.email}</td>
                <td style={{ padding:'8px 12px' }}>
                  <span style={{ background:`${R}15`, border:`1px solid ${R}33`, borderRadius:20, padding:'2px 9px', fontSize:9, color:R, letterSpacing:1.5, fontFamily:M, textTransform:'uppercase' }}>{u.role}</span>
                </td>
                <td style={{ padding:'8px 12px', fontSize:11, color:T2, fontFamily:M }}>{u.stores.length} stores</td>
                <td style={{ padding:'8px 12px' }}>
                  <span style={{ background:`${OK}15`, border:`1px solid ${OK}33`, borderRadius:20, padding:'2px 9px', fontSize:9, color:OK, letterSpacing:1.5, fontFamily:M }}>Active</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ fontSize:10, color:T2, letterSpacing:1.5, textTransform:'uppercase', marginBottom:10, fontFamily:M }}>System Status</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:9, marginBottom:28 }}>
        {systems.map(([label, status, color]) => (
          <div key={label} style={{ background:C1, border:`1px solid ${BR}`, borderRadius:8, padding:'10px 13px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ fontSize:11, color:T1, fontFamily:M }}>{label}</div>
            <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color, fontFamily:M }}>
              <div style={{ width:5, height:5, borderRadius:'50%', background:color }} />{status}
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontSize:10, color:T2, letterSpacing:1.5, textTransform:'uppercase', marginBottom:14, fontFamily:M }}>WyzeTemp Equipment — All Stores</div>
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        {STORES.map(s => {
          const eq = equipment[s.id];
          if (!eq) return null;
          const needsUpdate = eq.controller.fw !== 'v2.4.1';
          return (
            <div key={s.id} style={{ background:C1, border:`1px solid ${BR}`, borderRadius:10, overflow:'hidden' }}>
              {/* Store header */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', borderBottom:`1px solid ${BR}`, background:C2 }}>
                <div>
                  <span style={{ fontFamily:H, fontWeight:700, fontSize:14, color:T1 }}>Arby's {s.num}</span>
                  <span style={{ fontSize:11, color:T2, fontFamily:M, marginLeft:12 }}>{s.city}, {s.state}</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, color:s.online?OK:T3, fontFamily:M }}>
                  <div style={{ width:5, height:5, borderRadius:'50%', background:s.online?OK:T3 }} />
                  {s.online?'Online':'Offline'}
                </div>
              </div>
              <div style={{ padding:'14px 16px' }}>
                {/* Controller row */}
                <div style={{ display:'flex', alignItems:'center', gap:24, marginBottom:14, paddingBottom:14, borderBottom:`1px solid ${BR}` }}>
                  <div style={{ fontSize:9, color:T3, textTransform:'uppercase', letterSpacing:1, fontFamily:M, minWidth:70 }}>Controller</div>
                  <div style={{ fontSize:11, color:T1, fontFamily:M }}>{eq.controller.mac}</div>
                  <div style={{ fontSize:11, color:needsUpdate?WN:OK, fontFamily:M }}>{eq.controller.fw}{needsUpdate?' ⚠':' ✓'}</div>
                  <button onClick={() => triggerUpdate(s.id)} disabled={!needsUpdate||eq.controller.updating} style={{
                    marginLeft:'auto', background:eq.controller.updating?C2:(needsUpdate?WN:'transparent'),
                    border:`1px solid ${needsUpdate?WN:BR}`, borderRadius:5, padding:'5px 12px',
                    color:eq.controller.updating?T2:(needsUpdate?BG:T3), fontSize:10, fontFamily:M, cursor:needsUpdate?'pointer':'default',
                  }}>
                    {eq.controller.updating?'Updating...':needsUpdate?'↑ Update':'Up to date'}
                  </button>
                </div>
                {/* Probes grid */}
                <div style={{ fontSize:9, color:T3, textTransform:'uppercase', letterSpacing:1, fontFamily:M, marginBottom:8 }}>
                  Probes ({eq.probes.length})
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:6 }}>
                  {eq.probes.map(p => (
                    <div key={p.id} style={{ background:C2, borderRadius:6, padding:'7px 9px' }}>
                      <div style={{ fontSize:10, color:T1, fontFamily:M, marginBottom:2 }}>{p.id}</div>
                      <div style={{ fontSize:9, color:T3, fontFamily:M }}>{p.cooks} cooks</div>
                      <div style={{ fontSize:9, color:T3, fontFamily:M }}>{p.since}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Root App ──────────────────────────────────────────────────────
export default function App() {
  const [view,   setView  ] = useState('login');
  const [user,   setUser  ] = useState(null);
  const [store,  setStore ] = useState(STORES[0]);
  const [sheet,  setSheet ] = useState(false);
  const [history          ] = useState(buildHistory);
  const [cooks,  setCooks ] = useState(() =>
    COOK_INIT.map(c => ({ ...c, data: buildCookData(c.elapsed, c.target) }))
  );

  useEffect(() => {
    if (view !== 'store') return;
    const iv = setInterval(() => {
      setCooks(prev => prev.map(c => {
        if (c.status === 'holding') {
          const t = Math.max(138, Math.min(140.5, c.temp + (Math.random() - 0.5) * 0.25));
          return { ...c, temp: +t.toFixed(1) };
        }
        if (c.status === 'cooking') {
          const prog = c.elapsed / c.total;
          const inc  = prog < 0.7 ? 0.22 + Math.random() * 0.32 : 0.07 + Math.random() * 0.12;
          const t    = Math.min(c.target, c.temp + inc);
          const data = [...c.data, { t: c.data.length, v: +t.toFixed(1) }];
          if (data.length > 85) data.splice(0, 1);
          return { ...c, temp: +t.toFixed(1), elapsed: c.elapsed + 0.05, data, status: t >= c.target ? 'holding' : 'cooking' };
        }
        return c;
      }));
    }, 1100);
    return () => clearInterval(iv);
  }, [view]);

  const handleLogin = (u) => {
    setUser(u);
    setView(u.role === 'manager' ? 'store' : 'multi');
  };

  if (view === 'login') return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:wght@300;400;500&display=swap');*{box-sizing:border-box;margin:0;padding:0}body{background:#0A0A0C}@keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}`}</style>
      <LoginView onLogin={handleLogin} />
    </>
  );

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:wght@300;400;500&display=swap');*{box-sizing:border-box;margin:0;padding:0}body{background:#0A0A0C;color:#F0F0F4}@keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}table{border-collapse:collapse;width:100%}`}</style>
      <div style={{ minHeight:'100vh', background:BG, display:'flex' }}>
        <Sidebar view={view} setView={setView} user={user} onLogout={() => { setUser(null); setView('login'); }} />
        <div style={{ flex:1, marginLeft:210, overflow:'auto', minHeight:'100vh' }}>
          {view === 'store' && <StoreView store={store} cooks={cooks} history={history} onBeefSheet={() => setSheet(true)} />}
          {view === 'multi' && <MultiView stores={STORES} user={user} onSelect={setStore} setView={setView} />}
          {view === 'admin' && <AdminView />}
        </div>
      </div>
      {sheet && <BeefSheet store={store} history={history} onClose={() => setSheet(false)} />}
    </>
  );
}
