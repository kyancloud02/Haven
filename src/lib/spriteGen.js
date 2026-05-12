/**
 * Procedural sprite sheet generator — Islets-inspired soft art style.
 *
 * All characters share the round-creature silhouette (soft outlines, circular
 * eyes, tiny legs, watercolour highlights) but each has their own clothing
 * silhouette, colour palette, and head accessory matching their source character.
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
//
// To add a new character, call registerCharacter(id, def) anywhere before
// generateSpriteSheet is first called for that id.
//
// Required fields:
//   body / bodyD      — creature body fill + shadow colour
//   head / headD      — head fill + shadow colour
//   eyes              — pupil colour
//   ears              — ear fill colour
//   outfit / outfitD  — primary clothing colour + shadow
//   trim              — accent / decoration colour (gold, leather, etc.)
//   belt              — belt colour, or null for none
//   feet / feetD      — leg/foot fill + shadow colour
//   special           — head accessory (see SPECIALS below)
//   style             — outfit silhouette (see STYLES below)
//
// Optional:
//   plump: true       — widens body ovals (e.g. Winnie-the-Pooh)
//
// Available style values:
export const STYLES = /** @type {const} */ ([
  'dress',          // bell-shaped flowing skirt (Elf Princess)
  'armour',         // chest-plate + pauldrons (Mulan)
  'battle_robe',    // round robe + sash belt (Sun Wukong)
  'detective_coat', // long lapelled coat + waistcoat (Sherlock)
  'hooded_tunic',   // tunic + belt + back quiver (Robin Hood)
  'red_shirt',      // short crop-shirt, belly visible (Winnie-the-Pooh)
])

// Available special (head accessory) values:
export const SPECIALS = /** @type {const} */ ([
  'elf_crown',       // gold zigzag crown + pointed elf ears
  'topknot',         // dark hair bun + hair pin
  'golden_headband', // gold band across forehead + coloured jewel
  'deerstalker',     // flat detective cap with peaks
  'green_hood',      // pointed hood merging into outfit
  'bear_ears',       // round bear ears with pink inner
])

// ── Built-in character registry ───────────────────────────────────────────────

const CHARS = {
  elf_princess: {
    // Lavender cat-like creature, pink bell-shaped dress, gold crown, elf ears
    body:    '#C4B0E0', bodyD:  '#A890C8',
    head:    '#D0BCEC', headD:  '#B49CD0',
    eyes:    '#3028A8',
    ears:    '#F0A8C8',                  // pink pointed ears
    outfit:  '#D05888', outfitD: '#A83C68', // rose-pink flowing dress
    trim:    '#F0D840',                  // gold trim
    belt:    null,
    feet:    '#9870C8', feetD:  '#7050A8',
    special: 'elf_crown',
    style:   'dress',
  },

  warrior_mulan: {
    // Warm tan creature, red-and-gold Chinese armour, dark topknot
    body:    '#E2B880', bodyD:  '#C09050',
    head:    '#ECC890', headD:  '#CAAA60',
    eyes:    '#1A0808',
    ears:    '#D8A060',
    outfit:  '#C02828', outfitD: '#901818', // red armour
    trim:    '#F0C040',                  // gold trim
    belt:    '#301008',
    feet:    '#3A1808', feetD:  '#201008',
    special: 'topknot',
    style:   'armour',
  },

  sun_wukong: {
    // Golden-amber creature, orange battle-robe, golden headband, staff
    body:    '#D8A840', bodyD:  '#B88020',
    head:    '#E8B848', headD:  '#C89828',
    eyes:    '#2A1008',
    ears:    '#C89030',
    outfit:  '#D07028', outfitD: '#A85010', // burnt-orange robe
    trim:    '#F8E040',                  // gold sash
    belt:    '#C05010',
    feet:    '#7A4010', feetD:  '#522808',
    special: 'golden_headband',
    style:   'battle_robe',
  },

  sherlock_holmes: {
    // Slate-blue creature, long dark detective coat, deerstalker, pipe
    body:    '#8898A8', bodyD:  '#607080',
    head:    '#98A8B8', headD:  '#708090',
    eyes:    '#181010',
    ears:    '#8898A8',
    outfit:  '#3A4050', outfitD: '#282C38', // charcoal coat
    trim:    '#A89858',                  // aged-brass buttons
    belt:    '#282030',
    feet:    '#202028', feetD:  '#141018',
    special: 'deerstalker',
    style:   'detective_coat',
  },

  robin_hood: {
    // Forest-green creature, green hooded tunic, brown belt + quiver
    body:    '#7A9848', bodyD:  '#5A7830',
    head:    '#8CAA58', headD:  '#6A8838',
    eyes:    '#141008',
    ears:    '#7A9848',
    outfit:  '#4A7020', outfitD: '#305010', // forest-green tunic
    trim:    '#9A6030',                  // brown leather
    belt:    '#7A4818',
    feet:    '#3A2010', feetD:  '#241408',
    special: 'green_hood',
    style:   'hooded_tunic',
  },

  winnie_the_pooh: {
    // Honey-yellow round bear, tiny red crop-shirt, bear ears, honey pot satchel
    body:    '#EAC850', bodyD:  '#C8A030',
    head:    '#F2D860', headD:  '#D0B038',
    eyes:    '#180808',
    ears:    '#EAC850',
    outfit:  '#C82020', outfitD: '#A01010', // red shirt
    trim:    '#F0B030',
    belt:    null,
    feet:    '#8A5818', feetD:  '#5A3810',
    special: 'bear_ears',
    style:   'red_shirt',
    plump:   true,                       // wider body
  },
}

