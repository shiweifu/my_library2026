<script setup lang="ts">
const navigation = [
  { label: '首页', to: '/' },
  { label: '年度档案', to: '/archive' },
  { label: '书', to: '/type/book' },
  { label: '影', to: '/type/movie' },
  { label: '音', to: '/type/music' },
]
</script>

<template>
  <header class="border-b border-archive/15 bg-paper/95 px-5 backdrop-blur sm:px-8">
    <div class="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-6">
      <RouterLink to="/" class="font-serif text-lg font-semibold tracking-tight text-archive">
        书影音年鉴
      </RouterLink>
      <nav aria-label="主要导航" class="-mr-2 overflow-x-auto">
        <ul class="flex min-w-max items-center gap-1">
          <li v-for="item in navigation" :key="item.to">
            <RouterLink
              :to="item.to"
              class="nav-link block px-2 py-3 text-sm text-archive/70 sm:px-3"
              >{{ item.label }}</RouterLink
            >
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>
