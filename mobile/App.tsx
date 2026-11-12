import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'

import type {
  AppMode,
  ScoreboardEvent,
  NavTab,
  InstructionCategory,
  JudgeEntry,
  EventStatus,
} from './src/types'
import {
  loadEvents,
  saveEvents,
  loadMode,
  saveMode,
  loadInstructions,
  saveInstructions,
  loadAnnouncement,
  saveAnnouncement,
  computeStandings,
} from './src/storage/storage'
import { HOUSES } from './src/constants/houses'

import Header from './src/components/Header'
import LeftDrawer from './src/components/LeftDrawer'
import ModeModal from './src/components/ModeModal'
import CloudSyncModal from './src/components/CloudSyncModal'
import { loadSupabaseConfigAsync, getSupabase, isSupabaseConfiguredSync } from './src/services/supabase'

import LeaderboardScreen from './src/screens/LeaderboardScreen'
import ScoreMatrixScreen from './src/screens/ScoreMatrixScreen'
import EventsScreen from './src/screens/EventsScreen'
import JudgeCardScreen from './src/screens/JudgeCardScreen'
import InstructionsScreen from './src/screens/InstructionsScreen'
import AddEventModal from './src/screens/AddEventModal'

export default function App() {
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<ScoreboardEvent[]>([])
  const [appMode, setAppMode] = useState<AppMode>('admin')
  const [instructions, setInstructions] = useState<InstructionCategory[]>([])
  const [announcement, setAnnouncement] = useState('')

  const [activeTab, setActiveTab] = useState<NavTab>('standings')
  const [selectedJudgeEventId, setSelectedJudgeEventId] = useState<number | undefined>(undefined)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [modeModalOpen, setModeModalOpen] = useState(false)
  const [addEventModalOpen, setAddEventModalOpen] = useState(false)
  const [cloudSyncModalOpen, setCloudSyncModalOpen] = useState(false)

  const refreshAll = useCallback(async () => {
    try {
      const [evs, inst, ann] = await Promise.all([
        loadEvents(),
        loadInstructions(),
        loadAnnouncement(),
      ])
      setEvents(evs)
      setInstructions(inst)
      setAnnouncement(ann)
    } catch (err) {
      console.warn('Refresh error:', err)
    }
  }, [])

  // Initialize data
  useEffect(() => {
    async function init() {
      try {
        await loadSupabaseConfigAsync()
        const [evs, mode, inst, ann] = await Promise.all([
          loadEvents(),
          loadMode(),
          loadInstructions(),
          loadAnnouncement(),
        ])
        setEvents(evs)
        setAppMode(mode)
        setInstructions(inst)
        setAnnouncement(ann)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  // Realtime Supabase Subscription
  useEffect(() => {
    if (!isSupabaseConfiguredSync()) return
    const supabase = getSupabase()
    if (!supabase) return

    const channel = supabase
      .channel('scoreboard-mobile-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'results' }, () => {
        refreshAll()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
        refreshAll()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'judge_entries' }, () => {
        refreshAll()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [refreshAll])

  const standings = computeStandings(events)

  const handleSelectMode = (newMode: AppMode) => {
    setAppMode(newMode)
    saveMode(newMode)
  }

  const handleOpenJudgeCardForEvent = (eventId: number) => {
    setSelectedJudgeEventId(eventId)
    setActiveTab('judges')
  }

  const handleSaveJudgeScores = useCallback(
    (
      eventId: number,
      status: EventStatus,
      scores: { houseId: number; points: number }[],
      entries: JudgeEntry[]
    ) => {
      setEvents((prev) => {
        const updated = prev.map((ev) => {
          if (ev.id !== eventId) return ev
          return {
            ...ev,
            status,
            results: scores.map((s) => ({ house_id: s.houseId, points: s.points })),
            judge_entries: entries,
          }
        })
        saveEvents(updated)
        return updated
      })
    },
    []
  )

  const handleSaveInstructions = useCallback(
    (newInstructions: InstructionCategory[], newAnnouncement: string) => {
      setInstructions(newInstructions)
      setAnnouncement(newAnnouncement)
      saveInstructions(newInstructions)
      saveAnnouncement(newAnnouncement)
    },
    []
  )

  const handleAddEvent = useCallback(
    (newEventData: Omit<ScoreboardEvent, 'id' | 'results'>) => {
      setEvents((prev) => {
        const nextId = Math.max(...prev.map((e) => e.id), 0) + 1
        const initialResults = HOUSES.map((h) => ({ house_id: h.id, points: 0 }))
        const created: ScoreboardEvent = {
          ...newEventData,
          id: nextId,
          results: initialResults,
        }
        const updated = [created, ...prev]
        saveEvents(updated)
        return updated
      })
    },
    []
  )

  const handleDeleteEvent = useCallback((eventId: number) => {
    setEvents((prev) => {
      const updated = prev.filter((e) => e.id !== eventId)
      saveEvents(updated)
      return updated
    })
  }, [])

  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading Championship Scoreboard...</Text>
        </SafeAreaView>
      </SafeAreaProvider>
    )
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <StatusBar style="dark" />

        {/* Top Header with Distinctive Left Drawer Button & Mode Pill */}
        <Header
          currentMode={appMode}
          onOpenMenu={() => setDrawerOpen(true)}
          onOpenModeModal={() => setModeModalOpen(true)}
        />

        {/* Screen Content based on Active Tab */}
        <View style={styles.screenContainer}>
          {activeTab === 'standings' && (
            <LeaderboardScreen
              standings={standings}
              events={events}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onRefresh={refreshAll}
            />
          )}

          {activeTab === 'matrix' && (
            <ScoreMatrixScreen
              standings={standings}
              events={events}
              onBack={() => setActiveTab('standings')}
            />
          )}

          {activeTab === 'events' && (
            <EventsScreen
              events={events}
              currentMode={appMode}
              onOpenJudgeCard={handleOpenJudgeCardForEvent}
              onAddEvent={() => setAddEventModalOpen(true)}
              onDeleteEvent={handleDeleteEvent}
              onRefresh={refreshAll}
            />
          )}

          {activeTab === 'judges' && (
            <JudgeCardScreen
              events={events}
              currentMode={appMode}
              selectedEventId={selectedJudgeEventId}
              onSaveScores={handleSaveJudgeScores}
            />
          )}

          {activeTab === 'instructions' && (
            <InstructionsScreen
              instructions={instructions}
              announcement={announcement}
              currentMode={appMode}
              onSaveInstructions={handleSaveInstructions}
            />
          )}
        </View>

        {/* Bottom Tab Bar for Quick One-Handed Navigation */}
        <View style={styles.bottomTabBar}>
          <Pressable
            onPress={() => setActiveTab('standings')}
            style={styles.tabItem}
          >
            <Ionicons
              name={activeTab === 'standings' || activeTab === 'matrix' ? 'trophy' : 'trophy-outline'}
              size={20}
              color={activeTab === 'standings' || activeTab === 'matrix' ? '#2563eb' : '#64748b'}
            />
            <Text
              style={[
                styles.tabLabel,
                (activeTab === 'standings' || activeTab === 'matrix') && styles.tabLabelActive,
              ]}
            >
              Standings
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('events')}
            style={styles.tabItem}
          >
            <Ionicons
              name={activeTab === 'events' ? 'medal' : 'medal-outline'}
              size={20}
              color={activeTab === 'events' ? '#2563eb' : '#64748b'}
            />
            <Text style={[styles.tabLabel, activeTab === 'events' && styles.tabLabelActive]}>
              Events
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('judges')}
            style={styles.tabItem}
          >
            <Ionicons
              name={activeTab === 'judges' ? 'clipboard' : 'clipboard-outline'}
              size={20}
              color={activeTab === 'judges' ? '#2563eb' : '#64748b'}
            />
            <Text style={[styles.tabLabel, activeTab === 'judges' && styles.tabLabelActive]}>
              Judge Card
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('instructions')}
            style={styles.tabItem}
          >
            <Ionicons
              name={activeTab === 'instructions' ? 'document-text' : 'document-text-outline'}
              size={20}
              color={activeTab === 'instructions' ? '#2563eb' : '#64748b'}
            />
            <Text style={[styles.tabLabel, activeTab === 'instructions' && styles.tabLabelActive]}>
              Instructions
            </Text>
          </Pressable>
        </View>

        {/* Distinctive Left Side Drawer Menu */}
        <LeftDrawer
          visible={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          currentMode={appMode}
          onOpenModeModal={() => setModeModalOpen(true)}
          standings={standings}
          onAddEvent={() => setAddEventModalOpen(true)}
          onOpenCloudSync={appMode === 'admin' ? () => setCloudSyncModalOpen(true) : undefined}
        />

        {/* PIN Protected Mode Switcher Modal */}
        <ModeModal
          visible={modeModalOpen}
          onClose={() => setModeModalOpen(false)}
          currentMode={appMode}
          onSelectMode={handleSelectMode}
        />

        {/* Admin Add Event Modal */}
        <AddEventModal
          visible={addEventModalOpen}
          onClose={() => setAddEventModalOpen(false)}
          onAdd={handleAddEvent}
        />

        {/* Multi-Device Cloud Sync Modal */}
        <CloudSyncModal
          visible={cloudSyncModalOpen}
          onClose={() => setCloudSyncModalOpen(false)}
          onConnected={refreshAll}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingVertical: 8,
    paddingBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
  },
  tabLabelActive: {
    color: '#2563eb',
    fontWeight: '800',
  },
})
