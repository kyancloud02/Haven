/**
 * InteriorStage — cosy interior scene, inspired by Travelingfrog layout:
 * carved wooden pillar on far left, loft bed upper-left, bookshelf upper-right,
 * ladder down to a mossy ground floor with a stump-table and candle.
 *
 * Clicking the door arc returns to the WorldStage.
 */

import { useRef, useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import InteriorCharacter from './InteriorCharacter'
import characters from '../data/characters.json'
import dialogue from '../data/dialogue.json'

const EASE = { duration: 2.2, ease: 'easeInOut' }

// ─── Per-time-state interior palette overrides ────────────────────────────────
const AMBIENT = {
  AWAY:  { dark: 0.00, candle: 0.18, winLight: 0.82 },
  HOME:  { dark: 0.22, candle: 0.58, winLight: 0.28 },
  SLEEP: { dark: 0.68, candle: 0.92, winLight: 0.00 },
}

// viewBox is landscape 800×580 — "xMidYMid meet" centres it with side bars filled
// by the wrapper's background colour (#2E2010 warm dark).
const VW = 800
const VH = 580

// ─── SmartNode definitions ────────────────────────────────────────────────────
const NODE_SLOTS = {
  LOFT_BED: [
    { svgX: 155, svgY: 260 },  // slot 0 — lies in bed when SLEEP
    { svgX: 220, svgY: 262 },  // slot 1 — sits at loft edge
  ],
  DINING_TABLE: [
    { svgX: 265, svgY: 452 },  // slot 0 — left of stump table
    { svgX: 336, svgY: 452 },  // slot 1 — right of stump table
  ],
  STORAGE_SHELF: [
    { svgX: 460, svgY: 262 },  // slot 0 — near ladder top
    { svgX: 535, svgY: 262 },  // slot 1 — near bookshelf
  ],
}

const NODE_SCALE = {
  LOFT_BED:      0.72,
  DINING_TABLE:  0.82,
  STORAGE_SHELF: 0.72,
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function InteriorStage({ onExit, timeState = 'AWAY', gameState = {}, updateState = () => {}, inventory = [], insideCharIds }) {
  const amb = AMBIENT[timeState] ?? AMBIENT.AWAY
  const svgRef = useRef(null)

  // Inventory checks
  const hasOilLamp     = inventory.includes('oil_lamp')
  const hasWarmBlanket = inventory.includes('warm_blanket')
  const hasHoneyPot    = inventory.includes('honey_pot')
  const hasBoots       = inventory.includes('leather_boots')
  const hasScythe      = inventory.includes('rusty_scythe')

  // ── Layout: SVG → screen coordinate mapping ──────────────────────────────────
  const [layout, setLayout] = useState(null)
  useEffect(() => {
    function calc() {
      const el = svgRef.current
      if (!el) return
      const r  = el.getBoundingClientRect()
      const sc = Math.min(r.width / VW, r.height / VH)
      const ox = (r.width  - VW * sc) / 2
      const oy = (r.height - VH * sc) / 2
      setLayout({ ox: r.left + ox, oy: r.top + oy, scale: sc })
    }
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [])

  function toScreen(svgX, svgY) {
    if (!layout) return null
    return { left: layout.ox + svgX * layout.scale, top: layout.oy + svgY * layout.scale }
  }

  // Only show characters that are currently inside (or all if none tracked yet)
  const visibleChars = insideCharIds && insideCharIds.size > 0
    ? characters.filter(c => insideCharIds.has(c.id))
    : []

  // ── SmartNode assignment: shuffled once per house visit ───────────────────────
  const nodeAssignment = useMemo(() => {
    const shuffled = [...characters].sort(() => Math.random() - 0.5)
    const nodeKeys = Object.keys(NODE_SLOTS)
    const result   = {}
    shuffled.forEach((char, i) => {
      result[char.id] = { nodeKey: nodeKeys[Math.floor(i / 2)], slotIdx: i % 2 }
    })
    return result
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Improv conversation ticker ────────────────────────────────────────────────
  const [convo, setConvo] = useState(null)
  const timerA = useRef(null)
  const timerB = useRef(null)
  const timerC = useRef(null)

  useEffect(() => {
    function fireConvo() {
      const ai = Math.floor(Math.random() * characters.length)
      let bi   = Math.floor(Math.random() * (characters.length - 1))
      if (bi >= ai) bi++
      const a = characters[ai], b = characters[bi]
      const la = dialogue[a.id]?.[timeState] ?? []
      const lb = dialogue[b.id]?.[timeState] ?? []
      if (!la.length || !lb.length) { scheduleNext(); return }
      const speakerText = la[Math.floor(Math.random() * la.length)]
      const replyText   = lb[Math.floor(Math.random() * lb.length)]
      setConvo({ speakerId: a.id, replyId: b.id, phase: 'speak', speakerText, replyText })
      timerB.current = setTimeout(() => {
        setConvo(prev => prev ? { ...prev, phase: 'reply' } : null)
        timerC.current = setTimeout(() => { setConvo(null); scheduleNext() }, 4500)
      }, 3500)
    }
    function scheduleNext() {
      timerA.current = setTimeout(fireConvo, 12000 + Math.random() * 10000)
    }
    timerA.current = setTimeout(fireConvo, 7000 + Math.random() * 5000)
    return () => {
      clearTimeout(timerA.current)
      clearTimeout(timerB.current)
      clearTimeout(timerC.current)
    }
  }, [timeState])

  function getConvoBark(heroId) {
    if (!convo) return null
    if (convo.phase === 'speak' && convo.speakerId === heroId) return convo.speakerText
    if (convo.phase === 'reply' && convo.replyId   === heroId) return convo.replyText
    return null
  }

  return (
    <div className="absolute inset-0" style={{ background: '#2E2010' }}>

      {/* ── Scene SVG ── */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VW} ${VH}`}
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Watercolour displacement */}
          <filter id="ic-wc" x="-6%" y="-6%" width="112%" height="112%">
            <feTurbulence type="fractalNoise" baseFrequency="0.032" numOctaves="3" seed="7" result="n"/>
            <feDisplacementMap in="SourceGraphic" in2="n" scale="6" result="d"/>
            <feGaussianBlur in="d" stdDeviation="0.9"/>
          </filter>
          {/* Soft glow */}
          <filter id="ic-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="12" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="ic-glow-sm" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="6" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          {/* Candle radial */}
          <radialGradient id="ic-candle" cx="50%" cy="40%" r="50%">
            <stop offset="0%"   stopColor="#FFE890" stopOpacity="0.95"/>
            <stop offset="35%"  stopColor="#FFB030" stopOpacity="0.70"/>
            <stop offset="100%" stopColor="#FF5000" stopOpacity="0"/>
          </radialGradient>
          {/* Window sunlight */}
          <radialGradient id="ic-sun" cx="50%" cy="35%" r="55%">
            <stop offset="0%"   stopColor="#FFF8D8" stopOpacity="0.80"/>
            <stop offset="100%" stopColor="#FFE8A0" stopOpacity="0"/>
          </radialGradient>
          {/* Vignette */}
          <radialGradient id="ic-vig" cx="50%" cy="50%" r="70%">
            <stop offset="55%"  stopColor="transparent"/>
            <stop offset="100%" stopColor="rgba(0,0,0,0.60)"/>
          </radialGradient>
          {/* Blanket clip */}
          <clipPath id="ic-blanket-clip">
            <path d="M172,240 C192,236 230,234 268,238 L268,262 L172,262 Z"/>
          </clipPath>
        </defs>

        {/* ══ BACKGROUND WALL ══════════════════════════════════════════════════ */}
        <rect x={0} y={0} width={VW} height={VH} fill="#D4C4A0"/>
        {/* Warm upper-wall gradient */}
        <path d="M0,0 L800,0 L800,200 C640,215 400,210 0,205 Z" fill="#C4AE88" opacity={0.55}/>
        {/* Subtle horizontal texture lines */}
        {[60,120,180,240,300,360,420,480].map((y,i) => (
          <line key={i} x1={0} y1={y} x2={800} y2={y} stroke="#A89070" strokeWidth="0.6" opacity={0.12}/>
        ))}
        {/* Recessed back wall behind ground floor */}
        <path d="M130,270 Q400,252 670,270 L670,580 L130,580 Z" fill="#B8A880" opacity={0.28}/>

        {/* ══ LEFT PILLAR (carved tree trunk) ════════════════════════════════ */}
        {/* Main trunk */}
        <path d="M8,0 C4,100 2,240 4,360 C6,460 8,530 10,580 L68,580 C70,530 72,460 72,360 C72,240 70,100 64,0 Z"
          fill="#7B4820"/>
        {/* Left shadow */}
        <path d="M8,0 C4,100 2,240 4,360 C6,460 8,530 10,580 L28,580 C26,530 24,460 24,360 C22,240 20,100 20,0 Z"
          fill="#4A2808" opacity={0.70}/>
        {/* Highlight ridge */}
        <path d="M50,0 C52,100 53,240 52,360 C51,460 50,530 50,580 L56,580 C57,530 58,460 57,360 C56,240 55,100 54,0 Z"
          fill="#B07038" opacity={0.60}/>
        {/* Carved spiral grooves */}
        {[45,110,175,245,315,390,465,540].map((y,i) => (
          <path key={i}
            d={`M14,${y} Q38,${y+11} 62,${y} Q38,${y+22} 14,${y+33}`}
            fill="none" stroke="#4A2808" strokeWidth="3" opacity={0.45}/>
        ))}

        {/* ══ CEILING / ROOF ═══════════════════════════════════════════════════ */}
        <path d="M0,0 L800,0 L800,54 C600,62 400,60 0,56 Z" fill="#C0A870" opacity={0.70}/>
        {/* Ceiling beam across top */}
        <rect x={0} y={50} width={800} height={12} fill="#7B5228" opacity={0.55}/>
        <rect x={0} y={50} width={800} height={3}  fill="#C07838" opacity={0.45}/>
        {/* Vertical ceiling beams */}
        {[200,400,600].map((bx,i) => (
          <rect key={i} x={bx-5} y={0} width={10} height={60} fill="#7B5228" opacity={0.35}/>
        ))}

        {/* ══ WINDOW (right, loft level) ════════════════════════════════════ */}
        {/* Window recess */}
        <rect x={578} y={52} width={160} height={122} rx={4} fill="#B0A888" opacity={0.40}/>
        {/* Glass panes */}
        <rect x={582} y={56} width={152} height={114} rx={3} fill="#90C8E8" opacity={0.35}/>
        {/* Daylight glow through window */}
        <motion.ellipse cx={658} cy={113} rx={110} ry={80}
          fill="url(#ic-sun)"
          animate={{ opacity: amb.winLight * 0.9 }}
          transition={EASE}/>
        {/* Window bars */}
        <line x1={658} y1={58} x2={658} y2={168} stroke="#6A4820" strokeWidth="4" opacity={0.65}/>
        <line x1={584} y1={113} x2={732} y2={113} stroke="#6A4820" strokeWidth="3.5" opacity={0.65}/>
        {/* Window frame */}
        <rect x={580} y={54} width={156} height={118} rx={5} fill="none" stroke="#6A4820" strokeWidth="7"/>
        {/* Window light beam on floor (only AWAY) */}
        <motion.path
          d="M582,60 L800,200 L800,140 L734,58 Z"
          fill="white"
          animate={{ opacity: amb.winLight * 0.13 }}
          transition={EASE}/>

        {/* ══ BOOKSHELF (right side, loft level) ════════════════════════════ */}
        {/* Back panel */}
        <rect x={482} y={64} width={90} height={204} rx={3} fill="#8A5A28" opacity={0.55}/>
        {/* Shelf boards */}
        {[108,150,194,238].map((sy,i) => (
          <rect key={i} x={480} y={sy} width={94} height={8} rx={2} fill="#C07838"/>
        ))}
        {/* Books – row 1 */}
        {[
          [485,70,10,36,'#C03020'],[496,72,9,34,'#204890'],[506,68,12,38,'#8A6020'],
          [519,71,10,35,'#305A20'],[530,69,13,37,'#702828'],[544,73,9,33,'#1A3858'],
          [554,70,11,36,'#885820'],[566,72,10,34,'#C03020'],
        ].map(([x,y,w,h,fill],i) => (
          <rect key={i} x={x} y={y} width={w} height={h} rx={1} fill={fill}/>
        ))}
        {/* Books – row 2 */}
        {[
          [485,116,12,32,'#305A20'],[498,118,9,30,'#882020'],[508,115,11,33,'#1A3858'],
          [520,117,13,31,'#8A6020'],[534,116,10,32,'#C03020'],[545,115,12,33,'#204890'],
          [558,118,9,30,'#305A20'],[568,116,11,32,'#702828'],
        ].map(([x,y,w,h,fill],i) => (
          <rect key={i} x={x} y={y} width={w} height={h} rx={1} fill={fill}/>
        ))}
        {/* Jars / items – row 3 */}
        <ellipse cx={496} cy={180} rx={9} ry={13} fill="#A0C888" opacity={0.85}/>
        <ellipse cx={496} cy={169} rx={6} ry={4}  fill="#80A868" opacity={0.85}/>
        <ellipse cx={516} cy={182} rx={11} ry={11} fill="#9BB0D0" opacity={0.80}/>
        <ellipse cx={516} cy={172} rx={7}  ry={4}  fill="#7898B8" opacity={0.80}/>
        <rect x={532} y={161} width={8} height={31} rx={1} fill="#C8A060"/>
        <ellipse cx={536} cy={161} rx={8} ry={5} fill="#E0C080"/>
        <rect x={546} y={165} width={7} height={27} rx={1} fill="#C0886A"/>
        <rect x={560} y={162} width={9} height={30} rx={1} fill="#B08840"/>
        {/* Herbs – row 4 */}
        <path d="M488,208 C486,198 490,194 494,202 C496,192 500,190 500,204 C502,194 506,196 504,208 Z" fill="#6A9840"/>
        <path d="M510,206 C508,196 512,192 516,200 C518,190 522,194 520,206 Z" fill="#4A7828"/>
        <ellipse cx={540} cy={220} rx={13} ry={9} fill="#C0988A" opacity={0.75}/>
        <ellipse cx={540} cy={214} rx={9}  ry={5} fill="#D8B0A0" opacity={0.75}/>
        <rect x={558} y={200} width={8} height={32} rx={1} fill="#D0A060" opacity={0.8}/>
        <ellipse cx={562} cy={199} rx={7} ry={4} fill="#E0C080" opacity={0.8}/>
        {/* Shelf unit outline */}
        <rect x={480} y={64} width={94} height={204} rx={3} fill="none" stroke="#5A3810" strokeWidth="1.5" opacity={0.45}/>

        {/* ══ HONEY POT on bookshelf (row 3 overlay) ═══════════════════════ */}
        {hasHoneyPot && (
          <motion.g initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {/* cover some jars */}
            <rect x={538} y={154} width={36} height={42} fill="#D4C4A0"/>
            {/* pot body */}
            <ellipse cx={556} cy={182} rx={17} ry={20} fill="#E8A030"/>
            {/* pot neck */}
            <ellipse cx={556} cy={163} rx={11} ry={7} fill="#F0B840"/>
            {/* lid */}
            <ellipse cx={556} cy={158} rx={13} ry={5} fill="#D09020"/>
            <ellipse cx={556} cy={157} rx={9}  ry={3} fill="#E8C030"/>
            {/* label area */}
            <rect x={543} y={172} width={26} height={14} rx={2} fill="#C87820" opacity={0.50}/>
            {/* honey drip */}
            <path d="M569,178 C572,186 572,194 570,194 C568,194 568,186 571,178 Z" fill="#F0C040" opacity={0.80}/>
            {/* dipper */}
            <line x1={562} y1={157} x2={576} y2={142} stroke="#8A6020" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx={577} cy={140} r={5} fill="#D09030"/>
          </motion.g>
        )}

        {/* ══ LOFT PLATFORM ════════════════════════════════════════════════════ */}
        {/* Top face */}
        <path d="M75,262 L576,262 L576,280 C576,282 574,284 572,284 L78,284 C76,284 75,282 75,280 Z"
          fill="#9A6828"/>
        {/* Front face */}
        <path d="M75,280 L78,284 L572,284 L576,280 L576,294 L75,294 Z"
          fill="#6A4418"/>
        {/* Top highlight edge */}
        <line x1={75} y1={262} x2={576} y2={262} stroke="#D0904A" strokeWidth="2.5" opacity={0.65}/>
        {/* Plank lines */}
        {[100,135,170,205,240,275,310,345,380,415,450,485,520,555].map((px,i) => (
          <line key={i} x1={px} y1={262} x2={px} y2={294} stroke="#6A4418" strokeWidth="1" opacity={0.30}/>
        ))}
        {/* Underside shadow */}
        <rect x={75} y={292} width={502} height={14} fill="rgba(0,0,0,0.20)"/>

        {/* ══ BED / CUSHION (upper left, on loft) ══════════════════════════ */}
        {/* Bed frame */}
        <rect x={85} y={226} width={186} height={40} rx={4} fill="#9A6030"/>
        {/* Mattress */}
        <rect x={88} y={218} width={180} height={46} rx={5} fill="#E8D8B8"/>
        {/* Blue cushion */}
        <rect x={90} y={212} width={178} height={50} rx={6} fill="#3070B8"/>
        {/* Cushion highlight */}
        <path d="M94,216 C116,212 155,212 175,216 C158,214 128,214 94,218 Z"
          fill="#5090D8" opacity={0.50}/>
        {/* Pillow */}
        <rect x={92} y={210} width={70} height={30} rx={8} fill="#F0E8D8"/>
        <path d="M96,214 C112,211 145,212 158,215 Z" fill="white" opacity={0.50}/>

        {/* ══ BLANKET (conditional — warm stripes or basic) ══════════════════ */}
        {hasWarmBlanket ? (
          <g>
            <g clipPath="url(#ic-blanket-clip)">
              <rect x={168} y={234} width={106} height={32} fill="#C03028"/>
              {/* coloured stripes */}
              <rect x={176} y={234} width={9} height={32} fill="#E06040" opacity={0.72}/>
              <rect x={191} y={234} width={7} height={32} fill="#F0C030" opacity={0.68}/>
              <rect x={203} y={234} width={9} height={32} fill="#4880C8" opacity={0.68}/>
              <rect x={217} y={234} width={7} height={32} fill="#50A840" opacity={0.66}/>
              <rect x={229} y={234} width={9} height={32} fill="#E06040" opacity={0.65}/>
              <rect x={243} y={234} width={7} height={32} fill="#F0C030" opacity={0.62}/>
              <rect x={255} y={234} width={9} height={32} fill="#4880C8" opacity={0.60}/>
            </g>
            <path d="M172,240 C192,236 230,234 268,238" fill="none" stroke="#A03020" strokeWidth="1.8" opacity={0.38}/>
          </g>
        ) : (
          <>
            <path d="M172,240 C192,236 230,234 268,238 L268,262 L172,262 Z" fill="#C04838" opacity={0.82}/>
            <path d="M172,240 C192,236 230,234 268,238" fill="none" stroke="#A03020" strokeWidth="2" opacity={0.45}/>
          </>
        )}

        {/* Bed legs */}
        <rect x={89}  y={260} width={10} height={6} rx={2} fill="#5A3010"/>
        <rect x={260} y={260} width={10} height={6} rx={2} fill="#5A3010"/>

        {/* Sleeping characters handled by InteriorCharacter DOM overlays */}

        {/* Small scroll on bed */}
        <rect x={136} y={209} width={6} height={14} rx={2} fill="#E8D8A8"/>
        <rect x={133} y={208} width={12} height={4} rx={1} fill="#C8B888"/>
        <rect x={133} y={219} width={12} height={4} rx={1} fill="#C8B888"/>

        {/* ══ HANGING ITEMS FROM LOFT EDGE ═════════════════════════════════ */}
        {/* String */}
        <line x1={340} y1={294} x2={340} y2={344} stroke="#7A5028" strokeWidth="1.4"/>
        {/* Herbs bundle */}
        <path d="M328,339 C334,327 342,324 346,337 C342,331 336,331 328,341 Z" fill="#7AB040"/>
        <path d="M337,344 C341,332 347,329 350,342 Z" fill="#5A8828"/>
        <line x1={340} y1={344} x2={340} y2={350} stroke="#7A5028" strokeWidth="1.5"/>
        <ellipse cx={340} cy={352} rx={5} ry={3} fill="#A08040"/>

        <line x1={378} y1={294} x2={378} y2={360} stroke="#7A5028" strokeWidth="1.4"/>
        <path d="M366,355 C372,343 380,340 384,353 C380,347 374,347 366,357 Z" fill="#6A9430"/>
        <path d="M376,360 C380,348 386,345 388,358 Z" fill="#4A7820"/>

        {/* Tiny lantern */}
        <line x1={415} y1={294} x2={415} y2={324} stroke="#7A5028" strokeWidth="1.4"/>
        <rect x={408} y={323} width={14} height={20} rx={3} fill="#D0A040" opacity={0.9}/>
        <motion.circle cx={415} cy={333} r={4} fill="#FFE080"
          animate={{ opacity: [0.65,1.0,0.70,0.95,0.65] }}
          transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}/>
        <motion.circle cx={415} cy={333} r={18} fill="url(#ic-candle)"
          animate={{ opacity: [amb.candle*0.5, amb.candle*0.7, amb.candle*0.45, amb.candle*0.65, amb.candle*0.5] }}
          transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}/>

        {/* ══ LADDER ════════════════════════════════════════════════════════ */}
        <path d="M450,294 C448,390 448,460 450,518" stroke="#6A4018" strokeWidth="7" strokeLinecap="round" fill="none"/>
        <path d="M480,294 C478,390 478,460 480,518" stroke="#6A4018" strokeWidth="7" strokeLinecap="round" fill="none"/>
        {[316,348,380,412,444,476,508].map((ry,i) => (
          <line key={i} x1={451} y1={ry} x2={479} y2={ry}
            stroke="#B07830" strokeWidth="5.5" strokeLinecap="round"/>
        ))}

        {/* ══ GROUND FLOOR ═════════════════════════════════════════════════ */}
        {/* Stone floor */}
        <path d="M0,492 C100,480 240,486 400,480 C540,474 680,482 800,476 L800,580 L0,580 Z"
          fill="#9A8878" filter="url(#ic-wc)"/>
        <path d="M0,514 C80,504 200,510 380,504 C520,498 680,506 800,500 L800,580 L0,580 Z"
          fill="#706058" opacity={0.55}/>
        {/* Individual flagstones */}
        {[
          [50,510,52,16],[118,508,46,14],[186,511,58,15],[256,507,52,14],
          [322,510,54,15],[394,507,50,14],[460,510,55,15],[528,508,48,14],
          [596,511,54,15],[664,508,50,14],[730,510,52,15],
          [80,532,55,16],[155,529,50,14],[228,532,58,15],[306,529,52,14],
          [376,532,54,15],[448,529,50,14],[520,532,56,15],[594,530,52,14],
          [662,532,55,15],[730,530,50,14],
        ].map(([cx,cy,rx,ry],i) => (
          <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry}
            fill="#C8B8A8" stroke="#706058" strokeWidth="1" opacity={0.48}/>
        ))}

        {/* ══ MOSS / GRASS PATCH ════════════════════════════════════════════ */}
        <ellipse cx={300} cy={488} rx={115} ry={32} fill="#3A6010" opacity={0.45} filter="url(#ic-wc)"/>
        <ellipse cx={300} cy={480} rx={108} ry={27} fill="#5A9028" filter="url(#ic-wc)"/>
        <ellipse cx={300} cy={474} rx={96}  ry={20} fill="#80B848" opacity={0.80}/>
        {/* Grass tufts */}
        {[200,222,248,272,300,328,355,376,398].map((gx,i) => (
          <path key={i}
            d={`M${gx},474 C${gx-4},462 ${gx-1},456 ${gx+2},463 C${gx+1},453 ${gx+4},450 ${gx+5},460 C${gx+6},451 ${gx+9},450 ${gx+8},458 Z`}
            fill="#3A6010" opacity={0.65}/>
        ))}

        {/* ══ TREE-STUMP TABLE ══════════════════════════════════════════════ */}
        {/* Stump side */}
        <ellipse cx={300} cy={468} rx={58} ry={17} fill="#6A4018"/>
        {/* Stump top */}
        <ellipse cx={300} cy={452} rx={58} ry={17} fill="#9A6030"/>
        {/* Tree rings */}
        <ellipse cx={300} cy={452} rx={42} ry={12} fill="none" stroke="#7A4820" strokeWidth="1.5" opacity={0.48}/>
        <ellipse cx={300} cy={452} rx={27} ry={8}  fill="none" stroke="#7A4820" strokeWidth="1.2" opacity={0.48}/>
        <ellipse cx={300} cy={452} rx={13} ry={4}  fill="none" stroke="#7A4820" strokeWidth="1.0" opacity={0.48}/>
        {/* Stump highlight */}
        <ellipse cx={286} cy={447} rx={16} ry={6} fill="#C08040" opacity={0.32}/>

        {/* ══ CANDLE ON STUMP (with CSS glow filter) ════════════════════════ */}
        <motion.g
          animate={{
            filter: [
              'drop-shadow(0 0 3px rgba(255,155,0,0.50))',
              'drop-shadow(0 0 13px rgba(255,210,60,0.90)) drop-shadow(0 0 5px rgba(255,130,0,0.95))',
              'drop-shadow(0 0 5px rgba(255,175,0,0.62)) drop-shadow(0 0 2px rgba(255,120,0,0.80))',
              'drop-shadow(0 0 15px rgba(255,200,40,0.86)) drop-shadow(0 0 4px rgba(255,150,0,0.90))',
              'drop-shadow(0 0 3px rgba(255,155,0,0.50))',
            ]
          }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Candle body */}
          <rect x={296} y={422} width={8} height={28} rx={2} fill="#E8E0C8"/>
          <rect x={294} y={448} width={12} height={5} rx={1} fill="#C8B898"/>
          {/* Wick */}
          <line x1={300} y1={423} x2={300} y2={418} stroke="#1A0C04" strokeWidth="1.5"/>
          {/* Flame */}
          <motion.g
            animate={{ scaleY:[1,1.18,0.90,1.10,1], scaleX:[1,0.88,1.06,0.92,1] }}
            style={{ transformOrigin:'300px 420px' }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}>
            <path d="M300,404 C304,408 306,415 302,422 C298,415 294,408 298,404 C297,410 300,417 300,422 C300,417 303,410 300,404 Z"
              fill="#FFB030"/>
            <path d="M300,408 C302,413 303,417 301,422 C299,417 297,413 299,408 C299,414 300,418 300,422 C300,418 301,414 300,408 Z"
              fill="#FFE080" opacity={0.90}/>
          </motion.g>
          {/* Candle glow circle */}
          <motion.circle cx={300} cy={413} r={55}
            fill="url(#ic-candle)"
            animate={{ opacity:[amb.candle*0.80,amb.candle,amb.candle*0.72,amb.candle*0.92,amb.candle*0.80] }}
            transition={{ duration: 2.3, repeat: Infinity, ease: 'easeInOut' }}/>
        </motion.g>

        {/* ══ OIL LAMP on stump table ═══════════════════════════════════════ */}
        {hasOilLamp && (
          <motion.g
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            style={{ filter: 'drop-shadow(0 0 6px rgba(255,160,0,0.6))' }}
          >
            {/* saucer base */}
            <ellipse cx={252} cy={449} rx={20} ry={7} fill="#9A6820"/>
            {/* oil reservoir body */}
            <path d="M235,449 C235,436 243,430 252,430 C261,430 270,436 270,449 Z" fill="#C8903A"/>
            {/* handle (right side) */}
            <path d="M270,445 C278,440 282,435 280,430 C276,428 268,430 266,437"
              fill="none" stroke="#A07020" strokeWidth="3.5" strokeLinecap="round"/>
            {/* spout (left, pointing lower-left) */}
            <path d="M235,447 C226,445 222,443 218,440 C220,435 227,435 234,440 Z" fill="#A87028"/>
            {/* wick line */}
            <line x1={218} y1={440} x2={218} y2={434} stroke="#4A2808" strokeWidth="1.5" strokeLinecap="round"/>
            {/* spout flame */}
            <motion.path
              d="M218,432 C221,427 223,422 220,418 C217,422 215,427 217,432 C216,425 218,421 218,418 C218,421 220,425 218,432 Z"
              fill="#FFB030"
              animate={{ scaleY:[1,1.2,0.88,1.1,1], scaleX:[1,0.85,1.06,0.90,1] }}
              style={{ transformOrigin:'218px 430px' }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.path
              d="M218,428 C220,424 221,421 219,418 C217,421 216,424 217,428 Z"
              fill="#FFE080" opacity={0.9}
              animate={{ scaleY:[1,1.15,0.90,1.08,1] }}
              style={{ transformOrigin:'218px 426px' }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* lamp glow */}
            <motion.circle cx={218} cy={422} r={38} fill="url(#ic-candle)"
              animate={{ opacity:[amb.candle*0.65, amb.candle*0.90, amb.candle*0.60, amb.candle*0.85, amb.candle*0.65] }}
              transition={{ duration: 2.1, repeat: Infinity, ease: 'easeInOut' }}/>
            {/* second candle-glow circle */}
            <motion.circle cx={228} cy={434} r={65} fill="url(#ic-candle)"
              animate={{ opacity:[amb.candle*0.40, amb.candle*0.55, amb.candle*0.38, amb.candle*0.50, amb.candle*0.40] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}/>
          </motion.g>
        )}

        {/* ══ ROCKS SCATTERED ══════════════════════════════════════════════ */}
        {[
          [160,488,20,12],[180,483,14,9],[148,496,16,10],
          [448,486,19,11],[466,490,23,13],[456,498,14,9],
        ].map(([cx,cy,rx,ry],i) => (
          <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry}
            fill={i%2===0?'#B0A090':'#C8B8A8'}
            stroke="#706058" strokeWidth="1" opacity={0.88}/>
        ))}
        <ellipse cx={158} cy={485} rx={7} ry={3} fill="white" opacity={0.16}/>
        <ellipse cx={450} cy={484} rx={6} ry={3} fill="white" opacity={0.16}/>

        {/* ══ GROUND ITEMS ═════════════════════════════════════════════════ */}
        {/* Wooden bucket left */}
        <path d="M140,468 C136,454 138,446 152,446 L162,446 C176,446 178,454 174,468 Z" fill="#9A6030"/>
        <line x1={140} y1={468} x2={174} y2={468} stroke="#5A3010" strokeWidth="3" strokeLinecap="round"/>
        <line x1={141} y1={458} x2={173} y2={458} stroke="#5A3010" strokeWidth="1.5" opacity={0.45}/>
        <line x1={143} y1={452} x2={171} y2={452} stroke="#5A3010" strokeWidth="1.5" opacity={0.45}/>
        {/* Stacked crates right */}
        <rect x={430} y={454} width={34} height={24} rx={2} fill="#9A6030"/>
        <rect x={426} y={432} width={30} height={24} rx={2} fill="#C07838"/>
        <line x1={443} y1={432} x2={443} y2={454} stroke="#5A3010" strokeWidth="1" opacity={0.40}/>
        <line x1={426} y1={444} x2={456} y2={444} stroke="#5A3010" strokeWidth="1" opacity={0.40}/>
        <line x1={430} y1={466} x2={464} y2={466} stroke="#5A3010" strokeWidth="1" opacity={0.40}/>

        {/* ══ LEATHER BOOTS near exit door ══════════════════════════════════ */}
        {hasBoots && (
          <motion.g initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {/* left boot */}
            <path d="M612,540 L612,516 C612,508 616,504 620,504 C624,504 626,508 626,515 L636,516 C641,516 643,522 641,534 L612,540 Z"
              fill="#8A4820"/>
            <ellipse cx={626} cy={538} rx={15} ry={6} fill="#6A3410"/>
            {/* boot shine */}
            <path d="M614,514 C617,510 621,508 622,511 Z" fill="white" opacity={0.18}/>
            {/* right boot (slightly overlapping, offset) */}
            <path d="M627,542 L627,518 C627,510 631,506 635,506 C639,506 641,510 641,517 L649,518 C654,518 655,524 653,536 L627,542 Z"
              fill="#9A5228" opacity={0.90}/>
            <ellipse cx={640} cy={540} rx={14} ry={5} fill="#7A4018" opacity={0.90}/>
          </motion.g>
        )}

        {/* ══ EXIT DOOR ════════════════════════════════════════════════════ */}
        {/* Door surround / frame recess */}
        <path d="M606,430 L606,540 L700,540 L700,430 Q653,404 606,430 Z"
          fill="#C4AE88" opacity={0.6}/>
        {/* Door frame planks */}
        <path d="M610,434 L610,536 L696,536 L696,434 Q653,410 610,434 Z"
          fill="#7A4820"/>
        {/* Door opening / interior */}
        <path d="M616,438 L616,534 L690,534 L690,438 Q653,416 616,438 Z"
          fill="#180C04" opacity={0.85}/>
        {/* Hint of outside sky */}
        <motion.path d="M616,438 L616,534 L690,534 L690,438 Q653,416 616,438 Z"
          fill="#87CEEB"
          animate={{ opacity: amb.winLight * 0.30 }}
          transition={EASE}/>
        {/* Plank seam */}
        <line x1={653} y1={438} x2={653} y2={534} stroke="#5A3010" strokeWidth="2" opacity={0.28}/>
        <line x1={616} y1={484} x2={690} y2={484} stroke="#5A3010" strokeWidth="1.5" opacity={0.25}/>
        {/* Handle */}
        <circle cx={680} cy={488} r={5} fill="#D0A040"/>
        <circle cx={680} cy={488} r={3} fill="#E0C060"/>
        {/* Frame nail details */}
        {[430,468,506].map((ny,i) => (
          <circle key={i} cx={608} cy={ny} r={2.5} fill="#8A6030"/>
        ))}
        {[430,468,506].map((ny,i) => (
          <circle key={i} cx={698} cy={ny} r={2.5} fill="#8A6030"/>
        ))}
        {/* "Outside" label */}
        <text x={653} y={550} textAnchor="middle" fontSize="11"
          fill="#A89070" opacity={0.62}
          fontFamily="Georgia, 'Times New Roman', serif" letterSpacing="0.1em">
          outside
        </text>
        {/* Clickable door hit area */}
        <rect x={606} y={402} width={96} height={142}
          fill="transparent"
          style={{ cursor: 'pointer' }}
          onClick={onExit}/>

        {/* ══ RUSTY SCYTHE against pillar ══════════════════════════════════ */}
        {hasScythe && (
          <motion.g
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            transform="rotate(-18, 90, 500)"
          >
            {/* handle */}
            <rect x={84} y={298} width={8} height={208} rx={3} fill="#8A6030"/>
            <rect x={85} y={298} width={3} height={208} rx={1} fill="#B07840" opacity={0.50}/>
            {/* ferule cap */}
            <rect x={82} y={295} width={12} height={7} rx={2} fill="#7A8080"/>
            {/* blade */}
            <path d="M92,308 C116,284 152,285 168,304 C148,294 116,296 92,318 Z" fill="#9A9898"/>
            <path d="M92,308 C116,284 152,285 168,304" fill="none" stroke="#707878" strokeWidth="2.5" opacity={0.75}/>
            {/* rust patches on blade */}
            <path d="M110,295 C116,292 120,294 118,298 C114,296 110,297 110,295 Z" fill="#B04820" opacity={0.55}/>
            <path d="M136,293 C141,291 145,293 143,297 C139,295 136,296 136,293 Z" fill="#B04820" opacity={0.45}/>
            {/* handle wrap near top */}
            {[310,326,342].map((y,i) => (
              <rect key={i} x={83} y={y} width={10} height={4} rx={1} fill="#6A4820" opacity={0.6}/>
            ))}
          </motion.g>
        )}

        {/* ══ ROOT FLARE at pillar base ═════════════════════════════════════ */}
        <path d="M0,520 C-2,545 -4,565 -6,580 L88,580 C86,565 84,545 82,520 C76,498 70,480 64,475 L20,475 C14,480 6,498 0,520 Z"
          fill="#5A3010"/>
        <path d="M4,522 C2,548 0,568 -2,580 L82,580 C80,568 78,548 76,522 C70,500 64,482 60,478 L24,478 C18,482 12,500 4,522 Z"
          fill="#7B4820"/>

        {/* ══ RUG / CARPET ══════════════════════════════════════════════════ */}
        <ellipse cx={300} cy={536} rx={80} ry={22} fill="#C03828" opacity={0.52}/>
        <ellipse cx={300} cy={536} rx={66} ry={17} fill="#E05040" opacity={0.28}/>
        <ellipse cx={300} cy={536} rx={52} ry={12} fill="none" stroke="#E05040" strokeWidth="1.5" opacity={0.45}/>

        {/* ══ COBWEB IN UPPER CORNER ════════════════════════════════════════ */}
        {[1,2,3].map(i => (
          <line key={i} x1={75} y1={58} x2={75+i*14} y2={58+i*14}
            stroke="white" strokeWidth="0.5" opacity={0.16}/>
        ))}
        {[0.4,0.7,1.0].map((r,i) => (
          <circle key={i} cx={82} cy={66} r={9+i*9}
            fill="none" stroke="white" strokeWidth="0.4" opacity={0.10}/>
        ))}

        {/* ══ AMBIENT DARK OVERLAY (night / evening) ════════════════════════ */}
        <motion.rect x={0} y={0} width={VW} height={VH}
          fill="#080410"
          animate={{ opacity: amb.dark }}
          transition={EASE}
          style={{ pointerEvents: 'none' }}/>

        {/* Oil lamp bloom (shows through night overlay) */}
        {hasOilLamp && (
          <motion.circle cx={218} cy={422} r={140} fill="url(#ic-candle)"
            animate={{ opacity: amb.candle * 0.35 }}
            transition={EASE}
            style={{ pointerEvents: 'none' }}/>
        )}

        {/* Candle glow bloom (stronger at night) */}
        <motion.circle cx={300} cy={413} r={200}
          fill="url(#ic-candle)"
          animate={{ opacity: amb.candle * 0.42 }}
          transition={EASE}
          style={{ pointerEvents: 'none' }}/>

        {/* Lantern glow bloom */}
        <motion.circle cx={415} cy={333} r={100}
          fill="url(#ic-candle)"
          animate={{ opacity: amb.candle * 0.28 }}
          transition={EASE}
          style={{ pointerEvents: 'none' }}/>

        {/* ══ VIGNETTE ══════════════════════════════════════════════════════ */}
        <rect x={0} y={0} width={VW} height={VH}
          fill="url(#ic-vig)"
          style={{ pointerEvents: 'none' }}/>
      </svg>

      {/* ── Interior character overlays (SmartNode system) ── */}
      {visibleChars.map(hero => {
        const assign = nodeAssignment[hero.id]
        if (!assign) return null
        const slot = NODE_SLOTS[assign.nodeKey]?.[assign.slotIdx]
        if (!slot) return null
        return (
          <InteriorCharacter
            key={hero.id}
            heroData={hero}
            gameState={gameState}
            updateState={updateState}
            screenPos={toScreen(slot.svgX, slot.svgY)}
            nodeKey={assign.nodeKey}
            slotIdx={assign.slotIdx}
            timeState={timeState}
            conversationBark={getConvoBark(hero.id)}
            spriteScale={NODE_SCALE[assign.nodeKey]}
          />
        )
      })}

      {/* ── "Go outside" prompt on hover ── */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '6%', left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: "'Nunito', sans-serif",
          fontSize: '0.72rem',
          color: 'rgba(255,255,255,0.35)',
          letterSpacing: '0.12em',
          textShadow: '0 1px 4px rgba(0,0,0,0.8)',
        }}
      >
        click the door to step outside
      </div>
    </div>
  )
}
