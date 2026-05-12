/**
 * useHeritage — Kingdom Heritage & Legacy system.
 *
 * Tracks real-world age in days, computes prestige points earned from
 * kingdom achievements, watches for the Heir milestone condition, and
 * provides a restart-with-heir function that resets the kingdom while
 * carrying prestige forward.
 *
 * Milestone: housingTier >= 'Stone Manor' AND activeTreaties.length >= 3
 */

import { useMemo, useEffect } from 'react'
import tiers from '../data/tiers.json'

// ── Tuning ─────────────────────────────────────────────────────────────────────

const PTS_PER_DAY    = 5
const PTS_PER_TREATY = 10
const PTS_PER_TIER   = 20   // per tier level above Cardboard Box
const PTS_PER_GOLD   = 0.05 // per gold unit held

// Stone Manor is the minimum tier for the milestone (index 3 in tiers.json)
const MILESTONE_TIER_INDEX = 3
const MILESTONE_TREATIES   = 3

// ── Prestige buff catalogue ─────────────────────────────────────────────────────
// These are the permanent buffs players will be able to purchase with
// prestigePoints in future eras. Defined here so the modal can preview them.

export const PRESTIGE_BUFFS = [
  {
    id:          'ancestral_luck',
    name:        'Ancestral Luck',
    icon:        '🍀',
    description: '+15% gold from all sources',
    cost:        50,
  },
  {
    id:          'iron_legacy',
    name:        'Iron Legacy',
    icon:        '⚔',
    description: 'Guard intercepts raids with 50% reduced gold loss risk',
    cost:        80,
  },
  {
    id:          'ancient_pact',
    name:        'Ancient Pact',
    icon:        '📜',
    description: 'Begin each new era with one treaty pre-signed',
    cost:        100,
  },
  {
    id:          'founders_blessing',
    name:        "Founder's Blessing",
    icon:        '✦',
    description: 'Start with 80 gold instead of 50',
    cost:        60,
  },
]

// ── Roman numeral helper (for generation display) ───────────────────────────────

export function toRoman(n) {
  const map = [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],
               [90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],
               [5,'V'],[4,'IV'],[1,'I']]
  let result = ''
  for (const [val, sym] of map) {
    while (n >= val) { result += sym; n -= val }
  }
  return result
}

// ── Hook ────────────────────────────────────────────────────────────────────────

export function useHeritage(gameState, updateState) {
  // Real days since kingdom was founded (minimum 1 to avoid "Day 0")
  const ageDays = useMemo(() => {
    const ms = Date.now() - (gameState.foundedAt ?? Date.now())
    return Math.max(1, Math.floor(ms / 86_400_000))
  }, [gameState.foundedAt])

  // Current tier index (0 = Cardboard Box … 4 = Glass Castle)
  const tierIndex = useMemo(
    () => Math.max(0, tiers.findIndex(t => t.name === gameState.housingTier)),
    [gameState.housingTier],
  )

  // Prestige earned THIS era (not counting points already banked from past eras)
  const eraPrestige = useMemo(() => Math.floor(
    ageDays * PTS_PER_DAY +
    (gameState.activeTreaties?.length ?? 0) * PTS_PER_TREATY +
    tierIndex * PTS_PER_TIER +
    (gameState.gold ?? 0) * PTS_PER_GOLD
  ), [ageDays, gameState.activeTreaties, tierIndex, gameState.gold])

  // Total prestige if they restarted right now
  const totalPrestige = (gameState.prestigePoints ?? 0) + eraPrestige

  // ── Milestone watcher ──────────────────────────────────────────────────────
  useEffect(() => {
    if (gameState.heirUnlocked) return
    const tierMet    = tierIndex >= MILESTONE_TIER_INDEX
    const treatiesMet = (gameState.activeTreaties?.length ?? 0) >= MILESTONE_TREATIES
    if (tierMet && treatiesMet) {
      updateState({ heirUnlocked: true })
    }
  }, [tierIndex, gameState.activeTreaties, gameState.heirUnlocked, updateState])

  // ── Dev helper — force-unlock for testing ──────────────────────────────────
  function forceUnlock() {
    updateState({ heirUnlocked: true })
  }

  // ── Restart with Heir ──────────────────────────────────────────────────────
  // Resets the kingdom to its starting state while banking prestige points
  // and incrementing the legacy generation counter.
  function restartWithHeir() {
    updateState({
      // ── Reset ──
      gold:             50,
      housingTier:      'Cardboard Box',
      activeTreaties:   [],
      blessing:         null,
      guardId:          null,
      currentLeaderId:  'king',
      heirUnlocked:     false,
      foundedAt:        Date.now(),
      // ── Carry forward ──
      prestigePoints:   totalPrestige,
      legacyGeneration: (gameState.legacyGeneration ?? 1) + 1,
    })
  }

  return {
    ageDays,
    tierIndex,
    eraPrestige,
    totalPrestige,
    forceUnlock,
    restartWithHeir,
  }
}
