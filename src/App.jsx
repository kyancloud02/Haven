import { useState, useEffect, useRef, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import WorldStage, { ForegroundLayer } from './components/WorldStage'
import InteriorStage from './components/InteriorStage'
import CharacterSprite from './components/CharacterSprite'
import VisitorSprite from './components/VisitorSprite'
import VisitorModal from './components/VisitorModal'
import AccountPanel from './components/AccountPanel'
import ShopPanel from './components/ShopPanel'
import MailboxPanel from './components/MailboxPanel'
import { useGameState } from './hooks/useGameState'
import { useDailyReport } from './hooks/useDailyReport'
import { useVisitor } from './hooks/useVisitor'
import { useCrisis } from './hooks/useCrisis'
import { useHeritage, toRoman } from './hooks/useHeritage'
import { useBiome } from './hooks/useBiome'
import CrisisModal from './components/CrisisModal'
import HeirModal from './components/HeirModal'
import { getTimeState } from './hooks/useGameTime'
import characters from './data/characters.json'
import PlacementOverlay from './components/PlacementOverlay'
import { WORLD_SLOTS } from './data/slots'

const IS_DEV = import.meta.env.DEV

// ─── HUD icon components ──────────────────────────────────────────────────────
function ShopIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  )
}

function PersonIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )
}

