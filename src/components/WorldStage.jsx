import { useState, useEffect } from 'react'
import { motion, useMotionValue } from 'framer-motion'
import { useGameTime, getTimeState } from '../hooks/useGameTime'
import { BIOME_THEMES } from './BiomeContent'

const EASE = { duration: 2.5, ease: 'easeInOut' }

// ─── Mouse parallax hook ───────────────────────────────────────────────────────
function useMouseParallax() {
  const [pos, setPos] = useState({ nx: 0, ny: 0 })
  useEffect(() => {
    let target = { nx: 0, ny: 0 }
    let rafId
    function onMove(e) {
      target = {
        nx: e.clientX / window.innerWidth  - 0.5,
        ny: e.clientY / window.innerHeight - 0.5,
      }
    }
    function tick() {
      setPos(prev => {
        const nx = prev.nx + (target.nx - prev.nx) * 0.07
        const ny = prev.ny + (target.ny - prev.ny) * 0.07
        if (Math.abs(nx - prev.nx) < 0.0005 && Math.abs(ny - prev.ny) < 0.0005) return prev
        return { nx, ny }
      })
      rafId = requestAnimationFrame(tick)
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    rafId = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafId)
    }
  }, [])
  return pos
}

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
      <path d="M400,250 L316,374 L400,374 Z" fill="#C4AC72" />
      <path d="M400,250 L484,374 L400,374 Z" fill="#AA9458" />
      <path d="M400,266 L355,346 L382,374 L400,374 Z" fill="#D8C488" opacity={0.38} />
      <path d="M400,268 L358,344" stroke="#D0C080" strokeWidth="0.9" opacity={0.42} fill="none" />
      <path d="M400,268 L442,344" stroke="#D0C080" strokeWidth="0.9" opacity={0.42} fill="none" />
      <rect x={393} y={244} width={14} height={8} rx={2} fill="#8B6040" />
      <line x1={400} y1={251} x2={400} y2={374} stroke="#7A5028" strokeWidth="1.8" opacity={0.28} />
      <path d="M383,374 L395,310 L405,310 L417,374 Z" fill="#180C04" opacity={0.82} />
      <line x1={400} y1={260} x2={340} y2={352} stroke="#8B7050" strokeWidth="1.2" opacity={0.45} />
      <line x1={400} y1={260} x2={460} y2={352} stroke="#8B7050" strokeWidth="1.2" opacity={0.45} />
      <line x1={340} y1={352} x2={336} y2={368} stroke="#7A5030" strokeWidth="3.5" strokeLinecap="round" />
      <line x1={460} y1={352} x2={464} y2={368} stroke="#7A5030" strokeWidth="3.5" strokeLinecap="round" />
      <motion.path d="M383,374 L395,310 L405,310 L417,374 Z"
        fill="#FFB040" animate={{ opacity: T.boxGlow * 0.86 }} transition={E} />
    </>
  )
}

