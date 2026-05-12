/**
 * Procedural sprite sheet generator — Islets-inspired soft art style.
 *
 * Produces a 512×448 canvas (8 cols × 7 rows of 64×64 frames).
 * All characters share the same round-bird silhouette with thick outlines,
 * muted pastel colours, and watercolour-style highlights. Accessories and
 * colour palettes distinguish each character.
 *
 * Sheet layout
 *   Row 0  walk_down   (front, 4 frames)
 *   Row 1  walk_left   (side,  8 frames)
 *   Row 2  walk_right  (side,  8 frames)
 *   Row 3  walk_up     (back,  4 frames)
 *   Row 4  idle        (front, 4 frames — subtle body bob)
 *   Row 5  talk        (front, 4 frames — beak open, arm rise)
 *   Row 6  blink       (front, 2 frames — open / closed)
 */

export const FRAME = 64
export const COLS  = 8
export const ROWS  = 7

export const ANIM_META = {
  walk_down:  { row: 0, frames: 4, fps: 8  },
  walk_left:  { row: 1, frames: 8, fps: 10 },
  walk_right: { row: 2, frames: 8, fps: 10 },
  walk_up:    { row: 3, frames: 4, fps: 8  },
  idle:       { row: 4, frames: 4, fps: 4  },
  talk:       { row: 5, frames: 4, fps: 6  },
  blink:      { row: 6, frames: 2, fps: 3  },
}

// ── Character palettes ─────────────────────────────────────────────────────────

const CHARS = {
  elf_princess: {
    body:    '#C4A8D8', bodyD:  '#A484BC',
    scarf:   '#C85888', scarfD: '#A04070',
    beak:    '#E8C878', beakD:  '#C09840',
    eyes:    '#3A2098',
    cloak:   '#B888CC', cloakD: '#8868A8',
    satchel: '#D4A8E8', satchD: '#B888CC',
    legs:    '#8060B0', feet:   '#5840A0',
    special: 'tiara',
  },
  warrior_mulan: {
    body:    '#D8A870', bodyD:  '#B88848',
    scarf:   '#C02828', scarfD: '#901818',
    beak:    '#3A2010', beakD:  '#201008',
    eyes:    '#281008',
    cloak:   '#A82020', cloakD: '#781818',
    satchel: '#C89040', satchD: '#A07028',
    legs:    '#481808', feet:   '#301008',
    special: 'topknot',
  },
  sun_wukong: {
    body:    '#D8A840', bodyD:  '#B88020',
    scarf:   '#D07020', scarfD: '#A85018',
    beak:    '#7A4010', beakD:  '#502808',
    eyes:    '#381408',
    cloak:   '#C89030', cloakD: '#A07020',
    satchel: '#D8B840', satchD: '#B09028',
    legs:    '#7A4818', feet:   '#503010',
    special: 'headband',
  },
  sherlock_holmes: {
    body:    '#7A8898', bodyD:  '#586878',
    scarf:   '#485858', scarfD: '#303848',
    beak:    '#D0A870', beakD:  '#A88048',
    eyes:    '#201818',
    cloak:   '#505860', cloakD: '#383F48',
    satchel: '#806848', satchD: '#604830',
    legs:    '#283038', feet:   '#181F28',
    special: 'deerstalker',
  },
  robin_hood: {
    body:    '#6A8A40', bodyD:  '#4A6A28',
    scarf:   '#3A6018', scarfD: '#285010',
    beak:    '#7A5828', beakD:  '#503810',
    eyes:    '#1A1008',
    cloak:   '#4A6A28', cloakD: '#304818',
    satchel: '#8A6030', satchD: '#6A4820',
    legs:    '#483018', feet:   '#302010',
    special: 'pointed_hood',
  },
  winnie_the_pooh: {
    body:    '#E8C850', bodyD:  '#C8A830',
    scarf:   '#C82020', scarfD: '#A01010',
    beak:    '#8A5820', beakD:  '#604010',
    eyes:    '#180808',
    cloak:   '#C82020', cloakD: '#901010',
    satchel: '#E8A030', satchD: '#C88020',
    legs:    '#7A4818', feet:   '#4A2810',
    special: 'bear_ears',
  },
}

// ── Walk cycle leg tables ──────────────────────────────────────────────────────

// 8-frame side-walk leg offsets [leftLeg, rightLeg]
const WALK8 = [
  [-3, 2], [-2, 3], [-1, 2], [0, 1],
  [ 3,-2], [ 2,-3], [ 1,-2], [0,-1],
]

