import { useState, useRef } from 'react'
import { motion, AnimatePresence, animate, useMotionValue } from 'framer-motion'
import shopItems from '../data/shopItems.json'
import { WORLD_SLOTS } from '../data/slots'

const SNAP_DIST = 100
const ITEM_MAP = Object.fromEntries(shopItems.map(i => [i.id, i]))

function slotScreenPos(slot) {
  return {
    x: slot.xPct * window.innerWidth,
    y: window.innerHeight - slot.bottomPct * window.innerHeight,
  }
}

function findNearestSlot(clientX, clientY) {
  let best = null, bestD = SNAP_DIST
  for (const slot of WORLD_SLOTS) {
    const pos = slotScreenPos(slot)
    const d = Math.hypot(clientX - pos.x, clientY - pos.y)
    if (d < bestD) { bestD = d; best = slot }
  }
  return best
}

// ── Slot marker (edit mode) ───────────────────────────────────────────────────
function SlotMarker({ slot, isHighlighted }) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${slot.xPct * 100}%`,
        bottom: `${slot.bottomPct * 100}%`,
        transform: 'translate(-50%, 50%)',
        zIndex: 5,
      }}
    >
      <motion.div
        className="rounded-full border-2 border-dashed flex items-center justify-center"
        style={{
          width: 52,
          height: 52,
          borderColor: isHighlighted ? '#FFD700' : 'rgba(255,255,255,0.35)',
          background: isHighlighted ? 'rgba(255,215,0,0.12)' : 'rgba(255,255,255,0.05)',
        }}
        animate={{
          opacity: isHighlighted ? 1 : [0.4, 0.75, 0.4],
          scale: isHighlighted ? 1.18 : 1,
        }}
        transition={{
          opacity: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
          scale: { duration: 0.2 },
        }}
      >
        <span style={{ fontSize: '0.65rem', color: isHighlighted ? '#FFD700' : 'rgba(255,255,255,0.4)' }}>+</span>
      </motion.div>
    </div>
  )
}

// ── Item placed in world ───────────────────────────────────────────────────────
function PlacedItem({ slot, item, editMode, onRemove }) {
  return (
    <motion.div
      className="absolute"
      style={{
        left: `${slot.xPct * 100}%`,
        bottom: `${slot.bottomPct * 100}%`,
        transform: `translateX(-50%)`,
        zIndex: 3,
        pointerEvents: editMode ? 'auto' : 'none',
      }}
      initial={{ scale: 0, y: 12 }}
      animate={{ scale: slot.scale, y: [0, -5, 0] }}
      exit={{ scale: 0, y: 12, opacity: 0 }}
      transition={{
        scale: { type: 'spring', stiffness: 420, damping: 22 },
        y: { duration: 2.6 + slot.xPct, repeat: Infinity, ease: 'easeInOut' },
      }}
    >
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <span style={{ fontSize: '2.2rem', lineHeight: 1, userSelect: 'none' }}>{item.icon}</span>
        {editMode && (
          <button
            onClick={onRemove}
            style={{
              position: 'absolute', top: -6, right: -6,
              width: 18, height: 18, borderRadius: '50%',
              background: 'rgba(200,30,30,0.92)',
              border: '1px solid rgba(255,80,80,0.5)',
              color: 'white', fontSize: '0.65rem', fontWeight: 800,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        )}
      </div>
    </motion.div>
  )
}

// ── Draggable inventory item ──────────────────────────────────────────────────
function DraggableItem({ item, onDragMove, onDrop }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const ref = useRef(null)

  return (
    <motion.div
      ref={ref}
      style={{ x, y, touchAction: 'none', cursor: 'grab', zIndex: 60, position: 'relative' }}
      drag
      dragMomentum={false}
      dragElastic={0}
      whileDrag={{ scale: 1.35, cursor: 'grabbing' }}
      whileHover={{ scale: 1.1 }}
      onDrag={() => {
        if (!ref.current) return
        const r = ref.current.getBoundingClientRect()
        onDragMove(r.left + r.width / 2, r.top + r.height / 2)
      }}
      onDragEnd={() => {
        if (!ref.current) return
        const r = ref.current.getBoundingClientRect()
        onDrop(r.left + r.width / 2, r.top + r.height / 2, item.id)
        animate(x, 0, { type: 'spring', stiffness: 500, damping: 30 })
        animate(y, 0, { type: 'spring', stiffness: 500, damping: 30 })
      }}
    >
      <div className="flex flex-col items-center gap-0.5 select-none px-2 py-1.5 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
      >
        <span style={{ fontSize: '1.9rem', lineHeight: 1 }}>{item.icon}</span>
        <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.55)', fontFamily: 'Nunito', textAlign: 'center', maxWidth: 64 }}>
          {item.name}
        </span>
      </div>
    </motion.div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function PlacementOverlay({ editMode, slotItems = {}, inventory = [], onPlace, onRemove }) {
  const [highlightedSlotId, setHighlightedSlotId] = useState(null)

  const ownedItems = [...new Set(inventory)].map(id => ITEM_MAP[id]).filter(Boolean)

  function handleDragMove(cx, cy) {
    const slot = findNearestSlot(cx, cy)
    setHighlightedSlotId(slot?.id ?? null)
  }

  function handleDrop(cx, cy, itemId) {
    const slot = findNearestSlot(cx, cy)
    if (slot) onPlace(slot.id, itemId)
    setHighlightedSlotId(null)
  }

  return (
    <>
      {/* Placed items — always rendered */}
      <AnimatePresence>
        {Object.entries(slotItems).map(([slotId, itemId]) => {
          const slot = WORLD_SLOTS.find(s => s.id === slotId)
          const item = ITEM_MAP[itemId]
          if (!slot || !item) return null
          return (
            <PlacedItem
              key={slotId}
              slot={slot}
              item={item}
              editMode={editMode}
              onRemove={() => onRemove(slotId)}
            />
          )
        })}
      </AnimatePresence>

      {/* Edit mode overlay */}
      <AnimatePresence>
        {editMode && (
          <motion.div
            key="edit-ui"
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 4 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Slot markers */}
            {WORLD_SLOTS.map(slot => (
              <SlotMarker
                key={slot.id}
                slot={slot}
                isHighlighted={highlightedSlotId === slot.id}
              />
            ))}

            {/* Inventory tray */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 pointer-events-auto"
              style={{ zIndex: 10 }}
              initial={{ y: 140 }}
              animate={{ y: 0 }}
              exit={{ y: 140 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            >
              <div
                className="mx-auto rounded-t-2xl px-6 pt-4 pb-6"
                style={{
                  maxWidth: 640,
                  background: 'rgba(10,8,6,0.94)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderBottom: 'none',
                  boxShadow: '0 -8px 40px rgba(0,0,0,0.5)',
                }}
              >
                <p style={{
                  fontFamily: 'Nunito, sans-serif', fontSize: '0.65rem',
                  color: 'rgba(255,255,255,0.35)', textAlign: 'center',
                  letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14,
                }}>
                  Drag items onto glowing slots · Tap × to remove
                </p>

                {ownedItems.length === 0 ? (
                  <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.8rem', color: 'rgba(255,255,255,0.28)', textAlign: 'center', padding: '6px 0 2px' }}>
                    No items yet — visit the shop!
                  </p>
                ) : (
                  <div className="flex gap-3 justify-center flex-wrap">
                    {ownedItems.map(item => (
                      <DraggableItem
                        key={item.id}
                        item={item}
                        onDragMove={handleDragMove}
                        onDrop={handleDrop}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
