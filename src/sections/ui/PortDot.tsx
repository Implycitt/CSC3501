export default function PortDot({ lit }: { lit: boolean }) {
  return (
    <span
      className={`pointer-events-none absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-signal/60 ${lit ? 'bg-signal' : 'bg-void'}`}
    />
  )
}
