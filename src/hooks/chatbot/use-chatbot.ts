'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@/context/auth-context'
import { useLanguage } from '@/context/language-context'
import { getUserProfile } from '@/services/plan-service'
import { streamChatbotMessage, type ChatHistoryEntry, type ChatbotStreamMeta } from '@/services/chatbot-service'

const PREMIUM_PLAN_ID = 'f59a2b7b-5edf-4e8b-9d99-d6adf8adf4ac'
const PREMIUM_SLUGS = ['premium', 'pro', 'enterprise']

export const MAX_CHARS = 4000

export interface ChatbotMessage {
  id: string
  role: 'user' | 'bot'
  text: string
  provider?: string
  model?: string
  toolCallsExecuted?: number
  usedFinancialContext?: boolean
}

function isPremiumPlan(planId?: string | null, planSlug?: string | null) {
  if (planId && planId === PREMIUM_PLAN_ID) return true
  if (planSlug && PREMIUM_SLUGS.includes(planSlug.toLowerCase())) return true
  return false
}

export function useChatbot() {
  const { t } = useLanguage()
  const { user, isAuthenticated, isLoading } = useAuth()

  const [isPremium, setIsPremium] = useState(false)
  const [messages, setMessages] = useState<ChatbotMessage[]>([])
  const [history, setHistory] = useState<ChatHistoryEntry[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)

  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated || !user?.id) {
      setIsPremium(false)
      return
    }

    let cancelled = false
    getUserProfile()
      .then((profile) => {
        if (cancelled) return
        setIsPremium(isPremiumPlan(profile.planId, profile.plan?.slug))
      })
      .catch(() => {
        if (!cancelled) setIsPremium(false)
      })

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, user?.id, isLoading])

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
    let metaInfo: Partial<Pick<ChatbotMessage, 'provider' | 'model' | 'toolCallsExecuted' | 'usedFinancialContext'>> = {}

    const abort = new AbortController()
    abortRef.current = abort

    streamChatbotMessage(
      text,
      history,
      {
        onMeta: (meta: ChatbotStreamMeta) => {
          metaInfo = {
            provider: meta.provider,
            model: meta.model,
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
          const isUnavailable = msg === 'ChatbotNoProvidersEnabled' || msg.includes('http_503') || msg.includes('503')
          const errorText = isUnavailable ? t('chatbot.unavailable') : t('chatbot.errorMessage')
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
