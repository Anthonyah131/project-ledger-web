'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import { useAuth } from '@/context/auth-context'
import { useLanguage } from '@/context/language-context'
import { streamChatbotMessage, type ChatHistoryEntry, type ChatbotStreamMeta } from '@/services/chatbot-service'

export const MAX_CHARS = 4000

export interface ChatbotMessage {
  id: string
  role: 'user' | 'bot'
  text: string
  toolCallsExecuted?: number
  usedFinancialContext?: boolean
}

export function useChatbot() {
  const { t } = useLanguage()
  const { isLoading, permissions } = useAuth()

  const isPremium = !isLoading && permissions?.canUseApi === true

  const [messages, setMessages] = useState<ChatbotMessage[]>([])
  const [history, setHistory] = useState<ChatHistoryEntry[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)

  const abortRef = useRef<AbortController | null>(null)

  const setClampedInput = useCallback((value: string) => {
    setInput(value.slice(0, MAX_CHARS))
  }, [])

  const sendMessage = useCallback(() => {
    const text = input.trim()
    if (!text || sending) return

    const userMsg: ChatbotMessage = { id: crypto.randomUUID(), role: 'user', text }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setSending(true)

    const botId = crypto.randomUUID()
    let accumulated = ''
    let hasStartedStreaming = false
    let metaInfo: Partial<Pick<ChatbotMessage, 'toolCallsExecuted' | 'usedFinancialContext'>> = {}

    const abort = new AbortController()
    abortRef.current = abort

    streamChatbotMessage(
      text,
      history,
      {
        onMeta: (meta: ChatbotStreamMeta) => {
          metaInfo = {
            toolCallsExecuted: meta.toolCallsExecuted,
            usedFinancialContext: meta.usedFinancialContext,
          }
        },
        onChunk: (chunk: string) => {
          accumulated += chunk
          if (!hasStartedStreaming) {
            hasStartedStreaming = true
            setIsStreaming(true)
          }
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === botId)
            if (!exists) {
              return [...prev, { id: botId, role: 'bot', text: accumulated, ...metaInfo }]
            }
            return prev.map((m) => m.id === botId ? { ...m, text: accumulated, ...metaInfo } : m)
          })
        },
        onError: (msg: string) => {
          let errorText: string
          if (msg === 'http_429') {
            errorText = t('chatbot.rateLimitMessage')
          } else if (msg === 'network' || msg.startsWith('http_')) {
            errorText = t('chatbot.errorMessage')
          } else {
            // SSE error event — backend always sends user-friendly content
            errorText = msg
          }
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === botId)
            if (exists) {
              return prev.map((m) => m.id === botId ? { ...m, text: errorText } : m)
            }
            return [...prev, { id: botId, role: 'bot', text: errorText }]
          })
          setIsStreaming(false)
        },
        onDone: () => {
          if (accumulated) {
            setMessages((prev) =>
              prev.map((m) => m.id === botId ? { ...m, ...metaInfo } : m)
            )
            setHistory((prev) => [
              ...prev,
              { role: 'user', content: text },
              { role: 'assistant', content: accumulated },
            ])
          }
          setIsStreaming(false)
          setSending(false)
          abortRef.current = null
        },
      },
      abort.signal,
    )
  }, [history, input, sending, t])

  const startNewConversation = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setIsStreaming(false)
    setSending(false)
    setMessages([])
    setHistory([])
    setInput('')
  }, [])

  const charsLeft = useMemo(() => MAX_CHARS - input.length, [input.length])

  return {
    isPremium,
    messages,
    input,
    sending,
    isStreaming,
    charsLeft,
    setClampedInput,
    sendMessage,
    startNewConversation,
  }
}
