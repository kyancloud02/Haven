import { motion } from 'framer-motion'
import { useGameTime, getTimeState } from '../hooks/useGameTime'

// ─── Per-state palettes ────────────────────────────────────────────────────────
const THEMES = {
  AWAY: {
    skyTop:       '#87CEEB',
    skyBottom:    '#C8E8F8',
    hill1:        '#8BDB70',
    hill2:        '#76C858',
    groundMid:    '#6AB848',
    groundNear:   '#5CAA3C',
    groundFront:  '#50A032',
    canopy1:      '#5A9040',
    canopy1s:     '#3E6B2A',
    canopy2:      '#4E8838',
    canopy2s:     '#346025',
    trunk:        '#9B7250',
    cloudOpacity: 1,
    fireflyOpacity: 0,
    starOpacity:  0,
    boxGlow:      0,
    ambientFill:  '#FFE8A0',
    ambientOpacity: 0.10,
    mistOpacity:  0.06,
    label:        'Away · Daytime',
    labelFill:    '#4A8060',
  },
  HOME: {
    skyTop:       '#C24018',
    skyBottom:    '#E8804A',
    hill1:        '#4A6A28',
    hill2:        '#3C5820',
    groundMid:    '#304818',
    groundNear:   '#283C12',
    groundFront:  '#20300C',
    canopy1:      '#3A5822',
    canopy1s:     '#283C15',
    canopy2:      '#324E1C',
    canopy2s:     '#203410',
    trunk:        '#7B5838',
    cloudOpacity: 0,
    fireflyOpacity: 0,
    starOpacity:  0,
    boxGlow:      1,
    ambientFill:  '#FF8020',
    ambientOpacity: 0.13,
    mistOpacity:  0.10,
    label:        'Home · Evening',
    labelFill:    '#C07040',
  },
  SLEEP: {
    skyTop:       '#070C28',
    skyBottom:    '#101640',
    hill1:        '#122010',
    hill2:        '#0E1808',
    groundMid:    '#0A1206',
    groundNear:   '#080E04',
    groundFront:  '#060A03',
    canopy1:      '#141E10',
    canopy1s:     '#0C1408',
    canopy2:      '#101A0C',
    canopy2s:     '#0A1006',
    trunk:        '#1E1610',
    cloudOpacity: 0,
    fireflyOpacity: 1,
    starOpacity:  1,
    boxGlow:      0,
    ambientFill:  '#100838',
    ambientOpacity: 0.32,
    mistOpacity:  0.14,
    label:        'Sleep · Night',
    labelFill:    '#8890CC',
  },
}

// ─── Static scene data ─────────────────────────────────────────────────────────
const STARS = [
  [55,22],[128,10],[215,38],[295,16],[375,28],[462,6],
  [542,33],[612,18],[682,46],[742,12],[792,30],
  [92,52],[178,66],[318,60],[502,56],[658,68],[762,58],
  [35,80],[160,88],[440,75],[580,82],[720,90],
]

const FIREFLIES = [
  { x:112, y:278, d:0.0 }, { x:198, y:308, d:0.8 }, { x:158, y:252, d:1.5 },
  { x:618, y:288, d:0.3 }, { x:678, y:258, d:1.1 }, { x:642, y:318, d:1.9 },
  { x:348, y:292, d:0.6 }, { x:478, y:276, d:1.3 }, { x:272, y:316, d:2.2 },
  { x:548, y:302, d:1.0 }, { x:728, y:298, d:1.7 }, { x: 88, y:338, d:2.5 },
  { x:438, y:332, d:0.4 },
]

const CLOUDS = [
  { x:148, y:76,  s:1.00, spd:28 },
  { x:390, y:53,  s:1.25, spd:40 },
  { x:650, y:94,  s:0.82, spd:22 },
]

const MIST = [
  { cx: 180, cy: 298, rx: 310, ry: 30, spd: 38, delay: 0   },
  { cx: 620, cy: 318, rx: 260, ry: 24, spd: 52, delay: 5   },
  { cx: 400, cy: 340, rx: 220, ry: 20, spd: 32, delay: 11  },
]

const EASE = { duration: 2.5, ease: 'easeInOut' }

// ─── Buildings ─────────────────────────────────────────────────────────────────

