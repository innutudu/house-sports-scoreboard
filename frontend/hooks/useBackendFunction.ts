import { useState, useCallback, useRef } from 'react'
import { getSupabase, isSupabaseConfigured, setCloudStatus } from '../lib/supabase'

export interface BackendFunctionOptions {
  cachePolicy?: 'stale-while-revalidate'
}

export interface TriggerOptions {
  skipCache?: boolean
}

export interface BackendFunctionResult<T = any> {
  data: T | null
  loading: boolean
  error: string | null
  trigger: (
    params?: any,
    options?: TriggerOptions
  ) => { result: Promise<T> }
}

const STORAGE_KEY = 'house_scoreboard_scoresheet_v4'

interface HouseRecord {
  id: number
  name: string
  color: string
  hex?: string
}

interface PodiumWinner {
  position: 1 | 2 | 3
  student_name: string
  house_id: number
  record?: string
}

interface FieldAttempt {
  student_name: string
  house_id: number
  attempt1: string
  attempt2: string
  attempt3: string
  best: string
  position?: number
}

interface JudgeEntry {
  id: string
  name: string
  house_id: number
  position: 1 | 2 | 3 | null
  note?: string
}

interface EventRecord {
  id: number
  name: string
  category: string
  division: string
  event_date: string
  status: 'upcoming' | 'live' | 'completed'
  podium?: PodiumWinner[]
  field_attempts?: FieldAttempt[]
  judge_entries?: JudgeEntry[]
}

interface ResultRecord {
  event_id: number
  house_id: number
  points: number
}

interface LocalStore {
  houses: HouseRecord[]
  events: EventRecord[]
  results: ResultRecord[]
}

const INITIAL_HOUSES: HouseRecord[] = [
  { id: 1, name: 'Britto', color: 'azure', hex: '#2F8CDC' },
  { id: 2, name: 'Campion', color: 'pink', hex: '#F5A9CA' },
  { id: 3, name: 'Kostka', color: 'lime', hex: '#82CC1F' },
  { id: 4, name: 'Loyola', color: 'maroon', hex: '#9B1C3B' },
]

const TODAY = new Date().toISOString().slice(0, 10)

const INITIAL_EVENTS: EventRecord[] = [
  {
    id: 1,
    name: '100 Meters',
    category: 'Track',
    division: 'House wise Competition',
    event_date: TODAY,
    status: 'completed',
    podium: [
      { position: 1, student_name: 'Rahul Sharma', house_id: 1, record: '11.4s' },
      { position: 2, student_name: 'Amit Ekka', house_id: 2, record: '11.8s' },
      { position: 3, student_name: 'David Murmu', house_id: 3, record: '12.1s' },
    ],
  },
  {
    id: 2,
    name: '200 Meters',
    category: 'Track',
    division: 'House wise Competition',
    event_date: TODAY,
    status: 'completed',
    podium: [
      { position: 1, student_name: 'Joseph Soren', house_id: 2, record: '24.2s' },
      { position: 2, student_name: 'Karan Singh', house_id: 4, record: '24.9s' },
      { position: 3, student_name: 'Rahul Sharma', house_id: 1, record: '25.3s' },
    ],
  },
  {
    id: 3,
    name: '400 Meters',
    category: 'Track',
    division: 'House wise Competition',
    event_date: TODAY,
    status: 'completed',
    podium: [
      { position: 1, student_name: 'Sunil Hembrom', house_id: 4, record: '54.6s' },
      { position: 2, student_name: 'Prakash Besra', house_id: 3, record: '55.8s' },
      { position: 3, student_name: 'Joseph Soren', house_id: 2, record: '56.4s' },
    ],
  },
  {
    id: 4,
    name: '800 Meters',
    category: 'Track',
    division: 'House wise Competition',
    event_date: TODAY,
    status: 'completed',
    podium: [
      { position: 1, student_name: 'Anand Toppo', house_id: 3, record: '2m 12s' },
      { position: 2, student_name: 'Rohan Gupta', house_id: 1, record: '2m 15s' },
      { position: 3, student_name: 'Karan Singh', house_id: 4, record: '2m 18s' },
    ],
  },
  {
    id: 5,
    name: '1500 Meters',
    category: 'Track',
    division: 'House wise Competition',
    event_date: TODAY,
    status: 'live',
    podium: [],
  },
  {
    id: 6,
    name: 'Relay (4x100m)',
    category: 'Track',
    division: 'House wise Competition',
    event_date: TODAY,
    status: 'upcoming',
    podium: [],
  },
  {
    id: 7,
    name: 'Javelin',
    category: 'Field - Throw',
    division: 'House wise Competition',
    event_date: TODAY,
    status: 'completed',
    podium: [
      { position: 1, student_name: 'Vikas Tudu', house_id: 1, record: '42.5m' },
      { position: 2, student_name: 'Stephen Kisku', house_id: 3, record: '39.8m' },
      { position: 3, student_name: 'Ashish Minz', house_id: 2, record: '37.4m' },
    ],
  },
  {
    id: 8,
    name: 'Shot-put',
    category: 'Field - Throw',
    division: 'House wise Competition',
    event_date: TODAY,
    status: 'completed',
    podium: [
      { position: 1, student_name: 'Manish Hansda', house_id: 4, record: '10.8m' },
      { position: 2, student_name: 'Vikas Tudu', house_id: 1, record: '10.2m' },
      { position: 3, student_name: 'Stephen Kisku', house_id: 3, record: '9.6m' },
    ],
  },
  {
    id: 9,
    name: 'Discus',
    category: 'Field - Throw',
    division: 'House wise Competition',
    event_date: TODAY,
    status: 'completed',
    podium: [
      { position: 1, student_name: 'Ashish Minz', house_id: 2, record: '29.4m' },
      { position: 2, student_name: 'Manish Hansda', house_id: 4, record: '28.1m' },
      { position: 3, student_name: 'Vikas Tudu', house_id: 1, record: '26.8m' },
    ],
  },
  {
    id: 10,
    name: 'High Jump',
    category: 'Field - Jump',
    division: 'House wise Competition',
    event_date: TODAY,
    status: 'upcoming',
    podium: [],
  },
  {
    id: 11,
    name: 'Long Jump',
    category: 'Field - Jump',
    division: 'House wise Competition',
    event_date: TODAY,
    status: 'upcoming',
    podium: [],
  },
  {
    id: 12,
    name: 'Tug of War',
    category: 'Team',
    division: 'House wise Competition',
    event_date: TODAY,
    status: 'upcoming',
    podium: [],
  },
]

