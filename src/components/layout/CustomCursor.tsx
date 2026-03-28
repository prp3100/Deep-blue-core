import { useEffect, useState } from 'react'

const isCoarsePointer = () =>
  typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: coarse)').matches

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isCoarsePointer() || prefersReducedMotion()) {
      return
    }

    const handleMove = (event: MouseEvent) => {
      setPosition({ x: event.clientX, y: event.clientY })
      setVisible(true)
    }

    const handleLeave = () => setVisible(false)

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseout', handleLeave)

    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseout', handleLeave)
    }
  }, [])

  if (!visible) {
    return null
  }

  return (
    <div
      className="custom-cursor"
      style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
    />
  )
}
