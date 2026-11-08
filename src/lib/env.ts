import { z } from 'zod'

const envSchema = z.object({
  VITE_API_URL: z.string().default('http://localhost:4000/api/v1'),
  VITE_SUPABASE_URL: z.string().default('https://dummy-supabase-project.supabase.co'),
  VITE_SUPABASE_ANON_KEY: z.string().default('dummy-anon-key'),
  VITE_APP_URL: z.string().default('http://localhost:5173'),
  VITE_ENABLE_DEMO_LOGIN: z
    .string()
    .optional()
    .transform(val => val === 'true' || val === '1'),
  VITE_USE_MOCKS: z
    .string()
    .optional()
    .transform(val => val === 'true' || val === '1'),
})

const parseEnv = () => {
  const result = envSchema.safeParse({
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    VITE_APP_URL: import.meta.env.VITE_APP_URL,
    VITE_ENABLE_DEMO_LOGIN: import.meta.env.VITE_ENABLE_DEMO_LOGIN,
    VITE_USE_MOCKS: import.meta.env.VITE_USE_MOCKS,
  })

  if (!result.success) {
    console.error('❌ Invalid environment variables:', result.error.format())
    throw new Error('Invalid environment configuration')
  }

  return result.data
}

export const env = parseEnv()
export type Env = z.infer<typeof envSchema>
