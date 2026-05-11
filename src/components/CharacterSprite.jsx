import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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

// ─── Chibi sprite SVGs (Islets-style) ─────────────────────────────────────────

function ElfPrincessSprite() {
  return (
    <svg viewBox="0 0 64 96" width="64" height="96" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="orb-glow" x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur stdDeviation="3" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* shadow */}
      <ellipse cx="32" cy="92" rx="18" ry="3.5" fill="rgba(0,0,0,0.22)"/>
      {/* robe */}
      <path d="M20,57 C15,62 14,76 14,87 L50,87 C50,76 49,62 44,57 C40,53 24,53 20,57Z" fill="#C02860"/>
      <path d="M20,57 C16,62 15,76 15,87 L19,87 C19,76 19,62 22,57Z" fill="#E04880" opacity="0.35"/>
      {/* neck */}
      <rect x="27" y="50" width="10" height="9" rx="4" fill="#B8AACC"/>
      {/* head */}
      <circle cx="32" cy="35" r="18" fill="#B8AACC"/>
      {/* left pointed ear */}
      <path d="M14,33 C10,26 11,17 15,14 C16,22 16,30 17,34Z" fill="#B8AACC"/>
      <path d="M14,32 C11,26 12,20 15,15Z" fill="#D0B8E8" opacity="0.5"/>
      {/* right pointed ear */}
      <path d="M50,33 C54,26 53,17 49,14 C48,22 48,30 47,34Z" fill="#B8AACC"/>
      <path d="M50,32 C53,26 52,20 49,15Z" fill="#D0B8E8" opacity="0.5"/>
      {/* tiara */}
      <path d="M18,22 L22,16 L27,21 L32,13 L37,21 L42,16 L46,22"
        stroke="#F0C838" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="32" cy="13" r="3" fill="#E83038"/>
      <circle cx="22" cy="16" r="1.5" fill="#3898E8"/>
      <circle cx="42" cy="16" r="1.5" fill="#38C038"/>
      {/* eyes */}
      <circle cx="25" cy="35" r="5" fill="#18182A"/>
      <circle cx="39" cy="35" r="5" fill="#18182A"/>
      <circle cx="25" cy="35" r="2.5" fill="#5840A0"/>
      <circle cx="39" cy="35" r="2.5" fill="#5840A0"/>
      <circle cx="26.5" cy="33.5" r="1.8" fill="white"/>
      <circle cx="40.5" cy="33.5" r="1.8" fill="white"/>
      {/* blush */}
      <circle cx="19" cy="41" r="5" fill="#FF8080" opacity="0.26"/>
      <circle cx="45" cy="41" r="5" fill="#FF8080" opacity="0.26"/>
      {/* nose */}
      <circle cx="32" cy="43" r="1.5" fill="#9888BC" opacity="0.55"/>
      {/* mouth */}
      <path d="M27,48 C30,51 34,51 37,48" stroke="#9888BC" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.65"/>
      {/* left arm + orb */}
      <path d="M19,64 C13,66 8,65 5,63" stroke="#B8AACC" strokeWidth="6" strokeLinecap="round"/>
      <circle cx="4" cy="62" r="8" fill="#60B0FF" opacity="0.18" filter="url(#orb-glow)"/>
      <circle cx="4" cy="62" r="5.5" fill="#70C0FF" opacity="0.92"/>
      <circle cx="2" cy="60" r="2" fill="white" opacity="0.7"/>
      {/* right arm */}
      <path d="M45,64 C51,67 55,71 55,75" stroke="#C02860" strokeWidth="6" strokeLinecap="round"/>
      {/* shoes */}
      <ellipse cx="24" cy="88" rx="7" ry="4" fill="#6030A0"/>
      <ellipse cx="40" cy="88" rx="7" ry="4" fill="#6030A0"/>
    </svg>
  )
}

