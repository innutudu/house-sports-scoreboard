import { useEffect, useRef } from 'react'
import {
  X,
  Trophy,
  Medal,
  ClipboardCheck,
  FileText,
  ShieldCheck,
  UserCheck,
  Eye,
  Plus,
  Printer,
  RefreshCw,
  ChevronRight,
  Flame,
  KeyRound,
  ExternalLink,
  Cloud,
  Radio,
  RotateCcw,
} from 'lucide-react'
import { Button } from '../../lib/shadcn/button'
import type { AppMode, HouseStanding, ScoreboardEvent } from './houses'
import { HOUSES_CONFIG } from './houses'
import { isSupabaseConfigured } from '../../lib/supabase'

type Props = {
  open: boolean
  onClose: () => void
  activeTab: string
  onSelectTab: (tab: string) => void
  currentMode: AppMode
  onOpenModeDialog: () => void
  standings: HouseStanding[]
  events: ScoreboardEvent[]
  onAddEvent?: () => void
  onPrint?: () => void
  onRefresh?: () => void
  onOpenCloudSync?: () => void
  onOpenSecretReset?: () => void
  loading?: boolean
}

export default function LeftDrawerMenu({
  open,
  onClose,
  activeTab,
  onSelectTab,
  currentMode,
  onOpenModeDialog,
  standings,
  events,
  onAddEvent,
  onPrint,
  onRefresh,
  onOpenCloudSync,
  onOpenSecretReset,
  loading,
}: Props) {
  const isCloudConnected = isSupabaseConfigured()
  const clickCountRef = useRef(0)
  const clickTimerRef = useRef<any>(null)

  const handleFooterSecretClick = () => {
    clickCountRef.current += 1
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current)

    if (clickCountRef.current >= 3) {
      clickCountRef.current = 0
      if (onOpenSecretReset) {
        onOpenSecretReset()
        onClose()
      }
      return
    }

    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0
    }, 2000)
  }
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  // Prevent background body scrolling when drawer is open on mobile
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const menuItems = [
    {
      id: 'standings',
      label: 'Leaderboard & Matrix',
      description: 'Overall standings, house totals & point grid',
      icon: Trophy,
      badge: 'Live',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
    {
      id: 'events',
      label: 'Events & Placings',
      description: '12 Track, Field & Team competitions',
      icon: Medal,
      badge: `${events.length} Events`,
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      id: 'judges',
      label: "Judges' Score Cards",
      description: '1-Tap 1st, 2nd, 3rd scoring & records',
      icon: ClipboardCheck,
      badge: 'Scoring',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'instructions',
      label: 'Meet Instructions',
      description: 'Rules, guidelines & admin notices',
      icon: FileText,
      badge: currentMode === 'admin' ? 'Editable' : 'Rules',
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
      iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    },
  ]

  // Sort standings by points descending
  const sortedStandings = [...standings].sort(
    (a, b) => b.total_points - a.total_points
  )

  const handleItemClick = (id: string) => {
    onSelectTab(id)
    onClose()
  }

  return (
    <>
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-84 sm:w-96 max-w-[88vw] bg-card text-card-foreground border-r border-border z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-out transform ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Sports Scoreboard Navigation Drawer"
      >
        {/* Drawer Header with House Colors Ribbon */}
        <div className="relative border-b border-border bg-gradient-to-b from-muted/60 to-card p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-md">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold tracking-widest uppercase text-primary">
                  Inter-House Sports Meet
                </div>
                <h2 className="text-base font-extrabold tracking-tight leading-tight">
                  Championship Menu
                </h2>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 rounded-lg hover:bg-muted"
              aria-label="Close menu drawer"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Distinctive House Colors Ribbon */}
          <div className="mt-4 pt-3 border-t border-border/60">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Competing Houses</span>
              <span className="text-[9px] opacity-75">4 Houses</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {HOUSES_CONFIG.map((h) => (
                <div
                  key={h.id}
                  className="group flex flex-col items-center p-1.5 rounded-lg border bg-background/50 hover:bg-background transition-colors"
                  title={`${h.name} House`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full mb-1 shadow-sm ring-1 ring-border group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: h.hex }}
                  />
                  <span className="text-[10px] font-bold truncate max-w-full">
                    {h.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scrollable Menu Items */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-5">
          {/* Main Navigation Section */}
          <div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 mb-2 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Navigation Menu</span>
            </div>

            <nav className="space-y-1.5">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id

                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-3 group ${
                      isActive
                        ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary/30 dark:bg-primary/15'
                        : 'border-border/60 hover:border-border hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : item.iconBg
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs sm:text-sm font-bold truncate ${
                              isActive ? 'text-primary' : 'text-foreground'
                            }`}
                          >
                            {item.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate leading-snug">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                      <ChevronRight
                        className={`w-3.5 h-3.5 transition-transform ${
                          isActive
                            ? 'text-primary translate-x-0.5'
                            : 'text-muted-foreground/50 group-hover:translate-x-0.5'
                        }`}
                      />
                    </div>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Mini Standings Snapshot inside Drawer */}
          {sortedStandings.length > 0 && (
            <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  <span>Standings Snapshot</span>
                </span>
                <button
                  onClick={() => handleItemClick('standings')}
                  className="text-[10px] font-semibold text-primary hover:underline flex items-center gap-0.5"
                >
                  View Table <ExternalLink className="w-2.5 h-2.5" />
                </button>
              </div>

              <div className="space-y-1.5">
                {sortedStandings.map((house, idx) => (
                  <div
                    key={house.id}
                    className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-background/60 border border-border/40"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-4 text-center font-bold text-[11px] text-muted-foreground">
                        #{idx + 1}
                      </span>
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: house.color }}
                      />
                      <span className="font-semibold text-xs">{house.name}</span>
                    </div>
                    <span className="font-extrabold text-xs text-primary">
                      {house.total_points} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Live Cloud Database Sync Widget (Admin Mode Only) */}
          {currentMode === 'admin' && (
            <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5 space-y-2.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Multi-Device Sync</span>
                <span
                  className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                    isCloudConnected
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {isCloudConnected ? 'Live Cloud' : 'Local Offline'}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-background border">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-1.5 rounded-md ${
                      isCloudConnected
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    <Cloud className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">
                      {isCloudConnected ? 'Cloud Sync Connected' : 'Local Storage Mode'}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {isCloudConnected
                        ? 'Real-time WebSocket active'
                        : 'Sync across devices requires Supabase'}
                    </div>
                  </div>
                </div>

                {onOpenCloudSync && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onOpenCloudSync()
                      onClose()
                    }}
                    className="h-7 text-[11px] gap-1 px-2 font-semibold"
                  >
                    <Radio className="w-3 h-3 text-primary" />
                    <span>Setup</span>
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Access Mode Switcher Widget */}
          <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5 space-y-2.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Current Access Mode</span>
              <span className="text-[9px] font-medium text-emerald-600 dark:text-emerald-400">
                Active
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-background border">
              <div className="flex items-center gap-2">
                <div
                  className={`p-1.5 rounded-md ${
                    currentMode === 'admin'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : currentMode === 'judge'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      : 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {currentMode === 'admin' && <ShieldCheck className="w-4 h-4 text-emerald-600" />}
                  {currentMode === 'judge' && <UserCheck className="w-4 h-4 text-blue-600" />}
                  {currentMode === 'user' && <Eye className="w-4 h-4 text-slate-600" />}
                </div>
                <div>
                  <div className="text-xs font-bold capitalize">
                    {currentMode === 'admin'
                      ? 'Admin Mode'
                      : currentMode === 'judge'
                      ? 'Judges Mode'
                      : 'User Mode'}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {currentMode === 'admin'
                      ? 'Full system access'
                      : currentMode === 'judge'
                      ? 'Score & placing edits'
                      : 'View-only access'}
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenModeDialog()
                  onClose()
                }}
                className="h-7 text-[11px] gap-1 px-2 font-semibold"
              >
                <KeyRound className="w-3 h-3" />
                <span>Switch</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Drawer Footer with Quick Actions */}
        <div className="p-4 border-t border-border bg-muted/40 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (onPrint) onPrint()
                onClose()
              }}
              className="h-8 text-xs gap-1.5 w-full font-medium"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Sheet</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (onRefresh) onRefresh()
              }}
              disabled={loading}
              className="h-8 text-xs gap-1.5 w-full font-medium"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>

          {currentMode === 'admin' && onAddEvent && (
            <Button
              size="sm"
              onClick={() => {
                onAddEvent()
                onClose()
              }}
              className="w-full h-8 text-xs gap-1.5 bg-primary hover:bg-primary/90 font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Event</span>
            </Button>
          )}

          {currentMode === 'admin' && onOpenSecretReset && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onOpenSecretReset()
                onClose()
              }}
              className="w-full h-8 text-xs gap-1.5 text-red-600 border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40 font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Pre-Filled Scores</span>
            </Button>
          )}

          <div
            onClick={handleFooterSecretClick}
            className="text-center pt-1 text-[10px] text-muted-foreground font-medium cursor-pointer select-none hover:text-foreground transition-colors"
            title="Click 3x to open Secret Reset"
          >
            Prepared by Innocent Tudu SJ
          </div>
        </div>
      </aside>
    </>
  )
}
