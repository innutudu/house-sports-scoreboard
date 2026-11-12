import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../lib/shadcn/dialog'
import { Button } from '../../lib/shadcn/button'
import { Input } from '../../lib/shadcn/input'
import { AlertTriangle, RotateCcw, ShieldCheck, CheckCircle2 } from 'lucide-react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onReset: () => Promise<void>
  resetting?: boolean
}

const ADMIN_PIN = '9999'

export default function SecretResetDialog({
  open,
  onOpenChange,
  onReset,
  resetting = false,
}: Props) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleClose = () => {
    if (resetting) return
    setPin('')
    setError('')
    setSuccess(false)
    onOpenChange(false)
  }

  const handleConfirm = async () => {
    const trimmed = pin.trim()
    if (trimmed !== ADMIN_PIN && trimmed.toUpperCase() !== 'RESET') {
      setError('Incorrect Admin PIN. Please enter the administrator PIN to confirm.')
      return
    }

    try {
      setError('')
      await onReset()
      setSuccess(true)
      setTimeout(() => {
        handleClose()
      }, 1500)
    } catch (err: any) {
      setError(err?.message || 'Failed to reset scores.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400 flex items-center justify-center mb-2 mx-auto sm:mx-0 shadow-sm border border-red-200">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <DialogTitle className="text-lg font-bold text-red-600 dark:text-red-400">
            Secret Meet Reset (Fresh Start)
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            This administrative tool wipes all demo and pre-filled data so the official sports meet can begin with a clean zero scoreboard.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-6 flex flex-col items-center justify-center text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-foreground">Scoreboard Reset to Zero!</h4>
            <p className="text-xs text-muted-foreground max-w-xs">
              All 4 houses are at 0 points. All events are ready for judges on sports day.
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="p-3 rounded-lg border border-red-200 bg-red-50/60 dark:bg-red-950/30 text-xs space-y-2">
              <div className="font-bold text-red-800 dark:text-red-300 flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" />
                <span>The following will be reset:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground text-[11px] pl-1">
                <li>
                  <strong className="text-foreground">House Scores:</strong> Britto, Campion, Kostka, Loyola reset to <strong>0 pts</strong>.
                </li>
                <li>
                  <strong className="text-foreground">Event Status:</strong> All events marked <strong>Upcoming</strong>.
                </li>
                <li>
                  <strong className="text-foreground">Judge Entries:</strong> All student names, times, notes, and positions cleared.
                </li>
                <li>
                  <strong className="text-foreground">Cloud Sync:</strong> Synchronized live across all devices via Supabase.
                </li>
              </ul>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Enter Admin PIN to confirm:</span>
                <span className="text-[10px] text-muted-foreground font-mono">Protected</span>
              </label>
              <div className="relative">
                <Input
                  type="password"
                  placeholder="Enter Admin PIN"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value)
                    setError('')
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleConfirm()
                  }}
                  className="font-mono text-center tracking-widest text-sm"
                  autoFocus
                />
              </div>
              {error && (
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                  {error}
                </p>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {!success && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClose}
                disabled={resetting}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirm}
                disabled={resetting || !pin.trim()}
                className="text-xs bg-red-600 hover:bg-red-700 text-white font-bold gap-1.5"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
                <span>{resetting ? 'Resetting...' : 'Yes, Reset All to 0'}</span>
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
