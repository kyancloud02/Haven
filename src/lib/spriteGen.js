/**
 * Procedural sprite sheet generator — Islets hand-drawn style.
 *
 * Each character is a tall rounded-rectangle bird/creature body with:
 *   • ONE large circular eye with white sclera + dark pupil
 *   • A prominent pointed beak on the side (bird-like silhouette)
 *   • A dark collar band separating the head from the outfit
 *   • Character-specific clothing that covers the lower body
 *   • Thin stick-like legs with flat feet
 *   • Thick 2px outlines everywhere (hand-drawn feel)
 *
 * Sheet: 512×448 px  (8 cols × 7 rows, 64×64 per frame)
 * Row 0  walk_down  (front, 4 frames)
 * Row 1  walk_left  (side,  8 frames)
 * Row 2  walk_right (side,  8 frames)
 * Row 3  walk_up    (back,  4 frames)
 * Row 4  idle       (front, 4 frames)
 * Row 5  talk       (front, 4 frames)
 * Row 6  blink      (front, 2 frames)
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

// ── Character definition schema ───────────────────────────────────────────────
export const STYLES = [
  'dress', 'armour', 'battle_robe', 'detective_coat', 'hooded_tunic', 'red_shirt',
]
export const SPECIALS = [
  'elf_ears', 'topknot', 'golden_headband', 'deerstalker', 'green_hood', 'bear_ears',
]

// ── Character registry ─────────────────────────────────────────────────────────
const CHARS = {
  elf_princess: {
    // Soft pale-blue creature, rose bell-dress, gold crown, pointed elf ears
    body:    '#C0B8E0', bodyD:  '#A098C8',   // pale lavender creature color
    beak:    '#6858A8', beakD:  '#504090',   // plum-toned beak
    eyes:    '#3020A8',
    outfit:  '#C85880', outfitD: '#A03860',  // rose-pink dress
    trim:    '#F0D840',
    collar:  '#8860B8',
    feet:    '#7050A8', feetD:  '#503888',
    special: 'elf_ears',
    style:   'dress',
  },
  warrior_mulan: {
    // Warm tan creature, red-gold armour, dark topknot
    body:    '#D8A870', bodyD:  '#B88048',
    beak:    '#3A2010', beakD:  '#201008',
    eyes:    '#180808',
    outfit:  '#C02828', outfitD: '#901818',
    trim:    '#F0C040',
    collar:  '#501808',
    feet:    '#3A1808', feetD:  '#201008',
    special: 'topknot',
    style:   'armour',
  },
  sun_wukong: {
    // Golden creature, orange battle-robe, gold headband
    body:    '#D8A840', bodyD:  '#B88020',
    beak:    '#6A3808', beakD:  '#3A2008',
    eyes:    '#281008',
    outfit:  '#C87020', outfitD: '#9A5010',
    trim:    '#F8E040',
    collar:  '#904010',
    feet:    '#7A4010', feetD:  '#502808',
    special: 'golden_headband',
    style:   'battle_robe',
  },
  sherlock_holmes: {
    // Slate-blue creature, dark detective coat, deerstalker cap
    body:    '#7888A0', bodyD:  '#586878',
    beak:    '#D0A870', beakD:  '#A88048',   // lighter cream beak (contrast)
    eyes:    '#181010',
    outfit:  '#3A4050', outfitD: '#262C38',
    trim:    '#A89858',
    collar:  '#282C38',
    feet:    '#202028', feetD:  '#141018',
    special: 'deerstalker',
    style:   'detective_coat',
  },
  robin_hood: {
    // Olive-green creature, forest hooded tunic, leather belt
    body:    '#7A9848', bodyD:  '#5A7830',
    beak:    '#604020', beakD:  '#3A2810',
    eyes:    '#141008',
    outfit:  '#4A6820', outfitD: '#305010',
    trim:    '#9A6030',
    collar:  '#385018',
    feet:    '#3A2010', feetD:  '#241408',
    special: 'green_hood',
    style:   'hooded_tunic',
  },
  winnie_the_pooh: {
    // Honey-yellow round bear, red crop-shirt, honey pot, bear ears
    body:    '#E8C850', bodyD:  '#C8A030',
    beak:    '#8A5820', beakD:  '#5A3810',   // brown snout/nose
    eyes:    '#180808',
    outfit:  '#C82020', outfitD: '#A01010',
    trim:    '#F0B030',
    collar:  '#A83020',
    feet:    '#8A5818', feetD:  '#5A3810',
    special: 'bear_ears',
    style:   'red_shirt',
    plump:   true,
  },
}

export function registerCharacter(id, def) {
  if (!STYLES.includes(def.style)) { def = { ...def, style: 'dress' } }
  if (def.special && !SPECIALS.includes(def.special)) { def = { ...def, special: null } }
  CHARS[id] = def
}

export function createCharDef(overrides = {}) {
  return {
    body: '#8898A8', bodyD: '#607080',
    beak: '#3A3020', beakD: '#201808',
    eyes: '#181010',
    outfit: '#4A5060', outfitD: '#303540',
    trim: '#C8A840', collar: '#303038',
    feet: '#282030', feetD: '#181020',
    special: null, style: 'dress', plump: false,
    ...overrides,
  }
}

// ── Walk cycle tables ──────────────────────────────────────────────────────────
const WALK8 = [[-3,2],[-2,3],[-1,2],[0,1],[3,-2],[2,-3],[1,-2],[0,-1]]
const WALK4 = [[-2,2],[0,3],[2,-2],[0,-3]]

// ── Canvas drawing helpers ─────────────────────────────────────────────────────

const OL = '#0C0808'  // thick warm-black outline (matches Islets look)

function circ(ctx, cx, cy, r, color) {
  ctx.fillStyle = color
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fill()
}
function oval(ctx, cx, cy, rx, ry, color) {
  ctx.fillStyle = color
  ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI*2); ctx.fill()
}
function rrect(ctx, x, y, w, h, r, color) {
  ctx.fillStyle = color; ctx.beginPath()
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h)
  ctx.fill()
}
function line(ctx, x1, y1, x2, y2, color, lw = 1) {
  ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke()
}
function rrectStroke(ctx, x, y, w, h, r, fill, sw = 2) {
  ctx.fillStyle = fill; ctx.strokeStyle = OL; ctx.lineWidth = sw
  ctx.beginPath()
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h)
  ctx.fill(); ctx.stroke()
}
function circStroke(ctx, cx, cy, r, fill, sw = 2) {
  ctx.fillStyle = fill; ctx.strokeStyle = OL; ctx.lineWidth = sw
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fill(); ctx.stroke()
}
function ovalStroke(ctx, cx, cy, rx, ry, fill, sw = 2) {
  ctx.fillStyle = fill; ctx.strokeStyle = OL; ctx.lineWidth = sw
  ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke()
}

// Large expressive eye: white sclera + dark pupil + gleam
function drawEye(ctx, cx, cy, r, pupilColor) {
  ctx.save()
  // White sclera
  ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = OL; ctx.lineWidth = 2
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fill(); ctx.stroke()
  // Dark pupil (slightly below centre)
  ctx.fillStyle = pupilColor
  ctx.beginPath(); ctx.arc(cx, cy + r * 0.15, r * 0.55, 0, Math.PI*2); ctx.fill()
  // Specular gleam
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.beginPath(); ctx.arc(cx - r*0.28, cy - r*0.28, r*0.20, 0, Math.PI*2); ctx.fill()
  ctx.restore()
}
function drawEyeBlink(ctx, cx, cy, r) {
  ctx.save()
  ctx.strokeStyle = OL; ctx.lineWidth = 2.2; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI * 1.12, Math.PI * 1.88); ctx.stroke()
  ctx.restore()
}

// ── Core creature body ─────────────────────────────────────────────────────────

// Draws the tall rounded-rectangle creature silhouette (head + torso merged)
function drawCreatureBody(ctx, char, cx, y) {
  const bw = char.plump ? 26 : 22
  const bh = 42
  const x  = cx - bw/2

  // Body fill + thick outline
  ctx.fillStyle   = char.body
  ctx.strokeStyle = OL; ctx.lineWidth = 2.2
  ctx.beginPath()
  if (ctx.roundRect) ctx.roundRect(x, y + 6, bw, bh, [10, 10, 5, 5])
  else ctx.rect(x, y + 6, bw, bh)
  ctx.fill(); ctx.stroke()

  // Subtle side-shadow on body (painterly depth)
  const grad = ctx.createLinearGradient(x, 0, x + bw, 0)
  grad.addColorStop(0,    'rgba(0,0,0,0.18)')
  grad.addColorStop(0.18, 'rgba(0,0,0,0)')
  grad.addColorStop(0.82, 'rgba(0,0,0,0)')
  grad.addColorStop(1,    'rgba(0,0,0,0.18)')
  ctx.fillStyle = grad
  ctx.beginPath()
  if (ctx.roundRect) ctx.roundRect(x, y + 6, bw, bh, [10, 10, 5, 5])
  else ctx.rect(x, y + 6, bw, bh)
  ctx.fill()

  // Soft top highlight
  ctx.globalAlpha = 0.14
  oval(ctx, cx, y + 12, bw * 0.35, 4, '#FFFFFF')
  ctx.globalAlpha = 1.0
}

// Prominent beak — side profile (dir: -1=left, 1=right) or front (dir:0)
function drawBeak(ctx, char, cx, y, dir, open) {
  ctx.strokeStyle = OL; ctx.lineWidth = 1.8

  if (dir === 0) {
    // Front-facing: short downward beak visible at bottom of head
    const by = y + 25
    ctx.fillStyle = char.beak
    ctx.beginPath()
    ctx.moveTo(cx - 5, by); ctx.lineTo(cx + 5, by); ctx.lineTo(cx, by + 8)
    ctx.closePath(); ctx.fill(); ctx.stroke()
    if (open) {
      ctx.fillStyle = '#301010'
      ctx.beginPath(); ctx.ellipse(cx, by + 4, 3, 2, 0, 0, Math.PI); ctx.fill()
    }
  } else {
    // Side profile: large triangular beak
    const faceX  = cx + dir * 11   // base of beak (edge of face)
    const tipX   = cx + dir * 25   // tip of beak
    const midY   = y + 18          // vertical midline
    const topY   = midY - 6
    const botY   = open ? midY + 10 : midY + 6

    // Lower jaw (if open, drops down)
    if (open) {
      ctx.fillStyle = char.bodyD
      ctx.beginPath()
      ctx.moveTo(faceX, midY + 4)
      ctx.lineTo(tipX - dir*6, midY + 7)
      ctx.lineTo(faceX, botY)
      ctx.closePath(); ctx.fill(); ctx.stroke()
    }

    // Upper beak
    ctx.fillStyle = char.beak
    ctx.beginPath()
    ctx.moveTo(faceX, topY)
    ctx.lineTo(tipX, midY - (open ? 3 : 0))
    ctx.lineTo(faceX, midY + (open ? 2 : 4))
    ctx.closePath(); ctx.fill(); ctx.stroke()

    // Upper beak highlight edge
    ctx.globalAlpha = 0.22; ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 0.8
    ctx.beginPath(); ctx.moveTo(faceX, topY + 1); ctx.lineTo(tipX - dir*3, midY - (open?4:1)); ctx.stroke()
    ctx.globalAlpha = 1.0; ctx.strokeStyle = OL
  }
}

// Dark collar band (neck marker between head and outfit)
function drawCollar(ctx, char, cx, y) {
  const cw = char.plump ? 27 : 23
  rrectStroke(ctx, cx - cw/2, y + 26, cw, 5, 2, char.collar, 1.5)
}

// ── Outfit drawing (covers body from collar down) ──────────────────────────────

function drawOutfitFront(ctx, char, cx, y) {
  switch (char.style) {

    case 'dress': {
      // Bell-shaped flared skirt
      ctx.fillStyle = char.outfit; ctx.strokeStyle = OL; ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(cx - 10, y + 30)
      ctx.lineTo(cx + 10, y + 30)
      ctx.lineTo(cx + 16, y + 52)
      ctx.lineTo(cx - 16, y + 52)
      ctx.closePath(); ctx.fill(); ctx.stroke()
      // Fold shading
      ctx.globalAlpha = 0.22
      ctx.fillStyle = char.outfitD
      ctx.beginPath(); ctx.moveTo(cx-16,y+52); ctx.lineTo(cx-9,y+34); ctx.lineTo(cx-6,y+52); ctx.closePath(); ctx.fill()
      ctx.beginPath(); ctx.moveTo(cx+6,y+52);  ctx.lineTo(cx+9,y+34); ctx.lineTo(cx+16,y+52); ctx.closePath(); ctx.fill()
      ctx.globalAlpha = 1.0
      // Gold waist trim
      rrectStroke(ctx, cx - 10, y + 30, 20, 3, 1, char.trim, 1)
      // Bodice gem
      circStroke(ctx, cx, y + 36, 2.5, char.trim, 1)
      break
    }

    case 'armour': {
      // Red chest-plate, lower skirt
      rrectStroke(ctx, cx - 12, y + 30, 24, 18, 3, char.outfit)
      // Gold trim lines
      line(ctx, cx-11, y+33, cx+11, y+33, char.trim, 1.5)
      line(ctx, cx-11, y+40, cx+11, y+40, char.trim, 1.5)
      // Centre seam
      line(ctx, cx, y+31, cx, y+47, char.outfitD, 1)
      // Pauldrons
      ovalStroke(ctx, cx-14, y+32, 5.5, 3.5, char.outfit)
      ovalStroke(ctx, cx+14, y+32, 5.5, 3.5, char.outfit)
      // Lower skirting
      rrectStroke(ctx, cx-11, y+47, 22, 6, 2, char.outfitD, 1.5)
      // Plate highlight
      ctx.globalAlpha = 0.15; oval(ctx, cx-3, y+32, 4, 6, '#FFFFFF'); ctx.globalAlpha = 1.0
      break
    }

    case 'battle_robe': {
      // Round flowing robe
      ctx.fillStyle = char.outfit; ctx.strokeStyle = OL; ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(cx-10, y+30); ctx.lineTo(cx+10, y+30)
      ctx.quadraticCurveTo(cx+15, y+42, cx+13, y+52)
      ctx.lineTo(cx-13, y+52)
      ctx.quadraticCurveTo(cx-15, y+42, cx-10, y+30)
      ctx.closePath(); ctx.fill(); ctx.stroke()
      // Gold sash
      rrectStroke(ctx, cx-13, y+40, 26, 5, 2, char.trim, 1.5)
      // Fold shadows
      ctx.globalAlpha = 0.20; ctx.fillStyle = char.outfitD
      ctx.beginPath(); ctx.moveTo(cx-13,y+42); ctx.lineTo(cx-8,y+30); ctx.lineTo(cx-5,y+52); ctx.closePath(); ctx.fill()
      ctx.beginPath(); ctx.moveTo(cx+13,y+42); ctx.lineTo(cx+8,y+30); ctx.lineTo(cx+5,y+52); ctx.closePath(); ctx.fill()
      ctx.globalAlpha = 1.0
      break
    }

    case 'detective_coat': {
      // Charcoal coat with lapels + waistcoat strip
      rrectStroke(ctx, cx-12, y+30, 24, 24, 2, char.outfit)
      // Lapels
      ctx.fillStyle = '#505060'
      ctx.beginPath(); ctx.moveTo(cx,y+30); ctx.lineTo(cx-9,y+42); ctx.lineTo(cx,y+42); ctx.closePath(); ctx.fill()
      ctx.beginPath(); ctx.moveTo(cx,y+30); ctx.lineTo(cx+9,y+42); ctx.lineTo(cx,y+42); ctx.closePath(); ctx.fill()
      // Waistcoat strip
      ctx.fillStyle = '#706848'
      ctx.beginPath(); ctx.rect(cx-3, y+30, 6, 22); ctx.fill()
      // Buttons
      for (let i=0; i<3; i++) circStroke(ctx, cx, y+33+i*6, 1.2, char.trim, 1)
      break
    }

    case 'hooded_tunic': {
      // Green tunic + belt + hood drape
      rrectStroke(ctx, cx-11, y+30, 22, 24, 2, char.outfit)
      rrectStroke(ctx, cx-12, y+41, 24, 5, 2, char.trim, 1.5)
      // Buckle
      rrectStroke(ctx, cx-2.5, y+40, 5, 7, 1, '#D8C060', 1)
      // Hood side drapes
      ctx.fillStyle = char.outfitD; ctx.strokeStyle = OL; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(cx-11,y+30); ctx.lineTo(cx-16,y+30); ctx.lineTo(cx-14,y+50); ctx.lineTo(cx-11,y+50); ctx.closePath(); ctx.fill(); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(cx+11,y+30); ctx.lineTo(cx+16,y+30); ctx.lineTo(cx+14,y+50); ctx.lineTo(cx+11,y+50); ctx.closePath(); ctx.fill(); ctx.stroke()
      break
    }

    case 'red_shirt': {
      // Short red shirt, honey belly shows below
      oval(ctx, cx, y+46, char.plump ? 14 : 11, 7, char.bodyD)
      rrectStroke(ctx, cx-12, y+30, 24, 14, [2,2,0,0], char.outfit)
      line(ctx, cx-12, y+44, cx+12, y+44, OL, 1.8)
      rrectStroke(ctx, cx-12, y+44, 24, 9, [0,0,4,4], char.body, 1.8)
      break
    }
  }
}

function drawOutfitSide(ctx, char, cx, y, dir) {
  switch (char.style) {
    case 'dress': {
      ctx.fillStyle = char.outfit; ctx.strokeStyle = OL; ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(cx-9, y+30); ctx.lineTo(cx+9, y+30)
      ctx.lineTo(cx + dir*14, y+52); ctx.lineTo(cx - dir*6, y+52)
      ctx.closePath(); ctx.fill(); ctx.stroke()
      rrectStroke(ctx, cx-9, y+30, 18, 3, 1, char.trim, 1)
      circStroke(ctx, cx + dir*2, y+36, 2.5, char.trim, 1)
      break
    }
    case 'armour': {
      rrectStroke(ctx, cx-11, y+30, 22, 18, 3, char.outfit)
      line(ctx, cx-10, y+33, cx+10, y+33, char.trim, 1.5)
      line(ctx, cx-10, y+40, cx+10, y+40, char.trim, 1.5)
      ovalStroke(ctx, cx + dir*13, y+32, 5, 3.5, char.outfit)
      rrectStroke(ctx, cx-10, y+47, 20, 6, 2, char.outfitD, 1.5)
      break
    }
    case 'battle_robe': {
      ctx.fillStyle = char.outfit; ctx.strokeStyle = OL; ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(cx-9, y+30); ctx.lineTo(cx+9, y+30)
      ctx.quadraticCurveTo(cx + dir*14, y+42, cx + dir*12, y+52)
      ctx.lineTo(cx - dir*4, y+52)
      ctx.quadraticCurveTo(cx - dir*6, y+40, cx-9, y+30)
      ctx.closePath(); ctx.fill(); ctx.stroke()
      rrectStroke(ctx, cx-12, y+40, 24, 5, 2, char.trim, 1.5)
      break
    }
    case 'detective_coat': {
      rrectStroke(ctx, cx-11, y+30, 22, 24, 2, char.outfit)
      ctx.fillStyle = '#706848'; ctx.beginPath(); ctx.rect(cx + dir*2 - 2, y+30, 5, 22); ctx.fill()
      for (let i=0; i<3; i++) circStroke(ctx, cx + dir*2, y+33+i*6, 1.2, char.trim, 1)
      break
    }
    case 'hooded_tunic': {
      rrectStroke(ctx, cx-10, y+30, 20, 24, 2, char.outfit)
      rrectStroke(ctx, cx-11, y+41, 22, 5, 2, char.trim, 1.5)
      // Hood drape on the back side
      ctx.fillStyle = char.outfitD; ctx.strokeStyle = OL; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(cx - dir*10, y+30); ctx.lineTo(cx - dir*16, y+30); ctx.lineTo(cx - dir*13, y+50); ctx.lineTo(cx - dir*10, y+50); ctx.closePath(); ctx.fill(); ctx.stroke()
      break
    }
    case 'red_shirt': {
      oval(ctx, cx, y+46, char.plump ? 13 : 10, 7, char.bodyD)
      rrectStroke(ctx, cx-11, y+30, 22, 14, [2,2,0,0], char.outfit)
      line(ctx, cx-11, y+44, cx+11, y+44, OL, 1.8)
      rrectStroke(ctx, cx-11, y+44, 22, 9, [0,0,4,4], char.body, 1.8)
      break
    }
  }
}

function drawOutfitBack(ctx, char, cx, y) {
  switch (char.style) {
    case 'dress': {
      ctx.fillStyle = char.outfitD; ctx.strokeStyle = OL; ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(cx-10,y+30); ctx.lineTo(cx+10,y+30); ctx.lineTo(cx+15,y+52); ctx.lineTo(cx-15,y+52); ctx.closePath(); ctx.fill(); ctx.stroke()
      break
    }
    case 'armour': {
      rrectStroke(ctx, cx-11, y+30, 22, 20, 3, char.outfitD)
      line(ctx, cx-10, y+33, cx+10, y+33, char.trim, 1)
      rrectStroke(ctx, cx-10, y+49, 20, 5, 2, char.outfitD, 1.5)
      break
    }
    case 'battle_robe': {
      ctx.fillStyle = char.outfitD; ctx.strokeStyle = OL; ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(cx-10,y+30); ctx.lineTo(cx+10,y+30); ctx.quadraticCurveTo(cx+14,y+42,cx+12,y+52); ctx.lineTo(cx-12,y+52); ctx.quadraticCurveTo(cx-14,y+42,cx-10,y+30); ctx.closePath(); ctx.fill(); ctx.stroke()
      break
    }
    case 'detective_coat': {
      rrectStroke(ctx, cx-11, y+30, 22, 24, 2, char.outfitD)
      line(ctx, cx, y+38, cx, y+53, char.outfit, 1)
      break
    }
    case 'hooded_tunic': {
      rrectStroke(ctx, cx-11, y+30, 22, 24, 2, char.outfitD)
      // Back of hood: triangle draping down
      ctx.fillStyle = char.outfit; ctx.strokeStyle = OL; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(cx-10,y+29); ctx.lineTo(cx+10,y+29); ctx.lineTo(cx+6,y+52); ctx.lineTo(cx-6,y+52); ctx.closePath(); ctx.fill(); ctx.stroke()
      // Quiver strapped to back
      rrectStroke(ctx, cx+8, y+24, 7, 22, 2, '#9A6030', 1.5)
      circStroke(ctx, cx+11, y+23, 2.5, '#D8C060', 1)
      break
    }
    case 'red_shirt': {
      rrectStroke(ctx, cx-11, y+30, 22, 12, [2,2,0,0], char.outfitD)
      rrectStroke(ctx, cx-11, y+42, 22, 11, [0,0,4,4], char.body, 1.8)
      break
    }
  }
}

// ── Head accessories ───────────────────────────────────────────────────────────

function drawAccessory(ctx, char, cx, y, view) {
  const isSide = view === 'left' || view === 'right'
  const dir    = view === 'right' ? 1 : -1

  switch (char.special) {

    case 'elf_ears': {
      if (view === 'back') break
      // Pointed ears on sides of head
      const earColor = '#D898C8'
      if (!isSide) {
        ctx.fillStyle = earColor; ctx.strokeStyle = OL; ctx.lineWidth = 1.5
        ctx.beginPath(); ctx.moveTo(cx-11,y+10); ctx.lineTo(cx-16,y+2); ctx.lineTo(cx-8,y+8); ctx.closePath(); ctx.fill(); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(cx+11,y+10); ctx.lineTo(cx+16,y+2); ctx.lineTo(cx+8,y+8); ctx.closePath(); ctx.fill(); ctx.stroke()
        // Gold crown band
        rrectStroke(ctx, cx-11, y+6, 22, 4, 2, char.trim, 1.5)
        circStroke(ctx, cx, y+8, 2.5, '#FF4068', 1)
      } else {
        // One far ear + crown band
        const ex = cx - dir * 11
        ctx.fillStyle = earColor; ctx.strokeStyle = OL; ctx.lineWidth = 1.5
        ctx.beginPath(); ctx.moveTo(ex,y+10); ctx.lineTo(ex - dir*6,y+2); ctx.lineTo(ex + dir*3,y+8); ctx.closePath(); ctx.fill(); ctx.stroke()
        rrectStroke(ctx, cx - dir*10, y+6, 18, 4, 2, char.trim, 1.5)
      }
      break
    }

    case 'topknot': {
      if (view === 'back') break
      const tx = isSide ? cx - dir : cx
      circStroke(ctx, tx, y+4, 5.5, '#1A0808')
      circ(ctx, tx, y+4, 3.5, '#2A1010')
      circ(ctx, tx+1, y+3, 1, 'rgba(255,255,255,0.2)')
      line(ctx, tx-5, y+6, tx+5, y+3, char.trim, 1.2)
      break
    }

    case 'golden_headband': {
      if (view === 'back') break
      const bw = isSide ? 18 : 22
      const bx = isSide ? cx + dir*2 : cx
      rrectStroke(ctx, bx - bw/2, y+9, bw, 5, 2, char.trim, 1.5)
      if (!isSide) {
        circStroke(ctx, cx, y+11, 3, '#FF4828', 1)
        circStroke(ctx, cx-6, y+11, 1.5, '#F8E040', 1)
        circStroke(ctx, cx+6, y+11, 1.5, '#F8E040', 1)
      }
      break
    }

    case 'deerstalker': {
      // Flat cap with front + back peaks
      rrectStroke(ctx, cx - (isSide?10:13), y+4, isSide?20:26, 7, 3, '#5A6860')
      if (!isSide) {
        // Front and back brims
        ctx.fillStyle = '#5A6860'; ctx.strokeStyle = OL; ctx.lineWidth = 1.5
        ctx.beginPath(); ctx.ellipse(cx+14, y+8, 5, 2.5, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke()
        ctx.beginPath(); ctx.ellipse(cx-14, y+8, 5, 2.5, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke()
        // Check texture hint
        ctx.globalAlpha = 0.18
        for (let i=-2; i<=2; i++) line(ctx, cx-11+i*6, y+5, cx-11+i*6, y+10, '#000', 0.8)
        ctx.globalAlpha = 1.0
      } else {
        ctx.fillStyle = '#5A6860'; ctx.strokeStyle = OL; ctx.lineWidth = 1.5
        ctx.beginPath(); ctx.ellipse(cx + dir*12, y+8, 5, 2.5, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke()
      }
      break
    }

    case 'green_hood': {
      if (view === 'back') break
      // Pointed hood silhouette above body
      ctx.fillStyle = char.outfit; ctx.strokeStyle = OL; ctx.lineWidth = 2
      if (!isSide) {
        ctx.beginPath(); ctx.moveTo(cx,y+0); ctx.lineTo(cx-12,y+10); ctx.lineTo(cx+12,y+10); ctx.closePath(); ctx.fill(); ctx.stroke()
        // Hood inner rim
        ctx.fillStyle = char.outfitD
        ctx.beginPath(); ctx.moveTo(cx-12,y+10); ctx.lineTo(cx-8,y+14); ctx.lineTo(cx+8,y+14); ctx.lineTo(cx+12,y+10); ctx.closePath(); ctx.fill()
      } else {
        const tip = cx - dir * 2
        ctx.beginPath(); ctx.moveTo(tip,y+0); ctx.lineTo(tip-dir*13,y+10); ctx.lineTo(tip+dir*5,y+10); ctx.closePath(); ctx.fill(); ctx.stroke()
      }
      break
    }

    case 'bear_ears': {
      if (view === 'back') break
      const r = 6
      if (!isSide) {
        circStroke(ctx, cx-10, y+6, r, char.body)
        circStroke(ctx, cx+10, y+6, r, char.body)
        circ(ctx, cx-10, y+6, r-2, '#F0A898')
        circ(ctx, cx+10, y+6, r-2, '#F0A898')
      } else {
        circStroke(ctx, cx + dir*10, y+6, r, char.body)
        circ(ctx, cx + dir*10, y+6, r-2, '#F0A898')
      }
      break
    }
  }
}

// ── Ground shadow ──────────────────────────────────────────────────────────────
function drawShadow(ctx, cx, oy) {
  ctx.globalAlpha = 0.12
  oval(ctx, cx, oy+62, 14, 3.5, '#000000')
  ctx.globalAlpha = 1.0
}

// ── Legs & feet ────────────────────────────────────────────────────────────────
function drawLegs(ctx, char, cx, oy, lL, lR) {
  const lx  = cx - 5, rx = cx + 5
  const legW = 4

  ctx.strokeStyle = OL; ctx.lineWidth = 1.4

  // Left leg
  ctx.fillStyle = char.feetD
  ctx.beginPath(); ctx.rect(lx - legW/2, oy + 50 + lL, legW, 11); ctx.fill(); ctx.stroke()
  // Right leg
  ctx.beginPath(); ctx.rect(rx - legW/2, oy + 50 + lR, legW, 11); ctx.fill(); ctx.stroke()

  // Feet — flat rounded shoes
  ctx.fillStyle = char.feet
  ctx.beginPath(); ctx.ellipse(lx - 1, oy + 61, 6, 2.5, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke()
  ctx.beginPath(); ctx.ellipse(rx + 1, oy + 61, 6, 2.5, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke()
}

// ── Satchel ────────────────────────────────────────────────────────────────────
function drawSatchel(ctx, char, cx, y, view) {
  const isSide = view === 'left' || view === 'right'
  const dir    = view === 'right' ? 1 : -1
  const sx     = isSide ? cx - dir * 9 : cx + 7
  const sy     = y + 36

  if (char.style === 'red_shirt') {
    // Honey pot
    rrectStroke(ctx, sx-4, sy, 9, 9, 2, '#E8C040', 1.5)
    rrectStroke(ctx, sx-3, sy-3, 7, 3, 1, '#C8A020', 1)
    ctx.globalAlpha = 0.55; circStroke(ctx, sx+3, sy+10, 1.8, '#F0D040', 0.8); ctx.globalAlpha = 1.0
  } else if (char.style === 'detective_coat') {
    // Magnifying glass
    circStroke(ctx, sx+2, sy+3, 5, 'rgba(160,210,230,0.55)', 1.5)
    line(ctx, sx+6, sy+7, sx+10, sy+11, OL, 2)
  } else {
    rrectStroke(ctx, sx-4, sy, 9, 8, 2, '#B89858', 1.5)
    rrectStroke(ctx, sx-3, sy+1, 7, 6, 1, '#9A7838', 1)
    circStroke(ctx, sx+1, sy+1, 1.5, '#F0D860', 0.8)
  }
}

// ── Full front-facing frame ────────────────────────────────────────────────────
function drawFront(ctx, char, cx, oy, opts = {}) {
  const { bob = 0, legL = 0, legR = 0, mouthOpen = false, blinking = false } = opts
  const y = oy + bob

  drawShadow(ctx, cx, oy)
  drawLegs(ctx, char, cx, oy, legL, legR)
  drawCreatureBody(ctx, char, cx, y)
  drawOutfitFront(ctx, char, cx, y)
  drawCollar(ctx, char, cx, y)
  // Front view: slight 3/4 angle — beak tilts left, eye slightly right
  drawBeak(ctx, char, cx - 2, y, 0, mouthOpen)
  drawEye(ctx, cx + 3, y + 14, 5.5, char.eyes)   // single eye, slightly right of centre
  // Cheek blush
  ctx.globalAlpha = 0.16; oval(ctx, cx + 9, y + 20, 4, 2.5, '#FF8898'); ctx.globalAlpha = 1.0
  drawSatchel(ctx, char, cx, y, 'front')
  drawAccessory(ctx, char, cx, y, 'front')
}

// ── Full side-facing frame ─────────────────────────────────────────────────────
function drawSide(ctx, char, cx, oy, facingLeft, opts = {}) {
  const { bob = 0, legL = 0, legR = 0 } = opts
  const dir = facingLeft ? -1 : 1
  const y   = oy + bob

  drawShadow(ctx, cx, oy)
  drawLegs(ctx, char, cx, oy, legL, legR)
  drawCreatureBody(ctx, char, cx, y)
  drawOutfitSide(ctx, char, cx, y, dir)
  drawCollar(ctx, char, cx, y)
  drawBeak(ctx, char, cx, y, dir, false)
  // Eye positioned on the face side (slightly behind beak, upper body)
  drawEye(ctx, cx - dir * 4, y + 14, 5.5, char.eyes)
  // Cheek blush on face side
  ctx.globalAlpha = 0.16; oval(ctx, cx - dir * 8, y + 20, 3.5, 2, '#FF8898'); ctx.globalAlpha = 1.0
  drawSatchel(ctx, char, cx, y, facingLeft ? 'left' : 'right')
  drawAccessory(ctx, char, cx, y, facingLeft ? 'left' : 'right')
}

// ── Full back-facing frame ─────────────────────────────────────────────────────
function drawBack(ctx, char, cx, oy, opts = {}) {
  const { legL = 0, legR = 0 } = opts
  const y = oy

  drawShadow(ctx, cx, oy)
  drawLegs(ctx, char, cx, oy, legL, legR)
  drawCreatureBody(ctx, char, cx, y)
  drawOutfitBack(ctx, char, cx, y)
  drawCollar(ctx, char, cx, y)
  drawAccessory(ctx, char, cx, y, 'back')
}

// ── Per-frame dispatch ─────────────────────────────────────────────────────────
function drawFrame(ctx, charId, animKey, frameIdx, ox, oy) {
  const char = CHARS[charId]
  if (!char) return
  const cx = ox + 32
  const f  = frameIdx

  switch (animKey) {
    case 'idle':
      drawFront(ctx, char, cx, oy, { bob: (f===1||f===3) ? 1 : 0 })
      break
    case 'walk_down': {
      const [lL, lR] = WALK4[f] ?? [0,0]
      drawFront(ctx, char, cx, oy, { legL: lL, legR: lR })
      break
    }
    case 'walk_up': {
      const [lL, lR] = WALK4[f] ?? [0,0]
      drawBack(ctx, char, cx, oy, { legL: lL, legR: lR })
      break
    }
    case 'walk_left': {
      const [lL, lR] = WALK8[f] ?? [0,0]
      drawSide(ctx, char, cx, oy, true,  { bob: Math.abs(lL)>1?-1:0, legL: lL, legR: lR })
      break
    }
    case 'walk_right': {
      const [lL, lR] = WALK8[f] ?? [0,0]
      drawSide(ctx, char, cx, oy, false, { bob: Math.abs(lL)>1?-1:0, legL: lL, legR: lR })
      break
    }
    case 'talk':
      drawFront(ctx, char, cx, oy, { mouthOpen: f===1||f===3, bob: (f===1||f===3)?-1:0 })
      break
    case 'blink':
      drawFront(ctx, char, cx, oy, { blinking: f===1 })
      break
  }
}

// ── Public API ─────────────────────────────────────────────────────────────────
export function generateSpriteSheet(charId) {
  const canvas  = document.createElement('canvas')
  canvas.width  = FRAME * COLS
  canvas.height = FRAME * ROWS
  const ctx     = canvas.getContext('2d')
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

const CACHE_VERSION = 'v7'

export function getCachedSprite(charId) {
  try { return localStorage.getItem(`haven_sprite_${CACHE_VERSION}_${charId}`) }
  catch { return null }
}
export function setCachedSprite(charId, dataUrl) {
  try { localStorage.setItem(`haven_sprite_${CACHE_VERSION}_${charId}`, dataUrl) }
  catch {}
}
