import { Trophy, Medal, Award, Star, Table } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../lib/shadcn/card'
import { Skeleton } from '../../lib/shadcn/skeleton'
import { houseStyle, type HouseStanding, type ScoreboardEvent } from './houses'

const RANK_ICONS = [
  { icon: Trophy, label: '1st', color: 'text-amber-500' },
  { icon: Medal, label: '2nd', color: 'text-slate-400' },
  { icon: Award, label: '3rd', color: 'text-amber-700' },
  { icon: Star, label: '4th', color: 'text-muted-foreground' },
]

type Props = {
  standings: HouseStanding[]
  events: ScoreboardEvent[]
  loading: boolean
}

export default function Standings({ standings, events, loading }: Props) {
  if (loading && standings.length === 0) {
    return (
      <div className="space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  const maxPoints = Math.max(1, ...standings.map((s) => s.total_points))

  return (
    <div className="space-y-6">
      {/* Visual Leaderboard Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            House Standings & Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {standings.map((house, index) => {
            const style = houseStyle(house.color)
            const rank = RANK_ICONS[index]
            const RankIcon = rank?.icon ?? Star
            const isFirst = index === 0

            return (
              <div
                key={house.id}
                className={`rounded-xl border p-4 transition-colors ${
                  isFirst
                    ? `border-transparent ring-2 ${style.ring} bg-card shadow-sm`
                    : 'border-border bg-card'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <RankIcon
                      className={`w-6 h-6 shrink-0 ${rank?.color ?? 'text-muted-foreground'}`}
                      aria-label={`${rank?.label ?? 'House'} place`}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block h-3.5 w-3.5 rounded-full shrink-0 ${style.accent}`}
                          aria-hidden="true"
                        />
                        <span className="font-semibold text-lg truncate">
                          {house.name} House
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span>{house.events_scored} scored</span>
                        {house.first_places !== undefined && (
                          <span className="text-amber-600 dark:text-amber-400 font-medium">
                            🥇 {house.first_places}
                          </span>
                        )}
                        {house.second_places !== undefined && (
                          <span className="text-slate-500 dark:text-slate-300 font-medium">
                            🥈 {house.second_places}
                          </span>
                        )}
                        {house.third_places !== undefined && (
                          <span className="text-amber-700 dark:text-amber-500 font-medium">
                            🥉 {house.third_places}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-3xl font-extrabold tabular-nums tracking-tight">
                      {house.total_points}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      Points
                    </div>
                  </div>
                </div>
                <div className="mt-3.5 h-2.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${style.bar}`}
                    style={{ width: `${(house.total_points / maxPoints) * 100}%` }}
                    role="progressbar"
                    aria-valuenow={house.total_points}
                    aria-valuemin={0}
                    aria-valuemax={maxPoints}
                  />
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Official Score Matrix from Word Document */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Table className="w-5 h-5 text-primary" />
            Official Score Matrix (House-wise Competition)
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            As formatted in the official Sports Day score sheets document.
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
                  <th className="py-3 px-3">House</th>
                  {events.map((ev) => (
                    <th key={ev.id} className="py-3 px-2 text-center whitespace-nowrap" title={ev.name}>
                      {ev.name.replace(' (4x100m)', '').replace(' Meters', 'm')}
                    </th>
                  ))}
                  <th className="py-3 px-3 text-center bg-muted/80">Total</th>
                  <th className="py-3 px-3 text-center bg-muted/80">Rank</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {standings.map((house, idx) => {
                  const style = houseStyle(house.color)
                  return (
                    <tr key={house.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-3 font-semibold whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`inline-block h-2.5 w-2.5 rounded-full ${style.accent}`} />
                          {house.name}
                        </div>
                      </td>
                      {events.map((ev) => {
                        const score = ev.results.find((r) => r.house_id === house.id)?.points
                        return (
                          <td key={ev.id} className="py-3 px-2 text-center tabular-nums text-xs">
                            {score !== undefined && score > 0 ? (
                              <span className="font-semibold text-foreground">{score}</span>
                            ) : (
                              <span className="text-muted-foreground/60">—</span>
                            )}
                          </td>
                        )
                      })}
                      <td className="py-3 px-3 text-center font-bold text-base bg-muted/40 tabular-nums">
                        {house.total_points}
                      </td>
                      <td className="py-3 px-3 text-center font-semibold bg-muted/40 whitespace-nowrap">
                        {idx === 0 && <span className="text-amber-500 font-bold">1st 🏆</span>}
                        {idx === 1 && <span className="text-slate-400 font-bold">2nd 🥈</span>}
                        {idx === 2 && <span className="text-amber-700 font-bold">3rd 🥉</span>}
                        {idx > 2 && <span className="text-muted-foreground">{idx + 1}th</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
