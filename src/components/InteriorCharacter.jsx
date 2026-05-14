/**
 * InteriorCharacter — one character inside the house at a SmartNode.
 * Left-click → context menu (coronate / assign guard).
 * conversationBark prop → show speech bubble (improv convo).
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SpriteCanvas from './SpriteCanvas'
import { CHARACTER_ACCENT } from './CharacterSprites'

const BARK_DURATION = 5000

// ─── Character colours for the sleeping SVG ──────────────────────────────────
const CHAR_C = {
  elf_princess:    { skin: '#D8C8F0', outfit: '#E83878' },
  warrior_mulan:   { skin: '#E8B880', outfit: '#D02020' },
  sun_wukong:      { skin: '#E8C030', outfit: '#D06010' },
  sherlock_holmes: { skin: '#A8B8C8', outfit: '#303848' },
  robin_hood:      { skin: '#98B060', outfit: '#3A6018' },
  winnie_the_pooh: { skin: '#F0C828', outfit: '#E82020' },
}

// ─── Sleeping SVG ─────────────────────────────────────────────────────────────
function SleepingSVG({ characterId }) {
  const c = CHAR_C[characterId]
  if (!c) return null
  const isPooh  = characterId === 'winnie_the_pooh'
  const isElf   = characterId === 'elf_princess'
  const isWukong = characterId === 'sun_wukong'
  const isSherlock = characterId === 'sherlock_holmes'
  const isMulan = characterId === 'warrior_mulan'

  return (
    <svg width={120} height={56} viewBox="0 0 120 56" style={{ display: 'block' }}>
      {/* Pillow */}
      <ellipse cx={14} cy={38} rx={16} ry={10} fill="#F0E8D8" opacity={0.85}/>

      {/* Body */}
      <ellipse cx={65} cy={38} rx={38} ry={13} fill={c.outfit}/>

      {/* Arm reaching right toward book */}
      <ellipse cx={95} cy={28} rx={14} ry={7} fill={c.skin} transform="rotate(-20 95 28)"/>

      {/* Book */}
      <rect x={95} y={13} width={20} height={14} rx={2} fill="#C04838"/>
      <rect x={104} y={13} width={10} height={14} rx={1} fill="#A03020"/>
      <line x1={97} y1={16} x2={113} y2={16} stroke="white" strokeWidth="0.7" opacity={0.35}/>
      <line x1={97} y1={19} x2={113} y2={19} stroke="white" strokeWidth="0.7" opacity={0.35}/>
      <line x1={97} y1={22} x2={113} y2={22} stroke="white" strokeWidth="0.7" opacity={0.35}/>

      {/* Head */}
      <circle cx={20} cy={33} r={isPooh ? 14 : 11} fill={c.skin}/>

      {/* Character-specific head features */}
      {isPooh && <>
        {/* Bear ears */}
        <circle cx={10} cy={21} r={6} fill={c.skin}/>
        <circle cx={10} cy={21} r={3.5} fill="#E0A848"/>
        <circle cx={28} cy={20} r={6} fill={c.skin}/>
        <circle cx={28} cy={20} r={3.5} fill="#E0A848"/>
        {/* Snout */}
        <ellipse cx={20} cy={39} rx={7} ry={5} fill="#F8E8A0"/>
      </>}

      {isElf && <>
        {/* Pointed elf ears */}
        <ellipse cx={10} cy={31} rx={4} ry={9} fill={c.skin} transform="rotate(-20 10 31)"/>
        <ellipse cx={30} cy={30} rx={4} ry={9} fill={c.skin} transform="rotate(15 30 30)"/>
      </>}

      {isWukong && <>
        {/* Golden headband */}
        <ellipse cx={20} cy={25} rx={12} ry={4} fill="#FFD040" opacity={0.88}/>
      </>}

      {isSherlock && <>
        {/* Deerstalker hat */}
        <path d="M9,29 C10,22 14,20 20,20 C26,20 30,22 31,29 L32,27 C30,18 10,18 8,27 Z"
          fill={CHAR_C.sherlock_holmes.outfit}/>
      </>}

      {isMulan && <>
        {/* Topknot */}
        <path d="M14,25 C16,19 18,17 20,17 C22,17 24,19 26,25"
          fill="none" stroke="#1A1010" strokeWidth="3" strokeLinecap="round"/>
        <ellipse cx={20} cy={17} rx={4} ry={3} fill="#1A1010"/>
      </>}

      {/* Closed eye (sleeping arc) */}
      <path d={`M${16},${33} Q${20},${30} ${24},${33}`}
        fill="none" stroke="#3A2810" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

// ─── Speech Bubble ─────────────────────────────────────────────────────────────
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
        <filter id="ic-crown-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <path d="M4,18 C4,18 5,20 20,20 C35,20 36,18 36,18 L34,13 L28,16 L20,8 L12,16 L6,13 Z"
        fill="#F5C842" stroke="#C8982A" strokeWidth="1.2" strokeLinejoin="round" filter="url(#ic-crown-glow)"/>
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
        <filter id="ic-shield-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.8" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <path d="M16,2 L30,8 L30,20 C30,30 16,36 16,36 C16,36 2,30 2,20 L2,8 Z"
        fill="#3A70D8" stroke="#2050B8" strokeWidth="1.4" strokeLinejoin="round"
        filter="url(#ic-shield-glow)"/>
      <path d="M16,2 L30,8 L30,20 C30,30 16,36 16,36 L16,2 Z" fill="#1A40A8" opacity={0.35}/>
      <line x1="16" y1="8"  x2="16" y2="30" stroke="white" strokeWidth="1.8" opacity={0.55}/>
      <line x1="9"  y1="19" x2="23" y2="19" stroke="white" strokeWidth="1.8" opacity={0.55}/>
    </motion.svg>
  )
}