// 4-frame front/back walk leg offsets
const WALK4 = [[-2, 2], [0, 3], [2, -2], [0, -3]]

// ── Drawing primitives ─────────────────────────────────────────────────────────

const OL = '#1A1008'  // outline colour (dark warm brown)

function circ(ctx, cx, cy, r, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()
}

function oval(ctx, cx, cy, rx, ry, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
  ctx.fill()
}

function rrect(ctx, x, y, w, h, r, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  if (ctx.roundRect) { ctx.roundRect(x, y, w, h, r) } else { ctx.rect(x, y, w, h) }
  ctx.fill()
}

// Outlined circle (outline first, then fill slightly smaller)
function circO(ctx, cx, cy, r, fill) {
  circ(ctx, cx, cy, r + 1.5, OL)
  circ(ctx, cx, cy, r, fill)
}

// Outlined oval
function ovalO(ctx, cx, cy, rx, ry, fill) {
  oval(ctx, cx, cy, rx + 1.5, ry + 1.5, OL)
  oval(ctx, cx, cy, rx, ry, fill)
}

// ── Accessories ────────────────────────────────────────────────────────────────

function drawAccessory(ctx, char, cx, y, view) {
  // view: 'front' | 'back' | 'left' | 'right'
  const isSide = view === 'left' || view === 'right'
  const dir    = view === 'left' ? -1 : 1

  switch (char.special) {

    case 'tiara': {
      if (view === 'back') break
      // Gold zigzag crown above head
      ctx.fillStyle = '#F0D840'
      ctx.beginPath()
      if (!isSide) {
        ctx.moveTo(cx - 8, y + 7)
        ctx.lineTo(cx - 5, y + 2)
        ctx.lineTo(cx - 2, y + 6)
        ctx.lineTo(cx,     y + 1)
        ctx.lineTo(cx + 2, y + 6)
        ctx.lineTo(cx + 5, y + 2)
        ctx.lineTo(cx + 8, y + 7)
      } else {
        ctx.moveTo(cx - 5 * dir, y + 7)
        ctx.lineTo(cx - 2 * dir, y + 2)
        ctx.lineTo(cx + 1 * dir, y + 6)
        ctx.lineTo(cx + 4 * dir, y + 7)
      }
      ctx.closePath(); ctx.fill()
      ctx.strokeStyle = OL; ctx.lineWidth = 0.8; ctx.stroke()
      if (!isSide) circ(ctx, cx, y + 3, 2.5, '#FF4060')
      break
    }

    case 'topknot': {
      // Dark hair bun
      const tx = isSide ? cx - dir * 1 : cx
      circO(ctx, tx, y + 5, 5, char.bodyD)
      circ(ctx,  tx, y + 5, 3, '#1A0808')
      circ(ctx,  tx + 1, y + 4, 1, 'rgba(255,255,255,0.2)')
      break
    }

    case 'headband': {
      if (view === 'back') {
        rrect(ctx, cx - 12, y + 12, 24, 4, 2, char.scarfD)
        break
      }
      const bw = isSide ? 18 : 22
      rrect(ctx, cx - bw / 2 + (isSide ? dir * 2 : 0), y + 11, bw, 4, 2, char.scarfD)
      if (!isSide) circ(ctx, cx, y + 13, 3, '#F8E040')
      else         circ(ctx, cx + dir * 2, y + 13, 2.5, '#F8E040')
      break
    }

    case 'deerstalker': {
      // Flat detective cap
      const capC = '#5A6860'
      if (!isSide) {
        oval(ctx, cx,  y + 9, 13, 4.5, capC)
        oval(ctx, cx + 12, y + 9,  4, 2, capC)  // front brim
        oval(ctx, cx - 12, y + 9,  4, 2, capC)  // back brim
      } else {
        oval(ctx, cx + dir * 2, y + 9, 12, 4.5, capC)
        oval(ctx, cx + dir * 14, y + 10, 5, 2,   capC)  // forward brim
      }
      break
    }

    case 'pointed_hood': {
      // Robin Hood pointed hood tip
      ctx.fillStyle = char.scarfD
      ctx.beginPath()
      if (!isSide) {
        ctx.moveTo(cx,     y - 2)
        ctx.lineTo(cx - 10, y + 8)
        ctx.lineTo(cx + 10, y + 8)
      } else {
        ctx.moveTo(cx - dir * 2, y - 2)
        ctx.lineTo(cx - dir * 10, y + 7)
        ctx.lineTo(cx + dir * 4, y + 7)
      }
      ctx.closePath(); ctx.fill()
      ctx.strokeStyle = OL; ctx.lineWidth = 0.8; ctx.stroke()
      break
    }

    case 'bear_ears': {
      // Two round fuzzy ears
      if (!isSide) {
        circO(ctx, cx - 10, y + 7, 5, char.body)
        circO(ctx, cx + 10, y + 7, 5, char.body)
        circ(ctx,  cx - 10, y + 7, 3, '#FF9898')
        circ(ctx,  cx + 10, y + 7, 3, '#FF9898')
      } else {
        // Only the near ear visible from side
        const ex = cx + dir * 10
        circO(ctx, ex, y + 7, 5, char.body)
        circ(ctx,  ex, y + 7, 3, '#FF9898')
      }
      break
    }
  }
}

