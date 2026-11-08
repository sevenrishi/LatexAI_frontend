export const ERROR_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: 'You are not logged in or your session has expired. Please sign in again.',
  INVALID_TOKEN: 'Your authentication token is invalid. Please sign in again.',
  TOKEN_EXPIRED: 'Your session has expired. Please sign in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  EMAIL_NOT_VERIFIED: 'Please verify your email address before continuing.',
  NOT_FOUND: 'The requested resource was not found.',
  PROFILE_INCOMPLETE: 'Your profile is incomplete. Please fill in your work experience and skills first.',
  QUOTA_EXCEEDED: 'You have reached your daily generation limit. Please try again tomorrow.',
  RATE_LIMITED: 'Too many requests. Please wait a moment before trying again.',
  URL_BLOCKED: 'Unable to fetch this job URL due to website restrictions. Please paste the job description text directly.',
  URL_FETCH_FAILED: 'Could not retrieve job description from the provided link. Please copy and paste the text.',
  COMPILATION_FAILED: 'LaTeX compilation encountered errors. Please check the template syntax.',
  TEX_SYNTAX_ERROR: 'Invalid LaTeX markup detected.',
  NETWORK_ERROR: 'Network error. Please check your internet connection and try again.',
  INTERNAL_SERVER_ERROR: 'An unexpected server error occurred. Please try again later.',
}

export function getFriendlyErrorMessage(code?: string, fallbackMessage?: string): string {
  if (code && ERROR_MESSAGES[code]) {
    return ERROR_MESSAGES[code]
  }
  return fallbackMessage || 'An unexpected error occurred. Please try again.'
}
