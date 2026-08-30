import { useState, useEffect, useRef } from 'react';
import { AppDNA, BaseSpecimen, SPECIMEN_MAP } from './specimenData';

export type { AppDNA, BaseSpecimen };

/* ── data ──────────────────────────────────────────────── */
const DEMO: AppDNA = { category:'Finance', audience:'Solo Founders', platform:'Mobile First', corePurpose:'Make money behave.' };

const CATEGORIES = [
  { id:'Finance',                tag:'FIN', color:'#B9ED22' },
  { id:'Restaurant',             tag:'RST', color:'#F36B21' },
  { id:'Real Estate',            tag:'RE',  color:'#E8DDC4' },
  { id:'Ecommerce',              tag:'COM', color:'#F5D400' },
  { id:'Social',                 tag:'SOC', color:'#17C9C2' },
  { id:'Productivity / SaaS',    tag:'SAS', color:'#E8DDC4' },
  { id:'Education',              tag:'EDU', color:'#F5D400' },
  { id:'Health',                 tag:'HLT', color:'#E63B2E' },
  { id:'Travel / Hospitality',   tag:'TRV', color:'#17C9C2' },
  { id:'Gaming / Entertainment', tag:'GAM', color:'#E63B2E' },
  { id:'Creator / Media',        tag:'CRE', color:'#F36B21' },
  { id:'Developer / AI',         tag:'DEV', color:'#B9ED22' },
];

const AUDIENCES = ['Consumers','Businesses','Solo Founders','Teams','Creators','Students','Local Communities','Custom…'];
const PLATFORMS  = ['Web','Mobile First','Desktop','API / Automation','Multiplatform'];

type Step = 'intro' | 'cat' | 'aud' | 'plt' | 'purpose';

const DIALOGUES: Record<Step, string> = {
  intro:   'Ah… a new arrival. The chamber stands empty — and I grow restless. Shall we build something that should not exist?',
  cat:     'Splendid. What KIND of application are we stitching together today?',
  aud:     'Excellent choice. Now — who precisely… suffers the consequences of this creation?',
  plt:     'Good. The habitat. On what platform does this beast survive?',
  purpose: 'Nearly there. In your own words — what does this abomination actually DO?',
};

/* ── option bubble ─────────────────────────────────────── */
function Bubble({
  label, tag, color = '#E8DDC4', visible, selected, compact, onClick,
}: {
  label:string; tag?:string; color?:string;
  visible:boolean; selected:boolean; compact:boolean;
  onClick: ()=>void;
}) {
  const [hovered, setHovered] = useState(false);
  const active = selected || hovered;
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        opacity:    visible ? 1 : 0,
        transform:  visible ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity .2s ease, transform .2s ease, border-color .12s, background .12s, color .12s',
        background: selected ? color + '22' : hovered ? color + '14' : 'rgba(13,11,9,.7)',
        border:`1px solid ${active ? color : '#2A2015'}`,
        color: active ? color : '#C8B89A',
        fontFamily:"'IBM Plex Mono', monospace",
        fontSize: compact ? 9 : 10,
        letterSpacing: compact ? 0.7 : 1.3,
        fontWeight: 600,
        padding: compact ? '4px 8px' : '7px 13px',
        cursor: 'pointer',
        display:'flex', alignItems:'center', gap:4,
        lineHeight:1.2,
        backdropFilter:'blur(4px)',
      }}
    >
      {tag && (
        <span style={{
          fontSize:7, letterSpacing:1, fontWeight:700,
          color: active ? color : color + '70',
          transition:'color .12s',
        }}>{tag}</span>
      )}
      {label}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════ */
interface Props {
  onComplete: (dna: AppDNA, specimen: BaseSpecimen) => void;
  onScopeEvent?: (type: string) => void;
  onStart?: () => void;
}