// ── Public character registration API ─────────────────────────────────────────

/**
 * Register a new character so generateSpriteSheet can render it.
 *
 * @param {string} id       - Must match the character's id in characters.json
 * @param {object} def      - Character definition (see schema comment above)
 *
 * Example:
 *   registerCharacter('merlin', {
 *     body: '#8070B0', bodyD: '#604890',
 *     head: '#9080C0', headD: '#705898',
 *     eyes: '#201840',
 *     ears: '#8070B0',
 *     outfit: '#304898', outfitD: '#1C2D70',
 *     trim: '#C8A040',
 *     belt: '#483018',
 *     feet: '#302060', feetD: '#1C1040',
 *     special: 'deerstalker',
 *     style: 'detective_coat',
 *   })
 */
export function registerCharacter(id, def) {
  if (!STYLES.includes(def.style)) {
    console.warn(`[spriteGen] Unknown style "${def.style}" for character "${id}". Falling back to "dress".`)
    def = { ...def, style: 'dress' }
  }
  if (def.special && !SPECIALS.includes(def.special)) {
    console.warn(`[spriteGen] Unknown special "${def.special}" for character "${id}". Accessory will be skipped.`)
    def = { ...def, special: null }
  }
  CHARS[id] = def
}

/**
 * Returns a fully-populated character definition with sensible defaults filled
 * in for any missing optional fields. Useful as a starting point when calling
 * registerCharacter.
 *
 * @param {Partial<object>} overrides
 * @returns {object}
 */
export function createCharDef(overrides = {}) {
  return {
    body:    '#A09898', bodyD:  '#807070',
    head:    '#B0A8A8', headD:  '#907878',
    eyes:    '#201818',
    ears:    '#A09898',
    outfit:  '#6870A0', outfitD: '#485080',
    trim:    '#D0C060',
    belt:    '#503820',
    feet:    '#3A2818', feetD:  '#221808',
    special: null,
    style:   'dress',
    plump:   false,
    ...overrides,
  }
}

// ── Walk cycle tables ──────────────────────────────────────────────────────────

const WALK8 = [
  [-3, 2], [-2, 3], [-1, 2], [0, 1],
  [ 3,-2], [ 2,-3], [ 1,-2], [0,-1],
]
const WALK4 = [[-2, 2], [0, 3], [2, -2], [0, -3]]

// ── Canvas helpers ─────────────────────────────────────────────────────────────

const OL = '#10080C'  // universal outline — dark warm near-black

function circ(ctx, cx, cy, r, color) {
  ctx.fillStyle = color
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill()
}

function oval(ctx, cx, cy, rx, ry, color) {
  ctx.fillStyle = color
  ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.fill()
}

function rrect(ctx, x, y, w, h, r, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h)
  ctx.fill()
}

function line(ctx, x1, y1, x2, y2, color, width = 1) {
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
}

// Circle with 1.5px outline
function circO(ctx, cx, cy, r, fill) {
  circ(ctx, cx, cy, r + 1.5, OL); circ(ctx, cx, cy, r, fill)
}

// Oval with 1.5px outline
function ovalO(ctx, cx, cy, rx, ry, fill) {
  oval(ctx, cx, cy, rx + 1.5, ry + 1.5, OL); oval(ctx, cx, cy, rx, ry, fill)
}

// Expressive eye: large white sclera + dark pupil + gleam, clean stroke outline
function drawEye(ctx, cx, cy, r, pupilColor) {
  ctx.save()
  ctx.fillStyle   = '#FFFFFF'
  ctx.strokeStyle = OL
  ctx.lineWidth   = 1.5
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill(); ctx.stroke()
  // Pupil sits just below centre
  ctx.fillStyle = pupilColor
  ctx.beginPath(); ctx.arc(cx, cy + r * 0.12, r * 0.56, 0, Math.PI * 2); ctx.fill()
  // Gleam (upper-left)
  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  ctx.beginPath(); ctx.arc(cx - r * 0.28, cy - r * 0.28, r * 0.22, 0, Math.PI * 2); ctx.fill()
  ctx.restore()
}

