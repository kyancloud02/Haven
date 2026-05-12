/**
 * SpriteCanvas — renders one animation from a procedurally generated sprite sheet.
 *
 * The sheet (512×448, 64px frames) is built once per character, cached in
 * localStorage, and decoded into an Image ref. A single RAF loop reads from a
 * mutable animRef so changing `animation` never restarts the loop — it just
 * switches which row the loop samples.
 */

import { useEffect, useRef, useState } from 'react'
import {
  FRAME,
  ANIM_META,
  generateSpriteSheet,
  getCachedSprite,
  setCachedSprite,
} from '../lib/spriteGen'

export default function SpriteCanvas({ characterId, animation = 'idle', scale = 1, style }) {
  const canvasRef = useRef(null)
  const spriteRef = useRef(null)
  const animRef   = useRef({ key: animation, frame: 0, timer: 0 })
  const [ready, setReady] = useState(false)

  // ── Load / generate sprite sheet ──────────────────────────────────────────
  useEffect(() => {
    let cancelled = false

    function attach(src) {
      const img  = new Image()
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

  // ── Sync animation key into loop ref ──────────────────────────────────────
  useEffect(() => {
    if (animRef.current.key !== animation) {
      animRef.current = { key: animation, frame: 0, timer: 0 }
    }
  }, [animation])

  // ── RAF draw loop ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!ready || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    // Keep smoothing enabled to match the hand-painted art style
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    let rafId
    let lastTime  = performance.now()
    const display = FRAME * scale

    function tick(now) {
      const dt = Math.min((now - lastTime) / 1000, 0.1)
      lastTime  = now

      const a    = animRef.current
      const meta = ANIM_META[a.key] ?? ANIM_META.idle

      a.timer += dt
      if (a.timer >= 1 / meta.fps) {
        a.timer %= 1 / meta.fps
        a.frame  = (a.frame + 1) % meta.frames
      }

      ctx.clearRect(0, 0, display, display)
      ctx.drawImage(
        spriteRef.current,
        a.frame * FRAME,   // src x
        meta.row  * FRAME, // src y
        FRAME, FRAME,
        0, 0,
        display, display,
      )

      rafId = requestAnimationFrame(tick)
    }

    // Draw first frame immediately — no blank flash
    const meta  = ANIM_META[animRef.current.key] ?? ANIM_META.idle
    ctx.clearRect(0, 0, display, display)
    ctx.drawImage(spriteRef.current, 0, meta.row * FRAME, FRAME, FRAME, 0, 0, display, display)

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [ready, scale])

  const display = FRAME * scale

  return (
    <canvas
      ref={canvasRef}
      width={display}
      height={display}
      style={{ display: 'block', width: display, height: display, ...style }}
    />
  )
}
