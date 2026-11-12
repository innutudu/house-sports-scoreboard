import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { AppMode, HouseStanding, NavTab } from '../types'
import { HOUSES } from '../constants/houses'
import { isSupabaseConfiguredSync } from '../services/supabase'

type Props = {
  visible: boolean
  onClose: () => void
  activeTab: NavTab
  onSelectTab: (tab: NavTab) => void
  currentMode: AppMode
  onOpenModeModal: () => void
  standings: HouseStanding[]
  onAddEvent?: () => void
  onOpenCloudSync?: () => void
}

const { width } = Dimensions.get('window')
const DRAWER_WIDTH = Math.min(width * 0.82, 340)

export default function LeftDrawer({
  visible,
  onClose,
  activeTab,
  onSelectTab,
  currentMode,
  onOpenModeModal,
  standings,
  onAddEvent,
  onOpenCloudSync,
}: Props) {
  const isCloudOnline = isSupabaseConfiguredSync()
  const menuItems: { id: NavTab; label: string; sub: string; icon: string; badge: string }[] = [
    {
      id: 'standings',
      label: 'Leaderboard',
      sub: 'House standings & point progress',
      icon: 'trophy',
      badge: 'Live',
    },
    {
      id: 'matrix',
      label: 'Score Matrix',
      sub: 'Official Houses vs Events grid',
      icon: 'grid',
      badge: '12 Events',
    },
    {
      id: 'events',
      label: 'Events & Placings',
      sub: 'Track, Field & Team competitions',
      icon: 'medal',
      badge: 'Schedule',
    },
    {
      id: 'judges',
      label: "Judges' Score Cards",
      sub: '1-Tap 1st/2nd/3rd scoring desk',
      icon: 'clipboard',
      badge: 'Scoring',
    },
    {
      id: 'instructions',
      label: 'Meet Instructions',
      sub: 'Rules, guidelines & admin notices',
      icon: 'document-text',
      badge: currentMode === 'admin' ? 'Editable' : 'Rules',
    },
  ]

  const sortedStandings = [...standings].sort((a, b) => b.total_points - a.total_points)
  const leader = sortedStandings[0]
  const second = sortedStandings[1]
  const leadMargin = leader && second ? leader.total_points - second.total_points : 0

  const handleSelect = (tab: NavTab) => {
    onSelectTab(tab)
    onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={[styles.drawer, { width: DRAWER_WIDTH }]}>
          {/* Drawer Header */}
          <View style={styles.drawerHeader}>
            <View style={styles.drawerHeaderLeft}>
              <View style={styles.trophyIconContainer}>
                <Ionicons name="trophy" size={22} color="#ffffff" />
              </View>
              <View>
                <Text style={styles.drawerSubtitle}>ST. XAVIER'S INTER COLLEGE</Text>
                <Text style={styles.drawerTitle}>Maharo · Sports Desk</Text>
              </View>
            </View>

            <Pressable onPress={onClose} style={styles.closeButton} hitSlop={8}>
              <Ionicons name="close" size={20} color="#64748b" />
            </Pressable>
          </View>

          {/* House Palette Strip */}
          <View style={styles.housesStrip}>
            <Text style={styles.stripLabel}>4 COMPETING HOUSES</Text>
            <View style={styles.housesGrid}>
              {HOUSES.map((h) => {
                const st = standings.find((s) => s.id === h.id)
                const pts = st?.total_points ?? 0
                return (
                  <View key={h.id} style={styles.houseChip}>
                    <View style={[styles.colorDot, { backgroundColor: h.hex }]} />
                    <Text style={styles.houseChipName} numberOfLines={1}>
                      {h.name}
                    </Text>
                    <Text style={styles.houseChipPoints}>{pts}p</Text>
                  </View>
                )
              })}
            </View>
          </View>

          <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
            {/* Dynamic Leader Spotlight Card */}
            {leader && (
              <View
                style={[
                  styles.leaderSpotlightCard,
                  { borderColor: `${leader.hex}70`, backgroundColor: `${leader.hex}18` },
                ]}
              >
                <View style={styles.leaderTopRow}>
                  <View style={styles.leaderCrownTag}>
                    <Ionicons name="sparkles" size={12} color="#eab308" />
                    <Text style={styles.leaderTagText}>CURRENT LEADER</Text>
                  </View>
                  {leadMargin > 0 && (
                    <Text style={styles.leadMarginText}>+{leadMargin} pts lead</Text>
                  )}
                </View>
                <View style={styles.leaderMainRow}>
                  <View style={[styles.leaderAvatar, { backgroundColor: leader.hex }]}>
                    <Ionicons name="trophy" size={16} color="#ffffff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.leaderName}>{leader.name} House</Text>
                    <Text style={styles.leaderStats}>
                      {leader.first_places || 0} 🥇 Firsts · {leader.events_scored} scored
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.leaderPointsNum}>{leader.total_points}</Text>
                    <Text style={styles.leaderPointsLabel}>PTS</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Menu Items */}
            <Text style={styles.sectionHeader}>MAIN NAVIGATION</Text>
            <View style={styles.menuList}>
              {menuItems.map((item) => {
                const isActive = activeTab === item.id
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => handleSelect(item.id)}
                    style={({ pressed }) => [
                      styles.menuItem,
                      isActive && styles.menuItemActive,
                      pressed && styles.itemPressed,
                    ]}
                  >
                    <View
                      style={[
                        styles.menuIconBox,
                        isActive ? styles.menuIconBoxActive : styles.menuIconBoxInactive,
                      ]}
                    >
                      <Ionicons
                        name={item.icon as any}
                        size={18}
                        color={isActive ? '#ffffff' : '#0f172a'}
                      />
                    </View>

                    <View style={styles.menuTextBox}>
                      <View style={styles.menuLabelRow}>
                        <Text
                          style={[
                            styles.menuLabel,
                            isActive && { color: '#0f172a', fontWeight: '800' },
                          ]}
                        >
                          {item.label}
                        </Text>
                        <View style={[styles.badgePill, isActive && styles.badgePillActive]}>
                          <Text
                            style={[
                              styles.badgeText,
                              isActive && { color: '#2563eb', fontWeight: '800' },
                            ]}
                          >
                            {item.badge}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.menuSub} numberOfLines={1}>
                        {item.sub}
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={14}
                      color={isActive ? '#2563eb' : '#cbd5e1'}
                    />
                  </Pressable>
                )
              })}
            </View>

            {/* Standings Snapshot */}
            {sortedStandings.length > 0 && (
              <View style={styles.snapshotCard}>
                <View style={styles.snapshotHeader}>
                  <Text style={styles.snapshotTitle}>STANDINGS SNAPSHOT</Text>
                  <Pressable onPress={() => handleSelect('standings')}>
                    <Text style={styles.viewAllLink}>View All →</Text>
                  </Pressable>
                </View>

                {sortedStandings.map((h, idx) => (
                  <View key={h.id} style={styles.snapshotRow}>
                    <View style={styles.snapshotRowLeft}>
                      <Text style={styles.rankNum}>#{idx + 1}</Text>
                      <View style={[styles.rowColorDot, { backgroundColor: h.hex }]} />
                      <Text style={styles.rowHouseName}>{h.name}</Text>
                    </View>
                    <Text style={styles.rowPoints}>{h.total_points} pts</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Multi-Device Cloud Sync Widget (Admin Mode Only) */}
            {currentMode === 'admin' && (
              <View style={styles.roleCard}>
                <View style={styles.roleCardHeader}>
                  <Text style={styles.roleCardTitle}>MULTI-DEVICE SYNC</Text>
                  <View
                    style={[
                      styles.activePill,
                      { backgroundColor: isCloudOnline ? '#DCFCE7' : '#FEF3C7' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.activePillText,
                        { color: isCloudOnline ? '#15803D' : '#B45309' },
                      ]}
                    >
                      {isCloudOnline ? 'Live Cloud' : 'Local Offline'}
                    </Text>
                  </View>
                </View>

                <View style={styles.roleRow}>
                  <View style={styles.roleInfo}>
                    <Text style={styles.roleName}>
                      {isCloudOnline ? 'Supabase Connected' : 'Local Storage Mode'}
                    </Text>
                    <Text style={styles.roleDesc}>
                      {isCloudOnline
                        ? 'Live real-time sync with all devices'
                        : 'Sync across devices requires Supabase'}
                    </Text>
                  </View>

                  {onOpenCloudSync && (
                    <Pressable
                      onPress={() => {
                        onClose()
                        onOpenCloudSync()
                      }}
                      style={styles.switchRoleButton}
                    >
                      <Ionicons name="cloud-outline" size={12} color="#0f172a" />
                      <Text style={styles.switchRoleText}>Setup</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            )}

            {/* Role Switcher Widget */}
            <View style={styles.roleCard}>
              <View style={styles.roleCardHeader}>
                <Text style={styles.roleCardTitle}>ACTIVE ROLE</Text>
                <View style={styles.activePill}>
                  <Text style={styles.activePillText}>Active</Text>
                </View>
              </View>

              <View style={styles.roleRow}>
                <View style={styles.roleInfo}>
                  <Text style={styles.roleName}>
                    {currentMode === 'admin'
                      ? 'Admin Mode'
                      : currentMode === 'judge'
                      ? 'Judges Mode'
                      : 'Spectator Mode'}
                  </Text>
                  <Text style={styles.roleDesc}>
                    {currentMode === 'admin'
                      ? 'Full editing & config access'
                      : currentMode === 'judge'
                      ? 'Score & placing entry'
                      : 'View-only access'}
                  </Text>
                </View>

                <Pressable
                  onPress={() => {
                    onClose()
                    onOpenModeModal()
                  }}
                  style={styles.switchRoleButton}
                >
                  <Ionicons name="key" size={12} color="#0f172a" />
                  <Text style={styles.switchRoleText}>Switch</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>

          {/* Drawer Footer */}
          <View style={styles.drawerFooter}>
            {currentMode === 'admin' && onAddEvent && (
              <Pressable
                onPress={() => {
                  onClose()
                  onAddEvent()
                }}
                style={styles.addEventButton}
              >
                <Ionicons name="add" size={16} color="#ffffff" />
                <Text style={styles.addEventText}>Add New Event</Text>
              </Pressable>
            )}
            <Text style={styles.footerBrand}>Prepared by Innocent Tudu SJ</Text>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawer: {
    backgroundColor: '#ffffff',
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 16,
    flexDirection: 'column',
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 45,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  drawerHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  trophyIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerSubtitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.6,
  },
  drawerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  housesStrip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  stripLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  housesGrid: {
    flexDirection: 'row',
    gap: 6,
  },
  houseChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 4,
    gap: 4,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  houseChipName: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1e293b',
  },
  houseChipPoints: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748b',
    marginLeft: 1,
  },
  leaderSpotlightCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    marginBottom: 14,
  },
  leaderTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  leaderCrownTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  leaderTagText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#b45309',
    letterSpacing: 0.5,
  },
  leadMarginText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#b45309',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  leaderMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  leaderAvatar: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaderName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
  },
  leaderStats: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 1,
  },
  leaderPointsNum: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  leaderPointsLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  sectionHeader: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  menuList: {
    gap: 6,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    backgroundColor: '#ffffff',
    gap: 10,
  },
  menuItemActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  itemPressed: {
    opacity: 0.8,
  },
  menuIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconBoxActive: {
    backgroundColor: '#2563eb',
  },
  menuIconBoxInactive: {
    backgroundColor: '#f1f5f9',
  },
  menuTextBox: {
    flex: 1,
  },
  menuLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  badgePill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgePillActive: {
    backgroundColor: '#dbeafe',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748b',
  },
  menuSub: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 1,
  },
  snapshotCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    marginBottom: 16,
  },
  snapshotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  snapshotTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.8,
  },
  viewAllLink: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563eb',
  },
  snapshotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  snapshotRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rankNum: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    width: 18,
  },
  rowColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  rowHouseName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  rowPoints: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
  },
  roleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
  },
  roleCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  roleCardTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.8,
  },
  activePill: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  activePillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#166534',
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roleInfo: {
    flex: 1,
  },
  roleName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
  },
  roleDesc: {
    fontSize: 10,
    color: '#64748b',
  },
  switchRoleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  switchRoleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f172a',
  },
  drawerFooter: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#ffffff',
    gap: 8,
  },
  addEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0f172a',
    borderRadius: 10,
    paddingVertical: 10,
  },
  addEventText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },
  footerBrand: {
    fontSize: 9,
    color: '#94a3b8',
    textAlign: 'center',
  },
})
