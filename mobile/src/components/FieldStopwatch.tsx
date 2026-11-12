import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

type Props = {
  onUseTime?: (timeStr: string) => void
  defaultOpen?: boolean
}

export default function FieldStopwatch({ onUseTime, defaultOpen = true }: Props) {
  const [isRunning, setIsRunning] = useState(false)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [laps, setLaps] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const startTimeRef = useRef<number>(0)
  const accumulatedRef = useRef<number>(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now()
      intervalRef.current = setInterval(() => {
        const now = Date.now()
        const currentElapsed = accumulatedRef.current + (now - startTimeRef.current)
        setElapsedMs(currentElapsed)
      }, 30) // ~33fps updates
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
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

  const handleToggle = () => {
    if (isRunning) {
      // Pause
      accumulatedRef.current += Date.now() - startTimeRef.current
      setIsRunning(false)
    } else {
      // Start / Resume
      setIsRunning(true)
    }
  }

  const handleReset = () => {
    setIsRunning(false)
    accumulatedRef.current = 0
    setElapsedMs(0)
    setLaps([])
  }

  const handleLap = () => {
    if (elapsedMs === 0) return
    setLaps((prev) => [compact, ...prev])
  }

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <Pressable
        onPress={() => setIsOpen(!isOpen)}
        style={styles.header}
      >
        <View style={styles.headerLeft}>
          <Ionicons name="timer" size={16} color="#2563eb" />
          <Text style={styles.headerTitle}>FIELD STOPWATCH</Text>
          {isRunning && (
            <View style={styles.liveIndicator}>
              <View style={styles.pulseDot} />
            </View>
          )}
        </View>

        <View style={styles.headerRight}>
          {!isOpen && (
            <Text style={styles.headerCollapsedTime}>{formatted}</Text>
          )}
          <Ionicons
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={16}
            color="#64748b"
          />
        </View>
      </Pressable>

      {/* Expanded Controls */}
      {isOpen && (
        <View style={styles.body}>
          {/* Main Digital Time Display */}
          <View style={styles.displayBox}>
            <Text style={styles.digitsText}>{formatted}</Text>
            <Text style={styles.digitsSub}>MM:SS.hundredths</Text>
          </View>

          {/* Action Buttons Row */}
          <View style={styles.buttonsRow}>
            {/* Start / Pause */}
            <Pressable
              onPress={handleToggle}
              style={[
                styles.btn,
                isRunning ? styles.btnPause : styles.btnStart,
              ]}
            >
              <Ionicons
                name={isRunning ? 'pause' : 'play'}
                size={16}
                color="#ffffff"
              />
              <Text style={styles.btnText}>
                {isRunning ? 'PAUSE' : elapsedMs > 0 ? 'RESUME' : 'START'}
              </Text>
            </Pressable>

            {/* Split / Lap */}
            <Pressable
              onPress={handleLap}
              disabled={elapsedMs === 0}
              style={[styles.btn, styles.btnSecondary, elapsedMs === 0 && styles.btnDisabled]}
            >
              <Ionicons name="flag" size={16} color={elapsedMs === 0 ? '#94a3b8' : '#2563eb'} />
              <Text
                style={[
                  styles.btnSecondaryText,
                  elapsedMs === 0 && styles.btnDisabledText,
                ]}
              >
                SPLIT
              </Text>
            </Pressable>

            {/* Reset */}
            <Pressable
              onPress={handleReset}
              disabled={elapsedMs === 0 && laps.length === 0}
              style={[styles.btn, styles.btnGhost, elapsedMs === 0 && laps.length === 0 && styles.btnDisabled]}
            >
              <Ionicons
                name="refresh"
                size={16}
                color={elapsedMs === 0 && laps.length === 0 ? '#cbd5e1' : '#64748b'}
              />
            </Pressable>

            {/* Insert captured time */}
            {onUseTime && (
              <Pressable
                onPress={() => onUseTime(compact)}
                disabled={elapsedMs === 0}
                style={[
                  styles.btn,
                  styles.btnApply,
                  elapsedMs === 0 && styles.btnDisabled,
                ]}
              >
                <Ionicons name="checkmark-done" size={14} color={elapsedMs === 0 ? '#94a3b8' : '#15803d'} />
                <Text
                  style={[
                    styles.btnApplyText,
                    elapsedMs === 0 && styles.btnDisabledText,
                  ]}
                >
                  USE ({compact})
                </Text>
              </Pressable>
            )}
          </View>

          {/* Recorded Splits / Laps */}
          {laps.length > 0 && (
            <View style={styles.lapsContainer}>
              <View style={styles.lapsHeader}>
                <Text style={styles.lapsTitle}>
                  Recorded Splits ({laps.length})
                </Text>
                <Pressable onPress={() => setLaps([])}>
                  <Text style={styles.lapsClear}>Clear</Text>
                </Pressable>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.lapsList}
              >
                {laps.map((lap, idx) => (
                  <Pressable
                    key={`${lap}-${idx}`}
                    onPress={() => onUseTime && onUseTime(lap)}
                    style={styles.lapChip}
                  >
                    <Text style={styles.lapIndex}>#{laps.length - idx}</Text>
                    <Text style={styles.lapTime}>{lap}</Text>
                    {onUseTime && (
                      <Ionicons name="add-circle" size={12} color="#2563eb" style={{ marginLeft: 4 }} />
                    )}
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: 0.6,
  },
  liveIndicator: {
    marginLeft: 4,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ef4444',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerCollapsedTime: {
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '800',
    color: '#2563eb',
  },
  body: {
    padding: 12,
  },
  displayBox: {
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  digitsText: {
    fontFamily: 'monospace',
    fontSize: 32,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: 1,
  },
  digitsSub: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  btnStart: {
    backgroundColor: '#16a34a',
  },
  btnPause: {
    backgroundColor: '#d97706',
  },
  btnSecondary: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  btnGhost: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 8,
  },
  btnApply: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    flex: 1,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  btnSecondaryText: {
    color: '#2563eb',
    fontSize: 11,
    fontWeight: '800',
  },
  btnApplyText: {
    color: '#15803d',
    fontSize: 11,
    fontWeight: '800',
  },
  btnDisabledText: {
    color: '#94a3b8',
  },
  lapsContainer: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  lapsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  lapsTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  lapsClear: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ef4444',
  },
  lapsList: {
    flexDirection: 'row',
    gap: 6,
  },
  lapChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  lapIndex: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748b',
    marginRight: 4,
  },
  lapTime: {
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '800',
    color: '#0f172a',
  },
})
