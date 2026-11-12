import { useState, useEffect } from 'react'
import {
  Trophy,
  Medal,
  Award,
  Plus,
  Trash2,
  Save,
  Printer,
  RotateCcw,
  CheckCircle,
  FileText,
  Sparkles,
  Eye,
  UserPlus,
  Users,
  Check,
  AlertCircle,
  Timer,
} from 'lucide-react'
import FieldStopwatch from './FieldStopwatch'
import { Button } from '../../lib/shadcn/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../lib/shadcn/card'
import { Input } from '../../lib/shadcn/input'
import { Badge } from '../../lib/shadcn/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../lib/shadcn/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../lib/shadcn/dialog'
import {
  houseStyle,
  type HouseStanding,
  type ScoreboardEvent,
  type JudgeEntry,
  type EventStatus,
  type AppMode,
} from './houses'

type Props = {
  events: ScoreboardEvent[]
  houses: HouseStanding[]
  selectedEventId?: number
  currentMode: AppMode
  onSaveScores: (args: {
    eventId: number
    status: EventStatus
    scores: { houseId: number; points: number }[]
    judge_entries: JudgeEntry[]
  }) => Promise<void>
}

export default function JudgeScoreCard({
  events,
  houses,
  selectedEventId,
  currentMode,
  onSaveScores,
}: Props) {
  const [currentEventId, setCurrentEventId] = useState<number>(
    selectedEventId || events[0]?.id || 1
  )
  const [entries, setEntries] = useState<JudgeEntry[]>([])
  const [eventStatus, setEventStatus] = useState<EventStatus>('completed')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Add Student Dialog State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newStudentName, setNewStudentName] = useState('')
  const [newStudentHouseId, setNewStudentHouseId] = useState<number>(houses[0]?.id || 1)
  const [newStudentPosition, setNewStudentPosition] = useState<1 | 2 | 3 | null>(null)
  const [newStudentNote, setNewStudentNote] = useState('')
  const [nameError, setNameError] = useState('')
  const [activeEntryForTimer, setActiveEntryForTimer] = useState<string | null>(null)
  const [lastRecordedTime, setLastRecordedTime] = useState<string>('')

  const canEditScores = currentMode === 'admin' || currentMode === 'judge'
  const currentEvent = events.find((e) => e.id === currentEventId) || events[0]

  const handleApplyStopwatchTime = (timeStr: string, targetEntryId?: string) => {
    setLastRecordedTime(timeStr)
    const targetId =
      targetEntryId ||
      activeEntryForTimer ||
      entries.find((e) => !e.note?.trim())?.id ||
      entries[0]?.id
    if (!targetId) return
    setEntries((prev) =>
      prev.map((item) => (item.id === targetId ? { ...item, note: timeStr } : item))
    )
  }

  useEffect(() => {
    if (selectedEventId && selectedEventId !== currentEventId) {
      setCurrentEventId(selectedEventId)
    }
  }, [selectedEventId])

  // Initialize entries from event data or default 4-house template
  useEffect(() => {
    if (!currentEvent) return
    setEventStatus(currentEvent.status === 'upcoming' ? 'completed' : currentEvent.status)
    setSaveSuccess(false)

    if (currentEvent.judge_entries && currentEvent.judge_entries.length > 0) {
      setEntries(currentEvent.judge_entries)
    } else if (currentEvent.podium && currentEvent.podium.length > 0) {
      // Reconstruct from podium
      const reconstructed: JudgeEntry[] = currentEvent.podium.map((p, idx) => ({
        id: `p-${idx}-${p.position}`,
        name: p.student_name,
        house_id: p.house_id,
        position: p.position,
        note: p.record || '',
      }))
      // Add unranked house reps if missing
      for (const h of houses) {
        if (!reconstructed.some((r) => r.house_id === h.id)) {
          reconstructed.push({
            id: `h-${h.id}-${Date.now()}`,
            name: '',
            house_id: h.id,
            position: null,
            note: '',
          })
        }
      }
      setEntries(reconstructed)
    } else {
      // Default: one athlete per house (Britto, Campion, Kostka, Loyola)
      const defaults: JudgeEntry[] = houses.map((h, i) => ({
        id: `entry-${h.id}-${i}`,
        name: '',
        house_id: h.id,
        position: null,
        note: '',
      }))
      setEntries(defaults)
    }
  }, [currentEventId, currentEvent, houses])

  // Quick toggle position (1st, 2nd, 3rd) with conflict resolution
  const handleSetPosition = (entryId: string, pos: 1 | 2 | 3) => {
    if (!canEditScores) return
    setEntries((prev) =>
      prev.map((item) => {
        if (item.id === entryId) {
          return { ...item, position: item.position === pos ? null : pos }
        }
        if (item.position === pos) {
          return { ...item, position: null }
        }
        return item
      })
    )
  }

  const handleUpdateName = (entryId: string, name: string) => {
    if (!canEditScores) return
    setEntries((prev) =>
      prev.map((item) => (item.id === entryId ? { ...item, name } : item))
    )
  }

  const handleUpdateHouse = (entryId: string, house_id: number) => {
    if (!canEditScores) return
    setEntries((prev) =>
      prev.map((item) => (item.id === entryId ? { ...item, house_id } : item))
    )
  }

  const handleUpdateNote = (entryId: string, note: string) => {
    if (!canEditScores) return
    setEntries((prev) =>
      prev.map((item) => (item.id === entryId ? { ...item, note } : item))
    )
  }

  const handleAddRow = () => {
    if (!canEditScores) return
    const defaultHouseId = houses[entries.length % houses.length]?.id || 1
    const newEntry: JudgeEntry = {
      id: `row-${Date.now()}-${Math.random()}`,
      name: '',
      house_id: defaultHouseId,
      position: null,
      note: '',
    }
    setEntries((prev) => [...prev, newEntry])
  }

  const handleDeleteRow = (id: string) => {
    if (!canEditScores) return
    setEntries((prev) => prev.filter((item) => item.id !== id))
  }

  const handleResetToHouses = () => {
    if (!canEditScores) return
    const defaults: JudgeEntry[] = houses.map((h, i) => ({
      id: `entry-${h.id}-${i}-${Date.now()}`,
      name: '',
      house_id: h.id,
      position: null,
      note: '',
    }))
    setEntries(defaults)
  }

  // Handle Add Student Submission from Modal
  const handleAddStudentSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!newStudentName.trim()) {
      setNameError('Student / Athlete name is required')
      return
    }
    setNameError('')

    const newEntry: JudgeEntry = {
      id: `student-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: newStudentName.trim(),
      house_id: newStudentHouseId,
      position: newStudentPosition,
      note: newStudentNote.trim(),
    }

    setEntries((prev) => {
      // If position assigned, conflict-resolve with any existing student holding that position
      if (newStudentPosition) {
        return [
          ...prev.map((item) =>
            item.position === newStudentPosition ? { ...item, position: null } : item
          ),
          newEntry,
        ]
      }
      return [...prev, newEntry]
    })

    // Reset form and close
    setNewStudentName('')
    setNewStudentHouseId(houses[0]?.id || 1)
    setNewStudentPosition(null)
    setNewStudentNote('')
    setIsAddModalOpen(false)
  }

  // Calculate projected house points based on positions (5-3-1 rule)
  const projectedPoints: Record<number, number> = {}
  for (const h of houses) {
    projectedPoints[h.id] = 0
  }
  for (const item of entries) {
    if (item.position === 1) projectedPoints[item.house_id] = (projectedPoints[item.house_id] || 0) + 5
    else if (item.position === 2) projectedPoints[item.house_id] = (projectedPoints[item.house_id] || 0) + 3
    else if (item.position === 3) projectedPoints[item.house_id] = (projectedPoints[item.house_id] || 0) + 1
  }

  const handleSave = async () => {
    if (!canEditScores || !currentEvent) return
    setIsSaving(true)
    setSaveSuccess(false)

    const scores = houses.map((h) => ({
      houseId: h.id,
      points: projectedPoints[h.id] || 0,
    }))

    try {
      await onSaveScores({
        eventId: currentEvent.id,
        status: eventStatus,
        scores,
        judge_entries: entries,
      })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3500)
    } finally {
      setIsSaving(false)
    }
  }

  const handlePrintCard = () => {
    window.print()
  }

  if (!currentEvent) return null

  return (
    <div className="space-y-6">
      {/* Read-Only Notice if in User Mode */}
      {!canEditScores && (
        <div className="p-3 bg-muted/60 border border-muted rounded-xl flex items-center justify-between text-xs text-muted-foreground print:hidden">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            <span>
              <strong>User Mode (View Only):</strong> You are viewing live judge entries. Switch to <strong>Judges Mode</strong> or <strong>Admin Mode</strong> from the top header to add students and score events.
            </span>
          </div>
          <Badge variant="outline" className="text-[10px]">Read-Only</Badge>
        </div>
      )}

      {/* Event Selection & Quick Actions Bar */}
      <Card className="print:hidden border-primary/20 bg-card/60 backdrop-blur-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex-1 space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-primary" />
                Select Event for Judging
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <Select
                  value={String(currentEvent.id)}
                  onValueChange={(val) => setCurrentEventId(Number(val))}
                >
                  <SelectTrigger className="w-full sm:w-72 font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((e) => (
                      <SelectItem key={e.id} value={String(e.id)}>
                        {e.name} ({e.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Badge variant="outline" className="text-xs py-1">
                  {currentEvent.category} · {currentEvent.division || 'House Competition'}
                </Badge>

                <Badge variant="secondary" className="text-xs py-1 font-semibold">
                  <Users className="w-3 h-3 mr-1 text-primary" />
                  {entries.length} {entries.length === 1 ? 'Student' : 'Students'}
                </Badge>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Prominent Add Student button for Judges/Admins */}
              {canEditScores && (
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  size="sm"
                  className="gap-1.5 h-9 font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  + Add Student
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handlePrintCard}
                className="gap-1 text-xs h-9"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Card
              </Button>

              {canEditScores && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetToHouses}
                    className="gap-1 text-xs h-9 text-muted-foreground"
                    title="Reset rows to 4 houses default"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </Button>

                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    size="sm"
                    className="gap-1.5 h-9 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {saveSuccess ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {saveSuccess ? 'Scores Saved!' : 'Save & Publish'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* On-Field Digital Stopwatch for Track & Field Events */}
      <FieldStopwatch
        onUseTime={(timeStr) => handleApplyStopwatchTime(timeStr)}
        defaultOpen={currentEvent.category.toLowerCase().includes('track')}
      />

      {/* Main Score Card for Judges */}
      <Card className="border-2 shadow-sm overflow-hidden">
        {/* Card Header matching Score Sheets document */}
        <CardHeader className="bg-muted/40 border-b pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase font-bold tracking-widest text-primary mb-1">
                Official Judge's Score Sheet
              </div>
              <CardTitle className="text-xl sm:text-2xl font-black flex items-center gap-3">
                <span>Name of the Event: {currentEvent.name}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {entries.length} {entries.length === 1 ? 'Athlete' : 'Athletes'}
                </span>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {canEditScores
                  ? 'Add students, assign their houses, and tap 1st, 2nd, or 3rd position. House scores calculate automatically.'
                  : 'Official standings and placings recorded by track & field judges.'}
              </p>
            </div>

            {/* Quick Status Pill */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Status:</span>
              {canEditScores ? (
                <Select
                  value={eventStatus}
                  onValueChange={(val) => setEventStatus(val as EventStatus)}
                >
                  <SelectTrigger className="w-32 h-8 text-xs font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant="secondary" className="uppercase text-xs font-bold">
                  {eventStatus}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 sm:p-6">
          {/* Points Preview Banner */}
          <div className="p-3 bg-muted/20 border-b flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 font-medium text-muted-foreground">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Standard Points Allocation: 1st Place = 5 pts | 2nd Place = 3 pts | 3rd Place = 1 pt
            </div>
            <div className="flex items-center gap-3">
              {houses.map((h) => {
                const style = houseStyle(h.color)
                const pts = projectedPoints[h.id] || 0
                return (
                  <div key={h.id} className="flex items-center gap-1 font-semibold">
                    <span className={`inline-block w-2 h-2 rounded-full ${style.accent}`} />
                    <span>{h.name}:</span>
                    <span className="text-primary tabular-nums font-bold">{pts} pts</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Table containing Name, House, Position as per doc */}
          {entries.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <div className="inline-flex p-3 rounded-full bg-muted mb-3">
                <Users className="w-6 h-6 text-muted-foreground" />
              </div>
              <h4 className="font-bold text-base">No Students Added Yet</h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
                No participants have been registered for {currentEvent.name}. Add students from any house to start scoring.
              </p>
              {canEditScores && (
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  size="sm"
                  className="gap-1.5 font-bold bg-primary"
                >
                  <UserPlus className="w-4 h-4" />
                  + Add First Student
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b bg-muted/40 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="py-3 px-3 w-10 text-center">#</th>
                    <th className="py-3 px-3 min-w-[200px]">Name (Athlete / Student)</th>
                    <th className="py-3 px-3 min-w-[170px]">Name of the House</th>
                    <th className="py-3 px-3 min-w-[280px] text-center">
                      Position {canEditScores ? '(Quick Select)' : ''}
                    </th>
                    <th className="py-3 px-3 min-w-[120px]">Time / Remarks</th>
                    {canEditScores && <th className="py-3 px-2 w-10 text-center print:hidden"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {entries.map((entry, index) => {
                    return (
                      <tr
                        key={entry.id}
                        className={`transition-colors hover:bg-muted/30 ${
                          entry.position === 1
                            ? 'bg-amber-50/50 dark:bg-amber-950/20'
                            : entry.position === 2
                            ? 'bg-slate-50/50 dark:bg-slate-900/20'
                            : entry.position === 3
                            ? 'bg-orange-50/40 dark:bg-orange-950/20'
                            : ''
                        }`}
                      >
                        {/* Row Number */}
                        <td className="py-3 px-3 text-center text-xs font-semibold text-muted-foreground">
                          {index + 1}
                        </td>

                        {/* Athlete Name */}
                        <td className="py-2 px-3">
                          {canEditScores ? (
                            <Input
                              placeholder="Athlete / Student name"
                              value={entry.name}
                              onChange={(e) => handleUpdateName(entry.id, e.target.value)}
                              className="h-9 text-sm font-medium"
                            />
                          ) : (
                            <span className="font-semibold text-sm">
                              {entry.name || <span className="text-muted-foreground italic font-normal">Unspecified</span>}
                            </span>
                          )}
                        </td>

                        {/* House Selector */}
                        <td className="py-2 px-3">
                          {canEditScores ? (
                            <Select
                              value={String(entry.house_id)}
                              onValueChange={(val) => handleUpdateHouse(entry.id, Number(val))}
                            >
                              <SelectTrigger className="h-9 text-xs font-medium">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {houses.map((h) => {
                                  const s = houseStyle(h.color)
                                  return (
                                    <SelectItem key={h.id} value={String(h.id)}>
                                      <div className="flex items-center gap-2">
                                        <span
                                          className={`inline-block w-2.5 h-2.5 rounded-full ${s.accent}`}
                                        />
                                        <span>{h.name} House</span>
                                      </div>
                                    </SelectItem>
                                  )
                                })}
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="flex items-center gap-2 text-xs font-medium">
                              {(() => {
                                const h = houses.find((x) => x.id === entry.house_id)
                                const s = h ? houseStyle(h.color) : null
                                return (
                                  <>
                                    {s && <span className={`inline-block w-2.5 h-2.5 rounded-full ${s.accent}`} />}
                                    <span>{h?.name || '—'} House</span>
                                  </>
                                )
                              })()}
                            </div>
                          )}
                        </td>

                        {/* Quick Position Select Buttons (1st, 2nd, 3rd) */}
                        <td className="py-2 px-3">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* 1st Position Button */}
                            <Button
                              type="button"
                              size="sm"
                              disabled={!canEditScores}
                              variant={entry.position === 1 ? 'default' : 'outline'}
                              onClick={() => handleSetPosition(entry.id, 1)}
                              className={`h-8 px-3 text-xs font-bold transition-all ${
                                entry.position === 1
                                  ? 'bg-amber-500 hover:bg-amber-600 text-black shadow ring-2 ring-amber-400'
                                  : 'hover:border-amber-400 hover:text-amber-600'
                              }`}
                            >
                              <Trophy className="w-3.5 h-3.5 mr-1 text-amber-900" />
                              1st (5 pts)
                            </Button>

                            {/* 2nd Position Button */}
                            <Button
                              type="button"
                              size="sm"
                              disabled={!canEditScores}
                              variant={entry.position === 2 ? 'default' : 'outline'}
                              onClick={() => handleSetPosition(entry.id, 2)}
                              className={`h-8 px-3 text-xs font-bold transition-all ${
                                entry.position === 2
                                  ? 'bg-slate-300 hover:bg-slate-400 text-black shadow ring-2 ring-slate-300'
                                  : 'hover:border-slate-400 hover:text-slate-600'
                              }`}
                            >
                              <Medal className="w-3.5 h-3.5 mr-1 text-slate-800" />
                              2nd (3 pts)
                            </Button>

                            {/* 3rd Position Button */}
                            <Button
                              type="button"
                              size="sm"
                              disabled={!canEditScores}
                              variant={entry.position === 3 ? 'default' : 'outline'}
                              onClick={() => handleSetPosition(entry.id, 3)}
                              className={`h-8 px-3 text-xs font-bold transition-all ${
                                entry.position === 3
                                  ? 'bg-amber-700 hover:bg-amber-800 text-white shadow ring-2 ring-amber-600'
                                  : 'hover:border-amber-700 hover:text-amber-800'
                              }`}
                            >
                              <Award className="w-3.5 h-3.5 mr-1" />
                              3rd (1 pt)
                            </Button>

                            {/* Clear selection */}
                            {canEditScores && entry.position !== null && (
                              <button
                                type="button"
                                onClick={() =>
                                  setEntries((prev) =>
                                    prev.map((item) =>
                                      item.id === entry.id ? { ...item, position: null } : item
                                    )
                                  )
                                }
                                className="text-[11px] text-muted-foreground hover:text-foreground px-1.5 py-1"
                                title="Clear position"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Time / Remarks */}
                        <td className="py-2 px-3">
                          {canEditScores ? (
                            <div className="flex items-center gap-1.5">
                              <Input
                                placeholder="e.g. 11.4s"
                                value={entry.note || ''}
                                onChange={(e) => handleUpdateNote(entry.id, e.target.value)}
                                className="h-9 text-xs"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setActiveEntryForTimer(entry.id)
                                  if (lastRecordedTime) {
                                    handleApplyStopwatchTime(lastRecordedTime, entry.id)
                                  }
                                }}
                                className={`h-9 px-2 text-xs shrink-0 transition-colors ${
                                  activeEntryForTimer === entry.id
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'text-muted-foreground hover:text-primary'
                                }`}
                                title={
                                  lastRecordedTime
                                    ? `Insert captured time: ${lastRecordedTime}`
                                    : 'Select this athlete for stopwatch time'
                                }
                              >
                                <Timer className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground font-mono">
                              {entry.note || '—'}
                            </span>
                          )}
                        </td>

                        {/* Delete Student Row */}
                        {canEditScores && (
                          <td className="py-2 px-2 text-center print:hidden">
                            <button
                              type="button"
                              onClick={() => handleDeleteRow(entry.id)}
                              className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                              title="Remove student from event"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Add Row Button & Bottom Actions */}
          {canEditScores && (
            <div className="p-4 bg-muted/20 border-t flex flex-wrap items-center justify-between gap-3 print:hidden">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => setIsAddModalOpen(true)}
                  className="gap-1.5 text-xs h-9 font-bold bg-primary"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  + Add Student
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddRow}
                  className="gap-1.5 text-xs h-9"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Quick Blank Row
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  {saveSuccess ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saveSuccess ? 'Saved!' : 'Save & Publish Scores'}
                </Button>
              </div>
            </div>
          )}

          {/* Print Sign-off section (visible when printed) */}
          <div className="hidden print:block p-6 pt-12 border-t mt-8">
            <div className="grid grid-cols-3 gap-8 text-center text-xs font-semibold">
              <div className="border-t pt-2">Track / Field Judge Signature</div>
              <div className="border-t pt-2">Chief Referee Signature</div>
              <div className="border-t pt-2">Official Scorer Signature</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Student Modal Dialog */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <UserPlus className="w-5 h-5 text-primary" />
              Add Student / Athlete
            </DialogTitle>
            <DialogDescription className="text-xs">
              Register a participant for <strong className="text-foreground">{currentEvent.name}</strong> ({currentEvent.category}).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddStudentSubmit} className="space-y-4 pt-2">
            {/* Student Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Student Name <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="e.g. Rahul Sharma"
                value={newStudentName}
                onChange={(e) => {
                  setNewStudentName(e.target.value)
                  if (nameError) setNameError('')
                }}
                className={nameError ? 'border-destructive' : ''}
                autoFocus
              />
              {nameError && (
                <p className="text-xs text-destructive font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {nameError}
                </p>
              )}
            </div>

            {/* House Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Select House
              </label>
              <div className="grid grid-cols-2 gap-2">
                {houses.map((h) => {
                  const style = houseStyle(h.color)
                  const isSelected = newStudentHouseId === h.id
                  return (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => setNewStudentHouseId(h.id)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-left transition-all text-xs font-semibold ${
                        isSelected
                          ? `border-primary bg-primary/10 shadow-sm ring-2 ${style.ring}`
                          : 'border-border/60 hover:bg-muted/40 hover:border-border'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: style.hex }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="truncate font-bold">{h.name} House</div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Initial Position (Optional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Placing / Position (Optional)
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => setNewStudentPosition(newStudentPosition === 1 ? null : 1)}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-bold transition-all ${
                    newStudentPosition === 1
                      ? 'bg-amber-500 text-black border-amber-600 ring-2 ring-amber-400'
                      : 'border-border/60 hover:bg-amber-50 hover:border-amber-300 dark:hover:bg-amber-950/20'
                  }`}
                >
                  <Trophy className="w-4 h-4 mb-1 text-amber-900" />
                  <span>1st</span>
                  <span className="text-[10px] font-normal opacity-80">5 pts</span>
                </button>

                <button
                  type="button"
                  onClick={() => setNewStudentPosition(newStudentPosition === 2 ? null : 2)}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-bold transition-all ${
                    newStudentPosition === 2
                      ? 'bg-slate-300 text-black border-slate-400 ring-2 ring-slate-300'
                      : 'border-border/60 hover:bg-slate-50 hover:border-slate-300 dark:hover:bg-slate-900/20'
                  }`}
                >
                  <Medal className="w-4 h-4 mb-1 text-slate-800" />
                  <span>2nd</span>
                  <span className="text-[10px] font-normal opacity-80">3 pts</span>
                </button>

                <button
                  type="button"
                  onClick={() => setNewStudentPosition(newStudentPosition === 3 ? null : 3)}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-bold transition-all ${
                    newStudentPosition === 3
                      ? 'bg-amber-700 text-white border-amber-800 ring-2 ring-amber-600'
                      : 'border-border/60 hover:bg-orange-50 hover:border-orange-300 dark:hover:bg-orange-950/20'
                  }`}
                >
                  <Award className="w-4 h-4 mb-1" />
                  <span>3rd</span>
                  <span className="text-[10px] font-normal opacity-80">1 pt</span>
                </button>

                <button
                  type="button"
                  onClick={() => setNewStudentPosition(null)}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-semibold transition-all ${
                    newStudentPosition === null
                      ? 'bg-muted border-border font-bold'
                      : 'border-border/60 hover:bg-muted/40'
                  }`}
                >
                  <span className="text-muted-foreground text-sm leading-tight">—</span>
                  <span className="text-[10px] text-muted-foreground">None</span>
                  <span className="text-[10px] font-normal text-muted-foreground">0 pts</span>
                </button>
              </div>
            </div>

            {/* Time / Remarks / Lane */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Time / Remarks / Lane (Optional)
              </label>
              <Input
                placeholder="e.g. 11.42s or Heat 1, Lane 4"
                value={newStudentNote}
                onChange={(e) => setNewStudentNote(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <DialogFooter className="pt-2 sm:space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="gap-1.5 bg-primary font-bold"
              >
                <UserPlus className="w-4 h-4" />
                Add Student to Event
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
