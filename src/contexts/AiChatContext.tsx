import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react'

interface AiChatContextType {
  isOpen: boolean
  openChat: () => void
  closeChat: () => void
  toggleChat: () => void
  isStreaming: boolean;
  handleSend: (prompt: string) => Promise<void>
  handleCancel: () => void
}

const AiChatContext = createContext<AiChatContextType>({
  isOpen: false,
  openChat: () => {},
  closeChat: () => {},
  toggleChat: () => {},
  isStreaming: false,
  handleSend: async () => {},
  handleCancel: () => {},
})

export function AiChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)

  function openChat() {
    setIsOpen(true)
  }

  function closeChat() {
    setIsOpen(false)
  }

  function toggleChat() {
    setIsOpen((prev) => !prev)
  }

  const handleSend = useCallback(async (prompt: string) => {
    setIsStreaming(true)
    try {
      await new Promise((res) => setTimeout(res, 1500))
    } catch (err) {
      console.error("AI streaming error:", err)
    } finally {
      setIsStreaming(false)
    }
  }, [])

  const handleCancel = useCallback(() => {
    setIsStreaming(false)
  }, [])

  const value: AiChatContextType = {
    isOpen,
    openChat,
    closeChat,
    toggleChat,
    isStreaming,
    handleSend,
    handleCancel,
  }

  return (
    <AiChatContext.Provider value={value}>
      {children}
    </AiChatContext.Provider>
  )
}

export function useAiChat() {
  return useContext(AiChatContext)
}

