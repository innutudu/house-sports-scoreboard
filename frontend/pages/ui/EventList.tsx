import { useState } from 'react'
import { CalendarDays, Pencil, Trash2, Users, CircleDot, Trophy, Medal, Award, Search, Filter } from 'lucide-react'
import { Button } from '../../lib/shadcn/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../lib/shadcn/card'
import { Skeleton } from '../../lib/shadcn/skeleton'
import { Badge } from '../../lib/shadcn/badge'
import { Input } from '../../lib/shadcn/input'
import {
  houseStyle,
  formatEventDate,
  STATUS_CHIP_CLASSES,
  STATUS_LABELS,
  type HouseStanding,
  type ScoreboardEvent,
  type AppMode,
} from './houses'

type Props = {
  events: ScoreboardEvent[]
  houses: HouseStanding[]
  loading: boolean
  currentMode?: AppMode
  onEdit: (event: ScoreboardEvent) => void
  onDelete: (event: ScoreboardEvent) => void
  onOpenJudgeCard?: (event: ScoreboardEvent) => void
}

const CATEGORY_FILTERS = [
  { id: 'All', label: 'All Events', icon: '🏆' },
  { id: 'Track', label: 'Track (Sprints & Relays)', icon: '🏃' },
  { id: 'Field - Throw', label: 'Throws (Javelin, Shot, Discus)', icon: '🎯' },
  { id: 'Field - Jump', label: 'Jumps (High & Long)', icon: '🦘' },
  { id: 'Team', label: 'Team (Tug of War)', icon: '🤝' },
]

const STATUS_FILTERS = [
  { id: 'all', label: 'All Status' },
  { id: 'live', label: '🔴 Live Now' },
  { id: 'completed', label: '✅ Completed' },
  { id: 'upcoming', label: '⏳ Upcoming' },
]

