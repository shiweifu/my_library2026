<script setup lang="ts">
defineProps<{ years: number[]; selected: number }>()
</script>

<template>
  <nav aria-label="按年份浏览" class="year-rail">
    <RouterLink
      v-for="year in years"
      :key="year"
      :to="{ name: 'archive', params: { year } }"
      class="year-link focus-ring"
      :class="{ 'year-link-active': year === selected }"
      :aria-current="year === selected ? 'page' : undefined"
    >
      <span>{{ year }}</span>
    </RouterLink>
  </nav>
</template>
