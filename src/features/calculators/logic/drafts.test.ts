import { describe, expect, it } from 'vitest'
import {
  appendDraft,
  parseDrafts,
  removeDraft,
  serializeDrafts,
  type CalculatorDraft,
} from './drafts'

const draft: CalculatorDraft = {
  id: 'one',
  createdAt: '2026-11-05T07:00:00.000Z',
  snapshot: { calculator: 'has-bled', score: 3, maxScore: 9 },
}

describe('черновики калькуляторов', () => {
  it('кладёт новый результат первым и обрезает список', () => {
    const older = { ...draft, id: 'older' }
    const appended = appendDraft([older], draft, 1)
    expect(appended.map((item) => item.id)).toEqual(['one'])
  })

  it('удаляет запись по идентификатору', () => {
    expect(removeDraft([draft], 'one')).toEqual([])
    expect(removeDraft([draft], 'missing')).toEqual([draft])
  })

  it('сохраняет круг сериализации и отбрасывает битые записи', () => {
    expect(parseDrafts(serializeDrafts([draft]))).toEqual([draft])
    expect(parseDrafts(null)).toEqual([])
    expect(parseDrafts('{')).toEqual([])
    expect(
      parseDrafts(
        JSON.stringify([{ id: '', createdAt: draft.createdAt, snapshot: draft.snapshot }]),
      ),
    ).toEqual([])
  })
})