function BoxBuilding({ T, EASE: E }) {
  return (
    <>
      <ellipse cx={401} cy={381} rx={74} ry={8} fill="rgba(0,0,0,0.16)" />
      <path
        d="M333,374 C335,373 339,373 342,373 L458,373 C461,373 465,373 467,374
           L466,270 C463,268 458,266 454,266 L346,266 C342,266 337,268 334,270 Z"
        fill="#C4914A"
      />
      <path d="M442,266 L458,266 C462,266 466,268 467,270 L466,374 L442,374 Z"
        fill="#A07A35" opacity={0.55} />
      <path d="M354,292 C360,285 390,282 396,290 C402,298 397,312 388,314 C373,316 350,304 354,292 Z"
        fill="#D4A460" opacity={0.62} />
      <path d="M400,266 L400,374" stroke="#7A5020" strokeWidth="1.5" opacity={0.42} fill="none" />
      <path d="M333,318 L467,318" stroke="#7A5020" strokeWidth="1"   opacity={0.28} fill="none" />
      <path d="M334,270 C331,266 329,256 331,246 L366,238 L369,266 Z" fill="#BA8840" />
      <path d="M334,270 C331,266 329,256 331,246 L366,238 L369,266 Z"
        fill="none" stroke="#7A5020" strokeWidth="1" opacity={0.42} />
      <path d="M466,270 C469,266 471,256 469,246 L434,238 L431,266 Z" fill="#BA8840" />
      <path d="M466,270 C469,266 471,256 469,246 L434,238 L431,266 Z"
        fill="none" stroke="#7A5020" strokeWidth="1" opacity={0.42} />
      <path d="M369,266 C368,258 370,247 372,242 L400,234 L428,242 C430,247 432,258 431,266 Z"
        fill="#C49848" />
      <path d="M369,266 C368,258 370,247 372,242 L400,234 L428,242 C430,247 432,258 431,266 Z"
        fill="none" stroke="#7A5020" strokeWidth="1" opacity={0.42} />
      <rect x="350" y="312" width="100" height="7" rx="2"
        fill="#ECD8A0" opacity={0.88} transform="rotate(-0.8 400 316)" />
      <rect x="397" y="266" width="7" height="108" rx="2" fill="#ECD8A0" opacity={0.82} />
      <path d="M369,374 L369,338 C369,322 431,322 431,338 L431,374 Z" fill="#9A6A2A" />
      <path
        d="M333,374 C335,373 339,373 342,373 L458,373 C461,373 465,373 467,374
           L466,270 C463,268 458,266 454,266 L346,266 C342,266 337,268 334,270 Z"
        fill="none" stroke="#7A5020" strokeWidth="1.5" opacity={0.52}
      />
      <motion.path
        d="M369,374 L369,338 C369,322 431,322 431,338 L431,374 Z"
        fill="#FFB040"
        animate={{ opacity: T.boxGlow * 0.92 }}
        transition={E}
      />
      <motion.line x1="334" y1="342" x2="334" y2="328"
        stroke="#FFB848" strokeWidth="2.5"
        animate={{ opacity: T.boxGlow * 0.60 }} transition={E} />
      <motion.line x1="466" y1="336" x2="466" y2="322"
        stroke="#FFB040" strokeWidth="2"
        animate={{ opacity: T.boxGlow * 0.48 }} transition={E} />
    </>
  )
}

function TentBuilding({ T, EASE: E }) {
  return (
    <>
      <ellipse cx={400} cy={381} rx={78} ry={8} fill="rgba(0,0,0,0.15)" />
      {/* Left canvas face */}
      <path d="M400,250 L316,374 L400,374 Z" fill="#C4AC72" />
      {/* Right canvas face (darker) */}
      <path d="M400,250 L484,374 L400,374 Z" fill="#AA9458" />
      {/* Canvas highlight */}
      <path d="M400,266 L355,346 L382,374 L400,374 Z" fill="#D8C488" opacity={0.38} />
      {/* Seam lines */}
      <path d="M400,268 L358,344" stroke="#D0C080" strokeWidth="0.9" opacity={0.42} fill="none" />
      <path d="M400,268 L442,344" stroke="#D0C080" strokeWidth="0.9" opacity={0.42} fill="none" />
      {/* Apex wooden cap */}
      <rect x={393} y={244} width={14} height={8} rx={2} fill="#8B6040" />
      {/* Ridge pole */}
      <line x1={400} y1={251} x2={400} y2={374} stroke="#7A5028" strokeWidth="1.8" opacity={0.28} />
      {/* Door opening */}
      <path d="M383,374 L395,310 L405,310 L417,374 Z" fill="#180C04" opacity={0.82} />
      {/* Guy lines */}
      <line x1={400} y1={260} x2={340} y2={352} stroke="#8B7050" strokeWidth="1.2" opacity={0.45} />
      <line x1={400} y1={260} x2={460} y2={352} stroke="#8B7050" strokeWidth="1.2" opacity={0.45} />
      {/* Stakes */}
      <line x1={340} y1={352} x2={336} y2={368} stroke="#7A5030" strokeWidth="3.5" strokeLinecap="round" />
      <line x1={460} y1={352} x2={464} y2={368} stroke="#7A5030" strokeWidth="3.5" strokeLinecap="round" />
      {/* HOME warm entrance glow */}
      <motion.path d="M383,374 L395,310 L405,310 L417,374 Z"
        fill="#FFB040" animate={{ opacity: T.boxGlow * 0.86 }} transition={E} />
    </>
  )
}

