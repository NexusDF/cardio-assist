import { formatDayMonth, formatTemp, formatWeekday } from './format'
import type { Forecast, HourPoint, TodayView, WeekDay } from './types'

type Kind = 'dry' | 'snow' | 'rain' | 'storm'

type Span = {
  kind: Exclude<Kind, 'dry'>
  from: number
  to: number
}

const KIND_NAME: Record<Exclude<Kind, 'dry'>, string> = {
  snow: 'Снег',
  rain: 'Дождь',
  storm: 'Гроза',
}

export function buildToday(forecast: Forecast): TodayView {
  const hours = hoursOfToday(forecast)
  const kinds = smoothKinds(hours.map(hourKind))
  const spans = groupSpans(kinds)
  const next = nextChange(forecast)

  const line = headline(forecast.weatherCode, forecast.temperature)
  return {
    temperature: formatTemp(forecast.temperature),
    headline: line.headline,
    lead: line.lead,
    adviceTop: line.adviceTop,
    adviceBottom: line.adviceBottom,
    wear: wear(forecast.temperature),
    precip: describePrecip(spans),
    nextLabel: next.label,
    next: next.value,
    segments: spans.map((span) => ({
      left: `${(span.from / 24) * 100}%`,
      width: `${((span.to - span.from) / 24) * 100}%`,
    })),
  }
}

export function buildWeek(forecast: Forecast): WeekDay[] {
  const today = forecast.currentTime.slice(0, 10)
  return forecast.daily.map((day) => ({
    date: day.date,
    weekday: formatWeekday(day.date, forecast.timezone),
    dateLabel: formatDayMonth(day.date, forecast.timezone),
    condition: conditionName(day.weatherCode),
    min: formatTemp(day.tempMin),
    max: formatTemp(day.tempMax),
    isToday: day.date === today,
  }))
}

export function conditionName(code: number): string {
  if (isStorm(code)) return 'Гроза'
  if (isSnow(code)) return 'Снег'
  if (code >= 51 && code <= 57) return 'Морось'
  if (isRain(code)) return 'Дождь'
  if (code === 45 || code === 48) return 'Туман'
  if (code <= 1) return 'Ясно'
  if (code === 3) return 'Пасмурно'
  return 'Облачно'
}

function headline(code: number, temperature: number): {
  headline: string
  lead: string
  adviceTop: string
  adviceBottom: string
} {
  const rounded = Math.round(temperature)
  const cold = rounded <= 0
  const warm = rounded >= 22
  const hot = rounded >= 27
  let title = 'Облачно'

  if (isStorm(code)) title = 'Гроза'
  else if (isSnow(code)) title = cold ? 'Снег и мороз' : 'Снег'
  else if (isRain(code)) title = cold ? 'Дождь и холод' : 'Дождь'
  else if (code === 45 || code === 48) title = 'Туман'
  else if (code <= 1 && cold) title = 'Ясно и морозно'
  else if (code <= 1 && hot) title = 'Жара'
  else if (code <= 1 && warm) title = 'Ясно и тепло'
  else if (code <= 1) title = 'Ясно'
  else if (cold) title = 'Пасмурно и холодно'
  else if (code === 3) title = 'Пасмурно'

  const jacket = rounded <= 17
  const umbrella = isRain(code) || isStorm(code)
  const adviceTop = `Куртку — ${jacket ? 'да' : 'нет'},`
  const adviceBottom = `зонт — ${umbrella ? 'да' : 'нет'}.`
  const lead = `${title}.`
  return {
    lead,
    adviceTop,
    adviceBottom,
    headline: `${lead} ${adviceTop} ${adviceBottom}`,
  }
}

function wear(temperature: number): string {
  const rounded = Math.round(temperature)
  if (rounded <= -15) return 'Пуховик, шапка, шарф, перчатки'
  if (rounded <= 0) return 'Пуховик, шапка, перчатки'
  if (rounded <= 6) return 'Тёплая куртка и шапка'
  if (rounded <= 12) return 'Куртка и свитер'
  if (rounded <= 17) return 'Лёгкая куртка'
  if (rounded <= 22) return 'Кофта'
  return 'Футболка'
}

function nextChange(forecast: Forecast): { label: string; value: string } {
  const upcoming = forecast.hourly.filter((hour) => hour.time > forecast.currentTime)
  if (upcoming.length === 0) {
    return { label: 'Дальше', value: 'Нет данных на ближайшие часы' }
  }

  const current = Math.round(forecast.temperature)
  const today = forecast.currentTime.slice(0, 10)
  const tomorrow = shiftDate(today, 1)
  const warmest = Math.max(...upcoming.map((hour) => Math.round(hour.temperature)))
  const coldest = Math.min(...upcoming.map((hour) => Math.round(hour.temperature)))

  if (warmest > current) {
    const hit = upcoming.find((hour) => Math.round(hour.temperature) === warmest) ?? upcoming[0]
    return { label: 'Станет теплее', value: `${when(hit.time, today, tomorrow)}, до ${formatTemp(hit.temperature)}` }
  }

  if (coldest < current) {
    const hit = upcoming.find((hour) => Math.round(hour.temperature) === coldest) ?? upcoming[0]
    return { label: 'Станет холоднее', value: `${when(hit.time, today, tomorrow)}, до ${formatTemp(hit.temperature)}` }
  }

  return { label: 'Дальше', value: 'Температура почти не изменится' }
}

