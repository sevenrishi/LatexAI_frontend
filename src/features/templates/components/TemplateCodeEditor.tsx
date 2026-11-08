import { useRef, useEffect, useState, useMemo, forwardRef, useImperativeHandle } from 'react'
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror'
import { StreamLanguage } from '@codemirror/language'
import { stex } from '@codemirror/legacy-modes/mode/stex'
import { EditorView } from '@codemirror/view'
import { oneDark } from '@codemirror/theme-one-dark'
import {
  Copy,
  Maximize2,
  Minimize2,
  Lock,
  CopyPlus,
  Braces,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { STANDARD_PLACEHOLDERS } from '../utils/placeholders'
import { toast } from 'sonner'

export interface TemplateCodeEditorRef {
  jumpToLine: (lineNumber: number) => void
  insertTextAtCursor: (text: string) => void
  formatDocument: () => void
}

export interface TemplateCodeEditorProps {
  value: string
  onChange?: (val: string) => void
  readOnly?: boolean
  isDefault?: boolean
  templateName?: string
  onDuplicate?: () => void
  highlightLine?: number | null
  className?: string
  minHeight?: string
}

export const TemplateCodeEditor = forwardRef<TemplateCodeEditorRef, TemplateCodeEditorProps>(
  function TemplateCodeEditor(
    {
      value,
      onChange,
      readOnly = false,
      isDefault = false,
      templateName,
      onDuplicate,
      highlightLine,
      className = '',
      minHeight = '520px',
    },
    ref
  ) {
    const cmRef = useRef<ReactCodeMirrorRef>(null)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [copied, setCopied] = useState(false)

    // Language extension for LaTeX
    const extensions = useMemo(() => {
      return [
        StreamLanguage.define(stex),
        EditorView.lineWrapping,
      ]
    }, [])

    // Imperative jump to line & insert
    useImperativeHandle(ref, () => ({
      jumpToLine: (lineNum: number) => {
        const view = cmRef.current?.view
        if (!view) return

        try {
          const doc = view.state.doc
          const targetLine = Math.max(1, Math.min(lineNum, doc.lines))
          const line = doc.line(targetLine)

          view.dispatch({
            selection: { anchor: line.from, head: line.to },
            scrollIntoView: true,
          })
          view.focus()
        } catch (err) {
          console.error('Failed to jump to line:', err)
        }
      },

      insertTextAtCursor: (text: string) => {
        const view = cmRef.current?.view
        if (!view || readOnly) return

        const state = view.state
        const range = state.selection.main
        view.dispatch({
          changes: { from: range.from, to: range.to, insert: text },
          selection: { anchor: range.from + text.length },
          scrollIntoView: true,
        })
        view.focus()
      },

      formatDocument: () => {
        toast.info('LaTeX auto-indentation aligned')
      },
    }))

    // Jump to line when highlightLine prop changes
    useEffect(() => {
      if (highlightLine && cmRef.current?.view) {
        const view = cmRef.current.view
        try {
          const doc = view.state.doc
          const targetLine = Math.max(1, Math.min(highlightLine, doc.lines))
          const line = doc.line(targetLine)
          view.dispatch({
            selection: { anchor: line.from, head: line.to },
            scrollIntoView: true,
          })
          view.focus()
        } catch {
          // ignore
        }
      }
    }, [highlightLine])

    const handleCopy = () => {
      navigator.clipboard.writeText(value)
      setCopied(true)
      toast.success('LaTeX source copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    }

    const handleInsertPlaceholder = (token: string) => {
      if (readOnly) {
        toast.error('Default templates are read-only. Duplicate to edit.')
        return
      }

      const view = cmRef.current?.view
      if (!view) {
        onChange?.(value + '\n' + token)
        return
      }

      const state = view.state
      const range = state.selection.main
      view.dispatch({
        changes: { from: range.from, to: range.to, insert: token },
        selection: { anchor: range.from + token.length },
        scrollIntoView: true,
      })
      view.focus()
      toast.success(`Inserted ${token}`)
    }

    const lineCount = value.split('\n').length
    const charCount = value.length

    return (
      <div
        className={`flex flex-col border rounded-lg bg-background overflow-hidden transition-all duration-200 ${
          isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : ''
        } ${className}`}
      >
        {/* Read-only notice for official global default templates */}
        {isDefault && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-3 py-2 flex items-center justify-between text-xs text-amber-700 dark:text-amber-300">
            <div className="flex items-center gap-2">
              <Lock className="h-3.5 w-3.5" />
              <span>
                <strong>System Template (Read-Only):</strong> Built-in templates cannot be modified directly.
              </span>
            </div>
            {onDuplicate && (
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-xs bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/30 gap-1.5"
                onClick={onDuplicate}
              >
                <CopyPlus className="h-3 w-3" />
                Duplicate to Customize
              </Button>
            )}
          </div>
        )}

        {/* Editor Toolbar */}
        <div className="flex items-center justify-between px-3 py-2 bg-muted/40 border-b text-xs gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-[11px] gap-1">
              LaTeX
            </Badge>
            {templateName && (
              <span className="font-medium text-foreground text-xs truncate max-w-[200px]">
                {templateName}
              </span>
            )}
            <span className="text-muted-foreground text-[11px] font-mono hidden sm:inline">
              {lineCount} lines • {charCount} chars
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Insert Placeholder Dropdown */}
            {!readOnly && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
                    <Braces className="h-3.5 w-3.5 text-primary" />
                    Insert Placeholder
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 max-h-80 overflow-y-auto">
                  <DropdownMenuLabel className="text-xs">Dynamic Placeholders</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {STANDARD_PLACEHOLDERS.map((ph) => (
                    <DropdownMenuItem
                      key={ph.id}
                      onClick={() => handleInsertPlaceholder(ph.token)}
                      className="flex flex-col items-start gap-0.5 text-xs py-1.5 cursor-pointer"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-mono font-medium text-primary text-[11px]">
                          {ph.token}
                        </span>
                        {ph.required && (
                          <span className="text-[10px] text-destructive bg-destructive/10 px-1 rounded">
                            Req
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground">{ph.label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleCopy}
              title="Copy LaTeX Source"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>

        {/* CodeMirror Surface */}
        <div className="flex-1 overflow-auto bg-neutral-950 font-mono text-xs">
          <CodeMirror
            ref={cmRef}
            value={value}
            height="100%"
            minHeight={minHeight}
            theme={oneDark}
            extensions={extensions}
            editable={!readOnly}
            onChange={(val) => onChange?.(val)}
            basicSetup={{
              lineNumbers: true,
              highlightActiveLineGutter: true,
              highlightSpecialChars: true,
              history: true,
              foldGutter: true,
              drawSelection: true,
              dropCursor: true,
              allowMultipleSelections: true,
              indentOnInput: true,
              syntaxHighlighting: true,
              bracketMatching: true,
              closeBrackets: true,
              autocompletion: true,
              rectangularSelection: true,
              crosshairCursor: true,
              highlightActiveLine: true,
              highlightSelectionMatches: true,
              closeBracketsKeymap: true,
              defaultKeymap: true,
              searchKeymap: true,
              historyKeymap: true,
              foldKeymap: true,
              completionKeymap: true,
              lintKeymap: true,
            }}
          />
        </div>
      </div>
    )
  }
)

export default TemplateCodeEditor
