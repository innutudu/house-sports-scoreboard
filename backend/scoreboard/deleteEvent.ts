type Params = {
  eventId: number
}

export default async function (req: { params: Params }) {
  const { eventId } = req.params
  if (!Number.isInteger(eventId)) throw new Error('A valid event is required')

  await retoolDb.query('DELETE FROM results WHERE event_id = $1', [eventId])
  await retoolDb.query('DELETE FROM events WHERE id = $1', [eventId])

  return { ok: true, eventId }
}
