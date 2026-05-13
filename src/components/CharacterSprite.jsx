import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion'
import { CHARACTER_ACCENT } from './CharacterSprites'
import SpriteCanvas from './SpriteCanvas'
import { useBehavior } from '../hooks/useBehavior'
import dialogue from '../data/dialogue.json'

const BARK_DURATION = 5000
const SPRITE_W      = 64

// Compute initial x at call time so useMotionValue is never 0 before first paint
function calcInitX(spriteIndex, totalCharacters) {
  const w      = window.innerWidth
  const spread = totalCharacters > 1 ? (w * 0.84) / (totalCharacters - 1) : 0
  return w * 0.08 + spriteIndex * spread - SPRITE_W / 2
}

// ─── Speech Bubble ────────────────────────────────────────────────────────────
function SpeechBubble({ heroData, text, onDismiss }) {
  const accent    = CHARACTER_ACCENT[heroData.id] ?? '#ffffff'
  const firstName = heroData.name.split(' ')[0]

  return (
    <motion.div
      className="absolute left-1/2 pointer-events-auto"
      style={{ bottom: 'calc(100% + 14px)', transform: 'translateX(-50%)', width: 200, zIndex: 40 }}
      initial={{ opacity: 0, y: 6, scale: 0.92 }}
      animate={{ opacity: 1, y: 0,  scale: 1   }}
      exit={{ opacity: 0, y: 4, scale: 0.92 }}
      transition={{ duration: 0.2 }}
      onClick={e => { e.stopPropagation(); onDismiss() }}
    >
      <div
        className="rounded-2xl px-3 pt-2 pb-2.5 cursor-pointer"
        style={{
          background:     'rgba(12,10,8,0.92)',
          backdropFilter: 'blur(12px)',
          border:         `1px solid ${accent}40`,
          boxShadow:      `0 4px 20px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)`,
        }}
      >
        <span
          className="inline-block rounded-full px-2 py-0.5 mb-1.5 text-[10px] font-black tracking-wide uppercase"
          style={{
            background:  `${accent}22`,
            color:       accent,
            fontFamily:  "'Nunito', sans-serif",
            border:      `1px solid ${accent}40`,
          }}
        >
          {firstName}
        </span>

        <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: '0.75rem',
                    color: 'rgba(255,255,255,0.88)', lineHeight: 1.45, fontStyle: 'italic' }}>
          "{text}"
        </p>

        <div className="mt-2 rounded-full overflow-hidden"
             style={{ height: 2, background: 'rgba(255,255,255,0.08)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: accent, transformOrigin: 'left' }}
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: BARK_DURATION / 1000, ease: 'linear' }}
          />
        </div>
      </div>

      <div style={{
        position: 'absolute', bottom: -7, left: '50%', transform: 'translateX(-50%)',
        width: 0, height: 0,
        borderLeft: '7px solid transparent', borderRight: '7px solid transparent',
        borderTop: '8px solid rgba(12,10,8,0.92)',
      }} />
    </motion.div>
  )
}

// ─── Crown ────────────────────────────────────────────────────────────────────
function Crown() {
  return (
    <motion.svg
      viewBox="0 0 40 24"
      className="absolute -top-7 left-1/2 -translate-x-1/2 w-9 h-auto pointer-events-none"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: [0, -2, 0] }}
      exit={{ opacity: 0, y: 4, scale: 0.8 }}
      transition={{ opacity: { duration: 0.3 }, y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' } }}
    >
      <defs>
        <filter id="crown-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <path d="M4,18 C4,18 5,20 20,20 C35,20 36,18 36,18 L34,13 L28,16 L20,8 L12,16 L6,13 Z"
        fill="#F5C842" stroke="#C8982A" strokeWidth="1.2" strokeLinejoin="round" filter="url(#crown-glow)"/>
      <path d="M6,13 L4,5 L11,11"  fill="#F5C842" stroke="#C8982A" strokeWidth="1.1" strokeLinejoin="round"/>
      <path d="M14,10 L20,2 L26,10" fill="#F5C842" stroke="#C8982A" strokeWidth="1.1" strokeLinejoin="round"/>
      <path d="M34,13 L36,5 L29,11" fill="#F5C842" stroke="#C8982A" strokeWidth="1.1" strokeLinejoin="round"/>
      <circle cx="20" cy="17" r="2"   fill="#E84040" stroke="#C8982A" strokeWidth="0.8"/>
      <circle cx="12" cy="17" r="1.3" fill="#4080E8" stroke="#C8982A" strokeWidth="0.7"/>
      <circle cx="28" cy="17" r="1.3" fill="#40C840" stroke="#C8982A" strokeWidth="0.7"/>
    </motion.svg>
  )
}

