import { GLYPHS } from './glyphs.tsx'
import type { GlyphName } from './types.ts'

interface PartGlyphProps {
  glyph: GlyphName
  image?: string
  className?: string
}

export default function PartGlyph({ glyph, image, className = '' }: PartGlyphProps) {
  if (image) {
    return (
      <span className={`flex items-center justify-center ${className}`} aria-hidden="true">
        <img src={image} alt="" className="h-full w-full object-contain" draggable={false} />
      </span>
    )
  }

  return (
    <span className={`flex items-center justify-center ${className}`} aria-hidden="true">
      {GLYPHS[glyph]}
    </span>
  )
}
