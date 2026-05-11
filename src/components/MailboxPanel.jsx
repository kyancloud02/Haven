import { motion, AnimatePresence } from 'framer-motion'
import { SPRITES, CHARACTER_ACCENT } from './CharacterSprites'

const PANEL_BG  = 'rgba(10,8,5,0.93)'
const BORDER    = '1px solid rgba(255,255,255,0.07)'
const FONT_HEAD = "'Fredoka One', sans-serif"
const FONT_BODY = "'Nunito', sans-serif"

export default function MailboxPanel({ activeReport, onCollect, onClose }) {
  const SpriteCmp = activeReport ? SPRITES[activeReport.characterId] : null
  const accent    = activeReport ? (CHARACTER_ACCENT[activeReport.characterId] ?? '#C8B888') : '#C8B888'

  return (
    <motion.div
      className="fixed right-0 top-0 h-full w-80 z-50 flex flex-col"
      style={{ background: PANEL_BG, backdropFilter: 'blur(16px)', borderLeft: BORDER }}
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 260 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: BORDER }}>
        <h2 style={{ fontFamily: FONT_HEAD, color: 'white', fontSize: '1.2rem', letterSpacing: '0.02em' }}>
          Mailbox
        </h2>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.06)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'white'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <AnimatePresence mode="wait">
          {activeReport ? (
            <motion.div
              key="report"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {/* Reporter card */}
              <div
                className="flex items-end gap-4 mb-5 pb-5"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              >
                {/* Mini sprite */}
                {SpriteCmp && (
                  <div style={{ flexShrink: 0 }}>
                    <SpriteCmp size={52} />
                  </div>
                )}

                <div>
                  <p
                    style={{
                      fontFamily: FONT_HEAD,
                      color: accent,
                      fontSize: '1rem',
                      letterSpacing: '0.02em',
                      lineHeight: 1.2,
                    }}
                  >
                    {activeReport.characterName}
                  </p>
                  <p
                    style={{
                      fontFamily: FONT_BODY,
                      color: 'rgba(255,255,255,0.35)',
                      fontSize: '0.72rem',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      marginTop: 2,
                    }}
                  >
                    Evening Report
                  </p>
                </div>
              </div>

              {/* Message */}
              <p
                style={{
                  fontFamily: FONT_BODY,
                  color: 'rgba(255,255,255,0.88)',
                  fontSize: '0.9rem',
                  lineHeight: 1.65,
                  fontStyle: 'italic',
                  marginBottom: activeReport.itemHint ? 20 : 28,
                }}
              >
                "{activeReport.message}"
              </p>

              {/* Item hint */}
              {activeReport.itemHint && (
                <div
                  className="rounded-xl px-4 py-3 mb-6"
                  style={{
                    background: `${accent}12`,
                    border: `1px solid ${accent}28`,
                  }}
                >
                  <p
                    style={{
                      fontFamily: FONT_BODY,
                      color: 'rgba(255,255,255,0.45)',
                      fontSize: '0.72rem',
                      letterSpacing: '0.10em',
                      textTransform: 'uppercase',
                      marginBottom: 4,
                    }}
                  >
                    💭  Item wish
                  </p>
                  <p
                    style={{
                      fontFamily: FONT_BODY,
                      color: `${accent}CC`,
                      fontSize: '0.84rem',
                      lineHeight: 1.5,
                    }}
                  >
                    {activeReport.itemHint}
                  </p>
                </div>
              )}

              {/* Collect button */}
              <motion.button
                onClick={onCollect}
                className="w-full py-3 rounded-2xl font-bold tracking-wide text-sm"
                style={{
                  fontFamily: FONT_HEAD,
                  background: accent,
                  color: '#0a0804',
                  fontSize: '1rem',
                  letterSpacing: '0.04em',
                  boxShadow: `0 4px 20px ${accent}44`,
                }}
                whileHover={{ scale: 1.03, boxShadow: `0 6px 28px ${accent}66` }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 340, damping: 20 }}
              >
                Collect
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              className="flex flex-col items-center justify-center h-48 gap-3 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <span style={{ fontSize: '2.5rem', opacity: 0.2 }}>✉</span>
              <p style={{ fontFamily: FONT_BODY, color: 'rgba(255,255,255,0.28)', fontSize: '0.9rem', fontWeight: 600 }}>
                No letters yet.
              </p>
              <p style={{ fontFamily: FONT_BODY, color: 'rgba(255,255,255,0.16)', fontSize: '0.76rem' }}>
                Reports arrive each evening at 18:00.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
