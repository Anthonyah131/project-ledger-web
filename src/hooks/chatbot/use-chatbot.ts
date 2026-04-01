'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/context/auth-context'
import { useLanguage } from '@/context/language-context'
import { getUserProfile } from '@/services/plan-service'
import { sendChatbotMessage, type ChatHistoryEntry } from '@/services/chatbot-service'

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

  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || sending) return

    const userMsg: ChatbotMessage = { id: crypto.randomUUID(), role: 'user', text }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setSending(true)

    try {
      const data = await sendChatbotMessage(text, history)
      const botMsg: ChatbotMessage = {
        id: crypto.randomUUID(),
        role: 'bot',
        text: data.response,
        provider: data.provider,
        model: data.model,
        toolCallsExecuted: data.toolCallsExecuted,
        usedFinancialContext: data.usedFinancialContext,
      }
      setMessages((prev) => [...prev, botMsg])
      setHistory((prev) => [
        ...prev,
        { role: 'user', content: text },
        { role: 'assistant', content: data.response },
      ])
    } catch (err: unknown) {
      const isServiceUnavailable =
        err instanceof Error && err.message.includes('503')
      const botMsg: ChatbotMessage = {
        id: crypto.randomUUID(),
        role: 'bot',
        text: isServiceUnavailable
          ? t('chatbot.unavailable')
          : t('chatbot.errorMessage'),
      }
      setMessages((prev) => [...prev, botMsg])
    } finally {
      setSending(false)
    }
  }, [history, input, sending, t])

  const startNewConversation = useCallback(() => {
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
    charsLeft,
    setClampedInput,
    sendMessage,
    startNewConversation,
  }
}