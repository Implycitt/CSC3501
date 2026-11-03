export default function PortDot({ lit }: { lit: boolean }) {
  return (
    <span
      className={`pointer-events-none absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-400 group-hover:ring-2 group-hover:ring-amber-300/60 ${lit ? 'bg-amber-400' : 'bg-black'}`}
    />
  )
}
