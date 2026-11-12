import { useEffect, useState } from 'react'
import {
  Radio,
  Trophy,
  Flame,
  Bell,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Medal,
  Award,
} from 'lucide-react'
import type { HouseStanding, ScoreboardEvent } from './houses'
import { HOUSES_CONFIG, houseStyle } from './houses'

type Props = {
  standings: HouseStanding[]
  events: ScoreboardEvent[]
  announcement?: string
}

type WinnerInfo = {
  student: string
  houseName: string
  houseColor: string
  record?: string
}

type TickerItem = {
  id: string
  tag: string
  tagColor?: string
  icon: typeof Trophy
  eventName?: string
  firstPlace?: WinnerInfo
  secondPlace?: WinnerInfo
  thirdPlace?: WinnerInfo
  text: string
}

export default function BroadcastTicker({ standings, events, announcement }: Props) {
  const [tickerIndex, setTickerIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Helper to extract student and house winner info
  const getWinnerInfo = (
    ev: ScoreboardEvent,
    position: 1 | 2 | 3
  ): WinnerInfo | null => {
    // 1. Check judge_entries first
    const fromJudges = ev.judge_entries?.find(
      (j) => j.position === position && j.name && j.name.trim().length > 0
    )
    if (fromJudges) {
      const house =
        HOUSES_CONFIG.find((h) => h.id === fromJudges.house_id) ||
        standings.find((s) => s.id === fromJudges.house_id)
      return {
        student: fromJudges.name.trim(),
        houseName: house?.name ? `${house.name} House` : 'House',
        houseColor: house ? houseStyle(house.color).hex : '#f59e0b',
        record: fromJudges.note?.trim(),
      }
    }

    // 2. Check podium winners
    const fromPodium = ev.podium?.find(
      (p) => p.position === position && p.student_name && p.student_name.trim().length > 0
    )
    if (fromPodium) {
      const house =
        HOUSES_CONFIG.find((h) => h.id === fromPodium.house_id) ||
        standings.find((s) => s.id === fromPodium.house_id)
      return {
        student: fromPodium.student_name.trim(),
        houseName: house?.name ? `${house.name} House` : 'House',
        houseColor: house ? houseStyle(house.color).hex : '#f59e0b',
        record: fromPodium.record?.trim(),
      }
    }

    return null
  }

  // Generate dynamic broadcast ticker items
  const items: TickerItem[] = []

  // 1. Completed Event Winners (Student Name + House Name + Time/Record)
  const completedEvents = events.filter((e) => e.status === 'completed')

  completedEvents.forEach((ev) => {
    const first = getWinnerInfo(ev, 1)
    const second = getWinnerInfo(ev, 2)
    const third = getWinnerInfo(ev, 3)

    if (first) {
      // Full details with student name and house
      let fullText = `${ev.name}: 1st Place — ${first.student} (${first.houseName})`
      if (first.record) fullText += ` [${first.record}]`
      fullText += ' · 5 pts'

      if (second) {
        fullText += ` | 2nd: ${second.student} (${second.houseName}) · 3 pts`
      }
      if (third) {
        fullText += ` | 3rd: ${third.student} (${third.houseName}) · 1 pt`
      }

      items.push({
        id: `event-${ev.id}`,
        tag: 'EVENT WINNER',
        tagColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        icon: Medal,
        eventName: ev.name,
        firstPlace: first,
        secondPlace: second || undefined,
        thirdPlace: third || undefined,
        text: fullText,
      })
    } else {
      // Fallback: If only house points are recorded without student names yet
      const winnerScore = ev.results?.reduce(
        (max, r) => (r.points > max.points ? r : max),
        { house_id: 0, points: 0 }
      )
      if (winnerScore && winnerScore.points > 0) {
        const winnerHouse =
          HOUSES_CONFIG.find((h) => h.id === winnerScore.house_id) ||
          standings.find((s) => s.id === winnerScore.house_id)
        items.push({
          id: `event-${ev.id}-house`,
          tag: 'EVENT WINNER',
          tagColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: Trophy,
          eventName: ev.name,
          firstPlace: winnerHouse
            ? {
                student: `${winnerHouse.name} House Representative`,
                houseName: `${winnerHouse.name} House`,
                houseColor: houseStyle(winnerHouse.color).hex,
              }
            : undefined,
          text: `${ev.name}: 1st Place to ${winnerHouse ? `${winnerHouse.name} House` : 'Winner'} (${winnerScore.points} pts)`,
        })
      }
    }
  })

  // 2. Champions Honor Roll (Roll-call of all 1st place student winners)
  const allGoldWinners: { event: string; student: string; house: string }[] = []
  completedEvents.forEach((ev) => {
    const w = getWinnerInfo(ev, 1)
    if (w) {
      allGoldWinners.push({
        event: ev.name.replace(' (4x100m)', '').replace(' Meters', 'm'),
        student: w.student,
        house: w.houseName.replace(' House', ''),
      })
    }
  })

  if (allGoldWinners.length > 0) {
    items.push({
      id: 'gold-medalists',
      tag: 'GOLD MEDALISTS',
      tagColor: 'bg-amber-500/30 text-amber-200 border-amber-400/50',
      icon: Sparkles,
      text: allGoldWinners
        .map((g) => `${g.student} (${g.house} - 🥇 ${g.event})`)
        .join(' · '),
    })
  }

  // 3. Tournament Leader Spotlight
  const leader = standings[0]
  const second = standings[1]
  if (leader) {
    const diff = second ? leader.total_points - second.total_points : 0
    items.push({
      id: 'leader',
      icon: Trophy,
      tag: 'LEADERBOARD',
      tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      text: `${leader.name} House leads the Championship with ${leader.total_points} pts${
        diff > 0 ? ` (+${diff} pts over ${second?.name})` : ''
      }`,
    })
  }

  // 4. Live Events In-Progress
  const liveEvents = events.filter((e) => e.status === 'live')
  if (liveEvents.length > 0) {
    items.push({
      id: 'live-now',
      icon: Radio,
      tag: 'LIVE NOW',
      tagColor: 'bg-red-500/20 text-red-300 border-red-500/40',
      text: `Currently on track/field: ${liveEvents.map((e) => e.name).join(', ')}`,
    })
  }

  // 5. Official Announcement
  if (announcement && announcement.trim()) {
    items.push({
      id: 'announcement',
      icon: Bell,
      tag: 'ANNOUNCEMENT',
      tagColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      text: announcement.trim(),
    })
  }

  // 6. Standings Summary
  if (standings.length >= 4) {
    items.push({
      id: 'standings-summary',
      icon: Flame,
      tag: 'STANDINGS',
      tagColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      text: `1st: ${standings[0]?.name} (${standings[0]?.total_points}pts) · 2nd: ${standings[1]?.name} (${standings[1]?.total_points}pts) · 3rd: ${standings[2]?.name} (${standings[2]?.total_points}pts) · 4th: ${standings[3]?.name} (${standings[3]?.total_points}pts)`,
    })
  }

  // Auto cycle ticker items every 5 seconds (pause on hover)
  useEffect(() => {
    if (items.length <= 1 || isPaused) return
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % items.length)
    }, 5500)
    return () => clearInterval(timer)
  }, [items.length, isPaused])

  if (items.length === 0) return null

  const currentIndex = tickerIndex % items.length
  const currentItem = items[currentIndex]
  const Icon = currentItem.icon

  const handlePrev = () => {
    setTickerIndex((prev) => (prev - 1 + items.length) % items.length)
  }

  const handleNext = () => {
    setTickerIndex((prev) => (prev + 1) % items.length)
  }

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="bg-slate-950 text-slate-100 border-y border-slate-800 px-3 sm:px-4 py-2 text-xs flex items-center justify-between gap-3 shadow-inner overflow-hidden select-none transition-colors"
      title="Hover to pause ticker"
    >
      {/* Ticker Header / Tag */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
        </span>
        <span className="font-black uppercase tracking-wider text-[11px] text-red-400 hidden xs:inline">
          SPORTS MEET TICKER
        </span>
        <span className="text-slate-700 hidden xs:inline">|</span>
        <span
          className={`px-2 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-wider ${
            currentItem.tagColor || 'bg-primary/20 text-primary border-primary/30'
          }`}
        >
          {currentItem.tag}
        </span>
      </div>

      {/* Main Dynamic Ticker Content */}
      <div className="flex-1 min-w-0 flex items-center gap-2 overflow-hidden">
        <Icon className="w-4 h-4 text-amber-400 shrink-0" />

        {currentItem.firstPlace ? (
          /* Richly formatted Student + House Winner Row */
          <div className="flex items-center gap-2 truncate text-slate-200">
            {currentItem.eventName && (
              <span className="font-extrabold text-white text-xs bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60 shrink-0">
                {currentItem.eventName}
              </span>
            )}

            {/* 1st Place Highlight */}
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-amber-400 font-bold shrink-0">🥇 1st:</span>
              <strong className="text-amber-300 font-extrabold text-xs sm:text-sm tracking-tight truncate">
                {currentItem.firstPlace.student}
              </strong>

              {/* House Badge with official color dot */}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[11px] font-bold shrink-0">
                <span
                  className="w-2 h-2 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: currentItem.firstPlace.houseColor }}
                />
                <span className="text-slate-100">{currentItem.firstPlace.houseName}</span>
              </span>

              {currentItem.firstPlace.record && (
                <span className="text-muted-foreground font-mono text-[11px] shrink-0">
                  [{currentItem.firstPlace.record}]
                </span>
              )}
              <span className="text-amber-400 font-extrabold text-[11px] shrink-0">
                (+5 pts)
              </span>
            </div>

            {/* 2nd Place Student if available */}
            {currentItem.secondPlace && (
              <div className="hidden lg:flex items-center gap-1 text-slate-400 text-xs shrink-0 pl-2 border-l border-slate-800">
                <span className="text-slate-300 font-semibold">🥈 2nd:</span>
                <span className="text-slate-200 font-medium">
                  {currentItem.secondPlace.student} ({currentItem.secondPlace.houseName})
                </span>
                <span className="text-slate-400 text-[10px] font-bold">(+3 pts)</span>
              </div>
            )}

            {/* 3rd Place Student if available */}
            {currentItem.thirdPlace && (
              <div className="hidden xl:flex items-center gap-1 text-slate-400 text-xs shrink-0 pl-2 border-l border-slate-800">
                <span className="text-amber-700 dark:text-amber-600 font-semibold">🥉 3rd:</span>
                <span className="text-slate-200 font-medium">
                  {currentItem.thirdPlace.student} ({currentItem.thirdPlace.houseName})
                </span>
                <span className="text-slate-400 text-[10px] font-bold">(+1 pt)</span>
              </div>
            )}
          </div>
        ) : (
          /* Standard text message */
          <p className="truncate font-medium text-slate-200 transition-all duration-300 text-xs">
            {currentItem.text}
          </p>
        )}
      </div>

      {/* Navigation Controls & Dots */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={handlePrev}
          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Previous item"
          aria-label="Previous ticker item"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <span className="text-[10px] font-mono font-bold text-slate-400 tabular-nums">
          {currentIndex + 1}/{items.length}
        </span>

        <button
          type="button"
          onClick={handleNext}
          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Next item"
          aria-label="Next ticker item"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
