import { Trophy, Medal, Award, Flame, Crown, Sparkles } from 'lucide-react'
import { houseStyle, type HouseStanding } from './houses'

type Props = {
  standings: HouseStanding[]
  className?: string
}

export default function Podium({ standings, className = '' }: Props) {
  if (!standings || standings.length < 3) return null

  const first = standings[0]
  const second = standings[1]
  const third = standings[2]
  const fourth = standings[3]

  const firstStyle = houseStyle(first.color)
  const secondStyle = houseStyle(second.color)
  const thirdStyle = houseStyle(third.color)
  const fourthStyle = fourth ? houseStyle(fourth.color) : null

  const leadMargin = first.total_points - second.total_points

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-b from-card/80 to-muted/40 p-4 sm:p-6 shadow-md backdrop-blur-sm ${className}`}>
      {/* Background athletic pattern */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Championship Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6 border-b border-border/50 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base sm:text-lg tracking-tight uppercase flex items-center gap-2">
              Championship Podium
              <span className="text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                LIVE STANDINGS
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Official top 3 podium standings based on points (5-3-1 rule)
            </p>
          </div>
        </div>

        {leadMargin > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold">
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>
              {first.name} leads by <strong className="tabular-nums">+{leadMargin} pts</strong>
            </span>
          </div>
        )}
      </div>

      {/* 3-Step Podium Pedestals */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-4 pb-2 max-w-xl mx-auto">
        {/* 2nd Place Pedestal (Silver - Left) */}
        <div className="flex flex-col items-center">
          {/* Athlete / House Avatar & Badge */}
          <div className="mb-2 text-center flex flex-col items-center">
            <div
              className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-black text-white text-lg shadow-md border-2"
              style={{
                backgroundColor: secondStyle.hex,
                borderColor: `${secondStyle.hex}99`,
                boxShadow: `0 8px 16px -4px ${secondStyle.hex}40`,
              }}
            >
              <Medal className="w-6 h-6 text-white" />
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-200 border-2 border-white dark:border-slate-900 text-slate-800 text-[11px] font-black flex items-center justify-center shadow">
                2
              </div>
            </div>
            <div className="mt-2 font-bold text-xs sm:text-sm truncate max-w-[90px] sm:max-w-[120px]">
              {second.name}
            </div>
            <div className="text-[11px] text-muted-foreground font-medium">
              {second.first_places || 0} 🥇 · {second.second_places || 0} 🥈
            </div>
          </div>

          {/* Pedestal Step */}
          <div
            className="w-full rounded-t-xl border border-b-0 border-slate-300 dark:border-slate-700 bg-gradient-to-b from-slate-200/90 to-slate-300/60 dark:from-slate-800 dark:to-slate-900/80 p-2 sm:p-3 text-center flex flex-col justify-between"
            style={{ height: '110px' }}
          >
            <div className="text-[11px] font-black tracking-wider text-slate-600 dark:text-slate-300 uppercase">
              2nd Place
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black tabular-nums tracking-tight text-foreground">
                {second.total_points}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase font-semibold">
                Points
              </div>
            </div>
            <div
              className="h-1.5 w-full rounded-full mt-1"
              style={{ backgroundColor: secondStyle.hex }}
            />
          </div>
        </div>

        {/* 1st Place Pedestal (Gold - Center, Taller) */}
        <div className="flex flex-col items-center">
          {/* Crown & Trophy */}
          <div className="mb-2 text-center flex flex-col items-center relative">
            <div className="absolute -top-5 text-amber-500 animate-bounce">
              <Crown className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
            <div
              className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-lg border-2 ring-4 ring-amber-400/30"
              style={{
                backgroundColor: firstStyle.hex,
                borderColor: '#eab308',
                boxShadow: `0 12px 24px -4px ${firstStyle.hex}60`,
              }}
            >
              <Trophy className="w-7 h-7 text-white" />
              <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-400 border-2 border-white dark:border-slate-900 text-slate-950 text-xs font-black flex items-center justify-center shadow">
                1
              </div>
            </div>
            <div className="mt-2 font-black text-sm sm:text-base text-foreground truncate max-w-[100px] sm:max-w-[140px] flex items-center gap-1">
              <span>{first.name}</span>
              <Sparkles className="w-3 h-3 text-amber-500" />
            </div>
            <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
              {first.first_places || 0} 🥇 Firsts
            </div>
          </div>

          {/* Pedestal Step */}
          <div
            className="w-full rounded-t-xl border border-b-0 border-amber-400/80 bg-gradient-to-b from-amber-100/90 via-amber-200/50 to-amber-300/40 dark:from-amber-950/70 dark:via-amber-900/40 dark:to-slate-900 p-2 sm:p-3 text-center flex flex-col justify-between shadow-lg"
            style={{ height: '145px' }}
          >
            <div className="text-[11px] font-black tracking-wider text-amber-700 dark:text-amber-400 uppercase">
              🏆 Champion
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black tabular-nums tracking-tight text-foreground">
                {first.total_points}
              </div>
              <div className="text-[10px] text-amber-700 dark:text-amber-400 uppercase font-bold">
                Total Points
              </div>
            </div>
            <div
              className="h-2 w-full rounded-full mt-1"
              style={{ backgroundColor: firstStyle.hex }}
            />
          </div>
        </div>

        {/* 3rd Place Pedestal (Bronze - Right) */}
        <div className="flex flex-col items-center">
          {/* Athlete / House Avatar & Badge */}
          <div className="mb-2 text-center flex flex-col items-center">
            <div
              className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-black text-white text-lg shadow-md border-2"
              style={{
                backgroundColor: thirdStyle.hex,
                borderColor: `${thirdStyle.hex}99`,
                boxShadow: `0 8px 16px -4px ${thirdStyle.hex}40`,
              }}
            >
              <Award className="w-6 h-6 text-white" />
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-700 border-2 border-white dark:border-slate-900 text-white text-[11px] font-black flex items-center justify-center shadow">
                3
              </div>
            </div>
            <div className="mt-2 font-bold text-xs sm:text-sm truncate max-w-[90px] sm:max-w-[120px]">
              {third.name}
            </div>
            <div className="text-[11px] text-muted-foreground font-medium">
              {third.first_places || 0} 🥇 · {third.third_places || 0} 🥉
            </div>
          </div>

          {/* Pedestal Step */}
          <div
            className="w-full rounded-t-xl border border-b-0 border-amber-800/40 bg-gradient-to-b from-amber-100/60 to-amber-200/40 dark:from-amber-950/40 dark:to-slate-900/80 p-2 sm:p-3 text-center flex flex-col justify-between"
            style={{ height: '90px' }}
          >
            <div className="text-[11px] font-black tracking-wider text-amber-800 dark:text-amber-500 uppercase">
              3rd Place
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black tabular-nums tracking-tight text-foreground">
                {third.total_points}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase font-semibold">
                Points
              </div>
            </div>
            <div
              className="h-1.5 w-full rounded-full mt-1"
              style={{ backgroundColor: thirdStyle.hex }}
            />
          </div>
        </div>
      </div>

      {/* 4th Place Runner-up Strip */}
      {fourth && fourthStyle && (
        <div className="mt-3 pt-3 border-t border-border/50 flex flex-wrap items-center justify-between text-xs text-muted-foreground px-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">4th Place:</span>
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: fourthStyle.hex }}
            />
            <span className="font-medium text-foreground">{fourth.name} House</span>
            <span>·</span>
            <span>{fourth.events_scored} events scored</span>
          </div>
          <div className="font-bold tabular-nums text-foreground">
            {fourth.total_points} Points
          </div>
        </div>
      )}
    </div>
  )
}
