import { useState, useEffect, useRef } from 'react';
import './_group.css';

/* ── Organ attachment points on the specimen body ─────────
   Creature is wide/barrel-shaped, head on right.
   CSS top/left are % of .specimen-body (display:inline-block).
   x/y are the same in pixel space for a 250×320 SVG viewBox.
──────────────────────────────────────────────────────── */
const ORGAN_ATTACH_POINTS = [
  { top: '12%', left: '42%', x:105, y: 38 }, // back-top
  { top:  '6%', left: '72%', x:180, y: 19 }, // head-top
  { top: '46%', left:  '8%', x: 20, y:147 }, // flank-left
  { top: '44%', left: '92%', x:230, y:141 }, // flank-right
  { top: '74%', left: '46%', x:115, y:237 }, // belly
  { top: '82%', left: '78%', x:195, y:262 }, // haunch
] as const;

// Cable landing points toward creature centre (~125, 160)
const CABLE_TARGETS = [
  { x:125, y:110 }, { x:155, y: 80 }, { x: 80, y:155 },
  { x:170, y:150 }, { x:125, y:180 }, { x:155, y:210 },
];

function cablePath(i:number): string {
  const a = ORGAN_ATTACH_POINTS[i], b = CABLE_TARGETS[i];
  return `M${a.x} ${a.y} Q${(a.x+b.x)/2} ${(a.y+b.y)/2} ${b.x} ${b.y}`;
}
import logoUrl   from './logo-frankenapp.png';
import tankUrl   from './specimen-tank-empty.png';
import fondoUrl  from './fondo-mutlab.png';
import { organImages } from './organImages';
import { DNAIntake } from './DNAIntake';
import type { AppDNA, BaseSpecimen } from './specimenData';
import { DrScopeAssistant } from '../DrScopeAssistant';
import type { DrScopeEvent } from '../DrScopeAssistant';

/* ── organ definitions ──────────────────────────────────── */
type Organ = { name:string; short:string; num:string; detail:string; img:string; complexity:number };
const organs: Organ[] = [
  { name:'AUTH',          short:'AUTH',          num:'01', detail:'identity shard',   img:organImages[0],  complexity:8  },
  { name:'PAYMENTS',      short:'PAYMENTS',      num:'02', detail:'transaction vein', img:organImages[1],  complexity:14 },
  { name:'AI',            short:'AI',            num:'03', detail:'neural graft',     img:organImages[2],  complexity:22 },
  { name:'CHAT',          short:'CHAT',          num:'04', detail:'voice channel',    img:organImages[3],  complexity:11 },
  { name:'ANALYTICS',     short:'ANALYTICS',     num:'05', detail:'pattern optic',   img:organImages[4],  complexity:17 },
  { name:'NOTIFICATIONS', short:'NOTIFICATIONS', num:'06', detail:'alarm gland',      img:organImages[5],  complexity:9  },
  { name:'DATABASE',      short:'DATABASE',      num:'07', detail:'data vault',       img:organImages[6],  complexity:10 },
  { name:'SEARCH',        short:'SEARCH',        num:'08', detail:'radar pulse',      img:organImages[7],  complexity:8  },
  { name:'MAPS',          short:'MAPS',          num:'09', detail:'spatial lobe',     img:organImages[8],  complexity:12 },
  { name:'UPLOADS',       short:'UPLOADS',       num:'10', detail:'intake duct',      img:organImages[9],  complexity:7  },
  { name:'CAMERA',        short:'CAMERA',        num:'11', detail:'sight bulb',       img:organImages[10], complexity:9  },
  { name:'VOICE',         short:'VOICE',         num:'12', detail:'audio larynx',     img:organImages[11], complexity:11 },
  { name:'REALTIME',      short:'REALTIME',      num:'13', detail:'pulse bridge',     img:organImages[12], complexity:15 },
  { name:'SUBSCRIPTIONS', short:'SUBS',          num:'14', detail:'revenue organ',    img:organImages[13], complexity:13 },
  { name:'PROFILES',      short:'PROFILES',      num:'15', detail:'identity core',   img:organImages[14], complexity:8  },
  { name:'MODERATION',    short:'MODERATION',    num:'16', detail:'filter gland',     img:organImages[15], complexity:10 },
];
const VISIBLE = 5;

/* ── per-organ ticket copy ──────────────────────────────── */
type TicketData = { alert:string; title:string; pct:string; story:string };
const ticketCopy: Record<string,TicketData> = {
  PAYMENTS:      { alert:'NEW ORGAN DETECTED',        title:'PAYMENT SYSTEM',         pct:'+14%', story:'It grew a hand for taking money. Refunds may cause biting.'        },
  AI:            { alert:'NEURAL GRAFT DETECTED',     title:'ARTIFICIAL INTELLIGENCE', pct:'+22%', story:'It can think now. This has not improved its attitude.'             },
  CHAT:          { alert:'VOICE CHANNEL DETECTED',    title:'CHAT SYSTEM',            pct:'+11%', story:'It developed a mouth before learning when to stop talking.'         },
  ANALYTICS:     { alert:'OPTIC CLUSTER DETECTED',    title:'ANALYTICS',              pct:'+17%', story:'It sees every click. Unfortunately, it also judges them.'          },
  NOTIFICATIONS: { alert:'ALARM GLAND DETECTED',      title:'NOTIFICATIONS',          pct:'+9%',  story:'It will now scream whenever anything happens.'                     },
  AUTH:          { alert:'IDENTITY SHARD DETECTED',   title:'AUTH SYSTEM',            pct:'+8%',  story:'It knows who you are. It has opinions about this.'                 },
  DATABASE:      { alert:'MEMORY CORE DETECTED',      title:'DATABASE',               pct:'+10%', story:'It will remember everything. Including the things you regret.'     },
  SEARCH:        { alert:'PROBE EYE DETECTED',        title:'SEARCH',                 pct:'+8%',  story:'It can find anything now. You cannot hide from it.'                },
  MAPS:          { alert:'SPATIAL LOBE DETECTED',     title:'MAPS / LOCATION',        pct:'+12%', story:'It knows where you are. It always knew.'                           },
  UPLOADS:       { alert:'INTAKE DUCT DETECTED',      title:'UPLOADS / FILES',        pct:'+7%',  story:'It accepts files. It does not promise what it does with them.'     },
  CAMERA:        { alert:'SIGHT BULB DETECTED',       title:'CAMERA',                 pct:'+9%',  story:'It can see you now. Wave hello.'                                   },
  VOICE:         { alert:'AUDIO LARYNX DETECTED',     title:'VOICE',                  pct:'+11%', story:'It grew a voice. No one taught it about volume control.'           },
  REALTIME:      { alert:'PULSE BRIDGE DETECTED',     title:'REALTIME SYNC',          pct:'+15%', story:'It responds instantly. To absolutely everything. Always.'          },
  SUBSCRIPTIONS: { alert:'REVENUE ORGAN DETECTED',    title:'SUBSCRIPTIONS',          pct:'+13%', story:'It found a way to charge monthly. It seems very pleased.'          },
  PROFILES:      { alert:'IDENTITY CORE DETECTED',    title:'PROFILES',               pct:'+8%',  story:'It remembers each user individually. This complicates everything.' },
  MODERATION:    { alert:'FILTER GLAND DETECTED',     title:'MODERATION',             pct:'+10%', story:'It decides what is acceptable. The criteria are unclear.'          },
};


/* ── generation messages ────────────────────────────────── */
const GEN_MESSAGES = [
  'EXTRACTING CATEGORY TRAITS…',
  'SEQUENCING PRODUCT DNA…',
  'GROWING BASE ORGANISM…',
  'TEACHING IT TO BLINK…',
  'CHECKING FOR UNEXPECTED LIMBS…',
  'REGRETTING EVERYTHING…',
  'SPECIMEN STABLE-ISH.',
];

/* ── helpers ────────────────────────────────────────────── */
function complexityLabel(pct:number) {
  if (pct<=20) return 'CUTE';
  if (pct<=40) return 'HEALTHY';
  if (pct<=60) return 'QUESTIONABLE';
  if (pct<=80) return 'CURSED';
  return 'FRANKENAPP';
}

function Rivet({ top,right,bottom,left }:{ top?:number|string; right?:number|string; bottom?:number|string; left?:number|string }) {
  return <span className="instrument-screw" style={{top,right,bottom,left}}/>;
}
function Led({ color='#17C9C2', anim='cyan-pulse 2s ease-in-out infinite', size=8 }:{ color?:string; anim?:string; size?:number }) {
  return <span style={{display:'inline-block',width:size,height:size,borderRadius:'50%',background:color,animation:anim,flexShrink:0}}/>;
}

/* mote positions inside chamber area */
const MOTES = [
  {x:595,y:320,s:.55,d:0   },{x:660,y:260,s:.7, d:1.2},{x:730,y:350,s:.5, d:2.1},
  {x:780,y:295,s:.65,d:.7  },{x:630,y:410,s:.45,d:3.1},{x:820,y:370,s:.6, d:1.8},
  {x:695,y:470,s:.5, d:2.6 },{x:760,y:430,s:.55,d:.4 },
];

/* steam emitter positions (approximate pipe locations in the BG) */
const STEAMS = [
  {x:248,y:358},{x:1192,y:325},
];

