import { useState, useEffect, useRef } from 'react'
import visitors from '../data/visitors.json'

const STORAGE_KEY       = 'haven_visitor_state'
const CHECK_INTERVAL_MS = 3 * 60 * 60 * 1000 // 3 real-world hours
const ARRIVAL_CHANCE    = 0.65

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function save(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function useVisitor() {
  const [visitorId, setVisitorId] = useState(() => load()?.currentVisitorId ?? null)
  const lastCheckRef = useRef(load()?.lastCheckTime ?? Date.now())

  useEffect(() => {
    function check() {
      const now = Date.now()
      if (now - lastCheckRef.current < CHECK_INTERVAL_MS) return
      lastCheckRef.current = now

      // Don't stack visitors — wait until current one is dismissed
      const saved = load()
      if (saved?.currentVisitorId) return

      if (Math.random() < ARRIVAL_CHANCE) {
        const v = visitors[Math.floor(Math.random() * visitors.length)]
        save({ lastCheckTime: now, currentVisitorId: v.id })
        setVisitorId(v.id)
      } else {
        save({ lastCheckTime: now, currentVisitorId: null })
      }
    }

    const interval = setInterval(check, 60_000)
    return () => clearInterval(interval)
  }, [])

  function summonVisitor() {
    const v = visitors[Math.floor(Math.random() * visitors.length)]
    save({ lastCheckTime: Date.now(), currentVisitorId: v.id })
    setVisitorId(v.id)
  }

  function dismissVisitor() {
    save({ lastCheckTime: Date.now(), currentVisitorId: null })
    setVisitorId(null)
  }

  const currentVisitor = visitorId ? visitors.find(v => v.id === visitorId) ?? null : null
  return { currentVisitor, summonVisitor, dismissVisitor }
}
