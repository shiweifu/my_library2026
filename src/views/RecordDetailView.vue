<script setup lang="ts">
import { computed } from 'vue'
import RecordCover from '@/components/RecordCover.vue'
import RatingPair from '@/components/RatingPair.vue'
import { useArchiveStore } from '@/stores/archive'
import { creatorsOf, mediaLabels } from '@/types/content'

const props = defineProps<{ id: string }>()
const store = useArchiveStore()
const record = computed(() => store.findRecord(props.id))
</script>

<template>
  <div v-if="record" class="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-16">
    <RouterLink :to="{ name: 'archive', params: { year: record.year } }" class="text-link">
      返回 {{ record.year }} 年档案
    </RouterLink>

    <article class="mt-8 grid gap-10 lg:grid-cols-[18rem_1fr] lg:gap-20">
      <aside>
        <RecordCover :src="record.cover" :alt="`${record.title}封面`" :type="record.type" eager />
        <dl class="mt-6 space-y-3 border-t border-archive/20 pt-5 text-sm">
          <div class="flex justify-between gap-4">
            <dt class="text-archive/50">归档日期</dt>
            <dd>
              <time :datetime="record.completedAt">{{ record.completedAt }}</time>
            </dd>
          </div>
          <div v-if="record.type === 'book'" class="flex justify-between gap-4">
            <dt class="text-archive/50">ISBN</dt>
            <dd class="text-right">{{ record.isbn }}</dd>
          </div>
          <div v-if="record.type === 'book' && record.publisher" class="flex justify-between gap-4">
            <dt class="text-archive/50">出版社</dt>
            <dd class="text-right">{{ record.publisher }}</dd>
          </div>
          <div
            v-if="record.type !== 'book' && record.releaseYear"
            class="flex justify-between gap-4"
          >
            <dt class="text-archive/50">发行年份</dt>
            <dd>{{ record.releaseYear }}</dd>
          </div>
        </dl>
      </aside>

      <div class="min-w-0">
        <div class="flex items-center gap-3 text-sm text-archive/55">
          <span class="border border-archive/25 px-2 py-1">{{ mediaLabels[record.type] }}</span>
          <span>{{ creatorsOf(record).join('、') }}</span>
        </div>
        <h1
          class="mt-5 max-w-3xl font-serif text-4xl font-semibold leading-tight tracking-tight text-archive sm:text-6xl"
        >
          {{ record.title }}
        </h1>
        <div class="mt-8 border-y border-archive/15 py-5">
          <RatingPair :my-rating="record.myRating" :douban-rating="record.doubanRating" />
          <p v-if="record.doubanRatingAsOf" class="mt-2 text-xs text-archive/45">
            豆瓣评分记录于 {{ record.doubanRatingAsOf }}
          </p>
        </div>

        <div v-if="record.body" class="prose-archive mt-10" v-html="record.bodyHtml" />

        <div class="mt-12 flex flex-wrap gap-2">
          <RouterLink
            v-for="tag in record.tags"
            :key="tag"
            :to="{ name: 'archive', params: { year: record.year } }"
            class="border border-archive/20 px-3 py-1.5 text-sm text-archive/60 hover:border-archive/50"
            >#{{ tag }}</RouterLink
          >
        </div>
        <div
          v-if="record.doubanUrl || record.sourceUrl"
          class="mt-8 flex flex-wrap gap-5 border-t border-archive/15 pt-5 text-sm"
        >
          <a
            v-if="record.doubanUrl"
            :href="record.doubanUrl"
            target="_blank"
            rel="noreferrer"
            class="text-link"
            >查看豆瓣条目</a
          >
          <a
            v-if="record.sourceUrl"
            :href="record.sourceUrl"
            target="_blank"
            rel="noreferrer"
            class="text-link"
            >查看资料来源</a
          >
        </div>
      </div>
    </article>
  </div>
  <div v-else class="mx-auto max-w-3xl px-5 py-28 text-center">
    <h1 class="font-serif text-3xl text-archive">没有找到这条记录</h1>
    <RouterLink to="/" class="text-link mt-5 inline-block">返回首页</RouterLink>
  </div>
</template>
