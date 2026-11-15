import { useEffect, useRef, useState } from 'react'

const WARP_MAP_SIZE = 256
const WARP_FILTER_ID = 'crt-screen-warp'
const LENS_MAP_SIZE = 192
const LENS_FILTER_ID = 'crt-pointer-lens'
const LENS_SIZE = 240

const CRT_SHADER = `
struct Uniforms {
  resolution: vec2f,
  time: f32,
  dpr: f32,
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

@vertex
fn vs(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
  var positions = array<vec2f, 3>(
    vec2f(-1.0, -1.0),
    vec2f(3.0, -1.0),
    vec2f(-1.0, 3.0),
  );
  return vec4f(positions[index], 0.0, 1.0);
}

fn hash21(value: vec2f) -> f32 {
  var point = fract(value * vec2f(123.34, 456.21));
  point += dot(point, point + 45.32);
  return fract(point.x * point.y);
}

@fragment
fn fs(@builtin(position) fragment: vec4f) -> @location(0) vec4f {
  let cssResolution = uniforms.resolution / uniforms.dpr;
  let uv = fragment.xy / uniforms.resolution;
  let css = uv * cssResolution;
  let point = uv * 2.0 - 1.0;

  let glitchClock = uniforms.time * 1.7;
  let glitchSlot = floor(glitchClock);
  let glitchPhase = fract(glitchClock);
  let glitchActive =
    step(0.58, hash21(vec2f(glitchSlot, 17.1))) *
    (1.0 - step(0.2, glitchPhase));
  let glitchLine = floor(uv.y * 110.0);
  let lineJitter = (hash21(vec2f(glitchLine, glitchSlot)) - 0.5) *
    glitchActive * 0.022;
  let glitchPoint = vec2f(point.x + lineJitter, point.y);

  let cellSize = 4.0;
  let radiusSquared = dot(glitchPoint, glitchPoint);
  let warpedPoint = glitchPoint *
    (1.0 + 0.8 * radiusSquared + 0.3 * radiusSquared * radiusSquared);
  let warpedCss = (warpedPoint * 0.5 + 0.5) * cssResolution;
  let grid = warpedCss / cellSize;
  let gridCell = fract(grid);
  let gridLine = smoothstep(
    0.42,
    0.5,
    max(abs(gridCell.x - 0.5), abs(gridCell.y - 0.5)),
  );
  let cellCenter = 1.0 - smoothstep(
    0.0,
    0.36,
    length(gridCell - vec2f(0.5)),
  );

  let scanPhase = abs(
    fract((warpedCss.y + glitchActive * lineJitter * 30.0) / 2.0) - 0.5,
  );
  let scanLine = smoothstep(0.38, 0.5, scanPhase);
  let scanMotion = 0.5 + 0.5 * sin(css.y * 0.08 - uniforms.time * 5.0);
  let scan = scanLine * (0.68 + scanMotion * 0.32);

  let cellHash = hash21(floor(grid) + 4.7);
  let grain = hash21(floor(grid) + floor(uniforms.time * 18.0)) * 0.02;
  let radius = length(glitchPoint);
  let vignette = smoothstep(0.52, 1.18, radius) * 0.28;
  let edgeGlow = smoothstep(0.8, 1.12, radius) * 0.04;

  let bandPhase = fract(uv.y - uniforms.time * 0.12);
  let band = (1.0 - smoothstep(0.0, 0.055, abs(bandPhase - 0.5))) * 0.055;
  let tearSeed = hash21(vec2f(glitchSlot, 31.7));
  let tearWidth = 0.01 + hash21(vec2f(glitchSlot, 47.3)) * 0.05;
  let tear = glitchActive *
    (1.0 - smoothstep(0.0, tearWidth, abs(uv.y - tearSeed)));
  let blockSeed = hash21(vec2f(glitchSlot, 59.9));
  let block = glitchActive *
    (1.0 - step(0.16, abs(uv.x - blockSeed))) *
    (1.0 - smoothstep(0.0, tearWidth * 1.8, abs(uv.y - tearSeed)));
  let sliceHash = hash21(vec2f(floor(uv.y * 100.0), glitchSlot));
  let slices = glitchActive *
    step(0.78, sliceHash) *
    (1.0 - smoothstep(0.0, 0.12, abs(uv.y - tearSeed)));
  let glitchTint =
    vec3f(1.0, 0.08, 0.44) * (tear * 0.05 + block * 0.07) +
    vec3f(0.02, 0.7, 0.7) * slices * 0.035;
  let flicker = 0.92 + 0.08 * sin(uniforms.time * 37.0);
  let subpixel = fract((warpedCss.x + glitchActive * lineJitter * 30.0) / cellSize);
  let rgbMask = vec3f(
    1.0 - smoothstep(0.0, 0.1, abs(subpixel - 0.17)),
    1.0 - smoothstep(0.0, 0.1, abs(subpixel - 0.5)),
    1.0 - smoothstep(0.0, 0.1, abs(subpixel - 0.83)),
  );

  let alpha = clamp(
    (gridLine * 0.16 +
      scan * 0.045 +
      vignette +
      grain +
      band +
      tear * 0.3 +
      block * 0.2 +
      slices * 0.08) * flicker,
    0.0,
    0.78,
  );
  let phosphor = vec3f(0.1, 0.4, 0.38) *
    (edgeGlow + (1.0 - gridLine) * 0.035 + cellHash * 0.012 + cellCenter * 0.018) +
    rgbMask * vec3f(0.004, 0.008, 0.007) +
    glitchTint +
    vec3f(0.06, 0.2, 0.19) * band;

  return vec4f(phosphor, alpha);
}
`

