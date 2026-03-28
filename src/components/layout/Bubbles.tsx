const pseudoRandom = (seed: number) => {
  const value = Math.sin(seed * 12.9898) * 43758.5453
  return value - Math.floor(value)
}

interface Bubble {
  id: number
  size: number
  left: number
  bottom: number
  wobble: number
  duration: number
  delay: number
}

const bubbles: Bubble[] = Array.from({ length: 32 }, (_, i) => ({
  id: i,
  size: pseudoRandom(i + 1) * 18 + 4,
  left: pseudoRandom(i + 11) * 100,
  bottom: pseudoRandom(i + 21) * 20,
  wobble: (pseudoRandom(i + 31) - 0.5) * 40,
  duration: pseudoRandom(i + 41) * 8 + 6,
  delay: pseudoRandom(i + 51) * 8,
}))

export function Bubbles() {
  return (
    <div className="bubbles">
      {bubbles.map((b) => (
        <div
          key={b.id}
          className="bubble"
          style={
            {
              width: `${b.size}px`,
              height: `${b.size}px`,
              left: `${b.left}%`,
              bottom: `${b.bottom}%`,
              '--wobble': `${b.wobble}px`,
              animationDuration: `${b.duration}s`,
              animationDelay: `${b.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
