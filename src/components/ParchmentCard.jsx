import { motion } from 'framer-motion'

// Two distinct hand-cut silhouettes in a 0–100 normalized coordinate space.
// Rendered into viewBox="0 0 100 100" with preserveAspectRatio="none" so the
// shape fills whatever size the wrapper div becomes. The mild distortion at
// non-square aspect ratios is intentional — it adds to the hand-made feel.
const PATHS = {
  // shape 'a' — top-left notch, right edge bows very slightly out
  a: 'M 3.5,6.5 L 9.8,1.0 L 53,0.3 L 91,1.8 L 97.5,4.5 L 99.2,9.0 L 98.5,50 L 99.8,88 L 97.5,95.5 L 91.5,99.5 L 50,100.5 L 9.5,99.0 L 2.8,95.8 L 0.8,90.5 L 1.2,50 L 0.2,12.5 Z',
  // shape 'b' — top-right notch, bottom-left corner clipped more sharply
  b: 'M 2.0,5.0 L 8.5,0.5 L 50,0.8 L 92.5,1.2 L 98.5,6.0 L 100.5,11.0 L 99.5,50 L 100.8,89 L 97.8,96.5 L 92.0,100.5 L 50,99.8 L 8.0,101.0 L 1.2,97.0 L 0.0,90.5 L 1.8,50 L 0.5,10.5 Z',
}

export default function ParchmentCard({ children, shape = 'a', tilt = 0, className = '' }) {
  // Unique filter IDs per shape to avoid cross-component bleed
  const filterId = `parchment-tex-${shape}`

  return (
    <motion.div
      className={`relative inline-block ${className}`}
      initial={{ rotate: tilt }}
      animate={{ rotate: tilt }}
      whileHover={{ y: -5, rotate: tilt * 0.35, transition: { type: 'spring', stiffness: 300, damping: 22 } }}
    >
      {/* ── SVG backdrop: shape + texture + border ── */}
      <svg
        className="absolute inset-0 w-full h-full overflow-visible"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <filter id={filterId} x="-10%" y="-10%" width="120%" height="120%">
            {/* Subtle edge wobble — makes the cut look slightly imprecise */}
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.032"
              numOctaves="3"
              seed={shape === 'a' ? 4 : 9}
              result="edgeNoise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="edgeNoise"
              scale="1.4"
              xChannelSelector="R"
              yChannelSelector="G"
              result="wobbled"
            />
            {/* Paper grain overlay blended in multiply mode */}
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.68"
              numOctaves="4"
              stitchTiles="stitch"
              result="grain"
            />
            <feColorMatrix type="saturate" values="0" in="grain" result="grayGrain" />
            <feBlend in="wobbled" in2="grayGrain" mode="multiply" result="textured" />
            {/* Warm the shadows slightly */}
            <feComponentTransfer in="textured">
              <feFuncR type="linear" slope="0.96" intercept="0.04" />
              <feFuncG type="linear" slope="0.94" intercept="0.02" />
              <feFuncB type="linear" slope="0.88" intercept="0.00" />
            </feComponentTransfer>
          </filter>
        </defs>

        {/* Parchment fill */}
        <path d={PATHS[shape]} fill="#F2E6C4" filter={`url(#${filterId})`} />

        {/* Hand-drawn border — warm amber, slightly translucent */}
        <path
          d={PATHS[shape]}
          fill="none"
          stroke="#BF9A48"
          strokeWidth="0.9"
          opacity="0.60"
          strokeLinejoin="round"
        />

        {/* Aged corner crease — top-left only */}
        <line
          x1="3.5" y1="6.5" x2="9.8" y2="1.0"
          stroke="#A07830"
          strokeWidth="0.5"
          opacity="0.35"
        />
      </svg>

      {/* ── Content ── */}
      <div className="relative z-10 px-5 py-4">
        {children}
      </div>
    </motion.div>
  )
}
