<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  clampScale,
  fitImage,
  hitCaliper,
  screenToImage,
  zoomAt,
  type ViewTransform,
} from '@/features/ecg/logic/view'
import { useAppI18n } from '@/shared/i18n'

const props = defineProps<{
  image: HTMLImageElement
  marks: readonly [number, number]
}>()

const emit = defineEmits<{
  'update:marks': [marks: [number, number]]
}>()

const { t } = useAppI18n()
const host = ref<HTMLDivElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const transform = ref<ViewTransform>({ scale: 1, originX: 0, originY: 0 })

const pointers = new Map<number, { x: number; y: number }>()
let drag: { kind: 'pan'; x: number; y: number } | { kind: 'caliper'; index: 0 | 1 } | null = null
let pinchDist = 0
let observer: ResizeObserver | null = null

function viewSize(): { width: number; height: number } | null {
  const element = host.value
  if (element === null) return null
  return { width: element.clientWidth, height: element.clientHeight }
}

function fit() {
  const size = viewSize()
  if (size === null) return
  const next = fitImage(
    size.width,
    size.height,
    props.image.naturalWidth,
    props.image.naturalHeight,
  )
  if (next === null) return
  transform.value = next
  draw()
}

function resize() {
  const element = canvas.value
  const size = viewSize()
  if (element === null || size === null) return
  const dpr = window.devicePixelRatio || 1
  element.width = Math.max(1, Math.round(size.width * dpr))
  element.height = Math.max(1, Math.round(size.height * dpr))
  draw()
}

function draw() {
  const element = canvas.value
  const size = viewSize()
  if (element === null || size === null) return
  const ctx = element.getContext('2d')
  if (ctx === null) return
  const dpr = window.devicePixelRatio || 1
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, size.width, size.height)
  ctx.fillStyle = '#0e1615'
  ctx.fillRect(0, 0, size.width, size.height)
  const { scale, originX, originY } = transform.value
  ctx.save()
  ctx.translate(originX, originY)
  ctx.scale(scale, scale)
  ctx.drawImage(props.image, 0, 0)
  props.marks.forEach((mark, index) => {
    ctx.beginPath()
    ctx.moveTo(mark, 0)
    ctx.lineTo(mark, props.image.naturalHeight)
    ctx.strokeStyle = index === 0 ? '#2dd4bf' : '#fdba74'
    ctx.lineWidth = 2 / scale
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(mark, props.image.naturalHeight / 2, 11 / scale, 0, Math.PI * 2)
    ctx.fillStyle = index === 0 ? '#2dd4bf' : '#fdba74'
    ctx.fill()
  })
  ctx.restore()
}

function localPoint(event: PointerEvent): { x: number; y: number } | null {
  const element = canvas.value
  if (element === null) return null
  const rect = element.getBoundingClientRect()
  return { x: event.clientX - rect.left, y: event.clientY - rect.top }
}

function zoomBy(factor: number) {
  const size = viewSize()
  if (size === null) return
  const next = zoomAt(
    transform.value,
    size.width / 2,
    size.height / 2,
    clampScale(transform.value.scale * factor),
  )
  if (next === null) return
  transform.value = next
  draw()
}

function onPointerDown(event: PointerEvent) {
  const point = localPoint(event)
  if (point === null) return
  pointers.set(event.pointerId, point)
  try {
    canvas.value?.setPointerCapture(event.pointerId)
  } catch {
    // The pointer can already be inactive. Dragging still follows later move events.
  }
  if (pointers.size >= 2) {
    drag = null
    pinchDist = pointerDistance()
    return
  }
  const imagePoint = screenToImage(point.x, point.y, transform.value)
  const hit =
    imagePoint === null ? null : hitCaliper(imagePoint.x, props.marks, transform.value.scale)
  drag = hit === null ? { kind: 'pan', x: point.x, y: point.y } : { kind: 'caliper', index: hit }
}

function onPointerMove(event: PointerEvent) {
  if (!pointers.has(event.pointerId)) return
  const point = localPoint(event)
  if (point === null) return
  pointers.set(event.pointerId, point)
  if (pointers.size >= 2) {
    const nextDist = pointerDistance()
    if (pinchDist > 0 && nextDist > 0) {
      const mid = pointerMidpoint()
      const next = zoomAt(
        transform.value,
        mid.x,
        mid.y,
        clampScale(transform.value.scale * (nextDist / pinchDist)),
      )
      if (next !== null) transform.value = next
    }
    pinchDist = nextDist
    drag = null
    draw()
    return
  }
  if (drag?.kind === 'pan') {
    transform.value = {
      ...transform.value,
      originX: transform.value.originX + point.x - drag.x,
      originY: transform.value.originY + point.y - drag.y,
    }
    drag = { kind: 'pan', x: point.x, y: point.y }
    draw()
    return
  }
  if (drag?.kind === 'caliper') {
    const imagePoint = screenToImage(point.x, point.y, transform.value)
    if (imagePoint === null) return
    const nextX = Math.min(props.image.naturalWidth, Math.max(0, imagePoint.x))
    const next: [number, number] = [props.marks[0], props.marks[1]]
    next[drag.index] = nextX
    emit('update:marks', next)
  }
}

function onPointerUp(event: PointerEvent) {
  pointers.delete(event.pointerId)
  if (pointers.size < 2) pinchDist = 0
  if (pointers.size === 0) drag = null
}

function pointerDistance(): number {
  const points = [...pointers.values()]
  if (points.length < 2) return 0
  const [a, b] = points
  if (a === undefined || b === undefined) return 0
  return Math.hypot(b.x - a.x, b.y - a.y)
}

function pointerMidpoint(): { x: number; y: number } {
  const points = [...pointers.values()]
  const a = points[0]
  const b = points[1]
  if (a === undefined || b === undefined) return { x: 0, y: 0 }
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

onMounted(() => {
  resize()
  fit()
  if (host.value !== null) {
    observer = new ResizeObserver(() => resize())
    observer.observe(host.value)
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
})

watch(
  () => props.image,
  () => fit(),
)
watch(
  () => [props.marks[0], props.marks[1]],
  () => draw(),
)

defineExpose({ fit, zoomBy })
</script>

<template>
  <div>
    <div ref="host" class="h-80 w-full overflow-hidden rounded-2xl border border-line">
      <canvas
        ref="canvas"
        class="block h-full w-full touch-none"
        :aria-label="t('ecg.stage')"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
      />
    </div>
    <div class="mt-3 grid grid-cols-3 gap-2">
      <button
        type="button"
        class="inline-flex min-h-12 items-center justify-center rounded-xl border border-line bg-surface text-base font-semibold text-ink"
        @click="zoomBy(1 / 1.25)"
      >
        {{ t('ecg.zoomOut') }}
      </button>
      <button
        type="button"
        class="inline-flex min-h-12 items-center justify-center rounded-xl border border-line bg-surface text-base font-semibold text-ink"
        @click="fit"
      >
        {{ t('ecg.fit') }}
      </button>
      <button
        type="button"
        class="inline-flex min-h-12 items-center justify-center rounded-xl border border-line bg-surface text-base font-semibold text-ink"
        @click="zoomBy(1.25)"
      >
        {{ t('ecg.zoomIn') }}
      </button>
    </div>
  </div>
</template>
