'use client';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';

// ─── Design tokens ───────────────────────────────────────────────
const R   = '#C8102E';
const BG  = '#0A0A0C';
const C1  = '#111114';
const C2  = '#181820';
const BR  = '#22222C';
const T1  = '#F0F0F4';
const T2  = '#80808A';
const T3  = '#3A3A44';
const OK  = '#34D399';
const WN  = '#FBBF24';
const ER  = '#F87171';
const H   = "'Syne', system-ui, sans-serif";
const M   = "'DM Mono', monospace";

// ─── Static data ─────────────────────────────────────────────────
const STORES = [
  { id:1, num:'#4821', city:'Madison',    state:'WI', addr:'1847 E. Washington Ave',  mgr:'Sandra Kowalski', phone:'(608)555-0142', online:true,  alerts:0, dailyCooks:6.2, avgHold:'3h 22m', compliance:99.1 },
  { id:2, num:'#4822', city:'Madison',    state:'WI', addr:'2204 Mineral Point Rd',   mgr:'Tom Reeves',      phone:'(608)555-0198', online:true,  alerts:1, dailyCooks:5.8, avgHold:'3h 15m', compliance:97.8 },
  { id:3, num:'#4823', city:'Sun Prairie',state:'WI', addr:'115 Windsor St',          mgr:'Janice Miller',   phone:'(608)555-0221', online:true,  alerts:0, dailyCooks:4.9, avgHold:'3h 44m', compliance:100.0},
  { id:4, num:'#4824', city:'Middleton',  state:'WI', addr:'7503 University Ave',     mgr:'Chris Andersen',  phone:'(608)555-0187', online:false, alerts:2, dailyCooks:5.5, avgHold:'3h 08m', compliance:96.2 },
];

const USERS = [
  { id:1, name:'Alex Rivera',      email:'admin@wyze.io',    pass:'admin', role:'admin',      stores:[1,2,3,4], title:'System Administrator' },
  { id:2, name:'Morgan Lee',       email:'morgan@arbys.com', pass:'demo',  role:'franchisee', stores:[1,2,3,4], title:'District Franchisee'  },
  { id:3, name:'Sandra Kowalski',  email:'sandra@arbys.com', pass:'store', role:'manager',    stores:[1],       title:'Store Manager'        },
];

const COOK_INIT = [
  { id:1, name:'Top Round Roast Beef', unit:'Oven 1', op:'S. Kowalski', target:155, hold:140, elapsed:138, total:240, temp:140.4, status:'cooking' },
  { id:2, name:'Brisket Flat',         unit:'Oven 2', op:'T. Morales',  target:160, hold:140, elapsed:215, total:215, temp:141.2, status:'holding' },
  { id:3, name:'Angus Beef',           unit:'Oven 3', op:'J. Chen',     target:155, hold:140, elapsed:51,  total:235, temp:80.7,  status:'cooking' },
  { id:4, name:'Corned Beef',          unit:'Oven 4', op:'R. Davis',    target:155, hold:140, elapsed:192, total:208, temp:150.2, status:'cooking' },
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

function buildHistory() {
  const prods = ['Top Round Roast Beef','Brisket Flat','Angus Beef','Corned Beef','Turkey Breast'];
  const ops   = ['S. Kowalski','T. Morales','J. Chen','R. Davis'];
  return Array.from({ length: 14 }, (_, i) => ({
    id:   i + 1,
    prod: prods[i % 5],
    date: new Date(Date.now() - i * 4.5 * 3600000).toLocaleDateString('en-US', { month:'short', day:'numeric' }),
    start:`${(4 + Math.floor(Math.random() * 10)) % 12 || 12}:${String(Math.floor(Math.random()*6)*10).padStart(2,'0')} ${Math.random()>.5?'AM':'PM'}`,
    dur:  `${3 + Math.floor(Math.random()*2)}h ${Math.floor(Math.random()*59)}m`,
    peak: 155 + Math.floor(Math.random() * 6),
    hold: `${2 + Math.floor(Math.random()*3)}h ${Math.floor(Math.random()*59)}m`,
    op:   ops[i % 4],
    pass: Math.random() > 0.07,
  }));
}

// ─── Tiny sub-components ─────────────────────────────────────────
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
  return (
    <div style={{ background:C2, border:`1px solid ${BR}`, borderRadius:4, padding:'4px 8px', fontFamily:M, fontSize:11, color:T1 }}>
      {payload[0].value}°F
    </div>
  );
}

