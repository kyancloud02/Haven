import ParchmentCard from './ParchmentCard'

export default function Mailbox() {
  return (
    <ParchmentCard shape="a" tilt={-1.8} className="w-52">
      <h2
        className="text-sm font-bold tracking-widest uppercase mb-3"
        style={{ color: '#7A4F1E', fontFamily: 'Georgia, serif' }}
      >
        Mailbox
      </h2>
      <p
        className="text-sm leading-snug"
        style={{ color: '#6B5030', fontFamily: 'Georgia, serif' }}
      >
        No letters yet.
      </p>
      <p
        className="text-xs mt-3 opacity-60"
        style={{ color: '#8B6A3A', fontFamily: 'Georgia, serif' }}
      >
        Check back soon.
      </p>
    </ParchmentCard>
  )
}
