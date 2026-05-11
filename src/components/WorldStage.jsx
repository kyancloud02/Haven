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

// ─── Component ─────────────────────────────────────────────────────────────────
export default function WorldStage({ overrideHour }) {
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
          {/* Watercolor edge wobble — used on organic shapes */}
          <filter id="wc" x="-12%" y="-12%" width="124%" height="124%">
            <feTurbulence type="fractalNoise" baseFrequency="0.038" numOctaves="3" seed="5" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="7"
              xChannelSelector="R" yChannelSelector="G" result="d" />
            <feGaussianBlur in="d" stdDeviation="1.2" />
          </filter>

          {/* Soft glow — used on sun / setting sun */}
          <filter id="sun-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="14" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Firefly glow */}
          <filter id="ff-glow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="3.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Crescent mask for the moon */}
          <mask id="crescent">
            <circle cx="640" cy="78" r="26" fill="white" />
            <circle cx="655" cy="73" r="22" fill="black" />
          </mask>

          {/* Warm radial glow emanating from box door (HOME) */}
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

        {/* ── Left tree — pivots at trunk base ── */}
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

        {/* ── Right tree — pivots at trunk base ── */}
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

        {/* ── Atmospheric mist (Islets-style layered fog) ── */}
        {MIST.map((m, i) => (
          <motion.g
            key={`mist${i}`}
            animate={{
              opacity: [m.delay % 3 === 0 ? T.mistOpacity : T.mistOpacity * 0.7, T.mistOpacity * 1.4, T.mistOpacity * 0.6, T.mistOpacity],
              x: [0, m.spd, 0, -m.spd * 0.4, 0],
            }}
            transition={{
              duration: 22 + i * 8,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: m.delay,
            }}
          >
            <ellipse cx={m.cx} cy={m.cy} rx={m.rx} ry={m.ry} fill="white" />
          </motion.g>
        ))}

        {/* ── Warm glow pool around box (HOME) ── */}
        <motion.ellipse
          cx={400} cy={364} rx={90} ry={60}
          fill="url(#box-glow-grad)"
          animate={{ opacity: T.boxGlow }}
          transition={EASE}
        />

        {/* ════════ Cardboard Box ════════ */}
        <ellipse cx={401} cy={381} rx={74} ry={8} fill="rgba(0,0,0,0.16)" />
        <path
          d="M333,374 C335,373 339,373 342,373 L458,373 C461,373 465,373 467,374
             L466,270 C463,268 458,266 454,266 L346,266 C342,266 337,268 334,270 Z"
          fill="#C4914A"
        />
        <path
          d="M442,266 L458,266 C462,266 466,268 467,270 L466,374 L442,374 Z"
          fill="#A07A35" opacity={0.55}
        />
        <path
          d="M354,292 C360,285 390,282 396,290 C402,298 397,312 388,314 C373,316 350,304 354,292 Z"
          fill="#D4A460" opacity={0.62}
        />
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
          transition={EASE}
        />
        <motion.line x1="334" y1="342" x2="334" y2="328"
          stroke="#FFB848" strokeWidth="2.5"
          animate={{ opacity: T.boxGlow * 0.60 }} transition={EASE}
        />
        <motion.line x1="466" y1="336" x2="466" y2="322"
          stroke="#FFB040" strokeWidth="2"
          animate={{ opacity: T.boxGlow * 0.48 }} transition={EASE}
        />
        {/* ════════ End Cardboard Box ════════ */}

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
              transition={{
                duration: 4.5 + f.d * 0.7,
                delay: f.d,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
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

      {/* ── Breathing vignette — the whole scene "inhales" slowly ── */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ boxShadow: 'inset 0 0 120px rgba(0,0,0,0.55)' }}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}
