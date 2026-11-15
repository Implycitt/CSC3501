interface ShipBlueprintProps {
  objectiveIndex?: number
  hoveredIndex?: number | null
  onHoverConnection?: (index: number | null) => void
}

const CONNECTIONS = [
  {
    y: 400,
    line: 'M261 400H450',
    anchor: [450, 400] as const,
    label: 'LSS / BOW',
    labelAt: [458, 392] as const,
    align: 'start' as const,
  },
  {
    y: 1200,
    line: 'M639 1200H480',
    anchor: [480, 1200] as const,
    label: 'NAV / BRIDGE',
    labelAt: [488, 1192] as const,
    align: 'start' as const,
  },
  {
    y: 2000,
    line: 'M261 2000H330',
    anchor: [330, 2000] as const,
    label: 'COM / MAST',
    labelAt: [338, 1992] as const,
    align: 'start' as const,
  },
  {
    y: 2800,
    line: 'M639 2800H500',
    anchor: [500, 2800] as const,
    label: 'MEM / CORE',
    labelAt: [508, 2792] as const,
    align: 'start' as const,
  },
  {
    y: 3600,
    line: 'M261 3600H330',
    anchor: [330, 3600] as const,
    label: 'PWR / REACTOR',
    labelAt: [338, 3592] as const,
    align: 'start' as const,
  },
  {
    y: 4400,
    line: 'M639 4400H540',
    anchor: [540, 4400] as const,
    label: 'SNS / ARRAY',
    labelAt: [532, 4392] as const,
    align: 'end' as const,
  },
  {
    y: 5200,
    line: 'M261 5200H330',
    anchor: [330, 5200] as const,
    label: 'SHD / DRIVE',
    labelAt: [338, 5192] as const,
    align: 'start' as const,
  },
]

const HULL_PATH = [
  'M450 140',
  'C424 190 410 260 395 350',
  'C368 510 350 700 338 900',
  'C326 1080 318 1280 312 1500',
  'C304 1760 302 2000 304 2260',
  'C306 2420 310 2520 314 2640',
  'C320 2800 324 2960 326 3120',
  'C328 3260 330 3380 334 3520',
  'C338 3660 342 3800 346 3940',
  'C352 4180 360 4420 370 4640',
  'C378 4820 390 5020 400 5120',
  'L404 5240',
  'C420 5270 480 5270 496 5240',
  'L500 5120',
  'C510 5020 522 4820 530 4640',
  'C540 4420 548 4180 554 3940',
  'C558 3800 562 3660 566 3520',
  'C570 3380 572 3260 574 3120',
  'C576 2960 580 2800 586 2640',
  'C590 2520 594 2420 596 2260',
  'C598 2000 596 1760 588 1500',
  'C582 1280 574 1080 562 900',
  'C550 700 532 510 505 350',
  'C490 260 476 190 450 140',
  'Z',
].join(' ')

const WING_LEFT = 'M338 3800L120 3910L188 4070L346 4140Z'
const WING_RIGHT = 'M562 3800L780 3910L712 4070L554 4140Z'
const TAIL_LEFT = 'M390 4830L286 4930L370 5050Z'
const TAIL_RIGHT = 'M510 4830L614 4930L530 5050Z'
const CANARD_LEFT = 'M364 1610L282 1660L360 1718Z'
const CANARD_RIGHT = 'M536 1610L618 1660L540 1718Z'

const DECK_LINES = [
  560, 820, 1080, 1340, 1600, 1860, 2120, 2380, 2640, 2900, 3160, 3420,
  3680, 3940, 4200, 4460, 4720, 4980,
]
const HULL_SEAMS = Array.from({ length: 28 }, (_, index) => 320 + index * 180)
const WINDOW_ROWS = Array.from({ length: 16 }, (_, index) => 560 + index * 300)
const ENGINE_X = [380, 450, 520]

function WingPanels() {
  return (
    <g className="bp-wing-paneling">
      <g fill="var(--palette-surface)" fillOpacity="0.3" stroke="var(--palette-ink-soft)" strokeWidth="0.8">
        <path d="M330 3826L138 3912L150 3918L330 3844Z" />
        <path d="M150 3918L122 3912L132 3948L160 3960Z" />
        <path d="M330 4046L214 4050L202 4074L334 4108Z" />
      </g>
      <g fill="none" stroke="var(--palette-ink-soft)" strokeWidth="0.75" opacity="0.55">
        <path d="M330 3978L216 3998" />
        <path d="M330 4042L214 4044" />
      </g>
      <g fill="var(--palette-base)" stroke="var(--palette-ink-soft)" strokeWidth="0.75">
        <rect x="232" y="4034" width="20" height="9" />
        <rect x="286" y="3998" width="12" height="7" />
      </g>
    </g>
  )
}