function WarriorMulanSprite() {
  return (
    <svg viewBox="0 0 64 96" width="64" height="96" xmlns="http://www.w3.org/2000/svg">
      {/* shadow */}
      <ellipse cx="32" cy="92" rx="18" ry="3.5" fill="rgba(0,0,0,0.22)"/>
      {/* lower skirt */}
      <path d="M20,64 C16,68 15,77 15,87 L49,87 C49,77 48,68 44,64 C40,60 24,60 20,64Z" fill="#901818"/>
      {/* armor body */}
      <path d="M21,55 L20,67 L44,67 L43,55 C39,51 25,51 21,55Z" fill="#C02020"/>
      {/* armor details */}
      <line x1="32" y1="53" x2="32" y2="67" stroke="#F0C840" strokeWidth="1.5" opacity="0.8"/>
      <path d="M21,60 L43,60" stroke="#F0C840" strokeWidth="1" opacity="0.6"/>
      <path d="M21,55 C25,52 39,52 43,55" stroke="#F0C840" strokeWidth="1.5" fill="none" opacity="0.8"/>
      {/* neck */}
      <rect x="27" y="48" width="10" height="9" rx="4" fill="#D4946A"/>
      {/* head */}
      <circle cx="32" cy="33" r="17" fill="#D4946A"/>
      {/* black hair - top bun */}
      <ellipse cx="32" cy="17" r="11" fill="#18100A"/>
      <ellipse cx="32" cy="17" r="7" fill="#241810"/>
      {/* hair sides */}
      <path d="M16,28 C14,21 17,14 24,14Z" fill="#18100A"/>
      <path d="M48,28 C50,21 47,14 40,14Z" fill="#18100A"/>
      {/* hairpin */}
      <line x1="24" y1="14" x2="40" y2="14" stroke="#F0C840" strokeWidth="1.5" opacity="0.9"/>
      <circle cx="40" cy="14" r="2.5" fill="#F0C840"/>
      {/* eyes */}
      <circle cx="25" cy="34" r="4.5" fill="#18100A"/>
      <circle cx="39" cy="34" r="4.5" fill="#18100A"/>
      <circle cx="26.5" cy="32.5" r="1.6" fill="white"/>
      <circle cx="40.5" cy="32.5" r="1.6" fill="white"/>
      {/* eyebrows */}
      <path d="M21,29 C23,27 27,27 29,29" stroke="#18100A" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M35,29 C37,27 41,27 43,29" stroke="#18100A" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* blush */}
      <circle cx="19" cy="39" r="4.5" fill="#FF9070" opacity="0.25"/>
      <circle cx="45" cy="39" r="4.5" fill="#FF9070" opacity="0.25"/>
      {/* mouth */}
      <path d="M28,43 C30,45 34,45 36,43" stroke="#B07050" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.7"/>
      {/* gold belt */}
      <rect x="20" y="63" width="24" height="5" rx="2" fill="#F0C840" opacity="0.9"/>
      {/* left arm */}
      <path d="M19,60 C13,63 10,68 10,73" stroke="#D4946A" strokeWidth="6" strokeLinecap="round"/>
      {/* right arm + sword */}
      <path d="M45,60 C51,63 54,67 53,72" stroke="#D4946A" strokeWidth="6" strokeLinecap="round"/>
      {/* sword blade */}
      <line x1="54" y1="58" x2="62" y2="80" stroke="#C0D0E0" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="52" y1="64" x2="58" y2="64" stroke="#C0A030" strokeWidth="2.5" strokeLinecap="round"/>
      <ellipse cx="53" cy="58" rx="2.5" ry="2.5" fill="#C0A030"/>
      {/* boots */}
      <ellipse cx="24" cy="88" rx="7" ry="4" fill="#601818"/>
      <ellipse cx="40" cy="88" rx="7" ry="4" fill="#601818"/>
    </svg>
  )
}

