import type { PointerEvent as ReactPointerEvent } from 'react'
import { IO_H, IO_W, type Point } from './geometry.ts'
import PortDot from './PortDot.tsx'
import { gripStyle } from './styles.ts'

const bit = (value: boolean | undefined) => (value ? '1' : '0')

interface IoNodeProps {
  kind: 'in' | 'out'
  name: string
  position: Point
  lit: boolean
  value: boolean | undefined
  clock: boolean
  onMove: (key: string, e: ReactPointerEvent) => void
  onWire: (key: string, e: ReactPointerEvent) => void
  onRemove: (kind: 'in' | 'out', name: string) => void
  onToggle: (name: string) => void
}

export default function IoNode({
  kind,
  name,
  position,
  lit,
  value,
  clock,
  onMove,
  onWire,
  onRemove,
  onToggle,
}: IoNodeProps) {
  const key = `${kind}:${name}`

  return (
    <div
      data-node={key}
      onPointerDown={(e) => onMove(key, e)}
      className="absolute flex cursor-move items-center border border-amber-500 bg-black"
      style={{ left: position.x, top: position.y, width: IO_W, height: IO_H }}
    >
      {kind === 'in' && (
        <span
          className="h-full w-2.5 shrink-0 cursor-move border-r border-amber-800 bg-amber-950/40"
          style={gripStyle}
          title="Drag to move"
        />
      )}

      {kind === 'out' ? (
        <span className="flex-1 truncate px-2 text-xs">
          {name} {bit(value)}
        </span>
      ) : clock ? (
        <span className="flex-1 truncate px-2 text-xs">clk</span>
      ) : (
        <button
          className="flex-1 truncate px-2 text-left text-xs"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onToggle(name)}
          title="Toggle this input"
        >
          {name} {bit(value)}
        </button>
      )}

      <button
        className="px-1 text-amber-700 hover:text-amber-300"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => onRemove(kind, name)}
        title={`Remove this ${kind === 'in' ? 'input' : 'output'}`}
      >
        ×
      </button>

      {kind === 'out' && (
        <span
          className="h-full w-2.5 shrink-0 cursor-move border-l border-amber-800 bg-amber-950/40"
          style={gripStyle}
          title="Drag to move"
        />
      )}

      <div
        data-port={key}
        className="absolute top-0 z-10 h-full w-5 cursor-crosshair"
        style={kind === 'in' ? { right: -10 } : { left: -10 }}
        title="Drag to wire"
        onPointerDown={(e) => {
          e.stopPropagation()
          onWire(key, e)
        }}
      >
        <PortDot lit={lit} />
      </div>
    </div>
  )
}
