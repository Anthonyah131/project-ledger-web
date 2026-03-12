'use client'

import { useN8nChat } from '@/hooks/use-n8n-chat'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'

/**
 * Ejemplo avanzado de uso del widget N8N
 * Incluye botones para controlar el chat programáticamente
 *
 * @example
 * Importar y usar:
 * import AdvancedN8nChat from '@/components/shared/advanced-n8n-chat'
 *
 * <AdvancedN8nChat />
 */
export default function AdvancedN8nChat() {
  const { isAuthenticated, user } = useAuth()

  const { isInitialized, close, open } = useN8nChat({
    enabled: !!isAuthenticated && !!user?.id,
    metadata: {
      // Personaliza los metadatos según tus necesidades
      source: 'dashboard',
      timestamp: new Date().toISOString(),
    },
  })

  if (!isAuthenticated || !user?.id) {
    return null
  }

  return (
    <div className="fixed bottom-24 right-6 flex gap-2">
      {/* Opcional: Botones personalizados para controlar el chat */}
      <Button
        onClick={open}
        size="sm"
        variant="outline"
        className="gap-2"
        title="Abrir chat"
      >
        <MessageCircle className="h-4 w-4" />
        Chat
      </Button>

      {isInitialized && (
        <Button
          onClick={close}
          size="sm"
          variant="ghost"
          title="Cerrar chat"
        >
          Cerrar
        </Button>
      )}
    </div>
  )
}
