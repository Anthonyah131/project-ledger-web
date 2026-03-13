'use client'

import { useEffect, useRef } from 'react'
import { useAuth } from '@/context/auth-context'
import type { UserProfileResponse } from '@/types/user'

const PREMIUM_SLUGS = ['premium', 'pro', 'enterprise']

export default function N8nChat() {
  const { user, isAuthenticated } = useAuth()
  const initializedRef = useRef(false)

  // The auth context stores the full UserProfileResponse shape at runtime
  const profile = user as unknown as UserProfileResponse
  const planSlug = profile?.plan?.slug?.toLowerCase() ?? ''
  const hasPlanSlug = planSlug.length > 0
  const isPremium = !hasPlanSlug || PREMIUM_SLUGS.includes(planSlug)

  useEffect(() => {
    if (initializedRef.current || !isAuthenticated || !user?.id || !isPremium) {
      return
    }

    initializedRef.current = true

    // Inject the stylesheet from public/ — avoids Turbopack CSS parser issue
    // with the :global() pseudo-class used by @n8n/chat's bundled CSS.
    if (!document.querySelector('link[data-n8n-chat]')) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = '/n8n-chat-widget.css'
      link.setAttribute('data-n8n-chat', 'true')
      document.head.appendChild(link)
    }

    import('@n8n/chat').then(({ createChat }) => {
      createChat({
        webhookUrl: process.env.NEXT_PUBLIC_N8N_CHAT_WEBHOOK_URL ?? '',
        mode: 'window',
        showWelcomeScreen: true,
        loadPreviousSession: true,
        metadata: {
          userId: user.id,
          userEmail: user.email,
          userName: user.fullName,
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
    })
  }, [isAuthenticated, user?.id, user?.email, user?.fullName, isPremium])

  return null
}
