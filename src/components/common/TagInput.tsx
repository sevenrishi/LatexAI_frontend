import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  maxTags?: number
  disabled?: boolean
  className?: string
}

export function TagInput({
  value = [],
  onChange,
  placeholder = 'Add item and press Enter...',
  maxTags,
  disabled = false,
  className,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('')

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return

    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const trimmed = inputValue.trim().replace(/^,+|,+$/g, '')
      if (trimmed && !value.includes(trimmed)) {
        if (!maxTags || value.length < maxTags) {
          onChange([...value, trimmed])
          setInputValue('')
        }
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  const removeTag = (tagToRemove: string) => {
    if (disabled) return
    onChange(value.filter((t) => t !== tagToRemove))
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text')
    if (text.includes(',') || text.includes('\n')) {
      e.preventDefault()
      const parts = text
        .split(/[,\n]/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0)

      const newTags = Array.from(new Set([...value, ...parts]))
      onChange(maxTags ? newTags.slice(0, maxTags) : newTags)
    }
  }

  return (
    <div
      className={cn(
        'flex min-h-[42px] w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent p-1.5 text-sm ring-offset-background focus-within:ring-1 focus-within:ring-ring',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {value.map((tag) => (
        <Badge
          key={tag}
          variant="secondary"
          className="flex items-center gap-1 py-1 pl-2.5 pr-1 text-xs"
        >
          <span>{tag}</span>
          {!disabled && (
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="rounded-full p-0.5 hover:bg-muted-foreground/20 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove {tag}</span>
            </button>
          )}
        </Badge>
      ))}

      {(!maxTags || value.length < maxTags) && (
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          disabled={disabled}
          placeholder={value.length === 0 ? placeholder : ''}
          className="h-7 min-w-[120px] flex-1 border-0 p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-xs"
        />
      )}
    </div>
  )
}
