import { useCallback, useEffect, useRef, useState } from 'react'
import { animate } from 'framer-motion'

const SPRITE_W   = 64
const WALK_SPEED = 80

function rand(lo, hi) { return lo + Math.random() * (hi - lo) }

export function useBehavior({ x, spriteIndex, totalCharacters, isDragging, isGuard, itemSlots = [], tryLockSlot, releaseSlot, heroId, conversationBark }) {
  const stateRef       = useRef('boot')
  const timerRef       = useRef(null)
  const stopRef        = useRef(null)
  const convoBarkRef   = useRef(conversationBark)

  const [isOffscreen,    setIsOffscreen]    = useState(false)
  const [isInside,       setIsInside]       = useState(false)
  const [walkDir,        setWalkDir]        = useState(null)
  const [isAppreciating, setIsAppreciating] = useState(false)

  useEffect(() => { convoBarkRef.current = conversationBark }, [conversationBark])

  const W     = () => window.innerWidth
  const doorX = () => W() * 0.5 - SPRITE_W / 2

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

  function tick() {
    if (isDragging.current)           { schedule('idle', 800); return }
    if (stateRef.current === 'guard') { return }

    const s    = stateRef.current
    const curX = x.get()
    const w    = W()

    if (s === 'idle') {
      // Pause when an outdoor conversation is happening
      if (convoBarkRef.current) { schedule('idle', 3_000); return }

      // Item slot appreciation (40% chance when slots are placed)
      if (itemSlots.length > 0 && Math.random() < 0.40) {
        const shuffled = [...itemSlots].sort(() => Math.random() - 0.5)
        const target = shuffled.find(sl => !tryLockSlot || tryLockSlot(sl.slotId, heroId))
        if (target) {
          stateRef.current = 'wandering'
          moveTo(target.x, () => {
            setIsAppreciating(true)
            timerRef.current = setTimeout(() => {
              setIsAppreciating(false)
              releaseSlot?.(target.slotId)
              schedule('idle', rand(8_000, 18_000))
            }, rand(3_000, 7_000))
          })
          return
        }
      }

      const roll = Math.random()

      if (roll < 0.05) {
        // Enter the house — walk to door then go inside
        stateRef.current = 'going_inside'
        moveTo(doorX(), () => {
          setIsInside(true)
          setWalkDir(null)
          schedule('inside', rand(90_000, 240_000))
        })

      } else if (roll < 0.10) {
        // Leave the village — walk off whichever edge is closer
        stateRef.current = 'leaving'
        const goRight = curX >= w / 2
        moveTo(goRight ? w + SPRITE_W + 30 : -(SPRITE_W * 2 + 30), () => {
          setIsOffscreen(true)
          schedule('returning', rand(120_000, 300_000))
        })

      } else if (roll < 0.38) {
        // Wander to a random spot
        stateRef.current = 'wandering'
        moveTo(randTarget(), () => schedule('idle', rand(10_000, 22_000)))

      } else {
        // Linger — stay and breathe
        schedule('idle', rand(12_000, 30_000))
      }

    } else if (s === 'inside') {
      // Exit the house — appear at door and walk out
      x.set(doorX())
      setIsInside(false)
      stateRef.current = 'coming_outside'
      moveTo(randTarget(), () => schedule('idle', rand(5_000, 12_000)))

    } else if (s === 'returning') {
      // Re-enter from a random screen edge
      const fromRight = Math.random() > 0.5
      x.set(fromRight ? w + SPRITE_W : -(SPRITE_W * 2))
      setIsOffscreen(false)
      stateRef.current = 'entering'
      moveTo(randTarget(), () => schedule('idle', rand(5_000, 12_000)))
    }
  }

  // Mount — stagger startup so characters don't all move at once
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      stateRef.current = 'idle'
      tick()
    }, spriteIndex * 700 + rand(400, 2_500))

    return () => { clearTimeout(timerRef.current); stopAnim() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Guard mode
  useEffect(() => {
    if (isGuard) {
      clearTimeout(timerRef.current)
      stopAnim()
      setWalkDir(null)
      setIsOffscreen(false)
      setIsInside(false)
      const ctrl = animate(x, W() * 0.92 - SPRITE_W, { duration: 1.6, ease: 'easeOut' })
      stopRef.current = () => ctrl.stop()
      stateRef.current = 'guard'
    } else if (stateRef.current === 'guard') {
      schedule('idle', rand(800, 2_000))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGuard])

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

  return { isOffscreen, isInside, walkDir, onDragStart, onDragEnd, isAppreciating }
}
