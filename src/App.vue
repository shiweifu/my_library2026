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
        <p>
          条目资料可来自
          <a class="text-link" href="https://www.douban.com" target="_blank" rel="noreferrer"
            >豆瓣</a
          >
          与
          <a class="text-link" href="https://openlibrary.org" target="_blank" rel="noreferrer"
            >Open Library</a
          >
        </p>
      </div>
    </footer>
  </div>
</template>
