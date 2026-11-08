import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  profileApi,
  calculateCompleteness,
  INITIAL_DEMO_FULL_PROFILE,
} from '../api/profileApi'
import { useAuthStore } from '@/store/authStore'
import type {
  FullProfile,
  UpdateProfilePayload,
  ExperienceItem,
  EducationItem,
  SkillItem,
  CertificationItem,
  ProjectItem,
  ResumeImportConfirmPayload,
} from '@/types/profile'

export const profileKeys = {
  all: ['profile'] as const,
  detail: () => [...profileKeys.all, 'detail'] as const,
}

export function useProfile() {
  const { session } = useAuthStore()
  const isDemo = typeof window !== 'undefined' && Boolean(localStorage.getItem('latexai_demo_token'))
  const isRealUser = Boolean(session?.access_token)

  return useQuery({
    queryKey: profileKeys.detail(),
    queryFn: profileApi.getProfile,
    // Only prefill demo data if explicitly unauthenticated and in demo mode
    initialData: !isRealUser && isDemo ? INITIAL_DEMO_FULL_PROFILE : undefined,
    initialDataUpdatedAt: 0,
    staleTime: 5 * 1000,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => profileApi.updateProfile(payload),
    onMutate: async (newPayload) => {
      await queryClient.cancelQueries({ queryKey: profileKeys.detail() })
      const previousProfile = queryClient.getQueryData<FullProfile>(profileKeys.detail())

      if (previousProfile) {
        const optimistic: FullProfile = {
          ...previousProfile,
          ...newPayload,
          updatedAt: new Date().toISOString(),
        }
        optimistic.completeness = calculateCompleteness(optimistic)
        queryClient.setQueryData(profileKeys.detail(), optimistic)
      }

      return { previousProfile }
    },
    onError: (err, _variables, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(profileKeys.detail(), context.previousProfile)
      }
      toast.error(err instanceof Error ? err.message : 'Failed to update profile')
    },
    onSuccess: () => {
      toast.success('Profile updated successfully')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.detail() })
    },
  })
}

// Experience mutations with optimistic updates
export function useExperienceMutations() {
  const queryClient = useQueryClient()
  const { data: profile } = useProfile()

  const saveExperience = useMutation({
    mutationFn: async (item: ExperienceItem) => {
      const currentList = profile?.experience || []
      const index = currentList.findIndex((exp) => exp.id === item.id)
      const nextList =
        index >= 0
          ? currentList.map((exp) => (exp.id === item.id ? item : exp))
          : [item, ...currentList]

      return profileApi.updateProfile({ experience: nextList })
    },
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: profileKeys.detail() })
      const previousProfile = queryClient.getQueryData<FullProfile>(profileKeys.detail())

      if (previousProfile) {
        const currentList = previousProfile.experience || []
        const index = currentList.findIndex((exp) => exp.id === newItem.id)
        const nextList =
          index >= 0
            ? currentList.map((exp) => (exp.id === newItem.id ? newItem : exp))
            : [newItem, ...currentList]

        const optimistic: FullProfile = {
          ...previousProfile,
          experience: nextList,
        }
        optimistic.completeness = calculateCompleteness(optimistic)
        queryClient.setQueryData(profileKeys.detail(), optimistic)
      }

      return { previousProfile }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(profileKeys.detail(), context.previousProfile)
      }
      toast.error('Failed to save experience entry')
    },
    onSuccess: () => {
      toast.success('Experience saved')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.detail() })
    },
  })

  const deleteExperience = useMutation({
    mutationFn: async (id: string) => {
      const nextList = (profile?.experience || []).filter((exp) => exp.id !== id)
      return profileApi.updateProfile({ experience: nextList })
    },
    onMutate: async (idToDelete) => {
      await queryClient.cancelQueries({ queryKey: profileKeys.detail() })
      const previousProfile = queryClient.getQueryData<FullProfile>(profileKeys.detail())

      if (previousProfile) {
        const optimistic: FullProfile = {
          ...previousProfile,
          experience: previousProfile.experience.filter((exp) => exp.id !== idToDelete),
        }
        optimistic.completeness = calculateCompleteness(optimistic)
        queryClient.setQueryData(profileKeys.detail(), optimistic)
      }

      return { previousProfile }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(profileKeys.detail(), context.previousProfile)
      }
      toast.error('Failed to delete experience')
    },
    onSuccess: () => {
      toast.success('Experience deleted')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.detail() })
    },
  })

  return { saveExperience, deleteExperience }
}