// ── Front/back shared body parts ───────────────────────────────────────────────

function drawShadow(ctx, cx, oy) {
  ctx.globalAlpha = 0.13
  oval(ctx, cx, oy + 61, 14, 3.5, '#000000')
  ctx.globalAlpha = 1.0
}

function drawLegs(ctx, char, cx, oy, lL, lR) {
  oval(ctx, cx - 6, oy + 51 + lL, 4.5, 5.5, OL)
  oval(ctx, cx + 6, oy + 51 + lR, 4.5, 5.5, OL)
  oval(ctx, cx - 6, oy + 51 + lL, 3.5, 4.5, char.legs)
  oval(ctx, cx + 6, oy + 51 + lR, 3.5, 4.5, char.legs)
  // Feet
  oval(ctx, cx - 7, oy + 58, 6, 3, OL)
  oval(ctx, cx + 7, oy + 58, 6, 3, OL)
  oval(ctx, cx - 7, oy + 58, 5, 2.2, char.feet)
  oval(ctx, cx + 7, oy + 58, 5, 2.2, char.feet)
}

function drawSatchelFront(ctx, char, cx, y) {
  rrect(ctx, cx + 5, y + 36, 10, 8, 2, OL)
  rrect(ctx, cx + 5, y + 36, 10, 8, 2, char.satchel)
  rrect(ctx, cx + 6, y + 37,  8, 6, 1, char.satchD)
  // buckle
  circ(ctx, cx + 10, y + 38, 1.5, '#F0D840')
}

function drawSatchelBack(ctx, char, cx, y) {
  rrect(ctx, cx - 15, y + 36, 10, 8, 2, OL)
  rrect(ctx, cx - 15, y + 36, 10, 8, 2, char.satchel)
  rrect(ctx, cx - 14, y + 37,  8, 6, 1, char.satchD)
}

// ── Front view ─────────────────────────────────────────────────────────────────

function drawFront(ctx, char, cx, oy, opts) {
  const { bob = 0, legL = 0, legR = 0, mouthOpen = false, blinking = false } = opts
  const y = oy + bob

  drawShadow(ctx, cx, oy)

  // ── Body / cloak (bottom layer)
  ovalO(ctx, cx, y + 40, 13, 11, char.cloak)
  // Cloak highlight
  ctx.globalAlpha = 0.18
  oval(ctx, cx - 4, y + 33, 6, 5, '#FFFFFF')
  ctx.globalAlpha = 1.0

  // ── Scarf wrap
  ovalO(ctx, cx, y + 30, 14, 6, char.scarf)
  ctx.globalAlpha = 0.35
  oval(ctx, cx, y + 30, 12, 3.5, char.scarfD)  // fold line
  ctx.globalAlpha = 1.0

  // ── Head
  circO(ctx, cx, y + 17, 11, char.body)
  // Head highlight (watercolour top-left glow)
  ctx.globalAlpha = 0.22
  circ(ctx, cx - 4, y + 13, 5, '#FFFFFF')
  ctx.globalAlpha = 1.0

  // ── Beak
  ctx.fillStyle   = char.beakD
  ctx.strokeStyle = OL
  ctx.lineWidth   = 1
  ctx.beginPath()
  ctx.moveTo(cx - 3, y + 22)
  ctx.lineTo(cx + 3, y + 22)
  ctx.lineTo(cx + 1, y + 27)
  ctx.closePath()
  ctx.fill(); ctx.stroke()
  ctx.fillStyle = char.beak
  ctx.beginPath()
  ctx.moveTo(cx - 2.5, y + 22)
  ctx.lineTo(cx + 2.5, y + 22)
  ctx.lineTo(cx + 0.5, y + 26)
  ctx.closePath()
  ctx.fill()

  // ── Eyes
  if (!blinking) {
    circO(ctx, cx - 5, y + 16, 5.5, '#FFFFFF')
    circ(ctx,  cx - 5, y + 16, 3.5, char.eyes)
    circ(ctx,  cx - 4, y + 15,   1, '#FFFFFF')  // gleam
    circO(ctx, cx + 5, y + 16, 5.5, '#FFFFFF')
    circ(ctx,  cx + 5, y + 16, 3.5, char.eyes)
    circ(ctx,  cx + 6, y + 15,   1, '#FFFFFF')
  } else {
    ctx.strokeStyle = OL; ctx.lineWidth = 2; ctx.lineCap = 'round'
    ctx.beginPath(); ctx.moveTo(cx - 9, y + 16); ctx.lineTo(cx - 2, y + 16); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(cx + 2, y + 16); ctx.lineTo(cx + 9, y + 16); ctx.stroke()
  }

  // ── Cheek blush
  ctx.globalAlpha = 0.16
  oval(ctx, cx - 9, y + 19, 4.5, 2.5, '#FF8898')
  oval(ctx, cx + 9, y + 19, 4.5, 2.5, '#FF8898')
  ctx.globalAlpha = 1.0

  // ── Beak open (talk)
  if (mouthOpen) {
    ctx.fillStyle = '#301010'
    ctx.beginPath()
    ctx.ellipse(cx, y + 24, 3, 2, 0, 0, Math.PI)
    ctx.fill()
  }

  drawSatchelFront(ctx, char, cx, y)
  drawLegs(ctx, char, cx, oy, legL, legR)
  drawAccessory(ctx, char, cx, y, 'front')
}

