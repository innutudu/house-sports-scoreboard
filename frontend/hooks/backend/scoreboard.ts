// Auto-generated from the files in `/backend`. Do not edit.
// Edits are discarded the next time these hooks are regenerated. Add or remove files under
// `/backend` instead.

import { useBackendFunction } from '../useBackendFunction'

/** Calls `/backend/scoreboard/createEvent.ts`. `data` is `null` until `trigger()` runs, and holds that function's return value as-is. */
export function useCreateEvent(options?: { cachePolicy?: 'stale-while-revalidate' }) {
  return useBackendFunction('/backend/scoreboard/createEvent.ts', options)
}

/** Calls `/backend/scoreboard/deleteEvent.ts`. `data` is `null` until `trigger()` runs, and holds that function's return value as-is. */
export function useDeleteEvent(options?: { cachePolicy?: 'stale-while-revalidate' }) {
  return useBackendFunction('/backend/scoreboard/deleteEvent.ts', options)
}

/** Calls `/backend/scoreboard/getEvents.ts`. `data` is `null` until `trigger()` runs, and holds that function's return value as-is. */
export function useGetEvents(options?: { cachePolicy?: 'stale-while-revalidate' }) {
  return useBackendFunction('/backend/scoreboard/getEvents.ts', options)
}

/** Calls `/backend/scoreboard/getScoreboard.ts`. `data` is `null` until `trigger()` runs, and holds that function's return value as-is. */
export function useGetScoreboard(options?: { cachePolicy?: 'stale-while-revalidate' }) {
  return useBackendFunction('/backend/scoreboard/getScoreboard.ts', options)
}

/** Calls `/backend/scoreboard/submitResults.ts`. `data` is `null` until `trigger()` runs, and holds that function's return value as-is. */
export function useSubmitResults(options?: { cachePolicy?: 'stale-while-revalidate' }) {
  return useBackendFunction('/backend/scoreboard/submitResults.ts', options)
}
