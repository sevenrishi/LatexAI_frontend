import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FormField } from '@/components/common/FormField'
import { CharCounter } from '@/components/common/CharCounter'
import { TagInput } from '@/components/common/TagInput'

describe('Shared Form UI Kit', () => {
  it('renders FormField with label, error, and required indicator', () => {
    render(
      <FormField label="Email" required error="Email is invalid">
        <input data-testid="test-input" />
      </FormField>
    )

    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('*')).toBeInTheDocument()
    expect(screen.getByText('Email is invalid')).toBeInTheDocument()
  })

  it('renders CharCounter correctly and changes styling near limit', () => {
    const { rerender } = render(<CharCounter current={50} max={100} />)
    expect(screen.getByText('50')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()

    rerender(<CharCounter current={95} max={100} />)
    expect(screen.getByText('95')).toBeInTheDocument()
  })

  it('adds and removes tags in TagInput', () => {
    const onChange = vi.fn()
    render(<TagInput value={['React', 'TypeScript']} onChange={onChange} />)

    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()

    const removeBtn = screen.getByRole('button', { name: /Remove React/i })
    fireEvent.click(removeBtn)
    expect(onChange).toHaveBeenCalledWith(['TypeScript'])
  })
})
