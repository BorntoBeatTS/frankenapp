import { useState, useEffect, useRef, useCallback } from 'react';

/* ── pose images mapped to game states ────────────────────
   pose-1  default / idle / entry
   pose-2  category selected  (walking menace, clipboard)
   pose-3  DNA intake / save  (presenting clipboard)
   pose-4  specimen ready / organ preview  (holding device)
   pose-5  specimen revealed / high-complexity / accepted (arms wide)
   pose-6  MUTATING  (pulling lever)
──────────────────────────────────────────────────────── */
const POSE_MAP: Record<string, string> = {
  lab_entry:        '/doctor-pose-1.png',
  idle:             '/doctor-pose-1.png',
  dna_opened:       '/doctor-pose-3.png',
  specimen_revealed:'/doctor-pose-5.png',
  mutation_started: '/doctor-pose-6.png',
  mutation_done:    '/doctor-pose-5.png',
  save_requested:   '/doctor-pose-3.png',
  saved:            '/doctor-pose-3.png',
  complexity_0:     '/doctor-pose-4.png',
  complexity_1:     '/doctor-pose-4.png',
  complexity_2:     '/doctor-pose-3.png',
  complexity_3:     '/doctor-pose-5.png',
  complexity_4:     '/doctor-pose-5.png',
};
const CAT_POSE  = '/doctor-pose-2.png';
const ORG_POSE  = '/doctor-pose-4.png';
function poseFor(type: string): string {
  if (type.startsWith('cat_')) return CAT_POSE;
  if (type.startsWith('organ_')) return ORG_POSE;
  return POSE_MAP[type] ?? '/doctor-pose-1.png';
}

/* ── dialogue map ──────────────────────────────────────── */
const DIALOGUES: Record<string, string> = {
  lab_entry:         'At last. A builder with questionable judgment.',
  dna_opened:        'Tell me what you\'re building. I need its DNA before I can give it a body.',
  cat_Finance:       'Finance. Nervous around receipts and naturally attracted to spreadsheets.',
  cat_Restaurant:    'A restaurant organism. Multiple arms are practically mandatory.',
  'cat_Real Estate': 'Real estate. Large body, expensive organs and an instinct for location.',
  cat_Ecommerce:     'Ecommerce. It will consume inventory and demand payments immediately.',
  cat_Social:        'Social. Craves attention, runs on engagement and will never sleep.',
  cat_Education:     'Education. Patient, optimistic, and completely unprepared for the users.',
  cat_Health:        'Health. Handle carefully. It monitors everything, including you.',
  cat_Gaming:        'Gaming. Addictive by design. I respect the commitment.',
  cat_Creator:       'Creator. Loud, opinionated and convinced it deserves a podcast.',
  cat_Developer:     'Developer slash AI. Writes its own documentation. Terrifying.',
  cat_Productivity:  'Productivity. A noble lie we all agree to tell ourselves.',
  cat_Travel:        'Travel. Always somewhere else, never quite on time.',
  specimen_revealed: 'There you are. Unstable, confused… perfect.',
  organ_PAYMENTS:    'Payments? The organ that makes everything suddenly complicated.',
  organ_AI:          'A brain. Bold choice. Let us hope it never reads the roadmap.',
  organ_CHAT:        'A mouth. Excellent. Your app can now interrupt people.',
  mutation_started:  'Stand back. This procedure has been tested at least once.',
  complexity_0:      'Barely alive. Almost responsible.',
  complexity_1:      'Healthy. Suspiciously healthy.',
  complexity_2:      'Interesting. It has begun developing opinions.',
  complexity_3:      'Excellent. Legal is going to hate this.',
  complexity_4:      'IT\'S ALIVE! And significantly over budget!',
  save_requested:    'Label it before it escapes.',
  saved:             'Specimen archived. The paperwork is now someone else\'s problem.',
  idle:              'The chamber does not bite. Usually.',
};

export interface DrScopeEvent {
  type: string;
  ts:   number;
}

interface Props {
  event:          DrScopeEvent | null;
  onReplayIntro?: () => void;
}

/* ── typewriter ──────────────────────────────────────── */
function useTypewriter(text: string, speed = 26) {
  const [typed, setTyped] = useState('');
  const [done,  setDone]  = useState(false);
  const ref = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    setTyped(''); setDone(false);
    let i = 0;
    const tick = () => {
      i++; setTyped(text.slice(0, i));
      if (i < text.length) ref.current = setTimeout(tick, speed + Math.random() * 14);
      else setDone(true);
    };
    ref.current = setTimeout(tick, 160);
    return () => clearTimeout(ref.current);
  }, [text, speed]);
  return { typed, done };
}

