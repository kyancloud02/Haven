import { getTimeState } from '../hooks/useGameTime'

const STATE_COLORS = {
  AWAY:  { bg: '#1e3a5f', accent: '#87CEEB', label: 'AWAY · Daytime' },
  HOME:  { bg: '#3a1a0a', accent: '#E8804A', label: 'HOME · Evening' },
  SLEEP: { bg: '#0a0c1e', accent: '#8890CC', label: 'SLEEP · Night'  },
}

export default function DebugTimeSlider({ hour, onChange }) {
  const timeState = getTimeState(hour)
  const colors = STATE_COLORS[timeState]
  const displayHour = String(hour).padStart(2, '0') + ':00'

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: `${colors.bg}ee`,
        backdropFilter: 'blur(8px)',
        borderTop: `1px solid ${colors.accent}44`,
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        fontFamily: 'monospace',
        fontSize: '12px',
      }}
    >
      <span style={{ color: '#ffffff66', whiteSpace: 'nowrap', letterSpacing: '0.05em' }}>
        DEBUG
      </span>

      <span style={{ color: colors.accent, fontWeight: 'bold', minWidth: '44px' }}>
        {displayHour}
      </span>

      <input
        type="range"
        min={0}
        max={23}
        step={1}
        value={hour}
        onChange={e => onChange(Number(e.target.value))}
        style={{
          flex: 1,
          accentColor: colors.accent,
          cursor: 'pointer',
          height: '4px',
        }}
      />

      <span
        style={{
          color: colors.accent,
          border: `1px solid ${colors.accent}88`,
          borderRadius: '4px',
          padding: '2px 8px',
          whiteSpace: 'nowrap',
          letterSpacing: '0.06em',
        }}
      >
        {colors.label}
      </span>

      <span style={{ color: '#ffffff33', fontSize: '10px', whiteSpace: 'nowrap' }}>
        dev only
      </span>
    </div>
  )
}
