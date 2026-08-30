import { useState, useRef, useEffect, useCallback } from 'react';
import './landing.css';

interface HomeProps { onOpenLab: () => void }

const SPECIMENS = [
  { num: '001', codename: 'VAULTBELLY',     category: 'FINANCE',       status: 'BALANCED — FOR NOW',        dna: 'Personal finance, budgeting and wealth-management applications.',            behavior: 'Vaultbelly swallows recurring charges at midnight and stores spare change inside its reinforced stomach. It becomes visibly distressed whenever the numbers fail to balance by a single cent.', trait: 'Compulsive accumulation',  risk: 'QUESTIONABLE',      containment: 'Never mention an unused subscription within hearing distance.',                                         img: '/landing/specimen-01-finance.png',      alt: 'Vaultbelly — Finance' },
  { num: '002', codename: 'OVENMOUTH',      category: 'RESTAURANT',    status: 'PERMANENTLY PREHEATED',     dna: 'Restaurants, reservations, delivery and food-service applications.',          behavior: 'Its internal furnace ignites whenever someone says "table for two." It developed four utensil arms after the kitchen received three orders at the same time.',                               trait: 'Hungry multitasking',       risk: 'SPICY',             containment: 'Do not feed after closing time. It interprets leftovers as feature requests.',                           img: '/landing/specimen-02-restaurant.png',   alt: 'Ovenmouth — Restaurant' },
  { num: '003', codename: 'BRICK-EYE',      category: 'REAL ESTATE',   status: 'LOCATION VERIFIED',         dna: 'Property listings, rentals, construction and real-estate applications.',      behavior: 'Brick-Eye grows an additional floor every time a listing is saved. Its measuring-tape tongue has inspected every wall in the archive and rejected three for insufficient natural light.',       trait: 'Territorial expansion',     risk: 'STRUCTURAL',        containment: 'It refuses to occupy anything described as "cozy."',                                                    img: '/landing/specimen-03-realestate.png',   alt: 'Brick-Eye — Real Estate' },
  { num: '004', codename: 'PARCEL MAW',     category: 'ECOMMERCE',     status: 'ORDERS PENDING',            dna: 'Online stores, marketplaces, inventory and fulfillment applications.',        behavior: 'Its stomach is an infinite warehouse. It never chews; it scans, sorts and stores everything it consumes. An abandoned cart causes all eight arms to begin packing nervously.',                 trait: 'Endless fulfillment',       risk: 'OVERSOLD',          containment: 'Keep discount codes locked outside the enclosure.',                                                     img: '/landing/specimen-04-ecommerce.png',    alt: 'Parcel Maw — Ecommerce' },
  { num: '005', codename: 'THE ECHO COLONY',category: 'SOCIAL',        status: 'CURRENTLY TRENDING',        dna: 'Communities, social networks, messaging and audience applications.',           behavior: 'Every notification causes a new head to grow. When one post goes viral, all heads repeat the same comment until engagement returns to normal.',                                               trait: 'Attention multiplication',  risk: 'CONTAGIOUS',        containment: 'Likes are not food, despite repeated claims from the specimen.',                                         img: '/landing/specimen-05-social.png',       alt: 'The Echo Colony — Social' },
  { num: '006', codename: 'TASKCRAWLER',    category: 'PRODUCTIVITY',  status: 'SYNCING…',                  dna: 'Dashboards, workflows, CRMs and productivity applications.',                  behavior: 'It stores every task inside the drawers on its back. Each missed deadline produces another leg, allowing it to run faster while accomplishing absolutely nothing.',                            trait: 'Organized panic',           risk: 'BACKLOG CRITICAL',  containment: 'Never ask it to "circle back." It will.',                                                               img: '/landing/specimen-06-productivity.png', alt: 'Taskcrawler — Productivity' },
  { num: '007', codename: 'CORTEX MINOR',   category: 'EDUCATION',     status: 'STILL ASKING WHY',          dna: 'Learning platforms, courses, tutoring and educational applications.',         behavior: 'Its brain expands with every question answered. Unfortunately, it must delete one unrelated fact to create space and no longer remembers why it entered the archive.',                        trait: 'Uncontrolled curiosity',    risk: 'ENLIGHTENED',       containment: 'Provide pencils. It has begun grading the laboratory staff.',                                           img: '/landing/specimen-07-education.png',    alt: 'Cortex Minor — Education' },
  { num: '008', codename: 'PULSE SLUG',     category: 'HEALTH',        status: 'VITAL SIGNS DRAMATIC',      dna: 'Health, wellness, fitness and medical-support applications.',                 behavior: 'It can hear a heartbeat through three concrete walls. Its body turns bright red whenever someone breaks a seven-day streak.',                                                                 trait: 'Hypervigilant care',        risk: 'SENSITIVE',         containment: 'Not legally permitted to diagnose anything, although it keeps trying.',                                  img: '/landing/specimen-08-health.png',       alt: 'Pulse Slug — Health' },
  { num: '009', codename: 'COMPASS HOUND',  category: 'TRAVEL',        status: 'GATE CHANGED',              dna: 'Travel planning, booking, tourism and hospitality applications.',            behavior: 'Its compass eye always points toward the cheapest available flight, never toward north. The luggage fused permanently to its back after a forty-minute layover.',                              trait: 'Restless navigation',       risk: 'DELAYED',           containment: 'Approaches every closed door as though it were a departure gate.',                                      img: '/landing/specimen-09-travel.png',       alt: 'Compass Hound — Travel' },
  { num: '010', codename: 'RAGEHOPPER',     category: 'GAMING',        status: 'PLAYER TWO MISSING',        dna: 'Games, streaming, trivia and entertainment applications.',                    behavior: 'It feeds on boss fights, high scores and rage quits. Loading screens make its limbs tremble, but at sixty frames per second it purrs.',                                                      trait: 'Competitive instability',   risk: 'OVERCLOCKED',       containment: 'Do not allow it access to difficulty settings.',                                                        img: '/landing/specimen-10-gaming.png',       alt: 'Ragehopper — Gaming' },
  { num: '011', codename: 'INK KRAKEN',     category: 'CREATOR',       status: 'CURRENTLY RECORDING',       dna: 'Content creation, video, photography and media applications.',               behavior: 'It grows a new arm for every platform connected to its account. Its camera eye begins recording several seconds before the creator feels ready.',                                             trait: 'Compulsive expression',     risk: 'VIRAL',             containment: 'The paint stains are permanent. The specimen considers this branding.',                                 img: '/landing/specimen-11-creator.png',      alt: 'Ink Kraken — Creator' },
  { num: '012', codename: 'SOCKET ORACLE',  category: 'DEVELOPER / AI',status: 'DO NOT UNPLUG',             dna: 'Developer tools, artificial intelligence, automation and infrastructure applications.', behavior: 'It can connect to almost anything. It predicts software bugs exactly five minutes after deployment and has grown one cable that nobody in the laboratory can identify.',                trait: 'Unsupervised adaptation',   risk: 'CURSED',            containment: 'It has already read this note.',                                                                        img: '/landing/specimen-12-developer.png',    alt: 'Socket Oracle — Developer / AI' },
];

