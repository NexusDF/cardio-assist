import { describe, expect, it } from 'vitest'
import { appMeta } from '@/shared/meta'
import { featureIds, features } from '@/shared/features'
import { resolveAppBase } from './base'

describe('resolveAppBase', () => {
  it.each([
    [undefined, '/'],
    ['', '/'],
    ['   ', '/'],
    ['/', '/'],
    ['///', '/'],
    ['cardioassist', '/cardioassist/'],
    ['/cardioassist', '/cardioassist/'],
    ['/cardioassist/', '/cardioassist/'],
    ['cardioassist/', '/cardioassist/'],
  ] as const)('нормализует %j в %j', (input, expected) => {
    expect(resolveAppBase(input)).toBe(expected)
  })
})

describe('каркас приложения', () => {
  it('использует hash-маршруты, чтобы GitHub Pages не требовал серверных редиректов', () => {
    expect(appMeta.routerHistory).toBe('hash')
  })

  it('перечисляет каждый модуль MVP один раз и даёт ему свой маршрут', () => {
    expect(features.map((feature) => feature.id)).toEqual([...featureIds])
    expect(features.map((feature) => feature.path)).toEqual(featureIds.map((id) => `/${id}`))
    expect(new Set(features.map((feature) => feature.path)).size).toBe(features.length)
  })
})
