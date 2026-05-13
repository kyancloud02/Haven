/**
 * Generates docs/sprite-preview.png — a grid showing all characters.
 * Run with: npm run preview-sprites
 *
 * Shows each character's idle (4f), walk_right (8f), walk_left (8f), talk (4f)
 * frames in a labelled grid on a dark background.
 */

import { createCanvas } from 'canvas'
import { writeFileSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { createRequire } from 'module'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ─── Inline the full spriteGen drawing logic for Node.js ──────────────────────
// (Duplicates spriteGen.js without browser-specific APIs so node-canvas can run it)

const FRAME = 64
const COLS  = 8
const ROWS  = 7

const ANIM_META = {
  walk_down:  { row: 0, frames: 4, fps: 8  },
  walk_left:  { row: 1, frames: 8, fps: 10 },
  walk_right: { row: 2, frames: 8, fps: 10 },
  walk_up:    { row: 3, frames: 4, fps: 8  },
  idle:       { row: 4, frames: 4, fps: 4  },
  talk:       { row: 5, frames: 4, fps: 6  },
  blink:      { row: 6, frames: 2, fps: 3  },
}

const CHARS = {
  elf_princess: {
    body:'#C0B8E0',bodyD:'#A098C8',eyes:'#3020A8',
    outfit:'#C85880',outfitD:'#A03860',trim:'#F0D840',collar:'#8860B8',
    feet:'#7050A8',feetD:'#503888',
    faceType:'elf_nose',noseColor:'#E0A8C8',browStyle:'neutral',
    special:'elf_ears',style:'dress',
  },
  warrior_mulan: {
    body:'#D8A870',bodyD:'#B88048',eyes:'#180808',
    outfit:'#C02828',outfitD:'#901818',trim:'#F0C040',collar:'#501808',
    feet:'#3A1808',feetD:'#201008',
    faceType:'human_nose',noseColor:'#A07050',browStyle:'furrowed',
    special:'topknot',style:'armour',
  },
  sun_wukong: {
    body:'#D8A840',bodyD:'#B88020',eyes:'#281008',
    outfit:'#C87020',outfitD:'#9A5010',trim:'#F8E040',collar:'#904010',
    feet:'#7A4010',feetD:'#502808',
    faceType:'monkey_snout',snoutColor:'#E8C878',browStyle:'raised',
    special:'golden_headband',style:'battle_robe',
  },
  sherlock_holmes: {
    body:'#7888A0',bodyD:'#586878',eyes:'#181010',
    outfit:'#3A4050',outfitD:'#262C38',trim:'#A89858',collar:'#282C38',
    feet:'#202028',feetD:'#141018',
    faceType:'aquiline_nose',noseColor:'#8A7868',browStyle:'furrowed',
    special:'deerstalker',style:'detective_coat',
  },
  robin_hood: {
    body:'#7A9848',bodyD:'#5A7830',eyes:'#141008',
    outfit:'#4A6820',outfitD:'#305010',trim:'#9A6030',collar:'#385018',
    feet:'#3A2010',feetD:'#241408',
    faceType:'human_nose',noseColor:'#628038',browStyle:'neutral',
    special:'green_hood',style:'hooded_tunic',
  },
  winnie_the_pooh: {
    body:'#E8C850',bodyD:'#C8A030',eyes:'#180808',
    outfit:'#C82020',outfitD:'#A01010',trim:'#F0B030',collar:'#A83020',
    feet:'#8A5818',feetD:'#5A3810',
    faceType:'bear_snout',snoutColor:'#F0D888',browStyle:'neutral',
    special:'bear_ears',style:'red_shirt',plump:true,
  },
}

const WALK8 = [[-3,2],[-2,3],[-1,2],[0,1],[3,-2],[2,-3],[1,-2],[0,-1]]
const WALK4 = [[-2,2],[0,3],[2,-2],[0,-3]]
const OL = '#0C0808'

// ── helpers ───────────────────────────────────────────────────────────────────
function circ(ctx,cx,cy,r,c){ctx.fillStyle=c;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill()}
function oval(ctx,cx,cy,rx,ry,c){ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);ctx.fill()}
function rrPath(ctx,x,y,w,h,r){
  if(ctx.roundRect){ctx.roundRect(x,y,w,h,r);return}
  const a=Array.isArray(r)?r:[r,r,r,r];const[tl,tr,br,bl]=a.map(v=>Math.min(v,w/2,h/2))
  ctx.moveTo(x+tl,y);ctx.lineTo(x+w-tr,y);ctx.arcTo(x+w,y,x+w,y+tr,tr)
  ctx.lineTo(x+w,y+h-br);ctx.arcTo(x+w,y+h,x+w-br,y+h,br)
  ctx.lineTo(x+bl,y+h);ctx.arcTo(x,y+h,x,y+h-bl,bl)
  ctx.lineTo(x,y+tl);ctx.arcTo(x,y,x+tl,y,tl);ctx.closePath()
}
function line(ctx,x1,y1,x2,y2,c,lw=1){ctx.strokeStyle=c;ctx.lineWidth=lw;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}
function rrectStroke(ctx,x,y,w,h,r,f,sw=2){ctx.fillStyle=f;ctx.strokeStyle=OL;ctx.lineWidth=sw;ctx.beginPath();rrPath(ctx,x,y,w,h,r);ctx.fill();ctx.stroke()}
function circStroke(ctx,cx,cy,r,f,sw=2){ctx.fillStyle=f;ctx.strokeStyle=OL;ctx.lineWidth=sw;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();ctx.stroke()}
function ovalStroke(ctx,cx,cy,rx,ry,f,sw=2){ctx.fillStyle=f;ctx.strokeStyle=OL;ctx.lineWidth=sw;ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);ctx.fill();ctx.stroke()}

