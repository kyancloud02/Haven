import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import shopItems from '../data/shopItems.json'

const BORDER    = '1px solid rgba(255,255,255,0.07)'
const FONT_HEAD = "'Fredoka One', sans-serif"
const FONT_BODY = "'Nunito', sans-serif"
const GOLD_COLOR = '#F0C840'
const BLESS_COLOR = '#FFD060'

function getTomorrowKey() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getTodayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ─── Sub-components ────────────────────────────────────────────────────────────
function CloseButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-7 h-7 rounded-full flex items-center justify-center"
      style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.06)' }}
      onMouseEnter={e => e.currentTarget.style.color = 'white'}
      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
    >
      ✕
    </button>
  )
}

// Pulsing blessing toast that appears after a blessed purchase
function BlessingToast({ characterName, itemName }) {
  return (
    <motion.div
      className="mx-5 mb-3 rounded-xl px-4 py-3"
      style={{
        background: 'linear-gradient(135deg, rgba(240,200,64,0.18), rgba(255,180,0,0.10))',
        border: `1px solid ${BLESS_COLOR}55`,
        boxShadow: `0 0 20px ${BLESS_COLOR}22`,
      }}
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.96 }}
      transition={{ duration: 0.3 }}
    >
      <p style={{ fontFamily: FONT_HEAD, color: BLESS_COLOR, fontSize: '0.85rem', lineHeight: 1.3 }}>
        ✦ Blessed Purchase!
      </p>
      <p style={{ fontFamily: FONT_BODY, color: 'rgba(255,255,255,0.55)', fontSize: '0.72rem', marginTop: 3, lineHeight: 1.4 }}>
        {characterName} asked for exactly this.{' '}
        <span style={{ color: BLESS_COLOR }}>+20% gold bonus</span> is active tomorrow.
      </p>
    </motion.div>
  )
}