function createWarpMap(): string {
  const canvas = document.createElement('canvas')
  canvas.width = WARP_MAP_SIZE
  canvas.height = WARP_MAP_SIZE

  const context = canvas.getContext('2d')
  if (!context) return ''

  const image = context.createImageData(WARP_MAP_SIZE, WARP_MAP_SIZE)
  const half = (WARP_MAP_SIZE - 1) / 2
  const maxRadius = Math.SQRT2
  const bow = 0.8

  for (let y = 0; y < WARP_MAP_SIZE; y += 1) {
    for (let x = 0; x < WARP_MAP_SIZE; x += 1) {
      const nx = (x - half) / half
      const ny = (y - half) / half
      const radius = Math.hypot(nx, ny)
      const falloff = Math.pow(Math.min(radius, maxRadius) / maxRadius, 3.2)
      const direction = radius > 0.0001 ? falloff / radius : 0
      const index = (y * WARP_MAP_SIZE + x) * 4

      image.data[index] = Math.round(
        128 - nx * direction * 127 + bow * nx * ny * ny * 127,
      )
      image.data[index + 1] = Math.round(
        128 - ny * direction * 127 + bow * ny * nx * nx * 127,
      )
      image.data[index + 2] = 128
      image.data[index + 3] = 255
    }
  }

  context.putImageData(image, 0, 0)
  return canvas.toDataURL('image/png')
}

function createLensMap(): string {
  const canvas = document.createElement('canvas')
  canvas.width = LENS_MAP_SIZE
  canvas.height = LENS_MAP_SIZE

  const context = canvas.getContext('2d')
  if (!context) return ''

  const image = context.createImageData(LENS_MAP_SIZE, LENS_MAP_SIZE)
  const half = (LENS_MAP_SIZE - 1) / 2

  for (let y = 0; y < LENS_MAP_SIZE; y += 1) {
    for (let x = 0; x < LENS_MAP_SIZE; x += 1) {
      const nx = (x - half) / half
      const ny = (y - half) / half
      const radius = Math.hypot(nx, ny)
      const index = (y * LENS_MAP_SIZE + x) * 4

      if (radius >= 1 || radius < 0.0001) {
        image.data[index] = 128
        image.data[index + 1] = 128
        image.data[index + 2] = 128
        image.data[index + 3] = 255
        continue
      }

      const falloff = (1 - radius) * (1 - radius)
      const offset = falloff * 0.55 * 127
      image.data[index] = Math.round(128 - (nx / radius) * offset)
      image.data[index + 1] = Math.round(128 - (ny / radius) * offset)
      image.data[index + 2] = 128
      image.data[index + 3] = 255
    }
  }

  context.putImageData(image, 0, 0)
  return canvas.toDataURL('image/png')
}

function supportsBackdropWarp(): boolean {
  return (
    CSS.supports('backdrop-filter', `url(#${WARP_FILTER_ID})`) ||
    CSS.supports('-webkit-backdrop-filter', `url(#${WARP_FILTER_ID})`)
  )
}

