import { useEffect, useState } from 'react'
import { Radio, Trophy, Flame, Bell, Sparkles } from 'lucide-react'
import type { HouseStanding, ScoreboardEvent } from './houses'

type Props = {
  standings: HouseStanding[]
  events: ScoreboardEvent[]
  announcement?: string
}

export default function BroadcastTicker({ standings, events, announcement }: Props) {
  const [tickerIndex, setTickerIndex] = useState(0)

  // Generate dynamic broadcast items
  const items: { icon: typeof Trophy; text: string; tag: string }[] = []

  const leader = standings[0]
  const second = standings[1]
  if (leader) {
    const diff = second ? leader.total_points - second.total_points : 0
    items.push({
      icon: Trophy,
      tag: 'LEADERBOARD',
      text: `${leader.name} House leads the Championship with ${leader.total_points} pts${diff > 0 ? ` (+${diff} pts over ${second?.name})` : ''}`,
    })
  }

  // Find live events
  const liveEvents = events.filter((e) => e.status === 'live')
  if (liveEvents.length > 0) {
    items.push({
      icon: Radio,
      tag: 'LIVE NOW',
      text: `In progress: ${liveEvents.map((e) => e.name).join(', ')}`,
    })
  }

  // Find recent completed event
  const completedEvents = events.filter((e) => e.status === 'completed')
  if (completedEvents.length > 0) {
    const recent = completedEvents[completedEvents.length - 1]
    const winnerScore = recent.results.reduce((max, r) => (r.points > max.points ? r : max), { house_id: 0, points: 0 })
    const winnerHouse = standings.find((s) => s.id === winnerScore.house_id)
    items.push({
      icon: Flame,
      tag: 'RECENT RESULT',
      text: `${recent.name}: 1st Place to ${winnerHouse ? `${winnerHouse.name} House` : 'Winner'} (${winnerScore.points} pts)`,
    })
  }

  // Official announcement
  if (announcement && announcement.trim()) {
    items.push({
      icon: Bell,
      tag: 'ANNOUNCEMENT',
      text: announcement,
    })
  }

  // Standings summary
  if (standings.length >= 4) {
    items.push({
      icon: Sparkles,
      tag: 'STANDINGS',
      text: `1st: ${standings[0]?.name} (${standings[0]?.total_points}pts) · 2nd: ${standings[1]?.name} (${standings[1]?.total_points}pts) · 3rd: ${standings[2]?.name} (${standings[2]?.total_points}pts) · 4th: ${standings[3]?.name} (${standings[3]?.total_points}pts)`,
    })
  }

  // Auto cycle ticker items every 5 seconds
  useEffect(() => {
    if (items.length <= 1) return
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % items.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [items.length])

  if (items.length === 0) return null

  const currentItem = items[tickerIndex % items.length]
  const Icon = currentItem.icon

  return (
    <div className="bg-slate-900 text-slate-100 border-y border-slate-800 px-4 py-2 text-xs flex items-center justify-between gap-3 shadow-inner overflow-hidden select-none">
      <div className="flex items-center gap-2 shrink-0">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
        </span>
        <span className="font-black uppercase tracking-wider text-[11px] text-red-400">
          SPORTS MEET TICKER
        </span>
        <span className="text-slate-600">|</span>
        <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary-foreground border border-primary/30 text-[10px] font-bold uppercase tracking-wider">
          {currentItem.tag}
        </span>
      </div>

      {/* Main scrolling/animated text */}
      <div className="flex-1 min-w-0 flex items-center gap-2 overflow-hidden">
        <Icon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <p className="truncate font-medium text-slate-200 transition-all duration-300">
          {currentItem.text}
        </p>
      </div>

      {/* Item indicator dots */}
      {items.length > 1 && (
        <div className="flex items-center gap-1 shrink-0">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setTickerIndex(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === tickerIndex % items.length
                  ? 'bg-amber-400 w-3'
                  : 'bg-slate-700 hover:bg-slate-500'
              }`}
              title={`Jump to item ${i + 1}`}
              aria-label={`Jump to ticker item ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
