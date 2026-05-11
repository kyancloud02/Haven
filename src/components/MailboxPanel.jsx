import { motion, AnimatePresence } from 'framer-motion'
import { SPRITES, CHARACTER_ACCENT } from './CharacterSprites'

const PARCHMENT    = 'linear-gradient(160deg, #F4E8CC 0%, #EDD9A8 60%, #E8D09C 100%)'
const PARCHMENT_DK = '#D4B87A'
const INK          = '#1C0F06'
const INK_FADED    = '#5C3D22'
const INK_GHOST    = '#8B6040'
const FONT_HEAD    = "'Fredoka One', sans-serif"
const FONT_BODY    = "'Nunito', sans-serif"

// ─── Photo slot ───────────────────────────────────────────────────────────────
function PhotoSlot({ photoUrl }) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt="Daily photo"
        className="w-full rounded-sm object-cover"
        style={{ maxHeight: 160, border: `1px solid ${PARCHMENT_DK}` }}
      />
    )
  }

  return (
    <div
      className="w-full flex flex-col items-center justify-center gap-2 rounded-sm"
      style={{
        height: 130,
        background: 'linear-gradient(135deg, #E0C88A, #D4B87A)',
        border: `1px solid ${PARCHMENT_DK}`,
        // Film-border notches
        boxShadow: 'inset 0 0 0 6px rgba(255,255,255,0.18), inset 0 0 0 7px rgba(180,130,60,0.25)',
      }}
    >
      <svg width="28" height="24" viewBox="0 0 28 24" fill="none">
        <rect x="1" y="5" width="26" height="18" rx="2" stroke={INK_GHOST} strokeWidth="1.4"/>
        <circle cx="14" cy="14" r="5.5" stroke={INK_GHOST} strokeWidth="1.4"/>
        <circle cx="14" cy="14" r="2.5" fill={INK_GHOST} opacity="0.4"/>
        <path d="M9 5 L11 1 H17 L19 5" stroke={INK_GHOST} strokeWidth="1.4" strokeLinejoin="round"/>
        <circle cx="23" cy="9" r="1.2" fill={INK_GHOST} opacity="0.5"/>
      </svg>
      <p
        style={{
          fontFamily: FONT_BODY,
          fontSize: '0.68rem',
          color: INK_GHOST,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          fontWeight: 700,
        }}
      >
        No photo enclosed
      </p>
    </div>
  )
}

