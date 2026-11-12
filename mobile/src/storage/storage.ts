import AsyncStorage from '@react-native-async-storage/async-storage'
import type { ScoreboardEvent, HouseStanding, AppMode, InstructionCategory, JudgeEntry, PodiumWinner } from '../types'
import { HOUSES, INITIAL_EVENTS, DEFAULT_INSTRUCTIONS, DEFAULT_ANNOUNCEMENT } from '../constants/houses'
import { getSupabase, isSupabaseConfiguredSync } from '../services/supabase'

const KEYS = {
  EVENTS: '@house_sports_events_v2',
  MODE: '@house_sports_mode_v2',
  INSTRUCTIONS: '@house_sports_instructions_v2',
  ANNOUNCEMENT: '@house_sports_announcement_v2',
}

export async function loadEvents(): Promise<ScoreboardEvent[]> {
  const supabase = getSupabase()

  // 1. Try Supabase cloud first if configured
  if (isSupabaseConfiguredSync() && supabase) {
    try {
      const [{ data: events, error: eErr }, { data: results, error: rErr }, { data: podiums, error: pErr }, { data: entries, error: jErr }] =
        await Promise.all([
          supabase.from('events').select('*').order('id', { ascending: true }),
          supabase.from('results').select('*'),
          supabase.from('event_podium').select('*'),
          supabase.from('judge_entries').select('*'),
        ])

      if (!eErr && events && events.length > 0) {
        const merged: ScoreboardEvent[] = events.map((ev) => {
          const evResults = (results ?? [])
            .filter((r) => r.event_id === ev.id)
            .map((r) => ({ house_id: r.house_id, points: r.points }))

          const evPodium: PodiumWinner[] = (podiums ?? [])
            .filter((p) => p.event_id === ev.id)
            .sort((a, b) => a.position - b.position)
            .map((p) => ({
              position: p.position as 1 | 2 | 3,
              student_name: p.student_name,
              house_id: p.house_id,
              record: p.record || '',
            }))

          const evJudges: JudgeEntry[] = (entries ?? [])
            .filter((j) => j.event_id === ev.id)
            .map((j) => ({
              id: j.id,
              name: j.student_name,
              house_id: j.house_id,
              position: j.position as 1 | 2 | 3 | null,
              note: j.note || '',
            }))

          return {
            id: ev.id,
            name: ev.name,
            category: ev.category,
            division: ev.division,
            event_date: ev.event_date,
            status: ev.status,
            results: evResults,
            podium: evPodium,
            judge_entries: evJudges,
          }
        })

        // Cache locally for offline resilience
        await AsyncStorage.setItem(KEYS.EVENTS, JSON.stringify(merged))
        return merged
      }
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to local storage', err)
    }
  }

  // 2. Local AsyncStorage fallback
  try {
    const raw = await AsyncStorage.getItem(KEYS.EVENTS)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (err) {
    console.warn('Failed to load events from storage', err)
  }

  return INITIAL_EVENTS
}

export async function saveEvents(events: ScoreboardEvent[]): Promise<void> {
  // 1. Always save to local storage immediately
  try {
    await AsyncStorage.setItem(KEYS.EVENTS, JSON.stringify(events))
  } catch (err) {
    console.warn('Failed to save events to local storage', err)
  }

  // 2. If Supabase configured, push in background
  const supabase = getSupabase()
  if (isSupabaseConfiguredSync() && supabase) {
    try {
      // Upsert events
      const eventRows = events.map((e) => ({
        id: e.id,
        name: e.name,
        category: e.category,
        division: e.division || 'House wise Competition',
        event_date: e.event_date,
        status: e.status,
      }))
      await supabase.from('events').upsert(eventRows, { onConflict: 'id' })

      // Upsert results
      const resultRows: any[] = []
      events.forEach((e) => {
        e.results.forEach((r) => {
          resultRows.push({
            event_id: e.id,
            house_id: r.house_id,
            points: r.points,
          })
        })
      })
      if (resultRows.length > 0) {
        await supabase.from('results').upsert(resultRows, { onConflict: 'event_id,house_id' })
      }

      // Upsert judge entries for events that have them
      for (const e of events) {
        if (e.judge_entries) {
          await supabase.from('judge_entries').delete().eq('event_id', e.id)
          if (e.judge_entries.length > 0) {
            const entryRows = e.judge_entries.map((j) => ({
              id: j.id,
              event_id: e.id,
              house_id: j.house_id,
              student_name: j.name,
              position: j.position,
              note: j.note,
            }))
            await supabase.from('judge_entries').insert(entryRows)
          }

          // Sync podium
          await supabase.from('event_podium').delete().eq('event_id', e.id)
          const podiumRows: any[] = []
          for (const pos of [1, 2, 3] as const) {
            const found = e.judge_entries.find((j) => j.position === pos)
            if (found && found.name.trim()) {
              podiumRows.push({
                event_id: e.id,
                house_id: found.house_id,
                position: pos,
                student_name: found.name.trim(),
                record: found.note || '',
              })
            }
          }
          if (podiumRows.length > 0) {
            await supabase.from('event_podium').insert(podiumRows)
          }
        }
      }
    } catch (err) {
      console.warn('Failed to sync events to Supabase cloud', err)
    }
  }
}

export async function loadMode(): Promise<AppMode> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.MODE)
    if (raw === 'admin' || raw === 'judge' || raw === 'user') return raw
  } catch {}
  return 'admin'
}

export async function saveMode(mode: AppMode): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.MODE, mode)
  } catch {}
}