function HutBuilding({ T, EASE: E }) {
  return (
    <>
      <ellipse cx={400} cy={381} rx={74} ry={8} fill="rgba(0,0,0,0.16)" />
      {/* Chimney */}
      <rect x={429} y={268} width={14} height={26} rx={1} fill="#907568" />
      <rect x={426} y={264} width={20} height={6} rx={1} fill="#A08070" />
      {/* Roof left face */}
      <path d="M328,318 L400,262 L400,318 Z" fill="#8B6238" />
      {/* Roof right face (darker) */}
      <path d="M400,262 L472,318 L400,318 Z" fill="#6A4820" />
      {/* Walls */}
      <rect x={338} y={318} width={124} height={56} fill="#C09A68" />
      {/* Right wall shadow */}
      <rect x={430} y={318} width={32} height={56} fill="#8B6A40" opacity={0.42} />
      {/* Log lines */}
      <line x1={338} y1={332} x2={462} y2={332} stroke="#8A6238" strokeWidth="1.2" opacity={0.38} />
      <line x1={338} y1={347} x2={462} y2={347} stroke="#8A6238" strokeWidth="1.2" opacity={0.38} />
      <line x1={338} y1={362} x2={462} y2={362} stroke="#8A6238" strokeWidth="1.2" opacity={0.38} />
      {/* Left window */}
      <rect x={349} y={326} width={24} height={18} rx={2} fill="#90B8D0" opacity={0.65} />
      <line x1={361} y1={326} x2={361} y2={344} stroke="#7A5838" strokeWidth="1.2" opacity={0.5} />
      <line x1={349} y1={335} x2={373} y2={335} stroke="#7A5838" strokeWidth="1.2" opacity={0.5} />
      {/* Right window */}
      <rect x={427} y={326} width={24} height={18} rx={2} fill="#90B8D0" opacity={0.65} />
      <line x1={439} y1={326} x2={439} y2={344} stroke="#7A5838" strokeWidth="1.2" opacity={0.5} />
      <line x1={427} y1={335} x2={451} y2={335} stroke="#7A5838" strokeWidth="1.2" opacity={0.5} />
      {/* Door */}
      <rect x={387} y={337} width={26} height={37} rx={3} fill="#5A3818" />
      <circle cx={393} cy={358} r={2.5} fill="#C89A50" />
      {/* Wall outline */}
      <rect x={338} y={318} width={124} height={56} fill="none" stroke="#7A5830" strokeWidth="1.2" opacity={0.5} />
      {/* HOME glow — windows + door */}
      <motion.rect x={349} y={326} width={24} height={18} rx={2}
        fill="#FFB848" animate={{ opacity: T.boxGlow * 0.62 }} transition={E} />
      <motion.rect x={427} y={326} width={24} height={18} rx={2}
        fill="#FFB848" animate={{ opacity: T.boxGlow * 0.62 }} transition={E} />
      <motion.rect x={387} y={337} width={26} height={37} rx={3}
        fill="#FFB040" animate={{ opacity: T.boxGlow * 0.88 }} transition={E} />
    </>
  )
}

function ManorBuilding({ T, EASE: E }) {
  const STONE    = '#9A9EA8'
  const STONE_SH = '#72747E'
  const WIN      = '#4858B0'
  const MERLON_X = [353, 367, 381, 395, 409, 423, 437]  // 7 merlons on main body

  return (
    <>
      <ellipse cx={400} cy={381} rx={88} ry={9} fill="rgba(0,0,0,0.18)" />

      {/* ── Left tower ── */}
      <rect x={320} y={280} width={34} height={94} fill={STONE} />
      <rect x={342} y={280} width={12} height={94} fill={STONE_SH} opacity={0.52} />
      {/* Left tower merlons */}
      {[321, 333, 345].map(x => (
        <rect key={`lm${x}`} x={x} y={270} width={8} height={11} fill={STONE} />
      ))}
      {/* Left tower slit window */}
      <rect x={332} y={308} width={8} height={22} rx={1} fill={WIN} opacity={0.45} />
      <path d="M332,308 Q336,301 340,308" fill={WIN} opacity={0.45} />

      {/* ── Right tower ── */}
      <rect x={446} y={280} width={34} height={94} fill={STONE} />
      <rect x={446} y={280} width={12} height={94} fill={STONE_SH} opacity={0.52} />
      {/* Right tower merlons */}
      {[447, 459, 471].map(x => (
        <rect key={`rm${x}`} x={x} y={270} width={8} height={11} fill={STONE} />
      ))}
      {/* Right tower slit window */}
      <rect x={460} y={308} width={8} height={22} rx={1} fill={WIN} opacity={0.45} />
      <path d="M460,308 Q464,301 468,308" fill={WIN} opacity={0.45} />

      {/* ── Main building ── */}
      <rect x={352} y={288} width={96} height={86} fill="#9EA2AC" />
      <rect x={418} y={288} width={30} height={86} fill={STONE_SH} opacity={0.48} />
      {/* Main body merlons */}
      {MERLON_X.map(x => (
        <rect key={`mm${x}`} x={x} y={278} width={9} height={11} fill="#9EA2AC" />
      ))}
      {/* Stone coursing lines */}
      <line x1={352} y1={314} x2={448} y2={314} stroke="#6E7278" strokeWidth="0.8" opacity={0.3} />
      <line x1={352} y1={340} x2={448} y2={340} stroke="#6E7278" strokeWidth="0.8" opacity={0.3} />
      <line x1={352} y1={362} x2={448} y2={362} stroke="#6E7278" strokeWidth="0.8" opacity={0.3} />
      {/* Left arched window */}
      <path d="M366,320 Q366,310 374,310 Q382,310 382,320 L382,342 L366,342 Z" fill={WIN} opacity={0.48} />
      {/* Right arched window */}
      <path d="M418,320 Q418,310 426,310 Q434,310 434,320 L434,342 L418,342 Z" fill={WIN} opacity={0.48} />
      {/* Arched door */}
      <path d="M389,374 L389,350 Q400,338 411,350 L411,374 Z" fill="#2A2838" />

      {/* HOME glow */}
      <motion.path d="M366,320 Q366,310 374,310 Q382,310 382,320 L382,342 L366,342 Z"
        fill="#FFB848" animate={{ opacity: T.boxGlow * 0.58 }} transition={E} />
      <motion.path d="M418,320 Q418,310 426,310 Q434,310 434,320 L434,342 L418,342 Z"
        fill="#FFB848" animate={{ opacity: T.boxGlow * 0.58 }} transition={E} />
      <motion.path d="M389,374 L389,350 Q400,338 411,350 L411,374 Z"
        fill="#FFB040" animate={{ opacity: T.boxGlow * 0.88 }} transition={E} />
      <motion.rect x={332} y={308} width={8} height={22} rx={1}
        fill="#FFD080" animate={{ opacity: T.boxGlow * 0.52 }} transition={E} />
      <motion.rect x={460} y={308} width={8} height={22} rx={1}
        fill="#FFD080" animate={{ opacity: T.boxGlow * 0.52 }} transition={E} />
    </>
  )
}

