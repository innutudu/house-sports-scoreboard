import { useEffect, useState } from 'react'
import { Loader2, Plus } from 'lucide-react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../lib/shadcn/select'
import { OFFICIAL_EVENTS, type EventStatus } from './houses'

const CATEGORIES = ['Track', 'Field - Throw', 'Field - Jump', 'Team', 'General']
const DIVISIONS = ['House wise Competition', 'Senior Boys', 'Junior Boys', 'Girls', 'General']

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  submitting: boolean
  onSubmit: (args: {
    name: string
    category: string
    division?: string
    eventDate: string
    status: EventStatus
  }) => void
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export default function AddEventDialog({ open, onOpenChange, submitting, onSubmit }: Props) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Track')
  const [division, setDivision] = useState('House wise Competition')
  const [date, setDate] = useState(todayIso())
  const [status, setStatus] = useState<EventStatus>('upcoming')

  useEffect(() => {
    if (open) {
      setName('')
      setCategory('Track')
      setDivision('House wise Competition')
      setDate(todayIso())
      setStatus('upcoming')
    }
  }, [open])

  const handleSelectPreset = (presetName: string) => {
    const found = OFFICIAL_EVENTS.find((e) => e.name === presetName)
    if (found) {
      setName(found.name)
      setCategory(found.category)
      setDivision(found.division)
    }
  }

  const handleSubmit = () => {
    if (!name.trim()) return
    onSubmit({
      name: name.trim(),
      category,
      division,
      eventDate: date || todayIso(),
      status,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Event to Score Sheet</DialogTitle>
          <DialogDescription>
            Choose from standard score sheet events or create a custom competition.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Quick preset selector */}
          <div>
            <Label className="text-xs text-muted-foreground">Quick Preset from Score Sheet</Label>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {OFFICIAL_EVENTS.map((ev) => (
                <button
                  key={ev.name}
                  type="button"
                  onClick={() => handleSelectPreset(ev.name)}
                  className={`text-[11px] px-2 py-1 rounded border transition-colors ${
                    name === ev.name
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/50 hover:bg-muted border-border text-foreground'
                  }`}
                >
                  {ev.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="event-name">Event Name</Label>
            <Input
              id="event-name"
              className="mt-1.5"
              placeholder="e.g. 100 Meters"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit()
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="event-category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="event-category" className="w-full mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="event-division">Division / Group</Label>
              <Select value={division} onValueChange={setDivision}>
                <SelectTrigger id="event-division" className="w-full mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIVISIONS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="event-date">Date</Label>
              <Input
                id="event-date"
                type="date"
                className="mt-1.5"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="event-status">Initial Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as EventStatus)}>
                <SelectTrigger id="event-status" className="w-full mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !name.trim()}>
            {submitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
            ) : (
              <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
            )}
            Add Event
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
