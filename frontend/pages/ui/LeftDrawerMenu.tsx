import { useEffect, useRef, useState, useCallback } from 'react'
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
  Menu,
  Activity,
  Crown,
  Sparkles,
} from 'lucide-react'
import { Button } from '../../lib/shadcn/button'
import type { AppMode, HouseStanding, ScoreboardEvent } from './houses'
import { HOUSES_CONFIG, houseStyle } from './houses'
import { isSupabaseConfigured } from '../../lib/supabase'

type Props = {
  open: boolean
  onClose: () => void
  onOpen?: () => void
  activeTab: string
  onSelectTab: (tab: string) => void
  onSelectCategory?: (category: string) => void
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
  onOpen,
  activeTab,
  onSelectTab,
  onSelectCategory,
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

  // Drag-to-dismiss gesture state
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const drawerRef = useRef<HTMLDivElement>(null)

  // Secret reset click handler
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

  // Prevent background body scrolling when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      setDragOffset(0)
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Swipe-from-edge gesture to open drawer on touch devices
  useEffect(() => {
    let edgeStartX = 0
    let edgeStartY = 0
    let trackingEdge = false

    const handleWindowTouchStart = (e: TouchEvent) => {
      if (open) return
      const touch = e.touches[0]
      if (touch.clientX <= 28) {
        edgeStartX = touch.clientX
        edgeStartY = touch.clientY
        trackingEdge = true
      }
    }

    const handleWindowTouchEnd = (e: TouchEvent) => {
      if (!trackingEdge || open) return
      trackingEdge = false
      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - edgeStartX
      const deltaY = Math.abs(touch.clientY - edgeStartY)
      // If swiped right from left edge more than 40px and horizontal
      if (deltaX > 40 && deltaY < 80 && onOpen) {
        onOpen()
      }
    }

    window.addEventListener('touchstart', handleWindowTouchStart, { passive: true })
    window.addEventListener('touchend', handleWindowTouchEnd, { passive: true })

    return () => {
      window.removeEventListener('touchstart', handleWindowTouchStart)
      window.removeEventListener('touchend', handleWindowTouchEnd)
    }
  }, [open, onOpen])

  // Drawer Drag-to-close handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const currentX = e.touches[0].clientX
    const diff = currentX - touchStartX.current
    if (diff < 0) {
      setDragOffset(diff)
    } else {
      setDragOffset(0)
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    if (dragOffset < -70) {
      onClose()
    }
    setDragOffset(0)
    touchStartX.current = null
  }

  // Dynamic calculations
  const sortedStandings = [...standings].sort((a, b) => b.total_points - a.total_points)
  const leader = sortedStandings[0]
  const second = sortedStandings[1]
  const leaderStyle = leader ? houseStyle(leader.color) : null
  const leadMargin = leader && second ? leader.total_points - second.total_points : 0

  const completedEvents = events.filter((e) => e.status === 'completed').length
  const liveEvents = events.filter((e) => e.status === 'live').length
  const totalEvents = events.length
  const progressPercent = totalEvents > 0 ? Math.round((completedEvents / totalEvents) * 100) : 0

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
      description: `${events.length} Track, Field & Team competitions`,
      icon: Medal,
      badge: liveEvents > 0 ? `${liveEvents} Live` : `${events.length} Events`,
      badgeColor: liveEvents > 0 ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      id: 'judges',
      label: "Judges' Score Cards",
      description: '1-Tap 1st, 2nd, 3rd scoring & stopwatch',
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

  const categoryShortcuts = [
    { id: 'Track', label: 'Track Events', icon: '🏃', count: events.filter((e) => e.category === 'Track').length },
    { id: 'Field - Throw', label: 'Throws', icon: '🎯', count: events.filter((e) => e.category === 'Field - Throw').length },
    { id: 'Field - Jump', label: 'Jumps', icon: '🦘', count: events.filter((e) => e.category === 'Field - Jump').length },
    { id: 'Team', label: 'Tug of War', icon: '🤝', count: events.filter((e) => e.category === 'Team').length },
  ]

  const handleItemClick = (id: string) => {
    onSelectTab(id)
    onClose()
  }

  const handleCategoryClick = (catId: string) => {
    if (onSelectCategory) {
      onSelectCategory(catId)
    } else {
      onSelectTab('events')
    }
    onClose()
  }

  return (
    <>
      {/* Floating Dynamic Edge Drawer Tab (Drawable Handle when closed) */}
      {!open && onOpen && (
        <div
          onClick={onOpen}
          className="fixed left-0 top-1/2 -translate-y-1/2 z-30 flex items-center bg-card/95 hover:bg-card text-foreground backdrop-blur-md border border-l-0 border-primary/30 hover:border-primary shadow-xl rounded-r-2xl px-1.5 sm:px-2 py-4 cursor-pointer transition-all duration-200 hover:scale-105 group select-none"
          title="Drag or click to open Championship Menu"
          aria-label="Open Championship Menu"
        >
          <div className="flex flex-col items-center gap-2">
            <Menu className="w-4 h-4 text-primary group-hover:scale-125 transition-transform" />
            <span className="[writing-mode:vertical-lr] text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
              Menu
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </div>
        </div>
      )}

      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Dynamic Slide-out Drawer Container with Touch Gestures */}
      <aside
        ref={drawerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`fixed top-0 bottom-0 left-0 w-84 sm:w-96 max-w-[88vw] bg-card text-card-foreground border-r border-border z-50 shadow-2xl flex flex-col ${
          isDragging ? '' : 'transition-transform duration-300 ease-out'
        }`}
        style={{
          transform: open
            ? `translateX(${dragOffset}px)`
            : 'translateX(-100%)',
        }}
        aria-label="Sports Scoreboard Navigation Drawer"
      >
        {/* Visual Grab Handle on Right Edge of Drawer */}
        <div
          className="absolute top-1/2 -right-3 -translate-y-1/2 w-3 h-20 rounded-r-full bg-primary/20 border-r border-y border-primary/40 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-primary/30 transition-colors"
          title="Swipe left to close"
        >
          <div className="w-0.5 h-10 bg-primary/60 rounded-full" />
        </div>

        {/* Drawer Header with College Branding */}
        <div className="relative border-b border-border bg-gradient-to-b from-muted/80 to-card p-4 sm:p-5 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-md shrink-0 mt-0.5">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-black tracking-widest uppercase text-primary truncate flex items-center gap-1.5">
                  <span>Sports Day Meet</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <h2 className="text-base sm:text-lg font-black tracking-tight leading-tight text-foreground truncate">
                  St. Xavier's Inter College
                </h2>
                <p className="text-[11px] font-bold text-muted-foreground">
                  Maharo · Championship Desk
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 rounded-xl hover:bg-muted shrink-0"
              aria-label="Close menu drawer"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Distinctive 4 Competing Houses Ribbon */}
          <div className="mt-3.5 pt-3 border-t border-border/60">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Competing Houses</span>
              <span className="text-[9px] font-mono text-primary font-bold">4 HOUSES</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {HOUSES_CONFIG.map((h) => {
                const standing = standings.find((s) => s.id === h.id)
                const pts = standing?.total_points ?? 0
                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => handleItemClick('standings')}
                    className="group flex flex-col items-center p-1.5 rounded-xl border bg-background/60 hover:bg-background hover:border-primary/50 transition-all text-center"
                    title={`${h.name} House: ${pts} pts`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full mb-1 shadow-sm ring-1 ring-border group-hover:scale-125 transition-transform"
                      style={{ backgroundColor: h.hex }}
                    />
                    <span className="text-[10px] font-black truncate max-w-full">
                      {h.name}
                    </span>
                    <span className="text-[9px] font-bold tabular-nums text-muted-foreground group-hover:text-primary">
                      {pts}p
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-4">
          {/* Dynamic Tournament Leader Spotlight Card */}
          {leader && leaderStyle && (
            <div
              className="rounded-2xl border p-3.5 relative overflow-hidden transition-all shadow-sm"
              style={{
                borderColor: `${leaderStyle.hex}60`,
                backgroundColor: `${leaderStyle.hex}12`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <Crown className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>Current Leader</span>
                </span>
                {leadMargin > 0 && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 tabular-nums">
                    +{leadMargin} pts lead
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-sm shadow-md"
                    style={{ backgroundColor: leaderStyle.hex }}
                  >
                    <Trophy className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-extrabold text-sm sm:text-base text-foreground leading-tight flex items-center gap-1">
                      <span>{leader.name} House</span>
                      <Sparkles className="w-3 h-3 text-amber-500" />
                    </div>
                    <div className="text-[11px] text-muted-foreground font-medium">
                      {leader.first_places || 0} 🥇 Firsts · {leader.events_scored} scored
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black tabular-nums tracking-tight text-foreground">
                    {leader.total_points}
                  </div>
                  <div className="text-[9px] font-bold text-muted-foreground uppercase">
                    Points
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Tournament Progress Bar */}
          <div className="rounded-xl border border-border/80 bg-muted/20 p-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-muted-foreground uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-primary" />
                <span>Meet Completion</span>
              </span>
              <span className="text-foreground tabular-nums">
                {completedEvents} / {totalEvents} Events ({progressPercent}%)
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Main Navigation Section */}
          <div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 mb-2 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Main Sections</span>
            </div>

            <nav className="space-y-1.5">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id

                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 group ${
                      isActive
                        ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary/30 dark:bg-primary/15'
                        : 'border-border/60 hover:border-border hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
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
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}
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

          {/* Dynamic Category Quick Jump Shortcuts */}
          <div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 mb-2 flex items-center justify-between">
              <span>Event Categories</span>
              <span className="text-[9px] text-primary font-bold">Quick Jump</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {categoryShortcuts.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat.id)}
                  className="flex items-center justify-between p-2 rounded-xl border border-border/70 bg-card hover:bg-muted/60 hover:border-primary/40 text-left transition-all group"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-sm">{cat.icon}</span>
                    <span className="text-xs font-bold text-foreground group-hover:text-primary truncate">
                      {cat.label}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-muted-foreground tabular-nums">
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Live Standings Snapshot inside Drawer */}
          {sortedStandings.length > 0 && (
            <div className="rounded-2xl border border-border/80 bg-muted/20 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  <span>Live Score Standings</span>
                </span>
                <button
                  onClick={() => handleItemClick('standings')}
                  className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5"
                >
                  Full Table <ExternalLink className="w-2.5 h-2.5" />
                </button>
              </div>

              <div className="space-y-1.5">
                {sortedStandings.map((house, idx) => {
                  const s = houseStyle(house.color)
                  return (
                    <div
                      key={house.id}
                      className="flex items-center justify-between text-xs p-2 rounded-xl bg-background border border-border/60 hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-4 text-center font-black text-[11px] text-muted-foreground">
                          #{idx + 1}
                        </span>
                        <span
                          className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                          style={{ backgroundColor: s.hex }}
                        />
                        <span className="font-bold text-xs">{house.name} House</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">
                          {house.first_places || 0} 🥇
                        </span>
                        <span className="font-black text-xs text-foreground tabular-nums">
                          {house.total_points} pts
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Live Cloud Database Sync Widget (Admin Mode Only) */}
          {currentMode === 'admin' && (
            <div className="rounded-2xl border border-border/80 bg-muted/30 p-3.5 space-y-2.5">
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

              <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-background border">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-1.5 rounded-lg ${
                      isCloudConnected
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    <Cloud className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">
                      {isCloudConnected ? 'Cloud Sync Active' : 'Local Storage Mode'}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {isCloudConnected
                        ? 'Real-time WebSocket'
                        : 'Connect Supabase for multi-device'}
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
          <div className="rounded-2xl border border-border/80 bg-muted/30 p-3.5 space-y-2.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Current Role Mode</span>
              <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                Active
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-background border">
              <div className="flex items-center gap-2">
                <div
                  className={`p-1.5 rounded-lg ${
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
                      : 'Spectator Mode'}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {currentMode === 'admin'
                      ? 'Full system access'
                      : currentMode === 'judge'
                      ? 'Scoring desk active'
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
                className="h-7 text-[11px] gap-1 px-2.5 font-bold"
              >
                <KeyRound className="w-3 h-3" />
                <span>Switch</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Drawer Footer with Quick Actions */}
        <div className="p-4 border-t border-border bg-muted/40 space-y-2 shrink-0">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (onPrint) onPrint()
                onClose()
              }}
              className="h-8 text-xs gap-1.5 w-full font-medium rounded-xl"
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
              className="h-8 text-xs gap-1.5 w-full font-medium rounded-xl"
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
              className="w-full h-8 text-xs gap-1.5 bg-primary hover:bg-primary/90 font-bold rounded-xl"
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
              className="w-full h-8 text-xs gap-1.5 text-red-600 border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40 font-semibold rounded-xl"
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
