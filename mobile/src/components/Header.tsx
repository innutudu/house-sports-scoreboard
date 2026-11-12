import React from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { AppMode } from '../types'
import { HOUSES } from '../constants/houses'

type Props = {
  currentMode: AppMode
  onOpenMenu: () => void
  onOpenModeModal: () => void
  onRefresh?: () => void
}

export default function Header({ currentMode, onOpenMenu, onOpenModeModal, onRefresh }: Props) {
  const getModeBadge = () => {
    switch (currentMode) {
      case 'admin':
        return {
          label: 'Admin',
          color: '#10b981',
          bg: '#ecfdf5',
          border: '#a7f3d0',
          icon: 'shield-checkmark',
        }
      case 'judge':
        return {
          label: 'Judges',
          color: '#3b82f6',
          bg: '#eff6ff',
          border: '#bfdbfe',
          icon: 'person-circle',
        }
      default:
        return {
          label: 'Spectator',
          color: '#64748b',
          bg: '#f1f5f9',
          border: '#cbd5e1',
          icon: 'eye',
        }
    }
  }

  const badge = getModeBadge()

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {/* Left: Distinctive Menu Button */}
        <Pressable
          onPress={onOpenMenu}
          style={({ pressed }) => [styles.menuButton, pressed && styles.buttonPressed]}
          hitSlop={8}
          accessibilityLabel="Open navigation menu drawer"
        >
          <Ionicons name="menu" size={20} color="#0f172a" />
          <Text style={styles.menuText}>Menu</Text>
          <View style={styles.pulseDot} />
        </Pressable>

        {/* Center: Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.superTitle}>INTER-HOUSE CHAMPIONSHIP</Text>
          <Text style={styles.mainTitle} numberOfLines={1}>
            Sports Scoreboard
          </Text>
        </View>

        {/* Right: Mode Switcher Badge */}
        <Pressable
          onPress={onOpenModeModal}
          style={({ pressed }) => [
            styles.modeBadge,
            { backgroundColor: badge.bg, borderColor: badge.border },
            pressed && styles.buttonPressed,
          ]}
          hitSlop={8}
        >
          <Ionicons name={badge.icon as any} size={14} color={badge.color} />
          <Text style={[styles.modeText, { color: badge.color }]}>{badge.label}</Text>
        </Pressable>
      </View>

      {/* 4-House Color Ribbon */}
      <View style={styles.houseRibbon}>
        {HOUSES.map((h) => (
          <View key={h.id} style={[styles.houseRibbonSegment, { backgroundColor: h.hex }]}>
            <Text style={styles.houseRibbonText}>{h.name}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  menuText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  superTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.8,
  },
  mainTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 5,
    gap: 4,
  },
  modeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },
  houseRibbon: {
    flexDirection: 'row',
    height: 18,
    width: '100%',
  },
  houseRibbonSegment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  houseRibbonText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ffffff',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
})
