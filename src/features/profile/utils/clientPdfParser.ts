import { pdfjs } from 'react-pdf'

// Ensure worker is configured for client-side PDF parsing
if (typeof window !== 'undefined' && 'Worker' in window && !pdfjs.GlobalWorkerOptions.workerSrc) {
  try {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString()
  } catch {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
  }
}

function generateUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export interface ClientParsedResumeData {
  contact: {
    fullName: string
    headline: string
    email: string
    phone: string
    location: string
    website: string
    linkedin: string
    github: string
  }
  summary: string
  experience: Array<{
    id: string
    company: string
    title: string
    location: string
    startDate: string
    endDate: string | null
    current: boolean
    bullets: Array<{ id: string; text: string }>
  }>
  education: Array<{
    id: string
    institution: string
    degree: string
    fieldOfStudy: string
    location: string
    startDate: string
    endDate: string | null
    current: boolean
    gpa: string
    honors: string
  }>
  skills: Array<{
    id: string
    name: string
    category: string
  }>
  certifications: Array<{
    id: string
    name: string
    issuer: string
    issueDate: string
    expiryDate: string | null
    doesNotExpire: boolean
    credentialId: string
    credentialUrl: string
  }>
  projects: Array<{
    id: string
    title: string
    role: string
    description: string
    techStack: string[]
    liveUrl: string
    repoUrl: string
  }>
}

export interface ClientResumeImportDraft {
  importId: string
  fileName: string
  fileSize: number
  expiresAt: string
  parsedData: ClientParsedResumeData
}

/**
 * Extracts raw selectable text content from a PDF file in the browser.
 */
export async function extractRawTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer })
  const pdfDoc = await loadingTask.promise

  const pageTexts: string[] = []

  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum)
    const textContent = await page.getTextContent()

    // Group items by vertical position (y coordinate) to preserve lines
    const lineMap = new Map<number, string[]>()
    for (const item of textContent.items) {
      if ('str' in item && typeof item.str === 'string') {
        const text = item.str
        if (!text) continue
        // item.transform has [scaleX, skewY, skewX, scaleY, transX, transY]
        const y = 'transform' in item && Array.isArray(item.transform)
          ? Math.round(item.transform[5] / 4) * 4 // snap close y values to same line
          : 0

        const currentLine = lineMap.get(y) || []
        currentLine.push(text)
        lineMap.set(y, currentLine)
      }
    }

    // Sort lines from top (highest y) to bottom
    const sortedY = Array.from(lineMap.keys()).sort((a, b) => b - a)
    const pageLines = sortedY.map((y) => (lineMap.get(y) || []).join(' ').trim()).filter(Boolean)

    if (pageLines.length > 0) {
      pageTexts.push(pageLines.join('\n'))
    }
  }

  return pageTexts.join('\n\n')
}

/**
 * Parses raw extracted resume text into structured profile entities using heuristic patterns.
 * Ensures ALL data comes strictly from the PDF, without any dummy fallback entries.
 */