// ─── Main modal ───────────────────────────────────────────────────────────────
export default function MailboxPanel({ activeReport, onCollect, onClose }) {
  const SpriteCmp = activeReport ? SPRITES[activeReport.characterId] : null
  const accent    = activeReport ? (CHARACTER_ACCENT[activeReport.characterId] ?? '#8B6040') : '#8B6040'

  return (
    // Backdrop
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      {/* Parchment card */}
      <motion.div
        className="relative w-full max-w-sm overflow-hidden"
        style={{
          background: PARCHMENT,
          borderRadius: 3,
          boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 2px 0 rgba(255,255,255,0.35) inset',
          border: `1px solid ${PARCHMENT_DK}`,
        }}
        initial={{ scale: 0.93, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.93, opacity: 0, y: 12 }}
        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Torn-edge top accent */}
        <div style={{ height: 4, background: `linear-gradient(90deg, ${PARCHMENT_DK}88, ${PARCHMENT_DK}, ${PARCHMENT_DK}88)` }} />

        <div className="px-6 pt-5 pb-6">
          <AnimatePresence mode="wait">
            {activeReport ? (
              <motion.div
                key="letter"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Header: sprite + name + close */}
                <div className="flex items-end justify-between mb-4">
                  <div className="flex items-end gap-3">
                    {SpriteCmp && (
                      <div style={{ flexShrink: 0, filter: 'sepia(0.3) brightness(0.92)' }}>
                        <SpriteCmp size={46} />
                      </div>
                    )}
                    <div>
                      <p
                        style={{
                          fontFamily: FONT_HEAD,
                          color: accent,
                          fontSize: '1.15rem',
                          letterSpacing: '0.02em',
                          lineHeight: 1,
                          // Ink color shifted toward parchment palette
                          filter: 'saturate(0.75) brightness(0.7)',
                        }}
                      >
                        {activeReport.characterName}
                      </p>
                      <p
                        style={{
                          fontFamily: FONT_BODY,
                          color: INK_GHOST,
                          fontSize: '0.65rem',
                          letterSpacing: '0.10em',
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          marginTop: 2,
                        }}
                      >
                        Field Letter
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    style={{
                      fontFamily: FONT_BODY,
                      color: INK_GHOST,
                      fontSize: '1rem',
                      lineHeight: 1,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px 6px',
                      borderRadius: 4,
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = INK}
                    onMouseLeave={e => e.currentTarget.style.color = INK_GHOST}
                  >
                    ✕
                  </button>
                </div>

                {/* Divider rule */}
                <div style={{ height: 1, background: `${PARCHMENT_DK}88`, marginBottom: 16 }} />

                {/* Photo slot */}
                <div className="mb-4">
                  <PhotoSlot photoUrl={activeReport.photoUrl} />
                </div>

                {/* Letter body */}
                <p
                  style={{
                    fontFamily: FONT_BODY,
                    color: INK_FADED,
                    fontSize: '0.88rem',
                    lineHeight: 1.7,
                    fontStyle: 'italic',
                    marginBottom: activeReport.itemHint ? 16 : 20,
                  }}
                >
                  {activeReport.message}
                </p>

                {/* Item wish inset */}
                {activeReport.itemHint && (
                  <div
                    className="rounded px-3 py-2.5 mb-5"
                    style={{
                      background: 'rgba(180,130,60,0.12)',
                      border: `1px solid ${PARCHMENT_DK}`,
                      borderLeft: `3px solid ${PARCHMENT_DK}`,
                    }}
                  >
                    <p
                      style={{
                        fontFamily: FONT_BODY,
                        color: INK_GHOST,
                        fontSize: '0.62rem',
                        letterSpacing: '0.10em',
                        textTransform: 'uppercase',
                        fontWeight: 800,
                        marginBottom: 3,
                      }}
                    >
                      💭 They mentioned
                    </p>
                    <p
                      style={{
                        fontFamily: FONT_BODY,
                        color: INK_FADED,
                        fontSize: '0.8rem',
                        lineHeight: 1.45,
                        fontStyle: 'italic',
                      }}
                    >
                      {activeReport.itemHint}
                    </p>
                  </div>
                )}

                {/* Signature */}
                <p
                  style={{
                    fontFamily: FONT_BODY,
                    color: INK_GHOST,
                    fontSize: '0.72rem',
                    textAlign: 'right',
                    marginBottom: 18,
                    fontStyle: 'italic',
                  }}
                >
                  — {activeReport.characterName}
                </p>

                {/* Collect button */}
                <motion.button
                  onClick={onCollect}
                  className="w-full py-2.5 rounded font-bold tracking-wide"
                  style={{
                    fontFamily: FONT_HEAD,
                    fontSize: '1rem',
                    letterSpacing: '0.05em',
                    background: INK,
                    color: '#F4E8CC',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
                  }}
                  whileHover={{ scale: 1.02, background: '#2C1810' }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 340, damping: 22 }}
                >
                  Collect Letter
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                className="flex flex-col items-center justify-center py-12 gap-3 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Close button */}
                <button
                  onClick={onClose}
                  style={{
                    position: 'absolute',
                    top: 16,
                    right: 20,
                    fontFamily: FONT_BODY,
                    color: INK_GHOST,
                    fontSize: '1rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  ✕
                </button>

                <span style={{ fontSize: '2rem', opacity: 0.25 }}>✉</span>
                <p style={{ fontFamily: FONT_HEAD, color: INK_FADED, fontSize: '1rem' }}>
                  No letters yet.
                </p>
                <p style={{ fontFamily: FONT_BODY, color: INK_GHOST, fontSize: '0.76rem', lineHeight: 1.5 }}>
                  Letters arrive each evening at 18:00.<br />
                  Drag the time slider to 18 to test.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom worn edge */}
        <div style={{ height: 3, background: `linear-gradient(90deg, transparent, ${PARCHMENT_DK}66, transparent)` }} />
      </motion.div>
    </motion.div>
  )
}