function drawEye(ctx,cx,cy,r,pupil){
  ctx.save()
  ctx.fillStyle='#FFFFFF';ctx.strokeStyle=OL;ctx.lineWidth=1.8
  ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();ctx.stroke()
  ctx.fillStyle=pupil;ctx.beginPath();ctx.arc(cx,cy+r*.15,r*.55,0,Math.PI*2);ctx.fill()
  ctx.fillStyle='rgba(255,255,255,0.9)';ctx.beginPath();ctx.arc(cx-r*.28,cy-r*.28,r*.2,0,Math.PI*2);ctx.fill()
  ctx.restore()
}
function drawEyeBlink(ctx,cx,cy,r){
  ctx.save();ctx.strokeStyle=OL;ctx.lineWidth=2.2;ctx.lineCap='round'
  ctx.beginPath();ctx.arc(cx,cy,r,Math.PI*1.12,Math.PI*1.88);ctx.stroke();ctx.restore()
}

function drawEyebrows(ctx,char,cx,y,dir){
  const brow=char.browStyle||'neutral'
  ctx.save();ctx.strokeStyle=char.bodyD;ctx.lineWidth=1.5;ctx.lineCap='round'
  if(dir===0){
    const by=y+9
    ctx.beginPath()
    if(brow==='furrowed'){ctx.moveTo(cx-11,by-1);ctx.lineTo(cx-2,by+2)}
    else if(brow==='raised'){ctx.moveTo(cx-11,by+1);ctx.quadraticCurveTo(cx-6,by-3,cx-2,by)}
    else{ctx.moveTo(cx-11,by);ctx.lineTo(cx-2,by-1)}
    ctx.stroke()
    ctx.beginPath()
    if(brow==='furrowed'){ctx.moveTo(cx+2,by+2);ctx.lineTo(cx+11,by-1)}
    else if(brow==='raised'){ctx.moveTo(cx+2,by);ctx.quadraticCurveTo(cx+6,by-3,cx+11,by+1)}
    else{ctx.moveTo(cx+2,by-1);ctx.lineTo(cx+11,by)}
    ctx.stroke()
  } else {
    const ex=cx-dir*4,by=y+9
    ctx.beginPath()
    if(brow==='furrowed'){ctx.moveTo(ex-dir*5,by-1);ctx.lineTo(ex+dir*5,by+2)}
    else if(brow==='raised'){ctx.moveTo(ex-5,by+1);ctx.quadraticCurveTo(ex,by-3,ex+5,by)}
    else{ctx.moveTo(ex-5,by);ctx.lineTo(ex+5,by-1)}
    ctx.stroke()
  }
  ctx.restore()
}

function _drawMouth(ctx,char,cx,y,open){
  ctx.save()
  if(!open){
    ctx.strokeStyle=char.bodyD;ctx.lineWidth=1.1;ctx.lineCap='round';ctx.globalAlpha=0.38
    ctx.beginPath();ctx.moveTo(cx-3,y+25);ctx.lineTo(cx+3,y+25);ctx.stroke()
  } else {
    ctx.fillStyle='#301010';ctx.beginPath();ctx.ellipse(cx,y+25,3.5,2.5,0,0,Math.PI*2);ctx.fill()
    ctx.fillStyle='rgba(255,255,255,0.65)';ctx.beginPath();ctx.ellipse(cx,y+24,2.5,1.2,0,0,Math.PI);ctx.fill()
  }
  ctx.restore()
}

