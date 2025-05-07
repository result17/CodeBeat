<script setup lang="ts">
import { ref } from 'vue'
import DaytimeRange from './components/daytimeRangeChart.vue'
import timeline from './mockData'

const messageRef = ref('')

window.addEventListener('message', (event) => {
  const message = event.data
  console.log(message)
})
</script>

<template>
  <h1 v-if="messageRef">
    {{ messageRef }}
  </h1>
  <DaytimeRange v-if="timeline" :data="timeline" />
</template>
