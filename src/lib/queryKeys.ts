export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    me: () => [...queryKeys.auth.all, 'me'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
  },
  profile: {
    all: ['profile'] as const,
    details: () => [...queryKeys.profile.all, 'details'] as const,
    section: (section: string) => [...queryKeys.profile.all, 'section', section] as const,
    completeness: () => [...queryKeys.profile.all, 'completeness'] as const,
  },
  templates: {
    all: ['templates'] as const,
    lists: () => [...queryKeys.templates.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.templates.all, 'detail', id] as const,
    placeholders: (id: string) => [...queryKeys.templates.all, 'placeholders', id] as const,
  },
  generations: {
    all: ['generations'] as const,
    detail: (id: string) => [...queryKeys.generations.all, 'detail', id] as const,
    status: (id: string) => [...queryKeys.generations.all, 'status', id] as const,
    atsScore: (id: string) => [...queryKeys.generations.all, 'atsScore', id] as const,
  },
  history: {
    all: ['history'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.history.all, 'list', filters] as const,
  },
} as const