function drawFacialFeature(ctx,char,cx,y,dir,mouthOpen){
  const ft=char.faceType||'human_nose'
  if(ft==='beak'){
    ctx.strokeStyle=OL;ctx.lineWidth=1.8
    if(dir===0){
      const by=y+25;ctx.fillStyle=char.beakColor||'#806048'
      ctx.beginPath();ctx.moveTo(cx-5,by);ctx.lineTo(cx+5,by);ctx.lineTo(cx,by+8);ctx.closePath();ctx.fill();ctx.stroke()
    } else {
      const fX=cx+dir*11,tX=cx+dir*25,mY=y+18,tY=mY-6
      ctx.fillStyle=char.beakColor||'#806048'
      ctx.beginPath();ctx.moveTo(fX,tY);ctx.lineTo(tX,mY);ctx.lineTo(fX,mY+4);ctx.closePath();ctx.fill();ctx.stroke()
    }
    return
  }
  if(ft==='monkey_snout'){
    if(dir===0){
      ovalStroke(ctx,cx,y+22,8.5,5.5,char.snoutColor||'#E8C878',1.5)
      ctx.fillStyle=OL
      ctx.beginPath();ctx.ellipse(cx-2.5,y+21,1.5,1.2,0,0,Math.PI*2);ctx.fill()
      ctx.beginPath();ctx.ellipse(cx+2.5,y+21,1.5,1.2,0,0,Math.PI*2);ctx.fill()
      if(mouthOpen){
        ctx.fillStyle='#301010';ctx.beginPath();ctx.arc(cx,y+27,4.5,0,Math.PI);ctx.fill()
        ctx.fillStyle='rgba(255,255,255,0.6)';ctx.beginPath();ctx.arc(cx,y+27,3.5,0,Math.PI);ctx.fill()
      }
    } else {
      const sx=cx+dir*10;ovalStroke(ctx,sx,y+22,5.5,4.5,char.snoutColor||'#E8C878',1.5)
      ctx.fillStyle=OL;ctx.beginPath();ctx.ellipse(sx+dir*2,y+21,1.5,1.2,0,0,Math.PI*2);ctx.fill()
    }
    return
  }
  if(ft==='bear_snout'){
    if(dir===0){
      ovalStroke(ctx,cx,y+23,10,7,char.snoutColor||'#F0D898',1.5)
      ovalStroke(ctx,cx,y+20,4,2.5,'#201010',1)
      if(mouthOpen){ctx.strokeStyle='#301010';ctx.lineWidth=1.5;ctx.lineCap='round';ctx.beginPath();ctx.arc(cx,y+27,3.5,0,Math.PI);ctx.stroke()}
    } else {
      const sx=cx+dir*11;ovalStroke(ctx,sx,y+23,7,6,char.snoutColor||'#F0D898',1.5)
      ovalStroke(ctx,sx+dir*3,y+21,2.5,2,'#201010',1)
    }
    return
  }
  if(ft==='aquiline_nose'){
    if(dir===0){
      ctx.fillStyle=char.noseColor||'#9A8878';ctx.strokeStyle=OL;ctx.lineWidth=0.8
      ctx.beginPath();ctx.moveTo(cx,y+15);ctx.lineTo(cx-4,y+23);ctx.lineTo(cx+4,y+23);ctx.closePath();ctx.fill();ctx.stroke()
      ctx.globalAlpha=0.5;ctx.fillStyle=OL
      ctx.beginPath();ctx.ellipse(cx-3,y+22,1.4,1,0,0,Math.PI*2);ctx.fill()
      ctx.beginPath();ctx.ellipse(cx+3,y+22,1.4,1,0,0,Math.PI*2);ctx.fill()
      ctx.globalAlpha=1.0;_drawMouth(ctx,char,cx,y,mouthOpen)
    } else {
      ctx.fillStyle=char.noseColor||'#9A8878';ctx.strokeStyle=OL;ctx.lineWidth=1.2
      ctx.beginPath();ctx.moveTo(cx+dir*5,y+15);ctx.lineTo(cx+dir*13,y+20);ctx.lineTo(cx+dir*9,y+24);ctx.lineTo(cx+dir*4,y+24);ctx.closePath();ctx.fill();ctx.stroke()
    }
    return
  }
  if(ft==='elf_nose'){
    if(dir===0){
      ctx.fillStyle=char.noseColor||'#E0A8B8';ctx.beginPath();ctx.arc(cx,y+21,2.5,0,Math.PI*2);ctx.fill()
      _drawMouth(ctx,char,cx,y,mouthOpen)
    } else {
      const nx=cx+dir*8;ctx.fillStyle=char.noseColor||'#E0A8B8'
      ctx.beginPath();ctx.arc(nx,y+21,2.5,-Math.PI/2*dir,Math.PI/2*dir);ctx.closePath();ctx.fill()
    }
    return
  }
  // human_nose default
  if(dir===0){
    ctx.fillStyle=char.noseColor||'#C09080';ctx.beginPath();ctx.ellipse(cx,y+21,3,2,0,0,Math.PI*2);ctx.fill()
    _drawMouth(ctx,char,cx,y,mouthOpen)
  } else {
    const nx=cx+dir*8;ctx.fillStyle=char.noseColor||'#C09080'
    ctx.beginPath();ctx.arc(nx,y+21,3,-Math.PI/2*dir,Math.PI/2*dir);ctx.closePath();ctx.fill()
  }
}

function drawCreatureBody(ctx,char,cx,y){
  const bw=char.plump?26:22,bh=42,x=cx-bw/2
  ctx.fillStyle=char.body;ctx.strokeStyle=OL;ctx.lineWidth=2.2
  ctx.beginPath();rrPath(ctx,x,y+6,bw,bh,[10,10,5,5]);ctx.fill();ctx.stroke()
  const g=ctx.createLinearGradient(x,0,x+bw,0)
  g.addColorStop(0,'rgba(0,0,0,0.18)');g.addColorStop(0.18,'rgba(0,0,0,0)')
  g.addColorStop(0.82,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,0.18)')
  ctx.fillStyle=g;ctx.beginPath();rrPath(ctx,x,y+6,bw,bh,[10,10,5,5]);ctx.fill()
  ctx.globalAlpha=0.14;oval(ctx,cx,y+12,bw*.35,4,'#FFFFFF');ctx.globalAlpha=1.0
}