// Blink eye — flat lid arc
function drawEyeBlink(ctx, cx, cy, r) {
  ctx.save()
  ctx.strokeStyle = OL; ctx.lineWidth = 2; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke()
  ctx.restore()
}

function rrectO(ctx, x, y, w, h, r, fill) {
  rrect(ctx, x - 1.5, y - 1.5, w + 3, h + 3, r + 1, OL)
  rrect(ctx, x, y, w, h, r, fill)
}

// ── Outfit drawing ─────────────────────────────────────────────────────────────

function drawOutfitFront(ctx, char, cx, y) {
  switch (char.style) {

    case 'dress': {
      // Bell-shaped flowing dress — narrow at waist, flares out at hem
      // Waist/bodice
      ovalO(ctx, cx, y + 32, 9, 6.5, char.outfit)
      // Flared skirt
      ovalO(ctx, cx, y + 43, 14, 10, char.outfit)
      // Skirt fold shading
      ctx.globalAlpha = 0.30
      oval(ctx, cx - 5, y + 42, 2.5, 7, char.outfitD)
      oval(ctx, cx + 5, y + 42, 2.5, 7, char.outfitD)
      ctx.globalAlpha = 1.0
      // Gold collar trim
      ovalO(ctx, cx, y + 27, 8, 3.5, char.trim)
      // Bodice jewel
      circ(ctx, cx, y + 32, 2, char.trim)
      // Highlight
      ctx.globalAlpha = 0.20
      oval(ctx, cx - 3, y + 34, 4, 6, '#FFFFFF')
      ctx.globalAlpha = 1.0
      break
    }

    case 'armour': {
      // Red chest-plate with gold trim + pauldrons
      // Under-layer
      ovalO(ctx, cx, y + 40, 11, 9, char.outfitD)
      // Chest plate
      rrectO(ctx, cx - 10, y + 27, 20, 16, 3, char.outfit)
      // Gold horizontal lines on plate
      line(ctx, cx - 9, y + 30, cx + 9, y + 30, char.trim, 1.2)
      line(ctx, cx - 9, y + 36, cx + 9, y + 36, char.trim, 1.2)
      // Centre seam
      line(ctx, cx, y + 28, cx, y + 42, char.outfitD, 1)
      // Pauldrons
      ovalO(ctx, cx - 13, y + 29, 5.5, 4, char.outfit)
      ovalO(ctx, cx + 13, y + 29, 5.5, 4, char.outfit)
      line(ctx, cx - 17, y + 27, cx - 9, y + 27, char.trim, 1)
      line(ctx, cx + 9,  y + 27, cx + 17, y + 27, char.trim, 1)
      // Lower skirt
      ovalO(ctx, cx, y + 48, 10, 5.5, char.outfitD)
      // Plate highlight
      ctx.globalAlpha = 0.18
      oval(ctx, cx - 4, y + 29, 4, 5, '#FFFFFF')
      ctx.globalAlpha = 1.0
      break
    }

    case 'battle_robe': {
      // Round flowing orange robe, wide gold sash belt
      ovalO(ctx, cx, y + 40, 13, 12, char.outfit)
      // Robe fold lines
      ctx.globalAlpha = 0.28
      oval(ctx, cx - 7, y + 38, 2.5, 7, char.outfitD)
      oval(ctx, cx + 7, y + 38, 2.5, 7, char.outfitD)
      ctx.globalAlpha = 1.0
      // Gold sash belt across middle
      rrectO(ctx, cx - 12, y + 36, 24, 5, 2, char.trim)
      // Collar knot
      circO(ctx, cx, y + 28, 4, char.trim)
      // Robe highlight
      ctx.globalAlpha = 0.20
      oval(ctx, cx - 4, y + 32, 5, 6, '#FFFFFF')
      ctx.globalAlpha = 1.0
      break
    }

    case 'detective_coat': {
      // Long dark charcoal coat with tan waistcoat strip + buttons
      ovalO(ctx, cx, y + 42, 12, 11, char.outfit)
      // Lapels (lighter inner triangles)
      ctx.fillStyle = '#505868'
      ctx.beginPath()
      ctx.moveTo(cx,     y + 28)
      ctx.lineTo(cx - 7, y + 38)
      ctx.lineTo(cx,     y + 38)
      ctx.closePath(); ctx.fill()
      ctx.beginPath()
      ctx.moveTo(cx,     y + 28)
      ctx.lineTo(cx + 7, y + 38)
      ctx.lineTo(cx,     y + 38)
      ctx.closePath(); ctx.fill()
      // Waistcoat strip
      ctx.fillStyle = '#706848'
      ctx.beginPath()
      ctx.moveTo(cx - 3, y + 28)
      ctx.lineTo(cx + 3, y + 28)
      ctx.lineTo(cx + 2, y + 46)
      ctx.lineTo(cx - 2, y + 46)
      ctx.closePath(); ctx.fill()
      // Buttons
      for (let i = 0; i < 3; i++) circ(ctx, cx, y + 31 + i * 5, 1.2, char.trim)
      // Coat hem fold
      ctx.globalAlpha = 0.25
      oval(ctx, cx - 8, y + 43, 2, 5, OL)
      oval(ctx, cx + 8, y + 43, 2, 5, OL)
      ctx.globalAlpha = 1.0
      break
    }

    case 'hooded_tunic': {
      // Forest-green body, brown belt, hood drape
      ovalO(ctx, cx, y + 40, 12, 11, char.outfit)
      // Brown leather belt
      rrectO(ctx, cx - 11, y + 37, 22, 4, 2, char.trim)
      // Belt buckle
      rrectO(ctx, cx - 2, y + 36, 4, 5, 1, '#D8C060')
      // Tunic fold
      ctx.globalAlpha = 0.25
      oval(ctx, cx - 6, y + 38, 2, 6, char.outfitD)
      oval(ctx, cx + 6, y + 38, 2, 6, char.outfitD)
      ctx.globalAlpha = 1.0
      // Tunic highlight
      ctx.globalAlpha = 0.18
      oval(ctx, cx - 4, y + 32, 4, 6, '#FFFFFF')
      ctx.globalAlpha = 1.0
      // Hood front drape over shoulders
      ctx.fillStyle = char.outfitD
      ctx.beginPath()
      ctx.moveTo(cx - 14, y + 30)
      ctx.quadraticCurveTo(cx - 13, y + 40, cx - 10, y + 46)
      ctx.lineTo(cx - 12, y + 46)
      ctx.quadraticCurveTo(cx - 15, y + 40, cx - 16, y + 30)
      ctx.closePath(); ctx.fill()
      ctx.beginPath()
      ctx.moveTo(cx + 14, y + 30)
      ctx.quadraticCurveTo(cx + 13, y + 40, cx + 10, y + 46)
      ctx.lineTo(cx + 12, y + 46)
      ctx.quadraticCurveTo(cx + 15, y + 40, cx + 16, y + 30)
      ctx.closePath(); ctx.fill()
      break
    }

    case 'red_shirt': {
      // Wide honey-yellow body (belly shows below the shirt)
      const bw = char.plump ? 15 : 12
      ovalO(ctx, cx, y + 42, bw + 2, 12, char.body)
      // Short red crop-shirt (top portion only)
      rrectO(ctx, cx - 11, y + 27, 22, 14, 3, char.outfit)
      // Shirt hem fold
      line(ctx, cx - 10, y + 39, cx + 10, y + 39, char.outfitD, 1.5)
      // Shirt crinkle
      ctx.globalAlpha = 0.22
      oval(ctx, cx - 5, y + 31, 2, 4, '#FFFFFF')
      ctx.globalAlpha = 1.0
      // Belly spot (exposed honey fur below shirt)
      ctx.globalAlpha = 0.35
      oval(ctx, cx, y + 46, 8, 5, char.bodyD)
      ctx.globalAlpha = 1.0
      break
    }
  }
}

