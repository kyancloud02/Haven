import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { VISITOR_SPRITES } from './VisitorSprites'

const FONT_HEAD = "'Fredoka One', sans-serif"
const FONT_BODY = "'Nunito', sans-serif"
const GOLD_COLOR = '#F0C840'

export default function VisitorModal({ visitor, gameState, updateState, onClose, onDismiss }) {
  const [response, setResponse] = useState(null)
  const SpriteCmp = VISITOR_SPRITES[visitor.spriteKey]
  const { accent } = visitor

  function handleChoice(choice) {
    const patch = {}

    // Deduct gold cost
    if (choice.cost > 0) {
      if (gameState.gold < choice.cost) return
      patch.gold = gameState.gold - choice.cost
    }

    // Apply treaty
    if (choice.treatyId && (choice.outcome === 'treaty' || choice.outcome === 'gold_spend_treaty')) {
      const existing = gameState.activeTreaties ?? []
      if (!existing.find(t => t.id === choice.treatyId)) {
        patch.activeTreaties = [
          ...existing,
          {
            id:        choice.treatyId,
            name:      choice.treatyName,
            kingdom:   choice.treatyKingdom,
            goldBonus: choice.goldBonus,
            signedAt:  Date.now(),
          },
        ]
      }
    }

    if (Object.keys(patch).length > 0) updateState(patch)
    setResponse(choice.response)
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={response ? onDismiss : onClose}
    >
      <motion.div
        className="relative w-full max-w-sm overflow-hidden"
        style={{
          background: 'rgba(12,10,8,0.97)',
          borderRadius: 16,
          border: `1px solid ${accent}40`,
          boxShadow: `0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04), 0 0 60px ${accent}18`,
        }}
        initial={{ scale: 0.93, opacity: 0, y: 12 }}
        animate={{ scale: 1,    opacity: 1, y: 0  }}
        exit={{    scale: 0.93, opacity: 0, y: 12 }}
        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Accent top bar */}
        <div style={{ height: 3, background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />

        <div className="px-6 pt-5 pb-6">
          {/* Header: sprite + name + close */}
          <div className="flex items-end justify-between mb-4">
            <div className="flex items-end gap-4">
              {SpriteCmp && (
                <div style={{ flexShrink: 0, filter: `drop-shadow(0 0 8px ${accent}55)` }}>
                  <SpriteCmp size={56} />
                </div>
              )}
              <div>
                <p style={{
                  fontFamily: FONT_HEAD,
                  color: accent,
                  fontSize: '1.1rem',
                  letterSpacing: '0.02em',
                  lineHeight: 1.1,
                }}>
                  {visitor.name}
                </p>
                <p style={{
                  fontFamily: FONT_BODY,
                  color: 'rgba(255,255,255,0.35)',
                  fontSize: '0.65rem',
                  letterSpacing: '0.10em',
                  textTransform: 'uppercase',
                  marginTop: 3,
                }}>
                  {visitor.title}
                </p>
              </div>
            </div>

            <button
              onClick={response ? onDismiss : onClose}
              style={{
                color: 'rgba(255,255,255,0.28)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                padding: '4px 6px',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.28)'}
            >
              ✕
            </button>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: `${accent}28`, marginBottom: 18 }} />

          <AnimatePresence mode="wait">
            {!response ? (
              /* ── Greeting + choices ── */
              <motion.div
                key="greeting"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                <p style={{
                  fontFamily: FONT_BODY,
                  color: 'rgba(255,255,255,0.82)',
                  fontSize: '0.88rem',
                  lineHeight: 1.7,
                  marginBottom: 22,
                }}>
                  "{visitor.greeting}"
                </p>

                <div className="flex flex-col gap-2">
                  {visitor.choices.map(choice => {
                    const canAfford = choice.cost === 0 || gameState.gold >= choice.cost
                    const isPrimary = choice.cost > 0 || choice.outcome === 'treaty' || choice.outcome === 'gold_spend_treaty'
                    return (
                      <motion.button
                        key={choice.id}
                        onClick={() => canAfford && handleChoice(choice)}
                        disabled={!canAfford}
                        className="w-full text-left px-4 py-3 rounded-xl"
                        style={{
                          fontFamily: FONT_BODY,
                          fontSize: '0.84rem',
                          fontWeight: 700,
                          background: isPrimary && canAfford
                            ? `${accent}18`
                            : 'rgba(255,255,255,0.05)',
                          border: isPrimary && canAfford
                            ? `1px solid ${accent}40`
                            : '1px solid rgba(255,255,255,0.07)',
                          color: !canAfford
                            ? 'rgba(255,255,255,0.22)'
                            : isPrimary
                            ? accent
                            : 'rgba(255,255,255,0.62)',
                          cursor: canAfford ? 'pointer' : 'not-allowed',
                        }}
                        whileHover={canAfford ? { scale: 1.02 } : {}}
                        whileTap={canAfford ? { scale: 0.98 } : {}}
                        transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                      >
                        <div className="flex items-center justify-between">
                          <span>{choice.label}</span>
                          {choice.cost > 0 && (
                            <span style={{
                              fontFamily: FONT_BODY,
                              fontSize: '0.78rem',
                              color: canAfford ? GOLD_COLOR : 'rgba(255,255,255,0.2)',
                            }}>
                              {choice.cost}g
                            </span>
                          )}
                          {choice.treatyId && choice.cost === 0 && (
                            <span style={{
                              fontSize: '0.68rem',
                              color: `${accent}99`,
                              letterSpacing: '0.06em',
                            }}>
                              +{Math.round((choice.goldBonus ?? 0) * 100)}% gold
                            </span>
                          )}
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            ) : (
              /* ── Response + farewell ── */
              <motion.div
                key="response"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                <p style={{
                  fontFamily: FONT_BODY,
                  color: 'rgba(255,255,255,0.82)',
                  fontSize: '0.88rem',
                  lineHeight: 1.7,
                  marginBottom: 24,
                  fontStyle: 'italic',
                }}>
                  "{response}"
                </p>

                <motion.button
                  onClick={onDismiss}
                  className="w-full py-2.5 rounded-xl font-bold tracking-wide"
                  style={{
                    fontFamily: FONT_HEAD,
                    fontSize: '1rem',
                    letterSpacing: '0.04em',
                    background: `${accent}22`,
                    color: accent,
                    border: `1px solid ${accent}40`,
                    cursor: 'pointer',
                  }}
                  whileHover={{ scale: 1.02, background: `${accent}30` }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 340, damping: 22 }}
                >
                  Farewell
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}
