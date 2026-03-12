'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/auth-context'

/**
 * Componente de debugging para verificar el estado del chat N8N
 * Muestra información en tiempo real sobre la inicialización
 * 
 * Usa en desarrollo para debugging, remover en producción
 */
export default function N8nChatDebug() {
  const { user, isAuthenticated } = useAuth()
  const [n8nLoaded, setN8nLoaded] = useState(false)
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    // Verificar cada 500ms si window.n8nChat existe
    const interval = setInterval(() => {
      if (window.n8nChat) {
        setN8nLoaded(true)
      }
    }, 500)

    return () => clearInterval(interval)
  }, [])

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="fixed bottom-2 left-2 z-[9999] px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-50 hover:opacity-100"
        title="Click para ver debug del chat N8N"
      >
        🔍 Debug
      </button>
    )
  }

  return (
    <div className="fixed bottom-2 left-2 z-[9999] w-80 bg-gray-900 text-white text-xs p-3 rounded border border-gray-700 font-mono max-h-64 overflow-y-auto">
      <button
        onClick={() => setShowDebug(false)}
        className="float-right text-gray-400 hover:text-white"
      >
        ✕
      </button>
      <div className="mb-2 font-bold">Debug N8N Chat</div>

      <div className="space-y-1">
        <div>
          Autenticado:{' '}
          <span className={isAuthenticated ? 'text-green-400' : 'text-red-400'}>
            {isAuthenticated ? '✓ Sí' : '✗ No'}
          </span>
        </div>

        <div>
          User ID:{' '}
          <span className={user?.id ? 'text-green-400' : 'text-red-400'}>
            {user?.id ? user.id : '✗ No disponible'}
          </span>
        </div>

        <div>
          Email:{' '}
          <span className={user?.email ? 'text-green-400' : 'text-yellow-400'}>
            {user?.email || '? No disponible'}
          </span>
        </div>

        <div>
          Nombre:{' '}
          <span className={user?.fullName ? 'text-green-400' : 'text-yellow-400'}>
            {user?.fullName || '? No disponible'}
          </span>
        </div>

        <div className="border-t border-gray-700 mt-2 pt-2">
          Script N8N:{' '}
          <span className={n8nLoaded ? 'text-green-400' : 'text-yellow-400'}>
            {n8nLoaded ? '✓ Cargado' : '⏳ Pendiente'}
          </span>
        </div>

        <div>
          window.n8nChat:{' '}
          <span className={window.n8nChat ? 'text-green-400' : 'text-red-400'}>
            {window.n8nChat ? '✓ Disponible' : '✗ No disponible'}
          </span>
        </div>

        <div className="border-t border-gray-700 mt-2 pt-2 text-gray-400">
          Webhok URL:{' '}
          {process.env.NEXT_PUBLIC_N8N_CHAT_WEBHOOK_URL ? (
            <span className="text-green-400 block break-words">
              ✓ Configurado
            </span>
          ) : (
            <span className="text-red-400">✗ No configurado</span>
          )}
        </div>

        {window.n8nChat && (
          <div className="border-t border-gray-700 mt-2 pt-2">
            <button
              onClick={() => window.n8nChat?.open?.()}
              className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded w-full text-center"
            >
              Abrir Chat
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