function drawOutfitSide(ctx, char, cx, y, dir) {
  switch (char.style) {

    case 'dress': {
      ovalO(ctx, cx + dir, y + 32, 9, 6.5, char.outfit)
      ovalO(ctx, cx, y + 44, 13, 9.5, char.outfit)
      ctx.globalAlpha = 0.25
      oval(ctx, cx + dir * 4, y + 41, 2, 7, char.outfitD)
      ctx.globalAlpha = 1.0
      ovalO(ctx, cx + dir, y + 27, 7, 3.5, char.trim)
      break
    }

    case 'armour': {
      ovalO(ctx, cx, y + 40, 11, 9, char.outfitD)
      rrectO(ctx, cx - 9 + dir, y + 27, 18, 16, 3, char.outfit)
      line(ctx, cx - 8 + dir, y + 30, cx + 8 + dir, y + 30, char.trim, 1.2)
      line(ctx, cx - 8 + dir, y + 36, cx + 8 + dir, y + 36, char.trim, 1.2)
      ovalO(ctx, cx + dir * 13, y + 29, 5, 3.5, char.outfit)
      ovalO(ctx, cx, y + 48, 9, 5, char.outfitD)
      break
    }

    case 'battle_robe': {
      ovalO(ctx, cx, y + 40, 12, 11, char.outfit)
      ctx.globalAlpha = 0.28
      oval(ctx, cx + dir * 7, y + 38, 2, 7, char.outfitD)
      ctx.globalAlpha = 1.0
      rrectO(ctx, cx - 11, y + 36, 22, 5, 2, char.trim)
      circO(ctx, cx + dir * 2, y + 28, 4, char.trim)
      break
    }

    case 'detective_coat': {
      ovalO(ctx, cx, y + 42, 11, 10, char.outfit)
      ctx.globalAlpha = 0.22
      oval(ctx, cx + dir * 5, y + 42, 2, 7, OL)
      ctx.globalAlpha = 1.0
      ctx.fillStyle = '#706848'
      rrect(ctx, cx + dir * 2 - 2, y + 29, 4, 16, 1, '#706848')
      for (let i = 0; i < 3; i++) circ(ctx, cx + dir * 2, y + 31 + i * 5, 1.2, char.trim)
      break
    }

    case 'hooded_tunic': {
      ovalO(ctx, cx, y + 40, 11, 10, char.outfit)
      rrectO(ctx, cx - 10, y + 37, 20, 4, 2, char.trim)
      // Hood side drape
      ctx.fillStyle = char.outfitD
      ctx.beginPath()
      ctx.moveTo(cx + dir * 14, y + 30)
      ctx.quadraticCurveTo(cx + dir * 13, y + 40, cx + dir * 9, y + 46)
      ctx.lineTo(cx + dir * 11, y + 46)
      ctx.quadraticCurveTo(cx + dir * 15, y + 40, cx + dir * 16, y + 30)
      ctx.closePath(); ctx.fill()
      break
    }

    case 'red_shirt': {
      const bw = char.plump ? 14 : 11
      ovalO(ctx, cx, y + 42, bw, 11, char.body)
      rrectO(ctx, cx - 10, y + 27, 20, 14, 3, char.outfit)
      line(ctx, cx - 9, y + 39, cx + 9, y + 39, char.outfitD, 1.5)
      break
    }
  }
}

