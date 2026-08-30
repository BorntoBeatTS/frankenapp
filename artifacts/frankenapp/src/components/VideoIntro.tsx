import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const INTRO_KEY = 'frankenapp_intro_seen';

interface VideoIntroProps {
  open: boolean;
  forcePlay?: boolean;
  onComplete: () => void;
}

type OverlayLabel = 'access' | 'descending' | 'chamber' | null;

export function VideoIntro({ open, forcePlay, onComplete }: VideoIntroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [label,    setLabel]    = useState<OverlayLabel>(null);
  const [fastMode, setFastMode] = useState(false);
  const [fastDone, setFastDone] = useState(false);

  const finish = useCallback(() => {
    localStorage.setItem(INTRO_KEY, '1');
    onComplete();
  }, [onComplete]);

  // Decide full vs fast mode on open
  useEffect(() => {
    if (!open) { setFastDone(false); setLabel(null); return; }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const useFast = reduced && !forcePlay;   // fast mode only for reduced-motion users

    setFastMode(useFast);
    setLabel(null);

    if (useFast) {
      setLabel('chamber');
      const t = setTimeout(() => { setFastDone(true); finish(); }, 1100);
      return () => clearTimeout(t);
    }

    // Full video playback every time
    const vid = videoRef.current;
    if (!vid) return;
    vid.currentTime = 0;
    vid.play().catch(() => finish());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Timed text overlays
  const handleTimeUpdate = useCallback(() => {
    const vid = videoRef.current;
    if (!vid || !vid.duration) return;
    const t = vid.currentTime;
    const d = vid.duration;
    if (t < 3)            setLabel('access');
    else if (t < d - 3)   setLabel('descending');
    else                  setLabel('chamber');
  }, []);

  // Escape key
  useEffect(() => {
    if (!open || fastMode) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') finish(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, fastMode, finish]);

  const labelText: Record<NonNullable<OverlayLabel>, string> = {
    access:     'ACCESS GRANTED // LAB 77A',
    descending: 'DESCENDING TO MUTATION LEVEL',
    chamber:    'CHAMBER ONLINE',
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="video-intro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: fastMode ? 0.2 : 0.4 }}
          style={{
            position:'fixed', inset:0, zIndex:10000,
            background:'#000',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}
        >
          {/* Landing page black cover */}
          <div style={{position:'absolute',inset:0,background:'#000',zIndex:0}}/>

          {/* ── FAST MODE: chamber activation flash ── */}
          {fastMode && !fastDone && (
            <div style={{
              position:'absolute', inset:0, zIndex:2,
              display:'flex', flexDirection:'column',
              alignItems:'center', justifyContent:'center', gap:16,
            }}>
              <div style={{
                width:120, height:120, borderRadius:'50%',
                border:'3px solid #17C9C2',
                boxShadow:'0 0 60px #17C9C2, 0 0 120px rgba(23,201,194,.4)',
                animation:'cyan-pulse 0.6s ease-in-out infinite',
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                <div style={{
                  width:60, height:60, borderRadius:'50%',
                  background:'radial-gradient(circle, #17C9C2 0%, rgba(23,201,194,.3) 70%)',
                }}/>
              </div>
              <div style={{
                fontFamily:"'IBM Plex Mono', monospace",
                fontSize:11, letterSpacing:4, color:'#17C9C2',
                animation:'cyan-pulse 0.8s ease-in-out infinite',
              }}>
                CHAMBER ACTIVATING…
              </div>
            </div>
          )}

          {/* ── FULL MODE: video ── */}
          {!fastMode && (
            <video
              ref={videoRef}
              src="/lab-intro.mp4"
              onEnded={finish}
              onTimeUpdate={handleTimeUpdate}
              playsInline
              muted={false}
              style={{
                position:'absolute', inset:0, zIndex:1,
                width:'100%', height:'100%',
                objectFit:'cover',
              }}
              onClick={e => e.stopPropagation()}
            />
          )}

          {/* ── OVERLAY LABELS ── */}
          <AnimatePresence mode="wait">
            {label && !fastMode && (
              <motion.div
                key={label}
                initial={{ opacity:0, y:6 }}
                animate={{ opacity:1, y:0 }}
                exit={{ opacity:0, y:-6 }}
                transition={{ duration:0.35 }}
                style={{
                  position:'absolute',
                  top: label === 'chamber' ? undefined : 48,
                  bottom: label === 'chamber' ? 72 : undefined,
                  left:'50%', transform:'translateX(-50%)',
                  zIndex:3, textAlign:'center',
                  pointerEvents:'none',
                }}
              >
                <div style={{
                  display:'inline-block',
                  background:'rgba(8,7,5,.85)',
                  border:'1px solid rgba(23,201,194,.5)',
                  padding:'8px 24px',
                  boxShadow:'0 0 24px rgba(23,201,194,.25)',
                }}>
                  <span style={{
                    fontFamily:"'IBM Plex Mono', monospace",
                    fontSize:11, letterSpacing:4, fontWeight:700,
                    color:'#17C9C2',
                    animation:'cyan-pulse 1.4s ease-in-out infinite',
                    display:'inline-block',
                  }}>
                    {labelText[label]}
                  </span>
                  <span style={{
                    display:'inline-block', width:7, height:7, borderRadius:'50%',
                    background:'#17C9C2', marginLeft:10, verticalAlign:'middle',
                    animation:'cyan-pulse 1s ease-in-out infinite',
                  }}/>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── VIGNETTE ── */}
          {!fastMode && (
            <div style={{
              position:'absolute', inset:0, zIndex:2, pointerEvents:'none',
              background:'linear-gradient(to bottom, rgba(0,0,0,.55) 0%, transparent 25%, transparent 75%, rgba(0,0,0,.55) 100%)',
            }}/>
          )}

          {/* ── SKIP BUTTON ── */}
          {!fastMode && (
            <button
              onClick={e => { e.stopPropagation(); finish(); }}
              style={{
                position:'absolute', bottom:32, right:32, zIndex:4,
                fontFamily:"'IBM Plex Mono', monospace",
                fontSize:10, letterSpacing:3, fontWeight:700,
                color:'rgba(232,221,196,.55)',
                border:'1px solid rgba(232,221,196,.2)',
                background:'rgba(0,0,0,.4)',
                padding:'8px 18px', cursor:'pointer',
                backdropFilter:'blur(4px)',
                transition:'color .2s, border-color .2s',
              }}
              onMouseEnter={e => {
                (e.target as HTMLButtonElement).style.color = '#E8DDC4';
                (e.target as HTMLButtonElement).style.borderColor = 'rgba(232,221,196,.6)';
              }}
              onMouseLeave={e => {
                (e.target as HTMLButtonElement).style.color = 'rgba(232,221,196,.55)';
                (e.target as HTMLButtonElement).style.borderColor = 'rgba(232,221,196,.2)';
              }}
            >
              SKIP ▶▶
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
