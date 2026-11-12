import { createClient, SupabaseClient } from '@supabase/supabase-js'

const CONFIG_STORAGE_KEY = 'house_scoreboard_supabase_config'

export interface SupabaseConfig {
  url: string
  key: string
}

export type CloudStatus = 'live' | 'error' | 'offline'

let cachedClient: SupabaseClient | null = null
let currentCloudStatus: CloudStatus = 'offline'
let lastCloudErrorMessage: string = ''
const statusListeners = new Set<(status: CloudStatus, error?: string) => void>()

export function sanitizeSupabaseUrl(rawUrl: string): string {
  if (!rawUrl) return ''
  let cleaned = rawUrl.trim()

  // Remove surrounding quotes or backticks
  cleaned = cleaned.replace(/^["'`]+|["'`]+$/g, '')

  // 1. If user pasted PostgreSQL URI, e.g. postgresql://postgres:...@db.xyz.supabase.co:5432/postgres
  const dbMatch = cleaned.match(/db\.([a-zA-Z0-9_-]+)\.supabase\.co/)
  if (dbMatch) {
    return `https://${dbMatch[1]}.supabase.co`
  }

  // 2. If user pasted Supabase dashboard URL, e.g. https://supabase.com/dashboard/project/abcdefghijk...
  const dashMatch = cleaned.match(/supabase\.com\/dashboard\/project\/([a-zA-Z0-9_-]+)/)
  if (dashMatch) {
    return `https://${dashMatch[1]}.supabase.co`
  }

  // 3. Ensure protocol
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = `https://${cleaned}`
  }

  // 4. Strip any subpath (e.g. /rest/v1, /rest/v1/, /auth/v1, /settings) using URL parser
  try {
    const parsed = new URL(cleaned)
    cleaned = `${parsed.protocol}//${parsed.host}`
  } catch {
    cleaned = cleaned.replace(/\/rest\/v1\/?$/i, '')
    cleaned = cleaned.replace(/\/auth\/v1\/?$/i, '')
    cleaned = cleaned.replace(/\/storage\/v1\/?$/i, '')
    cleaned = cleaned.replace(/\/+$/, '')
  }

  return cleaned
}

export function getCloudStatus(): { status: CloudStatus; error: string } {
  if (!isSupabaseConfigured()) {
    return { status: 'offline', error: '' }
  }
  return { status: currentCloudStatus, error: lastCloudErrorMessage }
}

export function setCloudStatus(status: CloudStatus, error = ''): void {
  currentCloudStatus = status
  lastCloudErrorMessage = error
  statusListeners.forEach((fn) => {
    try {
      fn(status, error)
    } catch {}
  })
}

export function subscribeCloudStatus(fn: (status: CloudStatus, error?: string) => void): () => void {
  statusListeners.add(fn)
  return () => statusListeners.delete(fn)
}

const DEFAULT_SUPABASE_URL = 'https://uvgjfadzwawkzkvkixda.supabase.co'
const DEFAULT_SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2Z2pmYWR6d2F3a3prdmtpeGRhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5NDQ1NDg0MiwiZXhwIjoyMTEwMDMwODQyfQ.T54H8aeM1UKnm1EpI4C-vzyDxhxaWxY3XMU00m6-yBA'

export function getSupabaseConfig(): SupabaseConfig {
  // 1. Check localStorage first (in-app configured)
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed.url && parsed.key) {
        return {
          url: sanitizeSupabaseUrl(parsed.url),
          key: parsed.key.trim(),
        }
      }
    }
  } catch {}

  // 2. Check Vite environment variables (.env) or fallback to project defaults
  const metaEnv = (import.meta as any).env || {}
  const envUrl = sanitizeSupabaseUrl((metaEnv.VITE_SUPABASE_URL as string | undefined) || DEFAULT_SUPABASE_URL)
  const envKey = (metaEnv.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() || DEFAULT_SUPABASE_KEY

  return { url: envUrl, key: envKey }
}

export function isSupabaseConfigured(): boolean {
  const config = getSupabaseConfig()
  return Boolean(config.url && config.key && config.url.startsWith('http'))
}

export function getSupabase(): SupabaseClient | null {
  if (cachedClient) return cachedClient

  const config = getSupabaseConfig()
  if (!config.url || !config.key) {
    setCloudStatus('offline')
    return null
  }

  try {
    cachedClient = createClient(config.url, config.key, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
    return cachedClient
  } catch (err: any) {
    console.error('Failed to initialize Supabase client:', err)
    setCloudStatus('error', err?.message || 'Initialization failed')
    return null
  }
}

export function setSupabaseConfig(url: string, key: string): void {
  const cleanedUrl = sanitizeSupabaseUrl(url)
  const cleanedKey = key.trim()

  localStorage.setItem(
    CONFIG_STORAGE_KEY,
    JSON.stringify({ url: cleanedUrl, key: cleanedKey })
  )
  cachedClient = null // force re-init
  if (cleanedUrl && cleanedKey) {
    getSupabase()
  } else {
    setCloudStatus('offline')
  }
}

export function clearSupabaseConfig(): void {
  localStorage.removeItem(CONFIG_STORAGE_KEY)
  cachedClient = null
  setCloudStatus('offline')
}

export async function testSupabaseConnection(
  url?: string,
  key?: string
): Promise<{ success: boolean; message: string; sanitizedUrl?: string; count?: number }> {
  const rawUrl = url?.trim() || getSupabaseConfig().url
  const targetKey = key?.trim() || getSupabaseConfig().key

  if (!rawUrl || !targetKey) {
    setCloudStatus('error', 'Missing URL or Anon Key')
    return { success: false, message: 'Please enter both the Supabase URL and Anon Key.' }
  }

  const targetUrl = sanitizeSupabaseUrl(rawUrl)

  try {
    const testClient = createClient(targetUrl, targetKey)
    const { data, error } = await testClient.from('houses').select('id, name').limit(4)

    if (error) {
      setCloudStatus('error', error.message)
      if (error.message.includes('Invalid path') || error.code === 'PGRST125') {
        return {
          success: false,
          sanitizedUrl: targetUrl,
          message: `Invalid URL path. The Project URL must be the base project domain (e.g. ${targetUrl}) without /rest/v1 or dashboard paths. We have sanitized it for you—please click Save & Connect.`,
        }
      }
      return { success: false, message: `Database error: ${error.message}` }
    }

    setCloudStatus('live')
    return {
      success: true,
      sanitizedUrl: targetUrl,
      message: `Successfully connected! Found ${data?.length ?? 0} houses in database.`,
      count: data?.length ?? 0,
    }
  } catch (err: any) {
    setCloudStatus('error', err?.message || 'Connection failed')
    return {
      success: false,
      sanitizedUrl: targetUrl,
      message: `Connection failed: ${err.message || 'Unknown network error'}. Ensure the URL is https://<project-ref>.supabase.co without subpaths.`,
    }
  }
}
