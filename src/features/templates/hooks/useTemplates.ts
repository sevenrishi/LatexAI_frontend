import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { templateApi } from '../api/templateApi'
import {
  Template,
  CreateTemplateInput,
  UpdateTemplateInput,
  CompilePreviewRequest,
} from '@/types/template'

export const templateKeys = {
  all: ['templates'] as const,
  lists: () => [...templateKeys.all, 'list'] as const,
  detail: (id: string) => [...templateKeys.all, 'detail', id] as const,
  placeholders: (id: string) => [...templateKeys.all, 'placeholders', id] as const,
}

export function useTemplates() {
  return useQuery({
    queryKey: templateKeys.lists(),
    queryFn: templateApi.getTemplates,
  })
}

export function useTemplate(id: string | undefined) {
  return useQuery({
    queryKey: templateKeys.detail(id || ''),
    queryFn: () => {
      if (!id) throw new Error('Template ID is required')
      return templateApi.getTemplate(id)
    },
    enabled: Boolean(id),
  })
}

export function useTemplatePlaceholders(id: string | undefined) {
  return useQuery({
    queryKey: templateKeys.placeholders(id || ''),
    queryFn: () => {
      if (!id) throw new Error('Template ID is required')
      return templateApi.getPlaceholders(id)
    },
    enabled: Boolean(id),
  })
}

export function useCreateTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTemplateInput) => templateApi.createTemplate(data),
    onSuccess: (newTemplate) => {
      queryClient.setQueryData<Template[]>(templateKeys.lists(), (old) => {
        return old ? [newTemplate, ...old] : [newTemplate]
      })
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() })
      toast.success(`Template "${newTemplate.name}" created successfully`)
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to create template')
    },
  })
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTemplateInput }) =>
      templateApi.updateTemplate(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: templateKeys.detail(id) })
      await queryClient.cancelQueries({ queryKey: templateKeys.lists() })

      const previousTemplate = queryClient.getQueryData<Template>(templateKeys.detail(id))
      const previousList = queryClient.getQueryData<Template[]>(templateKeys.lists())

      if (previousTemplate) {
        queryClient.setQueryData<Template>(templateKeys.detail(id), {
          ...previousTemplate,
          ...data,
          updatedAt: new Date().toISOString(),
        })
      }

      if (previousList) {
        queryClient.setQueryData<Template[]>(
          templateKeys.lists(),
          previousList.map((tpl) => (tpl.id === id ? { ...tpl, ...data } : tpl))
        )
      }

      return { previousTemplate, previousList }
    },
    onError: (err, { id }, context) => {
      if (context?.previousTemplate) {
        queryClient.setQueryData(templateKeys.detail(id), context.previousTemplate)
      }
      if (context?.previousList) {
        queryClient.setQueryData(templateKeys.lists(), context.previousList)
      }
      toast.error(err instanceof Error ? err.message : 'Failed to update template')
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(templateKeys.detail(updated.id), updated)
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() })
      toast.success('Template saved successfully')
    },
  })
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => templateApi.deleteTemplate(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: templateKeys.lists() })
      const previousList = queryClient.getQueryData<Template[]>(templateKeys.lists())

      if (previousList) {
        queryClient.setQueryData<Template[]>(
          templateKeys.lists(),
          previousList.filter((tpl) => tpl.id !== id)
        )
      }
      return { previousList }
    },
    onError: (err, _id, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(templateKeys.lists(), context.previousList)
      }
      toast.error(err instanceof Error ? err.message : 'Failed to delete template')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() })
      toast.success('Template deleted')
    },
  })
}

export function useDuplicateTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, newName }: { id: string; newName?: string }) =>
      templateApi.duplicateTemplate(id, newName),
    onSuccess: (duplicated) => {
      queryClient.setQueryData<Template[]>(templateKeys.lists(), (old) => {
        return old ? [duplicated, ...old] : [duplicated]
      })
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() })
      toast.success(`Duplicated as "${duplicated.name}"`)
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to duplicate template')
    },
  })
}

export function useActivateTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => templateApi.activateTemplate(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: templateKeys.lists() })
      const previousList = queryClient.getQueryData<Template[]>(templateKeys.lists())

      if (previousList) {
        queryClient.setQueryData<Template[]>(
          templateKeys.lists(),
          previousList.map((tpl) => ({
            ...tpl,
            isActive: tpl.id === id,
          }))
        )
      }
      return { previousList }
    },
    onError: (err, _id, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(templateKeys.lists(), context.previousList)
      }
      toast.error(err instanceof Error ? err.message : 'Failed to activate template')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() })
      toast.success('Active template updated')
    },
  })
}

export function useCompilePreview() {
  return useMutation({
    mutationFn: ({ id, req }: { id: string; req: CompilePreviewRequest }) =>
      templateApi.compilePreview(id, req),
  })
}
