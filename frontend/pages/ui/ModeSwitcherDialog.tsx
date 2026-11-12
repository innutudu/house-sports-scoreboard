import { useState } from 'react'
import { ShieldCheck, UserCheck, Eye, KeyRound, Lock, Check, AlertCircle } from 'lucide-react'
import { Button } from '../../lib/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../lib/shadcn/dialog'
import { Input } from '../../lib/shadcn/input'
import { Label } from '../../lib/shadcn/label'
import type { AppMode } from './houses'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentMode: AppMode
  onSelectMode: (mode: AppMode) => void
}

const DEFAULT_PINS = {
  admin: '9999',
  judge: '1234',
}

export default function ModeSwitcherDialog({
  open,
  onOpenChange,
  currentMode,
  onSelectMode,
}: Props) {
  const [targetMode, setTargetMode] = useState<AppMode>(currentMode)
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleModeCardClick = (mode: AppMode) => {
    setTargetMode(mode)
    setError(null)
    setPin('')
    // If switching to user mode, can switch immediately
    if (mode === 'user') {
      onSelectMode('user')
      onOpenChange(false)
    }
  }

  const handleConfirm = () => {
    setError(null)
    if (targetMode === 'user') {
      onSelectMode('user')
      onOpenChange(false)
      return
    }

    const expectedPin = DEFAULT_PINS[targetMode]
    const entered = pin.trim().toLowerCase()

    if (
      entered === expectedPin ||
      (targetMode === 'admin' && (entered === 'admin' || entered === 'admin123')) ||
      (targetMode === 'judge' && (entered === 'judge' || entered === 'judge123'))
    ) {
      onSelectMode(targetMode)
      setPin('')
      onOpenChange(false)
    } else {
      setError(
        `Incorrect PIN for ${targetMode === 'admin' ? 'Admin' : 'Judges'} Mode. Please try again.`
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Switch Access Mode
          </DialogTitle>
          <DialogDescription>
            Select your role to access appropriate features. Spectators should use View Only mode.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2">
          {/* Mode Option Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* User Mode Card */}
            <div
              onClick={() => handleModeCardClick('user')}
              className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                targetMode === 'user'
                  ? 'border-slate-500 bg-slate-50 dark:bg-slate-900 shadow-sm'
                  : 'border-border hover:bg-muted/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  <Eye className="w-4 h-4" />
                </div>
                {targetMode === 'user' && <Check className="w-4 h-4 text-slate-700 dark:text-slate-300" />}
              </div>
              <div className="font-bold text-sm">User Mode</div>
              <div className="text-[11px] text-muted-foreground mt-1 leading-snug">
                View only. Real-time scores, standings, and instructions.
              </div>
              <div className="mt-2 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                No PIN needed
              </div>
            </div>

            {/* Judges Mode Card */}
            <div
              onClick={() => handleModeCardClick('judge')}
              className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                targetMode === 'judge'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 shadow-sm'
                  : 'border-border hover:bg-muted/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                  <UserCheck className="w-4 h-4" />
                </div>
                {targetMode === 'judge' && <Check className="w-4 h-4 text-blue-600" />}
              </div>
              <div className="font-bold text-sm">Judges Mode</div>
              <div className="text-[11px] text-muted-foreground mt-1 leading-snug">
                Score & name edits, 1-tap 1st/2nd/3rd position tagging.
              </div>
              <div className="mt-2 text-[10px] font-medium text-muted-foreground">
                PIN Protected
              </div>
            </div>

            {/* Admin Mode Card */}
            <div
              onClick={() => handleModeCardClick('admin')}
              className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                targetMode === 'admin'
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 shadow-sm'
                  : 'border-border hover:bg-muted/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                {targetMode === 'admin' && <Check className="w-4 h-4 text-emerald-600" />}
              </div>
              <div className="font-bold text-sm">Admin Mode</div>
              <div className="text-[11px] text-muted-foreground mt-1 leading-snug">
                Full access: Add/delete events, write and manage instructions.
              </div>
              <div className="mt-2 text-[10px] font-medium text-muted-foreground">
                PIN Protected
              </div>
            </div>
          </div>

          {/* PIN Input if Admin or Judge selected */}
          {targetMode !== 'user' && (
            <div className="rounded-lg border bg-muted/30 p-3.5 space-y-2 mt-3">
              <Label htmlFor="mode-pin" className="text-xs font-semibold flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-primary" />
                Enter {targetMode === 'admin' ? 'Admin' : 'Judges'} PIN to Confirm:
              </Label>
              <Input
                id="mode-pin"
                type="password"
                placeholder="Enter PIN"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value)
                  setError(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleConfirm()
                }}
                className="h-9 text-sm"
                autoFocus
              />
              {error && (
                <div className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className={
              targetMode === 'admin'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : targetMode === 'judge'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-slate-700 hover:bg-slate-800 text-white'
            }
          >
            Activate {targetMode === 'admin' ? 'Admin' : targetMode === 'judge' ? 'Judges' : 'User'} Mode
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
