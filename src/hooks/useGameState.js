import { useState } from 'react'

const STORAGE_KEY = 'haven_game_state'

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

const defaultState = {
  gold: 0,
  buildings: [],
  characters: [],
  lastSeen: Date.now(),
}

export function useGameState() {
  const [state, setState] = useState(() => loadState() ?? defaultState)

  function updateState(patch) {
    setState(prev => {
      const next = { ...prev, ...patch }
      saveState(next)
      return next
    })
  }

  return [state, updateState]
}
