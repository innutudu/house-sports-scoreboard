export type HouseScore = {
  id: number
  name: string
  color: string
  total_points: number
  events_scored: number
}

export default async function () {
  const { data } = await retoolDb.query<HouseScore>(`
    SELECT
      h.id,
      h.name,
      h.color,
      COALESCE(SUM(r.points), 0)::int AS total_points,
      COUNT(r.id)::int AS events_scored
    FROM houses h
    LEFT JOIN results r ON r.house_id = h.id
    GROUP BY h.id, h.name, h.color
    ORDER BY total_points DESC, h.name ASC
  `)
  return data
}
