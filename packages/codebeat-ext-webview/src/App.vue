<script setup lang="ts">
import DaytimeRange from './components/daytimeRange.vue';
import timeline from './mockData';
</script>

<template>
  <h1>webview</h1>
  <DaytimeRange v-if="timeline" :data="timeline" />
</template>