export function Home({ onOpenLab }: HomeProps) {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);
  const railRef = useRef<HTMLDivElement>(null);

  const spec = SPECIMENS[current];

  const selectSpecimen = useCallback((idx: number) => {
    if (idx === current) return;
    setFading(true);
    setTimeout(() => {
      setCurrent(idx);
      setFading(false);
    }, 240);
  }, [current]);

  // scroll active slot into view
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const slot = rail.querySelector('.lp-sa-slot.active') as HTMLElement | null;
    if (slot) slot.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [current]);

  // lightning flash
  const lightningRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const flash = () => {
      const el = lightningRef.current;
      if (el) { el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 240); }
      t = setTimeout(flash, 7000 + Math.random() * 6000);
    };
    t = setTimeout(flash, 5000);
    return () => clearTimeout(t);
  }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="landing-page">
      <div className="lp-scratches" aria-hidden="true" />
      <div className="lp-lightning" ref={lightningRef} aria-hidden="true" />

      {/* ── POSTER SVG BACKGROUND ── */}
      <div className="lp-bg-poster" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">
          <defs>
            <radialGradient id="bg-spot" cx="72%" cy="49%" r="36%" gradientUnits="objectBoundingBox">
              <stop offset="0%" stopColor="#fff8d6" stopOpacity="0.13"/>
              <stop offset="35%" stopColor="#f7d84a" stopOpacity="0.07"/>
              <stop offset="100%" stopColor="#f2c60f" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="bg-vtl" cx="0%" cy="0%" r="68%" gradientUnits="objectBoundingBox">
              <stop offset="0%" stopColor="#9a7002" stopOpacity="0.14"/>
              <stop offset="100%" stopColor="#9a7002" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="bg-vtr" cx="100%" cy="0%" r="68%" gradientUnits="objectBoundingBox">
              <stop offset="0%" stopColor="#9a7002" stopOpacity="0.12"/>
              <stop offset="100%" stopColor="#9a7002" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="bg-vbl" cx="0%" cy="100%" r="68%" gradientUnits="objectBoundingBox">
              <stop offset="0%" stopColor="#9a7002" stopOpacity="0.13"/>
              <stop offset="100%" stopColor="#9a7002" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="bg-vbr" cx="100%" cy="100%" r="68%" gradientUnits="objectBoundingBox">
              <stop offset="0%" stopColor="#9a7002" stopOpacity="0.14"/>
              <stop offset="100%" stopColor="#9a7002" stopOpacity="0"/>
            </radialGradient>
            <pattern id="bg-dots" x="0" y="0" width="13" height="13" patternUnits="userSpaceOnUse">
              <circle cx="6.5" cy="6.5" r="1.6" fill="#0e0c08"/>
            </pattern>
            <mask id="bg-dots-mask">
              <rect x="0" y="0" width="1440" height="78" fill="white"/>
              <rect x="0" y="822" width="1440" height="78" fill="white"/>
              <rect x="0" y="0" width="72" height="900" fill="white"/>
              <rect x="1368" y="0" width="72" height="900" fill="white"/>
            </mask>
            <radialGradient id="bg-gnd" cx="50%" cy="50%" r="50%" gradientUnits="objectBoundingBox">
              <stop offset="0%" stopColor="#0e0c08" stopOpacity="0.14"/>
              <stop offset="100%" stopColor="#0e0c08" stopOpacity="0"/>
            </radialGradient>
          </defs>
          <rect width="1440" height="900" fill="url(#bg-spot)"/>
          <rect width="1440" height="900" fill="url(#bg-vtl)"/>
          <rect width="1440" height="900" fill="url(#bg-vtr)"/>
          <rect width="1440" height="900" fill="url(#bg-vbl)"/>
          <rect width="1440" height="900" fill="url(#bg-vbr)"/>
          <rect width="1440" height="900" fill="url(#bg-dots)" mask="url(#bg-dots-mask)" opacity="0.08"/>
          <g fill="none" stroke="#0e0c08" strokeWidth="0.8" opacity="0.055">
            <circle cx="1045" cy="428" r="118"/><circle cx="1045" cy="428" r="218"/>
            <circle cx="1045" cy="428" r="330"/><circle cx="1045" cy="428" r="455"/>
          </g>
          <g stroke="#0e0c08" strokeWidth="0.7" fill="none" opacity="0.045">
            <line x1="640" y1="428" x2="1440" y2="428"/>
            <line x1="1045" y1="58" x2="1045" y2="840"/>
            <line x1="966" y1="345" x2="1124" y2="511"/>
            <line x1="1124" y1="345" x2="966" y2="511"/>
          </g>
          <g fill="#0e0c08" opacity="0.08">
            <circle cx="22" cy="22" r="5.5"/><circle cx="22" cy="22" r="2"/>
            <circle cx="1418" cy="22" r="5.5"/><circle cx="1418" cy="22" r="2"/>
            <circle cx="22" cy="878" r="5.5"/><circle cx="22" cy="878" r="2"/>
            <circle cx="1418" cy="878" r="5.5"/><circle cx="1418" cy="878" r="2"/>
          </g>
          <g opacity="0.09" fill="#33a8a0">
            <ellipse cx="1398" cy="52" rx="30" ry="13" transform="rotate(-22 1398 52)"/>
            <ellipse cx="1418" cy="38" rx="11" ry="6" transform="rotate(-35 1418 38)"/>
          </g>
          <path d="M 1434 335 L 1424 358 L 1437 380 L 1427 403" fill="none" stroke="#5fe3d8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.10"/>
          <g transform="translate(1272 762) rotate(-17)">
            <rect x="-55" y="-20" width="110" height="40" fill="none" stroke="#c63a20" strokeWidth="2.5" rx="1" opacity="0.09"/>
            <text x="0" y="7" textAnchor="middle" fontFamily="'Saira Condensed',Impact,sans-serif" fontWeight="700" fontSize="17" letterSpacing="4.5" fill="#c63a20" opacity="0.09">CLASSIFIED</text>
          </g>
          <rect x="7" y="7" width="1426" height="886" fill="none" stroke="#0e0c08" strokeWidth="2.5" opacity="0.07"/>
          <g fill="none" stroke="#0e0c08" strokeWidth="1.6" opacity="0.08">
            <polyline points="7,35 35,35 35,7"/>
            <polyline points="1433,35 1405,35 1405,7"/>
            <polyline points="7,865 35,865 35,893"/>
            <polyline points="1433,865 1405,865 1405,893"/>
          </g>
        </svg>
      </div>

      {/* ── HERO ── */}
      <main className="lp-hero">
        <header className="lp-nav">
          <button className="lp-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="FrankenApp home">
            <img src="/logo-frankenapp.png" alt="FRANKENAPP logo"/>
          </button>
          <nav className="lp-nav-links" aria-label="Main navigation">
            <a href="#mutation-protocol" onClick={e => { e.preventDefault(); scrollTo('mutation-protocol'); }}>HOW IT WORKS</a>
            <a href="#specimens" onClick={e => { e.preventDefault(); scrollTo('specimens'); }}>SPECIMENS</a>
            <button className="lp-hazard" type="button" onClick={onOpenLab} data-testid="nav-cta-open-lab">ENTER LAB</button>
          </nav>
        </header>

        <section className="lp-hero-grid" id="top">
          {/* LEFT: copy */}
          <div className="lp-copy">
            <div className="lp-eyebrow"><span/> WELCOME TO THE MUTATION LAB</div>
            <h1 className="lp-h1">
              <span>IF YOUR APP</span>
              <span className="has-alive">
                WERE{' '}
                <span className="lp-alive-wrap">
                  <img className="lp-alive-img" src="/landing/word-alive.png" alt="ALIVE,"/>
                </span>
              </span>
              <span>WHAT WOULD IT</span>
              <span>LOOK LIKE?</span>
            </h1>
            <p className="lp-intro">FRANKENAPP turns your idea, audience, platform and features into a one-of-a-kind living avatar.</p>
            <div className="lp-tape">
              <b>A LOGO REPRESENTS YOUR BRAND.</b>
              <b>A FRANKENAPP REVEALS YOUR APP'S LIVING ANATOMY.</b>
            </div>
            <div className="lp-cta-row">
              <button className="lp-cta" type="button" onClick={onOpenLab} data-testid="hero-cta-open-lab">CREATE YOUR FRANKENAPP</button>
              <span className="lp-scribble">
                NO TWO SPECIMENS ARE ALIKE
                <svg viewBox="0 0 150 45" aria-hidden="true">
                  <path d="M3 8 Q65 45 137 19"/>
                  <path d="M127 10l12 9-14 4"/>
                </svg>
              </span>
            </div>
            <button className="lp-scroll-cue" type="button" onClick={() => scrollTo('mutation-protocol')}>
              SEE HOW IT MUTATES <strong>→</strong>
            </button>
          </div>

          {/* RIGHT: specimen */}
          <div className="lp-visual" id="hero-visual">
            <div className="lp-warning">FEATURE CREEP HAS A BODY NOW.</div>
            <div className="lp-specimen-stage">
              <div className="lp-tank">
                <img src="/landing/specimen-tank.png" alt="Specimen tank"/>
              </div>
            </div>
          </div>
        </section>

        {/* PROCESS BAR */}
        <section className="lp-process" aria-label="Mutation process">
          <button className="lp-process-btn">
            <img className="lp-icon-img" src="/landing/step-icon-idea.png" alt=""/>
            <span>IDEA</span>
          </button>
          <b className="lp-process-arrow">→</b>
          <button className="lp-process-btn">
            <img className="lp-icon-img" src="/landing/step-icon-dna.png" alt=""/>
            <span>DNA</span>
          </button>
          <b className="lp-process-arrow">→</b>
          <button className="lp-process-btn">
            <img className="lp-icon-img" src="/landing/step-icon-organs.png" alt=""/>
            <span>ORGANS</span>
          </button>
          <b className="lp-process-arrow">→</b>
          <button className="lp-process-btn active">
            <img className="lp-icon-img lp-icon-img--bolt" src="/landing/step-icon-mutation.png" alt=""/>
            <span>MUTATION</span>
          </button>
          <b className="lp-process-arrow">→</b>
          <button className="lp-process-btn">
            <img className="lp-icon-img" src="/landing/step-icon-specimen.png" alt=""/>
            <span>SPECIMEN</span>
          </button>
        </section>
      </main>

      {/* ── STORY STEPS: THE MUTATION PROTOCOL ── */}
      <section className="lp-story-steps" id="mutation-protocol" aria-label="How FrankenApp works">
        <div className="lp-mph">
          <span className="lp-mph-label">CLASSIFIED — LAB DOCUMENT 77A</span>
          <h2 className="lp-mph-title">THE MUTATION<br/>PROTOCOL</h2>
          <p className="lp-mph-sub">Five stages. One living app. No predictable outcomes.</p>
        </div>

        {[
          { step: 1, img: '/landing/word-idea.png',     alt: 'IDEA',         alt2: false, dark: false, num: '01 / 05', title: 'DESCRIBE YOUR APP',       body: <>Tell the laboratory about your app. Category, audience, platform, purpose — your answers define the creature's original DNA.</> },
          { step: 2, img: '/landing/word-dna.png',      alt: 'DNA',          alt2: true,  dark: false, num: '02 / 05', title: 'MEET YOUR BASE SPECIMEN',  body: <>FRANKENAPP translates your DNA into a unique base creature. Its body is a living expression of your product's core purpose.</> },
          { step: 3, img: '/landing/word-organs.png',   alt: 'ORGANS',       alt2: false, dark: false, num: '03 / 05', title: 'INSTALL FEATURE ORGANS',   body: <>Auth, Payments, AI, Chat, Maps — every feature you install becomes a physical organ. Each one mutates the creature's anatomy.</> },
          { step: 4, img: '/landing/word-mutation.png', alt: 'MUTATION',     alt2: true,  dark: false, num: '04 / 05', title: 'WATCH COMPLEXITY GROW',    body: <>From <em>Cute</em> to <em>Healthy</em>, <em>Questionable</em>, <em>Cursed</em> and finally <strong>FRANKENAPP</strong> — the Complexity Meter tracks every decision.</> },
          { step: 5, img: '/landing/word-specimen.png', alt: 'YOUR SPECIMEN',alt2: false, dark: true,  num: '05 / 05', title: 'SAVE YOUR SPECIMEN',       body: <>A living avatar of your product — a visual record of its niche, purpose, features and complexity. No two are exactly alike.</> },
        ].map(({ step, img, alt, alt2, dark, num, title, body }) => (
          <div
            key={step}
            className={`lp-story-row${alt2 ? ' alt' : ''}${dark ? ' dark' : ''}`}
            data-step={step}
          >
            <div className="lp-story-img-wrap">
              <img src={img} alt={alt} className="lp-story-img"/>
            </div>
            <div className="lp-story-desc">
              <span className="lp-step-num">{num}</span>
              <h3>{title}</h3>
              <p>{body}</p>
              {dark && (
                <button className="lp-cta" type="button" onClick={onOpenLab} data-testid="step5-cta-open-lab" style={{ marginTop: 22 }}>
                  CREATE YOUR FRANKENAPP
                </button>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* ── SPECIMEN ARCHIVE ── */}
      <section className="lp-sa" id="specimens" aria-label="Specimen Archive">
        <header className="lp-sa-intro">
          <div className="lp-sa-eyebrow"><span/>RESTRICTED ARCHIVE // BASE ORGANISMS</div>
          <h2 className="lp-sa-heading">MEET THE<br/>SPECIMENS</h2>
          <p className="lp-sa-lead">A specimen is the living body generated from your app's original DNA — its category, audience, platform and purpose. This is only the beginning. Every feature you install becomes a physical organ and changes it forever.</p>
          <div className="lp-sa-note">They were supposed to be templates. They developed personalities.</div>
          <div className="lp-sa-count"><span className="lp-sa-count-num">12</span> BASE ORGANISMS RECOVERED</div>
        </header>

        <div className="lp-sa-station">
          {/* LEFT: Scanner */}
          <div className="lp-sa-scanner" aria-hidden="true">
            <div className="lp-sa-frame">
              <svg className="lp-sa-frame-ring" viewBox="0 0 500 500" aria-hidden="true">
                <circle cx="250" cy="250" r="238" fill="none" stroke="#2a2720" strokeWidth="14"/>
                <circle cx="250" cy="250" r="238" fill="none" stroke="#17C9C2" strokeWidth="1.2" strokeDasharray="12 18" opacity=".55" className="lp-sa-ring-spin"/>
                <circle cx="250" cy="250" r="210" fill="none" stroke="#3a342a" strokeWidth="6"/>
                <g className="lp-sa-ticks" stroke="#17C9C2" strokeWidth="1" opacity=".4">
                  <line x1="250" y1="12" x2="250" y2="28"/><line x1="250" y1="472" x2="250" y2="488"/>
                  <line x1="12" y1="250" x2="28" y2="250"/><line x1="472" y1="250" x2="488" y2="250"/>
                  <line x1="132" y1="31" x2="139" y2="43"/><line x1="361" y1="457" x2="368" y2="469"/>
                  <line x1="31" y1="132" x2="43" y2="139"/><line x1="457" y1="361" x2="469" y2="368"/>
                  <line x1="469" y1="132" x2="457" y2="139"/><line x1="43" y1="361" x2="31" y2="368"/>
                </g>
                <circle cx="66" cy="66" r="22" fill="#1a1814" stroke="#3a342a" strokeWidth="3"/>
                <path d="M54 66 A12 12 0 0 1 78 66" fill="none" stroke="#17C9C2" strokeWidth="2.2" strokeLinecap="round" opacity=".7" className="lp-sa-gauge-1"/>
                <circle cx="434" cy="66" r="22" fill="#1a1814" stroke="#3a342a" strokeWidth="3"/>
                <path d="M422 66 A12 12 0 0 1 446 66" fill="none" stroke="#F5D400" strokeWidth="2.2" strokeLinecap="round" opacity=".7"/>
                <circle cx="66" cy="434" r="22" fill="#1a1814" stroke="#3a342a" strokeWidth="3"/>
                <path d="M54 434 A12 12 0 0 1 78 434" fill="none" stroke="#E63B2E" strokeWidth="2.2" strokeLinecap="round" opacity=".7" className="lp-sa-gauge-2"/>
              </svg>

              <div className="lp-sa-platform">
                <div className="lp-sa-scan-line"/>
                <div className="lp-sa-specimen-stage">
                  <img
                    className={`lp-sa-creature${fading ? ' sa-exit' : ''}`}
                    src={spec.img}
                    alt={spec.alt}
                    draggable={false}
                  />
                </div>
                <div className="lp-sa-shadow"/>
              </div>
              <div className="lp-sa-beacon"/>
              <div className="lp-sa-cables">
                <svg viewBox="0 0 500 100" className="lp-sa-cable-svg">
                  <path d="M0 50 Q80 20 150 50 Q220 80 300 50 Q380 20 500 50" fill="none" stroke="#2a2720" strokeWidth="4"/>
                  <path d="M0 65 Q90 40 180 65 Q270 90 360 65 Q430 45 500 65" fill="none" stroke="#1e1c18" strokeWidth="3"/>
                </svg>
              </div>
            </div>

            <div className="lp-sa-id-plate">
              <span className="lp-sa-id-code">SPEC-<span className="lp-sa-id-num">{spec.num}</span></span>
              <span className="lp-sa-id-counter"><span className="lp-sa-counter-cur">{String(current + 1).padStart(2,'0')}</span> / 12</span>
            </div>

            {/* Rail */}
            <div className="lp-sa-rail-wrap">
              <div
                className="lp-sa-rail"
                ref={railRef}
                tabIndex={0}
                aria-label="Scroll to select specimen"
                onKeyDown={e => {
                  if (e.key === 'ArrowRight') { e.preventDefault(); selectSpecimen((current+1) % SPECIMENS.length); }
                  if (e.key === 'ArrowLeft')  { e.preventDefault(); selectSpecimen((current-1+SPECIMENS.length) % SPECIMENS.length); }
                }}
                onWheel={e => { e.preventDefault(); selectSpecimen((current + (e.deltaY > 0 ? 1 : -1) + SPECIMENS.length) % SPECIMENS.length); }}
              >
                {SPECIMENS.map((s, i) => (
                  <button
                    key={s.num}
                    className={`lp-sa-slot${i === current ? ' active' : ''}`}
                    onClick={() => selectSpecimen(i)}
                    aria-label={`Specimen ${s.num}: ${s.codename}`}
                    aria-pressed={i === current}
                  >
                    <span className="lp-sa-slot-num">{s.num}</span>
                    <img className="lp-sa-slot-img" src={s.img} alt={s.alt} draggable={false}/>
                    <span className="lp-sa-slot-cat">{s.category}</span>
                    <span className="lp-sa-slot-led"/>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Dossier */}
          <div className="lp-sa-dossier" role="region" aria-label="Specimen dossier">
            <div className={`lp-sa-clipboard${fading ? ' fade' : ''}`}>
              <div className="lp-sa-clip-top"/>
              <div className="lp-sa-staples"><span/><span/></div>
              <div className="lp-sa-tape lp-sa-tape--1"/>
              <div className="lp-sa-tape lp-sa-tape--2"/>
              <div className="lp-sa-stamp-wrap"><div className="lp-sa-stamp"/></div>

              <div className="lp-sa-doc-header">
                <div className="lp-sa-doc-eyebrow">CLASSIFIED // LAB DOCUMENT</div>
                <div className="lp-sa-doc-num">SPECIMEN {spec.num}</div>
              </div>

              <div className="lp-sa-doc-row">
                <span className="lp-sa-doc-label">CODENAME</span>
                <span className="lp-sa-doc-val">{spec.codename}</span>
              </div>
              <div className="lp-sa-doc-row">
                <span className="lp-sa-doc-label">CATEGORY</span>
                <span className="lp-sa-doc-val">{spec.category}</span>
              </div>
              <div className="lp-sa-doc-row lp-sa-status-row">
                <span className="lp-sa-doc-label">ARCHIVE STATUS</span>
                <span className="lp-sa-doc-val lp-sa-status-badge">{spec.status}</span>
              </div>

              <div className="lp-sa-doc-section">
                <span className="lp-sa-doc-label">ORIGIN DNA</span>
                <p className="lp-sa-doc-body">{spec.dna}</p>
              </div>

              <hr className="lp-sa-doc-divider"/>

              <div className="lp-sa-doc-section">
                <span className="lp-sa-doc-label">OBSERVED BEHAVIOR</span>
                <p className="lp-sa-doc-body">{spec.behavior}</p>
              </div>

              <div className="lp-sa-doc-row">
                <span className="lp-sa-doc-label">DOMINANT TRAIT</span>
                <span className="lp-sa-doc-val">{spec.trait}</span>
              </div>
              <div className="lp-sa-doc-row">
                <span className="lp-sa-doc-label">MUTATION RISK</span>
                <span className="lp-sa-doc-val lp-sa-risk-badge">{spec.risk}</span>
              </div>

              <div className="lp-sa-containment">
                <span className="lp-sa-doc-label">⚠ CONTAINMENT NOTE</span>
                <p className="lp-sa-doc-body">{spec.containment}</p>
              </div>

              <div className="lp-sa-doc-cta-row">
                <button className="lp-sa-use-dna" type="button" onClick={onOpenLab} data-testid="dossier-cta-open-lab">
                  USE THIS DNA →
                </button>
              </div>

              <div className="lp-sa-handwrite">No two specimens mutate alike.</div>
            </div>
          </div>
        </div>

        {/* Archive CTA */}
        <div className="lp-sa-archive-cta">
          <div className="lp-sa-cta-tape">
            <div className="lp-sa-cta-tape-inner">
              {Array.from({ length: 8 }, (_, i) => <span key={i}>ARCHIVE LIMIT REACHED</span>)}
            </div>
            <div className="lp-sa-cta-tape-inner" aria-hidden="true">
              {Array.from({ length: 8 }, (_, i) => <span key={i}>ARCHIVE LIMIT REACHED</span>)}
            </div>
          </div>
          <div className="lp-sa-eyebrow" style={{ justifyContent: 'center', marginTop: 60 }}><span/>ARCHIVE LIMIT REACHED</div>
          <h2 className="lp-sa-cta-heading">NONE OF THESE<br/>ARE YOURS.</h2>
          <p className="lp-sa-cta-body">These are only base organisms. Your idea has different DNA, different organs and a different mutation waiting to happen.</p>
          <div className="lp-sa-cta-note">No two specimens mutate alike.</div>
          <div className="lp-sa-cta-btns">
            <button className="lp-cta" type="button" onClick={onOpenLab} data-testid="archive-cta-open-lab">
              GROW YOUR OWN SPECIMEN
            </button>
            <button className="lp-sa-sec-cta" type="button" onClick={onOpenLab} data-testid="archive-lab-cta">
              ENTER THE MUTATION LAB
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
