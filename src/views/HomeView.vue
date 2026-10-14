<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import RecordList from '@/components/RecordList.vue'
import { useArchiveStore } from '@/stores/archive'

const store = useArchiveStore()
const recentRecords = computed(() => store.allRecords.slice(0, 5))
const currentYearRecords = computed(() =>
  store.allRecords.filter((record) => record.year === store.latestYear),
)
</script>

<template>
  <div>
    <section class="overflow-hidden bg-archive px-5 text-paper sm:px-8">
      <div class="mx-auto grid min-h-[31rem] max-w-7xl items-stretch lg:grid-cols-[13rem_1fr]">
        <div
          class="relative flex items-end border-b border-paper/20 py-8 lg:border-b-0 lg:border-r lg:py-12"
        >
          <span
            class="font-serif text-[5.4rem] font-semibold leading-none tracking-[-0.08em] text-paper/95 sm:text-[7rem] lg:absolute lg:-left-2 lg:bottom-12 lg:[writing-mode:vertical-rl] lg:rotate-180"
          >
            {{ store.latestYear }}
          </span>
        </div>
        <div class="flex flex-col justify-between py-12 lg:px-16 lg:py-16 xl:px-24">
          <div class="max-w-3xl">
            <h1 class="font-serif text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
              我的书影音，<br />按生活发生的顺序。
            </h1>
            <p class="mt-7 max-w-xl text-base leading-8 text-paper/70 sm:text-lg">
              不是排行榜，也不是待办清单。这里只记录真正读完、看完和听过的作品，以及它们留下来的部分。
            </p>
          </div>
          <div
            class="mt-12 flex flex-wrap gap-x-8 gap-y-4 border-t border-paper/20 pt-6 text-sm text-paper/70"
          >
            <span>今年 {{ currentYearRecords.length }} 条记录</span>
            <span>{{ store.countByType.book }} 本书</span>
            <span>{{ store.countByType.movie }} 部电影</span>
            <span>{{ store.countByType.music }} 张专辑或单曲</span>
          </div>
        </div>
      </div>
    </section>

    <section class="px-5 py-14 sm:px-8 sm:py-20">
      <div class="mx-auto max-w-5xl">
        <div class="mb-7 flex items-end justify-between gap-4">
          <div>
            <p class="mb-2 text-sm text-archive/55">最近归档</p>
            <h2 class="font-serif text-3xl font-semibold text-archive sm:text-4xl">
              刚刚留下的痕迹
            </h2>
          </div>
          <RouterLink
            :to="{ name: 'archive', params: { year: store.latestYear } }"
            class="text-link shrink-0"
          >
            查看全年
          </RouterLink>
        </div>
        <RecordList :records="recentRecords" />
      </div>
    </section>
  </div>
</template>
