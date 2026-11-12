import { Trophy, TrendingUp, CalendarDays, ListChecks } from 'lucide-react'
import { Card, CardContent } from '../../lib/shadcn/card'
import {
  type EventStatus,
  type HouseStanding,
  type ScoreboardEvent,
} from './houses'

type Props = {
  standings: HouseStanding[]
  events: ScoreboardEvent[]
}

function StatCard({
  icon,
  label,
  value,
  iconClass,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  iconClass: string
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-5">
        <div className={`rounded-lg p-2.5 ${iconClass}`}>{icon}</div>
        <div>
          <div className="text-2xl font-bold leading-none">{value}</div>
          <div className="text-sm text-muted-foreground mt-1">{label}</div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function StatsBar({ standings, events }: Props) {
  const leader = standings[0]
  const leaderPoints = leader?.total_points ?? 0
  const runnerUp = standings[1]?.total_points ?? 0
  const gap = leaderPoints - runnerUp
  const statusCount = (s: EventStatus) => events.filter((e) => e.status === s).length

  const leaderLine =
    leader && leaderPoints > 0
      ? `${leader.name} leads by ${gap > 0 ? gap : 0} pt${gap === 1 ? '' : 's'}`
      : 'No points recorded yet'

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={<Trophy className="w-5 h-5" />}
        label="Current leader"
        value={leader ? leader.name : '—'}
        iconClass="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
      />
      <StatCard
        icon={<TrendingUp className="w-5 h-5" />}
        label={leader && leaderPoints > 0 ? `Top score — ${leaderLine}` : 'Top score'}
        value={leaderPoints}
        iconClass="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
      />
      <StatCard
        icon={<ListChecks className="w-5 h-5" />}
        label="Events completed"
        value={statusCount('completed')}
        iconClass="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
      />
      <StatCard
        icon={<CalendarDays className="w-5 h-5" />}
        label="Live / upcoming events"
        value={statusCount('live') + statusCount('upcoming')}
        iconClass="bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300"
      />
    </div>
  )
}

export { StatCard }
