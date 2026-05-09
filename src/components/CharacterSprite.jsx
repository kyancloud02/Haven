import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Hand-drawn gold crown (SVG) ─────────────────────────────────────────────
function Crown() {
  return (
    <motion.svg
      viewBox="0 0 40 24"
      className="absolute -top-7 left-1/2 -translate-x-1/2 w-9 h-auto pointer-events-none"
      initial={{ opacity: 0, y: 4, rotate: -6 }}
      animate={{ opacity: 1, y: [0, -2, 0], rotate: [-2, 2, -2] }}
      exit={{ opacity: 0, y: 4, scale: 0.8 }}
      transition={{
        opacity: { duration: 0.3 },
        y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
        rotate: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="crown-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Crown base band */}
      <path
        d="M4,18 C4,18 5,20 20,20 C35,20 36,18 36,18 L34,13 L28,16 L20,8 L12,16 L6,13 Z"
        fill="#F5C842"
        stroke="#C8982A"
        strokeWidth="1.2"
        strokeLinejoin="round"
        filter="url(#crown-glow)"
      />
      {/* Left point */}
      <path
        d="M6,13 L4,5 L11,11"
        fill="#F5C842"
        stroke="#C8982A"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      {/* Centre point */}
      <path
        d="M20,8 L20,2 L20,8"
        fill="none"
        stroke="#C8982A"
        strokeWidth="1.1"
      />
      <path
        d="M14,10 L20,2 L26,10"
        fill="#F5C842"
        stroke="#C8982A"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      {/* Right point */}
      <path
        d="M34,13 L36,5 L29,11"
        fill="#F5C842"
        stroke="#C8982A"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      {/* Gem dots on band */}
      <circle cx="20" cy="17" r="2"   fill="#E84040" stroke="#C8982A" strokeWidth="0.8" />
      <circle cx="12" cy="17" r="1.3" fill="#4080E8" stroke="#C8982A" strokeWidth="0.7" />
      <circle cx="28" cy="17" r="1.3" fill="#40C840" stroke="#C8982A" strokeWidth="0.7" />
    </motion.svg>
  )
}

// ─── Context menu ─────────────────────────────────────────────────────────────
function ContextMenu({ x, y, heroName, isLeader, onCoronate, onClose }) {
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose()
    }
    function handleEscape(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  return (
    <motion.div
      ref={menuRef}
      className="fixed z-50 min-w-44 rounded-xl overflow-hidden shadow-2xl"
      style={{ left: x, top: y }}
      initial={{ opacity: 0, scale: 0.9, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -4 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
    >
      {/* Header */}
      <div className="bg-stone-800 px-3 py-2 border-b border-stone-700">
        <p className="text-xs text-stone-400 font-medium tracking-wide truncate">{heroName}</p>
      </div>

      {/* Menu items */}
      <div className="bg-stone-900 py-1">
        <button
          className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors
            ${isLeader
              ? 'text-stone-500 cursor-default'
              : 'text-amber-300 hover:bg-stone-700 cursor-pointer'
            }`}
          onClick={() => { if (!isLeader) { onCoronate(); onClose() } }}
          disabled={isLeader}
        >
          <span className="text-base leading-none">👑</span>
          {isLeader ? 'Already the Leader' : 'Coronate as Leader'}
        </button>
      </div>
    </motion.div>
  )
}

// ─── CharacterSprite ──────────────────────────────────────────────────────────
export default function CharacterSprite({ heroData, gameState, updateState }) {
  const [menu, setMenu] = useState(null) // { x, y } | null
  const containerRef = useRef(null)

  const isLeader = gameState.currentLeaderId === heroData.id

  const handleContextMenu = useCallback((e) => {
    e.preventDefault()
    // Keep menu inside the viewport
    const vw = window.innerWidth
    const vh = window.innerHeight
    const menuW = 180
    const menuH = 100
    setMenu({
      x: Math.min(e.clientX, vw - menuW),
      y: Math.min(e.clientY, vh - menuH),
    })
  }, [])

  const coronate = useCallback(() => {
    updateState({ currentLeaderId: heroData.id })
  }, [heroData.id, updateState])

  return (
    <>
      <div
        ref={containerRef}
        className="relative inline-flex flex-col items-center select-none cursor-pointer"
        onContextMenu={handleContextMenu}
      >
        {/* Crown floats above the sprite */}
        <AnimatePresence>
          {isLeader && <Crown key="crown" />}
        </AnimatePresence>

        {/* Sprite placeholder — swap src for real artwork later */}
        <motion.div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-md
            ${isLeader ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-transparent' : ''}`}
          style={{ background: 'rgba(255,255,255,0.10)' }}
          whileHover={{ scale: 1.08, y: -2 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
        >
          {EMOJI[heroData.id] ?? '🧍'}
        </motion.div>

        {/* Name label */}
        <p className="mt-1.5 text-xs text-stone-300 font-medium tracking-wide text-center leading-tight max-w-20">
          {heroData.name}
        </p>

        {/* Leader badge */}
        <AnimatePresence>
          {isLeader && (
            <motion.span
              className="mt-0.5 text-[10px] text-amber-400 font-semibold tracking-widest uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              Leader
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Context menu rendered at document level via portal-like fixed positioning */}
      <AnimatePresence>
        {menu && (
          <ContextMenu
            x={menu.x}
            y={menu.y}
            heroName={heroData.name}
            isLeader={isLeader}
            onCoronate={coronate}
            onClose={() => setMenu(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}

// Temporary emoji stand-ins until real sprite assets exist
const EMOJI = {
  elf_princess:   '🧝',
  warrior_mulan:  '⚔️',
  sun_wukong:     '🐒',
  sherlock_holmes:'🔍',
  robin_hood:     '🏹',
  winnie_the_pooh:'🐻',
}
