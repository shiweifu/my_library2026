<script setup lang="ts">
import RecordCover from './RecordCover.vue'
import RatingPair from './RatingPair.vue'
import { creatorsOf, mediaLabels, type CulturalRecord } from '@/types/content'

defineProps<{ record: CulturalRecord; eager?: boolean }>()
</script>

<template>
  <article class="record-row group">
    <RouterLink
      :to="{ name: 'record', params: { id: record.id } }"
      class="record-cover-link focus-ring"
      :aria-label="`查看《${record.title}》`"
    >
      <RecordCover
        :src="record.cover"
        :alt="`${record.title}封面`"
        :type="record.type"
        :eager="eager"
      />
    </RouterLink>
    <div class="min-w-0 py-1 sm:py-3">
      <div class="mb-3 flex items-center gap-3 text-xs text-archive/55">
        <span class="border border-archive/25 px-1.5 py-0.5">{{ mediaLabels[record.type] }}</span>
        <time :datetime="record.completedAt">{{ record.completedAt }}</time>
      </div>
      <h3 class="font-serif text-xl font-semibold leading-snug text-archive sm:text-2xl">
        <RouterLink
          :to="{ name: 'record', params: { id: record.id } }"
          class="title-link focus-ring"
          >{{ record.title }}</RouterLink
        >
      </h3>
      <p class="mt-2 text-sm text-archive/65">{{ creatorsOf(record).join('、') }}</p>
      <p
        v-if="record.summary"
        class="mt-4 max-w-2xl font-serif text-sm leading-7 text-graphite/75 sm:text-base"
      >
        {{ record.summary }}<span v-if="record.body.length > record.summary.length">…</span>
      </p>
      <div class="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
        <RatingPair :my-rating="record.myRating" :douban-rating="record.doubanRating" compact />
        <ul v-if="record.tags.length" class="flex flex-wrap gap-2" aria-label="标签">
          <li v-for="tag in record.tags" :key="tag" class="text-xs text-archive/50">#{{ tag }}</li>
        </ul>
      </div>
    </div>
  </article>
</template>
