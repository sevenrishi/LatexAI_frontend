import { Sun, Moon, Laptop, Palette, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useUIStore, type Theme } from '@/store/uiStore'

export function AppearanceSection() {
  const currentTheme = useUIStore((s) => s.theme)
  const setTheme = useUIStore((s) => s.setTheme)

  const themes: Array<{
    id: Theme
    title: string
    description: string
    icon: typeof Sun
    previewClass: string
  }> = [
    {
      id: 'light',
      title: 'Light Mode',
      description: 'Clean, high-contrast crisp white background optimized for daytime document review',
      icon: Sun,
      previewClass: 'bg-white border-zinc-200 text-zinc-900',
    },
    {
      id: 'dark',
      title: 'Dark Mode',
      description: 'Modern sleek dark palette reducing eye fatigue during late-night job applications',
      icon: Moon,
      previewClass: 'bg-zinc-950 border-zinc-800 text-zinc-100',
    },
    {
      id: 'system',
      title: 'System Preference',
      description: 'Automatically synchronizes with your operating system color scheme',
      icon: Laptop,
      previewClass: 'bg-gradient-to-r from-white to-zinc-950 border-zinc-400 text-zinc-800',
    },
  ]

  return (
    <Card className="border-border/70 shadow-xs" data-testid="appearance-section">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            <span>Appearance &amp; Theme</span>
          </CardTitle>
          <Badge variant="outline" className="text-xs uppercase font-mono tracking-wider">
            Active: {currentTheme}
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Select your preferred interface styling. Changes are applied instantly and persisted to local storage.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {themes.map((t) => {
            const Icon = t.icon
            const isSelected = currentTheme === t.id

            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                className={`relative flex flex-col items-start p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/20 bg-primary/5 shadow-xs'
                    : 'border-border/70 hover:border-border hover:bg-muted/30 bg-card'
                }`}
                data-testid={`theme-option-${t.id}`}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  {isSelected && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </div>
                  )}
                </div>

                <span className="font-bold text-sm text-foreground mb-1">{t.title}</span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{t.description}</p>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export default AppearanceSection
