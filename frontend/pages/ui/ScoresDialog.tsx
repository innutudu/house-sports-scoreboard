import { useEffect, useState } from 'react'
import { Loader2, Trophy, Medal, Award, Sparkles } from 'lucide-react'
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
import {
  houseStyle,
  type EventStatus,
  type HouseStanding,
  type ScoreboardEvent,
  type PodiumWinner,
} from './houses'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  houses: HouseStanding[]
  event: ScoreboardEvent | null
  submitting: boolean
  onSubmit: (args: {
    eventId: number
    status: EventStatus
    scores: { houseId: number; points: number }[]
    podium?: PodiumWinner[]
  }) => void
}

export default function ScoresDialog({
  open,
  onOpenChange,
  houses,
  event,
  submitting,
  onSubmit,
}: Props) {
  const [status, setStatus] = useState<EventStatus>('upcoming')
  const [values, setValues] = useState<Record<number, string>>({})

  // 1st, 2nd, 3rd student podium entries
  const [firstStudent, setFirstStudent] = useState('')
  const [firstHouse, setFirstHouse] = useState<number | ''>('')
  const [firstRecord, setFirstRecord] = useState('')

  const [secondStudent, setSecondStudent] = useState('')
  const [secondHouse, setSecondHouse] = useState<number | ''>('')
  const [secondRecord, setSecondRecord] = useState('')

  const [thirdStudent, setThirdStudent] = useState('')
  const [thirdHouse, setThirdHouse] = useState<number | ''>('')
  const [thirdRecord, setThirdRecord] = useState('')

  useEffect(() => {
    if (!open || !event) return
    setStatus(event.status)

    // Load house points
    const next: Record<number, string> = {}
    for (const house of houses) {
      const result = event.results.find((r) => r.house_id === house.id)
      next[house.id] = result ? String(result.points) : ''
    }
    setValues(next)

    // Load podium
    const p1 = event.podium?.find((p) => p.position === 1)
    const p2 = event.podium?.find((p) => p.position === 2)
    const p3 = event.podium?.find((p) => p.position === 3)

    setFirstStudent(p1?.student_name || '')
    setFirstHouse(p1?.house_id ?? '')
    setFirstRecord(p1?.record || '')

    setSecondStudent(p2?.student_name || '')
    setSecondHouse(p2?.house_id ?? '')
    setSecondRecord(p2?.record || '')

    setThirdStudent(p3?.student_name || '')
    setThirdHouse(p3?.house_id ?? '')
    setThirdRecord(p3?.record || '')
  }, [open, event, houses])

  // Helper to auto-fill points based on 5-3-1 rule from score sheet
  const handleAutoFillPoints = () => {
    const next = { ...values }
    for (const h of houses) next[h.id] = '0'
    if (firstHouse !== '') next[Number(firstHouse)] = '5'
    if (secondHouse !== '') next[Number(secondHouse)] = '3'
    if (thirdHouse !== '') next[Number(thirdHouse)] = '1'
    setValues(next)
    setStatus('completed')
  }

  const handleSubmit = () => {
    if (!event) return

    const scores = houses
      .map((house) => {
        const raw = values[house.id] ?? ''
        if (raw.trim() === '') return null
        const points = Number(raw)
        return Number.isFinite(points) && points >= 0
          ? { houseId: house.id, points: Math.round(points) }
          : null
      })
      .filter((s): s is { houseId: number; points: number } => s !== null)

    const podium: PodiumWinner[] = []
    if (firstStudent.trim() && firstHouse !== '') {
      podium.push({
        position: 1,
        student_name: firstStudent.trim(),
        house_id: Number(firstHouse),
        record: firstRecord.trim() || undefined,
      })
    }
    if (secondStudent.trim() && secondHouse !== '') {
      podium.push({
        position: 2,
        student_name: secondStudent.trim(),
        house_id: Number(secondHouse),
        record: secondRecord.trim() || undefined,
      })
    }
    if (thirdStudent.trim() && thirdHouse !== '') {
      podium.push({
        position: 3,
        student_name: thirdStudent.trim(),
        house_id: Number(thirdHouse),
        record: thirdRecord.trim() || undefined,
      })
    }

    onSubmit({ eventId: event.id, status, scores, podium })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enter Scores & Placings — {event?.name ?? ''}</DialogTitle>
          <DialogDescription>
            Record student placings (1st, 2nd, 3rd) and house points as documented on the score sheet.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status selector */}
          <div>
            <Label htmlFor="event-status">Event Status</Label>
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

          {/* Student Placings Section from Word Doc */}
          <div className="rounded-lg border bg-muted/20 p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Student Placings & Records
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAutoFillPoints}
                className="h-7 text-xs text-primary gap-1"
                title="Auto calculate 5-3-1 points for 1st, 2nd, 3rd"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Auto-fill 5-3-1 pts
              </Button>
            </div>

            {/* 1st Place */}
            <div className="grid grid-cols-12 gap-2 items-center text-xs">
              <div className="col-span-1 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-amber-500" />
              </div>
              <div className="col-span-5">
                <Input
                  placeholder="1st Place Athlete"
                  value={firstStudent}
                  onChange={(e) => setFirstStudent(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="col-span-4">
                <Select
                  value={firstHouse !== '' ? String(firstHouse) : ''}
                  onValueChange={(val) => setFirstHouse(val ? Number(val) : '')}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select House" />
                  </SelectTrigger>
                  <SelectContent>
                    {houses.map((h) => (
                      <SelectItem key={h.id} value={String(h.id)}>
                        {h.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Input
                  placeholder="Record"
                  value={firstRecord}
                  onChange={(e) => setFirstRecord(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            {/* 2nd Place */}
            <div className="grid grid-cols-12 gap-2 items-center text-xs">
              <div className="col-span-1 flex items-center justify-center">
                <Medal className="w-4 h-4 text-slate-400" />
              </div>
              <div className="col-span-5">
                <Input
                  placeholder="2nd Place Athlete"
                  value={secondStudent}
                  onChange={(e) => setSecondStudent(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="col-span-4">
                <Select
                  value={secondHouse !== '' ? String(secondHouse) : ''}
                  onValueChange={(val) => setSecondHouse(val ? Number(val) : '')}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select House" />
                  </SelectTrigger>
                  <SelectContent>
                    {houses.map((h) => (
                      <SelectItem key={h.id} value={String(h.id)}>
                        {h.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Input
                  placeholder="Record"
                  value={secondRecord}
                  onChange={(e) => setSecondRecord(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            {/* 3rd Place */}
            <div className="grid grid-cols-12 gap-2 items-center text-xs">
              <div className="col-span-1 flex items-center justify-center">
                <Award className="w-4 h-4 text-amber-700" />
              </div>
              <div className="col-span-5">
                <Input
                  placeholder="3rd Place Athlete"
                  value={thirdStudent}
                  onChange={(e) => setThirdStudent(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="col-span-4">
                <Select
                  value={thirdHouse !== '' ? String(thirdHouse) : ''}
                  onValueChange={(val) => setThirdHouse(val ? Number(val) : '')}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select House" />
                  </SelectTrigger>
                  <SelectContent>
                    {houses.map((h) => (
                      <SelectItem key={h.id} value={String(h.id)}>
                        {h.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Input
                  placeholder="Record"
                  value={thirdRecord}
                  onChange={(e) => setThirdRecord(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </div>

          {/* House Points Input */}
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              House Points Awarded
            </Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {houses.map((house) => {
                const style = houseStyle(house.color)
                return (
                  <div
                    key={house.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg border bg-card"
                  >
                    <span
                      className={`inline-block h-3 w-3 rounded-full shrink-0 ${style.accent}`}
                      aria-hidden="true"
                    />
                    <Label htmlFor={`points-${house.id}`} className="flex-1 font-medium text-sm">
                      {house.name}
                    </Label>
                    <Input
                      id={`points-${house.id}`}
                      type="number"
                      min={0}
                      step={1}
                      inputMode="numeric"
                      className="w-20 text-right h-8 text-sm"
                      placeholder="0"
                      value={values[house.id] ?? ''}
                      onChange={(e) =>
                        setValues((prev) => ({ ...prev, [house.id]: e.target.value }))
                      }
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />}
            Save Scores & Placings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