export default function CrtOverlay() {
  const shaderRef = useRef<HTMLCanvasElement>(null)
  const lensRef = useRef<HTMLDivElement>(null)
  const [warpMap] = useState(createWarpMap)
  const [lensMap] = useState(createLensMap)
  const [warpActive] = useState(() => Boolean(warpMap) && supportsBackdropWarp())

  useEffect(() => {
    const lens = lensRef.current
    if (!lens) return

    let pointerX = 0
    let pointerY = 0
    let visible = false

    const hide = () => {
      visible = false
      lens.classList.remove('is-visible')
    }

    const followPointer = (event: PointerEvent) => {
      if (event.pointerType === 'touch') {
        hide()
        return
      }

      pointerX = event.clientX
      pointerY = event.clientY
      if (!visible) {
        visible = true
        lens.classList.add('is-visible')
      }
      lens.style.transform = `translate3d(${pointerX - LENS_SIZE / 2}px, ${pointerY - LENS_SIZE / 2}px, 0)`
    }

    window.addEventListener('pointermove', followPointer, { passive: true })
    window.addEventListener('blur', hide)
    document.documentElement.addEventListener('pointerleave', hide)

    return () => {
      window.removeEventListener('pointermove', followPointer)
      window.removeEventListener('blur', hide)
      document.documentElement.removeEventListener('pointerleave', hide)
    }
  }, [])

  useEffect(() => {
    const canvas = shaderRef.current
    if (!canvas || !('gpu' in navigator)) return

    let disposed = false
    let frameId = 0
    let device: GPUDevice | undefined
    let removeResize: (() => void) | undefined

    const init = async () => {
      const adapter = await navigator.gpu.requestAdapter()
      if (!adapter || disposed) return

      const gpuDevice = await adapter.requestDevice()
      device = gpuDevice
      if (disposed) {
        gpuDevice.destroy()
        return
      }

      const context = canvas.getContext('webgpu')
      if (!context) return

      const format = navigator.gpu.getPreferredCanvasFormat()
      const module = gpuDevice.createShaderModule({ code: CRT_SHADER })
      const pipeline = gpuDevice.createRenderPipeline({
        layout: 'auto',
        vertex: { module, entryPoint: 'vs' },
        fragment: {
          module,
          entryPoint: 'fs',
          targets: [{ format }],
        },
        primitive: { topology: 'triangle-list' },
      })
      const uniformBuffer = gpuDevice.createBuffer({
        size: 16,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      })
      const bindGroup = gpuDevice.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
      })
      const uniformData = new Float32Array(4)
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const startedAt = performance.now()

      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        canvas.width = Math.max(1, Math.round((canvas.clientWidth || window.innerWidth) * dpr))
        canvas.height = Math.max(1, Math.round((canvas.clientHeight || window.innerHeight) * dpr))
        context.configure({ device: gpuDevice, format, alphaMode: 'premultiplied' })

        if (reduceMotion) draw(performance.now())
      }

      const draw = (now: number) => {
        if (disposed) return

        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        uniformData[0] = canvas.width
        uniformData[1] = canvas.height
        uniformData[2] = reduceMotion ? 0 : (now - startedAt) / 1000
        uniformData[3] = dpr
        gpuDevice.queue.writeBuffer(uniformBuffer, 0, uniformData)

        const encoder = gpuDevice.createCommandEncoder()

        const pass = encoder.beginRenderPass({
          colorAttachments: [
            {
              view: context.getCurrentTexture().createView(),
              clearValue: { r: 0, g: 0, b: 0, a: 0 },
              loadOp: 'clear',
              storeOp: 'store',
            },
          ],
        })
        pass.setPipeline(pipeline)
        pass.setBindGroup(0, bindGroup)
        pass.draw(3)
        pass.end()
        gpuDevice.queue.submit([encoder.finish()])
      }

      resize()
      window.addEventListener('resize', resize)
      removeResize = () => window.removeEventListener('resize', resize)

      if (!reduceMotion) {
        const tick = (now: number) => {
          if (disposed) return
          draw(now)
          frameId = window.requestAnimationFrame(tick)
        }
        frameId = window.requestAnimationFrame(tick)
      }

    }

    init().catch(() => {})

    return () => {
      disposed = true
      window.cancelAnimationFrame(frameId)
      removeResize?.()
      device?.destroy()
    }
  }, [])

  return (
    <>
      <svg className="crt-defs" aria-hidden="true" focusable="false">
        <defs>
          <filter
            id={WARP_FILTER_ID}
            x="-5%"
            y="-5%"
            width="110%"
            height="110%"
            colorInterpolationFilters="sRGB"
          >
            {warpMap && (
              <feImage href={warpMap} preserveAspectRatio="none" result="warp-map" />
            )}
            <feDisplacementMap
              in="SourceGraphic"
              in2="warp-map"
              scale="100"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
          <filter
            id={LENS_FILTER_ID}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
            colorInterpolationFilters="sRGB"
          >
            {lensMap && (
              <feImage href={lensMap} preserveAspectRatio="none" result="lens-map" />
            )}
            <feDisplacementMap
              in="SourceGraphic"
              in2="lens-map"
              scale="74"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
      <div className={`crt-warp${warpActive ? ' is-active' : ''}`} aria-hidden="true" />
      <div ref={lensRef} className="crt-lens" aria-hidden="true" />
      <canvas ref={shaderRef} className="crt-shader" aria-hidden="true" />
      <div className="crt-glitch" aria-hidden="true" />
    </>
  )
}