export default function EventList({
  events,
  houses,
  loading,
  currentMode = 'user',
  onEdit,
  onDelete,
  onOpenJudgeCard,
}: Props) {
  const [activeFilter, setActiveFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  if (loading && events.length === 0) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  const filteredEvents = events.filter((e) => {
    const matchesCategory = activeFilter === 'All' || e.category === activeFilter
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter
    const matchesSearch =
      !searchQuery.trim() ||
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesStatus && matchesSearch
  })

  return (
    <div className="space-y-4">
      {/* Controls Bar: Search & Status Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
          <Input
            placeholder="Search events (e.g. 100m, Relay, Javelin)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {STATUS_FILTERS.map((st) => (
            <Button
              key={st.id}
              variant={statusFilter === st.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(st.id)}
              className="text-xs h-8 px-2.5 whitespace-nowrap"
            >
              {st.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 pb-1">
        {CATEGORY_FILTERS.map((cat) => {
          const count =
            cat.id === 'All'
              ? events.length
              : events.filter((e) => e.category === cat.id).length
          return (
            <Button
              key={cat.id}
              variant={activeFilter === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter(cat.id)}
              className="text-xs h-8 gap-1.5"
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              <span className="text-[10px] opacity-70 tabular-nums">({count})</span>
            </Button>
          )
        })}
        <span className="text-xs text-muted-foreground ml-auto">
          Showing {filteredEvents.length} of {events.length} events
        </span>
      </div>

      {filteredEvents.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No events found in this category.
          </CardContent>
        </Card>
      )}

      {filteredEvents.map((event) => {
        const pointsByHouse = new Map(
          event.results.map((r) => [r.house_id, r.points] as const)
        )
        const winnerId =
          event.status === 'completed' && event.results.length > 0
            ? event.results.reduce((best, r) =>
                r.points > best.points ? r : best
              ).house_id
            : null

        return (
          <Card key={event.id} className="transition-shadow hover:shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {event.status === 'live' && (
                        <CircleDot className="w-4 h-4 text-red-500 animate-pulse" aria-hidden="true" />
                      )}
                      {event.name}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs font-normal">
                      {event.category}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="w-3.5 h-3.5" aria-hidden="true" />
                      {formatEventDate(event.event_date)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" aria-hidden="true" />
                      {event.division || 'House wise'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CHIP_CLASSES[event.status]}`}
                  >
                    {STATUS_LABELS[event.status]}
                  </span>
                  {(currentMode === 'admin' || currentMode === 'judge') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(event)}
                      aria-label={`Enter scores for ${event.name}`}
                      className="h-8 gap-1.5 text-xs"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Enter Scores
                    </Button>
                  )}
                  {onOpenJudgeCard && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onOpenJudgeCard(event)}
                      className="h-8 gap-1.5 text-xs text-primary hover:text-primary font-medium"
                      title="Open Judge Score Card for 1st, 2nd, 3rd selection"
                    >
                      <Trophy className="w-3.5 h-3.5 text-amber-500" />
                      Judge Card
                    </Button>
                  )}
                  {currentMode === 'admin' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(event)}
                      aria-label={`Delete ${event.name}`}
                      className="h-8 w-8 text-muted-foreground hover:text-red-600 dark:hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* House Points Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {houses.map((house) => {
                  const style = houseStyle(house.color)
                  const points = pointsByHouse.get(house.id) ?? null
                  const isWinner = house.id === winnerId

                  return (
                    <div
                      key={house.id}
                      className={`rounded-lg border p-3 ${
                        isWinner ? 'border-transparent ring-2 ' + style.ring : 'border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`inline-block h-2.5 w-2.5 rounded-full shrink-0 ${style.accent}`}
                            aria-hidden="true"
                          />
                          <span className="text-xs font-medium truncate">{house.name}</span>
                        </div>
                        {isWinner && (
                          <span className="text-amber-500 text-xs font-semibold">1st</span>
                        )}
                      </div>
                      <div className="mt-1 text-xl font-bold tabular-nums">
                        {points === null || points === 0 ? (
                          <span className="text-muted-foreground/60 text-sm font-normal">—</span>
                        ) : (
                          `${points} pts`
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Podium Positions (1st, 2nd, 3rd) from Score Sheet */}
              {event.podium && event.podium.length > 0 && (
                <div className="rounded-lg bg-muted/40 border border-muted p-3">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                    Placings / Student Winners
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {event.podium.map((p) => {
                      const house = houses.find((h) => h.id === p.house_id)
                      const style = house ? houseStyle(house.color) : null
                      return (
                        <div
                          key={p.position}
                          className="flex items-center gap-2 text-xs bg-background rounded-md px-2.5 py-1.5 border"
                        >
                          {p.position === 1 && <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                          {p.position === 2 && <Medal className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                          {p.position === 3 && <Award className="w-3.5 h-3.5 text-amber-700 shrink-0" />}
                          <div className="min-w-0 flex-1">
                            <span className="font-semibold">{p.student_name}</span>
                            {p.record && (
                              <span className="text-muted-foreground ml-1">({p.record})</span>
                            )}
                          </div>
                          {house && style && (
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${style.chip}`}>
                              {house.name}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Field Attempts (if throw/jump event with logged trials) */}
              {event.field_attempts && event.field_attempts.length > 0 && (
                <div className="rounded-lg border p-2.5 text-xs bg-card">
                  <div className="font-semibold text-muted-foreground mb-1.5">
                    Field Trial Attempts (1st, 2nd, 3rd Attempts)
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[11px] text-muted-foreground border-b">
                          <th className="py-1">Athlete</th>
                          <th className="py-1">House</th>
                          <th className="py-1 text-center">Att. 1</th>
                          <th className="py-1 text-center">Att. 2</th>
                          <th className="py-1 text-center">Att. 3</th>
                          <th className="py-1 text-right font-semibold">Best</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-xs">
                        {event.field_attempts.map((att, i) => {
                          const h = houses.find((x) => x.id === att.house_id)
                          return (
                            <tr key={i}>
                              <td className="py-1 font-medium">{att.student_name}</td>
                              <td className="py-1 text-muted-foreground">{h?.name}</td>
                              <td className="py-1 text-center">{att.attempt1 || '—'}</td>
                              <td className="py-1 text-center">{att.attempt2 || '—'}</td>
                              <td className="py-1 text-center">{att.attempt3 || '—'}</td>
                              <td className="py-1 text-right font-bold text-primary">{att.best || '—'}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