function WingEngines() {
  return (
    <g className="bp-wing-engines">
      <g fill="var(--palette-surface)" stroke="var(--palette-ink-soft)" strokeWidth="0.8">
        <path d="M202 4045L206 4022H214L218 4045Z" />
        <path d="M274 4075L278 4053H286L290 4075Z" />
      </g>

      <g fill="var(--palette-base)" stroke="var(--palette-ink-strong)" strokeWidth="1.05">
        <rect x="199" y="4042" width="22" height="54" rx="9" />
        <rect x="271" y="4072" width="22" height="54" rx="9" />
      </g>

      <g fill="var(--palette-surface)" stroke="var(--palette-ink-strong)" strokeWidth="1.05">
        <path d="M201 4096H221L226 4110H196Z" />
        <path d="M273 4126H293L298 4140H268Z" />
      </g>

      <g fill="var(--palette-base)" stroke="var(--palette-phosphor)" strokeWidth="0.8" opacity="0.8">
        <ellipse cx="210" cy="4047" rx="8" ry="3.2" />
        <ellipse cx="282" cy="4077" rx="8" ry="3.2" />
      </g>

      <g fill="none" stroke="var(--palette-phosphor)" strokeWidth="0.65" opacity="0.3">
        <path d="M210 4056V4090" />
        <path d="M282 4086V4120" />
      </g>

      <g fill="var(--palette-amber)" opacity="0.82">
        <path d="M204 4100H216" stroke="var(--palette-amber)" strokeWidth="1.1" />
        <path d="M276 4130H288" stroke="var(--palette-amber)" strokeWidth="1.1" />
        <circle cx="210" cy="4054" r="1.5" />
        <circle cx="282" cy="4084" r="1.5" />
      </g>
    </g>
  )
}

function connectorColor(index: number, objectiveIndex: number, hoveredIndex: number | null): string {
  if (index !== hoveredIndex) return 'var(--palette-ink-soft)'
  return index === objectiveIndex ? 'var(--palette-amber)' : 'var(--palette-phosphor)'
}

