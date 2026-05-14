import { motion } from 'framer-motion'

const EASE = { duration: 2.5, ease: 'easeInOut' }

// ─── Shared scene data (used by FarBG components) ─────────────────────────────
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

// ─── Shared celestial / sky helpers ──────────────────────────────────────────
function CelestialBodies({ timeState, T }) {
  return (
    <>
      <defs>
        <filter id="sun-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="14" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <mask id="crescent">
          <circle cx="640" cy="78" r="26" fill="white" />
          <circle cx="655" cy="73" r="22" fill="black" />
        </mask>
      </defs>

      {/* Stars */}
      {STARS.map(([x, y], i) => (
        <motion.circle
          key={`s${i}`} cx={x} cy={y} r={i % 4 === 0 ? 1.8 : 1.1}
          fill="white"
          animate={{ opacity: T.starOpacity * (0.5 + (i * 7 % 11) * 0.045) }}
          transition={EASE}
        />
      ))}

      {/* Daytime sun */}
      <motion.g animate={{ opacity: timeState === 'AWAY' ? 1 : 0 }} transition={EASE}>
        <circle cx={620} cy={72} r={64} fill="#FFE040" opacity={0.22} filter="url(#sun-glow)" />
        <circle cx={620} cy={72} r={36} fill="#FFE856" />
      </motion.g>

      {/* Setting sun on horizon */}
      <motion.g animate={{ opacity: timeState === 'HOME' ? 1 : 0 }} transition={EASE}>
        <ellipse cx={65} cy={340} rx={160} ry={55} fill="#FF6820" opacity={0.28} filter="url(#sun-glow)" />
        <circle cx={65} cy={355} r={70} fill="#FF7030" opacity={0.90} />
      </motion.g>

      {/* Crescent moon */}
      <motion.g animate={{ opacity: timeState === 'SLEEP' ? 1 : 0 }} transition={EASE}>
        <circle cx={640} cy={78} r={38} fill="#9090CC" opacity={0.18} filter="url(#sun-glow)" />
        <circle cx={640} cy={78} r={26} fill="#EEEEFF" mask="url(#crescent)" />
      </motion.g>
    </>
  )
}

