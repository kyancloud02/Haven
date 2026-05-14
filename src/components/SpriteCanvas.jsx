/**
 * SpriteCanvas — renders one animation frame from a sprite sheet.
 *
 * Asset priority: tries /assets/props/characters/{characterId}.png first.
 * If found, derives frame size from image dimensions assuming an 8-col × 7-row grid.
 * Falls back to the procedurally generated sheet (512×448, 64px frames) if no asset exists.
 *
 * A single RAF loop reads from a mutable animRef so switching `animation` never
 * restarts the loop — it just changes which row is sampled.
 */

import { useEffect, useRef, useState } from 'react'
import {
  FRAME,
  ANIM_META,
  generateSpriteSheet,
  getCachedSprite,
  setCachedSprite,
} from '../lib/spriteGen'

const SHEET_COLS = 8
const SHEET_ROWS = 7

export default function SpriteCanvas({ characterId, animation = 'idle', scale = 1, style }) {
  const canvasRef  = useRef(null)
  const spriteRef  = useRef(null)
  const frameSizeRef = useRef({ w: FRAME, h: FRAME }) // updated when asset loads
  const animRef    = useRef({ key: animation, frame: 0, timer: 0 })
  const [ready, setReady] = useState(false)

  // ── Load sprite sheet (asset PNG → procedural fallback) ───────────────────
  useEffect(() => {
    let cancelled = false

    function attachProcedural() {
      function load(src) {
        const img = new Image()
        img.onload = () => {
          if (cancelled) return
          frameSizeRef.current = { w: FRAME, h: FRAME }
          spriteRef.current = img
          setReady(true)
        }
        img.src = src
      }
      const cached = getCachedSprite(characterId)
      if (cached) {
        load(cached)
      } else {
        const id = setTimeout(() => {
          if (cancelled) return
          const dataUrl = generateSpriteSheet(characterId)
          setCachedSprite(characterId, dataUrl)
          load(dataUrl)
        }, 0)
        return () => clearTimeout(id)
      }
    }

    // Try real asset first
    const assetImg = new Image()
    assetImg.onload = () => {
      if (cancelled) return
      frameSizeRef.current = {
        w: assetImg.naturalWidth  / SHEET_COLS,
        h: assetImg.naturalHeight / SHEET_ROWS,
      }
      spriteRef.current = assetImg
      setReady(true)
    }
    assetImg.onerror = () => { if (!cancelled) attachProcedural() }
    assetImg.src = `/assets/props/characters/${characterId}.png`

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
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    let rafId
    let lastTime = performance.now()
    const display = FRAME * scale

    function tick(now) {
      const dt = Math.min((now - lastTime) / 1000, 0.1)
      lastTime  = now

      const a    = animRef.current
      const meta = ANIM_META[a.key] ?? ANIM_META.idle
      const fw   = frameSizeRef.current.w
      const fh   = frameSizeRef.current.h

      a.timer += dt
      if (a.timer >= 1 / meta.fps) {
        a.timer %= 1 / meta.fps
        a.frame  = (a.frame + 1) % meta.frames
      }

      ctx.clearRect(0, 0, display, display)
      ctx.drawImage(
        spriteRef.current,
        a.frame * fw,   // src x
        meta.row * fh,  // src y
        fw, fh,
        0, 0,
        display, display,
      )

      rafId = requestAnimationFrame(tick)
    }

    // Draw first frame immediately — no blank flash
    const meta = ANIM_META[animRef.current.key] ?? ANIM_META.idle
    const fw   = frameSizeRef.current.w
    const fh   = frameSizeRef.current.h
    ctx.clearRect(0, 0, display, display)
    ctx.drawImage(spriteRef.current, 0, meta.row * fh, fw, fh, 0, 0, display, display)

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
