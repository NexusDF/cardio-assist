export type Place = {
  id: number
  name: string
  latitude: number
  longitude: number
  timezone: string
  region: string
}

export type HourPoint = {
  time: string
  temperature: number
  precipitation: number
  snowfall: number
  weatherCode: number
}

export type DayPoint = {
  date: string
  weatherCode: number
  tempMax: number
  tempMin: number
}

export type Forecast = {
  timezone: string
  currentTime: string
  temperature: number
  weatherCode: number
  hourly: HourPoint[]
  daily: DayPoint[]
}

export type BarSegment = {
  left: string
  width: string
}

export type TodayView = {
  temperature: string
  headline: string
  lead: string
  adviceTop: string
  adviceBottom: string
  wear: string
  precip: string
  nextLabel: string
  next: string
  segments: BarSegment[]
}

export type WeekDay = {
  date: string
  weekday: string
  dateLabel: string
  condition: string
  min: string
  max: string
  isToday: boolean
}
