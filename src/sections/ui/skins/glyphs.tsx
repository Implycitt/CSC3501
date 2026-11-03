import type { ReactElement, ReactNode } from 'react'
import type { GlyphName } from './types.ts'

const shape = (children: ReactNode) => (
  <svg
    viewBox="0 0 32 20"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-full w-full"
  >
    {children}
  </svg>
)

const andShape = 'M6 3h7a7 7 0 0 1 0 14H6z'
const orShape = 'M6 3q8 7 0 14 8 0 13-7-5-7-13-7z'
const xorArc = 'M3 3q7 7 0 14'
const box = 'M8 4h16v12H8z'

export const GLYPHS: Record<GlyphName, ReactElement> = {
  not: shape(
    <>
      <path d="M6 3l14 7-14 7z" />
      <circle cx="23" cy="10" r="2.4" />
      <path d="M25.4 10h3.6" />
    </>,
  ),
  buffer: shape(
    <>
      <path d="M6 3l14 7-14 7z" />
      <path d="M20 10h9" />
    </>,
  ),
  and: shape(
    <>
      <path d={andShape} />
      <path d="M20 10h9" />
    </>,
  ),
  nand: shape(
    <>
      <path d={andShape} />
      <circle cx="22.5" cy="10" r="2" />
      <path d="M24.5 10h4.5" />
    </>,
  ),
  or: shape(
    <>
      <path d={orShape} />
      <path d="M19 10h10" />
    </>,
  ),
  nor: shape(
    <>
      <path d={orShape} />
      <circle cx="21.5" cy="10" r="2" />
      <path d="M23.5 10h5.5" />
    </>,
  ),
  xor: shape(
    <>
      <path d={xorArc} />
      <path d={orShape} />
      <path d="M19 10h10" />
    </>,
  ),
  xnor: shape(
    <>
      <path d={xorArc} />
      <path d={orShape} />
      <circle cx="21.5" cy="10" r="2" />
      <path d="M23.5 10h5.5" />
    </>,
  ),
  switch: shape(
    <>
      <path d="M3 10h6" />
      <path d="M9 5v10" />
      <path d="M15 4v12" />
      <path d="M9 10h6" />
      <path d="M15 6h13" />
      <path d="M15 14h13" />
    </>,
  ),
  constant: shape(
    <>
      <rect x="11" y="6" width="8" height="8" rx="1" />
      <path d="M19 10h10" />
    </>,
  ),
  mux: shape(
    <>
      <path d="M5 3h9l7 7-7 7H5z" />
      <path d="M21 10h8" />
    </>,
  ),
  demux: shape(
    <>
      <path d="M12 3h14v14H12l-7-7z" />
      <path d="M2 10h3.5" />
      <path d="M26 7h4" />
      <path d="M26 13h4" />
    </>,
  ),
  decode: shape(
    <>
      <rect x="9" y="3" width="10" height="14" rx="1" />
      <path d="M3 7h6" />
      <path d="M3 13h6" />
      <path d="M19 6h10" />
      <path d="M19 10h10" />
      <path d="M19 14h10" />
    </>,
  ),
  encode: shape(
    <>
      <rect x="11" y="3" width="10" height="14" rx="1" />
      <path d="M3 5h8" />
      <path d="M3 10h8" />
      <path d="M3 15h8" />
      <path d="M21 10h8" />
    </>,
  ),
  compare: shape(
    <>
      <path d="M8 4v12" />
      <path d="M13 4v12" />
      <path d="M18 6l5 4-5 4" />
    </>,
  ),
  latch: shape(
    <>
      <rect x="9" y="4" width="14" height="12" rx="1" />
      <path d="M3 7h6" />
      <path d="M3 13h6" />
      <path d="M23 7h6" />
      <path d="M23 13h6" />
    </>,
  ),
  flipflop: shape(
    <>
      <rect x="9" y="4" width="14" height="12" rx="1" />
      <path d="M9 10l4 2-4 2" />
      <path d="M4 8h5" />
      <path d="M23 10h5" />
    </>,
  ),
  register: shape(
    <>
      <path d={box} />
      <path d="M13.3 4v12" />
      <path d="M18.6 4v12" />
      <path d="M3 6h5" />
      <path d="M3 14h5" />
      <path d="M24 6h5" />
      <path d="M24 14h5" />
    </>,
  ),
  shift: shape(
    <>
      <rect x="6" y="5" width="11" height="10" rx="1" />
      <path d="M3 10h3" />
      <path d="M17 10h5" />
      <path d="M23 7l3 3-3 3" />
    </>,
  ),
  counter: shape(
    <>
      <rect x="7" y="4" width="18" height="12" rx="1" />
      <path d="M16 14V7" />
      <path d="M12.5 10.5L16 7l3.5 3.5" />
    </>,
  ),
  ram: shape(
    <>
      <rect x="7" y="3" width="18" height="14" rx="1" />
      <path d="M7 8h18" />
      <path d="M7 13h18" />
      <path d="M3 6h4" />
      <path d="M3 15h4" />
    </>,
  ),
  adder: shape(
    <>
      <rect x="7" y="4" width="18" height="12" rx="1" />
      <path d="M16 7v6" />
      <path d="M13 10h6" />
    </>,
  ),
  subtractor: shape(
    <>
      <rect x="7" y="4" width="18" height="12" rx="1" />
      <path d="M13 10h6" />
    </>,
  ),
  multiplier: shape(
    <>
      <rect x="7" y="4" width="18" height="12" rx="1" />
      <path d="M13 7l6 6" />
      <path d="M19 7l-6 6" />
    </>,
  ),
  alu: shape(
    <>
      <rect x="7" y="4" width="18" height="12" rx="1" />
      <path d="M13 6h6l-3 4 3 4h-6" />
    </>,
  ),
  tube: shape(
    <>
      <path d="M12 3h8v7a4 4 0 0 1-8 0z" />
      <path d="M14 6v4" />
      <path d="M16 14v3" />
      <path d="M12 17h8" />
    </>,
  ),
  diode: shape(
    <>
      <path d="M3 10h7" />
      <path d="M10 4l10 6-10 6z" />
      <path d="M20 4v12" />
      <path d="M20 10h9" />
    </>,
  ),
  core: shape(
    <>
      <circle cx="16" cy="10" r="6" />
      <circle cx="16" cy="10" r="2" />
      <path d="M3 10h7" />
      <path d="M22 10h7" />
    </>,
  ),
  relay: shape(
    <>
      <rect x="7" y="5" width="7" height="10" rx="1" />
      <path d="M3 10h4" />
      <path d="M14 10h4l7-4" />
      <path d="M18 10h11" />
    </>,
  ),
  build: shape(
    <>
      <rect x="6" y="4" width="14" height="12" rx="1" />
      <circle cx="11.5" cy="10" r="2" />
      <path d="M13.5 10h4" />
      <path d="M20 10h9" />
    </>,
  ),
  generic: shape(
    <>
      <path d={box} />
      <path d="M3 10h5" />
      <path d="M24 10h5" />
    </>,
  ),
}