function drawCollar(ctx,char,cx,y){
  const cw=char.plump?27:23;rrectStroke(ctx,cx-cw/2,y+26,cw,5,2,char.collar,1.5)
}

function drawOutfitFront(ctx,char,cx,y){
  switch(char.style){
    case 'dress':{
      ctx.fillStyle=char.outfit;ctx.strokeStyle=OL;ctx.lineWidth=2;ctx.beginPath()
      ctx.moveTo(cx-10,y+30);ctx.lineTo(cx+10,y+30);ctx.lineTo(cx+16,y+52);ctx.lineTo(cx-16,y+52);ctx.closePath();ctx.fill();ctx.stroke()
      ctx.globalAlpha=0.22;ctx.fillStyle=char.outfitD
      ctx.beginPath();ctx.moveTo(cx-16,y+52);ctx.lineTo(cx-9,y+34);ctx.lineTo(cx-6,y+52);ctx.closePath();ctx.fill()
      ctx.beginPath();ctx.moveTo(cx+6,y+52);ctx.lineTo(cx+9,y+34);ctx.lineTo(cx+16,y+52);ctx.closePath();ctx.fill()
      ctx.globalAlpha=1.0;rrectStroke(ctx,cx-10,y+30,20,3,1,char.trim,1);circStroke(ctx,cx,y+36,2.5,char.trim,1)
      break
    }
    case 'armour':{
      rrectStroke(ctx,cx-12,y+30,24,18,3,char.outfit)
      line(ctx,cx-11,y+33,cx+11,y+33,char.trim,1.5);line(ctx,cx-11,y+40,cx+11,y+40,char.trim,1.5)
      line(ctx,cx,y+31,cx,y+47,char.outfitD,1)
      ovalStroke(ctx,cx-14,y+32,5.5,3.5,char.outfit);ovalStroke(ctx,cx+14,y+32,5.5,3.5,char.outfit)
      rrectStroke(ctx,cx-11,y+47,22,6,2,char.outfitD,1.5)
      ctx.globalAlpha=0.15;oval(ctx,cx-3,y+32,4,6,'#FFFFFF');ctx.globalAlpha=1.0
      break
    }
    case 'battle_robe':{
      ctx.fillStyle=char.outfit;ctx.strokeStyle=OL;ctx.lineWidth=2;ctx.beginPath()
      ctx.moveTo(cx-10,y+30);ctx.lineTo(cx+10,y+30)
      ctx.quadraticCurveTo(cx+15,y+42,cx+13,y+52);ctx.lineTo(cx-13,y+52)
      ctx.quadraticCurveTo(cx-15,y+42,cx-10,y+30);ctx.closePath();ctx.fill();ctx.stroke()
      rrectStroke(ctx,cx-13,y+40,26,5,2,char.trim,1.5)
      ctx.globalAlpha=0.20;ctx.fillStyle=char.outfitD
      ctx.beginPath();ctx.moveTo(cx-13,y+42);ctx.lineTo(cx-8,y+30);ctx.lineTo(cx-5,y+52);ctx.closePath();ctx.fill()
      ctx.beginPath();ctx.moveTo(cx+13,y+42);ctx.lineTo(cx+8,y+30);ctx.lineTo(cx+5,y+52);ctx.closePath();ctx.fill()
      ctx.globalAlpha=1.0;break
    }
    case 'detective_coat':{
      rrectStroke(ctx,cx-12,y+30,24,24,2,char.outfit)
      ctx.fillStyle='#505060'
      ctx.beginPath();ctx.moveTo(cx,y+30);ctx.lineTo(cx-9,y+42);ctx.lineTo(cx,y+42);ctx.closePath();ctx.fill()
      ctx.beginPath();ctx.moveTo(cx,y+30);ctx.lineTo(cx+9,y+42);ctx.lineTo(cx,y+42);ctx.closePath();ctx.fill()
      ctx.fillStyle='#706848';ctx.beginPath();ctx.rect(cx-3,y+30,6,22);ctx.fill()
      for(let i=0;i<3;i++) circStroke(ctx,cx,y+33+i*6,1.2,char.trim,1)
      break
    }
    case 'hooded_tunic':{
      rrectStroke(ctx,cx-11,y+30,22,24,2,char.outfit)
      rrectStroke(ctx,cx-12,y+41,24,5,2,char.trim,1.5)
      rrectStroke(ctx,cx-2.5,y+40,5,7,1,'#D8C060',1)
      ctx.fillStyle=char.outfitD;ctx.strokeStyle=OL;ctx.lineWidth=1.5
      ctx.beginPath();ctx.moveTo(cx-11,y+30);ctx.lineTo(cx-16,y+30);ctx.lineTo(cx-14,y+50);ctx.lineTo(cx-11,y+50);ctx.closePath();ctx.fill();ctx.stroke()
      ctx.beginPath();ctx.moveTo(cx+11,y+30);ctx.lineTo(cx+16,y+30);ctx.lineTo(cx+14,y+50);ctx.lineTo(cx+11,y+50);ctx.closePath();ctx.fill();ctx.stroke()
      break
    }
    case 'red_shirt':{
      oval(ctx,cx,y+46,char.plump?14:11,7,char.bodyD)
      rrectStroke(ctx,cx-12,y+30,24,14,[2,2,0,0],char.outfit)
      line(ctx,cx-12,y+44,cx+12,y+44,OL,1.8)
      rrectStroke(ctx,cx-12,y+44,24,9,[0,0,4,4],char.body,1.8)
      break
    }
  }
}

