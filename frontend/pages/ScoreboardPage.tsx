import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertCircle,
  Plus,
  RefreshCw,
  Trophy,
  Printer,
  Calendar,
  ShieldCheck,
  UserCheck,
  Eye,
  Menu,
  ChevronRight,
  Cloud,
  Radio,
} from 'lucide-react'
import { Button } from '../lib/shadcn/button'
import { Tabs, TabsContent } from '../lib/shadcn/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../lib/shadcn/alert-dialog'
import {
  useCreateEvent,
  useDeleteEvent,
  useGetEvents,
  useGetScoreboard,
  useSubmitResults,
} from '../hooks/backend/scoreboard'
import type { EventStatus, HouseStanding, ScoreboardEvent, PodiumWinner, JudgeEntry, AppMode } from './ui/houses'
import Standings from './ui/Standings'
import StatsBar from './ui/StatsBar'
import EventList from './ui/EventList'
import AddEventDialog from './ui/AddEventDialog'
import ScoresDialog from './ui/ScoresDialog'
import InstructionsSection from './ui/InstructionsSection'
import JudgeScoreCard from './ui/JudgeScoreCard'
import ModeSwitcherDialog from './ui/ModeSwitcherDialog'
import LeftDrawerMenu from './ui/LeftDrawerMenu'
import CloudSyncDialog from './ui/CloudSyncDialog'
import {
  getSupabase,
  isSupabaseConfigured,
  getCloudStatus,
  subscribeCloudStatus,
  type CloudStatus,
} from '../lib/supabase'

