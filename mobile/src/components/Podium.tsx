import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { HouseStanding } from '../types'

type Props = {
  standings: HouseStanding[]
}

export default function Podium({ standings }: Props) {
  if (!standings || standings.length < 3) return null

  const first = standings[0]
  const second = standings[1]
  const third = standings[2]
  const fourth = standings[3]

  const leadMargin = first.total_points - second.total_points

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="trophy" size={18} color="#eab308" />
          <Text style={styles.headerTitle}>CHAMPIONSHIP PODIUM</Text>
        </View>
        {leadMargin > 0 && (
          <View style={styles.leadBadge}>
            <Ionicons name="flame" size={12} color="#d97706" />
            <Text style={styles.leadText}>
              +{leadMargin} pts lead
            </Text>
          </View>
        )}
      </View>

      {/* 3 Pedestals */}
      <View style={styles.podiumRow}>
        {/* 2nd Place (Silver - Left) */}
        <View style={styles.pedestalCol}>
          <View style={styles.badgeWrapper}>
            <View style={[styles.avatarCircle, { backgroundColor: second.hex }]}>
              <Ionicons name="medal" size={20} color="#ffffff" />
            </View>
            <View style={[styles.rankBadge, { backgroundColor: '#94a3b8' }]}>
              <Text style={styles.rankBadgeText}>2</Text>
            </View>
          </View>
          <Text style={styles.houseName} numberOfLines={1}>
            {second.name}
          </Text>
          <Text style={styles.subtext}>
            {second.first_places || 0} 🥇 · {second.second_places || 0} 🥈
          </Text>

          {/* 2nd Step Pedestal */}
          <View style={[styles.stepBlock, styles.stepSecond]}>
            <Text style={styles.stepRankLabel}>2ND</Text>
            <Text style={styles.stepPoints}>{second.total_points}</Text>
            <Text style={styles.stepUnit}>PTS</Text>
            <View style={[styles.houseIndicator, { backgroundColor: second.hex }]} />
          </View>
        </View>

        {/* 1st Place (Gold - Center, Taller) */}
        <View style={styles.pedestalCol}>
          <View style={styles.crownRow}>
            <Ionicons name="sparkles" size={14} color="#eab308" />
          </View>
          <View style={styles.badgeWrapper}>
            <View style={[styles.avatarCircle, styles.avatarFirst, { backgroundColor: first.hex }]}>
              <Ionicons name="trophy" size={24} color="#ffffff" />
            </View>
            <View style={[styles.rankBadge, styles.rankBadgeFirst]}>
              <Text style={styles.rankBadgeFirstText}>1</Text>
            </View>
          </View>
          <Text style={[styles.houseName, styles.houseNameFirst]} numberOfLines={1}>
            {first.name}
          </Text>
          <Text style={styles.subtextFirst}>
            {first.first_places || 0} 🥇 Firsts
          </Text>

          {/* 1st Step Pedestal */}
          <View style={[styles.stepBlock, styles.stepFirst]}>
            <Text style={styles.stepRankLabelFirst}>🏆 1ST</Text>
            <Text style={styles.stepPointsFirst}>{first.total_points}</Text>
            <Text style={styles.stepUnitFirst}>TOTAL PTS</Text>
            <View style={[styles.houseIndicator, { backgroundColor: first.hex, height: 4 }]} />
          </View>
        </View>

        {/* 3rd Place (Bronze - Right) */}
        <View style={styles.pedestalCol}>
          <View style={styles.badgeWrapper}>
            <View style={[styles.avatarCircle, { backgroundColor: third.hex }]}>
              <Ionicons name="ribbon" size={20} color="#ffffff" />
            </View>
            <View style={[styles.rankBadge, { backgroundColor: '#d97706' }]}>
              <Text style={styles.rankBadgeText}>3</Text>
            </View>
          </View>
          <Text style={styles.houseName} numberOfLines={1}>
            {third.name}
          </Text>
          <Text style={styles.subtext}>
            {third.first_places || 0} 🥇 · {third.third_places || 0} 🥉
          </Text>

          {/* 3rd Step Pedestal */}
          <View style={[styles.stepBlock, styles.stepThird]}>
            <Text style={styles.stepRankLabel}>3RD</Text>
            <Text style={styles.stepPoints}>{third.total_points}</Text>
            <Text style={styles.stepUnit}>PTS</Text>
            <View style={[styles.houseIndicator, { backgroundColor: third.hex }]} />
          </View>
        </View>
      </View>

      {/* 4th Place Runner-up Strip */}
      {fourth && (
        <View style={styles.fourthStrip}>
          <View style={styles.fourthLeft}>
            <Text style={styles.fourthLabel}>4th Place:</Text>
            <View style={[styles.fourthDot, { backgroundColor: fourth.hex }]} />
            <Text style={styles.fourthName}>{fourth.name} House</Text>
            <Text style={styles.fourthEvents}>({fourth.events_scored} scored)</Text>
          </View>
          <Text style={styles.fourthPoints}>{fourth.total_points} pts</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: 0.8,
  },
  leadBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  leadText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#b45309',
  },
  podiumRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  pedestalCol: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  crownRow: {
    marginBottom: -4,
  },
  badgeWrapper: {
    position: 'relative',
    marginBottom: 4,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarFirst: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#eab308',
  },
  rankBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  rankBadgeFirst: {
    backgroundColor: '#eab308',
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  rankBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#ffffff',
  },
  rankBadgeFirstText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0f172a',
  },
  houseName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
  },
  houseNameFirst: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtext: {
    fontSize: 9,
    fontWeight: '500',
    color: '#64748b',
    marginBottom: 6,
  },
  subtextFirst: {
    fontSize: 10,
    fontWeight: '700',
    color: '#d97706',
    marginBottom: 6,
  },
  stepBlock: {
    width: '100%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepSecond: {
    height: 95,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderBottomWidth: 0,
  },
  stepFirst: {
    height: 125,
    backgroundColor: '#fef9c3',
    borderWidth: 1.5,
    borderColor: '#facc15',
    borderBottomWidth: 0,
  },
  stepThird: {
    height: 80,
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fed7aa',
    borderBottomWidth: 0,
  },
  stepRankLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
  },
  stepRankLabelFirst: {
    fontSize: 10,
    fontWeight: '900',
    color: '#854d0e',
  },
  stepPoints: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
    marginVertical: 2,
  },
  stepPointsFirst: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
    marginVertical: 2,
  },
  stepUnit: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  stepUnitFirst: {
    fontSize: 9,
    fontWeight: '800',
    color: '#a16207',
    letterSpacing: 0.5,
  },
  houseIndicator: {
    width: '80%',
    height: 3,
    borderRadius: 2,
    marginTop: 4,
  },
  fourthStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  fourthLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fourthLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  fourthDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  fourthName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1e293b',
  },
  fourthEvents: {
    fontSize: 10,
    color: '#94a3b8',
  },
  fourthPoints: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
  },
})
