import { TemplateLintIssue } from '@/types/template'
import { checkPlaceholderCoverage } from './placeholders'

const DANGEROUS_COMMANDS: Array<{ pattern: RegExp; rule: string; message: string }> = [
  {
    pattern: /\\write18(?![a-zA-Z])/i,
    rule: 'no-shell-escape',
    message: 'Dangerous command \\write18 detected. Shell escape is prohibited for security.',
  },
  {
    pattern: /\\(?:sys_shell|ShellEscape)(?![a-zA-Z])/i,
    rule: 'no-shell-escape',
    message: 'System shell execution commands are blocked.',
  },
  {
    pattern: /\\(?:openin|openout|read|catcode)(?![a-zA-Z])/i,
    rule: 'no-io-primitives',
    message: 'Low-level TeX I/O and primitive mutations (\\openin, \\openout, \\read, \\catcode) are forbidden.',
  },
  {
    pattern: /\\(?:input|include)\s*\{([^}]+)\}/i,
    rule: 'no-external-files',
    message: 'External file inclusion (\\input, \\include) is restricted. Templates must be self-contained.',
  },
  {
    pattern: /\\immediate(?![a-zA-Z])/i,
    rule: 'no-immediate-io',
    message: '\\immediate execution commands are not permitted in sandboxed compilation.',
  },
]

export function lintTemplate(latexSource: string): TemplateLintIssue[] {
  const issues: TemplateLintIssue[] = []
  const lines = latexSource.split('\n')

  // 1. Structure Checks
  if (!latexSource.includes('\\documentclass')) {
    issues.push({
      id: 'missing-documentclass',
      type: 'error',
      rule: 'document-structure',
      message: 'Template is missing \\documentclass definition.',
      line: 1,
    })
  }

  const hasBeginDoc = latexSource.includes('\\begin{document}')
  const hasEndDoc = latexSource.includes('\\end{document}')

  if (!hasBeginDoc) {
    issues.push({
      id: 'missing-begin-document',
      type: 'error',
      rule: 'document-structure',
      message: 'Missing \\begin{document} declaration.',
      line: lines.length > 0 ? lines.length : 1,
    })
  }

  if (!hasEndDoc) {
    issues.push({
      id: 'missing-end-document',
      type: 'error',
      rule: 'document-structure',
      message: 'Missing \\end{document} declaration.',
      line: lines.length,
    })
  }

  // 2. Line by line security and syntax checks
  lines.forEach((lineText, index) => {
    const lineNum = index + 1

    // Skip commented lines
    const trimmed = lineText.trim()
    if (trimmed.startsWith('%')) return

    // Dangerous command checks
    for (const danger of DANGEROUS_COMMANDS) {
      const match = lineText.match(danger.pattern)
      if (match && match.index !== undefined) {
        issues.push({
          id: `${danger.rule}-${lineNum}`,
          type: 'error',
          rule: danger.rule,
          message: danger.message,
          line: lineNum,
          column: match.index + 1,
          codeSnippet: lineText.trim(),
        })
      }
    }

    // Check for hardcoded personal info warnings
    if (/\b(?:[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)\b/.test(lineText) && !lineText.includes('{{')) {
      issues.push({
        id: `hardcoded-email-${lineNum}`,
        type: 'warning',
        rule: 'dynamic-placeholders',
        message: 'Hardcoded email detected. Use {{CONTACT_BLOCK}} instead for dynamic profile injection.',
        line: lineNum,
        codeSnippet: lineText.trim(),
      })
    }
  })

  // 3. Braces matching check
  let openBraces = 0
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.trim().startsWith('%')) continue
    for (let charIndex = 0; charIndex < line.length; charIndex++) {
      if (line[charIndex] === '{' && (charIndex === 0 || line[charIndex - 1] !== '\\')) {
        openBraces++
      } else if (line[charIndex] === '}' && (charIndex === 0 || line[charIndex - 1] !== '\\')) {
        openBraces--
        if (openBraces < 0) {
          issues.push({
            id: `unmatched-closing-brace-${i + 1}`,
            type: 'error',
            rule: 'syntax-braces',
            message: 'Unmatched closing brace "}" detected.',
            line: i + 1,
            column: charIndex + 1,
            codeSnippet: line.trim(),
          })
          openBraces = 0
        }
      }
    }
  }

  if (openBraces > 0) {
    issues.push({
      id: 'unclosed-braces',
      type: 'warning',
      rule: 'syntax-braces',
      message: `${openBraces} unclosed opening brace(s) "{" in document. Check matching brackets.`,
      line: lines.length,
    })
  }

  // 4. Placeholder Checks
  const coverage = checkPlaceholderCoverage(latexSource)

  coverage.missingRequired.forEach((placeholder) => {
    issues.push({
      id: `missing-placeholder-${placeholder.id}`,
      type: 'warning',
      rule: 'required-placeholder',
      message: `Missing required placeholder: ${placeholder.token} (${placeholder.label}).`,
    })
  })

  coverage.unknownTokens.forEach((token) => {
    issues.push({
      id: `unknown-token-${token}`,
      type: 'info',
      rule: 'custom-placeholder',
      message: `Custom or unrecognized placeholder token ${token}. Ensure it is supported by the renderer.`,
    })
  })

  return issues
}
