import { createClient, SupabaseClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEY = 'house_scoreboard_supabase_mobile_config'

export interface SupabaseConfig {
  url: string
  key: string
}

export function sanitizeSupabaseUrl(rawUrl: string): string {
  if (!rawUrl) return ''
  let cleaned = rawUrl.trim().replace(/^["'`]+|["'`]+$/g, '')

  // If user pasted PostgreSQL URI
  const dbMatch = cleaned.match(/db\.([a-zA-Z0-9_-]+)\.supabase\.co/)
  if (dbMatch) {
    return `https://${dbMatch[1]}.supabase.co`
  }

  // If user pasted dashboard URL
  const dashMatch = cleaned.match(/supabase\.com\/dashboard\/project\/([a-zA-Z0-9_-]+)/)
  if (dashMatch) {
    return `https://${dashMatch[1]}.supabase.co`
  }

  // Ensure protocol
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = `https://${cleaned}`
  }

  // Strip subpaths (/rest/v1, /auth/v1, trailing slashes)
  cleaned = cleaned.replace(/\/rest\/v1\/?$/i, '')
  cleaned = cleaned.replace(/\/auth\/v1\/?$/i, '')
  cleaned = cleaned.replace(/\/storage\/v1\/?$/i, '')
  cleaned = cleaned.replace(/\/+$/, '')

  return cleaned
}

let cachedClient: SupabaseClient | null = null
let memoryConfig: SupabaseConfig = { url: '', key: '' }

export async function loadSupabaseConfigAsync(): Promise<SupabaseConfig> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed.url && parsed.key) {
        memoryConfig = {
          url: sanitizeSupabaseUrl(parsed.url),
          key: parsed.key.trim(),
        }
        return memoryConfig
      }
    }
  } catch {}
  return memoryConfig
}

export function getMemorySupabaseConfig(): SupabaseConfig {
  return memoryConfig
}

export function isSupabaseConfiguredSync(): boolean {
  return Boolean(memoryConfig.url && memoryConfig.key && memoryConfig.url.startsWith('http'))
}

export function getSupabase(): SupabaseClient | null {
  if (cachedClient) return cachedClient
  if (!memoryConfig.url || !memoryConfig.key) return null

  try {
    cachedClient = createClient(memoryConfig.url, memoryConfig.key, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
    return cachedClient
  } catch (err) {
    console.error('Failed to initialize Supabase mobile client:', err)
    return null
  }
}

export async function saveSupabaseConfigAsync(url: string, key: string): Promise<void> {
  const cleanedUrl = sanitizeSupabaseUrl(url)
  const cleanedKey = key.trim()

  memoryConfig = { url: cleanedUrl, key: cleanedKey }
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(memoryConfig))

  cachedClient = null
  if (cleanedUrl && cleanedKey) {
    getSupabase()
  }
}

export async function clearSupabaseConfigAsync(): Promise<void> {
  memoryConfig = { url: '', key: '' }
  await AsyncStorage.removeItem(STORAGE_KEY)
  cachedClient = null
}

export async function testSupabaseConnection(
  url?: string,
  key?: string
): Promise<{ success: boolean; message: string; sanitizedUrl?: string; count?: number }> {
  const rawUrl = url?.trim() || memoryConfig.url
  const targetKey = key?.trim() || memoryConfig.key

  if (!rawUrl || !targetKey) {
    return { success: false, message: 'Please provide both the Supabase URL and Anon Key.' }
  }

  const targetUrl = sanitizeSupabaseUrl(rawUrl)

  try {
    const testClient = createClient(targetUrl, targetKey)
    const { data, error } = await testClient.from('houses').select('id, name').limit(4)

    if (error) {
      if (error.message.includes('Invalid path') || error.code === 'PGRST125') {
        return {
          success: false,
          sanitizedUrl: targetUrl,
          message: `Invalid URL path. The Project URL must be the base project domain (e.g. ${targetUrl}) without /rest/v1 or dashboard paths.`,
        }
      }
      return { success: false, message: `Database error: ${error.message}` }
    }

    return {
      success: true,
      sanitizedUrl: targetUrl,
      message: `Connected successfully! Found ${data?.length ?? 0} houses in database.`,
      count: data?.length ?? 0,
    }
  } catch (err: any) {
    return {
      success: false,
      sanitizedUrl: targetUrl,
      message: `Connection failed: ${err.message || 'Unknown network error'}. Ensure the URL is https://<project-ref>.supabase.co without subpaths.`,
    }
  }
}
