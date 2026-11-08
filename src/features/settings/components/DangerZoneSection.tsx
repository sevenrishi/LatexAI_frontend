import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/features/auth/api/authApi'
import { toast } from 'sonner'

export function DangerZoneSection() {
  const navigate = useNavigate()
  const clearAuth = useAuthStore((s) => s.clearAuth)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const isConfirmed = confirmText === 'DELETE'

  const handleDeleteAccount = async () => {
    if (!isConfirmed) return
    setIsDeleting(true)
    try {
      await authApi.deleteAccount()
      clearAuth()
      setDialogOpen(false)
      toast.success('Your account and all associated data have been permanently deleted.')
      navigate('/')
    } catch {
      toast.error('Failed to delete account. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleOpenDialog = () => {
    setConfirmText('')
    setDialogOpen(true)
  }

  return (
    <>
      <Card
        className="border-destructive/40 bg-destructive/5 shadow-xs"
        data-testid="danger-zone-section"
      >
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <CardTitle className="text-base font-bold text-destructive">Danger Zone</CardTitle>
          </div>
          <CardDescription className="text-xs text-destructive/90">
            Permanently delete your account and all associated data. This action is irreversible and immediate.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Deleting your account will immediately purge your verified profile knowledge base, work history, customized LaTeX templates, and all historical resume PDF compilations from our databases and storage buckets.
          </p>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleOpenDialog}
            className="text-xs gap-1.5 font-semibold"
            data-testid="open-delete-account-dialog"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete Account</span>
          </Button>
        </CardContent>
      </Card>

      {/* Typed-DELETE Confirmation Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md" data-testid="typed-delete-dialog">
          <DialogHeader className="space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive mx-auto sm:mx-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle className="text-base font-bold text-destructive">
              Permanently Delete Account?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              This action <strong>cannot be undone</strong>. Your user account, profile knowledge base, custom templates, and all generated LaTeX resumes will be permanently removed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <p className="text-xs font-medium text-foreground">
              Please type <code className="font-mono font-bold text-destructive px-1.5 py-0.5 rounded bg-destructive/10">DELETE</code> to confirm account deletion:
            </p>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="text-xs font-mono"
              autoFocus
              data-testid="input-typed-delete"
            />
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDialogOpen(false)}
              disabled={isDeleting}
              className="text-xs"
              data-testid="cancel-delete-account-btn"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDeleteAccount}
              disabled={!isConfirmed || isDeleting}
              className="text-xs gap-1.5 font-semibold"
              data-testid="confirm-typed-delete-btn"
            >
              {isDeleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              <span>Permanently Delete My Account</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default DangerZoneSection
