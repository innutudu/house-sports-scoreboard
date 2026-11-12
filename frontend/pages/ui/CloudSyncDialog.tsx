import { useState, useEffect } from 'react'
import {
  Cloud,
  Radio,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../lib/shadcn/dialog'
import { Button } from '../../lib/shadcn/button'
import { Input } from '../../lib/shadcn/input'
import { Badge } from '../../lib/shadcn/badge'
import {
  getSupabaseConfig,
  setSupabaseConfig,
  clearSupabaseConfig,
  isSupabaseConfigured,
  testSupabaseConnection,
  sanitizeSupabaseUrl,
  getCloudStatus,
  subscribeCloudStatus,
  type CloudStatus,
} from '../../lib/supabase'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConnected?: () => void
}

export default function CloudSyncDialog({ open, onOpenChange, onConnected }: Props) {
  const [url, setUrl] = useState('')
  const [key, setKey] = useState('')
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; sanitizedUrl?: string } | null>(null)
  const [showGuide, setShowGuide] = useState(false)
  const [copiedSqlPath, setCopiedSqlPath] = useState(false)
  const [cloudState, setCloudState] = useState<{ status: CloudStatus; error: string }>(getCloudStatus())

  useEffect(() => {
    return subscribeCloudStatus((status, error) => {
      setCloudState({ status, error: error || '' })
    })
  }, [])

  useEffect(() => {
    if (open) {
      const cfg = getSupabaseConfig()
      setUrl(cfg.url)
      setKey(cfg.key)
      setTestResult(null)
      setCloudState(getCloudStatus())
    }
  }, [open])

  const handleTest = async () => {
    if (!url.trim() || !key.trim()) {
      setTestResult({
        success: false,
        message: 'Please enter both the Supabase URL and Anon Key before testing.',
      })
      return
    }

    setIsTesting(true)
    setTestResult(null)
    try {
      const res = await testSupabaseConnection(url, key)
      setTestResult(res)
      if (res.sanitizedUrl && res.sanitizedUrl !== url.trim()) {
        setUrl(res.sanitizedUrl)
      }
    } finally {
      setIsTesting(false)
    }
  }

  const handleSave = () => {
    if (!url.trim() || !key.trim()) {
      setTestResult({
        success: false,
        message: 'Please provide valid Supabase credentials.',
      })
      return
    }

    const clean = sanitizeSupabaseUrl(url)
    setUrl(clean)
    setSupabaseConfig(clean, key)
    onOpenChange(false)
    if (onConnected) onConnected()
  }

  const handleDisconnect = () => {
    clearSupabaseConfig()
    setUrl('')
    setKey('')
    setTestResult({
      success: true,
      message: 'Disconnected from cloud database. The app is now running in local offline-first mode.',
    })
    if (onConnected) onConnected()
  }

  const handleCopySqlHint = () => {
    navigator.clipboard?.writeText('db/schema.sql')
    setCopiedSqlPath(true)
    setTimeout(() => setCopiedSqlPath(false), 2000)
  }

  const isConfigured = isSupabaseConfigured()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <Cloud className="w-5 h-5 text-primary" />
              Live Cloud Synchronization
            </DialogTitle>
            <Badge
              variant="outline"
              className={`gap-1.5 text-xs py-1 font-bold ${
                cloudState.status === 'live'
                  ? 'bg-emerald-600 text-white border-emerald-700'
                  : cloudState.status === 'error'
                  ? 'bg-destructive/10 text-destructive border-destructive/30'
                  : 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200'
              }`}
            >
              <Radio
                className={`w-3 h-3 ${
                  cloudState.status === 'live'
                    ? 'animate-pulse text-white'
                    : cloudState.status === 'error'
                    ? 'text-destructive'
                    : 'text-amber-600'
                }`}
              />
              {cloudState.status === 'live'
                ? 'Cloud Sync Active'
                : cloudState.status === 'error'
                ? 'Sync Error'
                : 'Local Mode (Offline)'}
            </Badge>
          </div>
          <DialogDescription className="text-xs pt-1">
            Connect to your Supabase PostgreSQL cloud database so scores, standings, and added athletes sync live in milliseconds across all devices.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Status Message */}
          {testResult && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200'
                  : 'bg-destructive/10 border-destructive/20 text-destructive'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-destructive" />
              )}
              <div className="flex-1 font-medium leading-relaxed">{testResult.message}</div>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Supabase Project URL</span>
                <span className="text-[10px] text-primary lowercase font-mono">https://&lt;project-ref&gt;.supabase.co</span>
              </label>
              <Input
                placeholder="https://your-project-ref.supabase.co"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value)
                  if (testResult) setTestResult(null)
                }}
                className="text-xs font-mono"
              />
              <p className="text-[11px] text-muted-foreground leading-normal">
                ⚠️ Enter <strong>only</strong> the project base domain (e.g.{' '}
                <code className="text-primary font-mono font-semibold">https://xyzcompany.supabase.co</code>). Do <strong>not</strong> include{' '}
                <code>/rest/v1</code>, <code>/dashboard</code>, or extra paths.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Supabase Anon Public API Key
              </label>
              <Input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={key}
                onChange={(e) => {
                  setKey(e.target.value)
                  if (testResult) setTestResult(null)
                }}
                className="text-xs font-mono"
              />
              <p className="text-[11px] text-muted-foreground">
                Found in Supabase: <strong>Project Settings → API → Project API keys (anon / public)</strong>.
              </p>
            </div>
          </div>

          {/* Auto-fix helper hint if user has subpath */}
          {url.includes('/rest') && (
            <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between gap-2">
              <span className="text-[11px]">
                Detected extra path in URL. Click to auto-clean:
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setUrl(sanitizeSupabaseUrl(url))}
                className="h-7 text-xs font-bold gap-1 bg-white dark:bg-amber-900"
              >
                <Sparkles className="w-3 h-3 text-amber-600" />
                Auto-Fix URL
              </Button>
            </div>
          )}

          {/* Test & Disconnect Actions */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTest}
              disabled={isTesting || !url.trim() || !key.trim()}
              className="gap-1.5 text-xs h-8 font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              {isTesting ? 'Testing Connection...' : 'Test Connection'}
            </Button>

            {isConfigured && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDisconnect}
                className="text-xs h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                Disconnect & Use Local Storage
              </Button>
            )}
          </div>

          {/* 2-Minute Quick Setup Guide Accordion */}
          <div className="border rounded-lg p-3 bg-muted/30">
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="w-full flex items-center justify-between text-xs font-bold text-foreground"
            >
              <span className="flex items-center gap-1.5 text-primary">
                <span>📖</span> 2-Minute Free Supabase Setup Guide
              </span>
              {showGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showGuide && (
              <div className="mt-3 pt-3 border-t text-xs space-y-2 text-muted-foreground leading-relaxed">
                <p>
                  <strong>Step 1:</strong> Go to{' '}
                  <a
                    href="https://database.new"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline inline-flex items-center gap-0.5"
                  >
                    database.new <ExternalLink className="w-3 h-3" />
                  </a>{' '}
                  and sign up / create a free project.
                </p>
                <p>
                  <strong>Step 2:</strong> In your Supabase Dashboard, click <strong>SQL Editor</strong> on the left, open the file{' '}
                  <code className="bg-muted px-1 py-0.5 rounded font-mono text-[11px] text-foreground">
                    db/schema.sql
                  </code>{' '}
                  from this project, paste its contents into the editor, and click <strong>Run</strong>.
                </p>
                <p>
                  <strong>Step 3:</strong> In Supabase, go to <strong>Project Settings → API</strong>. Copy your{' '}
                  <strong>Project URL</strong> (looks like <code className="font-mono text-foreground font-semibold">https://xxxxxx.supabase.co</code>) and your{' '}
                  <strong>anon public API key</strong>, paste them above, and click{' '}
                  <strong>Save & Connect</strong>.
                </p>
                <div className="pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopySqlHint}
                    className="text-[11px] h-7 gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedSqlPath ? 'Path Copied!' : 'Copy Schema File Path'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-2 sm:space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={!url || !key}
            className="gap-1.5 bg-primary font-bold"
          >
            <Cloud className="w-4 h-4" />
            Save & Connect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
