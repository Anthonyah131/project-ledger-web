import { useEffect, useRef, useCallback, useState } from 'react'
import { useAuth } from '@/context/auth-context'

interface UseN8nChatOptions {
  enabled?: boolean
  metadata?: Record<string, unknown>
}

/**
 * Hook para inicializar y controlar el widget de chat N8N
 *
 * @param options - Opciones de configuración
 * @returns Objeto con métodos para controlar el chat
 *
 * @example
 * ```tsx
 * const { isInitialized } = useN8nChat({
 *   enabled: true,
 *   metadata: { department: 'support' }
 * })
 * ```
 */
export function useN8nChat(options: UseN8nChatOptions = {}) {
  const { enabled = true, metadata: customMetadata } = options
  const { user, isAuthenticated } = useAuth()
  const scriptLoadedRef = useRef(false)
  const [isInitialized, setIsInitialized] = useState(false)

  const ensureWidgetStylesheet = useCallback(() => {
    if (typeof document === 'undefined') {
      return
    }

    if (!document.querySelector('link[data-n8n-chat]')) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = '/n8n-chat-widget.css'
      link.setAttribute('data-n8n-chat', 'true')
      document.head.appendChild(link)
    }
  }, [])

  useEffect(() => {
    if (!enabled || scriptLoadedRef.current || !isAuthenticated || !user?.id) {
      return
    }

    scriptLoadedRef.current = true

    ensureWidgetStylesheet()

    import('@n8n/chat')
      .then(({ createChat }) => {
        createChat({
          webhookUrl: process.env.NEXT_PUBLIC_N8N_CHAT_WEBHOOK_URL ?? '',
          mode: 'window',
          showWelcomeScreen: true,
          loadPreviousSession: true,
          metadata: {
            userId: user?.id,
            userEmail: user?.email,
            userName: user?.fullName,
            ...customMetadata,
          },
          i18n: {
            en: {
              title: 'Aria',
              subtitle: 'Tu asistente de Project Ledger',
              footer: '',
              getStarted: 'Iniciar conversación',
              inputPlaceholder: 'Escribe tu mensaje...',
              closeButtonTooltip: 'Cerrar chat',
            },
          },
        })

        setIsInitialized(true)
      })
      .catch(() => {
        scriptLoadedRef.current = false
      })

    return () => {
      scriptLoadedRef.current = false
    }
  }, [enabled, isAuthenticated, user?.id, user?.email, user?.fullName, customMetadata, ensureWidgetStylesheet])

  const close = useCallback(() => {
    if (window.n8nChat?.close) {
      window.n8nChat.close()
    }
  }, [])

  const open = useCallback(() => {
    if (window.n8nChat?.open) {
      window.n8nChat.open()
    }
  }, [])

  return {
    isInitialized,
    close,
    open,
  }
}
