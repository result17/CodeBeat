<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { formatDate, ICommand, MessageResponseStatus } from '../shared'
import { isCommunicating, lastCommunicatingCostTime, messageStatus } from '../state'
import { postMsg } from '../util'
import IxUpdate from './lxUpdate.vue'

interface Props {
// timestamp of updateAt
  updateAt: number
}

const { updateAt } = defineProps<Props>()
const isRotating = ref(false)
let timeoutId: ReturnType<typeof setTimeout> | null = null

watchEffect(() => {
  if (isCommunicating.value) {
    isRotating.value = true
  }
  else {
    if (timeoutId) {
      window.clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      isRotating.value = false
    }, Math.max(1000, lastCommunicatingCostTime.value))
  }
})

const dateStr = computed(() => updateAt > 0 ? formatDate(new Date(updateAt)) : '')
</script>

<template>
  <div class="update-cmp">
    <IxUpdate
      class="down"
      :is-rotating="isRotating"
      @click="() => {
        if (isCommunicating) return
        postMsg({
          command: ICommand.summary_today_query,
        })
      }"
    /><span>Last updated at {{ dateStr }}</span>
  </div>
  <div v-show="messageStatus === MessageResponseStatus.SUCCESS" class="update-cmp">
    <span>costed {{ (lastCommunicatingCostTime / 1000).toFixed(3) }} sec(s)</span>
  </div>
  <div v-show="messageStatus === MessageResponseStatus.TIMEOUT" class="update-cmp">
    <span class="timeout">Time out</span>
  </div>
</template>

<style scoped>
.update-cmp {
  display: flex;
  gap: 0.125rem;
  justify-content: end;
}

.down {
  transform: translateY(1px);
}

.timeout {
  color: var(--vscode-errorForeground);
}
</style>