export function DNAIntake({ onComplete, onScopeEvent, onStart }: Props) {
  const [step,        setStep]        = useState<Step>('intro');
  const [typed,       setTyped]       = useState('');
  const [typingDone,  setTypingDone]  = useState(false);
  const [visibleOpts, setVisibleOpts] = useState(0);
  const [selected,    setSelected]    = useState('');
  const [category,    setCategory]    = useState('');
  const [audience,    setAudience]    = useState('');
  const [platform,    setPlatform]    = useState('');
  const [purposeTxt,  setPurposeTxt]  = useState('');
  const [customAud,   setCustomAud]   = useState('');
  const [showCustom,  setShowCustom]  = useState(false);
  const textRef  = useRef<HTMLTextAreaElement>(null);
  const custRef  = useRef<HTMLInputElement>(null);

  /* ── typewriter per step ── */
  useEffect(() => {
    const full = DIALOGUES[step];
    setTyped('');
    setTypingDone(false);
    setVisibleOpts(0);
    setShowCustom(false);
    let i = 0;
    const tick = () => {
      i++;
      setTyped(full.slice(0, i));
      if (i < full.length) setTimeout(tick, 20 + Math.random() * 20);
      else setTimeout(() => setTypingDone(true), 80);
    };
    const t = setTimeout(tick, 300);
    return () => clearTimeout(t);
  }, [step]);

  /* ── stagger option bubbles ── */
  useEffect(() => {
    if (!typingDone || step === 'purpose') return;
    const n = { intro:2, cat:12, aud:8, plt:5, purpose:0 }[step];
    let i = 0;
    const show = () => { i++; setVisibleOpts(i); if (i < n) setTimeout(show, 50); };
    const t = setTimeout(show, 80);
    return () => clearTimeout(t);
  }, [typingDone, step]);

  /* ── focus inputs ── */
  useEffect(() => {
    if (step === 'purpose' && typingDone) setTimeout(() => textRef.current?.focus(), 80);
  }, [step, typingDone]);
  useEffect(() => {
    if (showCustom) setTimeout(() => custRef.current?.focus(), 80);
  }, [showCustom]);

  /* ── pick helper ── */
  const pick = (value: string, next: Step, setter: (v:string)=>void) => {
    setter(value);
    setSelected(value);
    // fire Dr. Scope category event when category is chosen (transitions to 'aud')
    if (next === 'aud') onScopeEvent?.(`cat_${value}`);
    setTimeout(() => { setSelected(''); setStep(next); }, 300);
  };

  /* ── submit with ANALYZE DNA ── */
  const analyze = () => {
    if (!purposeTxt.trim()) return;
    const spec = SPECIMEN_MAP[category] ?? SPECIMEN_MAP['Finance'];
    const eff  = audience === 'Custom…' ? (customAud.trim() || 'Custom') : audience;
    onComplete({ category, audience: eff, platform, corePurpose: purposeTxt }, spec);
  };

  const loadDemo = () => {
    const spec = SPECIMEN_MAP[DEMO.category];
    onComplete(DEMO, spec);
  };

  /* ── active options ── */
  const introOpts = [
    { label:'BEGIN INTAKE', color:'#17C9C2' as string },
    { label:'LOAD DEMO',    color:'#F5D400' as string },
  ];
  const activeOpts =
    step === 'intro' ? introOpts :
    step === 'cat'   ? CATEGORIES.map(c => ({ label:c.id, color:c.color, tag:c.tag })) :
    step === 'aud'   ? AUDIENCES.map(a => ({ label:a,     color:'#E8DDC4' as string })) :
    step === 'plt'   ? PLATFORMS.map(p => ({ label:p,     color:'#E8DDC4' as string })) :
    [];

  /* ── render ─────────────────────────────────────────── */
  return (
    <div style={{
      position:'absolute', inset:0,
      zIndex:10,
      pointerEvents:'none',
    }}>

      {/* ══ SPEECH BUBBLE ═════════════════════════════════ */}
      <div style={{
        position:'absolute',
        bottom: 310,
        right:  260,
        width:  488,
        background:'rgba(9,8,6,.93)',
        border:'1px solid #2A2015',
        boxShadow:'0 10px 40px rgba(0,0,0,.7), inset 0 0 0 1px rgba(255,255,255,.03)',
        padding:'14px 16px 16px',
        pointerEvents:'auto',
        backdropFilter:'blur(6px)',
      }}>
        {/* Arrow pointing RIGHT toward doctor */}
        <div style={{
          position:'absolute', right:-10, top:'50%', transform:'translateY(-50%)',
          width:0, height:0,
          borderTop:'10px solid transparent', borderBottom:'10px solid transparent',
          borderLeft:'10px solid #2A2015', zIndex:0,
        }}/>
        <div style={{
          position:'absolute', right:-8, top:'50%', transform:'translateY(-50%)',
          width:0, height:0,
          borderTop:'9px solid transparent', borderBottom:'9px solid transparent',
          borderLeft:'9px solid rgba(9,8,6,.93)', zIndex:1,
        }}/>

        {/* Label */}
        <div style={{
          display:'flex', alignItems:'center', gap:6,
          marginBottom:10, fontFamily:"'IBM Plex Mono', monospace",
        }}>
          <span style={{
            display:'inline-block', width:5, height:5, borderRadius:'50%',
            background:'#17C9C2', animation:'cyan-pulse 1.2s ease-in-out infinite', flexShrink:0,
          }}/>
          <span style={{ fontSize:8, letterSpacing:2, color:'#17C9C2' }}>DR. SPECIMEN</span>
          <span style={{ fontSize:8, color:'#2A2015', marginLeft:2 }}>——</span>
          <span style={{ fontSize:8, color:'#4A3820', letterSpacing:1 }}>{step.toUpperCase()}</span>
        </div>

        {/* Typewriter text */}
        <div style={{
          fontFamily:"'IBM Plex Mono', monospace",
          fontSize:12, color:'#E8DDC4', lineHeight:1.6, letterSpacing:0.3,
          minHeight:32,
          marginBottom: (activeOpts.length > 0 || step === 'purpose') ? 14 : 0,
        }}>
          {typed}
          {!typingDone && <span style={{ opacity:0.6 }}>█</span>}
        </div>

        {/* Option bubbles */}
        {step !== 'purpose' && !showCustom && activeOpts.length > 0 && (
          <div style={{ display:'flex', flexWrap:'wrap', gap: step === 'cat' ? 5 : 7, alignContent:'flex-start' }}>
            {activeOpts.map((opt, i) => (
              <Bubble
                key={opt.label}
                label={opt.label}
                tag={'tag' in opt ? (opt as {tag:string}).tag : undefined}
                color={opt.color}
                visible={i < visibleOpts}
                selected={selected === opt.label}
                compact={step === 'cat'}
                onClick={() => {
                  if (step === 'intro') {
                    if (opt.label === 'LOAD DEMO') { onStart?.(); loadDemo(); }
                    else setStep('cat');
                  } else if (step === 'cat') {
                    pick(opt.label, 'aud', setCategory);
                  } else if (step === 'aud') {
                    if (opt.label === 'Custom…') { setShowCustom(true); setAudience('Custom…'); }
                    else pick(opt.label, 'plt', setAudience);
                  } else if (step === 'plt') {
                    pick(opt.label, 'purpose', setPlatform);
                  }
                }}
              />
            ))}
          </div>
        )}

        {/* Custom audience input */}
        {step === 'aud' && showCustom && (
          <div style={{ display:'flex', gap:7, alignItems:'stretch' }}>
            <input
              ref={custRef}
              value={customAud}
              onChange={e => setCustomAud(e.target.value)}
              placeholder="Describe your audience…"
              onKeyDown={e => {
                if (e.key === 'Enter' && customAud.trim()) { setAudience(customAud.trim()); setStep('plt'); }
              }}
              style={{
                flex:1, background:'rgba(13,11,9,.8)', border:'1px solid #2A2015',
                color:'#E8DDC4', fontFamily:"'IBM Plex Mono', monospace",
                fontSize:11, padding:'8px 11px', outline:'none', letterSpacing:0.5,
              }}
            />
            <button
              onClick={() => { if (customAud.trim()) { setAudience(customAud.trim()); setStep('plt'); } }}
              style={{
                background:'#17C9C2', border:'none', color:'#080706',
                fontFamily:"'IBM Plex Mono', monospace",
                fontSize:9, fontWeight:700, letterSpacing:2, padding:'8px 14px', cursor:'pointer',
              }}
            >OK →</button>
          </div>
        )}

        {/* Core purpose + ANALYZE DNA */}
        {step === 'purpose' && typingDone && (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <textarea
              ref={textRef}
              value={purposeTxt}
              onChange={e => setPurposeTxt(e.target.value.slice(0, 120))}
              placeholder='E.g. "Help restaurants reduce no-shows."'
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey && purposeTxt.trim()) {
                  e.preventDefault(); analyze();
                }
              }}
              style={{
                background:'rgba(13,11,9,.8)', border:'1px solid #2A2015',
                color:'#E8DDC4', fontFamily:"'IBM Plex Mono', monospace",
                fontSize:11, lineHeight:1.5, letterSpacing:0.4,
                padding:'10px 12px', resize:'none', height:76, outline:'none',
              }}
            />
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:8, color:'#3A2A14', letterSpacing:1 }}>
                {purposeTxt.length} / 120
              </span>
              <button
                disabled={!purposeTxt.trim()}
                onClick={() => { onStart?.(); analyze(); }}
                style={{
                  background: purposeTxt.trim() ? '#E63B2E' : '#1A1814',
                  border: purposeTxt.trim() ? '2px solid #F36B21' : '2px solid #1A1814',
                  color: purposeTxt.trim() ? '#E8DDC4' : '#3A2A14',
                  fontFamily:"'IBM Plex Mono', monospace",
                  fontSize:9, fontWeight:700, letterSpacing:3,
                  padding:'7px 18px',
                  cursor: purposeTxt.trim() ? 'pointer' : 'default',
                  transition:'all .18s',
                  boxShadow: purposeTxt.trim() ? '0 0 12px rgba(230,59,46,.4)' : 'none',
                }}
              >⚗ ANALYZE DNA</button>
            </div>
          </div>
        )}
      </div>

      {/* Doctor image is rendered in MutationLab.tsx at z:8 (behind z:9 panels) */}
    </div>
  );
}
