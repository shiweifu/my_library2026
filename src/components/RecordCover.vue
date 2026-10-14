<script setup lang="ts">
import { ref, watch } from 'vue'
import { BookOpenIcon, FilmIcon, MusicalNoteIcon } from '@heroicons/vue/24/outline'
import type { MediaType } from '@/types/content'

const props = defineProps<{ src?: string; alt: string; type: MediaType; eager?: boolean }>()
const failed = ref(false)
watch(
  () => props.src,
  () => {
    failed.value = false
  },
)
const icons = { book: BookOpenIcon, movie: FilmIcon, music: MusicalNoteIcon }
</script>

<template>
  <div class="cover-shell" :class="type === 'music' ? 'aspect-square' : 'aspect-[2/3]'">
    <img
      v-if="src && !failed"
      :src="src"
      :alt="alt"
      :loading="eager ? 'eager' : 'lazy'"
      class="h-full w-full object-cover"
      @error="failed = true"
    />
    <div
      v-else
      class="flex h-full min-h-44 flex-col items-center justify-center gap-3 bg-mist px-4 text-center text-archive/45"
    >
      <component :is="icons[type]" class="h-9 w-9" aria-hidden="true" />
      <span class="font-serif text-sm leading-relaxed">{{ alt }}</span>
    </div>
  </div>
</template>
