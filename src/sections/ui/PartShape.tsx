import type { PointerEvent as ReactPointerEvent } from 'react'
import { netOf, partKey, type PlacedPart, type Wire } from '../../game/circuit.ts'
import { getComponent } from '../../game/registry.ts'
import { HEAD_H, PART_W, PORT_HIT, ROW_H, partHeight, portsOf, rowCount } from './geometry.ts'
import PortDot from './PortDot.tsx'
import PartGlyph from './skins/PartGlyph.tsx'
import { accentClass, skinFor } from './skins/index.ts'

interface PartPortProps {
  portKey: string
  label: string
  side: 'left' | 'right'
  lit: boolean
  onWire: (key: string, e: ReactPointerEvent) => void
}

function PartPort({ portKey, label, side, lit, onWire }: PartPortProps) {
  return (
    <>
      <div
        data-port={portKey}
        title={`${label} — drag to wire`}
        onPointerDown={(e) => {
          e.stopPropagation()
          onWire(portKey, e)
        }}
        className="group absolute z-10 cursor-crosshair"
        style={{
          [side]: -PORT_HIT / 2,
          top: '50%',
          height: PORT_HIT,
          width: PORT_HIT,
          transform: 'translateY(-50%)',
        }}
      >
        <PortDot lit={lit} />
      </div>
      <span className={`absolute top-1/2 -translate-y-1/2 text-[10px] ink-dim ${side === 'left' ? 'left-3' : 'right-3'}`}>
        {label}
      </span>
    </>
  )
}

interface PartShapeProps {
  part: PlacedPart
  wires: Wire[]
  nets: Map<string, boolean>
  onMove: (uid: string, e: ReactPointerEvent) => void
  onWire: (key: string, e: ReactPointerEvent) => void
  onRemove: (uid: string) => void
}

export default function PartShape({ part, wires, nets, onMove, onWire, onRemove }: PartShapeProps) {
  const ports = portsOf(part.componentId)
  const rows = rowCount(part.componentId)
  const isHigh = (net: string) => nets.get(net) === true
  const skin = skinFor(part.componentId)
  const accent = accentClass(skin.accent)

  return (
    <div
      data-part={part.uid}
      onPointerDown={(e) => onMove(part.uid, e)}
      className={`part-card absolute cursor-grab active:cursor-grabbing border surface ${accent}`}
      style={{ left: part.x, top: part.y, width: PART_W, height: partHeight(part.componentId) }}
    >
      <div className={`part-head flex items-center gap-1.5 border-b line px-1.5 ${accent}`} style={{ height: HEAD_H }}>
        <PartGlyph glyph={skin.glyph} image={skin.image} className={`accent-ink h-4 w-7 shrink-0 ${accent}`} />
        <span className="truncate text-xs" title={getComponent(part.componentId)?.name ?? part.componentId}>
          {getComponent(part.componentId)?.name ?? part.componentId}
        </span>
        <button
          className="ml-auto flex h-full w-5 shrink-0 items-center justify-center ink-faint hover-ink"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onRemove(part.uid)}
          title="Remove this part"
        >
          ×
        </button>
      </div>

      {Array.from({ length: rows }, (_, row) => {
        const input = ports?.inputs[row]
        const output = ports?.outputs[row]
        const driver = input ? wires.find((wire) => wire.to === partKey(part.uid, input)) : undefined

        return (
          <div key={row} className="relative" style={{ height: ROW_H }}>
            {input && (
              <PartPort
                portKey={partKey(part.uid, input)}
                label={input}
                side="left"
                lit={driver ? isHigh(netOf(driver.from)) : false}
                onWire={onWire}
              />
            )}
            {output && (
              <PartPort
                portKey={partKey(part.uid, output)}
                label={output}
                side="right"
                lit={isHigh(netOf(partKey(part.uid, output)))}
                onWire={onWire}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
