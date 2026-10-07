import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { SUN_DATA, PLANETS_DATA, type CelestialBodyData } from '../data/celestialBodies'
import { OrbitCalculator } from './OrbitCalculator'
import { RaycasterManager, type HoverEventPayload } from './RaycasterManager'

export interface PlanetMeshObject {
  data: CelestialBodyData
  mesh: THREE.Mesh
  pivot: THREE.Group
  angle: number
  angularSpeed: number
  initialRadius: number
}

export type ViewMode = 'visual' | 'realistic'

/**
 * SolarScene
 * Управляет Three.js сценой, WebGLRenderer, камерой, OrbitControls,
 * созданием планет, кинематографичным перемещением камеры к выбранному телу,
 * Raycasting-интерактивностью и контролем времени.
 */
export class SolarScene {
  private container: HTMLElement
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private controls: OrbitControls
  private clock: THREE.Clock
  private animationMixer: THREE.AnimationMixer

  private sunMesh!: THREE.Mesh
  private sunGlowMesh!: THREE.Mesh
  private planets: PlanetMeshObject[] = []
  private orbitCalculator: OrbitCalculator
  private raycasterManager: RaycasterManager

  private isRunning: boolean = true
  private timeSpeed: number = 1.0
  private viewMode: ViewMode = 'visual'

  // Фокусировка камеры
  private selectedBody: CelestialBodyData | null = null
  private defaultCameraPos = new THREE.Vector3(0, 75, 130)
  private defaultControlsTarget = new THREE.Vector3(0, 0, 0)
  private cameraOffset = new THREE.Vector3(0, 4, 10)
  private isTransitioning: boolean = false
  private transitionAlpha: number = 0

  private animationFrameId: number | null = null
  private resizeObserver: ResizeObserver | null = null

  // Коллбэки для интеграции с Vue
  private onHoverCallback?: (payload: HoverEventPayload) => void
  private onSelectCallback?: (body: CelestialBodyData | null) => void

  constructor(container: HTMLElement) {
    this.container = container
    this.scene = new THREE.Scene()
    this.clock = new THREE.Clock()
    this.orbitCalculator = new OrbitCalculator()

    // 1. Камера
    const aspect = container.clientWidth / (container.clientHeight || 1)
    this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 2000)
    this.camera.position.copy(this.defaultCameraPos)

    // 2. Рендерер
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setSize(container.clientWidth, container.clientHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.1
    this.container.appendChild(this.renderer.domElement)

    // 3. OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05
    this.controls.minDistance = 3
    this.controls.maxDistance = 500
    this.controls.target.copy(this.defaultControlsTarget)

    // 4. AnimationMixer привязан к корневой сцене
    this.animationMixer = new THREE.AnimationMixer(this.scene)

    this.initLighting()
    this.initStarfield()
    this.initSun()
    this.initPlanets()
    this.setupSunPulseAnimation()

    // 5. Raycaster
    this.raycasterManager = new RaycasterManager(
      this.renderer.domElement,
      this.camera,
      () => this.planets,
      () => ({ mesh: this.sunMesh, data: SUN_DATA })
    )
    this.raycasterManager.setCallbacks(
      payload => this.onHoverCallback && this.onHoverCallback(payload),
      body => this.selectBody(body)
    )

    this.onWindowResize = this.onWindowResize.bind(this)
    this.animate = this.animate.bind(this)

    window.addEventListener('resize', this.onWindowResize)
    this.resizeObserver = new ResizeObserver(() => this.onWindowResize())
    this.resizeObserver.observe(this.container)

    this.animate()
  }

  private initLighting(): void {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.22)
    this.scene.add(ambientLight)