// ─── Interior Context Menu ────────────────────────────────────────────────────
function InteriorContextMenu({
  x, y, heroData, isLeader, isGuard, canBeGuard,
  onCoronate, onAssignGuard, onRemoveGuard, onClose,
}) {
  const menuRef = useRef(null)
  const accent  = CHARACTER_ACCENT[heroData.id] ?? '#ffffff'

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

  const roles = heroData.permittedRoles?.join(', ') ?? ''

  return (
    <motion.div
      ref={menuRef}
      className="fixed z-[200] min-w-44 rounded-xl overflow-hidden shadow-2xl"
      style={{ left: x, top: y, pointerEvents: 'auto' }}
      initial={{ opacity: 0, scale: 0.9, y: -4 }}
      animate={{ opacity: 1, scale: 1,   y:  0 }}
      exit={{    opacity: 0, scale: 0.9, y: -4 }}
      transition={{ duration: 0.15 }}
    >
      <div className="bg-stone-800 px-3 py-2 border-b border-stone-700">
        <p className="text-sm font-bold truncate" style={{ color: accent, fontFamily: "'Nunito', sans-serif" }}>
          {heroData.name}
        </p>
        {roles && (
          <p className="text-[10px] text-stone-400 tracking-wide truncate mt-0.5">
            {roles}
          </p>
        )}
      </div>
      <div className="bg-stone-900 py-1">
        <button
          className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors
            ${isLeader
              ? 'text-stone-500 cursor-default opacity-50'
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

// ─── InteriorCharacter (default export) ──────────────────────────────────────
export default function InteriorCharacter({
  heroData,
  gameState,
  updateState,
  screenPos,
  nodeKey,
  slotIdx,
  timeState,
  conversationBark,
  spriteScale = 0.80,
}) {
  const [menu, setMenu] = useState(null)
  const [bark, setBark] = useState(null)
  const barkTimer = useRef(null)

  const isLeader   = gameState.currentLeaderId === heroData.id
  const isGuard    = gameState.guardId         === heroData.id
  const canBeGuard = heroData.permittedRoles?.includes('Guard') ?? false
  const isSleeping = nodeKey === 'LOFT_BED' && slotIdx === 0 && timeState === 'SLEEP'

  // Handle conversationBark prop changes
  useEffect(() => {
    if (conversationBark) {
      clearTimeout(barkTimer.current)
      setBark(conversationBark)
      barkTimer.current = setTimeout(() => setBark(null), BARK_DURATION)
    }
  }, [conversationBark])

  useEffect(() => () => clearTimeout(barkTimer.current), [])

  function getAnimation() {
    if (bark) return 'talk'
    if (nodeKey === 'DINING_TABLE' && timeState === 'HOME') return 'talk'
    return 'idle'
  }

  const handleClick = useCallback((e) => {
    e.stopPropagation()
    if (bark) {
      clearTimeout(barkTimer.current)
      setBark(null)
      return
    }
    setMenu({
      x: Math.min(e.clientX, window.innerWidth  - 190),
      y: Math.min(e.clientY, window.innerHeight - 130),
    })
  }, [bark])

  const coronate    = useCallback(() => updateState({ currentLeaderId: heroData.id }), [heroData.id, updateState])
  const assignGuard = useCallback(() => updateState({ guardId: heroData.id }),         [heroData.id, updateState])
  const removeGuard = useCallback(() => updateState({ guardId: null }),                [updateState])

  const glowFilter = isLeader
    ? 'drop-shadow(0 0 10px rgba(255,200,0,0.8))'
    : isGuard
    ? 'drop-shadow(0 0 12px rgba(58,112,216,0.85))'
    : undefined

  if (!screenPos) return null

  return (
    <>
      {isSleeping ? (
        <motion.div
          style={{
            position:       'fixed',
            left:           screenPos.left,
            top:            screenPos.top,
            transform:      `translate(-50%, -90%) scale(${spriteScale})`,
            transformOrigin:'bottom center',
            zIndex:         menu ? 200 : 5,
            cursor:         'pointer',
            pointerEvents:  'auto',
            filter:         glowFilter,
          }}
          onClick={handleClick}
          whileHover={{ scale: spriteScale * 1.05 }}
        >
          <div className="relative flex flex-col items-center select-none">
            <AnimatePresence>
              {isLeader && <Crown key="crown" />}
              {isGuard && !isLeader && <Shield key="shield" />}
            </AnimatePresence>
            <SleepingSVG characterId={heroData.id} />
          </div>
        </motion.div>
      ) : (
        <motion.div
          style={{
            position:       'fixed',
            left:           screenPos.left,
            top:            screenPos.top,
            transform:      `translate(-50%, -100%) scale(${spriteScale})`,
            transformOrigin:'bottom center',
            zIndex:         menu ? 200 : 5,
            cursor:         'pointer',
            pointerEvents:  'auto',
          }}
          onClick={handleClick}
          whileHover={{ scale: spriteScale * 1.05 }}
        >
          <div className="relative flex flex-col items-center select-none">
            <AnimatePresence>
              {isLeader && <Crown key="crown" />}
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

              <div style={{ filter: glowFilter }}>
                <SpriteCanvas
                  characterId={heroData.id}
                  animation={getAnimation()}
                  scale={1}
                />
              </div>
            </div>

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
      )}

      <AnimatePresence>
        {menu && (
          <InteriorContextMenu
            key="ctx"
            x={menu.x} y={menu.y}
            heroData={heroData}
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
