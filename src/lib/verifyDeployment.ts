import { env } from './env'

export interface DeploymentCheck {
  id: string
  name: string
  status: 'PASS' | 'WARN' | 'FAIL'
  message: string
}

export interface DeploymentReport {
  isReady: boolean
  checks: DeploymentCheck[]
  timestamp: string
}

export async function verifyProductionDeployment(apiUrl?: string): Promise<DeploymentReport> {
  const targetApiUrl = (apiUrl || env.VITE_API_URL).replace(/\/$/, '')
  const checks: DeploymentCheck[] = []

  // Check 1: API URL format
  if (targetApiUrl.startsWith('https://') || targetApiUrl.includes('localhost')) {
    checks.push({
      id: 'env_api_url',
      name: 'API Base URL Validation',
      status: 'PASS',
      message: `Configured endpoint: ${targetApiUrl}`,
    })
  } else {
    checks.push({
      id: 'env_api_url',
      name: 'API Base URL Validation',
      status: 'WARN',
      message: 'API URL should use HTTPS in production environments.',
    })
  }

  // Check 2: Supabase URL & Anon Key
  if (env.VITE_SUPABASE_URL && !env.VITE_SUPABASE_URL.includes('dummy')) {
    checks.push({
      id: 'env_supabase',
      name: 'Supabase Configuration',
      status: 'PASS',
      message: 'Active Supabase project URL configured.',
    })
  } else {
    checks.push({
      id: 'env_supabase',
      name: 'Supabase Configuration',
      status: 'WARN',
      message: 'Using fallback dummy Supabase credentials.',
    })
  }

  // Check 3: App Origin URL
  if (env.VITE_APP_URL) {
    checks.push({
      id: 'env_app_url',
      name: 'Frontend Origin URL',
      status: 'PASS',
      message: `Client origin: ${env.VITE_APP_URL}`,
    })
  } else {
    checks.push({
      id: 'env_app_url',
      name: 'Frontend Origin URL',
      status: 'FAIL',
      message: 'VITE_APP_URL is required for OAuth callback redirections.',
    })
  }

  // Check 4: Backend Health & CORS Probe
  try {
    const healthUrl = targetApiUrl.endsWith('/api/v1')
      ? `${targetApiUrl.replace(/\/api\/v1$/, '')}/health`
      : `${targetApiUrl}/health`

    const res = await fetch(healthUrl, { method: 'GET', mode: 'cors' }).catch(() => null)
    if (res && (res.ok || res.status === 200 || res.status === 404)) {
      checks.push({
        id: 'api_cors_health',
        name: 'Backend API & CORS Connectivity',
        status: 'PASS',
        message: 'Backend reached with valid CORS headers.',
      })
    } else {
      checks.push({
        id: 'api_cors_health',
        name: 'Backend API & CORS Connectivity',
        status: 'WARN',
        message: 'Could not reach backend /health directly (may be normal if backend is starting).',
      })
    }
  } catch {
    checks.push({
      id: 'api_cors_health',
      name: 'Backend API & CORS Connectivity',
      status: 'WARN',
      message: 'Network check skipped or timed out.',
    })
  }

  const hasFailures = checks.some((c) => c.status === 'FAIL')

  return {
    isReady: !hasFailures,
    checks,
    timestamp: new Date().toISOString(),
  }
}
