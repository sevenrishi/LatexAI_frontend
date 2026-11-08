import { authHandlers } from './auth'
import { profileHandlers } from './profile'
import { templateHandlers } from './templates'
import { generateHandlers } from './generate'
import { resumeHandlers } from './resumes'

export const handlers = [
  ...authHandlers,
  ...profileHandlers,
  ...templateHandlers,
  ...generateHandlers,
  ...resumeHandlers,
]
