<script setup lang="ts">
import { computed } from 'vue'
import { chartLayout, valueLabelY, type TrendPoint } from '@/features/patients/logic/trends'

const props = defineProps<{
  title: string
  unit: string
  points: readonly TrendPoint[]
}>()

const width = 360
const height = 180
const layout = computed(() => chartLayout(props.points, width, height))
const line = computed(() => layout.value.dots.map((dot) => `${dot.x},${dot.y}`).join(' '))
const firstDot = computed(() => layout.value.dots[0])
const lastDot = computed(() =>
  layout.value.dots.length > 1 ? layout.value.dots[layout.value.dots.length - 1] : undefined,
)

function time(at: string): string {
  return new Intl.DateTimeFormat('ru', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(at))
}

function anchor(x: number): 'start' | 'middle' | 'end' {
  if (x < 78) return 'start'
  if (x > width - 40) return 'end'
  return 'middle'
}
</script>

<template>
  <section class="rounded-2xl border border-line bg-surface px-4 py-4">
    <h3 class="text-sm font-semibold text-ink">{{ title }}</h3>
    <svg :viewBox="`0 0 ${width} ${height}`" class="mt-3 w-full" aria-hidden="true">
      <g class="text-line" fill="none" stroke="currentColor">
        <line
          v-for="tick in layout.ticks"
          :key="tick.value"
          :x1="layout.plotLeft"
          :x2="layout.plotRight"
          :y1="tick.y"
          :y2="tick.y"
        />
      </g>
      <g class="fill-muted" font-size="12">
        <text
          v-for="tick in layout.ticks"
          :key="`${tick.value}-label`"
          :x="layout.plotLeft - 8"
          :y="tick.y"
          text-anchor="end"
          dominant-baseline="middle"
        >
          {{ tick.value }}
        </text>
        <text
          v-if="firstDot"
          :x="layout.plotLeft"
          :y="height - 6"
          font-size="11"
          text-anchor="start"
        >
          {{ time(firstDot.at) }}
        </text>
        <text v-if="lastDot" :x="layout.plotRight" :y="height - 6" font-size="11" text-anchor="end">
          {{ time(lastDot.at) }}
        </text>
      </g>
      <polyline
        v-if="layout.dots.length > 1"
        :points="line"
        fill="none"
        class="text-accent"
        stroke="currentColor"
        stroke-width="2"
        stroke-linejoin="round"
        stroke-linecap="round"
      />
      <g class="text-accent">
        <circle
          v-for="dot in layout.dots"
          :key="`${dot.at}-dot`"
          :cx="dot.x"
          :cy="dot.y"
          r="4.5"
          fill="currentColor"
        />
      </g>
      <g class="fill-ink" font-size="13" font-weight="600">
        <text
          v-for="dot in layout.dots"
          :key="`${dot.at}-value`"
          :x="dot.x"
          :y="valueLabelY(dot.y)"
          :text-anchor="anchor(dot.x)"
        >
          {{ dot.value }}
        </text>
      </g>
    </svg>
    <ul class="sr-only">
      <li
        v-for="dot in layout.dots"
        :key="`${dot.at}-row`"
        class="flex items-baseline justify-between gap-3"
      >
        <span class="font-semibold text-ink">{{ dot.value }} {{ unit }}</span>
        <span class="text-muted">{{ time(dot.at) }}</span>
      </li>
    </ul>
  </section>
</template>