export default function ScoreboardPage() {
  const { data: standingsData, loading: standingsLoading, error: scoreboardError, trigger: loadScoreboard } =
    useGetScoreboard({ cachePolicy: 'stale-while-revalidate' })
  const { data: eventsData, loading: eventsLoading, error: eventsError, trigger: loadEvents } =
    useGetEvents({ cachePolicy: 'stale-while-revalidate' })
  const createEvent = useCreateEvent()
  const submitResults = useSubmitResults()
  const deleteEvent = useDeleteEvent()

  const [addOpen, setAddOpen] = useState(false)
  const [editEvent, setEditEvent] = useState<ScoreboardEvent | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ScoreboardEvent | null>(null)
  const [mutating, setMutating] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('standings')
  const [judgeEventId, setJudgeEventId] = useState<number | undefined>(undefined)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const [appMode, setAppMode] = useState<AppMode>(() => {
    try {
      return (localStorage.getItem('house_scoreboard_app_mode') as AppMode) || 'admin'
    } catch {
      return 'admin'
    }
  })
  const [modeDialogOpen, setModeDialogOpen] = useState(false)
  const [cloudSyncOpen, setCloudSyncOpen] = useState(false)
  const [cloudState, setCloudState] = useState<{ status: CloudStatus; error: string }>(getCloudStatus())

  useEffect(() => {
    return subscribeCloudStatus((status, error) => {
      setCloudState({ status, error: error || '' })
    })
  }, [])

  const handleSelectMode = (newMode: AppMode) => {
    setAppMode(newMode)
    try {
      localStorage.setItem('house_scoreboard_app_mode', newMode)
    } catch {}
  }

  const refresh = () => {
    loadScoreboard(undefined, { skipCache: true })
    loadEvents(undefined, { skipCache: true })
  }

  // Subscribe to Supabase Realtime changes across all tables
  useEffect(() => {
    if (!isSupabaseConfigured()) return
    const supabase = getSupabase()
    if (!supabase) return

    const channel = supabase
      .channel('scoreboard-web-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'results' }, () => {
        refresh()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
        refresh()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'judge_entries' }, () => {
        refresh()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event_podium' }, () => {
        refresh()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const initialFetchDone = useRef(false)
  useEffect(() => {
    if (initialFetchDone.current) return
    initialFetchDone.current = true
    loadScoreboard()
    loadEvents()
  }, [loadScoreboard, loadEvents])

  const standings: HouseStanding[] = standingsData ?? []
  const eventList: ScoreboardEvent[] = eventsData ?? []

  const houses: HouseStanding[] = useMemo(
    () => [...standings].sort((a, b) => a.id - b.id),
    [standings],
  )

  const error =
    scoreboardError ?? eventsError ?? createEvent.error ?? submitResults.error ?? deleteEvent.error

  const handleCreate = async (args: {
    name: string
    category: string
    division?: string
    eventDate: string
    status: EventStatus
  }) => {
    setMutating(true)
    try {
      await createEvent.trigger(args).result
      setAddOpen(false)
      refresh()
    } finally {
      setMutating(false)
    }
  }

  const handleSubmitScores = async (args: {
    eventId: number
    status: EventStatus
    scores: { houseId: number; points: number }[]
    podium?: PodiumWinner[]
  }) => {
    setMutating(true)
    try {
      await submitResults.trigger(args).result
      setEditEvent(null)
      refresh()
    } finally {
      setMutating(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setMutating(true)
    try {
      await deleteEvent.trigger({ eventId: deleteTarget.id }).result
      setDeleteTarget(null)
      refresh()
    } finally {
      setMutating(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleJudgeSaveScores = async (args: {
    eventId: number
    status: EventStatus
    scores: { houseId: number; points: number }[]
    judge_entries: JudgeEntry[]
  }) => {
    setMutating(true)
    try {
      await submitResults.trigger(args).result
      refresh()
    } finally {
      setMutating(false)
    }
  }

  const handleOpenJudgeCard = (event: ScoreboardEvent) => {
    setJudgeEventId(event.id)
    setActiveTab('judges')
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Distinctive Left Drawer Menu Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-2 font-bold text-xs bg-muted/60 hover:bg-muted border-2 border-primary/30 shadow-sm px-3 py-2 rounded-xl text-foreground hover:scale-105 transition-all"
              aria-label="Open left navigation drawer menu"
              title="Open Championship Menu Drawer"
            >
              <Menu className="w-4 h-4 text-primary" />
              <span className="font-extrabold tracking-tight">Menu</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </Button>

            <div className="rounded-lg bg-primary text-primary-foreground p-2 shadow-sm">
              <Trophy className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">Inter-House Sports Meet Scoreboard</h1>
              <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-1.5 mt-0.5">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2F8CDC]" /> Britto
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F5A9CA]" /> Campion
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#82CC1F]" /> Kostka
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#9B1C3B]" /> Loyola
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Mode Switcher Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModeDialogOpen(true)}
              className={`gap-1.5 font-semibold text-xs border ${
                appMode === 'admin'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : appMode === 'judge'
                  ? 'border-blue-500 bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                  : 'border-slate-400 bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
              }`}
              title="Click to switch between Admin, Judges, or User mode"
            >
              {appMode === 'admin' && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
              {appMode === 'judge' && <UserCheck className="w-3.5 h-3.5 text-blue-600" />}
              {appMode === 'user' && <Eye className="w-3.5 h-3.5 text-slate-600" />}
              <span>{appMode === 'admin' ? 'Admin Mode' : appMode === 'judge' ? 'Judges Mode' : 'User Mode'}</span>
              <span className="text-[10px] opacity-70 underline ml-0.5 font-normal">Switch</span>
            </Button>

            {/* Cloud Sync Button (Admin Mode Only) */}
            {appMode === 'admin' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCloudSyncOpen(true)}
                className={`gap-1.5 font-bold text-xs border ${
                  cloudState.status === 'live'
                    ? 'border-emerald-500/80 bg-emerald-50/80 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                    : cloudState.status === 'error'
                    ? 'border-destructive/60 bg-destructive/10 text-destructive'
                    : 'border-amber-300 bg-amber-50/70 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300'
                }`}
                title={
                  cloudState.status === 'live'
                    ? 'Connected to Supabase - Real-time sync active'
                    : cloudState.status === 'error'
                    ? `Sync error: ${cloudState.error}. Click to fix URL or Anon Key.`
                    : 'Multi-device live synchronization setup'
                }
              >
                <Cloud className="w-3.5 h-3.5 text-primary" />
                <span className="hidden md:inline">
                  {cloudState.status === 'live'
                    ? 'Cloud: Live'
                    : cloudState.status === 'error'
                    ? 'Cloud: Error'
                    : 'Cloud: Offline'}
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    cloudState.status === 'live'
                      ? 'bg-emerald-500 animate-pulse'
                      : cloudState.status === 'error'
                      ? 'bg-destructive animate-ping'
                      : 'bg-amber-500'
                  }`}
                />
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              aria-label="Print Score Sheet"
              className="gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print Sheet</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={standingsLoading || eventsLoading}
              aria-label="Refresh scoreboard"
            >
              <RefreshCw
                className={`w-4 h-4 ${standingsLoading || eventsLoading ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            {appMode === 'admin' && (
              <Button size="sm" onClick={() => setAddOpen(true)}>
                <Plus className="w-4 h-4 mr-1" aria-hidden="true" />
                Add Event
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <StatsBar standings={standings} events={eventList} />

        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val)} className="w-full">
          <TabsContent value="standings" className="mt-2">
            <Standings
              standings={standings}
              events={eventList}
              loading={standingsLoading}
            />
          </TabsContent>

          <TabsContent value="events" className="mt-5">
            <EventList
              events={eventList}
              houses={houses}
              loading={eventsLoading}
              currentMode={appMode}
              onEdit={setEditEvent}
              onDelete={setDeleteTarget}
              onOpenJudgeCard={handleOpenJudgeCard}
            />
          </TabsContent>

          <TabsContent value="judges" className="mt-5">
            <JudgeScoreCard
              events={eventList}
              houses={houses}
              selectedEventId={judgeEventId}
              currentMode={appMode}
              onSaveScores={handleJudgeSaveScores}
            />
          </TabsContent>

          <TabsContent value="instructions" className="mt-5">
            <InstructionsSection currentMode={appMode} />
          </TabsContent>
        </Tabs>
      </main>

      <AddEventDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        submitting={mutating}
        onSubmit={handleCreate}
      />

      <ScoresDialog
        open={editEvent !== null}
        onOpenChange={(open) => {
          if (!open) setEditEvent(null)
        }}
        houses={houses}
        event={editEvent}
        submitting={mutating}
        onSubmit={handleSubmitScores}
      />

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => {
        if (!open) setDeleteTarget(null)
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete event?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.name ?? ''}" and all of its recorded house points will be
              permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={mutating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={mutating}
              className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ModeSwitcherDialog
        open={modeDialogOpen}
        onOpenChange={setModeDialogOpen}
        currentMode={appMode}
        onSelectMode={handleSelectMode}
      />

      <LeftDrawerMenu
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentMode={appMode}
        onOpenModeDialog={() => setModeDialogOpen(true)}
        standings={standings}
        events={eventList}
        onAddEvent={() => setAddOpen(true)}
        onPrint={handlePrint}
        onRefresh={refresh}
        onOpenCloudSync={appMode === 'admin' ? () => setCloudSyncOpen(true) : undefined}
        loading={standingsLoading || eventsLoading}
      />

      <CloudSyncDialog
        open={cloudSyncOpen}
        onOpenChange={setCloudSyncOpen}
        onConnected={refresh}
      />
    </div>
  )
}
