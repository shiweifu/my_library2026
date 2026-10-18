<script setup lang="ts">
import RecordCover from './RecordCover.vue'
import { creatorsOf, mediaLabels, type CulturalRecord } from '@/types/content'

defineProps<{ record: CulturalRecord; eager?: boolean }>()

function editionLine(record: CulturalRecord): string {
  if (record.type === 'book') {
    return [record.publisher, record.publishedYear].filter(Boolean).join('，')
  }
  return record.releaseYear ? `${record.releaseYear} 年` : ''
}
</script>

<template>
  <article class="library-card">
    <RouterLink
      :to="{ name: 'record', params: { id: record.id } }"
      class="focus-ring block self-start"
      :aria-label="`查看《${record.title}》详情`"
    >
      <RecordCover
        :src="record.cover"
        :alt="`${record.title}封面`"
        :type="record.type"
        :eager="eager"
      />
    </RouterLink>

    <div class="flex min-w-0 flex-col">
      <h3 class="font-serif text-lg font-semibold leading-snug text-archive">
        <RouterLink
          :to="{ name: 'record', params: { id: record.id } }"
          class="title-link focus-ring"
        >
          {{ record.title }}
        </RouterLink>
      </h3>

      <div class="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
        <span v-if="record.doubanRating !== undefined" class="rating-chip">
          豆瓣 {{ record.doubanRating }}
        </span>
        <span class="meta-chip">{{ record.year }}</span>
        <span class="meta-chip">{{ mediaLabels[record.type] }}</span>
        <span v-for="tag in record.tags.slice(0, 2)" :key="tag" class="tag-chip">{{ tag }}</span>
      </div>

      <p class="mt-2 text-xs leading-5 text-archive/65">
        {{ creatorsOf(record).join('、')
        }}<template v-if="editionLine(record)">；{{ editionLine(record) }}</template>
      </p>
      <p
        v-if="record.description"
        class="library-description mt-1.5 text-sm leading-6 text-graphite/75"
      >
        {{ record.description }}
      </p>
      <p v-else class="mt-1.5 text-sm text-archive/40">暂无简介</p>

      <div class="mt-auto flex gap-2 border-t border-archive/10 pt-3 text-sm">
        <RouterLink
          :to="{ name: 'record', params: { id: record.id } }"
          class="card-action focus-ring"
        >
          查看详情
        </RouterLink>
        <a
          v-if="record.doubanUrl"
          :href="record.doubanUrl"
          target="_blank"
          rel="noreferrer"
          class="card-action focus-ring"
        >
          豆瓣条目
        </a>
      </div>
    </div>
  </article>
</template>