function drawOutfitSide(ctx,char,cx,y,dir){
  switch(char.style){
    case 'dress':{
      ctx.fillStyle=char.outfit;ctx.strokeStyle=OL;ctx.lineWidth=2;ctx.beginPath()
      ctx.moveTo(cx-9,y+30);ctx.lineTo(cx+9,y+30);ctx.lineTo(cx+dir*14,y+52);ctx.lineTo(cx-dir*6,y+52)
      ctx.closePath();ctx.fill();ctx.stroke()
      rrectStroke(ctx,cx-9,y+30,18,3,1,char.trim,1);circStroke(ctx,cx+dir*2,y+36,2.5,char.trim,1);break
    }
    case 'armour':{
      rrectStroke(ctx,cx-11,y+30,22,18,3,char.outfit)
      line(ctx,cx-10,y+33,cx+10,y+33,char.trim,1.5);line(ctx,cx-10,y+40,cx+10,y+40,char.trim,1.5)
      ovalStroke(ctx,cx+dir*13,y+32,5,3.5,char.outfit);rrectStroke(ctx,cx-10,y+47,20,6,2,char.outfitD,1.5);break
    }
    case 'battle_robe':{
      ctx.fillStyle=char.outfit;ctx.strokeStyle=OL;ctx.lineWidth=2;ctx.beginPath()
      ctx.moveTo(cx-9,y+30);ctx.lineTo(cx+9,y+30)
      ctx.quadraticCurveTo(cx+dir*14,y+42,cx+dir*12,y+52);ctx.lineTo(cx-dir*4,y+52)
      ctx.quadraticCurveTo(cx-dir*6,y+40,cx-9,y+30);ctx.closePath();ctx.fill();ctx.stroke()
      rrectStroke(ctx,cx-12,y+40,24,5,2,char.trim,1.5);break
    }
    case 'detective_coat':{
      rrectStroke(ctx,cx-11,y+30,22,24,2,char.outfit)
      ctx.fillStyle='#706848';ctx.beginPath();ctx.rect(cx+dir*2-2,y+30,5,22);ctx.fill()
      for(let i=0;i<3;i++) circStroke(ctx,cx+dir*2,y+33+i*6,1.2,char.trim,1);break
    }
    case 'hooded_tunic':{
      rrectStroke(ctx,cx-10,y+30,20,24,2,char.outfit);rrectStroke(ctx,cx-11,y+41,22,5,2,char.trim,1.5)
      ctx.fillStyle=char.outfitD;ctx.strokeStyle=OL;ctx.lineWidth=1.5
      ctx.beginPath();ctx.moveTo(cx-dir*10,y+30);ctx.lineTo(cx-dir*16,y+30);ctx.lineTo(cx-dir*13,y+50);ctx.lineTo(cx-dir*10,y+50);ctx.closePath();ctx.fill();ctx.stroke();break
    }
    case 'red_shirt':{
      oval(ctx,cx,y+46,char.plump?13:10,7,char.bodyD)
      rrectStroke(ctx,cx-11,y+30,22,14,[2,2,0,0],char.outfit)
      line(ctx,cx-11,y+44,cx+11,y+44,OL,1.8);rrectStroke(ctx,cx-11,y+44,22,9,[0,0,4,4],char.body,1.8);break
    }
  }
}

function drawOutfitBack(ctx,char,cx,y){
  switch(char.style){
    case 'dress':ctx.fillStyle=char.outfitD;ctx.strokeStyle=OL;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx-10,y+30);ctx.lineTo(cx+10,y+30);ctx.lineTo(cx+15,y+52);ctx.lineTo(cx-15,y+52);ctx.closePath();ctx.fill();ctx.stroke();break
    case 'armour':rrectStroke(ctx,cx-11,y+30,22,20,3,char.outfitD);line(ctx,cx-10,y+33,cx+10,y+33,char.trim,1);rrectStroke(ctx,cx-10,y+49,20,5,2,char.outfitD,1.5);break
    case 'battle_robe':ctx.fillStyle=char.outfitD;ctx.strokeStyle=OL;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx-10,y+30);ctx.lineTo(cx+10,y+30);ctx.quadraticCurveTo(cx+14,y+42,cx+12,y+52);ctx.lineTo(cx-12,y+52);ctx.quadraticCurveTo(cx-14,y+42,cx-10,y+30);ctx.closePath();ctx.fill();ctx.stroke();break
    case 'detective_coat':rrectStroke(ctx,cx-11,y+30,22,24,2,char.outfitD);line(ctx,cx,y+38,cx,y+53,char.outfit,1);break
    case 'hooded_tunic':
      rrectStroke(ctx,cx-11,y+30,22,24,2,char.outfitD)
      ctx.fillStyle=char.outfit;ctx.strokeStyle=OL;ctx.lineWidth=1.5
      ctx.beginPath();ctx.moveTo(cx-10,y+29);ctx.lineTo(cx+10,y+29);ctx.lineTo(cx+6,y+52);ctx.lineTo(cx-6,y+52);ctx.closePath();ctx.fill();ctx.stroke()
      rrectStroke(ctx,cx+8,y+24,7,22,2,'#9A6030',1.5);circStroke(ctx,cx+11,y+23,2.5,'#D8C060',1);break
    case 'red_shirt':rrectStroke(ctx,cx-11,y+30,22,12,[2,2,0,0],char.outfitD);rrectStroke(ctx,cx-11,y+42,22,11,[0,0,4,4],char.body,1.8);break
  }
}

