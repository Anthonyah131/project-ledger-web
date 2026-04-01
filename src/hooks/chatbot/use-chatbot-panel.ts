'use client'

import { useSyncExternalStore } from 'react'

type Listener = () => void

let isOpen = false
const listeners = new Set<Listener>()

function emitChange() {
  listeners.forEach((listener) => listener())
}

function subscribe(listener: Listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return isOpen
}

export function useChatbotPanel() {
  const open = useSyncExternalStore(subscribe, getSnapshot, () => false)

  const openPanel = () => {
    if (isOpen) return
    isOpen = true
    emitChange()
  }

  const closePanel = () => {
    if (!isOpen) return
    isOpen = false
    emitChange()
  }

  const togglePanel = () => {
    isOpen = !isOpen
    emitChange()
  }

  return {
    isOpen: open,
    openPanel,
    closePanel,
    togglePanel,
  }
}