/**
 * SpriteCanvas — renders an animated pixel-art character from a sprite sheet.
 *
 * The sheet is generated once per character on first use, cached in
 * localStorage, and then decoded into an Image element kept in a ref.
 * Animation runs in a requestAnimationFrame loop that reads from a single
 * mutable `animRef` so the loop never needs to restart when animation changes.
 */

import { useEffect, useRef, useState } from 'react'
import {
  FRAME,
  ANIM_META,
  generateSpriteSheet,
  getCachedSprite,
  setCachedSprite,
} from '../lib/spriteGen'

export default function SpriteCanvas({ characterId, animation = 'idle', scale = 2, style }) {
  const canvasRef = useRef(null)
  const spriteRef = useRef(null)       // decoded Image element
  const animRef   = useRef({           // mutable loop state — no re-renders
    key:   animation,
    frame: 0,
    timer: 0,
  })
  const [ready, setReady] = useState(false)

  // ── Load / generate sprite sheet ──────────────────────────────────────────
  useEffect(() => {
    let cancelled = false

    function attach(src) {
      const img = new Image()
      img.onload = () => {
        if (cancelled) return
        spriteRef.current = img
        setReady(true)
      }
      img.src = src
    }

    const cached = getCachedSprite(characterId)
    if (cached) {
      attach(cached)
    } else {
      // Defer to avoid blocking the first paint
      const id = setTimeout(() => {
        if (cancelled) return
        const dataUrl = generateSpriteSheet(characterId)
        setCachedSprite(characterId, dataUrl)
        attach(dataUrl)
      }, 0)
      return () => { cancelled = true; clearTimeout(id) }
    }

    return () => { cancelled = true }
  }, [characterId])

  // ── Sync animation key into the loop ref ──────────────────────────────────
  // Resets frame/timer when animation changes so walk cycles start cleanly.
  useEffect(() => {
    if (animRef.current.key !== animation) {
      animRef.current.key   = animation
      animRef.current.frame = 0
      animRef.current.timer = 0
    }
  }, [animation])

  // ── RAF draw loop ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!ready || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = false

    let rafId
    let lastTime = performance.now()
    const displaySize = FRAME * scale

    function tick(now) {
      const dt = Math.min((now - lastTime) / 1000, 0.1)
      lastTime = now

      const a    = animRef.current
      const meta = ANIM_META[a.key] ?? ANIM_META.idle

      a.timer += dt
      if (a.timer >= 1 / meta.fps) {
        a.timer %= 1 / meta.fps
        a.frame  = (a.frame + 1) % meta.frames
      }

      ctx.clearRect(0, 0, displaySize, displaySize)
      ctx.drawImage(
        spriteRef.current,
        a.frame * FRAME,   // source x
        meta.row * FRAME,  // source y
        FRAME, FRAME,
        0, 0,
        displaySize, displaySize,
      )

      rafId = requestAnimationFrame(tick)
    }

    // Draw first frame immediately so there's no blank flash
    const meta = ANIM_META[animRef.current.key] ?? ANIM_META.idle
    const dSize = FRAME * scale
    ctx.clearRect(0, 0, dSize, dSize)
    ctx.drawImage(spriteRef.current, 0, meta.row * FRAME, FRAME, FRAME, 0, 0, dSize, dSize)

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [ready, scale])

  const displaySize = FRAME * scale

  return (
    <canvas
      ref={canvasRef}
      width={displaySize}
      height={displaySize}
      style={{
        imageRendering: 'pixelated',
        display: 'block',
        width: displaySize,
        height: displaySize,
        ...style,
      }}
    />
  )
}
