// Shared types and per-house styling for the sports scoreboard based on official score sheets.

export type HouseStanding = {
  id: number
  name: string
  color: string
  total_points: number
  events_scored: number
  first_places?: number
  second_places?: number
  third_places?: number
}

export type EventResult = {
  house_id: number
  points: number
}

export type EventStatus = 'upcoming' | 'live' | 'completed'

export type AppMode = 'admin' | 'judge' | 'user'

export type EventCategory = 'Track' | 'Field - Throw' | 'Field - Jump' | 'Team' | 'General'

export type PodiumWinner = {
  position: 1 | 2 | 3
  student_name: string
  house_id: number
  record?: string
}

export type FieldAttempt = {
  student_name: string
  house_id: number
  attempt1: string
  attempt2: string
  attempt3: string
  best: string
  position?: number
}

export type JudgeEntry = {
  id: string
  name: string
  house_id: number
  position: 1 | 2 | 3 | null
  note?: string
}

export type ScoreboardEvent = {
  id: number
  name: string
  category: string
  division?: string
  event_date: string
  status: EventStatus
  results: EventResult[]
  podium?: PodiumWinner[]
  field_attempts?: FieldAttempt[]
  judge_entries?: JudgeEntry[]
}

export const OFFICIAL_EVENTS = [
  { name: '100 Meters', category: 'Track', division: 'House wise Competition' },
  { name: '200 Meters', category: 'Track', division: 'House wise Competition' },
  { name: '400 Meters', category: 'Track', division: 'House wise Competition' },
  { name: '800 Meters', category: 'Track', division: 'House wise Competition' },
  { name: '1500 Meters', category: 'Track', division: 'House wise Competition' },
  { name: 'Relay', category: 'Track', division: 'House wise Competition' },
  { name: 'Javelin', category: 'Field - Throw', division: 'House wise Competition' },
  { name: 'Shot-put', category: 'Field - Throw', division: 'House wise Competition' },
  { name: 'Discus', category: 'Field - Throw', division: 'House wise Competition' },
  { name: 'High Jump', category: 'Field - Jump', division: 'House wise Competition' },
  { name: 'Long Jump', category: 'Field - Jump', division: 'House wise Competition' },
  { name: 'Tug of War', category: 'Team', division: 'House wise Competition' },
]

export const MARCH_PAST_SCHOOLS = [
  "St. Xavier’s Collegiate School, Maharo",
  "St. Xavier’s Inter College, Maharo",
  "St. Xavier’s (Eng) Sahibganj",
  "St. John Berchmans School, Mundli",
  "St. Xavier’s (Hindi) Sahibganj",
  "St. Stanislaus School, Hathimara",
  "St. Xavier’s School, Baghmara",
  "Arrupe School, Batbhanga",
  "St. Xavier’s School, Karon",
  "Loyola School, Jibonpur",
  "St. Xavier’s, Muruguni",
  "Khrist Raja, Nunbata",
  "Debono School, Chilimpur",
  "Jeevan Jyoti School, Satia",
  "Loyola Mandir, Purnakesri",
  "Gandhi Jayanti School, Sitapar",
]

export const HOUSES_CONFIG = [
  { id: 1, name: 'Britto', color: 'azure', hex: '#2F8CDC', label: 'Britto House' },
  { id: 2, name: 'Campion', color: 'pink', hex: '#F5A9CA', label: 'Campion House' },
  { id: 3, name: 'Kostka', color: 'lime', hex: '#82CC1F', label: 'Kostka House' },
  { id: 4, name: 'Loyola', color: 'maroon', hex: '#9B1C3B', label: 'Loyola House' },
] as const

export const HOUSE_COLOR_KEYS = ['azure', 'pink', 'lime', 'maroon'] as const
export type HouseColorKey = (typeof HOUSE_COLOR_KEYS)[number]

export type HouseStyle = {
  hex: string
  accent: string
  chip: string
  text: string
  bar: string
  ring: string
  badge: string
}

const STYLES: Record<string, HouseStyle> = {
  azure: {
    hex: '#2F8CDC',
    accent: 'bg-[#2F8CDC]',
    chip: 'bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200 border-sky-200',
    text: 'text-[#2F8CDC] dark:text-sky-400',
    bar: 'bg-[#2F8CDC]',
    ring: 'ring-[#2F8CDC]',
    badge: 'border-[#2F8CDC] text-[#2F8CDC] bg-sky-50 dark:bg-sky-950 dark:text-sky-300',
  },
  pink: {
    hex: '#F5A9CA',
    accent: 'bg-[#F5A9CA]',
    chip: 'bg-pink-100 text-pink-900 dark:bg-pink-950 dark:text-pink-200 border-pink-200',
    text: 'text-pink-600 dark:text-pink-300',
    bar: 'bg-[#F5A9CA]',
    ring: 'ring-[#F5A9CA]',
    badge: 'border-[#F5A9CA] text-pink-700 bg-pink-50 dark:bg-pink-950 dark:text-pink-200',
  },
  lime: {
    hex: '#82CC1F',
    accent: 'bg-[#82CC1F]',
    chip: 'bg-lime-100 text-lime-900 dark:bg-lime-950 dark:text-lime-200 border-lime-200',
    text: 'text-lime-700 dark:text-lime-400',
    bar: 'bg-[#82CC1F]',
    ring: 'ring-[#82CC1F]',
    badge: 'border-[#82CC1F] text-lime-800 bg-lime-50 dark:bg-lime-950 dark:text-lime-300',
  },
  maroon: {
    hex: '#9B1C3B',
    accent: 'bg-[#9B1C3B]',
    chip: 'bg-rose-100 text-[#9B1C3B] dark:bg-rose-950 dark:text-rose-200 border-rose-200',
    text: 'text-[#9B1C3B] dark:text-rose-400',
    bar: 'bg-[#9B1C3B]',
    ring: 'ring-[#9B1C3B]',
    badge: 'border-[#9B1C3B] text-[#9B1C3B] bg-rose-50 dark:bg-rose-950 dark:text-rose-300',
  },
}

export function houseStyle(colorOrName: string): HouseStyle {
  const norm = (colorOrName || '').toLowerCase().trim()
  if (
    norm.includes('britto') ||
    norm.includes('azure') ||
    norm.includes('sky') ||
    norm.includes('2f8cdc') ||
    norm === 'blue'
  ) {
    return STYLES.azure
  }
  if (
    norm.includes('campion') ||
    norm.includes('pink') ||
    norm.includes('f5a9ca')
  ) {
    return STYLES.pink
  }
  if (
    norm.includes('kostka') ||
    norm.includes('lime') ||
    norm.includes('82cc1f') ||
    norm === 'green'
  ) {
    return STYLES.lime
  }
  if (
    norm.includes('loyola') ||
    norm.includes('maroon') ||
    norm.includes('burgundy') ||
    norm.includes('9b1c3b') ||
    norm === 'red'
  ) {
    return STYLES.maroon
  }
  return STYLES.azure
}

export const STATUS_LABELS: Record<EventStatus, string> = {
  upcoming: 'Upcoming',
  live: 'Live',
  completed: 'Completed',
}

export const STATUS_CHIP_CLASSES: Record<EventStatus, string> = {
  upcoming:
    'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  live: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  completed:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
}

export function formatEventDate(date: string): string {
  const d = new Date(`${date}T00:00:00`)
  if (Number.isNaN(d.getTime())) return date
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
