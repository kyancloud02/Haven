/**
 * Procedural sprite sheet generator — Islets hand-drawn style (v8).
 *
 * Each character has a tall rounded-rectangle body with:
 *   • Character-appropriate facial feature (nose / snout / beak by faceType)
 *   • TWO eyes in front view, ONE eye in side profile
 *   • Expressive eyebrows (browStyle: neutral | furrowed | raised)
 *   • Dark collar band
 *   • Character-specific clothing
 *   • Thin stick legs (no foot circles)
 *
 * Sheet: 512×448 px  (8 cols × 7 rows, 64×64 per frame)
 * Row 0  walk_down  (front, 4 frames)
 * Row 1  walk_left  (side,  8 frames)
 * Row 2  walk_right (side,  8 frames)
 * Row 3  walk_up    (back,  4 frames)
 * Row 4  idle       (front, 4 frames)
 * Row 5  talk       (front, 4 frames)
 * Row 6  blink      (front, 2 frames)
 *
 * faceType values:
 *   'beak'          — bird-style triangular beak
 *   'human_nose'    — small oval/dot nose
 *   'elf_nose'      — tiny upturned pink dot
 *   'aquiline_nose' — prominent hooked nose (Sherlock profile)
 *   'monkey_snout'  — round muzzle with visible nostrils
 *   'bear_snout'    — large honey-colored muzzle + bear nose mark
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
    // Pale lavender elf with rose dress and gold crown
    body:      '#C0B8E0', bodyD:    '#A098C8',
    eyes:      '#3020A8',
    outfit:    '#C85880', outfitD:  '#A03860',
    trim:      '#F0D840',
    collar:    '#8860B8',
    feet:      '#7050A8', feetD:    '#503888',
    faceType:  'elf_nose',
    noseColor: '#E0A8C8',
    browStyle: 'neutral',
    special:   'elf_ears',
    style:     'dress',
  },
  warrior_mulan: {
    // Warm tan warrior, red-gold armour, dark topknot
    body:      '#D8A870', bodyD:    '#B88048',
    eyes:      '#180808',
    outfit:    '#C02828', outfitD:  '#901818',
    trim:      '#F0C040',
    collar:    '#501808',
    feet:      '#3A1808', feetD:    '#201008',
    faceType:  'human_nose',
    noseColor: '#A07050',
    browStyle: 'furrowed',
    special:   'topknot',
    style:     'armour',
  },
  sun_wukong: {
    // Golden monkey king, orange battle-robe, golden headband
    body:      '#D8A840', bodyD:    '#B88020',
    eyes:      '#281008',
    outfit:    '#C87020', outfitD:  '#9A5010',
    trim:      '#F8E040',
    collar:    '#904010',
    feet:      '#7A4010', feetD:    '#502808',
    faceType:  'monkey_snout',
    snoutColor:'#E8C878',
    browStyle: 'raised',
    special:   'golden_headband',
    style:     'battle_robe',
  },
  sherlock_holmes: {
    // Slate-blue detective, charcoal coat, deerstalker cap
    body:      '#7888A0', bodyD:    '#586878',
    eyes:      '#181010',
    outfit:    '#3A4050', outfitD:  '#262C38',
    trim:      '#A89858',
    collar:    '#282C38',
    feet:      '#202028', feetD:    '#141018',
    faceType:  'aquiline_nose',
    noseColor: '#8A7868',
    browStyle: 'furrowed',
    special:   'deerstalker',
    style:     'detective_coat',
  },
  robin_hood: {
    // Forest-green hero, hooded tunic, quiver
    body:      '#7A9848', bodyD:    '#5A7830',
    eyes:      '#141008',
    outfit:    '#4A6820', outfitD:  '#305010',
    trim:      '#9A6030',
    collar:    '#385018',
    feet:      '#3A2010', feetD:    '#241408',
    faceType:  'human_nose',
    noseColor: '#628038',
    browStyle: 'neutral',
    special:   'green_hood',
    style:     'hooded_tunic',
  },
  winnie_the_pooh: {
    // Honey-yellow bear, red crop-shirt, honey pot
    body:      '#E8C850', bodyD:    '#C8A030',
    eyes:      '#180808',
    outfit:    '#C82020', outfitD:  '#A01010',
    trim:      '#F0B030',
    collar:    '#A83020',
    feet:      '#8A5818', feetD:    '#5A3810',
    faceType:  'bear_snout',
    snoutColor:'#F0D888',
    browStyle: 'neutral',
    special:   'bear_ears',
    style:     'red_shirt',
    plump:     true,
  },
}

export function registerCharacter(id, def) {
  if (!STYLES.includes(def.style))             { def = { ...def, style: 'dress' } }
  if (def.special && !SPECIALS.includes(def.special)) { def = { ...def, special: null } }
  CHARS[id] = def
}

export function createCharDef(overrides = {}) {
  return {
    body: '#8898A8', bodyD: '#607080',
    eyes: '#181010',
    outfit: '#4A5060', outfitD: '#303540',
    trim: '#C8A840', collar: '#303038',
    feet: '#282030', feetD: '#181020',
    faceType: 'human_nose', noseColor: '#C09080',
    browStyle: 'neutral',
    special: null, style: 'dress', plump: false,
    ...overrides,
  }
}

// ── Walk cycle tables ──────────────────────────────────────────────────────────
const WALK8 = [[-3,2],[-2,3],[-1,2],[0,1],[3,-2],[2,-3],[1,-2],[0,-1]]
const WALK4 = [[-2,2],[0,3],[2,-2],[0,-3]]

// ── Canvas drawing helpers ─────────────────────────────────────────────────────

const OL = '#0C0808'  // warm-black outline

function circ(ctx, cx, cy, r, color) {
  ctx.fillStyle = color
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fill()
}
function oval(ctx, cx, cy, rx, ry, color) {
  ctx.fillStyle = color
  ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI*2); ctx.fill()
}
// Cross-platform roundRect path (node-canvas may not have roundRect)
function rrPath(ctx, x, y, w, h, r) {
  if (ctx.roundRect) { ctx.roundRect(x, y, w, h, r); return }
  const radii = Array.isArray(r) ? r : [r, r, r, r]
  const [tl, tr, br, bl] = radii.map(v => Math.min(v, w/2, h/2))
  ctx.moveTo(x + tl, y)
  ctx.lineTo(x + w - tr, y);  ctx.arcTo(x+w, y,   x+w, y+tr,   tr)
  ctx.lineTo(x + w, y + h - br); ctx.arcTo(x+w, y+h, x+w-br, y+h, br)
  ctx.lineTo(x + bl, y + h); ctx.arcTo(x, y+h,  x,   y+h-bl, bl)
  ctx.lineTo(x, y + tl);  ctx.arcTo(x, y,    x+tl, y,     tl)
  ctx.closePath()
}
function rrect(ctx, x, y, w, h, r, color) {
  ctx.fillStyle = color; ctx.beginPath(); rrPath(ctx, x, y, w, h, r); ctx.fill()
}
function line(ctx, x1, y1, x2, y2, color, lw = 1) {
  ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke()
}
function rrectStroke(ctx, x, y, w, h, r, fill, sw = 2) {
  ctx.fillStyle = fill; ctx.strokeStyle = OL; ctx.lineWidth = sw
  ctx.beginPath(); rrPath(ctx, x, y, w, h, r); ctx.fill(); ctx.stroke()
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
  ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = OL; ctx.lineWidth = 1.8
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fill(); ctx.stroke()
  ctx.fillStyle = pupilColor
  ctx.beginPath(); ctx.arc(cx, cy + r * 0.15, r * 0.55, 0, Math.PI*2); ctx.fill()
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

// ── Eyebrows ───────────────────────────────────────────────────────────────────
// dir: 0=front, -1=facing left, 1=facing right
function drawEyebrows(ctx, char, cx, y, dir) {
  const brow = char.browStyle || 'neutral'
  ctx.save()
  ctx.strokeStyle = char.bodyD; ctx.lineWidth = 1.5; ctx.lineCap = 'round'

  if (dir === 0) {
    // Two eyebrows above left eye (cx-6) and right eye (cx+6)
    const by = y + 9
    ctx.beginPath()
    if (brow === 'furrowed') {
      // Inner ends lower (serious/determined)
      ctx.moveTo(cx - 11, by - 1); ctx.lineTo(cx - 2, by + 2)
    } else if (brow === 'raised') {
      ctx.moveTo(cx - 11, by + 1); ctx.quadraticCurveTo(cx - 6, by - 3, cx - 2, by)
    } else {
      ctx.moveTo(cx - 11, by); ctx.lineTo(cx - 2, by - 1)
    }
    ctx.stroke()
    ctx.beginPath()
    if (brow === 'furrowed') {
      ctx.moveTo(cx + 2, by + 2); ctx.lineTo(cx + 11, by - 1)
    } else if (brow === 'raised') {
      ctx.moveTo(cx + 2, by); ctx.quadraticCurveTo(cx + 6, by - 3, cx + 11, by + 1)
    } else {
      ctx.moveTo(cx + 2, by - 1); ctx.lineTo(cx + 11, by)
    }
    ctx.stroke()
  } else {
    // One brow above the side-view eye at (cx - dir*4)
    const ex = cx - dir * 4
    const by = y + 9
    ctx.beginPath()
    if (brow === 'furrowed') {
      // Outer end high, inner end (toward nose) lower
      ctx.moveTo(ex - dir * 5, by - 1); ctx.lineTo(ex + dir * 5, by + 2)
    } else if (brow === 'raised') {
      ctx.moveTo(ex - 5, by + 1); ctx.quadraticCurveTo(ex, by - 3, ex + 5, by)
    } else {
      ctx.moveTo(ex - 5, by); ctx.lineTo(ex + 5, by - 1)
    }
    ctx.stroke()
  }
  ctx.restore()
}

// ── Facial features — nose / snout / beak ─────────────────────────────────────
// dir: 0=front, -1=facing left, 1=facing right
function drawFacialFeature(ctx, char, cx, y, dir, mouthOpen) {
  const ft = char.faceType || 'human_nose'

  // ── Beak (bird characters) ─────────────────────────────────────────────────
  if (ft === 'beak') {
    ctx.strokeStyle = OL; ctx.lineWidth = 1.8
    if (dir === 0) {
      const by = y + 25
      ctx.fillStyle = char.beakColor || '#806048'
      ctx.beginPath(); ctx.moveTo(cx-5, by); ctx.lineTo(cx+5, by); ctx.lineTo(cx, by+8); ctx.closePath()
      ctx.fill(); ctx.stroke()
      if (mouthOpen) {
        ctx.fillStyle = '#301010'
        ctx.beginPath(); ctx.ellipse(cx, by+4, 3, 2, 0, 0, Math.PI); ctx.fill()
      }
    } else {
      const faceX = cx + dir * 11
      const tipX  = cx + dir * 25
      const midY  = y + 18
      const topY  = midY - 6
      if (mouthOpen) {
        ctx.fillStyle = char.bodyD
        ctx.beginPath(); ctx.moveTo(faceX, midY+4); ctx.lineTo(tipX - dir*6, midY+7); ctx.lineTo(faceX, midY+10); ctx.closePath()
        ctx.fill(); ctx.stroke()
      }
      ctx.fillStyle = char.beakColor || '#806048'
      ctx.beginPath(); ctx.moveTo(faceX, topY); ctx.lineTo(tipX, midY - (mouthOpen?3:0)); ctx.lineTo(faceX, midY+(mouthOpen?2:4)); ctx.closePath()
      ctx.fill(); ctx.stroke()
    }
    return
  }

  // ── Monkey snout ───────────────────────────────────────────────────────────
  if (ft === 'monkey_snout') {
    if (dir === 0) {
      ovalStroke(ctx, cx, y + 22, 8.5, 5.5, char.snoutColor || '#E8C878', 1.5)
      ctx.fillStyle = OL
      ctx.beginPath(); ctx.ellipse(cx - 2.5, y + 21, 1.5, 1.2, 0, 0, Math.PI*2); ctx.fill()
      ctx.beginPath(); ctx.ellipse(cx + 2.5, y + 21, 1.5, 1.2, 0, 0, Math.PI*2); ctx.fill()
      if (mouthOpen) {
        ctx.fillStyle = '#301010'
        ctx.beginPath(); ctx.arc(cx, y + 27, 4.5, 0, Math.PI); ctx.fill()
        ctx.fillStyle = 'rgba(255,255,255,0.6)'
        ctx.beginPath(); ctx.arc(cx, y + 27, 3.5, 0, Math.PI); ctx.fill()
      }
    } else {
      const sx = cx + dir * 10
      ovalStroke(ctx, sx, y + 22, 5.5, 4.5, char.snoutColor || '#E8C878', 1.5)
      ctx.fillStyle = OL
      ctx.beginPath(); ctx.ellipse(sx + dir * 2, y + 21, 1.5, 1.2, 0, 0, Math.PI*2); ctx.fill()
    }
    return
  }

  // ── Bear snout ─────────────────────────────────────────────────────────────
  if (ft === 'bear_snout') {
    if (dir === 0) {
      ovalStroke(ctx, cx, y + 23, 10, 7, char.snoutColor || '#F0D898', 1.5)
      // Bear nose: horizontal oval at top of muzzle
      ovalStroke(ctx, cx, y + 20, 4, 2.5, '#201010', 1)
      if (mouthOpen) {
        ctx.strokeStyle = '#301010'; ctx.lineWidth = 1.5; ctx.lineCap = 'round'
        ctx.beginPath(); ctx.arc(cx, y + 27, 3.5, 0, Math.PI); ctx.stroke()
      }
    } else {
      const sx = cx + dir * 11
      ovalStroke(ctx, sx, y + 23, 7, 6, char.snoutColor || '#F0D898', 1.5)
      ovalStroke(ctx, sx + dir * 3, y + 21, 2.5, 2, '#201010', 1)
    }
    return
  }

  // ── Aquiline nose (Sherlock) ───────────────────────────────────────────────
  if (ft === 'aquiline_nose') {
    if (dir === 0) {
      ctx.fillStyle = char.noseColor || '#9A8878'
      ctx.strokeStyle = OL; ctx.lineWidth = 0.8
      ctx.beginPath(); ctx.moveTo(cx, y+15); ctx.lineTo(cx-4, y+23); ctx.lineTo(cx+4, y+23); ctx.closePath()
      ctx.fill(); ctx.stroke()
      // Nostrils
      ctx.globalAlpha = 0.5; ctx.fillStyle = OL
      ctx.beginPath(); ctx.ellipse(cx-3, y+22, 1.4, 1, 0, 0, Math.PI*2); ctx.fill()
      ctx.beginPath(); ctx.ellipse(cx+3, y+22, 1.4, 1, 0, 0, Math.PI*2); ctx.fill()
      ctx.globalAlpha = 1.0
      _drawMouth(ctx, char, cx, y, mouthOpen)
    } else {
      // Iconic hooked side profile
      ctx.fillStyle = char.noseColor || '#9A8878'
      ctx.strokeStyle = OL; ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.moveTo(cx + dir*5,  y+15)   // bridge
      ctx.lineTo(cx + dir*13, y+20)   // hooked tip
      ctx.lineTo(cx + dir*9,  y+24)   // underside
      ctx.lineTo(cx + dir*4,  y+24)   // back to face
      ctx.closePath(); ctx.fill(); ctx.stroke()
    }
    return
  }

  // ── Elf nose ───────────────────────────────────────────────────────────────
  if (ft === 'elf_nose') {
    if (dir === 0) {
      ctx.fillStyle = char.noseColor || '#E0A8B8'
      ctx.beginPath(); ctx.arc(cx, y+21, 2.5, 0, Math.PI*2); ctx.fill()
      _drawMouth(ctx, char, cx, y, mouthOpen)
    } else {
      const nx = cx + dir * 8
      ctx.fillStyle = char.noseColor || '#E0A8B8'
      ctx.beginPath()
      ctx.arc(nx, y + 21, 2.5, -Math.PI/2 * dir, Math.PI/2 * dir)
      ctx.closePath(); ctx.fill()
    }
    return
  }

  // ── Default: human_nose ────────────────────────────────────────────────────
  if (dir === 0) {
    ctx.fillStyle = char.noseColor || '#C09080'
    ctx.beginPath(); ctx.ellipse(cx, y+21, 3, 2, 0, 0, Math.PI*2); ctx.fill()
    _drawMouth(ctx, char, cx, y, mouthOpen)
  } else {
    const nx = cx + dir * 8
    ctx.fillStyle = char.noseColor || '#C09080'
    ctx.beginPath()
    ctx.arc(nx, y + 21, 3, -Math.PI/2 * dir, Math.PI/2 * dir)
    ctx.closePath(); ctx.fill()
  }
}

// Internal mouth helper for human/elf/aquiline front view
function _drawMouth(ctx, char, cx, y, open) {
  ctx.save()
  if (!open) {
    ctx.strokeStyle = char.bodyD; ctx.lineWidth = 1.1; ctx.lineCap = 'round'
    ctx.globalAlpha = 0.38
    ctx.beginPath(); ctx.moveTo(cx-3, y+25); ctx.lineTo(cx+3, y+25); ctx.stroke()
  } else {
    ctx.fillStyle = '#301010'
    ctx.beginPath(); ctx.ellipse(cx, y+25, 3.5, 2.5, 0, 0, Math.PI*2); ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.65)'
    ctx.beginPath(); ctx.ellipse(cx, y+24, 2.5, 1.2, 0, 0, Math.PI); ctx.fill()
  }
  ctx.restore()
}

// ── Core creature body ─────────────────────────────────────────────────────────

function drawCreatureBody(ctx, char, cx, y) {
  const bw = char.plump ? 26 : 22
  const bh = 42
  const x  = cx - bw/2

  ctx.fillStyle = char.body; ctx.strokeStyle = OL; ctx.lineWidth = 2.2
  ctx.beginPath(); rrPath(ctx, x, y+6, bw, bh, [10,10,5,5]); ctx.fill(); ctx.stroke()

  // Subtle side-shadow
  const grad = ctx.createLinearGradient(x, 0, x+bw, 0)
  grad.addColorStop(0,    'rgba(0,0,0,0.18)')
  grad.addColorStop(0.18, 'rgba(0,0,0,0)')
  grad.addColorStop(0.82, 'rgba(0,0,0,0)')
  grad.addColorStop(1,    'rgba(0,0,0,0.18)')
  ctx.fillStyle = grad
  ctx.beginPath(); rrPath(ctx, x, y+6, bw, bh, [10,10,5,5]); ctx.fill()

  // Soft top highlight
  ctx.globalAlpha = 0.14; oval(ctx, cx, y+12, bw*0.35, 4, '#FFFFFF'); ctx.globalAlpha = 1.0
}

// Dark collar band (neck marker between head and outfit)
function drawCollar(ctx, char, cx, y) {
  const cw = char.plump ? 27 : 23
  rrectStroke(ctx, cx-cw/2, y+26, cw, 5, 2, char.collar, 1.5)
}

// ── Outfit drawing ─────────────────────────────────────────────────────────────

function drawOutfitFront(ctx, char, cx, y) {
  switch (char.style) {
    case 'dress': {
      ctx.fillStyle = char.outfit; ctx.strokeStyle = OL; ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(cx-10, y+30); ctx.lineTo(cx+10, y+30)
      ctx.lineTo(cx+16, y+52); ctx.lineTo(cx-16, y+52)
      ctx.closePath(); ctx.fill(); ctx.stroke()
      ctx.globalAlpha = 0.22; ctx.fillStyle = char.outfitD
      ctx.beginPath(); ctx.moveTo(cx-16,y+52); ctx.lineTo(cx-9,y+34); ctx.lineTo(cx-6,y+52); ctx.closePath(); ctx.fill()
      ctx.beginPath(); ctx.moveTo(cx+6,y+52); ctx.lineTo(cx+9,y+34); ctx.lineTo(cx+16,y+52); ctx.closePath(); ctx.fill()
      ctx.globalAlpha = 1.0
      rrectStroke(ctx, cx-10, y+30, 20, 3, 1, char.trim, 1)
      circStroke(ctx, cx, y+36, 2.5, char.trim, 1)
      break
    }
    case 'armour': {
      rrectStroke(ctx, cx-12, y+30, 24, 18, 3, char.outfit)
      line(ctx, cx-11, y+33, cx+11, y+33, char.trim, 1.5)
      line(ctx, cx-11, y+40, cx+11, y+40, char.trim, 1.5)
      line(ctx, cx, y+31, cx, y+47, char.outfitD, 1)
      ovalStroke(ctx, cx-14, y+32, 5.5, 3.5, char.outfit)
      ovalStroke(ctx, cx+14, y+32, 5.5, 3.5, char.outfit)
      rrectStroke(ctx, cx-11, y+47, 22, 6, 2, char.outfitD, 1.5)
      ctx.globalAlpha = 0.15; oval(ctx, cx-3, y+32, 4, 6, '#FFFFFF'); ctx.globalAlpha = 1.0
      break
    }
    case 'battle_robe': {
      ctx.fillStyle = char.outfit; ctx.strokeStyle = OL; ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(cx-10, y+30); ctx.lineTo(cx+10, y+30)
      ctx.quadraticCurveTo(cx+15, y+42, cx+13, y+52)
      ctx.lineTo(cx-13, y+52)
      ctx.quadraticCurveTo(cx-15, y+42, cx-10, y+30)
      ctx.closePath(); ctx.fill(); ctx.stroke()
      rrectStroke(ctx, cx-13, y+40, 26, 5, 2, char.trim, 1.5)
      ctx.globalAlpha = 0.20; ctx.fillStyle = char.outfitD
      ctx.beginPath(); ctx.moveTo(cx-13,y+42); ctx.lineTo(cx-8,y+30); ctx.lineTo(cx-5,y+52); ctx.closePath(); ctx.fill()
      ctx.beginPath(); ctx.moveTo(cx+13,y+42); ctx.lineTo(cx+8,y+30); ctx.lineTo(cx+5,y+52); ctx.closePath(); ctx.fill()
      ctx.globalAlpha = 1.0
      break
    }
    case 'detective_coat': {
      rrectStroke(ctx, cx-12, y+30, 24, 24, 2, char.outfit)
      ctx.fillStyle = '#505060'
      ctx.beginPath(); ctx.moveTo(cx,y+30); ctx.lineTo(cx-9,y+42); ctx.lineTo(cx,y+42); ctx.closePath(); ctx.fill()
      ctx.beginPath(); ctx.moveTo(cx,y+30); ctx.lineTo(cx+9,y+42); ctx.lineTo(cx,y+42); ctx.closePath(); ctx.fill()
      ctx.fillStyle = '#706848'
      ctx.beginPath(); ctx.rect(cx-3, y+30, 6, 22); ctx.fill()
      for (let i=0; i<3; i++) circStroke(ctx, cx, y+33+i*6, 1.2, char.trim, 1)
      break
    }
    case 'hooded_tunic': {
      rrectStroke(ctx, cx-11, y+30, 22, 24, 2, char.outfit)
      rrectStroke(ctx, cx-12, y+41, 24, 5, 2, char.trim, 1.5)
      rrectStroke(ctx, cx-2.5, y+40, 5, 7, 1, '#D8C060', 1)
      ctx.fillStyle = char.outfitD; ctx.strokeStyle = OL; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(cx-11,y+30); ctx.lineTo(cx-16,y+30); ctx.lineTo(cx-14,y+50); ctx.lineTo(cx-11,y+50); ctx.closePath(); ctx.fill(); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(cx+11,y+30); ctx.lineTo(cx+16,y+30); ctx.lineTo(cx+14,y+50); ctx.lineTo(cx+11,y+50); ctx.closePath(); ctx.fill(); ctx.stroke()
      break
    }
    case 'red_shirt': {
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
      ctx.moveTo(cx-9,y+30); ctx.lineTo(cx+9,y+30)
      ctx.lineTo(cx+dir*14,y+52); ctx.lineTo(cx-dir*6,y+52)
      ctx.closePath(); ctx.fill(); ctx.stroke()
      rrectStroke(ctx, cx-9, y+30, 18, 3, 1, char.trim, 1)
      circStroke(ctx, cx+dir*2, y+36, 2.5, char.trim, 1)
      break
    }
    case 'armour': {
      rrectStroke(ctx, cx-11, y+30, 22, 18, 3, char.outfit)
      line(ctx, cx-10, y+33, cx+10, y+33, char.trim, 1.5)
      line(ctx, cx-10, y+40, cx+10, y+40, char.trim, 1.5)
      ovalStroke(ctx, cx+dir*13, y+32, 5, 3.5, char.outfit)
      rrectStroke(ctx, cx-10, y+47, 20, 6, 2, char.outfitD, 1.5)
      break
    }
    case 'battle_robe': {
      ctx.fillStyle = char.outfit; ctx.strokeStyle = OL; ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(cx-9,y+30); ctx.lineTo(cx+9,y+30)
      ctx.quadraticCurveTo(cx+dir*14,y+42, cx+dir*12,y+52)
      ctx.lineTo(cx-dir*4,y+52)
      ctx.quadraticCurveTo(cx-dir*6,y+40, cx-9,y+30)
      ctx.closePath(); ctx.fill(); ctx.stroke()
      rrectStroke(ctx, cx-12, y+40, 24, 5, 2, char.trim, 1.5)
      break
    }
    case 'detective_coat': {
      rrectStroke(ctx, cx-11, y+30, 22, 24, 2, char.outfit)
      ctx.fillStyle = '#706848'; ctx.beginPath(); ctx.rect(cx+dir*2-2, y+30, 5, 22); ctx.fill()
      for (let i=0; i<3; i++) circStroke(ctx, cx+dir*2, y+33+i*6, 1.2, char.trim, 1)
      break
    }
    case 'hooded_tunic': {
      rrectStroke(ctx, cx-10, y+30, 20, 24, 2, char.outfit)
      rrectStroke(ctx, cx-11, y+41, 22, 5, 2, char.trim, 1.5)
      ctx.fillStyle = char.outfitD; ctx.strokeStyle = OL; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(cx-dir*10,y+30); ctx.lineTo(cx-dir*16,y+30); ctx.lineTo(cx-dir*13,y+50); ctx.lineTo(cx-dir*10,y+50); ctx.closePath(); ctx.fill(); ctx.stroke()
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
      ctx.fillStyle = char.outfit; ctx.strokeStyle = OL; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(cx-10,y+29); ctx.lineTo(cx+10,y+29); ctx.lineTo(cx+6,y+52); ctx.lineTo(cx-6,y+52); ctx.closePath(); ctx.fill(); ctx.stroke()
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
      const earColor = '#D898C8'
      if (!isSide) {
        ctx.fillStyle = earColor; ctx.strokeStyle = OL; ctx.lineWidth = 1.5
        ctx.beginPath(); ctx.moveTo(cx-11,y+10); ctx.lineTo(cx-16,y+2); ctx.lineTo(cx-8,y+8); ctx.closePath(); ctx.fill(); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(cx+11,y+10); ctx.lineTo(cx+16,y+2); ctx.lineTo(cx+8,y+8); ctx.closePath(); ctx.fill(); ctx.stroke()
        rrectStroke(ctx, cx-11, y+6, 22, 4, 2, char.trim, 1.5)
        circStroke(ctx, cx, y+8, 2.5, '#FF4068', 1)
      } else {
        const ex = cx - dir * 11
        ctx.fillStyle = earColor; ctx.strokeStyle = OL; ctx.lineWidth = 1.5
        ctx.beginPath(); ctx.moveTo(ex,y+10); ctx.lineTo(ex-dir*6,y+2); ctx.lineTo(ex+dir*3,y+8); ctx.closePath(); ctx.fill(); ctx.stroke()
        rrectStroke(ctx, cx-dir*10, y+6, 18, 4, 2, char.trim, 1.5)
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
      const bx = isSide ? cx+dir*2 : cx
      rrectStroke(ctx, bx-bw/2, y+9, bw, 5, 2, char.trim, 1.5)
      if (!isSide) {
        circStroke(ctx, cx, y+11, 3, '#FF4828', 1)
        circStroke(ctx, cx-6, y+11, 1.5, '#F8E040', 1)
        circStroke(ctx, cx+6, y+11, 1.5, '#F8E040', 1)
      }
      break
    }
    case 'deerstalker': {
      rrectStroke(ctx, cx-(isSide?10:13), y+4, isSide?20:26, 7, 3, '#5A6860')
      if (!isSide) {
        ctx.fillStyle = '#5A6860'; ctx.strokeStyle = OL; ctx.lineWidth = 1.5
        ctx.beginPath(); ctx.ellipse(cx+14, y+8, 5, 2.5, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke()
        ctx.beginPath(); ctx.ellipse(cx-14, y+8, 5, 2.5, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke()
        ctx.globalAlpha = 0.18
        for (let i=-2; i<=2; i++) line(ctx, cx-11+i*6, y+5, cx-11+i*6, y+10, '#000', 0.8)
        ctx.globalAlpha = 1.0
      } else {
        ctx.fillStyle = '#5A6860'; ctx.strokeStyle = OL; ctx.lineWidth = 1.5
        ctx.beginPath(); ctx.ellipse(cx+dir*12, y+8, 5, 2.5, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke()
      }
      break
    }
    case 'green_hood': {
      if (view === 'back') break
      ctx.fillStyle = char.outfit; ctx.strokeStyle = OL; ctx.lineWidth = 2
      if (!isSide) {
        ctx.beginPath(); ctx.moveTo(cx,y+0); ctx.lineTo(cx-12,y+10); ctx.lineTo(cx+12,y+10); ctx.closePath(); ctx.fill(); ctx.stroke()
        ctx.fillStyle = char.outfitD
        ctx.beginPath(); ctx.moveTo(cx-12,y+10); ctx.lineTo(cx-8,y+14); ctx.lineTo(cx+8,y+14); ctx.lineTo(cx+12,y+10); ctx.closePath(); ctx.fill()
      } else {
        const tip = cx - dir*2
        ctx.beginPath(); ctx.moveTo(tip,y+0); ctx.lineTo(tip-dir*13,y+10); ctx.lineTo(tip+dir*5,y+10); ctx.closePath(); ctx.fill(); ctx.stroke()
      }
      break
    }
    case 'bear_ears': {
      if (view === 'back') break
      if (!isSide) {
        circStroke(ctx, cx-10, y+6, 6, char.body)
        circStroke(ctx, cx+10, y+6, 6, char.body)
        circ(ctx, cx-10, y+6, 4, '#F0A898')
        circ(ctx, cx+10, y+6, 4, '#F0A898')
      } else {
        circStroke(ctx, cx+dir*10, y+6, 6, char.body)
        circ(ctx, cx+dir*10, y+6, 4, '#F0A898')
      }
      break
    }
  }
}

// ── Ground shadow ──────────────────────────────────────────────────────────────
function drawShadow(ctx, cx, oy) {
  ctx.globalAlpha = 0.12; oval(ctx, cx, oy+62, 14, 3.5, '#000000'); ctx.globalAlpha = 1.0
}

// ── Legs — thin sticks, no foot circles ───────────────────────────────────────
function drawLegs(ctx, char, cx, oy, lL, lR) {
  const lx  = cx - 5, rx = cx + 5
  const legW = 3.5

  ctx.fillStyle = char.feetD; ctx.strokeStyle = OL; ctx.lineWidth = 1.2
  ctx.beginPath(); ctx.rect(lx - legW/2, oy+50+lL, legW, 12); ctx.fill(); ctx.stroke()
  ctx.beginPath(); ctx.rect(rx - legW/2, oy+50+lR, legW, 12); ctx.fill(); ctx.stroke()

  // Small foot flares (just wider base, no circle)
  ctx.fillStyle = char.feet; ctx.strokeStyle = OL; ctx.lineWidth = 1
  ctx.beginPath(); ctx.rect(lx - legW/2 - 2, oy+60+lL, legW + 4, 3); ctx.fill(); ctx.stroke()
  ctx.beginPath(); ctx.rect(rx - legW/2 - 2, oy+60+lR, legW + 4, 3); ctx.fill(); ctx.stroke()
}

// ── Satchel ────────────────────────────────────────────────────────────────────
function drawSatchel(ctx, char, cx, y, view) {
  const isSide = view === 'left' || view === 'right'
  const dir    = view === 'right' ? 1 : -1
  const sx     = isSide ? cx - dir*9 : cx + 7
  const sy     = y + 36

  if (char.style === 'red_shirt') {
    rrectStroke(ctx, sx-4, sy, 9, 9, 2, '#E8C040', 1.5)
    rrectStroke(ctx, sx-3, sy-3, 7, 3, 1, '#C8A020', 1)
    ctx.globalAlpha = 0.55; circStroke(ctx, sx+3, sy+10, 1.8, '#F0D040', 0.8); ctx.globalAlpha = 1.0
  } else if (char.style === 'detective_coat') {
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
  const y  = oy + bob
  const ft = char.faceType || 'human_nose'

  drawShadow(ctx, cx, oy)
  drawLegs(ctx, char, cx, oy, legL, legR)
  drawCreatureBody(ctx, char, cx, y)
  drawOutfitFront(ctx, char, cx, y)
  drawCollar(ctx, char, cx, y)
  drawFacialFeature(ctx, char, cx, y, 0, mouthOpen)
  drawEyebrows(ctx, char, cx, y, 0)

  // Two eyes in front view (one for beak characters — keeps 3/4 angle look)
  if (blinking) {
    drawEyeBlink(ctx, cx - 6, y + 14, 4.5)
    if (ft !== 'beak') drawEyeBlink(ctx, cx + 6, y + 14, 4.5)
  } else if (ft === 'beak') {
    drawEye(ctx, cx + 3, y + 14, 5.5, char.eyes)
  } else {
    drawEye(ctx, cx - 6, y + 14, 4.5, char.eyes)
    drawEye(ctx, cx + 6, y + 14, 4.5, char.eyes)
  }

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
  drawFacialFeature(ctx, char, cx, y, dir, false)
  drawEyebrows(ctx, char, cx, y, dir)
  // One eye in side profile
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

// ── Core sheet renderer (works with any Canvas 2D context) ────────────────────
export function renderSpriteSheet(ctx, charId) {
  for (const [animKey, meta] of Object.entries(ANIM_META)) {
    for (let f = 0; f < meta.frames; f++) {
      ctx.save()
      drawFrame(ctx, charId, animKey, f, f * FRAME, meta.row * FRAME)
      ctx.restore()
    }
  }
}

// ── Public API (browser) ───────────────────────────────────────────────────────
export function generateSpriteSheet(charId) {
  const canvas  = document.createElement('canvas')
  canvas.width  = FRAME * COLS
  canvas.height = FRAME * ROWS
  const ctx     = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  renderSpriteSheet(ctx, charId)
  return canvas.toDataURL('image/png')
}

const CACHE_VERSION = 'v8'

export function getCachedSprite(charId) {
  try { return localStorage.getItem(`haven_sprite_${CACHE_VERSION}_${charId}`) }
  catch { return null }
}
export function setCachedSprite(charId, dataUrl) {
  try { localStorage.setItem(`haven_sprite_${CACHE_VERSION}_${charId}`, dataUrl) }
  catch {}
}