// ─── Shield ───────────────────────────────────────────────────────────────────
function Shield() {
  return (
    <motion.svg
      viewBox="0 0 32 38"
      className="absolute pointer-events-none"
      style={{ top: -38, left: '50%', transform: 'translateX(-50%)', width: 26 }}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: [0, -2, 0] }}
      exit={{ opacity: 0, y: 4, scale: 0.8 }}
      transition={{ opacity: { duration: 0.3 }, y: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
    >
      <defs>
        <filter id="shield-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.8" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <path d="M16,2 L30,8 L30,20 C30,30 16,36 16,36 C16,36 2,30 2,20 L2,8 Z"
        fill="#3A70D8" stroke="#2050B8" strokeWidth="1.4" strokeLinejoin="round"
        filter="url(#shield-glow)"/>
      <path d="M16,2 L30,8 L30,20 C30,30 16,36 16,36 L16,2 Z" fill="#1A40A8" opacity={0.35}/>
      <line x1="16" y1="8"  x2="16" y2="30" stroke="white" strokeWidth="1.8" opacity={0.55}/>
      <line x1="9"  y1="19" x2="23" y2="19" stroke="white" strokeWidth="1.8" opacity={0.55}/>
    </motion.svg>
  )
}

// ─── Context menu ─────────────────────────────────────────────────────────────
function ContextMenu({ x, y, heroName, isLeader, isGuard, canBeGuard,
                       onCoronate, onAssignGuard, onRemoveGuard, onClose }) {
  const menuRef = useRef(null)

  useEffect(() => {
    function outside(e) { if (menuRef.current && !menuRef.current.contains(e.target)) onClose() }
    function esc(e)     { if (e.key === 'Escape') onClose() }
    document.addEventListener('mousedown', outside)
    document.addEventListener('keydown',   esc)
    return () => {
      document.removeEventListener('mousedown', outside)
      document.removeEventListener('keydown',   esc)
    }
  }, [onClose])

  return (
    <motion.div
      ref={menuRef}
      className="fixed z-50 min-w-44 rounded-xl overflow-hidden shadow-2xl"
      // pointer-events: auto overrides the parent HUD div's pointer-events: none
      style={{ left: x, top: y, pointerEvents: 'auto' }}
      initial={{ opacity: 0, scale: 0.9, y: -4 }}
      animate={{ opacity: 1, scale: 1,   y:  0 }}
      exit={{    opacity: 0, scale: 0.9, y: -4 }}
      transition={{ duration: 0.15 }}
    >
      <div className="bg-stone-800 px-3 py-2 border-b border-stone-700">
        <p className="text-xs text-stone-400 font-medium tracking-wide truncate">{heroName}</p>
      </div>
      <div className="bg-stone-900 py-1">
        <button
          className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors
            ${isLeader
              ? 'text-stone-500 cursor-default'
              : 'text-amber-300 hover:bg-stone-700 cursor-pointer'}`}
          onClick={() => { if (!isLeader) { onCoronate(); onClose() } }}
          disabled={isLeader}
        >
          <span className="text-base leading-none">👑</span>
          {isLeader ? 'Already the Leader' : 'Coronate as Leader'}
        </button>

        {canBeGuard && (
          <button
            className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors
              ${isGuard
                ? 'text-red-400  hover:bg-stone-700 cursor-pointer'
                : 'text-blue-400 hover:bg-stone-700 cursor-pointer'}`}
            onClick={() => { isGuard ? onRemoveGuard() : onAssignGuard(); onClose() }}
          >
            <span className="text-base leading-none">🛡</span>
            {isGuard ? 'Remove Guard Duty' : 'Assign as Guard'}
          </button>
        )}
      </div>
    </motion.div>
  )
}

