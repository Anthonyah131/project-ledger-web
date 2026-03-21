'use client'

import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/context/auth-context'
import { getUserProfile } from '@/services/plan-service'
import { sendChatbotMessage } from '@/services/chatbot-service'
import { cn } from '@/lib/utils'
import { Bot, Send, X, Loader2, MessageSquare } from 'lucide-react'

// ─── Premium detection ────────────────────────────────────────────────────────

const PREMIUM_PLAN_ID = 'f59a2b7b-5edf-4e8b-9d99-d6adf8adf4ac'
const PREMIUM_SLUGS = ['premium', 'pro', 'enterprise']

function isPremiumPlan(planId?: string | null, planSlug?: string | null) {
  if (planId && planId === PREMIUM_PLAN_ID) return true
  if (planSlug && PREMIUM_SLUGS.includes(planSlug.toLowerCase())) return true
  return false
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string
  role: 'user' | 'bot'
  text: string
  provider?: string
  model?: string
}

const MAX_CHARS = 4000

// ─── Component ────────────────────────────────────────────────────────────────

export default function Chatbot() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [isPremium, setIsPremium] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // ── Check premium status ──────────────────────────────────────────────────
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

    return () => { cancelled = true }
  }, [isAuthenticated, user?.id, isLoading])

  // ── Auto-scroll to bottom on new messages ─────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  // ── Focus input when opened ───────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  if (!isPremium) return null

  // ── Send message ──────────────────────────────────────────────────────────
  async function handleSend() {
    const text = input.trim()
    if (!text || sending) return

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', text }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setSending(true)

    try {
      const data = await sendChatbotMessage(text)
      const botMsg: Message = {
        id: crypto.randomUUID(),
        role: 'bot',
        text: data.response,
        provider: data.provider,
        model: data.model,
      }
      setMessages((prev) => [...prev, botMsg])
    } catch (err: unknown) {
      const isServiceUnavailable =
        err instanceof Error && err.message.includes('503')
      const botMsg: Message = {
        id: crypto.randomUUID(),
        role: 'bot',
        text: isServiceUnavailable
          ? 'El asistente no está disponible en este momento. Inténtalo en unos minutos.'
          : 'Ocurrió un error al procesar tu mensaje. Por favor intenta de nuevo.',
      }
      setMessages((prev) => [...prev, botMsg])
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const charsLeft = MAX_CHARS - input.length

  return (
    <>
      {/* ── Chat window ───────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className={cn(
            'fixed bottom-24 right-6 z-50 flex flex-col',
            'w-[min(90vw,420px)] h-[560px]',
            'rounded-xl border border-border bg-background shadow-2xl',
            'animate-in slide-in-from-bottom-4 fade-in duration-200'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between rounded-t-xl bg-primary px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/20">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-primary-foreground">Aria</p>
                <p className="text-xs text-primary-foreground/70">Tu asistente de Project Ledger</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-md p-1 text-primary-foreground/70 hover:bg-primary-foreground/20 hover:text-primary-foreground transition-colors"
              aria-label="Cerrar chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Bot className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">¡Hola! Soy Aria</p>
                <p className="text-xs text-muted-foreground max-w-[240px]">
                  Tu asistente financiero. Pregúntame sobre tus proyectos, gastos o reportes.
                </p>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex flex-col gap-1',
                  msg.role === 'user' ? 'items-end' : 'items-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'rounded-tr-sm bg-primary text-primary-foreground'
                      : 'rounded-tl-sm bg-muted text-foreground'
                  )}
                >
                  {msg.text}
                </div>
                {msg.role === 'bot' && msg.provider && (
                  <p className="px-1 text-[10px] text-muted-foreground">
                    {msg.provider} · {msg.model}
                  </p>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {sending && (
              <div className="flex items-start">
                <div className="rounded-2xl rounded-tl-sm bg-muted px-3.5 py-2.5">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-border p-3">
            <div className="flex items-end gap-2">
              <div className="relative flex-1">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe tu mensaje..."
                  rows={1}
                  className={cn(
                    'w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm',
                    'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
                    'transition-colors min-h-[40px] max-h-[120px]'
                  )}
                  style={{ fieldSizing: 'content' } as React.CSSProperties}
                  disabled={sending}
                />
                {input.length > MAX_CHARS * 0.85 && (
                  <span
                    className={cn(
                      'absolute bottom-1 right-2 text-[10px]',
                      charsLeft < 100 ? 'text-destructive' : 'text-muted-foreground'
                    )}
                  >
                    {charsLeft}
                  </span>
                )}
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className={cn(
                  'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg',
                  'bg-primary text-primary-foreground transition-all',
                  'hover:bg-primary/90 active:scale-95',
                  'disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100'
                )}
                aria-label="Enviar mensaje"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Floating button ───────────────────────────────────────────────── */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'fixed bottom-6 right-6 z-50',
          'flex h-14 w-14 items-center justify-center rounded-full shadow-lg',
          'bg-primary text-primary-foreground transition-all duration-200',
          'hover:shadow-xl hover:scale-105 active:scale-95',
          'animate-in slide-in-from-bottom-4 fade-in duration-300'
        )}
        aria-label={isOpen ? 'Cerrar asistente' : 'Abrir asistente'}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageSquare className="h-6 w-6" />
        )}
      </button>
    </>
  )
}
