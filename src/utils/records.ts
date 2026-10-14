import type { CulturalRecord } from '@/types/content'

export function yearsFromRecords(records: CulturalRecord[]): number[] {
  return [...new Set(records.map((record) => record.year))].sort((left, right) => right - left)
}

export function groupRecordsByYear(records: CulturalRecord[]): Map<number, CulturalRecord[]> {
  const groups = new Map<number, CulturalRecord[]>()
  records.forEach((record) => {
    groups.set(record.year, [...(groups.get(record.year) ?? []), record])
  })
  return new Map([...groups.entries()].sort(([left], [right]) => right - left))
}