function CastleBuilding({ T, EASE: E }) {
  const G    = '#B8D0E8'   // glass main
  const GDK  = '#8AAEC8'   // glass shadow
  const GHI  = '#D8EEFF'   // glass highlight
  const GWIN = '#3860C0'   // window blue

  return (
    <>
      <ellipse cx={400} cy={381} rx={96} ry={9.5} fill="rgba(0,0,0,0.20)" />

      {/* ── Left tower ── */}
      <rect x={330} y={268} width={30} height={106} fill={G} />
      <rect x={348} y={268} width={12} height={106} fill={GDK} opacity={0.6} />
      {/* Left spire */}
      <path d="M318,268 L378,268 L348,228 Z" fill={GHI} />
      <path d="M348,268 L378,268 L348,228 Z" fill={GDK} opacity={0.4} />
      {/* Left tower windows */}
      <rect x={337} y={292} width={9} height={18} rx={1} fill={GWIN} opacity={0.5} />
      <rect x={337} y={320} width={9} height={18} rx={1} fill={GWIN} opacity={0.5} />

      {/* ── Right tower ── */}
      <rect x={440} y={268} width={30} height={106} fill={G} />
      <rect x={440} y={268} width={12} height={106} fill={GDK} opacity={0.6} />
      {/* Right spire */}
      <path d="M422,268 L482,268 L452,228 Z" fill={GHI} />
      <path d="M422,268 L452,268 L452,228 Z" fill={GDK} opacity={0.4} />
      {/* Right tower windows */}
      <rect x={454} y={292} width={9} height={18} rx={1} fill={GWIN} opacity={0.5} />
      <rect x={454} y={320} width={9} height={18} rx={1} fill={GWIN} opacity={0.5} />

      {/* ── Connecting arcade ── */}
      <rect x={360} y={304} width={80} height={14} fill={G} />
      {[367, 380, 393, 406, 419, 432].map(x => (
        <path key={x} d={`M${x},304 Q${x+6.5},294 ${x+13},304`} fill={GHI} opacity={0.55} />
      ))}

      {/* ── Central tower ── */}
      <rect x={376} y={238} width={48} height={136} fill={G} />
      <rect x={406} y={238} width={18} height={136} fill={GDK} opacity={0.58} />
      {/* Central spire */}
      <path d="M358,238 L442,238 L400,190 Z" fill={GHI} />
      <path d="M400,238 L442,238 L400,190 Z" fill={GDK} opacity={0.42} />
      {/* Central windows */}
      <path d="M388,264 Q388,254 400,254 Q412,254 412,264 L412,290 L388,290 Z" fill={GWIN} opacity={0.5} />
      <rect x={386} y={306} width={28} height={22} rx={2} fill={GWIN} opacity={0.48} />
      <rect x={386} y={338} width={28} height={22} rx={2} fill={GWIN} opacity={0.48} />
      {/* Door arch */}
      <path d="M389,374 L389,352 Q400,338 411,352 L411,374 Z" fill="#182040" opacity={0.88} />

      {/* Glass shimmer lines */}
      <line x1={385} y1={238} x2={385} y2={374} stroke={GHI} strokeWidth="0.8" opacity={0.22} />
      <line x1={340} y1={268} x2={340} y2={374} stroke={GHI} strokeWidth="0.8" opacity={0.22} />
      <line x1={450} y1={268} x2={450} y2={374} stroke={GHI} strokeWidth="0.8" opacity={0.22} />

      {/* Crystal tip sparkles */}
      <circle cx={400} cy={190} r={4.5} fill={GHI} opacity={0.92} />
      <circle cx={348} cy={228} r={3}   fill={GHI} opacity={0.82} />
      <circle cx={452} cy={228} r={3}   fill={GHI} opacity={0.82} />

      {/* HOME glow */}
      <motion.path d="M388,264 Q388,254 400,254 Q412,254 412,264 L412,290 L388,290 Z"
        fill="#FFD080" animate={{ opacity: T.boxGlow * 0.55 }} transition={E} />
      <motion.rect x={386} y={306} width={28} height={22} rx={2}
        fill="#FFD080" animate={{ opacity: T.boxGlow * 0.52 }} transition={E} />
      <motion.rect x={386} y={338} width={28} height={22} rx={2}
        fill="#FFD080" animate={{ opacity: T.boxGlow * 0.52 }} transition={E} />
      <motion.path d="M389,374 L389,352 Q400,338 411,352 L411,374 Z"
        fill="#FFB040" animate={{ opacity: T.boxGlow * 0.88 }} transition={E} />
      <motion.rect x={337} y={292} width={9} height={18} rx={1}
        fill="#FFD080" animate={{ opacity: T.boxGlow * 0.48 }} transition={E} />
      <motion.rect x={337} y={320} width={9} height={18} rx={1}
        fill="#FFD080" animate={{ opacity: T.boxGlow * 0.48 }} transition={E} />
      <motion.rect x={454} y={292} width={9} height={18} rx={1}
        fill="#FFD080" animate={{ opacity: T.boxGlow * 0.48 }} transition={E} />
      <motion.rect x={454} y={320} width={9} height={18} rx={1}
        fill="#FFD080" animate={{ opacity: T.boxGlow * 0.48 }} transition={E} />
    </>
  )
}

