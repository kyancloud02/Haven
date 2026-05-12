import { useState, useEffect, useRef } from 'react'
import characters from '../data/characters.json'

const STORAGE_KEY       = 'haven_crisis_state'
const CHECK_INTERVAL_MS = 2 * 60 * 60 * 1000
const RAID_CHANCE       = 0.45
const GOLD_THRESHOLD    = 100

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function save(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function buildEvent(guardId, gold) {
  const guard = characters.find(c => c.id === guardId) ?? null
  if (guard) {
    return { outcome: 'intercepted', goldLost: 0, guardName: guard.name }
  }
  return { outcome: 'raided', goldLost: Math.max(15, Math.floor(gold * 0.20)), guardName: null }
}

export function useCrisis(gameState, updateState) {
  const stateRef = useRef(gameState)
  useEffect(() => { stateRef.current = gameState }, [gameState])

  const [crisisEvent, setCrisisEvent] = useState(null)
  const [isDamaged,   setIsDamaged]   = useState(() => load()?.isDamaged ?? false)
  const lastCheckRef = useRef(load()?.lastCrisisCheck ?? Date.now())

  useEffect(() => {
    function check() {
      const { gold, guardId } = stateRef.current
      if (gold <= GOLD_THRESHOLD) return

      const now = Date.now()
      if (now - lastCheckRef.current < CHECK_INTERVAL_MS) return
      lastCheckRef.current = now

      if (Math.random() < RAID_CHANCE) {
        const event   = buildEvent(guardId, gold)
        const damaged = event.outcome === 'raided'

        save({ lastCrisisCheck: now, isDamaged: damaged })
        setIsDamaged(damaged)

        if (event.goldLost > 0) {
          updateState({ gold: Math.max(0, gold - event.goldLost) })
        }

        setCrisisEvent(event)
      } else {
        save({ lastCrisisCheck: now, isDamaged: load()?.isDamaged ?? false })
      }
    }

    const interval = setInterval(check, 60_000)
    return () => clearInterval(interval)
  }, [updateState])

  function triggerCrisis() {
    const { gold, guardId } = stateRef.current
    const event   = buildEvent(guardId, gold)
    const damaged = event.outcome === 'raided'

    save({ lastCrisisCheck: Date.now(), isDamaged: damaged })
    setIsDamaged(damaged)

    if (event.goldLost > 0) {
      updateState({ gold: Math.max(0, gold - event.goldLost) })
    }

    setCrisisEvent(event)
  }

  function dismissCrisis() {
    // Guard defense also repairs existing damage
    if (crisisEvent?.outcome === 'intercepted') {
      save({ ...load(), isDamaged: false })
      setIsDamaged(false)
    }
    setCrisisEvent(null)
  }

  return { crisisEvent, isDamaged, triggerCrisis, dismissCrisis }
}
