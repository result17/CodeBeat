import { ref } from 'vue'
import { MessageResponseStatus } from '../shared'

export const isCommunicating = ref(false)
export const lastCommunicatingCostTime = ref(0)
export const messageStatus = ref<MessageResponseStatus>(MessageResponseStatus.NONE)
export const timeoutCount = ref(0)