function HutBuilding({ T, EASE: E }) {
  return (
    <>
      <ellipse cx={400} cy={381} rx={74} ry={8} fill="rgba(0,0,0,0.16)" />
      <rect x={429} y={268} width={14} height={26} rx={1} fill="#907568" />
      <rect x={426} y={264} width={20} height={6} rx={1} fill="#A08070" />
      <path d="M328,318 L400,262 L400,318 Z" fill="#8B6238" />
      <path d="M400,262 L472,318 L400,318 Z" fill="#6A4820" />
      <rect x={338} y={318} width={124} height={56} fill="#C09A68" />
      <rect x={430} y={318} width={32} height={56} fill="#8B6A40" opacity={0.42} />
      <line x1={338} y1={332} x2={462} y2={332} stroke="#8A6238" strokeWidth="1.2" opacity={0.38} />
      <line x1={338} y1={347} x2={462} y2={347} stroke="#8A6238" strokeWidth="1.2" opacity={0.38} />
      <line x1={338} y1={362} x2={462} y2={362} stroke="#8A6238" strokeWidth="1.2" opacity={0.38} />
      <rect x={349} y={326} width={24} height={18} rx={2} fill="#90B8D0" opacity={0.65} />
      <line x1={361} y1={326} x2={361} y2={344} stroke="#7A5838" strokeWidth="1.2" opacity={0.5} />
      <line x1={349} y1={335} x2={373} y2={335} stroke="#7A5838" strokeWidth="1.2" opacity={0.5} />
      <rect x={427} y={326} width={24} height={18} rx={2} fill="#90B8D0" opacity={0.65} />
      <line x1={439} y1={326} x2={439} y2={344} stroke="#7A5838" strokeWidth="1.2" opacity={0.5} />
      <line x1={427} y1={335} x2={451} y2={335} stroke="#7A5838" strokeWidth="1.2" opacity={0.5} />
      <rect x={387} y={337} width={26} height={37} rx={3} fill="#5A3818" />
      <circle cx={393} cy={358} r={2.5} fill="#C89A50" />
      <rect x={338} y={318} width={124} height={56} fill="none" stroke="#7A5830" strokeWidth="1.2" opacity={0.5} />
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
  const MERLON_X = [353, 367, 381, 395, 409, 423, 437]

  return (
    <>
      <ellipse cx={400} cy={381} rx={88} ry={9} fill="rgba(0,0,0,0.18)" />
      <rect x={320} y={280} width={34} height={94} fill={STONE} />
      <rect x={342} y={280} width={12} height={94} fill={STONE_SH} opacity={0.52} />
      {[321, 333, 345].map(x => (
        <rect key={`lm${x}`} x={x} y={270} width={8} height={11} fill={STONE} />
      ))}
      <rect x={332} y={308} width={8} height={22} rx={1} fill={WIN} opacity={0.45} />
      <path d="M332,308 Q336,301 340,308" fill={WIN} opacity={0.45} />
      <rect x={446} y={280} width={34} height={94} fill={STONE} />
      <rect x={446} y={280} width={12} height={94} fill={STONE_SH} opacity={0.52} />
      {[447, 459, 471].map(x => (
        <rect key={`rm${x}`} x={x} y={270} width={8} height={11} fill={STONE} />
      ))}
      <rect x={460} y={308} width={8} height={22} rx={1} fill={WIN} opacity={0.45} />
      <path d="M460,308 Q464,301 468,308" fill={WIN} opacity={0.45} />
      <rect x={352} y={288} width={96} height={86} fill="#9EA2AC" />
      <rect x={418} y={288} width={30} height={86} fill={STONE_SH} opacity={0.48} />
      {MERLON_X.map(x => (
        <rect key={`mm${x}`} x={x} y={278} width={9} height={11} fill="#9EA2AC" />
      ))}
      <line x1={352} y1={314} x2={448} y2={314} stroke="#6E7278" strokeWidth="0.8" opacity={0.3} />
      <line x1={352} y1={340} x2={448} y2={340} stroke="#6E7278" strokeWidth="0.8" opacity={0.3} />
      <line x1={352} y1={362} x2={448} y2={362} stroke="#6E7278" strokeWidth="0.8" opacity={0.3} />
      <path d="M366,320 Q366,310 374,310 Q382,310 382,320 L382,342 L366,342 Z" fill={WIN} opacity={0.48} />
      <path d="M418,320 Q418,310 426,310 Q434,310 434,320 L434,342 L418,342 Z" fill={WIN} opacity={0.48} />
      <path d="M389,374 L389,350 Q400,338 411,350 L411,374 Z" fill="#2A2838" />
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
  const G    = '#B8D0E8'
  const GDK  = '#8AAEC8'
  const GHI  = '#D8EEFF'
  const GWIN = '#3860C0'

  return (
    <>
      <ellipse cx={400} cy={381} rx={96} ry={9.5} fill="rgba(0,0,0,0.20)" />
      <rect x={330} y={268} width={30} height={106} fill={G} />
      <rect x={348} y={268} width={12} height={106} fill={GDK} opacity={0.6} />
      <path d="M318,268 L378,268 L348,228 Z" fill={GHI} />
      <path d="M348,268 L378,268 L348,228 Z" fill={GDK} opacity={0.4} />
      <rect x={337} y={292} width={9} height={18} rx={1} fill={GWIN} opacity={0.5} />
      <rect x={337} y={320} width={9} height={18} rx={1} fill={GWIN} opacity={0.5} />
      <rect x={440} y={268} width={30} height={106} fill={G} />
      <rect x={440} y={268} width={12} height={106} fill={GDK} opacity={0.6} />
      <path d="M422,268 L482,268 L452,228 Z" fill={GHI} />
      <path d="M422,268 L452,268 L452,228 Z" fill={GDK} opacity={0.4} />
      <rect x={454} y={292} width={9} height={18} rx={1} fill={GWIN} opacity={0.5} />
      <rect x={454} y={320} width={9} height={18} rx={1} fill={GWIN} opacity={0.5} />
      <rect x={360} y={304} width={80} height={14} fill={G} />
      {[367, 380, 393, 406, 419, 432].map(x => (
        <path key={x} d={`M${x},304 Q${x+6.5},294 ${x+13},304`} fill={GHI} opacity={0.55} />
      ))}
      <rect x={376} y={238} width={48} height={136} fill={G} />
      <rect x={406} y={238} width={18} height={136} fill={GDK} opacity={0.58} />
      <path d="M358,238 L442,238 L400,190 Z" fill={GHI} />
      <path d="M400,238 L442,238 L400,190 Z" fill={GDK} opacity={0.42} />
      <path d="M388,264 Q388,254 400,254 Q412,254 412,264 L412,290 L388,290 Z" fill={GWIN} opacity={0.5} />
      <rect x={386} y={306} width={28} height={22} rx={2} fill={GWIN} opacity={0.48} />
      <rect x={386} y={338} width={28} height={22} rx={2} fill={GWIN} opacity={0.48} />
      <path d="M389,374 L389,352 Q400,338 411,352 L411,374 Z" fill="#182040" opacity={0.88} />
      <line x1={385} y1={238} x2={385} y2={374} stroke={GHI} strokeWidth="0.8" opacity={0.22} />
      <line x1={340} y1={268} x2={340} y2={374} stroke={GHI} strokeWidth="0.8" opacity={0.22} />
      <line x1={450} y1={268} x2={450} y2={374} stroke={GHI} strokeWidth="0.8" opacity={0.22} />
      <circle cx={400} cy={190} r={4.5} fill={GHI} opacity={0.92} />
      <circle cx={348} cy={228} r={3}   fill={GHI} opacity={0.82} />
      <circle cx={452} cy={228} r={3}   fill={GHI} opacity={0.82} />
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
export default function WorldStage({ overrideHour, housingTier = 'Cardboard Box', isDamaged = false, onEnterHouse, biome = 'forest', buildingPos = { x: 0, y: 0 }, onBuildingMove }) {
  const realTimeState = useGameTime()
  const timeState = overrideHour !== undefined ? getTimeState(overrideHour) : realTimeState

  const biomeThemes = BIOME_THEMES[biome] ?? BIOME_THEMES.forest
  const T = biomeThemes[timeState] ?? biomeThemes.AWAY

  // Parallax
  const { nx, ny } = useMouseParallax()
  const farX = -(nx * 4)
  const farY = -(ny * 4)
  const midX = -(nx * 10)
  const midY = -(ny * 10)

  // Draggable building position (persisted via buildingPos prop)
  const bx = useMotionValue(buildingPos.x)
  const by = useMotionValue(buildingPos.y)

  return (
    <div className="absolute inset-0 overflow-hidden">

      {/* ══════════════════════════════════════════════════════════════════════
          LAYER 1 — Far Background  (z-index 0)
      ════════════════════════════════════════════════════════════════════════ */}
      <div
        className="absolute inset-0"
        style={{ zIndex: 0, transform: `translate(${farX}px,${farY}px)`, willChange: 'transform' }}
      >
        {/* Sky gradient crossfade between time states */}
        {Object.entries(biomeThemes).map(([state, th]) => (
          <motion.div
            key={state}
            className="absolute inset-0"
            style={{ background: `linear-gradient(to bottom, ${th.skyTop}, ${th.skyBottom})` }}
            animate={{ opacity: timeState === state ? 1 : 0 }}
            transition={EASE}
          />
        ))}

        {/* Background asset */}
        <img
          src={`/assets/biomes/${biome}/background.png`}
          className="absolute inset-0 w-full h-full"
          style={{ objectFit: 'cover', mixBlendMode: 'soft-light', opacity: 0.45 }}
          alt=""
          draggable={false}
        />
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          LAYER 2 — Mid Ground  (z-index 1)
      ════════════════════════════════════════════════════════════════════════ */}
      <div
        className="absolute inset-0"
        style={{ zIndex: 1, transform: `translate(${midX}px,${midY}px)`, willChange: 'transform' }}
      >
        {/* Midground asset */}
        <img
          src={`/assets/biomes/${biome}/midground.png`}
          className="absolute inset-0 w-full h-full"
          style={{ objectFit: 'cover', opacity: 0.75 }}
          alt=""
          draggable={false}
        />

        {/* Buildings + interactive overlays — draggable */}
        <motion.div
          className="absolute inset-0"
          style={{ x: bx, y: by, cursor: 'grab' }}
          drag
          dragMomentum={false}
          whileDrag={{ cursor: 'grabbing' }}
          onDragEnd={() => onBuildingMove?.({ x: bx.get(), y: by.get() })}
        >
        <svg
          viewBox="0 0 800 420"
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Buildings */}
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

          {/* Crisis damage */}
          <motion.g
            animate={{ opacity: isDamaged ? 1 : 0 }}
            transition={{ duration: 1.2 }}
            style={{ pointerEvents: 'none' }}
          >
            <rect x={300} y={218} width={200} height={165} fill="rgba(200,30,10,0.10)" />
            <polyline points="382,242 371,272 387,296" fill="none" stroke="#CC1808" strokeWidth="2" strokeLinejoin="round" opacity={0.65} />
            <polyline points="416,258 429,284 418,312" fill="none" stroke="#CC1808" strokeWidth="1.6" strokeLinejoin="round" opacity={0.55} />
          </motion.g>

          {/* Smoke puffs when damaged */}
          {isDamaged && [
            { cx: 383, delay: 0   },
            { cx: 400, delay: 0.9 },
            { cx: 417, delay: 1.7 },
          ].map(({ cx, delay }, i) => (
            <motion.circle
              key={`smk${i}`}
              cx={cx} cy={262} r={7}
              fill="rgba(88,78,68,0.60)"
              initial={{ y: 0, opacity: 0 }}
              animate={{ y: -52, opacity: [0, 0.55, 0] }}
              transition={{ duration: 2.6, delay, repeat: Infinity, ease: 'easeOut' }}
            />
          ))}

          {/* Door hit area */}
          {onEnterHouse && (
            <g style={{ cursor: 'pointer' }} onClick={onEnterHouse}>
              <rect x={374} y={326} width={52} height={52} fill="transparent" />
              <motion.ellipse
                cx={400} cy={374} rx={30} ry={8}
                fill="#FFE080"
                animate={{ opacity: [0, 0.18, 0], scale: [0.9, 1.1, 0.9] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                style={{ pointerEvents: 'none' }}
              />
            </g>
          )}

          {/* Time-state label */}
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
        </motion.div>
      </div>

    </div>
  )
}

// ─── Foreground layer ─────────────────────────────────────────────────────────
export function ForegroundLayer({ timeState, biome = 'forest' }) {
  const { nx, ny } = useMouseParallax()
  const fgX = -(nx * 20)
  const fgY = -(ny * 20)

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 2, transform: `translate(${fgX}px,${fgY}px)`, willChange: 'transform' }}
    >
      <img
        src={`/assets/biomes/${biome}/foreground.png`}
        className="absolute inset-0 w-full h-full"
        style={{ objectFit: 'cover' }}
        alt=""
        draggable={false}
      />

      {/* Breathing vignette */}
      <motion.div
        className="absolute inset-0"
        style={{ boxShadow: 'inset 0 0 120px rgba(0,0,0,0.55)' }}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}
