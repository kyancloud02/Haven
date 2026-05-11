import { useState, useEffect, useRef } from 'react'
import { getTimeState } from './useGameTime'
import { generateDailyReport } from '../lib/generateDailyReport'

const STORAGE_KEY = 'haven_daily_report'

function getTodayKey() {
  // YYYY-MM-DD in local time
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function loadReport() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveReport(report) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(report))
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
//   currentLeaderId — from gameState, determines who files the report
//   overrideHour    — debug slider value (undefined in production)
//
// Returns:
//   activeReport   — the current uncollected report, or null
//   collectReport  — marks the report collected and clears it from view
//   resetReport    — dev-only: wipes localStorage so a fresh report can fire
// ─────────────────────────────────────────────────────────────────────────────
export function useDailyReport(currentLeaderId, overrideHour) {
  const [activeReport, setActiveReport] = useState(() => {
    const saved = loadReport()
    if (saved && saved.date === getTodayKey() && !saved.collected) return saved
    return null
  })

  // Track which (date + hour-bucket) we last generated for, so a single drag
  // across hour 18 in dev mode only fires once per "cross".
  const lastGeneratedRef = useRef(null)

  useEffect(() => {
    function check() {
      const hour      = overrideHour ?? new Date().getHours()
      const timeState = getTimeState(hour)
      if (timeState !== 'HOME') return

      const today = getTodayKey()
      const saved = loadReport()

      // One report per calendar day (whether collected or not)
      if (saved && saved.date === today) return

      // In dev mode, guard against re-generating on every re-render
      const bucket = `${today}-${overrideHour ?? 'live'}`
      if (lastGeneratedRef.current === bucket) return
      lastGeneratedRef.current = bucket

      const report     = generateDailyReport({ currentLeaderId })
      const reportData = {
        date: today,
        ...report,
        generatedAt: Date.now(),
        collected: false,
      }
      saveReport(reportData)
      setActiveReport(reportData)
    }

    check()
    const interval = setInterval(check, 60_000)
    return () => clearInterval(interval)
  }, [overrideHour, currentLeaderId])

  function collectReport() {
    setActiveReport(prev => {
      if (!prev) return null
      saveReport({ ...prev, collected: true })
      return null
    })
  }

  function resetReport() {
    localStorage.removeItem(STORAGE_KEY)
    lastGeneratedRef.current = null
    setActiveReport(null)
  }

  return { activeReport, collectReport, resetReport }
}
