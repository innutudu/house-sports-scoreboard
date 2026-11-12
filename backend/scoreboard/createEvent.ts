type Params = {
  name: string
  category: string
  eventDate: string
  status?: 'upcoming' | 'live' | 'completed'
}

export default async function (req: { params: Params }) {
  const { name, category, eventDate } = req.params
  const status = req.params.status ?? 'upcoming'
  if (!name.trim()) throw new Error('Event name is required')

  const { data } = await retoolDb.insert<{ id: number }>({
    tableName: 'events',
    changeset: { name: name.trim(), category: category.trim() || 'General', event_date: eventDate, status },
  })
  return data[0]
}
