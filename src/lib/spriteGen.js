/**
 * Procedural pixel-art sprite sheet generator.
 *
 * Produces a 128×192 canvas (4 cols × 6 rows of 32×32 frames) for any
 * Haven character ID. Runs entirely in the browser via HTMLCanvasElement —
 * no build step, no external assets. Results are cached in localStorage so
 * generation only happens once per character per CACHE_VERSION bump.
 *
 * Sheet layout
 *   Row 0  walk_down   (front, 4 frames)
 *   Row 1  walk_left   (profile left, 4 frames)
 *   Row 2  walk_right  (profile right, 4 frames)
 *   Row 3  walk_up     (back view, 4 frames)
 *   Row 4  idle        (front, 4 frames, subtle breathing)
 *   Row 5  talk        (front, 4 frames, mouth + arm)
 */

export const FRAME = 32        // px per frame
export const COLS  = 4         // frames per animation row
export const ROWS  = 6         // animation rows

export const ANIM_META = {
  walk_down:  { row: 0, frames: 4, fps: 8 },
  walk_left:  { row: 1, frames: 4, fps: 8 },
  walk_right: { row: 2, frames: 4, fps: 8 },
  walk_up:    { row: 3, frames: 4, fps: 8 },
  idle:       { row: 4, frames: 4, fps: 4 },
  talk:       { row: 5, frames: 4, fps: 6 },
}

// ── Colour palettes ────────────────────────────────────────────────────────────

const CHARS = {
  elf_princess: {
    skin: '#C0B0D8', hair: '#FFE070', outfit: '#C02860',
    accent: '#9070D8', shoes: '#7050B8', eyes: '#5030A0',
    special: 'crown',
  },
  warrior_mulan: {
    skin: '#E8B878', hair: '#180808', outfit: '#B01818',
    accent: '#F0C840', shoes: '#4A2010', eyes: '#280808',
    special: 'hair_bun',
  },
  sun_wukong: {
    skin: '#D8A050', hair: '#181008', outfit: '#D08020',
    accent: '#F8E040', shoes: '#7A4010', eyes: '#381808',
    special: 'headband',
  },
  sherlock_holmes: {
    skin: '#F0C8A0', hair: '#281808', outfit: '#485848',
    accent: '#B0A868', shoes: '#201808', eyes: '#281010',
    special: 'deerstalker',
  },
  robin_hood: {
    skin: '#C89860', hair: '#503018', outfit: '#3A6818',
    accent: '#8B4010', shoes: '#4A3018', eyes: '#2A1808',
    special: 'hood',
  },
  winnie_the_pooh: {
    skin: '#E8C858', hair: '#C89820', outfit: '#E83020',
    accent: '#C07010', shoes: '#C89820', eyes: '#180808',
    special: 'bear_ears', round: true,
  },
}

// ── Drawing primitives ─────────────────────────────────────────────────────────

function px(ctx, color, x, y, w, h) {
  if (w <= 0 || h <= 0) return
  ctx.fillStyle = color
  ctx.fillRect(Math.round(x), Math.round(y), w, h)
}

// ── Special head accessories ───────────────────────────────────────────────────