function drawAccessory(ctx,char,cx,y,view){
  const isSide=view==='left'||view==='right',dir=view==='right'?1:-1
  switch(char.special){
    case 'elf_ears':{
      if(view==='back')break
      const ec='#D898C8'
      if(!isSide){
        ctx.fillStyle=ec;ctx.strokeStyle=OL;ctx.lineWidth=1.5
        ctx.beginPath();ctx.moveTo(cx-11,y+10);ctx.lineTo(cx-16,y+2);ctx.lineTo(cx-8,y+8);ctx.closePath();ctx.fill();ctx.stroke()
        ctx.beginPath();ctx.moveTo(cx+11,y+10);ctx.lineTo(cx+16,y+2);ctx.lineTo(cx+8,y+8);ctx.closePath();ctx.fill();ctx.stroke()
        rrectStroke(ctx,cx-11,y+6,22,4,2,char.trim,1.5);circStroke(ctx,cx,y+8,2.5,'#FF4068',1)
      } else {
        const ex=cx-dir*11;ctx.fillStyle=ec;ctx.strokeStyle=OL;ctx.lineWidth=1.5
        ctx.beginPath();ctx.moveTo(ex,y+10);ctx.lineTo(ex-dir*6,y+2);ctx.lineTo(ex+dir*3,y+8);ctx.closePath();ctx.fill();ctx.stroke()
        rrectStroke(ctx,cx-dir*10,y+6,18,4,2,char.trim,1.5)
      }
      break
    }
    case 'topknot':{
      if(view==='back')break
      const tx=isSide?cx-dir:cx
      circStroke(ctx,tx,y+4,5.5,'#1A0808');circ(ctx,tx,y+4,3.5,'#2A1010');circ(ctx,tx+1,y+3,1,'rgba(255,255,255,0.2)')
      line(ctx,tx-5,y+6,tx+5,y+3,char.trim,1.2);break
    }
    case 'golden_headband':{
      if(view==='back')break
      const bw=isSide?18:22,bx=isSide?cx+dir*2:cx
      rrectStroke(ctx,bx-bw/2,y+9,bw,5,2,char.trim,1.5)
      if(!isSide){circStroke(ctx,cx,y+11,3,'#FF4828',1);circStroke(ctx,cx-6,y+11,1.5,'#F8E040',1);circStroke(ctx,cx+6,y+11,1.5,'#F8E040',1)}
      break
    }
    case 'deerstalker':{
      rrectStroke(ctx,cx-(isSide?10:13),y+4,isSide?20:26,7,3,'#5A6860')
      if(!isSide){
        ctx.fillStyle='#5A6860';ctx.strokeStyle=OL;ctx.lineWidth=1.5
        ctx.beginPath();ctx.ellipse(cx+14,y+8,5,2.5,0,0,Math.PI*2);ctx.fill();ctx.stroke()
        ctx.beginPath();ctx.ellipse(cx-14,y+8,5,2.5,0,0,Math.PI*2);ctx.fill();ctx.stroke()
        ctx.globalAlpha=0.18;for(let i=-2;i<=2;i++)line(ctx,cx-11+i*6,y+5,cx-11+i*6,y+10,'#000',0.8);ctx.globalAlpha=1.0
      } else {
        ctx.fillStyle='#5A6860';ctx.strokeStyle=OL;ctx.lineWidth=1.5
        ctx.beginPath();ctx.ellipse(cx+dir*12,y+8,5,2.5,0,0,Math.PI*2);ctx.fill();ctx.stroke()
      }
      break
    }
    case 'green_hood':{
      if(view==='back')break
      ctx.fillStyle=char.outfit;ctx.strokeStyle=OL;ctx.lineWidth=2
      if(!isSide){
        ctx.beginPath();ctx.moveTo(cx,y+0);ctx.lineTo(cx-12,y+10);ctx.lineTo(cx+12,y+10);ctx.closePath();ctx.fill();ctx.stroke()
        ctx.fillStyle=char.outfitD;ctx.beginPath();ctx.moveTo(cx-12,y+10);ctx.lineTo(cx-8,y+14);ctx.lineTo(cx+8,y+14);ctx.lineTo(cx+12,y+10);ctx.closePath();ctx.fill()
      } else {
        const tip=cx-dir*2;ctx.beginPath();ctx.moveTo(tip,y+0);ctx.lineTo(tip-dir*13,y+10);ctx.lineTo(tip+dir*5,y+10);ctx.closePath();ctx.fill();ctx.stroke()
      }
      break
    }
    case 'bear_ears':{
      if(view==='back')break
      if(!isSide){
        circStroke(ctx,cx-10,y+6,6,char.body);circStroke(ctx,cx+10,y+6,6,char.body)
        circ(ctx,cx-10,y+6,4,'#F0A898');circ(ctx,cx+10,y+6,4,'#F0A898')
      } else {
        circStroke(ctx,cx+dir*10,y+6,6,char.body);circ(ctx,cx+dir*10,y+6,4,'#F0A898')
      }
      break
    }
  }
}

