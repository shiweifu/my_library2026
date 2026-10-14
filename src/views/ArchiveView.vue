<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FilterBar from '@/components/FilterBar.vue'
import RecordList from '@/components/RecordList.vue'
import YearRail from '@/components/YearRail.vue'
import { useArchiveStore } from '@/stores/archive'

const route = useRoute()
const router = useRouter()
const store = useArchiveStore()
const selectedYear = computed(() => {
  const year = Number(route.params.year)
  return store.years.includes(year) ? year : store.latestYear
})
const records = computed(() =>
  store.filterRecords({ year: selectedYear.value, tag: store.selectedTag }),
)
const months = computed(() =>
  [...new Set(records.value.map((record) => record.month))].sort((a, b) => b - a),
)
const monthLabels = [
  '一月',
  '二月',
  '三月',
  '四月',
  '五月',
  '六月',
  '七月',
  '八月',
  '九月',
  '十月',
  '十一月',
  '十二月',
]

watchEffect(() => {
  if (route.params.year && !store.years.includes(Number(route.params.year))) {
    void router.replace({ name: 'archive', params: { year: store.latestYear } })
  }
})
</script>

<template>
  <div
    class="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[11rem_1fr] lg:gap-14 lg:py-16"
  >
    <aside>
      <YearRail :years="store.years" :selected="selectedYear" />
    </aside>
    <section class="min-w-0">
      <header class="mb-8">
        <p class="text-sm text-archive/55">年度档案</p>
        <div class="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h1 class="font-serif text-5xl font-semibold tracking-tight text-archive sm:text-7xl">
            {{ selectedYear }}
          </h1>
          <p class="pb-2 text-sm text-archive/60">共 {{ records.length }} 条记录</p>
        </div>
      </header>
      <FilterBar
        :tags="store.tags"
        :selected-tag="store.selectedTag"
        @select="store.selectedTag = $event"
      />

      <div v-if="months.length" class="mt-12 space-y-16">
        <section v-for="month in months" :key="month" :aria-labelledby="`month-${month}`">
          <h2 :id="`month-${month}`" class="mb-4 font-serif text-xl font-semibold text-archive">
            {{ monthLabels[month - 1] }}
          </h2>
          <RecordList :records="records.filter((record) => record.month === month)" />
        </section>
      </div>
      <RecordList
        v-else
        class="mt-10"
        :records="[]"
        empty-message="这一年还没有符合筛选条件的记录。"
      />
    </section>
  </div>
</template>
