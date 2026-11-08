import { http, HttpResponse } from 'msw'
import { mockTemplates } from '../fixtures/templates'
import { STANDARD_PLACEHOLDERS } from '@/features/templates/utils/placeholders'
import { Template } from '@/types/template'

let inMemoryTemplates: Template[] = [...mockTemplates]

const SAMPLE_PREVIEW_PDF_B64 =
  'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iaiA8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4gZW5kb2JqCjIgMCBvYmogPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50IDEgPj4gZW5kb2JqCjMgMCBvYmogPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA2MTIgNzkyXSAvQ29udGVudHMgNCAwIFIgL1Jlc291cmNlcyA8PCAvRm9udCA8PCAvRjEgNSAwIFIgPj4gPj4gPj4gZW5kb2JqCjQgMCBvYmogPDwgL0xlbmd0aCA4MyA+PiBzdHJlYW0KQlQgL0YxIDIyIFRmIDUwIDc0MCBUZCAoTGF0ZXhBSSBBVFMgUmVzdW1lIFByZXZpZXcpIFRqIDAgLTMwIFRkIC9GMSAxMiBUZiAoQ29tcGlsZWQgdmlhIHBkZmxhdGV4KSBUaiBFVAplbmRzdHJlYW0gZW5kb2JqCjUgMCBvYmogPDwgL1R5cGUgL1ZvbnQgL1N1YnR5cGUgL1R5cGUxIC9CYXNlRm9udCAvSGVsdmV0aWNhID4+IGVuZG9iagp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAwMDAwMDAyNDQgMDAwMDAgbiAKMDAwMDAwMDM3OCAwMDAwMCBuIAp0cmFpbGVyIDw8IC9TaXplIDYgL1Jvb3QgMSAwIFIgPj4Kc3RhcnR4cmVmCjQ1MgolJUVPRg=='

export const templateHandlers = [
  // GET all templates
  http.get('*/api/v1/templates', () => {
    return HttpResponse.json({
      success: true,
      data: inMemoryTemplates,
    })
  }),

  // GET single template
  http.get('*/api/v1/templates/:id', ({ params }) => {
    const template = inMemoryTemplates.find((t) => t.id === params.id)
    if (!template) {
      return HttpResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Template not found' } },
        { status: 404 }
      )
    }
    return HttpResponse.json({
      success: true,
      data: template,
    })
  }),

  // GET template placeholders contract
  http.get('*/api/v1/templates/:id/placeholders', () => {
    return HttpResponse.json({
      success: true,
      data: STANDARD_PLACEHOLDERS,
    })
  }),

  // POST create template
  http.post('*/api/v1/templates', async ({ request }) => {
    const body = (await request.json()) as Partial<Template>
    const newTemplate: Template = {
      id: `tpl_custom_${Date.now()}`,
      name: body.name || 'New Template',
      description: body.description || 'Custom user LaTeX template',
      category: body.category || 'Engineering',
      isDefault: false,
      isActive: false,
      latexSource: body.latexSource || '',
      placeholders: body.placeholders || [
        '{{FULL_NAME}}',
        '{{CONTACT_BLOCK}}',
        '{{SUMMARY}}',
        '{{EXPERIENCE_BLOCK}}',
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    inMemoryTemplates = [newTemplate, ...inMemoryTemplates]
    return HttpResponse.json({
      success: true,
      data: newTemplate,
    })
  }),

  // PUT update template
  http.put('*/api/v1/templates/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<Template>
    const idx = inMemoryTemplates.findIndex((t) => t.id === params.id)
    if (idx === -1) {
      return HttpResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Template not found' } },
        { status: 404 }
      )
    }

    if (inMemoryTemplates[idx].isDefault) {
      return HttpResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Default templates are read-only' } },
        { status: 403 }
      )
    }

    inMemoryTemplates[idx] = {
      ...inMemoryTemplates[idx],
      ...body,
      updatedAt: new Date().toISOString(),
    }

    return HttpResponse.json({
      success: true,
      data: inMemoryTemplates[idx],
    })
  }),

  // DELETE template
  http.delete('*/api/v1/templates/:id', ({ params }) => {
    const tpl = inMemoryTemplates.find((t) => t.id === params.id)
    if (!tpl) {
      return HttpResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Template not found' } },
        { status: 404 }
      )
    }

    if (tpl.isDefault) {
      return HttpResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Cannot delete default template' } },
        { status: 403 }
      )
    }

    inMemoryTemplates = inMemoryTemplates.filter((t) => t.id !== params.id)
    return HttpResponse.json({
      success: true,
      message: 'Template deleted successfully',
    })
  }),

  // POST duplicate template
  http.post('*/api/v1/templates/:id/duplicate', async ({ params, request }) => {
    const body = (await request.json().catch(() => ({}))) as { name?: string }
    const source = inMemoryTemplates.find((t) => t.id === params.id)
    if (!source) {
      return HttpResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Source template not found' } },
        { status: 404 }
      )
    }

    const duplicated: Template = {
      ...source,
      id: `tpl_custom_${Date.now()}`,
      name: body?.name || `${source.name} (Custom Copy)`,
      isDefault: false,
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    inMemoryTemplates = [duplicated, ...inMemoryTemplates]

    return HttpResponse.json({
      success: true,
      data: duplicated,
    })
  }),

  // POST activate template
  http.post('*/api/v1/templates/:id/activate', ({ params }) => {
    const exists = inMemoryTemplates.some((t) => t.id === params.id)
    if (!exists) {
      return HttpResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Template not found' } },
        { status: 404 }
      )
    }

    inMemoryTemplates = inMemoryTemplates.map((t) => ({
      ...t,
      isActive: t.id === params.id,
    }))

    return HttpResponse.json({
      success: true,
      activeTemplateId: params.id,
    })
  }),

  // POST compile preview
  http.post('*/api/v1/templates/:id/preview', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as {
      latexSource?: string
      dataSource?: 'sample' | 'profile'
    }

    // Check if source contains any intentional test error
    if (body.latexSource?.includes('\\ERROR_TEST')) {
      return HttpResponse.json({
        success: false,
        errors: [
          {
            line: 12,
            message: 'Undefined control sequence \\ERROR_TEST',
            code: 'UNDEFINED_SEQUENCE',
            raw: '! Undefined control sequence.\nl.12 \\ERROR_TEST',
          },
        ],
        compileLogs: `This is pdfTeX, Version 3.141592653-2.6-1.40.25 (TeX Live 2024)\n! Undefined control sequence.\nl.12 \\ERROR_TEST\n? \n! Emergency stop.`,
      })
    }

    return HttpResponse.json({
      success: true,
      pdfBase64: SAMPLE_PREVIEW_PDF_B64,
      compileLogs: `This is pdfTeX, Version 3.141592653-2.6-1.40.25 (TeX Live 2024)\nOutput written on resume.pdf (1 page, 32185 bytes).\nTranscript written on resume.log.\nCompilation completed successfully in 384ms via pdflatex sandboxed runner.`,
      durationMs: 384,
    })
  }),
]