const BUILDINGS = [
  { tierName: 'Cardboard Box',  Cmp: BoxBuilding    },
  { tierName: 'Weathered Tent', Cmp: TentBuilding   },
  { tierName: 'Wooden Hut',     Cmp: HutBuilding    },
  { tierName: 'Stone Manor',    Cmp: ManorBuilding  },
  { tierName: 'Glass Castle',   Cmp: CastleBuilding },
]

// ─── Component ─────────────────────────────────────────────────────────────────
export default function WorldStage({ overrideHour, housingTier = 'Cardboard Box', isDamaged = false }) {
  const realTimeState = useGameTime()
  const timeState = overrideHour !== undefined ? getTimeState(overrideHour) : realTimeState
  const T = THEMES[timeState]

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Sky gradient — three layers crossfaded by opacity */}
      {Object.entries(THEMES).map(([state, th]) => (
        <motion.div
          key={state}
          className="absolute inset-0"
          style={{ background: `linear-gradient(to bottom, ${th.skyTop}, ${th.skyBottom})` }}
          animate={{ opacity: timeState === state ? 1 : 0 }}
          transition={EASE}
        />
      ))}

      {/* SVG scene */}
      <svg
        viewBox="0 0 800 420"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="wc" x="-12%" y="-12%" width="124%" height="124%">
            <feTurbulence type="fractalNoise" baseFrequency="0.038" numOctaves="3" seed="5" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="7"
              xChannelSelector="R" yChannelSelector="G" result="d" />
            <feGaussianBlur in="d" stdDeviation="1.2" />
          </filter>

          <filter id="sun-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="14" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="ff-glow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="3.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <mask id="crescent">
            <circle cx="640" cy="78" r="26" fill="white" />
            <circle cx="655" cy="73" r="22" fill="black" />
          </mask>

          <radialGradient id="box-glow-grad" cx="50%" cy="72%" r="55%">
            <stop offset="0%"   stopColor="#FFB040" stopOpacity="0.95" />
            <stop offset="55%"  stopColor="#FF8020" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#FF5010" stopOpacity="0"    />
          </radialGradient>
        </defs>

        {/* ── Stars (SLEEP) ── */}
        {STARS.map(([x, y], i) => (
          <motion.circle
            key={`s${i}`} cx={x} cy={y} r={i % 4 === 0 ? 1.8 : 1.1}
            fill="white"
            animate={{ opacity: T.starOpacity * (0.5 + (i * 7 % 11) * 0.045) }}
            transition={EASE}
          />
        ))}

        {/* ── Daytime sun (AWAY) ── */}
        <motion.g animate={{ opacity: timeState === 'AWAY' ? 1 : 0 }} transition={EASE}>
          <circle cx={620} cy={72} r={64} fill="#FFE040" opacity={0.22} filter="url(#sun-glow)" />
          <circle cx={620} cy={72} r={36} fill="#FFE856" />
        </motion.g>

        {/* ── Setting sun on horizon (HOME) ── */}
        <motion.g animate={{ opacity: timeState === 'HOME' ? 1 : 0 }} transition={EASE}>
          <ellipse cx={65} cy={340} rx={160} ry={55} fill="#FF6820" opacity={0.28} filter="url(#sun-glow)" />
          <circle cx={65} cy={355} r={70} fill="#FF7030" opacity={0.90} />
        </motion.g>

        {/* ── Crescent moon (SLEEP) ── */}
        <motion.g animate={{ opacity: timeState === 'SLEEP' ? 1 : 0 }} transition={EASE}>
          <circle cx={640} cy={78} r={38} fill="#9090CC" opacity={0.18} filter="url(#sun-glow)" />
          <circle cx={640} cy={78} r={26} fill="#EEEEFF" mask="url(#crescent)" />
        </motion.g>

        {/* ── Clouds (AWAY) ── */}
        {CLOUDS.map((c, i) => (
          <motion.g
            key={`cl${i}`}
            animate={{ opacity: T.cloudOpacity, x: [0, c.spd, 0] }}
            transition={{
              opacity: EASE,
              x: { duration: c.spd * 1.8, repeat: Infinity, ease: 'easeInOut' },
            }}
          >
            <ellipse cx={c.x}           cy={c.y}          rx={50*c.s} ry={22*c.s} fill="white" opacity={0.90} />
            <ellipse cx={c.x-23*c.s}   cy={c.y+ 4*c.s}  rx={28*c.s} ry={18*c.s} fill="white" opacity={0.90} />
            <ellipse cx={c.x+25*c.s}   cy={c.y+ 3*c.s}  rx={33*c.s} ry={19*c.s} fill="white" opacity={0.90} />
            <ellipse cx={c.x+ 2*c.s}   cy={c.y+15*c.s}  rx={46*c.s} ry={ 9*c.s} fill="#C0D8EC" opacity={0.28} />
          </motion.g>
        ))}

        {/* ── Floating islands (Islets style) ── */}
        {/* Island 1 — left, mid-height */}
        <motion.g
          animate={{ opacity: timeState === 'AWAY' ? 0.93 : timeState === 'HOME' ? 0.50 : 0.14 }}
          transition={EASE}
        >
          <ellipse cx={185} cy={163} rx={58} ry={20} fill="#9A8A70" />
          <ellipse cx={170} cy={173} rx={42} ry={14} fill="white" opacity={0.62} />
          <ellipse cx={202} cy={176} rx={30} ry={11} fill="white" opacity={0.52} />
          <ellipse cx={183} cy={179} rx={18} ry={8}  fill="white" opacity={0.38} />
          <ellipse cx={185} cy={148} rx={50} ry={12} fill="#8A7060" />
          <ellipse cx={172} cy={136} rx={32} ry={19} fill="#5A9040" />
          <ellipse cx={202} cy={133} rx={23} ry={16} fill="#6AAC4A" />
          <ellipse cx={158} cy={141} rx={17} ry={13} fill="#4E7E35" />
          <rect x={197} y={126} width={5} height={22} rx={2} fill="#7A5030" />
          <ellipse cx={200} cy={121} rx={14} ry={12} fill="#5A9040" />
        </motion.g>

        {/* Island 2 — right, higher and smaller */}
        <motion.g
          animate={{ opacity: timeState === 'AWAY' ? 0.85 : timeState === 'HOME' ? 0.40 : 0.10 }}
          transition={EASE}
        >
          <ellipse cx={580} cy={116} rx={44} ry={15} fill="#9A8A70" />
          <ellipse cx={568} cy={124} rx={34} ry={11} fill="white" opacity={0.58} />
          <ellipse cx={596} cy={128} rx={24} ry={9}  fill="white" opacity={0.48} />
          <ellipse cx={580} cy={103} rx={38} ry={10} fill="#8A7060" />
          <ellipse cx={572} cy={92}  rx={26} ry={16} fill="#5A9040" />
          <ellipse cx={594} cy={89}  rx={18} ry={14} fill="#6AAC4A" />
          <ellipse cx={560} cy={96}  rx={13} ry={10} fill="#4E7E35" />
        </motion.g>

        {/* Island 3 — distant center, small */}
        <motion.g
          animate={{ opacity: timeState === 'AWAY' ? 0.68 : timeState === 'HOME' ? 0.28 : 0.07 }}
          transition={EASE}
        >
          <ellipse cx={370} cy={83}  rx={28} ry={10} fill="#A09080" />
          <ellipse cx={370} cy={91}  rx={22} ry={8}  fill="white" opacity={0.54} />
          <ellipse cx={370} cy={73}  rx={22} ry={9}  fill="#8A7865" />
          <ellipse cx={366} cy={62}  rx={17} ry={13} fill="#5A9040" opacity={0.9} />
          <ellipse cx={379} cy={60}  rx={12} ry={10} fill="#6AAC4A" opacity={0.85} />
        </motion.g>

        {/* ── Far hills ── */}
        <motion.path
          filter="url(#wc)"
          d="M-10,290 C55,262 148,276 250,264 C352,252 450,270 555,257 C660,244 732,262 810,257 L810,420 L-10,420 Z"
          animate={{ fill: T.hill1 }}
          transition={EASE}
        />

        {/* ── Mid hills ── */}
        <motion.path
          filter="url(#wc)"
          d="M-10,334 C72,314 165,328 292,318 C418,308 532,326 650,316 C720,310 768,322 810,318 L810,420 L-10,420 Z"
          animate={{ fill: T.hill2 }}
          transition={EASE}
        />

        {/* ── Left tree ── */}
        <motion.g
          style={{ transformOrigin: '103px 378px' }}
          animate={{ rotate: [0, 1.2, 0, -1.2, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        >
          <motion.path
            d="M97,378 C95,320 91,278 89,238 C94,236 102,235 110,237 C109,278 111,320 113,378 Z"
            animate={{ fill: T.trunk }} transition={EASE}
          />
          <motion.path
            filter="url(#wc)"
            d="M42,218 C38,250 56,274 86,280 C118,286 153,272 167,244 C148,266 120,280 88,276 C58,270 42,242 42,218 Z"
            animate={{ fill: T.canopy1s }} transition={EASE}
          />
          <motion.path
            filter="url(#wc)"
            d="M103,104 C58,100 23,137 21,178 C19,220 48,254 89,263 C130,271 167,253 180,218 C192,184 175,143 148,123 C128,108 110,104 103,104 Z"
            animate={{ fill: T.canopy1 }} transition={EASE}
          />
          <motion.path
            filter="url(#wc)"
            d="M103,104 C77,99 50,116 40,140 C34,158 40,179 53,193 C63,162 80,138 106,123 C124,112 103,104 103,104 Z"
            animate={{ fill: T.canopy1, opacity: 0.55 }} transition={EASE}
          />
        </motion.g>

        {/* ── Right tree ── */}
        <motion.g
          style={{ transformOrigin: '703px 380px' }}
          animate={{ rotate: [0, -1.0, 0, 1.4, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        >
          <motion.path
            d="M697,380 C695,322 691,278 689,236 C695,234 703,234 709,236 C709,278 711,322 713,380 Z"
            animate={{ fill: T.trunk }} transition={EASE}
          />
          <motion.path
            filter="url(#wc)"
            d="M638,228 C634,260 652,283 683,291 C714,298 748,283 760,256 C740,277 712,290 683,286 C655,280 638,252 638,228 Z"
            animate={{ fill: T.canopy2s }} transition={EASE}
          />
          <motion.path
            filter="url(#wc)"
            d="M701,96 C655,90 617,128 615,171 C613,214 642,250 683,260 C724,268 760,250 774,215 C786,182 769,140 741,119 C720,103 701,96 701,96 Z"
            animate={{ fill: T.canopy2 }} transition={EASE}
          />
        </motion.g>

        {/* ── Ground mid ── */}
        <motion.path
          filter="url(#wc)"
          d="M-10,370 C80,352 190,365 342,358 C494,350 630,363 810,355 L810,420 L-10,420 Z"
          animate={{ fill: T.groundMid }}
          transition={EASE}
        />

        {/* ── Atmospheric mist ── */}
        {MIST.map((m, i) => (
          <motion.g
            key={`mist${i}`}
            animate={{
              opacity: [m.delay % 3 === 0 ? T.mistOpacity : T.mistOpacity * 0.7, T.mistOpacity * 1.4, T.mistOpacity * 0.6, T.mistOpacity],
              x: [0, m.spd, 0, -m.spd * 0.4, 0],
            }}
            transition={{ duration: 22 + i * 8, repeat: Infinity, ease: 'easeInOut', delay: m.delay }}
          >
            <ellipse cx={m.cx} cy={m.cy} rx={m.rx} ry={m.ry} fill="white" />
          </motion.g>
        ))}

        {/* ── Warm ground glow (shared — activates at HOME for any tier) ── */}
        <motion.ellipse
          cx={400} cy={364} rx={90} ry={60}
          fill="url(#box-glow-grad)"
          animate={{ opacity: T.boxGlow }}
          transition={EASE}
        />

        {/* ── Buildings — crossfade between tiers ── */}
        {BUILDINGS.map(({ tierName, Cmp }) => (
          <motion.g
            key={tierName}
            animate={{ opacity: housingTier === tierName ? 1 : 0 }}
            transition={EASE}
            style={{ pointerEvents: 'none' }}
          >
            <Cmp T={T} EASE={EASE} />
          </motion.g>
        ))}

        {/* ── Crisis damage — red tint + cracks + smoke ── */}
        <motion.g
          animate={{ opacity: isDamaged ? 1 : 0 }}
          transition={{ duration: 1.2 }}
          style={{ pointerEvents: 'none' }}
        >
          {/* Red danger wash over building */}
          <rect x={300} y={218} width={200} height={165} fill="rgba(200,30,10,0.10)" />
          {/* Crack lines */}
          <polyline points="382,242 371,272 387,296" fill="none" stroke="#CC1808" strokeWidth="2" strokeLinejoin="round" opacity={0.65} />
          <polyline points="416,258 429,284 418,312" fill="none" stroke="#CC1808" strokeWidth="1.6" strokeLinejoin="round" opacity={0.55} />
          <polyline points="396,260 390,278 401,290" fill="none" stroke="#DD2010" strokeWidth="1.2" strokeLinejoin="round" opacity={0.45} />
        </motion.g>

        {/* Smoke puffs — only animate when damaged */}
        {isDamaged && [
          { cx: 383, delay: 0   },
          { cx: 400, delay: 0.9 },
          { cx: 417, delay: 1.7 },
        ].map(({ cx, delay }, i) => (
          <motion.circle
            key={`smk${i}`}
            cx={cx}
            cy={262}
            r={7}
            fill="rgba(88,78,68,0.60)"
            initial={{ y: 0, r: 7, opacity: 0 }}
            animate={{ y: -52, r: 18, opacity: [0, 0.55, 0] }}
            transition={{ duration: 2.6, delay, repeat: Infinity, ease: 'easeOut' }}
          />
        ))}

        {/* ── Ground near ── */}
        <motion.path
          filter="url(#wc)"
          d="M-10,388 C82,374 202,384 372,377 C542,370 662,381 810,374 L810,420 L-10,420 Z"
          animate={{ fill: T.groundNear }}
          transition={EASE}
        />

        {/* ── Ground front ── */}
        <motion.path
          filter="url(#wc)"
          d="M-10,406 C82,400 202,407 372,402 C542,396 662,404 810,399 L810,420 L-10,420 Z"
          animate={{ fill: T.groundFront }}
          transition={EASE}
        />

        {/* ── Fireflies (SLEEP) ── */}
        {FIREFLIES.map((f, i) => (
          <motion.g key={`ff${i}`} animate={{ opacity: T.fireflyOpacity }} transition={EASE}>
            <motion.circle
              cx={f.x} cy={f.y} r={2.2}
              fill="#B8FFB0"
              filter="url(#ff-glow)"
              animate={{
                opacity: [0, 0.9, 0.2, 0.85, 0],
                x: [0,  7, -4,  10, -2, 0],
                y: [0, -10,  5, -14,  7, 0],
              }}
              transition={{ duration: 4.5 + f.d * 0.7, delay: f.d, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.g>
        ))}

        {/* ── Ambient mood tint ── */}
        <motion.rect
          x={0} y={0} width={800} height={420}
          animate={{ fill: T.ambientFill, opacity: T.ambientOpacity }}
          transition={EASE}
          style={{ pointerEvents: 'none' }}
        />

        {/* ── State label ── */}
        <motion.text
          x={18} y={410}
          fontSize="11"
          fontFamily="Georgia, 'Times New Roman', serif"
          letterSpacing="0.08em"
          animate={{ fill: T.labelFill, opacity: 0.72 }}
          transition={EASE}
        >
          {T.label}
        </motion.text>
      </svg>

    </div>
  )
}

// ─── Foreground layer — overlaps characters for depth ─────────────────────────
export function ForegroundLayer({ timeState }) {
  const T = THEMES[timeState] ?? THEMES.AWAY

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
      <svg
        viewBox="0 0 800 420"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── Left foreground foliage ── */}
        <motion.path
          d="M-20,420 C20,370 72,330 108,318 C82,342 46,370 5,420 Z"
          animate={{ fill: T.canopy1 }} transition={EASE} opacity={0.94}
        />
        <motion.path
          d="M-35,392 C18,332 78,292 122,278 C94,307 52,342 8,394 Z"
          animate={{ fill: T.canopy1s }} transition={EASE} opacity={0.88}
        />
        <motion.path
          d="M2,348 C34,302 86,272 118,262 C94,282 60,314 24,352 Z"
          animate={{ fill: T.canopy1 }} transition={EASE} opacity={0.78}
        />
        <motion.path
          d="M-18,420 C6,402 38,386 60,378 C42,396 16,412 -8,420 Z"
          animate={{ fill: T.canopy1s }} transition={EASE} opacity={0.96}
        />

        {/* ── Right foreground foliage ── */}
        <motion.path
          d="M820,420 C780,370 728,330 692,318 C718,342 754,370 795,420 Z"
          animate={{ fill: T.canopy2 }} transition={EASE} opacity={0.94}
        />
        <motion.path
          d="M835,392 C782,332 722,292 678,278 C706,307 748,342 792,394 Z"
          animate={{ fill: T.canopy2s }} transition={EASE} opacity={0.88}
        />
        <motion.path
          d="M798,348 C766,302 714,272 682,262 C706,282 740,314 776,352 Z"
          animate={{ fill: T.canopy2 }} transition={EASE} opacity={0.78}
        />
        <motion.path
          d="M818,420 C794,402 762,386 740,378 C758,396 784,412 808,420 Z"
          animate={{ fill: T.canopy2s }} transition={EASE} opacity={0.96}
        />

        {/* ── Foreground rocks ── */}
        <motion.path
          d="M0,420 C10,412 28,409 42,414 C34,419 16,421 0,420 Z"
          animate={{ fill: T.groundNear }} transition={EASE}
        />
        <motion.path
          d="M35,418 C50,410 70,408 82,414 C74,420 52,421 35,420 Z"
          animate={{ fill: T.groundFront }} transition={EASE}
        />
        <motion.path
          d="M718,418 C730,410 750,408 762,414 C754,420 732,421 718,420 Z"
          animate={{ fill: T.groundFront }} transition={EASE}
        />
        <motion.path
          d="M758,420 C770,412 788,409 800,413 L800,420 Z"
          animate={{ fill: T.groundNear }} transition={EASE}
        />
      </svg>

      {/* ── Breathing vignette ── */}
      <motion.div
        className="absolute inset-0"
        style={{ boxShadow: 'inset 0 0 120px rgba(0,0,0,0.55)' }}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}