function when(time: string, today: string, tomorrow: string): string {
  const date = time.slice(0, 10)
  const clock = time.slice(11, 16)
  if (clock === '00:00' && date === tomorrow) return 'К полуночи'
  if (date === today) return `К ${clock}`
  if (date === tomorrow) return `Завтра к ${clock}`
  return `К ${clock}`
}

function hoursOfToday(forecast: Forecast): HourPoint[] {
  const day = forecast.currentTime.slice(0, 10)
  const byHour = new Map<number, HourPoint>()
  for (const hour of forecast.hourly) {
    if (!hour.time.startsWith(day)) continue
    byHour.set(Number(hour.time.slice(11, 13)), hour)
  }

  return Array.from({ length: 24 }, (_, hour) => {
    return (
      byHour.get(hour) ?? {
        time: `${day}T${String(hour).padStart(2, '0')}:00`,
        temperature: forecast.temperature,
        precipitation: 0,
        snowfall: 0,
        weatherCode: 0,
      }
    )
  })
}

function hourKind(hour: HourPoint): Kind {
  if (isStorm(hour.weatherCode)) return 'storm'
  if (isSnow(hour.weatherCode)) return 'snow'
  if (isRain(hour.weatherCode)) return 'rain'
  if (hour.snowfall >= 0.1) return 'snow'
  if (hour.precipitation >= 0.1) return hour.temperature <= 0 ? 'snow' : 'rain'
  return 'dry'
}

function smoothKinds(kinds: Kind[]): Kind[] {
  const next = kinds.slice()
  for (let index = 1; index < next.length - 1; index += 1) {
    if (next[index] === 'dry' && next[index - 1] !== 'dry' && next[index + 1] !== 'dry') {
      next[index] = next[index - 1]
    }
  }
  return next
}

function groupSpans(kinds: Kind[]): Span[] {
  const spans: Span[] = []
  let index = 0
  while (index < kinds.length) {
    const kind = kinds[index]
    let end = index + 1
    while (end < kinds.length && kinds[end] === kind) end += 1
    if (kind !== 'dry') spans.push({ kind, from: index, to: end })
    index = end
  }
  return spans
}

function describePrecip(spans: Span[]): string {
  if (spans.length === 0) return 'Без осадков'
  if (spans.length > 2) {
    const totals = { snow: 0, rain: 0, storm: 0 }
    for (const span of spans) totals[span.kind] += span.to - span.from
    const wet = totals.snow + totals.rain + totals.storm
    const dominant = (Object.keys(totals) as (keyof typeof totals)[]).reduce((best, kind) =>
      totals[kind] > totals[best] ? kind : best,
    )
    if (wet >= 18) return `${KIND_NAME[dominant]} почти весь день`
    return 'Осадки несколько раз за день'
  }

  if (spans.length === 1) {
    const span = spans[0]
    const name = KIND_NAME[span.kind]
    if (span.from === 0 && span.to >= 24) return `${name} весь день`
    if (span.from === 0) return `${name} до ${clock(span.to)}, потом сухо`
    if (span.to >= 24) return `Сухо до ${clock(span.from)}, потом ${name.toLowerCase()}`
    return `${name} с ${clock(span.from)} до ${clock(span.to)}`
  }

  if (spans[0].kind === spans[1].kind) {
    const name = KIND_NAME[spans[0].kind]
    return `${name} ${spanRange(spans[0])} и ${spanRange(spans[1])}`
  }

  if (spans[1].from === spans[0].to) {
    const first = KIND_NAME[spans[0].kind]
    const second = KIND_NAME[spans[1].kind].toLowerCase()
    if (spans[1].to >= 23) return `${first} до ${clock(spans[0].to)}, потом ${second}`
    return `${first} до ${clock(spans[0].to)}, потом ${second} до ${clock(spans[1].to)}`
  }

  return `${phrase(spans[0], true)}, ${phrase(spans[1], false)}`
}

function spanRange(span: Span): string {
  if (span.from === 0) return `до ${clock(span.to)}`
  if (span.to >= 24) return `с ${clock(span.from)}`
  return `с ${clock(span.from)} до ${clock(span.to)}`
}

function phrase(span: Span, leading: boolean): string {
  const name = leading ? KIND_NAME[span.kind] : KIND_NAME[span.kind].toLowerCase()
  if (span.from === 0) return `${name} до ${clock(span.to)}`
  if (span.to >= 24) return `${name} с ${clock(span.from)}`
  return `${name} с ${clock(span.from)} до ${clock(span.to)}`
}

function clock(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`
}

function shiftDate(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day + days))
  return date.toISOString().slice(0, 10)
}

function isSnow(code: number): boolean {
  return (code >= 71 && code <= 77) || code === 85 || code === 86
}

function isRain(code: number): boolean {
  return (code >= 51 && code <= 67) || (code >= 80 && code <= 82)
}

function isStorm(code: number): boolean {
  return code === 95 || code === 96 || code === 99
}