// ── Side view ──────────────────────────────────────────────────────────────────

function drawSide(ctx, char, cx, oy, facingLeft, opts) {
  const { bob = 0, legL = 0, legR = 0 } = opts
  const dir = facingLeft ? -1 : 1
  const y   = oy + bob
  const hx  = cx + dir * 2  // head offset toward facing dir

  drawShadow(ctx, cx, oy)

  // ── Body
  ovalO(ctx, cx, y + 40, 12.5, 11, char.cloak)
  ctx.globalAlpha = 0.16
  oval(ctx, cx - dir * 3, y + 33, 5, 5, '#FFFFFF')
  ctx.globalAlpha = 1.0

  // ── Scarf
  ovalO(ctx, cx, y + 30, 13.5, 5.5, char.scarf)
  ctx.globalAlpha = 0.35
  oval(ctx, cx, y + 30, 11, 3, char.scarfD)
  ctx.globalAlpha = 1.0

  // ── Head (side)
  circO(ctx, hx, y + 17, 10.5, char.body)
  ctx.globalAlpha = 0.20
  circ(ctx, hx - dir * 3, y + 13, 4.5, '#FFFFFF')
  ctx.globalAlpha = 1.0

  // ── Beak (side profile — pointing forward)
  ctx.fillStyle   = char.beakD
  ctx.strokeStyle = OL; ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(hx + dir * 10, y + 18)  // tip
  ctx.lineTo(hx + dir *  2, y + 14)  // top base
  ctx.lineTo(hx + dir *  2, y + 22)  // bottom base
  ctx.closePath(); ctx.fill(); ctx.stroke()
  ctx.fillStyle = char.beak
  ctx.beginPath()
  ctx.moveTo(hx + dir *  9, y + 18)
  ctx.lineTo(hx + dir *  3, y + 15)
  ctx.lineTo(hx + dir *  3, y + 21)
  ctx.closePath(); ctx.fill()

  // ── Eye (single, near side)
  const ex = hx - dir * 3
  circO(ctx, ex, y + 16, 5.5, '#FFFFFF')
  circ(ctx,  ex, y + 16, 3.5, char.eyes)
  circ(ctx,  ex + dir * (-1), y + 15, 1, '#FFFFFF')

  // ── Satchel (on the trailing side)
  const sx = cx - dir * 8
  rrect(ctx, sx - 5, y + 35, 10, 8, 2, OL)
  rrect(ctx, sx - 5, y + 35, 10, 8, 2, char.satchel)
  rrect(ctx, sx - 4, y + 36,  8, 6, 1, char.satchD)

  // ── Legs (side walk — two visible, alternating)
  const lOff1 = legL, lOff2 = legR
  oval(ctx, cx - 5, oy + 51 + lOff1, 4.5, 5.5, OL)
  oval(ctx, cx + 5, oy + 51 + lOff2, 4.5, 5.5, OL)
  oval(ctx, cx - 5, oy + 51 + lOff1, 3.5, 4.5, char.legs)
  oval(ctx, cx + 5, oy + 51 + lOff2, 3.5, 4.5, char.legs)
  // Feet
  oval(ctx, cx - 7, oy + 58, 6, 3, OL)
  oval(ctx, cx + 5, oy + 58, 6, 3, OL)
  oval(ctx, cx - 7, oy + 58, 5, 2.2, char.feet)
  oval(ctx, cx + 5, oy + 58, 5, 2.2, char.feet)

  drawAccessory(ctx, char, hx, y, facingLeft ? 'left' : 'right')
}