function drawOutfitBack(ctx, char, cx, y) {
  switch (char.style) {

    case 'dress':
      ovalO(ctx, cx, y + 44, 14, 10.5, char.outfitD)
      ovalO(ctx, cx, y + 32, 9, 6, char.outfitD)
      ctx.globalAlpha = 0.28
      oval(ctx, cx - 5, y + 43, 2, 7, OL)
      oval(ctx, cx + 5, y + 43, 2, 7, OL)
      ctx.globalAlpha = 1.0
      break

    case 'armour':
      ovalO(ctx, cx, y + 40, 11, 9, char.outfitD)
      // Back-plate
      rrectO(ctx, cx - 9, y + 27, 18, 16, 3, char.outfitD)
      line(ctx, cx - 8, y + 30, cx + 8, y + 30, char.trim, 1)
      ovalO(ctx, cx, y + 48, 9, 5, char.outfitD)
      break

    case 'battle_robe':
      ovalO(ctx, cx, y + 40, 12, 11, char.outfitD)
      rrectO(ctx, cx - 11, y + 36, 22, 5, 2, char.outfitD)
      break

    case 'detective_coat':
      ovalO(ctx, cx, y + 42, 11, 10, char.outfitD)
      // Coat vent
      line(ctx, cx, y + 40, cx, y + 50, OL, 1)
      break

    case 'hooded_tunic': {
      ovalO(ctx, cx, y + 40, 11, 10, char.outfitD)
      // Back of hood (triangle draping down)
      ctx.fillStyle = char.outfit
      ctx.beginPath()
      ctx.moveTo(cx - 10, y + 28)
      ctx.lineTo(cx + 10, y + 28)
      ctx.lineTo(cx + 6,  y + 50)
      ctx.lineTo(cx - 6,  y + 50)
      ctx.closePath(); ctx.fill()
      // Quiver
      rrectO(ctx, cx + 8, y + 25, 6, 20, 2, char.trim)
      circ(ctx, cx + 11, y + 24, 2, '#D8C060')
      break
    }

    case 'red_shirt':
      ovalO(ctx, cx, y + 42, char.plump ? 14 : 11, 11, char.body)
      rrectO(ctx, cx - 10, y + 27, 20, 13, 3, char.outfitD)
      break
  }
}

// ── Head accessories ───────────────────────────────────────────────────────────

