<script setup lang="ts">
import { ref } from 'vue'
import { createEntitledFeature } from '../../src'
import VotePanel from './VotePanel.vue'

const Vote = createEntitledFeature({
  name: 'Vote',
  loader: async () => VotePanel,
})

const entitled = ref(true)
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 text-gray-900">
    <div class="w-full max-w-sm overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <header class="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <span class="text-sm font-medium">Voting Feature Demo</span>
        <label class="inline-flex cursor-pointer items-center">
          <span class="relative inline-flex h-6 w-11 shrink-0 items-center">
            <input v-model="entitled" type="checkbox" class="peer sr-only" />
            <span
              class="absolute inset-0 rounded-full bg-gray-200 transition peer-checked:bg-gray-900 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gray-900"
            />
            <span
              class="absolute left-0.5 size-5 rounded-full bg-white shadow transition peer-checked:translate-x-5"
            />
          </span>
        </label>
      </header>

      <div class="p-6">
        <Vote :entitled="entitled" />
      </div>

      <footer class="border-t border-gray-200 px-6 py-4">
        <p class="text-sm text-gray-500">
          {{ entitled ? 'This feature is entitled.' : 'This feature is now unmounted.' }}
        </p>
      </footer>
    </div>
  </div>
</template>
