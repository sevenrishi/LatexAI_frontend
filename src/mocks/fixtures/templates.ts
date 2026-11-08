import { Template } from '@/types/template'

export const mockTemplates: Template[] = [
  {
    id: 'tpl_default_swe',
    name: 'Modern Software Engineer',
    slug: 'modern-swe',
    description: 'ATS-optimized single column layout with clear hierarchy, Computer Modern font, and high ATS readability.',
    category: 'Engineering',
    isDefault: true,
    isActive: true,
    latexSource: `\\documentclass[letterpaper,10pt]{article}
\\usepackage[margin=0.7in]{geometry}
\\usepackage{hyperref}
\\usepackage{enumitem}

\\pagestyle{empty}
\\raggedbottom
\\raggedright

\\begin{document}

{\\Huge \\textbf{{{FULL_NAME}}}}\\\\
\\vspace{3pt}
{{CONTACT_BLOCK}}

\\vspace{10pt}
\\section*{Professional Summary}
\\hrule
\\vspace{4pt}
{{SUMMARY}}

\\vspace{10pt}
\\section*{Technical Skills}
\\hrule
\\vspace{4pt}
{{SKILLS_BLOCK}}

\\vspace{10pt}
\\section*{Experience}
\\hrule
\\vspace{4pt}
{{EXPERIENCE_BLOCK}}

\\vspace{10pt}
\\section*{Education}
\\hrule
\\vspace{4pt}
{{EDUCATION_BLOCK}}

\\vspace{10pt}
\\section*{Projects}
\\hrule
\\vspace{4pt}
{{PROJECTS_BLOCK}}

\\end{document}
`,
    placeholders: [
      '{{FULL_NAME}}',
      '{{CONTACT_BLOCK}}',
      '{{SUMMARY}}',
      '{{SKILLS_BLOCK}}',
      '{{EXPERIENCE_BLOCK}}',
      '{{EDUCATION_BLOCK}}',
      '{{PROJECTS_BLOCK}}',
    ],
  },
  {
    id: 'tpl_academic',
    name: 'Academic & Research Scholar',
    slug: 'academic-research',
    description: 'Two-page compatible layout with publication, research credentials, and thesis honors blocks.',
    category: 'Research',
    isDefault: true,
    isActive: false,
    latexSource: `\\documentclass[letterpaper,11pt]{article}
\\usepackage[margin=0.8in]{geometry}
\\usepackage{hyperref}

\\pagestyle{empty}

\\begin{document}

\\begin{center}
{\\Large \\textbf{{{FULL_NAME}}}}\\\\[3pt]
{{CONTACT_BLOCK}}
\\end{center}

\\section*{Research Summary}
\\hrule
\\vspace{4pt}
{{SUMMARY}}

\\section*{Education & Honors}
\\hrule
\\vspace{4pt}
{{EDUCATION_BLOCK}}

\\section*{Academic Experience}
\\hrule
\\vspace{4pt}
{{EXPERIENCE_BLOCK}}

\\section*{Core Competencies}
\\hrule
\\vspace{4pt}
{{SKILLS_BLOCK}}

\\section*{Certifications & Grants}
\\hrule
\\vspace{4pt}
{{CERTIFICATIONS_BLOCK}}

\\end{document}
`,
    placeholders: [
      '{{FULL_NAME}}',
      '{{CONTACT_BLOCK}}',
      '{{SUMMARY}}',
      '{{EDUCATION_BLOCK}}',
      '{{EXPERIENCE_BLOCK}}',
      '{{SKILLS_BLOCK}}',
      '{{CERTIFICATIONS_BLOCK}}',
    ],
  },
  {
    id: 'tpl_minimalist',
    name: 'Executive Minimalist',
    slug: 'executive-minimalist',
    description: 'Compact typography maximizing quantified impact metrics, revenue leadership, and board summaries.',
    category: 'Executive',
    isDefault: true,
    isActive: false,
    latexSource: `\\documentclass[letterpaper,10pt]{article}
\\usepackage[margin=0.65in]{geometry}
\\usepackage{hyperref}

\\pagestyle{empty}

\\begin{document}

{\\LARGE \\textbf{{{FULL_NAME}}}}\\\\
{{CONTACT_BLOCK}}

\\vspace{8pt}
\\section*{Executive Profile}
{{SUMMARY}}

\\vspace{8pt}
\\section*{Leadership & Professional Experience}
{{EXPERIENCE_BLOCK}}

\\vspace{8pt}
\\section*{Strategic Competencies}
{{SKILLS_BLOCK}}

\\vspace{8pt}
\\section*{Education & Credentials}
{{EDUCATION_BLOCK}}

\\end{document}
`,
    placeholders: [
      '{{FULL_NAME}}',
      '{{CONTACT_BLOCK}}',
      '{{SUMMARY}}',
      '{{EXPERIENCE_BLOCK}}',
      '{{SKILLS_BLOCK}}',
      '{{EDUCATION_BLOCK}}',
    ],
  },
  {
    id: 'tpl_custom_faang',
    name: 'Senior Systems Architect (Custom)',
    slug: 'custom-faang-systems',
    description: 'Tuned for distributed systems roles with extended technical stack matrix and patent citations.',
    category: 'Engineering',
    isDefault: false,
    isActive: false,
    latexSource: `\\documentclass[letterpaper,10pt]{article}
\\usepackage[margin=0.7in]{geometry}
\\usepackage{hyperref}

\\begin{document}

{\\huge \\textbf{{{FULL_NAME}}}}\\\\
{{CONTACT_BLOCK}}

\\section*{Target Summary}
{{SUMMARY}}

\\section*{Infrastructure Experience}
{{EXPERIENCE_BLOCK}}

\\section*{System Design & Skills}
{{SKILLS_BLOCK}}

\\section*{Selected Projects}
{{PROJECTS_BLOCK}}

\\section*{Education}
{{EDUCATION_BLOCK}}

\\end{document}
`,
    placeholders: [
      '{{FULL_NAME}}',
      '{{CONTACT_BLOCK}}',
      '{{SUMMARY}}',
      '{{EXPERIENCE_BLOCK}}',
      '{{SKILLS_BLOCK}}',
      '{{PROJECTS_BLOCK}}',
      '{{EDUCATION_BLOCK}}',
    ],
  },
]
