import ParchmentCard from './ParchmentCard'

export default function Shop() {
  return (
    <ParchmentCard shape="b" tilt={1.4} className="w-52">
      <h2
        className="text-sm font-bold tracking-widest uppercase mb-3"
        style={{ color: '#7A4F1E', fontFamily: 'Georgia, serif' }}
      >
        Shop
      </h2>
      <p
        className="text-sm leading-snug"
        style={{ color: '#6B5030', fontFamily: 'Georgia, serif' }}
      >
        Nothing for sale yet.
      </p>
      <p
        className="text-xs mt-3 opacity-60"
        style={{ color: '#8B6A3A', fontFamily: 'Georgia, serif' }}
      >
        Visit again later.
      </p>
    </ParchmentCard>
  )
}
