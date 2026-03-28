import type { MouseEvent } from 'react'

const RIPPLE_CLASS = 'cta-ripple--active'

export const triggerRipple = (event: MouseEvent<HTMLElement>) => {
  const target = event.currentTarget
  const rect = target.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  target.style.setProperty('--ripple-x', `${x}px`)
  target.style.setProperty('--ripple-y', `${y}px`)
  target.classList.remove(RIPPLE_CLASS)
  // Force reflow to restart animation.
  void target.offsetWidth
  target.classList.add(RIPPLE_CLASS)

  window.setTimeout(() => {
    target.classList.remove(RIPPLE_CLASS)
  }, 650)
}
