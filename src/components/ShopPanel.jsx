import { motion } from 'framer-motion'

export default function ShopPanel({ onClose }) {
  return (
    <motion.div
      className="fixed right-0 top-0 h-full w-72 z-50 flex flex-col"
      style={{ background: 'rgba(10,8,5,0.93)', backdropFilter: 'blur(16px)', borderLeft: '1px solid rgba(255,255,255,0.07)' }}
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 260 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <h2 style={{ fontFamily: "'Fredoka One', sans-serif", color: 'white', fontSize: '1.2rem', letterSpacing: '0.02em' }}>
          Shop
        </h2>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
          style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.06)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'white'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
        >
          ✕
        </button>
      </div>

      {/* Empty state */}
      <div className="px-5 py-8 flex-1 flex flex-col items-center justify-center gap-3 text-center">
        <div className="text-4xl opacity-30">🛍️</div>
        <p style={{ fontFamily: "'Nunito', sans-serif", color: 'rgba(255,255,255,0.35)', fontSize: '0.9rem', fontWeight: 600 }}>
          Nothing for sale yet.
        </p>
        <p style={{ fontFamily: "'Nunito', sans-serif", color: 'rgba(255,255,255,0.2)', fontSize: '0.78rem' }}>
          Visit again later.
        </p>
      </div>
    </motion.div>
  )
}