function drawSpecialTop(ctx, char, cx, base) {
  switch (char.special) {
    case 'crown':
      px(ctx, '#F8D040', cx - 5, base + 2, 10, 3)
      px(ctx, '#F8D040', cx - 4, base + 0,  2, 3)
      px(ctx, '#F8D040', cx - 1, base - 1,  2, 4)
      px(ctx, '#F8D040', cx + 2, base + 0,  2, 3)
      px(ctx, '#E03838', cx - 3, base + 2,  2, 2)
      px(ctx, '#3880E8', cx + 1, base + 2,  2, 2)
      break
    case 'hair_bun':
      px(ctx, char.hair, cx - 3, base + 1, 6, 5)
      px(ctx, char.hair, cx - 2, base + 0, 4, 2)
      px(ctx, '#F0C840', cx - 1, base - 1,  3, 2)
      break
    case 'headband':
      px(ctx, char.hair, cx - 4, base + 3, 8, 2)
      px(ctx, '#F8E040', cx - 5, base + 4, 10, 2)
      px(ctx, '#E83020', cx - 1, base + 3,  3, 2)
      break
    case 'deerstalker':
      px(ctx, char.accent, cx - 5, base + 0, 10, 6)
      px(ctx, char.accent, cx - 7, base + 5, 14, 2)
      px(ctx, char.hair,   cx - 4, base + 1,  2, 2)
      px(ctx, char.hair,   cx,     base + 1,  2, 2)
      px(ctx, char.hair,   cx - 2, base + 3,  2, 2)
      px(ctx, char.hair,   cx + 2, base + 3,  2, 2)
      break
    case 'hood':
      px(ctx, char.outfit, cx - 6, base - 2, 12, 10)
      px(ctx, char.outfit, cx - 4, base - 4,  8,  3)
      px(ctx, char.outfit, cx - 2, base - 5,  4,  2)
      px(ctx, '#204808',   cx - 3, base + 2,  6,  3)
      break
    case 'bear_ears':
      px(ctx, char.skin, cx - 8, base + 2, 5, 5)
      px(ctx, char.skin, cx + 3, base + 2, 5, 5)
      px(ctx, char.hair, cx - 7, base + 3, 3, 3)
      px(ctx, char.hair, cx + 4, base + 3, 3, 3)
      break
  }
}

function drawSpecialBack(ctx, char, cx, base) {
  switch (char.special) {
    case 'crown':
      px(ctx, '#F8D040', cx - 5, base + 2, 10, 2)
      break
    case 'hair_bun':
      px(ctx, char.hair, cx - 3, base + 0, 6, 6)
      break
    case 'headband':
      px(ctx, '#F8E040', cx - 5, base + 4, 10, 2)
      break
    case 'deerstalker':
      px(ctx, char.accent, cx - 5, base + 0, 10, 6)
      px(ctx, char.accent, cx - 7, base + 5, 14, 2)
      break
    case 'hood':
      px(ctx, char.outfit, cx - 6, base - 2, 12, 12)
      break
    case 'bear_ears':
      px(ctx, char.skin, cx - 8, base + 2, 5, 5)
      px(ctx, char.skin, cx + 3, base + 2, 5, 5)
      px(ctx, char.hair, cx - 7, base + 3, 3, 3)
      px(ctx, char.hair, cx + 4, base + 3, 3, 3)
      break
  }
}

function drawHair(ctx, char, cx, base, side) {
  if (char.special === 'hood' || char.special === 'deerstalker') return

  if (char.special === 'headband') {
    px(ctx, char.hair, cx - 4, base + 3, 8, 2)
    px(ctx, char.hair, cx - 5, base + 4, 3, 5)
    px(ctx, char.hair, cx + 2, base + 4, 3, 5)
    return
  }
  if (char.special === 'bear_ears') return

  if (!side) {
    px(ctx, char.hair, cx - 4, base + 3, 8, 2)
    px(ctx, char.hair, cx - 5, base + 4, 3, 5)
    px(ctx, char.hair, cx + 2, base + 4, 3, 5)
    if (char.special === 'crown') {
      px(ctx, char.hair, cx - 6, base + 8, 3, 5)
      px(ctx, char.hair, cx + 3, base + 8, 3, 5)
    }
  } else {
    // Side-profile hair: visible on back of head only
    px(ctx, char.hair, cx + (side === 'left' ? -5 : 2), base + 4, 3, 7)
    px(ctx, char.hair, cx + (side === 'left' ? -4 : 1), base + 3, 4, 2)
  }
}

// ── Main frame draw ────────────────────────────────────────────────────────────