export default function ShipBlueprint({
  objectiveIndex = -1,
  hoveredIndex = null,
  onHoverConnection,
}: ShipBlueprintProps) {
  return (
    <svg
      className="schematic-ship"
      viewBox="0 0 900 5600"
      aria-hidden="true"
      shapeRendering="geometricPrecision"
    >
      <defs>
        <clipPath id="bp-hull-clip">
          <path d={HULL_PATH} />
        </clipPath>
      </defs>

      <g className="bp-ship">
        <g className="bp-ghost" fill="none" stroke="var(--palette-cyan)" opacity="0.1" transform="translate(8 10)">
          <path d={HULL_PATH} />
          <path d={WING_LEFT} />
          <path d={WING_RIGHT} />
        </g>

        <g className="bp-wings">
          <path d={CANARD_LEFT} fill="var(--palette-surface)" fillOpacity="0.7" stroke="var(--palette-ink-strong)" strokeWidth="1.2" />
          <path d={CANARD_RIGHT} fill="var(--palette-surface)" fillOpacity="0.7" stroke="var(--palette-ink-strong)" strokeWidth="1.2" />
          <path d={WING_LEFT} fill="var(--palette-surface)" fillOpacity="0.86" stroke="var(--palette-ink-strong)" strokeWidth="1.7" />
          <path d={WING_RIGHT} fill="var(--palette-surface)" fillOpacity="0.86" stroke="var(--palette-ink-strong)" strokeWidth="1.7" />
          <path d={TAIL_LEFT} fill="var(--palette-surface)" fillOpacity="0.7" stroke="var(--palette-ink-strong)" strokeWidth="1.2" />
          <path d={TAIL_RIGHT} fill="var(--palette-surface)" fillOpacity="0.7" stroke="var(--palette-ink-strong)" strokeWidth="1.2" />

          <g fill="var(--palette-surface)" fillOpacity="0.34" stroke="var(--palette-ink)" strokeWidth="0.85">
            <path d="M330 3844L150 3918L204 3978L330 3960Z" />
            <path d="M330 3990L204 4010L188 4070L334 4120Z" />
            <path d="M570 3844L750 3918L696 3978L570 3960Z" />
            <path d="M570 3990L696 4010L712 4070L566 4120Z" />
            <path d="M332 3810L346 3824V4128L332 4138Z" />
            <path d="M568 3810L554 3824V4128L568 4138Z" />
          </g>

          <WingPanels />
          <g transform="translate(900 0) scale(-1 1)">
            <WingPanels />
          </g>
          <WingEngines />
          <g transform="translate(900 0) scale(-1 1)">
            <WingEngines />
          </g>

          <g fill="none" stroke="var(--palette-phosphor)" strokeWidth="0.75" opacity="0.45">
            <path d="M292 4860L330 5020M608 4860L570 5020" />
          </g>

          <g fill="var(--palette-base)" stroke="var(--palette-ink-strong)" strokeWidth="1.05">
            <circle cx="174" cy="3990" r="9" />
            <circle cx="726" cy="3990" r="9" />
            <path d="M165 3990H148M183 3990H192M735 3990H752M717 3990H708" />
            <rect x="250" y="3978" width="26" height="12" />
            <rect x="624" y="3978" width="26" height="12" />
          </g>

          <g fill="var(--palette-base)" stroke="var(--palette-ink-strong)" strokeWidth="1.1">
            <ellipse cx="120" cy="3910" rx="16" ry="25" />
            <ellipse cx="780" cy="3910" rx="16" ry="25" />
            <ellipse cx="286" cy="4930" rx="9" ry="18" />
            <ellipse cx="614" cy="4930" rx="9" ry="18" />
          </g>
          <g fill="none" stroke="var(--palette-cyan)" strokeWidth="0.7" opacity="0.6">
            <path d="M120 3888V3932M108 3910H132M780 3888V3932M768 3910H792" />
            <path d="M286 4914V4946M614 4914V4946" />
          </g>
          <g fill="var(--palette-amber)" opacity="0.8">
            <circle cx="120" cy="3895" r="3" />
            <circle cx="780" cy="3895" r="3" />
            <circle cx="286" cy="4916" r="2" />
            <circle cx="614" cy="4916" r="2" />
          </g>
        </g>

        <path d={HULL_PATH} fill="var(--palette-surface)" stroke="var(--palette-ink-strong)" strokeWidth="2" />
        <path d={HULL_PATH} fill="none" stroke="var(--palette-cyan)" strokeWidth="0.8" opacity="0.35" transform="translate(-4 0)" />

        <g clipPath="url(#bp-hull-clip)">
          <g fill="none" stroke="var(--palette-cyan)" strokeWidth="0.75" opacity="0.34">
            {DECK_LINES.map((y) => (
              <path key={`deck-${y}`} d={`M250 ${y}H650`} strokeDasharray="5 7" />
            ))}
            {HULL_SEAMS.map((y, index) => (
              <path
                key={`seam-${y}`}
                d={`M300 ${y}H${388 + (index % 3) * 18}M${512 - (index % 2) * 16} ${y}H600`}
              />
            ))}
            <path d="M450 170V5230" strokeDasharray="3 10" opacity="0.7" />
          </g>

          <g fill="var(--palette-surface)" fillOpacity="0.34" stroke="var(--palette-ink)" strokeWidth="1.05">
            <rect x="326" y="520" width="58" height="104" />
            <rect x="516" y="520" width="58" height="104" />
            <rect x="330" y="700" width="50" height="112" />
            <rect x="520" y="700" width="50" height="112" />
            <rect x="320" y="1430" width="54" height="126" />
            <rect x="526" y="1430" width="54" height="126" />
            <rect x="320" y="1620" width="50" height="126" />
            <rect x="530" y="1620" width="50" height="126" />
            <rect x="320" y="2200" width="46" height="130" />
            <rect x="534" y="2200" width="46" height="130" />
            <rect x="316" y="2380" width="44" height="130" />
            <rect x="540" y="2380" width="44" height="130" />
            <rect x="326" y="3180" width="44" height="108" />
            <rect x="530" y="3180" width="44" height="108" />
            <rect x="328" y="4760" width="52" height="122" />
            <rect x="520" y="4760" width="52" height="122" />
          </g>

          <g fill="none" stroke="var(--palette-cyan)" strokeWidth="0.9" opacity="0.56">
            <path d="M388 250H512M398 262H502M410 274H490" />
            <path d="M400 474H500M406 486H494M412 498H488M418 510H482" />
            <path d="M330 580H596M342 604H584M334 650H592" />
            <path d="M326 920H574M336 944H564" />
            <path d="M320 1540H580M328 1560H572" />
            <path d="M316 2300H584M324 2322H576" />
            <path d="M320 3300H580M330 3324H570" />
            <path d="M360 4880H540M370 4900H530" />
          </g>

          <g fill="none" stroke="var(--palette-ink)" strokeWidth="0.9" opacity="0.58">
            {WINDOW_ROWS.map((y) => (
              <g key={`windows-${y}`}>
                <path d={`M334 ${y}H370M530 ${y}H566`} stroke="var(--palette-cyan)" opacity="0.65" />
                <path d={`M320 ${y + 28}H352M548 ${y + 28}H580`} />
              </g>
            ))}
            <path d="M306 760L286 746M594 760L614 746M302 2000L278 1988M598 2000L622 1988" />
          </g>

          <g className="bp-forward-detail">
            <g fill="var(--palette-surface)" fillOpacity="0.5" stroke="var(--palette-ink)" strokeWidth="1.05">
              <path d="M352 560L386 550L390 610L356 622Z" />
              <path d="M548 560L514 550L510 610L544 622Z" />
              <path d="M344 660L382 646L386 744L348 758Z" />
              <path d="M556 660L518 646L514 744L552 758Z" />
              <path d="M338 808L376 794L380 908L342 920Z" />
              <path d="M562 808L524 794L520 908L558 920Z" />
            </g>
            <g fill="none" stroke="var(--palette-cyan)" strokeWidth="0.8" opacity="0.6">
              <path d="M360 580H378M360 592H378M360 604H378M540 580H522M540 592H522M540 604H522" />
              <path d="M354 680H376M354 700H376M354 720H376M546 680H524M546 700H524M546 720H524" />
              <path d="M348 830H372M348 850H372M348 870H372M348 890H372M552 830H528M552 850H528M552 870H528M552 890H528" />
              <path d="M330 560L312 548M570 560L588 548M326 760L308 748M574 760L592 748M326 930L312 946M574 930L588 946" />
            </g>
            <g fill="var(--palette-base)" stroke="var(--palette-ink-strong)" strokeWidth="1.05">
              <circle cx="356" cy="760" r="13" />
              <circle cx="544" cy="760" r="13" />
              <path d="M344 760H322M368 760H378M556 760H578M532 760H522" />
              <rect x="414" y="540" width="72" height="34" />
              <path d="M424 550H476M424 560H476" fill="none" stroke="var(--palette-cyan)" strokeWidth="0.7" opacity="0.6" />
            </g>
            <g fill="none" stroke="var(--palette-ink)" strokeWidth="0.8" opacity="0.55">
              <path d="M330 1000H570M340 1020H560M350 1040H550" />
              <path d="M334 720H350M566 720H582" />
            </g>
          </g>

          <g className="bp-forward-ports" fill="none" stroke="var(--palette-cyan)" strokeWidth="0.8" opacity="0.55">
            {[600, 630, 660, 690, 720, 750, 780, 810, 840, 870, 900, 930, 960].map((y) => (
              <g key={`port-${y}`}>
                <circle cx="394" cy={y} r="2.2" />
                <circle cx="506" cy={y} r="2.2" />
              </g>
            ))}
          </g>

          <g className="bp-turrets" fill="var(--palette-base)" stroke="var(--palette-ink-strong)" strokeWidth="1">
            {[
              [356, 1000], [544, 1000], [348, 1800], [552, 1800],
              [344, 2560], [556, 2560], [352, 3200], [548, 3200],
              [382, 4600], [518, 4600],
            ].map(([x, y], index) => (
              <g key={`turret-${x}-${y}`}>
                <circle cx={x} cy={y} r={index % 2 === 0 ? 11 : 9} />
                <circle cx={x} cy={y} r={index % 2 === 0 ? 4 : 3} fill="var(--palette-cyan)" stroke="none" />
                <path d={index % 2 === 0 ? `M${x - 18} ${y}H${x - 11}M${x + 11} ${y}H${x + 18}` : `M${x} ${y - 16}V${y - 9}M${x} ${y + 9}V${y + 16}`} />
              </g>
            ))}
          </g>

          <g className="bp-conduits" fill="none" stroke="var(--palette-cyan)" strokeWidth="0.85" opacity="0.48">
            <path d="M328 1080V1960M572 1080V1960" strokeDasharray="5 8" />
            <path d="M328 2080V2560M572 2080V2560" />
            <path d="M334 3000V3420M566 3000V3420" />
            <path d="M352 3800V4360M548 3800V4360" />
            <path d="M362 4560V5060M538 4560V5060" strokeDasharray="4 9" />
            <path d="M328 1200H304V1340M572 1200H596V1340" />
            <path d="M334 2460H308V2540M566 2460H592V2540" />
            <path d="M352 4180H326V4260M548 4180H574V4260" />
          </g>

          <g className="bp-hull-blisters" fill="none" stroke="var(--palette-ink)" strokeWidth="0.9" opacity="0.55">
            {[1360, 1860, 2460, 3060, 3260, 4120, 4260, 4680].map((y) => (
              <g key={`blister-${y}`}>
                <ellipse cx="320" cy={y} rx="9" ry="17" />
                <ellipse cx="580" cy={y} rx="9" ry="17" />
              </g>
            ))}
          </g>

          <g className="bp-habitat-detail" fill="none" stroke="var(--palette-ink)" strokeWidth="0.8" opacity="0.62">
            <path d="M330 1460V1780M570 1460V1780" />
            <path d="M342 1516H558M342 1698H558" stroke="var(--palette-cyan)" opacity="0.45" />
            {[1490, 1540, 1590, 1670, 1720, 1770].map((y) => (
              <g key={`hab-${y}`}>
                <path d={`M330 ${y}H346M554 ${y}H570`} />
                <circle cx="340" cy={y} r="2" stroke="var(--palette-cyan)" />
              </g>
            ))}
            <path d="M390 1490V1780M510 1490V1780" strokeDasharray="4 7" opacity="0.38" />
          </g>

          <g className="bp-cargo-detail">
            <g fill="var(--palette-surface)" fillOpacity="0.55" stroke="var(--palette-ink)" strokeWidth="1">
              <rect x="318" y="2180" width="54" height="94" />
              <rect x="318" y="2290" width="54" height="94" />
              <rect x="528" y="2180" width="54" height="94" />
              <rect x="528" y="2290" width="54" height="94" />
            </g>
            <path d="M328 2200H362M328 2216H362M328 2232H362M328 2310H362M328 2326H362M328 2342H362M538 2200H572M538 2216H572M538 2232H572M538 2310H572M538 2326H572M538 2342H572" fill="none" stroke="var(--palette-cyan)" strokeWidth="0.7" opacity="0.52" />
            <path d="M318 2420H582M330 2442H570M344 2464H556" fill="none" stroke="var(--palette-ink)" strokeWidth="0.9" opacity="0.55" />
            <path d="M380 2400V2480M450 2400V2480M520 2400V2480" stroke="var(--palette-ink)" strokeWidth="0.7" opacity="0.45" strokeDasharray="4 7" />
          </g>

          <g className="bp-docking-collar">
            <ellipse cx="450" cy="330" rx="42" ry="10" fill="var(--palette-base)" stroke="var(--palette-ink-strong)" strokeWidth="1.1" />
            <ellipse cx="450" cy="330" rx="25" ry="5" fill="none" stroke="var(--palette-cyan)" strokeWidth="0.8" opacity="0.65" />
            <path d="M408 330L396 318M492 330L504 318M420 338H480" fill="none" stroke="var(--palette-ink)" strokeWidth="1" />
          </g>

          <g className="bp-command">
            <rect x="376" y="1040" width="124" height="230" fill="var(--palette-surface)" fillOpacity="0.72" stroke="var(--palette-ink-strong)" strokeWidth="1.35" />
            <rect x="394" y="1064" width="88" height="46" fill="var(--palette-base)" stroke="var(--palette-ink)" strokeWidth="1" />
            <path d="M402 1076H474M402 1088H474" stroke="var(--palette-cyan)" strokeWidth="0.9" opacity="0.7" />
            <path d="M390 1134H486M390 1152H486M390 1170H486M390 1188H486M390 1206H486M390 1224H486" stroke="var(--palette-ink)" strokeWidth="0.8" opacity="0.6" />
            <path d="M410 1250H490M420 1266H480" stroke="var(--palette-cyan)" strokeWidth="0.7" opacity="0.44" />
            <path d="M410 1040V1010H490V1040" fill="var(--palette-surface)" fillOpacity="0.55" stroke="var(--palette-ink)" strokeWidth="1" />
            <path d="M422 1020H478M430 1030H470" fill="none" stroke="var(--palette-cyan)" strokeWidth="0.7" opacity="0.55" />
            <path d="M376 1110H344V1166H376M524 1110H556V1166H524" fill="var(--palette-surface)" fillOpacity="0.48" stroke="var(--palette-ink)" strokeWidth="1" />
            <path d="M352 1124H368M352 1138H368M532 1124H548M532 1138H548" fill="none" stroke="var(--palette-cyan)" strokeWidth="0.7" opacity="0.6" />
          </g>

          <g className="bp-habitat">
            <path d="M318 1460L582 1440L584 1584L316 1600Z" fill="var(--palette-surface)" fillOpacity="0.28" stroke="var(--palette-ink)" strokeWidth="1.1" />
            <path d="M320 1640L580 1624L582 1770L318 1786Z" fill="var(--palette-surface)" fillOpacity="0.28" stroke="var(--palette-ink)" strokeWidth="1.1" />
            <path d="M336 1490H564M336 1516H564M336 1542H564M336 1670H564M336 1696H564M336 1722H564" stroke="var(--palette-cyan)" strokeWidth="0.7" opacity="0.45" />
            <path d="M356 1500V1580M394 1496V1578M434 1494V1576M474 1492V1574M514 1490V1572" stroke="var(--palette-ink)" strokeWidth="0.8" opacity="0.5" />
          </g>

          <g className="bp-core-deck">
            <rect x="342" y="2640" width="216" height="338" fill="var(--palette-base)" stroke="var(--palette-ink-strong)" strokeWidth="1.4" />
            <rect x="360" y="2660" width="180" height="298" fill="none" stroke="var(--palette-cyan)" strokeWidth="0.8" opacity="0.45" />
            <path d="M360 2718H540M360 2820H540M360 2922H540" stroke="var(--palette-ink)" strokeWidth="1" opacity="0.72" />
            <path d="M410 2668V2950M472 2668V2950" stroke="var(--palette-cyan)" strokeWidth="0.7" opacity="0.3" strokeDasharray="3 7" />
            <circle cx="450" cy="2818" r="25" fill="var(--palette-base)" stroke="var(--palette-cyan)" strokeWidth="1.1" />
            <circle cx="450" cy="2818" r="11" fill="var(--palette-cyan)" opacity="0.48" />
            <path d="M450 2778V2792M450 2844V2858M410 2818H424M476 2818H490" stroke="var(--palette-cyan)" strokeWidth="1.1" />
            <path d="M378 2780H400M500 2780H522M378 2860H400M500 2860H522" stroke="var(--palette-ink)" strokeWidth="0.8" opacity="0.6" />
            <g fill="var(--palette-surface)" fillOpacity="0.55" stroke="var(--palette-ink)" strokeWidth="0.85">
              <rect x="366" y="2680" width="26" height="28" />
              <rect x="366" y="2730" width="26" height="28" />
              <rect x="366" y="2832" width="26" height="28" />
              <rect x="508" y="2680" width="26" height="28" />
              <rect x="508" y="2730" width="26" height="28" />
              <rect x="508" y="2832" width="26" height="28" />
              <rect x="414" y="2892" width="72" height="36" />
            </g>
            <g fill="none" stroke="var(--palette-cyan)" strokeWidth="0.75" opacity="0.55">
              <path d="M370 2688H388M370 2696H388M370 2738H388M370 2746H388M512 2688H530M512 2696H530M512 2738H530M512 2746H530" />
              <path d="M360 2758H400M500 2758H540M360 2800H400M500 2800H540M360 2846H400M500 2846H540M360 2880H400M500 2880H540" />
              <path d="M410 2904H490M410 2916H490M426 2892V2928M474 2892V2928" />
              <path d="M414 2768H436V2796H414M486 2768H464V2796H486" />
              <path d="M450 2748V2778M450 2858V2884" strokeDasharray="3 5" />
            </g>
            <text x="450" y="2970" fill="var(--palette-ink-faint)" fontFamily="var(--font-mono)" fontSize="7" letterSpacing="1.4" textAnchor="middle">
              CORE DECK / OPEN SECTION
            </text>
          </g>

          <g className="bp-reactor">
            <rect x="326" y="3420" width="248" height="292" rx="18" fill="var(--palette-surface)" fillOpacity="0.52" stroke="var(--palette-ink-strong)" strokeWidth="1.35" />
            <ellipse cx="450" cy="3440" rx="100" ry="18" fill="none" stroke="var(--palette-ink)" strokeWidth="1" />
            <ellipse cx="450" cy="3694" rx="100" ry="18" fill="none" stroke="var(--palette-ink)" strokeWidth="1" />
            <path d="M350 3490H550M350 3544H550M350 3598H550M350 3652H550" stroke="var(--palette-amber)" strokeWidth="0.9" opacity="0.52" />
            <path d="M396 3470V3670M450 3460V3680M504 3470V3670" stroke="var(--palette-ink)" strokeWidth="0.8" opacity="0.62" />
            <rect x="302" y="3490" width="26" height="82" fill="var(--palette-base)" stroke="var(--palette-ink)" strokeWidth="0.9" />
            <rect x="572" y="3490" width="26" height="82" fill="var(--palette-base)" stroke="var(--palette-ink)" strokeWidth="0.9" />
            <path d="M328 3510H342M328 3544H342M558 3510H572M558 3544H572" stroke="var(--palette-amber)" strokeWidth="0.7" opacity="0.7" />
            <g fill="var(--palette-surface)" fillOpacity="0.6" stroke="var(--palette-ink)" strokeWidth="0.85">
              <rect x="356" y="3476" width="34" height="38" />
              <rect x="510" y="3476" width="34" height="38" />
              <rect x="386" y="3618" width="128" height="38" />
            </g>
            <g fill="none" stroke="var(--palette-cyan)" strokeWidth="0.75" opacity="0.6">
              <path d="M362 3486H384M362 3496H384M516 3486H538M516 3496H538" />
              <path d="M396 3630H504M396 3642H504M412 3618V3656M450 3618V3656M488 3618V3656" />
              <path d="M356 3514H314M544 3514H586M356 3556H320M544 3556H580" />
              <path d="M342 3514V3556M558 3514V3556" stroke="var(--palette-amber)" />
              <path d="M336 3468V3690M564 3468V3690" strokeDasharray="4 8" opacity="0.45" />
            </g>
            <text x="450" y="3760" fill="var(--palette-ink-faint)" fontFamily="var(--font-mono)" fontSize="7" letterSpacing="1.4" textAnchor="middle">
              REACTOR / RADIATOR PLANT
            </text>
          </g>

          <g className="bp-hangar">
            <rect x="354" y="4380" width="192" height="290" fill="var(--palette-surface)" fillOpacity="0.38" stroke="var(--palette-ink)" strokeWidth="1.1" />
            <path d="M354 4410H546M354 4640H546" stroke="var(--palette-cyan)" strokeWidth="0.8" opacity="0.45" />
            <path d="M382 4520L404 4508L424 4520L420 4550L394 4556L380 4540Z" fill="var(--palette-base)" stroke="var(--palette-ink)" strokeWidth="0.9" />
            <path d="M390 4532L410 4538M386 4546L404 4548M424 4522L438 4514" stroke="var(--palette-cyan)" strokeWidth="0.7" opacity="0.55" />
            <path d="M474 4470L498 4460L512 4486L504 4512L480 4508Z" fill="none" stroke="var(--palette-ink)" strokeWidth="0.9" />
            <path d="M486 4474V4504M494 4472V4502" stroke="var(--palette-amber)" strokeWidth="0.7" opacity="0.6" />
            <path d="M360 4440H540M360 4460H540" fill="none" stroke="var(--palette-ink)" strokeWidth="0.9" opacity="0.6" />
            <path d="M366 4440V4668M534 4440V4668" fill="none" stroke="var(--palette-ink)" strokeWidth="0.9" opacity="0.5" strokeDasharray="4 7" />
            <g fill="var(--palette-surface)" fillOpacity="0.55" stroke="var(--palette-ink)" strokeWidth="0.9">
              <rect x="366" y="4590" width="36" height="54" />
              <rect x="510" y="4590" width="24" height="54" />
              <rect x="462" y="4436" width="58" height="24" />
            </g>
            <path d="M374 4602H392M374 4614H392M516 4602H528M516 4614H528M472 4444H510M472 4452H510" fill="none" stroke="var(--palette-cyan)" strokeWidth="0.7" opacity="0.55" />
            <text x="450" y="4604" fill="var(--palette-ink-faint)" fontFamily="var(--font-mono)" fontSize="6.5" letterSpacing="1.2" textAnchor="middle">
              HANGAR / DOCK CRADLE
            </text>
          </g>

          <g fill="none" stroke="var(--palette-ink)" strokeWidth="0.9" opacity="0.64">
            <path d="M330 3080H570M338 3110H562M344 3240H556" />
            <path d="M330 4100H570M340 4130H560M352 4260H548" />
            <path d="M332 4860H568M342 4890H558M358 4980H542" />
          </g>

          <g className="bp-aft-detail" fill="none">
            <g fill="var(--palette-surface)" fillOpacity="0.5" stroke="var(--palette-ink)" strokeWidth="0.95">
              <rect x="392" y="4840" width="34" height="188" rx="14" />
              <rect x="474" y="4840" width="34" height="188" rx="14" />
              <rect x="440" y="4920" width="20" height="108" rx="9" />
            </g>
            <path d="M400 4872H418M400 4900H418M400 4928H418M482 4872H500M482 4900H500M482 4928H500M400 4960H418M482 4960H500" stroke="var(--palette-cyan)" strokeWidth="0.7" opacity="0.55" />
            <path d="M426 4840V4886M474 4840V4886M426 4940V5028M474 4940V5028M426 4886H474" stroke="var(--palette-ink)" strokeWidth="0.8" opacity="0.55" />
            <path d="M390 4990L370 5006M510 4990L530 5006" stroke="var(--palette-ink-strong)" strokeWidth="0.9" opacity="0.7" />
          </g>

          <g fill="none" stroke="var(--palette-ink-faint)" fontFamily="var(--font-mono)" fontSize="5.5" letterSpacing="1.1" opacity="0.7">
            <text x="372" y="1016">COMMAND DECK</text>
            <text x="528" y="1016" textAnchor="end">NAV / 02</text>
            <text x="330" y="2080">COMMS SPINE</text>
            <text x="570" y="2080" textAnchor="end">ARRAY / 03</text>
            <text x="450" y="3060" textAnchor="middle">CORE LIFT / 04</text>
            <text x="450" y="3820" textAnchor="middle">REACTOR FEED / 05</text>
            <text x="450" y="4360" textAnchor="middle">SENSOR MAST / 06</text>
            <text x="450" y="5088" textAnchor="middle">DRIVE / 07</text>
          </g>
        </g>

        <g className="bp-masts">
          <path d="M480 1040V950M480 978L452 950M480 990L510 962" fill="none" stroke="var(--palette-ink-strong)" strokeWidth="1.1" />
          <circle cx="480" cy="944" r="6" fill="var(--palette-base)" stroke="var(--palette-cyan)" strokeWidth="0.9" />
          <path d="M330 2000V1810M330 1850L300 1818M330 1874L360 1840" fill="none" stroke="var(--palette-ink-strong)" strokeWidth="1.2" />
          <ellipse cx="330" cy="2000" rx="38" ry="12" fill="var(--palette-base)" stroke="var(--palette-ink-strong)" strokeWidth="1.1" />
          <ellipse cx="330" cy="2000" rx="22" ry="6" fill="none" stroke="var(--palette-cyan)" strokeWidth="0.8" opacity="0.7" />
          <path d="M300 1960L270 1948M300 1968L278 1956" fill="none" stroke="var(--palette-cyan)" strokeWidth="0.7" opacity="0.55" />
          <path d="M540 4400L500 4434M540 4400L500 4370" fill="none" stroke="var(--palette-ink-strong)" strokeWidth="1.1" />
          <ellipse cx="540" cy="4400" rx="28" ry="12" fill="var(--palette-base)" stroke="var(--palette-ink-strong)" strokeWidth="1.1" />
          <ellipse cx="540" cy="4400" rx="15" ry="5" fill="none" stroke="var(--palette-cyan)" strokeWidth="0.8" />
          <path d="M328 5120L300 5090M328 5140L292 5124" fill="none" stroke="var(--palette-ink-strong)" strokeWidth="0.9" />
        </g>

        <g className="bp-outriggers" fill="none">
          <g fill="var(--palette-surface)" stroke="var(--palette-ink-strong)" strokeWidth="1.1">
            <path d="M334 748L300 734L290 810L320 824Z" />
            <path d="M566 748L600 734L610 810L580 824Z" />
            <path d="M324 2180L288 2164L276 2246L310 2262Z" />
            <path d="M576 2180L612 2164L624 2246L590 2262Z" />
            <path d="M334 4800L300 4786L290 4860L320 4874Z" />
            <path d="M566 4800L600 4786L610 4860L580 4874Z" />
          </g>
          <g stroke="var(--palette-cyan)" strokeWidth="0.8" opacity="0.58">
            <path d="M306 750V808M306 760H322M306 780H322M306 798H322" />
            <path d="M594 750V808M594 760H578M594 780H578M594 798H578" />
            <path d="M294 2184V2254M294 2200H314M294 2220H314M294 2240H314" />
            <path d="M606 2184V2254M606 2200H586M606 2220H586M606 2240H586" />
            <path d="M306 4816V4866M306 4826H322M306 4844H322" />
            <path d="M594 4816V4866M594 4826H578M594 4844H578" />
          </g>
          <g fill="var(--palette-amber)" opacity="0.7">
            <circle cx="302" cy="738" r="2.5" />
            <circle cx="598" cy="738" r="2.5" />
            <circle cx="286" cy="2168" r="2" />
            <circle cx="614" cy="2168" r="2" />
          </g>
        </g>

        <g className="bp-radiators">
          <path d="M326 3320L284 3348V3692L326 3720Z" fill="var(--palette-surface)" fillOpacity="0.4" stroke="var(--palette-ink-strong)" strokeWidth="1.1" />
          <path d="M574 3320L616 3348V3692L574 3720Z" fill="var(--palette-surface)" fillOpacity="0.4" stroke="var(--palette-ink-strong)" strokeWidth="1.1" />
          <g fill="none" stroke="var(--palette-cyan)" strokeWidth="0.85" opacity="0.55">
            <path d="M294 3360H322M288 3400H322M292 3440H326M288 3480H326M292 3520H326M288 3560H326M292 3600H326M288 3640H326M294 3680H322" />
            <path d="M606 3360H578M612 3400H578M608 3440H574M612 3480H574M608 3520H574M612 3560H574M608 3600H574M612 3640H574M606 3680H578" />
            <path d="M284 3348L268 3336M616 3348L632 3336M284 3692L268 3704M616 3692L632 3704" />
          </g>
        </g>

        <g className="bp-engine-block">
          <path
            d="M330 5100L570 5100L596 5160L586 5260L530 5340H370L314 5260L304 5160Z"
            fill="var(--palette-surface)"
            stroke="var(--palette-ink-strong)"
            strokeWidth="1.6"
          />
          <path d="M320 5130H580M314 5160H586M310 5200H590M316 5240H584M330 5280H570M350 5310H550" fill="none" stroke="var(--palette-cyan)" strokeWidth="0.7" opacity="0.5" />
          <g fill="none" stroke="var(--palette-ink)" strokeWidth="0.8" opacity="0.6">
            <rect x="348" y="5140" width="44" height="48" />
            <rect x="508" y="5140" width="44" height="48" />
            <path d="M356 5152H384M356 5164H384M516 5152H544M516 5164H544" />
            <path d="M404 5180H496M410 5200H490" />
          </g>
          <g fill="none" stroke="var(--palette-ink)" strokeWidth="1" opacity="0.72">
            <path d="M340 5120V5068H388M560 5120V5068H512M356 5108H544" />
            <path d="M346 5090L360 5082M554 5090L540 5082M346 5078L360 5070M554 5078L540 5070" />
            <path d="M324 5190L292 5178M576 5190L608 5178M324 5220L292 5208M576 5220L608 5208" />
          </g>
          <g fill="var(--palette-surface)" stroke="var(--palette-ink)" strokeWidth="0.9">
            <rect x="326" y="5170" width="16" height="24" />
            <rect x="558" y="5170" width="16" height="24" />
            <rect x="408" y="5152" width="10" height="22" />
            <rect x="482" y="5152" width="10" height="22" />
          </g>
          <g className="bp-engines">
            {ENGINE_X.map((x) => (
              <g key={x}>
                <path
                  d={`M${x - 36} 5290L${x - 46} 5330L${x - 30} 5370L${x} 5380L${x + 30} 5370L${x + 46} 5330L${x + 36} 5290Z`}
                  fill="var(--palette-base)"
                  stroke="var(--palette-ink-strong)"
                  strokeWidth="1.25"
                />
                <path d={`M${x - 28} 5304H${x + 28}M${x - 34} 5320H${x + 34}M${x - 24} 5352L${x - 16} 5378H${x + 16}L${x + 24} 5352`} fill="none" stroke="var(--palette-ink)" strokeWidth="0.75" opacity="0.62" />
                <ellipse cx={x} cy="5350" rx="19" ry="8" fill="none" stroke="var(--palette-amber)" strokeWidth="0.9" opacity="0.8" />
                <path d={`M${x - 16} 5362L${x - 9} 5392H${x + 9}L${x + 16} 5362`} fill="none" stroke="var(--palette-amber)" strokeWidth="0.6" opacity="0.42" />
                <path
                  d={`M${x - 34} 5298L${x - 14} 5320M${x - 40} 5324L${x - 14} 5332M${x - 28} 5360L${x - 12} 5346M${x + 34} 5298L${x + 14} 5320M${x + 40} 5324L${x + 14} 5332M${x + 28} 5360L${x + 12} 5346`}
                  fill="none"
                  stroke="var(--palette-cyan)"
                  strokeWidth="0.7"
                  opacity="0.45"
                />
              </g>
            ))}
          </g>
        </g>

        <g fill="none" stroke="var(--palette-ink-faint)" fontFamily="var(--font-mono)" fontSize="5" letterSpacing="1.1" opacity="0.68">
          <text x="368" y="438" fill="var(--palette-ink-soft)">LIFE SUPPORT / INTAKE</text>
          <text x="452" y="330" textAnchor="middle" fontSize="4.5">DOCKING COLLAR</text>
          <text x="450" y="5320" textAnchor="middle">ENGINE CLUSTER</text>
        </g>
      </g>

      <g className="bp-connectors" fill="none">
        {CONNECTIONS.map((connection, index) => {
          const color = connectorColor(index, objectiveIndex, hoveredIndex)
          const lit = index === hoveredIndex
          return (
            <g key={connection.y}>
              <path d={connection.line} stroke="var(--palette-base)" strokeWidth="5" opacity={lit ? 0.82 : 0.52} />
              <path
                d={connection.line}
                stroke={color}
                strokeWidth={lit ? 1.7 : 1.2}
                opacity={lit ? 0.96 : 0.74}
              />
              <path
                d={connection.line}
                stroke="transparent"
                strokeWidth="20"
                pointerEvents="stroke"
                onPointerEnter={() => onHoverConnection?.(index)}
                onPointerLeave={() => onHoverConnection?.(null)}
              />
            </g>
          )
        })}
      </g>

      <g className="bp-anchors" fill="none">
        {CONNECTIONS.map((connection, index) => {
          const [cx, cy] = connection.anchor
          const color = connectorColor(index, objectiveIndex, hoveredIndex)
          const lit = index === hoveredIndex
          return (
            <g key={connection.y} opacity={lit ? 1 : 0.64}>
              <circle cx={cx} cy={cy} r="11" stroke={color} strokeWidth="1.2" fill="var(--palette-base)" />
              <circle cx={cx} cy={cy} r="3" fill={color} stroke="none" />
              <path d={`M${cx - 17} ${cy}H${cx - 11}M${cx + 11} ${cy}H${cx + 17}M${cx} ${cy - 17}V${cy - 11}M${cx} ${cy + 11}V${cy + 17}`} stroke={color} strokeWidth="1.2" />
              <text
                x={connection.labelAt[0]}
                y={connection.labelAt[1]}
                fill={color}
                stroke="var(--palette-base)"
                strokeWidth="2.5"
                paintOrder="stroke"
                fontFamily="var(--font-mono)"
                fontSize="6.5"
                letterSpacing="1"
                textAnchor={connection.align}
              >
                {connection.label}
              </text>
            </g>
          )
        })}
      </g>

    </svg>
  )
}
