// Visitor chibi SVG sprites — merchant, diplomat, orc

export function MerchantSprite({ size = 64 }) {
  const h = size * 1.5
  return (
    <svg viewBox="0 0 64 96" width={size} height={h}>
      <ellipse cx="32" cy="92" rx="18" ry="3.5" fill="rgba(0,0,0,0.22)" />
      {/* Body — travel cloak */}
      <path d="M12,57 Q10,90 13,90 L51,90 Q54,90 52,57 Q44,52 32,52 Q20,52 12,57 Z"
        fill="#8B5E3C" />
      <path d="M21,61 Q32,57 43,61 L42,90 L22,90 Z" fill="#9A7040" opacity="0.5" />
      {/* Belt */}
      <rect x="20" y="70" width="24" height="5" rx="2" fill="#5A3818" />
      <rect x="28" y="69" width="8" height="7" rx="1" fill="#C8A050" />
      {/* Coin bag */}
      <ellipse cx="47" cy="76" rx="7" ry="8" fill="#C8A050" />
      <path d="M42,71 Q47,68 52,71" fill="none" stroke="#A08030" strokeWidth="1.5" />
      <line x1="43" y1="74" x2="51" y2="74" stroke="#A08030" strokeWidth="1" opacity="0.5" />
      {/* Head */}
      <circle cx="32" cy="34" r="17" fill="#F0C090" />
      {/* Rosy cheeks */}
      <circle cx="23" cy="39" r="5.5" fill="#E89060" opacity="0.36" />
      <circle cx="41" cy="39" r="5.5" fill="#E89060" opacity="0.36" />
      {/* Eyes */}
      <ellipse cx="26" cy="33" rx="3" ry="3.2" fill="#3A2015" />
      <ellipse cx="38" cy="33" rx="3" ry="3.2" fill="#3A2015" />
      <circle cx="27" cy="32" r="1.2" fill="white" opacity="0.85" />
      <circle cx="39" cy="32" r="1.2" fill="white" opacity="0.85" />
      {/* Smile */}
      <path d="M25,42 Q32,47 39,42" stroke="#7A4520" strokeWidth="1.5"
        fill="none" strokeLinecap="round" />
      {/* Nose */}
      <path d="M31,38 Q32,41 33,38" stroke="#C08060" strokeWidth="1.2" fill="none" />
      {/* Wide hat brim */}
      <ellipse cx="32" cy="19" rx="21" ry="5.5" fill="#5A3818" />
      {/* Hat crown */}
      <path d="M16,19 Q17,7 32,7 Q47,7 48,19 Z" fill="#6B4820" />
      <path d="M20,15 Q32,11 44,15" fill="none" stroke="#7A5828" strokeWidth="1.5" opacity="0.5" />
    </svg>
  )
}

export function DiplomatSprite({ size = 64 }) {
  const h = size * 1.5
  return (
    <svg viewBox="0 0 64 96" width={size} height={h}>
      <ellipse cx="32" cy="92" rx="16" ry="3.5" fill="rgba(0,0,0,0.22)" />
      {/* Body — formal navy coat */}
      <path d="M17,55 Q15,90 17,90 L47,90 Q49,90 47,55 Q42,50 32,50 Q22,50 17,55 Z"
        fill="#1A3870" />
      <path d="M24,59 Q32,55 40,59 L39,90 L25,90 Z" fill="#243F8A" opacity="0.6" />
      {/* Gold buttons */}
      <circle cx="32" cy="66" r="2"   fill="#C8A840" />
      <circle cx="32" cy="75" r="2"   fill="#C8A840" />
      <circle cx="32" cy="84" r="2"   fill="#C8A840" />
      {/* Epaulettes */}
      <ellipse cx="17" cy="57" rx="5" ry="3" fill="#C8A840" opacity="0.75" />
      <ellipse cx="47" cy="57" rx="5" ry="3" fill="#C8A840" opacity="0.75" />
      {/* Scroll in right hand */}
      <rect x="45" y="62" width="8" height="18" rx="4" fill="#F2E4C4" />
      <line x1="45" y1="67" x2="53" y2="67" stroke="#C4A060" strokeWidth="0.9" opacity="0.6" />
      <line x1="45" y1="71" x2="53" y2="71" stroke="#C4A060" strokeWidth="0.9" opacity="0.6" />
      {/* Head */}
      <ellipse cx="32" cy="34" rx="15" ry="17" fill="#F4D4A0" />
      {/* Eyes — composed, steady */}
      <ellipse cx="26" cy="33" rx="2.8" ry="3" fill="#2A1810" />
      <ellipse cx="38" cy="33" rx="2.8" ry="3" fill="#2A1810" />
      <circle cx="26.8" cy="32" r="1"  fill="white" opacity="0.8" />
      <circle cx="38.8" cy="32" r="1"  fill="white" opacity="0.8" />
      {/* Distinguished expression */}
      <path d="M27,42 Q32,45 37,42" stroke="#8A5030" strokeWidth="1.3"
        fill="none" strokeLinecap="round" />
      {/* Thin mustache */}
      <path d="M27,38 Q32,36 37,38" fill="none" stroke="#4A2010"
        strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      {/* Nose */}
      <path d="M31,37 Q32,40 33,37" stroke="#C09060" strokeWidth="1.1" fill="none" />
      {/* Tall formal hat */}
      <rect x="20" y="13" width="24" height="20" rx="3" fill="#1A3870" />
      {/* Hat brim */}
      <rect x="14" y="31" width="36" height="5" rx="2" fill="#122858" />
      {/* Gold hat band */}
      <rect x="20" y="29" width="24" height="4" fill="#C8A840" />
    </svg>
  )
}