function drawHead(ctx, char, cx, y, view, blinking) {
  const isSide = view === 'left' || view === 'right'
  const dir    = view === 'right' ? 1 : -1
  const hx     = isSide ? cx + dir * 2 : cx
  const r      = char.plump ? 12 : 11

  // ── Special behind-head (drawn before head so head overlaps) ───────────────

  if (char.special === 'elf_crown' && view !== 'back') {
    // Pointed elf ears behind head (sides)
    if (!isSide) {
      ctx.fillStyle = OL
      // left ear
      ctx.beginPath(); ctx.moveTo(cx - r, y + 14); ctx.lineTo(cx - r - 5, y + 4); ctx.lineTo(cx - r + 2, y + 9); ctx.closePath(); ctx.fill()
      ctx.fillStyle = char.ears
      ctx.beginPath(); ctx.moveTo(cx - r, y + 14); ctx.lineTo(cx - r - 4, y + 5); ctx.lineTo(cx - r + 1, y + 9); ctx.closePath(); ctx.fill()
      // right ear
      ctx.fillStyle = OL
      ctx.beginPath(); ctx.moveTo(cx + r, y + 14); ctx.lineTo(cx + r + 5, y + 4); ctx.lineTo(cx + r - 2, y + 9); ctx.closePath(); ctx.fill()
      ctx.fillStyle = char.ears
      ctx.beginPath(); ctx.moveTo(cx + r, y + 14); ctx.lineTo(cx + r + 4, y + 5); ctx.lineTo(cx + r - 1, y + 9); ctx.closePath(); ctx.fill()
    } else {
      // one far ear visible
      ctx.fillStyle = OL
      ctx.beginPath(); ctx.moveTo(hx - dir * r, y + 14); ctx.lineTo(hx - dir * (r + 4), y + 5); ctx.lineTo(hx - dir * (r - 2), y + 9); ctx.closePath(); ctx.fill()
      ctx.fillStyle = char.ears
      ctx.beginPath(); ctx.moveTo(hx - dir * r, y + 14); ctx.lineTo(hx - dir * (r + 3), y + 6); ctx.lineTo(hx - dir * (r - 1), y + 10); ctx.closePath(); ctx.fill()
    }
  }

  if (char.special === 'bear_ears') {
    const er = 5.5
    if (!isSide) {
      circO(ctx, cx - 9, y + 7, er, char.head)
      circO(ctx, cx + 9, y + 7, er, char.head)
      circ(ctx, cx - 9, y + 7, 3.5, '#F0A898')
      circ(ctx, cx + 9, y + 7, 3.5, '#F0A898')
    } else {
      circO(ctx, hx + dir * 9, y + 7, er, char.head)
      circ(ctx, hx + dir * 9, y + 7, 3.5, '#F0A898')
    }
  }

  if (char.special === 'green_hood') {
    // Hood forms pointed silhouette above head
    if (view !== 'back') {
      const hoodTip = isSide ? hx - dir * 2 : cx
      ctx.fillStyle = OL
      ctx.beginPath()
      ctx.moveTo(hoodTip, y + 2)
      ctx.lineTo(hoodTip - (isSide ? dir * 12 : 12), y + 14)
      ctx.lineTo(hoodTip + (isSide ? dir * 4  : 12), y + 14)
      ctx.closePath(); ctx.fill()
      ctx.fillStyle = char.outfit
      ctx.beginPath()
      ctx.moveTo(hoodTip, y + 3)
      ctx.lineTo(hoodTip - (isSide ? dir * 11 : 11), y + 14)
      ctx.lineTo(hoodTip + (isSide ? dir * 3  : 11), y + 14)
      ctx.closePath(); ctx.fill()
    }
  }

  // ── Head circle ─────────────────────────────────────────────────────────────
  if (view === 'back') {
    circO(ctx, cx, y + 17, r, char.bodyD)
    ctx.globalAlpha = 0.14
    circ(ctx, cx + 3, y + 15, 5, '#000000')
    ctx.globalAlpha = 1.0
    return  // no face on back
  }

  circO(ctx, hx, y + 17, r, char.head)
  // Head highlight
  ctx.globalAlpha = 0.22
  circ(ctx, hx - (isSide ? dir * 3 : 4), y + 12, 5, '#FFFFFF')
  ctx.globalAlpha = 1.0

  // ── Eyes — positioned in upper third of head ────────────────────────────────
  const eyeY = y + 14   // higher up = more expressive
  const eyeR = 6        // larger = more googly / reference-accurate
  if (!blinking) {
    if (!isSide) {
      drawEye(ctx, hx - 6, eyeY, eyeR, char.eyes)
      drawEye(ctx, hx + 6, eyeY, eyeR, char.eyes)
    } else {
      drawEye(ctx, hx - dir * 3, eyeY, eyeR, char.eyes)
    }
  } else {
    if (!isSide) {
      drawEyeBlink(ctx, hx - 6, eyeY, eyeR)
      drawEyeBlink(ctx, hx + 6, eyeY, eyeR)
    } else {
      drawEyeBlink(ctx, hx - dir * 3, eyeY, eyeR)
    }
  }

  // ── Cheek blush — sits below the eyes ────────────────────────────────────────
  ctx.globalAlpha = 0.18
  if (!isSide) {
    oval(ctx, hx - 10, y + 19, 4.5, 2.5, '#FF8898')
    oval(ctx, hx + 10, y + 19, 4.5, 2.5, '#FF8898')
  }
  ctx.globalAlpha = 1.0

  // ── Accessories on front of head ────────────────────────────────────────────
  switch (char.special) {

    case 'elf_crown': {
      if (view === 'back') break
      const cw = isSide ? 12 : 16
      const cx2 = isSide ? hx - dir * 3 : hx
      ctx.fillStyle = char.trim
      ctx.beginPath()
      if (!isSide) {
        ctx.moveTo(cx2 - 8, y + 7)
        ctx.lineTo(cx2 - 5, y + 1)
        ctx.lineTo(cx2 - 2, y + 5)
        ctx.lineTo(cx2,     y + 0)
        ctx.lineTo(cx2 + 2, y + 5)
        ctx.lineTo(cx2 + 5, y + 1)
        ctx.lineTo(cx2 + 8, y + 7)
      } else {
        ctx.moveTo(cx2 - dir * 5, y + 7)
        ctx.lineTo(cx2,           y + 1)
        ctx.lineTo(cx2 + dir * 4, y + 7)
      }
      ctx.closePath(); ctx.fill()
      ctx.strokeStyle = OL; ctx.lineWidth = 0.8; ctx.stroke()
      if (!isSide) circ(ctx, cx2, y + 2, 2.5, '#FF4068')
      break
    }

    case 'topknot': {
      const tx = isSide ? hx - dir : hx
      circO(ctx, tx, y + 5, 5.5, '#1A0808')
      circ(ctx,  tx, y + 5, 3.5, '#2A1010')
      circ(ctx,  tx + 1, y + 4, 1, 'rgba(255,255,255,0.18)')
      // Hair pin
      line(ctx, tx - 5, y + 7, tx + 5, y + 4, char.trim, 1)
      break
    }

    case 'golden_headband': {
      const bx = isSide ? hx + dir * 2 : hx
      const bw = isSide ? 16 : 22
      rrectO(ctx, bx - bw / 2, y + 10, bw, 4, 2, char.trim)
      if (!isSide) {
        circ(ctx, bx, y + 12, 3, '#FF4828')        // red jewel centre
        circ(ctx, bx - 6, y + 12, 1.5, '#F8E040')  // side dots
        circ(ctx, bx + 6, y + 12, 1.5, '#F8E040')
      }
      break
    }

    case 'deerstalker': {
      const dx = isSide ? hx + dir * 1 : hx
      // Cap body
      ovalO(ctx, dx, y + 9, 13, 4.5, '#5A6860')
      if (!isSide) {
        // Peaks front + back
        ovalO(ctx, dx + 13, y + 10, 4.5, 2.5, '#5A6860')
        ovalO(ctx, dx - 13, y + 10, 4.5, 2.5, '#5A6860')
        // Check pattern hint
        ctx.globalAlpha = 0.25
        for (let i = -2; i <= 2; i++) line(ctx, dx - 11 + i * 5, y + 6, dx - 11 + i * 5, y + 12, '#000', 0.8)
        ctx.globalAlpha = 1.0
      } else {
        ovalO(ctx, dx + dir * 14, y + 11, 5, 2.5, '#5A6860')
      }
      break
    }

    case 'green_hood':
      // Hood rim around face
      oval(ctx, cx, y + 18, r + 3.5, 5, OL)
      oval(ctx, cx, y + 18, r + 2.5, 3.5, char.outfit)
      break

    case 'bear_ears':
      // Already drawn behind head above
      break
  }
}