// Education mutations
export function useEducationMutations() {
  const queryClient = useQueryClient()
  const { data: profile } = useProfile()

  const saveEducation = useMutation({
    mutationFn: async (item: EducationItem) => {
      const currentList = profile?.education || []
      const index = currentList.findIndex((edu) => edu.id === item.id)
      const nextList =
        index >= 0
          ? currentList.map((edu) => (edu.id === item.id ? item : edu))
          : [item, ...currentList]

      return profileApi.updateProfile({ education: nextList })
    },
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: profileKeys.detail() })
      const previousProfile = queryClient.getQueryData<FullProfile>(profileKeys.detail())

      if (previousProfile) {
        const currentList = previousProfile.education || []
        const index = currentList.findIndex((edu) => edu.id === newItem.id)
        const nextList =
          index >= 0
            ? currentList.map((edu) => (edu.id === newItem.id ? newItem : edu))
            : [newItem, ...currentList]

        const optimistic: FullProfile = {
          ...previousProfile,
          education: nextList,
        }
        optimistic.completeness = calculateCompleteness(optimistic)
        queryClient.setQueryData(profileKeys.detail(), optimistic)
      }

      return { previousProfile }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(profileKeys.detail(), context.previousProfile)
      }
      toast.error('Failed to save education entry')
    },
    onSuccess: () => {
      toast.success('Education saved')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.detail() })
    },
  })

  const deleteEducation = useMutation({
    mutationFn: async (id: string) => {
      const nextList = (profile?.education || []).filter((edu) => edu.id !== id)
      return profileApi.updateProfile({ education: nextList })
    },
    onMutate: async (idToDelete) => {
      await queryClient.cancelQueries({ queryKey: profileKeys.detail() })
      const previousProfile = queryClient.getQueryData<FullProfile>(profileKeys.detail())

      if (previousProfile) {
        const optimistic: FullProfile = {
          ...previousProfile,
          education: previousProfile.education.filter((edu) => edu.id !== idToDelete),
        }
        optimistic.completeness = calculateCompleteness(optimistic)
        queryClient.setQueryData(profileKeys.detail(), optimistic)
      }

      return { previousProfile }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(profileKeys.detail(), context.previousProfile)
      }
      toast.error('Failed to delete education')
    },
    onSuccess: () => {
      toast.success('Education entry deleted')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.detail() })
    },
  })

  return { saveEducation, deleteEducation }
}

