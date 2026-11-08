import { api } from '@/lib/api'
import {
  Template,
  TemplatePlaceholder,
  CompilePreviewRequest,
  CompilePreviewResponse,
  CreateTemplateInput,
  UpdateTemplateInput,
} from '@/types/template'

export const templateApi = {
  getTemplates: () => api.get<Template[]>('/api/v1/templates'),

  getTemplate: (id: string) => api.get<Template>(`/api/v1/templates/${id}`),

  getPlaceholders: (id: string) =>
    api.get<TemplatePlaceholder[]>(`/api/v1/templates/${id}/placeholders`),

  createTemplate: (data: CreateTemplateInput) =>
    api.post<Template>('/api/v1/templates', data),

  updateTemplate: (id: string, data: UpdateTemplateInput) =>
    api.put<Template>(`/api/v1/templates/${id}`, data),

  deleteTemplate: (id: string) =>
    api.delete<{ success: boolean; message?: string }>(`/api/v1/templates/${id}`),

  duplicateTemplate: (id: string, newName?: string) =>
    api.post<Template>(`/api/v1/templates/${id}/duplicate`, { name: newName }),

  activateTemplate: (id: string) =>
    api.post<{ success: boolean; activeTemplateId: string }>(`/api/v1/templates/${id}/activate`),

  compilePreview: (id: string, req: CompilePreviewRequest) =>
    api.post<CompilePreviewResponse>(`/api/v1/templates/${id}/preview`, req),
}
