import { describe, expect, it } from 'vitest'
import { groupRecordsByYear, yearsFromRecords } from './records'
import type { CulturalRecord } from '@/types/content'

const record = (year: number, id: string): CulturalRecord => ({
  id,
  type: 'movie',
  title: id,
  completedAt: `${year}-01-01`,
  year,
  month: 1,
  tags: [],
  directors: ['导演'],
  body: '',
  bodyHtml: '',
  summary: '',
})

describe('record grouping', () => {
  const records = [record(2025, 'a'), record(2026, 'b'), record(2025, 'c')]

  it('returns years newest first', () => {
    expect(yearsFromRecords(records)).toEqual([2026, 2025])
  })

  it('groups repeated years without dropping records', () => {
    expect(
      groupRecordsByYear(records)
        .get(2025)
        ?.map((item) => item.id),
    ).toEqual(['a', 'c'])
  })
})
