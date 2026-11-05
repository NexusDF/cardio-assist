export const minViewScale = 0.15
export const maxViewScale = 8

export interface ViewTransform {
  readonly scale: number
  readonly originX: number
  readonly originY: number
}

export function clampScale(scale: number): number {
  if (!Number.isFinite(scale)) return minViewScale
  return Math.min(maxViewScale, Math.max(minViewScale, scale))
}

export function fitImage(
  viewWidth: number,
  viewHeight: number,
  imageWidth: number,
  imageHeight: number,
): ViewTransform | null {
  if (![viewWidth, viewHeight, imageWidth, imageHeight].every(isPositive)) return null
  const scale = Math.min(viewWidth / imageWidth, viewHeight / imageHeight)
  return {
    scale,
    originX: (viewWidth - imageWidth * scale) / 2,
    originY: (viewHeight - imageHeight * scale) / 2,
  }
}

export function screenToImage(
  localX: number,
  localY: number,
  transform: ViewTransform,
): { x: number; y: number } | null {
  if (!isPositive(transform.scale)) return null
  return {
    x: (localX - transform.originX) / transform.scale,
    y: (localY - transform.originY) / transform.scale,
  }
}

export function zoomAt(
  transform: ViewTransform,
  focusX: number,
  focusY: number,
  nextScale: number,
): ViewTransform | null {
  if (!isPositive(transform.scale) || !isPositive(nextScale)) return null
  const imageX = (focusX - transform.originX) / transform.scale
  const imageY = (focusY - transform.originY) / transform.scale
  return {
    scale: nextScale,
    originX: focusX - imageX * nextScale,
    originY: focusY - imageY * nextScale,
  }
}

export function hitCaliper(
  imageX: number,
  marks: readonly [number, number],
  scale: number,
  slopPx = 22,
): 0 | 1 | null {
  if (!isPositive(scale) || !Number.isFinite(imageX)) return null
  const first = Math.abs(imageX - marks[0]) * scale
  const second = Math.abs(imageX - marks[1]) * scale
  if (first <= slopPx && first <= second) return 0
  if (second <= slopPx) return 1
  return null
}

function isPositive(value: number): boolean {
  return Number.isFinite(value) && value > 0
}
