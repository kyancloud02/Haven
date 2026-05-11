import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SPRITES } from './CharacterSprites'

// ─── Crown ────────────────────────────────────────────────────────────────────
function Crown() {
  return (
    <motion.svg
      viewBox="0 0 40 24"
      className="absolute -top-7 left-1/2 -translate-x-1/2 w-9 h-auto pointer-events-none"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: [0, -2, 0] }}
      exit={{ opacity: 0, y: 4, scale: 0.8 }}
      transition={{
        opacity: { duration: 0.3 },
        y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
      }}
    >
      <defs>
        <filter id="crown-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <path d="M4,18 C4,18 5,20 20,20 C35,20 36,18 36,18 L34,13 L28,16 L20,8 L12,16 L6,13 Z"
        fill="#F5C842" stroke="#C8982A" strokeWidth="1.2" strokeLinejoin="round" filter="url(#crown-glow)" />
      <path d="M6,13 L4,5 L11,11" fill="#F5C842" stroke="#C8982A" strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M14,10 L20,2 L26,10" fill="#F5C842" stroke="#C8982A" strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M34,13 L36,5 L29,11" fill="#F5C842" stroke="#C8982A" strokeWidth="1.1" strokeLinejoin="round" />
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
    function handleEscape(e) { if (e.key === 'Escape') onClose() }
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
      transition={{ duration: 0.15 }}
    >
      <div className="bg-stone-800 px-3 py-2 border-b border-stone-700">
        <p className="text-xs text-stone-400 font-medium tracking-wide truncate">{heroName}</p>
      </div>
      <div className="bg-stone-900 py-1">
        <button
          className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors
            ${isLeader ? 'text-stone-500 cursor-default' : 'text-amber-300 hover:bg-stone-700 cursor-pointer'}`}
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
export default function CharacterSprite({ heroData, gameState, updateState, spriteIndex = 0 }) {
  const [menu, setMenu] = useState(null)
  const isLeader = gameState.currentLeaderId === heroData.id
  const SpriteCmp = SPRITES[heroData.id]

  const handleContextMenu = useCallback((e) => {
    e.preventDefault()
    const vw = window.innerWidth
    const vh = window.innerHeight
    setMenu({
      x: Math.min(e.clientX, vw - 180),
      y: Math.min(e.clientY, vh - 100),
    })
  }, [])

  const coronate = useCallback(() => {
    updateState({ currentLeaderId: heroData.id })
  }, [heroData.id, updateState])

  // Deterministic idle float per character
  const floatDuration = 2.8 + spriteIndex * 0.38
  const floatDelay    = spriteIndex * 0.52

  return (
    <>
      <div className="relative flex flex-col items-center select-none">
        <AnimatePresence>
          {isLeader && <Crown key="crown" />}
        </AnimatePresence>

        <motion.div
          className="cursor-pointer"
          style={isLeader ? { filter: 'drop-shadow(0 0 8px rgba(255,200,0,0.7))' } : {}}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: floatDuration, repeat: Infinity, ease: 'easeInOut', delay: floatDelay }}
          whileHover={{ scale: 1.1, y: -8 }}
          whileTap={{ scale: 0.93 }}
          onContextMenu={handleContextMenu}
        >
          {SpriteCmp ? <SpriteCmp /> : (
            <svg viewBox="0 0 64 96" width="64" height="96">
              <ellipse cx="32" cy="92" rx="18" ry="3.5" fill="rgba(0,0,0,0.22)"/>
              <circle cx="32" cy="55" r="28" fill="#888"/>
              <circle cx="32" cy="33" r="18" fill="#AAA"/>
            </svg>
          )}
        </motion.div>

        {/* Name tag */}
        <p
          className="mt-1.5 text-xs font-bold text-center text-white/90 leading-tight"
          style={{
            fontFamily: "'Nunito', sans-serif",
            textShadow: '0 1px 4px rgba(0,0,0,0.9)',
            maxWidth: 68,
          }}
        >
          {heroData.name.split(' ')[0]}
        </p>

        {/* Leader tag */}
        <AnimatePresence>
          {isLeader && (
            <motion.span
              className="mt-0.5 text-[9px] font-black tracking-widest uppercase text-amber-300"
              style={{ textShadow: '0 0 8px rgba(255,180,0,0.8)', fontFamily: "'Nunito', sans-serif" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              Leader
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {menu && (
          <ContextMenu
            x={menu.x} y={menu.y}
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
