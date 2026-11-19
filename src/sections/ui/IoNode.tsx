import type { PointerEvent as ReactPointerEvent } from 'react'
import { IO_H, IO_W, PORT_HIT, type Point } from './geometry.ts'
import PortDot from './PortDot.tsx'

const bit = (value: boolean | undefined) => (value ? '1' : '0')

interface IoNodeProps {
  kind: 'in' | 'out'
  name: string
  position: Point
  lit: boolean
  value: boolean | undefined
  onMove: (key: string, e: ReactPointerEvent) => void
  onWire: (key: string, e: ReactPointerEvent) => void
}

export default function IoNode({
  kind,
  name,
  position,
  lit,
  value,
  onMove,
  onWire,
}: IoNodeProps) {
  const key = `${kind}:${name}`
  const type = kind === 'in' ? 'Input' : 'Output'

  return (
    <div
      data-node={key}
      onPointerDown={(e) => onMove(key, e)}
      className={`io-node absolute flex cursor-move items-center justify-center${lit ? ' is-high' : ''}`}
      style={{ left: position.x, top: position.y, width: IO_W, height: IO_H }}
      title={`${type} ${name} is ${bit(value)}. Drag to move.`}
      aria-label={`${type} ${name} is ${bit(value)}. Drag to move.`}
    >
      <span className="io-node-name">{name}</span>

      <div
        data-port={key}
        className="group absolute top-0 z-10 h-full cursor-crosshair"
        style={kind === 'in' ? { right: -PORT_HIT / 2, width: PORT_HIT } : { left: -PORT_HIT / 2, width: PORT_HIT }}
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
