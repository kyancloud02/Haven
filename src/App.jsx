import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import WorldStage from './components/WorldStage'
import CharacterSprite from './components/CharacterSprite'
import AccountPanel from './components/AccountPanel'
import ShopPanel from './components/ShopPanel'
import { useGameState } from './hooks/useGameState'
import characters from './data/characters.json'

const IS_DEV = import.meta.env.DEV

// ─── Icon components ──────────────────────────────────────────────────────────
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

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [gameState, updateState] = useGameState()
  const [debugHour, setDebugHour] = useState(() => new Date().getHours())
  const [shopOpen, setShopOpen]       = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)

  return (
    <div className="relative w-full h-screen overflow-hidden bg-stone-950">

      {/* ── Full-screen world scene ── */}
      <WorldStage overrideHour={IS_DEV ? debugHour : undefined} />

      {/* ── HUD overlay ── */}
      <div className="absolute inset-0 pointer-events-none">

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
          <p
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: 'clamp(0.7rem, 1.8vw, 0.9rem)',
              color: 'rgba(255,255,255,0.70)',
              marginTop: '2px',
              letterSpacing: '0.08em',
              textShadow: '0 1px 8px rgba(0,0,0,0.9)',
              fontWeight: 600,
            }}
          >
            {characters.length} citizens
          </p>
        </div>

        {/* Top-right: icon buttons */}
        <div className="absolute top-5 right-5 flex gap-3 pointer-events-auto">
          <button
            onClick={() => { setShopOpen(o => !o); setAccountOpen(false) }}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-150 hover:scale-105 active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.92)',
              boxShadow: '0 2px 14px rgba(0,0,0,0.35)',
              color: '#1a1a2e',
            }}
            aria-label="Shop"
          >
            <ShopIcon />
          </button>

          <button
            onClick={() => { setAccountOpen(o => !o); setShopOpen(false) }}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-150 hover:scale-105 active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.92)',
              boxShadow: '0 2px 14px rgba(0,0,0,0.35)',
              color: '#1a1a2e',
            }}
            aria-label="Account"
          >
            <PersonIcon />
          </button>
        </div>

        {/* Characters at ground level — ~10% from bottom matches scene ground */}
        <div
          className="absolute left-0 right-0 flex justify-center items-end gap-4 flex-wrap pointer-events-auto"
          style={{ bottom: '9%', paddingInline: '5%' }}
        >
          {characters.map((hero, i) => (
            <CharacterSprite
              key={hero.id}
              heroData={hero}
              gameState={gameState}
              updateState={updateState}
              spriteIndex={i}
            />
          ))}
        </div>
      </div>

      {/* ── Sliding panels ── */}
      <AnimatePresence>
        {shopOpen && <ShopPanel key="shop" onClose={() => setShopOpen(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {accountOpen && (
          <AccountPanel
            key="account"
            onClose={() => setAccountOpen(false)}
            debugHour={debugHour}
            onDebugHourChange={setDebugHour}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
