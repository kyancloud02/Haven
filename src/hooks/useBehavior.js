/**
 * useBehavior — autonomous character AI.
 *
 * Drives a character through idle → wander → leave → offscreen → return states
 * using Framer Motion's standalone animate() on the shared `x` MotionValue.
 * Pauses while the user is dragging. Guard mode overrides everything and walks
 * the character to the right-edge guard post.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { animate } from 'framer-motion'

const SPRITE_W   = 64    // px — matches FRAME in spriteGen
const WALK_SPEED = 80    // px / second

function rand(lo, hi) { return lo + Math.random() * (hi - lo) }

export function useBehavior({ x, spriteIndex, totalCharacters, isDragging, isGuard, itemSlots = [], tryLockSlot, releaseSlot, heroId }) {
  const stateRef = useRef('boot')
  const timerRef = useRef(null)
  const stopRef  = useRef(null)   // cancels the current tween

  const [isOffscreen,    setIsOffscreen]    = useState(false)
  const [walkDir,        setWalkDir]        = useState(null)  // 'left' | 'right' | null
  const [isAppreciating, setIsAppreciating] = useState(false)

  // ── helpers ──────────────────────────────────────────────────────────────────

  const W = () => window.innerWidth

  function randTarget() {
    const w = W()
    return rand(w * 0.04, w * 0.92 - SPRITE_W)
  }

  function stopAnim() {
    stopRef.current?.()
    stopRef.current = null
  }

  function schedule(state, ms) {
    clearTimeout(timerRef.current)
    stateRef.current = state
    timerRef.current = setTimeout(tick, Math.round(ms))
  }

  function moveTo(target, onDone) {
    stopAnim()
    const curX = x.get()
    const dist  = Math.abs(target - curX)
    if (dist < 10) { setWalkDir(null); onDone?.(); return }
    setWalkDir(target > curX ? 'right' : 'left')
    const ctrl = animate(x, target, {
      duration: dist / WALK_SPEED,
      ease:     'linear',
      onComplete: () => { setWalkDir(null); onDone?.() },
    })
    stopRef.current = () => ctrl.stop()
  }

  // ── state machine ─────────────────────────────────────────────────────────────

  function tick() {
    if (isDragging.current)           { schedule('idle', 800); return }
    if (stateRef.current === 'guard') { return }

    const s    = stateRef.current
    const curX = x.get()
    const w    = W()

    if (s === 'idle') {
      // Prioritise item slots: characters are drawn to placed items (one at a time)
      if (itemSlots.length > 0 && Math.random() < 0.40) {
        const shuffled = [...itemSlots].sort(() => Math.random() - 0.5)
        const target = shuffled.find(s => !tryLockSlot || tryLockSlot(s.slotId, heroId))
        if (target) {
          stateRef.current = 'wandering'
          moveTo(target.x, () => {
            setIsAppreciating(true)
            timerRef.current = setTimeout(() => {
              setIsAppreciating(false)
              releaseSlot?.(target.slotId)
              schedule('idle', rand(2_000, 5_000))
            }, 2_500)
          })
          return
        }
      }

      const roll = Math.random()

      if (roll < 0.11) {
        // Leave the village — walk off whichever edge is closer
        stateRef.current = 'leaving'
        const goRight = curX >= w / 2
        moveTo(goRight ? w + SPRITE_W + 30 : -(SPRITE_W * 2 + 30), () => {
          setIsOffscreen(true)
          schedule('returning', rand(12_000, 35_000))
        })

      } else if (roll < 0.58) {
        // Wander to a random spot within the village
        stateRef.current = 'wandering'
        moveTo(randTarget(), () => schedule('idle', rand(2_500, 7_500)))

      } else {
        // Linger — stay and breathe
        schedule('idle', rand(3_000, 9_000))
      }

    } else if (s === 'returning') {
      // Re-enter from a random edge
      const fromRight = Math.random() > 0.5
      x.set(fromRight ? w + SPRITE_W : -(SPRITE_W * 2))
      setIsOffscreen(false)
      stateRef.current = 'entering'
      moveTo(randTarget(), () => schedule('idle', rand(2_000, 5_000)))
    }
  }

  // ── mount ─────────────────────────────────────────────────────────────────────

  useEffect(() => {
    // Stagger startup so characters don't all decide to leave at once
    timerRef.current = setTimeout(() => {
      stateRef.current = 'idle'
      tick()
    }, spriteIndex * 700 + rand(400, 2_500))

    return () => { clearTimeout(timerRef.current); stopAnim() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── guard mode ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (isGuard) {
      clearTimeout(timerRef.current)
      stopAnim()
      setWalkDir(null)
      setIsOffscreen(false)
      const ctrl = animate(x, W() * 0.92 - SPRITE_W, { duration: 1.6, ease: 'easeOut' })
      stopRef.current = () => ctrl.stop()
      stateRef.current = 'guard'
    } else if (stateRef.current === 'guard') {
      schedule('idle', rand(800, 2_000))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGuard])

  // ── drag callbacks (called by CharacterSprite) ────────────────────────────────

  const onDragStart = useCallback(() => {
    clearTimeout(timerRef.current)
    stopAnim()
    stateRef.current = 'idle'
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onDragEnd = useCallback(() => {
    if (isGuard) return
    schedule('idle', rand(600, 1_600))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGuard])

  return { isOffscreen, walkDir, onDragStart, onDragEnd, isAppreciating }
}