// ── Forest ────────────────────────────────────────────────────────────────────
export function ForestFarBG({ timeState, T }) {
  return (
    <>
      <CelestialBodies timeState={timeState} T={T} />

      {/* Floating sky-islands */}
      <motion.g
        animate={{ opacity: timeState === 'AWAY' ? 0.93 : timeState === 'HOME' ? 0.50 : 0.14 }}
        transition={EASE}
      >
        <ellipse cx={185} cy={163} rx={58} ry={20} fill="#7A6850" />
        <ellipse cx={170} cy={173} rx={42} ry={14} fill="white" opacity={0.62} />
        <ellipse cx={202} cy={176} rx={30} ry={11} fill="white" opacity={0.52} />
        <ellipse cx={183} cy={179} rx={18} ry={8}  fill="white" opacity={0.38} />
        <ellipse cx={185} cy={148} rx={50} ry={12} fill="#5A4835" />
        <ellipse cx={172} cy={136} rx={32} ry={19} fill="#286040" />
        <ellipse cx={202} cy={133} rx={23} ry={16} fill="#2D7048" />
        <ellipse cx={158} cy={141} rx={17} ry={13} fill="#1A4828" />
        <rect x={197} y={126} width={5} height={22} rx={2} fill="#5A3818" />
        <ellipse cx={200} cy={121} rx={14} ry={12} fill="#286040" />
      </motion.g>

      <motion.g
        animate={{ opacity: timeState === 'AWAY' ? 0.85 : timeState === 'HOME' ? 0.40 : 0.10 }}
        transition={EASE}
      >
        <ellipse cx={580} cy={116} rx={44} ry={15} fill="#7A6850" />
        <ellipse cx={568} cy={124} rx={34} ry={11} fill="white" opacity={0.58} />
        <ellipse cx={596} cy={128} rx={24} ry={9}  fill="white" opacity={0.48} />
        <ellipse cx={580} cy={103} rx={38} ry={10} fill="#5A4835" />
        <ellipse cx={572} cy={92}  rx={26} ry={16} fill="#286040" />
        <ellipse cx={594} cy={89}  rx={18} ry={14} fill="#2D7048" />
        <ellipse cx={560} cy={96}  rx={13} ry={10} fill="#1A4828" />
      </motion.g>

      <motion.g
        animate={{ opacity: timeState === 'AWAY' ? 0.68 : timeState === 'HOME' ? 0.28 : 0.07 }}
        transition={EASE}
      >
        <ellipse cx={370} cy={83}  rx={28} ry={10} fill="#7A6850" />
        <ellipse cx={370} cy={91}  rx={22} ry={8}  fill="white" opacity={0.54} />
        <ellipse cx={370} cy={73}  rx={22} ry={9}  fill="#5A4835" />
        <ellipse cx={366} cy={62}  rx={17} ry={13} fill="#286040" opacity={0.9} />
        <ellipse cx={379} cy={60}  rx={12} ry={10} fill="#2D7048" opacity={0.85} />
      </motion.g>

      {/* Drifting forest spore particles */}
      {[
        { x: 120, y: 180, delay: 0   },
        { x: 280, y: 140, delay: 1.2 },
        { x: 450, y: 200, delay: 2.4 },
        { x: 610, y: 160, delay: 0.8 },
        { x: 730, y: 190, delay: 1.8 },
      ].map((p, i) => (
        <motion.circle
          key={`spore${i}`}
          cx={p.x} cy={p.y} r={3}
          fill="#B8FFD0"
          animate={{
            opacity: [0.2, 0.5, 0.25, 0.45, 0.2],
            x: [0, 18, -8, 22, 0],
            y: [0, -12, 6, -18, 0],
          }}
          transition={{ duration: 14 + i * 3, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Clouds */}
      {CLOUDS.map((c, i) => (
        <motion.g
          key={`cl${i}`}
          animate={{ opacity: T.cloudOpacity, x: [0, c.spd, 0] }}
          transition={{
            opacity: EASE,
            x: { duration: c.spd * 1.8, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          <ellipse cx={c.x}         cy={c.y}         rx={50*c.s} ry={22*c.s} fill="white" opacity={0.90} />
          <ellipse cx={c.x-23*c.s} cy={c.y+ 4*c.s}  rx={28*c.s} ry={18*c.s} fill="white" opacity={0.90} />
          <ellipse cx={c.x+25*c.s} cy={c.y+ 3*c.s}  rx={33*c.s} ry={19*c.s} fill="white" opacity={0.90} />
          <ellipse cx={c.x+ 2*c.s} cy={c.y+15*c.s}  rx={46*c.s} ry={ 9*c.s} fill="#C0D8EC" opacity={0.28} />
        </motion.g>
      ))}
    </>
  )
}

export function ForestMidBG({ timeState, T, housingTier, isDamaged, onEnterHouse, BUILDINGS }) {
  return (
    <>
      <defs>
        <filter id="wc" x="-12%" y="-12%" width="124%" height="124%">
          <feTurbulence type="fractalNoise" baseFrequency="0.038" numOctaves="3" seed="5" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G" result="d" />
          <feGaussianBlur in="d" stdDeviation="1.2" />
        </filter>
        <filter id="ff-glow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="3.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="fg-moss-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="box-glow-grad" cx="50%" cy="72%" r="55%">
          <stop offset="0%"   stopColor="#FFB040" stopOpacity="0.95" />
          <stop offset="55%"  stopColor="#FF8020" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#FF5010" stopOpacity="0"    />
        </radialGradient>
      </defs>

      {/* Far hills */}
      <motion.path
        filter="url(#wc)"
        d="M-10,290 C55,262 148,276 250,264 C352,252 450,270 555,257 C660,244 732,262 810,257 L810,420 L-10,420 Z"
        animate={{ fill: T.hill1 }}
        transition={EASE}
      />

      {/* Mid hills */}
      <motion.path
        filter="url(#wc)"
        d="M-10,334 C72,314 165,328 292,318 C418,308 532,326 650,316 C720,310 768,322 810,318 L810,420 L-10,420 Z"
        animate={{ fill: T.hill2 }}
        transition={EASE}
      />

      {/* Left ancient gnarled tree */}
      <motion.g
        style={{ transformOrigin: '90px 380px' }}
        animate={{ rotate: [0, 1.4, 0, -1.4, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Main trunk */}
        <motion.path
          d="M72,380 C68,310 62,240 60,160 C64,156 72,154 80,156 C80,240 85,310 90,380 Z"
          animate={{ fill: T.trunk }} transition={EASE}
        />
        {/* Branch left */}
        <motion.path
          d="M64,210 C42,192 20,185 10,175 C8,172 12,168 18,170 C28,180 50,188 66,204 Z"
          animate={{ fill: T.trunk }} transition={EASE}
        />
        {/* Branch right */}
        <motion.path
          d="M78,240 C98,220 118,208 135,198 C138,195 142,199 140,202 C122,212 102,226 80,248 Z"
          animate={{ fill: T.trunk }} transition={EASE}
        />
        {/* Branch up-right */}
        <motion.path
          d="M70,180 C92,162 108,148 120,132 C123,129 127,133 125,136 C112,152 96,166 72,186 Z"
          animate={{ fill: T.trunk }} transition={EASE}
        />
        {/* Bark texture lines */}
        <motion.path d="M72,380 C70,340 66,290 64,240" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" animate={{ opacity: 0.6 }} />
        <motion.path d="M80,380 C82,340 84,290 83,240" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="1" animate={{ opacity: 0.5 }} />
        {/* Glowing moss on trunk */}
        <motion.path
          d="M62,280 C58,260 60,240 66,230 C70,240 72,262 70,282 Z"
          fill="#00C890"
          filter="url(#fg-moss-glow)"
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Shadow undercanopy */}
        <motion.path
          filter="url(#wc)"
          d="M20,200 C16,232 35,264 68,272 C102,280 138,264 152,234 C132,256 104,270 70,265 C38,258 22,232 22,208 Z"
          animate={{ fill: T.canopy1s }} transition={EASE}
        />
        {/* Main canopy */}
        <motion.path
          filter="url(#wc)"
          d="M88,60 C40,56 5,96 3,140 C1,184 32,220 76,230 C120,240 158,220 172,183 C186,148 168,104 140,82 C118,64 98,60 88,60 Z"
          animate={{ fill: T.canopy1 }} transition={EASE}
        />
        {/* Secondary canopy blob */}
        <motion.path
          filter="url(#wc)"
          d="M88,60 C62,55 36,74 26,100 C20,120 26,143 40,158 C52,126 70,100 98,84 C116,72 88,60 88,60 Z"
          animate={{ fill: T.canopy1, opacity: 0.55 }} transition={EASE}
        />
      </motion.g>

      {/* Left mushroom cluster */}
      {[
        { x: 42, y: 372, rx: 8, ry: 4, fill: '#C84848' },
        { x: 54, y: 370, rx: 6, ry: 3, fill: '#E06060' },
        { x: 33, y: 374, rx: 5, ry: 2.5, fill: '#A03030' },
      ].map((m, i) => (
        <g key={`lm${i}`}>
          <ellipse cx={m.x} cy={m.y+5} rx={m.rx * 0.4} ry={m.ry * 1.5} fill={T.trunk} opacity={0.7} />
          <ellipse cx={m.x} cy={m.y} rx={m.rx} ry={m.ry} fill={m.fill} opacity={0.85} />
          <ellipse cx={m.x} cy={m.y+1} rx={m.rx * 0.65} ry={m.ry * 0.4} fill="rgba(255,255,255,0.2)" />
        </g>
      ))}

      {/* Right ancient gnarled tree */}
      <motion.g
        style={{ transformOrigin: '710px 380px' }}
        animate={{ rotate: [0, -1.2, 0, 1.6, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
      >
        <motion.path
          d="M700,380 C698,310 696,240 695,160 C700,156 710,154 718,156 C717,240 720,310 720,380 Z"
          animate={{ fill: T.trunk }} transition={EASE}
        />
        {/* Branch left */}
        <motion.path
          d="M698,220 C678,202 658,194 645,182 C642,179 646,175 652,177 C664,188 686,198 700,216 Z"
          animate={{ fill: T.trunk }} transition={EASE}
        />
        {/* Branch right */}
        <motion.path
          d="M716,248 C736,228 758,218 772,206 C775,203 779,207 777,210 C762,222 740,234 718,254 Z"
          animate={{ fill: T.trunk }} transition={EASE}
        />
        {/* Bark lines */}
        <motion.path d="M700,380 C698,340 696,290 695,240" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" animate={{ opacity: 0.6 }} />
        {/* Glowing moss */}
        <motion.path
          d="M718,285 C722,264 720,244 714,233 C710,244 710,266 714,287 Z"
          fill="#00C890"
          filter="url(#fg-moss-glow)"
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
        />
        {/* Shadow undercanopy */}
        <motion.path
          filter="url(#wc)"
          d="M640,214 C636,246 656,278 688,286 C720,294 756,278 768,248 C748,270 720,284 688,280 C658,274 640,248 640,224 Z"
          animate={{ fill: T.canopy2s }} transition={EASE}
        />
        {/* Main canopy */}
        <motion.path
          filter="url(#wc)"
          d="M710,64 C662,58 624,98 622,142 C620,186 650,222 692,232 C734,242 772,222 786,185 C800,150 782,106 754,84 C732,66 712,64 710,64 Z"
          animate={{ fill: T.canopy2 }} transition={EASE}
        />
      </motion.g>

      {/* Right mushroom cluster */}
      {[
        { x: 742, y: 372, rx: 7, ry: 3.5, fill: '#C84848' },
        { x: 754, y: 370, rx: 5, ry: 2.5, fill: '#E06060' },
      ].map((m, i) => (
        <g key={`rm${i}`}>
          <ellipse cx={m.x} cy={m.y+5} rx={m.rx * 0.4} ry={m.ry * 1.5} fill={T.trunk} opacity={0.7} />
          <ellipse cx={m.x} cy={m.y} rx={m.rx} ry={m.ry} fill={m.fill} opacity={0.85} />
        </g>
      ))}

      {/* Ground mid */}
      <motion.path
        filter="url(#wc)"
        d="M-10,370 C80,352 190,365 342,358 C494,350 630,363 810,355 L810,420 L-10,420 Z"
        animate={{ fill: T.groundMid }}
        transition={EASE}
      />

      {/* Atmospheric mist */}
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

      {/* Warm ground glow */}
      <motion.ellipse
        cx={400} cy={364} rx={90} ry={60}
        fill="url(#box-glow-grad)"
        animate={{ opacity: T.boxGlow }}
        transition={EASE}
      />

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
        <polyline points="396,260 390,278 401,290" fill="none" stroke="#DD2010" strokeWidth="1.2" strokeLinejoin="round" opacity={0.45} />
      </motion.g>

      {/* Smoke puffs */}
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

      {/* Ground near */}
      <motion.path
        filter="url(#wc)"
        d="M-10,388 C82,374 202,384 372,377 C542,370 662,381 810,374 L810,420 L-10,420 Z"
        animate={{ fill: T.groundNear }}
        transition={EASE}
      />

      {/* Ground front */}
      <motion.path
        filter="url(#wc)"
        d="M-10,406 C82,400 202,407 372,402 C542,396 662,404 810,399 L810,420 L-10,420 Z"
        animate={{ fill: T.groundFront }}
        transition={EASE}
      />

      {/* Fireflies */}
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

      {/* Ambient tint */}
      <motion.rect
        x={0} y={0} width={800} height={420}
        animate={{ fill: T.ambientFill, opacity: T.ambientOpacity }}
        transition={EASE}
        style={{ pointerEvents: 'none' }}
      />

      {/* Door hit area */}
      {onEnterHouse && (
        <g style={{ cursor: 'pointer' }} onClick={onEnterHouse}>
          <rect x={374} y={326} width={52} height={52} fill="transparent"/>
          <motion.ellipse
            cx={400} cy={374} rx={30} ry={8}
            fill="#FFE080"
            animate={{ opacity: [0, 0.18, 0], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ pointerEvents: 'none' }}
          />
        </g>
      )}

      {/* State label */}
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
    </>
  )
}

// ── Port ──────────────────────────────────────────────────────────────────────
export function PortFarBG({ timeState, T }) {
  return (
    <>
      <CelestialBodies timeState={timeState} T={T} />

      {/* Ocean gradient background */}
      <defs>
        <linearGradient id="pt-ocean-grad" x1="0" y1="0" x2="0" y2="1">
          <motion.stop offset="0%" animate={{ stopColor: timeState === 'SLEEP' ? '#050A2A' : timeState === 'HOME' ? '#1A3A50' : '#0096C7' }} transition={EASE} stopOpacity="0.85" />
          <motion.stop offset="100%" animate={{ stopColor: timeState === 'SLEEP' ? '#010816' : timeState === 'HOME' ? '#0A2030' : '#00B4D8' }} transition={EASE} stopOpacity="1" />
        </linearGradient>
      </defs>
      <motion.rect
        x={0} y={200} width={800} height={220}
        fill="url(#pt-ocean-grad)"
        animate={{ opacity: timeState === 'SLEEP' ? 0.9 : 0.7 }}
        transition={EASE}
      />

      {/* Distant lighthouse island */}
      <motion.g animate={{ opacity: timeState === 'SLEEP' ? 0.6 : 0.85 }} transition={EASE}>
        {/* Rocky island */}
        <ellipse cx={680} cy={325} rx={38} ry={16} fill="#4A5A60" />
        <ellipse cx={680} cy={320} rx={28} ry={12} fill="#3A4A52" />
        {/* Lighthouse tower */}
        <rect x={675} y={270} width={10} height={52} fill="#D8D8D0" />
        {/* Tower top */}
        <polygon points="672,270 688,270 680,258" fill="#C03030" />
        {/* Lighthouse windows */}
        <rect x={677} y={295} width={6} height={8} fill="#FFE880" opacity={0.8} />
        {/* Animated light beam */}
        <motion.line
          x1={680} y1={264}
          x2={720} y2={220}
          stroke="#FFE880"
          strokeWidth="2"
          strokeOpacity={0.6}
          animate={{ opacity: [0.2, 0.8, 0.2], rotate: [0, 15, 0, -15, 0] }}
          style={{ transformOrigin: '680px 264px' }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.line
          x1={680} y1={264}
          x2={640} y2={215}
          stroke="#FFE880"
          strokeWidth="1.5"
          strokeOpacity={0.4}
          animate={{ opacity: [0.8, 0.2, 0.8], rotate: [0, -15, 0, 15, 0] }}
          style={{ transformOrigin: '680px 264px' }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.g>

      {/* Sailboat silhouette */}
      <motion.g
        animate={{ opacity: 0.7, x: [0, 12, 0, -8, 0] }}
        transition={{ opacity: EASE, x: { duration: 18, repeat: Infinity, ease: 'easeInOut' } }}
      >
        {/* Hull */}
        <ellipse cx={200} cy={283} rx={36} ry={10} fill="#2A2010" />
        <path d="M164,280 C172,290 226,290 236,280 L228,276 L172,276 Z" fill="#3A3020" />
        {/* Mast */}
        <line x1={200} y1={278} x2={200} y2={228} stroke="#4A3820" strokeWidth="2.5" />
        {/* Sail */}
        <path d="M200,230 L200,275 L232,268 Z" fill="rgba(220,210,190,0.75)" />
        <path d="M200,240 L200,272 L174,266 Z" fill="rgba(200,190,170,0.60)" />
      </motion.g>

      {/* Seagulls */}
      {[
        { x: 280, y: 160 },
        { x: 310, y: 148 },
        { x: 340, y: 165 },
      ].map((g, i) => (
        <motion.path
          key={`sg${i}`}
          d={`M${g.x},${g.y} C${g.x+5},${g.y-4} ${g.x+10},${g.y-4} ${g.x+15},${g.y}`}
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          strokeOpacity={0.55}
          animate={{ opacity: [0.4, 0.7, 0.4], y: [0, -4, 0] }}
          transition={{ duration: 3 + i * 0.7, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
        />
      ))}

      {/* Clouds */}
      {CLOUDS.map((c, i) => (
        <motion.g
          key={`ptcl${i}`}
          animate={{ opacity: T.cloudOpacity, x: [0, c.spd, 0] }}
          transition={{
            opacity: EASE,
            x: { duration: c.spd * 1.8, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          <ellipse cx={c.x}         cy={c.y}         rx={50*c.s} ry={22*c.s} fill="white" opacity={0.90} />
          <ellipse cx={c.x-23*c.s} cy={c.y+ 4*c.s}  rx={28*c.s} ry={18*c.s} fill="white" opacity={0.90} />
          <ellipse cx={c.x+25*c.s} cy={c.y+ 3*c.s}  rx={33*c.s} ry={19*c.s} fill="white" opacity={0.90} />
          <ellipse cx={c.x+ 2*c.s} cy={c.y+15*c.s}  rx={46*c.s} ry={ 9*c.s} fill="#C0D8EC" opacity={0.28} />
        </motion.g>
      ))}
    </>
  )
}

export function PortMidBG({ timeState, T, housingTier, isDamaged, onEnterHouse, BUILDINGS }) {
  return (
    <>
      <defs>
        <filter id="wc" x="-12%" y="-12%" width="124%" height="124%">
          <feTurbulence type="fractalNoise" baseFrequency="0.038" numOctaves="3" seed="5" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G" result="d" />
          <feGaussianBlur in="d" stdDeviation="1.2" />
        </filter>
        <filter id="ff-glow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="3.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="box-glow-grad" cx="50%" cy="72%" r="55%">
          <stop offset="0%"   stopColor="#FFB040" stopOpacity="0.95" />
          <stop offset="55%"  stopColor="#FF8020" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#FF5010" stopOpacity="0"    />
        </radialGradient>
      </defs>

      {/* Turquoise water fills lower portion */}
      <motion.rect
        x={0} y={300} width={800} height={120}
        animate={{ fill: timeState === 'SLEEP' ? '#050F25' : timeState === 'HOME' ? '#1A4A5A' : '#20A0B8', opacity: timeState === 'SLEEP' ? 0.95 : 0.85 }}
        transition={EASE}
      />

      {/* Wave shapes */}
      {[
        { y: 308, d: 0, amp: 6 },
        { y: 316, d: 1.5, amp: 5 },
        { y: 326, d: 3, amp: 4 },
      ].map((w, i) => (
        <motion.g
          key={`wave${i}`}
          animate={{ x: [0, w.amp * 8, 0, -w.amp * 6, 0] }}
          transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'easeInOut', delay: w.d }}
        >
          <path
            d={`M-10,${w.y} C50,${w.y - w.amp} 120,${w.y + w.amp} 200,${w.y} C280,${w.y - w.amp} 360,${w.y + w.amp} 440,${w.y} C520,${w.y - w.amp} 600,${w.y + w.amp} 680,${w.y} C740,${w.y - w.amp} 780,${w.y + w.amp} 810,${w.y}`}
            fill="none"
            stroke="rgba(255,255,255,0.20)"
            strokeWidth="1.5"
          />
        </motion.g>
      ))}

      {/* Dock planks */}
      <rect x={0} y={340} width={800} height={80} fill="#A0784A" />
      {/* Horizontal plank lines */}
      {Array.from({ length: 5 }, (_, i) => (
        <line key={`pl${i}`} x1={0} y1={340 + i * 14} x2={800} y2={340 + i * 14} stroke="#8A6035" strokeWidth="1" opacity={0.5} />
      ))}
      {/* Vertical plank separations */}
      {Array.from({ length: 28 }, (_, i) => (
        <line key={`pv${i}`} x1={i * 28 + 4} y1={340} x2={i * 28 + 4} y2={420} stroke="#7A5028" strokeWidth="0.8" opacity={0.35} />
      ))}

      {/* Dock posts */}
      {[60, 180, 300, 500, 620, 740].map((px, i) => (
        <g key={`dp${i}`}>
          <rect x={px - 5} y={335} width={10} height={85} fill="#7A5028" rx={2} />
          <circle cx={px} cy={335} r={7} fill="#8A6035" />
          {/* Rope between posts */}
          {i < 5 && (
            <motion.path
              d={`M${px+5},342 Q${px + 70},355 ${[60, 180, 300, 500, 620, 740][i+1] - 5},342`}
              fill="none"
              stroke="#C09060"
              strokeWidth="1.5"
              opacity={0.6}
              animate={{ d: [`M${px+5},342 Q${px + 70},355 ${[60, 180, 300, 500, 620, 740][i+1] - 5},342`,
                             `M${px+5},342 Q${px + 70},352 ${[60, 180, 300, 500, 620, 740][i+1] - 5},342`,
                             `M${px+5},342 Q${px + 70},355 ${[60, 180, 300, 500, 620, 740][i+1] - 5},342`] }}
              transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
        </g>
      ))}

      {/* Warm ground glow */}
      <motion.ellipse
        cx={400} cy={364} rx={90} ry={60}
        fill="url(#box-glow-grad)"
        animate={{ opacity: T.boxGlow }}
        transition={EASE}
      />

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

      {/* Smoke puffs */}
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

      {/* Ground near (dock surface darker) */}
      <motion.path
        filter="url(#wc)"
        d="M-10,388 C82,374 202,384 372,377 C542,370 662,381 810,374 L810,420 L-10,420 Z"
        animate={{ fill: T.groundNear }}
        transition={EASE}
      />

      {/* Ground front */}
      <motion.path
        filter="url(#wc)"
        d="M-10,406 C82,400 202,407 372,402 C542,396 662,404 810,399 L810,420 L-10,420 Z"
        animate={{ fill: T.groundFront }}
        transition={EASE}
      />

      {/* Fireflies */}
      {FIREFLIES.map((f, i) => (
        <motion.g key={`ff${i}`} animate={{ opacity: T.fireflyOpacity }} transition={EASE}>
          <motion.circle
            cx={f.x} cy={f.y} r={2.2}
            fill="#80D0FF"
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

      {/* Ambient tint */}
      <motion.rect
        x={0} y={0} width={800} height={420}
        animate={{ fill: T.ambientFill, opacity: T.ambientOpacity }}
        transition={EASE}
        style={{ pointerEvents: 'none' }}
      />

      {/* Door hit area */}
      {onEnterHouse && (
        <g style={{ cursor: 'pointer' }} onClick={onEnterHouse}>
          <rect x={374} y={326} width={52} height={52} fill="transparent"/>
          <motion.ellipse
            cx={400} cy={374} rx={30} ry={8}
            fill="#FFE080"
            animate={{ opacity: [0, 0.18, 0], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ pointerEvents: 'none' }}
          />
        </g>
      )}

      {/* State label */}
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
    </>
  )
}

// ── Mountains ─────────────────────────────────────────────────────────────────
export function MountainsFarBG({ timeState, T }) {
  return (
    <>
      <CelestialBodies timeState={timeState} T={T} />

      {/* Back mountain peaks layer — largest, most faded */}
      <motion.path
        d="M-10,350 C30,250 90,130 170,100 C210,88 230,120 270,160 C300,192 310,150 360,110 C400,78 420,110 460,150 C500,190 510,140 560,110 C610,80 640,120 680,170 C720,218 740,190 800,220 L810,420 L-10,420 Z"
        animate={{ fill: T.hill1 }}
        transition={EASE}
        opacity={0.9}
      />

      {/* Second peak layer */}
      <motion.path
        d="M-10,370 C20,300 70,200 140,170 C180,154 200,190 240,220 C268,242 290,180 340,150 C380,126 400,170 440,200 C475,228 490,168 540,145 C580,126 610,170 650,210 C690,252 720,220 810,260 L810,420 L-10,420 Z"
        animate={{ fill: T.hill2 }}
        transition={EASE}
        opacity={0.75}
      />

      {/* Front sharp peaks */}
      <motion.path
        d="M-10,390 C10,350 60,280 110,250 C145,232 160,270 195,295 C220,316 245,260 290,238 C325,220 345,268 380,295 C412,322 430,272 475,252 C510,236 540,280 575,308 C610,336 640,295 700,320 C740,338 770,310 810,330 L810,420 L-10,420 Z"
        animate={{ fill: T.hill1 }}
        transition={EASE}
        opacity={0.55}
      />

      {/* Lavender mist bands */}
      {[
        { cx: 400, cy: 200, rx: 380, ry: 40, delay: 0 },
        { cx: 400, cy: 270, rx: 340, ry: 32, delay: 4 },
        { cx: 400, cy: 320, rx: 300, ry: 25, delay: 8 },
      ].map((m, i) => (
        <motion.ellipse
          key={`mtmist${i}`}
          cx={m.cx} cy={m.cy} rx={m.rx} ry={m.ry}
          fill="#C4B5FD"
          animate={{ opacity: [T.mistOpacity, T.mistOpacity * 1.5, T.mistOpacity], x: [0, 20, 0, -15, 0] }}
          transition={{ duration: 18 + i * 5, repeat: Infinity, ease: 'easeInOut', delay: m.delay }}
        />
      ))}

      {/* Sparse clouds */}
      {CLOUDS.slice(0, 2).map((c, i) => (
        <motion.g
          key={`mtcl${i}`}
          animate={{ opacity: T.cloudOpacity * 0.7, x: [0, c.spd * 0.8, 0] }}
          transition={{
            opacity: EASE,
            x: { duration: c.spd * 2, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          <ellipse cx={c.x}         cy={c.y}         rx={50*c.s} ry={22*c.s} fill="white" opacity={0.70} />
          <ellipse cx={c.x-23*c.s} cy={c.y+ 4*c.s}  rx={28*c.s} ry={18*c.s} fill="white" opacity={0.70} />
          <ellipse cx={c.x+25*c.s} cy={c.y+ 3*c.s}  rx={33*c.s} ry={19*c.s} fill="white" opacity={0.70} />
        </motion.g>
      ))}
    </>
  )
}

export function MountainsMidBG({ timeState, T, housingTier, isDamaged, onEnterHouse, BUILDINGS }) {
  return (
    <>
      <defs>
        <filter id="wc" x="-12%" y="-12%" width="124%" height="124%">
          <feTurbulence type="fractalNoise" baseFrequency="0.038" numOctaves="3" seed="5" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G" result="d" />
          <feGaussianBlur in="d" stdDeviation="1.2" />
        </filter>
        <filter id="ff-glow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="3.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="mt-mist-blur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="15" />
        </filter>
        <radialGradient id="box-glow-grad" cx="50%" cy="72%" r="55%">
          <stop offset="0%"   stopColor="#FFB040" stopOpacity="0.95" />
          <stop offset="55%"  stopColor="#FF8020" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#FF5010" stopOpacity="0"    />
        </radialGradient>
      </defs>

      {/* Stone cliff face background */}
      <motion.path
        d="M-10,220 C60,200 140,210 220,218 C300,226 380,212 460,218 C540,224 620,208 700,216 C750,220 780,215 810,218 L810,420 L-10,420 Z"
        animate={{ fill: T.hill2 }}
        transition={EASE}
        opacity={0.9}
      />
      {/* Stone texture lines on cliff */}
      {[240, 265, 290, 310].map((y, i) => (
        <line key={`cl${i}`} x1={-10} y1={y} x2={810} y2={y + (i % 2) * 4} stroke="rgba(0,0,0,0.08)" strokeWidth="1.2" />
      ))}

      {/* Far hills */}
      <motion.path
        filter="url(#wc)"
        d="M-10,290 C55,262 148,276 250,264 C352,252 450,270 555,257 C660,244 732,262 810,257 L810,420 L-10,420 Z"
        animate={{ fill: T.hill1 }}
        transition={EASE}
      />

      {/* Stone plateau surface */}
      <motion.path
        d="M-10,370 L810,370 L810,420 L-10,420 Z"
        animate={{ fill: T.groundMid }}
        transition={EASE}
      />
      {/* Stone texture on plateau */}
      {[378, 392, 406].map((y, i) => (
        <line key={`pt${i}`} x1={-10} y1={y} x2={810} y2={y + 2} stroke="rgba(0,0,0,0.07)" strokeWidth="1" />
      ))}
      {Array.from({ length: 12 }, (_, i) => (
        <line key={`pv${i}`} x1={i * 66 + 10} y1={370} x2={i * 66 - 10} y2={420} stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
      ))}

      {/* Large boulders */}
      {[
        { cx: 80,  cy: 368, rx: 32, ry: 18 },
        { cx: 240, cy: 372, rx: 24, ry: 14 },
        { cx: 720, cy: 366, rx: 28, ry: 16 },
      ].map((b, i) => (
        <g key={`boulder${i}`}>
          <motion.ellipse cx={b.cx} cy={b.cy} rx={b.rx} ry={b.ry} animate={{ fill: T.hill2 }} transition={EASE} />
          <motion.ellipse cx={b.cx - b.rx*0.3} cy={b.cy - b.ry*0.3} rx={b.rx*0.5} ry={b.ry*0.5} animate={{ fill: T.hill1 }} transition={EASE} opacity={0.5} />
        </g>
      ))}

      {/* Alpine trees */}
      {[
        { x: 120, h: 95 },
        { x: 220, h: 80 },
        { x: 580, h: 88 },
        { x: 680, h: 76 },
      ].map((tr, i) => (
        <g key={`mt-tree${i}`}>
          <motion.path
            d={`M${tr.x},${370 - tr.h} L${tr.x - 24},${370} L${tr.x + 24},${370} Z`}
            animate={{ fill: T.canopy1 }}
            transition={EASE}
          />
          <motion.path
            d={`M${tr.x},${370 - tr.h * 0.7} L${tr.x - 18},${370 - tr.h * 0.2} L${tr.x + 18},${370 - tr.h * 0.2} Z`}
            animate={{ fill: T.canopy1s }}
            transition={EASE}
            opacity={0.8}
          />
        </g>
      ))}

      {/* Lavender mist at ground level */}
      {[
        { cx: 150, cy: 370, rx: 140, ry: 22 },
        { cx: 650, cy: 365, rx: 120, ry: 18 },
        { cx: 400, cy: 375, rx: 160, ry: 20 },
      ].map((m, i) => (
        <motion.ellipse
          key={`mtgm${i}`}
          cx={m.cx} cy={m.cy} rx={m.rx} ry={m.ry}
          fill="#C4B5FD"
          filter="url(#mt-mist-blur)"
          animate={{ opacity: [T.mistOpacity * 0.8, T.mistOpacity * 1.2, T.mistOpacity * 0.8], x: [0, 15, 0, -10, 0] }}
          transition={{ duration: 16 + i * 4, repeat: Infinity, ease: 'easeInOut', delay: i * 3 }}
        />
      ))}

      {/* Atmospheric mist */}
      {MIST.map((m, i) => (
        <motion.g
          key={`mist${i}`}
          animate={{
            opacity: [m.delay % 3 === 0 ? T.mistOpacity : T.mistOpacity * 0.7, T.mistOpacity * 1.4, T.mistOpacity * 0.6, T.mistOpacity],
            x: [0, m.spd, 0, -m.spd * 0.4, 0],
          }}
          transition={{ duration: 22 + i * 8, repeat: Infinity, ease: 'easeInOut', delay: m.delay }}
        >
          <ellipse cx={m.cx} cy={m.cy} rx={m.rx} ry={m.ry} fill="#C4B5FD" />
        </motion.g>
      ))}

      {/* Warm ground glow */}
      <motion.ellipse
        cx={400} cy={364} rx={90} ry={60}
        fill="url(#box-glow-grad)"
        animate={{ opacity: T.boxGlow }}
        transition={EASE}
      />

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

      {/* Smoke puffs */}
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

      {/* Ground near */}
      <motion.path
        filter="url(#wc)"
        d="M-10,388 C82,374 202,384 372,377 C542,370 662,381 810,374 L810,420 L-10,420 Z"
        animate={{ fill: T.groundNear }}
        transition={EASE}
      />

      {/* Ground front */}
      <motion.path
        filter="url(#wc)"
        d="M-10,406 C82,400 202,407 372,402 C542,396 662,404 810,399 L810,420 L-10,420 Z"
        animate={{ fill: T.groundFront }}
        transition={EASE}
      />

      {/* Fireflies */}
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

      {/* Ambient tint */}
      <motion.rect
        x={0} y={0} width={800} height={420}
        animate={{ fill: T.ambientFill, opacity: T.ambientOpacity }}
        transition={EASE}
        style={{ pointerEvents: 'none' }}
      />

      {/* Door hit area */}
      {onEnterHouse && (
        <g style={{ cursor: 'pointer' }} onClick={onEnterHouse}>
          <rect x={374} y={326} width={52} height={52} fill="transparent"/>
          <motion.ellipse
            cx={400} cy={374} rx={30} ry={8}
            fill="#FFE080"
            animate={{ opacity: [0, 0.18, 0], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ pointerEvents: 'none' }}
          />
        </g>
      )}

      {/* State label */}
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
    </>
  )
}

// ── Meadow ────────────────────────────────────────────────────────────────────
export function MeadowFarBG({ timeState, T }) {
  // 5 large cumulus clouds with many ellipses
  const MEADOW_CLOUDS = [
    { x: 100, y: 60,  s: 1.1, spd: 32 },
    { x: 280, y: 40,  s: 1.4, spd: 45 },
    { x: 450, y: 80,  s: 0.9, spd: 26 },
    { x: 620, y: 50,  s: 1.2, spd: 38 },
    { x: 750, y: 110, s: 0.8, spd: 20 },
  ]

  return (
    <>
      <CelestialBodies timeState={timeState} T={T} />

      {/* Distant rolling hills */}
      <motion.path
        d="M-10,320 C60,295 150,308 240,298 C330,288 420,310 510,300 C600,290 690,308 810,302 L810,420 L-10,420 Z"
        animate={{ fill: T.hill1 }}
        transition={EASE}
        opacity={0.85}
      />
      <motion.path
        d="M-10,350 C80,330 180,345 290,338 C400,330 510,348 620,340 C700,334 760,346 810,342 L810,420 L-10,420 Z"
        animate={{ fill: T.hill2 }}
        transition={EASE}
        opacity={0.9}
      />

      {/* Windmill silhouette at x~680 y~250 */}
      <g>
        {/* Tower */}
        <motion.path
          d="M672,340 L676,280 L684,280 L688,340 Z"
          animate={{ fill: timeState === 'SLEEP' ? '#0A1408' : '#5A7030' }}
          transition={EASE}
        />
        {/* House top */}
        <motion.path
          d="M670,282 L680,268 L690,282 Z"
          animate={{ fill: timeState === 'SLEEP' ? '#080F06' : '#4A6028' }}
          transition={EASE}
        />
        {/* Slowly rotating blades */}
        <motion.g
          style={{ transformOrigin: '680px 280px' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
        >
          {/* 4 blade paths */}
          <path d="M680,280 L678,250 L682,250 Z" fill="rgba(120,140,80,0.85)" />
          <path d="M680,280 L710,278 L710,282 Z" fill="rgba(120,140,80,0.85)" />
          <path d="M680,280 L682,310 L678,310 Z" fill="rgba(120,140,80,0.85)" />
          <path d="M680,280 L650,282 L650,278 Z" fill="rgba(120,140,80,0.85)" />
        </motion.g>
        <circle cx={680} cy={280} r={4} fill="#3A5018" opacity={0.9} />
      </g>

      {/* Elaborate fluffy clouds */}
      {MEADOW_CLOUDS.map((c, i) => (
        <motion.g
          key={`mwcl${i}`}
          animate={{ opacity: T.cloudOpacity, x: [0, c.spd, 0] }}
          transition={{
            opacity: EASE,
            x: { duration: c.spd * 1.8, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          <ellipse cx={c.x}            cy={c.y}           rx={52*c.s} ry={24*c.s} fill="white" opacity={0.92} />
          <ellipse cx={c.x-24*c.s}    cy={c.y+ 5*c.s}    rx={30*c.s} ry={20*c.s} fill="white" opacity={0.90} />
          <ellipse cx={c.x+26*c.s}    cy={c.y+ 4*c.s}    rx={35*c.s} ry={21*c.s} fill="white" opacity={0.90} />
          <ellipse cx={c.x+ 8*c.s}    cy={c.y-14*c.s}    rx={22*c.s} ry={18*c.s} fill="white" opacity={0.88} />
          <ellipse cx={c.x-14*c.s}    cy={c.y-10*c.s}    rx={18*c.s} ry={14*c.s} fill="white" opacity={0.84} />
          <ellipse cx={c.x+18*c.s}    cy={c.y-10*c.s}    rx={16*c.s} ry={13*c.s} fill="white" opacity={0.82} />
          <ellipse cx={c.x+ 2*c.s}    cy={c.y+16*c.s}    rx={48*c.s} ry={10*c.s} fill="#D0E8F0" opacity={0.30} />
          <ellipse cx={c.x-8*c.s}     cy={c.y+ 8*c.s}    rx={14*c.s} ry={10*c.s} fill="white" opacity={0.78} />
        </motion.g>
      ))}
    </>
  )
}

export function MeadowMidBG({ timeState, T, housingTier, isDamaged, onEnterHouse, BUILDINGS }) {
  // Wildflower positions (deterministic pseudo-random)
  const WILDFLOWERS = [
    { x: 55,  y: 380, r: 4, fill: '#F9A8D4' },
    { x: 88,  y: 392, r: 3, fill: '#FDE68A' },
    { x: 140, y: 385, r: 5, fill: '#A7F3D0' },
    { x: 170, y: 395, r: 3.5, fill: '#C4B5FD' },
    { x: 210, y: 388, r: 4, fill: '#F9A8D4' },
    { x: 255, y: 382, r: 3, fill: '#FDE68A' },
    { x: 300, y: 393, r: 4.5, fill: '#A7F3D0' },
    { x: 545, y: 381, r: 3, fill: '#F9A8D4' },
    { x: 580, y: 394, r: 4, fill: '#FDE68A' },
    { x: 620, y: 386, r: 5, fill: '#C4B5FD' },
    { x: 660, y: 392, r: 3.5, fill: '#A7F3D0' },
    { x: 700, y: 384, r: 4, fill: '#F9A8D4' },
    { x: 740, y: 393, r: 3, fill: '#FDE68A' },
    { x: 770, y: 388, r: 4.5, fill: '#C4B5FD' },
    { x: 120, y: 410, r: 3, fill: '#FDE68A' },
    { x: 200, y: 412, r: 4, fill: '#F9A8D4' },
    { x: 340, y: 405, r: 3.5, fill: '#A7F3D0' },
    { x: 460, y: 408, r: 3, fill: '#C4B5FD' },
    { x: 620, y: 410, r: 4, fill: '#FDE68A' },
    { x: 730, y: 406, r: 3.5, fill: '#F9A8D4' },
  ]

  // Tall grass blade paths
  const GRASS_BLADES = [
    { x: 48, y: 375, h: 30 }, { x: 60, y: 372, h: 25 }, { x: 75, y: 378, h: 28 },
    { x: 160, y: 374, h: 26 }, { x: 175, y: 370, h: 32 }, { x: 188, y: 376, h: 24 },
    { x: 248, y: 373, h: 28 }, { x: 263, y: 369, h: 34 }, { x: 280, y: 377, h: 27 },
    { x: 530, y: 374, h: 29 }, { x: 548, y: 371, h: 26 }, { x: 562, y: 378, h: 31 },
    { x: 648, y: 373, h: 28 }, { x: 664, y: 368, h: 35 }, { x: 680, y: 376, h: 25 },
    { x: 750, y: 372, h: 30 }, { x: 765, y: 369, h: 27 }, { x: 782, y: 374, h: 32 },
  ]

  return (
    <>
      <defs>
        <filter id="wc" x="-12%" y="-12%" width="124%" height="124%">
          <feTurbulence type="fractalNoise" baseFrequency="0.038" numOctaves="3" seed="5" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G" result="d" />
          <feGaussianBlur in="d" stdDeviation="1.2" />
        </filter>
        <filter id="ff-glow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="3.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="box-glow-grad" cx="50%" cy="72%" r="55%">
          <stop offset="0%"   stopColor="#FFB040" stopOpacity="0.95" />
          <stop offset="55%"  stopColor="#FF8020" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#FF5010" stopOpacity="0"    />
        </radialGradient>
      </defs>

      {/* Far hills in lime green */}
      <motion.path
        filter="url(#wc)"
        d="M-10,290 C55,262 148,276 250,264 C352,252 450,270 555,257 C660,244 732,262 810,257 L810,420 L-10,420 Z"
        animate={{ fill: T.hill1 }}
        transition={EASE}
      />

      {/* Mid hills */}
      <motion.path
        filter="url(#wc)"
        d="M-10,334 C72,314 165,328 292,318 C418,308 532,326 650,316 C720,310 768,322 810,318 L810,420 L-10,420 Z"
        animate={{ fill: T.hill2 }}
        transition={EASE}
      />

      {/* Giant sunflower — left tall */}
      <motion.g
        style={{ transformOrigin: '80px 370px' }}
        animate={{ rotate: [0, 1.5, 0, -1.5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Stem */}
        <rect x={77} y={220} width={6} height={150} rx={3} fill="#3A6010" />
        {/* Petals (8 ellipses rotated) */}
        {Array.from({ length: 8 }, (_, i) => (
          <ellipse
            key={`lpetal${i}`}
            cx={80} cy={193}
            rx={10} ry={24}
            fill="#FACC15"
            opacity={0.9}
            transform={`rotate(${i * 45} 80 218)`}
          />
        ))}
        {/* Head */}
        <circle cx={80} cy={218} r={22} fill="#FACC15" />
        <circle cx={80} cy={218} r={12} fill="#78350F" />
      </motion.g>

      {/* Giant sunflower — right tall */}
      <motion.g
        style={{ transformOrigin: '720px 370px' }}
        animate={{ rotate: [0, -1.2, 0, 1.8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
      >
        <rect x={717} y={240} width={6} height={130} rx={3} fill="#3A6010" />
        {Array.from({ length: 8 }, (_, i) => (
          <ellipse
            key={`rpetal${i}`}
            cx={720} cy={218}
            rx={10} ry={22}
            fill="#FACC15"
            opacity={0.9}
            transform={`rotate(${i * 45} 720 240)`}
          />
        ))}
        <circle cx={720} cy={240} r={20} fill="#FACC15" />
        <circle cx={720} cy={240} r={11} fill="#78350F" />
      </motion.g>

      {/* Medium sunflower — center-right behind house */}
      <motion.g
        style={{ transformOrigin: '580px 375px' }}
        animate={{ rotate: [0, 1.0, 0, -1.0, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
      >
        <rect x={577} y={280} width={5} height={95} rx={2.5} fill="#3A6010" />
        {Array.from({ length: 8 }, (_, i) => (
          <ellipse
            key={`mpetal${i}`}
            cx={580} cy={264}
            rx={7} ry={16}
            fill="#FACC15"
            opacity={0.88}
            transform={`rotate(${i * 45} 580 280)`}
          />
        ))}
        <circle cx={580} cy={280} r={14} fill="#FACC15" />
        <circle cx={580} cy={280} r={8} fill="#78350F" />
      </motion.g>

      {/* Tall grass blades */}
      {GRASS_BLADES.map((g, i) => (
        <motion.path
          key={`grass${i}`}
          d={`M${g.x},${g.y} C${g.x + 4},${g.y - g.h * 0.6} ${g.x + 8},${g.y - g.h * 0.8} ${g.x + 5},${g.y - g.h}`}
          fill="none"
          stroke={T.canopy1}
          strokeWidth="2"
          animate={{
            d: [
              `M${g.x},${g.y} C${g.x + 4},${g.y - g.h * 0.6} ${g.x + 8},${g.y - g.h * 0.8} ${g.x + 5},${g.y - g.h}`,
              `M${g.x},${g.y} C${g.x + 7},${g.y - g.h * 0.5} ${g.x + 12},${g.y - g.h * 0.75} ${g.x + 9},${g.y - g.h}`,
              `M${g.x},${g.y} C${g.x + 4},${g.y - g.h * 0.6} ${g.x + 8},${g.y - g.h * 0.8} ${g.x + 5},${g.y - g.h}`,
            ],
          }}
          transition={{ duration: 3 + (i % 4) * 0.5, repeat: Infinity, ease: 'easeInOut', delay: (i % 5) * 0.4 }}
          opacity={0.85}
        />
      ))}

      {/* Ground mid */}
      <motion.path
        filter="url(#wc)"
        d="M-10,370 C80,352 190,365 342,358 C494,350 630,363 810,355 L810,420 L-10,420 Z"
        animate={{ fill: T.groundMid }}
        transition={EASE}
      />

      {/* Wildflower dots */}
      {WILDFLOWERS.map((f, i) => (
        <circle key={`wf${i}`} cx={f.x} cy={f.y} r={f.r} fill={f.fill} opacity={0.85} />
      ))}

      {/* Butterfly 1 */}
      <motion.g
        animate={{ x: [0, 30, 60, 45, 70, 40, 0], y: [0, -15, -5, -20, -10, -25, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ellipse cx={320} cy={340} rx={12} ry={7} fill="#F9A8D4" opacity={0.75} transform="rotate(-20 320 340)" />
        <ellipse cx={334} cy={338} rx={10} ry={6} fill="#F9A8D4" opacity={0.65} transform="rotate(20 334 338)" />
        <ellipse cx={320} cy={347} rx={8}  ry={5} fill="#E879F9" opacity={0.65} transform="rotate(15 320 347)" />
        <ellipse cx={332} cy={346} rx={7}  ry={4} fill="#E879F9" opacity={0.60} transform="rotate(-15 332 346)" />
      </motion.g>

      {/* Butterfly 2 */}
      <motion.g
        animate={{ x: [0, -20, -50, -30, -60, -35, 0], y: [0, -10, -20, -5, -18, -8, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      >
        <ellipse cx={500} cy={330} rx={10} ry={6} fill="#A7F3D0" opacity={0.75} transform="rotate(-20 500 330)" />
        <ellipse cx={512} cy={328} rx={9}  ry={5} fill="#A7F3D0" opacity={0.65} transform="rotate(20 512 328)" />
        <ellipse cx={500} cy={336} rx={7}  ry={4} fill="#6EE7B7" opacity={0.65} transform="rotate(15 500 336)" />
        <ellipse cx={510} cy={335} rx={6}  ry={4} fill="#6EE7B7" opacity={0.60} transform="rotate(-15 510 335)" />
      </motion.g>

      {/* Atmospheric mist (subtle) */}
      {MIST.map((m, i) => (
        <motion.g
          key={`mist${i}`}
          animate={{
            opacity: [T.mistOpacity * 0.5, T.mistOpacity * 0.8, T.mistOpacity * 0.4, T.mistOpacity * 0.6],
            x: [0, m.spd * 0.5, 0, -m.spd * 0.3, 0],
          }}
          transition={{ duration: 22 + i * 8, repeat: Infinity, ease: 'easeInOut', delay: m.delay }}
        >
          <ellipse cx={m.cx} cy={m.cy} rx={m.rx} ry={m.ry} fill="white" />
        </motion.g>
      ))}

      {/* Warm ground glow */}
      <motion.ellipse
        cx={400} cy={364} rx={90} ry={60}
        fill="url(#box-glow-grad)"
        animate={{ opacity: T.boxGlow }}
        transition={EASE}
      />

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

      {/* Smoke puffs */}
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

      {/* Ground near */}
      <motion.path
        filter="url(#wc)"
        d="M-10,388 C82,374 202,384 372,377 C542,370 662,381 810,374 L810,420 L-10,420 Z"
        animate={{ fill: T.groundNear }}
        transition={EASE}
      />

      {/* Ground front */}
      <motion.path
        filter="url(#wc)"
        d="M-10,406 C82,400 202,407 372,402 C542,396 662,404 810,399 L810,420 L-10,420 Z"
        animate={{ fill: T.groundFront }}
        transition={EASE}
      />

      {/* Fireflies */}
      {FIREFLIES.map((f, i) => (
        <motion.g key={`ff${i}`} animate={{ opacity: T.fireflyOpacity }} transition={EASE}>
          <motion.circle
            cx={f.x} cy={f.y} r={2.2}
            fill="#D4F4A0"
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

      {/* Ambient tint */}
      <motion.rect
        x={0} y={0} width={800} height={420}
        animate={{ fill: T.ambientFill, opacity: T.ambientOpacity }}
        transition={EASE}
        style={{ pointerEvents: 'none' }}
      />

      {/* Door hit area */}
      {onEnterHouse && (
        <g style={{ cursor: 'pointer' }} onClick={onEnterHouse}>
          <rect x={374} y={326} width={52} height={52} fill="transparent"/>
          <motion.ellipse
            cx={400} cy={374} rx={30} ry={8}
            fill="#FFE080"
            animate={{ opacity: [0, 0.18, 0], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ pointerEvents: 'none' }}
          />
        </g>
      )}

      {/* State label */}
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
    </>
  )
}

// ── Per-biome themes (3 time states each) ─────────────────────────────────────
export const BIOME_THEMES = {
  forest: {
    AWAY: {
      skyTop:'#1A5C3A', skyBottom:'#74C69D', hill1:'#2D6A4F', hill2:'#1B4332',
      groundMid:'#1E3A29', groundNear:'#142B1E', groundFront:'#0C1E14',
      canopy1:'#286040', canopy1s:'#1A4028', canopy2:'#1E5235', canopy2s:'#123020',
      trunk:'#7B5230', cloudOpacity:0.6, fireflyOpacity:0, starOpacity:0, boxGlow:0,
      ambientFill:'#B8FFD0', ambientOpacity:0.06, mistOpacity:0.08,
      label:'Forest · Daytime', labelFill:'#74C69D',
    },
    HOME: {
      skyTop:'#3D1C4A', skyBottom:'#7B3F6E', hill1:'#1A3320', hill2:'#122A18',
      groundMid:'#0E2018', groundNear:'#091510', groundFront:'#060E09',
      canopy1:'#1E4028', canopy1s:'#122818', canopy2:'#183520', canopy2s:'#0E2214',
      trunk:'#5A3820', cloudOpacity:0, fireflyOpacity:0.3, starOpacity:0, boxGlow:1,
      ambientFill:'#D4A840', ambientOpacity:0.14, mistOpacity:0.12,
      label:'Forest · Evening', labelFill:'#9B7250',
    },
    SLEEP: {
      skyTop:'#020A0A', skyBottom:'#040F10', hill1:'#060E08', hill2:'#040A06',
      groundMid:'#030708', groundNear:'#020506', groundFront:'#010304',
      canopy1:'#0A1410', canopy1s:'#060C08', canopy2:'#081210', canopy2s:'#050A08',
      trunk:'#1E1610', cloudOpacity:0, fireflyOpacity:1, starOpacity:1, boxGlow:0,
      ambientFill:'#001820', ambientOpacity:0.30, mistOpacity:0.14,
      label:'Forest · Night', labelFill:'#40C8A0',
    },
  },
  port: {
    AWAY: {
      skyTop:'#0077B6', skyBottom:'#90E0EF', hill1:'#3A8090', hill2:'#2E6878',
      groundMid:'#5A8A7A', groundNear:'#4A7868', groundFront:'#3A6458',
      canopy1:'#4A9090', canopy1s:'#2A5858', canopy2:'#3A8070', canopy2s:'#204840',
      trunk:'#8A6040', cloudOpacity:1, fireflyOpacity:0, starOpacity:0, boxGlow:0,
      ambientFill:'#FFE8B0', ambientOpacity:0.08, mistOpacity:0.04,
      label:'Port · Daytime', labelFill:'#0096C7',
    },
    HOME: {
      skyTop:'#C25018', skyBottom:'#F59E0B', hill1:'#2A5A60', hill2:'#1E4550',
      groundMid:'#3A5A50', groundNear:'#2A4840', groundFront:'#1E3830',
      canopy1:'#2E5850', canopy1s:'#1C3830', canopy2:'#264A44', canopy2s:'#163028',
      trunk:'#6A4830', cloudOpacity:0, fireflyOpacity:0, starOpacity:0, boxGlow:1,
      ambientFill:'#FF8020', ambientOpacity:0.15, mistOpacity:0.08,
      label:'Port · Evening', labelFill:'#F59E0B',
    },
    SLEEP: {
      skyTop:'#050A2A', skyBottom:'#0A1545', hill1:'#0A1820', hill2:'#080F18',
      groundMid:'#0A1418', groundNear:'#080E12', groundFront:'#05090D',
      canopy1:'#0A1A20', canopy1s:'#061018', canopy2:'#081418', canopy2s:'#050C10',
      trunk:'#1E1A14', cloudOpacity:0, fireflyOpacity:0, starOpacity:1, boxGlow:0,
      ambientFill:'#000818', ambientOpacity:0.35, mistOpacity:0.12,
      label:'Port · Night', labelFill:'#4488CC',
    },
  },
  mountains: {
    AWAY: {
      skyTop:'#2D0D5A', skyBottom:'#7C3AED', hill1:'#4C1D95', hill2:'#3730A3',
      groundMid:'#374151', groundNear:'#2D3748', groundFront:'#1A202C',
      canopy1:'#3A4A70', canopy1s:'#243050', canopy2:'#324060', canopy2s:'#1E2840',
      trunk:'#4A6080', cloudOpacity:0.5, fireflyOpacity:0, starOpacity:0, boxGlow:0,
      ambientFill:'#C4B5FD', ambientOpacity:0.08, mistOpacity:0.18,
      label:'Mountains · Daytime', labelFill:'#A78BFA',
    },
    HOME: {
      skyTop:'#6B21A8', skyBottom:'#DB2777', hill1:'#3730A3', hill2:'#2E1065',
      groundMid:'#1F2937', groundNear:'#111827', groundFront:'#0A0F1A',
      canopy1:'#2A3860', canopy1s:'#1A2440', canopy2:'#243050', canopy2s:'#141A30',
      trunk:'#3A4060', cloudOpacity:0, fireflyOpacity:0, starOpacity:0, boxGlow:1,
      ambientFill:'#F0ABFC', ambientOpacity:0.12, mistOpacity:0.20,
      label:'Mountains · Evening', labelFill:'#E879F9',
    },
    SLEEP: {
      skyTop:'#030712', skyBottom:'#0F0A20', hill1:'#1E1B4B', hill2:'#14103A',
      groundMid:'#111827', groundNear:'#0A0F1A', groundFront:'#07090F',
      canopy1:'#141830', canopy1s:'#0A0C1E', canopy2:'#101428', canopy2s:'#080A18',
      trunk:'#1A1A28', cloudOpacity:0, fireflyOpacity:0, starOpacity:1, boxGlow:0,
      ambientFill:'#100838', ambientOpacity:0.40, mistOpacity:0.22,
      label:'Mountains · Night', labelFill:'#7C3AED',
    },
  },
  meadow: {
    AWAY: {
      skyTop:'#0EA5E9', skyBottom:'#BAE6FD', hill1:'#4ADE80', hill2:'#22C55E',
      groundMid:'#16A34A', groundNear:'#15803D', groundFront:'#166534',
      canopy1:'#4ADE80', canopy1s:'#22C55E', canopy2:'#22C55E', canopy2s:'#16A34A',
      trunk:'#65A30D', cloudOpacity:1, fireflyOpacity:0, starOpacity:0, boxGlow:0,
      ambientFill:'#FEF08A', ambientOpacity:0.08, mistOpacity:0.03,
      label:'Meadow · Daytime', labelFill:'#16A34A',
    },
    HOME: {
      skyTop:'#C2410C', skyBottom:'#FB923C', hill1:'#16A34A', hill2:'#166534',
      groundMid:'#14532D', groundNear:'#0F3D24', groundFront:'#0A2819',
      canopy1:'#1C6B3A', canopy1s:'#124A28', canopy2:'#186030', canopy2s:'#103E20',
      trunk:'#4D7C0F', cloudOpacity:0, fireflyOpacity:0.2, starOpacity:0, boxGlow:1,
      ambientFill:'#FFA500', ambientOpacity:0.16, mistOpacity:0.05,
      label:'Meadow · Evening', labelFill:'#A3E635',
    },
    SLEEP: {
      skyTop:'#0C0A24', skyBottom:'#1E1B3A', hill1:'#0A1F0A', hill2:'#061406',
      groundMid:'#052E16', groundNear:'#041F10', groundFront:'#03140B',
      canopy1:'#0A1F0A', canopy1s:'#061406', canopy2:'#081A08', canopy2s:'#051004',
      trunk:'#2D3B06', cloudOpacity:0, fireflyOpacity:0.7, starOpacity:1, boxGlow:0,
      ambientFill:'#000A18', ambientOpacity:0.28, mistOpacity:0.06,
      label:'Meadow · Night', labelFill:'#84CC16',
    },
  },
}