export function DrScopeAssistant({ event, onReplayIntro }: Props) {
  const [currentMsg, setCurrentMsg] = useState(DIALOGUES['lab_entry']);
  const [history,    setHistory]    = useState<string[]>([DIALOGUES['lab_entry']]);
  const [histIdx,    setHistIdx]    = useState(0);
  const [muted,      setMuted]      = useState(false);
  const [hidden,     setHidden]     = useState(false);
  const [hasNew,     setHasNew]     = useState(false);
  const [pose,       setPose]       = useState('/doctor-pose-1.png');
  const [poseVisible,setPoseVisible]= useState(true);   // for crossfade
  const idleRef = useRef<ReturnType<typeof setTimeout>>();
  const { typed, done } = useTypewriter(currentMsg);

  const pushMsg = useCallback((msg: string) => {
    if (muted) return;
    setCurrentMsg(msg);
    setHistory(h => { const n=[...h,msg]; setHistIdx(n.length-1); return n; });
    setHasNew(true);
    clearTimeout(idleRef.current);
    idleRef.current = setTimeout(() => {
      const idleMsg = DIALOGUES['idle'];
      setCurrentMsg(idleMsg);
      setHistory(h => { const n=[...h,idleMsg]; setHistIdx(n.length-1); return n; });
      setHasNew(true);
      crossfadePose('/doctor-pose-1.png');
    }, 30_000);
  }, [muted]);

  const crossfadePose = (next: string) => {
    setPoseVisible(false);
    setTimeout(() => { setPose(next); setPoseVisible(true); }, 220);
  };

  // process events
  useEffect(() => {
    if (!event) return;
    const msg = DIALOGUES[event.type] ?? DIALOGUES[`organ_${event.type.replace('organ_','')}`];
    if (msg) pushMsg(msg);
    const nextPose = poseFor(event.type);
    if (nextPose !== pose) crossfadePose(nextPose);

    // revert lever pose after mutation finishes
    if (event.type === 'mutation_started') {
      setTimeout(() => crossfadePose('/doctor-pose-5.png'), 1800);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);

  // initial idle timer
  useEffect(() => {
    idleRef.current = setTimeout(() => {
      setCurrentMsg(DIALOGUES['idle']);
      crossfadePose('/doctor-pose-1.png');
    }, 30_000);
    return () => clearTimeout(idleRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navPrev = () => {
    const i = Math.max(0, histIdx-1);
    setHistIdx(i); setCurrentMsg(history[i]); setHasNew(false);
  };
  const navNext = () => {
    const i = Math.min(history.length-1, histIdx+1);
    setHistIdx(i); setCurrentMsg(history[i]);
    if (i===history.length-1) setHasNew(false);
  };

  /* ── collapsed state (mobile or hidden) ── */
  if (hidden) {
    return (
      <div style={{position:'absolute',right:18,top:10,zIndex:12}}>
        <button
          onClick={() => { setHidden(false); setHasNew(false); }}
          style={{
            width:54, height:54, borderRadius:'50%',
            border:`2px solid ${hasNew ? '#17C9C2' : '#2A2015'}`,
            overflow:'hidden', cursor:'pointer',
            boxShadow: hasNew ? '0 0 16px rgba(23,201,194,.7)' : '0 4px 12px rgba(0,0,0,.7)',
            padding:0, background:'none',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}
        >
          <img
            src={pose}
            alt="Dr. Scope"
            style={{
              width:'160%', height:'160%',
              objectFit:'cover', objectPosition:'top center',
              marginTop:'15%',
              opacity: poseVisible ? 1 : 0,
              transition: 'opacity .22s ease',
            }}
          />
        </button>
        {hasNew && (
          <div style={{
            position:'absolute', top:-4, right:-4,
            width:10, height:10, borderRadius:'50%',
            background:'#17C9C2', boxShadow:'0 0 8px #17C9C2',
          }}/>
        )}
      </div>
    );
  }

  /* ── full monitor ── */
  return (
    <div style={{
      position:'absolute', right:16, bottom:243,
      width:244, zIndex:12,
      fontFamily:"'IBM Plex Mono', monospace",
    }}>
      {/* Metal outer frame */}
      <div style={{
        background:'linear-gradient(145deg,#2A2620,#1A1814)',
        border:'3px solid #080807',
        boxShadow:'6px 6px 0 #080807, 0 0 24px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.05)',
        position:'relative',
      }}>
        {/* Corner rivets */}
        {[0,1,2,3].map(i=>(
          <div key={i} style={{
            position:'absolute',
            top:   i<2?4:'auto', bottom: i>=2?4:'auto',
            left:  i%2===0?4:'auto', right: i%2===1?4:'auto',
            width:7, height:7, borderRadius:'50%',
            background:'linear-gradient(135deg,#8A7E6E,#4A4038)',
            border:'1.5px solid #080807',
            boxShadow:'inset 1px 1px 0 rgba(255,255,255,.25)',
          }}/>
        ))}

        {/* ── Header bar ── */}
        <div style={{
          background:'#080807', borderBottom:'2px solid #17C9C2',
          padding:'5px 10px',
          display:'flex', alignItems:'center', justifyContent:'space-between',
        }}>
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <div style={{
              width:7, height:7, borderRadius:'50%',
              background: hasNew ? '#17C9C2' : '#1A1814',
              boxShadow:  hasNew ? '0 0 10px #17C9C2' : 'none',
              transition:'all .3s', flexShrink:0,
            }}/>
            <span style={{fontSize:8,letterSpacing:2,color:'#17C9C2',fontWeight:700}}>DR. SCOPE</span>
            <span style={{fontSize:7,color:'rgba(23,201,194,.4)',letterSpacing:1}}>// BIOLOGIST</span>
          </div>
          <button
            onClick={() => setHidden(true)}
            style={ctrlBtn('#4A4038')}
            title="Minimise"
          >—</button>
        </div>

        {/* ── Portrait area: full-body pose ── */}
        <div style={{
          position:'relative',
          background:'linear-gradient(180deg,#0A0D0B 0%,#080807 100%)',
          height:168,
          overflow:'hidden',
          borderBottom:'1px solid #161410',
          display:'flex', alignItems:'flex-end', justifyContent:'center',
        }}>
          {/* Scanlines */}
          <div style={{
            position:'absolute',inset:0,pointerEvents:'none',
            backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(23,201,194,.018) 2px,rgba(23,201,194,.018) 3px)',
            zIndex:2,
          }}/>
          {/* Cyan glow from bottom */}
          <div style={{
            position:'absolute',bottom:0,left:0,right:0,height:60,
            background:'linear-gradient(0deg,rgba(23,201,194,.12) 0%,transparent 100%)',
            pointerEvents:'none', zIndex:1,
          }}/>

          {/* Doctor image — full body, bottom-aligned so feet anchor to frame bottom */}
          <img
            src={pose}
            alt="Dr. Scope"
            style={{
              position:'relative', zIndex:3,
              height:'94%', width:'auto',
              maxWidth:'100%',
              objectFit:'contain', objectPosition:'bottom center',
              opacity: poseVisible ? 1 : 0,
              transition:'opacity .22s ease',
              filter:'drop-shadow(0 0 18px rgba(23,201,194,.22)) drop-shadow(0 4px 8px rgba(0,0,0,.6))',
            }}
          />

          {/* Muted banner */}
          {muted && (
            <div style={{
              position:'absolute',top:0,left:0,right:0,
              background:'rgba(230,59,46,.12)',
              border:'1px solid rgba(230,59,46,.3)',
              zIndex:4, textAlign:'center',
              padding:'3px 0',
              fontSize:7,letterSpacing:2,color:'#E63B2E',fontWeight:700,
            }}>MUTED</div>
          )}
        </div>

        {/* ── Dialogue ── */}
        <div style={{
          background:'#060806',
          padding:'7px 10px 6px',
          borderBottom:'1px solid #161410',
          minHeight:46,
        }}>
          <div style={{
            fontSize:8.5, lineHeight:1.55, color:'#C8B89A',
            letterSpacing:.3,
          }}>
            {typed}
            {!done && <span style={{opacity:.45}}>█</span>}
          </div>
        </div>

        {/* ── Controls ── */}
        <div style={{
          background:'#0A0907',
          padding:'5px 8px',
          display:'flex', alignItems:'center', justifyContent:'space-between',
        }}>
          {/* History nav */}
          <div style={{display:'flex',gap:3,alignItems:'center'}}>
            <button onClick={navPrev} disabled={histIdx===0}         style={navBtn(histIdx>0)}>◀</button>
            <button onClick={navNext} disabled={histIdx>=history.length-1} style={navBtn(histIdx<history.length-1)}>▶</button>
            <span style={{fontSize:6.5,color:'#3A2A14',letterSpacing:.5,marginLeft:2,alignSelf:'center'}}>
              {histIdx+1}/{history.length}
            </span>
          </div>

          {/* Action buttons */}
          <div style={{display:'flex',gap:3}}>
            <button
              onClick={() => setMuted(m => !m)}
              style={ctrlBtn(muted ? '#E63B2E' : '#3A2A14')}
              title={muted ? 'Unmute' : 'Mute doctor'}
            >{muted ? '◼ MUTED' : '◻ MUTE'}</button>
            {onReplayIntro && (
              <button
                onClick={onReplayIntro}
                style={{...ctrlBtn('#3A2A14'), fontSize:6.5, letterSpacing:1, padding:'2px 5px'}}
                title="Replay entrance"
              >↺ INTRO</button>
            )}
          </div>
        </div>

        {/* Bottom hazard stripe */}
        <div style={{
          height:5,
          background:'repeating-linear-gradient(90deg,#080807 0 6px,#F5D400 6px 10px)',
          borderTop:'2px solid #080807',
        }}/>
      </div>
    </div>
  );
}

/* ── style helpers ─────────────────────────────────────── */
function ctrlBtn(color: string): React.CSSProperties {
  return {
    background:'none', border:`1px solid ${color}`,
    color, fontFamily:"'IBM Plex Mono',monospace",
    fontSize:7, padding:'2px 5px', cursor:'pointer',
    letterSpacing:1, lineHeight:1,
  };
}
function navBtn(enabled: boolean): React.CSSProperties {
  return {
    background:'none', border:`1px solid ${enabled ? '#2A2015' : '#161210'}`,
    color: enabled ? '#E8DDC4' : '#2A2015',
    fontFamily:"'IBM Plex Mono',monospace",
    fontSize:8, padding:'2px 6px', cursor: enabled ? 'pointer' : 'default',
    lineHeight:1,
  };
}
