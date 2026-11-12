import { useState, useEffect, useRef } from 'react'
import {
  Play,
  Pause,
  RotateCcw,
  Flag,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Timer,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Button } from '../../lib/shadcn/button'

type Props = {
  onUseTime?: (timeStr: string) => void
  className?: string
  defaultOpen?: boolean
}

export default function FieldStopwatch({ onUseTime, className = '', defaultOpen = true }: Props) {
  const [isRunning, setIsRunning] = useState(false)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [laps, setLaps] = useState<string[]>([])
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isCopied, setIsCopied] = useState(false)
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const startTimeRef = useRef<number>(0)
  const accumulatedRef = useRef<number>(0)
  const animationFrameRef = useRef<number | null>(null)

  // Audio tone generator using Web Audio API
  const playTone = (frequency = 880, duration = 0.08) => {
    if (!soundEnabled) return
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(frequency, audioCtx.currentTime)
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration)
      osc.connect(gain)
      gain.connect(audioCtx.destination)
      osc.start()
      osc.stop(audioCtx.currentTime + duration)
    } catch {
      // AudioContext not allowed or not supported
    }
  }

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = performance.now()
      const update = () => {
        const now = performance.now()
        const currentElapsed = accumulatedRef.current + (now - startTimeRef.current)
        setElapsedMs(currentElapsed)
        animationFrameRef.current = requestAnimationFrame(update)
      }
      animationFrameRef.current = requestAnimationFrame(update)
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isRunning])

  const formatDisplay = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    const hundredths = Math.floor((ms % 1000) / 10)

    const m = String(minutes).padStart(2, '0')
    const s = String(seconds).padStart(2, '0')
    const h = String(hundredths).padStart(2, '0')
    return {
      formatted: `${m}:${s}.${h}`,
      compact: minutes > 0 ? `${minutes}m ${s}.${h}s` : `${seconds}.${h}s`,
    }
  }

  const { formatted, compact } = formatDisplay(elapsedMs)

  const handleToggleStart = () => {
    if (isRunning) {
      // Pause
      accumulatedRef.current += performance.now() - startTimeRef.current
      setIsRunning(false)
      playTone(440, 0.1) // Low stop tone
    } else {
      // Start / Resume
      setIsRunning(true)
      playTone(880, 0.1) // High start beep
    }
  }

  const handleReset = () => {
    setIsRunning(false)
    accumulatedRef.current = 0
    setElapsedMs(0)
    setLaps([])
    playTone(520, 0.05)
  }

  const handleLap = () => {
    if (elapsedMs === 0) return
    setLaps((prev) => [compact, ...prev])
    playTone(660, 0.06)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(compact)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <div className={`rounded-xl border border-primary/20 bg-card shadow-sm overflow-hidden ${className}`}>
      {/* Stopwatch Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-muted/40 border-b border-border/50">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-left font-bold text-xs uppercase tracking-wider text-foreground hover:text-primary transition-colors"
        >
          <Timer className="w-4 h-4 text-primary" />
          <span>Track & Field Stopwatch</span>
          {isRunning && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
          )}
          {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground ml-1" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-1" />}
        </button>

        <div className="flex items-center gap-2">
          {!isOpen && (
            <span className="font-mono font-bold text-sm text-primary tabular-nums">
              {formatted}
            </span>
          )}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-muted-foreground hover:text-foreground p-1 rounded"
            title={soundEnabled ? 'Mute sound' : 'Enable beeps'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Stopwatch Body */}
      {isOpen && (
        <div className="p-3.5 sm:p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Big Digital Display */}
            <div className="flex flex-col items-center sm:items-start">
              <div className="font-mono text-3xl sm:text-4xl font-black tabular-nums tracking-wider text-foreground bg-muted/50 px-4 py-2 rounded-xl border border-border shadow-inner">
                {formatted}
              </div>
              <div className="text-[10px] text-muted-foreground font-semibold mt-1 uppercase tracking-widest">
                Minutes : Seconds . Hundredths
              </div>
            </div>

            {/* Stopwatch Controls */}
            <div className="flex items-center flex-wrap gap-2">
              <Button
                type="button"
                onClick={handleToggleStart}
                className={`gap-1.5 h-10 px-4 font-bold text-xs shadow ${
                  isRunning
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4 fill-white" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    {elapsedMs > 0 ? 'Resume' : 'Start'}
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleLap}
                disabled={elapsedMs === 0}
                className="gap-1 h-10 text-xs font-semibold"
                title="Record split/lap"
              >
                <Flag className="w-3.5 h-3.5 text-primary" />
                Lap
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleReset}
                disabled={elapsedMs === 0 && laps.length === 0}
                className="gap-1 h-10 text-xs text-muted-foreground hover:text-destructive"
                title="Reset stopwatch"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </Button>

              {/* Use time in active entry */}
              {onUseTime && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => onUseTime(compact)}
                  disabled={elapsedMs === 0}
                  className="gap-1.5 h-10 text-xs font-bold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
                >
                  <Timer className="w-3.5 h-3.5" />
                  Insert Time ({compact})
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={elapsedMs === 0}
                className="gap-1 h-10 text-xs text-muted-foreground"
                title="Copy formatted time"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {isCopied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>

          {/* Lap Splits List */}
          {laps.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground mb-1.5">
                <span>Recorded Splits / Laps ({laps.length})</span>
                <button
                  type="button"
                  onClick={() => setLaps([])}
                  className="text-[10px] hover:text-destructive"
                >
                  Clear splits
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {laps.map((lap, idx) => (
                  <button
                    key={`${lap}-${idx}`}
                    type="button"
                    onClick={() => onUseTime && onUseTime(lap)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/60 hover:bg-primary/10 text-xs font-mono font-medium border border-border transition-colors group"
                    title="Click to insert this split"
                  >
                    <span className="text-[10px] text-muted-foreground">#{laps.length - idx}</span>
                    <span className="font-bold text-foreground group-hover:text-primary">{lap}</span>
                    {onUseTime && (
                      <span className="text-[9px] text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        Insert
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
