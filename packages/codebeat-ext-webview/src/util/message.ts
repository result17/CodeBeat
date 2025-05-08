import type { IMessage } from '../shared'
import { watch } from 'vue'
import { isCommunicating } from '../state'

let lastCommunicationTime: number | undefined

watch([isCommunicating], () => {
  if (isCommunicating.value) {
    lastCommunicationTime = Date.now()
  }
  else if (lastCommunicationTime) {
    console.log(`Communication spent ${(Date.now() - lastCommunicationTime) / 1000} sec(s)`)
  }
})

// Constants should be in uppercase with underscores by convention
const MESSAGE_TIMEOUT_MS = 10 * 1000

// Use null instead of 0 for timer initialization to be more explicit
let updateTimer: number | null = null

// Extract vscode API to a constant for better reusability and mocking
const vscodeApi = window.acquireVsCodeApi()

/**
 * Posts a message to the VS Code extension host and manages the updating state.
 * Automatically clears the updating state after a timeout if no new messages arrive.
 *
 * @template T - The type of the message payload
 * @param {IMessage<T>} message - The message to post to the extension host
 * @throws {Error} If the message is invalid or posting fails
 */
export function postMsg<T>(message: IMessage<T>): void {
  // Input validation
  if (!message || typeof message !== 'object') {
    throw new Error('Invalid message: must be an object')
  }

  try {
    // Post the message
    vscodeApi.postMessage(message)

    // Update state and manage timer
    isCommunicating.value = true
    clearExistingTimer()

    updateTimer = window.setTimeout(() => {
      isCommunicating.value = false
      updateTimer = null // Clear timer reference after execution
    }, MESSAGE_TIMEOUT_MS)
  }
  catch (error) {
    // Ensure state is cleaned up on error
    isCommunicating.value = false
    clearExistingTimer()
    throw new Error(`Failed to post message: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Clears the existing timer if one is active
 */
function clearExistingTimer(): void {
  if (updateTimer !== null) {
    window.clearTimeout(updateTimer)
    updateTimer = null
  }
}

type OnMessage<T> = (event: MessageEvent<IMessage<T>>) => void

export const messageListeners: Set<OnMessage<any>> = new Set()

/**
 * Adds a message event listener if not already registered
 * @template T - Type of the message payload
 * @param listener - Callback function to handle messages
 * @throws {Error} If listener is not a function
 */
export function addMessageListener<T>(listener: OnMessage<T>) {
  if (typeof listener !== 'function') {
    throw new TypeError('Listener must be a function')
  }
  const wrappedListener = (e: Parameters<OnMessage<T>>[0]) => {
    isCommunicating.value = false
    listener(e)
  }
  if (!messageListeners.has(wrappedListener)) {
    try {
      window.addEventListener('message', wrappedListener)
      messageListeners.add(listener)
    }
    catch (error) {
      console.error('Failed to add message listener:', error)
      throw error
    }
  }
}

/**
 * Removes a message event listener
 * @template T - Type of the message payload
 * @param listener - Callback function to remove
 */
function removeMessageListener<T>(listener: OnMessage<T>) {
  if (messageListeners.has(listener)) {
    try {
      window.removeEventListener('message', listener)
      messageListeners.delete(listener)
    }
    catch (error) {
      console.error('Failed to remove message listener:', error)
    }
  }
}

export function removeAllMessageListeners(): void {
  for (const listener of messageListeners) {
    removeMessageListener(listener)
  }
  messageListeners.clear()
}