function SunWukongSprite() {
  return (
    <svg viewBox="0 0 64 96" width="64" height="96" xmlns="http://www.w3.org/2000/svg">
      {/* shadow */}
      <ellipse cx="32" cy="92" rx="18" ry="3.5" fill="rgba(0,0,0,0.22)"/>
      {/* body / red outfit */}
      <path d="M20,56 C16,60 15,76 15,87 L49,87 C49,76 48,60 44,56 C40,52 24,52 20,56Z" fill="#C02020"/>
      <path d="M20,56 C17,60 16,76 16,87 L20,87 C20,76 20,60 22,56Z" fill="#E04040" opacity="0.32"/>
      {/* monkey ears */}
      <circle cx="14" cy="32" r="7" fill="#D08048"/>
      <circle cx="14" cy="32" r="4.5" fill="#C06840"/>
      <circle cx="50" cy="32" r="7" fill="#D08048"/>
      <circle cx="50" cy="32" r="4.5" fill="#C06840"/>
      {/* neck */}
      <rect x="27" y="50" width="10" height="8" rx="4" fill="#D08048"/>
      {/* head */}
      <circle cx="32" cy="34" r="18" fill="#D08048"/>
      {/* muzzle */}
      <ellipse cx="32" cy="44" rx="9" ry="7" fill="#C07040"/>
      {/* gold headband */}
      <rect x="13" y="24" width="38" height="6" rx="3" fill="#F0C830"/>
      <rect x="28" y="23" width="8" height="8" rx="2" fill="#E84040"/>
      <path d="M28,23 L36,23 L36,31 L28,31Z" fill="none" stroke="#F0C830" strokeWidth="1"/>
      {/* eyes */}
      <circle cx="25" cy="33" r="5" fill="#18100A"/>
      <circle cx="39" cy="33" r="5" fill="#18100A"/>
      <circle cx="25" cy="33" r="2.5" fill="#804020"/>
      <circle cx="39" cy="33" r="2.5" fill="#804020"/>
      <circle cx="26.5" cy="31.5" r="1.8" fill="white"/>
      <circle cx="40.5" cy="31.5" r="1.8" fill="white"/>
      {/* nostrils on muzzle */}
      <circle cx="29" cy="44" r="2" fill="#A05028" opacity="0.7"/>
      <circle cx="35" cy="44" r="2" fill="#A05028" opacity="0.7"/>
      {/* wide grin */}
      <path d="M24,50 C27,54 37,54 40,50" stroke="#80300A" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.8"/>
      {/* left arm */}
      <path d="M19,63 C13,66 10,70 10,75" stroke="#D08048" strokeWidth="7" strokeLinecap="round"/>
      {/* right arm + staff */}
      <path d="M45,63 C51,66 54,69 54,73" stroke="#D08048" strokeWidth="7" strokeLinecap="round"/>
      {/* staff */}
      <rect x="53" y="40" width="5" height="38" rx="2.5" fill="#8A5020"/>
      <rect x="51" y="38" width="9" height="6" rx="2" fill="#C0A030"/>
      <rect x="51" y="73" width="9" height="6" rx="2" fill="#C0A030"/>
      {/* tail */}
      <path d="M44,83 C55,85 60,78 58,69 C56,61 50,60 48,66"
        fill="none" stroke="#D08048" strokeWidth="5" strokeLinecap="round"/>
      {/* boots */}
      <ellipse cx="24" cy="88" rx="7" ry="4" fill="#801818"/>
      <ellipse cx="40" cy="88" rx="7" ry="4" fill="#801818"/>
    </svg>
  )
}

