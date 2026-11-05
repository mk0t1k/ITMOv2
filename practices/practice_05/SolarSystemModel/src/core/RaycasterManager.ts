import * as THREE from 'three'
import type { PlanetMeshObject } from './SolarScene'
import type { CelestialBodyData } from '../data/celestialBodies'

export interface HoverEventPayload {
  body: CelestialBodyData | null
  screenX: number
  screenY: number
}

export type HoverCallback = (payload: HoverEventPayload) => void
export type SelectCallback = (body: CelestialBodyData | null) => void

export class RaycasterManager {
  private domElement: HTMLElement
  private camera: THREE.Camera
  private raycaster: THREE.Raycaster
  private mouse: THREE.Vector2
  private planetsProvider: () => PlanetMeshObject[]
  private sunMeshProvider: () => { mesh: THREE.Mesh; data: CelestialBodyData } | null

  private hoveredBody: CelestialBodyData | null = null
  private onHoverChange?: HoverCallback
  private onSelect?: SelectCallback

  private isPointerDown: boolean = false
  private pointerDownPos: { x: number; y: number } = { x: 0, y: 0 }

  constructor(
    domElement: HTMLElement,
    camera: THREE.Camera,
    planetsProvider: () => PlanetMeshObject[],
    sunMeshProvider: () => { mesh: THREE.Mesh; data: CelestialBodyData } | null
  ) {
    this.domElement = domElement
    this.camera = camera
    this.planetsProvider = planetsProvider
    this.sunMeshProvider = sunMeshProvider
    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2(-1000, -1000)

    this.onPointerMove = this.onPointerMove.bind(this)
    this.onPointerDown = this.onPointerDown.bind(this)
    this.onPointerUp = this.onPointerUp.bind(this)
    this.onPointerLeave = this.onPointerLeave.bind(this)

    this.bindEvents()
  }

  public setCallbacks(onHover: HoverCallback, onSelect: SelectCallback): void {
    this.onHoverChange = onHover
    this.onSelect = onSelect
  }

  private bindEvents(): void {
    this.domElement.addEventListener('pointermove', this.onPointerMove)
    this.domElement.addEventListener('pointerdown', this.onPointerDown)
    this.domElement.addEventListener('pointerup', this.onPointerUp)
    this.domElement.addEventListener('pointerleave', this.onPointerLeave)
  }

  private updateNormalizedCoords(clientX: number, clientY: number): void {
    const rect = this.domElement.getBoundingClientRect()
    this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1
    this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1
  }

  private getInteractiveMeshes(): { mesh: THREE.Mesh; data: CelestialBodyData }[] {
    const list: { mesh: THREE.Mesh; data: CelestialBodyData }[] = []
    const sun = this.sunMeshProvider()
    if (sun) {
      list.push(sun)
    }
    const planets = this.planetsProvider()
    for (const p of planets) {
      list.push({ mesh: p.mesh, data: p.data })
    }
    return list
  }

  private findIntersectedBody(): { data: CelestialBodyData; mesh: THREE.Mesh } | null {
    this.raycaster.setFromCamera(this.mouse, this.camera)
    const targets = this.getInteractiveMeshes()
    const meshes = targets.map(t => t.mesh)

    const intersects = this.raycaster.intersectObjects(meshes, false)
    if (intersects.length > 0) {
      const hitMesh = intersects[0].object as THREE.Mesh
      const matched = targets.find(t => t.mesh === hitMesh)
      return matched || null
    }
    return null
  }

  private onPointerMove(event: PointerEvent): void {
    this.updateNormalizedCoords(event.clientX, event.clientY)
    const hit = this.findIntersectedBody()
    const currentBody = hit ? hit.data : null

    if (currentBody !== this.hoveredBody) {
      this.hoveredBody = currentBody
      this.domElement.style.cursor = currentBody ? 'pointer' : 'default'
      if (this.onHoverChange) {
        this.onHoverChange({
          body: currentBody,
          screenX: event.clientX,
          screenY: event.clientY
        })
      }
    } else if (currentBody && this.onHoverChange) {
      this.onHoverChange({
        body: currentBody,
        screenX: event.clientX,
        screenY: event.clientY
      })
    }
  }

  private onPointerDown(event: PointerEvent): void {
    this.isPointerDown = true
    this.pointerDownPos = { x: event.clientX, y: event.clientY }
  }

  private onPointerUp(event: PointerEvent): void {
    if (!this.isPointerDown) return
    this.isPointerDown = false

    // Защита от клика при перетаскивании (drag OrbitControls)
    const dx = Math.abs(event.clientX - this.pointerDownPos.x)
    const dy = Math.abs(event.clientY - this.pointerDownPos.y)
    if (dx > 5 || dy > 5) {
      return
    }

    this.updateNormalizedCoords(event.clientX, event.clientY)
    const hit = this.findIntersectedBody()
    if (this.onSelect) {
      this.onSelect(hit ? hit.data : null)
    }
  }

  private onPointerLeave(): void {
    if (this.hoveredBody !== null) {
      this.hoveredBody = null
      this.domElement.style.cursor = 'default'
      if (this.onHoverChange) {
        this.onHoverChange({
          body: null,
          screenX: 0,
          screenY: 0
        })
      }
    }
  }

  public destroy(): void {
    this.domElement.removeEventListener('pointermove', this.onPointerMove)
    this.domElement.removeEventListener('pointerdown', this.onPointerDown)
    this.domElement.removeEventListener('pointerup', this.onPointerUp)
    this.domElement.removeEventListener('pointerleave', this.onPointerLeave)
    this.domElement.style.cursor = 'default'
  }
}
