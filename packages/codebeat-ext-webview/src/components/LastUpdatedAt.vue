<script setup lang="ts">
import { computed } from 'vue'
import { formatDate, ICommand } from '../shared'
import { isCommunicating } from '../state'
import { postMsg } from '../util'
import IxUpdate from './lxUpdate.vue'

interface Props {
// timestamp of updateAt
  updateAt: number
}

const { updateAt } = defineProps<Props>()
const dateStr = computed(() => updateAt > 0 ? formatDate(new Date(updateAt)) : '')
</script>

<template>
  <div class="update-cmp">
    <IxUpdate
      :class="{ rotating: isCommunicating }"
      @click="() => {
        if (isCommunicating) return
        postMsg({
          command: ICommand.summary_today_query,
        })
      }"
    /><span>Last updated at {{ dateStr }}</span>
  </div>
</template>

<style scoped>
.update-cmp {
  display: flex;
  gap: 0.125rem;
  padding-block: 10px;
  justify-content: end;
}

.rotating {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
