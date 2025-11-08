import React, { useEffect, useState } from 'react'

interface LiveRegionProps {
  message: string
  politeness?: 'polite' | 'assertive'
  clearAfter?: number
}

export const LiveRegion: React.FC<LiveRegionProps> = ({
  message,
  politeness = 'polite',
  clearAfter = 3000,
}) => {
  const [currentMessage, setCurrentMessage] = useState(message)

  useEffect(() => {
    setCurrentMessage(message)

    if (clearAfter > 0 && message) {
      const timer = setTimeout(() => {
        setCurrentMessage('')
      }, clearAfter)

      return () => clearTimeout(timer)
    }
  }, [message, clearAfter])

  return (
    <div
      className="sr-only"
      role="status"
      aria-live={politeness}
      aria-atomic="true"
    >
      {currentMessage}
    </div>
  )
}

// Hook for managing live region announcements
export function useLiveRegion() {
  const [message, setMessage] = useState('')

  const announce = (text: string) => {
    // Clear first to ensure re-announcement
    setMessage('')
    setTimeout(() => setMessage(text), 100)
  }

  return { message, announce }
}