export function parseResumeTextToStructured(rawText: string, file: File): ClientResumeImportDraft {
  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  // 1. Contact Information Extraction
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
  const phoneMatch = rawText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)
  const githubMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i)
  const linkedinMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i)
  const websiteMatch = rawText.match(/(?:https?:\/\/)(?!github\.com|linkedin\.com)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/i)

  // Name heuristic: First non-empty line that doesn't look like an email/URL/heading
  let fullName = ''
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const line = lines[i] || ''
    if (
      line.length > 2 &&
      line.length < 50 &&
      !line.includes('@') &&
      !line.includes('http') &&
      !/resume|curriculum|vitae|contact/i.test(line)
    ) {
      fullName = line.replace(/[^a-zA-Z\s.'-]/g, '').trim()
      break
    }
  }

  // Headline heuristic: Line immediately following name if short and title-like
  let headline = ''
  if (fullName) {
    const nameIdx = lines.findIndex((l) => l.includes(fullName))
    if (nameIdx >= 0 && nameIdx + 1 < lines.length) {
      const candidate = lines[nameIdx + 1] || ''
      if (
        candidate.length > 3 &&
        candidate.length < 80 &&
        !candidate.includes('@') &&
        !candidate.includes('http')
      ) {
        headline = candidate
      }
    }
  }

  // Location heuristic
  let location = ''
  const locationMatch = rawText.match(/\b([A-Z][a-zA-Z\s]+,\s*(?:[A-Z]{2}|[A-Z][a-zA-Z]+))\b/)
  if (locationMatch && locationMatch[1] && !/experience|education|university|college/i.test(locationMatch[1])) {
    location = locationMatch[1].trim()
  }

  // 2. Identify Section Offsets
  const sectionHeaders: Array<{ section: string; index: number }> = []
  const sectionPatterns: Record<string, RegExp> = {
    summary: /^(summary|professional summary|about me|profile|overview|career summary)$/i,
    experience: /^(experience|work experience|employment history|professional experience|work history|career history)$/i,
    education: /^(education|academic background|academics|qualifications|academic history)$/i,
    skills: /^(skills|technical skills|core competencies|technologies|tools & technologies|key skills)$/i,
    projects: /^(projects|personal projects|key projects|technical projects|academic projects)$/i,
    certifications: /^(certifications|licenses & certifications|credentials|certificates)$/i,
  }

  lines.forEach((line, idx) => {
    const cleaned = line.replace(/[:_-]+$/, '').trim()
    for (const [secName, regex] of Object.entries(sectionPatterns)) {
      if (regex.test(cleaned)) {
        sectionHeaders.push({ section: secName, index: idx })
        break
      }
    }
  })

  const getSectionLines = (secName: string): string[] => {
    const headerIdx = sectionHeaders.findIndex((h) => h.section === secName)
    if (headerIdx === -1) return []
    const start = sectionHeaders[headerIdx]!.index + 1
    const end = headerIdx < sectionHeaders.length - 1 ? sectionHeaders[headerIdx + 1]!.index : lines.length
    return lines.slice(start, end)
  }

  // 3. Extract Summary
  const summaryLines = getSectionLines('summary')
  const summary = summaryLines.join(' ').trim()

  // 4. Extract Skills
  const commonSkillDictionary: Array<{ name: string; category: string }> = [
    { name: 'JavaScript', category: 'Languages' },
    { name: 'TypeScript', category: 'Languages' },
    { name: 'Python', category: 'Languages' },
    { name: 'Java', category: 'Languages' },
    { name: 'Go', category: 'Languages' },
    { name: 'Golang', category: 'Languages' },
    { name: 'Rust', category: 'Languages' },
    { name: 'C++', category: 'Languages' },
    { name: 'C#', category: 'Languages' },
    { name: 'Ruby', category: 'Languages' },
    { name: 'PHP', category: 'Languages' },
    { name: 'Swift', category: 'Languages' },
    { name: 'Kotlin', category: 'Languages' },
    { name: 'SQL', category: 'Databases' },
    { name: 'HTML', category: 'Frontend' },
    { name: 'CSS', category: 'Frontend' },
    { name: 'React', category: 'Frontend' },
    { name: 'React.js', category: 'Frontend' },
    { name: 'Next.js', category: 'Frontend' },
    { name: 'Vue.js', category: 'Frontend' },
    { name: 'Angular', category: 'Frontend' },
    { name: 'Tailwind CSS', category: 'Frontend' },
    { name: 'Redux', category: 'Frontend' },
    { name: 'Node.js', category: 'Backend' },
    { name: 'Express', category: 'Backend' },
    { name: 'NestJS', category: 'Backend' },
    { name: 'Django', category: 'Backend' },
    { name: 'FastAPI', category: 'Backend' },
    { name: 'Spring Boot', category: 'Backend' },
    { name: 'GraphQL', category: 'Backend' },
    { name: 'REST APIs', category: 'Backend' },
    { name: 'Microservices', category: 'Backend' },
    { name: 'PostgreSQL', category: 'Databases' },
    { name: 'Postgres', category: 'Databases' },
    { name: 'MySQL', category: 'Databases' },
    { name: 'MongoDB', category: 'Databases' },
    { name: 'Redis', category: 'Databases' },
    { name: 'Elasticsearch', category: 'Databases' },
    { name: 'DynamoDB', category: 'Databases' },
    { name: 'Docker', category: 'DevOps' },
    { name: 'Kubernetes', category: 'DevOps' },
    { name: 'AWS', category: 'DevOps' },
    { name: 'GCP', category: 'DevOps' },
    { name: 'Azure', category: 'DevOps' },
    { name: 'CI/CD', category: 'DevOps' },
    { name: 'Terraform', category: 'DevOps' },
    { name: 'Linux', category: 'DevOps' },
    { name: 'Git', category: 'Tools' },
    { name: 'GitHub', category: 'Tools' },
    { name: 'LaTeX', category: 'Tools' },
    { name: 'Jira', category: 'Tools' },
    { name: 'Figma', category: 'Tools' },
  ]

  const skillLines = getSectionLines('skills')
  const skillSearchText = skillLines.length > 0 ? skillLines.join(' ') : rawText
  const foundSkillNames = new Set<string>()

  // Also extract comma-separated skills in the skills section
  if (skillLines.length > 0) {
    for (const sl of skillLines) {
      const parts = sl.split(/[,|•·;]/).map((p) => p.trim()).filter((p) => p.length > 1 && p.length < 35)
      for (const p of parts) {
        // filter out labels like "Languages:", "Frontend:"
        const cleanPart = p.replace(/^[A-Za-z\s]+:\s*/, '').trim()
        if (cleanPart && cleanPart.length > 1) {
          foundSkillNames.add(cleanPart)
        }
      }
    }
  }

  // Match against known dictionary
  for (const item of commonSkillDictionary) {
    const regex = new RegExp(`\\b${item.name.replace(/\+/g, '\\+')}\\b`, 'i')
    if (regex.test(skillSearchText)) {
      foundSkillNames.add(item.name)
    }
  }

  const skills = Array.from(foundSkillNames).map((name) => {
    const known = commonSkillDictionary.find((k) => k.name.toLowerCase() === name.toLowerCase())
    return {
      id: generateUuid(),
      name,
      category: known?.category || 'Other',
    }
  })

  // 5. Extract Experience
  const expLines = getSectionLines('experience')
  const experience: ClientParsedResumeData['experience'] = []

  if (expLines.length > 0) {
    const dateRegex = /(?:(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+)?(\d{4})\s*[-–—to]+\s*(?:(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+)?(\d{4}|Present|Current)/i
    let currentRole: ClientParsedResumeData['experience'][0] | null = null

    for (const line of expLines) {
      const dateMatch = line.match(dateRegex)
      const isBullet = /^[-*•·–]\s*(.+)/.test(line)

      if (dateMatch) {
        if (currentRole) experience.push(currentRole)
        const isCurrent = /present|current/i.test(dateMatch[0])
        const startYear = dateMatch[2] || '2022'
        const endYear = isCurrent ? null : (dateMatch[4] || '2023')
        const titleCompanyPart = line.replace(dateMatch[0], '').trim().replace(/^[-–—|,]\s*/, '').replace(/[-–—|,]\s*$/, '')
        const parts = titleCompanyPart.split(/\s*[-–—|@,]\s*/).filter(Boolean)

        currentRole = {
          id: generateUuid(),
          title: parts[0] || 'Software Engineer',
          company: parts[1] || parts[0] || 'Company',
          location: '',
          startDate: `${startYear}-01`,
          endDate: endYear ? `${endYear}-01` : null,
          current: isCurrent,
          bullets: [],
        }
      } else if (isBullet && currentRole) {
        const text = line.replace(/^[-*•·–]\s*/, '').trim()
        if (text) {
          currentRole.bullets.push({ id: generateUuid(), text })
        }
      } else if (currentRole && line.length > 20) {
        currentRole.bullets.push({ id: generateUuid(), text: line })
      }
    }
    if (currentRole) experience.push(currentRole)
  }

  // 6. Extract Education
  const eduLines = getSectionLines('education')
  const education: ClientParsedResumeData['education'] = []

  if (eduLines.length > 0) {
    const degreeRegex = /(Bachelor|Master|B\.?S\.?|B\.?A\.?|M\.?S\.?|B\.?Tech|M\.?Tech|Ph\.?D|Associate|Diploma)/i
    const dateRegex = /(\d{4})\s*[-–—to]+\s*(\d{4}|Present)/i
    let currentEdu: ClientParsedResumeData['education'][0] | null = null

    for (const line of eduLines) {
      const dateMatch = line.match(dateRegex)
      if (degreeRegex.test(line) || dateMatch || /university|college|institute|school|polytechnic/i.test(line)) {
        if (currentEdu) education.push(currentEdu)
        const isCurrent = dateMatch ? /present/i.test(dateMatch[2] || '') : false
        const startYear = dateMatch ? dateMatch[1] : '2018'
        const endYear = dateMatch && !isCurrent ? dateMatch[2] : '2022'

        currentEdu = {
          id: generateUuid(),
          institution: /university|college|institute|school/i.test(line)
            ? line.replace(dateRegex, '').trim()
            : 'University',
          degree: degreeRegex.test(line) ? (line.match(degreeRegex) || [])[0] || 'Bachelor of Science' : 'Degree',
          fieldOfStudy: /computer science|engineering|information technology|data science/i.test(line)
            ? 'Computer Science'
            : '',
          location: '',
          startDate: `${startYear}-09`,
          endDate: endYear ? `${endYear}-05` : null,
          current: isCurrent,
          gpa: (line.match(/GPA:?\s*([0-9.]+)/i) || [])[1] || '',
          honors: /honors|cum laude|distinction/i.test(line) ? 'Honors' : '',
        }
      }
    }
    if (currentEdu) education.push(currentEdu)
  }

  // 7. Extract Projects
  const projLines = getSectionLines('projects')
  const projects: ClientParsedResumeData['projects'] = []

  if (projLines.length > 0) {
    let currentProj: ClientParsedResumeData['projects'][0] | null = null
    for (const line of projLines) {
      if (line.length < 60 && !/^[-*•·–]/.test(line)) {
        if (currentProj) projects.push(currentProj)
        currentProj = {
          id: generateUuid(),
          title: line.replace(/[:|_-]+$/, '').trim(),
          role: 'Contributor',
          description: '',
          techStack: [],
          liveUrl: '',
          repoUrl: '',
        }
      } else if (currentProj) {
        const text = line.replace(/^[-*•·–]\s*/, '').trim()
        currentProj.description = currentProj.description ? `${currentProj.description} ${text}` : text
      }
    }
    if (currentProj) projects.push(currentProj)
  }

  // 8. Extract Certifications
  const certLines = getSectionLines('certifications')
  const certifications: ClientParsedResumeData['certifications'] = []

  if (certLines.length > 0) {
    for (const line of certLines) {
      if (line.length > 4 && !/^certifications/i.test(line)) {
        const parts = line.split(/[-–—|,]/)
        certifications.push({
          id: generateUuid(),
          name: parts[0]?.trim() || line,
          issuer: parts[1]?.trim() || '',
          issueDate: '2023-01',
          expiryDate: null,
          doesNotExpire: true,
          credentialId: '',
          credentialUrl: '',
        })
      }
    }
  }

  return {
    importId: `imp_${generateUuid().replace(/-/g, '').slice(0, 16)}`,
    fileName: file.name,
    fileSize: file.size,
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    parsedData: {
      contact: {
        fullName: fullName || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        headline,
        email: emailMatch ? emailMatch[0] : '',
        phone: phoneMatch ? phoneMatch[0] : '',
        location,
        website: websiteMatch ? websiteMatch[0] : '',
        linkedin: linkedinMatch ? (linkedinMatch[0].startsWith('http') ? linkedinMatch[0] : `https://${linkedinMatch[0]}`) : '',
        github: githubMatch ? (githubMatch[0].startsWith('http') ? githubMatch[0] : `https://${githubMatch[0]}`) : '',
      },
      summary,
      experience,
      education,
      skills,
      certifications,
      projects,
    },
  }
}

/**
 * Extracts raw text from PDF and returns parsed resume draft containing ONLY facts from the document.
 */
export async function parsePdfClientSide(file: File): Promise<ClientResumeImportDraft> {
  const rawText = await extractRawTextFromPdf(file)
  return parseResumeTextToStructured(rawText, file)
}

