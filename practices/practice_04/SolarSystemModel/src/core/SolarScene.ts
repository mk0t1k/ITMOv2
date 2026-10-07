import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { SUN_DATA, PLANETS_DATA, type CelestialBodyData } from '../data/celestialBodies'
import { OrbitCalculator } from './OrbitCalculator'

export interface PlanetMeshObject {
  data: CelestialBodyData
  mesh: THREE.Mesh
  pivot: THREE.Group
  angle: number
  angularSpeed: number
}

/**
 * SolarScene
 * Управляет Three.js сценой, WebGLRenderer, камерой, OrbitControls,
 * созданием планет, анимацией с AnimationMixer / Clock, и циклом рендеринга.
 * Официальная документация Three.js Animation: https://threejs.org/docs/#Animation
 * AnimationMixer: https://threejs.org/docs/AnimationMixer.html
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

  private isRunning: boolean = true
  private animationFrameId: number | null = null
  private resizeObserver: ResizeObserver | null = null

  constructor(container: HTMLElement) {
    this.container = container
    this.scene = new THREE.Scene()
    this.clock = new THREE.Clock()
    this.orbitCalculator = new OrbitCalculator()

    // 1. Камера
    const aspect = container.clientWidth / (container.clientHeight || 1)
    this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 2000)
    this.camera.position.set(0, 75, 130)

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
    this.controls.minDistance = 10
    this.controls.maxDistance = 500
    this.controls.target.set(0, 0, 0)

    // 4. AnimationMixer привязан к корневой сцене
    this.animationMixer = new THREE.AnimationMixer(this.scene)

    this.initLighting()
    this.initStarfield()
    this.initSun()
    this.initPlanets()
    this.setupSunPulseAnimation()

    this.onWindowResize = this.onWindowResize.bind(this)
    this.animate = this.animate.bind(this)

    window.addEventListener('resize', this.onWindowResize)
    this.resizeObserver = new ResizeObserver(() => this.onWindowResize())
    this.resizeObserver.observe(this.container)

    this.animate()
  }

  private initLighting(): void {
    // Мягкий рассеянный свет
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.18)
    this.scene.add(ambientLight)

    // Точечный источник света из центра Солнца
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

    // Внешнее свечение вокруг Солнца
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
      // 1. Орбитальная круговая траектория (LineLoop в плоскости XZ)
      const orbitCurve = new THREE.EllipseCurve(
        0, 0,
        planetData.distance, planetData.distance,
        0, 2 * Math.PI,
        false,
        0
      )
      const points = orbitCurve.getPoints(96)
      // Преобразуем точки в плоскость XZ
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

      // 2. Меш планеты
      const planetGeo = new THREE.SphereGeometry(planetData.radius, 32, 32)
      const planetMat = new THREE.MeshStandardMaterial({
        color: planetData.color,
        roughness: 0.8,
        metalness: 0.1
      })
      const planetMesh = new THREE.Mesh(planetGeo, planetMat)
      planetMesh.castShadow = true
      planetMesh.receiveShadow = true

      // 3. Кольца (например, Сатурн)
      if (planetData.ring) {
        const ringGeo = new THREE.RingGeometry(
          planetData.ring.innerRadius,
          planetData.ring.outerRadius,
          64
        )
        // Разворачиваем кольцо горизонтально
        ringGeo.rotateX(Math.PI / 2)
        const ringMat = new THREE.MeshStandardMaterial({
          color: planetData.ring.color,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.75,
          roughness: 0.6
        })
        const ringMesh = new THREE.Mesh(ringGeo, ringMat)
        ringMesh.rotation.x = 0.35 // Наклон колец
        planetMesh.add(ringMesh)
      }

      // Создаем пивот / группу планеты
      const pivot = new THREE.Group()
      pivot.add(planetMesh)
      this.scene.add(pivot)

      // Начальный сдвиг по фазе, чтобы планеты не выстраивались в одну линию
      const initialAngle = (index * (Math.PI * 2)) / PLANETS_DATA.length
      const pos = this.orbitCalculator.calculatePosition(planetData.distance, initialAngle)
      planetMesh.position.set(pos.x, pos.y, pos.z)

      const angularSpeed = this.orbitCalculator.getAngularSpeed(planetData.orbitalPeriod)

      this.planets.push({
        data: planetData,
        mesh: planetMesh,
        pivot,
        angle: initialAngle,
        angularSpeed
      })
    })
  }

  /**
   * Настройка трековой анимации пульсации свечения Солнца с использованием
   * three.js AnimationClip и AnimationMixer (согласно skill threejs-animation)
   * Ссылка: https://threejs.org/docs/AnimationMixer.html
   */
  private setupSunPulseAnimation(): void {
    // Векторные ключевые кадры масштаба свечения
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

  public setRunning(running: boolean): void {
    this.isRunning = running
    if (running) {
      this.clock.getDelta() // сброс накопленной паузы
    }
  }

  public getRunning(): boolean {
    return this.isRunning
  }

  public toggleRunning(): boolean {
    this.setRunning(!this.isRunning)
    return this.isRunning
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

    // AnimationMixer обновляется стабильным источником времени delta (Clock)
    // https://threejs.org/docs/AnimationMixer.html
    if (this.animationMixer) {
      this.animationMixer.update(delta)
    }

    if (this.isRunning) {
      // Осевое вращение Солнца
      this.sunMesh.rotation.y += SUN_DATA.rotationSpeed * delta

      // Движение планет
      for (const planet of this.planets) {
        // Осевое вращение планеты
        planet.mesh.rotation.y += planet.data.rotationSpeed * delta

        // Орбитальное движение
        planet.angle = this.orbitCalculator.updateAngle(
          planet.angle,
          planet.angularSpeed,
          delta
        )
        const pos = this.orbitCalculator.calculatePosition(planet.data.distance, planet.angle)
        planet.mesh.position.set(pos.x, pos.y, pos.z)
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
    this.controls.dispose()
    this.renderer.dispose()
    if (this.renderer.domElement && this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement)
    }
  }
}
