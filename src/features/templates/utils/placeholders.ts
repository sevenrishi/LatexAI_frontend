import { TemplatePlaceholder } from '@/types/template'

export const STANDARD_PLACEHOLDERS: TemplatePlaceholder[] = [
  {
    id: 'name',
    token: '{{FULL_NAME}}',
    label: 'Full Name',
    category: 'Profile',
    description: 'User full name formatted for document title.',
    required: true,
    exampleSnippet: '{\\Huge \\textbf{{{FULL_NAME}}}}',
  },
  {
    id: 'contact',
    token: '{{CONTACT_BLOCK}}',
    label: 'Contact Info Bar',
    category: 'Profile',
    description: 'Formatted email, phone, location, LinkedIn, and GitHub links with icons.',
    required: true,
    exampleSnippet: '{{CONTACT_BLOCK}}',
  },
  {
    id: 'summary',
    token: '{{SUMMARY}}',
    label: 'Professional Summary',
    category: 'Profile',
    description: 'High-impact 2-4 sentence tailored summary matching target role.',
    required: true,
    exampleSnippet: '\\section{Summary}\n{{SUMMARY}}',
  },
  {
    id: 'experience',
    token: '{{EXPERIENCE_BLOCK}}',
    label: 'Experience Section',
    category: 'Experience',
    description: 'Rendered employment entries with company, title, dates, and quantified bullet points.',
    required: true,
    exampleSnippet: '\\section{Experience}\n{{EXPERIENCE_BLOCK}}',
  },
  {
    id: 'education',
    token: '{{EDUCATION_BLOCK}}',
    label: 'Education Section',
    category: 'Education',
    description: 'Degrees, institutions, graduation dates, GPA, and honors entries.',
    required: true,
    exampleSnippet: '\\section{Education}\n{{EDUCATION_BLOCK}}',
  },
  {
    id: 'skills',
    token: '{{SKILLS_BLOCK}}',
    label: 'Skills Matrix',
    category: 'Skills',
    description: 'Categorized technical and soft skills grouped by domains.',
    required: true,
    exampleSnippet: '\\section{Technical Skills}\n{{SKILLS_BLOCK}}',
  },
  {
    id: 'projects',
    token: '{{PROJECTS_BLOCK}}',
    label: 'Projects Section',
    category: 'Projects',
    description: 'Key personal, open-source, or client projects with tech stack and live links.',
    required: false,
    exampleSnippet: '\\section{Projects}\n{{PROJECTS_BLOCK}}',
  },
  {
    id: 'certifications',
    token: '{{CERTIFICATIONS_BLOCK}}',
    label: 'Certifications',
    category: 'Education',
    description: 'Professional certificates, issuing organizations, dates, and credential IDs.',
    required: false,
    exampleSnippet: '\\section{Certifications}\n{{CERTIFICATIONS_BLOCK}}',
  },
]

export function extractPlaceholders(source: string): string[] {
  const matches = source.match(/\{\{[A-Z0-9_]+\}\}/g)
  if (!matches) return []
  return Array.from(new Set(matches))
}

export function checkPlaceholderCoverage(source: string) {
  const presentTokens = new Set(extractPlaceholders(source))
  
  const covered = STANDARD_PLACEHOLDERS.filter((p) => presentTokens.has(p.token))
  const missingRequired = STANDARD_PLACEHOLDERS.filter(
    (p) => p.required && !presentTokens.has(p.token)
  )
  const missingOptional = STANDARD_PLACEHOLDERS.filter(
    (p) => !p.required && !presentTokens.has(p.token)
  )
  const unknownTokens = Array.from(presentTokens).filter(
    (t) => !STANDARD_PLACEHOLDERS.some((p) => p.token === t)
  )

  return {
    presentTokens,
    covered,
    missingRequired,
    missingOptional,
    unknownTokens,
    isComplete: missingRequired.length === 0,
  }
}
