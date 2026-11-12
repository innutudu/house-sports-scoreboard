export type EventResult = {
  house_id: number
  points: number
}

export type ScoreboardEvent = {
  id: number
  name: string
  category: string
  event_date: string
  status: 'upcoming' | 'live' | 'completed'
  results: EventResult[]
}

export default async function () {
  const [eventsRes, resultsRes] = await Promise.all([
    retoolDb.query<{
      id: number
      name: string
      category: string
      event_date: string
      status: ScoreboardEvent['status']
    }>('SELECT id, name, category, event_date, status FROM events ORDER BY event_date DESC, id DESC'),
    retoolDb.query<EventResult>('SELECT event_id, house_id, points FROM results'),
  ])

  const resultsByEvent = new Map<number, EventResult[]>()
  for (const row of resultsRes.data) {
    const list = resultsByEvent.get(row.event_id) ?? []
    list.push({ house_id: row.house_id, points: row.points })
    resultsByEvent.set(row.event_id, list)
  }

  return eventsRes.data.map((event): ScoreboardEvent => {
    const results = resultsByEvent.get(event.id) ?? []
    return {
      id: event.id,
      name: event.name,
      category: event.category,
      event_date: event.event_date,
      status: event.status,
      results,
    }
  })
}
