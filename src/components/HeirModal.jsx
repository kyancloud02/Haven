import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PRESTIGE_BUFFS, toRoman } from '../hooks/useHeritage'

const FONT_HEAD = "'Fredoka One', sans-serif"
const FONT_BODY = "'Nunito', sans-serif"
const GOLD      = '#F0C840'
const DIM       = 'rgba(255,255,255,0.55)'

// ── Stat chip ──────────────────────────────────────────────────────────────────
function Stat({ label, value, accent = GOLD }) {
  return (
    <div
      className="flex flex-col items-center px-4 py-2.5 rounded-xl"
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <span style={{ fontFamily: FONT_HEAD, fontSize: '1.3rem', color: accent, lineHeight: 1 }}>
        {value}
      </span>
      <span style={{ fontFamily: FONT_BODY, fontSize: '0.62rem', color: 'rgba(255,255,255,0.38)',
                     letterSpacing: '0.10em', textTransform: 'uppercase', marginTop: 3 }}>
        {label}
      </span>
    </div>
  )
}

// ── Buff preview card ──────────────────────────────────────────────────────────
function BuffCard({ buff, canAfford }) {
  return (
    <div
      className="flex items-center gap-3 px-3 py-2 rounded-lg"
      style={{
        background: canAfford ? 'rgba(240,200,64,0.07)' : 'rgba(255,255,255,0.03)',
        border:     `1px solid ${canAfford ? 'rgba(240,200,64,0.22)' : 'rgba(255,255,255,0.06)'}`,
        opacity:    canAfford ? 1 : 0.5,
      }}
    >
      <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{buff.icon}</span>
      <div className="flex-1 min-w-0">
        <p style={{ fontFamily: FONT_BODY, fontSize: '0.76rem', fontWeight: 700,
                    color: canAfford ? GOLD : 'rgba(255,255,255,0.5)' }}>
          {buff.name}
        </p>
        <p style={{ fontFamily: FONT_BODY, fontSize: '0.66rem', color: 'rgba(255,255,255,0.35)' }}>
          {buff.description}
        </p>
      </div>
      <span style={{ fontFamily: FONT_BODY, fontSize: '0.7rem', fontWeight: 700, flexShrink: 0,
                     color: canAfford ? GOLD : 'rgba(255,255,255,0.28)' }}>
        {buff.cost}pt
      </span>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function HeirModal({
  gameState,
  ageDays,
  eraPrestige,
  totalPrestige,
  onContinue,
  onRestart,
}) {
  const [phase, setPhase] = useState('announce')   // 'announce' | 'confirm'

  const generation   = gameState.legacyGeneration ?? 1
  const treaties     = gameState.activeTreaties?.length ?? 0

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(12px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative w-full max-w-sm overflow-hidden"
        style={{
          background:   'rgba(10,8,5,0.97)',
          borderRadius: 20,
          border:       '1px solid rgba(240,200,64,0.30)',
          boxShadow:    '0 32px 100px rgba(0,0,0,0.85), 0 0 80px rgba(240,200,64,0.10)',
        }}
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1,    opacity: 1, y: 0  }}
        exit={{    scale: 0.85, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 22, stiffness: 260 }}
      >
        {/* Gold top bar */}
        <div style={{ height: 3, background: 'linear-gradient(90deg, transparent, #F0C840, transparent)' }} />

        <div className="px-6 pt-5 pb-6">
          <AnimatePresence mode="wait">

            {/* ── Phase: Announcement ── */}
            {phase === 'announce' && (
              <motion.div
                key="announce"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {/* Animated crest */}
                <motion.div
                  className="text-5xl text-center mb-3"
                  animate={{ scale: [1, 1.08, 1], rotate: [-1, 1, -1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  ⚜
                </motion.div>

                <h2 style={{ fontFamily: FONT_HEAD, color: GOLD, fontSize: '1.35rem',
                             textAlign: 'center', letterSpacing: '0.02em', marginBottom: 4 }}>
                  An Heir is Born
                </h2>
                <p style={{ fontFamily: FONT_BODY, color: DIM, fontSize: '0.8rem',
                            textAlign: 'center', lineHeight: 1.6, marginBottom: 20 }}>
                  Haven has grown mighty. A worthy heir stands ready
                  to carry your legacy forward.
                </p>

                {/* Kingdom stats */}
                <div className="grid grid-cols-3 gap-2 mb-5">
                  <Stat label="Days ruled" value={`Day ${ageDays}`} />
                  <Stat label="Treaties"   value={treaties} accent="#7AB8E8" />
                  <Stat label="Generation" value={`Gen ${toRoman(generation)}`} accent="#C8A8E8" />
                </div>

                {/* Prestige earned */}
                <div
                  className="rounded-xl px-4 py-3 mb-5"
                  style={{ background: 'rgba(240,200,64,0.08)', border: '1px solid rgba(240,200,64,0.22)' }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p style={{ fontFamily: FONT_BODY, fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)',
                                letterSpacing: '0.10em', textTransform: 'uppercase' }}>
                      Prestige Earned
                    </p>
                    <p style={{ fontFamily: FONT_HEAD, fontSize: '1.1rem', color: GOLD }}>
                      +{eraPrestige} pts
                    </p>
                  </div>
                  <p style={{ fontFamily: FONT_BODY, fontSize: '0.68rem', color: 'rgba(255,255,255,0.30)' }}>
                    {ageDays} days × 5 · {treaties} treaties × 10 · {gameState.housingTier}
                  </p>
                  {gameState.prestigePoints > 0 && (
                    <p style={{ fontFamily: FONT_BODY, fontSize: '0.7rem', color: GOLD,
                                fontWeight: 700, marginTop: 4 }}>
                      Total banked: {totalPrestige} pts
                    </p>
                  )}
                </div>

                {/* Buff preview */}
                <p style={{ fontFamily: FONT_BODY, fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)',
                            letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 8 }}>
                  Legacy Buffs — Available Next Era
                </p>
                <div className="flex flex-col gap-1.5 mb-5">
                  {PRESTIGE_BUFFS.map(b => (
                    <BuffCard key={b.id} buff={b} canAfford={totalPrestige >= b.cost} />
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={onContinue}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                    style={{
                      fontFamily: FONT_BODY,
                      background: 'rgba(255,255,255,0.06)',
                      color: 'rgba(255,255,255,0.55)',
                      border: '1px solid rgba(255,255,255,0.10)',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; e.currentTarget.style.color = 'white' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)' }}
                  >
                    Continue Ruling
                  </button>

                  <motion.button
                    onClick={() => setPhase('confirm')}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                    style={{
                      fontFamily:  FONT_HEAD,
                      fontSize:    '0.9rem',
                      background:  'rgba(240,200,64,0.15)',
                      color:       GOLD,
                      border:      '1px solid rgba(240,200,64,0.35)',
                      cursor:      'pointer',
                      letterSpacing: '0.03em',
                    }}
                    whileHover={{ background: 'rgba(240,200,64,0.25)' }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 340, damping: 22 }}
                  >
                    New Era →
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ── Phase: Confirm restart ── */}
            {phase === 'confirm' && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-4xl text-center mb-3">👑</div>
                <h2 style={{ fontFamily: FONT_HEAD, color: GOLD, fontSize: '1.2rem',
                             textAlign: 'center', marginBottom: 8 }}>
                  Begin a New Era?
                </h2>
                <p style={{ fontFamily: FONT_BODY, color: DIM, fontSize: '0.82rem',
                            textAlign: 'center', lineHeight: 1.65, marginBottom: 20 }}>
                  Your kingdom resets to its humble origins. All gold, treaties,
                  and upgrades are lost. Your heir carries forward:
                </p>

                {/* What carries over */}
                {[
                  [`✦ ${totalPrestige} prestige points`, GOLD],
                  [`⚜ Generation ${toRoman(generation + 1)} title`, '#C8A8E8'],
                  ['📜 Legacy buff shop unlocked', '#7AB8E8'],
                ].map(([text, color]) => (
                  <div key={text} className="flex items-center gap-2 mb-2">
                    <p style={{ fontFamily: FONT_BODY, fontSize: '0.8rem',
                                fontWeight: 700, color }}>{text}</p>
                  </div>
                ))}

                {/* What is lost */}
                <p style={{ fontFamily: FONT_BODY, fontSize: '0.72rem',
                            color: 'rgba(255,80,80,0.55)', marginTop: 12, marginBottom: 18 }}>
                  Lost: {gameState.gold}g · {gameState.housingTier} · {treaties} treaties
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => setPhase('announce')}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                    style={{
                      fontFamily: FONT_BODY,
                      background: 'rgba(255,255,255,0.06)',
                      color: 'rgba(255,255,255,0.55)',
                      border: '1px solid rgba(255,255,255,0.10)',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; e.currentTarget.style.color = 'white' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)' }}
                  >
                    ← Go Back
                  </button>

                  <motion.button
                    onClick={onRestart}
                    className="flex-1 py-2.5 rounded-xl font-bold"
                    style={{
                      fontFamily:    FONT_HEAD,
                      fontSize:      '0.95rem',
                      background:    'rgba(240,200,64,0.20)',
                      color:         GOLD,
                      border:        '1px solid rgba(240,200,64,0.45)',
                      cursor:        'pointer',
                      letterSpacing: '0.03em',
                    }}
                    whileHover={{ background: 'rgba(240,200,64,0.32)' }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 340, damping: 22 }}
                  >
                    Confirm ⚜
                  </motion.button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}
