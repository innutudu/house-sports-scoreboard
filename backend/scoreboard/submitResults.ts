type Params = {
  eventId: number
  status: 'upcoming' | 'live' | 'completed'
  scores: { houseId: number; points: number }[]
}

export default async function (req: { params: Params }) {
  const { eventId, status, scores } = req.params
  if (!Number.isInteger(eventId)) throw new Error('A valid event is required')
  if (!['upcoming', 'live', 'completed'].includes(status)) throw new Error('Invalid event status')

  const cleanScores = scores
    .filter((s) => Number.isInteger(s.houseId) && Number.isFinite(s.points) && s.points >= 0)
    .map((s) => ({ houseId: s.houseId, points: Math.round(s.points) }))

  for (const score of cleanScores) {
    await retoolDb.query(
      `INSERT INTO results (event_id, house_id, points)
       VALUES ($1, $2, $3)
       ON CONFLICT (event_id, house_id) DO UPDATE SET points = EXCLUDED.points`,
      [eventId, score.houseId, score.points],
    )
  }

  await retoolDb.query('UPDATE events SET status = $1 WHERE id = $2', [status, eventId])

  return { ok: true, eventId, scoresSaved: cleanScores.length }
}