function drawShadow(ctx,cx,oy){ctx.globalAlpha=0.12;oval(ctx,cx,oy+62,14,3.5,'#000000');ctx.globalAlpha=1.0}

function drawLegs(ctx,char,cx,oy,lL,lR){
  const lx=cx-5,rx=cx+5,lw=3.5
  ctx.fillStyle=char.feetD;ctx.strokeStyle=OL;ctx.lineWidth=1.2
  ctx.beginPath();ctx.rect(lx-lw/2,oy+50+lL,lw,12);ctx.fill();ctx.stroke()
  ctx.beginPath();ctx.rect(rx-lw/2,oy+50+lR,lw,12);ctx.fill();ctx.stroke()
  ctx.fillStyle=char.feet;ctx.strokeStyle=OL;ctx.lineWidth=1
  ctx.beginPath();ctx.rect(lx-lw/2-2,oy+60+lL,lw+4,3);ctx.fill();ctx.stroke()
  ctx.beginPath();ctx.rect(rx-lw/2-2,oy+60+lR,lw+4,3);ctx.fill();ctx.stroke()
}

function drawSatchel(ctx,char,cx,y,view){
  const isSide=view==='left'||view==='right',dir=view==='right'?1:-1
  const sx=isSide?cx-dir*9:cx+7,sy=y+36
  if(char.style==='red_shirt'){
    rrectStroke(ctx,sx-4,sy,9,9,2,'#E8C040',1.5);rrectStroke(ctx,sx-3,sy-3,7,3,1,'#C8A020',1)
  } else if(char.style==='detective_coat'){
    circStroke(ctx,sx+2,sy+3,5,'rgba(160,210,230,0.55)',1.5);line(ctx,sx+6,sy+7,sx+10,sy+11,OL,2)
  } else {
    rrectStroke(ctx,sx-4,sy,9,8,2,'#B89858',1.5);rrectStroke(ctx,sx-3,sy+1,7,6,1,'#9A7838',1)
    circStroke(ctx,sx+1,sy+1,1.5,'#F0D860',0.8)
  }
}

function drawFront(ctx,char,cx,oy,opts={}){
  const{bob=0,legL=0,legR=0,mouthOpen=false,blinking=false}=opts
  const y=oy+bob,ft=char.faceType||'human_nose'
  drawShadow(ctx,cx,oy);drawLegs(ctx,char,cx,oy,legL,legR);drawCreatureBody(ctx,char,cx,y)
  drawOutfitFront(ctx,char,cx,y);drawCollar(ctx,char,cx,y)
  drawFacialFeature(ctx,char,cx,y,0,mouthOpen);drawEyebrows(ctx,char,cx,y,0)
  if(blinking){drawEyeBlink(ctx,cx-6,y+14,4.5);if(ft!=='beak')drawEyeBlink(ctx,cx+6,y+14,4.5)}
  else if(ft==='beak'){drawEye(ctx,cx+3,y+14,5.5,char.eyes)}
  else{drawEye(ctx,cx-6,y+14,4.5,char.eyes);drawEye(ctx,cx+6,y+14,4.5,char.eyes)}
  ctx.globalAlpha=0.16;oval(ctx,cx+9,y+20,4,2.5,'#FF8898');ctx.globalAlpha=1.0
  drawSatchel(ctx,char,cx,y,'front');drawAccessory(ctx,char,cx,y,'front')
}

function drawSide(ctx,char,cx,oy,facingLeft,opts={}){
  const{bob=0,legL=0,legR=0}=opts,dir=facingLeft?-1:1,y=oy+bob
  drawShadow(ctx,cx,oy);drawLegs(ctx,char,cx,oy,legL,legR);drawCreatureBody(ctx,char,cx,y)
  drawOutfitSide(ctx,char,cx,y,dir);drawCollar(ctx,char,cx,y)
  drawFacialFeature(ctx,char,cx,y,dir,false);drawEyebrows(ctx,char,cx,y,dir)
  drawEye(ctx,cx-dir*4,y+14,5.5,char.eyes)
  ctx.globalAlpha=0.16;oval(ctx,cx-dir*8,y+20,3.5,2,'#FF8898');ctx.globalAlpha=1.0
  drawSatchel(ctx,char,cx,y,facingLeft?'left':'right');drawAccessory(ctx,char,cx,y,facingLeft?'left':'right')
}

function drawBack(ctx,char,cx,oy,opts={}){
  const{legL=0,legR=0}=opts,y=oy
  drawShadow(ctx,cx,oy);drawLegs(ctx,char,cx,oy,legL,legR);drawCreatureBody(ctx,char,cx,y)
  drawOutfitBack(ctx,char,cx,y);drawCollar(ctx,char,cx,y);drawAccessory(ctx,char,cx,y,'back')
}