// ── Legs & feet ────────────────────────────────────────────────────────────────

function drawLegs(ctx, char, cx, oy, lL, lR, side) {
  const lx  = side ? cx - 5 : cx - 6
  const rx  = side ? cx + 5 : cx + 6
  const legR = 3.5   // round legs — equal rx/ry for a soft blob look

  ctx.strokeStyle = OL; ctx.lineWidth = 1.2

  // Left leg
  ctx.fillStyle = char.feet
  ctx.beginPath(); ctx.ellipse(lx, oy + 51 + lL, legR, legR + 1, 0, 0, Math.PI * 2)
  ctx.fill(); ctx.stroke()
  // Right leg
  ctx.beginPath(); ctx.ellipse(rx, oy + 51 + lR, legR, legR + 1, 0, 0, Math.PI * 2)
  ctx.fill(); ctx.stroke()

  // Feet — small flat ovals, slightly forward of each leg
  ctx.fillStyle = char.feetD
  ctx.beginPath(); ctx.ellipse(lx - 1, oy + 57, 5, 2.2, 0, 0, Math.PI * 2)
  ctx.fill(); ctx.stroke()
  ctx.beginPath(); ctx.ellipse(rx + 1, oy + 57, 5, 2.2, 0, 0, Math.PI * 2)
  ctx.fill(); ctx.stroke()
}

// ── Satchel (character-specific) ──────────────────────────────────────────────