export async function loadInstructions(): Promise<InstructionCategory[]> {
  const supabase = getSupabase()

  if (isSupabaseConfiguredSync() && supabase) {
    try {
      const { data, error } = await supabase
        .from('meet_instructions')
        .select('*')
        .order('category', { ascending: true })

      if (!error && data && data.length > 0) {
        const mapped: InstructionCategory[] = data.map((row: any) => ({
          id: row.id,
          title: row.title,
          tag: row.category || 'General',
          items: row.content || '',
        }))

        await AsyncStorage.setItem(KEYS.INSTRUCTIONS, JSON.stringify(mapped))
        return mapped
      }
    } catch (err) {
      console.warn('Supabase instructions fetch failed', err)
    }
  }

  try {
    const raw = await AsyncStorage.getItem(KEYS.INSTRUCTIONS)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}

  return DEFAULT_INSTRUCTIONS
}

export async function saveInstructions(instructions: InstructionCategory[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.INSTRUCTIONS, JSON.stringify(instructions))
  } catch {}

  const supabase = getSupabase()
  if (isSupabaseConfiguredSync() && supabase) {
    try {
      const rows = instructions.map((cat) => ({
        id: cat.id,
        title: cat.title,
        category: cat.tag,
        content: cat.items,
      }))
      if (rows.length > 0) {
        await supabase.from('meet_instructions').upsert(rows, { onConflict: 'id' })
      }
    } catch (err) {
      console.warn('Failed to sync instructions to Supabase', err)
    }
  }
}

export async function loadAnnouncement(): Promise<string> {
  const supabase = getSupabase()
  if (isSupabaseConfiguredSync() && supabase) {
    try {
      const { data, error } = await supabase
        .from('meet_announcements')
        .select('announcement')
        .order('id', { ascending: true })
        .limit(1)
        .single()

      if (!error && data?.announcement) {
        await AsyncStorage.setItem(KEYS.ANNOUNCEMENT, data.announcement)
        return data.announcement
      }
    } catch {}
  }

  try {
    const raw = await AsyncStorage.getItem(KEYS.ANNOUNCEMENT)
    if (raw !== null) return raw
  } catch {}
  return DEFAULT_ANNOUNCEMENT
}

export async function saveAnnouncement(announcement: string): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.ANNOUNCEMENT, announcement)
  } catch {}

  const supabase = getSupabase()
  if (isSupabaseConfiguredSync() && supabase) {
    try {
      await supabase.from('meet_announcements').upsert({ id: 1, announcement }, { onConflict: 'id' })
    } catch {}
  }
}

export function computeStandings(events: ScoreboardEvent[]): HouseStanding[] {
  const pointsMap = new Map<number, number>()
  const eventsCountMap = new Map<number, number>()
  const firstMap = new Map<number, number>()
  const secondMap = new Map<number, number>()
  const thirdMap = new Map<number, number>()

  HOUSES.forEach((h) => {
    pointsMap.set(h.id, 0)
    eventsCountMap.set(h.id, 0)
    firstMap.set(h.id, 0)
    secondMap.set(h.id, 0)
    thirdMap.set(h.id, 0)
  })

  events.forEach((ev) => {
    let hasScored = false
    ev.results.forEach((res) => {
      if (res.points > 0) {
        hasScored = true
        pointsMap.set(res.house_id, (pointsMap.get(res.house_id) ?? 0) + res.points)
        if (res.points >= 5) {
          firstMap.set(res.house_id, (firstMap.get(res.house_id) ?? 0) + 1)
        } else if (res.points === 3) {
          secondMap.set(res.house_id, (secondMap.get(res.house_id) ?? 0) + 1)
        } else if (res.points === 1) {
          thirdMap.set(res.house_id, (thirdMap.get(res.house_id) ?? 0) + 1)
        }
      }
    })
    if (hasScored) {
      ev.results.forEach((res) => {
        eventsCountMap.set(res.house_id, (eventsCountMap.get(res.house_id) ?? 0) + 1)
      })
    }
  })

  return HOUSES.map((h) => ({
    id: h.id,
    name: h.name,
    color: h.color,
    hex: h.hex,
    total_points: pointsMap.get(h.id) ?? 0,
    events_scored: eventsCountMap.get(h.id) ?? 0,
    first_places: firstMap.get(h.id) ?? 0,
    second_places: secondMap.get(h.id) ?? 0,
    third_places: thirdMap.get(h.id) ?? 0,
  })).sort((a, b) => b.total_points - a.total_points || a.name.localeCompare(b.name))
}

export async function resetAllScoresAsync(): Promise<ScoreboardEvent[]> {
  const supabase = getSupabase()
  if (supabase) {
    try {
      await Promise.allSettled([
        supabase.from('results').delete().neq('house_id', -999),
        supabase.from('event_podium').delete().neq('event_id', -999),
        supabase.from('judge_entries').delete().neq('house_id', -999),
        supabase.from('events').update({ status: 'upcoming' }).neq('id', -999),
      ])
    } catch (e) {
      console.warn('Supabase reset failed:', e)
    }
  }

  const currentEvents = await loadEvents()
  const cleanEvents: ScoreboardEvent[] = currentEvents.map((ev) => ({
    ...ev,
    status: 'upcoming' as const,
    results: [
      { house_id: 1, points: 0 },
      { house_id: 2, points: 0 },
      { house_id: 3, points: 0 },
      { house_id: 4, points: 0 },
    ],
    judge_entries: [],
  }))

  await saveEvents(cleanEvents)
  return cleanEvents
}
