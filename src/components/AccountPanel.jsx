import { motion } from 'framer-motion'
import { getTimeState } from '../hooks/useGameTime'

const IS_DEV = import.meta.env.DEV

const STATE_META = {
  AWAY:  { accent: '#87CEEB', label: 'Away · Daytime',  range: '08 – 17' },
  HOME:  { accent: '#E8804A', label: 'Home · Evening',  range: '18 – 21' },
  SLEEP: { accent: '#8890CC', label: 'Sleep · Night',   range: '22 – 07' },
}

export default function AccountPanel({ onClose, debugHour, onDebugHourChange, onResetReport, onSummonVisitor, onTriggerCrisis }) {
  const timeState = getTimeState(debugHour)
  const meta = STATE_META[timeState]
  const displayHour = String(debugHour).padStart(2, '0') + ':00'

  return (
    <motion.div
      className="fixed right-0 top-0 h-full w-72 z-50 flex flex-col"
      style={{ background: 'rgba(10,8,5,0.93)', backdropFilter: 'blur(16px)', borderLeft: '1px solid rgba(255,255,255,0.07)' }}
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 260 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <h2 style={{ fontFamily: "'Fredoka One', sans-serif", color: 'white', fontSize: '1.2rem', letterSpacing: '0.02em' }}>
          Account
        </h2>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
          style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.06)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'white'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
        >
          ✕
        </button>
      </div>

      {/* Profile */}
      <div className="px-5 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-xl"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            🏰
          </div>
          <div>
            <p style={{ fontFamily: "'Nunito', sans-serif", color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>Villager</p>
            <p style={{ fontFamily: "'Nunito', sans-serif", color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem' }}>Guest Account</p>
          </div>
        </div>
      </div>

      {/* Dev Tools section */}
      {IS_DEV ? (
        <div className="px-5 py-5 flex-1 overflow-y-auto">
          <p
            className="mb-4"
            style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.25)', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}
          >
            ⚙ Dev Tools
          </p>

          <p
            className="mb-2"
            style={{ fontFamily: "'Nunito', sans-serif", color: 'rgba(255,255,255,0.45)', fontSize: '0.7rem', letterSpacing: '0.10em', textTransform: 'uppercase' }}
          >
            Time of Day
          </p>

          {/* Current hour + state badge */}
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontFamily: 'monospace', color: meta.accent, fontWeight: 'bold', fontSize: '1.1rem' }}>
              {displayHour}
            </span>
            <span
              style={{
                fontFamily: "'Nunito', sans-serif",
                color: meta.accent,
                fontSize: '0.7rem',
                border: `1px solid ${meta.accent}55`,
                borderRadius: 4,
                padding: '2px 8px',
                letterSpacing: '0.05em',
              }}
            >
              {meta.label}
            </span>
          </div>

          {/* Slider */}
          <input
            type="range" min={0} max={23} step={1} value={debugHour}
            onChange={e => onDebugHourChange(Number(e.target.value))}
            style={{ width: '100%', accentColor: meta.accent, cursor: 'pointer' }}
          />

          {/* Hour ruler labels */}
          <div className="flex justify-between mt-1" style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.2)', fontSize: '0.65rem' }}>
            <span>00</span><span>06</span><span>12</span><span>18</span><span>23</span>
          </div>

          {/* State boundary guide */}
          <div className="mt-5 space-y-2">
            {Object.entries(STATE_META).map(([state, m]) => (
              <div key={state} className="flex items-center justify-between">
                <span style={{ fontFamily: 'monospace', color: m.accent, fontSize: '0.72rem' }}>{state}</span>
                <span style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.28)', fontSize: '0.68rem' }}>{m.range}</span>
              </div>
            ))}
          </div>

          {/* Visitor summon */}
          <div className="mt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
            <p
              className="mb-2"
              style={{ fontFamily: "'Nunito', sans-serif", color: 'rgba(255,255,255,0.45)', fontSize: '0.7rem', letterSpacing: '0.10em', textTransform: 'uppercase' }}
            >
              Visitors
            </p>
            <button
              onClick={onSummonVisitor}
              className="w-full py-2 rounded-lg text-xs font-bold tracking-wide"
              style={{
                fontFamily: "'Nunito', sans-serif",
                background: 'rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.45)',
                border: '1px solid rgba(255,255,255,0.10)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; e.currentTarget.style.color = 'white' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)' }}
            >
              Summon Visitor
            </button>
          </div>

          {/* Crisis trigger */}
          <div className="mt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
            <p
              className="mb-2"
              style={{ fontFamily: "'Nunito', sans-serif", color: 'rgba(255,255,255,0.45)', fontSize: '0.7rem', letterSpacing: '0.10em', textTransform: 'uppercase' }}
            >
              Crisis
            </p>
            <button
              onClick={onTriggerCrisis}
              className="w-full py-2 rounded-lg text-xs font-bold tracking-wide"
              style={{
                fontFamily: "'Nunito', sans-serif",
                background: 'rgba(200,48,48,0.12)',
                color: 'rgba(220,100,100,0.75)',
                border: '1px solid rgba(200,48,48,0.20)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,48,48,0.22)'; e.currentTarget.style.color = '#FF9090' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(200,48,48,0.12)'; e.currentTarget.style.color = 'rgba(220,100,100,0.75)' }}
            >
              Trigger Raid
            </button>
          </div>

          {/* Daily report reset */}
          <div className="mt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
            <p
              className="mb-2"
              style={{ fontFamily: "'Nunito', sans-serif", color: 'rgba(255,255,255,0.45)', fontSize: '0.7rem', letterSpacing: '0.10em', textTransform: 'uppercase' }}
            >
              Daily Report
            </p>
            <button
              onClick={onResetReport}
              className="w-full py-2 rounded-lg text-xs font-bold tracking-wide transition-colors"
              style={{
                fontFamily: "'Nunito', sans-serif",
                background: 'rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.45)',
                border: '1px solid rgba(255,255,255,0.10)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; e.currentTarget.style.color = 'white' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)' }}
            >
              Reset Active Report
            </button>
            <p style={{ fontFamily: "'Nunito', sans-serif", color: 'rgba(255,255,255,0.18)', fontSize: '0.65rem', marginTop: 4 }}>
              Clears localStorage so a new report can fire when time is HOME.
            </p>
          </div>
        </div>
      ) : (
        <div className="px-5 py-5 flex-1">
          <p style={{ fontFamily: "'Nunito', sans-serif", color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>
            Settings coming soon.
          </p>
        </div>
      )}
    </motion.div>
  )
}
