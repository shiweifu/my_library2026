<script setup lang="ts">
defineProps<{ tags: string[]; selectedTag: string | null }>()
defineEmits<{ select: [tag: string | null] }>()
</script>

<template>
  <div
    class="flex items-center gap-2 overflow-x-auto border-y border-archive/15 py-3"
    aria-label="标签筛选"
  >
    <button
      class="filter-button"
      :class="{ 'filter-button-active': selectedTag === null }"
      @click="$emit('select', null)"
    >
      全部
    </button>
    <button
      v-for="tag in tags"
      :key="tag"
      class="filter-button"
      :class="{ 'filter-button-active': selectedTag === tag }"
      @click="$emit('select', tag)"
    >
      {{ tag }}
    </button>
  </div>
</template>
