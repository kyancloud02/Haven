import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion'
import { VISITOR_SPRITES } from './VisitorSprites'

const FONT_BODY = "'Nunito', sans-serif"

export default function VisitorSprite({ visitor, onOpenModal }) {
  const [dragging, setDragging]     = useState(false)
  const isDragging = useRef(false)
  const SpriteCmp  = VISITOR_SPRITES[visitor.spriteKey]
  const { accent } = visitor

  const dragX = useMotionValue(0)
  const dragY = useMotionValue(0)

  useEffect(() => () => undefined, [])

  const handleClick = useCallback(() => {
    if (isDragging.current) return
    onOpenModal()
  }, [onOpenModal])

  return (
    <motion.div
      drag
      dragMomentum={false}
      style={{
        position: 'absolute',
        // Visitors start center-left, clearly separate from regular characters
        left: 'calc(50% - 32px)',
        bottom: '9%',
        cursor: dragging ? 'grabbing' : 'pointer',
        zIndex: dragging ? 100 : 2,
        userSelect: 'none',
        touchAction: 'none',
        pointerEvents: 'auto',
        x: dragX,
        y: dragY,
      }}
      onDragStart={() => { isDragging.current = true; setDragging(true) }}
      onDragEnd={() => {
        setTimeout(() => { isDragging.current = false }, 80)
        setDragging(false)
        animate(dragY, 0, { type: 'spring', stiffness: 380, damping: 28 })
      }}
      onClick={handleClick}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1,   y: 0  }}
      exit={{    opacity: 0, scale: 0.8, y: 20  }}
      transition={{ type: 'spring', damping: 22, stiffness: 280 }}
    >
      <div className="relative flex flex-col items-center select-none">

        {/* Pulsing attention ring */}
        <motion.div
          style={{
            position: 'absolute',
            inset: -10,
            borderRadius: '50%',
            border: `2px solid ${accent}`,
            pointerEvents: 'none',
          }}
          animate={{ opacity: [0.3, 0.9, 0.3], scale: [1, 1.1, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* "Visitor" label above */}
        <motion.div
          className="absolute"
          style={{ bottom: 'calc(100% + 10px)', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span
            className="inline-block rounded-full px-2 py-0.5 text-[9px] font-black tracking-widest uppercase"
            style={{
              background: `${accent}22`,
              color: accent,
              border: `1px solid ${accent}55`,
              fontFamily: FONT_BODY,
            }}
          >
            Visitor
          </span>
        </motion.div>

        {/* Idle float */}
        <motion.div
          style={{ filter: `drop-shadow(0 0 10px ${accent}60)` }}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          {SpriteCmp ? <SpriteCmp /> : (
            <svg viewBox="0 0 64 96" width="64" height="96">
              <ellipse cx="32" cy="92" rx="18" ry="3.5" fill="rgba(0,0,0,0.22)" />
              <circle cx="32" cy="55" r="28" fill="#888" />
              <circle cx="32" cy="33" r="18" fill="#AAA" />
            </svg>
          )}
        </motion.div>

        {/* Name tag */}
        <p
          className="mt-1.5 text-xs font-bold text-center leading-tight"
          style={{
            fontFamily: FONT_BODY,
            color: accent,
            textShadow: '0 1px 4px rgba(0,0,0,0.9)',
            maxWidth: 80,
          }}
        >
          {visitor.name.split(' ').slice(-1)[0]}
        </p>
      </div>
    </motion.div>
  )
}
