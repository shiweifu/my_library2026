import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import records from 'virtual:records'
import type { CulturalRecord, MediaType } from '@/types/content'
import { yearsFromRecords } from '@/utils/records'

export const useArchiveStore = defineStore('archive', () => {
  const selectedTag = ref<string | null>(null)
  const allRecords = computed(() => records)
  const years = computed(() => yearsFromRecords(records))
  const tags = computed(() => [...new Set(records.flatMap((record) => record.tags))].sort())
  const latestYear = computed(() => years.value[0] ?? new Date().getFullYear())

  const countByType = computed<Record<MediaType, number>>(() => ({
    book: records.filter((record) => record.type === 'book').length,
    movie: records.filter((record) => record.type === 'movie').length,
    music: records.filter((record) => record.type === 'music').length,
  }))

  function findRecord(id: string): CulturalRecord | undefined {
    return records.find((record) => record.id === id)
  }

  function filterRecords(options: { year?: number; type?: MediaType; tag?: string | null }) {
    return records.filter((record) => {
      if (options.year && record.year !== options.year) return false
      if (options.type && record.type !== options.type) return false
      if (options.tag && !record.tags.includes(options.tag)) return false
      return true
    })
  }

  return {
    allRecords,
    years,
    tags,
    latestYear,
    countByType,
    selectedTag,
    findRecord,
    filterRecords,
  }
})
