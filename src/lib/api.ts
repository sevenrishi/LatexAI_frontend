import { env } from './env'
import { supabase, getAccessToken } from './supabase'
import { getFriendlyErrorMessage } from './errorMessages'

export interface ApiResponseEnvelope<T> {
  success?: boolean
  data?: T
  error?: {
    code?: string
    message?: string
    details?: unknown
  }
}

export class ApiError extends Error {
  public status: number
  public code: string
  public details?: unknown
  public friendlyMessage: string

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
    this.friendlyMessage = getFriendlyErrorMessage(code, message)
  }
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>
  skipAuth?: boolean
}

let isRefreshing = false
let refreshPromise: Promise<string | null> | null = null

async function refreshAuthToken(): Promise<string | null> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise
  }

  isRefreshing = true
  refreshPromise = (async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (error || !data.session) {
        return null
      }
      return data.session.access_token
    } catch {
      return null
    } finally {
      isRefreshing = false
      refreshPromise = null
    }
  })()

  return refreshPromise
}

export async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
  isRetry = false
): Promise<T> {
  const { params, skipAuth = false, headers = {}, ...rest } = options

  // Build query string
  const baseUrl = env.VITE_API_URL.replace(/\/$/, '')
  let cleanEndpoint = endpoint.replace(/^\//, '')
  if (baseUrl.endsWith('/api/v1') && cleanEndpoint.startsWith('api/v1/')) {
    cleanEndpoint = cleanEndpoint.replace(/^api\/v1\//, '')
  }
  let url = endpoint.startsWith('http')
    ? endpoint
    : `${baseUrl}/${cleanEndpoint}`

  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val))
      }
    })
    const qs = searchParams.toString()
    if (qs) {
      url += (url.includes('?') ? '&' : '?') + qs
    }
  }

  const reqHeaders = new Headers(headers)
  if (!reqHeaders.has('Content-Type') && !(rest.body instanceof FormData)) {
    reqHeaders.set('Content-Type', 'application/json')
  }

  // Token injection
  if (!skipAuth) {
    const token = await getAccessToken()
    if (token) {
      reqHeaders.set('Authorization', `Bearer ${token}`)
    }
  }

  let res: Response
  try {
    res = await fetch(url, {
      ...rest,
      headers: reqHeaders,
    })
  } catch (err) {
    if (
      !isRetry &&
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
      !url.includes('localhost:4000') &&
      !url.includes('127.0.0.1:4000')
    ) {
      try {
        const localUrl = `http://localhost:4000/api/v1/${cleanEndpoint}`
        res = await fetch(localUrl, {
          ...rest,
          headers: reqHeaders,
        })
      } catch {
        throw new ApiError(0, 'NETWORK_ERROR', (err as Error).message || 'Network connection failed')
      }
    } else {
      throw new ApiError(0, 'NETWORK_ERROR', (err as Error).message || 'Network connection failed')
    }
  }

  // 401 Interceptor: Refresh token & retry once (skip for auth endpoints to prevent loops)
  if (res.status === 401 && !skipAuth && !isRetry && !cleanEndpoint.startsWith('auth/')) {
    const newToken = await refreshAuthToken()
    if (newToken) {
      return request<T>(endpoint, options, true)
    }
  }

  // Parse response
  let json: unknown = null
  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    try {
      json = await res.json()
    } catch {
      json = null
    }
  }

  if (!res.ok) {
    const errorBody = json as ApiResponseEnvelope<never> | null
    const code = errorBody?.error?.code || `HTTP_${res.status}`
    const message = errorBody?.error?.message || res.statusText || 'Request failed'
    const details = errorBody?.error?.details
    throw new ApiError(res.status, code, message, details)
  }

  // Envelope unwrap: if response has data property, return data
  if (json && typeof json === 'object') {
    const envObj = json as ApiResponseEnvelope<T>
    if ('data' in envObj && envObj.data !== undefined) {
      return envObj.data
    }
  }

  return json as T
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { method: 'GET', ...options }),
  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    }),
  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    }),
  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    }),
  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { method: 'DELETE', ...options }),
}
