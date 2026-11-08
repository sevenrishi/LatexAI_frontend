import React from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export interface FormFieldProps {
  id?: string
  label?: string
  required?: boolean
  description?: string
  error?: string
  children: React.ReactNode
  className?: string
}

export function FormField({
  id,
  label,
  required,
  description,
  error,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('flex flex-col space-y-1.5', className)}>
      {label && (
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </Label>
      )}
      {children}
      {description && !error && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {error && (
        <p className="text-xs font-medium text-destructive animate-in fade-in-50">
          {error}
        </p>
      )}
    </div>
  )
}
