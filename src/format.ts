export function formatTemp(value: number): string {
  const rounded = Math.round(value)
  if (rounded < 0) return `−${Math.abs(rounded)}°`
  return `${rounded}°`
}

export function formatToday(timeZone: string, now = new Date()): string {
  const parts = new Intl.DateTimeFormat('ru-RU', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    timeZone,
  }).formatToParts(now)
  const grab = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ''
  const weekday = capitalize(grab('weekday').replace('.', ''))
  return `${weekday}, ${grab('day')} ${grab('month')}`
}

export function formatWeekday(isoDate: string, timeZone: string): string {
  const instant = wallNoon(isoDate, timeZone)
  const raw = new Intl.DateTimeFormat('ru-RU', {
    weekday: 'short',
    timeZone,
  }).format(instant)
  return capitalize(raw.replace('.', ''))
}

export function formatDayMonth(isoDate: string, timeZone: string): string {
  const instant = wallNoon(isoDate, timeZone)
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    timeZone,
  }).format(instant)
}

function capitalize(value: string): string {
  if (!value) return value
  return value.charAt(0).toLocaleUpperCase('ru-RU') + value.slice(1)
}

function wallNoon(isoDate: string, timeZone: string): Date {
  const utc = new Date(`${isoDate}T12:00:00Z`)
  const offset = zoneOffset(utc, timeZone)
  return new Date(utc.getTime() - offset)
}

function zoneOffset(instant: Date, timeZone: string): number {
  const read = (zone: string) => {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: zone,
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).formatToParts(instant)
    const pick = (type: Intl.DateTimeFormatPartTypes) =>
      Number(parts.find((part) => part.type === type)?.value ?? '0')
    const hour = pick('hour') % 24
    return Date.UTC(pick('year'), pick('month') - 1, pick('day'), hour, pick('minute'), pick('second'))
  }
  return read(timeZone) - read('UTC')
}
