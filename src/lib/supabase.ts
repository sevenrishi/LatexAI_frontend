import { createClient } from '@supabase/supabase-js'
import { env } from './env'

export const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
})

export async function getAccessToken(): Promise<string | null> {
  // 1. Prioritize real Supabase session if authenticated
  try {
    const { data } = await supabase.auth.getSession()
    if (data.session?.access_token) {
      return data.session.access_token
    }
  } catch {
    // continue
  }

  // 2. Fallback: inspect localStorage for Supabase session if getSession is synchronizing
  if (typeof window !== 'undefined') {
    try {
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i)
        if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
          const raw = window.localStorage.getItem(key)
          if (raw) {
            const item = JSON.parse(raw)
            if (item?.access_token) return item.access_token
          }
        }
      }
    } catch {
      // ignore
    }
  }

  // 3. Only use mock demo token if no real session exists
  const demoToken = typeof window !== 'undefined' ? window.localStorage.getItem('latexai_demo_token') : null
  if (demoToken) {
    return demoToken
  }

  return null
}