export function OrcSprite({ size = 64 }) {
  const h = size * 1.5
  return (
    <svg viewBox="0 0 64 96" width={size} height={h}>
      <ellipse cx="32" cy="92" rx="20" ry="3.8" fill="rgba(0,0,0,0.25)" />
      {/* Body — stocky leather armor */}
      <path d="M8,57 Q6,90 10,90 L54,90 Q58,90 56,57 Q48,50 32,50 Q16,50 8,57 Z"
        fill="#4A3828" />
      <path d="M16,62 Q32,56 48,62 L47,90 L17,90 Z" fill="#6A5038" opacity="0.55" />
      {/* Armor straps */}
      <line x1="20" y1="66" x2="44" y2="66" stroke="#8A6848" strokeWidth="2.5" opacity="0.5" />
      <line x1="18" y1="78" x2="46" y2="78" stroke="#8A6848" strokeWidth="2.5" opacity="0.5" />
      {/* Shoulder guards */}
      <ellipse cx="11" cy="58" rx="7" ry="5" fill="#5A4030" />
      <ellipse cx="53" cy="58" rx="7" ry="5" fill="#5A4030" />
      {/* Head — wider, rounder */}
      <ellipse cx="32" cy="33" rx="20" ry="18" fill="#7A9050" />
      {/* Lower jaw slightly wider */}
      <ellipse cx="32" cy="44" rx="17" ry="10" fill="#7A9050" />
      {/* Tusks */}
      <path d="M24,49 Q22,56 24,58" stroke="white"   strokeWidth="5"   strokeLinecap="round" fill="none" />
      <path d="M40,49 Q42,56 40,58" stroke="white"   strokeWidth="5"   strokeLinecap="round" fill="none" />
      <path d="M24,49 Q22,56 24,58" stroke="#D8D8C0"  strokeWidth="3"   strokeLinecap="round" fill="none" />
      <path d="M40,49 Q42,56 40,58" stroke="#D8D8C0"  strokeWidth="3"   strokeLinecap="round" fill="none" />
      {/* Brow ridge */}
      <path d="M18,27 Q25,23 31,26" fill="#5A7038" />
      <path d="M33,26 Q39,23 46,27" fill="#5A7038" />
      {/* Eyes — squinting */}
      <ellipse cx="25" cy="31" rx="3.5" ry="2.5" fill="#1A1206" />
      <ellipse cx="39" cy="31" rx="3.5" ry="2.5" fill="#1A1206" />
      <circle cx="26"   cy="30.5" r="1"  fill="white" opacity="0.65" />
      <circle cx="40"   cy="30.5" r="1"  fill="white" opacity="0.65" />
      {/* Broad nose */}
      <ellipse cx="32" cy="39" rx="4" ry="3" fill="#6A8040" />
      <circle cx="29.5" cy="39" r="1.5" fill="#506030" />
      <circle cx="34.5" cy="39" r="1.5" fill="#506030" />
      {/* Grim mouth */}
      <path d="M24,45 Q32,43 40,45" stroke="#3A4820" strokeWidth="1.5"
        fill="none" strokeLinecap="round" />
      {/* Rough dark hair */}
      <path d="M13,26 Q11,14 21,12 Q26,10 28,18" fill="#2A2010" />
      <path d="M51,26 Q53,14 43,12 Q38,10 36,18" fill="#2A2010" />
      <path d="M20,16 Q32,7 44,16 Q38,11 32,10 Q26,11 20,16 Z" fill="#2A2010" />
    </svg>
  )
}

export const VISITOR_SPRITES = {
  merchant: MerchantSprite,
  diplomat: DiplomatSprite,
  orc:      OrcSprite,
}