const INITIAL_RESULTS: ResultRecord[] = [
  { event_id: 1, house_id: 1, points: 5 },
  { event_id: 1, house_id: 2, points: 3 },
  { event_id: 1, house_id: 3, points: 1 },
  { event_id: 1, house_id: 4, points: 0 },
  { event_id: 2, house_id: 2, points: 5 },
  { event_id: 2, house_id: 4, points: 3 },
  { event_id: 2, house_id: 1, points: 1 },
  { event_id: 2, house_id: 3, points: 0 },
  { event_id: 3, house_id: 4, points: 5 },
  { event_id: 3, house_id: 3, points: 3 },
  { event_id: 3, house_id: 2, points: 1 },
  { event_id: 3, house_id: 1, points: 0 },
  { event_id: 4, house_id: 3, points: 5 },
  { event_id: 4, house_id: 1, points: 3 },
  { event_id: 4, house_id: 4, points: 1 },
  { event_id: 4, house_id: 2, points: 0 },
  { event_id: 7, house_id: 1, points: 5 },
  { event_id: 7, house_id: 3, points: 3 },
  { event_id: 7, house_id: 2, points: 1 },
  { event_id: 7, house_id: 4, points: 0 },
  { event_id: 8, house_id: 4, points: 5 },
  { event_id: 8, house_id: 1, points: 3 },
  { event_id: 8, house_id: 3, points: 1 },
  { event_id: 8, house_id: 2, points: 0 },
  { event_id: 9, house_id: 2, points: 5 },
  { event_id: 9, house_id: 4, points: 3 },
  { event_id: 9, house_id: 1, points: 1 },
  { event_id: 9, house_id: 3, points: 0 },
]

function getStore(): LocalStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      parsed.houses = INITIAL_HOUSES
      return parsed
    }
  } catch {}
  const init: LocalStore = {
    houses: INITIAL_HOUSES,
    events: INITIAL_EVENTS,
    results: INITIAL_RESULTS,
  }
  saveStore(init)
  return init
}

function saveStore(store: LocalStore) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {}
}