// ─── CharacterSprite ──────────────────────────────────────────────────────────
export default function CharacterSprite({
  heroData,
  gameState,
  updateState,
  spriteIndex = 0,
  timeState = 'AWAY',
  totalCharacters = 6,
}) {
  const [menu,    setMenu]    = useState(null)
  const [bark,    setBark]    = useState(null)
  const [dragging, setDragging] = useState(false)
  const [dragVel,  setDragVel]  = useState({ x: 0, y: 0 })

  const barkTimer  = useRef(null)
  const isDragging = useRef(false)

  const isLeader   = gameState.currentLeaderId === heroData.id
  const isGuard    = gameState.guardId         === heroData.id
  const canBeGuard = heroData.permittedRoles?.includes('Guard') ?? false

  // x = full horizontal position (autonomous + drag); y = vertical drag offset only
  const x     = useMotionValue(calcInitX(spriteIndex, totalCharacters))
  const dragY = useMotionValue(0)

  // Walkable path: characters rise toward screen center (appear to walk into scene depth)
  const screenW    = window.innerWidth
  const screenH    = window.innerHeight
  const PATH_ARC   = 52   // px higher at center vs screen edges
  const baseTopPx  = screenH * 0.91 - 96  // 96 ≈ rendered sprite height
  const pathTopPx  = useTransform(
    x,
    [0, screenW * 0.5, screenW],
    [baseTopPx, baseTopPx - PATH_ARC, baseTopPx],
  )

  const { isOffscreen, walkDir, onDragStart: behStart, onDragEnd: behEnd } = useBehavior({
    x, spriteIndex, totalCharacters, isDragging, isGuard,
  })

  useEffect(() => () => clearTimeout(barkTimer.current), [])

  // ── Animation key ────────────────────────────────────────────────────────────
  function getAnimation() {
    if (bark) return 'talk'
    if (dragging) {
      const speed = Math.sqrt(dragVel.x ** 2 + dragVel.y ** 2)
      if (speed > 30) {
        if (Math.abs(dragVel.x) > Math.abs(dragVel.y))
          return dragVel.x > 0 ? 'walk_right' : 'walk_left'
        return dragVel.y > 0 ? 'walk_down' : 'walk_up'
      }
    }
    if (isGuard) return 'walk_left'
    if (walkDir) return walkDir === 'right' ? 'walk_right' : 'walk_left'
    return 'idle'
  }

  // ── Interactions ─────────────────────────────────────────────────────────────
  const handleClick = useCallback(() => {
    if (isDragging.current) return
    if (bark) { clearTimeout(barkTimer.current); setBark(null); return }

    const pool = dialogue[heroData.id]?.[timeState]
    if (!pool?.length) return
    const text = pool[Math.floor(Math.random() * pool.length)]
    setBark(text)
    barkTimer.current = setTimeout(() => setBark(null), BARK_DURATION)
  }, [bark, heroData.id, timeState])

  const handleContextMenu = useCallback((e) => {
    e.preventDefault()
    setMenu({
      x: Math.min(e.clientX, window.innerWidth  - 180),
      y: Math.min(e.clientY, window.innerHeight - 100),
    })
  }, [])

  const coronate    = useCallback(() => updateState({ currentLeaderId: heroData.id }), [heroData.id, updateState])
  const assignGuard = useCallback(() => updateState({ guardId: heroData.id }),         [heroData.id, updateState])
  const removeGuard = useCallback(() => updateState({ guardId: null }),                [updateState])

  return (
    <>
      <motion.div
        drag
        dragMomentum={false}
        whileHover={!dragging ? { scale: 1.04 } : {}}
        style={{
          position:      'absolute',
          left:          0,
          top:           pathTopPx,
          x,
          y:             dragY,
          cursor:        dragging ? 'grabbing' : 'grab',
          zIndex:        dragging ? 100 : 1,
          userSelect:    'none',
          touchAction:   'none',
          pointerEvents: isOffscreen ? 'none' : 'auto',
          opacity:       isOffscreen ? 0 : 1,
        }}
        onDragStart={() => {
          isDragging.current = true
          setDragging(true)
          behStart()
        }}
        onDrag={(_, info) => setDragVel({ x: info.velocity.x, y: info.velocity.y })}
        onDragEnd={() => {
          setTimeout(() => { isDragging.current = false }, 80)
          setDragging(false)
          setDragVel({ x: 0, y: 0 })
          animate(dragY, 0, { type: 'spring', stiffness: 380, damping: 28 })
          behEnd()
        }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        <div className="relative flex flex-col items-center select-none">
          <AnimatePresence>
            {isLeader &&            <Crown  key="crown"  />}
            {isGuard && !isLeader && <Shield key="shield" />}
          </AnimatePresence>

          <div className="relative">
            <AnimatePresence>
              {bark && (
                <SpeechBubble
                  key="bubble"
                  heroData={heroData}
                  text={bark}
                  onDismiss={() => { clearTimeout(barkTimer.current); setBark(null) }}
                />
              )}
            </AnimatePresence>

            <div style={
              isLeader ? { filter: 'drop-shadow(0 0 10px rgba(255,200,0,0.8))'    } :
              isGuard  ? { filter: 'drop-shadow(0 0 12px rgba(58,112,216,0.85))' } :
              {}
            }>
              <SpriteCanvas
                characterId={heroData.id}
                animation={getAnimation()}
                scale={1}
              />
            </div>
          </div>

          <AnimatePresence>
            {bark && (
              <motion.p
                key="name-label"
                className="mt-1.5 text-xs font-bold text-center text-white/90 leading-tight"
                style={{ fontFamily: "'Nunito', sans-serif",
                         textShadow: '0 1px 4px rgba(0,0,0,0.9)', maxWidth: 68 }}
                initial={{ opacity: 0, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 2 }}
                transition={{ duration: 0.15 }}
              >
                {heroData.name.split(' ')[0]}
              </motion.p>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isLeader && (
              <motion.span key="leader-tag"
                className="mt-0.5 text-[9px] font-black tracking-widest uppercase text-amber-300"
                style={{ textShadow: '0 0 8px rgba(255,180,0,0.8)', fontFamily: "'Nunito', sans-serif" }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              >
                Leader
              </motion.span>
            )}
            {isGuard && (
              <motion.span key="guard-tag"
                className="mt-0.5 text-[9px] font-black tracking-widest uppercase"
                style={{ color: '#5A8AE8', textShadow: '0 0 8px rgba(58,112,216,0.8)',
                         fontFamily: "'Nunito', sans-serif" }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              >
                Guard
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <AnimatePresence>
        {menu && (
          <ContextMenu
            key="ctx"
            x={menu.x} y={menu.y}
            heroName={heroData.name}
            isLeader={isLeader}
            isGuard={isGuard}
            canBeGuard={canBeGuard}
            onCoronate={coronate}
            onAssignGuard={assignGuard}
            onRemoveGuard={removeGuard}
            onClose={() => setMenu(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
