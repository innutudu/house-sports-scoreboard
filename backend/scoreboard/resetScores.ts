export interface ResetScoresParams {
  adminPin?: string
}

export default async function resetScores(_params?: ResetScoresParams) {
  // In a real serverless backend this would clear scores.
  // The actual execution is handled in useBackendFunction for Supabase + local store.
  return { ok: true, message: 'All scores and judge entries reset to 0.' }
}