// -----------------------------------------------------------------------------
// Supabase Cloud Execution Handler
// -----------------------------------------------------------------------------
async function executeSupabaseFunction(path: string, params: any): Promise<any> {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase is not configured')

  // 1. Get Scoreboard Standings from Cloud
  if (path.includes('getScoreboard')) {
    const [{ data: houses, error: hErr }, { data: results, error: rErr }, { data: podiums, error: pErr }] =
      await Promise.all([
        supabase.from('houses').select('*').order('id', { ascending: true }),
        supabase.from('results').select('*'),
        supabase.from('event_podium').select('*'),
      ])

    if (hErr) throw hErr
    if (rErr) throw rErr

    const houseList: HouseRecord[] = (houses && houses.length > 0) ? houses : INITIAL_HOUSES
    const resultList: ResultRecord[] = results ?? []
    const podiumList: any[] = podiums ?? []

    const standings = houseList.map((h) => {
      const houseResults = resultList.filter((r) => r.house_id === h.id && r.points > 0)
      const totalPoints = houseResults.reduce((acc, curr) => acc + (curr.points || 0), 0)

      let gold = 0
      let silver = 0
      let bronze = 0
      for (const p of podiumList) {
        if (p.house_id === h.id) {
          if (p.position === 1) gold++
          else if (p.position === 2) silver++
          else if (p.position === 3) bronze++
        }
      }

      return {
        id: h.id,
        name: h.name,
        color: h.color,
        total_points: totalPoints,
        events_scored: houseResults.length,
        first_places: gold,
        second_places: silver,
        third_places: bronze,
      }
    })

    standings.sort(
      (a, b) =>
        b.total_points - a.total_points ||
        (b.first_places || 0) - (a.first_places || 0) ||
        a.name.localeCompare(b.name)
    )
    return standings
  }

  // 2. Get Events from Cloud
  if (path.includes('getEvents')) {
    const [{ data: events, error: eErr }, { data: results, error: rErr }, { data: podiums, error: pErr }, { data: entries, error: jErr }] =
      await Promise.all([
        supabase.from('events').select('*').order('id', { ascending: true }),
        supabase.from('results').select('*'),
        supabase.from('event_podium').select('*'),
        supabase.from('judge_entries').select('*'),
      ])

    if (eErr) throw eErr

    return (events ?? []).map((ev) => {
      const evResults = (results ?? [])
        .filter((r) => r.event_id === ev.id)
        .map((r) => ({ house_id: r.house_id, points: r.points }))

      const evPodium = (podiums ?? [])
        .filter((p) => p.event_id === ev.id)
        .sort((a, b) => a.position - b.position)

      const evJudges = (entries ?? [])
        .filter((j) => j.event_id === ev.id)
        .map((j) => ({
          id: j.id,
          name: j.student_name,
          house_id: j.house_id,
          position: j.position,
          note: j.note,
        }))

      return {
        ...ev,
        results: evResults,
        podium: evPodium,
        judge_entries: evJudges,
      }
    })
  }

  // 3. Create Event in Cloud
  if (path.includes('createEvent')) {
    const { name, category, division, eventDate, status } = params
    const { data, error } = await supabase
      .from('events')
      .insert({
        name: (name || '').trim(),
        category: (category || 'Track').trim(),
        division: (division || 'House wise Competition').trim(),
        event_date: eventDate || TODAY,
        status: status || 'upcoming',
      })
      .select()
      .single()

    if (error) throw error
    return { id: data.id }
  }

  // 4. Submit Results & Judge Entries to Cloud
  if (path.includes('submitResults')) {
    const { eventId, status, scores, podium, judge_entries } = params

    // A. Update Event status
    if (status) {
      await supabase.from('events').update({ status }).eq('id', eventId)
    }

    // B. Save Scores into results table
    let finalScores: { houseId: number; points: number }[] = scores || []
    if ((!scores || scores.length === 0) && judge_entries) {
      const housePointsMap: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 }
      for (const entry of judge_entries) {
        if (entry.position === 1) housePointsMap[entry.house_id] = (housePointsMap[entry.house_id] || 0) + 5
        else if (entry.position === 2) housePointsMap[entry.house_id] = (housePointsMap[entry.house_id] || 0) + 3
        else if (entry.position === 3) housePointsMap[entry.house_id] = (housePointsMap[entry.house_id] || 0) + 1
      }
      finalScores = Object.entries(housePointsMap).map(([hId, pts]) => ({
        houseId: Number(hId),
        points: pts,
      }))
    }

    if (Array.isArray(finalScores) && finalScores.length > 0) {
      const upsertRows = finalScores.map((s) => ({
        event_id: eventId,
        house_id: s.houseId,
        points: s.points,
      }))
      await supabase.from('results').upsert(upsertRows, { onConflict: 'event_id,house_id' })
    }

    // C. Save Judge Entries (Participants/Athletes)
    if (Array.isArray(judge_entries)) {
      // Clean previous entries for this event and insert fresh
      await supabase.from('judge_entries').delete().eq('event_id', eventId)
      if (judge_entries.length > 0) {
        const rows = judge_entries.map((j) => ({
          id: j.id,
          event_id: eventId,
          house_id: j.house_id,
          student_name: j.name,
          position: j.position,
          note: j.note,
        }))
        await supabase.from('judge_entries').insert(rows)
      }

      // Also sync podium table
      await supabase.from('event_podium').delete().eq('event_id', eventId)
      const podiumRows: any[] = []
      for (const pos of [1, 2, 3] as const) {
        const found = judge_entries.find((j: any) => j.position === pos)
        if (found && found.name?.trim()) {
          podiumRows.push({
            event_id: eventId,
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
    } else if (Array.isArray(podium) && podium.length > 0) {
      await supabase.from('event_podium').delete().eq('event_id', eventId)
      const podiumRows = podium.map((p) => ({
        event_id: eventId,
        house_id: p.house_id,
        position: p.position,
        student_name: p.student_name,
        record: p.record || '',
      }))
      await supabase.from('event_podium').insert(podiumRows)
    }

    return { ok: true, eventId }
  }

  // 5. Delete Event from Cloud
  if (path.includes('deleteEvent')) {
    const { eventId } = params
    const { error } = await supabase.from('events').delete().eq('id', eventId)
    if (error) throw error
    return { ok: true, eventId }
  }

  // 6. Reset All Scores & Pre-filled Data
  if (path.includes('resetScores')) {
    try {
      await Promise.allSettled([
        supabase.from('results').delete().neq('house_id', -999),
        supabase.from('event_podium').delete().neq('event_id', -999),
        supabase.from('judge_entries').delete().neq('house_id', -999),
        supabase.from('events').update({ status: 'upcoming' }).neq('id', -999),
      ])
    } catch (err) {
      console.error('Supabase reset error:', err)
    }

    try {
      const store = getStore()
      store.results = []
      store.events = (store.events || []).map((e) => ({
        ...e,
        status: 'upcoming',
        podium: [],
        judge_entries: [],
        results: [],
      }))
      saveStore(store)
    } catch {}

    return { ok: true, message: 'All pre-filled scores and entries have been reset to 0.' }
  }

  throw new Error(`Unknown Supabase function: ${path}`)
}

// -----------------------------------------------------------------------------
// Local Execution Handler (Offline-First Fallback)
// -----------------------------------------------------------------------------
function executeLocalFunction(path: string, params: any): any {
  const store = getStore()

  if (path.includes('getScoreboard')) {
    const standings = store.houses.map((h) => {
      const houseResults = store.results.filter((r) => r.house_id === h.id && r.points > 0)
      const totalPoints = houseResults.reduce((acc, curr) => acc + curr.points, 0)

      let gold = 0
      let silver = 0
      let bronze = 0
      for (const ev of store.events) {
        if (ev.podium && ev.status === 'completed') {
          for (const p of ev.podium) {
            if (p.house_id === h.id) {
              if (p.position === 1) gold++
              else if (p.position === 2) silver++
              else if (p.position === 3) bronze++
            }
          }
        }
      }

      return {
        id: h.id,
        name: h.name,
        color: h.color,
        total_points: totalPoints,
        events_scored: houseResults.length,
        first_places: gold,
        second_places: silver,
        third_places: bronze,
      }
    })
    standings.sort(
      (a, b) =>
        b.total_points - a.total_points ||
        (b.first_places || 0) - (a.first_places || 0) ||
        a.name.localeCompare(b.name)
    )
    return standings
  }

  if (path.includes('getEvents')) {
    const eventsSorted = [...store.events].sort((a, b) => a.id - b.id)
    return eventsSorted.map((event) => {
      const results = store.results
        .filter((r) => r.event_id === event.id)
        .map((r) => ({ house_id: r.house_id, points: r.points }))
      return {
        ...event,
        results,
      }
    })
  }

  if (path.includes('createEvent')) {
    const newId = store.events.length > 0 ? Math.max(...store.events.map((e) => e.id)) + 1 : 1
    const newEvent: EventRecord = {
      id: newId,
      name: (params?.name || '').trim(),
      category: (params?.category || 'Track').trim(),
      division: (params?.division || 'House wise Competition').trim(),
      event_date: params?.eventDate || TODAY,
      status: params?.status || 'upcoming',
      podium: params?.podium || [],
      field_attempts: params?.field_attempts || [],
      judge_entries: params?.judge_entries || [],
    }
    store.events.push(newEvent)
    saveStore(store)
    return { id: newId }
  }

  if (path.includes('submitResults')) {
    const { eventId, status, scores, podium, field_attempts, judge_entries } = params
    const evt = store.events.find((e) => e.id === eventId)
    if (evt) {
      if (status) evt.status = status
      if (podium !== undefined) evt.podium = podium
      if (field_attempts !== undefined) evt.field_attempts = field_attempts
      if (judge_entries !== undefined) {
        evt.judge_entries = judge_entries
        if (!podium || podium.length === 0) {
          const derivedPodium: PodiumWinner[] = []
          for (const pos of [1, 2, 3] as const) {
            const found = judge_entries.find((j: JudgeEntry) => j.position === pos)
            if (found && found.name.trim()) {
              derivedPodium.push({
                position: pos,
                student_name: found.name.trim(),
                house_id: found.house_id,
                record: found.note,
              })
            }
          }
          if (derivedPodium.length > 0) {
            evt.podium = derivedPodium
          }
        }
      }
    }

    let finalScores: { houseId: number; points: number }[] = scores || []
    if ((!scores || scores.length === 0) && judge_entries) {
      const housePointsMap: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 }
      for (const entry of judge_entries) {
        if (entry.position === 1) housePointsMap[entry.house_id] = (housePointsMap[entry.house_id] || 0) + 5
        else if (entry.position === 2) housePointsMap[entry.house_id] = (housePointsMap[entry.house_id] || 0) + 3
        else if (entry.position === 3) housePointsMap[entry.house_id] = (housePointsMap[entry.house_id] || 0) + 1
      }
      finalScores = Object.entries(housePointsMap).map(([hId, pts]) => ({
        houseId: Number(hId),
        points: pts,
      }))
    }

    if (Array.isArray(finalScores)) {
      for (const s of finalScores) {
        const idx = store.results.findIndex(
          (r) => r.event_id === eventId && r.house_id === s.houseId
        )
        if (idx >= 0) {
          store.results[idx].points = s.points
        } else {
          store.results.push({
            event_id: eventId,
            house_id: s.houseId,
            points: s.points,
          })
        }
      }
    }
    saveStore(store)
    return { ok: true, eventId, scoresSaved: finalScores.length }
  }

  if (path.includes('deleteEvent')) {
    const { eventId } = params
    store.events = store.events.filter((e) => e.id !== eventId)
    store.results = store.results.filter((r) => r.event_id !== eventId)
    saveStore(store)
    return { ok: true, eventId }
  }

  if (path.includes('resetScores')) {
    store.results = []
    store.events = store.events.map((e) => ({
      ...e,
      status: 'upcoming',
      podium: [],
      judge_entries: [],
      results: [],
    }))
    saveStore(store)
    return { ok: true, message: 'All local scores and entries reset to 0.' }
  }

  throw new Error(`Unknown backend function: ${path}`)
}

export function useBackendFunction<T = any>(
  path: string,
  _options?: BackendFunctionOptions
): BackendFunctionResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  const trigger = useCallback(
    (params?: any, _options?: TriggerOptions) => {
      setLoading(true)
      setError(null)

      const promise = (async () => {
        try {
          // If Supabase is configured, use cloud sync with instant fall-back to local on network drop
          if (isSupabaseConfigured()) {
            try {
              const cloudResult = await executeSupabaseFunction(path, params)
              setCloudStatus('live')
              if (mountedRef.current) setData(cloudResult)
              return cloudResult as T
            } catch (cloudErr: any) {
              const errorText = cloudErr?.message || 'Database error'
              setCloudStatus('error', errorText)
              console.warn('Supabase cloud call failed, falling back to local storage:', errorText)
            }
          }

          // In-browser execution with local storage
          await new Promise((resolve) => setTimeout(resolve, 40))
          const result = executeLocalFunction(path, params) as T
          if (mountedRef.current) setData(result)
          return result
        } catch (err: any) {
          const errMsg = err?.message || 'Error executing backend function'
          if (mountedRef.current) setError(errMsg)
          throw err
        } finally {
          if (mountedRef.current) setLoading(false)
        }
      })()

      return { result: promise }
    },
    [path]
  )

  return { data, loading, error, trigger }
}
