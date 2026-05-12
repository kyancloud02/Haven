import { motion } from 'framer-motion'

const FONT_HEAD = "'Fredoka One', sans-serif"
const FONT_BODY = "'Nunito', sans-serif"

export default function CrisisModal({ crisisEvent, onDismiss }) {
  const intercepted = crisisEvent.outcome === 'intercepted'
  const accent = intercepted ? '#4AD06A' : '#E84848'

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center p-6"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onDismiss}
    >
      <motion.div
        className="relative w-full max-w-xs overflow-hidden"
        style={{
          background: 'rgba(12,10,8,0.97)',
          borderRadius: 16,
          border: `1px solid ${accent}50`,
          boxShadow: `0 24px 80px rgba(0,0,0,0.8), 0 0 60px ${accent}18`,
        }}
        initial={{ scale: 0.88, opacity: 0, y: 16 }}
        animate={{ scale: 1,    opacity: 1, y: 0  }}
        exit={{    scale: 0.88, opacity: 0, y: 16 }}
        transition={{ type: 'spring', damping: 24, stiffness: 280 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Accent bar */}
        <div style={{ height: 3, background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />

        <div className="px-6 pt-5 pb-6 text-center">
          {/* Icon */}
          <motion.div
            className="text-5xl mb-3"
            animate={intercepted
              ? { scale: [1, 1.12, 1] }
              : { rotate: [-4, 4, -4, 4, 0] }
            }
            transition={{ duration: intercepted ? 1.8 : 0.5, repeat: intercepted ? Infinity : 0, ease: 'easeInOut' }}
          >
            {intercepted ? '🛡' : '⚔️'}
          </motion.div>

          {/* Title */}
          <h2 style={{ fontFamily: FONT_HEAD, color: accent, fontSize: '1.3rem', marginBottom: 10 }}>
            {intercepted ? 'Crisis Intercepted!' : 'Raiders Struck!'}
          </h2>

          {/* Body */}
          {intercepted ? (
            <p style={{ fontFamily: FONT_BODY, color: 'rgba(255,255,255,0.72)', fontSize: '0.86rem', lineHeight: 1.65, marginBottom: 16 }}>
              <span style={{ color: accent, fontWeight: 700 }}>{crisisEvent.guardName}</span> stood firm at
              Haven's edge and drove back the raiders. Not a single coin was lost.
            </p>
          ) : (
            <p style={{ fontFamily: FONT_BODY, color: 'rgba(255,255,255,0.72)', fontSize: '0.86rem', lineHeight: 1.65, marginBottom: 16 }}>
              Raiders breached Haven's walls under cover of darkness. Assign a
              <span style={{ color: '#6A9AE8', fontWeight: 700 }}> Guard</span> to defend against future attacks.
            </p>
          )}

          {/* Stat chip */}
          <div
            className="rounded-lg px-4 py-2 mb-5"
            style={{
              background: `${accent}12`,
              border: `1px solid ${accent}30`,
            }}
          >
            {intercepted ? (
              <p style={{ fontFamily: FONT_BODY, color: accent, fontSize: '0.8rem', fontWeight: 700 }}>
                ✦ 0 gold lost · Haven protected
              </p>
            ) : (
              <p style={{ fontFamily: FONT_BODY, color: '#E86060', fontSize: '0.8rem', fontWeight: 700 }}>
                ⚠ {crisisEvent.goldLost} gold lost · Haven damaged
              </p>
            )}
          </div>

          {/* Acknowledge button */}
          <motion.button
            onClick={onDismiss}
            className="w-full py-2.5 rounded-xl font-bold"
            style={{
              fontFamily: FONT_HEAD,
              fontSize: '1rem',
              letterSpacing: '0.04em',
              background: `${accent}20`,
              color: accent,
              border: `1px solid ${accent}40`,
              cursor: 'pointer',
            }}
            whileHover={{ scale: 1.02, background: `${accent}30` }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 340, damping: 22 }}
          >
            Acknowledged
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
