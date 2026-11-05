import { describe, expect, it } from 'vitest'
import html from '../../../index.html?raw'
import {
  defaultPreferences,
  parsePreferences,
  PREFERENCES_STORAGE_KEY,
  serializePreferences,
} from './preferences'

describe('parsePreferences', () => {
  it('возвращает значения по умолчанию для пустого и битого хранилища', () => {
    expect(parsePreferences(null)).toEqual(defaultPreferences)
    expect(parsePreferences('')).toEqual(defaultPreferences)
    expect(parsePreferences('   ')).toEqual(defaultPreferences)
    expect(parsePreferences('{')).toEqual(defaultPreferences)
    expect(parsePreferences('[]')).toEqual(defaultPreferences)
    expect(parsePreferences('null')).toEqual(defaultPreferences)
  })

  it('отбрасывает неизвестную тему, язык и дату', () => {
    const parsed = parsePreferences(
      JSON.stringify({
        theme: 'sepia',
        locale: 'en',
        disclaimerAcceptedAt: 'вчера',
      }),
    )

    expect(parsed).toEqual(defaultPreferences)
  })

  it('сохраняет принятый дисклеймер и явный выбор темы', () => {
    const raw = serializePreferences({
      theme: 'dark',
      locale: 'ru',
      disclaimerAcceptedAt: '2026-11-05T06:00:00.000Z',
    })

    expect(parsePreferences(raw)).toEqual({
      theme: 'dark',
      locale: 'ru',
      disclaimerAcceptedAt: '2026-11-05T06:00:00.000Z',
    })
  })

  it('считает пустую дату непринятым дисклеймером', () => {
    expect(
      parsePreferences(JSON.stringify({ theme: 'light', locale: 'ru', disclaimerAcceptedAt: '' })),
    ).toMatchObject({ theme: 'light', disclaimerAcceptedAt: null })
  })
})

describe('ключ хранилища', () => {
  it('совпадает со скриптом, который ставит тему до отрисовки', () => {
    expect(html).toContain(PREFERENCES_STORAGE_KEY)
  })
})