// Individual shop item row
function ItemRow({ item, canAfford, isHinted, justBought, onBuy }) {
  const borderColor = isHinted ? `${BLESS_COLOR}60` : 'rgba(255,255,255,0.06)'
  const bgColor     = isHinted ? `${BLESS_COLOR}0A` : 'rgba(255,255,255,0.03)'

  return (
    <motion.div
      className="rounded-xl px-4 py-3 flex flex-col gap-1"
      style={{
        background: bgColor,
        border: `1px solid ${borderColor}`,
        transition: 'background 0.3s, border-color 0.3s',
      }}
      animate={justBought ? { scale: [1, 1.02, 1] } : {}}
      transition={{ duration: 0.35 }}
    >
      <div className="flex items-center justify-between gap-2">
        {/* Icon + name */}
        <div className="flex items-center gap-2 min-w-0">
          <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{item.icon}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                style={{ fontFamily: FONT_HEAD, color: 'white', fontSize: '0.9rem', letterSpacing: '0.01em' }}
              >
                {item.name}
              </span>
              {isHinted && (
                <motion.span
                  style={{
                    fontFamily: FONT_BODY,
                    color: BLESS_COLOR,
                    fontSize: '0.62rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontWeight: 800,
                  }}
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ✦ wished for
                </motion.span>
              )}
            </div>
          </div>
        </div>

        {/* Price + buy */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            style={{
              fontFamily: FONT_BODY,
              color: canAfford ? GOLD_COLOR : 'rgba(255,255,255,0.25)',
              fontSize: '0.85rem',
              fontWeight: 700,
            }}
          >
            {item.price}g
          </span>

          <AnimatePresence mode="wait">
            {justBought ? (
              <motion.span
                key="bought"
                className="w-14 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                style={{ background: 'rgba(80,200,80,0.25)', color: '#80E880', fontFamily: FONT_BODY }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                ✓
              </motion.span>
            ) : (
              <motion.button
                key="buy"
                onClick={() => canAfford && onBuy(item)}
                className="w-14 h-7 rounded-lg text-xs font-bold tracking-wide"
                style={{
                  fontFamily: FONT_BODY,
                  background: canAfford
                    ? isHinted ? `${BLESS_COLOR}30` : 'rgba(255,255,255,0.12)'
                    : 'rgba(255,255,255,0.04)',
                  color: canAfford
                    ? isHinted ? BLESS_COLOR : 'rgba(255,255,255,0.85)'
                    : 'rgba(255,255,255,0.2)',
                  border: canAfford && isHinted ? `1px solid ${BLESS_COLOR}40` : '1px solid transparent',
                  cursor: canAfford ? 'pointer' : 'default',
                }}
                whileHover={canAfford ? { scale: 1.05 } : {}}
                whileTap={canAfford ? { scale: 0.95 } : {}}
                transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                Buy
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Description */}
      <p
        style={{
          fontFamily: FONT_BODY,
          color: 'rgba(255,255,255,0.38)',
          fontSize: '0.73rem',
          lineHeight: 1.4,
          paddingLeft: '2rem',
        }}
      >
        {item.description}
      </p>
    </motion.div>
  )
}

// ─── Main panel ───────────────────────────────────────────────────────────────
export default function ShopPanel({ onClose, gameState, updateState, activeReport }) {
  const [lastBought, setLastBought]   = useState(null) // item.id for flash
  const [blessingFlash, setBlessingFlash] = useState(null) // { itemName, characterName }

  // Which shop item (if any) matches the active report's item wish
  const hintedItem = activeReport?.itemHint
    ? shopItems.find(item =>
        item.matchKeywords.some(kw => activeReport.itemHint.toLowerCase().includes(kw))
      )
    : null

  // Is an existing blessing still valid today or later?
  const isBlessingLive = gameState.blessing &&
    gameState.blessing.expiresDate >= getTodayKey()

  function handleBuy(item) {
    if (gameState.gold < item.price) return

    const isBlessed = hintedItem?.id === item.id

    const patch = { gold: gameState.gold - item.price }
    if (isBlessed) {
      patch.blessing = {
        expiresDate:   getTomorrowKey(),
        multiplier:    1.2,
        itemName:      item.name,
        characterName: activeReport.characterName,
      }
    }

    updateState(patch)

    setLastBought(item.id)
    setTimeout(() => setLastBought(null), 1800)

    if (isBlessed) {
      setBlessingFlash({ itemName: item.name, characterName: activeReport.characterName })
      setTimeout(() => setBlessingFlash(null), 5000)
    }
  }

  return (
    <motion.div
      className="fixed right-0 top-0 h-full w-80 z-50 flex flex-col"
      style={{ background: 'rgba(10,8,5,0.93)', backdropFilter: 'blur(16px)', borderLeft: BORDER }}
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 260 }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: BORDER }}>
        <h2 style={{ fontFamily: FONT_HEAD, color: 'white', fontSize: '1.2rem', letterSpacing: '0.02em' }}>
          Supplies
        </h2>
        <CloseButton onClick={onClose} />
      </div>

      {/* ── Gold bar ── */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: BORDER }}
      >
        <div className="flex items-center gap-2">
          <span style={{ color: GOLD_COLOR, fontSize: '1.1rem' }}>◈</span>
          <span style={{ fontFamily: FONT_HEAD, color: GOLD_COLOR, fontSize: '1.05rem', letterSpacing: '0.03em' }}>
            {gameState.gold}
          </span>
          <span style={{ fontFamily: FONT_BODY, color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem' }}>gold</span>
        </div>

        {isBlessingLive && (
          <motion.div
            className="flex items-center gap-1.5 rounded-full px-3 py-1"
            style={{ background: `${BLESS_COLOR}18`, border: `1px solid ${BLESS_COLOR}40` }}
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            <span style={{ fontSize: '0.7rem' }}>✦</span>
            <span style={{ fontFamily: FONT_BODY, color: BLESS_COLOR, fontSize: '0.7rem', fontWeight: 700 }}>
              Blessing active
            </span>
          </motion.div>
        )}
      </div>

      {/* ── Blessed purchase toast ── */}
      <div className="pt-3">
        <AnimatePresence>
          {blessingFlash && (
            <BlessingToast
              key="toast"
              characterName={blessingFlash.characterName}
              itemName={blessingFlash.itemName}
            />
          )}
        </AnimatePresence>
      </div>

      {/* ── Hint nudge (if report has a matching item) ── */}
      <AnimatePresence>
        {hintedItem && !blessingFlash && (
          <motion.p
            className="px-5 pb-2 text-center"
            style={{ fontFamily: FONT_BODY, color: `${BLESS_COLOR}80`, fontSize: '0.7rem' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            ✦ Your report mentions something on this list.
          </motion.p>
        )}
      </AnimatePresence>

      {/* ── Items list ── */}
      <div className="flex-1 overflow-y-auto px-5 pb-5 flex flex-col gap-2">
        {shopItems.map(item => (
          <ItemRow
            key={item.id}
            item={item}
            canAfford={gameState.gold >= item.price}
            isHinted={hintedItem?.id === item.id}
            justBought={lastBought === item.id}
            onBuy={handleBuy}
          />
        ))}
      </div>

      {/* ── Blessing explainer (when active) ── */}
      {isBlessingLive && (
        <div
          className="px-5 py-3"
          style={{ borderTop: BORDER }}
        >
          <p style={{ fontFamily: FONT_BODY, color: `${BLESS_COLOR}70`, fontSize: '0.68rem', lineHeight: 1.5, textAlign: 'center' }}>
            ✦ {gameState.blessing.characterName}'s wish was granted.
            {' '}Gold earnings are ×1.2 until tomorrow.
          </p>
        </div>
      )}
    </motion.div>
  )
}
