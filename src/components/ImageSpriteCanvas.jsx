import { useEffect, useRef, useState } from 'react'

export default function ImageSpriteCanvas({ src, spriteSheet, animation = 'idle', scale = 1, style }) {
  const canvasRef = useRef(null)
  const imgRef    = useRef(null)
  const animRef   = useRef({ key: animation, frame: 0, timer: 0 })
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    const img = new Image()
    img.onload = () => {
      if (cancelled) return
      imgRef.current = img
      setReady(true)
    }
    img.src = src
    return () => { cancelled = true }
  }, [src])

  useEffect(() => {
    if (animRef.current.key !== animation) {
      animRef.current = { key: animation, frame: 0, timer: 0 }
    }
  }, [animation])

  const { frameW, frameH, anims } = spriteSheet

  // Scale height to match generated sprites (64px at scale=1), preserve aspect ratio
  const targetH = 64 * scale
  const targetW = Math.round(frameW * (targetH / frameH))

  useEffect(() => {
    if (!ready || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    let rafId
    let lastTime = performance.now()

    function getMeta() {
      return anims[animRef.current.key] ?? anims.idle ?? anims.walk_down
    }

    function tick(now) {
      const dt = Math.min((now - lastTime) / 1000, 0.1)
      lastTime  = now
      const a    = animRef.current
      const meta = getMeta()
      a.timer += dt
      if (a.timer >= 1 / meta.fps) {
        a.timer %= 1 / meta.fps
        a.frame  = (a.frame + 1) % meta.frames
      }
      ctx.clearRect(0, 0, targetW, targetH)
      ctx.drawImage(imgRef.current, a.frame * frameW, meta.row * frameH, frameW, frameH, 0, 0, targetW, targetH)
      rafId = requestAnimationFrame(tick)
    }

    // Draw first frame immediately to avoid blank flash
    const meta = getMeta()
    ctx.drawImage(imgRef.current, 0, meta.row * frameH, frameW, frameH, 0, 0, targetW, targetH)
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [ready, scale, targetW, targetH, frameW, frameH, anims])

  return (
    <canvas
      ref={canvasRef}
      width={targetW}
      height={targetH}
      style={{ display: 'block', width: targetW, height: targetH, ...style }}
    />
  )
}