function SherlockHolmesSprite() {
  return (
    <svg viewBox="0 0 64 96" width="64" height="96" xmlns="http://www.w3.org/2000/svg">
      {/* shadow */}
      <ellipse cx="32" cy="92" rx="18" ry="3.5" fill="rgba(0,0,0,0.22)"/>
      {/* cape body */}
      <path d="M17,54 C12,58 11,76 11,87 L53,87 C53,76 52,58 47,54 C42,50 22,50 17,54Z" fill="#483818"/>
      {/* cape inner lighter */}
      <path d="M22,56 C20,60 20,76 21,87 L43,87 C44,76 44,60 42,56 C38,52 26,52 22,56Z" fill="#604820"/>
      {/* neck */}
      <rect x="27" y="48" width="10" height="8" rx="4" fill="#7888A8"/>
      {/* bird head */}
      <circle cx="32" cy="33" r="18" fill="#7888A8"/>
      {/* beak */}
      <path d="M32,40 L26,50 L38,50Z" fill="#D4A048"/>
      <path d="M32,40 L26,50 L32,47Z" fill="#B88030" opacity="0.5"/>
      {/* deerstalker hat - main dome */}
      <ellipse cx="32" cy="19" r="15" fill="#704020"/>
      <ellipse cx="32" cy="19" r="11" fill="#805028"/>
      {/* front brim */}
      <path d="M14,22 L50,22 L52,28 L12,28Z" fill="#604018"/>
      {/* back brim */}
      <path d="M14,22 C10,18 11,12 14,10 C16,14 17,19 17,22Z" fill="#604018"/>
      {/* hat dent line */}
      <path d="M18,16 C24,13 40,13 46,16" stroke="#503010" strokeWidth="1.5" fill="none" opacity="0.6"/>
      {/* hat ear flap ties */}
      <path d="M13,27 C11,30 12,34 14,33" stroke="#604018" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M51,27 C53,30 52,34 50,33" stroke="#604018" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* eyes (large bird eyes) */}
      <circle cx="24" cy="32" r="5.5" fill="#18182A"/>
      <circle cx="40" cy="32" r="5.5" fill="#18182A"/>
      <circle cx="24" cy="32" r="2.8" fill="#2040A0"/>
      <circle cx="40" cy="32" r="2.8" fill="#2040A0"/>
      <circle cx="25.5" cy="30.5" r="2" fill="white"/>
      <circle cx="41.5" cy="30.5" r="2" fill="white"/>
      {/* left wing/arm */}
      <path d="M18,62 C12,65 8,68 8,72" stroke="#7888A8" strokeWidth="6" strokeLinecap="round"/>
      {/* right arm + magnifying glass */}
      <path d="M46,62 C52,64 55,61 57,57" stroke="#7888A8" strokeWidth="6" strokeLinecap="round"/>
      <circle cx="58" cy="53" r="9" fill="none" stroke="#C0A040" strokeWidth="2.5"/>
      <line x1="52" y1="60" x2="48" y2="67" stroke="#C0A040" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="58" cy="53" r="6" fill="#80A0C0" opacity="0.22"/>
      {/* talons */}
      <ellipse cx="24" cy="88" rx="7" ry="4" fill="#483818"/>
      <ellipse cx="40" cy="88" rx="7" ry="4" fill="#483818"/>
      <line x1="20" y1="89" x2="18" y2="93" stroke="#483818" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="24" y1="90" x2="24" y2="94" stroke="#483818" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="28" y1="89" x2="30" y2="93" stroke="#483818" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function RobinHoodSprite() {
  return (
    <svg viewBox="0 0 64 96" width="64" height="96" xmlns="http://www.w3.org/2000/svg">
      {/* shadow */}
      <ellipse cx="32" cy="92" rx="18" ry="3.5" fill="rgba(0,0,0,0.22)"/>
      {/* forest cloak body */}
      <path d="M17,54 C12,58 11,76 11,87 L53,87 C53,76 52,58 47,54 C42,50 22,50 17,54Z" fill="#284820"/>
      {/* leather tunic */}
      <path d="M22,57 C19,61 19,76 20,87 L44,87 C45,76 45,61 42,57 C38,53 26,53 22,57Z" fill="#7A5028"/>
      {/* belt */}
      <rect x="20" y="68" width="24" height="5" rx="2" fill="#5A3818"/>
      <rect x="29" y="67" width="6" height="7" rx="1" fill="#C0A030"/>
      {/* neck */}
      <rect x="27" y="49" width="10" height="8" rx="4" fill="#C8906A"/>
      {/* head */}
      <circle cx="32" cy="34" r="17" fill="#C8906A"/>
      {/* green hood */}
      <path d="M13,38 C11,27 15,16 32,14 C49,16 53,27 51,38 C47,33 40,29 32,29 C24,29 17,33 13,38Z" fill="#284820"/>
      <path d="M13,38 C12,30 15,20 32,17 C24,20 14,30 13,38Z" fill="#3A6028" opacity="0.4"/>
      {/* feather in cap */}
      <path d="M38,16 C42,11 44,6 41,3 C38,5 36,9 37,14Z" fill="#C8A030"/>
      <path d="M38,16 C43,12 45,7 42,4Z" fill="#E8C040" opacity="0.5"/>
      {/* eyes */}
      <circle cx="25" cy="35" r="4.5" fill="#18100A"/>
      <circle cx="39" cy="35" r="4.5" fill="#18100A"/>
      <circle cx="25" cy="35" r="2.2" fill="#40280A"/>
      <circle cx="39" cy="35" r="2.2" fill="#40280A"/>
      <circle cx="26.5" cy="33.5" r="1.6" fill="white"/>
      <circle cx="40.5" cy="33.5" r="1.6" fill="white"/>
      {/* smirk */}
      <path d="M28,43 C31,46 36,45 38,43" stroke="#A06840" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.7"/>
      <path d="M37,43 C38,44 38,46 37,46" stroke="#A06840" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.6"/>
      {/* left arm */}
      <path d="M19,63 C13,66 10,71 10,76" stroke="#C8906A" strokeWidth="6" strokeLinecap="round"/>
      {/* right arm */}
      <path d="M45,63 C51,66 54,70 53,75" stroke="#C8906A" strokeWidth="6" strokeLinecap="round"/>
      {/* bow over right shoulder */}
      <path d="M47,44 C57,36 60,52 50,62" fill="none" stroke="#8A5820" strokeWidth="3" strokeLinecap="round"/>
      <line x1="47" y1="44" x2="50" y2="62" stroke="#C8B060" strokeWidth="1" strokeLinecap="round"/>
      {/* boots */}
      <ellipse cx="24" cy="88" rx="7" ry="4" fill="#3A2010"/>
      <ellipse cx="40" cy="88" rx="7" ry="4" fill="#3A2010"/>
    </svg>
  )
}

function WinniePoohSprite() {
  return (
    <svg viewBox="0 0 64 96" width="64" height="96" xmlns="http://www.w3.org/2000/svg">
      {/* shadow */}
      <ellipse cx="32" cy="92" rx="20" ry="4" fill="rgba(0,0,0,0.22)"/>
      {/* chubby body */}
      <ellipse cx="32" cy="72" rx="22" ry="20" fill="#F4C040"/>
      {/* tummy patch */}
      <ellipse cx="32" cy="74" rx="14" ry="13" fill="#E0A828" opacity="0.55"/>
      {/* red shirt (short, belly pokes out) */}
      <path d="M12,59 L11,75 L53,75 L52,59 C47,54 17,54 12,59Z" fill="#C02020"/>
      <path d="M12,59 C17,56 47,56 52,59 L50,59 C45,56 19,56 14,59Z" fill="#E03030" opacity="0.35"/>
      {/* shirt hem */}
      <path d="M11,73 L53,73" stroke="#A01818" strokeWidth="1" opacity="0.5"/>
      {/* bear ears */}
      <circle cx="14" cy="18" r="11" fill="#F4C040"/>
      <circle cx="14" cy="18" r="7"  fill="#E8B030"/>
      <circle cx="50" cy="18" r="11" fill="#F4C040"/>
      <circle cx="50" cy="18" r="7"  fill="#E8B030"/>
      {/* head */}
      <circle cx="32" cy="33" r="20" fill="#F4C040"/>
      {/* eyes */}
      <circle cx="24" cy="31" r="5" fill="#18100A"/>
      <circle cx="40" cy="31" r="5" fill="#18100A"/>
      <circle cx="24" cy="31" r="2.5" fill="#402010"/>
      <circle cx="40" cy="31" r="2.5" fill="#402010"/>
      <circle cx="25.5" cy="29.5" r="1.8" fill="white"/>
      <circle cx="41.5" cy="29.5" r="1.8" fill="white"/>
      {/* round bear nose */}
      <ellipse cx="32" cy="41" rx="6" ry="4.5" fill="#C87828"/>
      <circle cx="30" cy="40" r="1.5" fill="#A05820" opacity="0.5"/>
      <circle cx="34" cy="40" r="1.5" fill="#A05820" opacity="0.5"/>
      {/* happy mouth */}
      <path d="M26,47 C28,51 36,51 38,47" stroke="#80380A" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.8"/>
      <line x1="32" y1="51" x2="32" y2="54" stroke="#80380A" strokeWidth="1.2" opacity="0.6"/>
      {/* chubby left arm */}
      <path d="M12,65 C7,68 6,74 8,80" stroke="#F4C040" strokeWidth="9" strokeLinecap="round"/>
      {/* right arm + honey pot */}
      <path d="M52,65 C57,68 58,74 56,80" stroke="#F4C040" strokeWidth="9" strokeLinecap="round"/>
      <rect x="52" y="75" width="13" height="14" rx="4" fill="#D4A030"/>
      <rect x="52" y="71" width="13" height="6"  rx="3" fill="#B88020"/>
      <path d="M54,75 C54,72 62,72 62,75" fill="#F0C840" opacity="0.7"/>
      {/* stubby feet */}
      <ellipse cx="24" cy="89" rx="9" ry="5" fill="#E8B030"/>
      <ellipse cx="40" cy="89" rx="9" ry="5" fill="#E8B030"/>
    </svg>
  )
}

const SPRITES = {
  elf_princess:    ElfPrincessSprite,
  warrior_mulan:   WarriorMulanSprite,
  sun_wukong:      SunWukongSprite,
  sherlock_holmes: SherlockHolmesSprite,
  robin_hood:      RobinHoodSprite,
  winnie_the_pooh: WinniePoohSprite,
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