// Skills mutations
export function useSkillsMutations() {
  const queryClient = useQueryClient()
  const { data: profile } = useProfile()

  const saveSkills = useMutation({
    mutationFn: async (skills: SkillItem[]) => {
      return profileApi.updateProfile({ skills })
    },
    onMutate: async (newSkills) => {
      await queryClient.cancelQueries({ queryKey: profileKeys.detail() })
      const previousProfile = queryClient.getQueryData<FullProfile>(profileKeys.detail())

      if (previousProfile) {
        const optimistic: FullProfile = {
          ...previousProfile,
          skills: newSkills,
        }
        optimistic.completeness = calculateCompleteness(optimistic)
        queryClient.setQueryData(profileKeys.detail(), optimistic)
      }

      return { previousProfile }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(profileKeys.detail(), context.previousProfile)
      }
      toast.error('Failed to update skills')
    },
    onSuccess: () => {
      toast.success('Skills updated')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.detail() })
    },
  })

  const bulkAddSkills = useMutation({
    mutationFn: async ({ category, names }: { category: string; names: string[] }) => {
      const currentList = profile?.skills || []
      const existingNames = new Set(currentList.map((s) => s.name.toLowerCase()))

      const toAdd: SkillItem[] = names
        .map((n) => n.trim())
        .filter((n) => n.length > 0 && !existingNames.has(n.toLowerCase()))
        .map((name) => ({
          id: `sk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name,
          category,
        }))

      const nextList = [...currentList, ...toAdd]
      return profileApi.updateProfile({ skills: nextList })
    },
    onSuccess: () => {
      toast.success('Skills added successfully')
      queryClient.invalidateQueries({ queryKey: profileKeys.detail() })
    },
  })

  return { saveSkills, bulkAddSkills }
}

// Certifications mutations
export function useCertificationMutations() {
  const queryClient = useQueryClient()
  const { data: profile } = useProfile()

  const saveCertification = useMutation({
    mutationFn: async (item: CertificationItem) => {
      const currentList = profile?.certifications || []
      const index = currentList.findIndex((c) => c.id === item.id)
      const nextList =
        index >= 0
          ? currentList.map((c) => (c.id === item.id ? item : c))
          : [item, ...currentList]

      return profileApi.updateProfile({ certifications: nextList })
    },
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: profileKeys.detail() })
      const previousProfile = queryClient.getQueryData<FullProfile>(profileKeys.detail())

      if (previousProfile) {
        const currentList = previousProfile.certifications || []
        const index = currentList.findIndex((c) => c.id === newItem.id)
        const nextList =
          index >= 0
            ? currentList.map((c) => (c.id === newItem.id ? newItem : c))
            : [newItem, ...currentList]

        const optimistic: FullProfile = {
          ...previousProfile,
          certifications: nextList,
        }
        optimistic.completeness = calculateCompleteness(optimistic)
        queryClient.setQueryData(profileKeys.detail(), optimistic)
      }

      return { previousProfile }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(profileKeys.detail(), context.previousProfile)
      }
      toast.error('Failed to save certification')
    },
    onSuccess: () => {
      toast.success('Certification saved')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.detail() })
    },
  })

  const deleteCertification = useMutation({
    mutationFn: async (id: string) => {
      const nextList = (profile?.certifications || []).filter((c) => c.id !== id)
      return profileApi.updateProfile({ certifications: nextList })
    },
    onMutate: async (idToDelete) => {
      await queryClient.cancelQueries({ queryKey: profileKeys.detail() })
      const previousProfile = queryClient.getQueryData<FullProfile>(profileKeys.detail())

      if (previousProfile) {
        const optimistic: FullProfile = {
          ...previousProfile,
          certifications: previousProfile.certifications.filter((c) => c.id !== idToDelete),
        }
        optimistic.completeness = calculateCompleteness(optimistic)
        queryClient.setQueryData(profileKeys.detail(), optimistic)
      }

      return { previousProfile }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(profileKeys.detail(), context.previousProfile)
      }
      toast.error('Failed to delete certification')
    },
    onSuccess: () => {
      toast.success('Certification deleted')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.detail() })
    },
  })

  return { saveCertification, deleteCertification }
}

// Projects mutations
export function useProjectMutations() {
  const queryClient = useQueryClient()
  const { data: profile } = useProfile()

  const saveProject = useMutation({
    mutationFn: async (item: ProjectItem) => {
      const currentList = profile?.projects || []
      const index = currentList.findIndex((p) => p.id === item.id)
      const nextList =
        index >= 0
          ? currentList.map((p) => (p.id === item.id ? item : p))
          : [item, ...currentList]

      return profileApi.updateProfile({ projects: nextList })
    },
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: profileKeys.detail() })
      const previousProfile = queryClient.getQueryData<FullProfile>(profileKeys.detail())

      if (previousProfile) {
        const currentList = previousProfile.projects || []
        const index = currentList.findIndex((p) => p.id === newItem.id)
        const nextList =
          index >= 0
            ? currentList.map((p) => (p.id === newItem.id ? newItem : p))
            : [newItem, ...currentList]

        const optimistic: FullProfile = {
          ...previousProfile,
          projects: nextList,
        }
        optimistic.completeness = calculateCompleteness(optimistic)
        queryClient.setQueryData(profileKeys.detail(), optimistic)
      }

      return { previousProfile }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(profileKeys.detail(), context.previousProfile)
      }
      toast.error('Failed to save project')
    },
    onSuccess: () => {
      toast.success('Project saved')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.detail() })
    },
  })

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      const nextList = (profile?.projects || []).filter((p) => p.id !== id)
      return profileApi.updateProfile({ projects: nextList })
    },
    onMutate: async (idToDelete) => {
      await queryClient.cancelQueries({ queryKey: profileKeys.detail() })
      const previousProfile = queryClient.getQueryData<FullProfile>(profileKeys.detail())

      if (previousProfile) {
        const optimistic: FullProfile = {
          ...previousProfile,
          projects: previousProfile.projects.filter((p) => p.id !== idToDelete),
        }
        optimistic.completeness = calculateCompleteness(optimistic)
        queryClient.setQueryData(profileKeys.detail(), optimistic)
      }

      return { previousProfile }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(profileKeys.detail(), context.previousProfile)
      }
      toast.error('Failed to delete project')
    },
    onSuccess: () => {
      toast.success('Project deleted')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.detail() })
    },
  })

  return { saveProject, deleteProject }
}

// Resume Import Hook
export function useResumeImport() {
  const queryClient = useQueryClient()

  const confirmImport = useMutation({
    mutationFn: ({
      importId,
      payload,
    }: {
      importId: string
      payload: ResumeImportConfirmPayload
    }) => profileApi.confirmResumeImport(importId, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(profileKeys.detail(), updated)
      toast.success('Resume imported and profile updated successfully!')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to apply imported resume')
    },
  })

  return { confirmImport }
}
