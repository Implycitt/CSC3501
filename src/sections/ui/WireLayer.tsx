import { netOf, type Circuit, type Wire } from '../../game/circuit.ts'
import { CANVAS_H, CANVAS_W, anchorOf, wirePath, type Point } from './geometry.ts'

interface WireLayerProps {
  circuit: Circuit
  nets: Map<string, boolean>
  selected: Wire | null
  ghost: { a: Point; b: Point } | null
  onSelect: (wire: Wire) => void
  onEdit: (wire: Wire, end: 'from' | 'to', e: { pointerId: number; clientX: number; clientY: number }) => void
}

export default function WireLayer({ circuit, nets, selected, ghost, onSelect, onEdit }: WireLayerProps) {
  const isHigh = (net: string) => nets.get(net) === true

  const grip = (position: Point, end: 'from' | 'to', wire: Wire) => (
    <circle
      cx={position.x}
      cy={position.y}
      r={5}
      className="cursor-grab fill-void stroke-signal"
      strokeWidth={2}
      style={{ pointerEvents: 'all' }}
      onPointerDown={(e) => onEdit(wire, end, e)}
    />
  )

  return (
    <svg className="pointer-events-none absolute inset-0" width={CANVAS_W} height={CANVAS_H}>
      {circuit.wires.map((wire) => {
        const a = anchorOf(circuit, wire.from)
        const b = anchorOf(circuit, wire.to)
        if (!a || !b) return null

        const path = wirePath(a, b)
        const active = selected === wire
        return (
          <g key={`${wire.from}->${wire.to}`}>
            <path
              d={path}
              fill="none"
              strokeWidth={active ? 3 : 2}
              className={active ? 'stroke-mist-100' : isHigh(netOf(wire.from)) ? 'stroke-signal' : 'stroke-mist-600'}
            />
            <path
              d={path}
              fill="none"
              strokeWidth={14}
              stroke="transparent"
              className="cursor-pointer"
              style={{ pointerEvents: 'stroke' }}
              onPointerDown={(e) => {
                e.stopPropagation()
                onSelect(wire)
              }}
            />
            {active && (
              <>
                {grip(a, 'from', wire)}
                {grip(b, 'to', wire)}
              </>
            )}
          </g>
        )
      })}

      {ghost && (
        <path d={wirePath(ghost.a, ghost.b)} fill="none" strokeWidth={2} strokeDasharray="5 4" className="stroke-signal" />
      )}
    </svg>
  )
}
