import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { CertificationDialog } from './CertificationDialog'
import { Plus, Award, Calendar, ExternalLink, Pencil, Trash2 } from 'lucide-react'
import type { FullProfile, CertificationItem } from '@/types/profile'
import { useCertificationMutations } from '../hooks/useProfile'

interface CertificationsSectionProps {
  profile: FullProfile
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return ''
  const [year, month] = dateStr.split('-')
  if (!month) return year
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const mIdx = parseInt(month, 10) - 1
  return `${monthNames[mIdx] || month} ${year}`
}

export function CertificationsSection({ profile }: CertificationsSectionProps) {
  const { saveCertification, deleteCertification } = useCertificationMutations()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CertificationItem | null>(null)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)

  const items = profile.certifications || []

  const handleOpenAdd = () => {
    setEditingItem(null)
    setDialogOpen(true)
  }

  const handleOpenEdit = (item: CertificationItem) => {
    setEditingItem(item)
    setDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    await deleteCertification.mutateAsync(itemToDelete)
    setItemToDelete(null)
  }

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <CardTitle>Certifications & Licenses</CardTitle>
          <CardDescription>
            Verified credentials from cloud providers, professional bodies, and accredited training programs.
          </CardDescription>
        </div>
        <Button onClick={handleOpenAdd} className="gap-1.5 shrink-0">
          <Plus className="h-4 w-4" />
          Add Certification
        </Button>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
            <div className="rounded-full bg-primary/10 p-3 text-primary mb-3">
              <Award className="h-6 w-6" />
            </div>
            <h4 className="text-base font-semibold">No certifications added yet</h4>
            <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
              Stand out to hiring managers by adding relevant cloud, security, or leadership credentials.
            </p>
            <Button variant="outline" size="sm" onClick={handleOpenAdd} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Add Your First Certification
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-xl border border-border bg-card/60 p-4 transition-all hover:border-border/90 hover:shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-foreground leading-snug">{item.name}</h4>
                    <p className="text-xs font-medium text-muted-foreground">{item.issuer}</p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEdit(item)}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      aria-label="Edit certification"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setItemToDelete(item.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      aria-label="Delete certification"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1 text-xs text-muted-foreground border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Issued: {formatDate(item.issueDate)}
                    </span>
                    {item.doesNotExpire ? (
                      <Badge variant="outline" className="text-[10px] py-0">
                        No Expiration
                      </Badge>
                    ) : item.expiryDate ? (
                      <span className="text-[11px]">Expires: {formatDate(item.expiryDate)}</span>
                    ) : null}
                  </div>

                  {item.credentialId && (
                    <div className="text-[11px] truncate text-muted-foreground/80 font-mono">
                      ID: {item.credentialId}
                    </div>
                  )}

                  {item.credentialUrl && (
                    <a
                      href={item.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Verify Credential
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <CertificationDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          item={editingItem}
          onSave={async (item) => {
            await saveCertification.mutateAsync(item)
          }}
        />

        <ConfirmDialog
          open={Boolean(itemToDelete)}
          onOpenChange={(open) => !open && setItemToDelete(null)}
          title="Delete Certification Entry"
          description="Are you sure you want to remove this certification from your knowledge base?"
          confirmText="Delete Certification"
          variant="destructive"
          onConfirm={handleConfirmDelete}
        />
      </CardContent>
    </Card>
  )
}