function drawFrame(ctx,charId,animKey,frameIdx,ox,oy){
  const char=CHARS[charId];if(!char)return
  const cx=ox+32,f=frameIdx
  switch(animKey){
    case 'idle':drawFront(ctx,char,cx,oy,{bob:(f===1||f===3)?1:0});break
    case 'walk_down':{const[lL,lR]=WALK4[f]??[0,0];drawFront(ctx,char,cx,oy,{legL:lL,legR:lR});break}
    case 'walk_up':{const[lL,lR]=WALK4[f]??[0,0];drawBack(ctx,char,cx,oy,{legL:lL,legR:lR});break}
    case 'walk_left':{const[lL,lR]=WALK8[f]??[0,0];drawSide(ctx,char,cx,oy,true,{bob:Math.abs(lL)>1?-1:0,legL:lL,legR:lR});break}
    case 'walk_right':{const[lL,lR]=WALK8[f]??[0,0];drawSide(ctx,char,cx,oy,false,{bob:Math.abs(lL)>1?-1:0,legL:lL,legR:lR});break}
    case 'talk':drawFront(ctx,char,cx,oy,{mouthOpen:f===1||f===3,bob:(f===1||f===3)?-1:0});break
    case 'blink':drawFront(ctx,char,cx,oy,{blinking:f===1});break
  }
}

// ─── Layout ────────────────────────────────────────────────────────────────────
const CHAR_IDS = Object.keys(CHARS)
const SHOW_ANIMS = ['idle', 'walk_right', 'walk_left', 'talk']

const SCALE    = 2          // 2× upscale for readability
const FS       = FRAME * SCALE
const LABEL_W  = 108
const SEP_W    = 4          // gap between anim groups
const PAD      = 12
const ROW_H    = FS + 24    // frame height + label row below

// Calculate total columns
const totalFrameCols = SHOW_ANIMS.reduce((s,a) => s + ANIM_META[a].frames, 0)
const totalSepCols   = SHOW_ANIMS.length - 1
const contentW       = totalFrameCols * FS + totalSepCols * SEP_W
const canvasW        = LABEL_W + contentW + PAD * 2
const canvasH        = CHAR_IDS.length * ROW_H + PAD * 2 + 30  // +30 for title row

const canvas = createCanvas(canvasW, canvasH)
const ctx    = canvas.getContext('2d')

ctx.imageSmoothingEnabled = true

// Background
ctx.fillStyle = '#141210'
ctx.fillRect(0, 0, canvasW, canvasH)

// Title
ctx.fillStyle = 'rgba(255,255,255,0.35)'
ctx.font = 'bold 13px monospace'
ctx.fillText('Haven — Character Sprites (v8)', PAD + LABEL_W, PAD + 14)

// Column headers
let hx = PAD + LABEL_W
for (const animKey of SHOW_ANIMS) {
  const w = ANIM_META[animKey].frames * FS
  ctx.fillStyle = 'rgba(255,255,255,0.2)'
  ctx.font = '9px monospace'
  ctx.fillText(animKey, hx + 2, PAD + 26)
  hx += w + SEP_W
}

// Render each character
for (let ci = 0; ci < CHAR_IDS.length; ci++) {
  const charId = CHAR_IDS[ci]
  const char   = CHARS[charId]
  const baseY  = PAD + 30 + ci * ROW_H

  // Render full sprite sheet into a temporary canvas
  const sheetCanvas = createCanvas(FRAME * COLS, FRAME * ROWS)
  const sheetCtx    = sheetCanvas.getContext('2d')
  sheetCtx.imageSmoothingEnabled = true

  for (const [animKey, meta] of Object.entries(ANIM_META)) {
    for (let f = 0; f < meta.frames; f++) {
      sheetCtx.save()
      drawFrame(sheetCtx, charId, animKey, f, f * FRAME, meta.row * FRAME)
      sheetCtx.restore()
    }
  }

  // Character label
  ctx.fillStyle = char.body
  ctx.font = 'bold 11px monospace'
  ctx.fillText(charId.replace(/_/g, ' '), PAD, baseY + FS / 2 + 4)

  // Copy frames from the sprite sheet
  let fx = PAD + LABEL_W
  for (const animKey of SHOW_ANIMS) {
    const meta = ANIM_META[animKey]
    for (let f = 0; f < meta.frames; f++) {
      ctx.drawImage(
        sheetCanvas,
        f * FRAME, meta.row * FRAME, FRAME, FRAME,
        fx, baseY, FS, FS
      )
      fx += FS
    }
    // Separator
    ctx.fillStyle = 'rgba(255,255,255,0.06)'
    ctx.fillRect(fx, baseY, SEP_W, FS)
    fx += SEP_W
  }

  // Row rule
  if (ci < CHAR_IDS.length - 1) {
    ctx.fillStyle = 'rgba(255,255,255,0.04)'
    ctx.fillRect(PAD, baseY + FS + 4, canvasW - PAD * 2, 1)
  }
}

// Save
const outPath = resolve(__dirname, '..', 'docs', 'sprite-preview.png')
mkdirSync(resolve(__dirname, '..', 'docs'), { recursive: true })
writeFileSync(outPath, canvas.toBuffer('image/png'))
console.log(`✓  Saved ${outPath}  (${canvasW}×${canvasH}px)`)