// ─── HUD button with optional notification badge ──────────────────────────────
function HudButton({ onClick, label, badge = false, children }) {
  return (
    <div className="relative">
      <button
        onClick={onClick}
        className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-150 hover:scale-105 active:scale-95"
        style={{
          background: 'rgba(255,255,255,0.92)',
          boxShadow: '0 2px 14px rgba(0,0,0,0.35)',
          color: '#1a1a2e',
        }}
        aria-label={label}
      >
        {children}
      </button>

      <AnimatePresence>
        {badge && (
          <motion.span
            className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full"
            style={{ background: '#FF4040', boxShadow: '0 0 6px rgba(255,60,60,0.7)' }}
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.15, 1] }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.3, scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [gameState, updateState] = useGameState()
  const { currentVisitor, summonVisitor, dismissVisitor } = useVisitor()
  const { crisisEvent, isDamaged, triggerCrisis, dismissCrisis } = useCrisis(gameState, updateState)
  const { ageDays, eraPrestige, totalPrestige, forceUnlock, restartWithHeir } = useHeritage(gameState, updateState)
  const [biome, setBiome] = useBiome()
  const [debugHour, setDebugHour]           = useState(() => new Date().getHours())
  const [shopOpen, setShopOpen]             = useState(false)
  const [mailboxOpen, setMailboxOpen]       = useState(false)
  const [accountOpen, setAccountOpen]       = useState(false)
  const [visitorModalOpen, setVisitorModalOpen] = useState(false)
  const [heirModalOpen, setHeirModalOpen]   = useState(false)
  const [isIndoor, setIsIndoor]             = useState(false)
  const [editMode, setEditMode]             = useState(false)

  // Auto-open the Heir modal exactly once when the milestone is first reached
  const prevHeirUnlocked = useRef(false)
  useEffect(() => {
    if (gameState.heirUnlocked && !prevHeirUnlocked.current) {
      setHeirModalOpen(true)
    }
    prevHeirUnlocked.current = gameState.heirUnlocked
  }, [gameState.heirUnlocked])

  // Blessing is live if its expiry date is today or later
  const today = new Date()
  const todayKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
  const isBlessingLive = gameState.blessing && gameState.blessing.expiresDate >= todayKey

  const { activeReport, collectReport, resetReport } = useDailyReport(
    gameState.currentLeaderId,
    IS_DEV ? debugHour : undefined,
  )

  const effectiveTimeState = getTimeState(IS_DEV ? debugHour : new Date().getHours())

  const itemSlotPositions = Object.entries(gameState.slotItems ?? {}).map(([slotId]) => {
    const slot = WORLD_SLOTS.find(s => s.id === slotId)
    return slot ? { x: slot.xPct * window.innerWidth, slotId } : null
  }).filter(Boolean)

  // Exclusive slot locking — only one character appreciates a slot at a time
  const lockedSlotsRef = useRef({})
  const tryLockSlot = useCallback((slotId, charId) => {
    if (lockedSlotsRef.current[slotId]) return false
    lockedSlotsRef.current[slotId] = charId
    return true
  }, [])
  const releaseSlot = useCallback((slotId) => {
    delete lockedSlotsRef.current[slotId]
  }, [])

  function handlePlaceItem(slotId, itemId) {
    updateState({ slotItems: { ...(gameState.slotItems ?? {}), [slotId]: itemId } })
  }
  function handleRemoveItem(slotId) {
    const next = { ...(gameState.slotItems ?? {}) }
    delete next[slotId]
    updateState({ slotItems: next })
  }

  function closeAll() {
    setShopOpen(false)
    setMailboxOpen(false)
    setAccountOpen(false)
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-stone-950">

      {/* ── Scene: outdoor world or indoor interior ── */}
      <AnimatePresence mode="wait">
        {isIndoor ? (
          <motion.div key="interior" className="absolute inset-0"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}>
            <InteriorStage
              onExit={() => setIsIndoor(false)}
              timeState={effectiveTimeState}
              gameState={gameState}
              updateState={updateState}
              inventory={gameState.inventory ?? []}
            />
          </motion.div>
        ) : (
          <motion.div key="exterior" className="absolute inset-0"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}>
            <WorldStage
              overrideHour={IS_DEV ? debugHour : undefined}
              housingTier={gameState.housingTier}
              isDamaged={isDamaged}
              onEnterHouse={() => setIsIndoor(true)}
              biome={biome}
              buildingPos={gameState.buildingPos ?? { x: 0, y: 0 }}
              onBuildingMove={pos => updateState({ buildingPos: pos })}
            />
            {/* Outdoor characters */}
            <div className="absolute inset-0 pointer-events-none">
              {characters.map((hero, i) => (
                <CharacterSprite
                  key={hero.id}
                  heroData={hero}
                  gameState={gameState}
                  updateState={updateState}
                  spriteIndex={i}
                  timeState={effectiveTimeState}
                  totalCharacters={characters.length}
                  itemSlots={itemSlotPositions}
                  tryLockSlot={tryLockSlot}
                  releaseSlot={releaseSlot}
                />
              ))}
              <AnimatePresence>
                {currentVisitor && (
                  <VisitorSprite
                    key={currentVisitor.id}
                    visitor={currentVisitor}
                    onOpenModal={() => setVisitorModalOpen(true)}
                  />
                )}
              </AnimatePresence>
            </div>
            <ForegroundLayer timeState={effectiveTimeState} biome={biome} />
            <PlacementOverlay
              editMode={editMode}
              slotItems={gameState.slotItems ?? {}}
              inventory={gameState.inventory ?? []}
              onPlace={handlePlaceItem}
              onRemove={handleRemoveItem}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HUD overlay (always on top) ── */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>

        {/* Top-left: village name + citizens */}
        <div className="absolute top-6 left-6 pointer-events-auto">
          <h1
            style={{
              fontFamily: "'Fredoka One', sans-serif",
              fontSize: 'clamp(1.6rem, 4vw, 2.6rem)',
              color: 'white',
              lineHeight: 1,
              textShadow: '0 2px 16px rgba(0,0,0,0.7), 0 0 40px rgba(0,0,0,0.4)',
              letterSpacing: '0.01em',
            }}
          >
            Haven
          </h1>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <p
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontSize: 'clamp(0.7rem, 1.8vw, 0.9rem)',
                color: 'rgba(255,255,255,0.60)',
                letterSpacing: '0.07em',
                textShadow: '0 1px 8px rgba(0,0,0,0.9)',
                fontWeight: 600,
              }}
            >
              {characters.length} citizens
            </p>

            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.7rem' }}>·</span>

            <p
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontSize: 'clamp(0.7rem, 1.8vw, 0.9rem)',
                color: '#F0C840',
                letterSpacing: '0.06em',
                textShadow: '0 1px 8px rgba(0,0,0,0.9)',
                fontWeight: 700,
              }}
            >
              ◈ {gameState.gold}g
            </p>

            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.7rem' }}>·</span>

            <p
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontSize: 'clamp(0.7rem, 1.8vw, 0.9rem)',
                color: 'rgba(255,255,255,0.50)',
                letterSpacing: '0.06em',
                textShadow: '0 1px 8px rgba(0,0,0,0.9)',
                fontWeight: 600,
              }}
            >
              Day {ageDays}
            </p>

            {isBlessingLive && (
              <motion.span
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: '0.65rem',
                  color: '#FFD060',
                  fontWeight: 800,
                  textShadow: '0 0 8px rgba(255,200,0,0.6)',
                  letterSpacing: '0.05em',
                }}
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ✦ Blessed
              </motion.span>
            )}
          </div>
        </div>

        {/* Top-right: icon buttons */}
        <div className="absolute top-5 right-5 flex gap-3 pointer-events-auto">
          {gameState.heirUnlocked && (
            <motion.button
              onClick={() => setHeirModalOpen(true)}
              className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
              style={{
                background: 'rgba(240,200,64,0.18)',
                boxShadow: '0 2px 14px rgba(0,0,0,0.35), 0 0 20px rgba(240,200,64,0.25)',
                border: '1px solid rgba(240,200,64,0.40)',
                color: '#F0C840',
              }}
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              aria-label="Heir Announcement"
            >
              ⚜
            </motion.button>
          )}

          <HudButton
            label="Shop"
            onClick={() => { closeAll(); setShopOpen(true) }}
          >
            <ShopIcon />
          </HudButton>

          <HudButton
            label="Mailbox"
            badge={!!activeReport}
            onClick={() => { closeAll(); setMailboxOpen(true) }}
          >
            <MailIcon />
          </HudButton>

          <HudButton
            label="Account"
            onClick={() => { closeAll(); setAccountOpen(true) }}
          >
            <PersonIcon />
          </HudButton>

          <HudButton
            label={editMode ? 'Done placing' : 'Place items'}
            onClick={() => setEditMode(e => !e)}
          >
            <span style={{ fontSize: '1.1rem' }}>{editMode ? '✓' : '✏️'}</span>
          </HudButton>
        </div>

      </div>

      {/* ── Sliding panels ── */}
      <AnimatePresence>
        {shopOpen && (
          <ShopPanel
            key="shop"
            onClose={() => setShopOpen(false)}
            gameState={gameState}
            updateState={updateState}
            activeReport={activeReport}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mailboxOpen && (
          <MailboxPanel
            key="mailbox"
            activeReport={activeReport}
            onCollect={() => { collectReport(); setMailboxOpen(false) }}
            onClose={() => setMailboxOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {accountOpen && (
          <AccountPanel
            key="account"
            onClose={() => setAccountOpen(false)}
            debugHour={debugHour}
            onDebugHourChange={setDebugHour}
            onResetReport={resetReport}
            onSummonVisitor={summonVisitor}
            onTriggerCrisis={triggerCrisis}
            ageDays={ageDays}
            eraPrestige={eraPrestige}
            totalPrestige={totalPrestige}
            onForceUnlock={forceUnlock}
            biome={biome}
            onBiomeChange={setBiome}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {crisisEvent && (
          <CrisisModal
            key="crisis-modal"
            crisisEvent={crisisEvent}
            onDismiss={dismissCrisis}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {heirModalOpen && (
          <HeirModal
            key="heir-modal"
            gameState={gameState}
            ageDays={ageDays}
            eraPrestige={eraPrestige}
            totalPrestige={totalPrestige}
            onContinue={() => setHeirModalOpen(false)}
            onRestart={() => { restartWithHeir(); setHeirModalOpen(false) }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {visitorModalOpen && currentVisitor && (
          <VisitorModal
            key="visitor-modal"
            visitor={currentVisitor}
            gameState={gameState}
            updateState={updateState}
            onClose={() => setVisitorModalOpen(false)}
            onDismiss={() => { setVisitorModalOpen(false); dismissVisitor() }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
