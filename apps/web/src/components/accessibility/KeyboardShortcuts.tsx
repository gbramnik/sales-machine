import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Shortcut {
  key: string
  description: string
  category: string
}

const shortcuts: Shortcut[] = [
  // Global
  { key: '?', description: 'Show keyboard shortcuts', category: 'Global' },
  { key: 'Esc', description: 'Close modals/dialogs', category: 'Global' },
  
  // Navigation
  { key: 'Tab', description: 'Navigate between elements', category: 'Navigation' },
  { key: 'Shift + Tab', description: 'Navigate backwards', category: 'Navigation' },
  { key: 'Enter', description: 'Activate buttons/links', category: 'Navigation' },
  { key: 'Space', description: 'Toggle checkboxes/radios', category: 'Navigation' },
  
  // Review Queue
  { key: 'A', description: 'Approve message', category: 'Review Queue' },
  { key: 'E', description: 'Edit message', category: 'Review Queue' },
  { key: 'R', description: 'Reject message', category: 'Review Queue' },
  { key: 'J / ↓', description: 'Next message', category: 'Review Queue' },
  { key: 'K / ↑', description: 'Previous message', category: 'Review Queue' },
]

export const KeyboardShortcuts: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle if not in input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault()
        setIsOpen(true)
      }

      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  if (!isOpen) return null

  const categories = Array.from(new Set(shortcuts.map(s => s.category)))

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden animate-fade-in"
        role="dialog"
        aria-labelledby="shortcuts-title"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-primary-50 border-b border-primary-200 px-6 py-4 flex items-center justify-between">
          <h2 id="shortcuts-title" className="text-xl font-semibold text-gray-900">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close shortcuts dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
          {categories.map((category) => (
            <div key={category} className="mb-6 last:mb-0">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                {category}
              </h3>
              <div className="space-y-2">
                {shortcuts
                  .filter((s) => s.category === category)
                  .map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                    >
                      <span className="text-gray-700">{shortcut.description}</span>
                      <kbd className="px-3 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono font-medium text-gray-900">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
          <p className="text-sm text-gray-600 text-center">
            Press <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">?</kbd> anytime to show this dialog
          </p>
        </div>
      </div>
    </div>
  )
}



