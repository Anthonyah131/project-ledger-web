'use client'

import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/context/auth-context'
import { getUserProfile } from '@/services/plan-service'

// The known Premium plan ID from the database
const PREMIUM_PLAN_ID = 'f59a2b7b-5edf-4e8b-9d99-d6adf8adf4ac'
const PREMIUM_SLUGS = ['premium', 'pro', 'enterprise']

function isPremiumPlan(planId?: string | null, planSlug?: string | null) {
  if (planId && planId === PREMIUM_PLAN_ID) return true
  if (planSlug && PREMIUM_SLUGS.includes(planSlug.toLowerCase())) return true
  return false
}

const HIDE_STYLE_ID = 'n8n-chat-force-hide'

/** Hides the n8n chat widget via CSS — works even after client-side navigation */
function hideChatWidget() {
  if (document.getElementById(HIDE_STYLE_ID)) return
  const style = document.createElement('style')
  style.id = HIDE_STYLE_ID
  style.textContent = '.n8n-chat { display: none !important; visibility: hidden !important; }'
  document.head.appendChild(style)
}

/** Removes the CSS override so the widget becomes visible again */
function showChatWidget() {
  document.getElementById(HIDE_STYLE_ID)?.remove()
}

export default function N8nChat() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [isPremium, setIsPremium] = useState(false)
  const initializedRef = useRef(false)

  // ── Step 1: When authenticated, fetch the profile to get the current plan ────
  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated || !user?.id) {
      // User is not authenticated — hide widget (CSS override, safe for SPA navigation)
      hideChatWidget()
      setIsPremium(false)
      return
    }

    let cancelled = false
    getUserProfile()
      .then((profile) => {
        if (cancelled) return
        const ok = isPremiumPlan(profile.planId, profile.plan?.slug)
        setIsPremium(ok)
      })
      .catch(() => {
        if (!cancelled) setIsPremium(false)
      })

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, user?.id, isLoading])

  // ── Step 2: Initialize the widget once we know the user is Premium ──────────
  useEffect(() => {
    if (!isPremium || !user?.id) return

    // Remove any "force-hide" CSS that was applied during logout
    showChatWidget()

    if (initializedRef.current) return
    initializedRef.current = true

    // Inject the stylesheet (avoids Turbopack CSS parser issue with :global())
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
  }, [isPremium, user?.id, user?.email, user?.fullName])

  return null
}
