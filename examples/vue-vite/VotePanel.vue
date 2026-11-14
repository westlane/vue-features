<script setup lang="ts">
import { ref } from 'vue'

const votes = ref(0)
</script>

<template>
  <div class="flex items-center justify-between gap-4">
    <p class="text-4xl font-semibold tabular-nums text-gray-900">{{ votes }}</p>
    <button
      type="button"
      class="rounded-md bg-gray-900 px-3 py-2 text-lg leading-none text-white hover:bg-gray-700"
      aria-label="Thumbs up"
      @click="votes += 1"
    >
      👍
    </button>
  </div>
</template>
