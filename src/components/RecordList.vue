<script setup lang="ts">
import RecordRow from './RecordRow.vue'
import type { CulturalRecord } from '@/types/content'

defineProps<{ records: CulturalRecord[]; emptyMessage?: string }>()
</script>

<template>
  <div v-if="records.length" class="divide-y divide-archive/15">
    <RecordRow
      v-for="(record, index) in records"
      :key="record.id"
      :record="record"
      :eager="index < 2"
    />
  </div>
  <div v-else class="border-y border-archive/15 py-16 text-center">
    <p class="font-serif text-xl text-archive">{{ emptyMessage ?? '这一页还没有记录。' }}</p>
    <p class="mt-2 text-sm text-archive/55">下一次读完、看完或听完后，再回来写下一条。</p>
  </div>
</template>
