import React from 'react'
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, afterAll, vi } from 'vitest'
import { server } from '@/mocks/server'

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  cleanup()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

// Mock scrollTo and scrollIntoView
window.scrollTo = () => {}
if (typeof Element !== 'undefined') {
  Element.prototype.scrollIntoView = () => {}
}

// Mock ResizeObserver for Radix UI primitives
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock react-pdf for jsdom
vi.mock('react-pdf', () => ({
  pdfjs: {
    GlobalWorkerOptions: {
      workerSrc: '',
    },
    version: '11.0.0',
  },
  Document: ({ children, onLoadSuccess, file }: any) => {
    if (typeof onLoadSuccess === 'function') {
      setTimeout(() => onLoadSuccess({ numPages: 1 }), 0)
    }
    return React.createElement(
      'div',
      { 'data-testid': 'mock-pdf-document', 'data-file': typeof file === 'string' ? file : '' },
      children
    )
  },
  Page: ({ pageNumber }: any) => {
    return React.createElement('div', { 'data-testid': 'mock-pdf-page' }, `Page ${pageNumber}`)
  },
}))



