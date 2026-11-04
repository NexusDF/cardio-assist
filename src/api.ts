import type { DayPoint, Forecast, HourPoint, Place } from './types'

const DEFAULT_PLACE: Place = {
  id: 499099,
  name: 'Самара',
  latitude: 53.20767,
  longitude: 50.13553,
  timezone: 'Europe/Samara',
  region: 'Самарская область, Россия',
}

const STORAGE_KEY = 'pogoda-place'

export function defaultPlace(): Place {
  return DEFAULT_PLACE
}

export function loadPlace(): Place {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_PLACE
    const parsed = JSON.parse(raw) as Partial<Place>
    if (
      typeof parsed.name !== 'string' ||
      typeof parsed.latitude !== 'number' ||
      typeof parsed.longitude !== 'number' ||
      typeof parsed.timezone !== 'string'
    ) {
      return DEFAULT_PLACE
    }
    return {
      id: typeof parsed.id === 'number' ? parsed.id : 0,
      name: parsed.name,
      latitude: parsed.latitude,
      longitude: parsed.longitude,
      timezone: parsed.timezone,
      region: typeof parsed.region === 'string' ? parsed.region : '',
    }
  } catch {
    return DEFAULT_PLACE
  }
}

export function savePlace(place: Place): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(place))
  } catch {
    // Приватный режим браузера может запретить запись.
  }
}

type RawPlace = {
  id: number
  name: string
  latitude: number
  longitude: number
  timezone?: string
  country?: string
  admin1?: string
  feature_code?: string
}

export async function searchPlaces(query: string): Promise<Place[]> {
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search')
  url.searchParams.set('name', query)
  url.searchParams.set('count', '8')
  url.searchParams.set('language', 'ru')
  url.searchParams.set('format', 'json')

  const response = await fetch(url, { signal: AbortSignal.timeout(12_000) })
  if (!response.ok) throw new Error('geo')
  const payload = (await response.json()) as { results?: RawPlace[] }
  const mapped = (payload.results ?? []).map(toPlace)
  const cities = mapped.filter((place) => place.featureCode.startsWith('PPL'))
  const seen = new Set<string>()
  const unique = (cities.length > 0 ? cities : mapped).filter((place) => {
    const key = `${place.name}|${place.region}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
  return unique.slice(0, 6).map((place) => ({
    id: place.id,
    name: place.name,
    latitude: place.latitude,
    longitude: place.longitude,
    timezone: place.timezone,
    region: place.region,
  }))
}

function toPlace(raw: RawPlace): Place & { featureCode: string } {
  const region = [raw.admin1, raw.country].filter(Boolean).join(', ')
  return {
    id: raw.id,
    name: raw.name,
    latitude: raw.latitude,
    longitude: raw.longitude,
    timezone: raw.timezone || 'UTC',
    region,
    featureCode: raw.feature_code ?? 'PPL',
  }
}

type RawForecast = {
  timezone: string
  current: {
    time: string
    temperature_2m: number
    weather_code: number
  }
  hourly: {
    time: string[]
    temperature_2m: number[]
    precipitation: number[]
    snowfall: number[]
    weather_code: number[]
  }
  daily: {
    time: string[]
    weather_code: number[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
  }
}

export async function fetchForecast(latitude: number, longitude: number): Promise<Forecast> {
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', String(latitude))
  url.searchParams.set('longitude', String(longitude))
  url.searchParams.set('current', 'temperature_2m,weather_code')
  url.searchParams.set('hourly', 'temperature_2m,precipitation,snowfall,weather_code')
  url.searchParams.set('daily', 'weather_code,temperature_2m_max,temperature_2m_min')
  url.searchParams.set('timezone', 'auto')
  url.searchParams.set('forecast_days', '7')

  const response = await fetch(url, { signal: AbortSignal.timeout(12_000) })
  if (!response.ok) throw new Error('weather')
  const raw = (await response.json()) as RawForecast
  return {
    timezone: raw.timezone,
    currentTime: raw.current.time,
    temperature: raw.current.temperature_2m,
    weatherCode: raw.current.weather_code,
    hourly: raw.hourly.time.map((time, index): HourPoint => ({
      time,
      temperature: raw.hourly.temperature_2m[index] ?? 0,
      precipitation: raw.hourly.precipitation[index] ?? 0,
      snowfall: raw.hourly.snowfall[index] ?? 0,
      weatherCode: raw.hourly.weather_code[index] ?? 0,
    })),
    daily: raw.daily.time.map((date, index): DayPoint => ({
      date,
      weatherCode: raw.daily.weather_code[index] ?? 0,
      tempMax: raw.daily.temperature_2m_max[index] ?? 0,
      tempMin: raw.daily.temperature_2m_min[index] ?? 0,
    })),
  }
}