function drawFrame(ctx, charId, animKey, frameIdx, ox, oy) {
  const char = CHARS[charId]
  if (!char) return

  const f = frameIdx

  // Pose offset calculation
  let bodyBob   = 0
  let leftLegY  = 0, rightLegY  = 0
  let leftArmY  = 0, rightArmY  = 0
  let mouthOpen = false
  let armRaise  = 0
  let back      = false
  let side      = null   // 'left' | 'right' | null

  switch (animKey) {
    case 'idle':
      bodyBob = (f === 1 || f === 3) ? 1 : 0
      break
    case 'walk_down':
      if (f === 0) { leftLegY = -2; rightLegY =  2; leftArmY =  2; rightArmY = -2 }
      if (f === 2) { leftLegY =  2; rightLegY = -2; leftArmY = -2; rightArmY =  2 }
      break
    case 'walk_up':
      back = true
      if (f === 0) { leftLegY = -2; rightLegY =  2 }
      if (f === 2) { leftLegY =  2; rightLegY = -2 }
      break
    case 'walk_left':
      side = 'left'
      if (f === 0) { leftLegY = -2; rightLegY =  2; leftArmY =  2; rightArmY = -2 }
      if (f === 2) { leftLegY =  2; rightLegY = -2; leftArmY = -2; rightArmY =  2 }
      break
    case 'walk_right':
      side = 'right'
      if (f === 0) { leftLegY = -2; rightLegY =  2; leftArmY =  2; rightArmY = -2 }
      if (f === 2) { leftLegY =  2; rightLegY = -2; leftArmY = -2; rightArmY =  2 }
      break
    case 'talk':
      mouthOpen = (f === 1 || f === 3)
      armRaise  = mouthOpen ? -3 : -1
      break
  }

  const base = oy + bodyBob
  const cx   = ox + 16

  const bodyW = char.round ? 14 : 10
  const bodyX = cx - Math.floor(bodyW / 2)

  // Shadow
  ctx.globalAlpha = 0.18
  px(ctx, '#000000', cx - 9, oy + 30, 18, 2)
  ctx.globalAlpha = 1.0

  // ── Back view ──────────────────────────────────────────────────────────────
  if (back) {
    drawSpecialBack(ctx, char, cx, base)
    // Head (back — show hair/fur)
    px(ctx, char.hair, cx - 5, base + 4, 10, 8)
    if (char.special === 'bear_ears') {
      px(ctx, char.skin, cx - 4, base + 5, 8, 6)
    }
    // Neck
    px(ctx, char.skin, cx - 1, base + 12, 3, 2)
    // Torso back
    px(ctx, char.outfit, bodyX, base + 14, bodyW, 7)
    px(ctx, char.accent, cx - 1, base + 14, 2, 6)
    // Arms
    px(ctx, char.outfit, cx - 7, base + 14, 2, 6)
    px(ctx, char.outfit, cx + 5, base + 14, 2, 6)
    px(ctx, char.skin,   cx - 7, base + 19, 2, 2)
    px(ctx, char.skin,   cx + 5, base + 19, 2, 2)
    // Legs
    px(ctx, char.accent, cx - 5, base + 21, 3, 6 + leftLegY)
    px(ctx, char.accent, cx + 2, base + 21, 3, 6 + rightLegY)
    px(ctx, char.shoes,  cx - 6, base + 26 + leftLegY,  4, 2)
    px(ctx, char.shoes,  cx + 2, base + 26 + rightLegY, 4, 2)
    return
  }

  // ── Front / side view ──────────────────────────────────────────────────────

  const headW   = side ? 8 : (char.round ? 12 : 10)
  const headOff = side === 'left' ? 1 : side === 'right' ? -1 : 0

  drawSpecialTop(ctx, char, cx + headOff, base)

  // Head
  px(ctx, char.skin, cx - Math.floor(headW / 2) + headOff, base + 4, headW, 8)

  drawHair(ctx, char, cx + headOff, base, side)

  // Eyes
  if (!side) {
    px(ctx, char.eyes, cx - 3, base + 6, 2, 2)
    px(ctx, char.eyes, cx + 1, base + 6, 2, 2)
    px(ctx, 'white',   cx - 2, base + 6, 1, 1)
    px(ctx, 'white',   cx + 2, base + 6, 1, 1)
    // Cheek blush (subtle)
    ctx.globalAlpha = 0.22
    px(ctx, '#FF8080', cx - 5, base + 8, 3, 2)
    px(ctx, '#FF8080', cx + 2, base + 8, 3, 2)
    ctx.globalAlpha = 1.0
    // Mouth
    if (mouthOpen) {
      px(ctx, '#301010', cx - 1, base + 9, 3, 2)
      px(ctx, '#FF9090', cx,     base + 10, 1, 1)
    } else {
      px(ctx, '#C08880', cx - 1, base + 9, 3, 1)
    }
  } else {
    // Side profile — one eye
    const ey = base + 6
    const ex = side === 'left' ? cx - 3 + headOff : cx + 1 + headOff
    px(ctx, char.eyes, ex, ey, 2, 2)
    px(ctx, 'white',   ex + 1, ey, 1, 1)
    // Side mouth
    const mx = side === 'left' ? cx - 2 + headOff : cx + 1 + headOff
    if (mouthOpen) {
      px(ctx, '#301010', mx, base + 9, 2, 1)
    } else {
      px(ctx, '#C08880', mx, base + 9, 1, 1)
    }
  }

  // Neck
  px(ctx, char.skin, cx - 1, base + 12, 3, 2)

  // Torso
  px(ctx, char.outfit, bodyX, base + 14, bodyW, 7)
  px(ctx, char.accent, bodyX, base + 14, bodyW, 1)  // collar stripe
  if (!side) {
    px(ctx, char.accent, cx - 1, base + 15, 3, 3)   // chest detail
  }

  // Arms
  if (!side) {
    px(ctx, char.outfit, cx - 7, base + 14 + leftArmY,           2, 7)
    px(ctx, char.outfit, cx + 5, base + 14 + rightArmY + armRaise, 2, 7)
    px(ctx, char.skin,   cx - 7, base + 20 + leftArmY,           2, 2)
    px(ctx, char.skin,   cx + 5, base + 20 + rightArmY + armRaise, 2, 2)
  } else {
    // Side view — near arm visible
    const ax = side === 'left' ? cx - 7 : cx + 5
    px(ctx, char.outfit, ax, base + 14 + leftArmY, 2, 6)
    px(ctx, char.skin,   ax, base + 20 + leftArmY, 2, 2)
  }

  // Legs
  px(ctx, char.accent, cx - 5, base + 21, 3, 6 + leftLegY)
  px(ctx, char.accent, cx + 2, base + 21, 3, 6 + rightLegY)
  px(ctx, char.shoes,  cx - 6, base + 26 + leftLegY,  4, 2)
  px(ctx, char.shoes,  cx + 2, base + 26 + rightLegY, 4, 2)
}

// ── Public API ─────────────────────────────────────────────────────────────────

export function generateSpriteSheet(charId) {
  const canvas = document.createElement('canvas')
  canvas.width  = FRAME * COLS   // 128
  canvas.height = FRAME * ROWS   // 192
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = false

  for (const [animKey, meta] of Object.entries(ANIM_META)) {
    for (let f = 0; f < meta.frames; f++) {
      drawFrame(ctx, charId, animKey, f, f * FRAME, meta.row * FRAME)
    }
  }

  return canvas.toDataURL('image/png')
}

// Bump this string whenever drawFrame changes to invalidate old caches.
const CACHE_VERSION = 'v3'

export function getCachedSprite(charId) {
  try {
    return localStorage.getItem(`haven_sprite_${CACHE_VERSION}_${charId}`)
  } catch { return null }
}

export function setCachedSprite(charId, dataUrl) {
  try {
    localStorage.setItem(`haven_sprite_${CACHE_VERSION}_${charId}`, dataUrl)
  } catch {}
}
