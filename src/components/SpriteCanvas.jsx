/**
 * SpriteCanvas — renders one animation frame from a sprite sheet.
 *
 * Asset priority: tries /assets/props/characters/{characterId}.png first.
 * If found, the sheet is piped through SpriteParser (background removal +
 * auto row/col detection + uniform repack). Falls back to the procedurally
 * generated sheet (512×448, 64px frames) if no asset exists.
 *
 * A single RAF loop reads from a mutable animRef so switching `animation`
 * never restarts the loop — it just changes which row is sampled.
 */

import { useEffect, useRef, useState } from 'react'
import {
  FRAME,
  ANIM_META,
  generateSpriteSheet,
  getCachedSprite,
  setCachedSprite,
} from '../lib/spriteGen'
import { parseSpriteSheetToDataUrl } from '../lib/SpriteParser'

const SHEET_COLS = 8
const SHEET_ROWS = 7

export default function SpriteCanvas({ characterId, animation = 'idle', scale = 1, style }) {
  const canvasRef   = useRef(null)
  const spriteRef   = useRef(null)
  const frameSizeRef = useRef({ w: FRAME, h: FRAME })
  const animRef     = useRef({ key: animation, frame: 0, timer: 0 })
  const [ready, setReady] = useState(false)

  // ── Load sprite sheet (asset PNG → procedural fallback) ───────────────────
  useEffect(() => {
    let cancelled = false

    function attachFromDataUrl(dataUrl, fw, fh) {
      const img = new Image()
      img.onload = () => {
        if (cancelled) return
        frameSizeRef.current = { w: fw, h: fh }
        spriteRef.current = img
        setReady(true)
      }
      img.src = dataUrl
    }

    function attachProcedural() {
      const cached = getCachedSprite(characterId)
      if (cached) {
        attachFromDataUrl(cached, FRAME, FRAME)
      } else {
        const id = setTimeout(() => {
          if (cancelled) return
          const dataUrl = generateSpriteSheet(characterId)
          setCachedSprite(characterId, dataUrl)
          attachFromDataUrl(dataUrl, FRAME, FRAME)
        }, 0)
        return () => clearTimeout(id)
      }
    }

    // Try real asset first — pipe through SpriteParser
    const assetUrl = `/assets/props/characters/${characterId}.png`
    const cacheKey = `sprite_parsed_${characterId}`

    // Check if we have a previously parsed result in localStorage
    try {
      const hit = localStorage.getItem(cacheKey)
      if (hit) {
        const { dataUrl, frameW, frameH } = JSON.parse(hit)
        attachFromDataUrl(dataUrl, frameW, frameH)
        return () => { cancelled = true }
      }
    } catch {}

    // Probe whether the asset exists before parsing
    const probe = new Image()
    probe.onload = () => {
      if (cancelled) return
      // Clear stale procedural cache
      try { localStorage.removeItem(`sprite_${characterId}`) } catch {}

      parseSpriteSheetToDataUrl(assetUrl, { cols: SHEET_COLS, rows: SHEET_ROWS })
        .then(({ dataUrl, frameW, frameH }) => {
          if (cancelled) return
          // Cache the parsed result so we don't re-parse on every mount
          try {
            localStorage.setItem(cacheKey, JSON.stringify({ dataUrl, frameW, frameH }))
          } catch {}
          attachFromDataUrl(dataUrl, frameW, frameH)
        })
        .catch(() => { if (!cancelled) attachProcedural() })
    }
    probe.onerror = () => { if (!cancelled) attachProcedural() }
    probe.src = assetUrl

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