// ─── Cook card ───────────────────────────────────────────────────
function CookCard({ cook }) {
  const pct     = Math.min(100, (cook.elapsed / cook.total) * 100);
  const rem     = cook.total - cook.elapsed;
  const sc      = cook.status === 'holding' ? OK : cook.status === 'cooking' ? WN : ER;
  const holding = cook.status === 'holding';

  return (
    <div style={{ background:C1, border:`1px solid ${holding ? OK+'33' : BR}`, borderRadius:10, padding:18, display:'flex', flexDirection:'column', gap:12 }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <div style={{ fontFamily:H, fontWeight:700, fontSize:14, color:T1, marginBottom:3 }}>{cook.name}</div>
          <div style={{ fontSize:10, color:T2, fontFamily:M }}>{cook.unit} · {cook.op}</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:5, background:`${sc}15`, border:`1px solid ${sc}33`, borderRadius:20, padding:'3px 9px' }}>
          <div style={{ width:5, height:5, borderRadius:'50%', background:sc,
            animation: cook.status==='cooking' ? 'blink 1.8s ease-in-out infinite' : 'none' }} />
          <span style={{ fontSize:9, color:sc, letterSpacing:1.5, textTransform:'uppercase', fontFamily:M }}>{cook.status}</span>
        </div>
      </div>

      {/* Temperature */}
      <div style={{ display:'flex', alignItems:'baseline', gap:10 }}>
        <div style={{ fontFamily:H, fontWeight:800, fontSize:34, color:sc, letterSpacing:-1, lineHeight:1 }}>
          {cook.temp.toFixed(1)}°
        </div>
        <div style={{ fontFamily:M, fontSize:11 }}>
          <div style={{ color:T2 }}>Target <span style={{ color:R }}>{cook.target}°F</span></div>
          <div style={{ color:T3 }}>Hold {cook.hold}°F</div>
        </div>
      </div>

      {/* Sparkline */}
      <div style={{ height:72 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={cook.data} margin={{ top:2, right:2, bottom:2, left:0 }}>
            <YAxis domain={[35, cook.target + 6]} hide />
            <XAxis dataKey="t" hide />
            <Tooltip content={<ChartTooltip />} />
            <ReferenceLine y={cook.target} stroke={R}  strokeDasharray="3 2" strokeWidth={1} />
            <ReferenceLine y={cook.hold}   stroke={T3} strokeDasharray="2 2" strokeWidth={1} />
            <Line type="monotone" dataKey="v" stroke={sc} strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Progress bar */}
      <div>
        <div style={{ display:'flex', justifyContent:'space-between', fontFamily:M, fontSize:10, color:T2, marginBottom:5 }}>
          <span>{Math.floor(cook.elapsed/60)}h {String(Math.floor(cook.elapsed%60)).padStart(2,'0')}m elapsed</span>
          <span>{holding ? 'In hold' : `~${Math.floor(rem/60)}h ${String(Math.floor(rem%60)).padStart(2,'0')}m left`}</span>
        </div>
        <div style={{ height:3, background:C2, borderRadius:2, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${pct}%`, background:holding?OK:R, borderRadius:2, transition:'width .6s ease' }} />
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────
function Sidebar({ view, setView, user, onLogout }) {
  const links = [
    ...(user?.role !== 'manager' ? [{ id:'multi', icon:'▦', label:'All Stores' }] : []),
    { id:'store', icon:'◈', label:'Store View' },
    ...(user?.role === 'admin'   ? [{ id:'admin', icon:'⚙', label:'Admin'      }] : []),
  ];
  return (
    <div style={{ position:'fixed', left:0, top:0, bottom:0, width:196, background:C1, borderRight:`1px solid ${BR}`, display:'flex', flexDirection:'column', zIndex:200 }}>
      <div style={{ padding:'18px 15px 14px', borderBottom:`1px solid ${BR}` }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:30, height:30, background:R, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:H, fontWeight:800, fontSize:15, color:'#fff' }}>W</div>
          <div>
            <div style={{ fontFamily:H, fontWeight:700, fontSize:13, color:T1 }}>WyzeTemp</div>
            <div style={{ fontSize:9, color:T3, letterSpacing:2, textTransform:'uppercase', fontFamily:M }}>ARBY'S</div>
          </div>
        </div>
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
        <button onClick={onLogout} style={{ width:'100%', background:'transparent', border:`1px solid ${BR}`, borderRadius:5, padding:'6px', color:T2, fontSize:10, letterSpacing:.5, cursor:'pointer', fontFamily:M }}>
          Sign Out
        </button>
      </div>
    </div>
  );
}

// ─── Beef Sheet modal ─────────────────────────────────────────────
function BeefSheet({ store, cooks, onClose }) {
  const now = new Date();
  const download = () => {
    const rows = cooks.map(c => `
      <tr>
        <td>${c.name}</td><td>${c.unit}</td><td>${c.op}</td>
        <td>${c.target}°F</td>
        <td style="color:${c.temp>=c.target?'#16a34a':'#dc2626'};font-weight:700">${c.temp.toFixed(1)}°F</td>
        <td style="text-transform:uppercase;font-size:10px">${c.status}</td>
        <td>${c.hold}°F</td>
        <td>${Math.floor(c.elapsed/60)}h ${String(Math.floor(c.elapsed%60)).padStart(2,'0')}m</td>
      </tr>`).join('');
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Beef Sheet</title>
      <style>body{font-family:Arial,sans-serif;max-width:900px;margin:40px auto;color:#111}
      h1{font-size:20px}p{font-size:12px;color:#555;margin:2px 0}
      table{width:100%;border-collapse:collapse;margin-top:18px}
      th{background:#C8102E;color:#fff;padding:7px 10px;text-align:left;font-size:11px}
      td{padding:7px 10px;font-size:12px;border-bottom:1px solid #eee}
      tr:nth-child(even)td{background:#fafafa}
      .note{margin-top:18px;background:#f5f5f5;padding:12px;border-radius:4px;font-size:11px;color:#555}</style>
      </head><body>
      <h1>BEEF COOK LOG — Arby's ${store.num}</h1>
      <p>${store.addr}, ${store.city} ${store.state}</p>
      <p>Date: ${now.toLocaleDateString()} &nbsp; Printed: ${now.toLocaleTimeString()}</p>
      <table><thead><tr>
        <th>Product</th><th>Unit</th><th>Operator</th><th>Target</th>
        <th>Current Temp</th><th>Status</th><th>Hold Temp</th><th>Elapsed</th>
      </tr></thead><tbody>${rows}</tbody></table>
      <div class="note"><strong>HACCP Note:</strong> All beef must reach min 155°F (160°F brisket). Hold ≥140°F. Discard after 4h. Retain log 30+ days.</div>
      </body></html>`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([html], { type:'text/html' }));
    a.download = `beef-sheet-${store.num.replace('#','')}-${now.toISOString().split('T')[0]}.html`;
    a.click();
  };

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.78)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'#fff', color:'#111', borderRadius:12, padding:26, maxWidth:660, width:'100%', maxHeight:'86vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
          <div>
            <div style={{ fontFamily:'Georgia,serif', fontSize:19, fontWeight:700 }}>BEEF COOK LOG</div>
            <div style={{ fontSize:11, color:'#666', marginTop:2 }}>Arby's {store.num} · {store.addr}</div>
          </div>
          <div style={{ textAlign:'right', fontSize:11, color:'#888' }}>
            <div>{now.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</div>
            <div>{now.toLocaleTimeString()}</div>
          </div>
        </div>
        <table style={{ borderCollapse:'collapse', marginBottom:14, fontSize:12, width:'100%' }}>
          <thead>
            <tr style={{ background:'#C8102E', color:'#fff' }}>
              {['Product','Unit','Op','Target','Current','Status','Hold','Elapsed'].map(h => (
                <th key={h} style={{ padding:'7px 9px', textAlign:'left', fontWeight:600, fontSize:10 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cooks.map((c, i) => (
              <tr key={c.id} style={{ background: i%2===0 ? '#f9f9f9' : '#fff' }}>
                <td style={{ padding:'7px 9px', fontWeight:500 }}>{c.name}</td>
                <td style={{ padding:'7px 9px' }}>{c.unit}</td>
                <td style={{ padding:'7px 9px' }}>{c.op}</td>
                <td style={{ padding:'7px 9px' }}>{c.target}°F</td>
                <td style={{ padding:'7px 9px', fontWeight:700, color:c.temp>=c.target?'#16a34a':'#dc2626' }}>{c.temp.toFixed(1)}°F</td>
                <td style={{ padding:'7px 9px', textTransform:'uppercase', fontSize:9 }}>{c.status}</td>
                <td style={{ padding:'7px 9px' }}>{c.hold}°F</td>
                <td style={{ padding:'7px 9px' }}>{Math.floor(c.elapsed/60)}h {String(Math.floor(c.elapsed%60)).padStart(2,'0')}m</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ background:'#f5f5f5', borderRadius:5, padding:'9px 12px', fontSize:11, color:'#666', marginBottom:16 }}>
          <strong>HACCP Note:</strong> All beef must reach min 155°F (160°F brisket). Hold ≥140°F. Discard after 4h hold. Retain 30+ days.
        </div>
        <div style={{ display:'flex', gap:9, justifyContent:'flex-end' }}>
          <button onClick={onClose} style={{ background:'#eee', border:'none', borderRadius:6, padding:'8px 16px', fontSize:12, cursor:'pointer' }}>Close</button>
          <button onClick={download} style={{ background:'#C8102E', border:'none', borderRadius:6, padding:'8px 16px', color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer' }}>↓ Download</button>
        </div>
      </div>
    </div>
  );
}

// ─── Login view ───────────────────────────────────────────────────
function LoginView({ onLogin }) {
  const [email, setEmail] = useState('');
  const [pass,  setPass ] = useState('');
  const [err,   setErr  ] = useState('');

  const attempt = () => {
    const u = USERS.find(u => u.email === email && u.pass === pass);
    u ? onLogin(u) : setErr('Invalid credentials. Try a demo button below.');
  };

  return (
    <div style={{ minHeight:'100vh', background:BG, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ width:'100%', maxWidth:400 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:11, marginBottom:13 }}>
            <div style={{ width:40, height:40, background:R, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:H, fontWeight:800, fontSize:18, color:'#fff' }}>W</div>
            <div style={{ textAlign:'left' }}>
              <div style={{ fontFamily:H, fontWeight:800, fontSize:20, color:T1, letterSpacing:-.3 }}>WyzeTemp</div>
              <div style={{ fontSize:10, color:T3, letterSpacing:2, textTransform:'uppercase', fontFamily:M }}>Cook Monitoring</div>
            </div>
          </div>
          <div style={{ fontSize:10, color:T3, letterSpacing:1.5, textTransform:'uppercase', fontFamily:M }}>ARBY'S RESTAURANT GROUP</div>
        </div>

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
          <button onClick={attempt} style={{ width:'100%', background:R, border:'none', borderRadius:6, padding:'11px', color:'#fff', fontFamily:H, fontSize:13, fontWeight:700, letterSpacing:.3, cursor:'pointer' }}>
            Sign In →
          </button>
          <div style={{ borderTop:`1px solid ${BR}`, marginTop:20, paddingTop:17 }}>
            <div style={{ fontSize:10, color:T3, letterSpacing:1.5, textTransform:'uppercase', marginBottom:10, textAlign:'center', fontFamily:M }}>Demo Access</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:7 }}>
              {['admin','franchisee','manager'].map(role => (
                <button key={role} onClick={()=>onLogin(USERS.find(u=>u.role===role))}
                  style={{ background:C2, border:`1px solid ${BR}`, borderRadius:6, padding:'8px 4px', color:T2, fontSize:10, letterSpacing:.3, cursor:'pointer', fontFamily:M }}>
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

// ─── Store view ───────────────────────────────────────────────────
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
        <Stat label="Avg Hold Time"   val={store.avgHold}    sub="per batch" />
        <Stat label="Compliance Rate" val={`${store.compliance}%`} sub="30-day avg" color={OK} />
        <Stat label="Active Alerts"   val={store.alerts}     sub="right now" color={store.alerts>0?ER:T2} />
      </div>

      <div style={{ fontSize:10, color:T2, letterSpacing:1.5, textTransform:'uppercase', marginBottom:10, fontFamily:M }}>Live Cooks</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12, marginBottom:24 }}>
        {cooks.map(c => <CookCard key={c.id} cook={c} />)}
      </div>

      <div style={{ fontSize:10, color:T2, letterSpacing:1.5, textTransform:'uppercase', marginBottom:10, fontFamily:M }}>Recent Cook History</div>
      <div style={{ background:C1, border:`1px solid ${BR}`, borderRadius:10, overflow:'hidden' }}>
        <table style={{ borderCollapse:'collapse', width:'100%' }}>
          <thead>
            <tr style={{ borderBottom:`1px solid ${BR}` }}>
              {['Date','Product','Start','Duration','Peak Temp','Hold Time','Operator','Result'].map(h => (
                <th key={h} style={{ padding:'8px 12px', textAlign:'left', fontSize:9, color:T2, letterSpacing:1.5, textTransform:'uppercase', fontWeight:400, fontFamily:M }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.map((r, i) => (
              <tr key={r.id} style={{ borderBottom:`1px solid ${i===history.length-1?'transparent':BR}` }}>
                <td style={{ padding:'8px 12px', fontSize:11, color:T3, fontFamily:M }}>{r.date}</td>
                <td style={{ padding:'8px 12px', fontSize:11, color:T1, fontFamily:M }}>{r.prod}</td>
                <td style={{ padding:'8px 12px', fontSize:11, color:T2, fontFamily:M }}>{r.start}</td>
                <td style={{ padding:'8px 12px', fontSize:11, color:T2, fontFamily:M }}>{r.dur}</td>
                <td style={{ padding:'8px 12px', fontSize:11, color:r.peak>=155?OK:ER, fontFamily:M }}>{r.peak}°F</td>
                <td style={{ padding:'8px 12px', fontSize:11, color:T2, fontFamily:M }}>{r.hold}</td>
                <td style={{ padding:'8px 12px', fontSize:11, color:T2, fontFamily:M }}>{r.op}</td>
                <td style={{ padding:'8px 12px' }}>
                  <span style={{ background:r.pass?`${OK}15`:`${ER}15`, border:`1px solid ${r.pass?OK+'33':ER+'33'}`, borderRadius:20, padding:'2px 9px', fontSize:9, color:r.pass?OK:ER, letterSpacing:1.5, fontFamily:M }}>
                    {r.pass ? 'PASS' : 'FAIL'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Multi-store view ─────────────────────────────────────────────
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
        <Stat label="Online Now"     val={online}        sub="active"    color={OK} />
        <Stat label="Active Alerts"  val={alerts}        sub="all stores" color={alerts>0?ER:T2} />
        <Stat label="Avg Compliance" val={`${avgComp}%`} sub="30-day"    color={OK} />
      </div>
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
                  {s.online ? 'Online' : 'Offline'}
                </div>
                {s.alerts > 0 && (
                  <div style={{ background:`${ER}15`, border:`1px solid ${ER}33`, borderRadius:20, padding:'2px 8px', fontSize:9, color:ER, fontFamily:M }}>
                    {s.alerts} alert{s.alerts>1?'s':''}
                  </div>
                )}
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:13 }}>
              {['Daily Cooks','Avg Hold','Compliance'].map((label, idx) => (
                <div key={label} style={{ background:C2, borderRadius:6, padding:'7px 9px' }}>
                  <div style={{ fontSize:9, color:T3, letterSpacing:1, textTransform:'uppercase', marginBottom:4, fontFamily:M }}>{label}</div>
                  <div style={{ fontSize:12, color:T1, fontFamily:M }}>{[s.dailyCooks, s.avgHold, `${s.compliance}%`][idx]}</div>
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

// ─── Admin view ───────────────────────────────────────────────────
function AdminView() {
  const systems = [
    ['API Gateway','Operational',OK], ['Data Sync','Operational',OK],
    ['Alert Engine','Operational',OK], ['PDF Service','Operational',OK],
    ['Azure Backup','Syncing',WN], ['Firmware OTA','Ready',T2],
  ];
  return (
    <div style={{ padding:22, maxWidth:1060 }}>
      <div style={{ fontFamily:H, fontWeight:800, fontSize:23, color:T1, letterSpacing:-.5, marginBottom:3 }}>Administration</div>
      <div style={{ fontSize:12, color:T2, fontFamily:M, marginBottom:22 }}>System config · User management · Thresholds</div>

      <div style={{ fontSize:10, color:T2, letterSpacing:1.5, textTransform:'uppercase', marginBottom:10, fontFamily:M }}>Cook Thresholds</div>
      <div style={{ background:C1, border:`1px solid ${BR}`, borderRadius:10, padding:19, marginBottom:20 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
          {[['Beef Target Temp','155°F','USDA minimum'],['Holding Temperature','140°F','Safe hold minimum'],['Max Hold Time','4h 00m','Before discard']].map(([l,v,n]) => (
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
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:9 }}>
        {systems.map(([label, status, color]) => (
          <div key={label} style={{ background:C1, border:`1px solid ${BR}`, borderRadius:8, padding:'10px 13px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ fontSize:11, color:T1, fontFamily:M }}>{label}</div>
            <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color, fontFamily:M }}>
              <div style={{ width:5, height:5, borderRadius:'50%', background:color }} />{status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────
export default function App() {
  const [view,    setView   ] = useState('login');
  const [user,    setUser   ] = useState(null);
  const [store,   setStore  ] = useState(STORES[0]);
  const [sheet,   setSheet  ] = useState(false);
  const [history             ] = useState(buildHistory);
  const [cooks,   setCooks  ] = useState(() =>
    COOK_INIT.map(c => ({ ...c, data: buildCookData(c.elapsed, c.target) }))
  );

  // Live cook simulation
  useEffect(() => {
    if (view !== 'store') return;
    const iv = setInterval(() => {
      setCooks(prev => prev.map(c => {
        if (c.status === 'holding') {
          const t = Math.max(140, Math.min(142.5, c.temp + (Math.random() - 0.5) * 0.25));
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
        <div style={{ flex:1, marginLeft:196, overflow:'auto', minHeight:'100vh' }}>
          {view === 'store' && <StoreView store={store} cooks={cooks} history={history} onBeefSheet={() => setSheet(true)} />}
          {view === 'multi' && <MultiView stores={STORES} user={user} onSelect={setStore} setView={setView} />}
          {view === 'admin' && <AdminView />}
        </div>
      </div>
      {sheet && <BeefSheet store={store} cooks={cooks} onClose={() => setSheet(false)} />}
    </>
  );
}