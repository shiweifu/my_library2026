<script setup lang="ts">
defineProps<{ myRating?: number; doubanRating?: number; compact?: boolean }>()
</script>

<template>
  <dl
    v-if="myRating !== undefined || doubanRating !== undefined"
    class="flex flex-wrap gap-x-5 gap-y-2"
  >
    <div v-if="myRating !== undefined" class="flex items-baseline gap-1">
      <dt class="text-xs text-archive/55">我的评分</dt>
      <dd class="font-serif font-semibold text-stamp" :class="compact ? 'text-base' : 'text-2xl'">
        {{ myRating }}<span class="text-xs font-normal"> / 5</span>
      </dd>
    </div>
    <div v-if="doubanRating !== undefined" class="flex items-baseline gap-1">
      <dt class="text-xs text-archive/55">豆瓣</dt>
      <dd class="font-serif font-semibold text-archive" :class="compact ? 'text-base' : 'text-2xl'">
        {{ doubanRating }}<span class="text-xs font-normal"> / 10</span>
      </dd>
    </div>
  </dl>
</template>
