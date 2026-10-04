import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

export type CopperTownSceneProps = {
  material: 'copper' | 'rubber' | null
  closed: boolean
  onStatus: (message: string) => void
  arRequest: number
  onARChange?: (active: boolean) => void
  exitARRequest?: number
  cameraBackdrop?: boolean
}

/** An illustrative circuit, not a scan of a museum object. Distances in AR are metres. */
export function CopperTownScene(props: CopperTownSceneProps) {
  const host = useRef<HTMLDivElement>(null)
  const live = useRef(props)
  live.current = props
  const actions = useRef<{ enter: () => void; exit: () => void } | null>(null)
  const [ready, setReady] = useState(false)
  const [xr, setXR] = useState(false)
  const lastRequest = useRef(props.arRequest)
  const lastExit = useRef(props.exitARRequest ?? 0)

  useEffect(() => {
    const container = host.current
    if (!container) return
    let disposed = false
    let session: XRSession | null = null
    let hitSource: XRHitTestSource | null = null
    let entering = false
    let placed = false
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
    } catch {
      live.current.onStatus('This device could not start 3D graphics. Try a browser with WebGL enabled.')
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
    renderer.setClearColor(0x071321, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.25
    renderer.xr.enabled = true
    renderer.xr.setReferenceSpaceType('local')
    renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none'
    renderer.domElement.setAttribute('aria-label', 'Interactive miniature circuit town. Drag to orbit; use the controls to test copper and rubber.')
    container.appendChild(renderer.domElement)
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(36, 1, 0.01, 100)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.enablePan = false
    controls.minPolarAngle = 0.28
    controls.maxPolarAngle = Math.PI / 2.16
    controls.minDistance = 8
    controls.maxDistance = 22
    controls.target.set(0, 0.9, 0)
    const world = new THREE.Group()
    const architecture = new THREE.Group()
    world.add(architecture)
    scene.add(world)
    scene.add(new THREE.HemisphereLight(0xb7e4ff, 0x192522, 2.1))
    const moon = new THREE.DirectionalLight(0xbad5ff, 3.1)
    moon.position.set(-5, 9, 2)
    scene.add(moon)
    const sunset = new THREE.DirectionalLight(0xffb674, 2)
    sunset.position.set(4, 3, -3)
    scene.add(sunset)

    const materials = new Set<THREE.Material>()
    const mat = (color: number, metalness = 0, roughness = 0.7) => {
      const m = new THREE.MeshStandardMaterial({ color, metalness, roughness })
      materials.add(m)
      return m
    }
    const navy = mat(0x102638), edge = mat(0x0b1727), teal = mat(0x346568)
    const copper = mat(0xd58b56, 0.72, 0.3), brass = mat(0xe6b66d, 0.5, 0.35)
    const pavement = mat(0x38545e), roof = mat(0x163c4b, 0.25, 0.48)
    const trim = mat(0xc3b9a0), dark = mat(0x12232a), foliage = mat(0x205a50)
    const foliageLight = mat(0x3f7962), rubber = mat(0x333943, 0, 0.95)
    const offWindow = mat(0x294453)
    const mesh = (g: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0, parent: THREE.Object3D = architecture) => {
      const object = new THREE.Mesh(g, m)
      object.position.set(x, y, z)
      parent.add(object)
      return object
    }
    const box = (w: number, h: number, d: number, m: THREE.Material, x: number, y: number, z: number, parent?: THREE.Object3D) => mesh(new THREE.BoxGeometry(w, h, d), m, x, y, z, parent)
    const cylinder = (r: number, h: number, m: THREE.Material, x: number, y: number, z: number, parent?: THREE.Object3D, top = r) => mesh(new THREE.CylinderGeometry(top, r, h, 40), m, x, y, z, parent)
    const ring = (r: number, tube: number, m: THREE.Material, y: number, parent?: THREE.Object3D) => {
      const object = mesh(new THREE.TorusGeometry(r, tube, 6, 96), m, 0, y, 0, parent)
      object.rotation.x = Math.PI / 2
      return object
    }
    const label = (text: string, width: number, x: number, y: number, z: number, parent: THREE.Object3D = architecture) => {
      const canvas = document.createElement('canvas')
      canvas.width = 512; canvas.height = 96
      const ctx = canvas.getContext('2d')!
      ctx.clearRect(0, 0, 512, 96)
      ctx.fillStyle = '#f6ddb4'; ctx.font = '600 40px sans-serif'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(text, 256, 48)
      const texture = new THREE.CanvasTexture(canvas)
      texture.colorSpace = THREE.SRGBColorSpace
      const m = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, side: THREE.DoubleSide })
      materials.add(m)
      return mesh(new THREE.PlaneGeometry(width, width * 96 / 512), m, x, y, z, parent)
    }
    // Layered, chamfered island. The copper rim reads as a crafted instrument.
    cylinder(4.25, 0.3, edge, 0, -0.22, 0, undefined, 4.35)
    cylinder(4.35, 0.13, navy, 0, -0.035, 0, undefined, 4.29)
    ring(4.29, 0.036, copper, -0.06)
    ring(4.12, 0.012, brass, 0.04)
    ring(2.38, 0.025, pavement, 0.04)
    cylinder(1.02, 0.07, pavement, 0, 0.045, -0.25)
    for (let i = 0; i < 32; i++) {
      const angle = i * Math.PI / 16
      const mark = box(0.025, 0.012, 0.13, copper, Math.sin(angle) * 4.0, 0.043, Math.cos(angle) * 4.0)
      mark.rotation.y = angle
    }
    // Walking paths: a central promenade, with smaller branching lanes.
    box(0.7, 0.022, 5.9, pavement, 0, 0.035, -0.05)
    box(5.8, 0.024, 0.43, pavement, 0, 0.035, -0.48)
    for (let i = 0; i < 12; i++) box(0.48, 0.03, 0.022, trim, 0, 0.053, -2.8 + i * 0.45)

    const windowMaterials: THREE.MeshStandardMaterial[] = []
    const building = (x: number, z: number, w: number, h: number, d: number, color: number, yaw = 0) => {
      const group = new THREE.Group(); group.position.set(x, 0.06, z); group.rotation.y = yaw; architecture.add(group)
      const wall = mat(color)
      box(w + 0.13, 0.12, d + 0.13, dark, 0, 0.06, 0, group)
      box(w, h, d, wall, 0, h / 2 + 0.1, 0, group)
      box(w + 0.08, 0.055, d + 0.08, trim, 0, h + 0.09, 0, group)
      // Extruded triangular pitched roof with a copper ridge.
      const shape = new THREE.Shape()
      shape.moveTo(-w / 2 - 0.12, 0); shape.lineTo(0, w * 0.53); shape.lineTo(w / 2 + 0.12, 0); shape.closePath()
      const g = new THREE.ExtrudeGeometry(shape, { depth: d + 0.23, bevelEnabled: false })
      mesh(g, roof, 0, h + 0.12, -d / 2 - 0.115, group)
      box(0.045, 0.045, d + 0.25, copper, 0, h + w * 0.53 + 0.13, 0, group)
      box(0.14, 0.36, 0.16, wall, w * 0.27, h + 0.27, -d * 0.22, group)
      box(0.19, 0.055, 0.2, trim, w * 0.27, h + 0.46, -d * 0.22, group)
      const light = mat(0xffd18a)
      light.emissive.setHex(0xffad45); light.emissiveIntensity = 0
      windowMaterials.push(light)
      const floors = Math.max(1, Math.floor(h / 0.43))
      for (let floor = 0; floor < floors; floor++) {
        for (const side of [-1, 1]) {
          for (const offset of [-0.24, 0.24]) {
            const wx = offset * w, wy = 0.36 + floor * 0.42, wz = side * (d / 2 + 0.012)
            box(0.23, 0.29, 0.035, trim, wx, wy, wz, group)
            box(0.17, 0.22, 0.043, light, wx, wy, wz + side * 0.008, group)
            box(0.018, 0.23, 0.053, dark, wx, wy, wz + side * 0.015, group)
            box(0.18, 0.018, 0.053, dark, wx, wy, wz + side * 0.015, group)
          }
          box(0.036, 0.3, 0.24, trim, side * (w / 2 + 0.012), 0.55, 0, group)
          box(0.044, 0.23, 0.17, light, side * (w / 2 + 0.018), 0.55, 0, group)
        }
      }
      box(0.2, 0.35, 0.045, dark, 0, 0.28, d / 2 + 0.02, group)
      box(0.3, 0.06, 0.23, trim, 0, 0.07, d / 2 + 0.08, group)
    }
    building(-1.35, 0.1, 0.88, 1.15, 0.76, 0x7b7470, -0.08)
    building(1.37, 0.1, 0.85, 1.53, 0.78, 0x386366, 0.08)
    building(-2.0, -1.3, 0.95, 1.28, 0.82, 0x9c7962, -0.16)
    building(1.95, -1.45, 0.87, 1.05, 0.8, 0x617f82, 0.18)
    building(-0.85, -2.35, 0.83, 1.68, 0.85, 0x4d626e, -0.08)
    building(0.75, -2.6, 0.95, 1.22, 0.72, 0x967969, 0.1)
    // The central clock / beacon tower is the unmistakable skyline silhouette.
    cylinder(0.58, 0.13, trim, 0, 0.13, -0.35)
    cylinder(0.37, 2.4, teal, 0, 1.37, -0.35, undefined, 0.28)
    for (const y of [0.28, 1.08, 1.9, 2.51]) cylinder(0.4, 0.065, brass, 0, y, -0.35)
    cylinder(0.49, 0.13, navy, 0, 2.68, -0.35)
    const beaconMat = mat(0xffdca0); beaconMat.emissive.setHex(0xffb74e)
    windowMaterials.push(beaconMat)
    cylinder(0.27, 0.48, beaconMat, 0, 2.96, -0.35)
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4
      cylinder(0.021, 0.51, brass, Math.cos(a) * 0.32, 2.97, -0.35 + Math.sin(a) * 0.32)
    }
    cylinder(0.5, 0.12, copper, 0, 3.24, -0.35)
    mesh(new THREE.ConeGeometry(0.51, 0.51, 8), roof, 0, 3.52, -0.35)
    cylinder(0.035, 0.27, brass, 0, 3.89, -0.35)
    const clockFace = mesh(new THREE.CircleGeometry(0.22, 32), trim, 0, 2.23, -0.017)
    clockFace.rotation.x = -0.08
    box(0.022, 0.14, 0.025, dark, 0, 2.29, 0.005)
    const hand = box(0.13, 0.022, 0.025, dark, 0.054, 2.23, 0.007); hand.rotation.z = -0.3
    for (const x of [-0.16, 0.16]) box(0.028, 0.028, 0.027, copper, x, 2.23, 0.008)
    // A tiny windmill animates only when the illustrative motor circuit is powered.
    cylinder(0.23, 1.05, trim, 2.7, 0.57, -0.2, undefined, 0.15)
    mesh(new THREE.ConeGeometry(0.3, 0.3, 8), roof, 2.7, 1.22, -0.2)
    const rotor = new THREE.Group(); rotor.position.set(2.7, 1.13, 0.01); world.add(rotor)
    mesh(new THREE.SphereGeometry(0.075, 10, 8), brass, 0, 0, 0, rotor)
    for (let i = 0; i < 4; i++) {
      const blade = new THREE.Group(); blade.rotation.z = i * Math.PI / 2; rotor.add(blade)
      box(0.036, 0.62, 0.035, copper, 0, 0.25, 0, blade)
      box(0.13, 0.34, 0.024, trim, 0.06, 0.37, 0, blade)
    }
    const tree = (x: number, z: number, scale: number) => {
      cylinder(0.055 * scale, 0.48 * scale, copper, x, 0.25 * scale, z)
      for (let level = 0; level < 3; level++) mesh(new THREE.ConeGeometry((0.32 - level * 0.06) * scale, 0.57 * scale, 7), level % 2 ? foliageLight : foliage, x, (0.6 + level * 0.22) * scale, z)
    }
    ;[[-3.0, -0.65, 1], [-2.85, 0.7, 0.8], [-2.5, -2.15, 1.1], [2.8, -1.7, 0.9], [2.0, -2.7, 0.8], [-1.9, 1.1, 0.72], [2.4, 1.0, 0.75], [-0.1, -3.45, 0.8]].forEach(([x, z, s]) => tree(x, z, s))
    const lampMat = mat(0xffd497); lampMat.emissive.setHex(0xffaa42)
    windowMaterials.push(lampMat)
    for (const [x, z] of [[-0.58, 0.95], [0.58, 0.95], [-0.55, -1.5], [0.55, -1.5], [-2.3, 0.25], [2.0, 0.65]]) {
      cylinder(0.09, 0.07, navy, x, 0.1, z)
      cylinder(0.025, 0.66, brass, x, 0.42, z)
      box(0.14, 0.19, 0.14, lampMat, x, 0.79, z)
      mesh(new THREE.ConeGeometry(0.15, 0.13, 4), roof, x, 0.94, z)
      for (const dx of [-0.075, 0.075]) box(0.012, 0.21, 0.16, dark, x + dx, 0.79, z)
    }
    // Battery, removable test bridge, and return wire occupy the clear foreground.
    box(1.06, 0.15, 0.92, edge, -1.75, 0.12, 2.18)
    const battery = cylinder(0.32, 0.96, copper, -1.75, 0.49, 2.18)
    battery.rotation.z = Math.PI / 2
    const batteryBand = cylinder(0.325, 0.57, navy, -1.8, 0.49, 2.18); batteryBand.rotation.z = Math.PI / 2
    const terminal = cylinder(0.15, 0.1, brass, -1.22, 0.49, 2.18); terminal.rotation.z = Math.PI / 2
    label('BATTERY', 0.85, -1.77, 0.54, 2.51)
    label('+', 0.28, -1.23, 0.79, 2.19)
    label('−', 0.28, -2.25, 0.79, 2.19)
    box(1.22, 0.16, 0.69, trim, 0.15, 0.14, 2.2)
    for (const x of [-0.33, 0.63]) {
      cylinder(0.1, 0.12, copper, x, 0.28, 2.2)
      box(0.12, 0.11, 0.24, brass, x, 0.35, 2.2)
    }
    const switchPivot = new THREE.Group(); switchPivot.position.set(-0.33, 0.38, 2.2); world.add(switchPivot)
    const bridge = box(0.96, 0.065, 0.14, copper, 0.48, 0, 0, switchPivot)
    box(0.22, 0.12, 0.23, dark, 0.78, 0.07, 0, switchPivot)
    label('TEST BRIDGE', 1.15, 0.15, 0.15, 2.56)
    const wireMat = mat(0xbb6b38, 0.72, 0.35)
    const routePoints = [
      [-1.22, 0.2, 2.18], [-0.85, 0.13, 2.18], [-0.33, 0.13, 2.2],
      [0.63, 0.13, 2.2], [1.24, 0.12, 2.2], [1.82, 0.12, 1.73],
      [1.82, 0.12, 1.05], [1.05, 0.12, 0.87], [0.4, 0.12, 0.55],
      [-0.42, 0.12, 0.55], [-0.95, 0.12, 0.87], [-2.72, 0.12, 1.42],
      [-2.83, 0.12, 2.2], [-2.27, 0.2, 2.2],
    ].map(p => new THREE.Vector3(...p as [number, number, number]))
    // No wire below the test bridge: the open gap is physically real in this drawing.
    const wire = (points: THREE.Vector3[]) => {
      const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal')
      mesh(new THREE.TubeGeometry(curve, 48, 0.035, 6, false), wireMat)
    }
    wire(routePoints.slice(0, 3)); wire(routePoints.slice(3))
    const circuit = new THREE.CatmullRomCurve3(routePoints, false, 'centripetal')
    const pulseMat = new THREE.MeshBasicMaterial({ color: 0xffe0a0 }); materials.add(pulseMat)
    const pulses = Array.from({ length: 18 }, () => mesh(new THREE.SphereGeometry(0.055, 8, 6), pulseMat, 0, 0, 0, world))
    const haloMat = new THREE.MeshBasicMaterial({ color: 0xffbd60, transparent: true, opacity: 0, depthWrite: false }); materials.add(haloMat)
    const halo = ring(0.75, 0.018, haloMat, 0.09, world); halo.position.z = -0.35
    const beacon = new THREE.Group(); beacon.position.set(0, 2.98, -0.35); world.add(beacon)
    const beamMat = new THREE.MeshBasicMaterial({ color: 0xffd992, transparent: true, opacity: 0.06, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }); materials.add(beamMat)
    const beam = mesh(new THREE.ConeGeometry(0.52, 2.6, 20, 1, true), beamMat, 1.3, 0, 0, beacon)
    beam.rotation.z = Math.PI / 2
    label('COPPER  /  CURRENT  /  CITY', 2.55, 0, -0.18, 4.14)

    // Bake the static architecture into material batches, not hundreds of draw calls.
    architecture.updateMatrixWorld(true)
    const batches = new Map<THREE.Material, THREE.BufferGeometry[]>()
    architecture.traverse(object => {
      if (!(object instanceof THREE.Mesh) || Array.isArray(object.material)) return
      const geometry = object.geometry.clone().applyMatrix4(object.matrixWorld)
      const entries = batches.get(object.material) ?? []
      entries.push(geometry); batches.set(object.material, entries)
      object.geometry.dispose()
    })
    architecture.clear()
    batches.forEach((geometries, material) => {
      // All generated primitives have position, normal and uv attributes.
      const merged = mergeGeometries(geometries.map(g => g.index ? g.toNonIndexed() : g), false)
      if (merged) architecture.add(new THREE.Mesh(merged, material))
      geometries.forEach(g => g.dispose())
    })
    const reticleMat = new THREE.MeshBasicMaterial({ color: 0x79f2c3, side: THREE.DoubleSide }); materials.add(reticleMat)
    const reticle = new THREE.Mesh(new THREE.RingGeometry(0.065, 0.082, 40).rotateX(-Math.PI / 2), reticleMat)
    reticle.matrixAutoUpdate = false; reticle.visible = false; scene.add(reticle)
    const resetCamera = () => {
      const width = Math.max(1, container.clientWidth), height = Math.max(1, container.clientHeight)
      camera.aspect = width / height
      const distance = camera.aspect < 0.9 ? 16.8 : 13.5
      camera.position.set(distance * 0.35, distance * 0.57, distance * 0.72)
      camera.updateProjectionMatrix(); controls.target.set(0, 0.95, 0); controls.update()
    }
    const resize = () => {
      if (disposed || renderer.xr.isPresenting) return
      renderer.setSize(Math.max(1, container.clientWidth), Math.max(1, container.clientHeight), false)
      resetCamera()
    }
    const observer = new ResizeObserver(resize); observer.observe(container); resize()
    let touched = false
    const onInspect = () => { touched = true }
    controls.addEventListener('start', onInspect)
    const overlay = document.querySelector<HTMLElement>('.copper-demo')
    const beforeSelect = (event: Event) => {
      if (event.target instanceof Element && event.target.closest('button, a, input, select, [role="button"]')) event.preventDefault()
    }
    overlay?.addEventListener('beforexrselect', beforeSelect)
    const endSession = () => {
      hitSource?.cancel(); hitSource = null
      session = null; entering = false; placed = false
      reticle.visible = false
      world.visible = true; world.position.set(0, 0, 0); world.quaternion.identity(); world.scale.setScalar(1)
      controls.enabled = true
      if (!disposed) {
        setXR(false); live.current.onARChange?.(false)
        // Let WebXRManager restore its non-XR camera before framing the island.
        requestAnimationFrame(() => { if (!disposed) { resize(); resetCamera() } })
        live.current.onStatus('Back in interactive 3D. Drag to explore the town.')
      }
    }
    const onSelect = () => {
      if (!reticle.visible || placed || disposed) return
      const position = new THREE.Vector3().setFromMatrixPosition(reticle.matrix)
      world.position.copy(position); world.position.y += 0.023
      world.quaternion.setFromRotationMatrix(reticle.matrix)
      world.scale.setScalar(0.055); world.visible = true; placed = true; reticle.visible = false
      live.current.onStatus('Town placed. Try the copper bridge and switch. Stay still and keep the real space clear.')
    }
    const enter = async () => {
      if (entering || session || disposed) return
      if (!navigator.xr || !window.isSecureContext) {
        live.current.onStatus('Interactive 3D is available. AR needs a supported WebXR phone and a secure browser connection.')
        return
      }
      if (!overlay) {
        live.current.onStatus('Interactive 3D is available. AR cannot open without its on-screen controls.')
        return
      }
      entering = true
      let requested: XRSession | null = null
      try {
        requested = await navigator.xr.requestSession('immersive-ar', {
          requiredFeatures: ['hit-test'], optionalFeatures: ['dom-overlay'], domOverlay: { root: overlay },
        })
        if (disposed) { await requested.end(); return }
        if (!requested.domOverlayState) {
          await requested.end()
          live.current.onStatus('This browser cannot keep the experiment controls visible in AR. Interactive 3D is available instead; try a WebXR phone with DOM overlay support.')
          return
        }
        session = requested
        session.addEventListener('end', endSession, { once: true })
        session.addEventListener('select', onSelect)
        const viewer = await session.requestReferenceSpace('viewer')
        if (!session.requestHitTestSource) throw new Error('Surface hit testing is unavailable')
        const source = await session.requestHitTestSource({ space: viewer })
        if (!source) throw new Error('No surface hit-test source')
        if (disposed || session !== requested) { source.cancel(); return }
        hitSource = source
        world.visible = false; controls.enabled = false
        await renderer.xr.setSession(session)
        if (disposed || session !== requested) return
        setXR(true); live.current.onARChange?.(true)
        live.current.onStatus('Aim at a clear tabletop. Move your phone gently until the mint ring appears, then tap to place. Do not walk while viewing.')
      } catch (error) {
        if (requested) { try { await requested.end() } catch { /* Already ended. */ } }
        if (!disposed) {
          const denied = error instanceof DOMException && (error.name === 'NotAllowedError' || error.name === 'SecurityError')
          live.current.onStatus(denied ? 'AR permission was not granted. Interactive 3D is still available.' : 'Interactive 3D is available. AR needs a supported WebXR phone with camera, hit-test and on-screen control support.')
        }
      } finally { entering = false }
    }
    actions.current = { enter: () => { void enter() }, exit: () => { if (session) void session.end().catch(() => { if (!disposed) live.current.onStatus('Use your browser’s exit-AR control to return to 3D.') }) } }
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let previous = 0, time = 0, energy = 0
    const point = new THREE.Vector3()
    renderer.setAnimationLoop((stamp, frame) => {
      if (disposed) return
      const delta = previous ? Math.min((stamp - previous) / 1000, 0.05) : 0.016
      previous = stamp; time += delta
      const powered = live.current.material === 'copper' && live.current.closed
      energy = THREE.MathUtils.damp(energy, powered ? 1 : 0, 3, delta)
      const switchAngle = live.current.closed ? 0 : 0.95
      switchPivot.rotation.z = THREE.MathUtils.damp(switchPivot.rotation.z, switchAngle, 10, delta)
      bridge.material = live.current.material === 'rubber' ? rubber : copper
      bridge.visible = live.current.material !== null
      windowMaterials.forEach((m, i) => {
        const brightness = THREE.MathUtils.clamp(energy * 1.8 - i * 0.085, 0, 1)
        m.color.copy(offWindow.color).lerp(new THREE.Color(0xffd398), brightness)
        m.emissiveIntensity = brightness * 2.2
      })
      pulses.forEach((pulse, i) => {
        pulse.visible = powered
        if (powered) { circuit.getPointAt((time * 0.12 + i / pulses.length) % 1, point); pulse.position.copy(point); pulse.position.y += 0.055 }
      })
      haloMat.opacity = powered ? 0.35 * (1 - (time * 0.42) % 1) : 0
      halo.scale.setScalar(1 + (time * 0.42) % 1)
      beacon.visible = powered; beacon.rotation.y += powered ? delta * 0.5 : 0
      rotor.rotation.z -= powered ? delta * 1.1 : 0
      if (!session) {
        if (!touched && time < 3 && !reducedMotion) {
          const offset = camera.position.clone().sub(controls.target).applyAxisAngle(new THREE.Vector3(0, 1, 0), delta * 0.018)
          camera.position.copy(controls.target).add(offset)
        }
        controls.update()
      } else if (frame && hitSource && !placed) {
        const reference = renderer.xr.getReferenceSpace()
        const hits = frame.getHitTestResults(hitSource)
        const pose = hits[0] && reference ? hits[0].getPose(reference) : null
        reticle.visible = Boolean(pose)
        if (pose) reticle.matrix.fromArray(pose.transform.matrix)
      }
      renderer.render(scene, camera)
    })
    setReady(true)
    return () => {
      disposed = true; actions.current = null
      observer.disconnect(); controls.removeEventListener('start', onInspect); controls.dispose()
      overlay?.removeEventListener('beforexrselect', beforeSelect)
      hitSource?.cancel()
      if (session) {
        session.removeEventListener('select', onSelect); session.removeEventListener('end', endSession)
        void session.end().catch(() => {})
      }
      renderer.setAnimationLoop(null)
      scene.traverse(object => { if (object instanceof THREE.Mesh) object.geometry.dispose() })
      materials.forEach(material => {
        if ('map' in material && material.map instanceof THREE.Texture) material.map.dispose()
        material.dispose()
      })
      renderer.dispose(); renderer.domElement.remove()
    }
  }, [])

  useEffect(() => {
    if (props.arRequest !== lastRequest.current) { lastRequest.current = props.arRequest; actions.current?.enter() }
  }, [props.arRequest])
  useEffect(() => {
    const request = props.exitARRequest ?? 0
    if (request !== lastExit.current) { lastExit.current = request; actions.current?.exit() }
  }, [props.exitARRequest])

  return <div ref={host} className="copper-town-scene" data-ready={ready} data-powered={props.material === 'copper' && props.closed} data-xr={xr} role="img" aria-label="Illustrative miniature copper circuit town. Use the material and switch controls to power its windows, beacon and windmill." style={{ width: '100%', height: '100%', minHeight: 0, position: 'relative' }} />
}

export default CopperTownScene
