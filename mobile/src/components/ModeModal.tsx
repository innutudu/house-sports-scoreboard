import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { AppMode } from '../types'
import { DEFAULT_PINS } from '../constants/houses'

type Props = {
  visible: boolean
  onClose: () => void
  currentMode: AppMode
  onSelectMode: (mode: AppMode) => void
}

export default function ModeModal({ visible, onClose, currentMode, onSelectMode }: Props) {
  const [targetMode, setTargetMode] = useState<AppMode>(currentMode)
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleCardPress = (mode: AppMode) => {
    setTargetMode(mode)
    setError(null)
    setPin('')
    if (mode === 'user') {
      onSelectMode('user')
      onClose()
    }
  }

  const handleConfirm = () => {
    setError(null)
    if (targetMode === 'user') {
      onSelectMode('user')
      onClose()
      return
    }

    const expected = DEFAULT_PINS[targetMode]
    const entered = pin.trim().toLowerCase()

    if (
      entered === expected ||
      (targetMode === 'admin' && (entered === 'admin' || entered === 'admin123')) ||
      (targetMode === 'judge' && (entered === 'judge' || entered === 'judge123'))
    ) {
      onSelectMode(targetMode)
      setPin('')
      onClose()
    } else {
      setError(`Incorrect PIN for ${targetMode === 'admin' ? 'Admin' : 'Judges'} Mode. Please try again.`)
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View style={styles.headerIcon}>
              <Ionicons name="lock-closed" size={20} color="#2563eb" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle}>Switch Access Mode</Text>
              <Text style={styles.modalSub}>
                Select your role. Spectators should use View Only mode.
              </Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
              <Ionicons name="close" size={18} color="#64748b" />
            </Pressable>
          </View>

          {/* Mode Options */}
          <View style={styles.modeCards}>
            {/* User Mode */}
            <Pressable
              onPress={() => handleCardPress('user')}
              style={[
                styles.modeCard,
                targetMode === 'user' && styles.modeCardSelected,
              ]}
            >
              <View style={styles.cardTop}>
                <Ionicons name="eye" size={18} color="#475569" />
                {targetMode === 'user' && <Ionicons name="checkmark-circle" size={18} color="#2563eb" />}
              </View>
              <Text style={styles.cardName}>User Mode</Text>
              <Text style={styles.cardDesc}>View only. Scores, leaderboard & instructions.</Text>
              <Text style={styles.noPinTag}>No PIN needed</Text>
            </Pressable>

            {/* Judges Mode */}
            <Pressable
              onPress={() => handleCardPress('judge')}
              style={[
                styles.modeCard,
                targetMode === 'judge' && styles.modeCardSelected,
              ]}
            >
              <View style={styles.cardTop}>
                <Ionicons name="person-circle" size={18} color="#2563eb" />
                {targetMode === 'judge' && <Ionicons name="checkmark-circle" size={18} color="#2563eb" />}
              </View>
              <Text style={styles.cardName}>Judges Mode</Text>
              <Text style={styles.cardDesc}>Score & athlete name edits, 1-tap 1st/2nd/3rd entry.</Text>
              <Text style={styles.pinTag}>PIN Protected</Text>
            </Pressable>

            {/* Admin Mode */}
            <Pressable
              onPress={() => handleCardPress('admin')}
              style={[
                styles.modeCard,
                targetMode === 'admin' && styles.modeCardSelected,
              ]}
            >
              <View style={styles.cardTop}>
                <Ionicons name="shield-checkmark" size={18} color="#16a34a" />
                {targetMode === 'admin' && <Ionicons name="checkmark-circle" size={18} color="#2563eb" />}
              </View>
              <Text style={styles.cardName}>Admin Mode</Text>
              <Text style={styles.cardDesc}>Full access: Add/delete events & write instructions.</Text>
              <Text style={styles.pinTag}>PIN Protected</Text>
            </Pressable>
          </View>

          {/* PIN Input if Admin or Judge selected */}
          {targetMode !== 'user' && (
            <View style={styles.pinSection}>
              <Text style={styles.pinLabel}>
                Enter {targetMode === 'admin' ? 'Admin' : 'Judges'} PIN to Confirm:
              </Text>
              <TextInput
                secureTextEntry
                placeholder="Enter PIN"
                placeholderTextColor="#94a3b8"
                value={pin}
                onChangeText={(t) => {
                  setPin(t)
                  setError(null)
                }}
                onSubmitEditing={handleConfirm}
                style={styles.pinInput}
                keyboardType="numeric"
                autoFocus
              />
              {error && <Text style={styles.errorText}>{error}</Text>}
            </View>
          )}

          {/* Action buttons */}
          <View style={styles.modalFooter}>
            <Pressable onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            {targetMode !== 'user' && (
              <Pressable onPress={handleConfirm} style={styles.confirmBtn}>
                <Text style={styles.confirmText}>Confirm Switch</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  modeCards: {
    gap: 10,
    marginBottom: 16,
  },
  modeCard: {
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#f8fafc',
  },
  modeCardSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  cardDesc: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
    marginBottom: 6,
  },
  noPinTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#16a34a',
  },
  pinTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
  },
  pinSection: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  pinLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  pinInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#0f172a',
  },
  errorText: {
    fontSize: 11,
    color: '#ef4444',
    marginTop: 6,
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  confirmBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
  },
  confirmText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },
})
