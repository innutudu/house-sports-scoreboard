export type AppMode = 'admin' | 'judge' | 'user'

export type EventStatus = 'upcoming' | 'live' | 'completed'

export type EventCategory = 'Track' | 'Field - Throw' | 'Field - Jump' | 'Team' | 'General'

export type House = {
  id: number
  name: string
  color: string
  hex: string
  label: string
}

export type HouseStanding = {
  id: number
  name: string
  color: string
  hex: string
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

export type PodiumWinner = {
  position: 1 | 2 | 3
  student_name: string
  house_id: number
  record?: string
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
  judge_entries?: JudgeEntry[]
}

export type InstructionCategory = {
  id: string
  title: string
  tag: string
  items: string
}

export type NavTab = 'standings' | 'events' | 'judges' | 'matrix' | 'instructions'
