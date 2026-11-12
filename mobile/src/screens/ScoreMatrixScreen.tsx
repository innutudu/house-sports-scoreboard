import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { HouseStanding, ScoreboardEvent, NavTab } from '../types'
import { HOUSES } from '../constants/houses'

type Props = {
  standings: HouseStanding[]
  events: ScoreboardEvent[]
  onBack: () => void
}

export default function ScoreMatrixScreen({ standings, events, onBack }: Props) {
  // Map points by eventId and houseId
  const getEventPoints = (eventId: number, houseId: number): number => {
    const event = events.find((e) => e.id === eventId)
    if (!event) return 0
    const res = event.results.find((r) => r.house_id === houseId)
    return res?.points ?? 0
  }

  const sortedStandings = [...standings].sort((a, b) => b.total_points - a.total_points)

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.headerBar}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={18} color="#0f172a" />
          <Text style={styles.backText}>Leaderboard</Text>
        </Pressable>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Official Score Matrix</Text>
          <Text style={styles.headerSubtitle}>Houses vs All 12 Events</Text>
        </View>
      </View>

      <Text style={styles.scrollHint}>
        👉 Swipe horizontally to view all 12 events
      </Text>

      {/* 2D Scrollable Matrix Table */}
      <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.horizontalScroll}>
        <View style={styles.tableContainer}>
          {/* Table Header Row */}
          <View style={styles.tableHeaderRow}>
            <View style={[styles.cell, styles.houseHeaderCell]}>
              <Text style={styles.headerCellText}>HOUSE</Text>
            </View>

            {events.map((ev) => (
              <View key={ev.id} style={[styles.cell, styles.eventHeaderCell]}>
                <Text style={styles.eventHeaderNum}>#{ev.id}</Text>
                <Text style={styles.eventHeaderText} numberOfLines={2}>
                  {ev.name}
                </Text>
              </View>
            ))}

            <View style={[styles.cell, styles.totalHeaderCell]}>
              <Text style={styles.totalHeaderText}>TOTAL</Text>
            </View>
            <View style={[styles.cell, styles.rankHeaderCell]}>
              <Text style={styles.totalHeaderText}>RANK</Text>
            </View>
          </View>

          {/* Table Rows for each House */}
          {sortedStandings.map((house, idx) => (
            <View
              key={house.id}
              style={[
                styles.tableRow,
                idx % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd,
              ]}
            >
              {/* Fixed House Name Cell */}
              <View style={[styles.cell, styles.houseNameCell]}>
                <View style={[styles.houseDot, { backgroundColor: house.hex }]} />
                <Text style={styles.houseNameText} numberOfLines={1}>
                  {house.name}
                </Text>
              </View>

              {/* Event Point Cells */}
              {events.map((ev) => {
                const pts = getEventPoints(ev.id, house.id)
                return (
                  <View key={ev.id} style={[styles.cell, styles.scoreCell]}>
                    <Text
                      style={[
                        styles.scoreText,
                        pts === 5 && styles.scoreGold,
                        pts === 3 && styles.scoreSilver,
                        pts === 1 && styles.scoreBronze,
                        pts === 0 && styles.scoreZero,
                      ]}
                    >
                      {pts > 0 ? pts : '-'}
                    </Text>
                  </View>
                )
              })}

              {/* Total Points */}
              <View style={[styles.cell, styles.totalCell]}>
                <Text style={styles.totalPointsText}>{house.total_points}</Text>
              </View>

              {/* Rank */}
              <View style={[styles.cell, styles.rankCell]}>
                <Text style={styles.rankCellText}>#{idx + 1}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Legend Footer */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Scoring Key:</Text>
        <View style={styles.legendItem}>
          <Text style={styles.legendIcon}>🥇</Text>
          <Text style={styles.legendText}>1st: 5 pts</Text>
        </View>
        <View style={styles.legendItem}>
          <Text style={styles.legendIcon}>🥈</Text>
          <Text style={styles.legendText}>2nd: 3 pts</Text>
        </View>
        <View style={styles.legendItem}>
          <Text style={styles.legendIcon}>🥉</Text>
          <Text style={styles.legendText}>3rd: 1 pt</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  backText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#64748b',
  },
  scrollHint: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    paddingVertical: 6,
    backgroundColor: '#f1f5f9',
  },
  horizontalScroll: {
    flex: 1,
  },
  tableContainer: {
    padding: 12,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 4,
  },
  cell: {
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  houseHeaderCell: {
    width: 90,
    alignItems: 'flex-start',
    paddingLeft: 10,
  },
  headerCellText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.6,
  },
  eventHeaderCell: {
    width: 72,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.1)',
  },
  eventHeaderNum: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94a3b8',
  },
  eventHeaderText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  totalHeaderCell: {
    width: 60,
    backgroundColor: '#1e293b',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.2)',
  },
  rankHeaderCell: {
    width: 50,
    backgroundColor: '#1e293b',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.2)',
  },
  totalHeaderText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#eab308',
  },
  tableRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: '#ffffff',
  },
  tableRowEven: {
    backgroundColor: '#ffffff',
  },
  tableRowOdd: {
    backgroundColor: '#f8fafc',
  },
  houseNameCell: {
    width: 90,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 8,
  },
  houseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  houseNameText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
  },
  scoreCell: {
    width: 72,
    borderLeftWidth: 1,
    borderLeftColor: '#f1f5f9',
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  scoreGold: {
    color: '#b45309',
    fontWeight: '900',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  scoreSilver: {
    color: '#475569',
    fontWeight: '900',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  scoreBronze: {
    color: '#c2410c',
    fontWeight: '900',
    backgroundColor: '#ffedd5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  scoreZero: {
    color: '#cbd5e1',
  },
  totalCell: {
    width: 60,
    backgroundColor: '#f1f5f9',
    borderLeftWidth: 1,
    borderLeftColor: '#e2e8f0',
  },
  totalPointsText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0f172a',
  },
  rankCell: {
    width: 50,
    backgroundColor: '#f1f5f9',
    borderLeftWidth: 1,
    borderLeftColor: '#e2e8f0',
  },
  rankCellText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#2563eb',
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  legendTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendIcon: {
    fontSize: 11,
  },
  legendText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#334155',
  },
})
