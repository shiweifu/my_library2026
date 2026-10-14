<script setup lang="ts">
import SiteHeader from '@/components/SiteHeader.vue'
</script>

<template>
  <div class="min-h-screen bg-paper text-graphite">
    <SiteHeader />
    <main id="main-content">
      <RouterView />
    </main>
    <footer class="border-t border-archive/15 px-5 py-8 sm:px-8">
      <div
        class="mx-auto flex max-w-7xl flex-col gap-2 text-sm text-archive/65 sm:flex-row sm:items-center sm:justify-between"
      >
        <p>把看过的世界，按年份归档。</p>
        <a class="text-link" href="https://openlibrary.org" target="_blank" rel="noreferrer"
          >部分书籍资料来自 Open Library</a
        >
      </div>
    </footer>
  </div>
</template>
