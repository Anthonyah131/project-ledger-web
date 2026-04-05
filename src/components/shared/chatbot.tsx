'use client'

import { useEffect, useRef } from 'react'
import { useLanguage } from '@/context/language-context'
import { MAX_CHARS, useChatbot } from '@/hooks/chatbot/use-chatbot'
import { useChatbotPanel } from '@/hooks/chatbot/use-chatbot-panel'
import { cn } from '@/lib/utils'
import { Bot, Send, X, Loader2, RotateCcw } from 'lucide-react'

// ─── Component ────────────────────────────────────────────────────────────────

export default function Chatbot() {
  const { t } = useLanguage()
  const {
    isPremium,
    messages,
    input,
    sending,
    isStreaming,
    charsLeft,
    setClampedInput,
    sendMessage,
    startNewConversation,
  } = useChatbot()
  const { isOpen, closePanel } = useChatbotPanel()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

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

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* ── Chat window ───────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className={cn(
            'fixed inset-x-3 bottom-3 top-20 z-50 flex flex-col',
            'sm:inset-x-auto sm:right-6 sm:top-auto sm:bottom-6',
            'sm:w-[min(92vw,420px)]',
            'h-[calc(100dvh-6rem)] sm:h-[min(78vh,760px)]',
            'rounded-xl border border-border bg-card shadow-2xl',
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
                <p className="text-sm font-semibold text-primary-foreground">{t('chatbot.title')}</p>
                <p className="text-xs text-primary-foreground/70">{t('chatbot.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  onClick={startNewConversation}
                  className="rounded-md p-1 text-primary-foreground/70 hover:bg-primary-foreground/20 hover:text-primary-foreground transition-colors"
                  aria-label={t('chatbot.newConversation')}
                  title={t('chatbot.newConversation')}
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={closePanel}
                className="rounded-md p-1 text-primary-foreground/70 hover:bg-primary-foreground/20 hover:text-primary-foreground transition-colors"
                aria-label={t('chatbot.closeChat')}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="flex flex-col gap-1 items-start">
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-muted px-3.5 py-2.5 text-sm leading-relaxed text-foreground flex flex-col gap-2">
                  <p className="font-medium">{t('chatbot.greeting')} 👋</p>
                  <p>{t('chatbot.welcomeBody')}</p>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-muted-foreground">{t('chatbot.welcomeExamplesLabel')}</p>
                    <ul className="flex flex-col gap-1">
                      <li className="text-xs bg-background rounded-lg px-2.5 py-1.5 border border-border">
                        &ldquo;{t('chatbot.welcomeExample1')}&rdquo;
                      </li>
                      <li className="text-xs bg-background rounded-lg px-2.5 py-1.5 border border-border">
                        &ldquo;{t('chatbot.welcomeExample2')}&rdquo;
                      </li>
                    </ul>
                  </div>
                </div>
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
                  <div className="flex flex-col gap-0.5 px-1">
                    {(msg.toolCallsExecuted ?? 0) > 0 && (
                      <p className="text-[10px] font-medium text-primary">
                        ⚡ {t('chatbot.realTimeData')}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground">
                      {msg.provider} · {msg.model}
                    </p>
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator — only while waiting for the first token */}
            {sending && !isStreaming && (
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
                  onChange={(e) => setClampedInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('chatbot.inputPlaceholder')}
                  rows={1}
                  className={cn(
                    'w-full resize-none rounded-lg border border-border bg-muted px-3 py-2.5 text-sm',
                    'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
                    'transition-colors min-h-10 max-h-30'
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
                onClick={sendMessage}
                disabled={!input.trim() || sending}
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                  'bg-primary text-primary-foreground transition-all',
                  'hover:bg-primary/90 active:scale-95',
                  'disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100'
                )}
                aria-label={t('chatbot.send')}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  )
}
