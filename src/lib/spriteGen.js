/**
 * Procedural sprite sheet generator — Cookie Run Kingdom-inspired (v9).
 *
 * Key design:
 *   • Large round head separate from body (chibi proportions)
 *   • Smooth bezier-curved body/outfit silhouette per character style
 *   • Stubby oval arms that swing during walk animation
 *   • Chunky rounded legs with small oval feet
 *   • Larger expressive eyes (r=4.5) — two in front, one in side profile
 *   • Character-appropriate nose/snout/facial feature
 *   • Vibrant saturated color palette
 *   • Thick 2px outlines throughout
 *
 * Layout per 64×64 cell (cx = ox+32):
 *   Head:  center (cx, oy+12)  r=11
 *   Body:  oy+20 → oy+48
 *   Arms:  shoulder (cx±13, oy+27), length 13px
 *   Legs:  oy+46 → oy+61
 *   Shadow oy+62
 *
 * Sheet: 512×448 px  (8 cols × 7 rows, 64×64 per frame)
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

// ── Character registry ─────────────────────────────────────────────────────────
export const STYLES  = ['dress','armour','battle_robe','detective_coat','hooded_tunic','red_shirt']
export const SPECIALS = ['elf_ears','topknot','golden_headband','deerstalker','green_hood','bear_ears']

const CHARS = {
  elf_princess: {
    // Pale lavender skin, hot-pink bell dress, gold crown + elf ears
    body: '#D8C8F0', bodyD: '#B8A0D8',
    eyes: '#5040D0',
    outfit: '#E83878', outfitD: '#B82058',
    trim: '#FFE040', collar: '#9868C8',
    feet: '#9060C0', feetD: '#6840A0',
    faceType: 'elf_nose', noseColor: '#E8A8C8',
    browStyle: 'neutral', special: 'elf_ears', style: 'dress',
  },
  warrior_mulan: {
    // Warm peach skin, bright red armour, gold trim, topknot
    body: '#E8B880', bodyD: '#C89050',
    eyes: '#2A1010',
    outfit: '#D02020', outfitD: '#901010',
    trim: '#F8C030', collar: '#500808',
    feet: '#401010', feetD: '#280808',
    faceType: 'human_nose', noseColor: '#B07050',
    browStyle: 'furrowed', special: 'topknot', style: 'armour',
  },
  sun_wukong: {
    // Golden fur, deep-orange battle robe, gold headband + monkey face
    body: '#E8C030', bodyD: '#C09010',
    eyes: '#401808',
    outfit: '#D06010', outfitD: '#A04008',
    trim: '#FFE040', collar: '#903808',
    feet: '#804010', feetD: '#502808',
    faceType: 'monkey_snout', snoutColor: '#F0D060',
    browStyle: 'raised', special: 'golden_headband', style: 'battle_robe',
  },
  sherlock_holmes: {
    // Slate-blue skin, deep charcoal coat, deerstalker cap + aquiline nose
    body: '#8898B0', bodyD: '#607080',
    eyes: '#283040',
    outfit: '#303848', outfitD: '#1C2230',
    trim: '#C0A060', collar: '#1C2230',
    feet: '#202028', feetD: '#141018',
    faceType: 'aquiline_nose', noseColor: '#8A7868',
    browStyle: 'furrowed', special: 'deerstalker', style: 'detective_coat',
  },
  robin_hood: {
    // Olive skin, deep forest-green tunic + hood, quiver on back
    body: '#90A050', bodyD: '#687830',
    eyes: '#1C1408',
    outfit: '#3A6018', outfitD: '#284010',
    trim: '#A06030', collar: '#304810',
    feet: '#402010', feetD: '#281408',
    faceType: 'human_nose', noseColor: '#608030',
    browStyle: 'neutral', special: 'green_hood', style: 'hooded_tunic',
  },
  winnie_the_pooh: {
    // Honey-gold fur, bright-red crop shirt, bear ears + bear snout
    body: '#F0C828', bodyD: '#C89010',
    eyes: '#201010',
    outfit: '#E82020', outfitD: '#A01010',
    trim: '#F09020', collar: '#A03010',
    feet: '#A05818', feetD: '#703808',
    faceType: 'bear_snout', snoutColor: '#F8E8A0',
    browStyle: 'neutral', special: 'bear_ears', style: 'red_shirt', plump: true,
  },
}

export function registerCharacter(id, def) {
  if (!STYLES.includes(def.style))                    def = { ...def, style: 'dress' }
  if (def.special && !SPECIALS.includes(def.special)) def = { ...def, special: null }
  CHARS[id] = def
}
export function createCharDef(overrides = {}) {
  return {
    body:'#8898A8', bodyD:'#607080', eyes:'#181010',
    outfit:'#4A5060', outfitD:'#303540', trim:'#C8A840',
    collar:'#303038', feet:'#282030', feetD:'#181020',
    faceType:'human_nose', noseColor:'#C09080', browStyle:'neutral',
    special:null, style:'dress', plump:false, ...overrides,
  }
}

// ── Walk-cycle animation tables ────────────────────────────────────────────────
const WALK8 = [[-3,2],[-2,3],[-1,2],[0,1],[3,-2],[2,-3],[1,-2],[0,-1]]
const WALK4 = [[-2,2],[0,3],[2,-2],[0,-3]]

// Arm swing angles [leftArm, rightArm] in radians per WALK8 frame
// Positive = arm swings forward (direction of travel)
const ARM8 = [
  [-0.38, 0.38],[-0.28, 0.28],[-0.14, 0.14],[-0.04, 0.04],
  [ 0.38,-0.38],[ 0.28,-0.28],[ 0.14,-0.14],[ 0.04,-0.04],
]
const ARM4 = [[-0.22,0.22],[-0.06,0.06],[0.22,-0.22],[0.06,-0.06]]

// ── Canvas primitives ──────────────────────────────────────────────────────────

const OL = '#0C0808'

function circ(ctx,cx,cy,r,c){ctx.fillStyle=c;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill()}
function oval(ctx,cx,cy,rx,ry,c){ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);ctx.fill()}
function line(ctx,x1,y1,x2,y2,c,lw=1){ctx.strokeStyle=c;ctx.lineWidth=lw;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}
// Cross-platform roundRect path (node-canvas compat)
function rrPath(ctx,x,y,w,h,r){
  if(ctx.roundRect){ctx.roundRect(x,y,w,h,r);return}
  const a=Array.isArray(r)?r:[r,r,r,r];const[tl,tr,br,bl]=a.map(v=>Math.min(v,w/2,h/2))
  ctx.moveTo(x+tl,y);ctx.lineTo(x+w-tr,y);ctx.arcTo(x+w,y,x+w,y+tr,tr)
  ctx.lineTo(x+w,y+h-br);ctx.arcTo(x+w,y+h,x+w-br,y+h,br)
  ctx.lineTo(x+bl,y+h);ctx.arcTo(x,y+h,x,y+h-bl,bl)
  ctx.lineTo(x,y+tl);ctx.arcTo(x,y,x+tl,y,tl);ctx.closePath()
}
function rrect(ctx,x,y,w,h,r,c){ctx.fillStyle=c;ctx.beginPath();rrPath(ctx,x,y,w,h,r);ctx.fill()}
function rrectStroke(ctx,x,y,w,h,r,fill,sw=2){
  ctx.fillStyle=fill;ctx.strokeStyle=OL;ctx.lineWidth=sw;ctx.beginPath();rrPath(ctx,x,y,w,h,r);ctx.fill();ctx.stroke()
}
function circStroke(ctx,cx,cy,r,fill,sw=2){
  ctx.fillStyle=fill;ctx.strokeStyle=OL;ctx.lineWidth=sw;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();ctx.stroke()
}
function ovalStroke(ctx,cx,cy,rx,ry,fill,sw=2){
  ctx.fillStyle=fill;ctx.strokeStyle=OL;ctx.lineWidth=sw;ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);ctx.fill();ctx.stroke()
}

// ── Eyes ───────────────────────────────────────────────────────────────────────

function drawEye(ctx, cx, cy, r, pupilColor) {
  // White sclera
  ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = OL; ctx.lineWidth = 1.8
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fill(); ctx.stroke()
  // Iris + pupil
  ctx.fillStyle = pupilColor
  ctx.beginPath(); ctx.arc(cx, cy + r*0.1, r*0.62, 0, Math.PI*2); ctx.fill()
  // Inner gleam
  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  ctx.beginPath(); ctx.arc(cx - r*0.3, cy - r*0.3, r*0.22, 0, Math.PI*2); ctx.fill()
  // Small bottom gleam
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.beginPath(); ctx.arc(cx + r*0.2, cy + r*0.3, r*0.14, 0, Math.PI*2); ctx.fill()
}

function drawEyeBlink(ctx, cx, cy, r) {
  ctx.strokeStyle = OL; ctx.lineWidth = 2.2; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI*1.1, Math.PI*1.9); ctx.stroke()
}

// ── Eyebrows ───────────────────────────────────────────────────────────────────

function drawEyebrows(ctx, char, cx, y, dir) {
  const brow = char.browStyle || 'neutral'
  ctx.save(); ctx.strokeStyle = char.bodyD; ctx.lineWidth = 1.6; ctx.lineCap = 'round'
  if (dir === 0) {
    const by = y + 6
    // left brow
    ctx.beginPath()
    if (brow==='furrowed') { ctx.moveTo(cx-10, by-1); ctx.lineTo(cx-2, by+2) }
    else if (brow==='raised') { ctx.moveTo(cx-10, by+1); ctx.quadraticCurveTo(cx-6,by-3,cx-2,by) }
    else { ctx.moveTo(cx-10, by); ctx.lineTo(cx-2, by-1) }
    ctx.stroke()
    // right brow
    ctx.beginPath()
    if (brow==='furrowed') { ctx.moveTo(cx+2, by+2); ctx.lineTo(cx+10, by-1) }
    else if (brow==='raised') { ctx.moveTo(cx+2, by); ctx.quadraticCurveTo(cx+6,by-3,cx+10,by+1) }
    else { ctx.moveTo(cx+2, by-1); ctx.lineTo(cx+10, by) }
    ctx.stroke()
  } else {
    const ex = cx - dir*4, by = y + 6
    ctx.beginPath()
    if (brow==='furrowed') { ctx.moveTo(ex-dir*5, by-1); ctx.lineTo(ex+dir*5, by+2) }
    else if (brow==='raised') { ctx.moveTo(ex-5, by+1); ctx.quadraticCurveTo(ex, by-3, ex+5, by) }
    else { ctx.moveTo(ex-5, by); ctx.lineTo(ex+5, by-1) }
    ctx.stroke()
  }
  ctx.restore()
}

// ── Facial features (nose / snout / beak) ─────────────────────────────────────
// dir: 0=front, -1=left, 1=right

function drawFacialFeature(ctx, char, cx, y, dir, mouthOpen) {
  const ft = char.faceType || 'human_nose'

  if (ft === 'beak') {
    ctx.strokeStyle = OL; ctx.lineWidth = 1.8
    if (dir === 0) {
      ctx.fillStyle = char.beakColor || '#806048'
      ctx.beginPath(); ctx.moveTo(cx-4,y+18); ctx.lineTo(cx+4,y+18); ctx.lineTo(cx,y+24); ctx.closePath(); ctx.fill(); ctx.stroke()
    } else {
      ctx.fillStyle = char.beakColor || '#806048'
      ctx.beginPath(); ctx.moveTo(cx+dir*9,y+13); ctx.lineTo(cx+dir*20,y+17); ctx.lineTo(cx+dir*9,y+20); ctx.closePath(); ctx.fill(); ctx.stroke()
    }
    return
  }

  if (ft === 'monkey_snout') {
    if (dir === 0) {
      ovalStroke(ctx, cx, y+18, 8, 5.5, char.snoutColor||'#E8C878', 1.5)
      ctx.fillStyle = OL
      ctx.beginPath(); ctx.ellipse(cx-2.5,y+17,1.5,1.2,0,0,Math.PI*2); ctx.fill()
      ctx.beginPath(); ctx.ellipse(cx+2.5,y+17,1.5,1.2,0,0,Math.PI*2); ctx.fill()
      if (mouthOpen) {
        ctx.fillStyle='#301010'; ctx.beginPath(); ctx.arc(cx,y+23,4,0,Math.PI); ctx.fill()
        ctx.fillStyle='rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.arc(cx,y+23,3,0,Math.PI); ctx.fill()
      }
    } else {
      const sx = cx + dir*10
      ovalStroke(ctx, sx, y+18, 5.5, 4.5, char.snoutColor||'#E8C878', 1.5)
      ctx.fillStyle = OL; ctx.beginPath(); ctx.ellipse(sx+dir*2,y+17,1.5,1.2,0,0,Math.PI*2); ctx.fill()
    }
    return
  }

  if (ft === 'bear_snout') {
    if (dir === 0) {
      ovalStroke(ctx, cx, y+19, 9, 6.5, char.snoutColor||'#F0D898', 1.5)
      ovalStroke(ctx, cx, y+16, 3.5, 2.5, '#201010', 1)
      if (mouthOpen) {
        ctx.strokeStyle='#301010'; ctx.lineWidth=1.5; ctx.lineCap='round'
        ctx.beginPath(); ctx.arc(cx, y+23, 3.5, 0, Math.PI); ctx.stroke()
      }
    } else {
      const sx = cx + dir*11
      ovalStroke(ctx, sx, y+19, 7, 5.5, char.snoutColor||'#F0D898', 1.5)
      ovalStroke(ctx, sx+dir*3, y+17, 2.5, 2, '#201010', 1)
    }
    return
  }

  if (ft === 'aquiline_nose') {
    if (dir === 0) {
      ctx.fillStyle = char.noseColor||'#9A8878'; ctx.strokeStyle = OL; ctx.lineWidth = 0.8
      ctx.beginPath(); ctx.moveTo(cx,y+11); ctx.lineTo(cx-4,y+20); ctx.lineTo(cx+4,y+20); ctx.closePath(); ctx.fill(); ctx.stroke()
      ctx.globalAlpha=0.5; ctx.fillStyle=OL
      ctx.beginPath(); ctx.ellipse(cx-3,y+19,1.4,1,0,0,Math.PI*2); ctx.fill()
      ctx.beginPath(); ctx.ellipse(cx+3,y+19,1.4,1,0,0,Math.PI*2); ctx.fill()
      ctx.globalAlpha=1.0
      _drawMouth(ctx, char, cx, y, mouthOpen)
    } else {
      ctx.fillStyle = char.noseColor||'#9A8878'; ctx.strokeStyle = OL; ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.moveTo(cx+dir*5,y+11); ctx.lineTo(cx+dir*14,y+16)
      ctx.lineTo(cx+dir*10,y+20); ctx.lineTo(cx+dir*4,y+20)
      ctx.closePath(); ctx.fill(); ctx.stroke()
    }
    return
  }

  if (ft === 'elf_nose') {
    if (dir === 0) {
      ctx.fillStyle = char.noseColor||'#E0A8B8'
      ctx.beginPath(); ctx.arc(cx, y+17, 2.5, 0, Math.PI*2); ctx.fill()
      _drawMouth(ctx, char, cx, y, mouthOpen)
    } else {
      const nx = cx + dir*8; ctx.fillStyle = char.noseColor||'#E0A8B8'
      ctx.beginPath(); ctx.arc(nx, y+17, 2.5, -Math.PI/2*dir, Math.PI/2*dir); ctx.closePath(); ctx.fill()
    }
    return
  }

  // human_nose (default)
  if (dir === 0) {
    ctx.fillStyle = char.noseColor||'#C09080'
    ctx.beginPath(); ctx.ellipse(cx, y+17, 3, 2, 0, 0, Math.PI*2); ctx.fill()
    _drawMouth(ctx, char, cx, y, mouthOpen)
  } else {
    const nx = cx + dir*8; ctx.fillStyle = char.noseColor||'#C09080'
    ctx.beginPath(); ctx.arc(nx, y+17, 3, -Math.PI/2*dir, Math.PI/2*dir); ctx.closePath(); ctx.fill()
  }
}

function _drawMouth(ctx, char, cx, y, open) {
  ctx.save()
  if (!open) {
    ctx.strokeStyle = char.bodyD; ctx.lineWidth = 1.2; ctx.lineCap = 'round'; ctx.globalAlpha = 0.4
    ctx.beginPath(); ctx.moveTo(cx-3, y+21); ctx.lineTo(cx+3, y+21); ctx.stroke()
  } else {
    ctx.fillStyle = '#301010'; ctx.beginPath(); ctx.ellipse(cx,y+21,3.5,2.5,0,0,Math.PI*2); ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.ellipse(cx,y+20,2.5,1.2,0,0,Math.PI); ctx.fill()
  }
  ctx.restore()
}

// ── Round head ─────────────────────────────────────────────────────────────────

function drawHead(ctx, char, cx, cy, view, blinking, mouthOpen) {
  const r = 11
  const dir = view === 'right' ? 1 : view === 'left' ? -1 : 0
  const ft  = char.faceType || 'human_nose'

  // Head circle
  ctx.fillStyle = char.body; ctx.strokeStyle = OL; ctx.lineWidth = 2
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fill(); ctx.stroke()

  // Subtle head highlight
  ctx.globalAlpha = 0.18; oval(ctx, cx - r*0.2, cy - r*0.35, r*0.5, r*0.28, '#FFFFFF'); ctx.globalAlpha = 1.0

  // Face features
  drawFacialFeature(ctx, char, cx, cy, dir, mouthOpen)
  drawEyebrows(ctx, char, cx, cy, dir)

  if (dir === 0) {
    // Front: two eyes
    if (blinking) {
      drawEyeBlink(ctx, cx-5, cy-2, 4.5)
      if (ft !== 'beak') drawEyeBlink(ctx, cx+5, cy-2, 4.5)
    } else if (ft === 'beak') {
      drawEye(ctx, cx+3, cy-2, 5, char.eyes)
    } else {
      drawEye(ctx, cx-5, cy-2, 4.5, char.eyes)
      drawEye(ctx, cx+5, cy-2, 4.5, char.eyes)
    }
    // Rosy cheeks
    ctx.globalAlpha = 0.18; oval(ctx, cx+9, cy+5, 4.5, 2.5, '#FF8898'); ctx.globalAlpha = 1.0
  } else {
    // Side: one eye on face side (away from body)
    drawEye(ctx, cx - dir*3, cy-2, 5, char.eyes)
    ctx.globalAlpha = 0.16; oval(ctx, cx - dir*8, cy+5, 3.5, 2, '#FF8898'); ctx.globalAlpha = 1.0
  }
}

// ── Arms ───────────────────────────────────────────────────────────────────────

function drawArm(ctx, char, shoulderX, shoulderY, swingAngle) {
  const W = 6, SLEEVE = 9, HAND = 5
  ctx.save()
  ctx.translate(shoulderX, shoulderY)
  ctx.rotate(swingAngle)

  // Sleeve (outfit color)
  ctx.fillStyle = char.outfit; ctx.strokeStyle = OL; ctx.lineWidth = 1.5
  ctx.beginPath(); rrPath(ctx, -W/2, 0, W, SLEEVE, [3,3,1,1]); ctx.fill(); ctx.stroke()

  // Hand (skin color)
  ctx.fillStyle = char.body; ctx.strokeStyle = OL; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.arc(0, SLEEVE + HAND * 0.5, HAND, 0, Math.PI*2); ctx.fill(); ctx.stroke()

  ctx.restore()
}

// ── Legs ───────────────────────────────────────────────────────────────────────

function drawLegs(ctx, char, cx, y, lL, lR) {
  const W = 6, H = 13
  const lx = cx - 5, rx = cx + 5

  // Legs (rounded rect)
  ctx.fillStyle = char.feetD; ctx.strokeStyle = OL; ctx.lineWidth = 1.5
  ctx.beginPath(); rrPath(ctx, lx-W/2, y+lL, W, H, [3,3,2,2]); ctx.fill(); ctx.stroke()
  ctx.beginPath(); rrPath(ctx, rx-W/2, y+lR, W, H, [3,3,2,2]); ctx.fill(); ctx.stroke()

  // Oval feet / shoes
  ctx.fillStyle = char.feet; ctx.strokeStyle = OL; ctx.lineWidth = 1.2
  ctx.beginPath(); ctx.ellipse(lx-1, y+lL+H+2, 7, 3.5, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke()
  ctx.beginPath(); ctx.ellipse(rx+1, y+lR+H+2, 7, 3.5, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke()
}

// ── Ground shadow ──────────────────────────────────────────────────────────────

function drawShadow(ctx, cx, oy) {
  ctx.globalAlpha = 0.12; oval(ctx, cx, oy+62, 15, 4, '#000000'); ctx.globalAlpha = 1.0
}

// ── Body / outfit (front) ─────────────────────────────────────────────────────
// y = body top (oy+20)

function drawBodyFront(ctx, char, cx, y) {
  ctx.strokeStyle = OL; ctx.lineWidth = 2

  switch (char.style) {
    case 'dress': {
      // Bell-skirt dress silhouette
      ctx.fillStyle = char.outfit
      ctx.beginPath()
      ctx.moveTo(cx - 10, y)
      ctx.bezierCurveTo(cx-13, y+7,  cx-7,  y+13, cx-7,  y+15)
      ctx.bezierCurveTo(cx-7,  y+17, cx-16, y+22, cx-18, y+28)
      ctx.lineTo(cx + 18, y + 28)
      ctx.bezierCurveTo(cx+16, y+22, cx+7,  y+17, cx+7,  y+15)
      ctx.bezierCurveTo(cx+7,  y+13, cx+13, y+7,  cx+10, y)
      ctx.closePath(); ctx.fill(); ctx.stroke()
      // Skirt fold shading
      ctx.globalAlpha = 0.18; ctx.fillStyle = char.outfitD
      ctx.beginPath(); ctx.moveTo(cx-8,y+17); ctx.lineTo(cx-18,y+28); ctx.lineTo(cx-9,y+28); ctx.closePath(); ctx.fill()
      ctx.beginPath(); ctx.moveTo(cx+8,y+17); ctx.lineTo(cx+18,y+28); ctx.lineTo(cx+9,y+28); ctx.closePath(); ctx.fill()
      ctx.globalAlpha = 1.0
      // Waist trim + gem
      rrectStroke(ctx, cx-9, y+13, 18, 3, 1, char.trim, 1)
      circStroke(ctx, cx, y+9, 2, char.trim, 1)
      break
    }

    case 'armour': {
      // Broad chest plate + structured lower
      ctx.fillStyle = char.outfit
      ctx.beginPath()
      ctx.moveTo(cx - 12, y)
      ctx.bezierCurveTo(cx-15, y+5,  cx-12, y+14, cx-11, y+22)
      ctx.lineTo(cx-12, y+28); ctx.lineTo(cx+12, y+28)
      ctx.lineTo(cx+11, y+22)
      ctx.bezierCurveTo(cx+12, y+14, cx+15, y+5,  cx+12, y)
      ctx.closePath(); ctx.fill(); ctx.stroke()
      // Plate highlight
      ctx.globalAlpha = 0.14; oval(ctx, cx-2, y+8, 4, 7, '#FFFFFF'); ctx.globalAlpha = 1.0
      // Gold trim lines
      line(ctx, cx-11, y+8,  cx+11, y+8,  char.trim, 1.5)
      line(ctx, cx-11, y+18, cx+11, y+18, char.trim, 1.5)
      line(ctx, cx,    y+2,  cx,    y+26,  char.outfitD, 1)
      // Lower skirt
      rrectStroke(ctx, cx-12, y+22, 24, 6, [0,0,3,3], char.outfitD, 1.5)
      // Collar
      rrectStroke(ctx, cx-8, y, 16, 5, 2, char.collar, 1.2)
      break
    }

    case 'battle_robe': {
      // Flowing wide robe
      ctx.fillStyle = char.outfit
      ctx.beginPath()
      ctx.moveTo(cx - 11, y)
      ctx.bezierCurveTo(cx-14, y+8,  cx-13, y+18, cx-14, y+28)
      ctx.lineTo(cx + 14, y + 28)
      ctx.bezierCurveTo(cx+13, y+18, cx+14, y+8,  cx+11, y)
      ctx.closePath(); ctx.fill(); ctx.stroke()
      // Gold sash
      rrectStroke(ctx, cx-14, y+14, 28, 5, 2, char.trim, 1.5)
      // Robe fold shadows
      ctx.globalAlpha = 0.20; ctx.fillStyle = char.outfitD
      ctx.beginPath(); ctx.moveTo(cx-14,y+19); ctx.lineTo(cx-9,y+1); ctx.lineTo(cx-5,y+28); ctx.closePath(); ctx.fill()
      ctx.beginPath(); ctx.moveTo(cx+14,y+19); ctx.lineTo(cx+9,y+1); ctx.lineTo(cx+5,y+28); ctx.closePath(); ctx.fill()
      ctx.globalAlpha = 1.0
      break
    }

    case 'detective_coat': {
      // Long charcoal coat
      ctx.fillStyle = char.outfit
      ctx.beginPath()
      ctx.moveTo(cx - 12, y)
      ctx.bezierCurveTo(cx-14, y+6, cx-11, y+16, cx-12, y+28)
      ctx.lineTo(cx + 12, y + 28)
      ctx.bezierCurveTo(cx+11, y+16, cx+14, y+6, cx+12, y)
      ctx.closePath(); ctx.fill(); ctx.stroke()
      // V-lapels
      ctx.fillStyle = '#505060'
      ctx.beginPath(); ctx.moveTo(cx,y+1); ctx.lineTo(cx-9,y+15); ctx.lineTo(cx,y+15); ctx.closePath(); ctx.fill()
      ctx.beginPath(); ctx.moveTo(cx,y+1); ctx.lineTo(cx+9,y+15); ctx.lineTo(cx,y+15); ctx.closePath(); ctx.fill()
      // Waistcoat strip
      ctx.fillStyle = '#706848'; ctx.beginPath(); ctx.rect(cx-3,y+1,6,26); ctx.fill()
      // Buttons
      for (let i=0; i<3; i++) circStroke(ctx, cx, y+5+i*7, 1.5, char.trim, 1)
      break
    }

    case 'hooded_tunic': {
      // Straight athletic tunic with belt
      ctx.fillStyle = char.outfit
      ctx.beginPath()
      ctx.moveTo(cx - 11, y)
      ctx.bezierCurveTo(cx-13, y+6, cx-11, y+14, cx-11, y+28)
      ctx.lineTo(cx + 11, y + 28)
      ctx.bezierCurveTo(cx+11, y+14, cx+13, y+6, cx+11, y)
      ctx.closePath(); ctx.fill(); ctx.stroke()
      // Belt
      rrectStroke(ctx, cx-12, y+17, 24, 5, 2, char.trim, 1.5)
      rrectStroke(ctx, cx-3, y+16, 6, 7, 1, '#D8C060', 1)
      // Hood drapes at shoulder sides
      ctx.fillStyle = char.outfitD; ctx.strokeStyle = OL; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(cx-11,y); ctx.lineTo(cx-16,y); ctx.lineTo(cx-14,y+20); ctx.lineTo(cx-11,y+20); ctx.closePath(); ctx.fill(); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(cx+11,y); ctx.lineTo(cx+16,y); ctx.lineTo(cx+14,y+20); ctx.lineTo(cx+11,y+20); ctx.closePath(); ctx.fill(); ctx.stroke()
      break
    }

    case 'red_shirt': {
      // Round honey belly exposed below short shirt
      ovalStroke(ctx, cx, y+22, 14, 11, char.bodyD, 1.5)
      // Short red shirt
      ctx.fillStyle = char.outfit
      ctx.beginPath()
      ctx.moveTo(cx - 13, y)
      ctx.bezierCurveTo(cx-16, y+5, cx-14, y+13, cx-14, y+17)
      ctx.lineTo(cx + 14, y + 17)
      ctx.bezierCurveTo(cx+14, y+13, cx+16, y+5, cx+13, y)
      ctx.closePath(); ctx.fill(); ctx.stroke()
      // Shirt hem
      line(ctx, cx-14, y+17, cx+14, y+17, OL, 1.8)
      break
    }
  }
}

// ── Body / outfit (side) ──────────────────────────────────────────────────────

function drawBodySide(ctx, char, cx, y, dir) {
  ctx.strokeStyle = OL; ctx.lineWidth = 2

  switch (char.style) {
    case 'dress': {
      ctx.fillStyle = char.outfit
      ctx.beginPath()
      ctx.moveTo(cx - 9, y)
      ctx.bezierCurveTo(cx-11, y+7,  cx-6,  y+13, cx-6,  y+15)
      ctx.bezierCurveTo(cx-6,  y+17, cx+dir*12, y+22, cx+dir*14, y+28)
      ctx.lineTo(cx - dir*4, y + 28)
      ctx.bezierCurveTo(cx-dir*3, y+16, cx+6, y+12, cx+9, y)
      ctx.closePath(); ctx.fill(); ctx.stroke()
      rrectStroke(ctx, cx-8, y+13, 16, 3, 1, char.trim, 1)
      break
    }
    case 'armour': {
      ctx.fillStyle = char.outfit
      ctx.beginPath()
      ctx.moveTo(cx-11, y)
      ctx.bezierCurveTo(cx-13,y+5, cx-11,y+14, cx-10,y+22)
      ctx.lineTo(cx-10,y+28); ctx.lineTo(cx+10,y+28); ctx.lineTo(cx+10,y+22)
      ctx.bezierCurveTo(cx+11,y+14, cx+13,y+5, cx+11,y)
      ctx.closePath(); ctx.fill(); ctx.stroke()
      line(ctx, cx-10, y+8, cx+10, y+8, char.trim, 1.5)
      line(ctx, cx-10, y+18, cx+10, y+18, char.trim, 1.5)
      rrectStroke(ctx, cx-10, y+22, 20, 6, [0,0,3,3], char.outfitD, 1.5)
      rrectStroke(ctx, cx-8, y, 16, 5, 2, char.collar, 1.2)
      break
    }
    case 'battle_robe': {
      ctx.fillStyle = char.outfit
      ctx.beginPath()
      ctx.moveTo(cx-10, y)
      ctx.bezierCurveTo(cx-12, y+8, cx+dir*12, y+18, cx+dir*13, y+28)
      ctx.lineTo(cx-dir*4, y+28)
      ctx.bezierCurveTo(cx-dir*4, y+16, cx+10, y+8, cx+10, y)
      ctx.closePath(); ctx.fill(); ctx.stroke()
      rrectStroke(ctx, cx-12, y+14, 24, 5, 2, char.trim, 1.5)
      break
    }
    case 'detective_coat': {
      ctx.fillStyle = char.outfit
      ctx.beginPath()
      ctx.moveTo(cx-11, y)
      ctx.bezierCurveTo(cx-13,y+6, cx-10,y+16, cx-11,y+28)
      ctx.lineTo(cx+11,y+28)
      ctx.bezierCurveTo(cx+10,y+16, cx+13,y+6, cx+11,y)
      ctx.closePath(); ctx.fill(); ctx.stroke()
      ctx.fillStyle = '#706848'; ctx.beginPath(); ctx.rect(cx+dir*2-2,y+2,5,24); ctx.fill()
      for(let i=0;i<3;i++) circStroke(ctx, cx+dir*2, y+5+i*7, 1.5, char.trim, 1)
      break
    }
    case 'hooded_tunic': {
      ctx.fillStyle = char.outfit
      ctx.beginPath()
      ctx.moveTo(cx-10,y)
      ctx.bezierCurveTo(cx-12,y+6, cx-10,y+14, cx-10,y+28)
      ctx.lineTo(cx+10,y+28)
      ctx.bezierCurveTo(cx+10,y+14, cx+12,y+6, cx+10,y)
      ctx.closePath(); ctx.fill(); ctx.stroke()
      rrectStroke(ctx, cx-11, y+17, 22, 5, 2, char.trim, 1.5)
      ctx.fillStyle = char.outfitD; ctx.strokeStyle = OL; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(cx-dir*10,y); ctx.lineTo(cx-dir*16,y); ctx.lineTo(cx-dir*13,y+20); ctx.lineTo(cx-dir*10,y+20); ctx.closePath(); ctx.fill(); ctx.stroke()
      break
    }
    case 'red_shirt': {
      ovalStroke(ctx, cx, y+22, 13, 11, char.bodyD, 1.5)
      ctx.fillStyle = char.outfit
      ctx.beginPath()
      ctx.moveTo(cx-12,y)
      ctx.bezierCurveTo(cx-14,y+5, cx-13,y+13, cx-13,y+17)
      ctx.lineTo(cx+13,y+17)
      ctx.bezierCurveTo(cx+13,y+13, cx+14,y+5, cx+12,y)
      ctx.closePath(); ctx.fill(); ctx.stroke()
      line(ctx, cx-13, y+17, cx+13, y+17, OL, 1.8)
      break
    }
  }
}

// ── Body / outfit (back) ──────────────────────────────────────────────────────

function drawBodyBack(ctx, char, cx, y) {
  ctx.strokeStyle = OL; ctx.lineWidth = 2
  switch (char.style) {
    case 'dress':
      ctx.fillStyle = char.outfitD
      ctx.beginPath()
      ctx.moveTo(cx-10,y); ctx.bezierCurveTo(cx-13,y+7,cx-7,y+13,cx-7,y+15)
      ctx.bezierCurveTo(cx-7,y+17,cx-16,y+22,cx-18,y+28); ctx.lineTo(cx+18,y+28)
      ctx.bezierCurveTo(cx+16,y+22,cx+7,y+17,cx+7,y+15)
      ctx.bezierCurveTo(cx+7,y+13,cx+13,y+7,cx+10,y)
      ctx.closePath(); ctx.fill(); ctx.stroke()
      break
    case 'armour':
      ctx.fillStyle = char.outfitD
      ctx.beginPath()
      ctx.moveTo(cx-12,y); ctx.bezierCurveTo(cx-15,y+5,cx-12,y+14,cx-11,y+22)
      ctx.lineTo(cx-12,y+28); ctx.lineTo(cx+12,y+28); ctx.lineTo(cx+11,y+22)
      ctx.bezierCurveTo(cx+12,y+14,cx+15,y+5,cx+12,y)
      ctx.closePath(); ctx.fill(); ctx.stroke()
      line(ctx,cx-11,y+8,cx+11,y+8,char.trim,1)
      rrectStroke(ctx,cx-12,y+22,24,6,[0,0,3,3],char.outfitD,1.5)
      break
    case 'battle_robe':
      ctx.fillStyle = char.outfitD
      ctx.beginPath()
      ctx.moveTo(cx-11,y); ctx.bezierCurveTo(cx-14,y+8,cx-13,y+18,cx-14,y+28)
      ctx.lineTo(cx+14,y+28); ctx.bezierCurveTo(cx+13,y+18,cx+14,y+8,cx+11,y)
      ctx.closePath(); ctx.fill(); ctx.stroke()
      break
    case 'detective_coat':
      ctx.fillStyle = char.outfitD
      ctx.beginPath()
      ctx.moveTo(cx-12,y); ctx.bezierCurveTo(cx-14,y+6,cx-11,y+16,cx-12,y+28)
      ctx.lineTo(cx+12,y+28); ctx.bezierCurveTo(cx+11,y+16,cx+14,y+6,cx+12,y)
      ctx.closePath(); ctx.fill(); ctx.stroke()
      line(ctx, cx, y+5, cx, y+26, char.outfit, 1)
      break
    case 'hooded_tunic':
      ctx.fillStyle = char.outfitD
      ctx.beginPath()
      ctx.moveTo(cx-11,y); ctx.bezierCurveTo(cx-13,y+6,cx-11,y+14,cx-11,y+28)
      ctx.lineTo(cx+11,y+28); ctx.bezierCurveTo(cx+11,y+14,cx+13,y+6,cx+11,y)
      ctx.closePath(); ctx.fill(); ctx.stroke()
      // Hood drape back
      ctx.fillStyle = char.outfit; ctx.strokeStyle = OL; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(cx-10,y-1); ctx.lineTo(cx+10,y-1); ctx.lineTo(cx+6,y+24); ctx.lineTo(cx-6,y+24); ctx.closePath(); ctx.fill(); ctx.stroke()
      // Quiver
      rrectStroke(ctx, cx+9, y-4, 7, 24, 2, '#9A6030', 1.5)
      circStroke(ctx, cx+12, y-5, 3, '#D8C060', 1)
      break
    case 'red_shirt':
      ovalStroke(ctx, cx, y+22, 14, 11, char.bodyD, 1.5)
      ctx.fillStyle = char.outfitD
      ctx.beginPath()
      ctx.moveTo(cx-13,y); ctx.bezierCurveTo(cx-16,y+5,cx-14,y+13,cx-14,y+17)
      ctx.lineTo(cx+14,y+17); ctx.bezierCurveTo(cx+14,y+13,cx+16,y+5,cx+13,y)
      ctx.closePath(); ctx.fill(); ctx.stroke()
      break
  }
}

// ── Head accessories (hat / hair / ears) ──────────────────────────────────────

function drawHeadAccessory(ctx, char, cx, cy, view) {
  const isSide = view === 'left' || view === 'right'
  const dir    = view === 'right' ? 1 : -1

  switch (char.special) {
    case 'elf_ears': {
      if (view === 'back') break
      const ec = '#D898C8', r = 11
      if (!isSide) {
        ctx.fillStyle = ec; ctx.strokeStyle = OL; ctx.lineWidth = 1.5
        ctx.beginPath(); ctx.moveTo(cx-r,cy); ctx.lineTo(cx-r-6,cy-10); ctx.lineTo(cx-r+3,cy-4); ctx.closePath(); ctx.fill(); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(cx+r,cy); ctx.lineTo(cx+r+6,cy-10); ctx.lineTo(cx+r-3,cy-4); ctx.closePath(); ctx.fill(); ctx.stroke()
        // Crown
        rrectStroke(ctx, cx-r-2, cy-r-5, (r+2)*2, 5, 2, char.trim, 1.5)
        circStroke(ctx, cx, cy-r-3, 3, '#FF4068', 1)
        circStroke(ctx, cx-8, cy-r-3, 2, char.trim, 1)
        circStroke(ctx, cx+8, cy-r-3, 2, char.trim, 1)
      } else {
        const ex = cx - dir * (r + 2)
        ctx.fillStyle = ec; ctx.strokeStyle = OL; ctx.lineWidth = 1.5
        ctx.beginPath(); ctx.moveTo(ex, cy); ctx.lineTo(ex - dir*6, cy-10); ctx.lineTo(ex + dir*3, cy-4); ctx.closePath(); ctx.fill(); ctx.stroke()
        rrectStroke(ctx, cx - dir*(r+2), cy-r-5, r+4, 5, 2, char.trim, 1.5)
      }
      break
    }

    case 'topknot': {
      if (view === 'back') break
      const tx = isSide ? cx - dir*2 : cx
      circStroke(ctx, tx, cy - 12, 6, '#1A0808', 1.8)
      circ(ctx, tx, cy-12, 4, '#2A1010')
      circ(ctx, tx+1, cy-13, 1.2, 'rgba(255,255,255,0.2)')
      line(ctx, tx-5, cy-10, tx+5, cy-13, char.trim, 1.4)
      // Hair bun shape
      ctx.fillStyle = '#1A0808'; ctx.strokeStyle = OL; ctx.lineWidth = 1.2
      ctx.beginPath()
      if (!isSide) {
        ctx.ellipse(cx, cy-11, 11, 6, 0, Math.PI, Math.PI*2)
      } else {
        ctx.ellipse(cx-dir*2, cy-11, 9, 5, 0, Math.PI, Math.PI*2)
      }
      ctx.fill(); ctx.stroke()
      break
    }

    case 'golden_headband': {
      if (view === 'back') break
      const bw = isSide ? 20 : 24
      const bx = isSide ? cx+dir*2 : cx
      rrectStroke(ctx, bx-bw/2, cy-11+2, bw, 6, 3, char.trim, 1.8)
      if (!isSide) {
        circStroke(ctx, cx, cy-11+5, 3.5, '#FF4828', 1)
        circStroke(ctx, cx-8, cy-11+5, 2, '#F8E040', 1)
        circStroke(ctx, cx+8, cy-11+5, 2, '#F8E040', 1)
      }
      // Ears / fur tufts (monkey)
      if (!isSide) {
        circStroke(ctx, cx-11, cy-6, 5, char.body, 1.5)
        circStroke(ctx, cx+11, cy-6, 5, char.body, 1.5)
      } else {
        circStroke(ctx, cx-dir*11, cy-6, 5, char.body, 1.5)
      }
      break
    }

    case 'deerstalker': {
      // Cap crown
      const cw = isSide ? 22 : 28
      rrectStroke(ctx, cx-cw/2, cy-11, cw, 8, 3, '#5A6860', 1.8)
      if (!isSide) {
        // Front and back peaks
        ctx.fillStyle = '#5A6860'; ctx.strokeStyle = OL; ctx.lineWidth = 1.5
        ctx.beginPath(); ctx.ellipse(cx+16, cy-8, 6, 3, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke()
        ctx.beginPath(); ctx.ellipse(cx-16, cy-8, 6, 3, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke()
        // Check texture
        ctx.globalAlpha = 0.18
        for (let i=-2; i<=2; i++) line(ctx, cx-12+i*7, cy-11, cx-12+i*7, cy-4, '#000', 0.9)
        ctx.globalAlpha = 1.0
      } else {
        ctx.fillStyle = '#5A6860'; ctx.strokeStyle = OL; ctx.lineWidth = 1.5
        ctx.beginPath(); ctx.ellipse(cx+dir*14, cy-8, 6, 3, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke()
      }
      break
    }

    case 'green_hood': {
      if (view === 'back') break
      ctx.fillStyle = char.outfit; ctx.strokeStyle = OL; ctx.lineWidth = 2
      if (!isSide) {
        ctx.beginPath(); ctx.moveTo(cx, cy-14); ctx.lineTo(cx-13, cy-4); ctx.lineTo(cx+13, cy-4); ctx.closePath(); ctx.fill(); ctx.stroke()
        ctx.fillStyle = char.outfitD
        ctx.beginPath(); ctx.moveTo(cx-13,cy-4); ctx.lineTo(cx-9,cy-1); ctx.lineTo(cx+9,cy-1); ctx.lineTo(cx+13,cy-4); ctx.closePath(); ctx.fill()
        // Feather on hood
        ctx.fillStyle = '#E8C040'; ctx.strokeStyle = OL; ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(cx+4,cy-14); ctx.bezierCurveTo(cx+12,cy-18,cx+16,cy-10,cx+8,cy-8); ctx.bezierCurveTo(cx+14,cy-12,cx+10,cy-18,cx+4,cy-14); ctx.closePath(); ctx.fill(); ctx.stroke()
      } else {
        const tip = cx - dir*3
        ctx.beginPath(); ctx.moveTo(tip,cy-14); ctx.lineTo(tip-dir*14,cy-4); ctx.lineTo(tip+dir*6,cy-4); ctx.closePath(); ctx.fill(); ctx.stroke()
      }
      break
    }

    case 'bear_ears': {
      if (view === 'back') break
      if (!isSide) {
        circStroke(ctx, cx-11, cy-9, 7, char.body, 1.8)
        circStroke(ctx, cx+11, cy-9, 7, char.body, 1.8)
        circ(ctx, cx-11, cy-9, 4.5, '#F0A898')
        circ(ctx, cx+11, cy-9, 4.5, '#F0A898')
      } else {
        circStroke(ctx, cx-dir*11, cy-9, 7, char.body, 1.8)
        circ(ctx, cx-dir*11, cy-9, 4.5, '#F0A898')
      }
      break
    }
  }
}

// ── Satchel / prop ─────────────────────────────────────────────────────────────

function drawSatchel(ctx, char, cx, y, view) {
  const isSide = view === 'left' || view === 'right'
  const dir    = view === 'right' ? 1 : -1
  const sx     = isSide ? cx - dir*11 : cx + 9
  const sy     = y + 10

  if (char.style === 'red_shirt') {
    rrectStroke(ctx, sx-4, sy, 9, 10, 2, '#E8C040', 1.5)
    rrectStroke(ctx, sx-3, sy-4, 7, 4, 1, '#C8A020', 1)
    ctx.globalAlpha = 0.6; circStroke(ctx, sx+3, sy+11, 2, '#F0D040', 0.8); ctx.globalAlpha = 1.0
  } else if (char.style === 'detective_coat') {
    circStroke(ctx, sx+2, sy+4, 5.5, 'rgba(160,210,230,0.6)', 1.5)
    line(ctx, sx+6, sy+8, sx+11, sy+13, OL, 2.2)
  } else {
    rrectStroke(ctx, sx-4, sy, 10, 9, 2, '#B89858', 1.5)
    rrectStroke(ctx, sx-3, sy+1, 8, 7, 1, '#9A7838', 1)
    circStroke(ctx, sx+1, sy+1, 1.5, '#F0D860', 0.8)
  }
}

// ── Frame compositors ─────────────────────────────────────────────────────────

// y constants relative to cell origin (oy)
const HEAD_Y = 12   // head center y
const BODY_Y = 20   // body top y
const ARM_Y  = 25   // arm shoulder y
const LEG_Y  = 47   // leg top y

function drawFrontFrame(ctx, char, cx, oy, opts = {}) {
  const { bob=0, legL=0, legR=0, mouthOpen=false, blinking=false, armL=0, armR=0 } = opts
  const by = oy + bob   // body/head y offset for bob

  drawShadow(ctx, cx, oy)
  drawLegs(ctx, char, cx, oy + LEG_Y + (bob * 0.3), legL, legR)

  // Arms (both sides, hang in front of body)
  drawArm(ctx, char, cx - 14, by + ARM_Y, armL)
  drawArm(ctx, char, cx + 14, by + ARM_Y, armR)

  drawBodyFront(ctx, char, cx, by + BODY_Y)
  drawSatchel(ctx, char, cx, by + BODY_Y, 'front')
  drawHead(ctx, char, cx, by + HEAD_Y, 'front', blinking, mouthOpen)
  drawHeadAccessory(ctx, char, cx, by + HEAD_Y, 'front')
}

function drawSideFrame(ctx, char, cx, oy, facingLeft, opts = {}) {
  const { bob=0, legL=0, legR=0, armL=0, armR=0 } = opts
  const dir = facingLeft ? -1 : 1
  const by  = oy + bob

  // For side view: near arm = arm on the face-away side (draws in front of body)
  //               far arm = arm on the face side (draws behind body)
  const nearAngle = dir === 1 ? armL : armR   // near arm angle
  const farAngle  = dir === 1 ? armR : armL   // far arm angle
  const nearX = cx - dir * 14  // near shoulder x (opposite to face direction)
  const farX  = cx + dir * 14  // far shoulder x

  drawShadow(ctx, cx, oy)
  drawLegs(ctx, char, cx, oy + LEG_Y + (bob * 0.3), legL, legR)

  // Far arm (behind body)
  ctx.globalAlpha = 0.65
  drawArm(ctx, char, farX, by + ARM_Y, farAngle * 0.5)
  ctx.globalAlpha = 1.0

  drawBodySide(ctx, char, cx, by + BODY_Y, dir)
  drawSatchel(ctx, char, cx, by + BODY_Y, facingLeft ? 'left' : 'right')

  // Near arm (in front of body)
  drawArm(ctx, char, nearX, by + ARM_Y, nearAngle)

  drawHead(ctx, char, cx, by + HEAD_Y, facingLeft ? 'left' : 'right', false, false)
  drawHeadAccessory(ctx, char, cx, by + HEAD_Y, facingLeft ? 'left' : 'right')
}

function drawBackFrame(ctx, char, cx, oy, opts = {}) {
  const { legL=0, legR=0, armL=0, armR=0 } = opts
  const by = oy

  drawShadow(ctx, cx, oy)
  drawLegs(ctx, char, cx, oy + LEG_Y, legL, legR)
  drawArm(ctx, char, cx - 14, by + ARM_Y, armL)
  drawArm(ctx, char, cx + 14, by + ARM_Y, armR)
  drawBodyBack(ctx, char, cx, by + BODY_Y)

  // Back of head (no face)
  ctx.fillStyle = char.body; ctx.strokeStyle = OL; ctx.lineWidth = 2
  ctx.beginPath(); ctx.arc(cx, by + HEAD_Y, 11, 0, Math.PI*2); ctx.fill(); ctx.stroke()

  drawHeadAccessory(ctx, char, cx, by + HEAD_Y, 'back')
}

// ── Per-frame dispatch ─────────────────────────────────────────────────────────

function drawFrame(ctx, charId, animKey, frameIdx, ox, oy) {
  const char = CHARS[charId]
  if (!char) return
  const cx = ox + 32, f = frameIdx

  switch (animKey) {
    case 'idle': {
      const bob = (f === 1 || f === 3) ? -1 : 0
      const wobL = (f === 1 || f === 3) ? 0.06 : -0.03
      drawFrontFrame(ctx, char, cx, oy, { bob, armL: wobL, armR: -wobL })
      break
    }
    case 'walk_down': {
      const [lL,lR] = WALK4[f] ?? [0,0]
      const [aL,aR] = ARM4[f] ?? [0,0]
      drawFrontFrame(ctx, char, cx, oy, { legL:lL, legR:lR, armL:aL*0.5, armR:aR*0.5 })
      break
    }
    case 'walk_up': {
      const [lL,lR] = WALK4[f] ?? [0,0]
      const [aL,aR] = ARM4[f] ?? [0,0]
      drawBackFrame(ctx, char, cx, oy, { legL:lL, legR:lR, armL:aL*0.5, armR:aR*0.5 })
      break
    }
    case 'walk_left': {
      const [lL,lR] = WALK8[f] ?? [0,0]
      const [aL,aR] = ARM8[f] ?? [0,0]
      drawSideFrame(ctx, char, cx, oy, true,  { bob:Math.abs(lL)>1?-1:0, legL:lL, legR:lR, armL:aL, armR:aR })
      break
    }
    case 'walk_right': {
      const [lL,lR] = WALK8[f] ?? [0,0]
      const [aL,aR] = ARM8[f] ?? [0,0]
      drawSideFrame(ctx, char, cx, oy, false, { bob:Math.abs(lL)>1?-1:0, legL:lL, legR:lR, armL:aL, armR:aR })
      break
    }
    case 'talk':
      drawFrontFrame(ctx, char, cx, oy, {
        mouthOpen: f===1||f===3,
        bob:       f===1||f===3 ? -1 : 0,
        armL: f===1||f===3 ? -0.3 : 0,
        armR: f===1||f===3 ?  0.1 : 0,
      })
      break
    case 'blink':
      drawFrontFrame(ctx, char, cx, oy, { blinking: f===1 })
      break
  }
}

// ── Core sheet renderer (any Canvas 2D context) ────────────────────────────────

export function renderSpriteSheet(ctx, charId) {
  for (const [animKey, meta] of Object.entries(ANIM_META)) {
    for (let f = 0; f < meta.frames; f++) {
      ctx.save()
      drawFrame(ctx, charId, animKey, f, f * FRAME, meta.row * FRAME)
      ctx.restore()
    }
  }
}

// ── Browser API ────────────────────────────────────────────────────────────────

export function generateSpriteSheet(charId) {
  const canvas = document.createElement('canvas')
  canvas.width  = FRAME * COLS
  canvas.height = FRAME * ROWS
  const ctx = canvas.getContext('2d')
  try { ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high' } catch {}
  renderSpriteSheet(ctx, charId)
  return canvas.toDataURL('image/png')
}

const CACHE_VERSION = 'v9'

export function getCachedSprite(charId) {
  try { return localStorage.getItem(`haven_sprite_${CACHE_VERSION}_${charId}`) } catch { return null }
}
export function setCachedSprite(charId, dataUrl) {
  try { localStorage.setItem(`haven_sprite_${CACHE_VERSION}_${charId}`, dataUrl) } catch {}
}
