import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { HouseStanding, ScoreboardEvent, NavTab } from '../types'
import Podium from '../components/Podium'

type Props = {
  standings: HouseStanding[]
  events: ScoreboardEvent[]
  onNavigateTab: (tab: NavTab) => void
  onRefresh?: () => Promise<void> | void
}

export default function LeaderboardScreen({ standings, events, onNavigateTab, onRefresh }: Props) {
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
  const maxPoints = Math.max(...standings.map((s) => s.total_points), 1)
  const leader = standings[0]
  const completedEvents = events.filter((e) => e.status === 'completed').length

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return { label: '1st', icon: 'trophy', color: '#eab308', bg: '#fef9c3' }
      case 2:
        return { label: '2nd', icon: 'medal', color: '#94a3b8', bg: '#f1f5f9' }
      case 3:
        return { label: '3rd', icon: 'medal', color: '#d97706', bg: '#fef3c7' }
      default:
        return { label: `${rank}th`, icon: 'ribbon', color: '#64748b', bg: '#f8fafc' }
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#2563eb']} />
      }
    >
      {/* Hero Banner: Leading House */}
      {leader && (
        <View style={styles.heroBanner}>
          <View style={styles.heroLeft}>
            <View style={styles.heroTrophy}>
              <Ionicons name="trophy" size={28} color="#eab308" />
            </View>
            <View>
              <Text style={styles.heroSub}>CURRENT TOURNAMENT LEADER</Text>
              <Text style={styles.heroLeaderName}>
                {leader.name} House
              </Text>
              <Text style={styles.heroLeaderPoints}>
                {leader.total_points} Total Points
              </Text>
            </View>
          </View>
          <View style={[styles.heroColorBadge, { backgroundColor: leader.hex }]}>
            <Text style={styles.heroColorText}>#1</Text>
          </View>
        </View>
      )}

      {/* Quick Stats Bar */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{events.length}</Text>
          <Text style={styles.statLabel}>Total Events</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{completedEvents}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{events.length - completedEvents}</Text>
          <Text style={styles.statLabel}>Remaining</Text>
        </View>
        <Pressable
          onPress={() => onNavigateTab('matrix')}
          style={styles.matrixBtn}
        >
          <Ionicons name="grid" size={16} color="#ffffff" />
          <Text style={styles.matrixBtnText}>Score Matrix</Text>
        </Pressable>
      </View>

      {/* Championship Podium 3-Tier Step */}
      <Podium standings={standings} />

      {/* Standings List Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>HOUSE STANDINGS</Text>
        <Text style={styles.sectionSubtitle}>
          Ranked by official points (🥇 5pts · 🥈 3pts · 🥉 1pt)
        </Text>
      </View>

      {/* House Cards */}
      <View style={styles.cardsList}>
        {standings.map((house, index) => {
          const rank = index + 1
          const badge = getRankBadge(rank)
          const pct = Math.round((house.total_points / maxPoints) * 100)

          return (
            <View key={house.id} style={styles.houseCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <View style={[styles.rankBadge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.rankText, { color: badge.color }]}>
                      {badge.label}
                    </Text>
                  </View>
                  <View style={[styles.houseDot, { backgroundColor: house.hex }]} />
                  <View>
                    <Text style={styles.houseName}>{house.name} House</Text>
                    <Text style={styles.eventsScored}>
                      {house.events_scored} events scored
                    </Text>
                  </View>
                </View>

                <View style={styles.pointsBadge}>
                  <Text style={styles.pointsNumber}>{house.total_points}</Text>
                  <Text style={styles.pointsLabel}>PTS</Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${Math.max(pct, 4)}%`,
                      backgroundColor: house.hex,
                    },
                  ]}
                />
              </View>

              {/* Placed Medals Breakdown */}
              <View style={styles.medalsRow}>
                <View style={styles.medalPill}>
                  <Text style={styles.medalIcon}>🥇</Text>
                  <Text style={styles.medalCount}>{house.first_places ?? 0} Firsts</Text>
                </View>
                <View style={styles.medalPill}>
                  <Text style={styles.medalIcon}>🥈</Text>
                  <Text style={styles.medalCount}>{house.second_places ?? 0} Seconds</Text>
                </View>
                <View style={styles.medalPill}>
                  <Text style={styles.medalIcon}>🥉</Text>
                  <Text style={styles.medalCount}>{house.third_places ?? 0} Thirds</Text>
                </View>
              </View>
            </View>
          )
        })}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  heroBanner: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  heroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroTrophy: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroSub: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.8,
  },
  heroLeaderName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
  },
  heroLeaderPoints: {
    fontSize: 13,
    fontWeight: '700',
    color: '#eab308',
  },
  heroColorBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  heroColorText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNum: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748b',
    marginTop: 2,
  },
  matrixBtn: {
    flex: 1.2,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  matrixBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: 0.6,
  },
  sectionSubtitle: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 1,
  },
  cardsList: {
    gap: 12,
  },
  houseCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 12,
    fontWeight: '900',
  },
  houseDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  houseName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  eventsScored: {
    fontSize: 10,
    color: '#64748b',
  },
  pointsBadge: {
    alignItems: 'flex-end',
  },
  pointsNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
  },
  pointsLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748b',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  medalsRow: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 8,
  },
  medalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  medalIcon: {
    fontSize: 10,
  },
  medalCount: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
  },
})