function drawSatchel(ctx, char, cx, y, view) {
  // Sherlock has a magnifying-glass detail; Pooh has a honey pot; others have a bag
  const isSide = view === 'left' || view === 'right'
  const dir    = view === 'right' ? 1 : -1

  let sx, sy
  if (!isSide) {
    sx = char.style === 'armour' ? cx + 6 : cx + 5
    sy = y + 35
  } else {
    sx = cx - dir * 8
    sy = y + 37
  }

  if (char.style === 'red_shirt') {
    // Honey pot (Pooh)
    rrectO(ctx, sx - 4, sy, 8, 8, 2, '#E8C040')
    rrectO(ctx, sx - 3, sy - 3, 6, 3, 1, '#C8A020')
    // Honey drip
    ctx.globalAlpha = 0.6
    circ(ctx, sx + 2, sy + 9, 1.5, '#F0D040')
    ctx.globalAlpha = 1.0
  } else if (char.style === 'detective_coat') {
    // Magnifying glass
    circO(ctx, sx + 2, sy + 2, 4.5, 'rgba(160,200,220,0.6)')
    line(ctx, sx + 5, sy + 6, sx + 8, sy + 10, OL, 1.5)
  } else {
    rrectO(ctx, sx - 4, sy, 9, 7, 2, '#B89858')
    rrectO(ctx, sx - 3, sy + 1, 7, 5, 1, '#9A7838')
    circ(ctx, sx + 1, sy + 1, 1.5, '#F0D860')
  }
}

// ── Shadow ─────────────────────────────────────────────────────────────────────

function drawShadow(ctx, cx, oy) {
  ctx.globalAlpha = 0.12
  oval(ctx, cx, oy + 61, 14, 3.5, '#000000')
  ctx.globalAlpha = 1.0
}

// ── Composite drawing functions ────────────────────────────────────────────────

function drawFront(ctx, char, cx, oy, opts = {}) {
  const { bob = 0, legL = 0, legR = 0, mouthOpen = false, blinking = false } = opts
  const y = oy + bob

  drawShadow(ctx, cx, oy)
  drawOutfitFront(ctx, char, cx, y)
  drawHead(ctx, char, cx, y, 'front', blinking)

  if (mouthOpen) {
    ctx.fillStyle = '#301010'
    ctx.beginPath(); ctx.ellipse(cx, y + 23, 3, 2, 0, 0, Math.PI); ctx.fill()
  }

  drawSatchel(ctx, char, cx, y, 'front')
  drawLegs(ctx, char, cx, oy, legL, legR, false)
}

function drawSide(ctx, char, cx, oy, facingLeft, opts = {}) {
  const { bob = 0, legL = 0, legR = 0 } = opts
  const dir = facingLeft ? -1 : 1
  const y   = oy + bob

  drawShadow(ctx, cx, oy)
  drawOutfitSide(ctx, char, cx, y, dir)
  drawHead(ctx, char, cx, y, facingLeft ? 'left' : 'right', false)
  drawSatchel(ctx, char, cx, y, facingLeft ? 'left' : 'right')
  drawLegs(ctx, char, cx, oy, legL, legR, true)
}

function drawBack(ctx, char, cx, oy, opts = {}) {
  const { legL = 0, legR = 0 } = opts

  drawShadow(ctx, cx, oy)
  drawOutfitBack(ctx, char, cx, oy)
  drawHead(ctx, char, cx, oy, 'back', false)
  drawLegs(ctx, char, cx, oy, legL, legR, false)
}

// ── Per-frame dispatch ─────────────────────────────────────────────────────────

function drawFrame(ctx, charId, animKey, frameIdx, ox, oy) {
  const char = CHARS[charId]
  if (!char) return

  const f  = frameIdx
  const cx = ox + 32

  switch (animKey) {
    case 'idle':
      drawFront(ctx, char, cx, oy, { bob: (f === 1 || f === 3) ? 1 : 0 })
      break

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
      drawSide(ctx, char, cx, oy, true,  { bob: Math.abs(lL) > 1 ? -1 : 0, legL: lL, legR: lR })
      break
    }

    case 'walk_right': {
      const [lL, lR] = WALK8[f] ?? [0, 0]
      drawSide(ctx, char, cx, oy, false, { bob: Math.abs(lL) > 1 ? -1 : 0, legL: lL, legR: lR })
      break
    }

    case 'talk':
      drawFront(ctx, char, cx, oy, {
        mouthOpen: f === 1 || f === 3,
        bob:       f === 1 || f === 3 ? -1 : 0,
      })
      break

    case 'blink':
      drawFront(ctx, char, cx, oy, { blinking: f === 1 })
      break
  }
}

// ── Public API ─────────────────────────────────────────────────────────────────

export function generateSpriteSheet(charId) {
  const canvas  = document.createElement('canvas')
  canvas.width  = FRAME * COLS   // 512
  canvas.height = FRAME * ROWS   // 448
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

const CACHE_VERSION = 'v6'

export function getCachedSprite(charId) {
  try { return localStorage.getItem(`haven_sprite_${CACHE_VERSION}_${charId}`) }
  catch { return null }
}

export function setCachedSprite(charId, dataUrl) {
  try { localStorage.setItem(`haven_sprite_${CACHE_VERSION}_${charId}`, dataUrl) }
  catch {}
}
