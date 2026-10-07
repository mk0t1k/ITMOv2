/**
 * OrbitCalculator
 * Вычисляет орбитальные скорости и позиции планет на плоскости XZ
 */
export class OrbitCalculator {
  // Базовая угловая скорость для нормирования (например, для Земли ~ 1 rad/s при базовом множителе)
  private baseSpeed: number

  constructor(baseSpeed: number = 2.0) {
    this.baseSpeed = baseSpeed
  }

  /**
   * Рассчитывает угловую скорость w (рад/с) на основе орбитального периода
   * Скейлим так, чтобы Меркурий (period=88) двигался быстро, а Нептун (period=60190) не стоял намертво
   * Используется степенное сглаживание периода для комфортной визуализации
   */
  public getAngularSpeed(orbitalPeriod: number): number {
    // В реальности T ~ a^(3/2), для визуализации масштабируем степень,
    // чтобы разница между Меркурием и Нептуном сохраняла строгий порядок:
    // T_mercury < T_venus < ... < T_neptune => w_mercury > w_venus > ... > w_neptune
    const scaledPeriod = Math.pow(orbitalPeriod, 0.45)
    return this.baseSpeed / scaledPeriod
  }

  /**
   * Обновляет угол орбиты по дельте времени:
   * angle += angularSpeed * delta * timeScale
   */
  public updateAngle(currentAngle: number, angularSpeed: number, delta: number, timeScale: number = 1.0): number {
    const nextAngle = currentAngle + angularSpeed * delta * timeScale
    const twoPi = Math.PI * 2
    return ((nextAngle % twoPi) + twoPi) % twoPi
  }

  /**
   * Вычисляет масштаб радиуса в зависимости от режима:
   * - visual: 1.0 (оригинальные стилизованные радиусы)
   * - realistic: пропорциональный логарифмический масштаб к Земле для сохранения видимости и реалистичного баланса
   */
  public calculateRadiusScale(realRadiusKm: number, earthRadiusKm: number = 6371.0, isRealistic: boolean = false): number {
    if (!isRealistic) return 1.0
    // В реалистичном режиме масштаб соотносится с реальными размерами
    const ratio = realRadiusKm / earthRadiusKm
    return Math.max(0.2, Math.min(ratio, 12))
  }

  /**
   * Вычисляет 3D координаты в плоскости XZ:
   * x = distance * cos(angle)
   * y = 0
   * z = distance * sin(angle)
   */
  public calculatePosition(distance: number, angle: number): { x: number; y: number; z: number } {
    return {
      x: Math.cos(angle) * distance,
      y: 0,
      z: Math.sin(angle) * distance
    }
  }
}
