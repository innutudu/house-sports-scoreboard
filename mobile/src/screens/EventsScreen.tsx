import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { ScoreboardEvent, AppMode, EventStatus } from '../types'
import { HOUSES } from '../constants/houses'

type Props = {
  events: ScoreboardEvent[]
  currentMode: AppMode
  onOpenJudgeCard: (eventId: number) => void
  onAddEvent?: () => void
  onDeleteEvent?: (eventId: number) => void
  onRefresh?: () => Promise<void> | void
}

const CATEGORIES = [
  { id: 'all', label: 'All Types', icon: 'apps' },
  { id: 'Track', label: '🏃 Track', icon: 'speedometer' },
  { id: 'Field - Throw', label: '🎯 Throws', icon: 'disc' },
  { id: 'Field - Jump', label: '🦘 Jumps', icon: 'trending-up' },
  { id: 'Team', label: '🤝 Team', icon: 'people' },
] as const

export default function EventsScreen({
  events,
  currentMode,
  onOpenJudgeCard,
  onAddEvent,
  onDeleteEvent,
  onRefresh,
}: Props) {
  const [filter, setFilter] = useState<'all' | EventStatus>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    if (!onRefresh) return
    setRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setRefreshing(false)
    }
  }

  const filteredEvents = events.filter((ev) => {
    const matchesFilter = filter === 'all' || ev.status === filter
    const matchesCategory = categoryFilter === 'all' || ev.category === categoryFilter
    const matchesSearch =
      ev.name.toLowerCase().includes(search.toLowerCase()) ||
      ev.category.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesCategory && matchesSearch
  })

  const getStatusStyle = (status: EventStatus) => {
    switch (status) {
      case 'completed':
        return { label: 'Completed', bg: '#dcfce7', text: '#15803d', icon: 'checkmark-circle' }
      case 'live':
        return { label: 'Live Now', bg: '#fee2e2', text: '#b91c1c', icon: 'radio-button-on' }
      default:
        return { label: 'Upcoming', bg: '#f1f5f9', text: '#475569', icon: 'time' }
    }
  }

  const handleDelete = (id: number, name: string) => {
    Alert.alert(
      'Delete Event',
      `Are you sure you want to delete "${name}" and all recorded points?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDeleteEvent && onDeleteEvent(id),
        },
      ]
    )
  }

  return (
    <View style={styles.container}>
      {/* Top Controls: Search & Filter Chips */}
      <View style={styles.controlsBar}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color="#94a3b8" />
          <TextInput
            placeholder="Search events (e.g. 100m, relay)..."
            placeholderTextColor="#94a3b8"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
          {search ? (
            <Pressable onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color="#94a3b8" />
            </Pressable>
          ) : null}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          {(['all', 'upcoming', 'live', 'completed'] as const).map((s) => (
            <Pressable
              key={s}
              onPress={() => setFilter(s)}
              style={[styles.filterChip, filter === s && styles.filterChipActive]}
            >
              <Text style={[styles.filterText, filter === s && styles.filterTextActive]}>
                {s === 'all' ? `All (${events.length})` : s.charAt(0).toUpperCase() + s.slice(1)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Category Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {CATEGORIES.map((cat) => {
            const count =
              cat.id === 'all'
                ? events.length
                : events.filter((e) => e.category === cat.id).length
            return (
              <Pressable
                key={cat.id}
                onPress={() => setCategoryFilter(cat.id)}
                style={[
                  styles.categoryChip,
                  categoryFilter === cat.id && styles.categoryChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    categoryFilter === cat.id && styles.categoryTextActive,
                  ]}
                >
                  {cat.label} ({count})
                </Text>
              </Pressable>
            )
          })}
        </ScrollView>
      </View>

      {/* Events List */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#2563eb']} />
        }
      >
        {filteredEvents.map((ev) => {
          const st = getStatusStyle(ev.status)
          return (
            <View key={ev.id} style={styles.eventCard}>
              <View style={styles.eventCardTop}>
                <View style={styles.eventInfo}>
                  <View style={styles.categoryRow}>
                    <Text style={styles.categoryBadge}>{ev.category}</Text>
                    {ev.division && <Text style={styles.divisionText}>· {ev.division}</Text>}
                  </View>
                  <Text style={styles.eventName}>{ev.name}</Text>
                </View>

                <View style={[styles.statusBadge, { backgroundColor: st.bg }]}>
                  <Ionicons name={st.icon as any} size={12} color={st.text} />
                  <Text style={[styles.statusText, { color: st.text }]}>{st.label}</Text>
                </View>
              </View>

              {/* Per-House Points Badges */}
              <View style={styles.houseScoresRow}>
                {HOUSES.map((h) => {
                  const pts = ev.results.find((r) => r.house_id === h.id)?.points ?? 0
                  return (
                    <View key={h.id} style={styles.houseScorePill}>
                      <View style={[styles.houseScoreDot, { backgroundColor: h.hex }]} />
                      <Text style={styles.houseScoreName}>{h.name}:</Text>
                      <Text
                        style={[
                          styles.houseScorePts,
                          pts > 0 && { color: '#0f172a', fontWeight: '900' },
                        ]}
                      >
                        {pts} pts
                      </Text>
                    </View>
                  )
                })}
              </View>

              {/* Actions Footer */}
              <View style={styles.cardActions}>
                <Text style={styles.eventDate}>📅 {ev.event_date}</Text>

                <View style={styles.actionButtons}>
                  {(currentMode === 'admin' || currentMode === 'judge') && (
                    <Pressable
                      onPress={() => onOpenJudgeCard(ev.id)}
                      style={styles.scoreBtn}
                    >
                      <Ionicons name="clipboard" size={13} color="#ffffff" />
                      <Text style={styles.scoreBtnText}>Enter Scores</Text>
                    </Pressable>
                  )}

                  {currentMode === 'admin' && (
                    <Pressable
                      onPress={() => handleDelete(ev.id, ev.name)}
                      style={styles.deleteBtn}
                      hitSlop={8}
                    >
                      <Ionicons name="trash-outline" size={16} color="#ef4444" />
                    </Pressable>
                  )}
                </View>
              </View>
            </View>
          )
        })}

        {filteredEvents.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={40} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>No Events Found</Text>
            <Text style={styles.emptySub}>No events match the selected filter or search.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  controlsBar: {
    padding: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0f172a',
  },
  filtersScroll: {
    flexDirection: 'row',
  },
  categoryScroll: {
    flexDirection: 'row',
    marginTop: 6,
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 6,
  },
  categoryChipActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  categoryTextActive: {
    color: '#2563eb',
    fontWeight: '800',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 6,
  },
  filterChipActive: {
    backgroundColor: '#0f172a',
  },
  filterText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 14,
    gap: 10,
  },
  eventCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  eventCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  eventInfo: {
    flex: 1,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  categoryBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: '#2563eb',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    textTransform: 'uppercase',
  },
  divisionText: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
  },
  eventName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  houseScoresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginBottom: 10,
  },
  houseScorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  houseScoreDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  houseScoreName: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  houseScorePts: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '700',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventDate: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2563eb',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  scoreBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },
  deleteBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#fef2f2',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#475569',
    marginTop: 10,
  },
  emptySub: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 4,
  },
})