/* ═══════════════════════════════════════════════════════ */
export function MutationLab({ onReplayIntro }: { onReplayIntro?: () => void }) {
  /* ── core state ────────────────────────────────────── */
  const [selectedOrgans,   setSelectedOrgans]   = useState<Set<string>>(new Set());
  const [installedOrgans,  setInstalledOrgans]  = useState<Set<string>>(new Set());
  const [mutating,         setMutating]         = useState(false);
  const [mutPhase,         setMutPhase]         = useState(0);       // 0 idle 1 dim 2 elec 3 pulse 4 accepted
  const [mutationAccepted, setMutationAccepted] = useState(false);
  const [previewOrgan,     setPreviewOrgan]     = useState<string|null>(null);
  const [saved,            setSaved]            = useState(false);
  const [trayPage,         setTrayPage]         = useState(0);
  const [hoveredOrgan,     setHoveredOrgan]     = useState<string|null>(null);
  const [scale,            setScale]            = useState(1);
  const [reducedMotion,    setReducedMotion]    = useState(false);

  /* ── DNA intake state ──────────────────────────────── */
  const [dnaPhase,     setDnaPhase]     = useState<'intake'|'generating'|'ready'>('intake');
  const [appDNA,       setAppDNA]       = useState<AppDNA|null>(null);
  const [baseSpecimen, setBaseSpecimen] = useState<BaseSpecimen|null>(null);
  const [specimenIn,   setSpecimenIn]   = useState(false);
  const [genMsgIdx,    setGenMsgIdx]    = useState(-1);
  const [genActive,    setGenActive]    = useState(false);

  /* ── Dr. Scope events ──────────────────────────────── */
  const [drScopeEvent, setDrScopeEvent] = useState<DrScopeEvent|null>(null);
  const scopeDispatch = (type: string) => setDrScopeEvent({ type, ts: Date.now() });
  const prevCxRange = useRef(-1);

  /* ── Mutate video overlay ───────────────────────────── */
  const [showMutateVideo, setShowMutateVideo] = useState(false);
  const mutateVideoRef = useRef<HTMLVideoElement>(null);

  /* ── Ambient music ──────────────────────────────────── */
  const ambientRef  = useRef<HTMLAudioElement>(null);
  const [musicMuted, setMusicMuted] = useState(false);
  const [musicVol,   setMusicVol]   = useState(0.20);


  const handleDNAComplete = (dna: AppDNA, spec: BaseSpecimen) => {
    setAppDNA(dna);
    setBaseSpecimen(spec);
    setDnaPhase('generating');

    // Reduced-motion: skip full sequence
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTimeout(() => { setSpecimenIn(true); setDnaPhase('ready'); }, 600);
      return;
    }

    setGenActive(true);
    // ~700 ms per message → 7 messages × 700 = 4900 ms total
    const msgTimes = [700, 1400, 2100, 2800, 3500, 4200, 4900];
    msgTimes.forEach((t, i) => setTimeout(() => setGenMsgIdx(i), t));
    setTimeout(() => setSpecimenIn(true), 5600);   // reveal after last msg + 700ms
    setTimeout(() => {
      setGenActive(false);
      setGenMsgIdx(-1);
      setDnaPhase('ready');
    }, 6400);
  };

  /* ── effects ───────────────────────────────────────── */
  useEffect(() => {
    // scale
    function calcScale() { setScale(Math.min(window.innerWidth/1440, window.innerHeight/900)); }
    calcScale();
    window.addEventListener('resize', calcScale);

    // reduce-motion
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mql.matches);
    const onMQL = (e:MediaQueryListEvent) => setReducedMotion(e.matches);
    mql.addEventListener('change', onMQL);

    return () => {
      window.removeEventListener('resize', calcScale);
      mql.removeEventListener('change', onMQL);
    };
  }, []);

  /* ── Ambient music effects ─────────────────────────── */
  // Autoplay on mount (requires prior user gesture — fires after first click)
  useEffect(() => {
    const a = ambientRef.current;
    if (!a) return;
    a.volume = musicVol;
    a.play().catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Pause while video overlay is showing; resume when it closes
  useEffect(() => {
    const a = ambientRef.current;
    if (!a) return;
    if (showMutateVideo) {
      a.pause();
    } else if (!musicMuted) {
      a.play().catch(() => {});
    }
  }, [showMutateVideo]); // eslint-disable-line react-hooks/exhaustive-deps

  // Apply mute / volume changes live
  useEffect(() => {
    const a = ambientRef.current;
    if (!a) return;
    a.volume  = musicMuted ? 0 : musicVol;
    a.muted   = musicMuted;
    if (!musicMuted && a.paused && !showMutateVideo) a.play().catch(() => {});
  }, [musicMuted, musicVol]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Dr. Scope: event dispatches ──────────────────── */
  // lab entry
  useEffect(() => { scopeDispatch('lab_entry'); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // dnaPhase changes
  useEffect(() => {
    if (dnaPhase === 'generating') scopeDispatch('dna_opened');
    if (dnaPhase === 'ready')      scopeDispatch('specimen_revealed');
  }, [dnaPhase]); // eslint-disable-line react-hooks/exhaustive-deps
  // complexity range changes
  useEffect(() => {
    if (complexityPct === 0) return;
    const range = Math.min(4, Math.floor((complexityPct - 1) / 20));
    if (range !== prevCxRange.current) {
      prevCxRange.current = range;
      scopeDispatch(`complexity_${range}`);
    }
  }); // re-run every render; guard above prevents excess fires

  /* ── derived ───────────────────────────────────────── */
  const maxPage        = organs.length - VISIBLE;
  const visibleOrgans  = organs.slice(trayPage, trayPage + VISIBLE);
  const firstSelected  = [...selectedOrgans][0] ?? null;
  const hasSelection   = selectedOrgans.size > 0;
  const complexityPct  = Math.min(100,
    [...installedOrgans].reduce((sum,n) => sum + (organs.find(o=>o.name===n)?.complexity ?? 8), 0)
  );
  const cLabel     = complexityLabel(complexityPct);
  const needleRot  = -90 + complexityPct * 1.8;
  const ticket     = firstSelected
    ? (ticketCopy[firstSelected] ?? {
        alert:'ORGAN DETECTED', title:firstSelected,
        pct:`+${organs.find(o=>o.name===firstSelected)?.complexity??8}%`,
        story:'Unknown biological material detected. Laboratory staff have been notified.',
      })
    : null;
  const mutateState: 'unarmed'|'armed'|'mutating'|'accepted' =
    mutating ? 'mutating' : mutationAccepted ? 'accepted' : hasSelection ? 'armed' : 'unarmed';

  /* hovered organ tray x position for cable pulse */
  const hovIdx = visibleOrgans.findIndex(o => o.name === hoveredOrgan);
  const cableStartX = hovIdx >= 0 ? 588 + hovIdx * 114 : 720;
  const cableStartY = 746;

  /* ── mutate sequence ───────────────────────────────── */
  const mutate = () => {
    if (!hasSelection || mutating || mutationAccepted) return;
    const toInstall = new Set(selectedOrgans);

    setMutating(true);
    scopeDispatch('mutation_started');
    setMutPhase(1);                               // dim + beacon flash

    setTimeout(() => setMutPhase(2), 260);        // electricity
    setTimeout(() => setMutPhase(3), 660);        // chamber scan pulse
    setTimeout(() => {                            // install organs
      setInstalledOrgans(prev => { const s=new Set(prev); toInstall.forEach(n=>s.add(n)); return s; });
      setSelectedOrgans(new Set());
      setPreviewOrgan(null);
    }, 960);
    setTimeout(() => {                            // accepted state
      setMutPhase(4);
      setMutating(false);
      setMutationAccepted(true);
    }, 1250);
    setTimeout(() => setMutPhase(0), 1700);
    setTimeout(() => setMutationAccepted(false), 4200);
  };

  /* ── handlers ──────────────────────────────────────── */
  const toggleOrgan = (n:string) => setSelectedOrgans(prev => {
    const s=new Set(prev); s.has(n)?s.delete(n):s.add(n); return s;
  });
  const previewOrganAction = (n:string) => {
    setPreviewOrgan(prev => prev===n ? null : n);
    setSelectedOrgans(prev => { const s=new Set(prev); s.add(n); return s; });
    scopeDispatch(`organ_${n}`);
  };
  const navTray = (dir:1|-1) => setTrayPage(p => {
    if (dir===1) return p>=maxPage?0:p+1;
    return p<=0?maxPage:p-1;
  });

  const previewData = previewOrgan ? organs.find(o=>o.name===previewOrgan) : null;

  return (
    <div style={{width:'100vw',height:'100vh',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center',background:'#090909'}}>
    <div
      className={`mutation-lab ${mutating?'mutating':''}`}
      style={{width:'1440px',height:'900px',position:'relative',overflow:'hidden',background:'#11110F',transformOrigin:'center center',transform:`scale(${scale})`,flexShrink:0}}
    >

      {/* ── AMBIENT MUSIC (hidden audio element, looping) ── */}
      <audio ref={ambientRef} src="/ambient.mp3" loop preload="auto"/>

      {/* ── AMBIENT MUSIC CONTROL — top-right corner ── */}
      <div style={{
        position:'absolute', right:16, top:16, zIndex:20,
        display:'flex', alignItems:'center', gap:10,
        background:'#11110F',
        border:'3px solid #2A2015',
        boxShadow:'4px 4px 0 #080807',
        padding:'8px 14px',
      }}>
        <button
          onClick={() => setMusicMuted(m => !m)}
          title={musicMuted ? 'Activar música' : 'Silenciar'}
          style={{
            background:'none', border:'none', cursor:'pointer',
            color: musicMuted ? '#4A4038' : '#17C9C2',
            fontSize:18, padding:0, lineHeight:1,
            transition:'color .2s',
            textShadow: musicMuted ? 'none' : '0 0 8px rgba(23,201,194,.6)',
          }}
        >
          {musicMuted ? '🔇' : '🔊'}
        </button>
        <input
          type="range" min={0} max={1} step={0.02}
          value={musicMuted ? 0 : musicVol}
          onChange={e => {
            const v = parseFloat(e.target.value);
            setMusicVol(v > 0 ? v : 0.01);
            setMusicMuted(v === 0);
          }}
          style={{ width:80, accentColor:'#17C9C2', cursor:'pointer', verticalAlign:'middle' }}
        />
        <span className="mono" style={{
          fontSize:9, letterSpacing:2, color:'#17C9C2', userSelect:'none', fontWeight:700,
        }}>AMBIENT</span>
      </div>

      {/* ── VIDEO OVERLAY — plays on Analyze DNA, dismissed only via SKIP ── */}
      <video
        ref={mutateVideoRef}
        src="/mutate.mp4"
        playsInline
        onEnded={() => setShowMutateVideo(false)}
        style={{
          position:'absolute', inset:0,
          width:'100%', height:'100%',
          objectFit:'cover',
          zIndex:80,
          opacity: showMutateVideo ? 1 : 0,
          pointerEvents: showMutateVideo ? 'none' : 'none',
          transition:'opacity .25s ease',
        }}
      />
      {/* SKIP VIDEO button — only way to dismiss */}
      {showMutateVideo && (
        <button
          onClick={() => { setShowMutateVideo(false); if (mutateVideoRef.current) mutateVideoRef.current.pause(); }}
          style={{
            position:'absolute', bottom:36, right:48, zIndex:81,
            background:'rgba(8,7,5,.78)', border:'2px solid #E8DDC4',
            color:'#E8DDC4', fontFamily:"'IBM Plex Mono',monospace",
            fontSize:10, fontWeight:700, letterSpacing:3,
            padding:'8px 20px', cursor:'pointer',
            backdropFilter:'blur(4px)',
            transition:'background .15s, border-color .15s',
          }}
          onMouseEnter={e => { (e.target as HTMLButtonElement).style.background='rgba(230,59,46,.7)'; (e.target as HTMLButtonElement).style.borderColor='#E63B2E'; }}
          onMouseLeave={e => { (e.target as HTMLButtonElement).style.background='rgba(8,7,5,.78)'; (e.target as HTMLButtonElement).style.borderColor='#E8DDC4'; }}
        >
          SKIP VIDEO ›
        </button>
      )}

      {/* ── BACKGROUND ──────────────────────────────── */}
      <div className="ml-bg" style={{backgroundImage:`url(${fondoUrl})`,zIndex:0}}/>

      {/* ── AMBIENT: chamber glow flicker ───────────── */}
      <div style={{
        position:'absolute',left:420,top:130,width:600,height:560,
        background:'radial-gradient(ellipse 60% 70% at 50% 45%,rgba(23,201,194,.26),transparent 75%)',
        animation:'chamber-flicker 6s ease-in-out infinite',
        pointerEvents:'none',zIndex:1,
      }}/>

      {/* ── AMBIENT: furnace warm glow (left) ───────── */}
      <div style={{
        position:'absolute',left:-20,top:420,width:300,height:280,
        background:'radial-gradient(ellipse 70% 60% at 40% 60%,rgba(243,107,33,.35),transparent 72%)',
        animation:'furnace-glow 4.2s ease-in-out infinite',
        pointerEvents:'none',zIndex:1,
      }}/>

      {/* ── AMBIENT: red beacons ────────────────────── */}
      <div style={{position:'absolute',right:130,top:78,width:18,height:18,borderRadius:'50%',background:'#E63B2E',
        boxShadow:'0 0 14px #E63B2E,0 0 30px rgba(230,59,46,.4)',
        animation:'beacon-a 2.1s ease-in-out infinite',pointerEvents:'none',zIndex:2}}/>
      <div style={{position:'absolute',left:164,top:82,width:12,height:12,borderRadius:'50%',background:'#E63B2E',
        boxShadow:'0 0 10px #E63B2E',
        animation:'beacon-b 3.4s ease-in-out infinite',pointerEvents:'none',zIndex:2}}/>

      {/* ── AMBIENT: steam emitters ─────────────────── */}
      {!reducedMotion && STEAMS.map((s,i) => (
        <div key={i} style={{position:'absolute',left:s.x,top:s.y,width:28,height:0,overflow:'visible',pointerEvents:'none',zIndex:2}}>
          {[0,1,2].map(j=>(
            <div key={j} style={{
              position:'absolute',left:j*6,top:0,width:22-j*3,height:22-j*3,
              borderRadius:'50%',
              background:`rgba(${i?'200,190,170':'190,200,210'},.18)`,
              filter:'blur(8px)',
              animation:`steam-rise ${3.8+j*.9+i*.6}s ease-out infinite ${j*1.2+i*2.1}s`,
            }}/>
          ))}
        </div>
      ))}

      {/* ── AMBIENT: chamber electrical motes ───────── */}
      {MOTES.map((m,i) => (
        <div key={i} style={{
          position:'absolute',left:m.x,top:m.y,
          width:m.s*6,height:m.s*6,borderRadius:'50%',
          background:'#17C9C2',
          boxShadow:`0 0 ${Math.round(m.s*8)}px #17C9C2`,
          opacity:0,
          animation:`mote-drift ${4.2+m.s*2}s ease-in-out infinite ${m.d}s`,
          pointerEvents:'none',zIndex:2,
        }}/>
      ))}

      {/* ── SPECIMEN TANK ───────────────────────────── */}
      <img src={tankUrl} alt="Specimen tank"
        style={{position:'absolute',left:395,top:110,width:650,height:'auto',zIndex:3,pointerEvents:'none'}}/>

      {/* ── GENERATION: boosted cyan ambient ─────────── */}
      {dnaPhase==='generating' && (
        <div style={{
          position:'absolute',left:390,top:80,width:660,height:650,
          background:'radial-gradient(ellipse 65% 75% at 50% 45%,rgba(23,201,194,.52),transparent 68%)',
          animation:'gen-pulse-cyan 1.6s ease-in-out infinite',
          pointerEvents:'none',zIndex:3,
        }}/>
      )}

      {/* ── GENERATION: scanner line ─────────────────── */}
      {genActive && (
        <div style={{
          position:'absolute',left:462,top:128,width:516,height:554,
          overflow:'hidden',pointerEvents:'none',zIndex:5,
          borderRadius:'50% 50% 0 0 / 8% 8% 0 0',
        }}>
          <div style={{
            position:'absolute',left:0,right:0,height:4,top:0,
            background:'linear-gradient(90deg,transparent 5%,rgba(23,201,194,.95) 50%,transparent 95%)',
            boxShadow:'0 0 16px #17C9C2,0 0 32px rgba(23,201,194,.5)',
            animation:'scanner-sweep 1.9s linear infinite',
          }}/>
        </div>
      )}

      {/* ── GENERATION: electrical arcs ─────────────── */}
      {genActive && (
        <svg style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:5,overflow:'visible'}} width="1440" height="900">
          <path d="M720 148 L700 198 L728 238 L706 300 L720 390"
            stroke="#17C9C2" strokeWidth="2.5" fill="none" strokeLinecap="round"
            strokeDasharray="10 5" style={{animation:'gen-elec 2.2s ease-in-out infinite'}}/>
          <path d="M668 170 L648 215 L668 260 L655 318"
            stroke="#00E4DD" strokeWidth="1.5" fill="none" opacity=".6"
            style={{animation:'gen-elec 1.7s ease-in-out infinite .5s'}}/>
          <path d="M772 158 L792 205 L768 252 L786 322"
            stroke="#00E4DD" strokeWidth="1.5" fill="none" opacity=".6"
            style={{animation:'gen-elec 1.9s ease-in-out infinite .9s'}}/>
        </svg>
      )}

      {/* ── GENERATION: assembling particles ─────────── */}
      {genActive && !reducedMotion && [
        {x:590,y:490,tx:'40px',ty:'-50px'},{x:640,y:530,tx:'-20px',ty:'-60px'},
        {x:710,y:510,tx:'10px',ty:'-70px'},{x:760,y:495,tx:'-35px',ty:'-55px'},
        {x:800,y:520,tx:'25px',ty:'-45px'},{x:550,y:510,tx:'60px',ty:'-40px'},
      ].map((p,i) => (
        <div key={i} style={{
          position:'absolute',left:p.x,top:p.y,
          width:8,height:8,borderRadius:'50%',
          background:'#17C9C2',
          boxShadow:'0 0 10px #17C9C2,0 0 20px rgba(23,201,194,.5)',
          animation:`gen-particle ${2.4+i*.35}s ease-in-out infinite ${i*.28}s`,
          ['--gx' as string]:p.tx, ['--gy' as string]:p.ty,
          pointerEvents:'none',zIndex:5,
        }}/>
      ))}

      {/* ── GENERATION: status message panel ─────────── */}
      {dnaPhase==='generating' && genMsgIdx >= 0 && (
        <div style={{
          position:'absolute',left:395,bottom:178,width:650,
          display:'flex',justifyContent:'center',
          zIndex:6,pointerEvents:'none',
        }}>
          <div key={genMsgIdx} style={{
            background:'rgba(8,7,5,.92)',
            border:'1px solid #17C9C2',
            padding:'9px 28px',
            boxShadow:'0 0 24px rgba(23,201,194,.35),inset 0 0 12px rgba(23,201,194,.06)',
            animation:'gen-msg-in .25s ease-out both',
          }}>
            <div className="mono" style={{
              fontSize:11,letterSpacing:3,fontWeight:700,
              color: genMsgIdx === 6 ? '#17C9C2' : '#E8DDC4',
            }}>
              {genMsgIdx === 6 ? '✓ ' : '⟳ '}{GEN_MESSAGES[genMsgIdx]}
            </div>
          </div>
        </div>
      )}

      {/* ── CHAMBER-STAGE: specimen inside glass ─────── */}
      {specimenIn && baseSpecimen && (
        <div style={{
          /* Inner glass cylinder — container starts above the glass rim
             so the full specimen is never vertically cropped.
             overflow:hidden clips only left/right glass walls + bottom platform. */
          position:'absolute',left:528,top:-8,width:387,height:594,
          overflow:'hidden',zIndex:4,pointerEvents:'none',
        }}>
          {/* Grounded platform shadow */}
          <div style={{
            position:'absolute',bottom:20,left:'50%',
            width:180,height:18,borderRadius:'50%',
            background:'rgba(6,6,5,.6)',filter:'blur(10px)',
            transform:'translateX(-50%)',
            animation: dnaPhase==='ready' ? 'gen-shadow-breathe 4s ease-in-out infinite' : 'none',
          }}/>

          {/* ── Outer positioner: bottom-centres specimen-body in chamber ── */}
          <div style={{
            position:'absolute', bottom:16, left:0, right:0,
            display:'flex', justifyContent:'center',
          }}>
            {/* ── Specimen body — wraps ONLY the creature img ──────────
                display:inline-block shrinks to img pixel bounds.
                position:relative is the anchor for all organ overlays.
                DEBUG: outline:2px solid red must hug creature exactly. ── */}
            <div style={{
              position:'relative', display:'inline-block',
            }}>
              {/* Creature image — display:block, natural proportions */}
              <img
                src={baseSpecimen.image}
                alt={baseSpecimen.codename}
                style={{
                  display:'block',
                  width:'250px', height:'auto',
                  transformOrigin:'bottom center',
                  cursor:'crosshair',
                  animation: mutationAccepted
                    ? 'specimen-flash .55s ease-out'
                    : dnaPhase==='generating'
                      ? 'specimen-materialize .9s ease-out both'
                      : mutPhase===3
                        ? 'chamber-vibrate .08s ease-in-out 6 alternate, specimen-idle 4s ease-in-out infinite'
                        : 'specimen-idle 4s ease-in-out infinite',
                }}
              />

              {/* ── Installed organs — z:3, centered on attachment point ── */}
              {[...installedOrgans].slice(0, 6).map((name, i) => {
                const pt  = ORGAN_ATTACH_POINTS[i];
                const org = organs.find(o => o.name === name);
                if (!org || !pt) return null;
                return (
                  <img
                    key={name}
                    src={org.img}
                    alt={name}
                    style={{
                      position:'absolute',
                      top:pt.top, left:pt.left,
                      width:'36%', height:'auto',
                      transform:'translate(-50%,-50%)',
                      zIndex:3,
                      animation:'organ-graft 350ms cubic-bezier(.34,1.56,.64,1) both',
                    }}
                  />
                );
              })}

              {/* ── SVG cables — 250×320 viewBox matches img render size ── */}
              {installedOrgans.size > 0 && (
                <svg
                  aria-hidden="true"
                  style={{position:'absolute',inset:0,width:'100%',height:'100%',zIndex:4,pointerEvents:'none'}}
                  viewBox="0 0 250 320"
                  preserveAspectRatio="none"
                >
                  {[...installedOrgans].slice(0, 6).map((name, i) => {
                    const d = cablePath(i);
                    return (
                      <g key={name}>
                        <path d={d} stroke="#1a1a18" strokeWidth="4" fill="none"
                              strokeLinecap="round" vectorEffect="non-scaling-stroke"/>
                        <circle r="5" fill="#17C9C2" vectorEffect="non-scaling-stroke"
                                style={{filter:'drop-shadow(0 0 4px #17C9C2)'}}>
                          <animateMotion dur="2.4s" repeatCount="indefinite"
                                         begin={`${i * 0.4}s`} path={d}/>
                        </circle>
                      </g>
                    );
                  })}
                </svg>
              )}
            </div>
          </div>

          {/* Sparks (after ready) */}
          {dnaPhase==='ready' && [[45,225],[350,176],[330,367],[100,418],[265,72]].map(([left,top],i)=>(
            <i key={i} style={{
              position:'absolute',left,top,
              width:i%2?9:6,height:i%2?9:6,borderRadius:'50%',
              background:'#00E4DD',boxShadow:'0 0 12px #00E4DD',
              animation:`spark-flicker ${1.4+i*.3}s ease-in-out infinite ${i*.2}s`,
            }}/>
          ))}

          {/* Glass overlay effect */}
          <div style={{position:'absolute',inset:0,pointerEvents:'none'}}>
            <div style={{position:'absolute',left:'7%',top:0,bottom:0,width:3,
              background:'linear-gradient(180deg,rgba(255,255,255,.14),rgba(255,255,255,.05),rgba(255,255,255,.1))'}}/>
            <div style={{position:'absolute',left:'14%',top:0,bottom:0,width:1,
              background:'linear-gradient(180deg,rgba(255,255,255,.07),transparent)'}}/>
            <div style={{position:'absolute',inset:0,
              backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(23,201,194,.018) 3px,rgba(23,201,194,.018) 4px)'}}/>
            <div style={{position:'absolute',inset:0,
              boxShadow:'inset 3px 0 10px rgba(23,201,194,.14),inset -3px 0 10px rgba(23,201,194,.14),inset 0 -4px 12px rgba(23,201,194,.08)'}}/>
            <div style={{position:'absolute',inset:0,background:'rgba(23,201,194,.04)'}}/>
          </div>
        </div>
      )}

      {/* ── EMPTY CHAMBER SCANNER (only before specimen exists) ── */}
      {dnaPhase==='ready' && !baseSpecimen && installedOrgans.size===0 && (
        <div style={{
          position:'absolute',left:548,top:520,width:344,zIndex:5,
          background:'#080807',border:'2px solid #17C9C2',
          padding:'8px 14px',
          boxShadow:'0 0 14px rgba(23,201,194,.3),inset 0 0 20px rgba(23,201,194,.06)',
        }}>
          <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:5}}>
            <Led anim="cyan-pulse 1.4s ease-in-out infinite" size={7}/>
            <span className="mono" style={{fontSize:9,letterSpacing:3,color:'#17C9C2',fontWeight:700}}>SCAN ACTIVE</span>
          </div>
          <div className="mono" style={{fontSize:11,fontWeight:700,letterSpacing:1,color:'#E8DDC4'}}>NO SPECIMEN DETECTED</div>
          <div className="mono" style={{fontSize:8,letterSpacing:.8,color:'#4A4E44',marginTop:3}}>DNA REQUIRED BEFORE MUTATION</div>
        </div>
      )}

      {/* ── HOLOGRAPHIC ORGAN PREVIEW ───────────────── */}
      {previewData && (
        <div style={{
          position:'absolute',left:558,top:210,width:324,
          pointerEvents:'none',zIndex:5,textAlign:'center',
          animation:'hologram-in .35s ease-out both',
        }}>
          {/* Hologram image */}
          <img src={previewData.img} alt={previewData.short}
            style={{
              width:200,height:130,objectFit:'contain',objectPosition:'center bottom',
              filter:'drop-shadow(0 0 18px #17C9C2) drop-shadow(0 0 36px rgba(23,201,194,.5)) saturate(0) brightness(4) sepia(1) hue-rotate(160deg)',
              opacity:.6,
              mixBlendMode:'screen',
            }}/>
          {/* Connection line to tray */}
          <svg style={{position:'absolute',left:100,top:130,pointerEvents:'none',overflow:'visible'}} width="2" height="120">
            <line x1="1" y1="0" x2="1" y2="120" stroke="#17C9C2" strokeWidth="1.5" strokeDasharray="4 4" opacity=".6"/>
            <circle cx="1" cy="120" r="3" fill="#17C9C2" opacity=".8"/>
          </svg>
          {/* PREVIEW GRAFT label */}
          <div style={{
            display:'inline-block',marginTop:8,
            background:'#080807',border:'2px solid #17C9C2',
            padding:'4px 12px',
            boxShadow:'0 0 10px rgba(23,201,194,.35)',
          }}>
            <span className="mono" style={{fontSize:8,letterSpacing:3,color:'#17C9C2',fontWeight:700}}>PREVIEW GRAFT</span>
          </div>
          <div className="mono" style={{fontSize:8,color:'#17C9C2',marginTop:3,opacity:.8,letterSpacing:1}}>
            {previewData.short} / {previewData.detail}
          </div>
        </div>
      )}

      {/* ── CABLE PULSE ON HOVER ────────────────────── */}
      {hoveredOrgan && !reducedMotion && (
        <svg key={hoveredOrgan} style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:5,overflow:'visible'}} width="1440" height="900">
          <path
            d={`M${cableStartX} ${cableStartY} C${cableStartX} 660 720 560 720 450`}
            stroke="#17C9C2" strokeWidth="1.5" fill="none" strokeLinecap="round"
            strokeDasharray="220 220" strokeDashoffset="220"
            style={{animation:'hover-cable .9s ease-in-out infinite'}}
            opacity=".7"
          />
        </svg>
      )}


      {/* ── MUTATION SEQUENCE: electricity SVG ──────── */}
      {mutPhase===2 && (
        <svg style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:8,overflow:'visible'}} width="1440" height="900">
          <path d="M720 746 C720 680 720 600 720 448"
            stroke="#17C9C2" strokeWidth="3" fill="none" strokeLinecap="round"
            strokeDasharray="400 400" strokeDashoffset="400"
            style={{animation:'elec-travel .45s ease-in both'}}/>
          <path d="M588 746 C620 680 690 580 720 448"
            stroke="#17C9C2" strokeWidth="1.5" fill="none" strokeLinecap="round"
            strokeDasharray="350 350" strokeDashoffset="350"
            style={{animation:'elec-travel .52s ease-in .08s both'}} opacity=".5"/>
        </svg>
      )}

      {/* ── MUTATION SEQUENCE: chamber scan pulse ───── */}
      {mutPhase===3 && (
        <div style={{
          position:'absolute',left:420,top:130,width:600,height:560,
          background:'radial-gradient(ellipse 55% 65% at 50% 45%,rgba(23,201,194,.65),rgba(23,201,194,.15) 50%,transparent 75%)',
          animation:'scan-pulse .6s ease-out both',
          pointerEvents:'none',zIndex:8,transformOrigin:'50% 100%',
        }}/>
      )}

      {/* ── MUTATION SEQUENCE: dim overlay ──────────── */}
      {(mutPhase===1||mutPhase===2) && (
        <div style={{
          position:'absolute',inset:0,background:'rgba(8,8,7,.36)',
          animation:'lab-dim .5s ease-in-out both',
          pointerEvents:'none',zIndex:7,
        }}/>
      )}

      {/* ─────────────────────────────────────────────────────
          INSTRUMENT PANELS  (all z:9+, always above ambient)
      ───────────────────────────────────────────────────── */}

      {/* ZONE 1 — TOP-LEFT: identity + status + save */}
      <div style={{position:'absolute',left:18,top:8,zIndex:9}}>
        <img src={logoUrl} alt="FRANKENAPP"
          style={{height:96,width:'auto',display:'block',filter:'drop-shadow(5px 4px 0 #080807)'}}/>

        <div style={{background:'#11110F',border:'3px solid #080807',boxShadow:'6px 6px 0 #080807',position:'relative',padding:'10px 14px 11px',width:268,marginTop:7,transform:'rotate(-.4deg)'}}>
          <Rivet top={5} left={5}/><Rivet top={5} right={5}/>
          <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:3}}>
            <Led anim="cyan-pulse 2s ease-in-out infinite"/>
            <span className="mono" style={{fontSize:11,letterSpacing:3,color:'#17C9C2',fontWeight:700}}>EXPERIMENT 0042</span>
          </div>
          <div className="anton" style={{fontSize:19,letterSpacing:2,color:'#F5D400',marginBottom:7}}>
            {dnaPhase==='intake'
              ? 'DNA INTAKE REQUIRED'
              : dnaPhase==='generating'
                ? 'SPECIMEN FORMING…'
                : 'BASE SPECIMEN DETECTED'}
          </div>
          <div className="mono" style={{fontSize:10,letterSpacing:1,color:'#6A5E4E',display:'grid',gridTemplateColumns:'1fr 1fr',rowGap:4}}>
            {dnaPhase==='intake' ? (<>
              <span style={{color:'#E8DDC4',fontWeight:700}}>POWER</span>      <span style={{color:'#B9ED22',fontWeight:700}}>73%</span>
              <span style={{color:'#E8DDC4',fontWeight:700}}>STATUS</span>      <span style={{color:'#E63B2E',fontSize:9,fontWeight:700}}>EMPTY</span>
              <span style={{color:'#E8DDC4',fontWeight:700}}>ORGAN SLOTS</span><span style={{color:'#17C9C2',fontWeight:700}}>00 / 16</span>
            </>) : dnaPhase==='generating' ? (<>
              <span style={{color:'#E8DDC4',fontWeight:700}}>POWER</span>      <span style={{color:'#B9ED22',fontWeight:700}}>73%</span>
              <span style={{color:'#E8DDC4',fontWeight:700}}>STATUS</span>      <span style={{color:'#17C9C2',fontSize:9,fontWeight:700,animation:'cyan-pulse 1.2s ease-in-out infinite'}}>GROWING</span>
              <span style={{color:'#E8DDC4',fontWeight:700}}>ORGAN SLOTS</span><span style={{color:'#4A4038',fontWeight:700}}>00 / 16</span>
            </>) : (<>
              <span style={{color:'#E8DDC4',fontWeight:700}}>SPECIMEN</span>   <span style={{color:'#17C9C2',fontSize:9,fontWeight:700}}>{baseSpecimen?.codename}</span>
              <span style={{color:'#E8DDC4',fontWeight:700}}>CONTAINMENT</span><span style={{color:'#17C9C2',fontSize:9,fontWeight:700}}>STABLE-ISH</span>
              <span style={{color:'#E8DDC4',fontWeight:700}}>ORGAN SLOTS</span><span style={{color:'#17C9C2',fontWeight:700}}>{String(installedOrgans.size).padStart(2,'0')} / 16</span>
            </>)}
          </div>
        </div>

        <button onClick={()=>{ setSaved(true); scopeDispatch(saved ? 'saved' : 'save_requested'); }} className="mono" style={{
          marginTop:8,display:'block',border:'3px solid #080807',
          background:saved?'#17C9C2':'#11110F',color:saved?'#080807':'#E8DDC4',
          padding:'10px 0',fontWeight:900,fontSize:13,letterSpacing:1.5,
          boxShadow:'4px 4px 0 #080807',cursor:'pointer',transform:'rotate(-.4deg)',width:268,position:'relative',
        }}>
          <Rivet top={4} left={4}/><Rivet bottom={4} right={4}/>
          {saved?'✓  SAVED TO ARCHIVE':'▣  SAVE MUTANT'}
        </button>
      </div>

      {/* TOP PAPER STRIP */}
      <div style={{position:'absolute',left:296,top:10,zIndex:9,transform:'rotate(-.3deg)'}}>
        <div className="ripped-paper" style={{background:'#E8DDC4',boxShadow:'4px 4px 0 #080807',padding:'8px 20px 10px',position:'relative'}}>
          <Rivet top={6} left={6}/><Rivet top={6} right={6}/>
          <div className="mono" style={{fontSize:13,fontWeight:900,letterSpacing:.5,color:'#080807'}}>
            YOUR IDEA WAS FINE. THEN YOU ADDED FEATURES.
          </div>
          <div className="marker" style={{fontSize:13,color:'#5A4E3C',marginTop:3,transform:'rotate(-.6deg)'}}>
            We warned it about scope creep.
          </div>
        </div>
      </div>

      {/* ZONE 2 — APP DNA CLIPBOARD */}
      <div style={{position:'absolute',left:18,top:272,width:286,zIndex:9,transform:'rotate(-1.5deg)'}}>
        <div style={{width:76,height:22,margin:'0 auto',marginBottom:-3,position:'relative',zIndex:2,background:'linear-gradient(180deg,#666 0%,#999 40%,#555 100%)',border:'2px solid #222',borderRadius:'3px 3px 0 0',boxShadow:'0 -2px 6px rgba(0,0,0,.6)'}}>
          <div style={{position:'absolute',inset:'5px 12px',background:'linear-gradient(180deg,#aaa,#777)',borderRadius:2,border:'1px solid #444'}}/>
        </div>
        <div className="ripped-paper" style={{background:'#E8DDC4',boxShadow:'8px 9px 0 #080807,-2px 3px 0 rgba(8,8,7,.25)',padding:'20px 18px 22px'}}>
          <Rivet top={10} left={10}/><Rivet top={10} right={10}/>
          <div style={{display:'flex',alignItems:'center',gap:5,position:'absolute',top:12,left:'50%',transform:'translateX(-50%)',whiteSpace:'nowrap'}}>
            <Led color="#17C9C2" anim="cyan-pulse 2.8s ease-in-out infinite" size={7}/>
            <span className="mono" style={{fontSize:9,letterSpacing:2,color:'#5A4E3C',fontWeight:700}}>LIVE READ</span>
          </div>
          <div className="anton" style={{fontSize:24,letterSpacing:2,color:'#080807',marginTop:14,borderBottom:'3px solid #080807',paddingBottom:6}}>⬡ APP DNA</div>
          {dnaPhase==='intake' ? (
            <div style={{padding:'18px 0',textAlign:'center'}}>
              <div className="mono" style={{fontSize:11,letterSpacing:2,color:'#E63B2E',marginBottom:6,fontWeight:700}}>— EMPTY —</div>
              <div className="mono" style={{fontSize:11,color:'#7A6E5E',letterSpacing:.5,lineHeight:1.6}}>Complete the DNA intake to populate this readout.</div>
            </div>
          ) : (
            [
              {label:'CATEGORY',     value: appDNA?.category     ?? '—'},
              {label:'AUDIENCE',     value: appDNA?.audience     ?? '—'},
              {label:'PLATFORM',     value: appDNA?.platform     ?? '—'},
              {label:'CORE PURPOSE', value: appDNA?.corePurpose  ?? '—'},
              {label:'DNA STABILITY',value: 'QUESTIONABLE'},
            ].map(({label,value})=>(
              <div key={label} style={{borderBottom:'1.5px solid #A09080',padding:'6px 0',display:'flex',flexDirection:'column',gap:2}}>
                <span className="mono" style={{fontSize:9,letterSpacing:2,color:'#7A6E5E',fontWeight:700}}>{label}</span>
                <span className="mono" style={{fontSize:12,fontWeight:900,color:'#080807',letterSpacing:.5}}>{value}</span>
              </div>
            ))
          )}
          {dnaPhase==='ready' && (
            <div className="anton" style={{position:'absolute',bottom:28,right:14,fontSize:12,letterSpacing:2,color:'rgba(230,59,46,.65)',border:'2px solid rgba(230,59,46,.65)',padding:'3px 8px',transform:'rotate(9deg)'}}>VERIFIED</div>
          )}
          <div className="mono" style={{fontSize:10,letterSpacing:1.5,color:'#6A5E4E',marginTop:12,fontWeight:700}}>
            {dnaPhase==='intake' ? 'AWAITING DNA INPUT...' : 'SEQ: 00.19 // READOUT COMPLETE'}
          </div>
        </div>
      </div>

      {/* ZONE 3 — MUTATION EVENT TICKET */}
      <div style={{position:'absolute',right:16,top:132,width:272,zIndex:9}}>
        <div style={{background:'#11110F',border:'3px solid #080807',boxShadow:'6px 6px 0 #080807',padding:'10px 12px 0',position:'relative'}}>
          <Rivet top={6} left={6}/><Rivet top={6} right={6}/>
          <Rivet bottom={0} left={6}/><Rivet bottom={0} right={6}/>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:7,marginBottom:10}}>
            <Led color={ticket?'#E63B2E':'#6A5E4E'} anim={ticket?'blink-led 1.1s ease-in-out infinite':'none'} size={9}/>
            <span className="mono" style={{fontSize:11,letterSpacing:2,color:'#E8DDC4',fontWeight:700}}>{ticket?'PRINTER ACTIVE':'AWAITING INPUT'}</span>
          </div>
          <div style={{height:13,margin:'0 -12px',background:'#060605',borderTop:'2px solid #2A2015',borderBottom:'2px solid #2A2015',backgroundImage:'repeating-linear-gradient(90deg,transparent 0 10px,rgba(255,255,255,.04) 10px 11px)'}}/>
          <div className="ripped-top" style={{background:'#E8DDC4',margin:'0 -12px',padding:'16px 18px 16px',boxShadow:'inset 0 -4px 0 rgba(0,0,0,.14)',minHeight:130,position:'relative'}}>
            {/* ORGAN ACCEPTED stamp */}
            {mutationAccepted && (
              <div className="anton" style={{
                position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:22,letterSpacing:2,color:'rgba(23,201,194,.85)',
                border:'4px solid rgba(23,201,194,.85)',margin:'12px',
                transform:'rotate(-4deg)',animation:'stamp-appear .35s ease-out both',
                zIndex:2,pointerEvents:'none',
                background:'rgba(232,221,196,.92)',flexDirection:'column',gap:4,
              }}>
                <span>✓ ORGAN ACCEPTED</span>
                <span className="mono" style={{fontSize:10,letterSpacing:1,color:'rgba(23,201,194,.7)',fontWeight:700}}>Specimen stability updated.</span>
              </div>
            )}
            {ticket?(
              <>
                <div className="mono" style={{fontSize:11,letterSpacing:3,color:'#E63B2E',marginBottom:7,fontWeight:900}}>⚠ {ticket.alert}</div>
                <div className="mono" style={{fontSize:15,letterSpacing:1,color:'#080807',fontWeight:900}}>{ticket.title}</div>
                <div className="anton" style={{fontSize:48,lineHeight:1,color:'#080807',marginTop:4}}>{ticket.pct}</div>
                <div className="mono" style={{fontSize:11,letterSpacing:.6,color:'#080807',marginTop:8,lineHeight:1.5,fontStyle:'italic'}}>{ticket.story}</div>
              </>
            ): dnaPhase==='ready' && baseSpecimen ? (
              /* ── Base organism created ticket ── */
              <>
                <div className="mono" style={{fontSize:11,letterSpacing:3,color:'#17C9C2',marginBottom:7,fontWeight:900,animation:'cyan-pulse 2s ease-in-out infinite'}}>✓ BASE ORGANISM CREATED</div>
                <div className="mono" style={{fontSize:15,letterSpacing:1,color:'#080807',fontWeight:900}}>{baseSpecimen.codename}</div>
                <div className="anton" style={{fontSize:38,lineHeight:1,color:'#080807',marginTop:4}}>0% COMPLEXITY</div>
                <div className="mono" style={{fontSize:11,letterSpacing:.6,color:'#080807',marginTop:8,lineHeight:1.6,fontStyle:'italic'}}>
                  It is alive, underqualified and currently missing several organs.
                </div>
                <div className="marker" style={{fontSize:13,color:'#5A4E3C',marginTop:6,transform:'rotate(-.8deg)'}}>
                  "This seems fixable."
                </div>
              </>
            ):(
              <>
                <div className="mono" style={{fontSize:12,letterSpacing:2,color:'#8A7F6E',marginBottom:8,fontWeight:900}}>— NO ORGAN SELECTED —</div>
                <div className="mono" style={{fontSize:11,letterSpacing:.5,color:'#5A4E3C',lineHeight:1.6,fontStyle:'italic'}}>
                  Choose an organ from the tray. The laboratory accepts no responsibility for additional limbs.
                </div>
              </>
            )}
          </div>
          <div className="stripe" style={{height:14,margin:'0 -12px',borderTop:'2px solid #080807'}}/>
        </div>
        {ticket&&(
          <svg style={{position:'absolute',left:-172,top:90,pointerEvents:'none',overflow:'visible'}} width="180" height="50">
            <path d="M172 18 C130 18 90 32 0 28" stroke="#17C9C2" strokeWidth="2" fill="none" strokeLinecap="round" strokeDasharray="3 4" opacity=".55"/>
          </svg>
        )}
      </div>

      {/* ZONE 4 — COMPLEXITY METER */}
      <div style={{position:'absolute',left:18,bottom:16,width:336,zIndex:9,transform:'rotate(-.5deg)'}}>
        <div style={{background:'#11110F',border:'3px solid #080807',boxShadow:'6px 6px 0 #080807',padding:'14px 16px 16px',position:'relative',overflow:'hidden'}}>
          {/* Scan-line shimmer */}
          <div aria-hidden="true" style={{position:'absolute',top:0,left:0,width:'45%',height:'100%',
            background:'linear-gradient(90deg,transparent,rgba(232,221,196,.05) 50%,transparent)',
            animation:'meter-scan 5s linear infinite',pointerEvents:'none',zIndex:1}}/>
          <Rivet top={6} left={6}/><Rivet top={6} right={6}/>
          <Rivet bottom={6} left={6}/><Rivet bottom={6} right={6}/>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6,position:'relative',zIndex:2}}>
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <Led anim="cyan-pulse 2s ease-in-out infinite" size={7}/>
              <span className="mono" style={{fontSize:11,letterSpacing:3,color:'#17C9C2',fontWeight:700}}>COMPLEXITY METER</span>
            </div>
            <span className="mono" style={{fontSize:11,color:'#E8DDC4',letterSpacing:2,fontWeight:700}}>// LIVE</span>
          </div>
          <div style={{display:'flex',alignItems:'baseline',gap:6,marginBottom:2,position:'relative',zIndex:2}}>
            <div className="anton" style={{fontSize:48,lineHeight:1,color:'#E8DDC4',textShadow:'2px 2px 0 #080807',transition:'all .8s cubic-bezier(.4,0,.2,1)'}}>{complexityPct}</div>
            <div className="anton" style={{fontSize:26,lineHeight:1,color:'#E8DDC4',textShadow:'2px 2px 0 #080807'}}>%</div>
            <div style={{display:'flex',alignItems:'center',gap:5,marginLeft:4}}>
              <span style={{fontSize:18,color:'#F36B21',textShadow:'1px 1px #080807',lineHeight:1}}>ϟ</span>
              <span className="mono" style={{fontSize:13,letterSpacing:1.5,color:'#F5D400',fontWeight:900,transition:'color .5s ease'}}>{cLabel}</span>
            </div>
          </div>

          {/* ── Arc gauge — radius 90, fully contained, no overflow ── */}
          {/* Arc: M62 94 A90 90 0 0 1 242 94  centre=(152,94)
              Top of arc = (152, 4) — 4px from SVG top ✓
              Full perimeter ≈ π×90 ≈ 283 px                    */}
          <svg width="304" height="96" viewBox="0 0 304 96"
               style={{display:'block',marginTop:4,position:'relative',zIndex:2}}>
            <defs>
              <linearGradient id="arc-grad" gradientUnits="userSpaceOnUse"
                              x1="62" y1="94" x2="242" y2="94">
                <stop offset="0%"   stopColor="#B9ED22"/>
                <stop offset="22%"  stopColor="#17C9C2"/>
                <stop offset="46%"  stopColor="#F36B21"/>
                <stop offset="75%"  stopColor="#E63B2E"/>
                <stop offset="100%" stopColor="#8B0000"/>
              </linearGradient>
              <filter id="arc-glow" x="-10%" y="-30%" width="120%" height="160%">
                <feGaussianBlur stdDeviation="3" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            {/* Dark track */}
            <path d="M62 94 A90 90 0 0 1 242 94" stroke="#1E1C18" strokeWidth="18" fill="none"/>
            <path d="M62 94 A90 90 0 0 1 242 94" stroke="#2A2015" strokeWidth="14" fill="none"/>

            {/* Gradient-filled arc — animates to complexityPct; π×90 ≈ 283 px total */}
            <path
              d="M62 94 A90 90 0 0 1 242 94"
              stroke="url(#arc-grad)"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              filter="url(#arc-glow)"
              strokeDasharray={`${(complexityPct / 100) * 283} 283`}
              style={{transition:'stroke-dasharray .85s cubic-bezier(.4,0,.2,1)'}}
            />

            {/* Tick marks — centre (152,94), outer r=83, inner r=75 */}
            {[0,25,50,75,100].map(pct=>{
              const a=(-90+pct*1.8)*Math.PI/180,cx=152,cy=94;
              return <line key={pct}
                           x1={cx+83*Math.cos(a)} y1={cy+83*Math.sin(a)}
                           x2={cx+75*Math.cos(a)} y2={cy+75*Math.sin(a)}
                           stroke="#E8DDC4" strokeWidth="1.5" opacity=".5"/>;
            })}

            {/* Needle — pivots at arc centre (152,94) */}
            <g style={{transition:'transform .85s cubic-bezier(.4,0,.2,1)'}}
               transform={`translate(152,94) rotate(${needleRot})`}>
              <line x1="0" y1="4" x2="0" y2="-58" stroke="#E8DDC4" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="0" y1="4" x2="0" y2="10"  stroke="#E8DDC4" strokeWidth="3"   strokeLinecap="round" opacity=".4"/>
              <circle cx="0" cy="0" r="7"   fill="#E63B2E" stroke="#080807" strokeWidth="2"
                      style={{filter:'drop-shadow(0 0 5px #E63B2E)'}}/>
              <circle cx="0" cy="0" r="2.5" fill="#E8DDC4"/>
            </g>
          </svg>

          {/* ── Proportional fill bar ── */}
          <div style={{height:13,border:'2px solid #080807',marginTop:4,overflow:'hidden',position:'relative',background:'#181614'}}>
            {/* Filled gradient strip */}
            <div style={{
              position:'absolute',top:0,left:0,bottom:0,
              width:`${complexityPct}%`,
              background:'linear-gradient(to right,#B9ED22 0%,#17C9C2 22%,#F36B21 52%,#E63B2E 78%,#8B0000 100%)',
              transition:'width .85s cubic-bezier(.4,0,.2,1)',
              boxShadow:'inset 0 1px 0 rgba(255,255,255,.18)',
            }}/>
            {/* Zone dividers */}
            {[20,40,60,80].map(p=>(
              <div key={p} style={{position:'absolute',top:0,bottom:0,left:`${p}%`,width:1,background:'rgba(8,8,7,.7)',zIndex:2}}/>
            ))}
          </div>

          <div className="mono" style={{display:'flex',justifyContent:'space-between',fontSize:9,letterSpacing:.4,marginTop:3,color:'#6A5E4E',fontWeight:700}}>
            <span>CUTE</span><span>HEALTHY</span><span>QUESTIONABLE</span><span>CURSED</span><span>FRANKEN</span>
          </div>
          <div style={{marginTop:9}}>
            <span style={{background:'#F5D400',border:'2px solid #080807',padding:'3px 10px',display:'inline-block'}}>
              <span className="mono" style={{fontSize:12,letterSpacing:2,color:'#080807',fontWeight:900}}>{complexityPct}% // {cLabel}</span>
            </span>
          </div>
          <div className="mono" style={{fontSize:10,color:'#4A4038',marginTop:6,letterSpacing:.5,fontStyle:'italic',fontWeight:700}}>
            Feature creep has measurable consequences.
          </div>
        </div>
      </div>

      {/* ZONE 5 — FEATURE ORGAN TRAY */}
      <div style={{position:'absolute',left:366,bottom:14,right:138,zIndex:9}}>
        <div style={{background:'#11110F',border:'3px solid #080807',boxShadow:'6px 6px 0 #080807',height:154,overflow:'hidden',position:'relative'}}>
          {/* Yellow ID rail */}
          <div style={{background:'#F5D400',height:22,borderBottom:'2px solid #080807',display:'flex',alignItems:'center',padding:'0 46px',justifyContent:'space-between',flexShrink:0}}>
            <span className="mono" style={{fontSize:11,letterSpacing:1.5,color:'#080807',fontWeight:900}}>FEATURE ORGAN TRAY</span>
            <span className="mono" style={{fontSize:10,color:'#080807',letterSpacing:1,fontWeight:700}}>SELECT AN ORGAN // DOUBLE-CLICK TO PREVIEW</span>
            <span className="mono" style={{fontSize:11,color:'#E63B2E',fontWeight:900}}>{trayPage+1}–{Math.min(trayPage+VISIBLE,organs.length)}/{organs.length}</span>
          </div>
          <Rivet top={28} left={8}/><Rivet top={28} right={8}/>
          <Rivet bottom={6} left={8}/><Rivet bottom={6} right={8}/>
          {/* Cyan underlight — cyan when selection active */}
          <div style={{position:'absolute',bottom:0,left:46,right:46,height:2,
            background: hasSelection?'#17C9C2':'#2A4040',
            animation: hasSelection?'tray-glow 2.2s ease-in-out infinite':'none',
            transition:'background .3s ease',
          }}/>

          {/* ── TRAY LOCKED overlay ── */}
          {dnaPhase!=='ready' && (
            <div style={{
              position:'absolute',inset:0,zIndex:10,
              background:'rgba(8,8,7,.9)',
              display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:6,
              borderTop:'2px solid #E63B2E',
            }}>
              <Led color='#E63B2E' anim='blink-led 1.4s ease-in-out infinite' size={8}/>
              <div className="mono" style={{fontSize:14,letterSpacing:2,color:'#E63B2E',fontWeight:900}}>
                {dnaPhase==='generating' ? '⟳  SPECIMEN FORMING' : '⊘  ORGAN TRAY LOCKED'}
              </div>
              <div className="mono" style={{fontSize:11,letterSpacing:1,color:'#4A4038',textAlign:'center',fontWeight:700}}>
                {dnaPhase==='generating'
                  ? 'Stand back. This may get messy.'
                  : 'Complete DNA intake to enable feature organs.'}
              </div>
            </div>
          )}

          {/* Prev */}
          <button
            onClick={()=>navTray(-1)}
            onKeyDown={e=>e.key==='ArrowLeft'&&navTray(-1)}
            className="mono"
            aria-label="Previous organs"
            style={{position:'absolute',left:4,top:'50%',marginTop:6,transform:'translateY(-50%)',width:34,height:86,background:'#F5D400',color:'#080807',border:'3px solid #080807',fontSize:16,cursor:'pointer',fontWeight:900,boxShadow:'3px 3px 0 #080807'}}
          >◀</button>

          {/* Organs */}
          <div style={{display:'flex',gap:6,justifyContent:'center',alignItems:'flex-end',height:'calc(100% - 26px)',paddingBottom:10,paddingTop:6}}>
            {visibleOrgans.map((organ,idx)=>{
              const selected  = selectedOrgans.has(organ.name);
              const installed = installedOrgans.has(organ.name);
              const hovered   = hoveredOrgan===organ.name;
              const isPrev    = previewOrgan===organ.name;
              return (
                <div
                  key={organ.name}
                  role="button"
                  tabIndex={0}
                  aria-label={`${organ.short}${selected?' (selected)':''}${installed?' (installed)':''}`}
                  aria-pressed={selected}
                  className="organ-slot"
                  onClick={()=>toggleOrgan(organ.name)}
                  onDoubleClick={()=>previewOrganAction(organ.name)}
                  onMouseEnter={()=>setHoveredOrgan(organ.name)}
                  onMouseLeave={()=>setHoveredOrgan(null)}
                  onKeyDown={e=>{
                    if(e.key==='Enter'){e.preventDefault();toggleOrgan(organ.name);}
                    if(e.key===' '){e.preventDefault();previewOrganAction(organ.name);}
                    if(e.key==='ArrowRight'&&idx===visibleOrgans.length-1){navTray(1);}
                    if(e.key==='ArrowLeft'&&idx===0){navTray(-1);}
                  }}
                  style={{
                    position:'relative',display:'flex',flexDirection:'column',alignItems:'center',gap:2,
                    cursor:'pointer',padding:'5px 7px 4px',minWidth:108,
                    border: isPrev?'2px solid #17C9C2':installed?'2px solid #17C9C2':selected?'2px solid #F5D400':'2px solid #2A2015',
                    background: isPrev?'rgba(23,201,194,.18)':installed?'rgba(23,201,194,.13)':selected?'rgba(245,212,0,.1)':'rgba(30,28,24,.7)',
                    boxShadow: selected?'0 0 14px rgba(245,212,0,.35),inset 0 -2px 6px rgba(245,212,0,.15)':installed?'0 0 10px rgba(23,201,194,.3)':hovered?'0 0 12px rgba(245,212,0,.2)':'none',
                    transform: hovered?'translateY(-6px) scale(1.04)':selected?'translateY(-3px)':'none',
                    transition:'transform .15s ease,box-shadow .15s ease',
                    outline:'none',
                  }}
                >
                  {/* ID tag on hover */}
                  {hovered&&(
                    <div style={{position:'absolute',bottom:'calc(100% + 9px)',left:'50%',transform:'translateX(-50%)',background:'#080807',color:'#F5D400',padding:'9px 14px',whiteSpace:'nowrap',border:'2px solid #F5D400',boxShadow:'4px 4px 0 rgba(8,8,7,.7)',zIndex:30,pointerEvents:'none',textAlign:'center',minWidth:130}}>
                      <div className="mono" style={{fontSize:8,letterSpacing:2,color:'#17C9C2',marginBottom:3}}>{organ.num}</div>
                      <div className="anton" style={{fontSize:16,letterSpacing:.5,lineHeight:1.1}}>{organ.short}</div>
                      <div className="mono" style={{fontSize:8,marginTop:4,color:'#E8DDC4',letterSpacing:1}}>{organ.detail}</div>
                      <div className="mono" style={{fontSize:7.5,marginTop:3,color:'#F5D400'}}>+{organ.complexity}% complexity</div>
                      {installed&&<div className="mono" style={{fontSize:8,marginTop:3,color:'#17C9C2'}}>✓ INSTALLED</div>}
                      <div style={{position:'absolute',bottom:-8,left:'50%',transform:'translateX(-50%)',width:0,height:0,borderLeft:'7px solid transparent',borderRight:'7px solid transparent',borderTop:'8px solid #F5D400'}}/>
                    </div>
                  )}
                  {/* Slot illuminate on hover */}
                  {hovered&&<div style={{position:'absolute',inset:0,background:'rgba(245,212,0,.06)',animation:'slot-illuminate 1s ease-in-out infinite',pointerEvents:'none'}}/>}

                  <img src={organ.img} alt={organ.short}
                    style={{width:98,height:62,objectFit:'contain',objectPosition:'center bottom',flexShrink:0,
                      filter:installed||isPrev?'drop-shadow(0 0 8px #17C9C2)':hovered?'drop-shadow(0 0 6px #F5D400) brightness(1.15)':selected?'drop-shadow(2px 2px 0 #F5D400)':'brightness(.75)',
                      transition:'filter .15s ease'}}/>
                  <div className="mono" style={{fontSize:12,fontWeight:900,letterSpacing:.5,textAlign:'center',color:installed||isPrev?'#17C9C2':selected?'#F5D400':'#E8DDC4',maxWidth:106,lineHeight:1.15}}>
                    {installed?'✓ ':isPrev?'◈ ':''}{organ.short}
                  </div>
                  <div className="mono" style={{fontSize:9,letterSpacing:.4,textAlign:'center',color:installed||isPrev?'#17C9C2':selected?'rgba(245,212,0,.65)':'#5A5040',fontWeight:700}}>
                    {organ.num} / {organ.detail}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Next */}
          <button
            onClick={()=>navTray(1)}
            className="mono"
            aria-label="Next organs"
            style={{position:'absolute',right:4,top:'50%',marginTop:6,transform:'translateY(-50%)',width:34,height:86,background:'#F5D400',color:'#080807',border:'3px solid #080807',fontSize:16,cursor:'pointer',fontWeight:900,boxShadow:'-3px 3px 0 #080807'}}
          >▶</button>
        </div>
      </div>

      {/* ZONE 6 — DANGER CONTROL CONSOLE */}
      <div style={{position:'absolute',right:16,bottom:16,width:232,zIndex:9}}>
        <div className="stripe" style={{padding:5,boxShadow:'7px 7px 0 #080807'}}>
          <div style={{
            background:'#11110F',border:'3px solid #080807',
            padding:'14px 16px 18px',position:'relative',textAlign:'center',
            backgroundImage:`radial-gradient(ellipse at 50% 85%,${
              mutateState==='accepted'?'rgba(23,201,194,.2)':'rgba(230,59,46,.18)'
            } 0%,transparent 65%)`,
            transition:'background-image .4s ease',
          }}>
            <Rivet top={5} left={5}/><Rivet top={5} right={5}/>
            <Rivet bottom={5} left={5}/><Rivet bottom={5} right={5}/>

            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:7,marginBottom:10}}>
              <Led anim={mutateState==='accepted'?'cyan-pulse .6s ease-in-out infinite':'cyan-pulse 1.6s ease-in-out infinite'} size={8}/>
              <span className="mono" style={{fontSize:11,letterSpacing:2,color:'#E8DDC4',fontWeight:700}}>DANGER CONTROL</span>
            </div>

            <button
              onClick={mutate}
              disabled={mutateState==='unarmed'||mutateState==='mutating'||mutateState==='accepted'}
              aria-label={mutateState==='armed'?'Mutate — install selected organs':'Mutate button not armed'}
              style={{
                position:'relative',width:100,height:100,borderRadius:'50%',
                border:'6px solid #080807',
                background: mutateState==='unarmed'
                  ? 'radial-gradient(circle at 38% 36%,#4A3028,#2A1810)'
                  : mutateState==='accepted'
                  ? 'radial-gradient(circle at 38% 36%,#17C9C2,#0A8A84)'
                  : mutating
                  ? 'radial-gradient(circle at 38% 36%,#FF7B50,#E63B2E)'
                  : 'radial-gradient(circle at 38% 36%,#E63B2E 30%,#9A2418)',
                color:'#E8DDC4',fontFamily:'Anton,Impact,sans-serif',
                fontSize:mutateState==='unarmed'?13:22,letterSpacing:.5,
                cursor:mutateState==='armed'?'pointer':'default',
                animation:mutateState==='armed'?'pulse-red 1.8s ease-in-out infinite':
                          mutPhase===1?'btn-depress .18s ease-out both':'none',
                boxShadow:mutateState==='armed'
                  ?'0 0 22px #E63B2E,0 6px 0 #080807,inset 0 2px 6px rgba(255,255,255,.18)'
                  :mutateState==='accepted'
                  ?'0 0 22px #17C9C2,0 6px 0 #080807'
                  :'0 6px 0 #080807,inset 0 2px 4px rgba(0,0,0,.5)',
                outline:mutateState==='armed'?'4px solid rgba(230,59,46,.25)':'none',
                outlineOffset:5,transition:'background .3s ease,box-shadow .3s ease',
              }}
            >
              {mutateState==='unarmed'?'SELECT':mutateState==='mutating'?'…':mutateState==='accepted'?'✓':'MUTATE'}
            </button>

            <div className="anton" style={{marginTop:11,fontSize:17,letterSpacing:1,lineHeight:1.3,color:mutateState==='unarmed'?(dnaPhase==='ready'?'#E8DDC4':'#4A4038'):mutateState==='accepted'?'#17C9C2':mutateState==='mutating'?'#E63B2E':'#E8DDC4'}}>
              {mutateState==='unarmed'
                ? (dnaPhase==='ready' ? 'SPECIMEN READY' : 'NOT ARMED')
                : mutateState==='mutating' ? 'MUTATION IN PROGRESS'
                : mutateState==='accepted' ? 'ORGAN ACCEPTED'
                : 'ARMED // 0042'}
            </div>
            <div className="mono" style={{fontSize:10,color:'#4A4038',marginTop:5,letterSpacing:.8,lineHeight:1.5,fontWeight:700}}>
              {mutateState==='accepted'
                ? 'Specimen stability updated.\nMedical opinion unavailable.'
                : dnaPhase==='ready' && mutateState==='unarmed'
                  ? 'SELECT AN ORGAN'
                  : 'PWR: ON  ·  CAB-7 CONNECTED'}
            </div>
          </div>
        </div>
      </div>

      {/* MUTATING TEXT FLASH */}
      {mutating&&(
        <div className="anton" style={{position:'absolute',left:520,top:450,zIndex:20,color:'#E63B2E',fontSize:44,transform:'rotate(-7deg)',textShadow:'4px 4px 0 #080807',pointerEvents:'none',animation:'screen-flash .7s steps(3,end) 2'}}>
          MUTATING...
        </div>
      )}

      {/* ── DOCTOR CHARACTER — behind panels (z:8 < instrument panels z:9) ── */}
      {dnaPhase==='intake' && (
        <img
          src="/doctor.png"
          alt="Dr. Specimen"
          draggable={false}
          style={{
            position:'absolute',
            right:0,
            bottom:0,
            width:310,
            height:'auto',
            zIndex:8,
            pointerEvents:'none',
            userSelect:'none',
            filter:'drop-shadow(-8px 0 28px rgba(0,0,0,.65))',
          }}
        />
      )}

      {/* ── DNA INTAKE TERMINAL (overlays chamber until specimen is ready) ── */}
      {dnaPhase==='intake' && (
        <DNAIntake
          onComplete={handleDNAComplete}
          onScopeEvent={scopeDispatch}
          onStart={() => {
            setShowMutateVideo(true);
            if (mutateVideoRef.current) {
              mutateVideoRef.current.currentTime = 0;
              mutateVideoRef.current.play().catch(() => {});
            }
          }}
        />
      )}

      {/* ── DR. SCOPE MONITOR — top-right corner, above Zone 3 ticket ── */}
      <DrScopeAssistant event={drScopeEvent} onReplayIntro={onReplayIntro}/>


      {/* ── ARIA LIVE REGION — specimen reveal announcement ── */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{position:'absolute',width:1,height:1,overflow:'hidden',clip:'rect(0,0,0,0)',whiteSpace:'nowrap'}}
      >
        {dnaPhase==='ready' && baseSpecimen
          ? `Base specimen created: ${baseSpecimen.codename}. Feature organs are now available.`
          : ''}
      </div>

    </div>
    </div>
  );
}

export default MutationLab;
