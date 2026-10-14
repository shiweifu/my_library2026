<script setup lang="ts">
import { computed } from 'vue'
import FilterBar from '@/components/FilterBar.vue'
import RecordList from '@/components/RecordList.vue'
import { useArchiveStore } from '@/stores/archive'
import { mediaLabels, type MediaType } from '@/types/content'

const props = defineProps<{ type: string }>()
const store = useArchiveStore()
const validType = computed<MediaType | null>(() =>
  ['book', 'movie', 'music'].includes(props.type) ? (props.type as MediaType) : null,
)
const titles: Record<MediaType, string> = {
  book: '读过的书',
  movie: '看过的电影',
  music: '听过的音乐',
}
const descriptions: Record<MediaType, string> = {
  book: '被折过页、画过线，或在读完之后仍然继续生长的文字。',
  movie: '在银幕亮起到字幕结束之间，被保存下来的时刻。',
  music: '曾经反复播放，后来与某段生活互相指认的声音。',
}
const records = computed(() =>
  validType.value ? store.filterRecords({ type: validType.value, tag: store.selectedTag }) : [],
)
</script>

<template>
  <div class="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-20">
    <template v-if="validType">
      <header class="mb-10 max-w-2xl">
        <span
          class="inline-flex h-8 w-8 items-center justify-center border border-archive/30 font-serif text-archive"
        >
          {{ mediaLabels[validType] }}
        </span>
        <h1 class="mt-5 font-serif text-4xl font-semibold tracking-tight text-archive sm:text-6xl">
          {{ titles[validType] }}
        </h1>
        <p class="mt-5 font-serif text-base leading-8 text-archive/65 sm:text-lg">
          {{ descriptions[validType] }}
        </p>
      </header>
      <FilterBar
        :tags="store.tags"
        :selected-tag="store.selectedTag"
        @select="store.selectedTag = $event"
      />
      <div class="mt-8">
        <RecordList :records="records" />
      </div>
    </template>
    <div v-else class="py-24 text-center">
      <h1 class="font-serif text-3xl text-archive">没有这种档案类型</h1>
      <RouterLink to="/" class="text-link mt-5 inline-block">返回首页</RouterLink>
    </div>
  </div>
</template>