// ── Back view ──────────────────────────────────────────────────────────────────

function drawBack(ctx, char, cx, oy, opts) {
  const { legL = 0, legR = 0 } = opts
  const y = oy

  drawShadow(ctx, cx, oy)

  ovalO(ctx, cx, y + 40, 13, 11, char.cloakD)
  ctx.globalAlpha = 0.12
  oval(ctx, cx + 4, y + 37, 5, 5, '#000000')
  ctx.globalAlpha = 1.0

  ovalO(ctx, cx, y + 30, 14, 6, char.scarfD)

  circO(ctx, cx, y + 17, 11, char.bodyD)
  ctx.globalAlpha = 0.12
  circ(ctx, cx + 4, y + 15, 5, '#000000')
  ctx.globalAlpha = 1.0

  drawSatchelBack(ctx, char, cx, y)
  drawLegs(ctx, char, cx, oy, legL, legR)
  drawAccessory(ctx, char, cx, y, 'back')
}

// ── Per-frame dispatch ─────────────────────────────────────────────────────────

function drawFrame(ctx, charId, animKey, frameIdx, ox, oy) {
  const char = CHARS[charId]
  if (!char) return

  const f  = frameIdx
  const cx = ox + 32

  switch (animKey) {

    case 'idle': {
      const bob = (f === 1 || f === 3) ? 1 : 0
      drawFront(ctx, char, cx, oy, { bob })
      break
    }

    case 'walk_down': {
      const [lL, lR] = WALK4[f] ?? [0, 0]
      drawFront(ctx, char, cx, oy, { legL: lL, legR: lR })
      break
    }

    case 'walk_up': {
      const [lL, lR] = WALK4[f] ?? [0, 0]
      drawBack(ctx, char, cx, oy, { legL: lL, legR: lR })
      break
    }

    case 'walk_left': {
      const [lL, lR] = WALK8[f] ?? [0, 0]
      const bob = Math.abs(lL) > 1 ? -1 : 0
      drawSide(ctx, char, cx, oy, true,  { bob, legL: lL, legR: lR })
      break
    }

    case 'walk_right': {
      const [lL, lR] = WALK8[f] ?? [0, 0]
      const bob = Math.abs(lL) > 1 ? -1 : 0
      drawSide(ctx, char, cx, oy, false, { bob, legL: lL, legR: lR })
      break
    }

    case 'talk': {
      const mouthOpen = f === 1 || f === 3
      const bob       = mouthOpen ? -1 : 0
      drawFront(ctx, char, cx, oy, { bob, mouthOpen })
      break
    }

    case 'blink': {
      drawFront(ctx, char, cx, oy, { blinking: f === 1 })
      break
    }
  }
}

// ── Public API ─────────────────────────────────────────────────────────────────

export function generateSpriteSheet(charId) {
  const canvas   = document.createElement('canvas')
  canvas.width   = FRAME * COLS   // 512
  canvas.height  = FRAME * ROWS   // 448
  const ctx      = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  for (const [animKey, meta] of Object.entries(ANIM_META)) {
    for (let f = 0; f < meta.frames; f++) {
      ctx.save()
      drawFrame(ctx, charId, animKey, f, f * FRAME, meta.row * FRAME)
      ctx.restore()
    }
  }

  return canvas.toDataURL('image/png')
}

// Bump to bust localStorage cache whenever drawing code changes.
const CACHE_VERSION = 'v4'

export function getCachedSprite(charId) {
  try { return localStorage.getItem(`haven_sprite_${CACHE_VERSION}_${charId}`) }
  catch { return null }
}

export function setCachedSprite(charId, dataUrl) {
  try { localStorage.setItem(`haven_sprite_${CACHE_VERSION}_${charId}`, dataUrl) }
  catch {}
}
