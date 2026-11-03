import { useLayoutEffect, useState } from 'react'

interface TutorialOverlayProps {
  target?: string
}

interface Box {
  left: number
  top: number
  width: number
  height: number
}

export default function TutorialOverlay({ target }: TutorialOverlayProps) {
  const [box, setBox] = useState<Box | null>(null)

  useLayoutEffect(() => {
    if (!target) return

    const measure = () => {
      const element = document.querySelector<HTMLElement>(`[data-tutorial="${target}"]`)
      if (!element) {
        setBox(null)
        return
      }

      const rect = element.getBoundingClientRect()
      setBox({ left: rect.left, top: rect.top, width: rect.width, height: rect.height })
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(document.body)
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [target])

  if (!target || !box) return null

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed z-40 border-2 border-amber-300"
      style={{
        left: box.left - 4,
        top: box.top - 4,
        width: box.width + 8,
        height: box.height + 8,
        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.55)',
      }}
    />
  )
}
