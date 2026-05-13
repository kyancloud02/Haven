/**
 * Generates docs/sprite-preview.png — a grid showing all characters.
 * Run with: npm run preview-sprites
 *
 * Imports renderSpriteSheet directly from spriteGen.js (no code duplication).
 * node-canvas's 2D API is compatible with browser Canvas 2D API.
 */

import { createCanvas } from 'canvas'
import { writeFileSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))

// spriteGen.js uses no browser globals at module level — safe to import directly
const { renderSpriteSheet, ANIM_META, FRAME, COLS, ROWS } =
  await import('../src/lib/spriteGen.js')

const CHAR_IDS   = ['elf_princess','warrior_mulan','sun_wukong','sherlock_holmes','robin_hood','winnie_the_pooh']
const SHOW_ANIMS = ['idle', 'walk_right', 'walk_left', 'talk']

const SCALE   = 2
const FS      = FRAME * SCALE
const LABEL_W = 114
const SEP_W   = 5
const PAD     = 14
const ROW_H   = FS + 26

const totalFrames = SHOW_ANIMS.reduce((s, a) => s + ANIM_META[a].frames, 0)
const canvasW = LABEL_W + totalFrames * FS + (SHOW_ANIMS.length - 1) * SEP_W + PAD * 2
const canvasH = CHAR_IDS.length * ROW_H + PAD * 2 + 34

const canvas = createCanvas(canvasW, canvasH)
const ctx    = canvas.getContext('2d')
try { ctx.imageSmoothingEnabled = true } catch {}

// Background
ctx.fillStyle = '#141210'
ctx.fillRect(0, 0, canvasW, canvasH)

// Title
ctx.fillStyle = 'rgba(255,255,255,0.32)'
ctx.font = 'bold 13px monospace'
ctx.fillText('Haven — Characters (v9 · Cookie Run Kingdom style)', PAD + LABEL_W, PAD + 14)

// Animation column headers
let hx = PAD + LABEL_W
for (const a of SHOW_ANIMS) {
  ctx.fillStyle = 'rgba(255,255,255,0.18)'
  ctx.font = '9px monospace'
  ctx.fillText(a, hx + 2, PAD + 28)
  hx += ANIM_META[a].frames * FS + SEP_W
}

// Render each character
for (let ci = 0; ci < CHAR_IDS.length; ci++) {
  const charId = CHAR_IDS[ci]
  const baseY  = PAD + 34 + ci * ROW_H

  // Render full sprite sheet
  const sheet    = createCanvas(FRAME * COLS, FRAME * ROWS)
  const sheetCtx = sheet.getContext('2d')
  try { sheetCtx.imageSmoothingEnabled = true } catch {}
  renderSpriteSheet(sheetCtx, charId)

  // Label
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.font = 'bold 10px monospace'
  ctx.fillText(charId.replace(/_/g, '\n'), PAD, baseY + FS * 0.4)

  // Copy frames
  let fx = PAD + LABEL_W
  for (const animKey of SHOW_ANIMS) {
    const meta = ANIM_META[animKey]
    for (let f = 0; f < meta.frames; f++) {
      ctx.drawImage(sheet, f * FRAME, meta.row * FRAME, FRAME, FRAME, fx, baseY, FS, FS)
      fx += FS
    }
    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    ctx.fillRect(fx, baseY, SEP_W, FS)
    fx += SEP_W
  }

  // Row rule
  if (ci < CHAR_IDS.length - 1) {
    ctx.fillStyle = 'rgba(255,255,255,0.04)'
    ctx.fillRect(PAD, baseY + FS + 5, canvasW - PAD * 2, 1)
  }
}

const outPath = resolve(__dir, '..', 'docs', 'sprite-preview.png')
mkdirSync(resolve(__dir, '..', 'docs'), { recursive: true })
writeFileSync(outPath, canvas.toBuffer('image/png'))
console.log(`✓  ${outPath}  (${canvasW}×${canvasH}px)`)
