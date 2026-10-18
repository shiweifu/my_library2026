<script setup lang="ts">
import { computed } from 'vue'
import LibraryCard from '@/components/LibraryCard.vue'
import { useArchiveStore } from '@/stores/archive'
import { groupRecordsByYear } from '@/utils/records'

const store = useArchiveStore()
const recordGroups = computed(() => [...groupRecordsByYear(store.allRecords).entries()])
</script>

<template>
  <div class="mx-auto max-w-[92rem] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
    <header
      class="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-archive/15 pb-6"
    >
      <div>
        <h1 class="font-serif text-3xl font-semibold text-archive sm:text-4xl">我的书影音档案</h1>
        <p class="mt-2 text-sm leading-6 text-archive/55">按读完、看完或听完的年份归档。</p>
      </div>
      <p class="text-sm text-archive/60">
        共 {{ store.allRecords.length }} 条：{{ store.countByType.book }} 本书，{{
          store.countByType.movie
        }}
        部电影，{{ store.countByType.music }} 张专辑或单曲
      </p>
    </header>

    <div v-if="recordGroups.length" class="space-y-12">
      <section v-for="([year, records], groupIndex) in recordGroups" :key="year">
        <header class="mb-3 flex items-end justify-between border-b border-archive/15 pb-2">
          <h2 class="font-serif text-2xl font-semibold text-archive">{{ year }}</h2>
          <span class="text-sm text-archive/55">{{ records.length }} 条</span>
        </header>
        <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <LibraryCard
            v-for="(record, index) in records"
            :key="record.id"
            :record="record"
            :eager="groupIndex === 0 && index < 3"
          />
        </div>
      </section>
    </div>

    <div v-else class="border-y border-archive/15 py-20 text-center">
      <p class="font-serif text-2xl text-archive">还没有归档条目。</p>
      <p class="mt-2 text-sm text-archive/55">添加第一条书影音记录后，它会出现在这里。</p>
    </div>
  </div>
</template>