    const pointLight = new THREE.PointLight(0xfff5e6, 3.5, 800, 0.5)
    pointLight.position.set(0, 0, 0)
    this.scene.add(pointLight)
  }

  private initStarfield(): void {
    const starsCount = 3000
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(starsCount * 3)
    const colors = new Float32Array(starsCount * 3)

    for (let i = 0; i < starsCount; i++) {
      const radius = 400 + Math.random() * 600
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 2 - 1)

      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.sin(phi) * Math.sin(theta)
      const z = radius * Math.cos(phi)

      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z

      const shade = 0.6 + Math.random() * 0.4
      colors[i * 3] = shade
      colors[i * 3 + 1] = shade
      colors[i * 3 + 2] = 1.0
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    })

    const starfield = new THREE.Points(geometry, material)
    this.scene.add(starfield)
  }

  private initSun(): void {
    const geometry = new THREE.SphereGeometry(SUN_DATA.radius, 48, 48)
    const material = new THREE.MeshBasicMaterial({
      color: SUN_DATA.color
    })
    this.sunMesh = new THREE.Mesh(geometry, material)
    this.sunMesh.name = 'SunMesh'
    this.scene.add(this.sunMesh)

    const glowGeo = new THREE.SphereGeometry(SUN_DATA.radius * 1.25, 32, 32)
    const glowMat = new THREE.MeshBasicMaterial({
      color: SUN_DATA.emissive || 0xff7700,
      transparent: true,
      opacity: 0.28,
      side: THREE.BackSide
    })
    this.sunGlowMesh = new THREE.Mesh(glowGeo, glowMat)
    this.sunGlowMesh.name = 'SunGlowMesh'
    this.scene.add(this.sunGlowMesh)
  }

  private initPlanets(): void {
    PLANETS_DATA.forEach((planetData, index) => {
      const orbitCurve = new THREE.EllipseCurve(
        0, 0,
        planetData.distance, planetData.distance,
        0, 2 * Math.PI,
        false,
        0
      )
      const points = orbitCurve.getPoints(96)
      const orbitGeo = new THREE.BufferGeometry().setFromPoints(
        points.map(p => new THREE.Vector3(p.x, 0, p.y))
      )
      const orbitMat = new THREE.LineBasicMaterial({
        color: 0x4a5568,
        transparent: true,
        opacity: 0.35
      })
      const orbitLine = new THREE.LineLoop(orbitGeo, orbitMat)
      this.scene.add(orbitLine)

      const planetGeo = new THREE.SphereGeometry(planetData.radius, 32, 32)
      const planetMat = new THREE.MeshStandardMaterial({
        color: planetData.color,
        roughness: 0.8,
        metalness: 0.1
      })
      const planetMesh = new THREE.Mesh(planetGeo, planetMat)
      planetMesh.castShadow = true
      planetMesh.receiveShadow = true

      if (planetData.ring) {
        const ringGeo = new THREE.RingGeometry(
          planetData.ring.innerRadius,
          planetData.ring.outerRadius,
          64
        )
        ringGeo.rotateX(Math.PI / 2)
        const ringMat = new THREE.MeshStandardMaterial({
          color: planetData.ring.color,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.75,
          roughness: 0.6
        })
        const ringMesh = new THREE.Mesh(ringGeo, ringMat)
        ringMesh.rotation.x = 0.35
        planetMesh.add(ringMesh)
      }

      const pivot = new THREE.Group()
      pivot.add(planetMesh)
      this.scene.add(pivot)

      const initialAngle = (index * (Math.PI * 2)) / PLANETS_DATA.length
      const pos = this.orbitCalculator.calculatePosition(planetData.distance, initialAngle)
      planetMesh.position.set(pos.x, pos.y, pos.z)

      const angularSpeed = this.orbitCalculator.getAngularSpeed(planetData.orbitalPeriod)

      this.planets.push({
        data: planetData,
        mesh: planetMesh,
        pivot,
        angle: initialAngle,
        angularSpeed,
        initialRadius: planetData.radius
      })
    })
  }

  private setupSunPulseAnimation(): void {
    const times = [0, 1.5, 3]
    const values = [
      1.0, 1.0, 1.0,
      1.12, 1.12, 1.12,
      1.0, 1.0, 1.0
    ]
    const track = new THREE.VectorKeyframeTrack('SunGlowMesh.scale', times, values)
    const clip = new THREE.AnimationClip('SunPulseClip', 3, [track])

    const action = this.animationMixer.clipAction(clip)
    action.setLoop(THREE.LoopRepeat, Infinity)
    action.play()
  }

  // --- Реактивные слушатели и методы управления (Фича Б) ---

  public setEventCallbacks(
    onHover: (payload: HoverEventPayload) => void,
    onSelect: (body: CelestialBodyData | null) => void
  ): void {
    this.onHoverCallback = onHover
    this.onSelectCallback = onSelect
  }

  public setRunning(running: boolean): void {
    this.isRunning = running
    if (running) {
      this.clock.getDelta()
    }
  }

  public getRunning(): boolean {
    return this.isRunning
  }

  public toggleRunning(): boolean {
    this.setRunning(!this.isRunning)
    return this.isRunning
  }

  public setTimeSpeed(speed: number): void {
    this.timeSpeed = Math.max(0.01, speed)
  }

  public getTimeSpeed(): number {
    return this.timeSpeed
  }

  public setViewMode(mode: ViewMode): void {
    this.viewMode = mode
    this.applyViewModeScale()
  }

  public getViewMode(): ViewMode {
    return this.viewMode
  }

  private applyViewModeScale(): void {
    const isRealistic = this.viewMode === 'realistic'

    // Солнце
    if (this.sunMesh) {
      const sunScale = isRealistic ? 1.6 : 1.0
      this.sunMesh.scale.setScalar(sunScale)
      this.sunGlowMesh.scale.setScalar(sunScale)
    }

    // Планеты
    for (const planet of this.planets) {
      const scale = this.orbitCalculator.calculateRadiusScale(
        planet.data.realRadiusKm,
        6371.0,
        isRealistic
      )
      if (isRealistic) {
        const factor = scale * 0.75
        planet.mesh.scale.setScalar(Math.max(0.3, factor))
      } else {
        planet.mesh.scale.setScalar(1.0)
      }
    }
  }

  public selectBody(body: CelestialBodyData | null): void {
    this.selectedBody = body
    this.isTransitioning = true
    this.transitionAlpha = 0

    if (body) {
      const targetRadius = body.id === 'sun' ? SUN_DATA.radius * 1.5 : (body.ring ? body.radius * 3.5 : body.radius * 2.5)
      this.cameraOffset.set(0, targetRadius * 0.8, targetRadius * 2.2)
    }

    if (this.onSelectCallback) {
      this.onSelectCallback(body)
    }
  }

  public resetView(): void {
    this.selectBody(null)
  }

  public getSelectedBody(): CelestialBodyData | null {
    return this.selectedBody
  }

  private getSelectedBodyTargetPosition(): THREE.Vector3 {
    if (!this.selectedBody) {
      return this.defaultControlsTarget
    }
    if (this.selectedBody.id === 'sun') {
      return this.sunMesh.position
    }
    const found = this.planets.find(p => p.data.id === this.selectedBody!.id)
    if (found) {
      return found.mesh.position
    }
    return this.defaultControlsTarget
  }

  private onWindowResize(): void {
    if (!this.container) return
    const width = this.container.clientWidth
    const height = this.container.clientHeight || 1
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
  }

  private animate(): void {
    this.animationFrameId = requestAnimationFrame(this.animate)

    const delta = this.clock.getDelta()

    if (this.animationMixer) {
      this.animationMixer.update(delta)
    }

    if (this.isRunning) {
      const effectiveDelta = delta * this.timeSpeed

      // Осевое вращение Солнца
      this.sunMesh.rotation.y += SUN_DATA.rotationSpeed * effectiveDelta

      // Движение планет
      for (const planet of this.planets) {
        planet.mesh.rotation.y += planet.data.rotationSpeed * effectiveDelta

        planet.angle = this.orbitCalculator.updateAngle(
          planet.angle,
          planet.angularSpeed,
          delta,
          this.timeSpeed
        )
        const pos = this.orbitCalculator.calculatePosition(planet.data.distance, planet.angle)
        planet.mesh.position.set(pos.x, pos.y, pos.z)
      }
    }

    // Обновление положения камеры при фокусе на небесном теле
    if (this.selectedBody) {
      const targetPos = this.getSelectedBodyTargetPosition()
      const desiredCamPos = targetPos.clone().add(this.cameraOffset)

      if (this.isTransitioning) {
        this.transitionAlpha += delta * 2.0
        const t = Math.min(1.0, this.transitionAlpha)
        this.camera.position.lerp(desiredCamPos, t)
        this.controls.target.lerp(targetPos, t)

        if (t >= 1.0) {
          this.isTransitioning = false
        }
      } else {
        // Камера привязана к движущейся планете и летит вместе с ней
        this.camera.position.lerp(desiredCamPos, 0.1)
        this.controls.target.lerp(targetPos, 0.1)
      }
    } else if (this.isTransitioning) {
      // Плавный сброс вида (Reset View)
      this.transitionAlpha += delta * 2.0
      const t = Math.min(1.0, this.transitionAlpha)
      this.camera.position.lerp(this.defaultCameraPos, t)
      this.controls.target.lerp(this.defaultControlsTarget, t)

      if (t >= 1.0) {
        this.isTransitioning = false
      }
    }

    this.controls.update()
    this.renderer.render(this.scene, this.camera)
  }

  public destroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
    }
    window.removeEventListener('resize', this.onWindowResize)
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
    }
    this.raycasterManager.destroy()
    this.controls.dispose()
    this.renderer.dispose()
    if (this.renderer.domElement && this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement)
    }
  }
}
